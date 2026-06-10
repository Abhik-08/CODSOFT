package com.eduvault.api.service;

import com.eduvault.api.dto.AiAnalysisDto;
import com.eduvault.api.dto.RecommendationDto;
import com.eduvault.api.exception.ResourceNotFoundException;
import com.eduvault.api.model.Student;
import com.eduvault.api.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@SuppressWarnings("null")
public class AiRecommendationServiceImpl implements AiRecommendationService {

    private static final String NOT_FOUND_MSG = "Student not found with id: ";

    private final StudentRepository studentRepository;

    @Autowired
    public AiRecommendationServiceImpl(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @Override
    public List<RecommendationDto> getRecommendationsForStudent(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException(NOT_FOUND_MSG + studentId));

        List<RecommendationDto> recommendations = new ArrayList<>();
        double gpa = student.getGpa() != null ? student.getGpa() : 0.0;
        double attendance = student.getAttendance() != null ? student.getAttendance() : 100.0;

        if (gpa < 6.5) {
            recommendations.add(RecommendationDto.builder()
                    .id("rec-low-gpa-" + studentId)
                    .studentId(studentId)
                    .studentName(student.getFirstName() + " " + student.getLastName())
                    .type("CRITICAL")
                    .title("Urgent Academic Intervention Required")
                    .description(String.format("Student CGPA (%.2f) has dropped below safety limits. Tutoring in core subjects is recommended.", gpa))
                    .confidence(0.98)
                    .suggestedAction("Schedule remedial coaching and counseling session.")
                    .build());
        } else if (gpa >= 8.5) {
            recommendations.add(RecommendationDto.builder()
                    .id("rec-high-gpa-" + studentId)
                    .studentId(studentId)
                    .studentName(student.getFirstName() + " " + student.getLastName())
                    .type("EXCELLENCE")
                    .title("Elite Honors Cohort Candidate")
                    .description(String.format("Student's stellar GPA (%.2f) qualifies them for the honors track and advanced project work.", gpa))
                    .confidence(0.95)
                    .suggestedAction("Invite student to register for Honors Seminar and request research internship details.")
                    .build());
        }

        if (attendance < 75.0) {
            recommendations.add(RecommendationDto.builder()
                    .id("rec-low-att-" + studentId)
                    .studentId(studentId)
                    .studentName(student.getFirstName() + " " + student.getLastName())
                    .type("ATTENDANCE_WARNING")
                    .title("Attendance Shortage Warning")
                    .description(String.format("Critical attendance rate of %.1f%%. High risk of exam debarment.", attendance))
                    .confidence(0.99)
                    .suggestedAction("Issue formal warning letter and arrange meeting with advisor.")
                    .build());
        }

        if (recommendations.isEmpty()) {
            recommendations.add(RecommendationDto.builder()
                    .id("rec-standard-" + studentId)
                    .studentId(studentId)
                    .studentName(student.getFirstName() + " " + student.getLastName())
                    .type("INFO")
                    .title("Continue Academic Plan")
                    .description("Student is in good standing with steady GPA and attendance. Continue current study program.")
                    .confidence(0.90)
                    .suggestedAction("Monitor performance in upcoming mid-term tests.")
                    .build());
        }

        return recommendations;
    }

    @Override
    public List<RecommendationDto> getGlobalAlerts() {
        List<Student> students = studentRepository.findAll();
        List<RecommendationDto> alerts = new ArrayList<>();

        for (Student student : students) {
            double gpa = student.getGpa() != null ? student.getGpa() : 0.0;
            double attendance = student.getAttendance() != null ? student.getAttendance() : 100.0;

            if (gpa < 6.5) {
                alerts.add(RecommendationDto.builder()
                        .id("alert-gpa-" + student.getId())
                        .studentId(student.getId())
                        .studentName(student.getFirstName() + " " + student.getLastName())
                        .type("CRITICAL_GPA")
                        .title("Critical Academic Alert")
                        .description(String.format("Student GPA (%.2f) is below safety threshold (6.5).", gpa))
                        .confidence(0.98)
                        .suggestedAction("Initiate academic improvement plan.")
                        .build());
            }

            if (attendance < 75.0) {
                alerts.add(RecommendationDto.builder()
                        .id("alert-att-" + student.getId())
                        .studentId(student.getId())
                        .studentName(student.getFirstName() + " " + student.getLastName())
                        .type("CRITICAL_ATTENDANCE")
                        .title("Critical Attendance Alert")
                        .description(String.format("Student attendance (%.1f%%) is below the 75%% requirement.", attendance))
                        .confidence(0.99)
                        .suggestedAction("Send low attendance formal letter.")
                        .build());
            }
        }
        return alerts;
    }

    @Override
    public AiAnalysisDto.AnalysisResponse analyzeStudent(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException(NOT_FOUND_MSG + studentId));

        double gpa = student.getGpa() != null ? student.getGpa() : 0.0;
        double attendance = student.getAttendance() != null ? student.getAttendance() : 100.0;

        String academicStanding = calculateAcademicStanding(gpa);
        String performanceAnalysis = generatePerformanceAnalysis(student, gpa, attendance);
        String placementReadiness = calculatePlacementReadiness(gpa, attendance);
        List<String> suggestions = generateImprovementSuggestions(gpa, attendance);

        return AiAnalysisDto.AnalysisResponse.builder()
                .studentId(studentId)
                .studentName(student.getFirstName() + " " + student.getLastName())
                .academicStanding(academicStanding)
                .currentGpa(gpa)
                .currentAttendance(attendance)
                .performanceAnalysis(performanceAnalysis)
                .placementReadiness(placementReadiness)
                .improvementSuggestions(suggestions)
                .build();
    }

    private String calculateAcademicStanding(double gpa) {
        if (gpa >= 9.0) {
            return "EXCELLENT";
        } else if (gpa >= 7.5) {
            return "GOOD";
        } else if (gpa >= 6.5) {
            return "AVERAGE";
        } else {
            return "AT_RISK";
        }
    }

    private String generatePerformanceAnalysis(Student student, double gpa, double attendance) {
        String analysis = String.format(
                "Student %s %s exhibits a CGPA of %.2f and an attendance rate of %.1f%%. ",
                student.getFirstName(), student.getLastName(), gpa, attendance
        );
        if (gpa < 7.0) {
            return analysis + "Academic performance is below satisfactory limits, requiring prompt advisory intervention.";
        } else if (attendance < 75.0) {
            return analysis + "Attendance is critical, leading to significant educational gaps despite academic potential.";
        } else {
            return analysis + "Demonstrates reliable academic consistency and regular session participation.";
        }
    }

    private String calculatePlacementReadiness(double gpa, double attendance) {
        if (gpa >= 8.0 && attendance >= 85.0) {
            return "HIGHLY_READY";
        } else if (gpa >= 7.0 && attendance >= 75.0) {
            return "MED_READY";
        } else {
            return "NOT_READY";
        }
    }

    private List<String> generateImprovementSuggestions(double gpa, double attendance) {
        List<String> suggestions = new ArrayList<>();
        if (gpa < 7.5) {
            suggestions.add("Enroll in peer study groups and tutorial sessions.");
            suggestions.add("Focus on core conceptual assignments.");
        } else {
            suggestions.add("Participate in research projects or teaching assistance.");
            suggestions.add("Attempt advanced elective courses.");
        }

        if (attendance < 80.0) {
            suggestions.add("Ensure strict adherence to lecture timings and submit regular logs.");
        }

        if (gpa < 8.0) {
            suggestions.add("Develop at least two comprehensive software or design projects to showcase in your portfolio.");
        }
        return suggestions;
    }

    @Override
    public AiAnalysisDto.RecommendationResponse getAiRecommendations(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException(NOT_FOUND_MSG + studentId));

        double gpa = student.getGpa() != null ? student.getGpa() : 0.0;
        String dept = student.getDepartment() != null ? student.getDepartment().toUpperCase() : "";

        String suggestedCareerPath;
        List<String> certifications = new ArrayList<>();
        List<String> opportunities = new ArrayList<>();

        if (dept.contains("CS") || dept.contains("IT") || dept.contains("SOFTWARE") || dept.contains("COMP")) {
            suggestedCareerPath = "Software Engineer / Cloud Architect / DevOps Specialist";
            certifications.add("AWS Certified Solutions Architect");
            certifications.add("Google Cloud Associate Cloud Engineer");
            certifications.add("Oracle Certified Professional Java SE Developer");
            opportunities.add("Full Stack Web Developer at tech startups");
            opportunities.add("Cloud Engineering Internships at enterprise firms");
            opportunities.add("Data Engineering traineeship");
        } else if (dept.contains("EC") || dept.contains("EE") || dept.contains("ELEC")) {
            suggestedCareerPath = "Embedded Systems Developer / VLSI Hardware Designer";
            certifications.add("ARM System-on-Chip design certification");
            certifications.add("AWS Certified SysOps Administrator");
            opportunities.add("IoT Firmware Developer roles");
            opportunities.add("Hardware Engineering Internships");
        } else if (dept.contains("MECH") || dept.contains("CIVIL")) {
            suggestedCareerPath = "Robotics Integrator / CAD Designer / HVAC Systems Analyst";
            certifications.add("Autodesk Certified Professional (CAD/Revit)");
            certifications.add("Six Sigma Green Belt certification");
            opportunities.add("Product Design trainee roles");
            opportunities.add("CAD modeling specialist");
        } else {
            suggestedCareerPath = "Business Technology Analyst / Systems Consultant";
            certifications.add("Microsoft Certified: Power BI Data Analyst");
            certifications.add("Certified ScrumMaster (CSM)");
            opportunities.add("Junior Business Systems Consultant");
            opportunities.add("Project Management intern");
        }

        String skillGapAnalysis;
        if (gpa < 7.5) {
            skillGapAnalysis = "Requires revision in algorithmic fundamentals, structures, and basic domain tools.";
        } else {
            skillGapAnalysis = "Strong theoretical background. Suggest expanding hands-on familiarity with cloud platforms and advanced frameworks.";
        }

        return AiAnalysisDto.RecommendationResponse.builder()
                .studentId(studentId)
                .studentName(student.getFirstName() + " " + student.getLastName())
                .suggestedCareerPath(suggestedCareerPath)
                .certificationRecommendations(certifications)
                .careerOpportunities(opportunities)
                .skillGapAnalysis(skillGapAnalysis)
                .build();
    }
}
