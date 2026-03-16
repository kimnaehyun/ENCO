package io.ssafy.auth.global.common.error;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler
    public ResponseEntity<ResponseError> handleCustomException(CustomException e) {
        ErrorCode error = e.getErrorCode();

        return ResponseEntity.status(error.getHttpStatusCode())
                .body(ResponseError.of(error));
    }
}
