package com.eduvault.api.controller;

import com.eduvault.api.dto.GradeDto;
import com.eduvault.api.service.GradeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/grades")
@Tag(name = "Grade Management", description = "APIs for recording and reviewing grades")
public class GradeController {

    private final GradeService gradeService;

    public GradeController(GradeService gradeService) {
        this.gradeService = gradeService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    @Operation(summary = "Get all grades", description = "Retrieve a list of all recorded grades")
    public ResponseEntity<List<GradeDto>> getAllGrades() {
        return ResponseEntity.ok(gradeService.getAllGrades());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY') or @securityUtils.hasAccessToGrade(#id)")
    @Operation(summary = "Get grade by ID", description = "Retrieve details of a specific grade entry")
    public ResponseEntity<GradeDto> getGradeById(@PathVariable Long id) {
        return ResponseEntity.ok(gradeService.getGradeById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    @Operation(summary = "Create grade entry", description = "Record a new grade for a student and course")
    public ResponseEntity<GradeDto> createGrade(@Valid @RequestBody GradeDto gradeDto) {
        return new ResponseEntity<>(gradeService.createGrade(gradeDto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    @Operation(summary = "Update grade entry", description = "Modify an existing grade entry")
    public ResponseEntity<GradeDto> updateGrade(@PathVariable Long id, @Valid @RequestBody GradeDto gradeDto) {
        return ResponseEntity.ok(gradeService.updateGrade(id, gradeDto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    @Operation(summary = "Delete grade entry", description = "Remove a grade record")
    public ResponseEntity<Void> deleteGrade(@PathVariable Long id) {
        gradeService.deleteGrade(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY') or @securityUtils.hasAccessToStudent(#studentId)")
    @Operation(summary = "Get grades by student ID", description = "Retrieve all grade entries for a given student")
    public ResponseEntity<List<GradeDto>> getGradesByStudentId(@PathVariable Long studentId) {
        return ResponseEntity.ok(gradeService.getGradesByStudentId(studentId));
    }
}
