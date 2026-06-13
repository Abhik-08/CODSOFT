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
    private static final String VAL_STRING = "stringValue";
    private static final String FIELD_EMAIL = "email";
    private static final String FIELD_DISPLAY_NAME = "displayName";
    private static final String ROLE_PREFIX = "ROLE_";
    private static final String DEFAULT_ROLE = "ROLE_STUDENT";

    private final UserRepository userRepository;

    @Autowired
    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    private String extractUid(String token) {
        try {
            String rawToken = token.startsWith("Bearer ") ? token.substring(7) : token;
            String[] parts = rawToken.split("\\.");
            if (parts.length != 3) return null;
            
            String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]), java.nio.charset.StandardCharsets.UTF_8);
            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> payload = mapper.readValue(payloadJson, new TypeReference<Map<String, Object>>() {});
            return (String) payload.get("sub");
        } catch (Exception e) {
            return null;
        }
    }

    private JsonNode fetchFieldsNode(String uid, String token) {
        try {
            String url = "https://firestore.googleapis.com/v1/projects/eduvault-ai/databases/(default)/documents/users/" + uid;
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", token.startsWith("Bearer ") ? token : "Bearer " + token);
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                ObjectMapper mapper = new ObjectMapper();
                JsonNode root = mapper.readTree(response.getBody());
                return root.get("fields");
            }
        } catch (Exception e) {
            log.warn("Failed to fetch user fields from Firestore: {}", e.getMessage());
        }
        return null;
    }

    private String getFieldValue(JsonNode fields, String fieldName, String defaultValue) {
        if (fields != null && fields.has(fieldName) && fields.get(fieldName).has(VAL_STRING)) {
            return fields.get(fieldName).get(VAL_STRING).asText();
        }
        return defaultValue;
    }

    private void saveOrUpdateUser(String username, JsonNode fields) {
        String email = getFieldValue(fields, FIELD_EMAIL, username);
        String roleStr = getFieldValue(fields, "role", "STUDENT");
        String displayName = getFieldValue(fields, FIELD_DISPLAY_NAME, username);
        
        String formattedRole = roleStr.toUpperCase().startsWith(ROLE_PREFIX) 
                ? roleStr.toUpperCase() 
                : ROLE_PREFIX + roleStr.toUpperCase();
        
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

    private void syncUserWithFirestore(String username) {
        String token = SecurityUtils.getCurrentBearerToken();
        if (token == null) return;
        
        String uid = extractUid(token);
        if (uid == null) return;
        
        JsonNode fields = fetchFieldsNode(uid, token);
        if (fields != null) {
            saveOrUpdateUser(username, fields);
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
            
            String role = DEFAULT_ROLE;
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
            role = DEFAULT_ROLE;
        }
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority(role.startsWith(ROLE_PREFIX) ? role : ROLE_PREFIX + role);

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                List.of(authority)
        );
    }
}
