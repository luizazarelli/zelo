import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { hireApi } from '../../api/api'
import { useAuth } from '../../context/AuthContext'

const extractStr = (raw, fallback) => {
  if (typeof raw === 'string') return raw || fallback
  if (raw?._props?.name) return raw._props.name
  if (typeof raw?.name === 'string') return raw.name || fallback
  return fallback
}

const STATUS_LABEL = { negotiating: 'Em negociação', accepted: 'Aceito', completed: 'Concluído', cancelled: 'Cancelado' }
const STATUS_COLOR = { negotiating: '#ff9800', accepted: '#2196f3', completed: '#38b31f', cancelled: '#9e9e9e' }
const STATUS_ORDER = { negotiating: 0, accepted: 1, completed: 2, cancelled: 3 }

const fmt = (d) => {
  if (!d) return ''
  const date = new Date(d)
  const now = new Date()
  const diffDays = Math.floor((now - date) / 86400000)
  if (diffDays === 0) return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  if (diffDays === 1) return 'Ontem'
  if (diffDays < 7) return date.toLocaleDateString('pt-BR', { weekday: 'short' })
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function InitialAvatar({ name }) {
  const safeName = extractStr(name, 'C')
  const initial = safeName[0].toUpperCase()
  return (
    <div style={av.wrap}>
      <span style={av.letter}>{initial}</span>
    </div>
  )
}

const av = {
  wrap: {
    width: 48, height: 48, borderRadius: 24, background: '#38b31f', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  letter: { color: '#fff', fontSize: 20, fontWeight: '700', lineHeight: 1 },
}

export default function WorkerHiresPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [hires, setHires] = useState([])

  useEffect(() => {
    hireApi.list(user.id, 'worker')
      .then(r => {
        const list = r.data.data?.hires || []
        const sorted = [...list].sort((a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9))
        setHires(sorted)
      })
      .catch(() => setHires([]))
  }, [user.id])

  const openChat = (hire) => {
    navigate('/chat', {
      state: {
        hire,
        client: { id: hire.clientId, name: hire.clientName },
        isWorkerView: true,
      },
    })
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <p style={s.title}>Solicitações</p>
        <p style={s.sub}>{hires.length} {hires.length === 1 ? 'solicitação' : 'solicitações'}</p>
      </div>

      <div style={s.list}>
        {hires.length === 0 && (
          <div style={s.empty}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="rgba(60,60,60,0.2)" style={{ marginBottom: 14 }}>
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
            <p style={s.emptyTitle}>Nenhuma solicitação recebida ainda</p>
            <p style={s.emptyHint}>Quando clientes solicitarem seus serviços, aparecerá aqui.</p>
          </div>
        )}

        {hires.map(hire => (
          <button key={hire.id} style={s.item} onClick={() => openChat(hire)}>
            <InitialAvatar name={hire.clientName} />
            <div style={s.info}>
              <div style={s.row}>
                <p style={s.clientName}>{extractStr(hire.clientName, 'Cliente')}</p>
                <p style={s.date}>{fmt(hire.createdAt)}</p>
              </div>
              <div style={s.row}>
                <p style={s.desc}>{hire.description || 'Solicitação de orçamento'}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  {hire.latestProposalAmount != null && (
                    <span style={s.amount}>
                      R$ {Number(hire.latestProposalAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  )}
                  <span style={{ ...s.badge, background: STATUS_COLOR[hire.status] || '#aaa' }}>
                    {STATUS_LABEL[hire.status] || hire.status}
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
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
  list: { padding: '10px 0 0' },

  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', textAlign: 'center' },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: '#3c3c3c', margin: '0 0 6px' },
  emptyHint: { fontSize: 12, color: '#aaa', margin: 0, lineHeight: 1.5 },

  item: {
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '14px 24px', width: '100%', background: 'none', border: 'none',
    borderBottom: '0.5px solid rgba(60,60,60,0.12)', cursor: 'pointer', textAlign: 'left',
  },
  info: { flex: 1, minWidth: 0 },
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 3 },
  clientName: { fontWeight: '600', fontSize: 14, color: '#000', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  date: { fontSize: 11, color: '#aaa', flexShrink: 0, margin: 0 },
  desc: {
    fontSize: 12, color: '#888', margin: 0,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
  },
  badge: {
    fontSize: 9, fontWeight: '700', color: '#fff',
    borderRadius: 8, padding: '2px 7px', flexShrink: 0,
  },
  amount: { fontSize: 11, fontWeight: '700', color: '#252525' },
}
