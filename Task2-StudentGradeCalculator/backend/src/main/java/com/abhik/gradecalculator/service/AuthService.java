package com.abhik.gradecalculator.service;

import com.abhik.gradecalculator.model.AuthResponse;
import com.abhik.gradecalculator.model.LoginRequest;
import com.abhik.gradecalculator.model.RegisterRequest;
import com.abhik.gradecalculator.security.CustomUserDetailsService;
import com.abhik.gradecalculator.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final CustomUserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        log.info("[AUTH] Register attempt for email: {}", normalizedEmail);

        if (userDetailsService.userExists(normalizedEmail)) {
            log.warn("[AUTH] Registration failed: Email already exists: {}", normalizedEmail);
            throw new IllegalArgumentException("User with this email already exists!");
        }

        UserDetails user = User.builder()
                .username(normalizedEmail) // Email is used as principal username in stateless JWT security
                .password(passwordEncoder.encode(request.getPassword()))
                .roles("USER") // Sets standard granted authorities
                .build();

        userDetailsService.saveUser(normalizedEmail, user);
        log.info("[AUTH] User registered successfully and persisted: {}", normalizedEmail);

        String jwtToken = jwtService.generateToken(user);
        return AuthResponse.builder()
                .token(jwtToken)
                .message("User registered successfully")
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        log.info("[AUTH] Login attempt for email: {}", normalizedEmail);

        try {
            // Trigger Spring Security authentication
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            normalizedEmail,
                            request.getPassword()
                    )
            );
            log.info("[AUTH] Spring Security authentication successful for email: {}", normalizedEmail);
        } catch (org.springframework.security.core.AuthenticationException e) {
            log.error("[AUTH] Spring Security authentication failed for email: {}. Exception: {}", normalizedEmail, e.getMessage());
            throw e;
        }

        UserDetails user = userDetailsService.loadUserByUsername(normalizedEmail);
        String jwtToken = jwtService.generateToken(user);
        log.info("[AUTH] JWT token generated successfully for email: {}", normalizedEmail);

        return AuthResponse.builder()
                .token(jwtToken)
                .message("Welcome " + (user.getUsername().split("@")[0]))
                .build();
    }
}
