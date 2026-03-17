package io.ssafy.auth.global.common.error;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {
    BAD_REQUEST(HttpStatus.BAD_REQUEST, "잘못된 요청입니다.", "BAD_REQUEST"),
    SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버에 오류가 발생했습니다.", "SERVER_ERROR"),
    GROUP_NOT_FOUND(HttpStatus.NOT_FOUND, "그룹을 찾을 수 없습니다.", "GROUP_NOT_FOUND"),
    GROUP_MEMBER_NOT_FOUND(HttpStatus.NOT_FOUND, "모임원을 찾을 수 없습니다.", "GROUP_MEMBER_NOT_FOUND"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "권한이 없습니다.", "FORBIDDEN");

    private final HttpStatus httpStatusCode;
    private final String errorMessage;
    private final String errorName;
}


