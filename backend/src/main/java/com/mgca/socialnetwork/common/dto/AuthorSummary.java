package com.mgca.socialnetwork.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthorSummary {
    private String id;
    private String fullName;
    private String jobTitle;
    private String department;
    private String avatarUrl;
}
