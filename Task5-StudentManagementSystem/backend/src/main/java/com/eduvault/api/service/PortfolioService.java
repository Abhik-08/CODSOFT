package com.eduvault.api.service;

import com.eduvault.api.dto.PortfolioDto;
import java.util.List;

public interface PortfolioService {
    List<PortfolioDto> getAllPortfolios();
    List<PortfolioDto> getPortfoliosByStudentId(Long studentId);
    PortfolioDto getPortfolioById(Long id);
    PortfolioDto createPortfolio(PortfolioDto portfolioDto);
    PortfolioDto updatePortfolio(Long id, PortfolioDto portfolioDto);
    void deletePortfolio(Long id);
    PortfolioDto duplicatePortfolio(Long id);
}
