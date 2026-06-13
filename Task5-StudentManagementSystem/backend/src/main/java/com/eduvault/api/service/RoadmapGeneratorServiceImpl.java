package com.eduvault.api.service;

import com.eduvault.api.config.SecurityUtils;
import com.eduvault.api.dto.RoadmapDto;
import com.eduvault.api.exception.ResourceNotFoundException;
import com.eduvault.api.model.Student;
import com.eduvault.api.model.StudentRoadmap;
import com.eduvault.api.repository.StudentRepository;
import com.eduvault.api.repository.StudentRoadmapRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

@Service
@SuppressWarnings({"null", "unchecked"})
public class RoadmapGeneratorServiceImpl implements RoadmapGeneratorService {

    private static final String NOT_FOUND_MSG = "Student not found with id: ";
    private static final String ROADMAP_NOT_FOUND_MSG = "Roadmap not found with id: ";
    private static final String FIRESTORE_BASE_URL = "https://firestore.googleapis.com/v1/projects/eduvault-ai/databases/(default)/documents/roadmaps";
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(RoadmapGeneratorServiceImpl.class);

    private static final String VAL_STRING = "stringValue";
    private static final String VAL_DOUBLE = "doubleValue";
    private static final String VAL_INTEGER = "integerValue";
    private static final String VAL_BOOLEAN = "booleanValue";
    private static final String VAL_MAP = "mapValue";
    private static final String VAL_ARRAY = "arrayValue";
    private static final String FIELDS = "fields";
    private static final String VALUES = "values";

    private static final String FIELD_STUDENT_ID = "studentId";
    private static final String FIELD_ROADMAP_TYPE = "roadmapType";
    private static final String FIELD_CURRENT_SCORE = "currentScore";
    private static final String FIELD_TARGET_SCORE = "targetScore";
    private static final String FIELD_CURRENT_STATUS = "currentStatus";
    private static final String FIELD_TARGET_STATUS = "targetStatus";
    private static final String FIELD_ESTIMATED_DURATION = "estimatedDuration";
    private static final String FIELD_PRIORITY = "priority";
    private static final String FIELD_MILESTONES = "milestones";
    private static final String FIELD_ACTION_ITEMS = "actionItems";
    private static final String FIELD_RECOMMENDATIONS = "recommendations";

    private final StudentRoadmapRepository roadmapRepository;
    private final StudentRepository studentRepository;
    private final StudentRoadmapEngine roadmapEngine;
    private final Environment env;
    private final NotificationGenerator notificationGenerator;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public RoadmapGeneratorServiceImpl(
            StudentRoadmapRepository roadmapRepository,
            StudentRepository studentRepository,
            StudentRoadmapEngine roadmapEngine,
            Environment env,
            NotificationGenerator notificationGenerator) {
        this.roadmapRepository = roadmapRepository;
        this.studentRepository = studentRepository;
        this.roadmapEngine = roadmapEngine;
        this.env = env;
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

    private String buildFirestoreJson(RoadmapDto dto) {
        try {
            ObjectNode root = objectMapper.createObjectNode();
            ObjectNode fieldsNode = objectMapper.createObjectNode();

            fieldsNode.set(FIELD_STUDENT_ID, objectMapper.createObjectNode().put(VAL_INTEGER, String.valueOf(dto.getStudentId())));
            fieldsNode.set(FIELD_ROADMAP_TYPE, objectMapper.createObjectNode().put(VAL_STRING, dto.getRoadmapType()));
            fieldsNode.set(FIELD_CURRENT_SCORE, objectMapper.createObjectNode().put(VAL_DOUBLE, dto.getCurrentScore() != null ? dto.getCurrentScore() : 0.0));
            fieldsNode.set(FIELD_TARGET_SCORE, objectMapper.createObjectNode().put(VAL_DOUBLE, dto.getTargetScore() != null ? dto.getTargetScore() : 100.0));
            fieldsNode.set(FIELD_CURRENT_STATUS, objectMapper.createObjectNode().put(VAL_STRING, dto.getCurrentStatus() != null ? dto.getCurrentStatus() : ""));
            fieldsNode.set(FIELD_TARGET_STATUS, objectMapper.createObjectNode().put(VAL_STRING, dto.getTargetStatus() != null ? dto.getTargetStatus() : ""));
            fieldsNode.set(FIELD_ESTIMATED_DURATION, objectMapper.createObjectNode().put(VAL_STRING, dto.getEstimatedDuration() != null ? dto.getEstimatedDuration() : "90 Days"));
            fieldsNode.set(FIELD_PRIORITY, objectMapper.createObjectNode().put(VAL_STRING, dto.getPriority() != null ? dto.getPriority() : "MEDIUM"));

            if (dto.getMilestones() != null) {
                fieldsNode.set(FIELD_MILESTONES, convertToFirestoreValue(dto.getMilestones(), objectMapper));
            } else {
                fieldsNode.set(FIELD_MILESTONES, objectMapper.createObjectNode().set(VAL_ARRAY, objectMapper.createObjectNode().set(VALUES, objectMapper.createArrayNode())));
            }

            if (dto.getActionItems() != null) {
                fieldsNode.set(FIELD_ACTION_ITEMS, convertToFirestoreValue(dto.getActionItems(), objectMapper));
            } else {
                fieldsNode.set(FIELD_ACTION_ITEMS, objectMapper.createObjectNode().set(VAL_ARRAY, objectMapper.createObjectNode().set(VALUES, objectMapper.createArrayNode())));
            }

            if (dto.getRecommendations() != null) {
                fieldsNode.set(FIELD_RECOMMENDATIONS, convertToFirestoreValue(dto.getRecommendations(), objectMapper));
            } else {
                fieldsNode.set(FIELD_RECOMMENDATIONS, objectMapper.createObjectNode().set(VAL_ARRAY, objectMapper.createObjectNode().set(VALUES, objectMapper.createArrayNode())));
            }

            root.set(FIELDS, fieldsNode);
            return objectMapper.writeValueAsString(root);
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to serialize Firestore roadmap payload", e);
        }
    }

    @Override
    public List<RoadmapDto> getRoadmapsByStudentId(Long studentId) {
        syncRoadmapsWithFirestore();
        return roadmapRepository.findByStudentId(studentId).stream()
                .map(this::convertToDto)
                .toList();
    }

    @Override
    public List<RoadmapDto> getAllRoadmaps() {
        syncRoadmapsWithFirestore();
        return roadmapRepository.findAll().stream()
                .map(this::convertToDto)
                .toList();
    }

    @Override
    public RoadmapDto generateRoadmap(Long studentId, String roadmapType) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException(NOT_FOUND_MSG + studentId));

        // Delete existing roadmap of the same category to prevent duplication
        Optional<StudentRoadmap> existing = roadmapRepository.findByStudentIdAndRoadmapType(studentId, roadmapType);
        existing.ifPresent(studentRoadmap -> {
            if (!isTestProfile() && studentRoadmap.getRoadmapId() != null) {
                try {
                    RestTemplate restTemplate = SecurityUtils.getAuthenticatedRestTemplate();
                    restTemplate.delete(FIRESTORE_BASE_URL + "/" + studentRoadmap.getRoadmapId());
                } catch (Exception e) {
                    log.warn("Failed to delete roadmap from Firestore on override: {}", e.getMessage());
                }
            }
            roadmapRepository.delete(studentRoadmap);
        });

        RoadmapDto generatedDto = roadmapEngine.generateRoadmap(student, roadmapType);
        StudentRoadmap roadmap = convertToEntity(generatedDto);
        roadmap.setStudent(student);
        roadmap.setCreatedAt(LocalDateTime.now());
        roadmap.setUpdatedAt(LocalDateTime.now());

        StudentRoadmap saved = roadmapRepository.save(roadmap);

        if (!isTestProfile()) {
            try {
                RestTemplate restTemplate = SecurityUtils.getAuthenticatedRestTemplate();
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                RoadmapDto d = convertToDto(saved);
                String jsonBody = buildFirestoreJson(d);
                HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);

                ResponseEntity<String> response = restTemplate.postForEntity(FIRESTORE_BASE_URL, entity, String.class);
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    JsonNode root = objectMapper.readTree(response.getBody());
                    String name = root.get("name").asText();
                    String firestoreId = name.substring(name.lastIndexOf('/') + 1);
                    saved.setRoadmapId(firestoreId);
                    roadmapRepository.save(saved);
                }
            } catch (Exception e) {
                log.error("Failed to write new roadmap to Firestore: {}", e.getMessage());
            }
        }

        // Trigger notification for new roadmap generation
        notificationGenerator.createNotification(
                student.getEmail(),
                "Roadmap Alert: New Roadmap Generated",
                String.format("A new %s roadmap has been generated to guide your learning progression.", roadmapType),
                "ROADMAP",
                "MEDIUM",
                "/roadmaps"
        );

        return convertToDto(saved);
    }

    @Override
    public RoadmapDto updateRoadmap(Long id, RoadmapDto dto) {
        StudentRoadmap roadmap = roadmapRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ROADMAP_NOT_FOUND_MSG + id));

        roadmap.setCurrentScore(dto.getCurrentScore());
        roadmap.setTargetScore(dto.getTargetScore());
        roadmap.setCurrentStatus(dto.getCurrentStatus());
        roadmap.setTargetStatus(dto.getTargetStatus());
        roadmap.setEstimatedDuration(dto.getEstimatedDuration());
        roadmap.setPriority(dto.getPriority());
        roadmap.setUpdatedAt(LocalDateTime.now());

        try {
            roadmap.setMilestonesJson(objectMapper.writeValueAsString(dto.getMilestones()));
            roadmap.setActionItemsJson(objectMapper.writeValueAsString(dto.getActionItems()));
            roadmap.setRecommendationsJson(objectMapper.writeValueAsString(dto.getRecommendations()));
        } catch (Exception e) {
            log.error("Failed to serialize lists for roadmap update: {}", e.getMessage());
        }

        StudentRoadmap updated = roadmapRepository.save(roadmap);

        if (!isTestProfile() && updated.getRoadmapId() != null) {
            try {
                RestTemplate restTemplate = SecurityUtils.getAuthenticatedRestTemplate();
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                String jsonBody = buildFirestoreJson(convertToDto(updated));
                HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);

                String patchUrl = FIRESTORE_BASE_URL + "/" + updated.getRoadmapId() +
                        "?updateMask.fieldPaths=currentScore&updateMask.fieldPaths=targetScore" +
                        "&updateMask.fieldPaths=currentStatus&updateMask.fieldPaths=targetStatus" +
                        "&updateMask.fieldPaths=milestones&updateMask.fieldPaths=actionItems" +
                        "&updateMask.fieldPaths=recommendations&updateMask.fieldPaths=estimatedDuration" +
                        "&updateMask.fieldPaths=priority";

                headers.set("X-HTTP-Method-Override", "PATCH");
                restTemplate.exchange(patchUrl, HttpMethod.POST, entity, String.class);
            } catch (Exception e) {
                log.error("Failed to update roadmap in Firestore: {}", e.getMessage());
            }
        }

        // Trigger notification for roadmap updates/milestones completed
        notificationGenerator.createNotification(
                updated.getStudent().getEmail(),
                "Roadmap Alert: Roadmap Updated",
                String.format("Your %s roadmap progress has been updated. Current status is now: %s.", updated.getRoadmapType(), updated.getCurrentStatus()),
                "ROADMAP",
                "LOW",
                "/roadmaps"
        );

        return convertToDto(updated);
    }

    @Override
    public synchronized void syncRoadmapsWithFirestore() {
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

            // Remove local roadmaps that were deleted from Firestore
            List<StudentRoadmap> locals = roadmapRepository.findAll();
            for (StudentRoadmap local : locals) {
                if (local.getRoadmapId() != null && !fetchedFirestoreIds.contains(local.getRoadmapId())) {
                    roadmapRepository.delete(local);
                }
            }
        } catch (Exception e) {
            log.error("Firestore Roadmaps Sync failed: {}", e.getMessage());
        }
    }

    private void processFirestoreDocument(JsonNode doc, Set<String> fetchedFirestoreIds) throws com.fasterxml.jackson.core.JsonProcessingException {
        String name = doc.get("name").asText();
        String firestoreId = name.substring(name.lastIndexOf('/') + 1);
        fetchedFirestoreIds.add(firestoreId);
        JsonNode fieldsNode = doc.get(FIELDS);
        if (fieldsNode == null) return;

        Long studentId = null;
        if (fieldsNode.has(FIELD_STUDENT_ID)) {
            JsonNode sNode = fieldsNode.get(FIELD_STUDENT_ID);
            if (sNode.has(VAL_INTEGER)) studentId = Long.parseLong(sNode.get(VAL_INTEGER).asText());
            else if (sNode.has(VAL_DOUBLE)) studentId = (long) sNode.get(VAL_DOUBLE).asDouble();
        }

        if (studentId == null) return;
        Optional<Student> studentOpt = studentRepository.findById(studentId);
        if (studentOpt.isEmpty()) return;

        StudentRoadmap roadmap = roadmapRepository.findByRoadmapId(firestoreId).orElseGet(StudentRoadmap::new);
        roadmap.setStudent(studentOpt.get());
        roadmap.setRoadmapId(firestoreId);
        roadmap.setRoadmapType(fieldsNode.has(FIELD_ROADMAP_TYPE) ? fieldsNode.get(FIELD_ROADMAP_TYPE).get(VAL_STRING).asText() : "ACADEMIC");
        roadmap.setCurrentScore(fieldsNode.has(FIELD_CURRENT_SCORE) ? fieldsNode.get(FIELD_CURRENT_SCORE).get(VAL_DOUBLE).asDouble() : 0.0);
        roadmap.setTargetScore(fieldsNode.has(FIELD_TARGET_SCORE) ? fieldsNode.get(FIELD_TARGET_SCORE).get(VAL_DOUBLE).asDouble() : 100.0);
        roadmap.setCurrentStatus(fieldsNode.has(FIELD_CURRENT_STATUS) ? fieldsNode.get(FIELD_CURRENT_STATUS).get(VAL_STRING).asText() : "");
        roadmap.setTargetStatus(fieldsNode.has(FIELD_TARGET_STATUS) ? fieldsNode.get(FIELD_TARGET_STATUS).get(VAL_STRING).asText() : "");
        roadmap.setEstimatedDuration(fieldsNode.has(FIELD_ESTIMATED_DURATION) ? fieldsNode.get(FIELD_ESTIMATED_DURATION).get(VAL_STRING).asText() : "90 Days");
        roadmap.setPriority(fieldsNode.has(FIELD_PRIORITY) ? fieldsNode.get(FIELD_PRIORITY).get(VAL_STRING).asText() : "MEDIUM");

        roadmap.setMilestonesJson(objectMapper.writeValueAsString(parseListField(fieldsNode, FIELD_MILESTONES)));
        roadmap.setActionItemsJson(objectMapper.writeValueAsString(parseListField(fieldsNode, FIELD_ACTION_ITEMS)));
        roadmap.setRecommendationsJson(objectMapper.writeValueAsString(parseListField(fieldsNode, FIELD_RECOMMENDATIONS)));

        if (roadmap.getCreatedAt() == null) {
            roadmap.setCreatedAt(LocalDateTime.now());
        }
        roadmap.setUpdatedAt(LocalDateTime.now());

        roadmapRepository.save(roadmap);
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

    private RoadmapDto convertToDto(StudentRoadmap r) {
        return RoadmapDto.builder()
                .id(r.getId())
                .studentId(r.getStudent().getId())
                .roadmapId(r.getRoadmapId())
                .roadmapType(r.getRoadmapType())
                .currentScore(r.getCurrentScore())
                .targetScore(r.getTargetScore())
                .currentStatus(r.getCurrentStatus())
                .targetStatus(r.getTargetStatus())
                .milestones(deserializeList(r.getMilestonesJson()))
                .actionItems(deserializeList(r.getActionItemsJson()))
                .recommendations(deserializeList(r.getRecommendationsJson()))
                .estimatedDuration(r.getEstimatedDuration())
                .priority(r.getPriority())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }

    private StudentRoadmap convertToEntity(RoadmapDto d) {
        StudentRoadmap r = StudentRoadmap.builder()
                .id(d.getId())
                .roadmapId(d.getRoadmapId())
                .roadmapType(d.getRoadmapType())
                .currentScore(d.getCurrentScore())
                .targetScore(d.getTargetScore())
                .currentStatus(d.getCurrentStatus())
                .targetStatus(d.getTargetStatus())
                .estimatedDuration(d.getEstimatedDuration())
                .priority(d.getPriority())
                .createdAt(d.getCreatedAt())
                .updatedAt(d.getUpdatedAt())
                .build();

        try {
            r.setMilestonesJson(objectMapper.writeValueAsString(d.getMilestones() != null ? d.getMilestones() : new ArrayList<>()));
            r.setActionItemsJson(objectMapper.writeValueAsString(d.getActionItems() != null ? d.getActionItems() : new ArrayList<>()));
            r.setRecommendationsJson(objectMapper.writeValueAsString(d.getRecommendations() != null ? d.getRecommendations() : new ArrayList<>()));
        } catch (Exception e) {
            log.error("Failed to serialize lists to JSON strings for roadmap entity: {}", e.getMessage());
        }
        return r;
    }

    private List<String> deserializeList(String json) {
        if (json == null || json.isBlank()) return new ArrayList<>();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
}
