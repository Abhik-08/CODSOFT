package com.eduvault.api.controller;

import com.eduvault.api.dto.CourseDto;
import com.eduvault.api.dto.GradeDto;
import com.eduvault.api.dto.AuthDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("API Endpoints Integration Tests")
@SuppressWarnings("null")
public class ApiEndpointsIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String adminToken;
    private String facultyToken;

    @BeforeEach
    public void setUp() throws Exception {
        // Register and login as admin
        adminToken = registerAndLoginUser("admin_test_2", "admin2@test.com", "ADMIN", "password123");
        // Register and login as faculty
        facultyToken = registerAndLoginUser("faculty_test_2", "faculty2@test.com", "FACULTY", "password123");
    }

    private String registerAndLoginUser(String username, String email, String role, String password) throws Exception {
        // Register user
        AuthDto.RegisterRequest registerRequest = new AuthDto.RegisterRequest();
        registerRequest.setUsername(username);
        registerRequest.setEmail(email);
        registerRequest.setPassword(password);
        registerRequest.setRole("ROLE_" + role);

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk());

        // Login user
        AuthDto.LoginRequest loginRequest = new AuthDto.LoginRequest();
        loginRequest.setUsername(username);
        loginRequest.setPassword(password);

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        return objectMapper.readTree(result.getResponse().getContentAsString()).get("token").asText();
    }

    // ==================== Course Endpoint Tests ====================

    @Test
    @DisplayName("Course: Authenticated users should view all courses")
    public void testGetAllCourses() throws Exception {
        mockMvc.perform(get("/api/courses")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", isA(java.util.ArrayList.class)));
    }

    @Test
    @DisplayName("Course: Should not access courses without authentication (401)")
    public void testGetAllCoursesUnauthorized() throws Exception {
        mockMvc.perform(get("/api/courses"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Course: Admin should be able to create a course")
    public void testAdminCreateCourse() throws Exception {
        CourseDto courseDto = new CourseDto();
        courseDto.setName("Advanced Java Programming");
        courseDto.setCourseCode("CS105");
        courseDto.setCredits(4);
        courseDto.setDescription("Advanced Java concepts and patterns");

        mockMvc.perform(post("/api/courses")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(courseDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Advanced Java Programming"))
                .andExpect(jsonPath("$.courseCode").value("CS105"));
    }

    @Test
    @DisplayName("Course: Faculty should be able to create a course")
    public void testFacultyCreateCourse() throws Exception {
        CourseDto courseDto = new CourseDto();
        courseDto.setName("Web Services");
        courseDto.setCourseCode("CS106");
        courseDto.setCredits(3);
        courseDto.setDescription("Web services and REST APIs");

        mockMvc.perform(post("/api/courses")
                .header("Authorization", "Bearer " + facultyToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(courseDto)))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("Course: Should update existing course")
    public void testUpdateCourse() throws Exception {
        // First create a course
        CourseDto courseDto = new CourseDto();
        courseDto.setName("Original Course Name");
        courseDto.setCourseCode("CS107");
        courseDto.setCredits(3);
        courseDto.setDescription("Original description");

        MvcResult createResult = mockMvc.perform(post("/api/courses")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(courseDto)))
                .andExpect(status().isCreated())
                .andReturn();

        Long courseId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asLong();

        // Update the course
        courseDto.setName("Updated Course Name");
        mockMvc.perform(put("/api/courses/" + courseId)
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(courseDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Course Name"));
    }

    @Test
    @DisplayName("Course: Should delete existing course")
    public void testDeleteCourse() throws Exception {
        // Create a course first
        CourseDto courseDto = new CourseDto();
        courseDto.setName("Course to Delete");
        courseDto.setCourseCode("CS108");
        courseDto.setCredits(3);
        courseDto.setDescription("Will be deleted");

        MvcResult createResult = mockMvc.perform(post("/api/courses")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(courseDto)))
                .andExpect(status().isCreated())
                .andReturn();

        Long courseId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asLong();

        // Delete the course
        mockMvc.perform(delete("/api/courses/" + courseId)
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNoContent());

        // Verify deletion by trying to fetch it
        mockMvc.perform(get("/api/courses/" + courseId)
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNotFound());
    }

    // ==================== Grade Endpoint Tests ====================

    @Test
    @DisplayName("Grade: Admin should view all grades")
    public void testGetAllGrades() throws Exception {
        mockMvc.perform(get("/api/grades")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", isA(java.util.ArrayList.class)));
    }

    @Test
    @DisplayName("Grade: Should not access grades without authentication (401)")
    public void testGetAllGradesUnauthorized() throws Exception {
        mockMvc.perform(get("/api/grades"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Grade: Admin should be able to create a grade")
    public void testAdminCreateGrade() throws Exception {
        GradeDto gradeDto = new GradeDto();
        gradeDto.setStudentId(1L);
        gradeDto.setCourseId(1L);
        gradeDto.setScore(95.0);
        gradeDto.setGradeLetter("A+");
        gradeDto.setSemester("Fall 2024");

        mockMvc.perform(post("/api/grades")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(gradeDto)))
                .andExpect(status().isCreated());
    }

    // ==================== Analytics Endpoint Tests ====================

    @Test
    @DisplayName("Analytics: Admin should access dashboard stats")
    public void testGetDashboardStats() throws Exception {
        mockMvc.perform(get("/api/analytics/dashboard")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Analytics: Faculty should access analytics")
    public void testGetCgpaAnalytics() throws Exception {
        mockMvc.perform(get("/api/analytics/cgpa")
                .header("Authorization", "Bearer " + facultyToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Analytics: Should get department analytics")
    public void testGetDepartmentAnalytics() throws Exception {
        mockMvc.perform(get("/api/analytics/departments")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Analytics: Unauthorized access should be denied")
    public void testAnalyticsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/analytics/dashboard"))
                .andExpect(status().isUnauthorized());
    }

    // ==================== AI Recommendation Endpoint Tests ====================

    @Test
    @DisplayName("AI: Admin should be able to analyze student")
    public void testAdminAnalyzeStudent() throws Exception {
        mockMvc.perform(post("/api/ai/analyze-student/1")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("AI: Faculty should be able to get recommendations")
    public void testFacultyGetRecommendations() throws Exception {
        mockMvc.perform(get("/api/ai/recommendations/1")
                .header("Authorization", "Bearer " + facultyToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("AI: Unauthorized access should be denied (401)")
    public void testAiEndpointUnauthorized() throws Exception {
        mockMvc.perform(post("/api/ai/analyze-student/1"))
                .andExpect(status().isUnauthorized());
    }

    // ==================== Health Check Tests ====================

    @Test
    @DisplayName("Health: Application should be running")
    public void testApplicationHealth() throws Exception {
        mockMvc.perform(get("/api/swagger-ui.html"))
                .andExpect(status().isOk());
    }

    // ==================== Response Format Tests ====================

    @Test
    @DisplayName("Response: API should return proper JSON responses")
    public void testResponseFormat() throws Exception {
        mockMvc.perform(get("/api/courses")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    @DisplayName("Error: Should return 400 for invalid input")
    public void testInvalidInput() throws Exception {
        String invalidJson = "{\"invalid\": \"data\"}";

        mockMvc.perform(post("/api/courses")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidJson))
                .andExpect(status().isBadRequest());
    }
}
