/**
 * Grade calculation utilities
 * Ready for Spring Boot backend integration later
 */

export const GRADE_SCALE = [
  { grade: 'O', min: 90, max: 100, color: '#22c55e', gpa: 10, label: 'Outstanding' },
  { grade: 'E', min: 80, max: 89,  color: '#10b981', gpa: 9,  label: 'Excellent' },
  { grade: 'A', min: 70, max: 79,  color: '#3b82f6', gpa: 8,  label: 'Very Good' },
  { grade: 'B', min: 60, max: 69,  color: '#6366f1', gpa: 7,  label: 'Good' },
  { grade: 'C', min: 50, max: 59,  color: '#eab308', gpa: 6,  label: 'Fair' },
  { grade: 'D', min: 40, max: 49,  color: '#f97316', gpa: 5,  label: 'Below Average' },
  { grade: 'F', min: 0,  max: 39,  color: '#ef4444', gpa: 2,  label: 'Failed' },
  { grade: 'I', min: 0,  max: 0,   color: '#a855f7', gpa: 2,  label: 'Incomplete' },
];

export function getGradeInfo(percentage, hasIncomplete = false) {
  if (hasIncomplete) {
    return GRADE_SCALE.find(g => g.grade === 'I');
  }
  const pct = Math.round(percentage);
  return GRADE_SCALE.find(
    (g) => pct >= g.min && pct <= g.max
  ) || GRADE_SCALE.find(g => g.grade === 'F');
}

export function getPerformanceLabel(avg, hasIncomplete = false) {
  if (hasIncomplete) return { label: 'Incomplete', color: '#a855f7', emoji: '📂' };
  if (avg >= 90) return { label: 'Outstanding', color: '#22c55e', emoji: '🏆' };
  if (avg >= 80) return { label: 'Excellent', color: '#10b981', emoji: '✨' };
  if (avg >= 70) return { label: 'Very Good', color: '#3b82f6', emoji: '👍' };
  if (avg >= 60) return { label: 'Good', color: '#6366f1', emoji: '📊' };
  if (avg >= 50) return { label: 'Fair', color: '#eab308', emoji: '📝' };
  if (avg >= 40) return { label: 'Below Average', color: '#f97316', emoji: '📚' };
  return { label: 'Failed', color: '#ef4444', emoji: '❌' };
}

export function calculateResults(studentName, subjects) {
  const hasIncomplete = subjects.some(s => s.incomplete);
  const completeSubjects = subjects.filter(s => !s.incomplete);
  
  const marks = completeSubjects.map((s) => Number(s.marks));
  const total = marks.reduce((a, b) => a + b, 0);
  const maxTotal = subjects.length * 100;
  
  const average = completeSubjects.length > 0 ? (total / completeSubjects.length) : 0;
  const percentage = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
  
  const gradeInfo = getGradeInfo(percentage, hasIncomplete);
  const highest = completeSubjects.length > 0 ? Math.max(...marks) : 0;
  const lowest = completeSubjects.length > 0 ? Math.min(...marks) : 0;
  
  const passed = completeSubjects.filter((m) => m >= 40).length;
  const passPercentage = subjects.length > 0 ? (passed / subjects.length) * 100 : 0;
  const performance = getPerformanceLabel(percentage, hasIncomplete);

  let statusVal = 'FAIL';
  if (hasIncomplete) {
    statusVal = 'INCOMPLETE';
  } else if (percentage >= 40 && passed === subjects.length) {
    statusVal = 'PASS';
  }

  return {
    studentName,
    subjects,
    totalMarks: total,
    maxTotal,
    average: average.toFixed(2),
    percentage: percentage.toFixed(2),
    grade: gradeInfo.grade,
    gradeInfo,
    status: statusVal,
    highest,
    lowest,
    totalSubjects: subjects.length,
    passed,
    passPercentage: passPercentage.toFixed(1),
    performance,
  };
}

export function createEmptySubject(id) {
  return { id, name: '', marks: '', incomplete: false };
}
