import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { hireApi } from '../../api/api'
import { useAuth } from '../../context/AuthContext'

const norm = (s = '') => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

const SERVICE_PHOTOS = {
  eletrica:    '/imgs/worker.jpg',
  pintura:     '/imgs/pintura.jpg',
  construcao:  '/imgs/construcao.jpg',
  encanamento: '/imgs/worker-cover.jpg',
  jardinagem:  '/imgs/banner.jpg',
  marcenaria:  '/imgs/construcao.jpg',
}

const getPhoto = (name = '') => SERVICE_PHOTOS[norm(name)] || '/imgs/worker.jpg'

const STATUS_LABEL = { paid: 'Pago', accepted: 'Aceito', pending: 'Pendente', completed: 'Concluído' }
const STATUS_COLOR = { paid: '#38b31f', accepted: '#2196f3', pending: '#ff9800', completed: '#38b31f' }

export default function HireHistoryPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [hires, setHires] = useState([])

  useEffect(() => {
    hireApi.previous(user.id, 'client')
      .then(r => setHires(r.data.data?.hires || []))
      .catch(() => setHires([]))
  }, [])

  const fmt = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <p style={s.title}>Solicitações</p>
        <p style={s.sub}>{hires.length} {hires.length === 1 ? 'contratação' : 'contratações'}</p>
      </div>

      <div style={s.list}>
        {hires.length === 0 && (
          <div style={s.empty}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="rgba(60,60,60,0.2)" style={{ marginBottom: 14 }}>
              <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
            <p style={s.emptyTitle}>Nenhuma solicitação ainda</p>
            <p style={s.emptyHint}>Contrate um profissional para ver o histórico aqui.</p>
          </div>
        )}

        {hires.map(h => {
          const wName = h.worker?.name || h.workerName || 'Profissional'
          const wType = h.worker?.serviceTypes?.[0] || h.description?.replace('Serviço de ', '') || 'Serviço'
          const photo = getPhoto(wType)
          const status = h.status || 'pending'
          const workerObj = h.worker || { id: h.workerId, name: wName, serviceTypes: [wType] }
          return (
            <div key={h.id} style={s.item}>
              <p style={s.date}>{fmt(h.createdAt)}</p>
              <div style={s.card}>
                <div style={s.cardTop}>
                  <div style={s.avatar}>
                    <img src={photo} style={s.avatarImg} alt="" />
                  </div>
                  <div style={s.cardInfo}>
                    <p style={s.wName}>{wName}</p>
                    <p style={s.wType}>{wType}</p>
                  </div>
                  <span style={{ ...s.badge, background: STATUS_COLOR[status] || '#aaa' }}>
                    {STATUS_LABEL[status] || status}
                  </span>
                </div>
                <div style={s.divider} />
                <p style={s.desc}>{h.description || 'Solicitação de orçamento'}</p>
                <div style={s.actions}>
                  <button style={s.btnGreen}>Avaliar</button>
                  <button
                    style={s.btnOutline}
                    onClick={() => navigate('/chat', { state: { hire: h, worker: workerObj } })}
                  >
                    Entrar em contato
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div style={{ height: 90 }} />
    </div>
  )
}

const s = {
  page: { background: '#fbfbfb', minHeight: '100vh' },
  header: { padding: '50px 30px 6px' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#252525', margin: 0 },
  sub: { fontSize: 12, color: '#38b31f', margin: '4px 0 0' },
  list: { padding: '10px 30px 0' },

  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', textAlign: 'center' },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: '#3c3c3c', margin: '0 0 6px' },
  emptyHint: { fontSize: 12, color: '#aaa', margin: 0, lineHeight: 1.5 },

  item: { marginBottom: 22 },
  date: { fontSize: 11, color: '#888', marginBottom: 6, margin: '0 0 6px' },
  card: {
    border: '0.5px solid rgba(60,60,60,0.3)', borderRadius: 10,
    padding: '12px', background: '#fff',
    display: 'flex', flexDirection: 'column', gap: 10,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  cardTop: { display: 'flex', alignItems: 'center', gap: 10 },
  avatar: { width: 42, height: 42, borderRadius: 21, overflow: 'hidden', flexShrink: 0 },
  avatarImg: { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' },
  cardInfo: { flex: 1, minWidth: 0 },
  wName: { fontWeight: '600', fontSize: 13, color: '#000', margin: 0 },
  wType: { fontSize: 11, color: '#3c3c3c', margin: 0 },
  badge: {
    fontSize: 10, fontWeight: '700', color: '#fff',
    borderRadius: 10, padding: '3px 8px', flexShrink: 0,
  },
  divider: { height: 0, borderBottom: '0.5px solid rgba(60,60,60,0.15)' },
  desc: { fontSize: 12, color: '#3c3c3c', margin: 0 },
  actions: { display: 'flex', gap: 8, justifyContent: 'flex-end' },
  btnGreen: {
    background: '#38b31f', color: '#fff', borderRadius: 6,
    padding: '7px 14px', fontWeight: 600, fontSize: 11, border: 'none', cursor: 'pointer',
  },
  btnOutline: {
    border: '0.7px solid #3c3c3c', borderRadius: 6, padding: '7px 14px',
    fontSize: 11, background: 'none', cursor: 'pointer', color: '#3c3c3c',
  },
}
