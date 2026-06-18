package com.mgca.socialnetwork.security;

import com.mgca.socialnetwork.common.Role;
import com.mgca.socialnetwork.user.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Spring Security {@link UserDetails} implementation that wraps our
 * application's {@link User} domain model.
 */
@Getter
@Builder
@AllArgsConstructor
public class UserPrincipal implements UserDetails {

    private final String id;
    private final String email;
    private final String password;
    private final Collection<? extends GrantedAuthority> authorities;

    /**
     * Creates a {@link UserPrincipal} from a {@link User} domain object.
     *
     * @param user the domain user
     * @return a fully populated UserPrincipal
     */
    public static UserPrincipal fromUser(User user) {
        List<GrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
        );

        return UserPrincipal.builder()
                .id(user.getId())
                .email(user.getEmail())
                .password(user.getPasswordHash())
                .authorities(authorities)
                .build();
    }

    /**
     * Creates a {@link UserPrincipal} from JWT claims (no DB lookup required).
     *
     * @param userId the user ID extracted from the JWT subject
     * @param email  the email extracted from JWT claims
     * @param role   the role name extracted from JWT claims
     * @return a UserPrincipal suitable for SecurityContext
     */
    public static UserPrincipal fromJwtClaims(String userId, String email, String role) {
        List<GrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority("ROLE_" + role)
        );

        return UserPrincipal.builder()
                .id(userId)
                .email(email)
                .password("")
                .authorities(authorities)
                .build();
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
