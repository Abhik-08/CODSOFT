package com.eduvault.api.controller;

import com.eduvault.api.dto.AnalyticsDto;
import com.eduvault.api.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/analytics")
@Tag(name = "Analytics Hub", description = "APIs for cohort-level metrics and statistics")
@PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/overview")
    @Operation(summary = "Get analytics overview", description = "Fetch cohort overview stats (total/active students, top department, placement percentage)")
    public ResponseEntity<AnalyticsDto> getOverview() {
        return ResponseEntity.ok(analyticsService.getOverview());
    }

    @GetMapping("/cgpa-distribution")
    @Operation(summary = "Get CGPA distribution", description = "Calculate CGPA ranges and progression curve dynamically")
    public ResponseEntity<Map<String, Object>> getCgpaDistribution() {
        return ResponseEntity.ok(analyticsService.getCgpaDistribution());
    }

    @GetMapping("/attendance")
    @Operation(summary = "Get attendance stability/distribution", description = "Retrieve attendance metrics and monthly rates")
    public ResponseEntity<Map<String, Object>> getAttendanceAnalytics() {
        return ResponseEntity.ok(analyticsService.getAttendanceAnalytics());
    }

    @GetMapping("/risk")
    @Operation(summary = "Get risk statistics", description = "Fetch academic risk distribution, department-wise and semester-wise risk averages")
    public ResponseEntity<Map<String, Object>> getRiskAnalytics() {
        return ResponseEntity.ok(analyticsService.getRiskAnalytics());
    }

    @GetMapping("/departments")
    @Operation(summary = "Get department metrics", description = "Fetch department enrollment counts and CGPA averages")
    public ResponseEntity<Map<String, Object>> getDepartmentAnalytics() {
        return ResponseEntity.ok(analyticsService.getDepartmentAnalytics());
    }

    @GetMapping("/placement")
    @Operation(summary = "Get placement statistics", description = "Fetch placement readiness levels, tiers, score distributions, and dimensional averages")
    public ResponseEntity<Map<String, Object>> getPlacementAnalytics() {
        return ResponseEntity.ok(analyticsService.getPlacementAnalytics());
    }
}
