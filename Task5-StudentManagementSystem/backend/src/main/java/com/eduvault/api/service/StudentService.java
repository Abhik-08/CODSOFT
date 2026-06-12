package com.eduvault.api.service;

import com.eduvault.api.dto.StudentDto;
import java.util.List;

public interface StudentService {
    List<StudentDto> getAllStudents();
    StudentDto getStudentById(Long id);
    StudentDto createStudent(StudentDto studentDto);
    StudentDto updateStudent(Long id, StudentDto studentDto);
    StudentDto updateStudentByFirestoreId(String firestoreId, StudentDto studentDto);
    void deleteStudent(Long id);
    List<StudentDto> searchStudents(String query);
}
