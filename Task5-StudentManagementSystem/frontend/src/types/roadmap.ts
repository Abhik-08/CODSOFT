export interface StudentRoadmap {
  id?: number;
  studentId: number;
  roadmapId?: string;
  roadmapType: string;
  currentScore?: number;
  targetScore?: number;
  currentStatus?: string;
  targetStatus?: string;
  milestones: string[];
  actionItems: string[];
  recommendations: string[];
  estimatedDuration: string;
  priority: string;
  createdAt?: string;
  updatedAt?: string;
}
