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
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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

        BarcodeResponseDto existingBarcode = (BarcodeResponseDto) redisTemplate.opsForValue().get(barcodeKey);
        if (existingBarcode != null) {
            Integer total = userServiceClient.getGroupMemberCount(groupId).result();
            int totalCount = (total != null) ? total : 0;
            return new LocationResponseDto(totalCount, totalCount, existingBarcode);
        }

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

        if (nearbyMembersCount >= targetMemberCount && targetMemberCount > 0) {
            BarcodeResponseDto newBarcode = generateAndSaveBarcode(groupId, geoKey, barcodeKey);
            return new LocationResponseDto(nearbyMembersCount, targetMemberCount, newBarcode);
        }

        return new LocationResponseDto(nearbyMembersCount, targetMemberCount, null);
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
        String tokenUuid = UUID.randomUUID().toString().replace("-", "");

        String barcodeNumber = barcodeUuid.substring(0, 16).toUpperCase();
        String qrData = "ncopay://pay?token=" + tokenUuid;
        String expiredAt = Instant.now().plusSeconds(180).toString(); // UTC 기준

        return new BarcodeResponseDto(barcodeNumber, qrData, expiredAt);
    }

    public void startPayment(Long groupId, Long userId) {
        String initKey = INIT_KEY_PREFIX + groupId;

        Boolean isFirst = stringRedisTemplate.opsForValue()
                .setIfAbsent(initKey, "1", Duration.ofMinutes(5));

        if (Boolean.TRUE.equals(isFirst)) {
            log.info("[현장결제] 결제 시작 및 알림 발송. groupId={}", groupId);
            kafkaProducerService.sendOnsitePaymentRequest(groupId, userId, "방장");
        } else {
            log.warn("[현장결제] 이미 진행 중인 결제입니다. groupId={}", groupId);
            throw new CustomException(ErrorCode.PAYMENT_ALREADY_IN_PROGRESS);
        }
    }

    public void cleanupOnsitePaymentData(Long groupId) {
        String geoKey = GEO_KEY_PREFIX + groupId;
        String barcodeKey = BARCODE_KEY_PREFIX + groupId;
        String initKey = INIT_KEY_PREFIX + groupId;

        stringRedisTemplate.delete(geoKey);
        redisTemplate.delete(barcodeKey);
        stringRedisTemplate.delete(initKey);

        log.info("[현장결제] 결제 완료로 인한 데이터 싹쓸이 정리 완료. groupId={}", groupId);
    }
}