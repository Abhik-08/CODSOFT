package com.eduvault.api.service;

import com.eduvault.api.dto.RiskReportDto;
import java.util.List;

public interface RiskDetectionService {
    List<RiskReportDto> getAllRisks();
    RiskReportDto getRiskByStudentId(Long studentId);
    List<RiskReportDto> recalculateRisks();
}
