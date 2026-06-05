package com.apex.atm.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;

import java.io.FileInputStream;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    private static final Logger logger = LoggerFactory.getLogger(FirebaseConfig.class);

    @Value("${firebase.config-path:}")
    private String configPath;

    @Bean
    public FirebaseApp initializeFirebase() {
        if (!FirebaseApp.getApps().isEmpty()) {
            return FirebaseApp.getInstance();
        }

        try {
            FirebaseOptions options;
            Resource classpathResource = new ClassPathResource("firebase-service-account.json");

            if (configPath != null && !configPath.trim().isEmpty()) {
                logger.info("Initializing Firebase Admin SDK with service account from path: {}", configPath);
                try (InputStream serviceAccount = new FileInputStream(configPath)) {
                    options = FirebaseOptions.builder()
                            .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                            .build();
                }
            } else if (classpathResource.exists()) {
                logger.info("Initializing Firebase Admin SDK with service account from classpath: firebase-service-account.json");
                try (InputStream serviceAccount = classpathResource.getInputStream()) {
                    options = FirebaseOptions.builder()
                            .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                            .build();
                }
            } else {
                logger.warn("No custom firebase.config-path or classpath:firebase-service-account.json found. Attempting to load Google Application Default Credentials.");
                options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.getApplicationDefault())
                        .build();
            }
            return FirebaseApp.initializeApp(options);
        } catch (Exception e) {
            logger.error("WARNING: Firebase Admin SDK failed to initialize. "
                    + "Please ensure you configure valid credentials in application.yml or environment. Error: {}", e.getMessage());
            return null;
        }
    }
}
