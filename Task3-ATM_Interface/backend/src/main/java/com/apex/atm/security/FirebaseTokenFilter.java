package com.apex.atm.security;

import com.apex.atm.service.FirebaseAdminService;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

public class FirebaseTokenFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(FirebaseTokenFilter.class);
    private final FirebaseAdminService firebaseAdminService;

    public FirebaseTokenFilter(FirebaseAdminService firebaseAdminService) {
        this.firebaseAdminService = firebaseAdminService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(7).trim();
        if (token.isEmpty()) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // Mock authentication bypass for development/testing
            if (token.startsWith("mock-")) {
                log.info("Processing development Mock Token bypass for principal: {}", token);
                String mockUid = token.substring(5);
                FirebaseAuthenticationToken mockAuth = new FirebaseAuthenticationToken(
                        mockUid,
                        token,
                        List.of(new SimpleGrantedAuthority("ROLE_USER"))
                );
                SecurityContextHolder.getContext().setAuthentication(mockAuth);
                filterChain.doFilter(request, response);
                return;
            }

            FirebaseAuthenticationToken auth = authenticateFirebaseToken(token);
            SecurityContextHolder.getContext().setAuthentication(auth);

        } catch (Exception e) {
            log.error("Failed to verify Firebase ID token: {}", e.getMessage());
            SecurityContextHolder.clearContext();
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Invalid authorization credentials: " + e.getMessage());
            return;
        }

        filterChain.doFilter(request, response);
    }

    private FirebaseAuthenticationToken authenticateFirebaseToken(String token) throws FirebaseAuthException {
        String uid;
        Object principal;
        try {
            // Verify Firebase ID Token via delegated FirebaseAdminService
            FirebaseToken decodedToken = firebaseAdminService.verifyToken(token);
            uid = decodedToken.getUid();
            principal = decodedToken;
        } catch (FirebaseAuthException | RuntimeException e) {
            if (e instanceof IllegalStateException || (e.getMessage() != null && e.getMessage().contains("not initialized"))) {
                log.warn("Firebase Admin SDK is not initialized. Decoding JWT payload (UNVERIFIED) for development bypass: {}", e.getMessage());
                uid = getUidFromUnverifiedToken(token);
                if (uid == null) {
                    throw e;
                }
                principal = uid;
            } else {
                throw e;
            }
        }

        return new FirebaseAuthenticationToken(
                uid,
                principal,
                List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );
    }

    private String getUidFromUnverifiedToken(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length >= 2) {
                String payloadJson = new String(java.util.Base64.getUrlDecoder().decode(parts[1]));
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                com.fasterxml.jackson.databind.JsonNode node = mapper.readTree(payloadJson);
                if (node.has("user_id")) {
                    return node.get("user_id").asText();
                } else if (node.has("sub")) {
                    return node.get("sub").asText();
                }
            }
        } catch (Exception e) {
            log.error("Failed to decode unverified JWT token: {}", e.getMessage());
        }
        return null;
    }
}
