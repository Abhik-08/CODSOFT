package com.eduvault.api.service;

import com.eduvault.api.model.User;
import com.eduvault.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@SuppressWarnings("null")
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Autowired
    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty() && username.contains("@")) {
            userOpt = userRepository.findByEmail(username);
        }
        
        if (userOpt.isEmpty()) {
            // Auto-provision user if it looks like an email or Firebase login
            String email = username.contains("@") ? username : username + "@eduvault.com";
            String actualUsername = username.contains("@") ? username.substring(0, username.indexOf("@")) : username;
            
            String role = "ROLE_STUDENT";
            if (actualUsername.equalsIgnoreCase("admin") || email.startsWith("admin@") || email.equalsIgnoreCase("abhikmukherjee2003@gmail.com")) {
                role = "ROLE_ADMIN";
            } else if (actualUsername.equalsIgnoreCase("faculty") || email.startsWith("faculty@")) {
                role = "ROLE_FACULTY";
            }
            
            User newUser = User.builder()
                    .username(actualUsername)
                    .email(email)
                    .password("") // empty password for oauth
                    .fullName(actualUsername)
                    .role(role)
                    .build();
            userRepository.save(newUser);
            userOpt = Optional.of(newUser);
        }

        User user = userOpt.get();
        String role = user.getRole();
        if ("ROLE_USER".equalsIgnoreCase(role)) {
            role = "ROLE_STUDENT";
        }
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority(role.startsWith("ROLE_") ? role : "ROLE_" + role);

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                List.of(authority)
        );
    }
}
