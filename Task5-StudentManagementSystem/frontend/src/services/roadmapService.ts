import { apiClient } from './apiClient'
import type { StudentRoadmap } from '../types/roadmap'

export const roadmapService = {
  async getAll(): Promise<StudentRoadmap[]> {
    const response = await apiClient.get<StudentRoadmap[]>('/roadmaps')
    return response.data
  },

  async getByStudentId(studentId: number): Promise<StudentRoadmap[]> {
    const response = await apiClient.get<StudentRoadmap[]>(`/roadmaps/student/${studentId}`)
    return response.data
  },

  async generate(studentId: number, type: string): Promise<StudentRoadmap> {
    const response = await apiClient.post<StudentRoadmap>(`/roadmaps/student/${studentId}/generate?type=${type}`)
    return response.data
  },

  async update(id: number, data: Partial<StudentRoadmap>): Promise<StudentRoadmap> {
    const response = await apiClient.put<StudentRoadmap>(`/roadmaps/${id}`, data)
    return response.data
  }
}
