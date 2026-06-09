package com.eduvault.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

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

    private LocalDateTime createdAt;
}
