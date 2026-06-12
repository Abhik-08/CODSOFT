package com.eduvault.api.service;

import com.eduvault.api.dto.RiskDto;
import java.util.List;

public interface RiskDetectionService {
    RiskDto getRiskByStudentId(String studentId);
    RiskDto recalculate(String studentId);
    List<RiskDto> getAllRisks();
}
