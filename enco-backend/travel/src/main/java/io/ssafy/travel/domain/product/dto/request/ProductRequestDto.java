package io.ssafy.travel.domain.product.dto.request;

import java.math.BigDecimal;

public record ProductRequestDto(Long merchantId,
                                String productName,
                                BigDecimal price,
                                String location,
                                String description,
                                Integer quantity,
                                String imageUrl) {

}
