package com.mgca.socialnetwork.post;

import com.mgca.socialnetwork.common.ModerationStatus;
import com.mgca.socialnetwork.common.Visibility;
import com.mgca.socialnetwork.common.dto.PageResponse;
import com.mgca.socialnetwork.common.dto.AuthorSummary;
import com.mgca.socialnetwork.common.exception.ForbiddenException;
import com.mgca.socialnetwork.common.exception.ResourceNotFoundException;
import com.mgca.socialnetwork.like.LikeRepository;
import com.mgca.socialnetwork.post.dto.CreatePostRequest;
import com.mgca.socialnetwork.post.dto.PostResponse;
import com.mgca.socialnetwork.post.dto.UpdatePostRequest;
import com.mgca.socialnetwork.user.User;
import com.mgca.socialnetwork.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final LikeRepository likeRepository;

    public PostResponse createPost(String userId, CreatePostRequest request) {
        Visibility vis = Visibility.PUBLIC;
        if ("PRIVATE".equalsIgnoreCase(request.getVisibility())) {
            vis = Visibility.DRAFT;
        } else if ("DEPARTMENT".equalsIgnoreCase(request.getVisibility())) {
            vis = Visibility.DEPARTMENT;
        }

        Post post = Post.builder()
                .authorId(userId)
                .content(request.getContent())
                .mediaUrls(request.getMediaUrls() != null ? request.getMediaUrls() : new ArrayList<>())
                .visibility(vis)
                .likeCount(0)
                .commentCount(0)
                .deleted(false)
                .moderationStatus(ModerationStatus.APPROVED)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        post = postRepository.save(post);

        User author = userRepository.findById(userId).orElse(null);
        return mapToPostResponse(post, author, false);
    }

    public PostResponse getPostById(String postId, String currentUserId) {
        Post post = postRepository.findById(postId)
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));

        User author = userRepository.findById(post.getAuthorId()).orElse(null);
        boolean liked = currentUserId != null
                && likeRepository.existsByPostIdAndUserId(postId, currentUserId);
        return mapToPostResponse(post, author, liked);
    }

    public PostResponse updatePost(String postId, String userId, UpdatePostRequest request) {
        Post post = postRepository.findById(postId)
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));

        if (!post.getAuthorId().equals(userId)) {
            throw new ForbiddenException("You can only edit your own posts");
        }

        if (request.getContent() != null) {
            post.setContent(request.getContent());
        }
        if (request.getMediaUrls() != null) {
            post.setMediaUrls(request.getMediaUrls());
        }
        if (request.getVisibility() != null) {
            Visibility vis = Visibility.PUBLIC;
            if ("PRIVATE".equalsIgnoreCase(request.getVisibility())) {
                vis = Visibility.DRAFT;
            } else if ("DEPARTMENT".equalsIgnoreCase(request.getVisibility())) {
                vis = Visibility.DEPARTMENT;
            }
            post.setVisibility(vis);
        }

        post.setUpdatedAt(Instant.now());
        post = postRepository.save(post);

        User author = userRepository.findById(userId).orElse(null);
        boolean liked = likeRepository.existsByPostIdAndUserId(postId, userId);
        return mapToPostResponse(post, author, liked);
    }

    public void deletePost(String postId, String userId) {
        Post post = postRepository.findById(postId)
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));

        if (!post.getAuthorId().equals(userId)) {
            throw new ForbiddenException("You can only delete your own posts");
        }

        post.setDeleted(true);
        post.setUpdatedAt(Instant.now());
        postRepository.save(post);
    }

    public PageResponse<PostResponse> getPostsByAuthor(String authorId, String currentUserId, Pageable pageable) {
        Page<Post> postPage = postRepository.findByAuthorIdAndDeletedFalse(authorId, pageable);
        return toPageResponse(postPage, currentUserId);
    }

    public PageResponse<PostResponse> getPublicFeed(String currentUserId, Pageable pageable) {
        Page<Post> postPage = postRepository
                .findByDeletedFalseAndVisibilityAndModerationStatus(
                        Visibility.PUBLIC, ModerationStatus.APPROVED, pageable);
        return toPageResponse(postPage, currentUserId);
    }

    // ── Internal helpers ────────────────────────────────────────────────────────

    private PageResponse<PostResponse> toPageResponse(Page<Post> postPage, String currentUserId) {
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
            return mapToPostResponse(post, author, liked);
        });

        return PageResponse.from(responsePage);
    }

    private PostResponse mapToPostResponse(Post post, User author, boolean likedByMe) {
        String status = "ACTIVE";
        if (post.isDeleted()) {
            status = "DELETED";
        } else if (post.getModerationStatus() == ModerationStatus.REMOVED) {
            status = "HIDDEN";
        }

        String visibility = "COMPANY";
        if (post.getVisibility() == Visibility.DRAFT) {
            visibility = "PRIVATE";
        } else if (post.getVisibility() == Visibility.DEPARTMENT) {
            visibility = "DEPARTMENT";
        }

        AuthorSummary authorSummary = null;
        if (author != null) {
            authorSummary = AuthorSummary.builder()
                    .id(author.getId())
                    .fullName(author.getFullName())
                    .jobTitle(author.getJobTitle())
                    .department(author.getDepartment())
                    .avatarUrl(author.getAvatarUrl())
                    .build();
        }

        return PostResponse.builder()
                .id(post.getId())
                .author(authorSummary)
                .content(post.getContent())
                .mediaUrls(post.getMediaUrls())
                .visibility(visibility)
                .likeCount(post.getLikeCount())
                .commentCount(post.getCommentCount())
                .likedByMe(likedByMe)
                .status(status)
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }
}
