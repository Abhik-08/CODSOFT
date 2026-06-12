package com.eduvault.api.controller;

import com.eduvault.api.dto.RiskDto;
import com.eduvault.api.service.RiskDetectionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/students")
@Tag(name = "Academic Risk Detection Engine", description = "APIs for tracking student academic, placement, and engagement risks")
public class RiskDetectionController {

    private final RiskDetectionService riskService;

    public RiskDetectionController(RiskDetectionService riskService) {
        this.riskService = riskService;
    }

    @GetMapping("/{studentId}/academic-risk")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY') or @securityUtils.hasAccessToStudent(#studentId)")
    @Operation(summary = "Get student academic risk report", description = "Fetch or dynamically compute academic risk levels and explainable factors")
    public ResponseEntity<RiskDto> getAcademicRisk(@PathVariable String studentId) {
        return ResponseEntity.ok(riskService.getRiskByStudentId(studentId));
    }

    @PostMapping("/{studentId}/academic-risk/recalculate")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY') or @securityUtils.hasAccessToStudent(#studentId)")
    @Operation(summary = "Trigger risk recalculation", description = "Force recalculate academic, placement, engagement, skill, and growth risks")
    public ResponseEntity<RiskDto> recalculate(@PathVariable String studentId) {
        return ResponseEntity.ok(riskService.recalculate(studentId));
    }

    @GetMapping("/academic-risk/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    @Operation(summary = "Get all student risk reports", description = "Retrieve list of all calculated risk reports")
    public ResponseEntity<List<RiskDto>> getAllRisks() {
        return ResponseEntity.ok(riskService.getAllRisks());
    }
}
