package com.eduvault.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RiskReportDto {
    private Long id;

    @NotNull(message = "Student ID is required")
    private Long studentId;

    private String studentName;

    @NotBlank(message = "Risk level is required")
    private String riskLevel; // HIGH_RISK, MEDIUM_RISK, LOW_RISK

    private String reason;

    private LocalDateTime calculatedAt;
}
