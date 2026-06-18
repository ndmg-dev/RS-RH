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

    @Builder.Default
    private String type = "Bearer";

    private String userId;
    private String email;
    private String fullName;
    private String role;
}
