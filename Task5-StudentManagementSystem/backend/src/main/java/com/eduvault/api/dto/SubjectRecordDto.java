package com.eduvault.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SubjectRecordDto {
    private String id;

    @NotBlank(message = "Subject name is required")
    private String subjectName;

    @NotBlank(message = "Subject code is required")
    private String subjectCode;

    @NotNull(message = "Credits are required")
    private Integer credits;

    @NotNull(message = "Marks are required")
    private Integer marks;

    @NotBlank(message = "Grade is required")
    private String grade;

    @NotNull(message = "Semester is required")
    private Integer semester;

    private String createdAt;
}
