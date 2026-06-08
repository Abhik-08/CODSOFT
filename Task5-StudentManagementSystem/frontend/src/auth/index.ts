// Authentication sub-module utilities (e.g. role-checking helpers)
import type { UserProfile, UserRole } from '../types/auth'

export const hasRole = (user: UserProfile | null, allowedRoles: UserRole[]): boolean => {
  if (!user) return false
  return allowedRoles.includes(user.role)
}
