import React, { useState } from 'react'
import { AuthSelector } from './auth-selector'
import { LoginForm } from './login'
import { RegisterForm } from './register'
import { UserProfile } from './user-profile'

type AuthState = 'selector' | 'login' | 'register' | 'authenticated'

interface CustomerUser {
  id: string
  phoneNumber: string
  name?: string
  email?: string
  isPhoneVerified: boolean
}

export function CustomerAuth() {
  const [authState, setAuthState] = useState<AuthState>('selector')
  const [currentUser, setCurrentUser] = useState<CustomerUser | null>(null)

  const handleLoginSuccess = (user: CustomerUser) => {
    setCurrentUser(user)
    setAuthState('authenticated')
  }

  const handleRegisterSuccess = (user: CustomerUser) => {
    setCurrentUser(user)
    setAuthState('authenticated')
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setAuthState('selector')
  }

  const handleBackToSelector = () => {
    setAuthState('selector')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {authState === 'selector' && (
          <AuthSelector
            onLogin={() => setAuthState('login')}
            onRegister={() => setAuthState('register')}
          />
        )}
        
        {authState === 'login' && (
          <LoginForm
            onBack={handleBackToSelector}
            onSuccess={handleLoginSuccess}
          />
        )}
        
        {authState === 'register' && (
          <RegisterForm
            onBack={handleBackToSelector}
            onSuccess={handleRegisterSuccess}
          />
        )}
        
        {authState === 'authenticated' && currentUser && (
          <UserProfile
            user={currentUser}
            onLogout={handleLogout}
          />
        )}
      </div>
    </div>
  )
}