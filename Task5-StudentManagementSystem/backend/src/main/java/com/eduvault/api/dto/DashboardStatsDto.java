package com.eduvault.api.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class DashboardStatsDto {
    private Long totalStudents;
    private Long activeStudents;
    private Double averageGpa;
    private Double attendanceRate;
    private Map<String, Long> departmentDistribution;
    private Map<String, Long> gpaCohorts;
}
