package com.eduvault.api.service;

import com.eduvault.api.dto.AdvisoryDto;
import com.eduvault.api.model.Advisory;
import com.eduvault.api.repository.AdvisoryRepository;
import com.eduvault.api.repository.StudentRepository;
import com.eduvault.api.model.Student;
import com.eduvault.api.config.SecurityUtils;
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

import java.time.LocalDateTime;
import java.util.*;

@Service
@SuppressWarnings("null")
public class AdvisoryServiceImpl implements AdvisoryService {

    private static final String FIRESTORE_BASE_URL = "https://firestore.googleapis.com/v1/projects/eduvault-ai/databases/(default)/documents/advisories";
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(AdvisoryServiceImpl.class);

    private static final String VAL_STRING = "stringValue";
    private static final String VAL_INTEGER = "integerValue";
    private static final String FIELDS = "fields";
    private static final String STATUS_PENDING = "PENDING";
    private static final String FIELD_TITLE = "title";
    private static final String FIELD_MESSAGE = "message";
    private static final String FIELD_PRIORITY = "priority";
    private static final String FIELD_STATUS = "status";
    private static final String FIELD_STUDENT_ID = "studentId";

    private final AdvisoryRepository advisoryRepository;
    private final StudentRepository studentRepository;
    private final Environment env;
    private final NotificationGenerator notificationGenerator;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public AdvisoryServiceImpl(AdvisoryRepository advisoryRepository, StudentRepository studentRepository, Environment env, NotificationGenerator notificationGenerator) {
        this.advisoryRepository = advisoryRepository;
        this.studentRepository = studentRepository;
        this.env = env;
        this.notificationGenerator = notificationGenerator;
    }

    private boolean isTestProfile() {
        return Arrays.asList(env.getActiveProfiles()).contains("test");
    }

    @Override
    public AdvisoryDto createAdvisory(AdvisoryDto dto) {
        Long studentId = dto.getStudentId();
        if ((studentId == null || studentId == 0L) && dto.getStudentFirestoreId() != null) {
            Optional<Student> studentOpt = studentRepository.findByFirestoreId(dto.getStudentFirestoreId());
            if (studentOpt.isPresent()) {
                studentId = studentOpt.get().getId();
            }
        }
        if (studentId == null) {
            studentId = 0L;
        }

        Advisory advisory = Advisory.builder()
                .studentId(studentId)
                .title(dto.getTitle())
                .message(dto.getMessage())
                .type(dto.getType() != null ? dto.getType() : "ACADEMIC")
                .priority(dto.getPriority() != null ? dto.getPriority() : "MEDIUM")
                .status(STATUS_PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        Advisory saved = advisoryRepository.save(advisory);

        if (!isTestProfile()) {
            try {
                RestTemplate restTemplate = SecurityUtils.getAuthenticatedRestTemplate();
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                String jsonBody = buildFirestoreJson(convertToDto(saved));
                HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);

                ResponseEntity<String> response = restTemplate.postForEntity(FIRESTORE_BASE_URL, entity, String.class);
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    JsonNode root = objectMapper.readTree(response.getBody());
                    String name = root.get("name").asText();
                    String firestoreId = name.substring(name.lastIndexOf('/') + 1);
                    saved.setFirestoreId(firestoreId);
                    advisoryRepository.save(saved);
                }
            } catch (Exception e) {
                log.error("Failed to write advisory to Firestore: {}", e.getMessage());
            }
        }
        if (saved.getStudentId() != null && saved.getStudentId() != 0L) {
            studentRepository.findById(saved.getStudentId()).ifPresent(student -> {
                String title = "Academic Advisory Generated";
                String message = "A new academic advisory has been generated: " + saved.getTitle();
                notificationGenerator.createNotification(
                    student.getEmail(),
                    title,
                    message,
                    "ADVISORY",
                    saved.getPriority(),
                    "/dashboard/advisories",
                    saved.getFirestoreId() != null ? saved.getFirestoreId() : String.valueOf(saved.getId())
                );
            });
        }

        return convertToDto(saved);
    }

    @Override
    public List<AdvisoryDto> getAdvisoriesByStudent(String studentIdStr) {
        syncWithFirestore();
        Long studentId = null;
        try {
            studentId = Long.parseLong(studentIdStr);
        } catch (NumberFormatException e) {
            Optional<Student> studentOpt = studentRepository.findByFirestoreId(studentIdStr);
            if (studentOpt.isPresent()) {
                studentId = studentOpt.get().getId();
            }
        }
        if (studentId == null) {
            return new ArrayList<>();
        }
        return advisoryRepository.findByStudentId(studentId).stream()
                .map(this::convertToDto)
                .toList();
    }

    @Override
    public AdvisoryDto updateAdvisoryStatus(Long id, String status) {
        Advisory advisory = advisoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Advisory not found with ID: " + id));

        advisory.setStatus(status.toUpperCase());
        Advisory updated = advisoryRepository.save(advisory);

        if (!isTestProfile() && updated.getFirestoreId() != null) {
            try {
                RestTemplate restTemplate = SecurityUtils.getAuthenticatedRestTemplate();
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                String jsonBody = buildFirestoreJson(convertToDto(updated));
                HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);

                String patchUrl = FIRESTORE_BASE_URL + "/" + updated.getFirestoreId() + "?updateMask.fieldPaths=status";
                headers.set("X-HTTP-Method-Override", "PATCH");
                restTemplate.exchange(patchUrl, HttpMethod.POST, entity, String.class);
            } catch (Exception e) {
                log.error("Failed to update status on Firestore: {}", e.getMessage());
            }
        }

        return convertToDto(updated);
    }

    @Override
    public void deleteAdvisory(Long id) {
        Advisory advisory = advisoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Advisory not found with ID: " + id));

        if (!isTestProfile() && advisory.getFirestoreId() != null) {
            try {
                RestTemplate restTemplate = SecurityUtils.getAuthenticatedRestTemplate();
                String deleteUrl = FIRESTORE_BASE_URL + "/" + advisory.getFirestoreId();
                restTemplate.delete(deleteUrl);
            } catch (Exception e) {
                log.error("Failed to delete advisory from Firestore: {}", e.getMessage());
            }
        }

        advisoryRepository.delete(advisory);
    }

    @Override
    public Map<String, Long> getDashboardAdvisoryStats() {
        syncWithFirestore();
        List<Advisory> all = advisoryRepository.findAll();

        long active = all.stream().filter(a -> STATUS_PENDING.equalsIgnoreCase(a.getStatus()) || "VIEWED".equalsIgnoreCase(a.getStatus())).count();
        long critical = all.stream().filter(a -> (STATUS_PENDING.equalsIgnoreCase(a.getStatus()) || "VIEWED".equalsIgnoreCase(a.getStatus())) &&
                ("CRITICAL".equalsIgnoreCase(a.getPriority()) || "HIGH".equalsIgnoreCase(a.getPriority()))).count();
        long resolved = all.stream().filter(a -> "COMPLETED".equalsIgnoreCase(a.getStatus()) || "DISMISSED".equalsIgnoreCase(a.getStatus())).count();

        Map<String, Long> stats = new HashMap<>();
        stats.put("activeAdvisories", active);
        stats.put("criticalAdvisories", critical);
        stats.put("resolvedAdvisories", resolved);
        return stats;
    }

    @Override
    public List<AdvisoryDto> getAllAdvisories() {
        syncWithFirestore();
        return advisoryRepository.findAll().stream()
                .map(this::convertToDto)
                .toList();
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

            Set<String> fetchedIds = new HashSet<>();
            for (JsonNode doc : docsNode) {
                syncDocument(doc, fetchedIds);
            }

            // Clean up deleted records
            List<Advisory> locals = advisoryRepository.findAll();
            for (Advisory local : locals) {
                if (local.getFirestoreId() != null && !fetchedIds.contains(local.getFirestoreId())) {
                    advisoryRepository.delete(local);
                }
            }
        } catch (Exception e) {
            log.warn("Firestore sync of advisories skipped/failed: {}", e.getMessage());
        }
    }

    private void syncDocument(JsonNode doc, Set<String> fetchedIds) {
        String name = doc.get("name").asText();
        String fId = name.substring(name.lastIndexOf('/') + 1);
        fetchedIds.add(fId);

        JsonNode fieldsNode = doc.get(FIELDS);
        if (fieldsNode == null) return;

        String title = fieldsNode.has(FIELD_TITLE) ? fieldsNode.get(FIELD_TITLE).get(VAL_STRING).asText() : "";
        String message = fieldsNode.has(FIELD_MESSAGE) ? fieldsNode.get(FIELD_MESSAGE).get(VAL_STRING).asText() : "";
        String type = fieldsNode.has("type") ? fieldsNode.get("type").get(VAL_STRING).asText() : "ACADEMIC";
        String priority = fieldsNode.has(FIELD_PRIORITY) ? fieldsNode.get(FIELD_PRIORITY).get(VAL_STRING).asText() : "MEDIUM";
        String status = fieldsNode.has(FIELD_STATUS) ? fieldsNode.get(FIELD_STATUS).get(VAL_STRING).asText() : STATUS_PENDING;
        
        long studentId = 0L;
        if (fieldsNode.has(FIELD_STUDENT_ID)) {
            JsonNode sNode = fieldsNode.get(FIELD_STUDENT_ID);
            if (sNode.has(VAL_STRING)) {
                String firestoreStudentId = sNode.get(VAL_STRING).asText();
                Optional<Student> studentOpt = studentRepository.findByFirestoreId(firestoreStudentId);
                if (studentOpt.isPresent()) {
                    studentId = studentOpt.get().getId();
                }
            } else if (sNode.has(VAL_INTEGER)) {
                studentId = Long.parseLong(sNode.get(VAL_INTEGER).asText());
            }
        }

        Optional<Advisory> existing = advisoryRepository.findByFirestoreId(fId);
        if (existing.isPresent()) {
            Advisory ex = existing.get();
            ex.setTitle(title);
            ex.setMessage(message);
            ex.setType(type);
            ex.setPriority(priority);
            ex.setStatus(status);
            advisoryRepository.save(ex);
        } else {
            Advisory nu = Advisory.builder()
                    .firestoreId(fId)
                    .studentId(studentId)
                    .title(title)
                    .message(message)
                    .type(type)
                    .priority(priority)
                    .status(status)
                    .createdAt(LocalDateTime.now())
                    .build();
            advisoryRepository.save(nu);
        }
    }

    private String buildFirestoreJson(AdvisoryDto dto) {
        try {
            ObjectNode root = objectMapper.createObjectNode();
            ObjectNode fieldsNode = objectMapper.createObjectNode();

            if (dto.getStudentFirestoreId() != null && !dto.getStudentFirestoreId().isEmpty()) {
                fieldsNode.set(FIELD_STUDENT_ID, objectMapper.createObjectNode().put(VAL_STRING, dto.getStudentFirestoreId()));
            } else {
                fieldsNode.set(FIELD_STUDENT_ID, objectMapper.createObjectNode().put(VAL_INTEGER, String.valueOf(dto.getStudentId())));
            }
            fieldsNode.set(FIELD_TITLE, objectMapper.createObjectNode().put(VAL_STRING, dto.getTitle()));
            fieldsNode.set(FIELD_MESSAGE, objectMapper.createObjectNode().put(VAL_STRING, dto.getMessage()));
            fieldsNode.set("type", objectMapper.createObjectNode().put(VAL_STRING, dto.getType()));
            fieldsNode.set(FIELD_PRIORITY, objectMapper.createObjectNode().put(VAL_STRING, dto.getPriority()));
            fieldsNode.set(FIELD_STATUS, objectMapper.createObjectNode().put(VAL_STRING, dto.getStatus()));

            root.set(FIELDS, fieldsNode);
            return objectMapper.writeValueAsString(root);
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to serialize Firestore payload", e);
        }
    }

    private AdvisoryDto convertToDto(Advisory advisory) {
        String firestoreStudentId = "";
        if (advisory.getStudentId() != null) {
            Optional<Student> s = studentRepository.findById(advisory.getStudentId());
            if (s.isPresent()) {
                firestoreStudentId = s.get().getFirestoreId();
            }
        }
        return AdvisoryDto.builder()
                .id(advisory.getId())
                .advisoryId(advisory.getFirestoreId())
                .studentId(advisory.getStudentId())
                .studentFirestoreId(firestoreStudentId)
                .title(advisory.getTitle())
                .message(advisory.getMessage())
                .type(advisory.getType())
                .priority(advisory.getPriority())
                .status(advisory.getStatus())
                .createdAt(advisory.getCreatedAt())
                .build();
    }
}
