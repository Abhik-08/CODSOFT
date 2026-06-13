package com.eduvault.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    private Long id;
    private String notificationId;
    private String userId;
    private String title;
    private String message;
    private String type;
    private String priority;
    private String status;
    private String actionUrl;
    private String relatedRecordId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
