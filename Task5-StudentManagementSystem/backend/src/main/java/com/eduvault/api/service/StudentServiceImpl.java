package com.eduvault.api.service;

import com.eduvault.api.dto.StudentDto;
import com.eduvault.api.exception.ResourceNotFoundException;
import com.eduvault.api.model.Student;
import com.eduvault.api.repository.StudentRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.*;

@Service
@SuppressWarnings({"null", "unchecked"})
public class StudentServiceImpl implements StudentService {

    private static final String NOT_FOUND_MSG = "Student not found with id: ";
    private static final String FIRESTORE_BASE_URL = "https://firestore.googleapis.com/v1/projects/eduvault-ai/databases/(default)/documents/students";
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(StudentServiceImpl.class);

    // Literal Constants
    private static final String VAL_STRING = "stringValue";
    private static final String VAL_DOUBLE = "doubleValue";
    private static final String VAL_INTEGER = "integerValue";
    private static final String VAL_BOOLEAN = "booleanValue";
    private static final String VAL_MAP = "mapValue";
    private static final String VAL_ARRAY = "arrayValue";
    private static final String FIELDS = "fields";
    private static final String VALUES = "values";

    private static final String FIELD_FIRST_NAME = "firstName";
    private static final String FIELD_LAST_NAME = "lastName";
    private static final String FIELD_EMAIL = "email";
    private static final String FIELD_ENROLLMENT = "enrollmentNumber";
    private static final String FIELD_DOB = "dateOfBirth";
    private static final String FIELD_DEPT = "department";
    private static final String FIELD_SEMESTER = "semester";
    private static final String FIELD_STATUS = "status";
    private static final String FIELD_IMAGE = "imageUrl";
    private static final String FIELD_GPA = "gpa";
    private static final String FIELD_GRADES = "grades";
    private static final String FIELD_ATTENDANCE = "attendance";
    private static final String FIELD_PLACEMENT_STATUS = "placementStatus";
    private static final String FIELD_OFFER_COUNT = "offerCount";

    private final StudentRepository studentRepository;
    private final Environment env;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final PlacementIntelligenceService placementIntelligenceService;
    private final RiskDetectionService riskDetectionService;

    @Autowired
    public StudentServiceImpl(
            StudentRepository studentRepository, 
            Environment env,
            @org.springframework.context.annotation.Lazy PlacementIntelligenceService placementIntelligenceService,
            @org.springframework.context.annotation.Lazy RiskDetectionService riskDetectionService) {
        this.studentRepository = studentRepository;
        this.env = env;
        this.placementIntelligenceService = placementIntelligenceService;
        this.riskDetectionService = riskDetectionService;
    }

    private boolean isTestProfile() {
        if (env == null) return false;
        for (String profile : env.getActiveProfiles()) {
            if ("test".equalsIgnoreCase(profile)) {
                return true;
            }
        }
        return false;
    }

    private Object parseFirestoreValue(JsonNode node) {
        if (node == null || node.isNull()) return null;
        if (node.has(VAL_STRING)) {
            return node.get(VAL_STRING).asText();
        } else if (node.has(VAL_DOUBLE)) {
            return node.get(VAL_DOUBLE).asDouble();
        } else if (node.has(VAL_INTEGER)) {
            return Long.parseLong(node.get(VAL_INTEGER).asText());
        } else if (node.has(VAL_BOOLEAN)) {
            return node.get(VAL_BOOLEAN).asBoolean();
        } else if (node.has(VAL_MAP)) {
            return parseFirestoreMap(node.get(VAL_MAP));
        } else if (node.has(VAL_ARRAY)) {
            return parseFirestoreArray(node.get(VAL_ARRAY));
        }
        return null;
    }

    private Map<String, Object> parseFirestoreMap(JsonNode mapNode) {
        Map<String, Object> map = new HashMap<>();
        JsonNode fieldsNode = mapNode.get(FIELDS);
        if (fieldsNode != null && fieldsNode.isObject()) {
            for (Map.Entry<String, JsonNode> entry : fieldsNode.properties()) {
                map.put(entry.getKey(), parseFirestoreValue(entry.getValue()));
            }
        }
        return map;
    }

    private List<Object> parseFirestoreArray(JsonNode arrayNode) {
        List<Object> list = new ArrayList<>();
        JsonNode valuesNode = arrayNode.get(VALUES);
        if (valuesNode != null && valuesNode.isArray()) {
            for (JsonNode val : valuesNode) {
                list.add(parseFirestoreValue(val));
            }
        }
        return list;
    }

    private JsonNode convertToFirestoreValue(Object val, ObjectMapper mapper) {
        ObjectNode node = mapper.createObjectNode();
        if (val == null) {
            node.put("nullValue", (String) null);
        } else if (val instanceof String stringVal) {
            node.put(VAL_STRING, stringVal);
        } else if (val instanceof Number numVal) {
            if (numVal instanceof Integer || numVal instanceof Long) {
                node.put(VAL_INTEGER, String.valueOf(numVal));
            } else {
                node.put(VAL_DOUBLE, numVal.doubleValue());
            }
        } else if (val instanceof Boolean boolVal) {
            node.put(VAL_BOOLEAN, boolVal);
        } else if (val instanceof Map) {
            ObjectNode fieldsNode = mapper.createObjectNode();
            Map<?, ?> map = (Map<?, ?>) val;
            for (Map.Entry<?, ?> entry : map.entrySet()) {
                fieldsNode.set(String.valueOf(entry.getKey()), convertToFirestoreValue(entry.getValue(), mapper));
            }
            node.set(VAL_MAP, mapper.createObjectNode().set(FIELDS, fieldsNode));
        } else if (val instanceof List) {
            com.fasterxml.jackson.databind.node.ArrayNode valuesNode = mapper.createArrayNode();
            List<?> list = (List<?>) val;
            for (Object item : list) {
                valuesNode.add(convertToFirestoreValue(item, mapper));
            }
            node.set(VAL_ARRAY, mapper.createObjectNode().set(VALUES, valuesNode));
        } else {
            node.put(VAL_STRING, val.toString());
        }
        return node;
    }

    private synchronized void syncWithFirestore() {
        if (isTestProfile()) return;
        try {
            RestTemplate restTemplate = new RestTemplate();
            String response = restTemplate.getForObject(FIRESTORE_BASE_URL, String.class);
            if (response == null) return;

            JsonNode root = objectMapper.readTree(response);
            JsonNode docsNode = root.get("documents");
            if (docsNode == null || !docsNode.isArray()) return;

            Set<String> fetchedFirestoreIds = new HashSet<>();
            for (JsonNode doc : docsNode) {
                processFirestoreDocument(doc, fetchedFirestoreIds);
            }

            // Remove local students that were deleted from Firestore
            List<Student> locals = studentRepository.findAll();
            for (Student local : locals) {
                if (local.getFirestoreId() != null && !fetchedFirestoreIds.contains(local.getFirestoreId())) {
                    studentRepository.delete(local);
                }
            }

        } catch (Exception e) {
            log.error("Firestore Sync failed: {}", e.getMessage());
        }
    }

    private LocalDate parseDob(String dateOfBirthStr) {
        try {
            return LocalDate.parse(dateOfBirthStr.substring(0, 10));
        } catch (Exception e) {
            return LocalDate.of(2000, 1, 1);
        }
    }

    private double calculateAttendanceAverage(List<Object> attList) {
        if (attList.isEmpty()) {
            return 100.0;
        }
        int present = 0;
        for (Object item : attList) {
            if (item instanceof Map<?, ?> map) {
                Object stVal = map.get(FIELD_STATUS);
                if (stVal != null) {
                    String stat = stVal.toString();
                    if (stat.equalsIgnoreCase("PRESENT") || stat.equalsIgnoreCase("LATE")) {
                        present++;
                    }
                }
            }
        }
        return (double) present / attList.size() * 100.0;
    }

    private int parseSemesterField(JsonNode fieldsNode) {
        if (!fieldsNode.has(FIELD_SEMESTER)) return 1;
        JsonNode semNode = fieldsNode.get(FIELD_SEMESTER);
        if (semNode.has(VAL_INTEGER)) return Integer.parseInt(semNode.get(VAL_INTEGER).asText());
        if (semNode.has(VAL_DOUBLE)) return (int) semNode.get(VAL_DOUBLE).asDouble();
        return 1;
    }

    private double parseGpaField(JsonNode fieldsNode) {
        if (!fieldsNode.has(FIELD_GPA)) return 0.0;
        JsonNode gpaNode = fieldsNode.get(FIELD_GPA);
        if (gpaNode.has(VAL_DOUBLE)) return gpaNode.get(VAL_DOUBLE).asDouble();
        if (gpaNode.has(VAL_INTEGER)) return Double.parseDouble(gpaNode.get(VAL_INTEGER).asText());
        return 0.0;
    }

    private List<Object> parseListField(JsonNode fieldsNode, String fieldName) {
        if (!fieldsNode.has(fieldName)) return new ArrayList<>();
        Object parsed = parseFirestoreValue(fieldsNode.get(fieldName));
        return parsed instanceof List ? (List<Object>) parsed : new ArrayList<>();
    }

    private String parseStringField(JsonNode fieldsNode, String fieldName, String defaultValue) {
        if (!fieldsNode.has(fieldName)) return defaultValue;
        JsonNode node = fieldsNode.get(fieldName);
        return node.has(VAL_STRING) ? node.get(VAL_STRING).asText() : defaultValue;
    }

    private int parseOfferCountField(JsonNode fieldsNode) {
        if (!fieldsNode.has(FIELD_OFFER_COUNT)) return 0;
        JsonNode offerNode = fieldsNode.get(FIELD_OFFER_COUNT);
        if (offerNode.has(VAL_INTEGER)) return Integer.parseInt(offerNode.get(VAL_INTEGER).asText());
        if (offerNode.has(VAL_DOUBLE)) return (int) offerNode.get(VAL_DOUBLE).asDouble();
        return 0;
    }

    private Optional<Student> findExistingStudent(String firestoreId, String enrollmentNumber, String email) {
        Optional<Student> found = studentRepository.findByFirestoreId(firestoreId);
        if (found.isEmpty()) found = studentRepository.findByEnrollmentNumber(enrollmentNumber);
        if (found.isEmpty()) found = studentRepository.findByEmail(email);
        return found;
    }

    private void updateExistingStudent(Student ex, FirestoreStudentData d) {
        ex.setFirstName(d.firstName());
        ex.setLastName(d.lastName());
        ex.setEmail(d.email());
        ex.setEnrollmentNumber(d.enrollmentNumber());
        ex.setDateOfBirth(d.dob());
        ex.setDepartment(d.department());
        ex.setSemester(d.semester());
        ex.setStatus(d.status());
        ex.setImageUrl(d.imageUrl());
        ex.setGpa(d.gpa());
        ex.setAttendance(d.attendanceAvg());
        ex.setPlacementReady(d.gpa() >= 8.5);
        ex.setPlacementStatus(d.placementStatus());
        ex.setOfferCount(d.offerCount());
        ex.setFirestoreId(d.firestoreId());
        ex.setGradesJson(d.gradesJsonStr());
        ex.setAttendanceJson(d.attJsonStr());
        ex.setPhone(d.phone());
        ex.setGithubUrl(d.githubUrl());
        ex.setLinkedinUrl(d.linkedinUrl());
        ex.setPortfolioUrl(d.portfolioUrl());
        ex.setPortfolioTitle(d.portfolioTitle());
        ex.setPortfolioSummary(d.portfolioSummary());
        studentRepository.save(ex);
    }

    private void processFirestoreDocument(JsonNode doc, Set<String> fetchedFirestoreIds)
            throws com.fasterxml.jackson.core.JsonProcessingException {
        String name = doc.get("name").asText();
        String firestoreId = name.substring(name.lastIndexOf('/') + 1);
        fetchedFirestoreIds.add(firestoreId);
        JsonNode fieldsNode = doc.get(FIELDS);
        if (fieldsNode == null) return;

        String firstName = parseStringField(fieldsNode, FIELD_FIRST_NAME, "");
        String lastName = parseStringField(fieldsNode, FIELD_LAST_NAME, "");
        String email = parseStringField(fieldsNode, FIELD_EMAIL, "");
        String enrollmentNumber = parseStringField(fieldsNode, FIELD_ENROLLMENT, "");

        LocalDate dob = parseDob(parseStringField(fieldsNode, FIELD_DOB, "2000-01-01"));
        String department = parseStringField(fieldsNode, FIELD_DEPT, "");
        int semester = parseSemesterField(fieldsNode);
        String status = parseStringField(fieldsNode, FIELD_STATUS, "ACTIVE");
        String imageUrl = parseStringField(fieldsNode, FIELD_IMAGE, "");
        double gpa = parseGpaField(fieldsNode);

        List<Object> gradesList = parseListField(fieldsNode, FIELD_GRADES);
        String gradesJsonStr = objectMapper.writeValueAsString(gradesList);

        List<Object> attList = parseListField(fieldsNode, FIELD_ATTENDANCE);
        String attJsonStr = objectMapper.writeValueAsString(attList);
        double attendanceAvg = calculateAttendanceAverage(attList);

        // Parse placement fields
        String placementStatus = parseStringField(fieldsNode, FIELD_PLACEMENT_STATUS, "NOT_STARTED");
        int offerCount = parseOfferCountField(fieldsNode);

        String phone = parseStringField(fieldsNode, "phone", "");
        String githubUrl = parseStringField(fieldsNode, "githubUrl", "");
        String linkedinUrl = parseStringField(fieldsNode, "linkedinUrl", "");
        String portfolioUrl = parseStringField(fieldsNode, "portfolioUrl", "");
        String portfolioTitle = parseStringField(fieldsNode, "portfolioTitle", "");
        String portfolioSummary = parseStringField(fieldsNode, "portfolioSummary", "");

        FirestoreStudentData data = new FirestoreStudentData(
                firestoreId, firstName, lastName, email, enrollmentNumber,
                dob, department, semester, status, imageUrl,
                gpa, attendanceAvg, gradesJsonStr, attJsonStr,
                placementStatus, offerCount, phone, githubUrl, linkedinUrl,
                portfolioUrl, portfolioTitle, portfolioSummary);

        Optional<Student> existingOpt = findExistingStudent(firestoreId, enrollmentNumber, email);

        if (existingOpt.isPresent()) {
            updateExistingStudent(existingOpt.get(), data);
        } else {
            Student nu = Student.builder()
                    .firstName(firstName)
                    .lastName(lastName)
                    .email(email)
                    .enrollmentNumber(enrollmentNumber)
                    .dateOfBirth(dob)
                    .department(department)
                    .semester(semester)
                    .status(status)
                    .imageUrl(imageUrl)
                    .gpa(gpa)
                    .attendance(attendanceAvg)
                    .placementReady(gpa >= 8.5)
                    .placementStatus(placementStatus)
                    .offerCount(offerCount)
                    .firestoreId(firestoreId)
                    .gradesJson(gradesJsonStr)
                    .attendanceJson(attJsonStr)
                    .phone(phone)
                    .githubUrl(githubUrl)
                    .linkedinUrl(linkedinUrl)
                    .portfolioUrl(portfolioUrl)
                    .portfolioTitle(portfolioTitle)
                    .portfolioSummary(portfolioSummary)
                    .build();
            studentRepository.save(nu);
        }
    }

    private String buildFirestoreJson(StudentDto dto) {
        try {
            ObjectNode root = objectMapper.createObjectNode();
            ObjectNode fieldsNode = objectMapper.createObjectNode();

            fieldsNode.set(FIELD_FIRST_NAME, objectMapper.createObjectNode().put(VAL_STRING, dto.getFirstName()));
            fieldsNode.set(FIELD_LAST_NAME, objectMapper.createObjectNode().put(VAL_STRING, dto.getLastName()));
            fieldsNode.set(FIELD_EMAIL, objectMapper.createObjectNode().put(VAL_STRING, dto.getEmail()));
            fieldsNode.set(FIELD_ENROLLMENT, objectMapper.createObjectNode().put(VAL_STRING, dto.getEnrollmentNumber()));
            fieldsNode.set(FIELD_DOB, objectMapper.createObjectNode().put(VAL_STRING, dto.getDateOfBirth().toString()));
            fieldsNode.set(FIELD_DEPT, objectMapper.createObjectNode().put(VAL_STRING, dto.getDepartment()));
            fieldsNode.set(FIELD_SEMESTER, objectMapper.createObjectNode().put(VAL_INTEGER, String.valueOf(dto.getSemester())));
            fieldsNode.set(FIELD_STATUS, objectMapper.createObjectNode().put(VAL_STRING, dto.getStatus()));
            fieldsNode.set(FIELD_GPA, objectMapper.createObjectNode().put(VAL_DOUBLE, dto.getGpa() != null ? dto.getGpa() : 8.0));
            fieldsNode.set(FIELD_IMAGE, objectMapper.createObjectNode().put(VAL_STRING, dto.getImageUrl() != null ? dto.getImageUrl() : ""));
            fieldsNode.set("phone", objectMapper.createObjectNode().put(VAL_STRING, dto.getPhone() != null ? dto.getPhone() : ""));
            fieldsNode.set("githubUrl", objectMapper.createObjectNode().put(VAL_STRING, dto.getGithubUrl() != null ? dto.getGithubUrl() : ""));
            fieldsNode.set("linkedinUrl", objectMapper.createObjectNode().put(VAL_STRING, dto.getLinkedinUrl() != null ? dto.getLinkedinUrl() : ""));
            fieldsNode.set("portfolioUrl", objectMapper.createObjectNode().put(VAL_STRING, dto.getPortfolioUrl() != null ? dto.getPortfolioUrl() : ""));
            fieldsNode.set("portfolioTitle", objectMapper.createObjectNode().put(VAL_STRING, dto.getPortfolioTitle() != null ? dto.getPortfolioTitle() : ""));
            fieldsNode.set("portfolioSummary", objectMapper.createObjectNode().put(VAL_STRING, dto.getPortfolioSummary() != null ? dto.getPortfolioSummary() : ""));

            if (dto.getGrades() != null) {
                fieldsNode.set(FIELD_GRADES, convertToFirestoreValue(dto.getGrades(), objectMapper));
            } else {
                fieldsNode.set(FIELD_GRADES, objectMapper.createObjectNode().set(VAL_ARRAY, objectMapper.createObjectNode().set(VALUES, objectMapper.createArrayNode())));
            }

            if (dto.getAttendance() != null) {
                fieldsNode.set(FIELD_ATTENDANCE, convertToFirestoreValue(dto.getAttendance(), objectMapper));
            } else {
                fieldsNode.set(FIELD_ATTENDANCE, objectMapper.createObjectNode().set(VAL_ARRAY, objectMapper.createObjectNode().set(VALUES, objectMapper.createArrayNode())));
            }

            root.set(FIELDS, fieldsNode);
            return objectMapper.writeValueAsString(root);
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to serialize Firestore payload", e);
        }
    }

    @Override
    public List<StudentDto> getAllStudents() {
        syncWithFirestore();
        return studentRepository.findAll().stream()
                .map(this::convertToDto)
                .toList();
    }

    @Override
    public StudentDto getStudentById(Long id) {
        syncWithFirestore();
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(NOT_FOUND_MSG + id));
        return convertToDto(student);
    }

    @Override
    public StudentDto createStudent(StudentDto studentDto) {
        Student student = convertToEntity(studentDto);
        Student savedStudent = studentRepository.save(student);

        if (!isTestProfile()) {
            try {
                RestTemplate restTemplate = new RestTemplate();
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                String jsonBody = buildFirestoreJson(studentDto);
                HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);

                ResponseEntity<String> response = restTemplate.postForEntity(FIRESTORE_BASE_URL, entity, String.class);
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    JsonNode root = objectMapper.readTree(response.getBody());
                    String name = root.get("name").asText();
                    String firestoreId = name.substring(name.lastIndexOf('/') + 1);
                    savedStudent.setFirestoreId(firestoreId);
                    studentRepository.save(savedStudent);
                }
            } catch (Exception e) {
                log.error("Failed to write new student to Firestore: {}", e.getMessage());
            }
        }

        return convertToDto(savedStudent);
    }

    @Override
    public StudentDto updateStudent(Long id, StudentDto studentDto) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(NOT_FOUND_MSG + id));

        String changedBy = "System API";
        try {
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getName() != null) {
                changedBy = auth.getName();
            }
        } catch (Exception e) {
            // Ignore security context not found
        }

        updateAndLogFields(student, studentDto, changedBy);

        student.setPlacementReady(studentDto.getPlacementReady());

        if (studentDto.getGrades() != null) {
            try {
                student.setGradesJson(objectMapper.writeValueAsString(studentDto.getGrades()));
            } catch (Exception e) {
                // Ignore serialization failure
            }
        }
        if (studentDto.getAttendance() != null) {
            try {
                student.setAttendanceJson(objectMapper.writeValueAsString(studentDto.getAttendance()));
            } catch (Exception e) {
                // Ignore serialization failure
            }
        }

        Student updatedStudent = studentRepository.save(student);

        if (!isTestProfile() && updatedStudent.getFirestoreId() != null) {
            syncToFirestore(updatedStudent);
        }

        triggerRecalculations(updatedStudent.getFirestoreId());

        return convertToDto(updatedStudent);
    }

    private void updateAndLogFields(Student student, StudentDto dto, String changedBy) {
        String fId = student.getFirestoreId();
        compareAndLog(fId, "First Name", student.getFirstName(), dto.getFirstName(), changedBy);
        student.setFirstName(dto.getFirstName());

        compareAndLog(fId, "Last Name", student.getLastName(), dto.getLastName(), changedBy);
        student.setLastName(dto.getLastName());

        compareAndLog(fId, "Email", student.getEmail(), dto.getEmail(), changedBy);
        student.setEmail(dto.getEmail());

        compareAndLog(fId, "Enrollment Number", student.getEnrollmentNumber(), dto.getEnrollmentNumber(), changedBy);
        student.setEnrollmentNumber(dto.getEnrollmentNumber());

        compareAndLog(fId, "Date of Birth", student.getDateOfBirth() != null ? student.getDateOfBirth().toString() : "", dto.getDateOfBirth() != null ? dto.getDateOfBirth().toString() : "", changedBy);
        student.setDateOfBirth(dto.getDateOfBirth());

        compareAndLog(fId, "Department", student.getDepartment(), dto.getDepartment(), changedBy);
        student.setDepartment(dto.getDepartment());

        compareAndLog(fId, "Current Semester", student.getSemester() != null ? String.valueOf(student.getSemester()) : "", dto.getSemester() != null ? String.valueOf(dto.getSemester()) : "", changedBy);
        student.setSemester(dto.getSemester());

        compareAndLog(fId, "Status", student.getStatus(), dto.getStatus(), changedBy);
        student.setStatus(dto.getStatus());

        compareAndLog(fId, "Image URL", student.getImageUrl(), dto.getImageUrl(), changedBy);
        student.setImageUrl(dto.getImageUrl());

        compareAndLog(fId, "CGPA", student.getGpa() != null ? String.valueOf(student.getGpa()) : "", dto.getGpa() != null ? String.valueOf(dto.getGpa()) : "", changedBy);
        student.setGpa(dto.getGpa());

        compareAndLog(fId, "Attendance Rate", student.getAttendance() != null ? String.valueOf(student.getAttendance()) : "", dto.getAttendanceRate() != null ? String.valueOf(dto.getAttendanceRate()) : "", changedBy);
        student.setAttendance(dto.getAttendanceRate());

        compareAndLog(fId, "Placement Status", student.getPlacementStatus(), dto.getPlacementStatus(), changedBy);
        student.setPlacementStatus(dto.getPlacementStatus());

        compareAndLog(fId, "Offer Count", student.getOfferCount() != null ? String.valueOf(student.getOfferCount()) : "", dto.getOfferCount() != null ? String.valueOf(dto.getOfferCount()) : "", changedBy);
        student.setOfferCount(dto.getOfferCount());

        compareAndLog(fId, "Phone", student.getPhone(), dto.getPhone(), changedBy);
        student.setPhone(dto.getPhone());

        compareAndLog(fId, "GitHub URL", student.getGithubUrl(), dto.getGithubUrl(), changedBy);
        student.setGithubUrl(dto.getGithubUrl());

        compareAndLog(fId, "LinkedIn URL", student.getLinkedinUrl(), dto.getLinkedinUrl(), changedBy);
        student.setLinkedinUrl(dto.getLinkedinUrl());

        compareAndLog(fId, "Portfolio URL", student.getPortfolioUrl(), dto.getPortfolioUrl(), changedBy);
        student.setPortfolioUrl(dto.getPortfolioUrl());

        compareAndLog(fId, "Portfolio Title", student.getPortfolioTitle(), dto.getPortfolioTitle(), changedBy);
        student.setPortfolioTitle(dto.getPortfolioTitle());

        compareAndLog(fId, "Portfolio Summary", student.getPortfolioSummary(), dto.getPortfolioSummary(), changedBy);
        student.setPortfolioSummary(dto.getPortfolioSummary());
    }

    private void syncToFirestore(Student updatedStudent) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String jsonBody = buildFirestoreJson(convertToDto(updatedStudent));
            HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);

            String patchUrl = FIRESTORE_BASE_URL + "/" + updatedStudent.getFirestoreId() +
                    "?updateMask.fieldPaths=firstName&updateMask.fieldPaths=lastName&updateMask.fieldPaths=email" +
                    "&updateMask.fieldPaths=enrollmentNumber&updateMask.fieldPaths=dateOfBirth&updateMask.fieldPaths=department" +
                    "&updateMask.fieldPaths=semester&updateMask.fieldPaths=status&updateMask.fieldPaths=gpa&updateMask.fieldPaths=imageUrl" +
                    "&updateMask.fieldPaths=grades&updateMask.fieldPaths=attendance" +
                    "&updateMask.fieldPaths=phone&updateMask.fieldPaths=githubUrl&updateMask.fieldPaths=linkedinUrl" +
                    "&updateMask.fieldPaths=portfolioUrl&updateMask.fieldPaths=portfolioTitle&updateMask.fieldPaths=portfolioSummary";

            headers.set("X-HTTP-Method-Override", "PATCH");
            restTemplate.exchange(patchUrl, HttpMethod.POST, entity, String.class);
        } catch (Exception e) {
            log.error("Failed to update student in Firestore: {}", e.getMessage());
        }
    }

    private void triggerRecalculations(String firestoreId) {
        if (firestoreId == null) return;
        try {
            placementIntelligenceService.recalculate(firestoreId);
        } catch (Exception e) {
            log.warn("Failed to trigger automatic placement recalculation: {}", e.getMessage());
        }
        try {
            riskDetectionService.recalculate(firestoreId);
        } catch (Exception e) {
            log.warn("Failed to trigger automatic academic risk recalculation: {}", e.getMessage());
        }
    }

    @Override
    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(NOT_FOUND_MSG + id));

        if (!isTestProfile() && student.getFirestoreId() != null) {
            try {
                RestTemplate restTemplate = new RestTemplate();
                String deleteUrl = FIRESTORE_BASE_URL + "/" + student.getFirestoreId();
                restTemplate.delete(deleteUrl);
            } catch (Exception e) {
                log.error("Failed to delete student from Firestore: {}", e.getMessage());
            }
        }

        studentRepository.delete(student);
    }

    @Override
    public List<StudentDto> searchStudents(String query) {
        syncWithFirestore();
        if (query == null || query.trim().isEmpty()) {
            return getAllStudents();
        }
        return studentRepository.findByLastNameContainingIgnoreCaseOrFirstNameContainingIgnoreCase(query, query)
                .stream()
                .map(this::convertToDto)
                .toList();
    }

    private List<String> deserializeStringList(String json) {
        if (json == null || json.isBlank()) return new ArrayList<>();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    private List<Integer> deserializeIntegerList(String json) {
        if (json == null || json.isBlank()) return new ArrayList<>();
        try {
            return objectMapper.readValue(json, new TypeReference<List<Integer>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    private StudentDto convertToDto(Student student) {
        StudentDto dto = new StudentDto();
        dto.setId(student.getId());
        dto.setFirstName(student.getFirstName());
        dto.setLastName(student.getLastName());
        dto.setEmail(student.getEmail());
        dto.setEnrollmentNumber(student.getEnrollmentNumber());
        dto.setDateOfBirth(student.getDateOfBirth());
        dto.setDepartment(student.getDepartment());
        dto.setSemester(student.getSemester());
        dto.setStatus(student.getStatus());
        dto.setImageUrl(student.getImageUrl());
        dto.setGpa(student.getGpa());
        dto.setAttendanceRate(student.getAttendance());
        dto.setPlacementReady(student.getPlacementReady());
        dto.setPlacementStatus(student.getPlacementStatus());
        dto.setOfferCount(student.getOfferCount());
        dto.setFirestoreId(student.getFirestoreId());
        dto.setPhone(student.getPhone());
        dto.setGithubUrl(student.getGithubUrl());
        dto.setLinkedinUrl(student.getLinkedinUrl());
        dto.setPortfolioUrl(student.getPortfolioUrl());
        dto.setPortfolioTitle(student.getPortfolioTitle());
        dto.setPortfolioSummary(student.getPortfolioSummary());
        
        dto.setPlacementScore(student.getPlacementScore());
        dto.setPlacementTier(student.getPlacementTier());
        dto.setConfidenceLevel(student.getConfidenceLevel());
        dto.setLastCalculatedAt(student.getLastCalculatedAt());
        
        dto.setStrengths(deserializeStringList(student.getStrengthsJson()));
        dto.setWeaknesses(deserializeStringList(student.getWeaknessesJson()));
        dto.setSkillGaps(deserializeStringList(student.getSkillGapsJson()));
        dto.setCareerGaps(deserializeStringList(student.getCareerGapsJson()));
        dto.setProjectGaps(deserializeStringList(student.getProjectGapsJson()));
        dto.setCertificationGaps(deserializeStringList(student.getCertificationGapsJson()));
        dto.setRecommendations(deserializeStringList(student.getRecommendationsJson()));
        dto.setCareerInsights(deserializeStringList(student.getCareerInsightsJson()));
        dto.setGrowthRoadmap(deserializeStringList(student.getGrowthRoadmapJson()));

        // Map risk fields
        dto.setRiskScore(student.getRiskScore());
        dto.setRiskCategory(student.getRiskCategory());
        dto.setRiskFactors(deserializeStringList(student.getRiskFactorsJson()));
        dto.setRiskReasons(deserializeStringList(student.getRiskReasonsJson()));
        dto.setInterventionSuggestions(deserializeStringList(student.getInterventionSuggestionsJson()));
        dto.setPriorityActions(deserializeStringList(student.getPriorityActionsJson()));
        dto.setRiskTrend(deserializeIntegerList(student.getRiskTrendJson()));
        dto.setRiskLastCalculatedAt(student.getRiskLastCalculatedAt());

        if (student.getGradesJson() != null && !student.getGradesJson().isEmpty()) {
            try {
                List<Map<String, Object>> grades = objectMapper.readValue(student.getGradesJson(), new TypeReference<List<Map<String, Object>>>() {});
                dto.setGrades(grades);
            } catch (Exception e) {
                dto.setGrades(new ArrayList<>());
            }
        } else {
            dto.setGrades(new ArrayList<>());
        }

        if (student.getAttendanceJson() != null && !student.getAttendanceJson().isEmpty()) {
            try {
                List<Map<String, Object>> attendance = objectMapper.readValue(student.getAttendanceJson(), new TypeReference<List<Map<String, Object>>>() {});
                dto.setAttendance(attendance);
            } catch (Exception e) {
                dto.setAttendance(new ArrayList<>());
            }
        } else {
            dto.setAttendance(new ArrayList<>());
        }

        return dto;
    }

    private String serializeJson(Object obj) {
        if (obj == null) return null;
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return null;
        }
    }

    private Student convertToEntity(StudentDto dto) {
        Student student = Student.builder()
                .id(dto.getId())
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .email(dto.getEmail())
                .enrollmentNumber(dto.getEnrollmentNumber())
                .dateOfBirth(dto.getDateOfBirth())
                .department(dto.getDepartment())
                .semester(dto.getSemester())
                .status(dto.getStatus())
                .imageUrl(dto.getImageUrl())
                .gpa(dto.getGpa())
                .attendance(dto.getAttendanceRate())
                .placementReady(dto.getPlacementReady())
                .placementStatus(dto.getPlacementStatus())
                .offerCount(dto.getOfferCount())
                .firestoreId(dto.getFirestoreId())
                .placementScore(dto.getPlacementScore())
                .placementTier(dto.getPlacementTier())
                .confidenceLevel(dto.getConfidenceLevel())
                .lastCalculatedAt(dto.getLastCalculatedAt())
                .riskScore(dto.getRiskScore())
                .riskCategory(dto.getRiskCategory())
                .riskLastCalculatedAt(dto.getRiskLastCalculatedAt())
                .phone(dto.getPhone())
                .githubUrl(dto.getGithubUrl())
                .linkedinUrl(dto.getLinkedinUrl())
                .portfolioUrl(dto.getPortfolioUrl())
                .portfolioTitle(dto.getPortfolioTitle())
                .portfolioSummary(dto.getPortfolioSummary())
                .build();

        student.setStrengthsJson(serializeJson(dto.getStrengths()));
        student.setWeaknessesJson(serializeJson(dto.getWeaknesses()));
        student.setSkillGapsJson(serializeJson(dto.getSkillGaps()));
        student.setCareerGapsJson(serializeJson(dto.getCareerGaps()));
        student.setProjectGapsJson(serializeJson(dto.getProjectGaps()));
        student.setCertificationGapsJson(serializeJson(dto.getCertificationGaps()));
        student.setRecommendationsJson(serializeJson(dto.getRecommendations()));
        student.setCareerInsightsJson(serializeJson(dto.getCareerInsights()));
        student.setGrowthRoadmapJson(serializeJson(dto.getGrowthRoadmap()));

        // Risk fields serialization
        student.setRiskFactorsJson(serializeJson(dto.getRiskFactors()));
        student.setRiskReasonsJson(serializeJson(dto.getRiskReasons()));
        student.setInterventionSuggestionsJson(serializeJson(dto.getInterventionSuggestions()));
        student.setPriorityActionsJson(serializeJson(dto.getPriorityActions()));
        student.setRiskTrendJson(serializeJson(dto.getRiskTrend()));

        student.setGradesJson(serializeJson(dto.getGrades()));
        student.setAttendanceJson(serializeJson(dto.getAttendance()));

        return student;
    }

    @Override
    public StudentDto updateStudentByFirestoreId(String firestoreId, StudentDto studentDto) {
        Student student = studentRepository.findByFirestoreId(firestoreId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with Firestore ID: " + firestoreId));
        return updateStudent(student.getId(), studentDto);
    }

    private void compareAndLog(String fId, String fieldName, String oldVal, String newVal, String changedBy) {
        String safeOld = oldVal == null ? "" : oldVal.trim();
        String safeNew = newVal == null ? "" : newVal.trim();
        if (!safeOld.equalsIgnoreCase(safeNew)) {
            logChangeHistory(fId, fieldName, safeOld, safeNew, changedBy);
        }
    }

    private void logChangeHistory(String fId, String fieldName, String oldVal, String newVal, String changedBy) {
        if (fId == null || fId.isBlank()) return;
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            ObjectNode root = objectMapper.createObjectNode();
            ObjectNode fields = objectMapper.createObjectNode();
            fields.set("fieldChanged", objectMapper.createObjectNode().put(VAL_STRING, fieldName));
            fields.set("oldValue", objectMapper.createObjectNode().put(VAL_STRING, oldVal != null ? oldVal : ""));
            fields.set("newValue", objectMapper.createObjectNode().put(VAL_STRING, newVal != null ? newVal : ""));
            fields.set("changedBy", objectMapper.createObjectNode().put(VAL_STRING, changedBy != null ? changedBy : "System API"));
            fields.set("changedAt", objectMapper.createObjectNode().put(VAL_STRING, java.time.Instant.now().toString()));
            fields.set("createdAt", objectMapper.createObjectNode().put(VAL_STRING, java.time.Instant.now().toString()));

            root.set(FIELDS, fields);
            HttpEntity<String> entity = new HttpEntity<>(root.toString(), headers);
            String url = FIRESTORE_BASE_URL + "/" + fId + "/changeHistory";
            restTemplate.postForEntity(url, entity, String.class);
        } catch (Exception e) {
            log.error("Failed to log change history to Firestore: {}", e.getMessage());
        }
    }
}

