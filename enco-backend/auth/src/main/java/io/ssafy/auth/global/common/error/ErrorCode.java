package io.ssafy.auth.global.common.error;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {
    BAD_REQUEST(HttpStatus.BAD_REQUEST, "잘못된 요청입니다.", "BAD_REQUEST"),
    SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버에 오류가 발생했습니다.", "SERVER_ERROR"),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부 오류가 발생했습니다.", "INTERNAL_SERVER_ERROR"),
    EMAIL_ALREADY_EXISTS(HttpStatus.CONFLICT, "이메일이 중복되었습니다.", "EMAIL_ALREADY_EXISTS"),
    NOT_CORRECT_PINCODE(HttpStatus.BAD_REQUEST, "비밀번호가 일치하지 않습니다.", "NOT_CORRECT_PINCODE"),
    GROUP_NOT_FOUND(HttpStatus.NOT_FOUND, "그룹을 찾을 수 없습니다.", "GROUP_NOT_FOUND"),
    POLICY_NOT_FOUND(HttpStatus.NOT_FOUND, "활성화된 회비 정책이 없습니다.", "POLICY_NOT_FOUND"),
    GROUP_MEMBER_NOT_FOUND(HttpStatus.NOT_FOUND, "모임원을 찾을 수 없습니다.", "GROUP_MEMBER_NOT_FOUND"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "권한이 없습니다.", "FORBIDDEN"),
    INVITE_NOT_FOUND(HttpStatus.NOT_FOUND, "유효하지 않은 초대 링크입니다.", "INVITE_NOT_FOUND"),
    INVITE_EXPIRED(HttpStatus.GONE, "만료된 초대 링크입니다.", "INVITE_EXPIRED"),
    ALREADY_GROUP_MEMBER(HttpStatus.CONFLICT, "이미 모임에 참여 중입니다.", "ALREADY_GROUP_MEMBER"),
    NOT_FOUND_USER(HttpStatus.NOT_FOUND, "사용자가 존재하지 않습니다.", "NOT_FOUND_USER"),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다.", "USER_NOT_FOUND"),
    NOT_CORRECT_PASSWORD(HttpStatus.NOT_FOUND, "비밀번호가 일치하지 않습니다.", "NOT_CORRECT_PASSWORD"),
    NOT_FOUND_GROUP(HttpStatus.NOT_FOUND, "해당 모임을 찾을 수 없습니다.", "NOT_FOUND_GROUP"),
    NO_ACTIVE_EVENT(HttpStatus.NOT_FOUND, "현재 진행 중인 출석 이벤트가 없습니다.", "NO_ACTIVE_EVENT"),
    INVALID_ATTENDANCE_TIME(HttpStatus.BAD_REQUEST, "출석 가능한 기간 또는 시간이 아닙니다.", "INVALID_ATTENDANCE_TIME"),
    ALREADY_ATTENDED(HttpStatus.BAD_REQUEST, "오늘은 이미 출석을 완료했습니다.", "ALREADY_ATTENDED"),
    MIN_MEMBER_LIMIT_NOT_MET(HttpStatus.BAD_REQUEST, "최소 2명 이상인 모임만 참여 가능합니다.", "MIN_MEMBER_LIMIT_NOT_MET");

    private final HttpStatus httpStatusCode;
    private final String errorMessage;
    private final String errorName;
}


