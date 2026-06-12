package com.eduvault.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SkillDto {
    private String id;

    @NotBlank(message = "Skill name is required")
    private String name;

    @NotBlank(message = "Category is required")
    private String category; // Technical, Soft Skills, Tools, Languages

    private Integer proficiency;
    private String createdAt;
}
