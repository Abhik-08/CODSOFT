package com.eduvault.api.service;

import com.eduvault.api.dto.RiskDto;
import com.eduvault.api.exception.ResourceNotFoundException;
import com.eduvault.api.model.Student;
import com.eduvault.api.repository.StudentRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.eduvault.api.config.SecurityUtils;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class RiskDetectionServiceImpl implements RiskDetectionService {

    private static final String INTEGER_VALUE_KEY = "integerValue";
    private static final String STRING_VALUE_KEY = "stringValue";
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(RiskDetectionServiceImpl.class);

    private final StudentRepository studentRepository;
    private final AcademicProfileService academicProfileService;
    private final PortfolioService portfolioService;
    private final Environment env;
    private final StudentService studentService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public RiskDetectionServiceImpl(
            StudentRepository studentRepository,
            AcademicProfileService academicProfileService,
            PortfolioService portfolioService,
            Environment env,
            @org.springframework.context.annotation.Lazy StudentService studentService) {
        this.studentRepository = studentRepository;
        this.academicProfileService = academicProfileService;
        this.portfolioService = portfolioService;
        this.env = env;
        this.studentService = studentService;
    }

    private boolean isTestProfile() {
        if (env == null) return false;
        for (String profile : env.getActiveProfiles()) {
            if ("test".equalsIgnoreCase(profile)) {
                return true;
            }
        }
        return false;
    }

    private Student findStudent(String studentIdStr) {
        try {
            Long id = Long.parseLong(studentIdStr);
            Optional<Student> studentOpt = studentRepository.findById(id);
            if (studentOpt.isPresent()) {
                return studentOpt.get();
            }
        } catch (NumberFormatException e) {
            // Ignore, try firestoreId
        }

        Optional<Student> studentOpt = studentRepository.findByFirestoreId(studentIdStr);
        if (studentOpt.isPresent()) {
            return studentOpt.get();
        }

        try {
            studentService.syncStudentByFirestoreId(studentIdStr);
            studentOpt = studentRepository.findByFirestoreId(studentIdStr);
            if (studentOpt.isPresent()) {
                return studentOpt.get();
            }
        } catch (Exception e) {
            log.warn("Failed to dynamically sync student {} in RiskDetectionService: {}", studentIdStr, e.getMessage());
        }

        studentOpt = studentRepository.findByEnrollmentNumber(studentIdStr);
        if (studentOpt.isPresent()) {
            return studentOpt.get();
        }

        studentOpt = studentRepository.findByEmail(studentIdStr);
        if (studentOpt.isPresent()) {
            return studentOpt.get();
        }

        throw new ResourceNotFoundException("Student not found with identifier: " + studentIdStr);
    }

    @Override
    public RiskDto getRiskByStudentId(String studentId) {
        Student student = findStudent(studentId);
        if (student.getRiskLastCalculatedAt() == null) {
            return recalculate(studentId);
        }
        return convertToDto(student);
    }

    private List<Integer> getUpdatedTrend(Student student, int score) {
        List<Integer> trend = new ArrayList<>();
        if (student.getRiskTrendJson() != null && !student.getRiskTrendJson().isBlank()) {
            try {
                trend = objectMapper.readValue(student.getRiskTrendJson(), new TypeReference<List<Integer>>() {});
            } catch (Exception e) {
                // Ignore parsing errors
            }
        }
        if (trend.isEmpty()) {
            trend.add(Math.max(0, score - 4));
            trend.add(Math.min(100, score + 2));
            trend.add(Math.max(0, score - 2));
        }
        trend.add(score);
        if (trend.size() > 6) {
            trend = trend.subList(trend.size() - 6, trend.size());
        }
        return trend;
    }

    @Override
    public RiskDto recalculate(String studentId) {
        Student student = findStudent(studentId);
        Long studentDbId = student.getId();
        String fId = student.getFirestoreId();

        List<Map<String, Object>> semesters = new ArrayList<>();
        List<Map<String, Object>> projects = new ArrayList<>();
        List<Map<String, Object>> certificates = new ArrayList<>();
        List<Map<String, Object>> achievements = new ArrayList<>();
        List<Map<String, Object>> skills = new ArrayList<>();
        List<Map<String, Object>> portfolios = new ArrayList<>();

        if (fId != null && !fId.isBlank()) {
            try {
                semesters = academicProfileService.getSemesters(fId);
                projects = academicProfileService.getProjects(fId);
                certificates = academicProfileService.getCertificates(fId);
                achievements = academicProfileService.getAchievements(fId);
                skills = academicProfileService.getSkills(fId);
            } catch (Exception e) {
                log.warn("Failed to fetch Firestore academic profile for student: {}", e.getMessage());
            }
        }

        try {
            portfolios = portfolioService.getPortfoliosByStudentId(studentDbId).stream()
                    .map(dto -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("published", dto.isPublished());
                        map.put("portfolioStatus", dto.getPortfolioStatus());
                        map.put("githubUrl", dto.getGithubUrl());
                        map.put("linkedinUrl", dto.getLinkedinUrl());
                        map.put("projects", dto.getProjects());
                        return map;
                    }).toList();
        } catch (Exception e) {
            log.warn("Failed to fetch portfolios for student: {}", e.getMessage());
        }

        // Calculate risk
        RiskScoreCalculator.CalculationResult calc = RiskScoreCalculator.calculate(
                student, semesters, projects, certificates, achievements, skills, portfolios
        );

        // Generate explainable insights & actions
        List<String> reasons = RiskInsightGenerator.generateRiskReasons(
                student, semesters, projects, certificates, achievements, skills, portfolios
        );
        List<String> factors = RiskInsightGenerator.generateRiskFactors(
                student, semesters, projects, certificates, achievements, skills, portfolios
        );

        double cgpa = student.getGpa() != null ? student.getGpa() : 0.0;
        double attendance = student.getAttendance() != null ? student.getAttendance() : 100.0;
        List<String> interventions = RiskRecommendationEngine.generateInterventions(
                cgpa, attendance, projects.size()
        );
        List<String> priorityActions = RiskRecommendationEngine.generatePriorityActions(
                cgpa, projects.size(), skills.size()
        );
        List<String> academicRecommendations = RiskRecommendationEngine.generateAcademicRecommendations(
                cgpa, attendance
        );

        // Handle risk trend
        List<Integer> trend = getUpdatedTrend(student, calc.getScore());

        // Update Student
        student.setRiskScore(calc.getScore());
        student.setRiskCategory(calc.getCategory());
        student.setRiskLastCalculatedAt(LocalDateTime.now());

        try {
            student.setRiskFactorsJson(objectMapper.writeValueAsString(factors));
            student.setRiskReasonsJson(objectMapper.writeValueAsString(reasons));
            student.setInterventionSuggestionsJson(objectMapper.writeValueAsString(interventions));
            student.setPriorityActionsJson(objectMapper.writeValueAsString(priorityActions));
            student.setRecommendationsJson(objectMapper.writeValueAsString(academicRecommendations)); // Reuse recommendationsJson field
            student.setRiskTrendJson(objectMapper.writeValueAsString(trend));
        } catch (Exception e) {
            log.error("Failed to serialize risk lists to JSON: {}", e.getMessage());
        }

        studentRepository.save(student);

        if (!isTestProfile() && fId != null && !fId.isBlank()) {
            updateFirestoreRisk(student, calc, factors, reasons, interventions, priorityActions, trend);
        }

        return convertToDto(student);
    }

    private void updateFirestoreRisk(
            Student student,
            RiskScoreCalculator.CalculationResult calc,
            List<String> factors,
            List<String> reasons,
            List<String> interventions,
            List<String> priorityActions,
            List<Integer> trend) {
        try {
            RestTemplate restTemplate = SecurityUtils.getAuthenticatedRestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            ObjectNode root = objectMapper.createObjectNode();
            ObjectNode fields = objectMapper.createObjectNode();

            fields.set("riskScore", objectMapper.createObjectNode().put(INTEGER_VALUE_KEY, String.valueOf(calc.getScore())));
            fields.set("riskCategory", objectMapper.createObjectNode().put(STRING_VALUE_KEY, calc.getCategory()));
            fields.set("lastCalculatedAt", objectMapper.createObjectNode().put(STRING_VALUE_KEY, student.getRiskLastCalculatedAt().toString()));

            setFirestoreArrayField(fields, "riskFactors", factors);
            setFirestoreArrayField(fields, "riskReasons", reasons);
            setFirestoreArrayField(fields, "interventionSuggestions", interventions);
            setFirestoreArrayField(fields, "priorityActions", priorityActions);

            // Set trend array
            ObjectNode trendArrayNode = objectMapper.createObjectNode();
            com.fasterxml.jackson.databind.node.ArrayNode trendValuesNode = objectMapper.createArrayNode();
            for (Integer val : trend) {
                trendValuesNode.add(objectMapper.createObjectNode().put(INTEGER_VALUE_KEY, String.valueOf(val)));
            }
            trendArrayNode.set("values", trendValuesNode);
            fields.set("riskTrend", objectMapper.createObjectNode().set("arrayValue", trendArrayNode));

            root.set("fields", fields);

            String patchUrl = "https://firestore.googleapis.com/v1/projects/eduvault-ai/databases/(default)/documents/students/" + student.getFirestoreId() +
                    "?updateMask.fieldPaths=riskScore&updateMask.fieldPaths=riskCategory" +
                    "&updateMask.fieldPaths=lastCalculatedAt&updateMask.fieldPaths=riskFactors" +
                    "&updateMask.fieldPaths=riskReasons&updateMask.fieldPaths=interventionSuggestions" +
                    "&updateMask.fieldPaths=priorityActions&updateMask.fieldPaths=riskTrend";

            headers.set("X-HTTP-Method-Override", "PATCH");
            HttpEntity<String> entity = new HttpEntity<>(root.toString(), headers);
            restTemplate.postForEntity(patchUrl, entity, String.class);
        } catch (Exception e) {
            log.error("Failed to update risk in Firestore: {}", e.getMessage());
        }
    }

    private void setFirestoreArrayField(ObjectNode fieldsNode, String fieldName, List<String> list) {
        ObjectNode arrayNode = objectMapper.createObjectNode();
        com.fasterxml.jackson.databind.node.ArrayNode valuesNode = objectMapper.createArrayNode();
        if (list != null) {
            for (String s : list) {
                valuesNode.add(objectMapper.createObjectNode().put(STRING_VALUE_KEY, s));
            }
        }
        arrayNode.set("values", valuesNode);
        fieldsNode.set(fieldName, objectMapper.createObjectNode().set("arrayValue", arrayNode));
    }

    @Override
    public List<RiskDto> getAllRisks() {
        return studentRepository.findAll().stream()
                .map(this::convertToDto)
                .toList();
    }

    private List<String> deserializeJsonList(String json) {
        if (json == null || json.isBlank()) return new ArrayList<>();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    private List<Integer> deserializeJsonIntList(String json) {
        if (json == null || json.isBlank()) return new ArrayList<>();
        try {
            return objectMapper.readValue(json, new TypeReference<List<Integer>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    private RiskDto convertToDto(Student student) {
        return RiskDto.builder()
                .studentId(student.getId())
                .studentName(student.getFirstName() + " " + student.getLastName())
                .riskScore(student.getRiskScore())
                .riskCategory(student.getRiskCategory())
                .riskFactors(deserializeJsonList(student.getRiskFactorsJson()))
                .riskReasons(deserializeJsonList(student.getRiskReasonsJson()))
                .interventionSuggestions(deserializeJsonList(student.getInterventionSuggestionsJson()))
                .priorityActions(deserializeJsonList(student.getPriorityActionsJson()))
                .riskTrend(deserializeJsonIntList(student.getRiskTrendJson()))
                .lastCalculatedAt(student.getRiskLastCalculatedAt())
                .build();
    }
}
