package com.abhik.gradecalculator.service;

import com.abhik.gradecalculator.model.AuthResponse;
import com.abhik.gradecalculator.model.LoginRequest;
import com.abhik.gradecalculator.model.RegisterRequest;
import com.abhik.gradecalculator.security.CustomUserDetailsService;
import com.abhik.gradecalculator.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final CustomUserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userDetailsService.userExists(request.getEmail())) {
            throw new IllegalArgumentException("User with this email already exists!");
        }

        UserDetails user = User.builder()
                .username(request.getEmail()) // Email is used as principal username in stateless JWT security
                .password(passwordEncoder.encode(request.getPassword()))
                .roles("USER") // Sets standard granted authorities
                .build();

        userDetailsService.saveUser(request.getEmail(), user);

        String jwtToken = jwtService.generateToken(user);
        return AuthResponse.builder()
                .token(jwtToken)
                .message("User registered successfully")
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        // Trigger Spring Security authentication
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        UserDetails user = userDetailsService.loadUserByUsername(request.getEmail());
        String jwtToken = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(jwtToken)
                .message("User logged in successfully")
                .build();
    }
}
