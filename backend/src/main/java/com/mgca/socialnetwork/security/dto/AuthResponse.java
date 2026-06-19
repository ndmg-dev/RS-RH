package com.mgca.socialnetwork.security.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {

    private String token;
    private AuthUserDto user;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AuthUserDto {
        private String id;
        private String fullName;
        private String email;
        private String role;
        private String jobTitle;
        private String department;
        private String avatarUrl;
        private String theme;
    }
}
