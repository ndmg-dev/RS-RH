package com.mgca.socialnetwork.like;

import com.mgca.socialnetwork.common.dto.PageResponse;
import com.mgca.socialnetwork.common.exception.DuplicateResourceException;
import com.mgca.socialnetwork.common.exception.ResourceNotFoundException;
import com.mgca.socialnetwork.like.dto.LikeResponse;
import com.mgca.socialnetwork.post.Post;
import com.mgca.socialnetwork.post.PostRepository;
import com.mgca.socialnetwork.user.User;
import com.mgca.socialnetwork.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LikeService {

    private final LikeRepository likeRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final MongoTemplate mongoTemplate;

    public LikeResponse likePost(String postId, String userId) {
        // Verify the target post exists and is not deleted
        postRepository.findById(postId)
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));

        if (likeRepository.existsByPostIdAndUserId(postId, userId)) {
            throw new DuplicateResourceException("You have already liked this post");
        }

        Like like = Like.builder()
                .postId(postId)
                .userId(userId)
                .createdAt(Instant.now())
                .build();

        like = likeRepository.save(like);

        // Atomically increment likeCount
        incrementLikeCount(postId, 1);

        User user = userRepository.findById(userId).orElse(null);
        return LikeResponse.from(like, user);
    }

    public void unlikePost(String postId, String userId) {
        Like like = likeRepository.findByPostIdAndUserId(postId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Like", "postId/userId",
                        postId + "/" + userId));

        likeRepository.delete(like);

        // Atomically decrement likeCount
        incrementLikeCount(postId, -1);
    }

    public PageResponse<LikeResponse> getLikesByPost(String postId, Pageable pageable) {
        Page<Like> likePage = likeRepository.findByPostId(postId, pageable);

        // Batch-fetch all liking users
        var userIds = likePage.getContent().stream()
                .map(Like::getUserId)
                .distinct()
                .toList();

        Map<String, User> userMap = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));

        Page<LikeResponse> responsePage = likePage.map(like -> {
            User user = userMap.get(like.getUserId());
            return LikeResponse.from(like, user);
        });

        return PageResponse.from(responsePage);
    }

    public boolean hasUserLikedPost(String postId, String userId) {
        return likeRepository.existsByPostIdAndUserId(postId, userId);
    }

    // ── Internal helpers ────────────────────────────────────────────────────────

    private void incrementLikeCount(String postId, int delta) {
        mongoTemplate.updateFirst(
                Query.query(Criteria.where("id").is(postId)),
                new Update().inc("likeCount", delta),
                Post.class);
    }
}
