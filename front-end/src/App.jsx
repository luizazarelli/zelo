import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import HomePage from './pages/home/HomePage'
import WorkerListPage from './pages/workers/WorkerListPage'
import WorkerProfilePage from './pages/workers/WorkerProfilePage'
import ChatPage from './pages/hire/ChatPage'
import PaymentPage from './pages/hire/PaymentPage'
import HireHistoryPage from './pages/hire/HireHistoryPage'
import ProfilePage from './pages/profile/ProfilePage'
import BottomNav from './components/BottomNav'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

const NAV_ROUTES = ['/', '/historico', '/perfil']

function AppRoutes() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const showNav = user && NAV_ROUTES.includes(pathname)
  return (
    <>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <RegisterPage />} />
        <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
        <Route path="/workers" element={<PrivateRoute><WorkerListPage /></PrivateRoute>} />
        <Route path="/workers/:id" element={<PrivateRoute><WorkerProfilePage /></PrivateRoute>} />
        <Route path="/chat" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
        <Route path="/payment" element={<PrivateRoute><PaymentPage /></PrivateRoute>} />
        <Route path="/historico" element={<PrivateRoute><HireHistoryPage /></PrivateRoute>} />
        <Route path="/perfil" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {showNav && <BottomNav />}
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
