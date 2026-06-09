package com.eduvault.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "risk_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnore
    private Student student;

    @NotBlank(message = "Risk level is required")
    @Column(nullable = false)
    private String riskLevel; // HIGH_RISK, MEDIUM_RISK, LOW_RISK

    private String reason;

    private LocalDateTime calculatedAt;
}
