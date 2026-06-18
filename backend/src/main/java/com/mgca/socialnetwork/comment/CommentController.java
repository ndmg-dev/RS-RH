package com.mgca.socialnetwork.comment;

import com.mgca.socialnetwork.comment.dto.CommentResponse;
import com.mgca.socialnetwork.comment.dto.CreateCommentRequest;
import com.mgca.socialnetwork.comment.dto.UpdateCommentRequest;
import com.mgca.socialnetwork.common.dto.PageResponse;
import com.mgca.socialnetwork.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Tag(name = "Comments", description = "Add, list, update and delete comments on posts")
public class CommentController {

    private final CommentService commentService;

    @PostMapping("/api/v1/posts/{postId}/comments")
    @Operation(summary = "Add a comment to a post")
    public ResponseEntity<CommentResponse> addComment(
            @PathVariable String postId,
            @Valid @RequestBody CreateCommentRequest request) {
        CommentResponse response = commentService.addComment(postId, getCurrentUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/api/v1/posts/{postId}/comments")
    @Operation(summary = "List comments for a post")
    public ResponseEntity<PageResponse<CommentResponse>> getComments(
            @PathVariable String postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        PageRequest pageRequest = PageRequest.of(page, Math.min(size, 50),
                Sort.by(Sort.Direction.ASC, "createdAt"));
        return ResponseEntity.ok(commentService.getCommentsByPost(postId, pageRequest));
    }

    @PatchMapping("/api/v1/comments/{commentId}")
    @Operation(summary = "Update your own comment")
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable String commentId,
            @Valid @RequestBody UpdateCommentRequest request) {
        return ResponseEntity.ok(
                commentService.updateComment(commentId, getCurrentUserId(), request));
    }

    @DeleteMapping("/api/v1/comments/{commentId}")
    @Operation(summary = "Delete your own comment")
    public ResponseEntity<Void> deleteComment(@PathVariable String commentId) {
        commentService.deleteComment(commentId, getCurrentUserId());
        return ResponseEntity.noContent().build();
    }

    // ── Helper ──────────────────────────────────────────────────────────────────

    private String getCurrentUserId() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder
                .getContext().getAuthentication().getPrincipal();
        return principal.getId();
    }
}
