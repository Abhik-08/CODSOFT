package com.abhik.gradecalculator.controller;

import com.abhik.gradecalculator.model.GradeRequest;
import com.abhik.gradecalculator.model.GradeResponse;
import com.abhik.gradecalculator.service.GradeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/grade")
@RequiredArgsConstructor
public class GradeController {

    private final GradeService gradeService;

    @PostMapping("/calculate")
    public ResponseEntity<GradeResponse> calculateGrade(@Valid @RequestBody GradeRequest request) {
        GradeResponse response = gradeService.calculateGrades(request);
        return ResponseEntity.ok(response);
    }
}
