package com.mgca.socialnetwork.admin;

import com.mgca.socialnetwork.dto.AdminUserUpdateRequest;
import com.mgca.socialnetwork.dto.ModerationRequest;
import com.mgca.socialnetwork.dto.UserResponse;
import com.mgca.socialnetwork.model.Comment;
import com.mgca.socialnetwork.model.Post;
import com.mgca.socialnetwork.model.User;
import com.mgca.socialnetwork.model.enums.ModerationStatus;
import com.mgca.socialnetwork.model.enums.Role;
import com.mgca.socialnetwork.model.enums.Visibility;
import com.mgca.socialnetwork.repository.CommentRepository;
import com.mgca.socialnetwork.repository.PostRepository;
import com.mgca.socialnetwork.repository.UserRepository;
import com.mgca.socialnetwork.service.AdminService;
import com.mgca.socialnetwork.service.AuditService;
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

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

/**
 * Unit tests for {@link AdminService}.
 * <p>
 * Tests cover content moderation (posts and comments) and user management,
 * verifying that all admin actions are properly logged via AuditService.
 * </p>
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AdminService")
class AdminServiceTest {

    @Mock
    private PostRepository postRepository;

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private AdminService adminService;

    @Captor
    private ArgumentCaptor<Post> postCaptor;

    @Captor
    private ArgumentCaptor<Comment> commentCaptor;

    @Captor
    private ArgumentCaptor<User> userCaptor;

    private Post testPost;
    private Comment testComment;
    private User targetUser;

    private static final String ADMIN_ID = "665a0000000000000000adm1";
    private static final String POST_ID = "665b2c3d4e5f6a7b8c9d1a2b";
    private static final String COMMENT_ID = "665d4e5f6a7b8c9d3e4f5a6b";
    private static final String TARGET_USER_ID = "665a1b2c3d4e5f6a7b8c9d0e";

    @BeforeEach
    void setUp() {
        testPost = Post.builder()
                .id(POST_ID)
                .authorId("someAuthorId")
                .content("Conteúdo que precisa de moderação.")
                .visibility(Visibility.PUBLIC)
                .moderationStatus(ModerationStatus.APPROVED)
                .likeCount(0)
                .commentCount(0)
                .deleted(false)
                .createdAt(Instant.parse("2025-06-15T10:00:00Z"))
                .updatedAt(Instant.parse("2025-06-15T10:00:00Z"))
                .build();

        testComment = Comment.builder()
                .id(COMMENT_ID)
                .postId(POST_ID)
                .authorId("someCommentAuthorId")
                .content("Comentário potencialmente inapropriado.")
                .moderationStatus(ModerationStatus.APPROVED)
                .deleted(false)
                .createdAt(Instant.parse("2025-06-15T11:00:00Z"))
                .updatedAt(Instant.parse("2025-06-15T11:00:00Z"))
                .build();

        targetUser = User.builder()
                .id(TARGET_USER_ID)
                .fullName("Marcos Oliveira")
                .email("marcos.oliveira@mgca.com.br")
                .department("Contabilidade")
                .jobTitle("Assistente Contábil")
                .role(Role.USER)
                .active(true)
                .createdAt(Instant.parse("2025-01-10T08:00:00Z"))
                .build();
    }

    @Nested
    @DisplayName("Moderate Post")
    class ModeratePost {

        @Test
        @DisplayName("should update moderation status and log the action")
        void moderatePost_shouldUpdateStatusAndLog() {
            // Arrange
            ModerationRequest request = ModerationRequest.builder()
                    .status(ModerationStatus.FLAGGED)
                    .reason("Conteúdo contém informações não verificadas sobre legislação.")
                    .build();

            given(postRepository.findById(POST_ID)).willReturn(Optional.of(testPost));
            given(postRepository.save(any(Post.class))).willAnswer(invocation -> invocation.getArgument(0));

            // Act
            adminService.moderatePost(POST_ID, ADMIN_ID, request);

            // Assert — post status was updated
            verify(postRepository).save(postCaptor.capture());
            Post savedPost = postCaptor.getValue();
            assertThat(savedPost.getModerationStatus()).isEqualTo(ModerationStatus.FLAGGED);

            // Assert — action was logged
            verify(auditService).log(
                    eq(ADMIN_ID),
                    eq("MODERATE_POST"),
                    eq(POST_ID),
                    anyString()
            );
        }

        @Test
        @DisplayName("should be able to remove a post via moderation")
        void moderatePost_remove_shouldUpdateStatusAndLog() {
            // Arrange
            ModerationRequest request = ModerationRequest.builder()
                    .status(ModerationStatus.REMOVED)
                    .reason("Conteúdo viola política interna da empresa.")
                    .build();

            given(postRepository.findById(POST_ID)).willReturn(Optional.of(testPost));
            given(postRepository.save(any(Post.class))).willAnswer(invocation -> invocation.getArgument(0));

            // Act
            adminService.moderatePost(POST_ID, ADMIN_ID, request);

            // Assert
            verify(postRepository).save(postCaptor.capture());
            Post savedPost = postCaptor.getValue();
            assertThat(savedPost.getModerationStatus()).isEqualTo(ModerationStatus.REMOVED);

            verify(auditService).log(eq(ADMIN_ID), eq("MODERATE_POST"), eq(POST_ID), anyString());
        }
    }

    @Nested
    @DisplayName("Moderate Comment")
    class ModerateComment {

        @Test
        @DisplayName("should update moderation status and log the action")
        void moderateComment_shouldUpdateStatusAndLog() {
            // Arrange
            ModerationRequest request = ModerationRequest.builder()
                    .status(ModerationStatus.REMOVED)
                    .reason("Comentário contém linguagem inadequada para o ambiente corporativo.")
                    .build();

            given(commentRepository.findById(COMMENT_ID)).willReturn(Optional.of(testComment));
            given(commentRepository.save(any(Comment.class))).willAnswer(invocation -> invocation.getArgument(0));

            // Act
            adminService.moderateComment(COMMENT_ID, ADMIN_ID, request);

            // Assert — comment status was updated
            verify(commentRepository).save(commentCaptor.capture());
            Comment savedComment = commentCaptor.getValue();
            assertThat(savedComment.getModerationStatus()).isEqualTo(ModerationStatus.REMOVED);

            // Assert — action was logged
            verify(auditService).log(
                    eq(ADMIN_ID),
                    eq("MODERATE_COMMENT"),
                    eq(COMMENT_ID),
                    anyString()
            );
        }
    }

    @Nested
    @DisplayName("Update User")
    class UpdateUser {

        @Test
        @DisplayName("should change user role and log the action")
        void updateUser_shouldChangeRoleAndLog() {
            // Arrange
            AdminUserUpdateRequest request = AdminUserUpdateRequest.builder()
                    .role(Role.MODERATOR)
                    .active(true)
                    .build();

            given(userRepository.findById(TARGET_USER_ID)).willReturn(Optional.of(targetUser));
            given(userRepository.save(any(User.class))).willAnswer(invocation -> invocation.getArgument(0));

            // Act
            UserResponse response = adminService.updateUser(TARGET_USER_ID, ADMIN_ID, request);

            // Assert — user was updated
            verify(userRepository).save(userCaptor.capture());
            User savedUser = userCaptor.getValue();
            assertThat(savedUser.getRole()).isEqualTo(Role.MODERATOR);
            assertThat(savedUser.isActive()).isTrue();

            // Assert — action was logged
            verify(auditService).log(
                    eq(ADMIN_ID),
                    eq("UPDATE_USER"),
                    eq(TARGET_USER_ID),
                    anyString()
            );
        }

        @Test
        @DisplayName("should be able to deactivate a user")
        void updateUser_deactivate_shouldSetInactiveAndLog() {
            // Arrange
            AdminUserUpdateRequest request = AdminUserUpdateRequest.builder()
                    .active(false)
                    .build();

            given(userRepository.findById(TARGET_USER_ID)).willReturn(Optional.of(targetUser));
            given(userRepository.save(any(User.class))).willAnswer(invocation -> invocation.getArgument(0));

            // Act
            UserResponse response = adminService.updateUser(TARGET_USER_ID, ADMIN_ID, request);

            // Assert
            verify(userRepository).save(userCaptor.capture());
            User savedUser = userCaptor.getValue();
            assertThat(savedUser.isActive()).isFalse();

            verify(auditService).log(eq(ADMIN_ID), eq("UPDATE_USER"), eq(TARGET_USER_ID), anyString());
        }
    }
}
