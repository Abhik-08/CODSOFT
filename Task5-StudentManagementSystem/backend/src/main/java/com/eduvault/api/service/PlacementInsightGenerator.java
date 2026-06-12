package com.eduvault.api.service;

import com.eduvault.api.model.Student;
import java.util.*;

public class PlacementInsightGenerator {

    public static List<String> generateStrengths(
            Student student,
            List<Map<String, Object>> semesters,
            List<Map<String, Object>> projects,
            List<Map<String, Object>> certificates,
            List<Map<String, Object>> achievements,
            List<Map<String, Object>> skills,
            List<Map<String, Object>> portfolios) {

        List<String> list = new ArrayList<>();
        double gpa = student.getGpa() != null ? student.getGpa() : 0.0;
        double attendance = student.getAttendance() != null ? student.getAttendance() : 100.0;

        if (gpa >= 9.0) list.add("Consistent Academic Excellence");
        else if (gpa >= 8.5) list.add("Strong Core Engineering Foundation");

        if (attendance >= 95.0) list.add("Exceptional Attendance Consistency");
        else if (attendance >= 90.0) list.add("Exceptional Academic Discipline");

        if (projects.size() >= 3) list.add("Outstanding Technical Project Depth");
        else if (projects.size() >= 2) list.add("Proven Hands-on Practical Expertise");

        if (certificates.size() >= 2) list.add("Dedicated Industry Certification Record");
        if (achievements.size() >= 2) list.add("Well-Rounded Co-Curricular Profile");

        boolean hasPublished = false;
        boolean hasGitHub = false;
        boolean hasLinkedIn = false;
        for (Map<String, Object> port : portfolios) {
            if ("PUBLISHED".equalsIgnoreCase(String.valueOf(port.get("portfolioStatus"))) || Boolean.TRUE.equals(port.get("published"))) {
                hasPublished = true;
            }
            if (port.get("githubUrl") != null && !port.get("githubUrl").toString().isBlank()) {
                hasGitHub = true;
            }
            if (port.get("linkedinUrl") != null && !port.get("linkedinUrl").toString().isBlank()) {
                hasLinkedIn = true;
            }
        }

        if (hasPublished) list.add("Professional Web Portfolio Presence");
        if (hasGitHub) list.add("Open Source Contributor Mindset");
        if (hasLinkedIn) list.add("Active Professional Networking Presence");

        if (skills.size() >= 8) list.add("Diverse Technology Stack Competency");
        else if (skills.size() >= 4) list.add("Continuous Learning Orientation");

        // Fallbacks to reach at least 3 strengths
        for (String str : PlacementInsightDatabase.STRENGTHS) {
            if (list.size() >= 5) break;
            if (!list.contains(str)) {
                list.add(str);
            }
        }

        return list;
    }

    public static List<String> generateWeaknesses(
            Student student,
            List<Map<String, Object>> semesters,
            List<Map<String, Object>> projects,
            List<Map<String, Object>> certificates,
            List<Map<String, Object>> achievements,
            List<Map<String, Object>> skills,
            List<Map<String, Object>> portfolios) {

        List<String> list = new ArrayList<>();
        double gpa = student.getGpa() != null ? student.getGpa() : 0.0;
        double attendance = student.getAttendance() != null ? student.getAttendance() : 100.0;

        if (gpa < 7.0) list.add("Academic performance needs enhancement");
        if (attendance < 75.0) list.add("Critical classroom attendance shortage");

        if (projects.isEmpty()) list.add("Absence of hands-on project exposure");
        else if (projects.size() == 1) list.add("Limited practical project diversity");

        if (skills.size() < 3) list.add("Narrow technical skill profile");
        if (certificates.isEmpty()) list.add("Lack of industry-recognized certifications");
        if (achievements.isEmpty()) list.add("No co-curricular or competitive achievements");

        boolean hasPublished = false;
        boolean hasGitHub = false;
        boolean hasLinkedIn = false;
        for (Map<String, Object> port : portfolios) {
            if ("PUBLISHED".equalsIgnoreCase(String.valueOf(port.get("portfolioStatus"))) || Boolean.TRUE.equals(port.get("published"))) {
                hasPublished = true;
            }
            if (port.get("githubUrl") != null && !port.get("githubUrl").toString().isBlank()) {
                hasGitHub = true;
            }
            if (port.get("linkedinUrl") != null && !port.get("linkedinUrl").toString().isBlank()) {
                hasLinkedIn = true;
            }
        }

        if (!hasPublished) list.add("Missing professional portfolio website");
        if (!hasGitHub) list.add("Limited open-source/GitHub activity proof");
        if (!hasLinkedIn) list.add("Weak professional brand visibility");

        // Fallbacks to reach at least 3 weaknesses
        for (String w : PlacementInsightDatabase.WEAKNESSES) {
            if (list.size() >= 4) break;
            if (!list.contains(w)) {
                list.add(w);
            }
        }

        return list;
    }

    public static List<String> generateSkillGaps(List<Map<String, Object>> skills) {
        List<String> gaps = new ArrayList<>();
        Set<String> skillNames = new HashSet<>();
        for (Map<String, Object> s : skills) {
            if (s.get("name") != null) {
                skillNames.add(s.get("name").toString().toLowerCase().trim());
            }
        }

        if (skillNames.contains("java") && !skillNames.contains("spring boot") && !skillNames.contains("spring")) {
            gaps.add("Spring Boot backend development framework");
        }
        if (skillNames.contains("javascript") && !skillNames.contains("react") && !skillNames.contains("nextjs")) {
            gaps.add("Modern frontend frameworks (React/Next.js)");
        }
        if (!skillNames.contains("git") && !skillNames.contains("github")) {
            gaps.add("Git version control & collaborative workflows");
        }
        if (!skillNames.contains("docker") && !skillNames.contains("kubernetes")) {
            gaps.add("Containerization & Cloud Orchestration (Docker)");
        }
        if (!skillNames.contains("aws") && !skillNames.contains("gcp") && !skillNames.contains("azure")) {
            gaps.add("Cloud service providers integration");
        }
        if (!skillNames.contains("sql") && !skillNames.contains("mysql") && !skillNames.contains("postgresql") && !skillNames.contains("mongodb")) {
            gaps.add("Relational and non-relational database management");
        }

        // Add defaults if gaps list is empty
        if (gaps.isEmpty()) {
            gaps.add("System Design concepts and Microservices architectures");
            gaps.add("Automated testing and Test-driven development (TDD)");
        }

        return gaps;
    }

    public static List<String> generateCareerGaps(List<Map<String, Object>> achievements, List<Map<String, Object>> portfolios) {
        List<String> gaps = new ArrayList<>();
        boolean hasLinkedIn = false;
        for (Map<String, Object> port : portfolios) {
            if (port.get("linkedinUrl") != null && !port.get("linkedinUrl").toString().isBlank()) {
                hasLinkedIn = true;
                break;
            }
        }

        if (!hasLinkedIn) {
            gaps.add("LinkedIn professional branding profile");
        }

        boolean hasHackathon = false;
        for (Map<String, Object> ach : achievements) {
            String title = ach.get("title") != null ? ach.get("title").toString().toLowerCase() : "";
            if (title.contains("hackathon") || title.contains("competition") || title.contains("contest")) {
                hasHackathon = true;
                break;
            }
        }

        if (!hasHackathon) {
            gaps.add("Co-curricular competitions and hackathon participation");
        }

        if (achievements.isEmpty()) {
            gaps.add("Extracurricular leadership roles and organization activities");
        }

        if (gaps.size() < 2) {
            gaps.add("Technical communities engagement (e.g. GDG, local clubs)");
            gaps.add("Internships and professional work experience");
        }

        return gaps;
    }

    public static List<String> generateProjectGaps(List<Map<String, Object>> projects) {
        List<String> gaps = new ArrayList<>();
        if (projects.isEmpty()) {
            gaps.add("Primary functional software project codebase");
            gaps.add("Multi-tier application deployment");
        } else if (projects.size() == 1) {
            gaps.add("Project portfolio diversity (e.g. utility vs full stack)");
        }

        boolean hasTesting = false;
        boolean hasDeployment = false;
        for (Map<String, Object> p : projects) {
            String desc = p.get("description") != null ? p.get("description").toString().toLowerCase() : "";
            if (desc.contains("test") || desc.contains("junit") || desc.contains("mocha")) {
                hasTesting = true;
            }
            if (desc.contains("deploy") || desc.contains("vercel") || desc.contains("heroku") || desc.contains("render") || desc.contains("aws")) {
                hasDeployment = true;
            }
        }

        if (!hasTesting) {
            gaps.add("Comprehensive unit/integration testing implementation");
        }
        if (!hasDeployment) {
            gaps.add("Production-grade hosting and CI/CD pipelines");
        }

        if (gaps.size() < 2) {
            gaps.add("Clean code documentation and API documentation (Swagger)");
            gaps.add("System monitoring or custom analytics tracking");
        }

        return gaps;
    }

    public static List<String> generateCertificationGaps(List<Map<String, Object>> certificates) {
        List<String> gaps = new ArrayList<>();
        if (certificates.isEmpty()) {
            gaps.add("Core language credentials (e.g. Java, Python)");
            gaps.add("Industry vendor cloud credentials (e.g. AWS Practitioner)");
        } else if (certificates.size() == 1) {
            gaps.add("Specialized domain credentials (e.g. DevOps, Database)");
        }

        if (gaps.size() < 2) {
            gaps.add("Agile/Scrum team workflow certifications");
            gaps.add("Advanced software architecture specialization badges");
        }

        return gaps;
    }

    public static List<String> generateCareerInsights(int placementScore) {
        List<String> insights = new ArrayList<>();

        if (placementScore >= 90) {
            insights.add("Highly competitive candidate for top-tier product software companies.");
            insights.add("Recommended for fast-track product engineering and research roles.");
            insights.add("Eligible for premium technology consultant and architecture paths.");
        } else if (placementScore >= 80) {
            insights.add("Strong fit for core software development and systems engineering roles.");
            insights.add("Excellent candidate for modern full-stack web and cloud associate career paths.");
            insights.add("Recommended to target medium to large scale product companies.");
        } else if (placementScore >= 60) {
            insights.add("Good potential for junior web developer and quality assurance engineer roles.");
            insights.add("Well-suited for business analyst, technical operations, or database associate tracks.");
            insights.add("Recommended to build specialization to target active placement drives.");
        } else {
            insights.add("Candidate is in development stage and should focus on building initial projects.");
            insights.add("Needs to bridge foundational programming language and DSA gaps before interviews.");
            insights.add("Strong recommendation to build a public portfolio presence to gain recruiter interest.");
        }

        // Add matches from PlacementInsightDatabase to reach 3+
        for (String ins : PlacementInsightDatabase.PLACEMENT_INSIGHTS) {
            if (insights.size() >= 4) break;
            if (!insights.contains(ins)) {
                insights.add(ins);
            }
        }

        return insights;
    }
}
