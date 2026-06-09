package com.eduvault.api.config;

import com.eduvault.api.model.*;
import com.eduvault.api.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
@Slf4j
public class DataInitializer {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final GradeRepository gradeRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, StudentRepository studentRepository,
                          CourseRepository courseRepository, GradeRepository gradeRepository,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.courseRepository = courseRepository;
        this.gradeRepository = gradeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void initializeData() {
        log.info("Initializing database with test data...");
        
        // Initialize users only if database is empty
        if (userRepository.count() == 0) {
            initializeUsers();
            log.info("✓ Test users initialized");
        }
        
        // Initialize students only if database is empty
        if (studentRepository.count() == 0) {
            initializeStudents();
            log.info("✓ Test students initialized");
        }
        
        // Initialize courses only if database is empty
        if (courseRepository.count() == 0) {
            initializeCourses();
            log.info("✓ Test courses initialized");
        }
        
        // Initialize grades only if database is empty
        if (gradeRepository.count() == 0) {
            initializeGrades();
            log.info("✓ Test grades initialized");
        }
        
        log.info("Database initialization complete!");
    }

    @SuppressWarnings("null")
    private void initializeUsers() {
        List<User> users = Arrays.asList(
            User.builder()
                .username("admin")
                .email("admin@eduvault.com")
                .password(passwordEncoder.encode("password123"))
                .fullName("Administrator")
                .role("ROLE_ADMIN")
                .build(),
            User.builder()
                .username("faculty")
                .email("faculty@eduvault.com")
                .password(passwordEncoder.encode("password123"))
                .fullName("Dr. Jane Smith")
                .role("ROLE_FACULTY")
                .build(),
            User.builder()
                .username("student")
                .email("student@eduvault.com")
                .password(passwordEncoder.encode("password123"))
                .fullName("John Student")
                .role("ROLE_USER")
                .build(),
            User.builder()
                .username("john_doe")
                .email("john.doe@student.edu")
                .password(passwordEncoder.encode("password123"))
                .fullName("John Doe")
                .role("ROLE_USER")
                .build(),
            User.builder()
                .username("jane_smith")
                .email("jane.smith@student.edu")
                .password(passwordEncoder.encode("password123"))
                .fullName("Jane Smith")
                .role("ROLE_USER")
                .build()
        );
        
        userRepository.saveAll(users);
    }

    @SuppressWarnings("null")
    private void initializeStudents() {
        List<Student> students = Arrays.asList(
            Student.builder()
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@student.edu")
                .enrollmentNumber("STU001")
                .dateOfBirth(LocalDate.of(2002, 5, 15))
                .department("Computer Science")
                .semester(4)
                .status("ACTIVE")
                .build(),
            Student.builder()
                .firstName("Jane")
                .lastName("Smith")
                .email("jane.smith@student.edu")
                .enrollmentNumber("STU002")
                .dateOfBirth(LocalDate.of(2003, 8, 22))
                .department("Information Technology")
                .semester(3)
                .status("ACTIVE")
                .build(),
            Student.builder()
                .firstName("Alice")
                .lastName("Johnson")
                .email("alice.johnson@student.edu")
                .enrollmentNumber("STU003")
                .dateOfBirth(LocalDate.of(2001, 3, 10))
                .department("Computer Science")
                .semester(5)
                .status("ACTIVE")
                .build(),
            Student.builder()
                .firstName("Bob")
                .lastName("Wilson")
                .email("bob.wilson@student.edu")
                .enrollmentNumber("STU004")
                .dateOfBirth(LocalDate.of(2002, 12, 5))
                .department("Data Science")
                .semester(2)
                .status("ACTIVE")
                .build(),
            Student.builder()
                .firstName("Charlie")
                .lastName("Brown")
                .email("charlie.brown@student.edu")
                .enrollmentNumber("STU005")
                .dateOfBirth(LocalDate.of(2003, 6, 18))
                .department("Information Technology")
                .semester(4)
                .status("ACTIVE")
                .build()
        );
        
        studentRepository.saveAll(students);
    }

    @SuppressWarnings("null")
    private void initializeCourses() {
        List<Course> courses = Arrays.asList(
            Course.builder()
                .name("Data Structures and Algorithms")
                .courseCode("CS101")
                .credits(4)
                .description("Fundamental data structures and algorithm design patterns")
                .build(),
            Course.builder()
                .name("Web Development Fundamentals")
                .courseCode("CS102")
                .credits(3)
                .description("Introduction to web development with HTML, CSS, and JavaScript")
                .build(),
            Course.builder()
                .name("Database Management Systems")
                .courseCode("CS103")
                .credits(4)
                .description("Relational databases and SQL programming")
                .build(),
            Course.builder()
                .name("Machine Learning Basics")
                .courseCode("DS101")
                .credits(4)
                .description("Introduction to machine learning algorithms and applications")
                .build(),
            Course.builder()
                .name("Cloud Computing Essentials")
                .courseCode("IT101")
                .credits(3)
                .description("Cloud infrastructure and services overview")
                .build(),
            Course.builder()
                .name("Software Engineering Principles")
                .courseCode("CS104")
                .credits(3)
                .description("Software development lifecycle and best practices")
                .build()
        );
        
        courseRepository.saveAll(courses);
    }

    @SuppressWarnings("null")
    private void initializeGrades() {
        List<Student> students = studentRepository.findAll();
        List<Course> courses = courseRepository.findAll();
        
        if (!students.isEmpty() && !courses.isEmpty()) {
            List<Grade> grades = Arrays.asList(
                Grade.builder()
                    .student(students.get(0))
                    .course(courses.get(0))
                    .score(85.5)
                    .gradeLetter("A")
                    .semester("Fall 2024")
                    .dateRecorded(LocalDateTime.now().minusMonths(2))
                    .build(),
                Grade.builder()
                    .student(students.get(0))
                    .course(courses.get(1))
                    .score(78.0)
                    .gradeLetter("B+")
                    .semester("Fall 2024")
                    .dateRecorded(LocalDateTime.now().minusMonths(2))
                    .build(),
                Grade.builder()
                    .student(students.get(1))
                    .course(courses.get(0))
                    .score(92.0)
                    .gradeLetter("A+")
                    .semester("Fall 2024")
                    .dateRecorded(LocalDateTime.now().minusMonths(2))
                    .build(),
                Grade.builder()
                    .student(students.get(1))
                    .course(courses.get(2))
                    .score(88.5)
                    .gradeLetter("A")
                    .semester("Fall 2024")
                    .dateRecorded(LocalDateTime.now().minusMonths(2))
                    .build(),
                Grade.builder()
                    .student(students.get(2))
                    .course(courses.get(3))
                    .score(75.0)
                    .gradeLetter("B")
                    .semester("Fall 2024")
                    .dateRecorded(LocalDateTime.now().minusMonths(2))
                    .build(),
                Grade.builder()
                    .student(students.get(3))
                    .course(courses.get(4))
                    .score(82.0)
                    .gradeLetter("A-")
                    .semester("Fall 2024")
                    .dateRecorded(LocalDateTime.now().minusMonths(2))
                    .build(),
                Grade.builder()
                    .student(students.get(4))
                    .course(courses.get(1))
                    .score(70.0)
                    .gradeLetter("B")
                    .semester("Fall 2024")
                    .dateRecorded(LocalDateTime.now().minusMonths(2))
                    .build()
            );
            
            gradeRepository.saveAll(grades);
        }
    }
}
