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
    TRANSACTION_ACCESS_DENIED(HttpStatus.FORBIDDEN, "해당 거래 내역에 접근 권한이 없습니다.", "TRANSACTION_ACCESS_DENIED"),
    INSUFFICIENT_BALANCE(HttpStatus.NOT_FOUND, "결제 잔액이 부족합니다.", "INSUFFICIENT_BALANCE"),
    INVALID_PAYMENT_AMOUNT(HttpStatus.BAD_REQUEST, "0원 이하로 결제할 수 없습니다.", "INVALID_PAYMENT_AMOUNT"),
    INVALID_PASSWORD(HttpStatus.NOT_FOUND, "계좌 비밀번호가 일치하지 않습니다.", "INVALID_PASSWORD"),
    NOT_FOUND_VOTE(HttpStatus.NOT_FOUND, "투표가 존재하지 않습니다.", "NOT_FOUND_VOTE"),
    VOTE_ALREADY_CLOSED(HttpStatus.BAD_REQUEST, "이미 종료된 투표입니다.", "VOTE_ALREADY_CLOSED"),
    VOTE_EXPIRED(HttpStatus.BAD_REQUEST, "만료된 투표입니다.", "VOTE_EXPIRED"),
    ALREADY_VOTED(HttpStatus.BAD_REQUEST, "이미 투표에 참여했습니다.", "ALREADY_VOTED"),
    NOT_FOUND_TRANSACTION(HttpStatus.NOT_FOUND, "거래내역을 찾을 수 없습니다.", "NOT_FOUND_TRANSACTION"),
    DUPLICATE_PAYMENT(HttpStatus.CONFLICT, "이미 처리된 결제 요청입니다.", "DUPLICATE_PAYMENT"),
    VOTE_ALREADY_APPROVED(HttpStatus.BAD_REQUEST, "이미 승인 완료되어 결제가 진행된 투표입니다.", "VOTE_ALREADY_APPROVED"),
    VOTE_ALREADY_REJECTED(HttpStatus.BAD_REQUEST, "이미 부결되어 취소된 투표입니다.", "VOTE_ALREADY_REJECTED"),
    DUPLICATE_PAYMENTVOTE(HttpStatus.CONFLICT, "동일한 멱등키가 존재합니다.", "DUPLICATE_PAYMENTVOTE"),
    OCR_INVALID_FILE(HttpStatus.BAD_REQUEST, "OCR 처리 가능한 영수증 파일이 아닙니다.", "OCR_INVALID_FILE"),
    OCR_PROVIDER_TIMEOUT(HttpStatus.GATEWAY_TIMEOUT, "OCR 제공자 응답이 지연되고 있습니다.", "OCR_PROVIDER_TIMEOUT"),
    OCR_PROVIDER_ERROR(HttpStatus.BAD_GATEWAY, "OCR 제공자 호출에 실패했습니다.", "OCR_PROVIDER_ERROR"),
    OCR_PARSE_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "OCR 응답 파싱에 실패했습니다.", "OCR_PARSE_FAILED"),
    OCR_LOW_CONFIDENCE(HttpStatus.UNPROCESSABLE_ENTITY, "OCR 결과의 신뢰도가 낮아 사용자 검수가 필요합니다.", "OCR_LOW_CONFIDENCE"),
    MISSING_IDEMPOTENCY_KEY(HttpStatus.BAD_REQUEST, "멱등성 키(Idempotency-Key)가 누락되었습니다.", "MISSING_IDEMPOTENCY_KEY"),
    FORBIDDEN_GROUP_ACCESS(HttpStatus.FORBIDDEN, "해당 모임에 대한 접근 권한이 없습니다.", "FORBIDDEN_GROUP_ACCESS"),
    UNAUTHORIZED_CARD_ACCESS(HttpStatus.FORBIDDEN, "해당 모임 계좌에 연결된 카드가 아닙니다.", "UNAUTHORIZED_CARD_ACCESS"),
    EXTERNAL_SERVER_ERROR(HttpStatus.BAD_GATEWAY, "외부 서버(Auth) 통신에 실패했습니다.", "EXTERNAL_SERVER_ERROR"),
    INVALID_GROUP_MEMBERS(HttpStatus.BAD_REQUEST, "유효한 모임원이 없어 투표를 진행할 수 없습니다.", "INVALID_GROUP_MEMBERS"),
    AUTH_SERVER_ERROR(HttpStatus.BAD_REQUEST, " Auth 서버 통신 오류로 모임원 수를 가져오지 못했습니다.", "AUTH_SERVER_ERROR"),
    NOT_FOUND_GROUP_INFO(HttpStatus.NOT_FOUND, "주변에 그룹원이 존재하지 않습니다." ,"NOT_FOUND_GROUP_INFO"),
    INVALID_OR_EXPIRED_BARCODE(HttpStatus.NOT_FOUND, "유효하지 않거나 만료된 바코드입니다.", "INVALID_OR_EXPIRED_BARCODE"),
    PAYMENT_ALREADY_IN_PROGRESS(HttpStatus.CONTINUE, "이미 진행 중인 결제입니다.", "PAYMENT_ALREADY_IN_PROGRESS");

    private final HttpStatus httpStatusCode;
    private final String errorMessage;
    private final String errorName;
}


