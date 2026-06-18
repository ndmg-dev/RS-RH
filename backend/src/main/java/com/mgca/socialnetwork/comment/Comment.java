package com.mgca.socialnetwork.comment;

import com.mgca.socialnetwork.common.ModerationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * Represents a comment on a post in the MGCA corporate social network.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "comments")
@CompoundIndexes({
        @CompoundIndex(name = "idx_post_comments", def = "{'postId': 1, 'createdAt': -1, 'deleted': 1}")
})
public class Comment {

    @Id
    private String id;

    @Indexed
    private String postId;

    @Indexed
    private String authorId;

    private String content;

    @Builder.Default
    private boolean deleted = false;

    @Builder.Default
    private ModerationStatus moderationStatus = ModerationStatus.APPROVED;

    private String moderatedBy;

    private String moderationNote;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
