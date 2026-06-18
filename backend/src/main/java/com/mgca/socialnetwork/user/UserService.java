package com.mgca.socialnetwork.user;

import com.mgca.socialnetwork.common.dto.PageResponse;
import com.mgca.socialnetwork.common.exception.ResourceNotFoundException;
import com.mgca.socialnetwork.user.dto.UpdateProfileRequest;
import com.mgca.socialnetwork.user.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserResponse getUserById(String id) {
        User user = getUserEntityById(id);
        return UserResponse.from(user);
    }

    public UserResponse getCurrentUser(String userId) {
        return getUserById(userId);
    }

    /**
     * Applies a partial update — only non-null fields in the request overwrite existing values.
     */
    public UserResponse updateProfile(String userId, UpdateProfileRequest request) {
        User user = getUserEntityById(userId);

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getJobTitle() != null) {
            user.setJobTitle(request.getJobTitle().trim());
        }
        if (request.getDepartment() != null) {
            user.setDepartment(request.getDepartment().trim());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio().trim());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl().trim());
        }
        if (request.getSkills() != null) {
            user.setSkills(request.getSkills());
        }
        if (request.getLocation() != null) {
            user.setLocation(request.getLocation().trim());
        }

        user.setUpdatedAt(Instant.now());
        user = userRepository.save(user);
        return UserResponse.from(user);
    }

    public PageResponse<UserResponse> listUsers(Pageable pageable) {
        Page<UserResponse> page = userRepository.findByActiveTrue(pageable)
                .map(UserResponse::from);
        return PageResponse.from(page);
    }

    public PageResponse<UserResponse> listUsersByDepartment(String department, Pageable pageable) {
        Page<UserResponse> page = userRepository
                .findByDepartmentAndActiveTrue(department, pageable)
                .map(UserResponse::from);
        return PageResponse.from(page);
    }

    /**
     * Internal helper that returns the raw User entity — intended for cross-service usage.
     */
    public User getUserEntityById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }
}
