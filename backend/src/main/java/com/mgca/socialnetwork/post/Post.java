package com.mgca.socialnetwork.post;

import com.mgca.socialnetwork.common.ModerationStatus;
import com.mgca.socialnetwork.common.Visibility;
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
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a post in the MGCA corporate social network feed.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "posts")
@CompoundIndexes({
        @CompoundIndex(name = "idx_feed", def = "{'createdAt': -1, 'deleted': 1, 'visibility': 1}"),
        @CompoundIndex(name = "idx_author_timeline", def = "{'authorId': 1, 'createdAt': -1}")
})
public class Post {

    @Id
    private String id;

    @Indexed
    private String authorId;

    private String content;

    @Builder.Default
    private List<String> mediaUrls = new ArrayList<>();

    @Builder.Default
    private Visibility visibility = Visibility.PUBLIC;

    @Builder.Default
    private int likeCount = 0;

    @Builder.Default
    private int commentCount = 0;

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
