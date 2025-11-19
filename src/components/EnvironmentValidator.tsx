'use client'

interface EnvironmentValidatorProps {
  children: React.ReactNode
}

export default function EnvironmentValidator({ children }: EnvironmentValidatorProps) {
  // Environment validation now happens only during login in auth-context.tsx
  // This component just passes through the children
  return <>{children}</>
}
