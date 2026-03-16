package io.ssafy.chat.global.common.error;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler
    public ResponseEntity<ResponseError> handleCustomException(CustomException e) {
        ErrorCode error = e.getErrorCode();

        if (error.getHttpStatusCode().is5xxServerError()) {
            log.error("[SERVER_ERROR] CustomException occurred: {}", error.getErrorMessage(), e);
        } else {
            log.warn("[CLIENT_ERROR] CustomException occurred: {}", error.getErrorMessage(), e);
        }
        return ResponseEntity.status(error.getHttpStatusCode())
                .body(ResponseError.of(error));
    }
}
