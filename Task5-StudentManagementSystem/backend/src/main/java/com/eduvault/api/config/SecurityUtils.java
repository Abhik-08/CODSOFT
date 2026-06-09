package com.eduvault.api.config;

import com.eduvault.api.model.Student;
import com.eduvault.api.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
@SuppressWarnings("null")
public class SecurityUtils {

    private static final String ROLE_ADMIN = "ADMIN";
    private static final String ROLE_FACULTY = "FACULTY";

    private final StudentRepository studentRepository;
    private final PortfolioRepository portfolioRepository;
    private final GradeRepository gradeRepository;
    private final ProjectRepository projectRepository;
    private final CertificateRepository certificateRepository;

    @Autowired
    public SecurityUtils(StudentRepository studentRepository, PortfolioRepository portfolioRepository,
                         GradeRepository gradeRepository, ProjectRepository projectRepository,
                         CertificateRepository certificateRepository) {
        this.studentRepository = studentRepository;
        this.portfolioRepository = portfolioRepository;
        this.gradeRepository = gradeRepository;
        this.projectRepository = projectRepository;
        this.certificateRepository = certificateRepository;
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
                .map(student -> username.equalsIgnoreCase(student.getEmail()) || username.equalsIgnoreCase(student.getEnrollmentNumber()))
                .orElse(false);
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

    public boolean hasAccessToGrade(Long gradeId) {
        if (hasRole(ROLE_ADMIN) || hasRole(ROLE_FACULTY)) {
            return true;
        }
        String username = getCurrentUsername();
        if (username == null) {
            return false;
        }
        return gradeRepository.findById(gradeId)
                .map(grade -> {
                    Student student = grade.getStudent();
                    return student != null && (username.equalsIgnoreCase(student.getEmail()) || username.equalsIgnoreCase(student.getEnrollmentNumber()));
                })
                .orElse(false);
    }

    public boolean hasAccessToProject(Long projectId) {
        if (hasRole(ROLE_ADMIN) || hasRole(ROLE_FACULTY)) {
            return true;
        }
        String username = getCurrentUsername();
        if (username == null) {
            return false;
        }
        return projectRepository.findById(projectId)
                .map(project -> {
                    Student student = project.getStudent();
                    return student != null && (username.equalsIgnoreCase(student.getEmail()) || username.equalsIgnoreCase(student.getEnrollmentNumber()));
                })
                .orElse(false);
    }

    public boolean hasAccessToCertificate(Long certificateId) {
        if (hasRole(ROLE_ADMIN) || hasRole(ROLE_FACULTY)) {
            return true;
        }
        String username = getCurrentUsername();
        if (username == null) {
            return false;
        }
        return certificateRepository.findById(certificateId)
                .map(cert -> {
                    Student student = cert.getStudent();
                    return student != null && (username.equalsIgnoreCase(student.getEmail()) || username.equalsIgnoreCase(student.getEnrollmentNumber()));
                })
                .orElse(false);
    }
}
