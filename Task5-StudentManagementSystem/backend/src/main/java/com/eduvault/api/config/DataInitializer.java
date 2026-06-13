package com.eduvault.api.config;

import com.eduvault.api.model.*;
import com.eduvault.api.repository.*;
import com.eduvault.api.service.RiskDetectionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Component
@Slf4j
public class DataInitializer {

    private static final String ROLE_STUDENT = "ROLE_STUDENT";
    private static final String STATUS_ACTIVE = "ACTIVE";
    /**
     * Property key for the seed password used during data initialisation.
     * Set {@code app.default-password} in application.properties or the
     * {@code APP_DEFAULT_PASSWORD} environment variable before running in
     * any environment that requires real users.
     */
    private static final String DEFAULT_PASSWORD_PROP = "app.default-password";
    private static final String FALLBACK_PASSWORD = "EduVaultSecurePasswordTemp123!";

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final Environment env;
    private final RiskDetectionService riskDetectionService;

    public DataInitializer(UserRepository userRepository, StudentRepository studentRepository,
                          PasswordEncoder passwordEncoder, Environment env,
                          @org.springframework.context.annotation.Lazy RiskDetectionService riskDetectionService) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.env = env;
        this.riskDetectionService = riskDetectionService;
    }

    private String resolveDefaultPassword() {
        String pw = env.getProperty(DEFAULT_PASSWORD_PROP);
        if (pw == null || pw.isBlank()) {
            log.warn("app.default-password is not configured – seed users will have an unusable password placeholder.");
            return FALLBACK_PASSWORD;
        }
        return pw;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void initializeData() {
        log.info("Initializing database with test data...");
        
        // Initialize users only if database is empty
        if (userRepository.count() == 0) {
            initializeUsers();
            log.info("✓ Test users initialized");
        }
        
        // Initialize students only if database is empty
        if (studentRepository.count() == 0) {
            initializeStudents();
            log.info("✓ Test students initialized");
        }

        // Trigger automatic recalculation of all student risk scores using new thresholds on startup
        try {
            log.info("Recalculating risk scores for all students using new thresholds...");
            List<Student> allStudents = studentRepository.findAll();
            for (Student s : allStudents) {
                if (s.getFirestoreId() != null && !s.getFirestoreId().isBlank()) {
                    riskDetectionService.recalculate(s.getFirestoreId());
                } else if (s.getId() != null) {
                    riskDetectionService.recalculate(s.getId().toString());
                }
            }
            log.info("✓ All student risk scores recalculated successfully!");
        } catch (Exception e) {
            log.error("Failed to recalculate student risk scores on startup: {}", e.getMessage());
        }
        
        log.info("Database initialization complete!");
    }

    @SuppressWarnings("null")
    private void initializeUsers() {
        String encodedPassword = passwordEncoder.encode(resolveDefaultPassword());
        List<User> users = Arrays.asList(
            User.builder()
                .username("admin")
                .email("admin@eduvault.com")
                .password(encodedPassword)
                .fullName("Administrator")
                .role("ROLE_ADMIN")
                .build(),
            User.builder()
                .username("faculty")
                .email("faculty@eduvault.com")
                .password(encodedPassword)
                .fullName("Dr. Jane Smith")
                .role("ROLE_FACULTY")
                .build(),
            User.builder()
                .username("student")
                .email("student@eduvault.com")
                .password(encodedPassword)
                .fullName("John Student")
                .role(ROLE_STUDENT)
                .build(),
            User.builder()
                .username("john_doe")
                .email("john.doe@student.edu")
                .password(encodedPassword)
                .fullName("John Doe")
                .role(ROLE_STUDENT)
                .build(),
            User.builder()
                .username("jane_smith")
                .email("jane.smith@student.edu")
                .password(encodedPassword)
                .fullName("Jane Smith")
                .role(ROLE_STUDENT)
                .build()
        );
        
        userRepository.saveAll(users);
    }

    @SuppressWarnings("null")
    private void initializeStudents() {
        List<Student> students = Arrays.asList(
            Student.builder()
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@student.edu")
                .enrollmentNumber("STU001")
                .dateOfBirth(LocalDate.of(2002, 5, 15))
                .department("Computer Science")
                .semester(4)
                .status(STATUS_ACTIVE)
                .build(),
            Student.builder()
                .firstName("Jane")
                .lastName("Smith")
                .email("jane.smith@student.edu")
                .enrollmentNumber("STU002")
                .dateOfBirth(LocalDate.of(2003, 8, 22))
                .department("Information Technology")
                .semester(3)
                .status(STATUS_ACTIVE)
                .build(),
            Student.builder()
                .firstName("Alice")
                .lastName("Johnson")
                .email("alice.johnson@student.edu")
                .enrollmentNumber("STU003")
                .dateOfBirth(LocalDate.of(2001, 3, 10))
                .department("Computer Science")
                .semester(5)
                .status(STATUS_ACTIVE)
                .build(),
            Student.builder()
                .firstName("Bob")
                .lastName("Wilson")
                .email("bob.wilson@student.edu")
                .enrollmentNumber("STU004")
                .dateOfBirth(LocalDate.of(2002, 12, 5))
                .department("Data Science")
                .semester(2)
                .status(STATUS_ACTIVE)
                .build(),
            Student.builder()
                .firstName("Charlie")
                .lastName("Brown")
                .email("charlie.brown@student.edu")
                .enrollmentNumber("STU005")
                .dateOfBirth(LocalDate.of(2003, 6, 18))
                .department("Information Technology")
                .semester(4)
                .status(STATUS_ACTIVE)
                .build()
        );
        
        studentRepository.saveAll(students);
    }
}
