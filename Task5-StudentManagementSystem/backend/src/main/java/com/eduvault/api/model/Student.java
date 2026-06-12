package com.eduvault.api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "students")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "First name is required")
    @Column(nullable = false)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Column(nullable = false)
    private String lastName;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    @Column(nullable = false, unique = true)
    private String email;

    @NotBlank(message = "Enrollment number is required")
    @Column(nullable = false, unique = true)
    private String enrollmentNumber;

    @Column(nullable = false)
    private LocalDate dateOfBirth;

    @NotBlank(message = "Department is required")
    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private Integer semester;

    @Column(nullable = false)
    private String status; // ACTIVE, INACTIVE, SUSPENDED, GRADUATED

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Portfolio> portfolios = new ArrayList<>();

    @OneToOne(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    private RiskReport riskReport;

    private String imageUrl;
    
    private Double gpa;

    private Double attendance;

    private Boolean placementReady;

    private String placementStatus; // NOT_STARTED, PREPARING, INTERVIEWING, PLACED

    private Integer offerCount;

    private String firestoreId;

    @Column(length = 65536)
    private String gradesJson;

    @Column(length = 65536)
    private String attendanceJson;

    private Integer placementScore;

    private String placementTier;

    @Column(length = 65536)
    private String strengthsJson;

    @Column(length = 65536)
    private String weaknessesJson;

    @Column(length = 65536)
    private String skillGapsJson;

    @Column(length = 65536)
    private String careerGapsJson;

    @Column(length = 65536)
    private String projectGapsJson;

    @Column(length = 65536)
    private String certificationGapsJson;

    @Column(length = 65536)
    private String recommendationsJson;

    @Column(length = 65536)
    private String careerInsightsJson;

    @Column(length = 65536)
    private String growthRoadmapJson;

    private Integer confidenceLevel;

    private java.time.LocalDateTime lastCalculatedAt;

    private Integer academicReadinessScore;
    private Integer technicalReadinessScore;
    private Integer careerReadinessScore;
    private Integer consistencyReadinessScore;
    private Integer industryReadinessScore;

    private Integer riskScore;
    private String riskCategory;

    @Column(length = 65536)
    private String riskFactorsJson;

    @Column(length = 65536)
    private String riskReasonsJson;

    @Column(length = 65536)
    private String interventionSuggestionsJson;

    @Column(length = 65536)
    private String priorityActionsJson;

    @Column(length = 65536)
    private String riskTrendJson;

    private java.time.LocalDateTime riskLastCalculatedAt;

    private String phone;
    private String githubUrl;
    private String linkedinUrl;
    private String portfolioUrl;
    private String portfolioTitle;
    @Column(length = 65536)
    private String portfolioSummary;
}
