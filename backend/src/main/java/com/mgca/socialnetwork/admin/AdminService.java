package com.mgca.socialnetwork.admin;

import com.mgca.socialnetwork.admin.dto.AdminUserUpdateRequest;
import com.mgca.socialnetwork.admin.dto.ModerationRequest;
import com.mgca.socialnetwork.comment.Comment;
import com.mgca.socialnetwork.comment.CommentRepository;
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

        post.setModerationStatus(request.getStatus());
        post.setModeratedBy(moderatorId);
        post.setModerationNote(request.getNote());
        post.setUpdatedAt(Instant.now());
        post = postRepository.save(post);

        auditService.log(moderatorId, "MODERATE_POST", "Post", postId,
                "Status: " + request.getStatus() + (request.getNote() != null ? " — " + request.getNote() : ""));

        User author = userRepository.findById(post.getAuthorId()).orElse(null);
        return PostResponse.from(post, author, false);
    }

    // ── Comment Moderation ──────────────────────────────────────────────────────

    public CommentResponse moderateComment(String commentId, String moderatorId, ModerationRequest request) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));

        comment.setModerationStatus(request.getStatus());
        comment.setModeratedBy(moderatorId);
        comment.setModerationNote(request.getNote());
        comment.setUpdatedAt(Instant.now());
        comment = commentRepository.save(comment);

        auditService.log(moderatorId, "MODERATE_COMMENT", "Comment", commentId,
                "Status: " + request.getStatus() + (request.getNote() != null ? " — " + request.getNote() : ""));

        User author = userRepository.findById(comment.getAuthorId()).orElse(null);
        return CommentResponse.from(comment, author);
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

    public PageResponse<PostResponse> getAllPosts(Pageable pageable) {
        Page<Post> postPage = postRepository.findAll(pageable);
        Page<PostResponse> responsePage = postPage.map(post -> {
            User author = userRepository.findById(post.getAuthorId()).orElse(null);
            return PostResponse.from(post, author, false);
        });
        return PageResponse.from(responsePage);
    }

    public PageResponse<CommentResponse> getAllComments(Pageable pageable) {
        Page<Comment> commentPage = commentRepository.findAll(pageable);
        Page<CommentResponse> responsePage = commentPage.map(comment -> {
            User author = userRepository.findById(comment.getAuthorId()).orElse(null);
            return CommentResponse.from(comment, author);
        });
        return PageResponse.from(responsePage);
    }

    public PageResponse<UserResponse> getAllUsers(Pageable pageable) {
        Page<User> userPage = userRepository.findAll(pageable);
        Page<UserResponse> responsePage = userPage.map(UserResponse::from);
        return PageResponse.from(responsePage);
    }
}
