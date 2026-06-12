package com.eduvault.api.service;

import com.eduvault.api.model.Student;
import java.util.*;

public class PlacementRecommendationEngine {

    public static List<String> generateRecommendations(
            Student student,
            List<Map<String, Object>> projects,
            List<Map<String, Object>> certificates,
            List<Map<String, Object>> skills) {

        List<String> list = new ArrayList<>();
        double gpa = student.getGpa() != null ? student.getGpa() : 0.0;
        double attendance = student.getAttendance() != null ? student.getAttendance() : 100.0;

        if (gpa < 8.0) list.add("Prepare for coding interviews and strengthen basic concepts");
        if (attendance < 75.0) list.add("Improve classroom attendance to exceed 80% threshold");
        if (projects.isEmpty()) list.add("Build production-grade full-stack applications");
        if (certificates.isEmpty()) list.add("Complete cloud computing certifications (AWS/GCP)");
        if (skills.size() < 4) list.add("Solve 150+ Data Structures & Algorithms problems");

        // Add suggestions based on department
        String dept = student.getDepartment() != null ? student.getDepartment().toLowerCase() : "";
        if (dept.contains("computer") || dept.contains("information") || dept.contains("it")) {
            list.add("Contribute to open-source GitHub repositories");
            list.add("Learn containerization tools like Docker and Kubernetes");
        } else if (dept.contains("data") || dept.contains("analytics")) {
            list.add("Develop an AI/ML project using real-world datasets");
            list.add("Obtain a database management system certification");
        }

        // Add general suggestions from Database to reach 4-5
        for (String rec : PlacementInsightDatabase.RECOMMENDATIONS) {
            if (list.size() >= 5) break;
            if (!list.contains(rec)) {
                list.add(rec);
            }
        }

        return list;
    }

    public static List<String> generateGrowthRoadmap(Student student) {
        List<String> list = new ArrayList<>();
        String dept = student.getDepartment() != null ? student.getDepartment().toLowerCase() : "";

        if (dept.contains("computer") || dept.contains("it") || dept.contains("software")) {
            list.add("Phase 1: Master foundational DSA on LeetCode/HackerRank.");
            list.add("Phase 2: Build a microservices-based full-stack project using React and Spring Boot.");
            list.add("Phase 3: Deploy to AWS cloud using GitHub Actions CI/CD pipelines.");
            list.add("Phase 4: Build professional branding via LinkedIn and open-source contributions.");
        } else if (dept.contains("data") || dept.contains("ai") || dept.contains("analytics")) {
            list.add("Phase 1: Solidify Python programming and Pandas/NumPy analytics libraries.");
            list.add("Phase 2: Complete certification in AWS Machine Learning or Google Data Analytics.");
            list.add("Phase 3: Build a custom end-to-end data pipeline ETL using Spark and PostgreSQL.");
            list.add("Phase 4: Share predictive ML insights on Kaggle and optimize LinkedIn profile.");
        } else {
            list.add("Phase 1: Establish strong competency in at least one core object-oriented language (Java/Python).");
            list.add("Phase 2: Build 2 practical projects applying core database integration (SQL).");
            list.add("Phase 3: Build portfolio website and showcase coding assignments on GitHub.");
            list.add("Phase 4: Practice core aptitude tests and mock technical interviews.");
        }

        // Fill with databases
        for (String suggest : PlacementInsightDatabase.CAREER_GROWTH) {
            if (list.size() >= 5) break;
            String entry = "Specialization: " + suggest;
            if (!list.contains(entry)) {
                list.add(entry);
            }
        }

        return list;
    }

    public static List<String> generateLearningSuggestions(Student student, List<Map<String, Object>> skills) {
        List<String> list = new ArrayList<>();
        Set<String> skillNames = new HashSet<>();
        for (Map<String, Object> s : skills) {
            if (s.get("name") != null) {
                skillNames.add(s.get("name").toString().toLowerCase().trim());
            }
        }

        if (!skillNames.contains("java") && !skillNames.contains("python") && !skillNames.contains("cpp") && !skillNames.contains("c")) {
            list.add("Take an advanced course on Data Structures & Algorithms");
        }
        if (!skillNames.contains("docker")) {
            list.add("Complete a course on Docker containerization basics");
        }
        if (!skillNames.contains("react") && !skillNames.contains("angular")) {
            list.add("Learn modern JavaScript frameworks (React 19 / NextJS 15)");
        }
        if (!skillNames.contains("sql") && !skillNames.contains("postgres")) {
            list.add("Study SQL database design and query execution planning");
        }

        // Fill up to 4 suggestions
        for (String suggest : PlacementInsightDatabase.LEARNING_SUGGESTIONS) {
            if (list.size() >= 5) break;
            if (!list.contains(suggest)) {
                list.add(suggest);
            }
        }

        return list;
    }

    public static List<String> generateProjectRecommendations(Student student) {
        List<String> list = new ArrayList<>();
        String dept = student.getDepartment() != null ? student.getDepartment().toLowerCase() : "";

        if (dept.contains("computer") || dept.contains("it")) {
            list.add("Build a microservices-based e-commerce backend platform");
            list.add("Build a containerized chat application using WebSockets");
        } else if (dept.contains("data") || dept.contains("ai")) {
            list.add("Develop an AI-powered resume screening and scoring system");
            list.add("Create a personal finance dashboard with data visualization");
        } else {
            list.add("Develop a bug tracking and team collaboration board");
            list.add("Build a customized content management system (CMS)");
        }

        // Fill up to 4 suggestions
        for (String suggest : PlacementInsightDatabase.PROJECT_RECOMMENDATIONS) {
            if (list.size() >= 5) break;
            if (!list.contains(suggest)) {
                list.add(suggest);
            }
        }

        return list;
    }

    public static List<String> generateCertificationRecommendations(Student student) {
        List<String> list = new ArrayList<>();
        String dept = student.getDepartment() != null ? student.getDepartment().toLowerCase() : "";

        if (dept.contains("computer") || dept.contains("it")) {
            list.add("AWS Certified Cloud Practitioner");
            list.add("Docker Certified Associate (DCA)");
        } else if (dept.contains("data") || dept.contains("analytics")) {
            list.add("Google Data Analytics Professional Certificate");
            list.add("MongoDB Certified Developer Associate");
        } else {
            list.add("Oracle Certified Associate: Java SE Programmer");
            list.add("Google Project Management Professional Certificate");
        }

        // Fill up to 4 suggestions
        for (String suggest : PlacementInsightDatabase.CERTIFICATION_RECOMMENDATIONS) {
            if (list.size() >= 5) break;
            if (!list.contains(suggest)) {
                list.add(suggest);
            }
        }

        return list;
    }
}
