package com.mgca.socialnetwork.post.dto;

import com.mgca.socialnetwork.common.dto.AuthorSummary;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostResponse {

    private String id;
    private AuthorSummary author;
    private String content;
    private List<String> mediaUrls;
    private String visibility;
    private int likeCount;
    private int commentCount;
    private boolean likedByMe;
    private String status;
    private Instant createdAt;
    private Instant updatedAt;

    public static PostResponse from(com.mgca.socialnetwork.post.Post post, com.mgca.socialnetwork.user.User author, boolean likedByMe) {
        String status = "ACTIVE";
        if (post.isDeleted()) {
            status = "DELETED";
        } else if (post.getModerationStatus() == com.mgca.socialnetwork.common.ModerationStatus.REMOVED) {
            status = "HIDDEN";
        }

        String visibility = "COMPANY";
        if (post.getVisibility() == com.mgca.socialnetwork.common.Visibility.DRAFT) {
            visibility = "PRIVATE";
        } else if (post.getVisibility() == com.mgca.socialnetwork.common.Visibility.DEPARTMENT) {
            visibility = "DEPARTMENT";
        }

        AuthorSummary authorSummary = null;
        if (author != null) {
            authorSummary = AuthorSummary.builder()
                    .id(author.getId())
                    .fullName(author.getFullName())
                    .jobTitle(author.getJobTitle())
                    .department(author.getDepartment())
                    .avatarUrl(author.getAvatarUrl())
                    .build();
        }

        return PostResponse.builder()
                .id(post.getId())
                .author(authorSummary)
                .content(post.getContent())
                .mediaUrls(post.getMediaUrls())
                .visibility(visibility)
                .likeCount(post.getLikeCount())
                .commentCount(post.getCommentCount())
                .likedByMe(likedByMe)
                .status(status)
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }
}
