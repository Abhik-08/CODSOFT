package com.eduvault.api.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import java.util.*;
import java.util.stream.Collectors;

@Component
@Slf4j
public class ApplicationStartupListener {

    private final Environment environment;

    @Autowired(required = false)
    private RequestMappingHandlerMapping requestMappingHandlerMapping;

    public ApplicationStartupListener(Environment environment) {
        this.environment = environment;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void logApplicationStartup() {
        log.info("=============================================================================");
        log.info("                    EduVault API Startup Information");
        log.info("=============================================================================");
        
        // Application properties
        log.info("Application Name: {}", environment.getProperty("spring.application.name"));
        log.info("Active Profiles: {}", Arrays.toString(environment.getActiveProfiles()));
        
        // Server configuration
        String port = environment.getProperty("server.port", "8080");
        String contextPath = environment.getProperty("server.servlet.context-path", "/");
        log.info("Server Port: {}", port);
        log.info("Context Path: {}", contextPath);
        
        // Database configuration
        String dbUrl = environment.getProperty("spring.datasource.url");
        String dbDialect = environment.getProperty("spring.jpa.database-platform");
        String ddlAuto = environment.getProperty("spring.jpa.hibernate.ddl-auto");
        log.info("Database URL: {}", dbUrl);
        log.info("JPA Dialect: {}", dbDialect);
        log.info("DDL Strategy: {}", ddlAuto);
        
        // Important URLs
        log.info("");
        log.info("============= IMPORTANT URLS =============");
        log.info("Swagger UI:        http://localhost:{}{}/swagger-ui.html", port, contextPath);
        log.info("API Docs:          http://localhost:{}{}/v3/api-docs", port, contextPath);
        log.info("H2 Console:        http://localhost:{}{}/h2-console", port, contextPath);
        
        // Log all registered endpoints
        log.info("");
        log.info("============= REGISTERED ENDPOINTS =============");
        if (requestMappingHandlerMapping != null) {
            requestMappingHandlerMapping.getHandlerMethods().forEach((mapping, method) -> {
                String methodStr = mapping.getMethodsCondition().getMethods().isEmpty()
                    ? "ALL"
                    : mapping.getMethodsCondition().getMethods().stream()
                        .map(Enum::name)
                        .collect(Collectors.joining(", "));
                
                String path;
                if (mapping.getDirectPaths().isEmpty()) {
                    var pathPatterns = mapping.getPathPatternsCondition();
                    path = pathPatterns != null
                        ? pathPatterns.getPatterns().stream()
                            .map(Object::toString)
                            .collect(Collectors.joining(", "))
                        : "(no patterns)";
                } else {
                    path = mapping.getDirectPaths().stream()
                        .collect(Collectors.joining(", "));
                }
                
                log.info("  [{}] {}", methodStr, path);
            });
        }
        
        log.info("");
        log.info("============= SECURITY CONFIGURATION =============");
        log.info("Spring Security: ENABLED");
        log.info("JWT Authentication: ENABLED");
        log.info("CORS: ENABLED");
        log.info("CSRF: DISABLED (Stateless API)");
        log.info("Frame Options: DISABLED (H2 Console enabled)");
        
        log.info("");
        log.info("============= TEST CREDENTIALS =============");
        log.info("Default Admin User: admin / password123");
        log.info("Default Faculty User: faculty / password123");
        log.info("Default Student User: student / password123");
        
        log.info("");
        log.info("=============================================================================");
        log.info("                    Application Started Successfully");
        log.info("=============================================================================");
    }
}
