package com.eduvault.api.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RecommendationDto {
    private String id;
    private Long studentId;
    private String studentName;
    private String type; // ACADEMIC_RISK, EXCELLENCE, ATTENDANCE_WARNING, CAREER_PATH
    private String title;
    private String description;
    private Double confidence;
    private String suggestedAction;
}
