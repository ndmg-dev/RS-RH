package com.mgca.socialnetwork.comment;

import com.mgca.socialnetwork.dto.CommentResponse;
import com.mgca.socialnetwork.dto.CreateCommentRequest;
import com.mgca.socialnetwork.dto.UpdateCommentRequest;
import com.mgca.socialnetwork.exception.ForbiddenException;
import com.mgca.socialnetwork.exception.ResourceNotFoundException;
import com.mgca.socialnetwork.model.Comment;
import com.mgca.socialnetwork.model.Post;
import com.mgca.socialnetwork.model.User;
import com.mgca.socialnetwork.model.enums.ModerationStatus;
import com.mgca.socialnetwork.model.enums.Role;
import com.mgca.socialnetwork.model.enums.Visibility;
import com.mgca.socialnetwork.repository.CommentRepository;
import com.mgca.socialnetwork.repository.PostRepository;
import com.mgca.socialnetwork.repository.UserRepository;
import com.mgca.socialnetwork.service.CommentService;
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
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

/**
 * Unit tests for {@link CommentService}.
 * <p>
 * Tests cover adding comments (with post commentCount increment),
 * updating comments (owner vs. non-owner), and soft-deleting comments.
 * </p>
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("CommentService")
class CommentServiceTest {

    @Mock
    private CommentRepository commentRepository;

    @Mock
    private PostRepository postRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private MongoTemplate mongoTemplate;

    @InjectMocks
    private CommentService commentService;

    @Captor
    private ArgumentCaptor<Comment> commentCaptor;

    private User testUser;
    private User otherUser;
    private Post testPost;
    private Comment testComment;

    private static final String USER_ID = "665a1b2c3d4e5f6a7b8c9d0e";
    private static final String OTHER_USER_ID = "665a1b2c3d4e5f6a7b8c9d0f";
    private static final String POST_ID = "665b2c3d4e5f6a7b8c9d1a2b";
    private static final String COMMENT_ID = "665d4e5f6a7b8c9d3e4f5a6b";

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(USER_ID)
                .fullName("Luciana Costa")
                .email("luciana.costa@mgca.com.br")
                .department("Pessoal")
                .jobTitle("Analista de DP")
                .role(Role.USER)
                .active(true)
                .build();

        otherUser = User.builder()
                .id(OTHER_USER_ID)
                .fullName("Roberto Alves")
                .email("roberto.alves@mgca.com.br")
                .department("Fiscal")
                .jobTitle("Assistente Fiscal")
                .role(Role.USER)
                .active(true)
                .build();

        testPost = Post.builder()
                .id(POST_ID)
                .authorId("postAuthorId")
                .content("Post sobre mudanças na CLT.")
                .visibility(Visibility.PUBLIC)
                .moderationStatus(ModerationStatus.APPROVED)
                .likeCount(5)
                .commentCount(3)
                .deleted(false)
                .createdAt(Instant.parse("2025-06-12T08:00:00Z"))
                .build();

        testComment = Comment.builder()
                .id(COMMENT_ID)
                .postId(POST_ID)
                .authorId(USER_ID)
                .content("Excelente análise! Isso afeta diretamente nossos clientes do setor industrial.")
                .moderationStatus(ModerationStatus.APPROVED)
                .deleted(false)
                .createdAt(Instant.parse("2025-06-12T09:15:00Z"))
                .updatedAt(Instant.parse("2025-06-12T09:15:00Z"))
                .build();
    }

    @Nested
    @DisplayName("Add Comment")
    class AddComment {

        @Test
        @DisplayName("should succeed and increment post commentCount")
        void addComment_shouldSucceedAndIncrementCount() {
            // Arrange
            CreateCommentRequest request = CreateCommentRequest.builder()
                    .content("Concordo plenamente! Precisamos nos preparar para essas mudanças.")
                    .build();

            given(postRepository.findById(POST_ID)).willReturn(Optional.of(testPost));
            given(userRepository.findById(USER_ID)).willReturn(Optional.of(testUser));

            Comment savedComment = Comment.builder()
                    .id("newCommentId")
                    .postId(POST_ID)
                    .authorId(USER_ID)
                    .content(request.getContent())
                    .moderationStatus(ModerationStatus.APPROVED)
                    .deleted(false)
                    .createdAt(Instant.now())
                    .updatedAt(Instant.now())
                    .build();

            given(commentRepository.save(any(Comment.class))).willReturn(savedComment);

            // Act
            CommentResponse response = commentService.addComment(POST_ID, USER_ID, request);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getContent()).isEqualTo(request.getContent());
            assertThat(response.getPostId()).isEqualTo(POST_ID);

            // Verify comment was saved
            verify(commentRepository).save(commentCaptor.capture());
            Comment captured = commentCaptor.getValue();
            assertThat(captured.getPostId()).isEqualTo(POST_ID);
            assertThat(captured.getAuthorId()).isEqualTo(USER_ID);

            // Verify commentCount was incremented on the post
            verify(mongoTemplate).updateFirst(any(Query.class), any(Update.class), eq(Post.class));
        }

        @Test
        @DisplayName("should throw ResourceNotFoundException when post does not exist")
        void addComment_toNonExistentPost_shouldThrowResourceNotFoundException() {
            // Arrange
            CreateCommentRequest request = CreateCommentRequest.builder()
                    .content("Comentário em post inexistente.")
                    .build();

            given(postRepository.findById("nonexistent")).willReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> commentService.addComment("nonexistent", USER_ID, request))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Post");
        }
    }

    @Nested
    @DisplayName("Update Comment")
    class UpdateComment {

        @Test
        @DisplayName("should succeed when requester is the comment owner")
        void updateComment_asOwner_shouldSucceed() {
            // Arrange
            UpdateCommentRequest request = UpdateCommentRequest.builder()
                    .content("Comentário atualizado com mais detalhes sobre o impacto nas folhas de pagamento.")
                    .build();

            given(commentRepository.findById(COMMENT_ID)).willReturn(Optional.of(testComment));
            given(commentRepository.save(any(Comment.class))).willAnswer(invocation -> invocation.getArgument(0));

            // Act
            CommentResponse response = commentService.updateComment(COMMENT_ID, USER_ID, request);

            // Assert
            verify(commentRepository).save(commentCaptor.capture());
            Comment savedComment = commentCaptor.getValue();
            assertThat(savedComment.getContent()).isEqualTo(request.getContent());
            assertThat(savedComment.getId()).isEqualTo(COMMENT_ID);
        }

        @Test
        @DisplayName("should throw ForbiddenException when requester is not the owner")
        void updateComment_asNonOwner_shouldThrowForbiddenException() {
            // Arrange
            UpdateCommentRequest request = UpdateCommentRequest.builder()
                    .content("Tentativa de editar comentário alheio.")
                    .build();

            given(commentRepository.findById(COMMENT_ID)).willReturn(Optional.of(testComment));

            // Act & Assert
            assertThatThrownBy(() -> commentService.updateComment(COMMENT_ID, OTHER_USER_ID, request))
                    .isInstanceOf(ForbiddenException.class);
        }
    }

    @Nested
    @DisplayName("Delete Comment")
    class DeleteComment {

        @Test
        @DisplayName("should soft-delete the comment when requester is the owner")
        void deleteComment_asOwner_shouldSoftDelete() {
            // Arrange
            given(commentRepository.findById(COMMENT_ID)).willReturn(Optional.of(testComment));
            given(commentRepository.save(any(Comment.class))).willAnswer(invocation -> invocation.getArgument(0));

            // Act
            commentService.deleteComment(COMMENT_ID, USER_ID);

            // Assert
            verify(commentRepository).save(commentCaptor.capture());
            Comment savedComment = commentCaptor.getValue();
            assertThat(savedComment.isDeleted()).isTrue();

            // Verify commentCount was decremented on the post
            verify(mongoTemplate).updateFirst(any(Query.class), any(Update.class), eq(Post.class));
        }

        @Test
        @DisplayName("should throw ResourceNotFoundException when comment does not exist")
        void deleteComment_nonExistent_shouldThrowResourceNotFoundException() {
            // Arrange
            given(commentRepository.findById("nonexistent")).willReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> commentService.deleteComment("nonexistent", USER_ID))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }
}
