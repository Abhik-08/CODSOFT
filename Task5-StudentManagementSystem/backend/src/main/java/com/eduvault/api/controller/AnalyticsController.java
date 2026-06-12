package com.eduvault.api.controller;

import com.eduvault.api.dto.DashboardStatsDto;
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

    @GetMapping("/dashboard")
    @Operation(summary = "Get dashboard statistics", description = "Fetch overview statistics for total/active students and grade trends")
    public ResponseEntity<DashboardStatsDto> getDashboardStats() {
        return ResponseEntity.ok(analyticsService.getDashboardStats());
    }

    @GetMapping("/cgpa")
    @Operation(summary = "Get CGPA analytics", description = "Calculate CGPA ranges, averages, and highest/lowest metrics dynamically")
    public ResponseEntity<Map<String, Object>> getCgpaAnalytics() {
        return ResponseEntity.ok(analyticsService.getCgpaAnalytics());
    }

    @GetMapping("/attendance")
    @Operation(summary = "Get attendance analytics", description = "Calculate cohort attendance statistics dynamically")
    public ResponseEntity<Map<String, Object>> getAttendanceAnalytics() {
        return ResponseEntity.ok(analyticsService.getAttendanceAnalytics());
    }

    @GetMapping("/departments")
    @Operation(summary = "Get department statistics", description = "Fetch student counts per department")
    public ResponseEntity<Map<String, Long>> getDepartmentAnalytics() {
        return ResponseEntity.ok(analyticsService.getDepartmentAnalytics());
    }

    @GetMapping("/placement")
    @Operation(summary = "Get placement statistics", description = "Fetch dynamic placement readiness ratios and metrics")
    public ResponseEntity<Map<String, Object>> getPlacementAnalytics() {
        return ResponseEntity.ok(analyticsService.getPlacementAnalytics());
    }

    @GetMapping("/placement-intelligence")
    @Operation(summary = "Get placement intelligence cohort statistics", description = "Fetch overview statistics for average placement scores, tier distributions, and departmental performance comparison")
    public ResponseEntity<Map<String, Object>> getPlacementIntelligenceAnalytics() {
        return ResponseEntity.ok(analyticsService.getPlacementIntelligenceAnalytics());
    }
}
