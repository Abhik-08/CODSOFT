package com.eduvault.api.controller;

import com.eduvault.api.dto.PortfolioDto;
import com.eduvault.api.model.Student;
import com.eduvault.api.repository.StudentRepository;
import com.eduvault.api.service.PortfolioService;
import com.eduvault.api.config.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/portfolios")
@Tag(name = "Portfolio Management", description = "APIs for student AI showcases and portfolio websites")
public class PortfolioController {

    private final PortfolioService portfolioService;
    private final StudentRepository studentRepository;

    public PortfolioController(PortfolioService portfolioService, StudentRepository studentRepository) {
        this.portfolioService = portfolioService;
        this.studentRepository = studentRepository;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY', 'STUDENT')")
    @Operation(summary = "Get portfolios", description = "Retrieve a list of portfolios (filtered by ownership for student accounts)")
    public ResponseEntity<List<PortfolioDto>> getAllPortfolios() {
        if (SecurityUtils.hasRole("ROLE_ADMIN") || SecurityUtils.hasRole("ROLE_FACULTY")) {
            return ResponseEntity.ok(portfolioService.getAllPortfolios());
        }

        String username = SecurityUtils.getCurrentUsername();
        if (username != null) {
            Optional<Student> studentOpt = studentRepository.findByEmail(username);
            if (studentOpt.isEmpty()) {
                studentOpt = studentRepository.findByEnrollmentNumber(username);
            }
            if (studentOpt.isPresent()) {
                return ResponseEntity.ok(portfolioService.getPortfoliosByStudentId(studentOpt.get().getId()));
            }
        }
        return ResponseEntity.ok(Collections.emptyList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY') or @securityUtils.hasAccessToPortfolio(#id)")
    @Operation(summary = "Get portfolio by ID", description = "Retrieve a specific portfolio record by ID")
    public ResponseEntity<PortfolioDto> getPortfolioById(@PathVariable Long id) {
        return ResponseEntity.ok(portfolioService.getPortfolioById(id));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY') or @securityUtils.hasAccessToStudent(#studentId)")
    @Operation(summary = "Get student portfolios", description = "Retrieve all portfolios belonging to a specific student")
    public ResponseEntity<List<PortfolioDto>> getPortfoliosByStudentId(@PathVariable Long studentId) {
        return ResponseEntity.ok(portfolioService.getPortfoliosByStudentId(studentId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY') or @securityUtils.hasAccessToStudent(#portfolioDto.studentId)")
    @Operation(summary = "Create portfolio", description = "Creates a new portfolio record and registers it in Firestore")
    public ResponseEntity<PortfolioDto> createPortfolio(@Valid @RequestBody PortfolioDto portfolioDto) {
        return new ResponseEntity<>(portfolioService.createPortfolio(portfolioDto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY') or @securityUtils.hasAccessToPortfolio(#id)")
    @Operation(summary = "Update portfolio", description = "Modify and save fields of a portfolio record")
    public ResponseEntity<PortfolioDto> updatePortfolio(@PathVariable Long id, @Valid @RequestBody PortfolioDto portfolioDto) {
        return ResponseEntity.ok(portfolioService.updatePortfolio(id, portfolioDto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY') or @securityUtils.hasAccessToPortfolio(#id)")
    @Operation(summary = "Delete portfolio", description = "Remove a portfolio record from H2 and Firestore")
    public ResponseEntity<Void> deletePortfolio(@PathVariable Long id) {
        portfolioService.deletePortfolio(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/duplicate/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY') or @securityUtils.hasAccessToPortfolio(#id)")
    @Operation(summary = "Duplicate portfolio", description = "Creates a copy of an existing portfolio")
    public ResponseEntity<PortfolioDto> duplicatePortfolio(@PathVariable Long id) {
        return new ResponseEntity<>(portfolioService.duplicatePortfolio(id), HttpStatus.CREATED);
    }
}
