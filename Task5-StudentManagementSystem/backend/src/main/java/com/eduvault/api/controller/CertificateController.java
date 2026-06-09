package com.eduvault.api.controller;

import com.eduvault.api.dto.CertificateDto;
import com.eduvault.api.service.CertificateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/certificates")
@Tag(name = "Certificate Management", description = "APIs for verifying and adding student certificates")
public class CertificateController {

    private final CertificateService certificateService;

    public CertificateController(CertificateService certificateService) {
        this.certificateService = certificateService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    @Operation(summary = "Get all certificates", description = "Retrieve a list of all certificates")
    public ResponseEntity<List<CertificateDto>> getAllCertificates() {
        return ResponseEntity.ok(certificateService.getAllCertificates());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY') or @securityUtils.hasAccessToCertificate(#id)")
    @Operation(summary = "Get certificate by ID", description = "Retrieve detailed information of a certificate")
    public ResponseEntity<CertificateDto> getCertificateById(@PathVariable Long id) {
        return ResponseEntity.ok(certificateService.getCertificateById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY') or @securityUtils.hasAccessToStudent(#certificateDto.studentId)")
    @Operation(summary = "Create a new certificate", description = "Record a new certificate for a student")
    public ResponseEntity<CertificateDto> createCertificate(@Valid @RequestBody CertificateDto certificateDto) {
        return new ResponseEntity<>(certificateService.createCertificate(certificateDto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY') or @securityUtils.hasAccessToCertificate(#id)")
    @Operation(summary = "Update an existing certificate", description = "Modify and save fields on a certificate")
    public ResponseEntity<CertificateDto> updateCertificate(@PathVariable Long id, @Valid @RequestBody CertificateDto certificateDto) {
        return ResponseEntity.ok(certificateService.updateCertificate(id, certificateDto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY') or @securityUtils.hasAccessToCertificate(#id)")
    @Operation(summary = "Delete certificate", description = "Remove a certificate from the system")
    public ResponseEntity<Void> deleteCertificate(@PathVariable Long id) {
        certificateService.deleteCertificate(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY') or @securityUtils.hasAccessToStudent(#studentId)")
    @Operation(summary = "Get certificates by student ID", description = "Retrieve all certificates associated with a given student")
    public ResponseEntity<List<CertificateDto>> getCertificatesByStudentId(@PathVariable Long studentId) {
        return ResponseEntity.ok(certificateService.getCertificatesByStudentId(studentId));
    }
}
