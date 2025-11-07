import { createContext, useContext, useState, useEffect } from 'react'
import { getProfile } from '../lib/api'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      loadUser()
    } else {
      setLoading(false)
    }
  }, [])

  const loadUser = async () => {
    try {
      const response = await getProfile()
      setUser(response.data)
    } catch (error) {
      console.error('Failed to load user:', error)
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  const loginUser = (token, userData) => {
    localStorage.setItem('token', token)
    setUser(userData)
  }

  const logoutUser = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const updateUser = (userData) => {
    setUser(prevUser => ({ ...prevUser, ...userData }))
  }

  const value = {
    user,
    loading,
    loginUser,
    logoutUser,
    updateUser,
    refreshUser: loadUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
