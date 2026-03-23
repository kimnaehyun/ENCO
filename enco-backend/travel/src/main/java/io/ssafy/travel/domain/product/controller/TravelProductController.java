package io.ssafy.travel.domain.product.controller;

import io.ssafy.travel.domain.product.dto.request.ProductRequestDto;
import io.ssafy.travel.domain.product.dto.response.ProductResponseDto;
import io.ssafy.travel.domain.product.service.TravelProductService;
import io.ssafy.travel.global.common.response.global.common.response.CommonResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class TravelProductController {

    private final TravelProductService productService;

    /**
     * 상품 등록
     * @param request
     * @param image
     * @return
     * @throws IOException
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CommonResponse<ProductResponseDto>> createProduct(@RequestPart("data") ProductRequestDto request, @RequestPart(value = "image", required = false) MultipartFile image) throws IOException {
        return ResponseEntity.ok(CommonResponse.success(productService.createProduct(request, image)));
    }

    /**
     * 상품 전체 목록 조회
     * @return
     */
    @GetMapping
    public ResponseEntity<CommonResponse<List<ProductResponseDto>>> getAllProducts() {
        return ResponseEntity.ok(CommonResponse.success(productService.getAllProducts()));
    }

    /**
     * 상품 단건 조회
     * @param productId
     * @return
     */
    @GetMapping("/{productId}")
    public ResponseEntity<CommonResponse<ProductResponseDto>> getProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(CommonResponse.success(productService.getProduct(productId)));
    }

}