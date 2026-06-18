package com.mgca.socialnetwork.post;

import com.mgca.socialnetwork.common.dto.PageResponse;
import com.mgca.socialnetwork.post.dto.CreatePostRequest;
import com.mgca.socialnetwork.post.dto.PostResponse;
import com.mgca.socialnetwork.post.dto.UpdatePostRequest;
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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/posts")
@RequiredArgsConstructor
@Tag(name = "Posts", description = "Create, read, update and delete posts")
public class PostController {

    private final PostService postService;

    @PostMapping
    @Operation(summary = "Create a new post")
    public ResponseEntity<PostResponse> createPost(@Valid @RequestBody CreatePostRequest request) {
        PostResponse response = postService.createPost(getCurrentUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "List posts (public feed)")
    public ResponseEntity<PageResponse<PostResponse>> listPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        PageRequest pageRequest = PageRequest.of(page, Math.min(size, 50),
                Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(postService.getPublicFeed(getCurrentUserId(), pageRequest));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single post by ID")
    public ResponseEntity<PostResponse> getPost(@PathVariable String id) {
        return ResponseEntity.ok(postService.getPostById(id, getCurrentUserId()));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Update your own post")
    public ResponseEntity<PostResponse> updatePost(
            @PathVariable String id,
            @Valid @RequestBody UpdatePostRequest request) {
        return ResponseEntity.ok(postService.updatePost(id, getCurrentUserId(), request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft-delete your own post")
    public ResponseEntity<Void> deletePost(@PathVariable String id) {
        postService.deletePost(id, getCurrentUserId());
        return ResponseEntity.noContent().build();
    }

    // ── Helper ──────────────────────────────────────────────────────────────────

    private String getCurrentUserId() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder
                .getContext().getAuthentication().getPrincipal();
        return principal.getId();
    }
}
