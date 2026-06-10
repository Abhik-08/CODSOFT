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

    private String firestoreId;

    private String portfolioName;

    private String theme;

    @Column(length = 65536)
    private String summary;

    @Column(length = 65536)
    private String skillsJson;

    @Column(length = 65536)
    private String projectsJson;

    @Column(length = 65536)
    private String achievementsJson;

    @Column(length = 65536)
    private String certificatesJson;

    @Column(length = 65536)
    private String about;

    private String email;

    private String phone;

    @Column(length = 65536)
    private String socialLinksJson;

    private String githubUrl;

    private String linkedinUrl;

    private String portfolioStatus; // e.g. DRAFT, PUBLISHED

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
