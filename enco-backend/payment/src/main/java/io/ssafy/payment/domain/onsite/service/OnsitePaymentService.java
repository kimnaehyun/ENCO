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
    private static final String INIT_KEY_PREFIX = "onsite:init:";  // ← 이거 추가

    public LocationResponseDto updateLocationAndCheckBarcode(
            Long groupId, Long userId, double lat, double lon, boolean isLeader) {

        String geoKey = GEO_KEY_PREFIX + groupId;
        String barcodeKey = BARCODE_KEY_PREFIX + groupId;

        BarcodeResponseDto existingBarcode =
                (BarcodeResponseDto) redisTemplate.opsForValue().get(barcodeKey);
        if (existingBarcode != null) {
            Integer total = userServiceClient.getGroupMemberCount(groupId).result();
            return new LocationResponseDto(total, total, existingBarcode);
        }

        String memberKey = isLeader ? "LEADER" : String.valueOf(userId);
        stringRedisTemplate.opsForGeo().add(geoKey, new Point(lon, lat), memberKey);

        stringRedisTemplate.expire(geoKey, Duration.ofMinutes(5));

        if (!isLeader) {
            return new LocationResponseDto(0, 0, null);
        }

        Integer totalMembersResult = userServiceClient.getGroupMemberCount(groupId).result();
        int targetMemberCount = (totalMembersResult != null) ? totalMembersResult : 0;

        if (targetMemberCount == 0) {
            throw new CustomException(ErrorCode.NOT_FOUND_GROUP_INFO);
        }

        GeoResults<RedisGeoCommands.GeoLocation<String>> results = stringRedisTemplate.opsForGeo()
                .radius(geoKey, "LEADER", new Distance(5, RedisGeoCommands.DistanceUnit.METERS));

        int nearbyMembersCount = (results != null) ? results.getContent().size() : 0;
        log.info("[현장결제] groupId={}, 반경 15m 이내: {}/{}명", groupId, nearbyMembersCount, targetMemberCount);

        if (nearbyMembersCount >= targetMemberCount) {
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
            stringRedisTemplate.delete(geoKey);
            return (BarcodeResponseDto) redisTemplate.opsForValue().get(barcodeKey);
        }

        redisTemplate.opsForValue().set(authKey, groupId, Duration.ofMinutes(3));
        stringRedisTemplate.delete(geoKey);
        return newBarcode;
    }

    private BarcodeResponseDto generateBarcode() {
        String barcodeUuid = UUID.randomUUID().toString().replace("-", "");
        String tokenUuid = UUID.randomUUID().toString().replace("-", ""); // 보안 취약점 수정 - 별도 UUID

        String barcodeNumber = barcodeUuid.substring(0, 16).toUpperCase();
        String qrData = "ncopay://pay?token=" + tokenUuid;
        String expiredAt = Instant.now().plusSeconds(180).toString(); // UTC 기준

        return new BarcodeResponseDto(barcodeNumber, qrData, expiredAt);
    }

    //    public void startPayment(Long groupId, Long userId) {
//        String initKey = INIT_KEY_PREFIX + groupId;
//
//        Boolean isFirst = stringRedisTemplate.opsForValue()
//                .setIfAbsent(initKey, "1", Duration.ofMinutes(5));
//
//        if (Boolean.TRUE.equals(isFirst)) {
//            log.info("[현장결제] 결제 시작. groupId={}", groupId);
//            kafkaProducerService.sendOnsitePaymentRequest(groupId, userId, "방장");
//        } else {
//            log.warn("[현장결제] 이미 진행 중인 결제입니다. groupId={}", groupId);
//            throw new CustomException(ErrorCode.PAYMENT_ALREADY_IN_PROGRESS);
//        }
//    }
    public void startPayment(Long groupId, Long userId) {
        String initKey = INIT_KEY_PREFIX + groupId;

        // 테스트를 위해 setIfAbsent 대신 그냥 set을 써서 무조건 덮어씁니다! (항상 갱신)
        stringRedisTemplate.opsForValue().set(initKey, "1", Duration.ofMinutes(5));

        // if문 조건 없이 무조건 카프카를 쏘게 만듭니다!
        log.info("[현장결제 테스트] 무조건 결제 시작 및 알림 전송! groupId={}", groupId);
        kafkaProducerService.sendOnsitePaymentRequest(groupId, userId, "방장");
    }
}