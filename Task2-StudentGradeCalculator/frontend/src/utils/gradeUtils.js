/**
 * Grade calculation utilities
 * Ready for Spring Boot backend integration later
 */

export const GRADE_SCALE = [
  { grade: 'A+', min: 90, max: 100, color: '#22c55e', gpa: 4, label: 'Outstanding' },
  { grade: 'A',  min: 80, max: 89,  color: '#4ade80', gpa: 4, label: 'Excellent' },
  { grade: 'B',  min: 70, max: 79,  color: '#3b82f6', gpa: 3, label: 'Good' },
  { grade: 'C',  min: 60, max: 69,  color: '#eab308', gpa: 2, label: 'Average' },
  { grade: 'D',  min: 50, max: 59,  color: '#f97316', gpa: 1, label: 'Below Average' },
  { grade: 'F',  min: 0,  max: 49,  color: '#ef4444', gpa: 0, label: 'Fail' },
];

export function getGradeInfo(percentage) {
  return GRADE_SCALE.find(
    (g) => percentage >= g.min && percentage <= g.max
  ) || GRADE_SCALE.at(-1);
}

export function getPerformanceLabel(avg) {
  if (avg >= 90) return { label: 'Excellent', color: '#22c55e', emoji: '🏆' };
  if (avg >= 75) return { label: 'Good', color: '#3b82f6', emoji: '👍' };
  if (avg >= 60) return { label: 'Average', color: '#eab308', emoji: '📊' };
  return { label: 'Needs Improvement', color: '#ef4444', emoji: '📚' };
}

export function calculateResults(studentName, subjects) {
  const marks = subjects.map((s) => Number(s.marks));
  const total = marks.reduce((a, b) => a + b, 0);
  const maxTotal = subjects.length * 100;
  const average = total / subjects.length;
  const percentage = (total / maxTotal) * 100;
  const gradeInfo = getGradeInfo(percentage);
  const highest = Math.max(...marks);
  const lowest = Math.min(...marks);
  const passed = marks.filter((m) => m >= 50).length;
  const passPercentage = (passed / subjects.length) * 100;
  const performance = getPerformanceLabel(percentage);

  return {
    studentName,
    subjects,
    totalMarks: total,
    maxTotal,
    average: average.toFixed(2),
    percentage: percentage.toFixed(2),
    grade: gradeInfo.grade,
    gradeInfo,
    status: percentage >= 50 ? 'PASS' : 'FAIL',
    highest,
    lowest,
    totalSubjects: subjects.length,
    passed,
    passPercentage: passPercentage.toFixed(1),
    performance,
  };
}

export function createEmptySubject(id) {
  return { id, name: '', marks: '' };
}
