package com.eduvault.api.service;

import com.eduvault.api.dto.GradeDto;
import com.eduvault.api.exception.ResourceNotFoundException;
import com.eduvault.api.model.Course;
import com.eduvault.api.model.Grade;
import com.eduvault.api.model.Student;
import com.eduvault.api.repository.CourseRepository;
import com.eduvault.api.repository.GradeRepository;
import com.eduvault.api.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@SuppressWarnings("null")
public class GradeServiceImpl implements GradeService {

    private static final String NOT_FOUND_MSG = "Grade not found with id: ";
    private static final String STUDENT_NOT_FOUND = "Student not found with id: ";
    private static final String COURSE_NOT_FOUND = "Course not found with id: ";

    private final GradeRepository gradeRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;

    @Autowired
    public GradeServiceImpl(GradeRepository gradeRepository,
                            StudentRepository studentRepository,
                            CourseRepository courseRepository) {
        this.gradeRepository = gradeRepository;
        this.studentRepository = studentRepository;
        this.courseRepository = courseRepository;
    }

    @Override
    public List<GradeDto> getAllGrades() {
        return gradeRepository.findAll().stream()
                .map(this::convertToDto)
                .toList();
    }

    @Override
    public GradeDto getGradeById(Long id) {
        Grade grade = gradeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(NOT_FOUND_MSG + id));
        return convertToDto(grade);
    }

    @Override
    public GradeDto createGrade(GradeDto gradeDto) {
        Student student = studentRepository.findById(gradeDto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException(STUDENT_NOT_FOUND + gradeDto.getStudentId()));
        Course course = courseRepository.findById(gradeDto.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException(COURSE_NOT_FOUND + gradeDto.getCourseId()));

        Grade grade = Grade.builder()
                .student(student)
                .course(course)
                .score(gradeDto.getScore())
                .gradeLetter(gradeDto.getGradeLetter())
                .semester(gradeDto.getSemester())
                .dateRecorded(LocalDateTime.now())
                .build();

        Grade savedGrade = gradeRepository.save(grade);
        
        // Update student GPA
        updateStudentGpa(student);
        
        return convertToDto(savedGrade);
    }

    @Override
    public GradeDto updateGrade(Long id, GradeDto gradeDto) {
        Grade grade = gradeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(NOT_FOUND_MSG + id));
        Course course = courseRepository.findById(gradeDto.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException(COURSE_NOT_FOUND + gradeDto.getCourseId()));

        grade.setCourse(course);
        grade.setScore(gradeDto.getScore());
        grade.setGradeLetter(gradeDto.getGradeLetter());
        grade.setSemester(gradeDto.getSemester());

        Grade updatedGrade = gradeRepository.save(grade);
        
        // Update student GPA
        updateStudentGpa(grade.getStudent());
        
        return convertToDto(updatedGrade);
    }

    @Override
    public void deleteGrade(Long id) {
        Grade grade = gradeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(NOT_FOUND_MSG + id));
        Student student = grade.getStudent();
        gradeRepository.delete(grade);
        
        // Update student GPA after delete
        updateStudentGpa(student);
    }

    @Override
    public List<GradeDto> getGradesByStudentId(Long studentId) {
        return gradeRepository.findByStudentId(studentId).stream()
                .map(this::convertToDto)
                .toList();
    }

    private void updateStudentGpa(Student student) {
        List<Grade> grades = gradeRepository.findByStudentId(student.getId());
        if (grades.isEmpty()) {
            student.setGpa(0.0);
        } else {
            double sum = 0.0;
            for (Grade g : grades) {
                sum += g.getScore();
            }
            double avgScore = sum / grades.size();
            double finalGpa = Math.round((avgScore / 10.0) * 100.0) / 100.0;
            student.setGpa(finalGpa);
        }
        studentRepository.save(student);
    }

    private GradeDto convertToDto(Grade grade) {
        GradeDto dto = new GradeDto();
        dto.setId(grade.getId());
        dto.setStudentId(grade.getStudent().getId());
        dto.setCourseId(grade.getCourse().getId());
        dto.setCourseCode(grade.getCourse().getCourseCode());
        dto.setCourseName(grade.getCourse().getName());
        dto.setScore(grade.getScore());
        dto.setGradeLetter(grade.getGradeLetter());
        dto.setSemester(grade.getSemester());
        dto.setDateRecorded(grade.getDateRecorded());
        return dto;
    }
}
