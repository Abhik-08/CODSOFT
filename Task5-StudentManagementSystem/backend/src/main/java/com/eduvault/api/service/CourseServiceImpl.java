package com.eduvault.api.service;

import com.eduvault.api.dto.CourseDto;
import com.eduvault.api.exception.ResourceNotFoundException;
import com.eduvault.api.model.Course;
import com.eduvault.api.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@SuppressWarnings("null")
public class CourseServiceImpl implements CourseService {

    private static final String NOT_FOUND_MSG = "Course not found with id: ";

    private final CourseRepository courseRepository;

    @Autowired
    public CourseServiceImpl(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    @Override
    public List<CourseDto> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(this::convertToDto)
                .toList();
    }

    @Override
    public CourseDto getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(NOT_FOUND_MSG + id));
        return convertToDto(course);
    }

    @Override
    public CourseDto createCourse(CourseDto courseDto) {
        Course course = convertToEntity(courseDto);
        Course savedCourse = courseRepository.save(course);
        return convertToDto(savedCourse);
    }

    @Override
    public CourseDto updateCourse(Long id, CourseDto courseDto) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(NOT_FOUND_MSG + id));
        
        course.setCourseCode(courseDto.getCourseCode());
        course.setName(courseDto.getName());
        course.setCredits(courseDto.getCredits());
        course.setDescription(courseDto.getDescription());

        Course updatedCourse = courseRepository.save(course);
        return convertToDto(updatedCourse);
    }

    @Override
    public void deleteCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(NOT_FOUND_MSG + id));
        courseRepository.delete(course);
    }

    private CourseDto convertToDto(Course course) {
        CourseDto dto = new CourseDto();
        dto.setId(course.getId());
        dto.setCourseCode(course.getCourseCode());
        dto.setName(course.getName());
        dto.setCredits(course.getCredits());
        dto.setDescription(course.getDescription());
        return dto;
    }

    private Course convertToEntity(CourseDto dto) {
        return Course.builder()
                .id(dto.getId())
                .courseCode(dto.getCourseCode())
                .name(dto.getName())
                .credits(dto.getCredits())
                .description(dto.getDescription())
                .build();
    }
}
