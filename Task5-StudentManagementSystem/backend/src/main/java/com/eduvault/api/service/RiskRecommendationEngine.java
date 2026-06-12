package com.eduvault.api.service;

import com.eduvault.api.model.Student;
import java.util.*;

public class RiskRecommendationEngine {

    public static List<String> generateInterventions(Student student, double cgpa, double attendance, int projCount) {
        List<String> list = new ArrayList<>();
        if (attendance < 80.0) {
            list.add("Improve attendance consistency");
        }
        if (projCount < 2) {
            list.add("Complete one industry project");
        }
        if (cgpa < 7.0) {
            list.add("Schedule mandatory academic advising meetings");
            list.add("Join peer tutoring workshops for critical courses");
        }

        for (String item : RiskInsightDatabase.INTERVENTION_SUGGESTIONS) {
            if (!list.contains(item)) {
                list.add(item);
            }
            if (list.size() >= 8) break;
        }

        return list;
    }

    public static List<String> generatePriorityActions(Student student, double cgpa, double attendance, int projCount, int skillCount) {
        List<String> list = new ArrayList<>();
        if (skillCount < 4) {
            list.add("Solve 50+ DSA problems on LeetCode or HackerRank");
            list.add("Complete 5 SQL query practice modules on platforms");
        }
        if (projCount == 0) {
            list.add("Create 1 industry-ready project with documentation");
        }
        if (cgpa < 7.5) {
            list.add("Schedule focus blocks using Pomodoro technique daily");
        }

        for (String item : RiskInsightDatabase.IMPROVEMENT_ACTIONS) {
            if (!list.contains(item)) {
                list.add(item);
            }
            if (list.size() >= 8) break;
        }

        return list;
    }

    public static List<String> generateAcademicRecommendations(Student student, double cgpa, double attendance) {
        List<String> list = new ArrayList<>();
        if (cgpa < 7.5) {
            list.add("Implement strict study schedules of 3 hours daily");
            list.add("Review SGPA monitoring logs weekly with class teacher");
            list.add("Attend professor office hours for subject doubts");
        }
        if (attendance < 85.0) {
            list.add("Avoid missing consecutive classes in core modules");
        }

        for (String item : RiskInsightDatabase.ACADEMIC_RECOMMENDATIONS) {
            if (!list.contains(item)) {
                list.add(item);
            }
            if (list.size() >= 8) break;
        }

        return list;
    }
}
