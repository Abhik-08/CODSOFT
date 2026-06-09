package com.eduvault.api.service;

import com.eduvault.api.dto.GradeDto;
import java.util.List;

public interface GradeService {
    List<GradeDto> getAllGrades();
    GradeDto getGradeById(Long id);
    GradeDto createGrade(GradeDto gradeDto);
    GradeDto updateGrade(Long id, GradeDto gradeDto);
    void deleteGrade(Long id);
    List<GradeDto> getGradesByStudentId(Long studentId);
}
