package io.ssafy.payment.domain.onsite.service;


import io.ssafy.payment.domain.onsite.dto.response.BarcodeResponseDto;
import io.ssafy.payment.infra.client.UserServiceClient;
import io.ssafy.payment.global.common.error.CustomException;
import io.ssafy.payment.global.common.error.ErrorCode;
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

    private static final String GEO_KEY_PREFIX = "onsite:geo:";
    private static final String BARCODE_KEY_PREFIX = "onsite:barcode:";

    public BarcodeResponseDto updateLocationAndCheckBarcode(Long groupId, Long userId, double lat, double lon, boolean isLeader) {
        String geoKey = GEO_KEY_PREFIX + groupId;
        String barcodeKey = BARCODE_KEY_PREFIX + groupId;

        BarcodeResponseDto existingBarcode = (BarcodeResponseDto) redisTemplate.opsForValue().get(barcodeKey);
        if (existingBarcode != null) {
            return existingBarcode;
        }

        String memberKey = isLeader ? "LEADER" : String.valueOf(userId);
        stringRedisTemplate.opsForGeo().add(geoKey, new Point(lon, lat), memberKey);
        stringRedisTemplate.expire(geoKey, Duration.ofMinutes(5));

        if (!isLeader) {
            return null;
        }

        Integer totalMembersResult = userServiceClient.getGroupMemberCount(groupId).result();
        int targetMemberCount = (totalMembersResult != null) ? totalMembersResult : 0;

        if (targetMemberCount == 0) {
            throw new CustomException(ErrorCode.NOT_FOUND_GROUP_INFO);
        }

        GeoResults<RedisGeoCommands.GeoLocation<String>> results = stringRedisTemplate.opsForGeo()
                .radius(geoKey, "LEADER", new Distance(15, RedisGeoCommands.DistanceUnit.METERS));

        int nearbyMembersCount = (results != null) ? results.getContent().size() : 0;

        log.info("[현장결제] groupId={}, 방장 반경 15m 이내 인원: {}/{}명", groupId, nearbyMembersCount, targetMemberCount);

        if (nearbyMembersCount >= targetMemberCount) {
            BarcodeResponseDto newBarcode = generateBarcode();

            String authKey = "onsite:auth:" + newBarcode.barcodeNumber();
            redisTemplate.opsForValue().set(barcodeKey, newBarcode, Duration.ofMinutes(3));
            redisTemplate.opsForValue().set(authKey, groupId, Duration.ofMinutes(3));
            stringRedisTemplate.delete(geoKey);
            return newBarcode;
        }

        return null;
    }

    private BarcodeResponseDto generateBarcode() {
        String uuidString = UUID.randomUUID().toString().replace("-", "");

        String barcodeNumber = uuidString.substring(0, 16).toUpperCase();

        String qrData = "ncopay://pay?token=" + uuidString;
        String expiredAt = LocalDateTime.now().plusMinutes(3).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        return new BarcodeResponseDto(barcodeNumber, qrData, expiredAt);
    }
}