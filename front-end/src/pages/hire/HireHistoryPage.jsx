import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { hireApi } from '../../api/api'
import { useAuth } from '../../context/AuthContext'

function WorkerAvatar() {
  return (
    <div style={av.wrap}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#38b31f">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>
    </div>
  )
}

const av = {
  wrap: {
    width: 38, height: 38, borderRadius: 19,
    background: '#e8f5e9',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  }
}

export default function HireHistoryPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [hires, setHires] = useState([])

  useEffect(() => {
    hireApi.previous(user.id, 'client')
      .then(r => setHires(r.data.data?.hires || []))
      .catch(() => {})
  }, [])

  const fmt = (d) => {
    if (!d) return 'Sex, 19/09/2025'
    const date = new Date(d)
    return date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <p style={s.title}>Histórico de contratos</p>
      </div>

      <div style={s.list}>
        {hires.length === 0 && (
          <div style={s.empty}>
            <p style={s.emptyText}>Nenhuma contratação anterior</p>
          </div>
        )}

        {hires.map(h => (
          <div key={h.id} style={s.item}>
            <p style={s.date}>{fmt(h.createdAt)}</p>
            <div style={s.card}>
              <div style={s.cardTop}>
                <WorkerAvatar />
                <div style={s.cardInfo}>
                  <p style={s.wName}>Francisco Gerimundo</p>
                  <p style={s.wType}>Pintor</p>
                </div>
              </div>
              <div style={s.divider} />
              <p style={s.desc}>{h.description || '1x retoque de pintura'}</p>
              <div style={s.actions}>
                <button style={s.btnGreen}>Avaliar</button>
                <button
                  style={s.btnOutline}
                  onClick={() => navigate('/chat', {
                    state: { hire: h, worker: { id: h.workerId, name: 'Francisco Gerimundo', serviceTypes: ['Pintor'] } }
                  })}
                >
                  Entrar em contato
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ height: 80 }} />
    </div>
  )
}

const s = {
  page: { background: '#fbfbfb', minHeight: '100vh' },
  header: { padding: '50px 30px 10px' },
  title: { fontSize: 12, fontWeight: 'bold', color: '#38b31f' },
  list: { padding: '10px 30px 0' },
  item: { marginBottom: 20 },
  date: { fontSize: 12, color: '#000', marginBottom: 6 },
  card: {
    border: '0.5px solid rgba(60,60,60,0.5)',
    borderRadius: 5, padding: 10, background: '#fbfbfb',
    display: 'flex', flexDirection: 'column', gap: 10,
  },
  cardTop: { display: 'flex', alignItems: 'center', gap: 10 },
  cardInfo: {},
  wName: { fontWeight: '600', fontSize: 12, color: '#000' },
  wType: { fontSize: 12, color: '#3c3c3c' },
  divider: { height: 0, borderBottom: '0.5px solid rgba(60,60,60,0.5)' },
  desc: { fontSize: 12, color: '#3c3c3c' },
  actions: { display: 'flex', gap: 10, justifyContent: 'flex-end' },
  btnGreen: {
    background: '#38b31f', color: '#fff',
    borderRadius: 3, padding: '7px 7px',
    fontWeight: 500, fontSize: 11, border: 'none', cursor: 'pointer',
  },
  btnOutline: {
    border: '0.7px solid #3c3c3c', borderRadius: 3,
    padding: '7px 7px', fontSize: 11,
    background: 'none', cursor: 'pointer', color: '#3c3c3c',
  },
  empty: { textAlign: 'center', padding: '60px 20px' },
  emptyText: { color: '#aaa', fontSize: 13 },
}
