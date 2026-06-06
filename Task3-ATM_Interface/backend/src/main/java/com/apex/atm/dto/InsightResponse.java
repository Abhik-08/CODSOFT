package com.apex.atm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InsightResponse {
    private String summary;
    private List<String> recommendations;
    private String riskLevel;          // "Low" | "Medium" | "High"
    private int financialScore;        // 0–100
    private String mostActiveDay;
    private String largestTransaction;
    private String errorMessage;       // null on success
}
