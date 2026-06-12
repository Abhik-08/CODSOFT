package com.eduvault.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AchievementDto {
    private String id;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    private String date;
    private String createdAt;
}
