package com.eduvault.api.repository;

import com.eduvault.api.model.StudentRoadmap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRoadmapRepository extends JpaRepository<StudentRoadmap, Long> {
    List<StudentRoadmap> findByStudentId(Long studentId);
    Optional<StudentRoadmap> findByRoadmapId(String roadmapId);
    Optional<StudentRoadmap> findByStudentIdAndRoadmapType(Long studentId, String roadmapType);
}
