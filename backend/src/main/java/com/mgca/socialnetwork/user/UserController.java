package com.mgca.socialnetwork.user;

import com.mgca.socialnetwork.common.dto.PageResponse;
import com.mgca.socialnetwork.security.UserPrincipal;
import com.mgca.socialnetwork.user.dto.UpdateProfileRequest;
import com.mgca.socialnetwork.user.dto.UserResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User profile management")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Get the current authenticated user's profile")
    public ResponseEntity<UserResponse> getMe() {
        return ResponseEntity.ok(userService.getCurrentUser(getCurrentUserId()));
    }

    @PatchMapping("/me")
    @Operation(summary = "Update the current authenticated user's profile")
    public ResponseEntity<UserResponse> updateMe(@Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(getCurrentUserId(), request));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Update a user's profile by ID (e.g. for recommendations)")
    public ResponseEntity<UserResponse> updateProfileById(
            @PathVariable String id,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(id, request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a user by ID")
    public ResponseEntity<UserResponse> getUserById(@PathVariable String id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @GetMapping
    @Operation(summary = "List users, optionally filtered by department")
    public ResponseEntity<PageResponse<UserResponse>> listUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String department) {

        PageRequest pageRequest = PageRequest.of(page, Math.min(size, 50),
                Sort.by(Sort.Direction.ASC, "fullName"));

        PageResponse<UserResponse> response = (department != null && !department.isBlank())
                ? userService.listUsersByDepartment(department, pageRequest)
                : userService.listUsers(pageRequest);

        return ResponseEntity.ok(response);
    }

    // ── Helper ──────────────────────────────────────────────────────────────────

    private String getCurrentUserId() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder
                .getContext().getAuthentication().getPrincipal();
        return principal.getId();
    }
}
