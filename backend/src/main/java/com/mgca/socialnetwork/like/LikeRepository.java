package com.mgca.socialnetwork.like;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data MongoDB repository for {@link Like} documents.
 */
@Repository
public interface LikeRepository extends MongoRepository<Like, String> {

    Optional<Like> findByPostIdAndUserId(String postId, String userId);

    boolean existsByPostIdAndUserId(String postId, String userId);

    long countByPostId(String postId);

    Page<Like> findByPostId(String postId, Pageable pageable);

    void deleteByPostIdAndUserId(String postId, String userId);
}
