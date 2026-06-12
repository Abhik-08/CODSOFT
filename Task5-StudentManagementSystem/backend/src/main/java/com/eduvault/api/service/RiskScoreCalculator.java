package com.eduvault.api.service;

import com.eduvault.api.model.Student;
import java.util.*;

public class RiskScoreCalculator {

    public static class CalculationResult {
        public int score;
        public String category;
        public int academicRisk;
        public int placementRisk;
        public int engagementRisk;
        public int skillRisk;
        public int growthRisk;
    }

    public static CalculationResult calculate(
            Student student,
            List<Map<String, Object>> semesters,
            List<Map<String, Object>> projects,
            List<Map<String, Object>> certificates,
            List<Map<String, Object>> achievements,
            List<Map<String, Object>> skills,
            List<Map<String, Object>> portfolios) {

        CalculationResult res = new CalculationResult();

        // 1. Academic Risk (35%)
        double cgpa = student.getGpa() != null ? student.getGpa() : 0.0;
        if (cgpa == 0.0 && !semesters.isEmpty()) {
            cgpa = semesters.stream()
                    .mapToDouble(s -> s.get("cgpa") != null ? ((Number) s.get("cgpa")).doubleValue() : 0.0)
                    .max()
                    .orElse(0.0);
        }
        double cgpaRisk = 0.0;
        if (cgpa < 6.0) cgpaRisk = 100.0;
        else if (cgpa < 7.0) cgpaRisk = 75.0;
        else if (cgpa < 8.0) cgpaRisk = 40.0;
        else if (cgpa < 9.0) cgpaRisk = 15.0;

        double attendanceRate = student.getAttendance() != null ? student.getAttendance() : 100.0;
        double attendanceRisk = 0.0;
        if (attendanceRate < 75.0) attendanceRisk = 100.0;
        else if (attendanceRate < 80.0) attendanceRisk = 75.0;
        else if (attendanceRate < 85.0) attendanceRisk = 40.0;
        else if (attendanceRate < 90.0) attendanceRisk = 15.0;

        double declineRisk = 0.0;
        if (semesters.size() >= 2) {
            List<Map<String, Object>> sortedSems = new ArrayList<>(semesters);
            sortedSems.sort(Comparator.comparingInt(s -> s.get("semesterNumber") != null ? ((Number) s.get("semesterNumber")).intValue() : 0));
            double secondLastSgpa = sortedSems.get(sortedSems.size() - 2).get("sgpa") != null ? ((Number) sortedSems.get(sortedSems.size() - 2).get("sgpa")).doubleValue() : 0.0;
            double lastSgpa = sortedSems.get(sortedSems.size() - 1).get("sgpa") != null ? ((Number) sortedSems.get(sortedSems.size() - 1).get("sgpa")).doubleValue() : 0.0;
            if (lastSgpa < secondLastSgpa) {
                declineRisk = 50.0;
                if (sortedSems.size() >= 3) {
                    double thirdLastSgpa = sortedSems.get(sortedSems.size() - 3).get("sgpa") != null ? ((Number) sortedSems.get(sortedSems.size() - 3).get("sgpa")).doubleValue() : 0.0;
                    if (secondLastSgpa < thirdLastSgpa) {
                        declineRisk = 100.0; // Continuous decline
                    }
                }
            }
        }

        double backlogRisk = 0.0;
        // Count backlogs from gradesJson if available, looking for "F" grade
        int backlogCount = 0;
        if (student.getGradesJson() != null && !student.getGradesJson().isBlank()) {
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                List<Map<String, Object>> grades = mapper.readValue(student.getGradesJson(), new com.fasterxml.jackson.core.type.TypeReference<List<Map<String, Object>>>() {});
                for (Map<String, Object> grade : grades) {
                    Object gradeVal = grade.get("grade");
                    if (gradeVal != null && "F".equalsIgnoreCase(gradeVal.toString().trim())) {
                        backlogCount++;
                    }
                }
            } catch (Exception e) {
                // Ignore parsing error
            }
        }
        backlogRisk = Math.min(100.0, backlogCount * 35.0);

        res.academicRisk = (int) Math.min(100.0, (cgpaRisk * 0.4) + (attendanceRisk * 0.3) + (declineRisk * 0.15) + (backlogRisk * 0.15));

        // 2. Placement Risk (25%)
        int placementScore = student.getPlacementScore() != null ? student.getPlacementScore() : 50;
        double placementScoreRisk = 100.0 - placementScore;

        double projectsRisk = 100.0;
        int projCount = projects.size();
        if (projCount >= 3) projectsRisk = 0.0;
        else if (projCount == 2) projectsRisk = 30.0;
        else if (projCount == 1) projectsRisk = 60.0;

        double portfolioRisk = 100.0;
        boolean hasPublished = false;
        for (Map<String, Object> port : portfolios) {
            if ("PUBLISHED".equalsIgnoreCase(String.valueOf(port.get("portfolioStatus"))) || Boolean.TRUE.equals(port.get("published"))) {
                hasPublished = true;
                break;
            }
        }
        if (hasPublished) portfolioRisk = 0.0;
        else if (!portfolios.isEmpty()) portfolioRisk = 40.0;

        double skillsRisk = 100.0;
        int skillCount = skills.size();
        if (skillCount >= 8) skillsRisk = 0.0;
        else if (skillCount >= 5) skillsRisk = 25.0;
        else if (skillCount >= 3) skillsRisk = 60.0;

        double certsRisk = 100.0;
        int certCount = certificates.size();
        if (certCount >= 3) certsRisk = 0.0;
        else if (certCount == 2) certsRisk = 30.0;
        else if (certCount == 1) certsRisk = 60.0;

        res.placementRisk = (int) Math.min(100.0, (placementScoreRisk * 0.3) + (projectsRisk * 0.2) + (portfolioRisk * 0.2) + (skillsRisk * 0.15) + (certsRisk * 0.15));

        // 3. Engagement Risk (15%)
        int completedFields = 0;
        int totalFields = 7;
        if (student.getFirstName() != null && !student.getFirstName().isBlank()) completedFields++;
        if (student.getLastName() != null && !student.getLastName().isBlank()) completedFields++;
        if (student.getEmail() != null && !student.getEmail().isBlank()) completedFields++;
        if (student.getDepartment() != null && !student.getDepartment().isBlank()) completedFields++;
        if (student.getImageUrl() != null && !student.getImageUrl().isBlank()) completedFields++;
        if (student.getGpa() != null && student.getGpa() > 0.0) completedFields++;
        if (student.getAttendance() != null && student.getAttendance() > 0.0) completedFields++;
        double profileCompRisk = 100.0 - (((double) completedFields / totalFields) * 100.0);

        double recentActivityRisk = 100.0;
        if (projects.size() > 0 || certificates.size() > 0 || portfolios.size() > 0) {
            recentActivityRisk = 0.0;
        }

        res.engagementRisk = (int) Math.min(100.0, (profileCompRisk * 0.6) + (recentActivityRisk * 0.4));

        // 4. Skill Risk (15%)
        boolean hasDsa = false;
        boolean hasBackend = false;
        boolean hasFrontend = false;
        boolean hasDatabase = false;
        for (Map<String, Object> s : skills) {
            String sname = s.get("name") != null ? s.get("name").toString().toLowerCase().trim() : "";
            if (sname.contains("dsa") || sname.contains("algorithm") || sname.contains("structure")) hasDsa = true;
            if (sname.contains("java") || sname.contains("python") || sname.contains("backend") || sname.contains("spring") || sname.contains("node")) hasBackend = true;
            if (sname.contains("react") || sname.contains("frontend") || sname.contains("html") || sname.contains("css") || sname.contains("javascript")) hasFrontend = true;
            if (sname.contains("sql") || sname.contains("db") || sname.contains("database") || sname.contains("mongo") || sname.contains("postgres")) hasDatabase = true;
        }

        double missingCoreRisk = 0.0;
        if (!hasDsa) missingCoreRisk += 25.0;
        if (!hasBackend) missingCoreRisk += 25.0;
        if (!hasFrontend) missingCoreRisk += 25.0;
        if (!hasDatabase) missingCoreRisk += 25.0;

        double diversityRisk = 100.0;
        int categoryCount = 0;
        if (hasDsa) categoryCount++;
        if (hasBackend) categoryCount++;
        if (hasFrontend) categoryCount++;
        if (hasDatabase) categoryCount++;
        if (categoryCount >= 3) diversityRisk = 0.0;
        else if (categoryCount == 2) diversityRisk = 40.0;
        else if (categoryCount == 1) diversityRisk = 75.0;

        double depthRisk = 100.0;
        if (skills.size() >= 6) depthRisk = 0.0;
        else if (skills.size() >= 3) depthRisk = 40.0;

        res.skillRisk = (int) Math.min(100.0, (missingCoreRisk * 0.4) + (diversityRisk * 0.3) + (depthRisk * 0.3));

        // 5. Growth Risk (10%)
        double trendRisk = 50.0;
        if (semesters.size() >= 2) {
            List<Map<String, Object>> sortedSems = new ArrayList<>(semesters);
            sortedSems.sort(Comparator.comparingInt(s -> s.get("semesterNumber") != null ? ((Number) s.get("semesterNumber")).intValue() : 0));
            double firstSgpa = sortedSems.get(0).get("sgpa") != null ? ((Number) sortedSems.get(0).get("sgpa")).doubleValue() : 0.0;
            double lastSgpa = sortedSems.get(sortedSems.size() - 1).get("sgpa") != null ? ((Number) sortedSems.get(sortedSems.size() - 1).get("sgpa")).doubleValue() : 0.0;
            if (lastSgpa > firstSgpa) {
                trendRisk = 0.0;
            } else if (lastSgpa < firstSgpa) {
                trendRisk = 100.0;
            }
        }

        double consistencyRisk = 100.0;
        if (semesters.size() > 0) {
            consistencyRisk = 0.0;
        }

        double achievementRisk = 100.0;
        if (achievements.size() >= 2) achievementRisk = 0.0;
        else if (achievements.size() == 1) achievementRisk = 40.0;

        res.growthRisk = (int) Math.min(100.0, (trendRisk * 0.4) + (consistencyRisk * 0.3) + (achievementRisk * 0.3));

        // Aggregate Risk Score (0 - 100)
        res.score = (int) Math.round(
                (res.academicRisk * 0.35) +
                (res.placementRisk * 0.25) +
                (res.engagementRisk * 0.15) +
                (res.skillRisk * 0.15) +
                (res.growthRisk * 0.10)
        );

        // Map Category
        if (res.score >= 75) res.category = "Critical Risk";
        else if (res.score >= 50) res.category = "High Risk";
        else if (res.score >= 25) res.category = "Moderate Risk";
        else res.category = "Low Risk";

        return res;
    }
}
