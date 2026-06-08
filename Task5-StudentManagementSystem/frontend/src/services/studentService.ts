import { apiClient } from './apiClient'
import type { Student } from '../types/student'

export const studentService = {
  async getAll(): Promise<Student[]> {
    const response = await apiClient.get<Student[]>('/students')
    return response.data
  },

  async getById(id: string): Promise<Student> {
    const response = await apiClient.get<Student>(`/students/${id}`)
    return response.data
  },

  async create(student: Omit<Student, 'id' | 'grades' | 'attendance' | 'gpa'>): Promise<Student> {
    const response = await apiClient.post<Student>('/students', student)
    return response.data
  },

  async update(id: string, student: Partial<Student>): Promise<Student> {
    const response = await apiClient.put<Student>(`/students/${id}`, student)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/students/${id}`)
  }
}
