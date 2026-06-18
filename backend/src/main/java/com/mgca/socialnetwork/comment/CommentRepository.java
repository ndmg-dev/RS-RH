package com.mgca.socialnetwork.comment;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

/**
 * Spring Data MongoDB repository for {@link Comment} documents.
 */
@Repository
public interface CommentRepository extends MongoRepository<Comment, String> {

    Page<Comment> findByPostIdAndDeletedFalse(String postId, Pageable pageable);

    long countByPostIdAndDeletedFalse(String postId);
}
