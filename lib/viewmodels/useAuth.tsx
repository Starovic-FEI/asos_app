// lib/viewmodels/useAuth.ts
import { User } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { getCurrentUser, getProfile, login, logout, register, signInWithGoogle, sendPasswordResetEmail, updatePassword } from '../api/auth'
import { Profile } from '../models/types'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Načítať používateľa pri štarte
  useEffect(() => {
    const loadUser = async () => {
      const { user } = await getCurrentUser()
      setUser(user)
      
      if (user) {
        const { data } = await getProfile(user.id)
        setProfile(data)
      }
      setLoading(false)
    }

    loadUser()
  }, [])

  // Prihlásenie
  const handleLogin = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    
    const { data, error } = await login({ email, password })
    
    if (error) {
      setError(error.message)
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

  // Registrácia
  const handleRegister = async (email: string, password: string, name: string) => {
    setLoading(true)
    setError(null)
    
    const { data, error } = await register({ email, password, name })
    
    if (error) {
      setError(error.message)
      setLoading(false)
      return false
    }
    
    setUser(data.user)
    setLoading(false)
    return true
  }

  // Odhlásenie
  const handleLogout = async () => {
    await logout()
    setUser(null)
    setProfile(null)
  }

  // Google OAuth prihlásenie
  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)

    const { error } = await signInWithGoogle()

    if (error) {
      setError(error.message)
      setLoading(false)
      return false
    }

    // OAuth redirect sa stará o presmerovanie, takže tu len nastavíme loading
    setLoading(false)
    return true
  }

  // Zabudnuté heslo
  const handleForgotPassword = async (email: string) => {
    setLoading(true)
    setError(null)

    const { error } = await sendPasswordResetEmail(email)

    if (error) {
      setError(error.message)
      setLoading(false)
      return false
    }

    setLoading(false)
    return true
  }

  // Reset hesla
  const handleResetPassword = async (newPassword: string) => {
    setLoading(true)
    setError(null)

    const { error } = await updatePassword(newPassword)

    if (error) {
      setError(error.message)
      setLoading(false)
      return false
    }

    setLoading(false)
    return true
  }

  return {
    user,
    profile,
    loading,
    error,
    isLoggedIn: !!user,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    loginWithGoogle: handleGoogleLogin,
    forgotPassword: handleForgotPassword,
    resetPassword: handleResetPassword,
  }
}