package com.eduvault.api.service;

import com.eduvault.api.dto.ProjectDto;
import com.eduvault.api.exception.ResourceNotFoundException;
import com.eduvault.api.model.Project;
import com.eduvault.api.model.Student;
import com.eduvault.api.repository.ProjectRepository;
import com.eduvault.api.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@SuppressWarnings("null")
public class ProjectServiceImpl implements ProjectService {

    private static final String NOT_FOUND_MSG = "Project not found with id: ";
    private static final String STUDENT_NOT_FOUND = "Student not found with id: ";

    private final ProjectRepository projectRepository;
    private final StudentRepository studentRepository;

    @Autowired
    public ProjectServiceImpl(ProjectRepository projectRepository, StudentRepository studentRepository) {
        this.projectRepository = projectRepository;
        this.studentRepository = studentRepository;
    }

    @Override
    public List<ProjectDto> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(this::convertToDto)
                .toList();
    }

    @Override
    public ProjectDto getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(NOT_FOUND_MSG + id));
        return convertToDto(project);
    }

    @Override
    public ProjectDto createProject(ProjectDto projectDto) {
        Student student = studentRepository.findById(projectDto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException(STUDENT_NOT_FOUND + projectDto.getStudentId()));

        Project project = Project.builder()
                .student(student)
                .title(projectDto.getTitle())
                .description(projectDto.getDescription())
                .techStack(projectDto.getTechStack())
                .projectUrl(projectDto.getProjectUrl())
                .build();

        Project savedProject = projectRepository.save(project);
        return convertToDto(savedProject);
    }

    @Override
    public ProjectDto updateProject(Long id, ProjectDto projectDto) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(NOT_FOUND_MSG + id));

        project.setTitle(projectDto.getTitle());
        project.setDescription(projectDto.getDescription());
        project.setTechStack(projectDto.getTechStack());
        project.setProjectUrl(projectDto.getProjectUrl());

        Project updatedProject = projectRepository.save(project);
        return convertToDto(updatedProject);
    }

    @Override
    public void deleteProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(NOT_FOUND_MSG + id));
        projectRepository.delete(project);
    }

    @Override
    public List<ProjectDto> getProjectsByStudentId(Long studentId) {
        return projectRepository.findByStudentId(studentId).stream()
                .map(this::convertToDto)
                .toList();
    }

    private ProjectDto convertToDto(Project project) {
        ProjectDto dto = new ProjectDto();
        dto.setId(project.getId());
        dto.setStudentId(project.getStudent().getId());
        dto.setTitle(project.getTitle());
        dto.setDescription(project.getDescription());
        dto.setTechStack(project.getTechStack());
        dto.setProjectUrl(project.getProjectUrl());
        return dto;
    }
}
