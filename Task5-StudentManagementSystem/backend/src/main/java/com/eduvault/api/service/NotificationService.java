package com.eduvault.api.service;

import com.eduvault.api.dto.NotificationDto;
import java.util.List;

public interface NotificationService {
    List<NotificationDto> getNotificationsForUser(String email);
    List<NotificationDto> getUnreadNotificationsForUser(String email);
    List<NotificationDto> getAllNotifications(); // Admin/Faculty view
    NotificationDto createNotification(NotificationDto dto);
    NotificationDto updateNotificationStatus(String notificationId, String status);
    void markAllAsRead(String email);
    void deleteNotification(String notificationId);
    void syncNotificationsWithFirestore();
}
