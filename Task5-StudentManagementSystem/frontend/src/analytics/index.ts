// Helper routines for mapping cohort GPA datasets into charting packages
import type { ChartDataPoint } from '../types/analytics'

export const formatChartData = (data: Record<string, number>): ChartDataPoint[] => {
  return Object.entries(data).map(([label, value]) => ({ label, value }))
}
