import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const id = localStorage.getItem('userId')
    const name = localStorage.getItem('userName')
    const profilePicture = localStorage.getItem('userProfilePicture') || null
    if (token && id) setUser({ token, id, name, profilePicture })
    setLoading(false)
  }, [])

  const signIn = (token, id, name) => {
    localStorage.setItem('token', token)
    localStorage.setItem('userId', id)
    localStorage.setItem('userName', name)
    setUser({ token, id, name, profilePicture: null })
  }

  const updateProfilePicture = (url) => {
    localStorage.setItem('userProfilePicture', url)
    setUser((prev) => prev ? { ...prev, profilePicture: url } : prev)
  }

  const signOut = () => {
    localStorage.clear()
    setUser(null)
  }

  if (loading) return null

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, updateProfilePicture }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
