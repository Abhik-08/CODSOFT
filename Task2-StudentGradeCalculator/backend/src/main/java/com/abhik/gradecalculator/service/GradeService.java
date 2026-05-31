package com.abhik.gradecalculator.service;

import com.abhik.gradecalculator.model.GradeRequest;
import com.abhik.gradecalculator.model.GradeResponse;
import com.abhik.gradecalculator.model.Subject;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class GradeService {

    public GradeResponse calculateGrades(GradeRequest request) {
        List<Subject> subjects = request.getSubjects();
        if (subjects == null || subjects.isEmpty()) {
            throw new IllegalArgumentException("Subjects list cannot be empty!");
        }

        int totalCount = subjects.size();

        // 1. Total Marks & Percentage
        int totalMarks = subjects.stream().mapToInt(Subject::getMarks).sum();
        double percentage = (double) totalMarks / totalCount;

        // 2. Core Metrics
        String grade = getGrade(percentage);
        double gpa = getGpa(percentage);
        String performance = getPerformanceCategory(percentage);
        String remark = getRemark(percentage);

        // 3. Subject-wise Analysis & Grade Distribution
        Map<String, String> subjectPerformance = new LinkedHashMap<>();
        Map<String, Integer> gradeDistribution = initGradeDistribution();

        for (Subject subject : subjects) {
            int marks = subject.getMarks();
            subjectPerformance.put(subject.getSubjectName(), getSubjectPerformance(marks));
            String subGrade = getSubjectGrade(marks);
            gradeDistribution.put(subGrade, gradeDistribution.get(subGrade) + 1);
        }

        // 4. Pass/Fail Status & Extremes
        long passedCount = subjects.stream().filter(s -> s.getMarks() >= 50).count();
        boolean failedAnySubject = passedCount < totalCount;
        String status = (!grade.equals("F") && !failedAnySubject) ? "PASSED" : "FAILED";
        double passPercentage = ((double) passedCount / totalCount) * 100.0;

        Subject highest = subjects.stream().max(Comparator.comparingInt(Subject::getMarks)).orElseThrow();
        Subject lowest = subjects.stream().min(Comparator.comparingInt(Subject::getMarks)).orElseThrow();

        // 5. Scholarship & Advanced Metrics
        boolean scholarshipEligible = percentage > 60.0 && !failedAnySubject;
        double stdDev = calculateStandardDeviation(subjects, percentage);
        double healthScore = calculateHealthScore(percentage, stdDev, totalCount - passedCount);

        // 6. Rank Prediction & Suggestions
        String rankPrediction = predictRank(gpa);
        List<String> improvementSuggestions = generateSuggestions(
                stdDev, lowest.getMarks(), highest.getSubjectName(),
                lowest.getSubjectName(), percentage, failedAnySubject
        );

        return GradeResponse.builder()
                .studentName(request.getStudentName())
                .totalMarks(totalMarks)
                .percentage(round(percentage))
                .grade(grade)
                .gpa(gpa)
                .status(status)
                .remark(remark)
                .performance(performance)
                .highestMark(highest.getMarks())
                .lowestMark(lowest.getMarks())
                .strongestSubject(highest.getSubjectName())
                .weakestSubject(lowest.getSubjectName())
                .scholarshipEligible(scholarshipEligible)
                .academicHealthScore(round(healthScore))
                .subjectPerformance(subjectPerformance)
                .gradeDistribution(gradeDistribution)
                .passPercentage(round(passPercentage))
                .rankPrediction(rankPrediction)
                .improvementSuggestions(improvementSuggestions)
                .build();
    }

    // --- HELPER METHODS TO REDUCE COGNITIVE COMPLEXITY ---

    private String getGrade(double percentage) {
        if (percentage >= 90.0) return "A+";
        if (percentage >= 80.0) return "A";
        if (percentage >= 70.0) return "B";
        if (percentage >= 60.0) return "C";
        if (percentage >= 50.0) return "D";
        return "F";
    }

    private double getGpa(double percentage) {
        if (percentage >= 90.0) return 4.0;
        if (percentage >= 80.0) return 3.7;
        if (percentage >= 70.0) return 3.0;
        if (percentage >= 60.0) return 2.0;
        if (percentage >= 50.0) return 1.0;
        return 0.0;
    }

    private String getPerformanceCategory(double percentage) {
        if (percentage >= 90.0) return "Outstanding";
        if (percentage >= 80.0) return "Excellent";
        if (percentage >= 70.0) return "Good";
        if (percentage >= 60.0) return "Average";
        if (percentage >= 50.0) return "Below Average";
        return "Poor";
    }

    private String getRemark(double percentage) {
        if (percentage >= 90.0) return "Outstanding academic performance! Keep up the brilliant work.";
        if (percentage >= 80.0) return "Excellent job! You have demonstrated great understanding.";
        if (percentage >= 70.0) return "Good performance. With a little more effort, you can reach the top.";
        if (percentage >= 60.0) return "Satisfactory performance. Focus on your weaker areas to improve.";
        if (percentage >= 50.0) return "Passed, but needs significant improvement. Seek academic support.";
        return "Failing grade. You must retake the coursework and study diligently.";
    }

    private String getSubjectGrade(int marks) {
        if (marks >= 90) return "A+";
        if (marks >= 80) return "A";
        if (marks >= 70) return "B";
        if (marks >= 60) return "C";
        if (marks >= 50) return "D";
        return "F";
    }

    private String getSubjectPerformance(int marks) {
        if (marks >= 90) return "Outstanding";
        if (marks >= 80) return "Excellent";
        if (marks >= 70) return "Good";
        if (marks >= 60) return "Average";
        if (marks >= 50) return "Pass";
        return "Fail";
    }

    private Map<String, Integer> initGradeDistribution() {
        Map<String, Integer> dist = new LinkedHashMap<>();
        dist.put("A+", 0);
        dist.put("A", 0);
        dist.put("B", 0);
        dist.put("C", 0);
        dist.put("D", 0);
        dist.put("F", 0);
        return dist;
    }

    private double calculateStandardDeviation(List<Subject> subjects, double mean) {
        double sum = 0;
        for (Subject s : subjects) {
            sum += Math.pow(s.getMarks() - mean, 2);
        }
        return Math.sqrt(sum / subjects.size());
    }

    private double calculateHealthScore(double percentage, double stdDev, long failedCount) {
        double score = percentage - (stdDev * 0.4) - (failedCount * 12.0);
        return Math.max(0.0, Math.min(100.0, score));
    }

    private String predictRank(double gpa) {
        if (gpa >= 3.9) return "Top 5% (High Distinction / Tier 1)";
        if (gpa >= 3.5) return "Top 15% (Distinction / Tier 2)";
        if (gpa >= 3.0) return "Top 30% (First Class / Tier 3)";
        if (gpa >= 2.0) return "Top 60% (Second Class)";
        if (gpa >= 1.0) return "Top 80% (Pass Class)";
        return "Below Average (Requires Remedial Assistance)";
    }

    private List<String> generateSuggestions(
            double stdDev, int lowestMark, String strongestSubject,
            String weakestSubject, double percentage, boolean failedAnySubject) {
        
        List<String> suggestions = new ArrayList<>();

        if (failedAnySubject) {
            suggestions.add("Remedial action required: Register for extra coaching classes and practice daily exercises in " + weakestSubject + " to score at least 50.");
        } else if (lowestMark < 70) {
            suggestions.add("Strengthen your concepts: Spend 30 minutes extra daily reviewing the fundamentals of " + weakestSubject + " to improve your understanding.");
        }

        if (stdDev > 15.0) {
            suggestions.add("Balance your study hours: You have strong performance in " + strongestSubject + ", but you need to dedicate more balanced hours to " + weakestSubject + " to ensure consistency.");
        }

        if (percentage >= 90.0) {
            suggestions.add("Outstanding work: Challenge yourself by assisting peers as a tutor or taking advanced mock tests.");
        } else if (percentage >= 70.0) {
            suggestions.add("Strive for excellence: Aim to convert your 'Good/Excellent' scores into 'Outstanding' by resolving advanced problem sets.");
        } else if (percentage >= 50.0) {
            suggestions.add("Core revision suggested: Regularly attempt weekly progress quizzes to strengthen your core subject scores.");
        }

        suggestions.add("Time Management: Establish a structured revision planner to allocate time proportionally across all subjects.");
        return suggestions;
    }

    private double round(double val) {
        return Math.round(val * 100.0) / 100.0;
    }
}
