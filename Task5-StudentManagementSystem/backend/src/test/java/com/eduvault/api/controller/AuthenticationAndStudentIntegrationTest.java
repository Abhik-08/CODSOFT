package com.eduvault.api.controller;

import com.eduvault.api.dto.AuthDto;
import com.eduvault.api.dto.StudentDto;
import com.eduvault.api.repository.UserRepository;
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

import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Backend Integration Tests")

@SuppressWarnings("null")
class AuthenticationAndStudentIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    private String adminToken;
    private String facultyToken;
    private String studentToken;

    @BeforeEach
    void setUp() throws Exception {
        // Clear any leftover newuser from previous runs
        userRepository.findByUsername("newuser").ifPresent(userRepository::delete);

        // Login as seeded admin
        adminToken = loginUser("admin", "EduVaultSecurePasswordTemp123!");
        // Login as seeded faculty
        facultyToken = loginUser("faculty", "EduVaultSecurePasswordTemp123!");
        // Login as seeded student
        studentToken = loginUser("student", "EduVaultSecurePasswordTemp123!");
    }

    private String loginUser(String username, String password) throws Exception {
        AuthDto.LoginRequest loginRequest = new AuthDto.LoginRequest();
        loginRequest.setUsername(username);
        loginRequest.setPassword(password);

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andReturn();

        return objectMapper.readTree(result.getResponse().getContentAsString()).get("token").asText();
    }

    // ==================== Authentication Tests ====================

    @Test
    @DisplayName("Register: Should successfully register a new user")
    void testRegisterNewUser() throws Exception {
        AuthDto.RegisterRequest request = new AuthDto.RegisterRequest();
        request.setUsername("newuser");
        request.setEmail("newuser@test.com");
        request.setPassword("EduVaultSecurePasswordTemp123!");
        request.setRole("ROLE_USER");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("newuser"))
                .andExpect(jsonPath("$.role").value("ROLE_USER"));
    }

    @Test
    @DisplayName("Login: Should successfully login and return JWT token")
    void testLoginUser() throws Exception {
        AuthDto.LoginRequest request = new AuthDto.LoginRequest();
        request.setUsername("admin");
        request.setPassword("EduVaultSecurePasswordTemp123!");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    @DisplayName("Login: Should reject invalid credentials")
    void testLoginWithInvalidCredentials() throws Exception {
        AuthDto.LoginRequest request = new AuthDto.LoginRequest();
        request.setUsername("admin");
        request.setPassword("wrongpassword");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    // ==================== Student Endpoint Tests ====================

    @Test
    @DisplayName("Student: Admin should be able to view all students")
    void testAdminGetAllStudents() throws Exception {
        mockMvc.perform(get("/api/students")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", isA(java.util.ArrayList.class)));
    }

    @Test
    @DisplayName("Student: Faculty should be able to view all students")
    void testFacultyGetAllStudents() throws Exception {
        mockMvc.perform(get("/api/students")
                .header("Authorization", "Bearer " + facultyToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Student: Regular user should not be able to view all students (403)")
    void testStudentCannotGetAllStudents() throws Exception {
        mockMvc.perform(get("/api/students")
                .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Student: Unauthenticated access should return 401")
    void testUnauthenticatedAccessStudents() throws Exception {
        mockMvc.perform(get("/api/students"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Student: Admin should be able to create a student")
    void testAdminCreateStudent() throws Exception {
        StudentDto studentDto = new StudentDto();
        studentDto.setFirstName("Test");
        studentDto.setLastName("Student");
        studentDto.setEmail("test.student@edu.com");
        studentDto.setEnrollmentNumber("TST001");
        studentDto.setDateOfBirth(LocalDate.of(2002, 5, 15));
        studentDto.setDepartment("Computer Science");
        studentDto.setSemester(3);
        studentDto.setStatus("ACTIVE");

        mockMvc.perform(post("/api/students")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(studentDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.firstName").value("Test"))
                .andExpect(jsonPath("$.lastName").value("Student"))
                .andExpect(jsonPath("$.id").exists());
    }

    @Test
    @DisplayName("Student: Faculty should be able to create a student")
    void testFacultyCreateStudent() throws Exception {
        StudentDto studentDto = new StudentDto();
        studentDto.setFirstName("Faculty");
        studentDto.setLastName("Created");
        studentDto.setEmail("faculty.created@edu.com");
        studentDto.setEnrollmentNumber("FAC001");
        studentDto.setDateOfBirth(LocalDate.of(2003, 8, 20));
        studentDto.setDepartment("IT");
        studentDto.setSemester(2);
        studentDto.setStatus("ACTIVE");

        mockMvc.perform(post("/api/students")
                .header("Authorization", "Bearer " + facultyToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(studentDto)))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("Student: Regular student should not be able to create students (403)")
    void testStudentCannotCreateStudent() throws Exception {
        StudentDto studentDto = new StudentDto();
        studentDto.setFirstName("Cannot");
        studentDto.setLastName("Create");
        studentDto.setEmail("cannot.create@edu.com");
        studentDto.setEnrollmentNumber("NC001");
        studentDto.setDateOfBirth(LocalDate.of(2002, 3, 10));
        studentDto.setDepartment("CS");
        studentDto.setSemester(1);
        studentDto.setStatus("ACTIVE");

        mockMvc.perform(post("/api/students")
                .header("Authorization", "Bearer " + studentToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(studentDto)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Student: Admin should be able to search students")
    void testAdminSearchStudents() throws Exception {
        mockMvc.perform(get("/api/students/search")
                .param("query", "John")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", isA(java.util.ArrayList.class)));
    }

    @Test
    @DisplayName("Student: Should return 404 for non-existent student")
    void testGetNonExistentStudent() throws Exception {
        mockMvc.perform(get("/api/students/99999")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNotFound());
    }

    // ==================== Swagger/OpenAPI Tests ====================

    @Test
    @DisplayName("Swagger: Should be accessible without authentication")
    void testSwaggerUIAccess() throws Exception {
        mockMvc.perform(get("/api/swagger-ui/index.html"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Swagger: API docs should be accessible without authentication")
    void testApiDocsAccess() throws Exception {
        mockMvc.perform(get("/api/v3/api-docs"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Swagger: Should contain security schemes for JWT")
    void testApiDocsContainsJwtScheme() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/v3/api-docs"))
                .andExpect(status().isOk())
                .andReturn();

        String content = result.getResponse().getContentAsString();
        assert content.contains("Bearer JWT") || content.contains("bearer");
    }

    // ==================== Authorization Tests ====================

    @Test
    @DisplayName("Authorization: Valid JWT should grant access to protected endpoint")
    void testValidJwtGrantsAccess() throws Exception {
        mockMvc.perform(get("/api/students")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Authorization: Invalid JWT should deny access (401)")
    void testInvalidJwtDeniesAccess() throws Exception {
        mockMvc.perform(get("/api/students")
                .header("Authorization", "Bearer invalid.jwt.token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Authorization: Missing JWT should deny access (401)")
    void testMissingJwtDeniesAccess() throws Exception {
        mockMvc.perform(get("/api/students"))
                .andExpect(status().isUnauthorized());
    }
}
