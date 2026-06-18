package com.mgca.socialnetwork.like.dto;

import com.mgca.socialnetwork.like.Like;
import com.mgca.socialnetwork.user.User;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class LikeResponse {

    private String id;
    private String postId;
    private String userId;
    private String userName;
    private Instant createdAt;

    /**
     * Maps a Like entity + the liker's User record into a response.
     */
    public static LikeResponse from(Like like, User user) {
        return LikeResponse.builder()
                .id(like.getId())
                .postId(like.getPostId())
                .userId(like.getUserId())
                .userName(user != null ? user.getFullName() : null)
                .createdAt(like.getCreatedAt())
                .build();
    }
}
