package com.eduvault.api.repository;

import com.eduvault.api.model.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {
    List<Portfolio> findByStudentId(Long studentId);
    Optional<Portfolio> findByFirestoreId(String firestoreId);
}
