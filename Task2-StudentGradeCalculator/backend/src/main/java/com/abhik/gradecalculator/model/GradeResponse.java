package com.abhik.gradecalculator.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GradeResponse {
    private String studentName;
    private Integer totalMarks;
    private Double percentage;
    private String grade;
    private Double gpa;
    private String status;           // "PASSED" or "FAILED"
    private String remark;
    private String performance;
    private Integer highestMark;
    private Integer lowestMark;
    private String strongestSubject;
    private String weakestSubject;
    private Boolean scholarshipEligible;

    // Advanced Analytics
    private Double academicHealthScore;
    private Map<String, String> subjectPerformance;
    private Map<String, Integer> gradeDistribution;
    private Double passPercentage;
    private String rankPrediction;
    private List<String> improvementSuggestions;
}
