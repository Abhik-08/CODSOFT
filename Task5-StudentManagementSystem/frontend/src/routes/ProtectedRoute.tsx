import { Navigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import type { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ('ADMIN' | 'STUDENT')[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, loading } = useAuthContext()

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-vault-bg text-vault-cyan">
        <div className="animate-pulse font-mono text-lg">Decrypting Vault Access...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.warn(`User role ${user.role} is not authorized for this section. Redirecting...`)
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
