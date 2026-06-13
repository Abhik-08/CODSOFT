package com.eduvault.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "student_roadmaps")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentRoadmap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnore
    private Student student;

    private String roadmapId; // Firestore ID

    @Column(nullable = false)
    private String roadmapType;

    private Double currentScore;
    private Double targetScore;

    private String currentStatus;
    private String targetStatus;

    @Column(length = 65536)
    private String milestonesJson;

    @Column(length = 65536)
    private String actionItemsJson;

    @Column(length = 65536)
    private String recommendationsJson;

    private String estimatedDuration;
    private String priority;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
