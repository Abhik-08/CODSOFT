package com.eduvault.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class AiAnalysisDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnalysisResponse {
        private Long studentId;
        private String studentName;
        private String academicStanding;
        private Double currentGpa;
        private Double currentAttendance;
        private String performanceAnalysis;
        private String placementReadiness;
        private List<String> improvementSuggestions;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecommendationResponse {
        private Long studentId;
        private String studentName;
        private String suggestedCareerPath;
        private List<String> certificationRecommendations;
        private List<String> careerOpportunities;
        private String skillGapAnalysis;
    }
}
