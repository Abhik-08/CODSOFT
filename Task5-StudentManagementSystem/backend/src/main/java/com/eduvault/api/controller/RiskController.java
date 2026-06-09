package com.eduvault.api.controller;

import com.eduvault.api.dto.RiskReportDto;
import com.eduvault.api.service.RiskDetectionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/risks")
@Tag(name = "Risk Detection Engine", description = "APIs for tracking student academic performance risks")
public class RiskController {

    private final RiskDetectionService riskDetectionService;

    public RiskController(RiskDetectionService riskDetectionService) {
        this.riskDetectionService = riskDetectionService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    @Operation(summary = "Get all risks", description = "Retrieve academic risk status reports for all students")
    public ResponseEntity<List<RiskReportDto>> getAllRisks() {
        return ResponseEntity.ok(riskDetectionService.getAllRisks());
    }

    @GetMapping("/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY') or @securityUtils.hasAccessToStudent(#studentId)")
    @Operation(summary = "Get student risk by ID", description = "Retrieve specific risk status of a student by ID")
    public ResponseEntity<RiskReportDto> getRiskByStudentId(@PathVariable Long studentId) {
        return ResponseEntity.ok(riskDetectionService.getRiskByStudentId(studentId));
    }

    @PostMapping("/recalculate")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    @Operation(summary = "Recalculate risk reports", description = "Triggers an evaluation of GPA and attendance metrics across all students")
    public ResponseEntity<List<RiskReportDto>> recalculateRisks() {
        return ResponseEntity.ok(riskDetectionService.recalculateRisks());
    }
}
