package com.mgca.socialnetwork.user.dto;

import lombok.Data;

import java.util.List;

@Data
public class UpdateProfileRequest {

    private String fullName;
    private String jobTitle;
    private String department;
    private String bio;
    private String avatarUrl;
    private String bannerUrl;
    private List<String> skills;
    private String location;
    private String customSections;
    private String theme;
}
