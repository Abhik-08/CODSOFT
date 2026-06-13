package com.eduvault.api.service;

import com.eduvault.api.model.Student;
import java.util.*;

public class RiskScoreCalculator {

    private static final String SEMESTER_NUMBER_KEY = "semesterNumber";

    private RiskScoreCalculator() {
        // Utility class — prevent instantiation
    }

    public static class CalculationResult {
        private int score;
        private String category;
        private int academicRisk;
        private int placementRisk;
        private int engagementRisk;
        private int skillRisk;
        private int growthRisk;

        public int getScore() { return score; }
        public void setScore(int score) { this.score = score; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public int getAcademicRisk() { return academicRisk; }
        public void setAcademicRisk(int academicRisk) { this.academicRisk = academicRisk; }

        public int getPlacementRisk() { return placementRisk; }
        public void setPlacementRisk(int placementRisk) { this.placementRisk = placementRisk; }

        public int getEngagementRisk() { return engagementRisk; }
        public void setEngagementRisk(int engagementRisk) { this.engagementRisk = engagementRisk; }

        public int getSkillRisk() { return skillRisk; }
        public void setSkillRisk(int skillRisk) { this.skillRisk = skillRisk; }

        public int getGrowthRisk() { return growthRisk; }
        public void setGrowthRisk(int growthRisk) { this.growthRisk = growthRisk; }
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
        res.setAcademicRisk(computeAcademicRisk(student, semesters));
        res.setPlacementRisk(computePlacementRisk(student, projects, certificates, skills, portfolios));
        res.setEngagementRisk(computeEngagementRisk(student, projects, certificates, portfolios));
        res.setSkillRisk(computeSkillRisk(skills));
        res.setGrowthRisk(computeGrowthRisk(semesters, achievements));

        double cgpa = resolveCgpa(student, semesters);
        double attendance = student.getAttendance() != null ? student.getAttendance() : 100.0;

        int score = (int) Math.round(
                (res.getAcademicRisk() * 0.35) +
                (res.getPlacementRisk() * 0.25) +
                (res.getEngagementRisk() * 0.15) +
                (res.getSkillRisk() * 0.15) +
                (res.getGrowthRisk() * 0.10)
        );

        determineCategoryAndScore(res, student, cgpa, attendance, score);

        return res;
    }

    private static void determineCategoryAndScore(CalculationResult res, Student student, double cgpa, double attendance, int baseScore) {
        String category;
        int score = baseScore;

        if (cgpa < 6.0 || attendance < 50.0 || "SUSPENDED".equalsIgnoreCase(student.getStatus())) {
            category = "Critical Risk";
            if (score < 75) {
                score = 75 + (score * 25 / 100);
            }
        } else if (cgpa < 6.75 || attendance < 60.0) {
            category = "High Risk";
            if (score < 50 || score >= 75) {
                score = 50 + (score % 25);
            }
        } else if (cgpa < 7.5 || attendance < 75.0) {
            category = "Moderate Risk";
            if (score < 25 || score >= 50) {
                score = 25 + (score % 25);
            }
        } else {
            category = "Low Risk";
            if (score >= 25) {
                score = score % 25;
            }
        }

        res.setCategory(category);
        res.setScore(score);
    }

    // -------------------------------------------------------------------------
    // 1. Academic Risk (35%)
    // -------------------------------------------------------------------------
    private static int computeAcademicRisk(Student student, List<Map<String, Object>> semesters) {
        double cgpa = resolveCgpa(student, semesters);
        double cgpaRisk = gradeCgpaRisk(cgpa);

        double attendanceRate = student.getAttendance() != null ? student.getAttendance() : 100.0;
        double attendanceRisk = gradeAttendanceRisk(attendanceRate);

        double declineRisk = computeDeclineRisk(semesters);
        double backlogRisk = computeBacklogRisk(student);

        return (int) Math.min(100.0,
                (cgpaRisk * 0.4) + (attendanceRisk * 0.3) + (declineRisk * 0.15) + (backlogRisk * 0.15));
    }

    private static double resolveCgpa(Student student, List<Map<String, Object>> semesters) {
        double cgpa = student.getGpa() != null ? student.getGpa() : 0.0;
        if (cgpa == 0.0 && !semesters.isEmpty()) {
            cgpa = semesters.stream()
                    .mapToDouble(s -> s.get("cgpa") != null ? ((Number) s.get("cgpa")).doubleValue() : 0.0)
                    .max()
                    .orElse(0.0);
        }
        return cgpa;
    }

    private static double gradeCgpaRisk(double cgpa) {
        if (cgpa < 6.0) return 100.0;
        if (cgpa < 6.75) return 75.0;
        if (cgpa < 7.5) return 40.0;
        return 0.0;
    }

    private static double gradeAttendanceRisk(double rate) {
        if (rate < 50.0) return 100.0;
        if (rate < 60.0) return 75.0;
        if (rate < 75.0) return 40.0;
        return 0.0;
    }

    private static double computeDeclineRisk(List<Map<String, Object>> semesters) {
        if (semesters.size() < 2) return 0.0;

        List<Map<String, Object>> sorted = sortBySemesterNumber(semesters);
        double secondLastSgpa = getSgpa(sorted.get(sorted.size() - 2));
        double lastSgpa = getSgpa(sorted.get(sorted.size() - 1));

        if (lastSgpa >= secondLastSgpa) return 0.0;

        if (sorted.size() >= 3) {
            double thirdLastSgpa = getSgpa(sorted.get(sorted.size() - 3));
            if (secondLastSgpa < thirdLastSgpa) {
                return 100.0; // Continuous decline
            }
        }
        return 50.0;
    }

    private static double computeBacklogRisk(Student student) {
        int backlogCount = 0;
        if (student.getGradesJson() != null && !student.getGradesJson().isBlank()) {
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                List<Map<String, Object>> grades = mapper.readValue(
                        student.getGradesJson(),
                        new com.fasterxml.jackson.core.type.TypeReference<List<Map<String, Object>>>() {});
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
        return Math.min(100.0, backlogCount * 35.0);
    }

    // -------------------------------------------------------------------------
    // 2. Placement Risk (25%)
    // -------------------------------------------------------------------------
    private static int computePlacementRisk(
            Student student,
            List<Map<String, Object>> projects,
            List<Map<String, Object>> certificates,
            List<Map<String, Object>> skills,
            List<Map<String, Object>> portfolios) {

        int placementScore = student.getPlacementScore() != null ? student.getPlacementScore() : 50;
        double placementScoreRisk = 100.0 - placementScore;

        double projectsRisk = gradeCountRisk(projects.size());
        double portfolioRisk = gradePortfolioRisk(portfolios);
        double skillsRisk = gradeSkillsRisk(skills.size());
        double certsRisk = gradeCountRisk(certificates.size());

        return (int) Math.min(100.0,
                (placementScoreRisk * 0.3) + (projectsRisk * 0.2) +
                (portfolioRisk * 0.2) + (skillsRisk * 0.15) + (certsRisk * 0.15));
    }

    /**
     * Grades risk for a simple count: ≥3 → 0%, 2 → 30%, 1 → 60%, 0 → 100%.
     * Used for both projects and certificates.
     */
    private static double gradeCountRisk(int count) {
        if (count >= 3) return 0.0;
        if (count == 2) return 30.0;
        if (count == 1) return 60.0;
        return 100.0;
    }

    private static double gradePortfolioRisk(List<Map<String, Object>> portfolios) {
        for (Map<String, Object> port : portfolios) {
            if ("PUBLISHED".equalsIgnoreCase(String.valueOf(port.get("portfolioStatus")))
                    || Boolean.TRUE.equals(port.get("published"))) {
                return 0.0;
            }
        }
        return portfolios.isEmpty() ? 100.0 : 40.0;
    }

    private static double gradeSkillsRisk(int count) {
        if (count >= 8) return 0.0;
        if (count >= 5) return 25.0;
        if (count >= 3) return 60.0;
        return 100.0;
    }

    // -------------------------------------------------------------------------
    // 3. Engagement Risk (15%)
    // -------------------------------------------------------------------------
    private static int computeEngagementRisk(
            Student student,
            List<Map<String, Object>> projects,
            List<Map<String, Object>> certificates,
            List<Map<String, Object>> portfolios) {

        double profileCompRisk = computeProfileCompletionRisk(student);
        double recentActivityRisk = (!projects.isEmpty() || !certificates.isEmpty() || !portfolios.isEmpty())
                ? 0.0 : 100.0;

        return (int) Math.min(100.0, (profileCompRisk * 0.6) + (recentActivityRisk * 0.4));
    }

    private static double computeProfileCompletionRisk(Student student) {
        int completedFields = 0;
        int totalFields = 7;
        if (student.getFirstName() != null && !student.getFirstName().isBlank()) completedFields++;
        if (student.getLastName() != null && !student.getLastName().isBlank()) completedFields++;
        if (student.getEmail() != null && !student.getEmail().isBlank()) completedFields++;
        if (student.getDepartment() != null && !student.getDepartment().isBlank()) completedFields++;
        if (student.getImageUrl() != null && !student.getImageUrl().isBlank()) completedFields++;
        if (student.getGpa() != null && student.getGpa() > 0.0) completedFields++;
        if (student.getAttendance() != null && student.getAttendance() > 0.0) completedFields++;
        return 100.0 - (((double) completedFields / totalFields) * 100.0);
    }

    // -------------------------------------------------------------------------
    // 4. Skill Risk (15%)
    // -------------------------------------------------------------------------
    private static int computeSkillRisk(List<Map<String, Object>> skills) {
        boolean[] categories = classifySkillCategories(skills);
        boolean hasDsa      = categories[0];
        boolean hasBackend  = categories[1];
        boolean hasFrontend = categories[2];
        boolean hasDatabase = categories[3];

        double missingCoreRisk = 0.0;
        if (!hasDsa)      missingCoreRisk += 25.0;
        if (!hasBackend)  missingCoreRisk += 25.0;
        if (!hasFrontend) missingCoreRisk += 25.0;
        if (!hasDatabase) missingCoreRisk += 25.0;

        int categoryCount = (hasDsa ? 1 : 0) + (hasBackend ? 1 : 0) + (hasFrontend ? 1 : 0) + (hasDatabase ? 1 : 0);
        double diversityRisk = gradeDiversityRisk(categoryCount);

        double depthRisk = 100.0;
        if (skills.size() >= 6) depthRisk = 0.0;
        else if (skills.size() >= 3) depthRisk = 40.0;

        return (int) Math.min(100.0, (missingCoreRisk * 0.4) + (diversityRisk * 0.3) + (depthRisk * 0.3));
    }

    /** Returns [hasDsa, hasBackend, hasFrontend, hasDatabase] */
    private static boolean[] classifySkillCategories(List<Map<String, Object>> skills) {
        boolean hasDsa = false;
        boolean hasBackend = false;
        boolean hasFrontend = false;
        boolean hasDatabase = false;

        for (Map<String, Object> s : skills) {
            String sname = s.get("name") != null ? s.get("name").toString().toLowerCase().trim() : "";
            if (sname.contains("dsa") || sname.contains("algorithm") || sname.contains("structure")) hasDsa = true;
            if (sname.contains("java") || sname.contains("python") || sname.contains("backend")
                    || sname.contains("spring") || sname.contains("node")) hasBackend = true;
            if (sname.contains("react") || sname.contains("frontend") || sname.contains("html")
                    || sname.contains("css") || sname.contains("javascript")) hasFrontend = true;
            if (sname.contains("sql") || sname.contains("db") || sname.contains("database")
                    || sname.contains("mongo") || sname.contains("postgres")) hasDatabase = true;
        }
        return new boolean[]{ hasDsa, hasBackend, hasFrontend, hasDatabase };
    }

    private static double gradeDiversityRisk(int categoryCount) {
        if (categoryCount >= 3) return 0.0;
        if (categoryCount == 2) return 40.0;
        if (categoryCount == 1) return 75.0;
        return 100.0;
    }

    // -------------------------------------------------------------------------
    // 5. Growth Risk (10%)
    // -------------------------------------------------------------------------
    private static int computeGrowthRisk(
            List<Map<String, Object>> semesters,
            List<Map<String, Object>> achievements) {

        double trendRisk = computeTrendRisk(semesters);
        double consistencyRisk = semesters.isEmpty() ? 100.0 : 0.0;

        double achievementRisk = 100.0;
        if (achievements.size() >= 2) achievementRisk = 0.0;
        else if (achievements.size() == 1) achievementRisk = 40.0;

        return (int) Math.min(100.0, (trendRisk * 0.4) + (consistencyRisk * 0.3) + (achievementRisk * 0.3));
    }

    private static double computeTrendRisk(List<Map<String, Object>> semesters) {
        if (semesters.size() < 2) return 50.0;

        List<Map<String, Object>> sorted = sortBySemesterNumber(semesters);
        double firstSgpa = getSgpa(sorted.get(0));
        double lastSgpa = getSgpa(sorted.get(sorted.size() - 1));

        if (lastSgpa > firstSgpa) return 0.0;
        if (lastSgpa < firstSgpa) return 100.0;
        return 50.0;
    }

    // -------------------------------------------------------------------------
    // Shared helpers
    // -------------------------------------------------------------------------
    private static List<Map<String, Object>> sortBySemesterNumber(List<Map<String, Object>> semesters) {
        List<Map<String, Object>> sorted = new ArrayList<>(semesters);
        sorted.sort(Comparator.comparingInt(s ->
                s.get(SEMESTER_NUMBER_KEY) != null ? ((Number) s.get(SEMESTER_NUMBER_KEY)).intValue() : 0));
        return sorted;
    }

    private static double getSgpa(Map<String, Object> semester) {
        return semester.get("sgpa") != null ? ((Number) semester.get("sgpa")).doubleValue() : 0.0;
    }
}
