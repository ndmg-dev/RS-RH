package com.mgca.socialnetwork.feed;

import com.mgca.socialnetwork.common.dto.PageResponse;
import com.mgca.socialnetwork.post.dto.PostResponse;
import com.mgca.socialnetwork.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/feed")
@RequiredArgsConstructor
@Tag(name = "Feed", description = "Chronological content feed")
public class FeedController {

    private final FeedService feedService;

    @GetMapping
    @Operation(summary = "Get the public feed (reverse-chronological)")
    public ResponseEntity<PageResponse<PostResponse>> getFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        PageRequest pageRequest = PageRequest.of(page, Math.min(size, 50),
                Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(feedService.getFeed(getCurrentUserId(), pageRequest));
    }

    // ── Helper ──────────────────────────────────────────────────────────────────

    private String getCurrentUserId() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder
                .getContext().getAuthentication().getPrincipal();
        return principal.getId();
    }
}
