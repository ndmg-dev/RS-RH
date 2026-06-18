package com.mgca.socialnetwork.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for {@link JwtTokenProvider}.
 * <p>
 * Tests cover token generation, userId extraction, and validation
 * under various conditions (valid, invalid, expired).
 * </p>
 */
@DisplayName("JwtTokenProvider")
class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;

    // Test constants
    private static final String TEST_SECRET = "dGhpc0lzQVZlcnlMb25nU2VjcmV0S2V5Rm9yVGVzdGluZ1B1cnBvc2VzT25seURvTm90VXNlSW5Qcm9kdWN0aW9uMTIzNDU2Nzg5MA==";
    private static final long TEST_EXPIRATION_MS = 3600000L; // 1 hour
    private static final String TEST_USER_ID = "665a1b2c3d4e5f6a7b8c9d0e";

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret", TEST_SECRET);
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpirationMs", TEST_EXPIRATION_MS);
    }

    @Nested
    @DisplayName("Token Generation")
    class TokenGeneration {

        @Test
        @DisplayName("should return a non-null, non-empty token")
        void generateToken_shouldReturnValidToken() {
            // Act
            String token = jwtTokenProvider.generateToken(TEST_USER_ID);

            // Assert
            assertThat(token).isNotNull();
            assertThat(token).isNotEmpty();
            assertThat(token.split("\\.")).hasSize(3); // JWT has 3 parts: header.payload.signature
        }

        @Test
        @DisplayName("should generate different tokens for different user IDs")
        void generateToken_differentUsers_shouldReturnDifferentTokens() {
            // Act
            String token1 = jwtTokenProvider.generateToken("user1");
            String token2 = jwtTokenProvider.generateToken("user2");

            // Assert
            assertThat(token1).isNotEqualTo(token2);
        }
    }

    @Nested
    @DisplayName("UserId Extraction")
    class UserIdExtraction {

        @Test
        @DisplayName("should return the correct userId from a valid token")
        void getUserIdFromToken_shouldReturnCorrectUserId() {
            // Arrange
            String token = jwtTokenProvider.generateToken(TEST_USER_ID);

            // Act
            String extractedUserId = jwtTokenProvider.getUserIdFromToken(token);

            // Assert
            assertThat(extractedUserId).isEqualTo(TEST_USER_ID);
        }

        @Test
        @DisplayName("should handle special characters in userId")
        void getUserIdFromToken_withSpecialChars_shouldReturnCorrectUserId() {
            // Arrange
            String specialId = "user-with-special_chars.123";
            String token = jwtTokenProvider.generateToken(specialId);

            // Act
            String extractedUserId = jwtTokenProvider.getUserIdFromToken(token);

            // Assert
            assertThat(extractedUserId).isEqualTo(specialId);
        }
    }

    @Nested
    @DisplayName("Token Validation")
    class TokenValidation {

        @Test
        @DisplayName("should return true for a valid token")
        void validateToken_withValidToken_shouldReturnTrue() {
            // Arrange
            String token = jwtTokenProvider.generateToken(TEST_USER_ID);

            // Act
            boolean isValid = jwtTokenProvider.validateToken(token);

            // Assert
            assertThat(isValid).isTrue();
        }

        @Test
        @DisplayName("should return false for an invalid token")
        void validateToken_withInvalidToken_shouldReturnFalse() {
            // Act
            boolean isValid = jwtTokenProvider.validateToken("this.is.not.a.valid.jwt.token");

            // Assert
            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("should return false for a null token")
        void validateToken_withNullToken_shouldReturnFalse() {
            // Act
            boolean isValid = jwtTokenProvider.validateToken(null);

            // Assert
            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("should return false for an empty token")
        void validateToken_withEmptyToken_shouldReturnFalse() {
            // Act
            boolean isValid = jwtTokenProvider.validateToken("");

            // Assert
            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("should return false for a tampered token")
        void validateToken_withTamperedToken_shouldReturnFalse() {
            // Arrange
            String token = jwtTokenProvider.generateToken(TEST_USER_ID);
            String tamperedToken = token.substring(0, token.length() - 5) + "XXXXX";

            // Act
            boolean isValid = jwtTokenProvider.validateToken(tamperedToken);

            // Assert
            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("should return false for an expired token")
        void validateToken_withExpiredToken_shouldReturnFalse() throws InterruptedException {
            // Arrange: create a provider with a very short expiry (1 ms)
            JwtTokenProvider shortLivedProvider = new JwtTokenProvider();
            ReflectionTestUtils.setField(shortLivedProvider, "jwtSecret", TEST_SECRET);
            ReflectionTestUtils.setField(shortLivedProvider, "jwtExpirationMs", 1L);

            String token = shortLivedProvider.generateToken(TEST_USER_ID);

            // Wait to ensure the token expires
            Thread.sleep(50);

            // Act
            boolean isValid = shortLivedProvider.validateToken(token);

            // Assert
            assertThat(isValid).isFalse();
        }
    }
}
