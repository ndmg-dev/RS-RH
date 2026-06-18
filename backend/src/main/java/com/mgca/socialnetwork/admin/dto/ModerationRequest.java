package com.mgca.socialnetwork.admin.dto;

import com.mgca.socialnetwork.common.ModerationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ModerationRequest {

    @NotNull(message = "Moderation status is required")
    private ModerationStatus status;

    private String note;
}
