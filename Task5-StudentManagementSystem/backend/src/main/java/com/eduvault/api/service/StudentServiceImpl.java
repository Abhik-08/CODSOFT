package com.eduvault.api.service;

import com.eduvault.api.dto.StudentDto;
import com.eduvault.api.exception.ResourceNotFoundException;
import com.eduvault.api.model.Student;
import com.eduvault.api.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentServiceImpl implements StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Override
    public List<StudentDto> getAllStudents() {
        return studentRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    public StudentDto getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
        return convertToDto(student);
    }

    @Override
    public StudentDto createStudent(StudentDto studentDto) {
        Student student = convertToEntity(studentDto);
        Student savedStudent = studentRepository.save(student);
        return convertToDto(savedStudent);
    }

    @Override
    public StudentDto updateStudent(Long id, StudentDto studentDto) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
        
        student.setFirstName(studentDto.getFirstName());
        student.setLastName(studentDto.getLastName());
        student.setEmail(studentDto.getEmail());
        student.setEnrollmentNumber(studentDto.getEnrollmentNumber());
        student.setDateOfBirth(studentDto.getDateOfBirth());
        student.setDepartment(studentDto.getDepartment());
        student.setSemester(studentDto.getSemester());
        student.setStatus(studentDto.getStatus());
        student.setImageUrl(studentDto.getImageUrl());
        student.setGpa(studentDto.getGpa());

        Student updatedStudent = studentRepository.save(student);
        return convertToDto(updatedStudent);
    }

    @Override
    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
        studentRepository.delete(student);
    }

    private StudentDto convertToDto(Student student) {
        StudentDto dto = new StudentDto();
        dto.setId(student.getId());
        dto.setFirstName(student.getFirstName());
        dto.setLastName(student.getLastName());
        dto.setEmail(student.getEmail());
        dto.setEnrollmentNumber(student.getEnrollmentNumber());
        dto.setDateOfBirth(student.getDateOfBirth());
        dto.setDepartment(student.getDepartment());
        dto.setSemester(student.getSemester());
        dto.setStatus(student.getStatus());
        dto.setImageUrl(student.getImageUrl());
        dto.setGpa(student.getGpa());
        return dto;
    }

    private Student convertToEntity(StudentDto dto) {
        return Student.builder()
                .id(dto.getId())
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .email(dto.getEmail())
                .enrollmentNumber(dto.getEnrollmentNumber())
                .dateOfBirth(dto.getDateOfBirth())
                .department(dto.getDepartment())
                .semester(dto.getSemester())
                .status(dto.getStatus())
                .imageUrl(dto.getImageUrl())
                .gpa(dto.getGpa())
                .build();
    }
}
