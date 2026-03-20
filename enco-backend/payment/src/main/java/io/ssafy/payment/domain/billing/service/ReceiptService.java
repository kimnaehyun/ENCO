package io.ssafy.payment.domain.billing.service;

import io.minio.*;
import io.ssafy.payment.global.config.MinioConfigProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.InputStream;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReceiptService {

    private final MinioClient minioClient;
    private final MinioConfigProperties minioConfigProperties;

    @Value("${app.file-base-url}")
    private String fileBaseUrl;

    @PostConstruct
    public void initBuckets() {
        try {
            ensureBucketExists(minioConfigProperties.getBucket());
            log.info("MinIO buckets initialized successfully");
        } catch (Exception e) {
            log.error("Failed to initialize MinIO buckets", e);
        }
    }

    public String uploadFile(MultipartFile file, String bucket) throws Exception {
        String originalName = sanitizeFileName(file.getOriginalFilename());
        String fileName = bucket + "/" + UUID.randomUUID() + "_" + originalName;
        log.info("파일 이름: {}", originalName);
        log.info("파일 명: {}", fileName);
        uploadToMinio(fileName, file);
        return buildFileUrl(fileName);
    }

    private String sanitizeFileName(String originalName) {
        if (originalName == null) {
            return "file";
        }

        String extension = "";
        String nameWithoutExt = originalName;

        int dotIndex = originalName.lastIndexOf(".");
        if (dotIndex > 0) {
            extension = originalName.substring(dotIndex);
            nameWithoutExt = originalName.substring(0, dotIndex);
        }

        String safeName = nameWithoutExt
                .replaceAll("[^a-zA-Z0-9가-힣ㄱ-ㅎㅏ-ㅣ._-]", "_")
                .replaceAll("_{2,}", "_")
                .replaceAll("^_|_$", "");

        if (safeName.length() > 50) {
            safeName = safeName.substring(0, 50);
        }

        return safeName + extension;
    }

    private void uploadToMinio(String fileName, MultipartFile file) throws Exception {
        String bucketName = minioConfigProperties.getBucket();

        minioClient.putObject(
                PutObjectArgs.builder()
                        .bucket(bucketName)
                        .object(fileName)
                        .stream(file.getInputStream(), file.getSize(), -1)
                        .contentType(file.getContentType())
                        .build()
        );

        log.info("File uploaded: bucket={}, file={}", bucketName, fileName);
    }

    public InputStream downloadFile(String fileName) throws Exception {
        String bucketName = minioConfigProperties.getBucket();

        return minioClient.getObject(
                GetObjectArgs.builder()
                        .bucket(bucketName)
                        .object(fileName)
                        .build()
        );
    }

    public void deleteFile(String fileName) throws Exception {
        String bucketName = minioConfigProperties.getBucket();

        minioClient.removeObject(
                RemoveObjectArgs.builder()
                        .bucket(bucketName)
                        .object(fileName)
                        .build()
        );

        log.info("File deleted: bucket={}, file={}", bucketName, fileName);
    }

    public void deleteFileByUrl(String fileUrl) throws Exception {
        String fileName = fileUrl.replace(fileBaseUrl + "/api/v1/files/image/", "");
        deleteFile(fileName);
    }

    private String buildFileUrl(String fileName) {
        return fileBaseUrl + "/payment-service/api/v1/files/image/" + fileName;
    }

    private void ensureBucketExists(String bucketName) throws Exception {
        boolean exists = minioClient.bucketExists(
                BucketExistsArgs.builder()
                        .bucket(bucketName)
                        .build()
        );

        if (!exists) {
            minioClient.makeBucket(
                    MakeBucketArgs.builder()
                            .bucket(bucketName)
                            .build()
            );
            log.info("Bucket created: {}", bucketName);
        }
    }
}
