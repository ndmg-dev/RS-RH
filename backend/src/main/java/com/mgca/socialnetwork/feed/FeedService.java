package com.mgca.socialnetwork.feed;

import com.mgca.socialnetwork.common.ModerationStatus;
import com.mgca.socialnetwork.common.Visibility;
import com.mgca.socialnetwork.common.dto.PageResponse;
import com.mgca.socialnetwork.like.LikeRepository;
import com.mgca.socialnetwork.post.Post;
import com.mgca.socialnetwork.post.PostRepository;
import com.mgca.socialnetwork.post.dto.PostResponse;
import com.mgca.socialnetwork.user.User;
import com.mgca.socialnetwork.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * First-generation chronological feed.
 * <p>
 * The architecture intentionally isolates feed logic behind this service so that
 * a ranking / recommendation engine can replace the simple query later without
 * touching the controller layer.
 */
@Service
@RequiredArgsConstructor
public class FeedService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final LikeRepository likeRepository;

    /**
     * Returns a reverse-chronological feed of public, approved posts.
     *
     * @param currentUserId the authenticated user (used for likedByCurrentUser flag)
     * @param pageable      page/size/sort
     * @return paginated PostResponse
     */
    public PageResponse<PostResponse> getFeed(String currentUserId, Pageable pageable) {
        Page<Post> postPage = postRepository
                .findByDeletedFalseAndVisibilityAndModerationStatus(
                        Visibility.PUBLIC, ModerationStatus.APPROVED, pageable);

        // Batch-fetch all distinct authors for this page
        var authorIds = postPage.getContent().stream()
                .map(Post::getAuthorId)
                .distinct()
                .toList();

        Map<String, User> authorMap = userRepository.findAllById(authorIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));

        Page<PostResponse> responsePage = postPage.map(post -> {
            User author = authorMap.get(post.getAuthorId());
            boolean liked = currentUserId != null
                    && likeRepository.existsByPostIdAndUserId(post.getId(), currentUserId);
            return PostResponse.from(post, author, liked);
        });

        return PageResponse.from(responsePage);
    }
}
