package com.mgca.socialnetwork.admin;

import com.mgca.socialnetwork.admin.dto.AdminUserUpdateRequest;
import com.mgca.socialnetwork.admin.dto.ModerationRequest;
import com.mgca.socialnetwork.comment.CommentRepository;
import com.mgca.socialnetwork.comment.dto.CommentResponse;
import com.mgca.socialnetwork.common.dto.AuthorSummary;
import com.mgca.socialnetwork.common.ModerationStatus;
import com.mgca.socialnetwork.comment.dto.CommentResponse;
import com.mgca.socialnetwork.common.dto.PageResponse;
import com.mgca.socialnetwork.common.exception.ResourceNotFoundException;
import com.mgca.socialnetwork.post.Post;
import com.mgca.socialnetwork.post.PostRepository;
import com.mgca.socialnetwork.post.dto.PostResponse;
import com.mgca.socialnetwork.user.User;
import com.mgca.socialnetwork.user.UserRepository;
import com.mgca.socialnetwork.user.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import com.mgca.socialnetwork.common.Visibility;
import com.mgca.socialnetwork.comment.Comment;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    // ── Post Moderation ─────────────────────────────────────────────────────────

    public PostResponse moderatePost(String postId, String moderatorId, ModerationRequest request) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));

        ModerationStatus modStatus = "HIDDEN".equalsIgnoreCase(request.getStatus()) ? ModerationStatus.REMOVED : ModerationStatus.APPROVED;
        post.setModerationStatus(modStatus);
        post.setModeratedBy(moderatorId);
        post.setModerationNote(request.getNote());
        post.setUpdatedAt(Instant.now());
        post = postRepository.save(post);

        auditService.log(moderatorId, "MODERATE_POST", "Post", postId,
                "Status: " + request.getStatus() + (request.getNote() != null ? " — " + request.getNote() : ""));

        User author = userRepository.findById(post.getAuthorId()).orElse(null);
        return mapToPostResponse(post, author, false);
    }

    // ── Comment Moderation ──────────────────────────────────────────────────────

    public CommentResponse moderateComment(String commentId, String moderatorId, ModerationRequest request) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));

        ModerationStatus modStatus = "HIDDEN".equalsIgnoreCase(request.getStatus()) ? ModerationStatus.REMOVED : ModerationStatus.APPROVED;
        comment.setModerationStatus(modStatus);
        comment.setModeratedBy(moderatorId);
        comment.setModerationNote(request.getNote());
        comment.setUpdatedAt(Instant.now());
        comment = commentRepository.save(comment);

        auditService.log(moderatorId, "MODERATE_COMMENT", "Comment", commentId,
                "Status: " + request.getStatus() + (request.getNote() != null ? " — " + request.getNote() : ""));

        User author = userRepository.findById(comment.getAuthorId()).orElse(null);
        return mapToCommentResponse(comment, author);
    }

    // ── User Management ─────────────────────────────────────────────────────────

    public UserResponse updateUser(String userId, String adminId, AdminUserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        StringBuilder details = new StringBuilder();

        if (request.getRole() != null) {
            details.append("Role: ").append(user.getRole()).append(" -> ").append(request.getRole()).append("; ");
            user.setRole(request.getRole());
        }
        if (request.getActive() != null) {
            details.append("Active: ").append(user.isActive()).append(" -> ").append(request.getActive()).append("; ");
            user.setActive(request.getActive());
        }

        user.setUpdatedAt(Instant.now());
        user = userRepository.save(user);

        auditService.log(adminId, "UPDATE_USER", "User", userId, details.toString());

        return UserResponse.from(user);
    }

    // ── Listing (for moderation panels) ─────────────────────────────────────────

    public List<PostResponse> getAllPosts() {
        return postRepository.findAll().stream().map(post -> {
            User author = userRepository.findById(post.getAuthorId()).orElse(null);
            return mapToPostResponse(post, author, false);
        }).toList();
    }

    public List<CommentResponse> getAllComments() {
        return commentRepository.findAll().stream().map(comment -> {
            User author = userRepository.findById(comment.getAuthorId()).orElse(null);
            return mapToCommentResponse(comment, author);
        }).toList();
    }

    public PageResponse<UserResponse> getAllUsers(Pageable pageable) {
        Page<User> userPage = userRepository.findAll(pageable);
        Page<UserResponse> responsePage = userPage.map(UserResponse::from);
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

    private CommentResponse mapToCommentResponse(Comment comment, User author) {
        String status = "ACTIVE";
        if (comment.isDeleted()) {
            status = "DELETED";
        } else if (comment.getModerationStatus() == ModerationStatus.REMOVED) {
            status = "HIDDEN";
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

        return CommentResponse.builder()
                .id(comment.getId())
                .postId(comment.getPostId())
                .author(authorSummary)
                .content(comment.getContent())
                .status(status)
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }
}
