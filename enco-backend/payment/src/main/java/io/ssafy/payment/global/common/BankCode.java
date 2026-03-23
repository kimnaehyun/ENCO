package io.ssafy.payment.global.common;

import java.util.Arrays;

public enum BankCode {
    KOREA_DEVELOPMENT("산업은행", "002"),
    IBK("기업은행", "003"),
    KB("국민은행", "004"),
    SUHYUP("수협은행", "007"),
    NH("농협은행", "011"),
    WOORI("우리은행", "020"),
    SC("SC제일은행", "023"),
    CITI("씨티은행", "027"),
    DAEGU("대구은행", "031"),
    BUSAN("부산은행", "032"),
    GWANGJU("광주은행", "034"),
    JEJU("제주은행", "035"),
    JEONBUK("전북은행", "037"),
    GYEONGNAM("경남은행", "039"),
    SAEMAUL("새마을금고", "045"),
    SHINHYUP("신협", "048"),
    POST("우체국", "071"),
    SHINHAN("신한은행", "088"),
    KEBHANA("하나은행", "081"),
    KAKAO("카카오뱅크", "090"),
    KBANK("케이뱅크", "089"),
    TOSS("토스뱅크", "092"),
    ENCO("엔코은행", "999");

    private final String bankName;
    private final String code;

    BankCode(String bankName, String code) {
        this.bankName = bankName;
        this.code = code;
    }

    public String getCode() {
        return code;
    }

    public String getBankName() {
        return bankName;
    }

    public static String codeOf(String bankName) {
        if (bankName == null) return null;
        return Arrays.stream(values())
                .filter(b -> b.bankName.equals(bankName))
                .map(b -> b.code)
                .findFirst()
                .orElse(null);
    }
}
