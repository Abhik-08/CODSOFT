package com.eduvault.api.service;

import com.eduvault.api.model.Student;
import java.util.*;

public class PlacementScoreCalculator {

    public static class CalculationResult {
        public int score;
        public String tier;
        public int confidence;
        public int academicScore;
        public int technicalScore;
        public int careerScore;
        public int consistencyScore;
        public int industryScore;
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

        // 1. Academic Strength (25%)
        double cgpa = student.getGpa() != null ? student.getGpa() : 0.0;
        if (cgpa == 0.0 && !semesters.isEmpty()) {
            cgpa = semesters.stream()
                    .mapToDouble(s -> s.get("cgpa") != null ? ((Number) s.get("cgpa")).doubleValue() : 0.0)
                    .max()
                    .orElse(0.0);
        }
        double baseAcademic = (cgpa / 10.0) * 100.0;

        // SGPA Trend and growth
        double trendBonus = 0.0;
        if (semesters.size() >= 2) {
            // Sort semesters by semesterNumber
            List<Map<String, Object>> sortedSems = new ArrayList<>(semesters);
            sortedSems.sort(Comparator.comparingInt(s -> s.get("semesterNumber") != null ? ((Number) s.get("semesterNumber")).intValue() : 0));
            double firstSgpa = sortedSems.get(0).get("sgpa") != null ? ((Number) sortedSems.get(0).get("sgpa")).doubleValue() : 0.0;
            double lastSgpa = sortedSems.get(sortedSems.size() - 1).get("sgpa") != null ? ((Number) sortedSems.get(sortedSems.size() - 1).get("sgpa")).doubleValue() : 0.0;
            if (lastSgpa > firstSgpa) {
                trendBonus += 10.0; // Positive trend
            } else if (Math.abs(lastSgpa - firstSgpa) < 0.5) {
                trendBonus += 5.0; // Stable
            }
        }

        // Attendance
        double attendanceRate = student.getAttendance() != null ? student.getAttendance() : 100.0;
        double attendanceScore = 80.0;
        if (attendanceRate >= 90.0) {
            attendanceScore = 100.0;
        } else if (attendanceRate >= 75.0) {
            attendanceScore = 80.0;
        } else {
            attendanceScore = 40.0;
        }

        res.academicScore = (int) Math.min(100.0, (baseAcademic * 0.7) + (trendBonus * 0.15) + (attendanceScore * 0.15));

        // 2. Technical Strength (30%)
        // Projects
        double projectPoints = 0.0;
        int projCount = projects.size();
        if (projCount >= 3) projectPoints = 100.0;
        else if (projCount == 2) projectPoints = 80.0;
        else if (projCount == 1) projectPoints = 50.0;

        // Skills & diversity
        double skillPoints = 0.0;
        int skillCount = skills.size();
        if (skillCount >= 8) skillPoints = 100.0;
        else if (skillCount >= 4) skillPoints = 80.0;
        else if (skillCount >= 1) skillPoints = 40.0;

        // Tech stack diversity (count technologies in skills and project techStacks)
        Set<String> uniqueTechs = new HashSet<>();
        for (Map<String, Object> s : skills) {
            if (s.get("name") != null) uniqueTechs.add(s.get("name").toString().toLowerCase().trim());
        }
        for (Map<String, Object> p : projects) {
            if (p.get("techStack") != null) {
                Object stack = p.get("techStack");
                if (stack instanceof List) {
                    for (Object t : (List<?>) stack) {
                        uniqueTechs.add(t.toString().toLowerCase().trim());
                    }
                } else if (stack instanceof String) {
                    for (String t : ((String) stack).split(",")) {
                        uniqueTechs.add(t.toLowerCase().trim());
                    }
                }
            }
        }
        double techDiversityPoints = 0.0;
        int uniqueTechCount = uniqueTechs.size();
        if (uniqueTechCount >= 10) techDiversityPoints = 100.0;
        else if (uniqueTechCount >= 5) techDiversityPoints = 80.0;
        else if (uniqueTechCount >= 2) techDiversityPoints = 50.0;

        // GitHub Presence
        double gitHubPoints = 0.0;
        boolean hasGitHub = false;
        for (Map<String, Object> port : portfolios) {
            if (port.get("githubUrl") != null && !port.get("githubUrl").toString().isBlank()) {
                hasGitHub = true;
                break;
            }
        }
        if (hasGitHub) gitHubPoints = 100.0;

        res.technicalScore = (int) Math.min(100.0, (projectPoints * 0.3) + (skillPoints * 0.3) + (techDiversityPoints * 0.2) + (gitHubPoints * 0.2));

        // 3. Career Readiness (20%)
        // Certificates
        double certPoints = 0.0;
        int certCount = certificates.size();
        if (certCount >= 3) certPoints = 100.0;
        else if (certCount == 2) certPoints = 80.0;
        else if (certCount == 1) certPoints = 50.0;

        // Achievements
        double achPoints = 0.0;
        int achCount = achievements.size();
        if (achCount >= 3) achPoints = 100.0;
        else if (achCount == 2) achPoints = 80.0;
        else if (achCount == 1) achPoints = 50.0;

        // Co-curricular / Leadership keywords in achievements/certificates/projects
        double leadPoints = 0.0;
        boolean hasLeadership = false;
        String[] keywords = {"winner", "hackathon", "lead", "president", "first", "captain", "organizer", "compete", "competition"};
        for (Map<String, Object> ach : achievements) {
            String title = ach.get("title") != null ? ach.get("title").toString().toLowerCase() : "";
            String desc = ach.get("description") != null ? ach.get("description").toString().toLowerCase() : "";
            for (String kw : keywords) {
                if (title.contains(kw) || desc.contains(kw)) {
                    hasLeadership = true;
                    break;
                }
            }
        }
        if (hasLeadership) {
            leadPoints = 100.0;
        }

        res.careerScore = (int) Math.min(100.0, (certPoints * 0.4) + (achPoints * 0.4) + (leadPoints * 0.2));

        // 4. Consistency Score (15%)
        // Profile Completion
        int completedFields = 0;
        int totalFields = 7;
        if (student.getFirstName() != null && !student.getFirstName().isBlank()) completedFields++;
        if (student.getLastName() != null && !student.getLastName().isBlank()) completedFields++;
        if (student.getEmail() != null && !student.getEmail().isBlank()) completedFields++;
        if (student.getDepartment() != null && !student.getDepartment().isBlank()) completedFields++;
        if (student.getImageUrl() != null && !student.getImageUrl().isBlank()) completedFields++;
        if (student.getGpa() != null && student.getGpa() > 0.0) completedFields++;
        if (student.getAttendance() != null && student.getAttendance() > 0.0) completedFields++;
        double profileComp = ((double) completedFields / totalFields) * 100.0;

        // Semester records vs current semester
        double semHistoryPoints = 0.0;
        int currentSem = student.getSemester() != null ? student.getSemester() : 1;
        int recordSems = semesters.size();
        if (recordSems >= currentSem - 1) {
            semHistoryPoints = 100.0;
        } else if (recordSems > 0) {
            semHistoryPoints = 60.0;
        }

        res.consistencyScore = (int) Math.min(100.0, (profileComp * 0.5) + (semHistoryPoints * 0.5));

        // 5. Industry Readiness (10%)
        // Portfolio presence and status
        double portPoints = 0.0;
        boolean hasPublished = false;
        boolean hasLinkedIn = false;
        for (Map<String, Object> port : portfolios) {
            if ("PUBLISHED".equalsIgnoreCase(String.valueOf(port.get("portfolioStatus"))) || Boolean.TRUE.equals(port.get("published"))) {
                hasPublished = true;
            }
            if (port.get("linkedinUrl") != null && !port.get("linkedinUrl").toString().isBlank()) {
                hasLinkedIn = true;
            }
        }
        if (hasPublished) portPoints = 80.0;

        double socialPoints = 0.0;
        if (hasLinkedIn && hasGitHub) socialPoints = 100.0;
        else if (hasLinkedIn || hasGitHub) socialPoints = 50.0;

        // Project presentation quality based on project description lengths
        double presentationPoints = 40.0;
        if (!projects.isEmpty()) {
            double avgLen = projects.stream()
                    .mapToInt(p -> p.get("description") != null ? p.get("description").toString().length() : 0)
                    .average()
                    .orElse(0.0);
            if (avgLen >= 100) presentationPoints = 100.0;
            else if (avgLen >= 40) presentationPoints = 75.0;
        }

        res.industryScore = (int) Math.min(100.0, (portPoints * 0.4) + (socialPoints * 0.3) + (presentationPoints * 0.3));

        // Combined dynamic score
        res.score = (int) Math.round(
                (res.academicScore * 0.25) +
                (res.technicalScore * 0.30) +
                (res.careerScore * 0.20) +
                (res.consistencyScore * 0.15) +
                (res.industryScore * 0.10)
        );

        // Map Score to Tier
        if (res.score >= 90) res.tier = "Elite Candidate";
        else if (res.score >= 80) res.tier = "High Potential";
        else if (res.score >= 60) res.tier = "Placement Ready";
        else if (res.score >= 40) res.tier = "Developing Candidate";
        else res.tier = "Foundation Stage";

        // Confidence level
        int conf = 50;
        if (!semesters.isEmpty()) conf += 10;
        if (!projects.isEmpty()) conf += 15;
        if (!skills.isEmpty()) conf += 10;
        if (!certificates.isEmpty()) conf += 10;
        if (hasPublished) conf += 5;
        res.confidence = Math.min(100, conf);

        return res;
    }
}
