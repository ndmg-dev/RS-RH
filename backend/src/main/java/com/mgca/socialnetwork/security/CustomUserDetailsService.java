package com.mgca.socialnetwork.security;

import com.mgca.socialnetwork.user.User;
import com.mgca.socialnetwork.user.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Custom implementation of {@link UserDetailsService} that loads users
 * from MongoDB by email address for Spring Security authentication.
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Loads a user by their email address.
     *
     * @param email the email address to look up
     * @return a fully populated {@link UserDetails} instance
     * @throws UsernameNotFoundException if no active user is found with the given email
     */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .filter(User::isActive)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "User not found or inactive with email: " + email));

        return UserPrincipal.fromUser(user);
    }
}
