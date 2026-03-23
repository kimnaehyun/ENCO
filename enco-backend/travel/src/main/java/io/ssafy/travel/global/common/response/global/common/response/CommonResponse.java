package io.ssafy.travel.global.common.response.global.common.response;

public record CommonResponse<T>(
        String message,
        T result
) {
    private static final String SUCCESS_MESSAGE = "요청에 성공했습니다.";

    public static <T> CommonResponse<T> success(T result) {
        return new CommonResponse<>(SUCCESS_MESSAGE, result);
    }

    public static CommonResponse<Void> success() {
        return new CommonResponse<>(SUCCESS_MESSAGE, null);
    }
}

