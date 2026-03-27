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

        String geoKey = GEO_KEY_PREFIX + groupId;
        String barcodeKey = BARCODE_KEY_PREFIX + groupId;

        String memberKey = isLeader ? "LEADER" : String.valueOf(userId);
        stringRedisTemplate.opsForGeo().add(geoKey, new Point(lon, lat), memberKey);
        stringRedisTemplate.expire(geoKey, Duration.ofMinutes(5));

        Integer totalMembersResult = userServiceClient.getGroupMemberCount(groupId).result();
        int targetMemberCount = (totalMembersResult != null) ? totalMembersResult : 0;

        if (targetMemberCount == 0) {
            throw new CustomException(ErrorCode.NOT_FOUND_GROUP_INFO);
        }

        int nearbyMembersCount = 0;
        try {
            GeoResults<RedisGeoCommands.GeoLocation<String>> results = stringRedisTemplate.opsForGeo()
                    .radius(geoKey, "LEADER", new Distance(15, RedisGeoCommands.DistanceUnit.METERS));
            nearbyMembersCount = (results != null) ? results.getContent().size() : 0;
        } catch (Exception e) {
            log.warn("[현장결제] 아직 방장 위치가 접수되지 않았습니다. groupId={}", groupId);
        }

        log.info("[현장결제] groupId={}, 반경 15m 이내: {}/{}명", groupId, nearbyMembersCount, targetMemberCount);

        BarcodeResponseDto existingBarcode = (BarcodeResponseDto) redisTemplate.opsForValue().get(barcodeKey);

        if (nearbyMembersCount >= targetMemberCount && targetMemberCount > 0) {
            if (existingBarcode != null) {
                // 이미 생성된 바코드가 있다면 그대로 유지
                return new LocationResponseDto(nearbyMembersCount, targetMemberCount, existingBarcode);
            } else {
                // 없으면 새로 만들어서 내려줌 (3분짜리로 만들지만, 멀어지면 아래 else문에서 강제 삭제됨)
                BarcodeResponseDto newBarcode = generateAndSaveBarcode(groupId, geoKey, barcodeKey);
                return new LocationResponseDto(nearbyMembersCount, targetMemberCount, newBarcode);
            }
        } else {
            // [단 한 명이라도 15m 밖으로 나갔을 때]
            if (existingBarcode != null) {
                log.info("[현장결제] 누군가 이탈하여 기존 바코드를 강제 파기합니다! groupId={}", groupId);
                redisTemplate.delete(barcodeKey);
                redisTemplate.delete("onsite:auth:" + existingBarcode.barcodeNumber());
            }
            return new LocationResponseDto(nearbyMembersCount, targetMemberCount, null);
        }
    }

    private BarcodeResponseDto generateAndSaveBarcode(Long groupId, String geoKey, String barcodeKey) {
        BarcodeResponseDto newBarcode = generateBarcode();
        String authKey = "onsite:auth:" + newBarcode.barcodeNumber();

        Boolean isSet = redisTemplate.opsForValue()
                .setIfAbsent(barcodeKey, newBarcode, Duration.ofMinutes(3));

        if (Boolean.FALSE.equals(isSet)) {
            log.info("[현장결제] 이미 생성된 바코드가 있습니다. groupId={}", groupId);
            return (BarcodeResponseDto) redisTemplate.opsForValue().get(barcodeKey);
        }

        redisTemplate.opsForValue().set(authKey, groupId, Duration.ofMinutes(3));

        log.info("[현장결제] 새 바코드 생성됨. groupId={}, barcodeNumber={}", groupId, newBarcode.barcodeNumber());

        return newBarcode;
    }

    private BarcodeResponseDto generateBarcode() {
        String barcodeUuid = UUID.randomUUID().toString().replace("-", "");
        String barcodeNumber = barcodeUuid.substring(0, 16).toUpperCase();

        String qrData = barcodeNumber;

        String expiredAt = Instant.now().plusSeconds(180).toString();

        return new BarcodeResponseDto(barcodeNumber, qrData, expiredAt);
    }

    public void startPayment(Long groupId, Long userId) {
        String initKey = INIT_KEY_PREFIX + groupId;

        // 1. 따닥(더블클릭) 방지용 10초 쿨타임 자물쇠
        Boolean isFirst = stringRedisTemplate.opsForValue()
                .setIfAbsent(initKey, "1", Duration.ofSeconds(10));

        if (Boolean.TRUE.equals(isFirst)) {
            // 2. 하은님 기획대로! 결제 시작 버튼 = "기존 데이터 싹 다 리셋하고 새로 모여!"
            // 위치 도화지, 바코드, 마스터키를 전부 깨끗하게 지웁니다.
            cleanUpOldSessionData(groupId);

            // 3. 알림 발송
            log.info("[현장결제] 결제 (재)시작. 데이터 초기화 및 알림 발송 완료. groupId={}", groupId);
            kafkaProducerService.sendOnsitePaymentRequest(groupId, userId, "방장");
        } else {
            // 10초 안에 또 누르면 너무 빠르다고 튕겨냄
            log.warn("[현장결제] 잠시 후 다시 시도해주세요. (10초 쿨타임) groupId={}", groupId);
            throw new CustomException(ErrorCode.PAYMENT_ALREADY_IN_PROGRESS);
        }
    }

    // 🧹 새 결제 시작을 위한 완벽한 초기화 메서드 (하은님이 원하신 바로 그 구조!)
    private void cleanUpOldSessionData(Long groupId) {
        String geoKey = GEO_KEY_PREFIX + groupId;
        String barcodeKey = BARCODE_KEY_PREFIX + groupId;

        // 1. 기존 위치 도화지 찢어버리기 (새로 받아야 하니까!)
        stringRedisTemplate.delete(geoKey);

        // 2. 기존 바코드가 있다면 바코드와 auth 키 둘 다 파기
        BarcodeResponseDto existingBarcode = (BarcodeResponseDto) redisTemplate.opsForValue().get(barcodeKey);
        if (existingBarcode != null) {
            redisTemplate.delete("onsite:auth:" + existingBarcode.barcodeNumber());
            redisTemplate.delete(barcodeKey);
        }
        log.info("[현장결제] 새 세션 시작을 위해 기존 위치/바코드 데이터 정리 완료. groupId={}", groupId);
    }
}