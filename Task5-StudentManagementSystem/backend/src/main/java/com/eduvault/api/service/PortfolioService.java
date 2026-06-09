package com.eduvault.api.service;

import com.eduvault.api.dto.PortfolioDto;
import java.util.List;

public interface PortfolioService {
    List<PortfolioDto> getAllPortfolios();
    PortfolioDto getPortfolioById(Long id);
    PortfolioDto generatePortfolio(Long studentId, PortfolioDto portfolioDto);
    PortfolioDto updatePortfolio(Long id, PortfolioDto portfolioDto);
    void deletePortfolio(Long id);
}
