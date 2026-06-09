package com.eduvault.api.service;

import com.eduvault.api.dto.RiskReportDto;
import com.eduvault.api.exception.ResourceNotFoundException;
import com.eduvault.api.model.RiskReport;
import com.eduvault.api.model.Student;
import com.eduvault.api.repository.RiskReportRepository;
import com.eduvault.api.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class RiskDetectionServiceImpl implements RiskDetectionService {

    private static final String HIGH_RISK = "HIGH_RISK";
    private static final String MEDIUM_RISK = "MEDIUM_RISK";
    private static final String LOW_RISK = "LOW_RISK";

    private final RiskReportRepository riskReportRepository;
    private final StudentRepository studentRepository;

    @Autowired
    public RiskDetectionServiceImpl(RiskReportRepository riskReportRepository, StudentRepository studentRepository) {
        this.riskReportRepository = riskReportRepository;
        this.studentRepository = studentRepository;
    }

    @Override
    public List<RiskReportDto> getAllRisks() {
        return riskReportRepository.findAll().stream()
                .map(this::convertToDto)
                .toList();
    }

    @Override
    public RiskReportDto getRiskByStudentId(Long studentId) {
        RiskReport report = riskReportRepository.findByStudentId(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Risk report not found for student ID: " + studentId));
        return convertToDto(report);
    }

    @Override
    @Transactional
    public List<RiskReportDto> recalculateRisks() {
        List<Student> students = studentRepository.findAll();
        List<RiskReportDto> updatedReports = new ArrayList<>();

        for (Student student : students) {
            double gpa = student.getGpa() != null ? student.getGpa() : 0.0;
            double attendance = student.getAttendance() != null ? student.getAttendance() : 100.0;

            String riskLevel;
            String reason;

            if (gpa < 6.5) {
                riskLevel = HIGH_RISK;
                reason = String.format("Critical CGPA: %.2f (under threshold 6.5)", gpa);
            } else if (attendance < 75.0) {
                riskLevel = HIGH_RISK;
                reason = String.format("Critical Attendance: %.1f%% (under threshold 75%%)", attendance);
            } else if (gpa < 7.5) {
                riskLevel = MEDIUM_RISK;
                reason = String.format("Cautionary CGPA: %.2f (under threshold 7.5)", gpa);
            } else {
                riskLevel = LOW_RISK;
                reason = "Student in good academic and attendance standing.";
            }

            RiskReport report = riskReportRepository.findByStudentId(student.getId())
                    .orElseGet(() -> RiskReport.builder().student(student).build());

            report.setRiskLevel(riskLevel);
            report.setReason(reason);
            report.setCalculatedAt(LocalDateTime.now());

            RiskReport saved = riskReportRepository.save(report);
            updatedReports.add(convertToDto(saved));
        }

        return updatedReports;
    }

    private RiskReportDto convertToDto(RiskReport report) {
        RiskReportDto dto = new RiskReportDto();
        dto.setId(report.getId());
        dto.setStudentId(report.getStudent().getId());
        dto.setStudentName(report.getStudent().getFirstName() + " " + report.getStudent().getLastName());
        dto.setRiskLevel(report.getRiskLevel());
        dto.setReason(report.getReason());
        dto.setCalculatedAt(report.getCalculatedAt());
        return dto;
    }
}
