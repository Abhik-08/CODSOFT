package com.eduvault.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.Objects;

/**
 * Firestore REST API-based implementation for academic profile subcollection CRUD.
 * Follows the same pattern as StudentServiceImpl for Firestore interaction.
 */
@Service
public class AcademicProfileServiceImpl implements AcademicProfileService {

    private static final String FIRESTORE_BASE = "https://firestore.googleapis.com/v1/projects/eduvault-ai/databases/(default)/documents/students";
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(AcademicProfileServiceImpl.class);

    private static final String VAL_STRING = "stringValue";
    private static final String VAL_DOUBLE = "doubleValue";
    private static final String VAL_INTEGER = "integerValue";
    private static final String FIELDS = "fields";

    // Subcollection name constants
    private static final String SUB_SEMESTERS = "semesters";
    private static final String SUB_SUBJECTS = "subjects";
    private static final String SUB_CERTIFICATES = "certificates";
    private static final String SUB_PROJECTS = "projects";
    private static final String SUB_ACHIEVEMENTS = "achievements";
    private static final String SUB_SKILLS = "skills";

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // ── Generic helpers ─────────────────────────────────────────────

    private String subcollectionUrl(String studentId, String subcollection) {
        return FIRESTORE_BASE + "/" + studentId + "/" + subcollection;
    }

    private String docUrl(String studentId, String subcollection, String docId) {
        return subcollectionUrl(studentId, subcollection) + "/" + docId;
    }

    private HttpHeaders jsonHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    /** Convert a Map<String,Object> to Firestore field format */
    private ObjectNode toFirestoreFields(Map<String, Object> data) {
        ObjectNode fields = objectMapper.createObjectNode();
        for (Map.Entry<String, Object> entry : data.entrySet()) {
            ObjectNode fieldValue = objectMapper.createObjectNode();
            Object val = entry.getValue();
            if (val instanceof Number number) {
                if (number instanceof Integer || number instanceof Long) {
                    fieldValue.put(VAL_INTEGER, String.valueOf(number));
                } else {
                    fieldValue.put(VAL_DOUBLE, number.doubleValue());
                }
            } else {
                fieldValue.put(VAL_STRING, String.valueOf(val));
            }
            fields.set(entry.getKey(), fieldValue);
        }
        return fields;
    }

    /** Parse Firestore document into simple Map */
    private Map<String, Object> parseDocument(JsonNode doc) {
        Map<String, Object> result = new LinkedHashMap<>();
        // Extract ID from document name
        String name = doc.has("name") ? doc.get("name").asText() : "";
        if (!name.isEmpty()) {
            String[] parts = name.split("/");
            result.put("id", parts[parts.length - 1]);
        }
        if (doc.has(FIELDS)) {
            JsonNode fields = doc.get(FIELDS);
            fields.fieldNames().forEachRemaining(key -> {
                JsonNode fieldVal = fields.get(key);
                if (fieldVal.has(VAL_STRING)) {
                    result.put(key, fieldVal.get(VAL_STRING).asText());
                } else if (fieldVal.has(VAL_DOUBLE)) {
                    result.put(key, fieldVal.get(VAL_DOUBLE).asDouble());
                } else if (fieldVal.has(VAL_INTEGER)) {
                    result.put(key, fieldVal.get(VAL_INTEGER).asLong());
                }
            });
        }
        return result;
    }

    /** List all documents in a subcollection */
    private List<Map<String, Object>> listSubcollection(String studentId, String subcollection) {
        List<Map<String, Object>> results = new ArrayList<>();
        try {
            String url = subcollectionUrl(studentId, subcollection);
            ResponseEntity<String> response = restTemplate.getForEntity(Objects.requireNonNull(url), String.class);
            if (response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                if (root.has("documents")) {
                    for (JsonNode doc : root.get("documents")) {
                        results.add(parseDocument(doc));
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed to list {}/{}: {}", studentId, subcollection, e.getMessage());
        }
        return results;
    }

    /** Add a document to a subcollection */
    private Map<String, Object> addToSubcollection(String studentId, String subcollection, Map<String, Object> data) {
        try {
            String url = subcollectionUrl(studentId, subcollection);
            ObjectNode body = objectMapper.createObjectNode();
            body.set(FIELDS, toFirestoreFields(data));

            HttpEntity<String> entity = new HttpEntity<>(body.toString(), jsonHeaders());
            ResponseEntity<String> response = restTemplate.postForEntity(Objects.requireNonNull(url), entity, String.class);

            if (response.getBody() != null) {
                return parseDocument(objectMapper.readTree(response.getBody()));
            }
        } catch (Exception e) {
            log.error("Failed to add to {}/{}: {}", studentId, subcollection, e.getMessage());
            throw new IllegalStateException("Failed to add document to " + subcollection, e);
        }
        return data;
    }

    /** Update a document in a subcollection */
    private Map<String, Object> updateInSubcollection(String studentId, String subcollection, String docId, Map<String, Object> data) {
        try {
            String url = docUrl(studentId, subcollection, docId);
            ObjectNode body = objectMapper.createObjectNode();
            body.set(FIELDS, toFirestoreFields(data));

            HttpEntity<String> entity = new HttpEntity<>(body.toString(), jsonHeaders());
            restTemplate.exchange(Objects.requireNonNull(url), Objects.requireNonNull(HttpMethod.PATCH), entity, String.class);

            Map<String, Object> result = new LinkedHashMap<>(data);
            result.put("id", docId);
            return result;
        } catch (Exception e) {
            log.error("Failed to update {}/{}/{}: {}", studentId, subcollection, docId, e.getMessage());
            throw new IllegalStateException("Failed to update document in " + subcollection, e);
        }
    }

    /** Delete a document from a subcollection */
    private void deleteFromSubcollection(String studentId, String subcollection, String docId) {
        try {
            String url = docUrl(studentId, subcollection, docId);
            restTemplate.delete(Objects.requireNonNull(url));
        } catch (Exception e) {
            log.error("Failed to delete {}/{}/{}: {}", studentId, subcollection, docId, e.getMessage());
            throw new IllegalStateException("Failed to delete document from " + subcollection, e);
        }
    }

    // ── Semesters ───────────────────────────────────────────────────

    @Override
    public List<Map<String, Object>> getSemesters(String studentId) {
        return listSubcollection(studentId, SUB_SEMESTERS);
    }

    @Override
    public Map<String, Object> addSemester(String studentId, Map<String, Object> data) {
        return addToSubcollection(studentId, SUB_SEMESTERS, data);
    }

    @Override
    public Map<String, Object> updateSemester(String studentId, String docId, Map<String, Object> data) {
        return updateInSubcollection(studentId, SUB_SEMESTERS, docId, data);
    }

    @Override
    public void deleteSemester(String studentId, String docId) {
        deleteFromSubcollection(studentId, SUB_SEMESTERS, docId);
    }

    // ── Subjects ────────────────────────────────────────────────────

    @Override
    public List<Map<String, Object>> getSubjects(String studentId) {
        return listSubcollection(studentId, SUB_SUBJECTS);
    }

    @Override
    public Map<String, Object> addSubject(String studentId, Map<String, Object> data) {
        return addToSubcollection(studentId, SUB_SUBJECTS, data);
    }

    @Override
    public Map<String, Object> updateSubject(String studentId, String docId, Map<String, Object> data) {
        return updateInSubcollection(studentId, SUB_SUBJECTS, docId, data);
    }

    @Override
    public void deleteSubject(String studentId, String docId) {
        deleteFromSubcollection(studentId, SUB_SUBJECTS, docId);
    }

    // ── Certificates ────────────────────────────────────────────────

    @Override
    public List<Map<String, Object>> getCertificates(String studentId) {
        return listSubcollection(studentId, SUB_CERTIFICATES);
    }

    @Override
    public Map<String, Object> addCertificate(String studentId, Map<String, Object> data) {
        return addToSubcollection(studentId, SUB_CERTIFICATES, data);
    }

    @Override
    public Map<String, Object> updateCertificate(String studentId, String docId, Map<String, Object> data) {
        return updateInSubcollection(studentId, SUB_CERTIFICATES, docId, data);
    }

    @Override
    public void deleteCertificate(String studentId, String docId) {
        deleteFromSubcollection(studentId, SUB_CERTIFICATES, docId);
    }

    // ── Projects ────────────────────────────────────────────────────

    @Override
    public List<Map<String, Object>> getProjects(String studentId) {
        return listSubcollection(studentId, SUB_PROJECTS);
    }

    @Override
    public Map<String, Object> addProject(String studentId, Map<String, Object> data) {
        return addToSubcollection(studentId, SUB_PROJECTS, data);
    }

    @Override
    public Map<String, Object> updateProject(String studentId, String docId, Map<String, Object> data) {
        return updateInSubcollection(studentId, SUB_PROJECTS, docId, data);
    }

    @Override
    public void deleteProject(String studentId, String docId) {
        deleteFromSubcollection(studentId, SUB_PROJECTS, docId);
    }

    // ── Achievements ────────────────────────────────────────────────

    @Override
    public List<Map<String, Object>> getAchievements(String studentId) {
        return listSubcollection(studentId, SUB_ACHIEVEMENTS);
    }

    @Override
    public Map<String, Object> addAchievement(String studentId, Map<String, Object> data) {
        return addToSubcollection(studentId, SUB_ACHIEVEMENTS, data);
    }

    @Override
    public Map<String, Object> updateAchievement(String studentId, String docId, Map<String, Object> data) {
        return updateInSubcollection(studentId, SUB_ACHIEVEMENTS, docId, data);
    }

    @Override
    public void deleteAchievement(String studentId, String docId) {
        deleteFromSubcollection(studentId, SUB_ACHIEVEMENTS, docId);
    }

    // ── Skills ──────────────────────────────────────────────────────

    @Override
    public List<Map<String, Object>> getSkills(String studentId) {
        return listSubcollection(studentId, SUB_SKILLS);
    }

    @Override
    public Map<String, Object> addSkill(String studentId, Map<String, Object> data) {
        return addToSubcollection(studentId, SUB_SKILLS, data);
    }

    @Override
    public Map<String, Object> updateSkill(String studentId, String docId, Map<String, Object> data) {
        return updateInSubcollection(studentId, SUB_SKILLS, docId, data);
    }

    @Override
    public void deleteSkill(String studentId, String docId) {
        deleteFromSubcollection(studentId, SUB_SKILLS, docId);
    }

    // ── Placement Status ────────────────────────────────────────────

    @Override
    public void updatePlacementStatus(String studentId, String status, Integer offerCount) {
        try {
            String url = FIRESTORE_BASE + "/" + studentId + "?updateMask.fieldPaths=placementStatus&updateMask.fieldPaths=offerCount";

            Map<String, Object> fields = new LinkedHashMap<>();
            fields.put("placementStatus", status);
            fields.put("offerCount", offerCount != null ? offerCount : 0);

            ObjectNode body = objectMapper.createObjectNode();
            body.set(FIELDS, toFirestoreFields(fields));

            HttpEntity<String> entity = new HttpEntity<>(body.toString(), jsonHeaders());
            restTemplate.exchange(Objects.requireNonNull(url), Objects.requireNonNull(HttpMethod.PATCH), entity, String.class);
            log.info("Updated placement status for student {}: {} (offers: {})", studentId, status, offerCount);
        } catch (Exception e) {
            log.error("Failed to update placement status for {}: {}", studentId, e.getMessage());
            throw new IllegalStateException("Failed to update placement status", e);
        }
    }
}
