package com.mgca.socialnetwork.comment;

import com.mgca.socialnetwork.common.ModerationStatus;
import com.mgca.socialnetwork.common.dto.PageResponse;
import com.mgca.socialnetwork.common.dto.AuthorSummary;
import com.mgca.socialnetwork.common.exception.ForbiddenException;
import com.mgca.socialnetwork.common.exception.ResourceNotFoundException;
import com.mgca.socialnetwork.comment.dto.CommentResponse;
import com.mgca.socialnetwork.comment.dto.CreateCommentRequest;
import com.mgca.socialnetwork.comment.dto.UpdateCommentRequest;
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
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final MongoTemplate mongoTemplate;

    public CommentResponse addComment(String postId, String userId, CreateCommentRequest request) {
        // Verify the target post exists and is not deleted
        Post post = postRepository.findById(postId)
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));

        Comment comment = Comment.builder()
                .postId(postId)
                .authorId(userId)
                .content(request.getContent())
                .deleted(false)
                .moderationStatus(ModerationStatus.APPROVED)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        comment = commentRepository.save(comment);

        // Atomically increment commentCount on the parent post
        incrementCommentCount(postId, 1);

        User author = userRepository.findById(userId).orElse(null);
        return mapToCommentResponse(comment, author);
    }

    public List<CommentResponse> getCommentsByPost(String postId, Pageable pageable) {
        Page<Comment> commentPage = commentRepository.findByPostIdAndDeletedFalse(postId, pageable);

        // Batch-fetch all distinct comment authors
        var authorIds = commentPage.getContent().stream()
                .map(Comment::getAuthorId)
                .distinct()
                .toList();

        Map<String, User> authorMap = userRepository.findAllById(authorIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));

        return commentPage.getContent().stream().map(comment -> {
            User author = authorMap.get(comment.getAuthorId());
            return mapToCommentResponse(comment, author);
        }).toList();
    }

    public CommentResponse updateComment(String commentId, String userId, UpdateCommentRequest request) {
        Comment comment = commentRepository.findById(commentId)
                .filter(c -> !c.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));

        if (!comment.getAuthorId().equals(userId)) {
            throw new ForbiddenException("You can only edit your own comments");
        }

        comment.setContent(request.getContent());
        comment.setUpdatedAt(Instant.now());
        comment = commentRepository.save(comment);

        User author = userRepository.findById(userId).orElse(null);
        return mapToCommentResponse(comment, author);
    }

    public void deleteComment(String commentId, String userId) {
        Comment comment = commentRepository.findById(commentId)
                .filter(c -> !c.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));

        if (!comment.getAuthorId().equals(userId)) {
            throw new ForbiddenException("You can only delete your own comments");
        }

        comment.setDeleted(true);
        comment.setUpdatedAt(Instant.now());
        commentRepository.save(comment);

        // Atomically decrement commentCount on the parent post
        incrementCommentCount(comment.getPostId(), -1);
    }

    // ── Internal helpers ────────────────────────────────────────────────────────

    private void incrementCommentCount(String postId, int delta) {
        mongoTemplate.updateFirst(
                Query.query(Criteria.where("id").is(postId)),
                new Update().inc("commentCount", delta),
                Post.class);
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
