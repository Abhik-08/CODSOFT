package com.eduvault.api.service;

import com.eduvault.api.dto.RecommendationDto;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AiRecommendationServiceImpl implements AiRecommendationService {

    @Override
    public List<RecommendationDto> getRecommendationsForStudent(Long studentId) {
        List<RecommendationDto> list = new ArrayList<>();
        list.add(RecommendationDto.builder()
                .id("rec-101")
                .studentId(studentId)
                .studentName("John Doe")
                .type("EXCELLENCE")
                .title("Advanced Algorithms Selection")
                .description("Student CGPA in mathematical courses is high (9.75). Recommend enrolling in advanced honors program.")
                .confidence(0.95)
                .suggestedAction("Send honors enrollment invitation email")
                .build());
        return list;
    }

    @Override
    public List<RecommendationDto> getGlobalAlerts() {
        return new ArrayList<>();
    }
}
