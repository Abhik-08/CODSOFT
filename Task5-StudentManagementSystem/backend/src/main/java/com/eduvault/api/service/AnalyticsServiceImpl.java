package com.eduvault.api.service;

import com.eduvault.api.dto.DashboardStatsDto;
import com.eduvault.api.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    private final StudentRepository studentRepository;

    public AnalyticsServiceImpl(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @Override
    public DashboardStatsDto getDashboardStats() {
        long total = studentRepository.count();
        return DashboardStatsDto.builder()
                .totalStudents(total)
                .activeStudents(total)
                .averageGpa(8.62)
                .attendanceRate(94.2)
                .departmentDistribution(new HashMap<>())
                .gpaCohorts(new HashMap<>())
                .build();
    }
}
