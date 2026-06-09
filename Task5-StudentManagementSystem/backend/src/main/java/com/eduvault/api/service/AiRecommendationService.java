package com.eduvault.api.service;

import com.eduvault.api.dto.AiAnalysisDto;
import com.eduvault.api.dto.RecommendationDto;
import java.util.List;

public interface AiRecommendationService {
    List<RecommendationDto> getRecommendationsForStudent(Long studentId);
    List<RecommendationDto> getGlobalAlerts();
    AiAnalysisDto.AnalysisResponse analyzeStudent(Long studentId);
    AiAnalysisDto.RecommendationResponse getAiRecommendations(Long studentId);
}
