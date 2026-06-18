package com.mgca.socialnetwork.security;

import com.mgca.socialnetwork.common.Role;
import com.mgca.socialnetwork.common.exception.DuplicateResourceException;
import com.mgca.socialnetwork.common.exception.ResourceNotFoundException;
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
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException(
                    "An account with email '" + request.getEmail() + "' already exists");
        }

        User user = User.builder()
                .email(request.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim())
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
                .type("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }

    /**
     * Authenticates a user via Spring Security's AuthenticationManager,
     * then issues a JWT token.
     */
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().toLowerCase().trim(),
                        request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        String token = jwtTokenProvider.generateToken(
                user.getId(), user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }
}
