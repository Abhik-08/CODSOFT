package com.eduvault.api.controller;

import com.eduvault.api.dto.AiAnalysisDto;
import com.eduvault.api.dto.RecommendationDto;
import com.eduvault.api.service.AiRecommendationService;
import com.eduvault.api.service.AiPromptBuilder;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/ai")
@Tag(name = "AI Insights Console", description = "APIs for AI recommendations and academic risk alerts")
public class AiController {

    private final AiRecommendationService aiRecommendationService;
    private final AiPromptBuilder aiPromptBuilder;

    public AiController(AiRecommendationService aiRecommendationService, AiPromptBuilder aiPromptBuilder) {
        this.aiRecommendationService = aiRecommendationService;
        this.aiPromptBuilder = aiPromptBuilder;
    }

    @GetMapping("/recommendations/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY') or @securityUtils.hasAccessToStudent(#studentId)")
    @Operation(summary = "Get student recommendations", description = "Fetch predictive growth and course recommendations for a student")
    public ResponseEntity<List<RecommendationDto>> getStudentRecommendations(@PathVariable Long studentId) {
        return ResponseEntity.ok(aiRecommendationService.getRecommendationsForStudent(studentId));
    }

    @GetMapping("/alerts")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    @Operation(summary = "Get global alerts", description = "Retrieve global system academic status alerts")
    public ResponseEntity<List<RecommendationDto>> getGlobalAlerts() {
        return ResponseEntity.ok(aiRecommendationService.getGlobalAlerts());
    }

    @PostMapping("/analyze-student/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    @Operation(summary = "Analyze a student", description = "Generate detailed GPA, attendance, academic standing and improvement suggestions for a student")
    public ResponseEntity<AiAnalysisDto.AnalysisResponse> analyzeStudent(@PathVariable Long id) {
        return ResponseEntity.ok(aiRecommendationService.analyzeStudent(id));
    }

    @PostMapping("/recommendations/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY') or @securityUtils.hasAccessToStudent(#id)")
    @Operation(summary = "Generate career recommendations", description = "Generate certification and career path recommendations for a student")
    public ResponseEntity<AiAnalysisDto.RecommendationResponse> getAiRecommendations(@PathVariable Long id) {
        return ResponseEntity.ok(aiRecommendationService.getAiRecommendations(id));
    }

    @GetMapping("/copilot-prompt")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get Academic Intelligence Assistant system prompt", description = "Fetch the compiled system instruction prompt with injected cohort context")
    public ResponseEntity<Map<String, String>> getCopilotPrompt() {
        return ResponseEntity.ok(Map.of("prompt", aiPromptBuilder.buildSystemPrompt()));
    }
}
