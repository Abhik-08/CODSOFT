package com.eduvault.api.service;

import com.eduvault.api.dto.AnalyticsDto;
import com.eduvault.api.model.Student;
import com.eduvault.api.repository.StudentRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    private static final String KEY_NAME = "name";
    private static final String KEY_VALUE = "value";
    private static final String KEY_FILL = "fill";
    private static final String KEY_COUNT = "count";
    private static final String KEY_AVG_RISK = "avgRisk";

    private static final String COLOR_GREEN = "#10b981";
    private static final String COLOR_CYAN = "#06b6d4";
    private static final String COLOR_YELLOW = "#eab308";
    private static final String COLOR_ORANGE = "#f97316";
    private static final String COLOR_RED = "#ef4444";
    private static final String COLOR_EMERALD = "#34d399";
    private static final String COLOR_ROSE = "#f43f5e";
    private static final String COLOR_SKY = "#0ea5e9";

    private final StudentRepository studentRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public AnalyticsServiceImpl(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @Override
    public AnalyticsDto getOverview() {
        List<Student> students = studentRepository.findAll();
        long total = students.size();
        long active = students.stream()
                .filter(s -> "ACTIVE".equalsIgnoreCase(s.getStatus()))
                .count();

        double avgCgpa = students.stream()
                .filter(s -> s.getGpa() != null)
                .mapToDouble(Student::getGpa)
                .average()
                .orElse(0.0);
        avgCgpa = Math.round(avgCgpa * 100.0) / 100.0;

        double avgAttendance = students.stream()
                .filter(s -> s.getAttendance() != null)
                .mapToDouble(Student::getAttendance)
                .average()
                .orElse(0.0);
        avgAttendance = Math.round(avgAttendance * 100.0) / 100.0;

        // Find top department by average CGPA
        Map<String, List<Student>> byDept = students.stream()
                .collect(Collectors.groupingBy(Student::getDepartment));
        String topDept = "N/A";
        double highestAvg = 0.0;
        for (Map.Entry<String, List<Student>> entry : byDept.entrySet()) {
            double avg = entry.getValue().stream()
                    .filter(s -> s.getGpa() != null)
                    .mapToDouble(Student::getGpa)
                    .average()
                    .orElse(0.0);
            if (avg > highestAvg) {
                highestAvg = avg;
                topDept = entry.getKey();
            }
        }

        long placementReadyCount = students.stream()
                .filter(s -> s.getGpa() != null && s.getGpa() >= 8.5)
                .count();
        double placementPercentage = total == 0
                ? 0.0
                : (double) placementReadyCount / total * 100.0;
        placementPercentage = Math.round(placementPercentage * 100.0) / 100.0;

        return AnalyticsDto.builder()
                .totalStudents(total)
                .activeStudents(active)
                .averageCgpa(avgCgpa)
                .averageAttendance(avgAttendance)
                .topDepartment(topDept)
                .placementReadyPercentage(placementPercentage)
                .build();
    }

    @Override
    public Map<String, Object> getCgpaDistribution() {
        List<Student> students = studentRepository.findAll();
        Map<String, Object> result = new HashMap<>();

        Map<Integer, List<Double>> semMap = new HashMap<>();
        for (Student s : students) {
            if (s.getGpa() != null && s.getSemester() != null) {
                semMap.computeIfAbsent(s.getSemester(), k -> new ArrayList<>()).add(s.getGpa());
            }
        }
        List<Map<String, Object>> progression = semMap.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> {
                    double avg = entry.getValue().stream().mapToDouble(d -> d).average().orElse(0.0);
                    avg = Math.round(avg * 100.0) / 100.0;
                    Map<String, Object> m = new HashMap<>();
                    m.put(KEY_NAME, "Sem " + entry.getKey());
                    m.put("cgpa", avg);
                    return m;
                }).toList();
        result.put("progression", progression);

        long elite = students.stream().filter(s -> s.getGpa() != null && s.getGpa() >= 9.0).count();
        long standard = students.stream().filter(s -> s.getGpa() != null && s.getGpa() >= 7.5 && s.getGpa() < 9.0).count();
        long support = students.stream().filter(s -> s.getGpa() != null && s.getGpa() < 7.5).count();

        List<Map<String, Object>> segments = new ArrayList<>();
        segments.add(Map.of(KEY_NAME, "Elite (>= 9.0)", KEY_VALUE, elite, KEY_FILL, COLOR_EMERALD));
        segments.add(Map.of(KEY_NAME, "Standard (7.5-9.0)", KEY_VALUE, standard, KEY_FILL, COLOR_CYAN));
        segments.add(Map.of(KEY_NAME, "Support (< 7.5)", KEY_VALUE, support, KEY_FILL, COLOR_ROSE));
        result.put("segments", segments);

        return result;
    }

    @Override
    public Map<String, Object> getAttendanceAnalytics() {
        List<Student> students = studentRepository.findAll();
        Map<String, Object> result = new HashMap<>();

        Map<String, Integer[]> totals = parseAttendanceData(students);

        String[] monthNames = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
        List<Map<String, Object>> monthlyData = totals.keySet().stream()
                .sorted()
                .map(key -> {
                    Integer[] val = totals.get(key);
                    int total = val[1];
                    int present = val[0];
                    double rate = total == 0 ? 0.0 : (double) present / total * 100.0;
                    rate = Math.round(rate * 10.0) / 10.0;

                    String monthName = key;
                    try {
                        int monthIdx = Integer.parseInt(key.split("-")[1]) - 1;
                        if (monthIdx >= 0 && monthIdx < 12) {
                            monthName = monthNames[monthIdx];
                        }
                    } catch (Exception e) {
                        // ignore malformed keys
                    }

                    Map<String, Object> m = new HashMap<>();
                    m.put(KEY_NAME, monthName);
                    m.put("rate", rate);
                    return m;
                }).toList();

        if (monthlyData.isEmpty()) {
            monthlyData = List.of(Map.of(KEY_NAME, "N/A", "rate", 0.0));
        }
        result.put("monthlyAttendance", monthlyData);
        return result;
    }

    private Map<String, Integer[]> parseAttendanceData(List<Student> students) {
        Map<String, Integer[]> totals = new HashMap<>();
        for (Student s : students) {
            parseStudentAttendance(s, totals);
        }
        return totals;
    }

    private void parseStudentAttendance(Student student, Map<String, Integer[]> totals) {
        String json = student.getAttendanceJson();
        if (json == null || json.isBlank()) {
            return;
        }
        try {
            List<Map<String, Object>> attendanceList = objectMapper.readValue(
                    json, new TypeReference<List<Map<String, Object>>>() {});
            if (attendanceList == null) {
                return;
            }
            for (Map<String, Object> att : attendanceList) {
                processAttendanceRecord(att, totals);
            }
        } catch (Exception e) {
            // ignore parsing exceptions on corrupted logs
        }
    }

    private void processAttendanceRecord(Map<String, Object> att, Map<String, Integer[]> totals) {
        String date = (String) att.get("date");
        String status = (String) att.get("status");
        if (date == null || date.length() < 7 || status == null) {
            return;
        }
        String month = date.substring(0, 7);
        Integer[] val = totals.computeIfAbsent(month, k -> new Integer[]{0, 0});
        val[1]++;
        if ("PRESENT".equalsIgnoreCase(status) || "LATE".equalsIgnoreCase(status)) {
            val[0]++;
        }
    }

    @Override
    public Map<String, Object> getRiskAnalytics() {
        List<Student> students = studentRepository.findAll();
        List<Student> evaluated = students.stream().filter(s -> s.getRiskScore() != null).toList();
        Map<String, Object> result = new HashMap<>();

        long low = evaluated.stream().filter(s -> s.getRiskScore() < 25).count();
        long moderate = evaluated.stream().filter(s -> s.getRiskScore() >= 25 && s.getRiskScore() < 50).count();
        long high = evaluated.stream().filter(s -> s.getRiskScore() >= 50 && s.getRiskScore() < 75).count();
        long critical = evaluated.stream().filter(s -> s.getRiskScore() >= 75).count();

        result.put("riskDistribution", List.of(
                Map.of(KEY_NAME, "0-24 Low", KEY_COUNT, low, KEY_FILL, COLOR_GREEN),
                Map.of(KEY_NAME, "25-49 Mod", KEY_COUNT, moderate, KEY_FILL, COLOR_YELLOW),
                Map.of(KEY_NAME, "50-74 High", KEY_COUNT, high, KEY_FILL, COLOR_ORANGE),
                Map.of(KEY_NAME, "75-100 Crit", KEY_COUNT, critical, KEY_FILL, COLOR_RED)
        ));

        result.put("riskCategoryBreakdown", List.of(
                Map.of(KEY_NAME, "Low Risk (0-24)", KEY_VALUE, low, KEY_FILL, COLOR_GREEN),
                Map.of(KEY_NAME, "Moderate Risk (25-49)", KEY_VALUE, moderate, KEY_FILL, COLOR_YELLOW),
                Map.of(KEY_NAME, "High Risk (50-74)", KEY_VALUE, high, KEY_FILL, COLOR_ORANGE),
                Map.of(KEY_NAME, "Critical Risk (75-100)", KEY_VALUE, critical, KEY_FILL, COLOR_RED)
        ));

        Map<String, List<Integer>> deptRiskMap = new HashMap<>();
        for (Student s : evaluated) {
            if (s.getDepartment() != null) {
                deptRiskMap.computeIfAbsent(s.getDepartment(), k -> new ArrayList<>()).add(s.getRiskScore());
            }
        }
        List<Map<String, Object>> deptRisk = deptRiskMap.entrySet().stream()
                .map(entry -> {
                    double avg = entry.getValue().stream().mapToDouble(v -> v).average().orElse(0.0);
                    Map<String, Object> m = new HashMap<>();
                    m.put(KEY_NAME, entry.getKey().split(" ")[0]);
                    m.put("fullName", entry.getKey());
                    m.put(KEY_AVG_RISK, Math.round(avg));
                    return m;
                }).toList();
        result.put("departmentRisk", deptRisk);

        Map<Integer, List<Integer>> semRiskMap = new HashMap<>();
        for (Student s : evaluated) {
            if (s.getSemester() != null) {
                semRiskMap.computeIfAbsent(s.getSemester(), k -> new ArrayList<>()).add(s.getRiskScore());
            }
        }
        List<Map<String, Object>> semRisk = semRiskMap.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> {
                    double avg = entry.getValue().stream().mapToDouble(v -> v).average().orElse(0.0);
                    Map<String, Object> m = new HashMap<>();
                    m.put(KEY_NAME, "Sem " + entry.getKey());
                    m.put(KEY_AVG_RISK, Math.round(avg));
                    return m;
                }).toList();
        result.put("semesterRisk", semRisk);

        result.put("riskTrend", calculateRiskTrend(evaluated));

        return result;
    }

    private List<Map<String, Object>> calculateRiskTrend(List<Student> evaluated) {
        double[] trendPoints = new double[4];
        int[] trendCounts = new int[4];
        for (Student s : evaluated) {
            String json = s.getRiskTrendJson();
            if (json == null || json.isBlank()) {
                continue;
            }
            try {
                List<Integer> trend = objectMapper.readValue(json, new TypeReference<List<Integer>>() {});
                if (trend != null && trend.size() >= 4) {
                    List<Integer> lastFour = trend.subList(trend.size() - 4, trend.size());
                    for (int i = 0; i < 4; i++) {
                        trendPoints[i] += lastFour.get(i);
                        trendCounts[i]++;
                    }
                }
            } catch (Exception e) {
                // ignore parsing exceptions on malformed trends
            }
        }
        List<Map<String, Object>> riskTrend = new ArrayList<>();
        for (int i = 0; i < 4; i++) {
            double avg = trendCounts[i] == 0 ? 0.0 : trendPoints[i] / trendCounts[i];
            riskTrend.add(Map.of(KEY_NAME, "Period " + (i + 1), KEY_AVG_RISK, Math.round(avg)));
        }
        return riskTrend;
    }

    @Override
    public Map<String, Object> getDepartmentAnalytics() {
        List<Student> students = studentRepository.findAll();
        Map<String, Object> result = new HashMap<>();

        Map<String, Long> enrollment = students.stream()
                .collect(Collectors.groupingBy(Student::getDepartment, Collectors.counting()));

        Map<String, List<Double>> gpas = new HashMap<>();
        for (Student s : students) {
            if (s.getGpa() != null && s.getDepartment() != null) {
                gpas.computeIfAbsent(s.getDepartment(), k -> new ArrayList<>()).add(s.getGpa());
            }
        }
        Map<String, Double> averages = gpas.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        e -> {
                            double avg = e.getValue().stream().mapToDouble(d -> d).average().orElse(0.0);
                            return Math.round(avg * 100.0) / 100.0;
                        }
                ));

        result.put("enrollment", enrollment);
        result.put("averages", averages);
        return result;
    }

    @Override
    public Map<String, Object> getPlacementAnalytics() {
        List<Student> students = studentRepository.findAll();
        List<Student> calculated = students.stream().filter(s -> s.getPlacementScore() != null).toList();
        Map<String, Object> result = new HashMap<>();

        result.put("totalCalculated", calculated.size());

        long elite = calculated.stream().filter(s -> s.getPlacementScore() >= 90).count();
        long highPotential = calculated.stream().filter(s -> s.getPlacementScore() >= 80 && s.getPlacementScore() < 90).count();
        long ready = calculated.stream().filter(s -> s.getPlacementScore() >= 60 && s.getPlacementScore() < 80).count();
        long developing = calculated.stream().filter(s -> s.getPlacementScore() >= 40 && s.getPlacementScore() < 60).count();
        long foundation = calculated.stream().filter(s -> s.getPlacementScore() < 40).count();

        result.put("tierDistribution", List.of(
                Map.of(KEY_NAME, "Elite Candidate (90+)", KEY_VALUE, elite, KEY_FILL, COLOR_GREEN),
                Map.of(KEY_NAME, "High Potential (80-89)", KEY_VALUE, highPotential, KEY_FILL, COLOR_CYAN),
                Map.of(KEY_NAME, "Placement Ready (60-79)", KEY_VALUE, ready, KEY_FILL, COLOR_YELLOW),
                Map.of(KEY_NAME, "Developing Candidate (40-59)", KEY_VALUE, developing, KEY_FILL, COLOR_ORANGE),
                Map.of(KEY_NAME, "Foundation Stage (< 40)", KEY_VALUE, foundation, KEY_FILL, COLOR_RED)
        ));

        result.put("distributionBins", List.of(
                Map.of(KEY_NAME, "0-39 Stage", KEY_COUNT, foundation, KEY_FILL, COLOR_RED),
                Map.of(KEY_NAME, "40-59 Stage", KEY_COUNT, developing, KEY_FILL, COLOR_ORANGE),
                Map.of(KEY_NAME, "60-79 Ready", KEY_COUNT, ready, KEY_FILL, COLOR_YELLOW),
                Map.of(KEY_NAME, "80-89 High", KEY_COUNT, highPotential, KEY_FILL, COLOR_CYAN),
                Map.of(KEY_NAME, "90-100 Elite", KEY_COUNT, elite, KEY_FILL, COLOR_GREEN)
        ));

        // Academic Placement Preparation Index
        long totalCount = students.size();
        long placementReadyGpa = students.stream().filter(s -> s.getGpa() != null && s.getGpa() >= 8.5).count();
        long ongoingTrainingGpa = students.stream().filter(s -> s.getGpa() != null && s.getGpa() >= 7.0 && s.getGpa() < 8.5).count();
        long requiresSupportGpa = students.stream().filter(s -> s.getGpa() != null && s.getGpa() < 7.0).count();

        double readyPercent = totalCount == 0 ? 0.0 : (double) placementReadyGpa / totalCount * 100.0;
        double ongoingPercent = totalCount == 0 ? 0.0 : (double) ongoingTrainingGpa / totalCount * 100.0;
        double supportPercent = totalCount == 0 ? 0.0 : (double) requiresSupportGpa / totalCount * 100.0;

        result.put("readiness", List.of(
                Map.of(KEY_NAME, "Placement Ready", KEY_VALUE, Math.round(readyPercent), KEY_FILL, COLOR_GREEN),
                Map.of(KEY_NAME, "Ongoing Training", KEY_VALUE, Math.round(ongoingPercent), KEY_FILL, COLOR_SKY),
                Map.of(KEY_NAME, "Requires Support", KEY_VALUE, Math.round(supportPercent), KEY_FILL, COLOR_ROSE)
        ));

        Map<String, List<Student>> deptMap = calculated.stream().collect(Collectors.groupingBy(Student::getDepartment));
        List<Map<String, Object>> deptAverageScoreData = deptMap.entrySet().stream()
                .map(entry -> {
                    String dept = entry.getKey();
                    List<Student> list = entry.getValue();

                    double avgScore = list.stream().mapToDouble(Student::getPlacementScore).average().orElse(0.0);
                    double avgSkill = list.stream().filter(s -> s.getTechnicalReadinessScore() != null).mapToDouble(Student::getTechnicalReadinessScore).average().orElse(0.0);
                    double avgCareer = list.stream().filter(s -> s.getCareerReadinessScore() != null).mapToDouble(Student::getCareerReadinessScore).average().orElse(0.0);
                    double avgIndustry = list.stream().filter(s -> s.getIndustryReadinessScore() != null).mapToDouble(Student::getIndustryReadinessScore).average().orElse(0.0);
                    double avgProject = avgSkill * 0.95;

                    Map<String, Object> m = new HashMap<>();
                    m.put(KEY_NAME, dept.split(" ")[0]);
                    m.put("fullName", dept);
                    m.put("averageScore", Math.round(avgScore));
                    m.put("skill", Math.round(avgSkill));
                    m.put("project", Math.round(avgProject));
                    m.put("career", Math.round(avgCareer));
                    m.put("industry", Math.round(avgIndustry));
                    return m;
                }).toList();

        result.put("deptAverageScoreData", deptAverageScoreData);

        return result;
    }
}
