package com.eduvault.api.controller;

import com.eduvault.api.dto.NotificationDto;
import com.eduvault.api.service.NotificationService;
import com.eduvault.api.config.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/notifications")
@PreAuthorize("isAuthenticated()")
@Tag(name = "Notification Center", description = "APIs for viewing, reading, and managing user alerts and notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    @Operation(summary = "Get user notifications", description = "Retrieve notifications for the authenticated user (Admins and Faculty see all)")
    public ResponseEntity<List<NotificationDto>> getNotifications() {
        if (SecurityUtils.hasRole("ROLE_ADMIN")) {
            return ResponseEntity.ok(notificationService.getAllNotifications());
        }

        String email = SecurityUtils.getCurrentUsername();
        if (email != null) {
            return ResponseEntity.ok(notificationService.getNotificationsForUser(email));
        }
        return ResponseEntity.ok(Collections.emptyList());
    }

    @GetMapping("/unread")
    @Operation(summary = "Get unread notifications", description = "Retrieve only unread alerts for the authenticated user")
    public ResponseEntity<List<NotificationDto>> getUnreadNotifications() {
        String email = SecurityUtils.getCurrentUsername();
        if (email != null) {
            return ResponseEntity.ok(notificationService.getUnreadNotificationsForUser(email));
        }
        return ResponseEntity.ok(Collections.emptyList());
    }

    @PutMapping("/{notificationId}/status")
    @Operation(summary = "Update notification status", description = "Mark an alert as READ, ARCHIVED, or DISMISSED")
    public ResponseEntity<NotificationDto> updateStatus(
            @PathVariable String notificationId,
            @RequestParam String status) {
        return ResponseEntity.ok(notificationService.updateNotificationStatus(notificationId, status));
    }

    @PostMapping("/mark-all-read")
    @Operation(summary = "Mark all as read", description = "Mark all unread notifications for the current user as READ")
    public ResponseEntity<Void> markAllRead() {
        String email = SecurityUtils.getCurrentUsername();
        if (email != null) {
            notificationService.markAllAsRead(email);
        }
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{notificationId}")
    @Operation(summary = "Delete notification", description = "Remove a notification document from H2 and Firestore")
    public ResponseEntity<Void> deleteNotification(@PathVariable String notificationId) {
        notificationService.deleteNotification(notificationId);
        return ResponseEntity.noContent().build();
    }
}
