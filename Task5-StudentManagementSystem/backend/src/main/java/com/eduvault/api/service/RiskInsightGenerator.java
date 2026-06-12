package com.eduvault.api.service;

import com.eduvault.api.model.Student;
import java.util.*;

public class RiskInsightGenerator {

    public static List<String> generateRiskReasons(
            Student student,
            List<Map<String, Object>> semesters,
            List<Map<String, Object>> projects,
            List<Map<String, Object>> certificates,
            List<Map<String, Object>> achievements,
            List<Map<String, Object>> skills,
            List<Map<String, Object>> portfolios) {

        List<String> reasons = new ArrayList<>();

        double cgpa = student.getGpa() != null ? student.getGpa() : 0.0;
        if (cgpa < 7.0) {
            reasons.add("Low overall CGPA representing severe academic drift");
        }
        if (student.getAttendance() != null && student.getAttendance() < 75.0) {
            reasons.add("Attendance dropped below 75% class warning level");
        } else if (student.getAttendance() != null && student.getAttendance() < 85.0) {
            reasons.add("Attendance trend below expected threshold");
        }

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

        if (projects.isEmpty()) {
            reasons.add("Limited project experience");
            reasons.add("Zero published projects found in repository profile");
        }

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

        if (skills.size() < 5) {
            reasons.add("Insufficient industry-relevant skills");
        }

        if (certificates.size() < 2) {
            reasons.add("Certificate coverage below peer average");
        }

        // Fill up to have diverse and rich reasons
        if (reasons.size() < 5) {
            for (String genericReason : RiskInsightDatabase.RISK_REASONS) {
                if (!reasons.contains(genericReason)) {
                    reasons.add(genericReason);
                }
                if (reasons.size() >= 5) break;
            }
        }

        return reasons.subList(0, Math.min(reasons.size(), 8));
    }

    public static List<String> generateRiskFactors(
            Student student,
            List<Map<String, Object>> semesters,
            List<Map<String, Object>> projects,
            List<Map<String, Object>> certificates,
            List<Map<String, Object>> achievements,
            List<Map<String, Object>> skills,
            List<Map<String, Object>> portfolios) {

        List<String> factors = new ArrayList<>();
        double cgpa = student.getGpa() != null ? student.getGpa() : 0.0;
        double attendance = student.getAttendance() != null ? student.getAttendance() : 100.0;

        if (cgpa < 7.5) {
            factors.add("Academic Performance (CGPA: " + String.format("%.2f", cgpa) + ")");
        }
        if (attendance < 85.0) {
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
