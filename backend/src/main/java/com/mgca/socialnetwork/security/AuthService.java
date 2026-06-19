package com.mgca.socialnetwork.security;

import com.mgca.socialnetwork.common.Role;
import com.mgca.socialnetwork.common.exception.DuplicateResourceException;
import com.mgca.socialnetwork.common.exception.ResourceNotFoundException;
import com.mgca.socialnetwork.common.exception.BadRequestException;
import com.mgca.socialnetwork.common.exception.ForbiddenException;
import com.mgca.socialnetwork.security.dto.AuthResponse;
import com.mgca.socialnetwork.security.dto.LoginRequest;
import com.mgca.socialnetwork.security.dto.RegisterRequest;
import com.mgca.socialnetwork.user.User;
import com.mgca.socialnetwork.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    /**
     * Registers a new user. Checks for duplicate emails, encodes the password,
     * persists the user, and returns a JWT-backed response.
     */
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        if (!email.endsWith("@mendoncagalvao.com.br")) {
            throw new BadRequestException("Only @mendoncagalvao.com.br emails are allowed");
        }
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException(
                    "An account with email '" + email + "' already exists");
        }

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim())
                .jobTitle(request.getJobTitle())
                .department(request.getDepartment())
                .role(Role.USER)
                .active(true)
                .skills(new ArrayList<>())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        user = userRepository.save(user);

        String token = jwtTokenProvider.generateToken(
                user.getId(), user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .user(mapToAuthUserDto(user))
                .build();
    }

    /**
     * Authenticates a user via Spring Security's AuthenticationManager,
     * then issues a JWT token.
     */
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        if (!email.endsWith("@mendoncagalvao.com.br")) {
            throw new ForbiddenException("Only @mendoncagalvao.com.br emails are allowed");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        String token = jwtTokenProvider.generateToken(
                user.getId(), user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .user(mapToAuthUserDto(user))
                .build();
    }

    public AuthResponse.AuthUserDto getMe(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return mapToAuthUserDto(user);
    }

    private AuthResponse.AuthUserDto mapToAuthUserDto(User user) {
        return AuthResponse.AuthUserDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .jobTitle(user.getJobTitle())
                .department(user.getDepartment())
                .avatarUrl(user.getAvatarUrl())
                .theme(user.getTheme())
                .build();
    }
}
