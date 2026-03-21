package io.ssafy.travel.domain.product.service;

import io.ssafy.travel.domain.product.dto.request.ProductRequestDto;
import io.ssafy.travel.domain.product.dto.response.ProductResponseDto;
import io.ssafy.travel.domain.product.entity.Merchant;
import io.ssafy.travel.domain.product.entity.TravelProduct;
import io.ssafy.travel.domain.product.respository.MerchantRepository;
import io.ssafy.travel.domain.product.respository.TravelProductRepository;
import io.ssafy.travel.global.common.response.global.common.error.CustomException;
import io.ssafy.travel.global.common.response.global.common.error.ErrorCode;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TravelProductService {
    private final TravelProductRepository productRepository;
    private final MerchantRepository merchantRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Transactional
    public ProductResponseDto createProduct(ProductRequestDto request, MultipartFile image) throws IOException {
        String imageUrl = saveImage(image);

        Merchant merchant = merchantRepository.findById(request.merchantId()).
                orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_MERCHANT));

        TravelProduct product = TravelProduct.builder()
                .name(request.productName())
                .price(request.price())
                .merchant(merchant)
                .location(request.location())
                .description(request.description())
                .quantity(request.quantity())
                .imageUrl(imageUrl)
                .build();

        TravelProduct savedProduct = productRepository.save(product);
        return ProductResponseDto.from(savedProduct);
    }

    public List<ProductResponseDto> getAllProducts() {
        return productRepository.findAllByIsDeletedFalse().stream()
                .map(ProductResponseDto::from).toList();
    }

    public ProductResponseDto getProduct(Long productId) {
        TravelProduct product = productRepository.findByIdAndIsDeletedFalse(productId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_PRODUCT));

        return ProductResponseDto.from(product);
    }

    private String saveImage(MultipartFile image) throws IOException {
        if (image == null || image.isEmpty()) {
            return null;
        }
        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();

        String originalFilename = image.getOriginalFilename();
        String storeFileName = UUID.randomUUID() + "_" + originalFilename;

        File targetFile = new File(dir, storeFileName);

        image.transferTo(targetFile);

        return "/images/" + originalFilename;
    }
}
