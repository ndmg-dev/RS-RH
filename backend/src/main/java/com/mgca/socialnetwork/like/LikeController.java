package com.mgca.socialnetwork.like;

import com.mgca.socialnetwork.common.dto.PageResponse;
import com.mgca.socialnetwork.like.dto.LikeResponse;
import com.mgca.socialnetwork.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/posts/{postId}/likes")
@RequiredArgsConstructor
@Tag(name = "Likes", description = "Like and unlike posts")
public class LikeController {

    private final LikeService likeService;

    @PostMapping
    @Operation(summary = "Like a post")
    public ResponseEntity<LikeResponse> likePost(@PathVariable String postId) {
        LikeResponse response = likeService.likePost(postId, getCurrentUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping
    @Operation(summary = "Unlike a post")
    public ResponseEntity<Void> unlikePost(@PathVariable String postId) {
        likeService.unlikePost(postId, getCurrentUserId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @Operation(summary = "List users who liked a post")
    public ResponseEntity<PageResponse<LikeResponse>> getLikes(
            @PathVariable String postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        PageRequest pageRequest = PageRequest.of(page, Math.min(size, 50),
                Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(likeService.getLikesByPost(postId, pageRequest));
    }

    // ── Helper ──────────────────────────────────────────────────────────────────

    private String getCurrentUserId() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder
                .getContext().getAuthentication().getPrincipal();
        return principal.getId();
    }
}
