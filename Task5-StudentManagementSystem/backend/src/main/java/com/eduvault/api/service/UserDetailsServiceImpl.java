package com.eduvault.api.service;

import com.eduvault.api.model.User;
import com.eduvault.api.repository.UserRepository;
import com.eduvault.api.config.SecurityUtils;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@SuppressWarnings("null")
public class UserDetailsServiceImpl implements UserDetailsService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(UserDetailsServiceImpl.class);
    private final UserRepository userRepository;

    @Autowired
    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    private void syncUserWithFirestore(String username) {
        String token = SecurityUtils.getCurrentBearerToken();
        if (token == null) return;
        
        try {
            String rawToken = token.startsWith("Bearer ") ? token.substring(7) : token;
            String[] parts = rawToken.split("\\.");
            if (parts.length != 3) return;
            
            String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]), java.nio.charset.StandardCharsets.UTF_8);
            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> payload = mapper.readValue(payloadJson, new TypeReference<Map<String, Object>>() {});
            
            String uid = (String) payload.get("sub");
            if (uid == null) return;
            
            String url = "https://firestore.googleapis.com/v1/projects/eduvault-ai/databases/(default)/documents/users/" + uid;
            
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + rawToken);
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = mapper.readTree(response.getBody());
                JsonNode fields = root.get("fields");
                if (fields != null) {
                    String email = fields.has("email") && fields.get("email").has("stringValue") 
                            ? fields.get("email").get("stringValue").asText() : username;
                    String roleStr = fields.has("role") && fields.get("role").has("stringValue") 
                            ? fields.get("role").get("stringValue").asText() : "STUDENT";
                    String displayName = fields.has("displayName") && fields.get("displayName").has("stringValue") 
                            ? fields.get("displayName").get("stringValue").asText() : username;
                    
                    String formattedRole = roleStr.toUpperCase().startsWith("ROLE_") ? roleStr.toUpperCase() : "ROLE_" + roleStr.toUpperCase();
                    
                    Optional<User> userOpt = userRepository.findByUsername(username);
                    if (userOpt.isEmpty() && username.contains("@")) {
                        userOpt = userRepository.findByEmail(username);
                    }
                    
                    if (userOpt.isPresent()) {
                        User user = userOpt.get();
                        user.setRole(formattedRole);
                        user.setEmail(email);
                        user.setFullName(displayName);
                        userRepository.save(user);
                    } else {
                        User newUser = User.builder()
                                .username(username.contains("@") ? username.substring(0, username.indexOf("@")) : username)
                                .email(email)
                                .password("")
                                .fullName(displayName)
                                .role(formattedRole)
                                .build();
                        userRepository.save(newUser);
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed to sync user role from Firestore: {}", e.getMessage());
        }
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        syncUserWithFirestore(username);

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
