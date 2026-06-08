package com.eduvault.api.service;

import com.eduvault.api.dto.RecommendationDto;
import java.util.List;

public interface AiRecommendationService {
    List<RecommendationDto> getRecommendationsForStudent(Long studentId);
    List<RecommendationDto> getGlobalAlerts();
}
