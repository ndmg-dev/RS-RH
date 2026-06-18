package com.mgca.socialnetwork.security;

import com.mgca.socialnetwork.dto.AuthResponse;
import com.mgca.socialnetwork.dto.LoginRequest;
import com.mgca.socialnetwork.dto.RegisterRequest;
import com.mgca.socialnetwork.exception.DuplicateResourceException;
import com.mgca.socialnetwork.model.User;
import com.mgca.socialnetwork.model.enums.Role;
import com.mgca.socialnetwork.repository.UserRepository;
import com.mgca.socialnetwork.service.AuthService;
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
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

/**
 * Unit tests for {@link AuthService}.
 * <p>
 * All external dependencies are mocked. Tests verify the service's
 * business logic for registration and login.
 * </p>
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    @Captor
    private ArgumentCaptor<User> userCaptor;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        registerRequest = RegisterRequest.builder()
                .fullName("Maria Silva")
                .email("maria.silva@mgca.com.br")
                .password("Secure@Pass123")
                .department("Contabilidade")
                .jobTitle("Contadora Sênior")
                .build();

        loginRequest = LoginRequest.builder()
                .email("maria.silva@mgca.com.br")
                .password("Secure@Pass123")
                .build();
    }

    @Nested
    @DisplayName("Registration")
    class Registration {

        @Test
        @DisplayName("should succeed when email is new")
        void register_withNewEmail_shouldSucceed() {
            // Arrange
            given(userRepository.existsByEmail(registerRequest.getEmail())).willReturn(false);
            given(passwordEncoder.encode(registerRequest.getPassword())).willReturn("$2a$10$encodedPassword");

            User savedUser = User.builder()
                    .id("665a1b2c3d4e5f6a7b8c9d0e")
                    .fullName(registerRequest.getFullName())
                    .email(registerRequest.getEmail())
                    .passwordHash("$2a$10$encodedPassword")
                    .department(registerRequest.getDepartment())
                    .jobTitle(registerRequest.getJobTitle())
                    .role(Role.USER)
                    .active(true)
                    .build();

            given(userRepository.save(any(User.class))).willReturn(savedUser);
            given(jwtTokenProvider.generateToken(savedUser.getId())).willReturn("jwt.token.here");

            // Act
            AuthResponse response = authService.register(registerRequest);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getToken()).isEqualTo("jwt.token.here");

            // Verify the user was saved with the encoded password
            verify(userRepository).save(userCaptor.capture());
            User capturedUser = userCaptor.getValue();
            assertThat(capturedUser.getPasswordHash()).isEqualTo("$2a$10$encodedPassword");
            assertThat(capturedUser.getFullName()).isEqualTo("Maria Silva");
            assertThat(capturedUser.getEmail()).isEqualTo("maria.silva@mgca.com.br");
            assertThat(capturedUser.getRole()).isEqualTo(Role.USER);
            assertThat(capturedUser.isActive()).isTrue();
        }

        @Test
        @DisplayName("should throw DuplicateResourceException when email already exists")
        void register_withExistingEmail_shouldThrowDuplicateResourceException() {
            // Arrange
            given(userRepository.existsByEmail(registerRequest.getEmail())).willReturn(true);

            // Act & Assert
            assertThatThrownBy(() -> authService.register(registerRequest))
                    .isInstanceOf(DuplicateResourceException.class)
                    .hasMessageContaining("email");

            // Verify no user was saved
            verify(userRepository, never()).save(any(User.class));
            verify(jwtTokenProvider, never()).generateToken(anyString());
        }
    }

    @Nested
    @DisplayName("Login")
    class Login {

        @Test
        @DisplayName("should return token with valid credentials")
        void login_withValidCredentials_shouldReturnToken() {
            // Arrange
            Authentication authentication = mock(Authentication.class);
            UserPrincipal userPrincipal = UserPrincipal.builder()
                    .id("665a1b2c3d4e5f6a7b8c9d0e")
                    .email("maria.silva@mgca.com.br")
                    .password("encoded")
                    .build();

            given(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                    .willReturn(authentication);
            given(authentication.getPrincipal()).willReturn(userPrincipal);
            given(jwtTokenProvider.generateToken(userPrincipal.getId())).willReturn("jwt.login.token");

            // Act
            AuthResponse response = authService.login(loginRequest);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.getToken()).isEqualTo("jwt.login.token");

            verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
            verify(jwtTokenProvider).generateToken(userPrincipal.getId());
        }
    }
}
