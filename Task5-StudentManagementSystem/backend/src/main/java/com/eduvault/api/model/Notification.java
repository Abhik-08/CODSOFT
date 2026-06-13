package com.eduvault.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String notificationId; // Firestore Document ID

    @Column(nullable = false)
    private String userId; // User Email (unique link)

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 1024)
    private String message;

    @Column(nullable = false)
    private String type; // ACADEMIC, PLACEMENT, RISK, PORTFOLIO, ROADMAP, ACHIEVEMENT, CERTIFICATE, PROJECT, ATTENDANCE, SYSTEM

    @Column(nullable = false)
    private String priority; // LOW, MEDIUM, HIGH, CRITICAL

    @Column(nullable = false)
    private String status; // UNREAD, READ, ARCHIVED, DISMISSED

    private String actionUrl;

    private String relatedRecordId;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
