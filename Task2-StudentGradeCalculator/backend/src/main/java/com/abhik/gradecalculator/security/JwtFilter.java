package com.abhik.gradecalculator.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        
        // DEBUG LOG: Authorization header received
        logger.info("[JWT-DEBUG] Authorization header received: " + (authHeader != null ? authHeader : "NULL"));
        
        final String jwt;
        final String userEmail;

        // Robust case-insensitive check for Bearer scheme
        if (authHeader == null || !authHeader.regionMatches(true, 0, "Bearer ", 0, 7)) {
            logger.info("[JWT-DEBUG] Missing or invalid Bearer prefix. Skipping JWT authentication filter.");
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);
        
        try {
            userEmail = jwtService.extractUsername(jwt);
            
            // DEBUG LOG: Extracted username
            logger.info("[JWT-DEBUG] Extracted username from token: " + userEmail);

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
                boolean isValid = jwtService.isTokenValid(jwt, userDetails);
                
                // DEBUG LOG: Token validation result
                logger.info("[JWT-DEBUG] Token validation result for " + userEmail + ": " + isValid);

                if (isValid) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    
                    // DEBUG LOG: Whether SecurityContext authentication was set
                    logger.info("[JWT-DEBUG] SecurityContext authentication successfully set for: " + userEmail);
                } else {
                    logger.info("[JWT-DEBUG] Token is invalid. SecurityContext authentication NOT set.");
                }
            } else if (userEmail != null) {
                var auth = SecurityContextHolder.getContext().getAuthentication();
                String authClassName = auth != null ? auth.getClass().getSimpleName() : "NULL";
                logger.info("[JWT-DEBUG] SecurityContext already contains authentication: " 
                        + authClassName 
                        + ". Skipping authentication set.");
            }
        } catch (Exception e) {
            logger.info("[JWT-DEBUG] Exception during JWT filter execution: " + e.getMessage());
            logger.warn("JWT authentication attempt failed: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
