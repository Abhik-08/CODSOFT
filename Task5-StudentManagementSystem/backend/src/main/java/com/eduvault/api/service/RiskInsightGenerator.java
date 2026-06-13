package com.eduvault.api.service;

import com.eduvault.api.model.Student;
import java.util.*;

public class RiskInsightGenerator {

    private RiskInsightGenerator() {
        throw new IllegalStateException("Utility class");
    }

    public static List<String> generateRiskReasons(
            Student student,
            List<Map<String, Object>> semesters,
            List<Map<String, Object>> projects,
            List<Map<String, Object>> certificates,
            List<Map<String, Object>> skills,
            List<Map<String, Object>> portfolios) {

        List<String> reasons = new ArrayList<>();

        addCgpaAndAttendanceReasons(student, reasons);
        addSemesterTrendReasons(semesters, reasons);
        addProjectReasons(projects, reasons);
        addPortfolioReasons(portfolios, reasons);
        addSkillAndCertificateReasons(skills, certificates, reasons);
        addDiverseReasons(reasons);

        return reasons.subList(0, Math.min(reasons.size(), 8));
    }

    private static void addCgpaAndAttendanceReasons(Student student, List<String> reasons) {
        double cgpa = student.getGpa() != null ? student.getGpa() : 0.0;
        if (cgpa < 7.5) {
            reasons.add("Low overall CGPA representing severe academic drift");
        }
        if (student.getAttendance() != null) {
            if (student.getAttendance() < 60.0) {
                reasons.add("Attendance dropped below 60% class warning level");
            } else if (student.getAttendance() < 75.0) {
                reasons.add("Attendance trend below expected threshold");
            }
        }
    }

    private static void addSemesterTrendReasons(List<Map<String, Object>> semesters, List<String> reasons) {
        if (semesters.size() >= 2) {
            List<Map<String, Object>> sortedSems = new ArrayList<>(semesters);
            sortedSems.sort(Comparator.comparingInt(s -> s.get("semesterNumber") != null ? ((Number) s.get("semesterNumber")).intValue() : 0));
            double secondLastSgpa = sortedSems.get(sortedSems.size() - 2).get("sgpa") != null ? ((Number) sortedSems.get(sortedSems.size() - 2).get("sgpa")).doubleValue() : 0.0;
            double lastSgpa = sortedSems.get(sortedSems.size() - 1).get("sgpa") != null ? ((Number) sortedSems.get(sortedSems.size() - 1).get("sgpa")).doubleValue() : 0.0;
            if (lastSgpa < secondLastSgpa) {
                reasons.add("Academic decline detected across recent semesters");
                reasons.add("Critical decline in SGPA from previous terms");
            }
        }
    }

    private static void addProjectReasons(List<Map<String, Object>> projects, List<String> reasons) {
        if (projects.isEmpty()) {
            reasons.add("Limited project experience");
            reasons.add("Zero published projects found in repository profile");
        }
    }

    private static void addPortfolioReasons(List<Map<String, Object>> portfolios, List<String> reasons) {
        boolean hasPublished = false;
        for (Map<String, Object> port : portfolios) {
            if ("PUBLISHED".equalsIgnoreCase(String.valueOf(port.get("portfolioStatus"))) || Boolean.TRUE.equals(port.get("published"))) {
                hasPublished = true;
                break;
            }
        }
        if (!hasPublished) {
            reasons.add("Low portfolio completion");
            reasons.add("No active professional portfolio published to date");
        }
    }

    private static void addSkillAndCertificateReasons(List<Map<String, Object>> skills, List<Map<String, Object>> certificates, List<String> reasons) {
        if (skills.size() < 5) {
            reasons.add("Insufficient industry-relevant skills");
        }
        if (certificates.size() < 2) {
            reasons.add("Certificate coverage below peer average");
        }
    }

    private static void addDiverseReasons(List<String> reasons) {
        if (reasons.size() < 5) {
            for (String genericReason : RiskInsightDatabase.RISK_REASONS) {
                if (!reasons.contains(genericReason)) {
                    reasons.add(genericReason);
                }
                if (reasons.size() >= 5) {
                    break;
                }
            }
        }
    }

    public static List<String> generateRiskFactors(
            Student student,
            List<Map<String, Object>> projects,
            List<Map<String, Object>> certificates,
            List<Map<String, Object>> skills) {

        List<String> factors = new ArrayList<>();
        double cgpa = student.getGpa() != null ? student.getGpa() : 0.0;
        double attendance = student.getAttendance() != null ? student.getAttendance() : 100.0;

        if (cgpa < 7.5) {
            factors.add("Academic Performance (CGPA: " + String.format("%.2f", cgpa) + ")");
        }
        if (attendance < 75.0) {
            factors.add("Class Attendance Rate (" + String.format("%.1f", attendance) + "%)");
        }
        if (projects.size() < 2) {
            factors.add("Practical Project Portfolio (Count: " + projects.size() + ")");
        }
        if (skills.size() < 5) {
            factors.add("Technical Skill Diversity (Count: " + skills.size() + ")");
        }
        if (certificates.isEmpty()) {
            factors.add("Professional Certifications");
        }

        if (factors.size() < 3) {
            factors.add("Academic Progress Trend");
            factors.add("Portfolio Online Branding");
            factors.add("Technology Stack Alignment");
        }

        return factors;
    }
}
