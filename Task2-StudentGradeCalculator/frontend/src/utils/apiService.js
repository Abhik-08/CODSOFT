/**
 * Premium API Integration Service
 * Student Grade Calculator (GradeIQ)
 */

import { GRADE_SCALE, getPerformanceLabel } from './gradeUtils';

export { ApiError } from '../services/api';
import { 
  register as registerApi, 
  login as loginApi, 
  calculateGrade as calculateGradeApi 
} from '../services/api';

/**
 * Storage Helpers
 */
const TOKEN_KEY = 'gradeiq_jwt_token';
const USER_KEY = 'gradeiq_user_profile';

export const authStorage = {
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  getToken: () => localStorage.getItem(TOKEN_KEY),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),

  setUser: (user) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  getUser: () => {
    try {
      const user = localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },
  clearUser: () => localStorage.removeItem(USER_KEY),

  clearAll: () => {
    authStorage.clearToken();
    authStorage.clearUser();
  }
};

/**
 * Adapter to translate rich backend analytics into the expected frontend format
 * while retaining all existing dashboard properties and visual hooks.
 */
function adaptGradeResponse(backendRes, requestSubjects) {
  // Extract and compute values
  const pct = Number(backendRes.percentage);
  const grade = backendRes.grade;
  
  // Find grade info from existing Grade Scale to retain colors and styles
  const matchedScale = GRADE_SCALE.find(g => g.grade === grade) || 
                       GRADE_SCALE.find(g => pct >= g.min && pct <= g.max) || 
                       GRADE_SCALE.at(-1);

  // Map subjects back. Backend receives { subjectName, marks } and might return custom maps.
  // We align input subjects with calculated parameters.
  const mappedSubjects = requestSubjects.map(s => ({
    id: s.id,
    name: s.name,
    marks: Number(s.marks),
  }));

  // Re-map performance colors
  const perfLabel = backendRes.performance || 'Average';
  let perfObj = getPerformanceLabel(pct);
  // Ensure the adapted performance title matches backend response
  perfObj = {
    ...perfObj,
    label: perfLabel,
  };

  return {
    // Standard properties for existing Dashboard & Stats cards
    studentName: backendRes.studentName,
    subjects: mappedSubjects,
    totalMarks: backendRes.totalMarks,
    maxTotal: mappedSubjects.length * 100,
    average: (backendRes.totalMarks / mappedSubjects.length).toFixed(2),
    percentage: pct.toFixed(2),
    grade: grade,
    gradeInfo: {
      ...matchedScale,
      gpa: backendRes.gpa || matchedScale.gpa,
    },
    status: backendRes.status === 'PASSED' ? 'PASS' : 'FAIL',
    highest: backendRes.highestMark,
    lowest: backendRes.lowestMark,
    totalSubjects: mappedSubjects.length,
    passed: mappedSubjects.filter(s => s.marks >= 50).length,
    passPercentage: (backendRes.passPercentage || 0).toFixed(1),
    performance: perfObj,

    // Advanced Backend Analytics fields (AI insights bonus)
    remark: backendRes.remark,
    strongestSubject: backendRes.strongestSubject,
    weakestSubject: backendRes.weakestSubject,
    scholarshipEligible: backendRes.scholarshipEligible,
    academicHealthScore: backendRes.academicHealthScore,
    rankPrediction: backendRes.rankPrediction,
    improvementSuggestions: backendRes.improvementSuggestions || [],
    subjectPerformance: backendRes.subjectPerformance || {},
    gradeDistribution: backendRes.gradeDistribution || {},
  };
}

/**
 * API Methods
 */
export const apiService = {
  /**
   * User Registration
   */
  register: async (username, email, password) => {
    return registerApi(username, email, password);
  },

  /**
   * User Login
   */
  login: async (email, password) => {
    const data = await loginApi(email, password);

    if (data?.token) {
      authStorage.setToken(data.token);
      // Extract username from message or request (or defaults)
      const userProfile = { 
        email, 
        username: data.message ? data.message.replace(/Welcome\s+/, '').trim() : email.split('@')[0]
      };
      authStorage.setUser(userProfile);
      // Dispatch event to notify layout
      globalThis.dispatchEvent(new Event('auth-state-change'));
    }
    return data;
  },

  /**
   * Clear session — removes JWT + user profile from localStorage
   * and notifies all listeners via the 'auth-state-change' event.
   * Note: 401/403 token expiry is handled automatically by api.js,
   * which dispatches 'auth-expired' instead.
   */
  logout: () => {
    authStorage.clearAll();
    globalThis.dispatchEvent(new Event('auth-state-change'));
  },

  /**
   * Protected calculation endpoint calling the Spring Boot service
   */
  calculateGrades: async (studentName, subjects) => {
    const rawResponse = await calculateGradeApi(studentName, subjects);
    return adaptGradeResponse(rawResponse, subjects);
  },

  /**
   * Session verification helper
   */
  isAuthenticated: () => {
    return !!authStorage.getToken();
  },

  /**
   * Retrieve active user details
   */
  getCurrentUser: () => {
    return authStorage.getUser();
  }
};
