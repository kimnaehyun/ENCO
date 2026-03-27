package io.ssafy.chat.infra.client;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UserDetailDto {
    private Long userId;
    private String name;
    private Integer profileImage;
}
