package com.eduvault.api.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AnalyticsDto {
    private Long totalStudents;
    private Long activeStudents;
    private Double averageCgpa;
    private Double averageAttendance;
    private String topDepartment;
    private Double placementReadyPercentage;
}
