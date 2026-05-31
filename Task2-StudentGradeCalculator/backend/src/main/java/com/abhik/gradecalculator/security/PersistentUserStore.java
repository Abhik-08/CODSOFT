package com.abhik.gradecalculator.security;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
public class PersistentUserStore {

    private static final Path STORAGE_FILE = Path.of("users.json");
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<String, UserDetails> userStore = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        loadUsers();
    }

    public boolean userExists(String email) {
        if (email == null) return false;
        return userStore.containsKey(email.trim().toLowerCase());
    }

    public void saveUser(String email, UserDetails user) {
        if (email == null) return;
        String normalizedEmail = email.trim().toLowerCase();
        userStore.put(normalizedEmail, user);
        persistUsers();
    }

    @SuppressWarnings("all")
    public UserDetails loadUserByUsername(String username) {
        if (username == null) {
            throw new org.springframework.security.core.userdetails.UsernameNotFoundException("Username/email cannot be null");
        }
        String normalizedUsername = username.trim().toLowerCase();
        UserDetails user = userStore.get(normalizedUsername);
        if (user == null) {
            throw new org.springframework.security.core.userdetails.UsernameNotFoundException("User not found with email: " + username);
        }
        return user;
    }

    private void loadUsers() {
        if (!Files.exists(STORAGE_FILE)) {
            log.info("No persisted user store found at {}. Starting with an empty user store.", STORAGE_FILE.toAbsolutePath());
            return;
        }

        try {
            List<StoredUser> storedUsers = objectMapper.readValue(Files.readString(STORAGE_FILE), new TypeReference<>() {});
            storedUsers.forEach(storedUser -> {
                if (storedUser.email() != null) {
                    String normalizedEmail = storedUser.email().trim().toLowerCase();
                    UserDetails user = User.builder()
                            .username(normalizedEmail)
                            .password(storedUser.password())
                            .roles(storedUser.roles().toArray(String[]::new))
                            .build();
                    userStore.put(normalizedEmail, user);
                }
            });
            log.info("Loaded {} persisted users from {}", storedUsers.size(), STORAGE_FILE.toAbsolutePath());
        } catch (IOException e) {
            log.error("Failed to load persisted users from {}", STORAGE_FILE.toAbsolutePath(), e);
        }
    }

    private void persistUsers() {
        try {
            List<StoredUser> storedUsers = userStore.values().stream()
                    .map(user -> new StoredUser(user.getUsername().trim().toLowerCase(), user.getPassword(), new ArrayList<>(user.getAuthorities().stream()
                            .map(grantedAuthority -> grantedAuthority.getAuthority().replace("ROLE_", ""))
                            .toList())))
                    .toList();
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(STORAGE_FILE.toFile(), storedUsers);
            log.info("Persisted {} users to {}", storedUsers.size(), STORAGE_FILE.toAbsolutePath());
        } catch (IOException e) {
            log.error("Failed to persist users to {}", STORAGE_FILE.toAbsolutePath(), e);
        }
    }

    private static final record StoredUser(String email, String password, List<String> roles) {
    }
}
