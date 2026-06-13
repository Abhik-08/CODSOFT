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
public class AdvisoryDto {
    private Long id;
    private String advisoryId; // maps to firestoreId
    private Long studentId;
    private String studentFirestoreId; // Maps to student's Firestore ID
    private String title;
    private String message;
    private String type; // ACADEMIC, PLACEMENT, ATTENDANCE, PORTFOLIO, SKILL_DEVELOPMENT, CERTIFICATE_RECOMMENDATIONS
    private String priority; // LOW, MEDIUM, HIGH, CRITICAL
    private String status; // PENDING, VIEWED, COMPLETED, DISMISSED
    private LocalDateTime createdAt;
}
