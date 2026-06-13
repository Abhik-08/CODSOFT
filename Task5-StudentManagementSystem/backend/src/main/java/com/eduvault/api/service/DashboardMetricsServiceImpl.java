package com.eduvault.api.service;

import com.eduvault.api.dto.DashboardMetricsDto;
import com.eduvault.api.model.Student;
import com.eduvault.api.model.Portfolio;
import com.eduvault.api.repository.StudentRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class DashboardMetricsServiceImpl implements DashboardMetricsService {

    private final StudentRepository studentRepository;
    private final com.eduvault.api.repository.StudentRoadmapRepository studentRoadmapRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public DashboardMetricsServiceImpl(
            StudentRepository studentRepository,
            com.eduvault.api.repository.StudentRoadmapRepository studentRoadmapRepository) {
        this.studentRepository = studentRepository;
        this.studentRoadmapRepository = studentRoadmapRepository;
    }

    @Override
    public DashboardMetricsDto getDashboardMetrics() {
        List<Student> students = studentRepository.findAll();
        List<com.eduvault.api.model.StudentRoadmap> roadmaps = studentRoadmapRepository.findAll();
        long cohortSize = students.size();

        double averageCgpa = students.stream()
                .filter(s -> s.getGpa() != null)
                .mapToDouble(Student::getGpa)
                .average()
                .orElse(0.0);
        averageCgpa = Math.round(averageCgpa * 100.0) / 100.0;

        double averageAttendance = students.stream()
                .filter(s -> s.getAttendance() != null)
                .mapToDouble(Student::getAttendance)
                .average()
                .orElse(0.0);
        averageAttendance = Math.round(averageAttendance * 100.0) / 100.0;

        long placementReadyCount = students.stream()
                .filter(s -> Boolean.TRUE.equals(s.getPlacementReady()))
                .count();
        double placementReadyPercentage = cohortSize == 0
                ? 0.0
                : (double) placementReadyCount / cohortSize * 100.0;
        placementReadyPercentage = Math.round(placementReadyPercentage * 100.0) / 100.0;

        long completedPortfoliosCount = students.stream()
                .filter(s -> (s.getPortfolioUrl() != null && !s.getPortfolioUrl().isBlank()) || 
                             (s.getPortfolios() != null && !s.getPortfolios().isEmpty()))
                .count();
        double portfolioCompletionPercentage = cohortSize == 0
                ? 0.0
                : (double) completedPortfoliosCount / cohortSize * 100.0;
        portfolioCompletionPercentage = Math.round(portfolioCompletionPercentage * 100.0) / 100.0;

        long riskStudents = students.stream()
                .filter(s -> "HIGH".equalsIgnoreCase(s.getRiskCategory()) || 
                             "CRITICAL".equalsIgnoreCase(s.getRiskCategory()) ||
                             (s.getGpa() != null && s.getGpa() < 6.75) ||
                             (s.getAttendance() != null && s.getAttendance() < 60.0))
                .count();

        long certificateCount = 0;
        long projectCount = 0;

        for (Student s : students) {
            if (s.getPortfolios() != null) {
                for (Portfolio p : s.getPortfolios()) {
                    certificateCount += countJsonArrayElements(p.getCertificatesJson());
                    projectCount += countJsonArrayElements(p.getProjectsJson());
                }
            }
        }

        // Calculate Roadmap Metrics
        long studentsFollowingRoadmaps = roadmaps.stream()
                .map(r -> r.getStudent().getId())
                .distinct()
                .count();

        long completedRoadmaps = roadmaps.stream()
                .filter(r -> r.getCurrentScore() != null && r.getTargetScore() != null && r.getTargetScore() > 0 && r.getCurrentScore() >= r.getTargetScore())
                .count();

        long highPriorityRoadmaps = roadmaps.stream()
                .filter(r -> "HIGH".equalsIgnoreCase(r.getPriority()))
                .count();

        double averageImprovementProgress = roadmaps.stream()
                .filter(r -> r.getCurrentScore() != null && r.getTargetScore() != null && r.getTargetScore() > 0)
                .mapToDouble(r -> {
                    double progress = (r.getCurrentScore() / r.getTargetScore()) * 100.0;
                    return Math.min(100.0, Math.max(0.0, progress));
                })
                .average()
                .orElse(0.0);
        averageImprovementProgress = Math.round(averageImprovementProgress * 100.0) / 100.0;

        return DashboardMetricsDto.builder()
                .cohortSize(cohortSize)
                .averageCgpa(averageCgpa)
                .averageAttendance(averageAttendance)
                .placementReadyPercentage(placementReadyPercentage)
                .portfolioCompletionPercentage(portfolioCompletionPercentage)
                .riskStudents(riskStudents)
                .certificateCount(certificateCount)
                .projectCount(projectCount)
                .studentsFollowingRoadmaps(studentsFollowingRoadmaps)
                .completedRoadmaps(completedRoadmaps)
                .highPriorityRoadmaps(highPriorityRoadmaps)
                .averageImprovementProgress(averageImprovementProgress)
                .build();
    }

    private int countJsonArrayElements(String json) {
        if (json == null || json.isBlank()) return 0;
        try {
            List<Map<String, Object>> list = objectMapper.readValue(json, new TypeReference<List<Map<String, Object>>>() {});
            return list != null ? list.size() : 0;
        } catch (Exception e) {
            return 0;
        }
    }
}
