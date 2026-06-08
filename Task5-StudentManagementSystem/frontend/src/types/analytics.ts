export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  averageGpa: number;
  attendanceRate: number;
  departmentDistribution: ChartDataPoint[];
  gpaDistribution: ChartDataPoint[];
}
