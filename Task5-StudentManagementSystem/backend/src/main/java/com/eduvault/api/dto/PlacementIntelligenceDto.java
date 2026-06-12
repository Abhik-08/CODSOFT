package com.eduvault.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlacementIntelligenceDto {
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
    private LocalDateTime lastCalculatedAt;
    private Integer academicReadinessScore;
    private Integer technicalReadinessScore;
    private Integer careerReadinessScore;
    private Integer consistencyReadinessScore;
    private Integer industryReadinessScore;
}
