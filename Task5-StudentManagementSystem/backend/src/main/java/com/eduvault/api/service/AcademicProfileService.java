package com.eduvault.api.service;

import java.util.List;
import java.util.Map;

/**
 * Service interface for academic profile CRUD operations on Firestore subcollections.
 */
public interface AcademicProfileService {
    // Semester records
    List<Map<String, Object>> getSemesters(String studentId);
    Map<String, Object> addSemester(String studentId, Map<String, Object> data);
    Map<String, Object> updateSemester(String studentId, String docId, Map<String, Object> data);
    void deleteSemester(String studentId, String docId);

    // Subject records
    List<Map<String, Object>> getSubjects(String studentId);
    Map<String, Object> addSubject(String studentId, Map<String, Object> data);
    Map<String, Object> updateSubject(String studentId, String docId, Map<String, Object> data);
    void deleteSubject(String studentId, String docId);

    // Certificates
    List<Map<String, Object>> getCertificates(String studentId);
    Map<String, Object> addCertificate(String studentId, Map<String, Object> data);
    Map<String, Object> updateCertificate(String studentId, String docId, Map<String, Object> data);
    void deleteCertificate(String studentId, String docId);

    // Projects
    List<Map<String, Object>> getProjects(String studentId);
    Map<String, Object> addProject(String studentId, Map<String, Object> data);
    Map<String, Object> updateProject(String studentId, String docId, Map<String, Object> data);
    void deleteProject(String studentId, String docId);

    // Achievements
    List<Map<String, Object>> getAchievements(String studentId);
    Map<String, Object> addAchievement(String studentId, Map<String, Object> data);
    Map<String, Object> updateAchievement(String studentId, String docId, Map<String, Object> data);
    void deleteAchievement(String studentId, String docId);

    // Skills
    List<Map<String, Object>> getSkills(String studentId);
    Map<String, Object> addSkill(String studentId, Map<String, Object> data);
    Map<String, Object> updateSkill(String studentId, String docId, Map<String, Object> data);
    void deleteSkill(String studentId, String docId);

    // Placement
    void updatePlacementStatus(String studentId, String status, Integer offerCount);
}
