package com.eduvault.api.repository;

import com.eduvault.api.model.Advisory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AdvisoryRepository extends JpaRepository<Advisory, Long> {
    List<Advisory> findByStudentId(Long studentId);
    Optional<Advisory> findByFirestoreId(String firestoreId);
}
