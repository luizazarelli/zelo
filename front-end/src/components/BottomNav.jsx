import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ALL_TABS = [
  { path: '/', label: 'Início', workerOnly: false, clientOnly: true, icon: (active) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? '#fff' : 'rgba(255,255,255,0.55)'}>
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
    </svg>
  )},
  { path: '/historico', label: 'Solicitações', icon: (active) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? '#fff' : 'rgba(255,255,255,0.55)'}>
      <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
    </svg>
  )},
  { path: '/perfil', label: 'Perfil', icon: (active) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? '#fff' : 'rgba(255,255,255,0.55)'}>
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  )},
]

export default function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user } = useAuth()
  const tabs = ALL_TABS.filter(t => !t.clientOnly || !user?.isWorker)

  return (
    <nav style={s.nav}>
      {tabs.map((tab) => {
        const active = pathname === tab.path || (tab.path !== '/' && pathname.startsWith(tab.path))
        return (
          <button key={tab.path} onClick={() => navigate(tab.path)} style={s.tab}>
            {tab.icon(active)}
            <span style={{ ...s.label, color: active ? '#fff' : 'rgba(255,255,255,0.55)', fontWeight: active ? '600' : '400' }}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

const s = {
  nav: { position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, backgroundColor: '#3CB043', display: 'flex', height: 68, zIndex: 100, boxShadow: '0 -2px 10px rgba(0,0,0,0.15)' },
  tab: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', gap: 4, cursor: 'pointer' },
  label: { fontSize: 11 },
}
