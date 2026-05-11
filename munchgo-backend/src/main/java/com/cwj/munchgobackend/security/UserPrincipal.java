package com.cwj.munchgobackend.security;

import com.cwj.munchgobackend.model.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

/**
 * Custom UserDetails implementation representing the authenticated user principal.
 * Contains user identity information used throughout the application.
 */
@Getter
@Builder
@AllArgsConstructor
public class UserPrincipal implements UserDetails {

    private final Long id;
    private final String username;
    private final String email;
    private final String password;
    private final UserRole role;
    private final String avatarUrl;
    private final String phone;

    /**
     * Creates a UserPrincipal from an entity with encoded password.
     *
     * @param user the user entity
     * @param encodedPassword the encoded password
     * @return a new UserPrincipal instance
     */
    public static UserPrincipal fromUser(Object user, String encodedPassword) {
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null");
        }
        
        // Use reflection to get fields if needed, or overload this method
        // This is a placeholder that will be customized based on actual User entity
        return UserPrincipal.builder()
                .username("")
                .email("")
                .password(encodedPassword)
                .role(UserRole.CUSTOMER)
                .build();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
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
