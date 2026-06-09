package com.eduvault.api.repository;

import com.eduvault.api.model.RiskReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RiskReportRepository extends JpaRepository<RiskReport, Long> {
    Optional<RiskReport> findByStudentId(Long studentId);
}
