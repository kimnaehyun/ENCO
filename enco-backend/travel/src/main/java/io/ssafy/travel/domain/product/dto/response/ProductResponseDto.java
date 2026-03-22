package io.ssafy.travel.domain.product.dto.response;

import io.ssafy.travel.domain.product.entity.TravelProduct;

import java.math.BigDecimal;

public record ProductResponseDto(Long id, String name, String merchantName, String location, BigDecimal price, Integer quantity, String description, String imageUrl) {
    public static ProductResponseDto from(TravelProduct product) {
        return new ProductResponseDto(
                product.getId(),
                product.getName(),
                product.getMerchant().getName(),
                product.getLocation(),
                product.getPrice(),
                product.getQuantity(),
                product.getDescription(),
                product.getImageUrl()
        );
    }
}
