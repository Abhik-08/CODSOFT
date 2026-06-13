package com.eduvault.api.service;

import com.eduvault.api.model.Student;
import com.eduvault.api.model.Portfolio;
import com.eduvault.api.repository.StudentRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AiContextBuilder {

    private static final String NONE_LISTED = "None listed";

    private final StudentRepository studentRepository;
    private final AnalyticsSummaryService analyticsSummaryService;
    private final com.eduvault.api.repository.NotificationRepository notificationRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public AiContextBuilder(
            StudentRepository studentRepository, 
            AnalyticsSummaryService analyticsSummaryService,
            com.eduvault.api.repository.NotificationRepository notificationRepository) {
        this.studentRepository = studentRepository;
        this.analyticsSummaryService = analyticsSummaryService;
        this.notificationRepository = notificationRepository;
    }

    public String buildContext() {
        List<Student> students = studentRepository.findAll();
        
        // Context restriction based on user role
        if (com.eduvault.api.config.SecurityUtils.hasRole("ROLE_FACULTY")) {
            // Faculty has access to their assigned CS & IT department cohort
            students = students.stream()
                    .filter(s -> "Computer Science".equalsIgnoreCase(s.getDepartment()) || "Information Technology".equalsIgnoreCase(s.getDepartment()))
                    .toList();
        } else if (com.eduvault.api.config.SecurityUtils.hasRole("ROLE_STUDENT") || com.eduvault.api.config.SecurityUtils.hasRole("ROLE_USER")) {
            // Student has access only to their own record
            String username = com.eduvault.api.config.SecurityUtils.getCurrentUsername();
            if (username == null) {
                students = Collections.emptyList();
            } else {
                students = students.stream()
                        .filter(s -> username.equalsIgnoreCase(s.getEmail())
                                || (s.getEmail() != null && s.getEmail().contains("@") && username.equalsIgnoreCase(s.getEmail().substring(0, s.getEmail().indexOf("@"))))
                                || username.equalsIgnoreCase(s.getEnrollmentNumber()))
                        .toList();
            }
        }

        if (students.isEmpty()) {
            return "DATABASE STATE: Empty student registry or access restricted. No data available.";
        }

        StringBuilder sb = new StringBuilder();

        // 1. Analytics Summary
        sb.append("=== COHORT ANALYTICS SUMMARY ===%n".formatted());
        sb.append(analyticsSummaryService.getAnalyticsSummary()).append(String.format("%n%n"));

        // 2. Department Statistics
        appendDeptStats(sb, students);

        // 3. Student Registry & Detailed Data
        appendStudentRecords(sb, students);

        // 4. Notifications Context
        appendNotifications(sb, students);

        return sb.toString();
    }

    private void appendDeptStats(StringBuilder sb, List<Student> students) {
        sb.append("=== DEPARTMENT STATISTICS ===%n".formatted());
        Map<String, List<Student>> byDept = students.stream().collect(Collectors.groupingBy(Student::getDepartment));
        byDept.forEach((dept, list) -> {
            double avgCgpa = list.stream().filter(s -> s.getGpa() != null).mapToDouble(Student::getGpa).average().orElse(0.0);
            double avgAtt = list.stream().filter(s -> s.getAttendance() != null).mapToDouble(Student::getAttendance).average().orElse(0.0);
            sb.append(String.format("- %s: Count=%d, Avg CGPA=%.2f, Avg Attendance=%.2f%%%n", dept, list.size(), avgCgpa, avgAtt));
        });
        sb.append(String.format("%n"));
    }

    private void appendStudentRecords(StringBuilder sb, List<Student> students) {
        sb.append("=== STUDENT REGISTRY & DETAILED RECORDS ===%n".formatted());
        for (Student s : students) {
            appendSingleStudentRecord(sb, s);
        }
    }

    private void appendSingleStudentRecord(StringBuilder sb, Student s) {
        String risk = s.getRiskScore() == null ? "N/A" : String.format("%s (%d%%)", s.getRiskCategory(), s.getRiskScore());
        String tier = s.getPlacementTier() == null ? "N/A" : s.getPlacementTier();
        String placement = s.getPlacementStatus() == null ? "NOT_STARTED" : s.getPlacementStatus();
        
        List<String> skills = new ArrayList<>();
        List<String> certs = new ArrayList<>();
        List<String> projects = new ArrayList<>();
        if (s.getPortfolios() != null) {
            for (Portfolio p : s.getPortfolios()) {
                skills.addAll(parseList(p.getSkillsJson()));
                certs.addAll(parseList(p.getCertificatesJson()));
                projects.addAll(parseList(p.getProjectsJson()));
            }
        }

        sb.append(String.format("- Student: %s %s (Enrollment: %s, Dept: %s, Semester: %d, Status: %s)%n",
                s.getFirstName(), s.getLastName(), s.getEnrollmentNumber(), s.getDepartment(), s.getSemester(), s.getStatus()));
        sb.append(String.format("  * CGPA: %.2f | Attendance: %.1f%%%n",
                s.getGpa() != null ? s.getGpa() : 0.0,
                s.getAttendance() != null ? s.getAttendance() : 0.0));
        sb.append(String.format("  * Risk Status: %s | Placement Status: %s (Placement Score: %d, Tier: %s)%n",
                risk, placement, s.getPlacementScore() != null ? s.getPlacementScore() : 0, tier));
        sb.append(String.format("  * Skills: %s%n", skills.isEmpty() ? NONE_LISTED : String.join(", ", skills)));
        sb.append(String.format("  * Certificates: %s%n", certs.isEmpty() ? NONE_LISTED : String.join(", ", certs)));
        sb.append(String.format("  * Projects: %s%n", projects.isEmpty() ? NONE_LISTED : String.join(", ", projects)));
        sb.append(String.format("%n"));
    }

    private List<String> parseList(String json) {
        if (json == null || json.isBlank()) {
            return Collections.emptyList();
        }
        try {
            List<Map<String, Object>> list = objectMapper.readValue(json, new TypeReference<List<Map<String, Object>>>() {});
            return list.stream()
                    .map(m -> {
                        if (m.containsKey("name")) return (String) m.get("name");
                        if (m.containsKey("title")) return (String) m.get("title");
                        return m.toString();
                    })
                    .filter(Objects::nonNull)
                    .toList();
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private void appendNotifications(StringBuilder sb, List<Student> students) {
        sb.append("=== RECENT NOTIFICATIONS & ALERTS ===%n".formatted());
        
        List<com.eduvault.api.model.Notification> notifications;
        if (com.eduvault.api.config.SecurityUtils.hasRole("ROLE_ADMIN")) {
            notifications = notificationRepository.findAll();
        } else {
            // For students or faculty assigned cohorts, filter based on active usernames/emails
            Set<String> studentEmails = students.stream()
                    .map(Student::getEmail)
                    .filter(Objects::nonNull)
                    .map(String::toLowerCase)
                    .collect(Collectors.toSet());
            
            notifications = notificationRepository.findAll().stream()
                    .filter(n -> n.getUserId() != null && studentEmails.contains(n.getUserId().toLowerCase()))
                    .toList();
        }
        
        if (notifications.isEmpty()) {
            sb.append("No active notifications or alerts found.%n".formatted());
        } else {
            // Sort by creation date desc, show top 30
            List<com.eduvault.api.model.Notification> recent = notifications.stream()
                    .sorted(Comparator.comparing(com.eduvault.api.model.Notification::getCreatedAt).reversed())
                    .limit(30)
                    .toList();
            
            for (com.eduvault.api.model.Notification n : recent) {
                sb.append(String.format("- [%s] Status: %s | User: %s | Title: %s | Message: %s | Priority: %s%n",
                        n.getType(), n.getStatus(), n.getUserId(), n.getTitle(), n.getMessage(), n.getPriority()));
            }
        }
        sb.append(String.format("%n"));
    }
}
