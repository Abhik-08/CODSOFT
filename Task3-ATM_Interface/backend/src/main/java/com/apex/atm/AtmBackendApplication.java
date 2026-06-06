package com.apex.atm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@SpringBootApplication
public class AtmBackendApplication {

    private static final Logger logger = LoggerFactory.getLogger(AtmBackendApplication.class);

    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(AtmBackendApplication.class, args);
    }

    private static void loadDotEnv() {
        File envFile = new File(".env");
        if (!envFile.exists()) {
            logger.warn("No .env file found at the root of the backend directory.");
            return;
        }

        logger.info("Loading environment variables from local .env file");
        try (BufferedReader reader = new BufferedReader(new FileReader(envFile))) {
            String line;
            while ((line = reader.readLine()) != null) {
                parseEnvLine(line);
            }
        } catch (Exception e) {
            logger.error("Failed to load .env file: {}", e.getMessage());
        }
    }

    private static void parseEnvLine(String line) {
        line = line.trim();
        if (line.isEmpty() || line.startsWith("#")) {
            return;
        }
        int eqIdx = line.indexOf('=');
        if (eqIdx <= 0) {
            return;
        }
        String key = line.substring(0, eqIdx).trim();
        String value = stripQuotes(line.substring(eqIdx + 1).trim());

        if (System.getProperty(key) == null && System.getenv(key) == null) {
            System.setProperty(key, value);
        }
    }

    private static String stripQuotes(String value) {
        if ((value.startsWith("\"") && value.endsWith("\"")) ||
                (value.startsWith("'") && value.endsWith("'"))) {
            return value.substring(1, value.length() - 1);
        }
        return value;
    }
}

