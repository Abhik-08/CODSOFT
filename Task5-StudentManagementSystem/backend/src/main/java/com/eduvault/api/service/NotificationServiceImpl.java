package com.eduvault.api.service;

import com.eduvault.api.dto.NotificationDto;
import com.eduvault.api.model.Notification;
import com.eduvault.api.repository.NotificationRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.eduvault.api.config.SecurityUtils;

import java.time.LocalDateTime;
import java.util.*;

@Service
@SuppressWarnings("null")
public class NotificationServiceImpl implements NotificationService {

    private static final String FIRESTORE_BASE_URL = "https://firestore.googleapis.com/v1/projects/eduvault-ai/databases/(default)/documents/alerts";
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(NotificationServiceImpl.class);

    private static final String VAL_STRING = "stringValue";
    private static final String FIELDS = "fields";
    private static final String USER_ID = "userId";
    private static final String TITLE = "title";
    private static final String MESSAGE = "message";
    private static final String PRIORITY = "priority";
    private static final String STATUS = "status";
    private static final String RELATED_RECORD_ID = "relatedRecordId";
    private static final String CREATED_AT = "createdAt";
    private static final String UPDATED_AT = "updatedAt";
    private static final String STATUS_UNREAD = "UNREAD";

    private final NotificationRepository notificationRepository;
    private final Environment env;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public NotificationServiceImpl(NotificationRepository notificationRepository, Environment env) {
        this.notificationRepository = notificationRepository;
        this.env = env;
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

    private String buildFirestoreJson(NotificationDto dto) {
        try {
            ObjectNode root = objectMapper.createObjectNode();
            ObjectNode fieldsNode = objectMapper.createObjectNode();

            fieldsNode.set("alertId", objectMapper.createObjectNode().put(VAL_STRING, dto.getNotificationId() != null ? dto.getNotificationId() : ""));
            fieldsNode.set(USER_ID, objectMapper.createObjectNode().put(VAL_STRING, dto.getUserId()));
            fieldsNode.set(TITLE, objectMapper.createObjectNode().put(VAL_STRING, dto.getTitle()));
            fieldsNode.set(MESSAGE, objectMapper.createObjectNode().put(VAL_STRING, dto.getMessage()));
            fieldsNode.set("type", objectMapper.createObjectNode().put(VAL_STRING, dto.getType()));
            fieldsNode.set(PRIORITY, objectMapper.createObjectNode().put(VAL_STRING, dto.getPriority()));
            fieldsNode.set(STATUS, objectMapper.createObjectNode().put(VAL_STRING, dto.getStatus()));
            fieldsNode.set(RELATED_RECORD_ID, objectMapper.createObjectNode().put(VAL_STRING, dto.getRelatedRecordId() != null ? dto.getRelatedRecordId() : ""));
            fieldsNode.set(CREATED_AT, objectMapper.createObjectNode().put(VAL_STRING, dto.getCreatedAt() != null ? dto.getCreatedAt().toString() : LocalDateTime.now().toString()));
            fieldsNode.set(UPDATED_AT, objectMapper.createObjectNode().put(VAL_STRING, dto.getUpdatedAt() != null ? dto.getUpdatedAt().toString() : LocalDateTime.now().toString()));

            root.set(FIELDS, fieldsNode);
            return objectMapper.writeValueAsString(root);
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to serialize Firestore payload", e);
        }
    }

    @Override
    public List<NotificationDto> getNotificationsForUser(String email) {
        syncNotificationsWithFirestore();
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(email).stream()
                .map(this::convertToDto)
                .toList();
    }

    @Override
    public List<NotificationDto> getUnreadNotificationsForUser(String email) {
        syncNotificationsWithFirestore();
        return notificationRepository.findByUserIdAndStatusOrderByCreatedAtDesc(email, STATUS_UNREAD).stream()
                .map(this::convertToDto)
                .toList();
    }

    @Override
    public List<NotificationDto> getAllNotifications() {
        syncNotificationsWithFirestore();
        return notificationRepository.findAll().stream()
                .map(this::convertToDto)
                .toList();
    }

    @Override
    public NotificationDto createNotification(NotificationDto dto) {
        Notification notification = convertToEntity(dto);
        if (notification.getCreatedAt() == null) {
            notification.setCreatedAt(LocalDateTime.now());
        }
        notification.setUpdatedAt(LocalDateTime.now());
        notification.setStatus(STATUS_UNREAD);

        Notification saved = notificationRepository.save(notification);

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
                    saved.setNotificationId(firestoreId);
                    notificationRepository.save(saved);
                }
            } catch (Exception e) {
                log.error("Failed to write notification to Firestore: {}", e.getMessage());
            }
        }

        return convertToDto(saved);
    }

    @Override
    public NotificationDto updateNotificationStatus(String notificationId, String status) {
        Notification notification = notificationRepository.findByNotificationId(notificationId)
                .orElseThrow(() -> new NoSuchElementException("Notification not found with firestore id: " + notificationId));

        notification.setStatus(status.toUpperCase());
        notification.setUpdatedAt(LocalDateTime.now());
        Notification saved = notificationRepository.save(notification);

        if (!isTestProfile() && saved.getNotificationId() != null) {
            try {
                RestTemplate restTemplate = SecurityUtils.getAuthenticatedRestTemplate();
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                String jsonBody = buildFirestoreJson(convertToDto(saved));
                HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);

                String patchUrl = FIRESTORE_BASE_URL + "/" + saved.getNotificationId() + "?updateMask.fieldPaths=" + STATUS;
                headers.set("X-HTTP-Method-Override", "PATCH");
                restTemplate.exchange(patchUrl, HttpMethod.POST, entity, String.class);
            } catch (Exception e) {
                log.error("Failed to update notification status in Firestore: {}", e.getMessage());
            }
        }

        return convertToDto(saved);
    }

    @Override
    public void markAllAsRead(String email) {
        List<Notification> unread = notificationRepository.findByUserIdAndStatusOrderByCreatedAtDesc(email, STATUS_UNREAD);
        for (Notification n : unread) {
            updateNotificationStatus(n.getNotificationId(), "READ");
        }
    }

    @Override
    public void deleteNotification(String notificationId) {
        Notification notification = notificationRepository.findByNotificationId(notificationId)
                .orElseThrow(() -> new NoSuchElementException("Notification not found with firestore id: " + notificationId));

        notificationRepository.delete(notification);

        if (!isTestProfile() && notification.getNotificationId() != null) {
            try {
                RestTemplate restTemplate = SecurityUtils.getAuthenticatedRestTemplate();
                restTemplate.delete(FIRESTORE_BASE_URL + "/" + notification.getNotificationId());
            } catch (Exception e) {
                log.error("Failed to delete notification from Firestore: {}", e.getMessage());
            }
        }
    }

    @Override
    public synchronized void syncNotificationsWithFirestore() {
        if (isTestProfile()) return;
        try {
            RestTemplate restTemplate = SecurityUtils.getAuthenticatedRestTemplate();
            ResponseEntity<String> response = restTemplate.getForEntity(FIRESTORE_BASE_URL, String.class);
            if (response.getBody() == null) return;

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode docsNode = root.get("documents");
            if (docsNode == null || !docsNode.isArray()) return;

            Set<String> fetchedFirestoreIds = new HashSet<>();
            for (JsonNode doc : docsNode) {
                syncSingleDocument(doc, fetchedFirestoreIds);
            }

            cleanDeletedLocalNotifications(fetchedFirestoreIds);
        } catch (Exception e) {
            log.error("Firestore Notifications Sync failed: {}", e.getMessage());
        }
    }

    private void syncSingleDocument(JsonNode doc, Set<String> fetchedFirestoreIds) {
        try {
            String name = doc.get("name").asText();
            String firestoreId = name.substring(name.lastIndexOf('/') + 1);
            fetchedFirestoreIds.add(firestoreId);

            JsonNode fieldsNode = doc.get(FIELDS);
            if (fieldsNode == null) return;

            Notification notification = notificationRepository.findByNotificationId(firestoreId).orElseGet(Notification::new);
            notification.setNotificationId(firestoreId);
            notification.setUserId(fieldsNode.has(USER_ID) ? fieldsNode.get(USER_ID).get(VAL_STRING).asText() : "");
            notification.setTitle(fieldsNode.has(TITLE) ? fieldsNode.get(TITLE).get(VAL_STRING).asText() : "");
            notification.setMessage(fieldsNode.has(MESSAGE) ? fieldsNode.get(MESSAGE).get(VAL_STRING).asText() : "");
            notification.setType(fieldsNode.has("type") ? fieldsNode.get("type").get(VAL_STRING).asText() : "SYSTEM");
            notification.setPriority(fieldsNode.has(PRIORITY) ? fieldsNode.get(PRIORITY).get(VAL_STRING).asText() : "LOW");
            notification.setStatus(fieldsNode.has(STATUS) ? fieldsNode.get(STATUS).get(VAL_STRING).asText() : STATUS_UNREAD);
            notification.setActionUrl(fieldsNode.has("actionUrl") ? fieldsNode.get("actionUrl").get(VAL_STRING).asText() : "");
            notification.setRelatedRecordId(fieldsNode.has(RELATED_RECORD_ID) ? fieldsNode.get(RELATED_RECORD_ID).get(VAL_STRING).asText() : "");

            notification.setCreatedAt(parseCreatedAt(fieldsNode, notification.getCreatedAt()));
            notification.setUpdatedAt(parseUpdatedAt(fieldsNode));

            notificationRepository.save(notification);
        } catch (Exception e) {
            log.error("Failed to sync single document: {}", e.getMessage());
        }
    }

    private LocalDateTime parseCreatedAt(JsonNode fieldsNode, LocalDateTime existingCreatedAt) {
        if (fieldsNode.has(CREATED_AT)) {
            try {
                return LocalDateTime.parse(fieldsNode.get(CREATED_AT).get(VAL_STRING).asText());
            } catch (Exception ex) {
                return LocalDateTime.now();
            }
        }
        return existingCreatedAt != null ? existingCreatedAt : LocalDateTime.now();
    }

    private LocalDateTime parseUpdatedAt(JsonNode fieldsNode) {
        if (fieldsNode.has(UPDATED_AT)) {
            try {
                return LocalDateTime.parse(fieldsNode.get(UPDATED_AT).get(VAL_STRING).asText());
            } catch (Exception ex) {
                return LocalDateTime.now();
            }
        }
        return LocalDateTime.now();
    }

    private void cleanDeletedLocalNotifications(Set<String> fetchedFirestoreIds) {
        List<Notification> locals = notificationRepository.findAll();
        for (Notification local : locals) {
            if (local.getNotificationId() != null && !fetchedFirestoreIds.contains(local.getNotificationId())) {
                notificationRepository.delete(local);
            }
        }
    }

    private NotificationDto convertToDto(Notification n) {
        return NotificationDto.builder()
                .id(n.getId())
                .notificationId(n.getNotificationId())
                .userId(n.getUserId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .priority(n.getPriority())
                .status(n.getStatus())
                .actionUrl(n.getActionUrl())
                .relatedRecordId(n.getRelatedRecordId())
                .createdAt(n.getCreatedAt())
                .updatedAt(n.getUpdatedAt())
                .build();
    }

    private Notification convertToEntity(NotificationDto d) {
        return Notification.builder()
                .id(d.getId())
                .notificationId(d.getNotificationId())
                .userId(d.getUserId())
                .title(d.getTitle())
                .message(d.getMessage())
                .type(d.getType())
                .priority(d.getPriority())
                .status(d.getStatus())
                .actionUrl(d.getActionUrl())
                .relatedRecordId(d.getRelatedRecordId())
                .createdAt(d.getCreatedAt())
                .updatedAt(d.getUpdatedAt())
                .build();
    }
}
