package com.eduvault.api.service;

import com.eduvault.api.dto.PortfolioDto;
import com.eduvault.api.exception.ResourceNotFoundException;
import com.eduvault.api.model.Portfolio;
import com.eduvault.api.model.Student;
import com.eduvault.api.repository.PortfolioRepository;
import com.eduvault.api.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@SuppressWarnings("null")
public class PortfolioServiceImpl implements PortfolioService {

    private static final String NOT_FOUND_MSG = "Portfolio not found with id: ";
    private static final String STUDENT_NOT_FOUND = "Student not found with id: ";

    private final PortfolioRepository portfolioRepository;
    private final StudentRepository studentRepository;

    @Autowired
    public PortfolioServiceImpl(PortfolioRepository portfolioRepository, StudentRepository studentRepository) {
        this.portfolioRepository = portfolioRepository;
        this.studentRepository = studentRepository;
    }

    @Override
    public List<PortfolioDto> getAllPortfolios() {
        return portfolioRepository.findAll().stream()
                .map(this::convertToDto)
                .toList();
    }

    @Override
    public PortfolioDto getPortfolioById(Long id) {
        Portfolio portfolio = portfolioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(NOT_FOUND_MSG + id));
        return convertToDto(portfolio);
    }

    @Override
    public PortfolioDto generatePortfolio(Long studentId, PortfolioDto portfolioDto) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException(STUDENT_NOT_FOUND + studentId));

        String title = (portfolioDto != null && portfolioDto.getTitle() != null && !portfolioDto.getTitle().isBlank())
                ? portfolioDto.getTitle() 
                : student.getFirstName() + " " + student.getLastName() + "'s Academic Portfolio";
                
        String templateType = (portfolioDto != null && portfolioDto.getTemplateType() != null && !portfolioDto.getTemplateType().isBlank())
                ? portfolioDto.getTemplateType() 
                : "MODERN";

        String portfolioUrl = "https://eduvault.ai/portfolios/" + student.getEnrollmentNumber().toLowerCase();

        Portfolio portfolio = Portfolio.builder()
                .student(student)
                .title(title)
                .templateType(templateType)
                .portfolioUrl(portfolioUrl)
                .published(portfolioDto != null && portfolioDto.isPublished())
                .createdAt(LocalDateTime.now())
                .build();

        Portfolio saved = portfolioRepository.save(portfolio);
        return convertToDto(saved);
    }

    @Override
    public PortfolioDto updatePortfolio(Long id, PortfolioDto portfolioDto) {
        Portfolio portfolio = portfolioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(NOT_FOUND_MSG + id));

        portfolio.setTitle(portfolioDto.getTitle());
        portfolio.setTemplateType(portfolioDto.getTemplateType());
        portfolio.setPortfolioUrl(portfolioDto.getPortfolioUrl());
        portfolio.setPublished(portfolioDto.isPublished());

        Portfolio updated = portfolioRepository.save(portfolio);
        return convertToDto(updated);
    }

    @Override
    public void deletePortfolio(Long id) {
        Portfolio portfolio = portfolioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(NOT_FOUND_MSG + id));
        portfolioRepository.delete(portfolio);
    }

    private PortfolioDto convertToDto(Portfolio portfolio) {
        PortfolioDto dto = new PortfolioDto();
        dto.setId(portfolio.getId());
        dto.setStudentId(portfolio.getStudent().getId());
        dto.setTitle(portfolio.getTitle());
        dto.setTemplateType(portfolio.getTemplateType());
        dto.setPortfolioUrl(portfolio.getPortfolioUrl());
        dto.setPublished(portfolio.isPublished());
        dto.setCreatedAt(portfolio.getCreatedAt());
        return dto;
    }
}
