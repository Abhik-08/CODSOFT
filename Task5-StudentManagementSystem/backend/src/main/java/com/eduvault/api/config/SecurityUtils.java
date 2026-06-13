package com.eduvault.api.config;

import com.eduvault.api.model.Student;
import com.eduvault.api.repository.*;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.client.RestTemplate;

import com.eduvault.api.service.StudentService;

@Component
@SuppressWarnings("null")
public class SecurityUtils {

    private static final String ROLE_ADMIN = "ADMIN";
    private static final String ROLE_FACULTY = "FACULTY";

    private final StudentRepository studentRepository;
    private final PortfolioRepository portfolioRepository;
    private final AdvisoryRepository advisoryRepository;
    private StudentService studentService;

    @Autowired
    public SecurityUtils(StudentRepository studentRepository, PortfolioRepository portfolioRepository, AdvisoryRepository advisoryRepository) {
        this.studentRepository = studentRepository;
        this.portfolioRepository = portfolioRepository;
        this.advisoryRepository = advisoryRepository;
    }

    @Autowired
    public void setStudentService(@org.springframework.context.annotation.Lazy StudentService studentService) {
        this.studentService = studentService;
    }

    public static String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof UserDetails userDetails) {
            return userDetails.getUsername();
        }
        return principal.toString();
    }

    public static boolean hasRole(String role) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return false;
        }
        String targetRole = role.startsWith("ROLE_") ? role : "ROLE_" + role;
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals(targetRole));
    }

    public static boolean hasAccessToStudent(String studentEmail, String enrollmentNumber) {
        if (hasRole(ROLE_ADMIN) || hasRole(ROLE_FACULTY)) {
            return true;
        }
        String username = getCurrentUsername();
        if (username == null) {
            return false;
        }
        return username.equalsIgnoreCase(studentEmail) || username.equalsIgnoreCase(enrollmentNumber);
    }

    public boolean hasAccessToStudent(Long studentId) {
        if (hasRole(ROLE_ADMIN) || hasRole(ROLE_FACULTY)) {
            return true;
        }
        String username = getCurrentUsername();
        if (username == null) {
            return false;
        }
        return studentRepository.findById(studentId)
                .map(student -> matchesUser(username, student))
                .orElse(false);
    }

    public boolean hasAccessToStudent(String studentIdStr) {
        if (hasRole(ROLE_ADMIN) || hasRole(ROLE_FACULTY)) {
            return true;
        }
        String username = getCurrentUsername();
        if (username == null) {
            return false;
        }
        try {
            Long id = Long.parseLong(studentIdStr);
            return studentRepository.findById(id)
                    .map(student -> matchesUser(username, student))
                    .orElse(false);
        } catch (NumberFormatException e) {
            Optional<Student> studentOpt = studentRepository.findByFirestoreId(studentIdStr);
            if (studentOpt.isEmpty()) {
                try {
                    studentService.syncStudentByFirestoreId(studentIdStr);
                    studentOpt = studentRepository.findByFirestoreId(studentIdStr);
                } catch (Exception ex) {
                    // Ignore sync failures during access check
                }
            }
            if (studentOpt.isEmpty()) {
                studentOpt = studentRepository.findByEnrollmentNumber(studentIdStr);
            }
            if (studentOpt.isEmpty()) {
                studentOpt = studentRepository.findByEmail(studentIdStr);
            }
            return studentOpt.map(student -> matchesUser(username, student))
                    .orElse(false);
        }
    }

    /** Checks if a Spring Security username matches a student's email or enrollment number.
     *  Handles both full email (from Firebase) and email prefix (stored as username). */
    private boolean matchesUser(String username, Student student) {
        String email = student.getEmail();
        String emailPrefix = email != null && email.contains("@") ? email.substring(0, email.indexOf("@")) : email;
        return username.equalsIgnoreCase(email)
                || username.equalsIgnoreCase(emailPrefix)
                || username.equalsIgnoreCase(student.getEnrollmentNumber());
    }

    public boolean hasAccessToPortfolio(Long portfolioId) {
        if (hasRole(ROLE_ADMIN) || hasRole(ROLE_FACULTY)) {
            return true;
        }
        String username = getCurrentUsername();
        if (username == null) {
            return false;
        }
        return portfolioRepository.findById(portfolioId)
                .map(portfolio -> {
                    Student student = portfolio.getStudent();
                    return student != null && (username.equalsIgnoreCase(student.getEmail()) || username.equalsIgnoreCase(student.getEnrollmentNumber()));
                })
                .orElse(false);
    }

    public boolean isSelfUserAdvisory(Long advisoryId) {
        if (hasRole(ROLE_ADMIN) || hasRole(ROLE_FACULTY)) {
            return true;
        }
        String username = getCurrentUsername();
        if (username == null) {
            return false;
        }
        return advisoryRepository.findById(advisoryId)
                .map(advisory -> {
                    Optional<Student> student = studentRepository.findById(advisory.getStudentId());
                    return student.map(s -> matchesUser(username, s)).orElse(false);
                })
                .orElse(false);
    }

    public static String getCurrentBearerToken() {
        try {
            RequestAttributes attributes = RequestContextHolder.getRequestAttributes();
            if (attributes instanceof ServletRequestAttributes servletRequestAttributes) {
                HttpServletRequest request = servletRequestAttributes.getRequest();
                String authHeader = request.getHeader("Authorization");
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    return authHeader;
                }
            }
        } catch (Exception e) {
            // Request context not available (e.g. startup, background threads)
        }
        return null;
    }

    public static RestTemplate getAuthenticatedRestTemplate() {
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.getInterceptors().add((request, body, execution) -> {
            String token = getCurrentBearerToken();
            if (token != null) {
                request.getHeaders().set("Authorization", token);
            }
            return execution.execute(request, body);
        });
        return restTemplate;
    }
}
