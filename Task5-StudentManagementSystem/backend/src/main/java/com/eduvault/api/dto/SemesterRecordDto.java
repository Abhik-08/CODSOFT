package com.eduvault.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SemesterRecordDto {
    private String id;

    @NotNull(message = "Semester number is required")
    private Integer semesterNumber;

    @NotNull(message = "SGPA is required")
    private Double sgpa;

    @NotNull(message = "CGPA is required")
    private Double cgpa;

    @NotNull(message = "Attendance is required")
    private Double attendance;

    @NotBlank(message = "Academic year is required")
    private String academicYear;

    private String remarks;
    private String createdAt;
}
