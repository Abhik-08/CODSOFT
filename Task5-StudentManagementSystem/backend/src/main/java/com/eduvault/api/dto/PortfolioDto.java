package com.eduvault.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
public class PortfolioDto {
    private Long id;

    @NotNull(message = "Student ID is required")
    private Long studentId;

    @NotBlank(message = "Portfolio title is required")
    private String title;

    @NotBlank(message = "Template type is required")
    private String templateType;

    private String portfolioUrl;

    private boolean published;

    private String firestoreId;

    private String portfolioName;

    private String theme;

    private String summary;

    private List<String> skills;

    private List<Map<String, Object>> projects;

    private List<Map<String, Object>> achievements;

    private List<Map<String, Object>> certificates;

    private String about;

    private String email;

    private String phone;

    private Map<String, String> socialLinks;

    private String githubUrl;

    private String linkedinUrl;

    private String portfolioStatus;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
