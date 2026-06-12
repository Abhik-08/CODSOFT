package com.eduvault.api.controller;

import com.eduvault.api.dto.StudentDto;
import com.eduvault.api.service.StudentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/students")
@Tag(name = "Student Management", description = "APIs for managing student records")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    @Operation(summary = "Get all students", description = "Retrieve a list of all registered students")
    public ResponseEntity<List<StudentDto>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY') or @securityUtils.hasAccessToStudent(#id)")
    @Operation(summary = "Get student by ID", description = "Retrieve detailed information of a student by their database ID")
    public ResponseEntity<StudentDto> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    @Operation(summary = "Create a new student", description = "Create a student profile with details")
    public ResponseEntity<StudentDto> createStudent(@Valid @RequestBody StudentDto studentDto) {
        return new ResponseEntity<>(studentService.createStudent(studentDto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY') or @securityUtils.hasAccessToStudent(#id)")
    @Operation(summary = "Update an existing student", description = "Modify and save fields on a student profile")
    public ResponseEntity<StudentDto> updateStudent(@PathVariable Long id, @Valid @RequestBody StudentDto studentDto) {
        return ResponseEntity.ok(studentService.updateStudent(id, studentDto));
    }

    @PutMapping("/firestore/{firestoreId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update student by Firestore ID", description = "Modify and save fields on a student profile using their Firestore ID")
    public ResponseEntity<StudentDto> updateStudentByFirestoreId(@PathVariable String firestoreId, @Valid @RequestBody StudentDto studentDto) {
        return ResponseEntity.ok(studentService.updateStudentByFirestoreId(firestoreId, studentDto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    @Operation(summary = "Delete student", description = "Remove a student record from the system")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    @Operation(summary = "Search students", description = "Query students by first name or last name")
    public ResponseEntity<List<StudentDto>> searchStudents(@RequestParam String query) {
        return ResponseEntity.ok(studentService.searchStudents(query));
    }
}
