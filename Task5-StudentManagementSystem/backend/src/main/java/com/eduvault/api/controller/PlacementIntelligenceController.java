package com.eduvault.api.controller;

import com.eduvault.api.dto.PlacementIntelligenceDto;
import com.eduvault.api.service.PlacementIntelligenceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/students")
@Tag(name = "Placement Intelligence Console", description = "APIs for dynamic placement intelligence scoring and explainable insights")
@CrossOrigin(origins = "*")
public class PlacementIntelligenceController {

    private final PlacementIntelligenceService placementService;

    public PlacementIntelligenceController(PlacementIntelligenceService placementService) {
        this.placementService = placementService;
    }

    @GetMapping("/{studentId}/placement-intelligence")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY') or @securityUtils.hasAccessToStudent(#studentId)")
    @Operation(summary = "Get student placement intelligence", description = "Fetch or dynamically compute placement scores and explainable career insights")
    public ResponseEntity<PlacementIntelligenceDto> getPlacementIntelligence(@PathVariable String studentId) {
        return ResponseEntity.ok(placementService.getPlacementIntelligence(studentId));
    }

    @PostMapping("/{studentId}/placement-intelligence/recalculate")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY') or @securityUtils.hasAccessToStudent(#studentId)")
    @Operation(summary = "Trigger placement intelligence recalculation", description = "Force recalculate placement score and career insights by pulling live data from Firestore")
    public ResponseEntity<PlacementIntelligenceDto> recalculate(@PathVariable String studentId) {
        return ResponseEntity.ok(placementService.recalculate(studentId));
    }
}
