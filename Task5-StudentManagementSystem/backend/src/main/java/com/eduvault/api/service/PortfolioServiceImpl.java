package com.eduvault.api.service;

import com.eduvault.api.dto.PortfolioDto;
import com.eduvault.api.exception.ResourceNotFoundException;
import com.eduvault.api.model.Portfolio;
import com.eduvault.api.model.Student;
import com.eduvault.api.repository.PortfolioRepository;
import com.eduvault.api.repository.StudentRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.eduvault.api.config.SecurityUtils;

import java.time.LocalDateTime;
import java.util.*;

@Service
@SuppressWarnings({"null", "unchecked"})
public class PortfolioServiceImpl implements PortfolioService {

    private static final String NOT_FOUND_MSG = "Portfolio not found with id: ";
    private static final String STUDENT_NOT_FOUND = "Student not found with id: ";
    private static final String FIRESTORE_BASE_URL = "https://firestore.googleapis.com/v1/projects/eduvault-ai/databases/(default)/documents/portfolios";
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(PortfolioServiceImpl.class);

    // Literal Constants
    private static final String VAL_STRING = "stringValue";
    private static final String VAL_DOUBLE = "doubleValue";
    private static final String VAL_INTEGER = "integerValue";
    private static final String VAL_BOOLEAN = "booleanValue";
    private static final String VAL_MAP = "mapValue";
    private static final String VAL_ARRAY = "arrayValue";
    private static final String FIELDS = "fields";
    private static final String VALUES = "values";

    private static final String FIELD_STUDENT_ID = "studentId";
    private static final String FIELD_PORTFOLIO_NAME = "portfolioName";
    private static final String FIELD_TEMPLATE_TYPE = "templateType";
    private static final String FIELD_TITLE = "title";
    private static final String FIELD_SUMMARY = "summary";
    private static final String FIELD_GITHUB = "githubUrl";
    private static final String FIELD_LINKEDIN = "linkedinUrl";
    private static final String FIELD_STATUS = "portfolioStatus";
    private static final String FIELD_PORTFOLIO_URL = "portfolioUrl";
    private static final String FIELD_THEME = "theme";

    private static final String FIELD_SKILLS = "skills";
    private static final String FIELD_PROJECTS = "projects";
    private static final String FIELD_ACHIEVEMENTS = "achievements";
    private static final String FIELD_CERTIFICATES = "certificates";
    private static final String FIELD_ABOUT = "about";
    private static final String FIELD_EMAIL = "email";
    private static final String FIELD_PHONE = "phone";
    private static final String FIELD_SOCIAL_LINKS = "socialLinks";

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final PortfolioRepository portfolioRepository;
    private final StudentRepository studentRepository;
    private final Environment env;
    private final PlacementIntelligenceService placementIntelligenceService;
    private final RiskDetectionService riskDetectionService;
    private final StudentService studentService;
    private final NotificationGenerator notificationGenerator;

    @Autowired
    public PortfolioServiceImpl(
            PortfolioRepository portfolioRepository,
            StudentRepository studentRepository,
            Environment env,
            @org.springframework.context.annotation.Lazy PlacementIntelligenceService placementIntelligenceService,
            @org.springframework.context.annotation.Lazy RiskDetectionService riskDetectionService,
            @org.springframework.context.annotation.Lazy StudentService studentService,
            NotificationGenerator notificationGenerator) {
        this.portfolioRepository = portfolioRepository;
        this.studentRepository = studentRepository;
        this.env = env;
        this.placementIntelligenceService = placementIntelligenceService;
        this.riskDetectionService = riskDetectionService;
        this.studentService = studentService;
        this.notificationGenerator = notificationGenerator;
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

    private Object parseFirestoreValue(JsonNode node) {
        if (node == null || node.isNull()) return null;
        if (node.has(VAL_STRING)) {
            return node.get(VAL_STRING).asText();
        } else if (node.has(VAL_DOUBLE)) {
            return node.get(VAL_DOUBLE).asDouble();
        } else if (node.has(VAL_INTEGER)) {
            return Long.parseLong(node.get(VAL_INTEGER).asText());
        } else if (node.has(VAL_BOOLEAN)) {
            return node.get(VAL_BOOLEAN).asBoolean();
        } else if (node.has(VAL_MAP)) {
            return parseFirestoreMap(node.get(VAL_MAP));
        } else if (node.has(VAL_ARRAY)) {
            return parseFirestoreArray(node.get(VAL_ARRAY));
        }
        return null;
    }

    private Map<String, Object> parseFirestoreMap(JsonNode mapNode) {
        Map<String, Object> map = new HashMap<>();
        JsonNode fieldsNode = mapNode.get(FIELDS);
        if (fieldsNode != null && fieldsNode.isObject()) {
            for (Map.Entry<String, JsonNode> entry : fieldsNode.properties()) {
                map.put(entry.getKey(), parseFirestoreValue(entry.getValue()));
            }
        }
        return map;
    }

    private List<Object> parseFirestoreArray(JsonNode arrayNode) {
        List<Object> list = new ArrayList<>();
        JsonNode valuesNode = arrayNode.get(VALUES);
        if (valuesNode != null && valuesNode.isArray()) {
            for (JsonNode val : valuesNode) {
                list.add(parseFirestoreValue(val));
            }
        }
        return list;
    }

    private JsonNode convertToFirestoreValue(Object val, ObjectMapper mapper) {
        ObjectNode node = mapper.createObjectNode();
        if (val == null) {
            node.put("nullValue", (String) null);
        } else if (val instanceof String stringVal) {
            node.put(VAL_STRING, stringVal);
        } else if (val instanceof Number numVal) {
            if (numVal instanceof Integer || numVal instanceof Long) {
                node.put(VAL_INTEGER, String.valueOf(numVal));
            } else {
                node.put(VAL_DOUBLE, numVal.doubleValue());
            }
        } else if (val instanceof Boolean boolVal) {
            node.put(VAL_BOOLEAN, boolVal);
        } else if (val instanceof Map) {
            ObjectNode fieldsNode = mapper.createObjectNode();
            Map<?, ?> map = (Map<?, ?>) val;
            for (Map.Entry<?, ?> entry : map.entrySet()) {
                fieldsNode.set(String.valueOf(entry.getKey()), convertToFirestoreValue(entry.getValue(), mapper));
            }
            node.set(VAL_MAP, mapper.createObjectNode().set(FIELDS, fieldsNode));
        } else if (val instanceof List) {
            com.fasterxml.jackson.databind.node.ArrayNode valuesNode = mapper.createArrayNode();
            List<?> list = (List<?>) val;
            for (Object item : list) {
                valuesNode.add(convertToFirestoreValue(item, mapper));
            }
            node.set(VAL_ARRAY, mapper.createObjectNode().set(VALUES, valuesNode));
        } else {
            node.put(VAL_STRING, val.toString());
        }
        return node;
    }

    private synchronized void syncWithFirestore() {
        if (isTestProfile()) return;
        try {
            RestTemplate restTemplate = SecurityUtils.getAuthenticatedRestTemplate();
            String response = restTemplate.getForObject(FIRESTORE_BASE_URL, String.class);
            if (response == null) return;

            JsonNode root = objectMapper.readTree(response);
            JsonNode docsNode = root.get("documents");
            if (docsNode == null || !docsNode.isArray()) return;

            Set<String> fetchedFirestoreIds = new HashSet<>();
            for (JsonNode doc : docsNode) {
                processFirestoreDocument(doc, fetchedFirestoreIds);
            }

            // Remove local portfolios that were deleted from Firestore
            List<Portfolio> locals = portfolioRepository.findAll();
            for (Portfolio local : locals) {
                if (local.getFirestoreId() != null && !fetchedFirestoreIds.contains(local.getFirestoreId())) {
                    portfolioRepository.delete(local);
                }
            }

        } catch (Exception e) {
            log.error("Firestore Portfolios Sync failed: {}", e.getMessage());
        }
    }

    private String getStringField(JsonNode fieldsNode, String fieldName, String defaultValue) {
        return fieldsNode.has(fieldName) && fieldsNode.get(fieldName).has(VAL_STRING)
                ? fieldsNode.get(fieldName).get(VAL_STRING).asText()
                : defaultValue;
    }

    private List<Object> parseListField(JsonNode fieldsNode, String fieldName) {
        if (fieldsNode.has(fieldName)) {
            Object parsed = parseFirestoreValue(fieldsNode.get(fieldName));
            if (parsed instanceof List) {
                return (List<Object>) parsed;
            }
        }
        return new ArrayList<>();
    }

    /** Resolves the owning Student from the Firestore document's studentId field. */
    private Optional<Student> resolveStudentFromDoc(JsonNode fieldsNode) {
        if (!fieldsNode.has(FIELD_STUDENT_ID)) return Optional.empty();
        JsonNode studentIdNode = fieldsNode.get(FIELD_STUDENT_ID);
        if (studentIdNode.has(VAL_INTEGER) || studentIdNode.has(VAL_DOUBLE)) {
            Long studentId = parseLongValue(studentIdNode);
            return studentId != null ? studentRepository.findById(studentId) : Optional.empty();
        }
        if (studentIdNode.has(VAL_STRING)) {
            return resolveStudentByFirestoreIdStr(studentIdNode.get(VAL_STRING).asText());
        }
        return Optional.empty();
    }

    private Optional<Student> resolveStudentByFirestoreIdStr(String studentFirestoreId) {
        if (studentFirestoreId == null || studentFirestoreId.isEmpty()) {
            return Optional.empty();
        }
        Optional<Student> studentOpt = studentRepository.findByFirestoreId(studentFirestoreId);
        if (studentOpt.isEmpty()) {
            try {
                studentService.syncStudentByFirestoreId(studentFirestoreId);
                studentOpt = studentRepository.findByFirestoreId(studentFirestoreId);
            } catch (Exception e) {
                log.warn("Failed to dynamically sync student {} on portfolio resolve: {}", studentFirestoreId, e.getMessage());
            }
        }
        return studentOpt;
    }

    /** Parses the socialLinks Firestore map field into a {@code Map<String,String>}. */
    private Map<String, String> parseSocialLinksField(JsonNode fieldsNode) {
        Map<String, String> socialLinksMap = new HashMap<>();
        if (fieldsNode.has(FIELD_SOCIAL_LINKS)) {
            Object parsed = parseFirestoreValue(fieldsNode.get(FIELD_SOCIAL_LINKS));
            if (parsed instanceof Map) {
                ((Map<?, ?>) parsed).forEach((k, v) -> socialLinksMap.put(String.valueOf(k), String.valueOf(v)));
            }
        }
        return socialLinksMap;
    }

    private void applyFieldsToPortfolio(Portfolio portfolio, JsonNode fieldsNode, Student student, String firestoreId)
            throws JsonProcessingException {
        String portfolioStatus = getStringField(fieldsNode, FIELD_STATUS, "DRAFT");
        portfolio.setStudent(student);
        portfolio.setFirestoreId(firestoreId);
        portfolio.setPortfolioName(getStringField(fieldsNode, FIELD_PORTFOLIO_NAME, ""));
        portfolio.setTemplateType(getStringField(fieldsNode, FIELD_TEMPLATE_TYPE, "MODERN"));
        portfolio.setTitle(getStringField(fieldsNode, FIELD_TITLE, ""));
        portfolio.setSummary(getStringField(fieldsNode, FIELD_SUMMARY, ""));
        portfolio.setGithubUrl(getStringField(fieldsNode, FIELD_GITHUB, ""));
        portfolio.setLinkedinUrl(getStringField(fieldsNode, FIELD_LINKEDIN, ""));
        portfolio.setPortfolioStatus(portfolioStatus);
        portfolio.setPortfolioUrl(getStringField(fieldsNode, FIELD_PORTFOLIO_URL, ""));
        portfolio.setTheme(getStringField(fieldsNode, FIELD_THEME, "Nexus Dark"));
        portfolio.setPublished("PUBLISHED".equalsIgnoreCase(portfolioStatus));
        portfolio.setSkillsJson(objectMapper.writeValueAsString(parseListField(fieldsNode, FIELD_SKILLS)));
        portfolio.setProjectsJson(objectMapper.writeValueAsString(parseListField(fieldsNode, FIELD_PROJECTS)));
        portfolio.setAchievementsJson(objectMapper.writeValueAsString(parseListField(fieldsNode, FIELD_ACHIEVEMENTS)));
        portfolio.setCertificatesJson(objectMapper.writeValueAsString(parseListField(fieldsNode, FIELD_CERTIFICATES)));
        portfolio.setAbout(getStringField(fieldsNode, FIELD_ABOUT, ""));
        portfolio.setEmail(getStringField(fieldsNode, FIELD_EMAIL, ""));
        portfolio.setPhone(getStringField(fieldsNode, FIELD_PHONE, ""));
        portfolio.setSocialLinksJson(objectMapper.writeValueAsString(parseSocialLinksField(fieldsNode)));
        if (portfolio.getCreatedAt() == null) {
            portfolio.setCreatedAt(LocalDateTime.now());
        }
        portfolio.setUpdatedAt(LocalDateTime.now());
    }

    private void processFirestoreDocument(JsonNode doc, Set<String> fetchedFirestoreIds) throws JsonProcessingException {
        String name = doc.get("name").asText();
        String firestoreId = name.substring(name.lastIndexOf('/') + 1);
        fetchedFirestoreIds.add(firestoreId);
        JsonNode fieldsNode = doc.get(FIELDS);
        if (fieldsNode == null) return;

        Optional<Student> studentOpt = resolveStudentFromDoc(fieldsNode);
        if (studentOpt.isEmpty()) {
            log.warn("Student not found for portfolio sync.");
            return;
        }

        Portfolio portfolio = portfolioRepository.findByFirestoreId(firestoreId).orElseGet(Portfolio::new);
        applyFieldsToPortfolio(portfolio, fieldsNode, studentOpt.get(), firestoreId);
        portfolioRepository.save(portfolio);
    }

    private Long parseLongValue(JsonNode node) {
        if (node.has(VAL_INTEGER)) {
            return Long.parseLong(node.get(VAL_INTEGER).asText());
        } else if (node.has(VAL_DOUBLE)) {
            return (long) node.get(VAL_DOUBLE).asDouble();
        }
        return null;
    }

    private void setFirestoreArrayField(ObjectNode fieldsNode, String fieldName, List<?> list) {
        if (list != null) {
            fieldsNode.set(fieldName, convertToFirestoreValue(list, objectMapper));
        } else {
            fieldsNode.set(fieldName, objectMapper.createObjectNode().set(VAL_ARRAY, objectMapper.createObjectNode().set(VALUES, objectMapper.createArrayNode())));
        }
    }

    private String buildFirestoreJson(PortfolioDto dto) {
        try {
            ObjectNode root = objectMapper.createObjectNode();
            ObjectNode fieldsNode = objectMapper.createObjectNode();

            fieldsNode.set(FIELD_STUDENT_ID, objectMapper.createObjectNode().put(VAL_INTEGER, String.valueOf(dto.getStudentId())));
            fieldsNode.set(FIELD_PORTFOLIO_NAME, objectMapper.createObjectNode().put(VAL_STRING, dto.getPortfolioName() != null ? dto.getPortfolioName() : ""));
            fieldsNode.set(FIELD_TEMPLATE_TYPE, objectMapper.createObjectNode().put(VAL_STRING, dto.getTemplateType() != null ? dto.getTemplateType() : "MODERN"));
            fieldsNode.set(FIELD_TITLE, objectMapper.createObjectNode().put(VAL_STRING, dto.getTitle() != null ? dto.getTitle() : ""));
            fieldsNode.set(FIELD_SUMMARY, objectMapper.createObjectNode().put(VAL_STRING, dto.getSummary() != null ? dto.getSummary() : ""));
            fieldsNode.set(FIELD_GITHUB, objectMapper.createObjectNode().put(VAL_STRING, dto.getGithubUrl() != null ? dto.getGithubUrl() : ""));
            fieldsNode.set(FIELD_LINKEDIN, objectMapper.createObjectNode().put(VAL_STRING, dto.getLinkedinUrl() != null ? dto.getLinkedinUrl() : ""));
            fieldsNode.set(FIELD_STATUS, objectMapper.createObjectNode().put(VAL_STRING, dto.getPortfolioStatus() != null ? dto.getPortfolioStatus() : "DRAFT"));
            fieldsNode.set(FIELD_PORTFOLIO_URL, objectMapper.createObjectNode().put(VAL_STRING, dto.getPortfolioUrl() != null ? dto.getPortfolioUrl() : ""));
            fieldsNode.set(FIELD_THEME, objectMapper.createObjectNode().put(VAL_STRING, dto.getTheme() != null ? dto.getTheme() : "Nexus Dark"));

            setFirestoreArrayField(fieldsNode, FIELD_SKILLS, dto.getSkills());
            setFirestoreArrayField(fieldsNode, FIELD_PROJECTS, dto.getProjects());
            setFirestoreArrayField(fieldsNode, FIELD_ACHIEVEMENTS, dto.getAchievements());
            setFirestoreArrayField(fieldsNode, FIELD_CERTIFICATES, dto.getCertificates());

            fieldsNode.set(FIELD_ABOUT, objectMapper.createObjectNode().put(VAL_STRING, dto.getAbout() != null ? dto.getAbout() : ""));
            fieldsNode.set(FIELD_EMAIL, objectMapper.createObjectNode().put(VAL_STRING, dto.getEmail() != null ? dto.getEmail() : ""));
            fieldsNode.set(FIELD_PHONE, objectMapper.createObjectNode().put(VAL_STRING, dto.getPhone() != null ? dto.getPhone() : ""));

            // Serialize socialLinks as a Firestore map
            if (dto.getSocialLinks() != null) {
                fieldsNode.set(FIELD_SOCIAL_LINKS, convertToFirestoreValue(dto.getSocialLinks(), objectMapper));
            } else {
                fieldsNode.set(FIELD_SOCIAL_LINKS, convertToFirestoreValue(new HashMap<>(), objectMapper));
            }

            root.set(FIELDS, fieldsNode);
            return objectMapper.writeValueAsString(root);
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to serialize Firestore portfolio payload", e);
        }
    }

    @Override
    public List<PortfolioDto> getAllPortfolios() {
        syncWithFirestore();
        return portfolioRepository.findAll().stream()
                .map(this::convertToDto)
                .toList();
    }

    @Override
    public List<PortfolioDto> getPortfoliosByStudentId(Long studentId) {
        syncWithFirestore();
        return portfolioRepository.findByStudentId(studentId).stream()
                .map(this::convertToDto)
                .toList();
    }

    @Override
    public PortfolioDto getPortfolioById(Long id) {
        syncWithFirestore();
        Portfolio portfolio = portfolioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(NOT_FOUND_MSG + id));
        return convertToDto(portfolio);
    }

    @Override
    public PortfolioDto createPortfolio(PortfolioDto portfolioDto) {
        Student student = studentRepository.findById(portfolioDto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException(STUDENT_NOT_FOUND + portfolioDto.getStudentId()));

        Portfolio portfolio = convertToEntity(portfolioDto);
        portfolio.setStudent(student);
        portfolio.setCreatedAt(LocalDateTime.now());
        portfolio.setUpdatedAt(LocalDateTime.now());

        if (portfolio.getPortfolioUrl() == null || portfolio.getPortfolioUrl().isBlank()) {
            portfolio.setPortfolioUrl("https://eduvault.ai/portfolios/" + student.getEnrollmentNumber().toLowerCase());
        }

        Portfolio saved = portfolioRepository.save(portfolio);

        if (!isTestProfile()) {
            try {
                RestTemplate restTemplate = SecurityUtils.getAuthenticatedRestTemplate();
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                PortfolioDto d = convertToDto(saved);
                String jsonBody = buildFirestoreJson(d);
                HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);

                ResponseEntity<String> response = restTemplate.postForEntity(FIRESTORE_BASE_URL, entity, String.class);
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    JsonNode root = objectMapper.readTree(response.getBody());
                    String name = root.get("name").asText();
                    String firestoreId = name.substring(name.lastIndexOf('/') + 1);
                    saved.setFirestoreId(firestoreId);
                    portfolioRepository.save(saved);
                }
            } catch (Exception e) {
                log.error("Failed to write new portfolio to Firestore: {}", e.getMessage());
            }
        }

        // Trigger placement recalculation
        try {
            if (student.getFirestoreId() != null) {
                placementIntelligenceService.recalculate(student.getFirestoreId());
            }
        } catch (Exception e) {
            log.warn("Failed to trigger placement recalculation on portfolio creation: {}", e.getMessage());
        }

        // Trigger academic risk recalculation
        try {
            if (student.getFirestoreId() != null) {
                riskDetectionService.recalculate(student.getFirestoreId());
            }
        } catch (Exception e) {
            log.warn("Failed to trigger academic risk recalculation on portfolio creation: {}", e.getMessage());
        }
        triggerPortfolioNotifications(null, saved, student);

        return convertToDto(saved);
    }

    @Override
    public PortfolioDto updatePortfolio(Long id, PortfolioDto portfolioDto) {
        Portfolio portfolio = portfolioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(NOT_FOUND_MSG + id));

        String oldStatus = portfolio.getPortfolioStatus();
        portfolio.setPortfolioName(portfolioDto.getPortfolioName());
        portfolio.setTemplateType(portfolioDto.getTemplateType());
        portfolio.setTitle(portfolioDto.getTitle());
        portfolio.setSummary(portfolioDto.getSummary());
        portfolio.setGithubUrl(portfolioDto.getGithubUrl());
        portfolio.setLinkedinUrl(portfolioDto.getLinkedinUrl());
        portfolio.setPortfolioStatus(portfolioDto.getPortfolioStatus());
        portfolio.setPortfolioUrl(portfolioDto.getPortfolioUrl());
        portfolio.setPublished("PUBLISHED".equalsIgnoreCase(portfolioDto.getPortfolioStatus()));
        portfolio.setUpdatedAt(LocalDateTime.now());

        try {
            portfolio.setSkillsJson(objectMapper.writeValueAsString(portfolioDto.getSkills()));
            portfolio.setProjectsJson(objectMapper.writeValueAsString(portfolioDto.getProjects()));
            portfolio.setAchievementsJson(objectMapper.writeValueAsString(portfolioDto.getAchievements()));
            portfolio.setCertificatesJson(objectMapper.writeValueAsString(portfolioDto.getCertificates()));
            portfolio.setSocialLinksJson(objectMapper.writeValueAsString(portfolioDto.getSocialLinks()));
        } catch (Exception e) {
            log.error("Failed to serialize sub-lists for portfolio update: {}", e.getMessage());
        }

        portfolio.setAbout(portfolioDto.getAbout());
        portfolio.setEmail(portfolioDto.getEmail());
        portfolio.setPhone(portfolioDto.getPhone());

        Portfolio updated = portfolioRepository.save(portfolio);

        if (!isTestProfile() && updated.getFirestoreId() != null) {
            try {
                RestTemplate restTemplate = SecurityUtils.getAuthenticatedRestTemplate();
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                String jsonBody = buildFirestoreJson(convertToDto(updated));
                HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);

                String patchUrl = FIRESTORE_BASE_URL + "/" + updated.getFirestoreId() +
                        "?updateMask.fieldPaths=portfolioName&updateMask.fieldPaths=templateType&updateMask.fieldPaths=title" +
                        "&updateMask.fieldPaths=summary&updateMask.fieldPaths=skills&updateMask.fieldPaths=projects" +
                        "&updateMask.fieldPaths=achievements&updateMask.fieldPaths=certificates&updateMask.fieldPaths=githubUrl" +
                        "&updateMask.fieldPaths=linkedinUrl&updateMask.fieldPaths=portfolioStatus&updateMask.fieldPaths=portfolioUrl" +
                        "&updateMask.fieldPaths=about&updateMask.fieldPaths=email&updateMask.fieldPaths=phone&updateMask.fieldPaths=socialLinks&updateMask.fieldPaths=theme";

                headers.set("X-HTTP-Method-Override", "PATCH");
                restTemplate.exchange(patchUrl, HttpMethod.POST, entity, String.class);
            } catch (Exception e) {
                log.error("Failed to update portfolio in Firestore: {}", e.getMessage());
            }
        }

        // Trigger placement recalculation
        try {
            if (updated.getStudent() != null && updated.getStudent().getFirestoreId() != null) {
                placementIntelligenceService.recalculate(updated.getStudent().getFirestoreId());
            }
        } catch (Exception e) {
            log.warn("Failed to trigger placement recalculation on portfolio update: {}", e.getMessage());
        }

        // Trigger academic risk recalculation
        try {
            if (updated.getStudent() != null && updated.getStudent().getFirestoreId() != null) {
                riskDetectionService.recalculate(updated.getStudent().getFirestoreId());
            }
        } catch (Exception e) {
            log.warn("Failed to trigger academic risk recalculation on portfolio update: {}", e.getMessage());
        }
        triggerPortfolioNotifications(oldStatus, updated, updated.getStudent());

        return convertToDto(updated);
    }

    @Override
    public void deletePortfolio(Long id) {
        Portfolio portfolio = portfolioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(NOT_FOUND_MSG + id));

        if (!isTestProfile() && portfolio.getFirestoreId() != null) {
            try {
                RestTemplate restTemplate = SecurityUtils.getAuthenticatedRestTemplate();
                String deleteUrl = FIRESTORE_BASE_URL + "/" + portfolio.getFirestoreId();
                restTemplate.delete(deleteUrl);
            } catch (Exception e) {
                log.error("Failed to delete portfolio from Firestore: {}", e.getMessage());
            }
        }

        portfolioRepository.delete(portfolio);

        // Trigger placement recalculation
        try {
            if (portfolio.getStudent() != null && portfolio.getStudent().getFirestoreId() != null) {
                placementIntelligenceService.recalculate(portfolio.getStudent().getFirestoreId());
            }
        } catch (Exception e) {
            log.warn("Failed to trigger placement recalculation on portfolio deletion: {}", e.getMessage());
        }

        // Trigger academic risk recalculation
        try {
            if (portfolio.getStudent() != null && portfolio.getStudent().getFirestoreId() != null) {
                riskDetectionService.recalculate(portfolio.getStudent().getFirestoreId());
            }
        } catch (Exception e) {
            log.warn("Failed to trigger academic risk recalculation on portfolio deletion: {}", e.getMessage());
        }
    }

    @Override
    public PortfolioDto duplicatePortfolio(Long id) {
        Portfolio source = portfolioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(NOT_FOUND_MSG + id));

        PortfolioDto duplicateDto = convertToDto(source);
        duplicateDto.setId(null);
        duplicateDto.setFirestoreId(null);
        duplicateDto.setPortfolioName(source.getPortfolioName() + " (Copy)");
        duplicateDto.setCreatedAt(null);
        duplicateDto.setUpdatedAt(null);

        return createPortfolio(duplicateDto);
    }

    private PortfolioDto convertToDto(Portfolio portfolio) {
        PortfolioDto dto = new PortfolioDto();
        dto.setId(portfolio.getId());
        dto.setStudentId(portfolio.getStudent().getId());
        dto.setTitle(portfolio.getTitle());
        dto.setTemplateType(portfolio.getTemplateType());
        dto.setPortfolioUrl(portfolio.getPortfolioUrl());
        dto.setPublished(portfolio.isPublished());
        dto.setFirestoreId(portfolio.getFirestoreId());
        dto.setPortfolioName(portfolio.getPortfolioName());
        dto.setSummary(portfolio.getSummary());
        dto.setGithubUrl(portfolio.getGithubUrl());
        dto.setLinkedinUrl(portfolio.getLinkedinUrl());
        dto.setPortfolioStatus(portfolio.getPortfolioStatus());
        dto.setTheme(portfolio.getTheme());
        dto.setAbout(portfolio.getAbout());
        dto.setEmail(portfolio.getEmail());
        dto.setPhone(portfolio.getPhone());
        dto.setCreatedAt(portfolio.getCreatedAt());
        dto.setUpdatedAt(portfolio.getUpdatedAt());

        parseJsonFields(portfolio, dto);

        return dto;
    }

    /**
     * Deserialises a JSON column into a list; returns an empty list on any failure or when null/blank.
     */
    private <T> List<T> readJsonList(String json, TypeReference<List<T>> ref) {
        if (json == null || json.isBlank()) return new ArrayList<>();
        try {
            return objectMapper.readValue(json, ref);
        } catch (Exception e) {
            log.error("Failed to parse portfolio JSON list: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    private void parseJsonFields(Portfolio portfolio, PortfolioDto dto) {
        dto.setSkills(readJsonList(portfolio.getSkillsJson(), new TypeReference<List<String>>() {}));
        dto.setProjects(readJsonList(portfolio.getProjectsJson(), new TypeReference<List<Map<String, Object>>>() {}));
        dto.setAchievements(readJsonList(portfolio.getAchievementsJson(), new TypeReference<List<Map<String, Object>>>() {}));
        dto.setCertificates(readJsonList(portfolio.getCertificatesJson(), new TypeReference<List<Map<String, Object>>>() {}));

        // Parse socialLinks
        try {
            if (portfolio.getSocialLinksJson() != null && !portfolio.getSocialLinksJson().isEmpty()) {
                dto.setSocialLinks(objectMapper.readValue(portfolio.getSocialLinksJson(), new TypeReference<Map<String, String>>() {}));
            } else {
                dto.setSocialLinks(new HashMap<>());
            }
        } catch (Exception e) {
            log.error("Failed to parse socialLinks JSON: {}", e.getMessage());
            dto.setSocialLinks(new HashMap<>());
        }
    }

    private Portfolio convertToEntity(PortfolioDto dto) {
        Portfolio portfolio = Portfolio.builder()
                .id(dto.getId())
                .title(dto.getTitle())
                .templateType(dto.getTemplateType())
                .portfolioUrl(dto.getPortfolioUrl())
                .published(dto.isPublished())
                .firestoreId(dto.getFirestoreId())
                .portfolioName(dto.getPortfolioName())
                .summary(dto.getSummary())
                .githubUrl(dto.getGithubUrl())
                .linkedinUrl(dto.getLinkedinUrl())
                .portfolioStatus(dto.getPortfolioStatus())
                .theme(dto.getTheme())
                .about(dto.getAbout())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .createdAt(dto.getCreatedAt())
                .updatedAt(dto.getUpdatedAt())
                .build();

        try {
            portfolio.setSkillsJson(objectMapper.writeValueAsString(dto.getSkills() != null ? dto.getSkills() : new ArrayList<>()));
            portfolio.setProjectsJson(objectMapper.writeValueAsString(dto.getProjects() != null ? dto.getProjects() : new ArrayList<>()));
            portfolio.setAchievementsJson(objectMapper.writeValueAsString(dto.getAchievements() != null ? dto.getAchievements() : new ArrayList<>()));
            portfolio.setCertificatesJson(objectMapper.writeValueAsString(dto.getCertificates() != null ? dto.getCertificates() : new ArrayList<>()));
            portfolio.setSocialLinksJson(objectMapper.writeValueAsString(dto.getSocialLinks() != null ? dto.getSocialLinks() : new HashMap<>()));
        } catch (Exception e) {
            log.error("Failed to serialize lists to JSON strings for portfolio entity conversion: {}", e.getMessage());
        }

        return portfolio;
    }

    private void triggerPortfolioNotifications(String oldStatus, Portfolio saved, Student student) {
        try {
            String newStatus = saved.getPortfolioStatus();
            String recordId = saved.getFirestoreId() != null ? saved.getFirestoreId() : String.valueOf(saved.getId());
            if (!Objects.equals(oldStatus, newStatus)) {
                if ("PUBLISHED".equalsIgnoreCase(newStatus)) {
                    notificationGenerator.createNotification(
                        student.getEmail(),
                        "Portfolio Completion Achieved",
                        "Your portfolio \"" + saved.getPortfolioName() + "\" completion milestone has been achieved and is now published.",
                        "PORTFOLIO",
                        "HIGH",
                        "/dashboard/portfolio",
                        recordId
                    );
                } else if ("READY_FOR_REVIEW".equalsIgnoreCase(newStatus)) {
                    notificationGenerator.createNotification(
                        student.getEmail(),
                        "Portfolio Ready For Review",
                        "Your portfolio \"" + saved.getPortfolioName() + "\" is ready for review by faculty.",
                        "PORTFOLIO",
                        "MEDIUM",
                        "/dashboard/portfolio",
                        recordId
                    );
                }
            }
        } catch (Exception e) {
            log.warn("Failed to generate portfolio notification: {}", e.getMessage());
        }
    }
}
