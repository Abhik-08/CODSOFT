package com.eduvault.api.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardMetricsDto {
    private Long cohortSize;
    private Double averageCgpa;
    private Double averageAttendance;
    private Double placementReadyPercentage;
    private Double portfolioCompletionPercentage;
    private Long riskStudents;
    private Long certificateCount;
    private Long projectCount;

    // Roadmap metrics
    private Long studentsFollowingRoadmaps;
    private Long completedRoadmaps;
    private Long highPriorityRoadmaps;
    private Double averageImprovementProgress;
}

