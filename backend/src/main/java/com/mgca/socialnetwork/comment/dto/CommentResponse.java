package com.mgca.socialnetwork.comment.dto;

import com.mgca.socialnetwork.comment.Comment;
import com.mgca.socialnetwork.common.ModerationStatus;
import com.mgca.socialnetwork.user.User;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class CommentResponse {

    private String id;
    private String postId;
    private String authorId;
    private String authorName;
    private String authorAvatarUrl;
    private String content;
    private ModerationStatus moderationStatus;
    private Instant createdAt;
    private Instant updatedAt;

    /**
     * Maps a Comment entity + its author into a client-facing response.
     */
    public static CommentResponse from(Comment comment, User author) {
        return CommentResponse.builder()
                .id(comment.getId())
                .postId(comment.getPostId())
                .authorId(comment.getAuthorId())
                .authorName(author != null ? author.getFullName() : null)
                .authorAvatarUrl(author != null ? author.getAvatarUrl() : null)
                .content(comment.getContent())
                .moderationStatus(comment.getModerationStatus())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }
}
