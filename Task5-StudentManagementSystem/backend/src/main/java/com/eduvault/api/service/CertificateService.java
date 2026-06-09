package com.eduvault.api.service;

import com.eduvault.api.dto.CertificateDto;
import java.util.List;

public interface CertificateService {
    List<CertificateDto> getAllCertificates();
    CertificateDto getCertificateById(Long id);
    CertificateDto createCertificate(CertificateDto certificateDto);
    CertificateDto updateCertificate(Long id, CertificateDto certificateDto);
    void deleteCertificate(Long id);
    List<CertificateDto> getCertificatesByStudentId(Long studentId);
}
