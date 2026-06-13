package com.eduvault.api.service;

import com.eduvault.api.dto.RoadmapDto;
import com.eduvault.api.model.Portfolio;
import com.eduvault.api.model.Student;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class StudentRoadmapEngine {

    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String DURATION_180_DAYS = "180 Days";
    private static final String DURATION_90_DAYS = "90 Days";

    public RoadmapDto generateRoadmap(Student student, String roadmapType) {
        double cgpa = student.getGpa() != null ? student.getGpa() : 0.0;
        double attendance = student.getAttendance() != null ? student.getAttendance() : 100.0;
        int placementScore = student.getPlacementScore() != null ? student.getPlacementScore() : 0;
        int riskScore = student.getRiskScore() != null ? student.getRiskScore() : 0;
        String dept = student.getDepartment() != null ? student.getDepartment().toUpperCase() : "";

        // Extract portfolio data
        List<String> skills = new ArrayList<>();
        List<Map<String, Object>> projects = new ArrayList<>();
        List<Map<String, Object>> certs = new ArrayList<>();

        if (student.getPortfolios() != null) {
            for (Portfolio p : student.getPortfolios()) {
                skills.addAll(deserializeList(p.getSkillsJson()));
                projects.addAll(deserializeMapList(p.getProjectsJson()));
                certs.addAll(deserializeMapList(p.getCertificatesJson()));
            }
        }

        // Calculate completeness
        double portfolioCompleteness = calculatePortfolioCompleteness(student, skills, projects, certs);

        // Determine priority based on risk and score gaps
        String priority = "MEDIUM";
        if (riskScore > 60 || cgpa < 6.5 || attendance < 75.0) {
            priority = "HIGH";
        } else if (cgpa >= 8.5 && placementScore >= 80) {
            priority = "LOW";
        }

        int studentSeed = student.getId().hashCode() + roadmapType.hashCode();
        Random rand = new Random(studentSeed);

        RoadmapDto.RoadmapDtoBuilder builder = RoadmapDto.builder()
                .studentId(student.getId())
                .roadmapType(roadmapType)
                .priority(priority)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now());

        switch (roadmapType.toUpperCase()) {
            case "ACADEMIC":
                buildAcademicRoadmap(builder, cgpa, attendance, dept, rand);
                break;
            case "PLACEMENT":
                buildPlacementRoadmap(builder, placementScore, projects, rand);
                break;
            case "PORTFOLIO":
                buildPortfolioRoadmap(builder, student, portfolioCompleteness, rand);
                break;
            case "SKILL":
                buildSkillRoadmap(builder, skills, rand);
                break;
            case "CAREER":
            default:
                buildCareerRoadmap(builder, cgpa, dept, rand);
                break;
        }

        return builder.build();
    }

    private void buildAcademicRoadmap(RoadmapDto.RoadmapDtoBuilder builder, double cgpa, double attendance, String dept, Random rand) {
        double targetScore = Math.clamp(cgpa + 1.0, 8.5, 10.0);
        List<String> milestones = new ArrayList<>();
        milestones.add(String.format("Milestone 1: Bring attendance above 85%% within the next %d days", (cgpa < 6.5 ? 45 : 30)));
        milestones.add("Milestone 2: Complete all pending lab tasks and submit tutorial logs");
        milestones.add("Milestone 3: Secure an average of 'B+' or higher in upcoming internal assessments");
        milestones.add(String.format("Milestone 4: Elevate overall CGPA to target score of %.2f", targetScore));

        List<String> actionItems = new ArrayList<>();
        if (attendance < 80.0) {
            actionItems.add(String.format("Improve attendance by attending consecutive lectures in %s core subjects", dept));
        }
        actionItems.add("Solve 5 previous year question papers before main examinations");
        actionItems.add(RoadmapDatabase.ACTIONS.get(rand.nextInt(RoadmapDatabase.ACTIONS.size())));
        actionItems.add(RoadmapDatabase.ACTIONS.get((rand.nextInt(RoadmapDatabase.ACTIONS.size() - 1) + 1) % RoadmapDatabase.ACTIONS.size()));

        List<String> recommendations = new ArrayList<>();
        recommendations.add("Schedule focus blocks using Pomodoro technique daily for hard subjects");
        recommendations.add(RoadmapDatabase.SUGGESTIONS.get(rand.nextInt(RoadmapDatabase.SUGGESTIONS.size())));
        recommendations.add(RoadmapDatabase.SUGGESTIONS.get((rand.nextInt(RoadmapDatabase.SUGGESTIONS.size() - 1) + 1) % RoadmapDatabase.SUGGESTIONS.size()));

        builder.currentScore(cgpa)
                .targetScore(targetScore)
                .currentStatus(String.format("Current CGPA: %.2f | Attendance: %.1f%%", cgpa, attendance))
                .targetStatus(String.format("Target CGPA: %.2f | Attendance: 90.0%%", targetScore))
                .estimatedDuration(cgpa < 6.5 ? DURATION_180_DAYS : DURATION_90_DAYS)
                .milestones(milestones)
                .actionItems(actionItems)
                .recommendations(recommendations);
    }

    private void buildPlacementRoadmap(RoadmapDto.RoadmapDtoBuilder builder, int placementScore, List<Map<String, Object>> projects, Random rand) {
        double targetScore = Math.clamp(placementScore + 20.0, 85.0, 100.0);
        List<String> milestones = new ArrayList<>();
        milestones.add("Milestone 1: Complete 50+ DSA problem patterns on platforms");
        milestones.add("Milestone 2: Refine elevator pitch and perform mock interview simulation");
        milestones.add("Milestone 3: Complete 1 industry-ready project featuring full documentation");
        milestones.add(String.format("Milestone 4: Cross placement score milestone of %.0f points", targetScore));

        List<String> actionItems = new ArrayList<>();
        if (projects.size() < 2) {
            actionItems.add("Develop and publish 1 new backend application with swagger documentation");
        }
        actionItems.add(RoadmapDatabase.ACTIONS.get(rand.nextInt(RoadmapDatabase.ACTIONS.size())));
        actionItems.add(RoadmapDatabase.ACTIONS.get((rand.nextInt(RoadmapDatabase.ACTIONS.size() - 1) + 1) % RoadmapDatabase.ACTIONS.size()));

        List<String> recommendations = new ArrayList<>();
        recommendations.add("Apply STAR method when describing project highlights in interviews");
        recommendations.add(RoadmapDatabase.SUGGESTIONS.get(rand.nextInt(RoadmapDatabase.SUGGESTIONS.size())));
        recommendations.add(RoadmapDatabase.LEARNING.get(rand.nextInt(RoadmapDatabase.LEARNING.size())));

        builder.currentScore((double) placementScore)
                .targetScore(targetScore)
                .currentStatus(String.format("Placement Readiness Index: %d", placementScore))
                .targetStatus(String.format("Target Employability Level: %.0f (Elite Tier)", targetScore))
                .estimatedDuration(placementScore < 60 ? DURATION_180_DAYS : DURATION_90_DAYS)
                .milestones(milestones)
                .actionItems(actionItems)
                .recommendations(recommendations);
    }

    private void buildPortfolioRoadmap(RoadmapDto.RoadmapDtoBuilder builder, Student student, double portfolioCompleteness, Random rand) {
        List<String> milestones = new ArrayList<>();
        milestones.add("Milestone 1: Fill out summary section and add profile image");
        milestones.add("Milestone 2: Link active GitHub and LinkedIn profiles");
        milestones.add("Milestone 3: Add detailed write-up and tag tech stacks for major projects");
        milestones.add("Milestone 4: Deploy and share live portfolio URL on professional profiles");

        List<String> actionItems = new ArrayList<>();
        if (student.getGithubUrl() == null || student.getGithubUrl().isBlank()) {
            actionItems.add("Configure and link GitHub account to showcase active codebases");
        }
        actionItems.add(RoadmapDatabase.ACTIONS.get(rand.nextInt(RoadmapDatabase.ACTIONS.size())));
        actionItems.add(RoadmapDatabase.ACTIONS.get((rand.nextInt(RoadmapDatabase.ACTIONS.size() - 1) + 1) % RoadmapDatabase.ACTIONS.size()));

        List<String> recommendations = new ArrayList<>();
        recommendations.add(RoadmapDatabase.SUGGESTIONS.get(rand.nextInt(RoadmapDatabase.SUGGESTIONS.size())));
        recommendations.add(RoadmapDatabase.PROJECTS.get(rand.nextInt(RoadmapDatabase.PROJECTS.size())));

        builder.currentScore(portfolioCompleteness)
                .targetScore(95.0)
                .currentStatus(String.format("Portfolio Completeness Score: %.1f%%", portfolioCompleteness))
                .targetStatus("Fully optimized online profile (95%+) ready for job submissions")
                .estimatedDuration("30 Days")
                .milestones(milestones)
                .actionItems(actionItems)
                .recommendations(recommendations);
    }

    private void buildSkillRoadmap(RoadmapDto.RoadmapDtoBuilder builder, List<String> skills, Random rand) {
        double currentScore = Math.min(100, skills.size() * 10);
        List<String> milestones = new ArrayList<>();
        milestones.add("Milestone 1: Master programming basics and standard library features");
        milestones.add("Milestone 2: Build 2 mini-applications testing advanced technologies");
        milestones.add("Milestone 3: Implement database integration and secure authentication");
        milestones.add("Milestone 4: Obtain peer/faculty validation on technical capability");

        List<String> actionItems = new ArrayList<>();
        if (skills.isEmpty()) {
            actionItems.add("Learn essential core tech skills such as DSA, Git, and SQL");
        }
        actionItems.add(RoadmapDatabase.ACTIONS.get(rand.nextInt(RoadmapDatabase.ACTIONS.size())));
        actionItems.add(RoadmapDatabase.ACTIONS.get((rand.nextInt(RoadmapDatabase.ACTIONS.size() - 1) + 1) % RoadmapDatabase.ACTIONS.size()));

        List<String> recommendations = new ArrayList<>();
        recommendations.add(RoadmapDatabase.LEARNING.get(rand.nextInt(RoadmapDatabase.LEARNING.size())));
        recommendations.add(RoadmapDatabase.LEARNING.get((rand.nextInt(RoadmapDatabase.LEARNING.size() - 1) + 1) % RoadmapDatabase.LEARNING.size()));

        builder.currentScore(currentScore)
                .targetScore(90.0)
                .currentStatus(String.format("Current Core Skills Count: %d", skills.size()))
                .targetStatus("Acquired a comprehensive full-stack and domain technology stack")
                .estimatedDuration(DURATION_90_DAYS)
                .milestones(milestones)
                .actionItems(actionItems)
                .recommendations(recommendations);
    }

    private void buildCareerRoadmap(RoadmapDto.RoadmapDtoBuilder builder, double cgpa, String dept, Random rand) {
        List<String> milestones = new ArrayList<>();
        milestones.add("Milestone 1: Complete foundational specialization coursework");
        milestones.add("Milestone 2: Achieve professional domain-relevant certification");
        milestones.add("Milestone 3: Apply specialized skills on a production-ready application");
        milestones.add("Milestone 4: Engage with industry experts and seek mentorship");

        List<String> actionItems = new ArrayList<>();
        actionItems.add(RoadmapDatabase.ACTIONS.get(rand.nextInt(RoadmapDatabase.ACTIONS.size())));
        actionItems.add(RoadmapDatabase.ACTIONS.get((rand.nextInt(RoadmapDatabase.ACTIONS.size() - 1) + 1) % RoadmapDatabase.ACTIONS.size()));

        List<String> recommendations = new ArrayList<>();
        recommendations.add(RoadmapDatabase.CERTIFICATIONS.get(rand.nextInt(RoadmapDatabase.CERTIFICATIONS.size())));
        recommendations.add(RoadmapDatabase.CERTIFICATIONS.get((rand.nextInt(RoadmapDatabase.CERTIFICATIONS.size() - 1) + 1) % RoadmapDatabase.CERTIFICATIONS.size()));

        builder.currentScore(cgpa * 10)
                .targetScore(90.0)
                .currentStatus("Career exploration and industry alignment phase")
                .targetStatus(String.format("Acdemically and practically specialized in %s domain", dept))
                .estimatedDuration(DURATION_180_DAYS)
                .milestones(milestones)
                .actionItems(actionItems)
                .recommendations(recommendations);
    }

    private double calculatePortfolioCompleteness(Student student, List<String> skills, List<Map<String, Object>> projects, List<Map<String, Object>> certs) {
        double score = 10.0; // Base details config
        if (student.getGithubUrl() != null && !student.getGithubUrl().isBlank()) score += 15.0;
        if (student.getLinkedinUrl() != null && !student.getLinkedinUrl().isBlank()) score += 15.0;
        if (student.getPortfolioSummary() != null && !student.getPortfolioSummary().isBlank()) score += 20.0;
        if (!skills.isEmpty()) score += 15.0;
        if (!projects.isEmpty()) score += 15.0;
        if (!certs.isEmpty()) score += 10.0;
        return score;
    }

    private List<String> deserializeList(String json) {
        if (json == null || json.isBlank()) return new ArrayList<>();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    private List<Map<String, Object>> deserializeMapList(String json) {
        if (json == null || json.isBlank()) return new ArrayList<>();
        try {
            return objectMapper.readValue(json, new TypeReference<List<Map<String, Object>>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
}
