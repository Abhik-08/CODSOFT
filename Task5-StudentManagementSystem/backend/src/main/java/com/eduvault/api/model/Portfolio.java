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
@Table(name = "portfolios")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Portfolio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnore
    private Student student;

    @NotBlank(message = "Portfolio title is required")
    @Column(nullable = false)
    private String title;

    @NotBlank(message = "Template type is required")
    @Column(nullable = false)
    private String templateType; // e.g. MODERN, CREATIVE, MINIMAL

    private String portfolioUrl;

    private boolean published;

    private LocalDateTime createdAt;
}
