package com.mgca.socialnetwork.admin;

import com.mgca.socialnetwork.admin.dto.AdminUserUpdateRequest;
import com.mgca.socialnetwork.admin.dto.ModerationRequest;
import com.mgca.socialnetwork.comment.dto.CommentResponse;
import com.mgca.socialnetwork.common.dto.PageResponse;
import java.util.List;
import com.mgca.socialnetwork.post.dto.PostResponse;
import com.mgca.socialnetwork.security.UserPrincipal;
import com.mgca.socialnetwork.user.dto.UserResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
@Tag(name = "Administration", description = "Admin and moderation endpoints")
public class AdminController {

    private final AdminService adminService;
    private final AuditService auditService;

    // ── User Management (ADMIN only) ────────────────────────────────────────────

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List all users (ADMIN only)")
    public ResponseEntity<PageResponse<UserResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        PageRequest pageRequest = PageRequest.of(page, Math.min(size, 50),
                Sort.by(Sort.Direction.ASC, "fullName"));
        return ResponseEntity.ok(adminService.getAllUsers(pageRequest));
    }

    @PatchMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a user's role or active status (ADMIN only)")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable String id,
            @Valid @RequestBody AdminUserUpdateRequest request) {
        return ResponseEntity.ok(adminService.updateUser(id, getCurrentUserId(), request));
    }

    // ── Post Moderation ─────────────────────────────────────────────────────────

    @GetMapping("/posts")
    @Operation(summary = "List all posts for moderation review")
    public ResponseEntity<List<PostResponse>> getAllPosts() {
        return ResponseEntity.ok(adminService.getAllPosts());
    }

    @PatchMapping("/posts/{id}/moderation")
    @Operation(summary = "Moderate a post (approve, flag, or remove)")
    public ResponseEntity<PostResponse> moderatePost(
            @PathVariable String id,
            @Valid @RequestBody ModerationRequest request) {
        return ResponseEntity.ok(adminService.moderatePost(id, getCurrentUserId(), request));
    }

    // ── Comment Moderation ──────────────────────────────────────────────────────

    @GetMapping("/comments")
    @Operation(summary = "List all comments for moderation review")
    public ResponseEntity<List<CommentResponse>> getAllComments() {
        return ResponseEntity.ok(adminService.getAllComments());
    }

    @PatchMapping("/comments/{id}/moderation")
    @Operation(summary = "Moderate a comment (approve, flag, or remove)")
    public ResponseEntity<CommentResponse> moderateComment(
            @PathVariable String id,
            @Valid @RequestBody ModerationRequest request) {
        return ResponseEntity.ok(adminService.moderateComment(id, getCurrentUserId(), request));
    }

    // ── Audit Logs (ADMIN only) ─────────────────────────────────────────────────

    @GetMapping("/audit-logs")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "View audit logs (ADMIN only)")
    public ResponseEntity<PageResponse<AuditLog>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        PageRequest pageRequest = PageRequest.of(page, Math.min(size, 50));
        return ResponseEntity.ok(auditService.getAuditLogs(pageRequest));
    }

    // ── Helper ──────────────────────────────────────────────────────────────────

    private String getCurrentUserId() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder
                .getContext().getAuthentication().getPrincipal();
        return principal.getId();
    }
}
