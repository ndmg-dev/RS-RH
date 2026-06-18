package com.mgca.socialnetwork.user;

import com.mgca.socialnetwork.dto.PageResponse;
import com.mgca.socialnetwork.dto.UpdateProfileRequest;
import com.mgca.socialnetwork.dto.UserResponse;
import com.mgca.socialnetwork.exception.ResourceNotFoundException;
import com.mgca.socialnetwork.model.User;
import com.mgca.socialnetwork.model.enums.Role;
import com.mgca.socialnetwork.repository.UserRepository;
import com.mgca.socialnetwork.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

/**
 * Unit tests for {@link UserService}.
 * <p>
 * Tests cover user retrieval, profile updates, and listing with pagination.
 * All repository interactions are mocked.
 * </p>
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("UserService")
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @Captor
    private ArgumentCaptor<User> userCaptor;

    private User testUser;
    private static final String USER_ID = "665a1b2c3d4e5f6a7b8c9d0e";

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(USER_ID)
                .fullName("Carlos Mendonça")
                .email("carlos.mendonca@mgca.com.br")
                .passwordHash("$2a$10$hashedPassword")
                .department("Fiscal")
                .jobTitle("Analista Fiscal")
                .role(Role.USER)
                .bio("Especialista em impostos municipais.")
                .avatarUrl("https://cdn.mgca.com/avatars/carlos.jpg")
                .active(true)
                .createdAt(Instant.parse("2025-01-15T10:00:00Z"))
                .updatedAt(Instant.parse("2025-01-15T10:00:00Z"))
                .build();
    }

    @Nested
    @DisplayName("Get User By ID")
    class GetUserById {

        @Test
        @DisplayName("should return UserResponse when user exists")
        void getUserById_existingUser_shouldReturnUserResponse() {
            // Arrange
            given(userRepository.findById(USER_ID)).willReturn(Optional.of(testUser));

            // Act
            UserResponse response = userService.getUserById(USER_ID);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getId()).isEqualTo(USER_ID);
            assertThat(response.getFullName()).isEqualTo("Carlos Mendonça");
            assertThat(response.getEmail()).isEqualTo("carlos.mendonca@mgca.com.br");
            assertThat(response.getDepartment()).isEqualTo("Fiscal");
            assertThat(response.getJobTitle()).isEqualTo("Analista Fiscal");
            assertThat(response.getRole()).isEqualTo(Role.USER);

            verify(userRepository).findById(USER_ID);
        }

        @Test
        @DisplayName("should throw ResourceNotFoundException when user does not exist")
        void getUserById_nonExistingUser_shouldThrowResourceNotFoundException() {
            // Arrange
            String nonExistentId = "000000000000000000000000";
            given(userRepository.findById(nonExistentId)).willReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> userService.getUserById(nonExistentId))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("User");

            verify(userRepository).findById(nonExistentId);
        }
    }

    @Nested
    @DisplayName("Update Profile")
    class UpdateProfile {

        @Test
        @DisplayName("should update only non-null fields")
        void updateProfile_shouldUpdateOnlyNonNullFields() {
            // Arrange
            UpdateProfileRequest request = UpdateProfileRequest.builder()
                    .bio("Nova bio atualizada com mais detalhes.")
                    .jobTitle("Analista Fiscal Sênior")
                    // fullName and department are NOT set (null) — should remain unchanged
                    .build();

            given(userRepository.findById(USER_ID)).willReturn(Optional.of(testUser));
            given(userRepository.save(any(User.class))).willAnswer(invocation -> invocation.getArgument(0));

            // Act
            UserResponse response = userService.updateProfile(USER_ID, request);

            // Assert
            verify(userRepository).save(userCaptor.capture());
            User savedUser = userCaptor.getValue();

            // Updated fields
            assertThat(savedUser.getBio()).isEqualTo("Nova bio atualizada com mais detalhes.");
            assertThat(savedUser.getJobTitle()).isEqualTo("Analista Fiscal Sênior");

            // Unchanged fields (were null in request)
            assertThat(savedUser.getFullName()).isEqualTo("Carlos Mendonça");
            assertThat(savedUser.getDepartment()).isEqualTo("Fiscal");
            assertThat(savedUser.getEmail()).isEqualTo("carlos.mendonca@mgca.com.br");
        }
    }

    @Nested
    @DisplayName("List Users")
    class ListUsers {

        @Test
        @DisplayName("should return paginated response")
        void listUsers_shouldReturnPageResponse() {
            // Arrange
            User user2 = User.builder()
                    .id("665a1b2c3d4e5f6a7b8c9d0f")
                    .fullName("Ana Galvão")
                    .email("ana.galvao@mgca.com.br")
                    .department("Pessoal")
                    .jobTitle("Analista de RH")
                    .role(Role.USER)
                    .active(true)
                    .build();

            List<User> users = List.of(testUser, user2);
            Pageable pageable = PageRequest.of(0, 20);
            Page<User> userPage = new PageImpl<>(users, pageable, 2);

            given(userRepository.findByActiveTrue(pageable)).willReturn(userPage);

            // Act
            PageResponse<UserResponse> response = userService.listUsers(0, 20);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getContent()).hasSize(2);
            assertThat(response.getPage()).isZero();
            assertThat(response.getSize()).isEqualTo(20);
            assertThat(response.getTotalElements()).isEqualTo(2);
            assertThat(response.getTotalPages()).isEqualTo(1);
            assertThat(response.isLast()).isTrue();

            // Verify first user mapping
            UserResponse firstUser = response.getContent().get(0);
            assertThat(firstUser.getFullName()).isEqualTo("Carlos Mendonça");

            // Verify second user mapping
            UserResponse secondUser = response.getContent().get(1);
            assertThat(secondUser.getFullName()).isEqualTo("Ana Galvão");
        }
    }
}
