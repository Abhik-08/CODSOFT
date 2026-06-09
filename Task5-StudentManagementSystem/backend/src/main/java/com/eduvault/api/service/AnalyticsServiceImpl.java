package com.eduvault.api.service;

import com.eduvault.api.dto.DashboardStatsDto;
import com.eduvault.api.model.Student;
import com.eduvault.api.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    private final StudentRepository studentRepository;

    @Autowired
    public AnalyticsServiceImpl(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @Override
    public DashboardStatsDto getDashboardStats() {
        List<Student> students = studentRepository.findAll();
        long total = students.size();
        
        long active = students.stream()
                .filter(s -> "ACTIVE".equalsIgnoreCase(s.getStatus()))
                .count();

        double avgGpa = students.stream()
                .filter(s -> s.getGpa() != null)
                .mapToDouble(Student::getGpa)
                .average()
                .orElse(0.0);
        avgGpa = Math.round(avgGpa * 100.0) / 100.0;

        double avgAttendance = students.stream()
                .filter(s -> s.getAttendance() != null)
                .mapToDouble(Student::getAttendance)
                .average()
                .orElse(0.0);
        avgAttendance = Math.round(avgAttendance * 100.0) / 100.0;

        Map<String, Long> deptDist = getDepartmentAnalytics();

        Map<String, Long> gpaCohorts = new HashMap<>();
        gpaCohorts.put("9.0+", students.stream().filter(s -> s.getGpa() != null && s.getGpa() >= 9.0).count());
        gpaCohorts.put("8.0-9.0", students.stream().filter(s -> s.getGpa() != null && s.getGpa() >= 8.0 && s.getGpa() < 9.0).count());
        gpaCohorts.put("7.0-8.0", students.stream().filter(s -> s.getGpa() != null && s.getGpa() >= 7.0 && s.getGpa() < 8.0).count());
        gpaCohorts.put("6.0-7.0", students.stream().filter(s -> s.getGpa() != null && s.getGpa() >= 6.0 && s.getGpa() < 7.0).count());
        gpaCohorts.put("Below 6.0", students.stream().filter(s -> s.getGpa() != null && s.getGpa() < 6.0).count());

        return DashboardStatsDto.builder()
                .totalStudents(total)
                .activeStudents(active)
                .averageGpa(avgGpa)
                .attendanceRate(avgAttendance)
                .departmentDistribution(deptDist)
                .gpaCohorts(gpaCohorts)
                .build();
    }

    @Override
    public Map<String, Object> getCgpaAnalytics() {
        List<Student> students = studentRepository.findAll();
        double avgGpa = students.stream()
                .filter(s -> s.getGpa() != null)
                .mapToDouble(Student::getGpa)
                .average()
                .orElse(0.0);
        avgGpa = Math.round(avgGpa * 100.0) / 100.0;

        double maxGpa = students.stream()
                .filter(s -> s.getGpa() != null)
                .mapToDouble(Student::getGpa)
                .max()
                .orElse(0.0);

        double minGpa = students.stream()
                .filter(s -> s.getGpa() != null)
                .mapToDouble(Student::getGpa)
                .min()
                .orElse(0.0);

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("averageCgpa", avgGpa);
        analytics.put("highestCgpa", maxGpa);
        analytics.put("lowestCgpa", minGpa);
        analytics.put("totalGradedStudents", students.stream().filter(s -> s.getGpa() != null).count());
        return analytics;
    }

    @Override
    public Map<String, Object> getAttendanceAnalytics() {
        List<Student> students = studentRepository.findAll();
        double avgAttendance = students.stream()
                .filter(s -> s.getAttendance() != null)
                .mapToDouble(Student::getAttendance)
                .average()
                .orElse(0.0);
        avgAttendance = Math.round(avgAttendance * 100.0) / 100.0;

        long lowAttendanceCount = students.stream()
                .filter(s -> s.getAttendance() != null && s.getAttendance() < 75.0)
                .count();

        long highAttendanceCount = students.stream()
                .filter(s -> s.getAttendance() != null && s.getAttendance() >= 90.0)
                .count();

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("averageAttendance", avgAttendance);
        analytics.put("criticalAttendanceCount", lowAttendanceCount);
        analytics.put("excellentAttendanceCount", highAttendanceCount);
        analytics.put("totalTrackedStudents", students.stream().filter(s -> s.getAttendance() != null).count());
        return analytics;
    }

    @Override
    public Map<String, Long> getDepartmentAnalytics() {
        return studentRepository.findAll().stream()
                .collect(Collectors.groupingBy(Student::getDepartment, Collectors.counting()));
    }

    @Override
    public Map<String, Object> getPlacementAnalytics() {
        List<Student> students = studentRepository.findAll();
        long placementReadyCount = students.stream()
                .filter(s -> Boolean.TRUE.equals(s.getPlacementReady()))
                .count();

        double readyPercentage = students.isEmpty() 
                ? 0.0 
                : (double) placementReadyCount / students.size() * 100.0;
        readyPercentage = Math.round(readyPercentage * 100.0) / 100.0;

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("placementReadyCount", placementReadyCount);
        analytics.put("totalStudents", students.size());
        analytics.put("readinessPercentage", readyPercentage);
        return analytics;
    }
}
