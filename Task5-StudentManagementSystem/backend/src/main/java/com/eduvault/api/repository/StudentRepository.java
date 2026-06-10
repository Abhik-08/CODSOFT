package com.eduvault.api.repository;

import com.eduvault.api.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByEnrollmentNumber(String enrollmentNumber);
    Optional<Student> findByEmail(String email);
    List<Student> findByDepartment(String department);
    List<Student> findByLastNameContainingIgnoreCaseOrFirstNameContainingIgnoreCase(String last, String first);
    Optional<Student> findByFirestoreId(String firestoreId);
}
