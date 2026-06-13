package com.eduvault.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoadmapDto {
    private Long id;
    private Long studentId;
    private String roadmapId;
    private String roadmapType;
    private Double currentScore;
    private Double targetScore;
    private String currentStatus;
    private String targetStatus;
    private List<String> milestones;
    private List<String> actionItems;
    private List<String> recommendations;
    private String estimatedDuration;
    private String priority;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
