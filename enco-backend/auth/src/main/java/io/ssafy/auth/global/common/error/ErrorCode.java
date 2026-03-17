package io.ssafy.auth.global.common.error;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {
    BAD_REQUEST(HttpStatus.BAD_REQUEST, "잘못된 요청입니다.", "BAD_REQUEST"),
    SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버에 오류가 발생했습니다.", "SERVER_ERROR"),
    EMAIL_ALREADY_EXISTS(HttpStatus.CONFLICT, "이메일이 중복되었습니다.", "EMAIL_ALREADY_EXISTS"),
    NOT_CORRECT_PINCODE(HttpStatus.BAD_REQUEST, "비밀번호가 일치하지 않습니다.", "NOT_CORRECT_PINCODE");

    private final HttpStatus httpStatusCode;
    private final String errorMessage;
    private final String errorName;
}


