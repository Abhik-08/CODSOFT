package com.eduvault.api.service;

import com.eduvault.api.dto.PlacementIntelligenceDto;
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
public class PlacementIntelligenceServiceImpl implements PlacementIntelligenceService {

    private static final String INTEGER_VALUE_KEY = "integerValue";
    private static final String STRING_VALUE_KEY = "stringValue";

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(PlacementIntelligenceServiceImpl.class);

    private final StudentRepository studentRepository;
    private final AcademicProfileService academicProfileService;
    private final PortfolioService portfolioService;
    private final Environment env;
    private final StudentService studentService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public PlacementIntelligenceServiceImpl(
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
            log.warn("Failed to dynamically sync student {} in PlacementIntelligenceService: {}", studentIdStr, e.getMessage());
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
    public PlacementIntelligenceDto getPlacementIntelligence(String studentId) {
        Student student = findStudent(studentId);
        if (student.getLastCalculatedAt() == null) {
            return recalculate(studentId);
        }
        return convertToDto(student);
    }

    @Override
    public PlacementIntelligenceDto recalculate(String studentId) {
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
            // Fetch portfolios
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

        // Calculate scores
        PlacementScoreCalculator.CalculationResult calc = PlacementScoreCalculator.calculate(
                student, semesters, projects, certificates, achievements, skills, portfolios
        );

        // Generate insights & recommendations
        List<String> strengths = PlacementInsightGenerator.generateStrengths(
                student, semesters, projects, certificates, achievements, skills, portfolios
        );
        List<String> weaknesses = PlacementInsightGenerator.generateWeaknesses(
                student, semesters, projects, certificates, achievements, skills, portfolios
        );
        List<String> skillGaps = PlacementInsightGenerator.generateSkillGaps(skills);
        List<String> careerGaps = PlacementInsightGenerator.generateCareerGaps(achievements, portfolios);
        List<String> projectGaps = PlacementInsightGenerator.generateProjectGaps(projects);
        List<String> certGaps = PlacementInsightGenerator.generateCertificationGaps(certificates);

        List<String> recommendations = PlacementRecommendationEngine.generateRecommendations(student, projects, certificates, skills);
        List<String> insights = PlacementInsightGenerator.generateCareerInsights(calc.score);
        List<String> roadmap = PlacementRecommendationEngine.generateGrowthRoadmap(student);

        // Update student entity
        student.setPlacementScore(calc.score);
        student.setPlacementTier(calc.tier);
        student.setConfidenceLevel(calc.confidence);
        student.setLastCalculatedAt(LocalDateTime.now());
        student.setAcademicReadinessScore(calc.academicScore);
        student.setTechnicalReadinessScore(calc.technicalScore);
        student.setCareerReadinessScore(calc.careerScore);
        student.setConsistencyReadinessScore(calc.consistencyScore);
        student.setIndustryReadinessScore(calc.industryScore);

        try {
            student.setStrengthsJson(objectMapper.writeValueAsString(strengths));
            student.setWeaknessesJson(objectMapper.writeValueAsString(weaknesses));
            student.setSkillGapsJson(objectMapper.writeValueAsString(skillGaps));
            student.setCareerGapsJson(objectMapper.writeValueAsString(careerGaps));
            student.setProjectGapsJson(objectMapper.writeValueAsString(projectGaps));
            student.setCertificationGapsJson(objectMapper.writeValueAsString(certGaps));
            student.setRecommendationsJson(objectMapper.writeValueAsString(recommendations));
            student.setCareerInsightsJson(objectMapper.writeValueAsString(insights));
            student.setGrowthRoadmapJson(objectMapper.writeValueAsString(roadmap));
        } catch (Exception e) {
            log.error("Failed to serialize placement lists to JSON: {}", e.getMessage());
        }

        studentRepository.save(student);

        if (!isTestProfile() && fId != null && !fId.isBlank()) {
            updateFirestorePlacementIntelligence(student);
        }

        return convertToDto(student);
    }

    private List<String> deserializeList(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private void updateFirestorePlacementIntelligence(Student student) {
        try {
            RestTemplate restTemplate = SecurityUtils.getAuthenticatedRestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            ObjectNode root = objectMapper.createObjectNode();
            ObjectNode fields = objectMapper.createObjectNode();

            fields.set("placementScore", objectMapper.createObjectNode().put(INTEGER_VALUE_KEY, String.valueOf(student.getPlacementScore())));
            fields.set("placementTier", objectMapper.createObjectNode().put(STRING_VALUE_KEY, student.getPlacementTier()));
            fields.set("confidenceLevel", objectMapper.createObjectNode().put(INTEGER_VALUE_KEY, String.valueOf(student.getConfidenceLevel())));
            fields.set("lastCalculatedAt", objectMapper.createObjectNode().put(STRING_VALUE_KEY, student.getLastCalculatedAt().toString()));
            fields.set("academicReadinessScore", objectMapper.createObjectNode().put(INTEGER_VALUE_KEY, String.valueOf(student.getAcademicReadinessScore())));
            fields.set("technicalReadinessScore", objectMapper.createObjectNode().put(INTEGER_VALUE_KEY, String.valueOf(student.getTechnicalReadinessScore())));
            fields.set("careerReadinessScore", objectMapper.createObjectNode().put(INTEGER_VALUE_KEY, String.valueOf(student.getCareerReadinessScore())));
            fields.set("consistencyReadinessScore", objectMapper.createObjectNode().put(INTEGER_VALUE_KEY, String.valueOf(student.getConsistencyReadinessScore())));
            fields.set("industryReadinessScore", objectMapper.createObjectNode().put(INTEGER_VALUE_KEY, String.valueOf(student.getIndustryReadinessScore())));

            setFirestoreArrayField(fields, "strengths", deserializeList(student.getStrengthsJson()));
            setFirestoreArrayField(fields, "weaknesses", deserializeList(student.getWeaknessesJson()));
            setFirestoreArrayField(fields, "skillGaps", deserializeList(student.getSkillGapsJson()));
            setFirestoreArrayField(fields, "careerGaps", deserializeList(student.getCareerGapsJson()));
            setFirestoreArrayField(fields, "projectGaps", deserializeList(student.getProjectGapsJson()));
            setFirestoreArrayField(fields, "certificationGaps", deserializeList(student.getCertificationGapsJson()));
            setFirestoreArrayField(fields, "recommendations", deserializeList(student.getRecommendationsJson()));
            setFirestoreArrayField(fields, "careerInsights", deserializeList(student.getCareerInsightsJson()));
            setFirestoreArrayField(fields, "growthRoadmap", deserializeList(student.getGrowthRoadmapJson()));

            root.set("fields", fields);

            String patchUrl = "https://firestore.googleapis.com/v1/projects/eduvault-ai/databases/(default)/documents/students/" + student.getFirestoreId() +
                    "?updateMask.fieldPaths=placementScore&updateMask.fieldPaths=placementTier" +
                    "&updateMask.fieldPaths=confidenceLevel&updateMask.fieldPaths=lastCalculatedAt" +
                    "&updateMask.fieldPaths=strengths&updateMask.fieldPaths=weaknesses" +
                    "&updateMask.fieldPaths=skillGaps&updateMask.fieldPaths=careerGaps" +
                    "&updateMask.fieldPaths=projectGaps&updateMask.fieldPaths=certificationGaps" +
                    "&updateMask.fieldPaths=recommendations&updateMask.fieldPaths=careerInsights" +
                    "&updateMask.fieldPaths=growthRoadmap&updateMask.fieldPaths=academicReadinessScore" +
                    "&updateMask.fieldPaths=technicalReadinessScore&updateMask.fieldPaths=careerReadinessScore" +
                    "&updateMask.fieldPaths=consistencyReadinessScore&updateMask.fieldPaths=industryReadinessScore";

            headers.set("X-HTTP-Method-Override", "PATCH");
            HttpEntity<String> entity = new HttpEntity<>(root.toString(), headers);
            restTemplate.postForEntity(patchUrl, entity, String.class);
        } catch (Exception e) {
            log.error("Failed to update placement intelligence in Firestore: {}", e.getMessage());
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

    private List<String> deserializeJsonList(String json) {
        if (json == null || json.isBlank()) return new ArrayList<>();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    private PlacementIntelligenceDto convertToDto(Student student) {
        return PlacementIntelligenceDto.builder()
                .placementScore(student.getPlacementScore())
                .placementTier(student.getPlacementTier())
                .confidenceLevel(student.getConfidenceLevel())
                .lastCalculatedAt(student.getLastCalculatedAt())
                .academicReadinessScore(student.getAcademicReadinessScore())
                .technicalReadinessScore(student.getTechnicalReadinessScore())
                .careerReadinessScore(student.getCareerReadinessScore())
                .consistencyReadinessScore(student.getConsistencyReadinessScore())
                .industryReadinessScore(student.getIndustryReadinessScore())
                .strengths(deserializeJsonList(student.getStrengthsJson()))
                .weaknesses(deserializeJsonList(student.getWeaknessesJson()))
                .skillGaps(deserializeJsonList(student.getSkillGapsJson()))
                .careerGaps(deserializeJsonList(student.getCareerGapsJson()))
                .projectGaps(deserializeJsonList(student.getProjectGapsJson()))
                .certificationGaps(deserializeJsonList(student.getCertificationGapsJson()))
                .recommendations(deserializeJsonList(student.getRecommendationsJson()))
                .careerInsights(deserializeJsonList(student.getCareerInsightsJson()))
                .growthRoadmap(deserializeJsonList(student.getGrowthRoadmapJson()))
                .build();
    }
}
