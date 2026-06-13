package com.eduvault.api.service;

import com.eduvault.api.dto.NotificationDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class NotificationGenerator {

    private final NotificationService notificationService;

    @Autowired
    public NotificationGenerator(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    public void createNotification(String userId, String title, String message, String type, String priority, String actionUrl) {
        createNotification(userId, title, message, type, priority, actionUrl, "");
    }

    public void createNotification(String userId, String title, String message, String type, String priority, String actionUrl, String relatedRecordId) {
        NotificationDto dto = NotificationDto.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type(type.toUpperCase())
                .priority(priority.toUpperCase())
                .status("UNREAD")
                .actionUrl(actionUrl)
                .relatedRecordId(relatedRecordId)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        
        notificationService.createNotification(dto);
    }
}
