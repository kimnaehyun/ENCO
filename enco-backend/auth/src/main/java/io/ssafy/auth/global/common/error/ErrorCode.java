package io.ssafy.auth.global.common.error;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {
    BAD_REQUEST(HttpStatus.BAD_REQUEST, "잘못된 요청입니다.", "BAD_REQUEST"),
    SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버에 오류가 발생했습니다.", "SERVER_ERROR");

    private final HttpStatus httpStatusCode;
    private final String errorMessage;
    private final String errorType;
}


