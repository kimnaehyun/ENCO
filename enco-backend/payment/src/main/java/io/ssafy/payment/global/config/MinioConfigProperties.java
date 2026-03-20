package io.ssafy.payment.global.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "minio")
@Getter
@Setter
public class MinioConfigProperties {
    private String endpoint;
    private String accessKey;
    private String secretKey;
    private String bucket;
}
