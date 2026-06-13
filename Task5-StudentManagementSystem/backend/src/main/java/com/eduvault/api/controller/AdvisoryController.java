package com.eduvault.api.controller;

import com.eduvault.api.dto.AdvisoryDto;
import com.eduvault.api.service.AdvisoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/advisories")
@Tag(name = "Student Advisories", description = "APIs for managing student academic advisories and intervention states")
public class AdvisoryController {

    private final AdvisoryService advisoryService;

    public AdvisoryController(AdvisoryService advisoryService) {
        this.advisoryService = advisoryService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    @Operation(summary = "Create student advisory", description = "Create a new advisory directive for a student")
    public ResponseEntity<AdvisoryDto> createAdvisory(@RequestBody AdvisoryDto dto) {
        return new ResponseEntity<>(advisoryService.createAdvisory(dto), HttpStatus.CREATED);
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY') or @securityUtils.hasAccessToStudent(#studentId)")
    @Operation(summary = "Get student advisories", description = "Retrieve all advisories logged for a specific student")
    public ResponseEntity<List<AdvisoryDto>> getStudentAdvisories(@PathVariable String studentId) {
        return ResponseEntity.ok(advisoryService.getAdvisoriesByStudent(studentId));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY') or @securityUtils.isSelfUserAdvisory(#id)")
    @Operation(summary = "Update advisory status", description = "Modify the viewing or completion state of an advisory")
    public ResponseEntity<AdvisoryDto> updateAdvisoryStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(advisoryService.updateAdvisoryStatus(id, status));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    @Operation(summary = "Delete advisory", description = "Remove an advisory record from the platform database")
    public ResponseEntity<Void> deleteAdvisory(@PathVariable Long id) {
        advisoryService.deleteAdvisory(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    @Operation(summary = "Get dashboard advisory metrics", description = "Fetch count totals of active, critical, and resolved advisories")
    public ResponseEntity<Map<String, Long>> getDashboardAdvisoryStats() {
        return ResponseEntity.ok(advisoryService.getDashboardAdvisoryStats());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    @Operation(summary = "Get all advisories", description = "Retrieve a list of all logged advisories")
    public ResponseEntity<List<AdvisoryDto>> getAllAdvisories() {
        return ResponseEntity.ok(advisoryService.getAllAdvisories());
    }
}
