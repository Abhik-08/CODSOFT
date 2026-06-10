package com.eduvault.api.controller;

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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("API Endpoints Integration Tests")
@SuppressWarnings("null")
class ApiEndpointsIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String adminToken;
    private String facultyToken;

    @BeforeEach
    void setUp() throws Exception {
        // Login as seeded admin and faculty
        adminToken = loginUser("admin", "EduVaultSecurePasswordTemp123!");
        facultyToken = loginUser("faculty", "EduVaultSecurePasswordTemp123!");
    }

    private String loginUser(String username, String password) throws Exception {
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

    // ==================== Analytics Endpoint Tests ====================

    @Test
    @DisplayName("Analytics: Admin should access dashboard stats")
    void testGetDashboardStats() throws Exception {
        mockMvc.perform(get("/api/analytics/dashboard")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Analytics: Faculty should access analytics")
    void testGetCgpaAnalytics() throws Exception {
        mockMvc.perform(get("/api/analytics/cgpa")
                .header("Authorization", "Bearer " + facultyToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Analytics: Should get department analytics")
    void testGetDepartmentAnalytics() throws Exception {
        mockMvc.perform(get("/api/analytics/departments")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Analytics: Unauthorized access should be denied")
    void testAnalyticsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/analytics/dashboard"))
                .andExpect(status().isUnauthorized());
    }

    // ==================== AI Recommendation Endpoint Tests ====================

    @Test
    @DisplayName("AI: Admin should be able to analyze student")
    void testAdminAnalyzeStudent() throws Exception {
        mockMvc.perform(post("/api/ai/analyze-student/1")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("AI: Faculty should be able to get recommendations")
    void testFacultyGetRecommendations() throws Exception {
        mockMvc.perform(get("/api/ai/recommendations/1")
                .header("Authorization", "Bearer " + facultyToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("AI: Unauthorized access should be denied (401)")
    void testAiEndpointUnauthorized() throws Exception {
        mockMvc.perform(post("/api/ai/analyze-student/1"))
                .andExpect(status().isUnauthorized());
    }

    // ==================== Health Check Tests ====================

    @Test
    @DisplayName("Health: Application should be running")
    void testApplicationHealth() throws Exception {
        mockMvc.perform(get("/api/v3/api-docs"))
                .andExpect(status().isOk());
    }

    // ==================== Response Format Tests ====================

    @Test
    @DisplayName("Response: API should return proper JSON responses")
    void testResponseFormat() throws Exception {
        mockMvc.perform(get("/api/students")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    @DisplayName("Error: Should return 400 for invalid input")
    void testInvalidInput() throws Exception {
        String invalidJson = "{\"invalid\": \"data\"}";

        mockMvc.perform(post("/api/students")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidJson))
                .andExpect(status().isBadRequest());
    }
}
