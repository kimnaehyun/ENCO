package io.ssafy.payment.domain.onsite.service;

import io.ssafy.payment.domain.onsite.dto.response.BarcodeResponseDto;
import io.ssafy.payment.domain.onsite.dto.response.LocationResponseDto;
import io.ssafy.payment.infra.client.UserServiceClient;
import io.ssafy.payment.global.common.error.CustomException;
import io.ssafy.payment.global.common.error.ErrorCode;
import io.ssafy.payment.infra.messaging.producer.KafkaProducerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.geo.Distance;
import org.springframework.data.geo.GeoResults;
import org.springframework.data.redis.connection.RedisGeoCommands;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.geo.Point;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OnsitePaymentService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final UserServiceClient userServiceClient;
    private final StringRedisTemplate stringRedisTemplate;
    private final KafkaProducerService kafkaProducerService;

    private static final String GEO_KEY_PREFIX = "onsite:geo:";
    private static final String BARCODE_KEY_PREFIX = "onsite:barcode:";
    private static final String INIT_KEY_PREFIX = "onsite:init:";

    public LocationResponseDto updateLocationAndCheckBarcode(
            Long groupId, Long userId, double lat, double lon, boolean isLeader) {

        log.info("[현장결제:위치수신] ▶ groupId={}, userId={}, role={}, lat={}, lon={}",
                groupId, userId, isLeader ? "LEADER" : "MEMBER", lat, lon);

        // ── 입력값 검증 ──────────────────────────────────────────
        if (groupId == null || userId == null) {
            log.error("[현장결제:위치수신] ❌ 필수 파라미터 누락. groupId={}, userId={}", groupId, userId);
            throw new CustomException(ErrorCode.BAD_REQUEST);
        }

        String geoKey = GEO_KEY_PREFIX + groupId;
        String barcodeKey = BARCODE_KEY_PREFIX + groupId;
        String memberKey = isLeader ? "LEADER" : String.valueOf(userId);

        // ── Redis 위치 저장 ──────────────────────────────────────
        try {
            stringRedisTemplate.opsForGeo().add(geoKey, new Point(lon, lat), memberKey);
            stringRedisTemplate.expire(geoKey, Duration.ofMinutes(5));
            log.debug("[현장결제:위치저장] ✅ Redis Geo 저장 완료. key={}, member={}", geoKey, memberKey);
        } catch (Exception e) {
            log.error("[현장결제:위치저장] ❌ Redis Geo 저장 실패. groupId={}, userId={}, error={}",
                    groupId, userId, e.getMessage(), e);
//            throw new CustomException(ErrorCode.REDIS_OPERATION_FAILED);
        }

        // ── 총 모임원 수 조회 (MSA) ──────────────────────────────
        int targetMemberCount = 0;
        try {
            Integer totalMembersResult = userServiceClient.getGroupMemberCount(groupId).result();
            targetMemberCount = (totalMembersResult != null) ? totalMembersResult : 0;
            log.debug("[현장결제:인원조회] ✅ 총 모임원 수 조회 완료. groupId={}, count={}", groupId, targetMemberCount);
        } catch (Exception e) {
            log.error("[현장결제:인원조회] ❌ UserService 통신 실패. groupId={}, error={}", groupId, e.getMessage(), e);
//            throw new CustomException(ErrorCode.USER_SERVICE_UNAVAILABLE);
        }

        if (targetMemberCount == 0) {
            log.warn("[현장결제:인원조회] ⚠️ 모임원이 0명으로 조회됨. 그룹 정보 없음. groupId={}", groupId);
            throw new CustomException(ErrorCode.NOT_FOUND_GROUP_INFO);
        }

        // ── 방장 위치 존재 여부 확인 ─────────────────────────────
        Boolean leaderExists = stringRedisTemplate.opsForGeo()
                .position(geoKey, "LEADER")
                .stream()
                .anyMatch(p -> p != null);

        if (!leaderExists) {
            log.warn("[현장결제:방장확인] ⚠️ 방장 위치 미수신 상태. groupId={}, 요청자userId={}. " +
                    "방장이 아직 앱을 열지 않았거나 위치 전송 전입니다.", groupId, userId);
            // 방장 위치 없으면 거리 계산 불가 → 현재 인원 0으로 반환 (에러 아님)
            return new LocationResponseDto(0, targetMemberCount, null);
        }

        // ── 반경 15m 이내 인원 계산 ──────────────────────────────
        int nearbyMembersCount = 0;
        try {
            GeoResults<RedisGeoCommands.GeoLocation<String>> results = stringRedisTemplate.opsForGeo()
                    .radius(geoKey, "LEADER", new Distance(15, RedisGeoCommands.DistanceUnit.METERS));
            nearbyMembersCount = (results != null) ? results.getContent().size() : 0;

            // 실제로 어떤 멤버들이 근처에 있는지 상세 로그
            if (results != null) {
                results.getContent().forEach(r ->
                        log.debug("[현장결제:반경체크] 👤 근처 멤버 감지. groupId={}, member={}, distance={}m",
                                groupId, r.getContent().getName(),
                                r.getDistance() != null ? String.format("%.1f", r.getDistance().getValue()) : "?")
                );
            }
        } catch (Exception e) {
            log.error("[현장결제:반경체크] ❌ Redis Geo radius 연산 실패. groupId={}, error={}",
                    groupId, e.getMessage(), e);
//            throw new CustomException(ErrorCode.REDIS_OPERATION_FAILED);
        }

        log.info("[현장결제:반경체크] 📍 groupId={}, 반경 15m 이내: {}/{}명 ({}% 집결)",
                groupId, nearbyMembersCount, targetMemberCount,
                (int)((double) nearbyMembersCount / targetMemberCount * 100));

        // ── 모임원 접속 현황 경고 로그 ───────────────────────────
        int notArrivedCount = targetMemberCount - nearbyMembersCount;
        if (notArrivedCount > 0) {
            log.info("[현장결제:반경체크] ⏳ 아직 {}명이 15m 밖에 있거나 앱을 열지 않았습니다. groupId={}",
                    notArrivedCount, groupId);
        }

        // ── 기존 바코드 조회 ─────────────────────────────────────
        BarcodeResponseDto existingBarcode = null;
        try {
            existingBarcode = (BarcodeResponseDto) redisTemplate.opsForValue().get(barcodeKey);
            if (existingBarcode != null) {
                log.debug("[현장결제:바코드조회] 🔖 기존 바코드 존재. groupId={}, barcodeNumber={}",
                        groupId, existingBarcode.barcodeNumber());
            }
        } catch (Exception e) {
            log.error("[현장결제:바코드조회] ❌ Redis 바코드 조회 실패. groupId={}, error={}",
                    groupId, e.getMessage(), e);
            // 바코드 조회 실패는 치명적이지 않으므로 null로 진행
        }

        // ── 분기: 전원 집결 vs 이탈 ─────────────────────────────
        if (nearbyMembersCount >= targetMemberCount && targetMemberCount > 0) {
            log.info("[현장결제:집결완료] 🎉 전원 집결! groupId={}, {}명 모두 15m 이내 확인",
                    groupId, targetMemberCount);

            if (existingBarcode != null) {
                log.info("[현장결제:바코드] ♻️ 기존 바코드 재사용. groupId={}, barcodeNumber={}",
                        groupId, existingBarcode.barcodeNumber());
                return new LocationResponseDto(nearbyMembersCount, targetMemberCount, existingBarcode);
            } else {
                log.info("[현장결제:바코드] 🆕 신규 바코드 발급 시작. groupId={}", groupId);
                BarcodeResponseDto newBarcode = generateAndSaveBarcode(groupId, geoKey, barcodeKey);
                return new LocationResponseDto(nearbyMembersCount, targetMemberCount, newBarcode);
            }

        } else {
            // 누군가 이탈하거나 아직 덜 모인 경우
            if (existingBarcode != null) {
                log.warn("[현장결제:이탈감지] 🚨 바코드 발급 후 이탈자 발생! 바코드 강제 파기. " +
                                "groupId={}, 현재인원={}/{}명, barcodeNumber={}",
                        groupId, nearbyMembersCount, targetMemberCount, existingBarcode.barcodeNumber());
                try {
                    redisTemplate.delete(barcodeKey);
                    redisTemplate.delete("onsite:auth:" + existingBarcode.barcodeNumber());
                    log.info("[현장결제:이탈감지] ✅ 바코드 및 auth 키 삭제 완료. groupId={}", groupId);
                } catch (Exception e) {
                    log.error("[현장결제:이탈감지] ❌ 바코드 삭제 중 오류. groupId={}, error={}",
                            groupId, e.getMessage(), e);
                }
            } else {
                log.debug("[현장결제:대기중] ⏳ 아직 집결 중. groupId={}, {}/{}명",
                        groupId, nearbyMembersCount, targetMemberCount);
            }
            return new LocationResponseDto(nearbyMembersCount, targetMemberCount, null);
        }
    }

    private BarcodeResponseDto generateAndSaveBarcode(Long groupId, String geoKey, String barcodeKey) {
        BarcodeResponseDto newBarcode = generateBarcode();
        String authKey = "onsite:auth:" + newBarcode.barcodeNumber();

        Boolean isSet = false;
        try {
            isSet = redisTemplate.opsForValue()
                    .setIfAbsent(barcodeKey, newBarcode, Duration.ofMinutes(3));
        } catch (Exception e) {
            log.error("[현장결제:바코드저장] ❌ Redis setIfAbsent 실패. groupId={}, error={}",
                    groupId, e.getMessage(), e);
//            throw new CustomException(ErrorCode.REDIS_OPERATION_FAILED);
        }

        // 동시에 여러 요청이 들어온 경우 (따닥 방지)
        if (Boolean.FALSE.equals(isSet)) {
            log.warn("[현장결제:바코드저장] ⚠️ 동시 요청 감지 - 이미 생성된 바코드 반환. groupId={}", groupId);
            BarcodeResponseDto existing = (BarcodeResponseDto) redisTemplate.opsForValue().get(barcodeKey);
            if (existing == null) {
                log.error("[현장결제:바코드저장] ❌ setIfAbsent 실패 후 바코드 재조회도 실패. groupId={}", groupId);
//                throw new CustomException(ErrorCode.BARCODE_GENERATION_FAILED);
            }
            return existing;
        }

        try {
            redisTemplate.opsForValue().set(authKey, groupId, Duration.ofMinutes(3));
            log.info("[현장결제:바코드저장] ✅ 바코드 발급 완료. groupId={}, barcodeNumber={}, expiredAt={}",
                    groupId, newBarcode.barcodeNumber(), newBarcode.expiredAt());
        } catch (Exception e) {
            log.error("[현장결제:바코드저장] ❌ auth 키 저장 실패. groupId={}, barcodeNumber={}, error={}",
                    groupId, newBarcode.barcodeNumber(), e.getMessage(), e);
            // auth 키 저장 실패 시 바코드도 롤백
            redisTemplate.delete(barcodeKey);
//            throw new CustomException(ErrorCode.REDIS_OPERATION_FAILED);
        }

        return newBarcode;
    }

    private BarcodeResponseDto generateBarcode() {
        String barcodeUuid = UUID.randomUUID().toString().replace("-", "");
        String barcodeNumber = barcodeUuid.substring(0, 16).toUpperCase();
        String expiredAt = Instant.now().plusSeconds(180).toString();
        log.debug("[현장결제:바코드생성] 🎲 UUID 기반 바코드 생성. barcodeNumber={}", barcodeNumber);
        return new BarcodeResponseDto(barcodeNumber, barcodeNumber, expiredAt);
    }

    public void startPayment(Long groupId, Long userId) {
        log.info("[현장결제:시작요청] ▶ groupId={}, 요청자(방장)userId={}", groupId, userId);

        if (groupId == null || userId == null) {
            log.error("[현장결제:시작요청] ❌ 필수 파라미터 누락. groupId={}, userId={}", groupId, userId);
//            throw new CustomException(ErrorCode.INVALID_INPUT);
        }

        String initKey = INIT_KEY_PREFIX + groupId;

        Boolean isFirst = false;
        try {
            isFirst = stringRedisTemplate.opsForValue()
                    .setIfAbsent(initKey, "1", Duration.ofSeconds(10));
        } catch (Exception e) {
            log.error("[현장결제:시작요청] ❌ Redis 쿨타임 체크 실패. groupId={}, error={}",
                    groupId, e.getMessage(), e);
//            throw new CustomException(ErrorCode.REDIS_OPERATION_FAILED);
        }

        if (Boolean.TRUE.equals(isFirst)) {
            log.info("[현장결제:시작요청] ✅ 새 결제 세션 시작. 기존 데이터 초기화. groupId={}", groupId);
            cleanUpOldSessionData(groupId);

            try {
                kafkaProducerService.sendOnsitePaymentRequest(groupId, userId, "방장");
                log.info("[현장결제:시작요청] ✅ Kafka 알림 발송 완료. groupId={}, userId={}", groupId, userId);
            } catch (Exception e) {
                log.error("[현장결제:시작요청] ❌ Kafka 발송 실패. groupId={}, userId={}, error={}",
                        groupId, userId, e.getMessage(), e);
                // Kafka 실패는 결제 시작 자체를 막지 않음 (알림만 안 가는 것)
                log.warn("[현장결제:시작요청] ⚠️ 알림 없이 결제 진행됩니다. groupId={}", groupId);
            }
        } else {
            log.warn("[현장결제:시작요청] ⛔ 10초 쿨타임 내 재요청 차단. groupId={}, userId={}. " +
                    "방장이 결제 시작을 연속으로 눌렀습니다.", groupId, userId);
            throw new CustomException(ErrorCode.PAYMENT_ALREADY_IN_PROGRESS);
        }
    }

    private void cleanUpOldSessionData(Long groupId) {
        log.info("[현장결제:초기화] 🧹 세션 초기화 시작. groupId={}", groupId);

        String geoKey = GEO_KEY_PREFIX + groupId;
        String barcodeKey = BARCODE_KEY_PREFIX + groupId;

        try {
            Boolean geoDeleted = stringRedisTemplate.delete(geoKey);
            log.info("[현장결제:초기화] {} 위치 데이터 삭제. groupId={}",
                    Boolean.TRUE.equals(geoDeleted) ? "✅" : "ℹ️ (없었음)", groupId);
        } catch (Exception e) {
            log.error("[현장결제:초기화] ❌ 위치 데이터 삭제 실패. groupId={}, error={}", groupId, e.getMessage(), e);
        }

        try {
            BarcodeResponseDto existingBarcode = (BarcodeResponseDto) redisTemplate.opsForValue().get(barcodeKey);
            if (existingBarcode != null) {
                redisTemplate.delete("onsite:auth:" + existingBarcode.barcodeNumber());
                redisTemplate.delete(barcodeKey);
                log.info("[현장결제:초기화] ✅ 기존 바코드 삭제 완료. groupId={}, barcodeNumber={}",
                        groupId, existingBarcode.barcodeNumber());
            } else {
                log.info("[현장결제:초기화] ℹ️ 삭제할 기존 바코드 없음. groupId={}", groupId);
            }
        } catch (Exception e) {
            log.error("[현장결제:초기화] ❌ 바코드 삭제 실패. groupId={}, error={}", groupId, e.getMessage(), e);
        }

        log.info("[현장결제:초기화] ✅ 세션 초기화 완료. groupId={}", groupId);
    }
}