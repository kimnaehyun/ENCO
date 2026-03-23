package io.ssafy.travel.global.common.response.global.common.error;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {
    NOT_FOUND_PRODUCT(HttpStatus.NOT_FOUND, "상품을 찾을 수 없습니다.", "NOT_FOUND_PRODUCT"),
    NOT_FOUND_MERCHANT(HttpStatus.NOT_FOUND, "가맹점을 찾을 수 없습니다.", "NOT_FOUND_MERCHANT");

    private final HttpStatus httpStatusCode;
    private final String errorMessage;
    private final String errorName;
}


