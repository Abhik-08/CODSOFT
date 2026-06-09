package com.eduvault.api.controller;

import com.eduvault.api.dto.PortfolioDto;
import com.eduvault.api.service.PortfolioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/portfolios")
@Tag(name = "Portfolio Management", description = "APIs for student AI showcases and portfolio websites")
public class PortfolioController {

    private final PortfolioService portfolioService;

    public PortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    @Operation(summary = "Get all portfolios", description = "Retrieve a list of all portfolios")
    public ResponseEntity<List<PortfolioDto>> getAllPortfolios() {
        return ResponseEntity.ok(portfolioService.getAllPortfolios());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY') or @securityUtils.hasAccessToPortfolio(#id)")
    @Operation(summary = "Get portfolio by ID", description = "Retrieve a specific portfolio record by ID")
    public ResponseEntity<PortfolioDto> getPortfolioById(@PathVariable Long id) {
        return ResponseEntity.ok(portfolioService.getPortfolioById(id));
    }

    @PostMapping("/generate/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY') or @securityUtils.hasAccessToStudent(#studentId)")
    @Operation(summary = "Generate portfolio", description = "Generates a customized portfolio website reference for a student")
    public ResponseEntity<PortfolioDto> generatePortfolio(
            @PathVariable Long studentId,
            @Valid @RequestBody(required = false) PortfolioDto portfolioDto) {
        return new ResponseEntity<>(portfolioService.generatePortfolio(studentId, portfolioDto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY') or @securityUtils.hasAccessToPortfolio(#id)")
    @Operation(summary = "Update portfolio details", description = "Modify and save fields of a portfolio record")
    public ResponseEntity<PortfolioDto> updatePortfolio(@PathVariable Long id, @Valid @RequestBody PortfolioDto portfolioDto) {
        return ResponseEntity.ok(portfolioService.updatePortfolio(id, portfolioDto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    @Operation(summary = "Delete portfolio", description = "Remove a portfolio record from the system")
    public ResponseEntity<Void> deletePortfolio(@PathVariable Long id) {
        portfolioService.deletePortfolio(id);
        return ResponseEntity.noContent().build();
    }
}
