package io.ssafy.chat.global.common.error;

import lombok.Builder;

@Builder
public record ResponseError (
    int httpCode,
    String message,
    String errorType
){
    public static ResponseError of(ErrorCode e) {
        return ResponseError.builder()
                .httpCode(e.getHttpStatusCode().value())
                .message(e.getErrorMessage())
                .errorType(e.getErrorName())
                .build();
    }
}
