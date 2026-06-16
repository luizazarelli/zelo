import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const id = localStorage.getItem('userId')
    const name = localStorage.getItem('userName')
    if (token && id) setUser({ token, id, name })
    setLoading(false)
  }, [])

  const signIn = (token, id, name) => {
    localStorage.setItem('token', token)
    localStorage.setItem('userId', id)
    localStorage.setItem('userName', name)
    setUser({ token, id, name })
  }

  const signOut = () => {
    localStorage.clear()
    setUser(null)
  }

  if (loading) return null

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
