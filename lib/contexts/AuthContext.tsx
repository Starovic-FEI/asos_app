// lib/contexts/AuthContext.tsx
import { User } from '@supabase/supabase-js'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { getCurrentUser, getProfile, login, logout, register, sendPasswordResetEmail, updatePassword } from '../api/auth'
import { Profile } from '../models/types'
import { supabase } from '../supabase'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  error: string | null
  isLoggedIn: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => Promise<void>
  forgotPassword: (email: string) => Promise<boolean>
  resetPassword: (newPassword: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load user on mount
  useEffect(() => {
    console.log('[AuthProvider] Initializing...')
    const loadUser = async () => {
      try {
        const { user: currentUser } = await getCurrentUser()
        console.log('[AuthProvider] Current user:', currentUser?.id || 'none')
        setUser(currentUser)

        if (currentUser) {
          const { data } = await getProfile(currentUser.id)
          setProfile(data)
        }
      } catch (err) {
        console.error('[AuthProvider] Error loading user:', err)
      } finally {
        setLoading(false)
        console.log('[AuthProvider] Initialization complete')
      }
    }

    loadUser()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthProvider] Auth state changed:', event)
      
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        const { data: profileData } = await getProfile(session.user.id)
        setProfile(profileData)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
      }
    })

    return () => {
      console.log('[AuthProvider] Cleaning up subscription')
      subscription.unsubscribe()
    }
  }, [])

  const handleLogin = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    
    const { data, error: loginError } = await login({ email, password })
    
    if (loginError) {
      setError(loginError.message)
      setLoading(false)
      return false
    }
    
    setUser(data.user)
    if (data.user) {
      const { data: profileData } = await getProfile(data.user.id)
      setProfile(profileData)
    }
    setLoading(false)
    return true
  }

  const handleRegister = async (email: string, password: string, name: string) => {
    setLoading(true)
    setError(null)
    
    const { data, error: registerError } = await register({ email, password, name })
    
    if (registerError) {
      setError(registerError.message)
      setLoading(false)
      return false
    }
    
    setUser(data.user)
    if (data.user) {
      const { data: profileData } = await getProfile(data.user.id)
      setProfile(profileData)
    }
    setLoading(false)
    return true
  }

  const handleLogout = async () => {
    setLoading(true)
    await logout()
    setUser(null)
    setProfile(null)
    setLoading(false)
  }

  const handleSendPasswordResetEmail = async (email: string) => {
    setLoading(true)
    setError(null)
    
    const { error: resetError } = await sendPasswordResetEmail(email)
    
    if (resetError) {
      setError(resetError.message)
      setLoading(false)
      return false
    }
    
    setLoading(false)
    return true
  }

  const handleUpdatePassword = async (newPassword: string) => {
    setLoading(true)
    setError(null)
    
    const { error: updateError } = await updatePassword(newPassword)
    
    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return false
    }
    
    setLoading(false)
    return true
  }

  const value = {
    user,
    profile,
    loading,
    error,
    isLoggedIn: !!user,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    forgotPassword: handleSendPasswordResetEmail,
    resetPassword: handleUpdatePassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
