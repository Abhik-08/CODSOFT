package com.eduvault.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
public class StudentDto {
    private Long id;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Enrollment number is required")
    private String enrollmentNumber;

    @NotNull(message = "Date of birth is required")
    private LocalDate dateOfBirth;

    @NotBlank(message = "Department is required")
    private String department;

    @NotNull(message = "Semester is required")
    private Integer semester;

    @NotBlank(message = "Status is required")
    private String status;

    private String imageUrl;
    private Double gpa;
    private Double attendanceRate;
    private Boolean placementReady;
    private String placementStatus;
    private Integer offerCount;
    private String firestoreId;
    private List<Map<String, Object>> grades;
    private List<Map<String, Object>> attendance;
    private Integer placementScore;
    private String placementTier;
    private List<String> strengths;
    private List<String> weaknesses;
    private List<String> skillGaps;
    private List<String> careerGaps;
    private List<String> projectGaps;
    private List<String> certificationGaps;
    private List<String> recommendations;
    private List<String> careerInsights;
    private List<String> growthRoadmap;
    private Integer confidenceLevel;
    private java.time.LocalDateTime lastCalculatedAt;
    private Integer academicReadinessScore;
    private Integer technicalReadinessScore;
    private Integer careerReadinessScore;
    private Integer consistencyReadinessScore;
    private Integer industryReadinessScore;

    private Integer riskScore;
    private String riskCategory;
    private List<String> riskFactors;
    private List<String> riskReasons;
    private List<String> interventionSuggestions;
    private List<String> priorityActions;
    private List<Integer> riskTrend;
    private java.time.LocalDateTime riskLastCalculatedAt;

    private String phone;
    private String githubUrl;
    private String linkedinUrl;
    private String portfolioUrl;
    private String portfolioTitle;
    private String portfolioSummary;
}
