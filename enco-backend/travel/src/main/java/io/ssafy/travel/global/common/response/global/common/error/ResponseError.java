package io.ssafy.travel.global.common.response.global.common.error;

import lombok.Builder;

@Builder
public record ResponseError (
    String message,
    String errorType
){
    public static ResponseError of(ErrorCode e) {
        return ResponseError.builder()
                .message(e.getErrorMessage())
                .errorType(e.getErrorName())
                .build();
    }
}
