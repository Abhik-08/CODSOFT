package com.eduvault.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "advisories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Advisory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firestoreId;

    @Column(nullable = false)
    private Long studentId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 65536)
    private String message;

    @Column(nullable = false)
    private String type; // ACADEMIC, PLACEMENT, ATTENDANCE, PORTFOLIO, SKILL_DEVELOPMENT, CERTIFICATE_RECOMMENDATIONS

    @Column(nullable = false)
    private String priority; // LOW, MEDIUM, HIGH, CRITICAL

    @Column(nullable = false)
    private String status; // PENDING, VIEWED, COMPLETED, DISMISSED

    private LocalDateTime createdAt;
}
