package com.eduvault.api.service;

import com.eduvault.api.dto.AdvisoryDto;
import java.util.List;
import java.util.Map;

public interface AdvisoryService {
    AdvisoryDto createAdvisory(AdvisoryDto dto);
    List<AdvisoryDto> getAdvisoriesByStudent(String studentId);
    AdvisoryDto updateAdvisoryStatus(Long id, String status);
    void deleteAdvisory(Long id);
    Map<String, Long> getDashboardAdvisoryStats();
    List<AdvisoryDto> getAllAdvisories();
}
