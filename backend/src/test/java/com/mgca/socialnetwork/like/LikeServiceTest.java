package com.mgca.socialnetwork.like;

import com.mgca.socialnetwork.dto.LikeResponse;
import com.mgca.socialnetwork.exception.DuplicateResourceException;
import com.mgca.socialnetwork.exception.ResourceNotFoundException;
import com.mgca.socialnetwork.model.Like;
import com.mgca.socialnetwork.model.Post;
import com.mgca.socialnetwork.model.User;
import com.mgca.socialnetwork.model.enums.ModerationStatus;
import com.mgca.socialnetwork.model.enums.Role;
import com.mgca.socialnetwork.model.enums.Visibility;
import com.mgca.socialnetwork.repository.LikeRepository;
import com.mgca.socialnetwork.repository.PostRepository;
import com.mgca.socialnetwork.repository.UserRepository;
import com.mgca.socialnetwork.service.LikeService;
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
 * Unit tests for {@link LikeService}.
 * <p>
 * Tests cover liking a post (first time and duplicate), and unliking
 * (existing like and non-existing like).
 * </p>
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("LikeService")
class LikeServiceTest {

    @Mock
    private LikeRepository likeRepository;

    @Mock
    private PostRepository postRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private MongoTemplate mongoTemplate;

    @InjectMocks
    private LikeService likeService;

    @Captor
    private ArgumentCaptor<Like> likeCaptor;

    private User testUser;
    private Post testPost;

    private static final String USER_ID = "665a1b2c3d4e5f6a7b8c9d0e";
    private static final String POST_ID = "665b2c3d4e5f6a7b8c9d1a2b";
    private static final String LIKE_ID = "665c3d4e5f6a7b8c9d2b3c4d";

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(USER_ID)
                .fullName("Pedro Santos")
                .email("pedro.santos@mgca.com.br")
                .department("TI")
                .role(Role.USER)
                .active(true)
                .build();

        testPost = Post.builder()
                .id(POST_ID)
                .authorId("authorId123")
                .content("Post interessante sobre compliance fiscal.")
                .visibility(Visibility.PUBLIC)
                .moderationStatus(ModerationStatus.APPROVED)
                .likeCount(10)
                .commentCount(3)
                .deleted(false)
                .createdAt(Instant.parse("2025-06-10T09:00:00Z"))
                .build();
    }

    @Nested
    @DisplayName("Like Post")
    class LikePost {

        @Test
        @DisplayName("should succeed when user likes for the first time")
        void likePost_firstTime_shouldSucceed() {
            // Arrange
            given(postRepository.findById(POST_ID)).willReturn(Optional.of(testPost));
            given(userRepository.findById(USER_ID)).willReturn(Optional.of(testUser));
            given(likeRepository.existsByPostIdAndUserId(POST_ID, USER_ID)).willReturn(false);

            Like savedLike = Like.builder()
                    .id(LIKE_ID)
                    .postId(POST_ID)
                    .userId(USER_ID)
                    .createdAt(Instant.now())
                    .build();

            given(likeRepository.save(any(Like.class))).willReturn(savedLike);

            // Act
            LikeResponse response = likeService.likePost(POST_ID, USER_ID);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getPostId()).isEqualTo(POST_ID);
            assertThat(response.getUserId()).isEqualTo(USER_ID);

            // Verify the like was saved
            verify(likeRepository).save(likeCaptor.capture());
            Like capturedLike = likeCaptor.getValue();
            assertThat(capturedLike.getPostId()).isEqualTo(POST_ID);
            assertThat(capturedLike.getUserId()).isEqualTo(USER_ID);

            // Verify the post's likeCount was incremented
            verify(mongoTemplate).updateFirst(any(Query.class), any(Update.class), eq(Post.class));
        }

        @Test
        @DisplayName("should throw DuplicateResourceException when user already liked the post")
        void likePost_duplicate_shouldThrowDuplicateResourceException() {
            // Arrange
            given(postRepository.findById(POST_ID)).willReturn(Optional.of(testPost));
            given(likeRepository.existsByPostIdAndUserId(POST_ID, USER_ID)).willReturn(true);

            // Act & Assert
            assertThatThrownBy(() -> likeService.likePost(POST_ID, USER_ID))
                    .isInstanceOf(DuplicateResourceException.class);
        }
    }

    @Nested
    @DisplayName("Unlike Post")
    class UnlikePost {

        @Test
        @DisplayName("should succeed when the like exists")
        void unlikePost_existingLike_shouldSucceed() {
            // Arrange
            Like existingLike = Like.builder()
                    .id(LIKE_ID)
                    .postId(POST_ID)
                    .userId(USER_ID)
                    .createdAt(Instant.now())
                    .build();

            given(likeRepository.findByPostIdAndUserId(POST_ID, USER_ID))
                    .willReturn(Optional.of(existingLike));

            // Act
            likeService.unlikePost(POST_ID, USER_ID);

            // Assert
            verify(likeRepository).delete(existingLike);
            verify(mongoTemplate).updateFirst(any(Query.class), any(Update.class), eq(Post.class));
        }

        @Test
        @DisplayName("should throw ResourceNotFoundException when the like does not exist")
        void unlikePost_nonExistingLike_shouldThrowResourceNotFoundException() {
            // Arrange
            given(likeRepository.findByPostIdAndUserId(POST_ID, USER_ID))
                    .willReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> likeService.unlikePost(POST_ID, USER_ID))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }
}
