package com.mgca.socialnetwork.post.dto;

import com.mgca.socialnetwork.common.ModerationStatus;
import com.mgca.socialnetwork.common.Visibility;
import com.mgca.socialnetwork.post.Post;
import com.mgca.socialnetwork.user.User;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class PostResponse {

    private String id;
    private String authorId;
    private String authorName;
    private String authorAvatarUrl;
    private String content;
    private List<String> mediaUrls;
    private Visibility visibility;
    private int likeCount;
    private int commentCount;
    private boolean likedByCurrentUser;
    private ModerationStatus moderationStatus;
    private Instant createdAt;
    private Instant updatedAt;

    /**
     * Maps a Post entity + its author + a like-flag into a client-facing response.
     */
    public static PostResponse from(Post post, User author, boolean likedByCurrentUser) {
        return PostResponse.builder()
                .id(post.getId())
                .authorId(post.getAuthorId())
                .authorName(author != null ? author.getFullName() : null)
                .authorAvatarUrl(author != null ? author.getAvatarUrl() : null)
                .content(post.getContent())
                .mediaUrls(post.getMediaUrls())
                .visibility(post.getVisibility())
                .likeCount(post.getLikeCount())
                .commentCount(post.getCommentCount())
                .likedByCurrentUser(likedByCurrentUser)
                .moderationStatus(post.getModerationStatus())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }
}
