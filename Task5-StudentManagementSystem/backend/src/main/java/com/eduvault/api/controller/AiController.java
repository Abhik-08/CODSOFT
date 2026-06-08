package com.eduvault.api.controller;

import com.eduvault.api.dto.RecommendationDto;
import com.eduvault.api.service.AiRecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ai")
@CrossOrigin(origins = "*")
public class AiController {

    @Autowired
    private AiRecommendationService aiRecommendationService;

    @GetMapping("/recommendations/{studentId}")
    public ResponseEntity<List<RecommendationDto>> getStudentRecommendations(@PathVariable Long studentId) {
        return ResponseEntity.ok(aiRecommendationService.getRecommendationsForStudent(studentId));
    }

    @GetMapping("/alerts")
    public ResponseEntity<List<RecommendationDto>> getGlobalAlerts() {
        return ResponseEntity.ok(aiRecommendationService.getGlobalAlerts());
    }
}
