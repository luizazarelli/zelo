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
    const isWorker = localStorage.getItem('userIsWorker') === 'true'
    if (token && id) setUser({ token, id, name, profilePicture, isWorker })
    setLoading(false)
  }, [])

  const signIn = (token, id, name, isWorker = false) => {
    localStorage.setItem('token', token)
    localStorage.setItem('userId', id)
    localStorage.setItem('userName', name)
    localStorage.setItem('userIsWorker', String(isWorker))
    setUser({ token, id, name, profilePicture: null, isWorker })
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
