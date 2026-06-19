package com.mgca.socialnetwork.comment.dto;

import com.mgca.socialnetwork.common.dto.AuthorSummary;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponse {

    private String id;
    private String postId;
    private AuthorSummary author;
    private String content;
    private String status;
    private Instant createdAt;
    private Instant updatedAt;
}
