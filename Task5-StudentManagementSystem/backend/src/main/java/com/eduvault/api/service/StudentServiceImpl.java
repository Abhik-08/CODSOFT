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

    private final StudentRepository studentRepository;
    private final Environment env;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public StudentServiceImpl(StudentRepository studentRepository, Environment env) {
        this.studentRepository = studentRepository;
        this.env = env;
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
        ex.setFirestoreId(d.firestoreId());
        ex.setGradesJson(d.gradesJsonStr());
        ex.setAttendanceJson(d.attJsonStr());
        studentRepository.save(ex);
    }

    private void processFirestoreDocument(JsonNode doc, Set<String> fetchedFirestoreIds)
            throws com.fasterxml.jackson.core.JsonProcessingException {
        String name = doc.get("name").asText();
        String firestoreId = name.substring(name.lastIndexOf('/') + 1);
        fetchedFirestoreIds.add(firestoreId);
        JsonNode fieldsNode = doc.get(FIELDS);
        if (fieldsNode == null) return;

        String firstName = fieldsNode.has(FIELD_FIRST_NAME) ? fieldsNode.get(FIELD_FIRST_NAME).get(VAL_STRING).asText() : "";
        String lastName = fieldsNode.has(FIELD_LAST_NAME) ? fieldsNode.get(FIELD_LAST_NAME).get(VAL_STRING).asText() : "";
        String email = fieldsNode.has(FIELD_EMAIL) ? fieldsNode.get(FIELD_EMAIL).get(VAL_STRING).asText() : "";
        String enrollmentNumber = fieldsNode.has(FIELD_ENROLLMENT) ? fieldsNode.get(FIELD_ENROLLMENT).get(VAL_STRING).asText() : "";

        String dateOfBirthStr = fieldsNode.has(FIELD_DOB) ? fieldsNode.get(FIELD_DOB).get(VAL_STRING).asText() : "2000-01-01";
        LocalDate dob = parseDob(dateOfBirthStr);
        String department = fieldsNode.has(FIELD_DEPT) ? fieldsNode.get(FIELD_DEPT).get(VAL_STRING).asText() : "";
        int semester = parseSemesterField(fieldsNode);
        String status = fieldsNode.has(FIELD_STATUS) ? fieldsNode.get(FIELD_STATUS).get(VAL_STRING).asText() : "ACTIVE";
        String imageUrl = fieldsNode.has(FIELD_IMAGE) ? fieldsNode.get(FIELD_IMAGE).get(VAL_STRING).asText() : "";
        double gpa = parseGpaField(fieldsNode);

        List<Object> gradesList = parseListField(fieldsNode, FIELD_GRADES);
        String gradesJsonStr = objectMapper.writeValueAsString(gradesList);

        List<Object> attList = parseListField(fieldsNode, FIELD_ATTENDANCE);
        String attJsonStr = objectMapper.writeValueAsString(attList);
        double attendanceAvg = calculateAttendanceAverage(attList);

        FirestoreStudentData data = new FirestoreStudentData(
                firestoreId, firstName, lastName, email, enrollmentNumber,
                dob, department, semester, status, imageUrl,
                gpa, attendanceAvg, gradesJsonStr, attJsonStr);

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
                    .firestoreId(firestoreId)
                    .gradesJson(gradesJsonStr)
                    .attendanceJson(attJsonStr)
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

        student.setFirstName(studentDto.getFirstName());
        student.setLastName(studentDto.getLastName());
        student.setEmail(studentDto.getEmail());
        student.setEnrollmentNumber(studentDto.getEnrollmentNumber());
        student.setDateOfBirth(studentDto.getDateOfBirth());
        student.setDepartment(studentDto.getDepartment());
        student.setSemester(studentDto.getSemester());
        student.setStatus(studentDto.getStatus());
        student.setImageUrl(studentDto.getImageUrl());
        student.setGpa(studentDto.getGpa());
        student.setAttendance(studentDto.getAttendanceRate());
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
                        "&updateMask.fieldPaths=grades&updateMask.fieldPaths=attendance";

                headers.set("X-HTTP-Method-Override", "PATCH");
                restTemplate.exchange(patchUrl, HttpMethod.POST, entity, String.class);
            } catch (Exception e) {
                log.error("Failed to update student in Firestore: {}", e.getMessage());
            }
        }

        return convertToDto(updatedStudent);
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
        dto.setFirestoreId(student.getFirestoreId());

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
                .firestoreId(dto.getFirestoreId())
                .build();

        if (dto.getGrades() != null) {
            try {
                student.setGradesJson(objectMapper.writeValueAsString(dto.getGrades()));
            } catch (Exception e) {
                // Ignore serialization failure
            }
        }
        if (dto.getAttendance() != null) {
            try {
                student.setAttendanceJson(objectMapper.writeValueAsString(dto.getAttendance()));
            } catch (Exception e) {
                // Ignore serialization failure
            }
        }

        return student;
    }
}
