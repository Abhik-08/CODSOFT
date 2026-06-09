package com.eduvault.api.controller;

import com.eduvault.api.dto.ProjectDto;
import com.eduvault.api.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/projects")
@Tag(name = "Project Management", description = "APIs for student projects showcase")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    @Operation(summary = "Get all projects", description = "Retrieve all student projects")
    public ResponseEntity<List<ProjectDto>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY') or @securityUtils.hasAccessToProject(#id)")
    @Operation(summary = "Get project by ID", description = "Retrieve detailed information of a project")
    public ResponseEntity<ProjectDto> getProjectById(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY') or @securityUtils.hasAccessToStudent(#projectDto.studentId)")
    @Operation(summary = "Create a new project", description = "Record a new project showcase for a student")
    public ResponseEntity<ProjectDto> createProject(@Valid @RequestBody ProjectDto projectDto) {
        return new ResponseEntity<>(projectService.createProject(projectDto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY') or @securityUtils.hasAccessToProject(#id)")
    @Operation(summary = "Update an existing project", description = "Modify and save fields of a project")
    public ResponseEntity<ProjectDto> updateProject(@PathVariable Long id, @Valid @RequestBody ProjectDto projectDto) {
        return ResponseEntity.ok(projectService.updateProject(id, projectDto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY') or @securityUtils.hasAccessToProject(#id)")
    @Operation(summary = "Delete project", description = "Remove a project from the system")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY') or @securityUtils.hasAccessToStudent(#studentId)")
    @Operation(summary = "Get projects by student ID", description = "Retrieve all projects associated with a given student")
    public ResponseEntity<List<ProjectDto>> getProjectsByStudentId(@PathVariable Long studentId) {
        return ResponseEntity.ok(projectService.getProjectsByStudentId(studentId));
    }
}
