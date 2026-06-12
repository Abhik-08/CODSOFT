package com.eduvault.api.controller;

import com.eduvault.api.service.AcademicProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for academic profile subcollection CRUD.
 * Provides endpoints for semesters, subjects, certificates, projects, achievements, skills, and placement status.
 */
@RestController
@RequestMapping("/students/{studentId}")
@Tag(name = "Academic Profile", description = "Academic profile management endpoints")
@CrossOrigin(origins = "*") // NOSONAR - required for frontend dev server access, secured via API gateway in production
public class AcademicProfileController {

    private final AcademicProfileService academicProfileService;

    public AcademicProfileController(AcademicProfileService academicProfileService) {
        this.academicProfileService = academicProfileService;
    }

    // ── Semesters ───────────────────────────────────────────────────

    @GetMapping("/semesters")
    @Operation(summary = "List all semester records for a student")
    public ResponseEntity<List<Map<String, Object>>> getSemesters(@PathVariable String studentId) {
        return ResponseEntity.ok(academicProfileService.getSemesters(studentId));
    }

    @PostMapping("/semesters")
    @Operation(summary = "Add a semester record")
    public ResponseEntity<Map<String, Object>> addSemester(@PathVariable String studentId, @RequestBody Map<String, Object> data) {
        return ResponseEntity.status(HttpStatus.CREATED).body(academicProfileService.addSemester(studentId, data));
    }

    @PutMapping("/semesters/{docId}")
    @Operation(summary = "Update a semester record")
    public ResponseEntity<Map<String, Object>> updateSemester(@PathVariable String studentId, @PathVariable String docId, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(academicProfileService.updateSemester(studentId, docId, data));
    }

    @DeleteMapping("/semesters/{docId}")
    @Operation(summary = "Delete a semester record")
    public ResponseEntity<Void> deleteSemester(@PathVariable String studentId, @PathVariable String docId) {
        academicProfileService.deleteSemester(studentId, docId);
        return ResponseEntity.noContent().build();
    }

    // ── Subjects ────────────────────────────────────────────────────

    @GetMapping("/subjects")
    @Operation(summary = "List all subject records for a student")
    public ResponseEntity<List<Map<String, Object>>> getSubjects(@PathVariable String studentId) {
        return ResponseEntity.ok(academicProfileService.getSubjects(studentId));
    }

    @PostMapping("/subjects")
    @Operation(summary = "Add a subject record")
    public ResponseEntity<Map<String, Object>> addSubject(@PathVariable String studentId, @RequestBody Map<String, Object> data) {
        return ResponseEntity.status(HttpStatus.CREATED).body(academicProfileService.addSubject(studentId, data));
    }

    @PutMapping("/subjects/{docId}")
    @Operation(summary = "Update a subject record")
    public ResponseEntity<Map<String, Object>> updateSubject(@PathVariable String studentId, @PathVariable String docId, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(academicProfileService.updateSubject(studentId, docId, data));
    }

    @DeleteMapping("/subjects/{docId}")
    @Operation(summary = "Delete a subject record")
    public ResponseEntity<Void> deleteSubject(@PathVariable String studentId, @PathVariable String docId) {
        academicProfileService.deleteSubject(studentId, docId);
        return ResponseEntity.noContent().build();
    }

    // ── Certificates ────────────────────────────────────────────────

    @GetMapping("/certificates")
    @Operation(summary = "List all certificates for a student")
    public ResponseEntity<List<Map<String, Object>>> getCertificates(@PathVariable String studentId) {
        return ResponseEntity.ok(academicProfileService.getCertificates(studentId));
    }

    @PostMapping("/certificates")
    @Operation(summary = "Add a certificate")
    public ResponseEntity<Map<String, Object>> addCertificate(@PathVariable String studentId, @RequestBody Map<String, Object> data) {
        return ResponseEntity.status(HttpStatus.CREATED).body(academicProfileService.addCertificate(studentId, data));
    }

    @PutMapping("/certificates/{docId}")
    @Operation(summary = "Update a certificate")
    public ResponseEntity<Map<String, Object>> updateCertificate(@PathVariable String studentId, @PathVariable String docId, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(academicProfileService.updateCertificate(studentId, docId, data));
    }

    @DeleteMapping("/certificates/{docId}")
    @Operation(summary = "Delete a certificate")
    public ResponseEntity<Void> deleteCertificate(@PathVariable String studentId, @PathVariable String docId) {
        academicProfileService.deleteCertificate(studentId, docId);
        return ResponseEntity.noContent().build();
    }

    // ── Projects ────────────────────────────────────────────────────

    @GetMapping("/projects")
    @Operation(summary = "List all projects for a student")
    public ResponseEntity<List<Map<String, Object>>> getProjects(@PathVariable String studentId) {
        return ResponseEntity.ok(academicProfileService.getProjects(studentId));
    }

    @PostMapping("/projects")
    @Operation(summary = "Add a project")
    public ResponseEntity<Map<String, Object>> addProject(@PathVariable String studentId, @RequestBody Map<String, Object> data) {
        return ResponseEntity.status(HttpStatus.CREATED).body(academicProfileService.addProject(studentId, data));
    }

    @PutMapping("/projects/{docId}")
    @Operation(summary = "Update a project")
    public ResponseEntity<Map<String, Object>> updateProject(@PathVariable String studentId, @PathVariable String docId, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(academicProfileService.updateProject(studentId, docId, data));
    }

    @DeleteMapping("/projects/{docId}")
    @Operation(summary = "Delete a project")
    public ResponseEntity<Void> deleteProject(@PathVariable String studentId, @PathVariable String docId) {
        academicProfileService.deleteProject(studentId, docId);
        return ResponseEntity.noContent().build();
    }

    // ── Achievements ────────────────────────────────────────────────

    @GetMapping("/achievements")
    @Operation(summary = "List all achievements for a student")
    public ResponseEntity<List<Map<String, Object>>> getAchievements(@PathVariable String studentId) {
        return ResponseEntity.ok(academicProfileService.getAchievements(studentId));
    }

    @PostMapping("/achievements")
    @Operation(summary = "Add an achievement")
    public ResponseEntity<Map<String, Object>> addAchievement(@PathVariable String studentId, @RequestBody Map<String, Object> data) {
        return ResponseEntity.status(HttpStatus.CREATED).body(academicProfileService.addAchievement(studentId, data));
    }

    @PutMapping("/achievements/{docId}")
    @Operation(summary = "Update an achievement")
    public ResponseEntity<Map<String, Object>> updateAchievement(@PathVariable String studentId, @PathVariable String docId, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(academicProfileService.updateAchievement(studentId, docId, data));
    }

    @DeleteMapping("/achievements/{docId}")
    @Operation(summary = "Delete an achievement")
    public ResponseEntity<Void> deleteAchievement(@PathVariable String studentId, @PathVariable String docId) {
        academicProfileService.deleteAchievement(studentId, docId);
        return ResponseEntity.noContent().build();
    }

    // ── Skills ──────────────────────────────────────────────────────

    @GetMapping("/skills")
    @Operation(summary = "List all skills for a student")
    public ResponseEntity<List<Map<String, Object>>> getSkills(@PathVariable String studentId) {
        return ResponseEntity.ok(academicProfileService.getSkills(studentId));
    }

    @PostMapping("/skills")
    @Operation(summary = "Add a skill")
    public ResponseEntity<Map<String, Object>> addSkill(@PathVariable String studentId, @RequestBody Map<String, Object> data) {
        return ResponseEntity.status(HttpStatus.CREATED).body(academicProfileService.addSkill(studentId, data));
    }

    @PutMapping("/skills/{docId}")
    @Operation(summary = "Update a skill")
    public ResponseEntity<Map<String, Object>> updateSkill(@PathVariable String studentId, @PathVariable String docId, @RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(academicProfileService.updateSkill(studentId, docId, data));
    }

    @DeleteMapping("/skills/{docId}")
    @Operation(summary = "Delete a skill")
    public ResponseEntity<Void> deleteSkill(@PathVariable String studentId, @PathVariable String docId) {
        academicProfileService.deleteSkill(studentId, docId);
        return ResponseEntity.noContent().build();
    }

    // ── Placement Status ────────────────────────────────────────────

    @PutMapping("/placement")
    @Operation(summary = "Update placement status for a student")
    public ResponseEntity<Void> updatePlacement(@PathVariable String studentId, @RequestBody Map<String, Object> data) {
        String status = (String) data.getOrDefault("placementStatus", "NOT_STARTED");
        Integer offerCount = data.get("offerCount") != null ? ((Number) data.get("offerCount")).intValue() : 0;
        academicProfileService.updatePlacementStatus(studentId, status, offerCount);
        return ResponseEntity.ok().build();
    }
}
