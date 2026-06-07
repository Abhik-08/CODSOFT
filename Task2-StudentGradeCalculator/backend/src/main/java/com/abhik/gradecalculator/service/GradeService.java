package com.abhik.gradecalculator.service;

import com.abhik.gradecalculator.model.GradeRequest;
import com.abhik.gradecalculator.model.GradeResponse;
import com.abhik.gradecalculator.model.Subject;
import com.abhik.gradecalculator.exception.ValidationException;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class GradeService {

    private static final String SUBJECTS_PREFIX = "subjects[";

    public GradeResponse calculateGrades(GradeRequest request) {
        validateRequest(request);

        List<Subject> subjects = request.getSubjects();
        int totalCount = subjects.size();
        long incompleteCount = subjects.stream()
                .filter(s -> s.getIncomplete() != null && s.getIncomplete())
                .count();
        boolean hasIncomplete = incompleteCount > 0;
        long completeCount = totalCount - incompleteCount;

        // 1. Total Marks & Percentage
        int totalMarks = subjects.stream()
                .filter(s -> s.getIncomplete() == null || !s.getIncomplete())
                .mapToInt(Subject::getMarks)
                .sum();
        
        double percentage = completeCount > 0 ? (double) totalMarks / completeCount : 0.0;

        // 2. Core Metrics
        String grade = hasIncomplete ? "I" : getGrade(percentage);
        double gpa = hasIncomplete ? 2.0 : getGpa(percentage);
        String performance = hasIncomplete ? "Incomplete" : getPerformanceCategory(percentage);
        String remark = hasIncomplete ? "Coursework incomplete. Please complete all pending exams/coursework." : getRemark(percentage);

        // 3. Subject-wise Analysis & Grade Distribution
        Map<String, String> subjectPerformance = new LinkedHashMap<>();
        Map<String, Integer> gradeDistribution = initGradeDistribution();

        for (Subject subject : subjects) {
            boolean isSubInc = subject.getIncomplete() != null && subject.getIncomplete();
            String subPerformance = isSubInc ? "Incomplete" : getSubjectPerformance(subject.getMarks());
            subjectPerformance.put(subject.getSubjectName(), subPerformance);
            
            String subGrade = isSubInc ? "I" : getSubjectGrade(subject.getMarks());
            gradeDistribution.put(subGrade, gradeDistribution.get(subGrade) + 1);
        }

        // 4. Pass/Fail Status & Extremes
        long passedCount = subjects.stream()
                .filter(s -> s.getIncomplete() == null || !s.getIncomplete())
                .filter(s -> s.getMarks() != null && s.getMarks() >= 40)
                .count();
        
        boolean failedAnySubject = subjects.stream()
                .anyMatch(s -> (s.getIncomplete() != null && s.getIncomplete()) || s.getMarks() == null || s.getMarks() < 40);
        
        String status = (!grade.equals("F") && !grade.equals("I") && !failedAnySubject) ? "PASSED" : "FAILED";
        double passPercentage = ((double) passedCount / totalCount) * 100.0;

        Optional<Subject> highestOpt = subjects.stream()
                .filter(s -> s.getIncomplete() == null || !s.getIncomplete())
                .max(Comparator.comparingInt(Subject::getMarks));
        
        Optional<Subject> lowestOpt = subjects.stream()
                .filter(s -> s.getIncomplete() == null || !s.getIncomplete())
                .min(Comparator.comparingInt(Subject::getMarks));

        int highestMark = highestOpt.map(Subject::getMarks).orElse(0);
        int lowestMark = lowestOpt.map(Subject::getMarks).orElse(0);
        String strongestSubject = highestOpt.map(Subject::getSubjectName).orElse("N/A");
        String weakestSubject = lowestOpt.map(Subject::getSubjectName).orElse("N/A");

        // 5. Scholarship & Advanced Metrics
        boolean scholarshipEligible = !hasIncomplete && percentage > 60.0 && !failedAnySubject;
        double stdDev = calculateStdDev(subjects, percentage, completeCount);
        double healthScore = calculateHealthScore(percentage, stdDev, totalCount - passedCount, hasIncomplete);

        // 6. Rank Prediction & Suggestions
        String rankPrediction = hasIncomplete ? "Incomplete (Requires Remedial Assistance)" : predictRank(gpa);
        List<String> improvementSuggestions = generateSuggestions(
                stdDev, lowestMark, strongestSubject, weakestSubject, percentage, failedAnySubject, hasIncomplete
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
                .highestMark(highestMark)
                .lowestMark(lowestMark)
                .strongestSubject(strongestSubject)
                .weakestSubject(weakestSubject)
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

    private void validateRequest(GradeRequest request) {
        List<Subject> subjects = request.getSubjects();
        if (subjects == null || subjects.isEmpty()) {
            throw new IllegalArgumentException("Subjects list cannot be empty!");
        }

        Map<String, String> validationErrors = new LinkedHashMap<>();
        if (request.getStudentName() == null || request.getStudentName().trim().isEmpty()) {
            validationErrors.put("studentName", "Student name is required");
        }
        for (int i = 0; i < subjects.size(); i++) {
            Subject s = subjects.get(i);
            if (s.getSubjectName() == null || s.getSubjectName().trim().isEmpty()) {
                validationErrors.put(SUBJECTS_PREFIX + i + "].subjectName", "Subject name is required");
            }
            if (s.getIncomplete() != null && s.getIncomplete()) {
                // Marks are not required or validated if incomplete
            } else {
                if (s.getMarks() == null) {
                    validationErrors.put(SUBJECTS_PREFIX + i + "].marks", "Marks are required");
                } else if (s.getMarks() < 0 || s.getMarks() > 100) {
                    validationErrors.put(SUBJECTS_PREFIX + i + "].marks", "Marks must be between 0 and 100");
                }
            }
        }
        if (!validationErrors.isEmpty()) {
            throw new ValidationException(validationErrors);
        }
    }

    private double calculateStdDev(List<Subject> subjects, double percentage, long completeCount) {
        if (completeCount <= 0) {
            return 0.0;
        }
        double sumSq = 0.0;
        for (Subject s : subjects) {
            if (s.getIncomplete() == null || !s.getIncomplete()) {
                sumSq += Math.pow(s.getMarks() - percentage, 2);
            }
        }
        return Math.sqrt(sumSq / completeCount);
    }

    private String getGrade(double percentage) {
        if (percentage >= 90.0) return "O";
        if (percentage >= 80.0) return "E";
        if (percentage >= 70.0) return "A";
        if (percentage >= 60.0) return "B";
        if (percentage >= 50.0) return "C";
        if (percentage >= 40.0) return "D";
        return "F";
    }

    private double getGpa(double percentage) {
        if (percentage >= 90.0) return 10.0;
        if (percentage >= 80.0) return 9.0;
        if (percentage >= 70.0) return 8.0;
        if (percentage >= 60.0) return 7.0;
        if (percentage >= 50.0) return 6.0;
        if (percentage >= 40.0) return 5.0;
        return 2.0;
    }

    private String getPerformanceCategory(double percentage) {
        if (percentage >= 90.0) return "Outstanding";
        if (percentage >= 80.0) return "Excellent";
        if (percentage >= 70.0) return "Very Good";
        if (percentage >= 60.0) return "Good";
        if (percentage >= 50.0) return "Fair";
        if (percentage >= 40.0) return "Below Average";
        return "Failed";
    }

    private String getRemark(double percentage) {
        if (percentage >= 90.0) return "Outstanding academic performance! Keep up the brilliant work.";
        if (percentage >= 80.0) return "Excellent job! You have demonstrated great understanding.";
        if (percentage >= 70.0) return "Very good performance. With a little more effort, you can reach the top.";
        if (percentage >= 60.0) return "Satisfactory performance. Focus on your weaker areas to improve.";
        if (percentage >= 50.0) return "Fair performance, but needs more effort. Seek academic support.";
        if (percentage >= 40.0) return "Below average performance. Review core concepts and study regularly.";
        return "Failed grade. You must retake the coursework and study diligently.";
    }

    private String getSubjectGrade(int marks) {
        if (marks >= 90) return "O";
        if (marks >= 80) return "E";
        if (marks >= 70) return "A";
        if (marks >= 60) return "B";
        if (marks >= 50) return "C";
        if (marks >= 40) return "D";
        return "F";
    }

    private String getSubjectPerformance(int marks) {
        if (marks >= 90) return "Outstanding";
        if (marks >= 80) return "Excellent";
        if (marks >= 70) return "Very Good";
        if (marks >= 60) return "Good";
        if (marks >= 50) return "Fair";
        if (marks >= 40) return "Below Average";
        return "Failed";
    }

    private Map<String, Integer> initGradeDistribution() {
        Map<String, Integer> dist = new LinkedHashMap<>();
        dist.put("O", 0);
        dist.put("E", 0);
        dist.put("A", 0);
        dist.put("B", 0);
        dist.put("C", 0);
        dist.put("D", 0);
        dist.put("F", 0);
        dist.put("I", 0);
        return dist;
    }

    private double calculateHealthScore(double percentage, double stdDev, long failedCount, boolean hasIncomplete) {
        if (hasIncomplete) {
            return 20.0;
        }
        double score = percentage - (stdDev * 0.4) - (failedCount * 12.0);
        return Math.max(0.0, Math.min(100.0, score));
    }

    private String predictRank(double gpa) {
        if (gpa >= 9.5) return "Top 5% (High Distinction / Tier 1)";
        if (gpa >= 8.5) return "Top 15% (Distinction / Tier 2)";
        if (gpa >= 7.0) return "Top 30% (First Class / Tier 3)";
        if (gpa >= 6.0) return "Top 60% (Second Class)";
        if (gpa >= 5.0) return "Top 80% (Pass Class)";
        return "Below Average (Requires Remedial Assistance)";
    }

    private List<String> generateSuggestions(
            double stdDev, int lowestMark, String strongestSubject,
            String weakestSubject, double percentage, boolean failedAnySubject, boolean hasIncomplete) {
        
        List<String> suggestions = new ArrayList<>();

        if (hasIncomplete) {
            suggestions.add("Coursework Incomplete: Ensure you complete and submit all pending examinations/assignments immediately to receive final grades.");
            return suggestions;
        }

        if (failedAnySubject) {
            suggestions.add("Remedial action required: Register for extra coaching classes and practice daily exercises in " + weakestSubject + " to score at least 40.");
        } else if (lowestMark < 60) {
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
