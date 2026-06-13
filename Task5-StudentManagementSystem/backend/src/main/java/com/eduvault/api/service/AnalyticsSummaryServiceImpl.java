package com.eduvault.api.service;

import com.eduvault.api.model.Student;
import com.eduvault.api.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsSummaryServiceImpl implements AnalyticsSummaryService {

    private final StudentRepository studentRepository;

    @Autowired
    public AnalyticsSummaryServiceImpl(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @Override
    public String getAnalyticsSummary() {
        List<Student> students = studentRepository.findAll();
        if (students.isEmpty()) {
            return "No student records logged in the database.";
        }

        long total = students.size();
        double avgGpa = students.stream().filter(s -> s.getGpa() != null).mapToDouble(Student::getGpa).average().orElse(0.0);
        double avgAtt = students.stream().filter(s -> s.getAttendance() != null).mapToDouble(Student::getAttendance).average().orElse(0.0);
        long placementReady = students.stream().filter(s -> Boolean.TRUE.equals(s.getPlacementReady())).count();
        long atRisk = students.stream().filter(s -> s.getRiskScore() != null && s.getRiskScore() >= 50).count();

        Map<String, Long> depts = students.stream().collect(Collectors.groupingBy(Student::getDepartment, Collectors.counting()));
        StringBuilder deptStats = new StringBuilder();
        depts.forEach((dept, count) -> deptStats.append(String.format("- %s: %d students%n", dept, count)));

        String template = """
                EduVault Cohort Summary:
                - Total Students: %d
                - Average CGPA: %.2f
                - Average Attendance: %.2f%%
                - Placement Ready Students: %d (%.1f%% of cohort)
                - High/Critical Risk Students: %d
                Department Enrollments:
                %s""";

        return String.format(
                template,
                total, avgGpa, avgAtt, placementReady, (double) placementReady / total * 100.0, atRisk, deptStats.toString()
        );
    }
}
