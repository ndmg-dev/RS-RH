package com.mgca.socialnetwork.post;

import com.mgca.socialnetwork.dto.CreatePostRequest;
import com.mgca.socialnetwork.dto.PostResponse;
import com.mgca.socialnetwork.dto.UpdatePostRequest;
import com.mgca.socialnetwork.exception.ForbiddenException;
import com.mgca.socialnetwork.exception.ResourceNotFoundException;
import com.mgca.socialnetwork.model.Post;
import com.mgca.socialnetwork.model.User;
import com.mgca.socialnetwork.model.enums.ModerationStatus;
import com.mgca.socialnetwork.model.enums.Role;
import com.mgca.socialnetwork.model.enums.Visibility;
import com.mgca.socialnetwork.repository.LikeRepository;
import com.mgca.socialnetwork.repository.PostRepository;
import com.mgca.socialnetwork.repository.UserRepository;
import com.mgca.socialnetwork.service.PostService;
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
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

/**
 * Unit tests for {@link PostService}.
 * <p>
 * Tests cover post creation, retrieval, update, deletion (soft-delete),
 * and ownership-based access control.
 * </p>
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("PostService")
class PostServiceTest {

    @Mock
    private PostRepository postRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private LikeRepository likeRepository;

    @InjectMocks
    private PostService postService;

    @Captor
    private ArgumentCaptor<Post> postCaptor;

    private User testAuthor;
    private User otherUser;
    private Post testPost;

    private static final String AUTHOR_ID = "665a1b2c3d4e5f6a7b8c9d0e";
    private static final String OTHER_USER_ID = "665a1b2c3d4e5f6a7b8c9d0f";
    private static final String POST_ID = "665b2c3d4e5f6a7b8c9d1a2b";

    @BeforeEach
    void setUp() {
        testAuthor = User.builder()
                .id(AUTHOR_ID)
                .fullName("João Pereira")
                .email("joao.pereira@mgca.com.br")
                .department("Contabilidade")
                .jobTitle("Contador")
                .role(Role.USER)
                .active(true)
                .build();

        otherUser = User.builder()
                .id(OTHER_USER_ID)
                .fullName("Fernanda Lima")
                .email("fernanda.lima@mgca.com.br")
                .department("Fiscal")
                .jobTitle("Analista")
                .role(Role.USER)
                .active(true)
                .build();

        testPost = Post.builder()
                .id(POST_ID)
                .authorId(AUTHOR_ID)
                .content("Compartilhando novidades sobre a reforma tributária e seus impactos nos nossos clientes.")
                .visibility(Visibility.PUBLIC)
                .moderationStatus(ModerationStatus.APPROVED)
                .tags(List.of("tributário", "reforma"))
                .likeCount(5)
                .commentCount(2)
                .deleted(false)
                .createdAt(Instant.parse("2025-06-01T14:30:00Z"))
                .updatedAt(Instant.parse("2025-06-01T14:30:00Z"))
                .build();
    }

    @Nested
    @DisplayName("Create Post")
    class CreatePost {

        @Test
        @DisplayName("should save and return a PostResponse")
        void createPost_shouldSaveAndReturnPostResponse() {
            // Arrange
            CreatePostRequest request = CreatePostRequest.builder()
                    .content("Novo post sobre legislação fiscal atualizada para 2025.")
                    .visibility(Visibility.PUBLIC)
                    .tags(List.of("fiscal", "legislação"))
                    .build();

            given(userRepository.findById(AUTHOR_ID)).willReturn(Optional.of(testAuthor));

            Post savedPost = Post.builder()
                    .id("newPostId123")
                    .authorId(AUTHOR_ID)
                    .content(request.getContent())
                    .visibility(request.getVisibility())
                    .tags(request.getTags())
                    .moderationStatus(ModerationStatus.APPROVED)
                    .likeCount(0)
                    .commentCount(0)
                    .deleted(false)
                    .createdAt(Instant.now())
                    .updatedAt(Instant.now())
                    .build();

            given(postRepository.save(any(Post.class))).willReturn(savedPost);

            // Act
            PostResponse response = postService.createPost(AUTHOR_ID, request);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getContent()).isEqualTo(request.getContent());
            assertThat(response.getVisibility()).isEqualTo(Visibility.PUBLIC);

            verify(postRepository).save(postCaptor.capture());
            Post captured = postCaptor.getValue();
            assertThat(captured.getAuthorId()).isEqualTo(AUTHOR_ID);
            assertThat(captured.getContent()).isEqualTo(request.getContent());
            assertThat(captured.isDeleted()).isFalse();
        }
    }

    @Nested
    @DisplayName("Get Post By ID")
    class GetPostById {

        @Test
        @DisplayName("should return PostResponse when post exists and is not deleted")
        void getPostById_existingPost_shouldReturnPostResponse() {
            // Arrange
            given(postRepository.findById(POST_ID)).willReturn(Optional.of(testPost));
            given(userRepository.findById(AUTHOR_ID)).willReturn(Optional.of(testAuthor));

            // Act
            PostResponse response = postService.getPostById(POST_ID, AUTHOR_ID);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getId()).isEqualTo(POST_ID);
            assertThat(response.getContent()).isEqualTo(testPost.getContent());
            assertThat(response.getLikeCount()).isEqualTo(5);
            assertThat(response.getCommentCount()).isEqualTo(2);
        }

        @Test
        @DisplayName("should throw ResourceNotFoundException when post is soft-deleted")
        void getPostById_deletedPost_shouldThrowResourceNotFoundException() {
            // Arrange
            Post deletedPost = Post.builder()
                    .id(POST_ID)
                    .authorId(AUTHOR_ID)
                    .content("Deleted content")
                    .deleted(true)
                    .build();

            given(postRepository.findById(POST_ID)).willReturn(Optional.of(deletedPost));

            // Act & Assert
            assertThatThrownBy(() -> postService.getPostById(POST_ID, AUTHOR_ID))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Post");
        }

        @Test
        @DisplayName("should throw ResourceNotFoundException when post does not exist")
        void getPostById_nonExistingPost_shouldThrowResourceNotFoundException() {
            // Arrange
            given(postRepository.findById("nonexistent")).willReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> postService.getPostById("nonexistent", AUTHOR_ID))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("Update Post")
    class UpdatePost {

        @Test
        @DisplayName("should succeed when requester is the owner")
        void updatePost_asOwner_shouldSucceed() {
            // Arrange
            UpdatePostRequest request = UpdatePostRequest.builder()
                    .content("Conteúdo atualizado com novas informações sobre a reforma.")
                    .visibility(Visibility.DEPARTMENT)
                    .build();

            given(postRepository.findById(POST_ID)).willReturn(Optional.of(testPost));
            given(postRepository.save(any(Post.class))).willAnswer(invocation -> invocation.getArgument(0));

            // Act
            PostResponse response = postService.updatePost(POST_ID, AUTHOR_ID, request);

            // Assert
            verify(postRepository).save(postCaptor.capture());
            Post savedPost = postCaptor.getValue();
            assertThat(savedPost.getContent()).isEqualTo(request.getContent());
            assertThat(savedPost.getVisibility()).isEqualTo(Visibility.DEPARTMENT);
        }

        @Test
        @DisplayName("should throw ForbiddenException when requester is not the owner")
        void updatePost_asNonOwner_shouldThrowForbiddenException() {
            // Arrange
            UpdatePostRequest request = UpdatePostRequest.builder()
                    .content("Tentativa de alterar post de outro usuário.")
                    .build();

            given(postRepository.findById(POST_ID)).willReturn(Optional.of(testPost));

            // Act & Assert
            assertThatThrownBy(() -> postService.updatePost(POST_ID, OTHER_USER_ID, request))
                    .isInstanceOf(ForbiddenException.class);
        }
    }

    @Nested
    @DisplayName("Delete Post")
    class DeletePost {

        @Test
        @DisplayName("should soft-delete the post when requester is the owner")
        void deletePost_asOwner_shouldSoftDelete() {
            // Arrange
            given(postRepository.findById(POST_ID)).willReturn(Optional.of(testPost));
            given(postRepository.save(any(Post.class))).willAnswer(invocation -> invocation.getArgument(0));

            // Act
            postService.deletePost(POST_ID, AUTHOR_ID);

            // Assert
            verify(postRepository).save(postCaptor.capture());
            Post savedPost = postCaptor.getValue();
            assertThat(savedPost.isDeleted()).isTrue();
            assertThat(savedPost.getId()).isEqualTo(POST_ID);
        }
    }
}
