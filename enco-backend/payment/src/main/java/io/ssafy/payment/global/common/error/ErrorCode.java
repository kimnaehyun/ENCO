package io.ssafy.payment.global.common.error;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {
    BAD_REQUEST(HttpStatus.BAD_REQUEST, "잘못된 요청입니다.", "BAD_REQUEST"),
    SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버에 오류가 발생했습니다.", "SERVER_ERROR"),
    NOT_FOUND_CARD(HttpStatus.NOT_FOUND, "카드가 존재하지 않거나 삭제되었습니다.", "NOT_FOUND_CARD"),
    CHARGE_TARGET_NOT_FOUND(HttpStatus.NOT_FOUND, "청구 대상이 존재하지 않거나 해당 모임의 청구가 아닙니다.", "CHARGE_TARGET_NOT_FOUND"),
    AI_SERVICE_ERROR(HttpStatus.BAD_GATEWAY, "AI 서비스 호출에 실패했습니다.", "AI_SERVICE_ERROR"),
    AI_PARSE_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "AI 응답 파싱에 실패했습니다.", "AI_PARSE_FAILED"),
    FILE_UPLOAD_FAIL(HttpStatus.INTERNAL_SERVER_ERROR, "파일 업로드에 실패했습니다.", "FILE_UPLOAD_FAIL"),
    DUPLICATE_PAYMENT(HttpStatus.CONFLICT, "이미 처리된 결제 요청입니다.", "DUPLICATE_PAYMENT"),
    NOT_FOUND_ACCOUNT(HttpStatus.NOT_FOUND, "계좌 정보가 없습니다.", "NOT_FOUND_ACCOUNT");

    private final HttpStatus httpStatusCode;
    private final String errorMessage;
    private final String errorName;
}


