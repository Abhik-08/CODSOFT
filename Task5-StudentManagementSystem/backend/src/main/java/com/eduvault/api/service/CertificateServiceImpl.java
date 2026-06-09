package com.eduvault.api.service;

import com.eduvault.api.dto.CertificateDto;
import com.eduvault.api.exception.ResourceNotFoundException;
import com.eduvault.api.model.Certificate;
import com.eduvault.api.model.Student;
import com.eduvault.api.repository.CertificateRepository;
import com.eduvault.api.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@SuppressWarnings("null")
public class CertificateServiceImpl implements CertificateService {

    private static final String NOT_FOUND_MSG = "Certificate not found with id: ";
    private static final String STUDENT_NOT_FOUND = "Student not found with id: ";

    private final CertificateRepository certificateRepository;
    private final StudentRepository studentRepository;

    @Autowired
    public CertificateServiceImpl(CertificateRepository certificateRepository, StudentRepository studentRepository) {
        this.certificateRepository = certificateRepository;
        this.studentRepository = studentRepository;
    }

    @Override
    public List<CertificateDto> getAllCertificates() {
        return certificateRepository.findAll().stream()
                .map(this::convertToDto)
                .toList();
    }

    @Override
    public CertificateDto getCertificateById(Long id) {
        Certificate certificate = certificateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(NOT_FOUND_MSG + id));
        return convertToDto(certificate);
    }

    @Override
    public CertificateDto createCertificate(CertificateDto certificateDto) {
        Student student = studentRepository.findById(certificateDto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException(STUDENT_NOT_FOUND + certificateDto.getStudentId()));

        Certificate certificate = Certificate.builder()
                .student(student)
                .name(certificateDto.getName())
                .issuingOrganization(certificateDto.getIssuingOrganization())
                .issueDate(certificateDto.getIssueDate())
                .credentialId(certificateDto.getCredentialId())
                .credentialUrl(certificateDto.getCredentialUrl())
                .build();

        Certificate savedCertificate = certificateRepository.save(certificate);
        return convertToDto(savedCertificate);
    }

    @Override
    public CertificateDto updateCertificate(Long id, CertificateDto certificateDto) {
        Certificate certificate = certificateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(NOT_FOUND_MSG + id));

        certificate.setName(certificateDto.getName());
        certificate.setIssuingOrganization(certificateDto.getIssuingOrganization());
        certificate.setIssueDate(certificateDto.getIssueDate());
        certificate.setCredentialId(certificateDto.getCredentialId());
        certificate.setCredentialUrl(certificateDto.getCredentialUrl());

        Certificate updatedCertificate = certificateRepository.save(certificate);
        return convertToDto(updatedCertificate);
    }

    @Override
    public void deleteCertificate(Long id) {
        Certificate certificate = certificateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(NOT_FOUND_MSG + id));
        certificateRepository.delete(certificate);
    }

    @Override
    public List<CertificateDto> getCertificatesByStudentId(Long studentId) {
        return certificateRepository.findByStudentId(studentId).stream()
                .map(this::convertToDto)
                .toList();
    }

    private CertificateDto convertToDto(Certificate certificate) {
        CertificateDto dto = new CertificateDto();
        dto.setId(certificate.getId());
        dto.setStudentId(certificate.getStudent().getId());
        dto.setName(certificate.getName());
        dto.setIssuingOrganization(certificate.getIssuingOrganization());
        dto.setIssueDate(certificate.getIssueDate());
        dto.setCredentialId(certificate.getCredentialId());
        dto.setCredentialUrl(certificate.getCredentialUrl());
        return dto;
    }
}
