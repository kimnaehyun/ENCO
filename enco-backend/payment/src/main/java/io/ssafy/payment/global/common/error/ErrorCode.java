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
    NOT_FOUND_ACCOUNT(HttpStatus.NOT_FOUND, "계좌 정보가 없습니다.", "NOT_FOUND_ACCOUNT"),
    TRANSACTION_NOT_FOUND(HttpStatus.NOT_FOUND, "거래 내역이 존재하지 않습니다.", "TRANSACTION_NOT_FOUND"),
    INSUFFICIENT_BALANCE(HttpStatus.NOT_FOUND, "결제 잔액이 부족합니다.", "INSUFFICIENT_BALANCE"),
    INVALID_PASSWORD(HttpStatus.NOT_FOUND, "계좌 비밀번호가 일치하지 않습니다.", "INVALID_PASSWORD"),
    NOT_FOUND_VOTE(HttpStatus.NOT_FOUND, "투표가 존재하지 않습니다.", "NOT_FOUND_VOTE"),
    VOTE_ALREADY_CLOSED(HttpStatus.BAD_REQUEST, "이미 종료된 투표입니다.", "VOTE_ALREADY_CLOSED"),
    VOTE_EXPIRED(HttpStatus.BAD_REQUEST, "만료된 투표입니다.", "VOTE_EXPIRED"),
    ALREADY_VOTED(HttpStatus.BAD_REQUEST, "이미 투표에 참여했습니다.", "ALREADY_VOTED"),
    NOT_FOUND_TRANSACTION(HttpStatus.NOT_FOUND, "거래내역을 찾을 수 없습니다.", "NOT_FOUND_TRANSACTION"),
    DUPLICATE_PAYMENT(HttpStatus.CONFLICT, "이미 처리된 결제 요청입니다.", "DUPLICATE_PAYMENT");

    private final HttpStatus httpStatusCode;
    private final String errorMessage;
    private final String errorName;
}


