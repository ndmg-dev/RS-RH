package com.mgca.socialnetwork.comment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateCommentRequest {

    @NotBlank(message = "Comment content is required")
    @Size(max = 2000, message = "Comment must not exceed 2000 characters")
    private String content;
}
