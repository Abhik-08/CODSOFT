package com.eduvault.api.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@SuppressWarnings("null")
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(JwtAuthFilter.class);
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtAuthFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    private void debugLog(String message) {
        log.info("[AUTH_DEBUG] {}", message);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;

        debugLog("Request URI: " + request.getRequestURI() + " Method: " + request.getMethod());
        debugLog("Auth Header: " + (authHeader == null ? "NULL" : authHeader.substring(0, Math.min(20, authHeader.length())) + "..."));

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            debugLog("Skipping auth filter - no bearer token");
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);
        username = jwtService.extractUsername(jwt);
        debugLog("Extracted Username from JWT: " + username);

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
                debugLog("Loaded UserDetails. Username: " + userDetails.getUsername() + " Authorities: " + userDetails.getAuthorities());

                boolean valid = jwtService.validateToken(jwt, userDetails.getUsername());
                debugLog("validateToken result: " + valid);

                if (valid) {
                    String role = jwtService.extractRole(jwt);
                    SimpleGrantedAuthority authority = new SimpleGrantedAuthority(role.startsWith("ROLE_") ? role : "ROLE_" + role);
                    debugLog("Setting security authentication with role: " + authority.getAuthority());
                    
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            List.of(authority)
                    );
                    
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                } else {
                    debugLog("Token is INVALID for username " + userDetails.getUsername());
                }
            } catch (Exception e) {
                debugLog("Exception in JwtAuthFilter user loading/validating: " + e.getMessage());
            }
        } else {
            debugLog("Username is null or already authenticated. Username: " + username + ", Auth: " + SecurityContextHolder.getContext().getAuthentication());
        }
        filterChain.doFilter(request, response);
    }
}
