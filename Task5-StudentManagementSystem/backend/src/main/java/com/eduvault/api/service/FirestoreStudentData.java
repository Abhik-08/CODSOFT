package com.eduvault.api.service;

import java.time.LocalDate;

/**
 * Immutable value object carrying all fields parsed from a single Firestore student document.
 * Used internally by {@link StudentServiceImpl} to avoid long parameter lists.
 */
record FirestoreStudentData(
        String firestoreId,
        String firstName,
        String lastName,
        String email,
        String enrollmentNumber,
        LocalDate dob,
        String department,
        int semester,
        String status,
        String imageUrl,
        double gpa,
        double attendanceAvg,
        String gradesJsonStr,
        String attJsonStr,
        String placementStatus,
        int offerCount,
        String phone,
        String githubUrl,
        String linkedinUrl,
        String portfolioUrl,
        String portfolioTitle,
        String portfolioSummary
) {}
