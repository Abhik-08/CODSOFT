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
public class RiskDto {
    private Long studentId;
    private String studentName;
    private Integer riskScore;
    private String riskCategory;
    private List<String> riskFactors;
    private List<String> riskReasons;
    private List<String> interventionSuggestions;
    private List<String> priorityActions;
    private List<Integer> riskTrend;
    private LocalDateTime lastCalculatedAt;
}
