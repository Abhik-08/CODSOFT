package com.abhik.gradecalculator.model;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GradeRequest {

    @NotBlank(message = "Student name is required")
    private String studentName;

    @NotEmpty(message = "Subjects list cannot be empty")
    @Valid // Validates constraints of nested Subject objects
    private List<Subject> subjects;
}
