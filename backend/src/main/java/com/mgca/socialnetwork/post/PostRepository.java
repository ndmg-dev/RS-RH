package com.mgca.socialnetwork.post;

import com.mgca.socialnetwork.common.ModerationStatus;
import com.mgca.socialnetwork.common.Visibility;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

/**
 * Spring Data MongoDB repository for {@link Post} documents.
 */
@Repository
public interface PostRepository extends MongoRepository<Post, String> {

    Page<Post> findByDeletedFalseAndVisibilityAndModerationStatus(
            Visibility visibility, ModerationStatus status, Pageable pageable);

    Page<Post> findByAuthorIdAndDeletedFalse(String authorId, Pageable pageable);

    Page<Post> findByDeletedFalse(Pageable pageable);
}
