package com.mgca.socialnetwork.user.dto;

import com.mgca.socialnetwork.user.User;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class UserResponse {

    private String id;
    private String email;
    private String fullName;
    private String role;
    private String jobTitle;
    private String department;
    private String bio;
    private String avatarUrl;
    private String bannerUrl;
    private List<String> skills;
    private String location;
    private String customSections;
    private String theme;
    private Instant createdAt;

    /**
     * Maps a User entity to a UserResponse, deliberately excluding passwordHash.
     */
    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .jobTitle(user.getJobTitle())
                .department(user.getDepartment())
                .bio(user.getBio())
                .avatarUrl(user.getAvatarUrl())
                .bannerUrl(user.getBannerUrl())
                .skills(user.getSkills())
                .location(user.getLocation())
                .customSections(user.getCustomSections())
                .theme(user.getTheme())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
