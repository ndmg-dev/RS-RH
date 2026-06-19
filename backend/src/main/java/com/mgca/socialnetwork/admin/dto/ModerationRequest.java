package com.mgca.socialnetwork.admin.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ModerationRequest {

    @NotNull(message = "Moderation status is required")
    private String status;

    private String note;
}
