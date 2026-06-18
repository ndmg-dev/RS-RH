package com.mgca.socialnetwork.like;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * Represents a like on a post. The compound index on (postId, userId)
 * enforces that each user can only like a post once.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "likes")
@CompoundIndexes({
        @CompoundIndex(name = "idx_post_user_unique", def = "{'postId': 1, 'userId': 1}", unique = true)
})
public class Like {

    @Id
    private String id;

    @Indexed
    private String postId;

    @Indexed
    private String userId;

    @CreatedDate
    private Instant createdAt;
}
