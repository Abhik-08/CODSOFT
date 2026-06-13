package com.eduvault.api.controller;

import com.eduvault.api.dto.RoadmapDto;
import com.eduvault.api.service.RoadmapGeneratorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/roadmaps")
@Tag(name = "Improvement Roadmaps", description = "APIs for student growth and improvement plans")
public class RoadmapController {

    private final RoadmapGeneratorService roadmapService;

    public RoadmapController(RoadmapGeneratorService roadmapService) {
        this.roadmapService = roadmapService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    @Operation(summary = "Get all roadmaps", description = "Retrieve all student improvement roadmaps across cohorts")
    public ResponseEntity<List<RoadmapDto>> getAllRoadmaps() {
        return ResponseEntity.ok(roadmapService.getAllRoadmaps());
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY') or @securityUtils.hasAccessToStudent(#studentId)")
    @Operation(summary = "Get roadmaps for a student", description = "Retrieve all roadmaps generated for a specific student ID")
    public ResponseEntity<List<RoadmapDto>> getRoadmapsByStudentId(@PathVariable Long studentId) {
        return ResponseEntity.ok(roadmapService.getRoadmapsByStudentId(studentId));
    }

    @PostMapping("/student/{studentId}/generate")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    @Operation(summary = "Generate a student improvement roadmap", description = "Generate or regenerate a personalized roadmap by category")
    public ResponseEntity<RoadmapDto> generateRoadmap(
            @PathVariable Long studentId,
            @RequestParam String type) {
        return ResponseEntity.ok(roadmapService.generateRoadmap(studentId, type));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    @Operation(summary = "Update an existing roadmap", description = "Modify and save fields on a student improvement roadmap")
    public ResponseEntity<RoadmapDto> updateRoadmap(
            @PathVariable Long id,
            @RequestBody RoadmapDto roadmapDto) {
        return ResponseEntity.ok(roadmapService.updateRoadmap(id, roadmapDto));
    }
}
