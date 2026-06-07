/**
 * Premium API Integration Service
 * Student Grade Calculator (GradeIQ)
 */

import { GRADE_SCALE, getPerformanceLabel } from './gradeUtils';

export { ApiError } from '../services/api';
import { 
  calculateGrade as calculateGradeApi 
} from '../services/api';

/**
 * Adapter to translate rich backend analytics into the expected frontend format
 * while retaining all existing dashboard properties and visual hooks.
 */
function adaptGradeResponse(backendRes, requestSubjects) {
  const pct = Number(backendRes.percentage);
  const grade = backendRes.grade;
  const hasIncomplete = grade === 'I';
  
  const matchedScale = GRADE_SCALE.find(g => g.grade === grade) || 
                       GRADE_SCALE.find(g => pct >= g.min && pct <= g.max) || 
                       GRADE_SCALE.at(-1);

  const mappedSubjects = requestSubjects.map(s => ({
    id: s.id,
    name: s.name,
    marks: s.incomplete ? null : Number(s.marks),
    incomplete: s.incomplete || false,
  }));

  const completeCount = mappedSubjects.filter(s => !s.incomplete).length;

  const perfLabel = backendRes.performance || 'Average';
  let perfObj = getPerformanceLabel(pct, hasIncomplete);
  perfObj = {
    ...perfObj,
    label: perfLabel,
  };

  let statusVal = 'FAIL';
  if (hasIncomplete) {
    statusVal = 'INCOMPLETE';
  } else if (backendRes.status === 'PASSED') {
    statusVal = 'PASS';
  }

  return {
    studentName: backendRes.studentName,
    subjects: mappedSubjects,
    totalMarks: backendRes.totalMarks,
    maxTotal: mappedSubjects.length * 100,
    average: completeCount > 0 ? (backendRes.totalMarks / completeCount).toFixed(2) : '0.00',
    percentage: pct.toFixed(2),
    grade: grade,
    gradeInfo: {
      ...matchedScale,
      gpa: backendRes.gpa || matchedScale.gpa,
    },
    status: statusVal,
    highest: backendRes.highestMark,
    lowest: backendRes.lowestMark,
    totalSubjects: mappedSubjects.length,
    passed: mappedSubjects.filter(s => !s.incomplete && s.marks >= 40).length,
    passPercentage: (backendRes.passPercentage || 0).toFixed(1),
    performance: perfObj,

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
   * Calculation endpoint calling the Spring Boot service
   */
  calculateGrades: async (studentName, subjects) => {
    const rawResponse = await calculateGradeApi(studentName, subjects);
    return adaptGradeResponse(rawResponse, subjects);
  }
};
