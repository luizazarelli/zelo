import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { messageApi, hireApi } from '../../api/api'
import { useAuth } from '../../context/AuthContext'

function WorkerAvatar() {
  return (
    <div style={av.wrap}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>
    </div>
  )
}

const av = {
  wrap: {
    width: 49, height: 48, background: '#38b31f', borderRadius: 90,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  }
}

const chatKey = (hireId) => `zelo_chat_${hireId}`

const saveLocal = (hireId, msgs) => {
  try { localStorage.setItem(chatKey(hireId), JSON.stringify(msgs)) } catch {}
}
const readLocal = (hireId) => {
  try { return JSON.parse(localStorage.getItem(chatKey(hireId)) || '[]') } catch { return [] }
}

export default function ChatPage() {
  const { state } = useLocation()
  const { worker, hire } = state || {}
  const { user } = useAuth()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [pendingImg, setPendingImg] = useState(null)
  const bottomRef = useRef()
  const fileRef = useRef()

  useEffect(() => { if (hire) load() }, [hire])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const load = async () => {
    const saved = hire ? readLocal(hire.id) : []
    const savedImgs = saved.filter(m => m.img)
    try {
      const { data } = await messageApi.list(hire.id, user.id)
      const api = data.data?.messages || []
      const apiIds = new Set(api.map(m => m.id))
      const extraImgs = savedImgs.filter(m => !apiIds.has(m.id))
      setMessages([...api, ...extraImgs])
    } catch {
      setMessages(saved)
    }
  }

  const handleAttach = () => fileRef.current?.click()

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setPendingImg(ev.target.result)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const send = async (e) => {
    e.preventDefault()
    if (!hire) return

    if (pendingImg) {
      const msg = { id: `tmp-img-${Date.now()}`, senderId: user.id, img: pendingImg, createdAt: new Date().toISOString() }
      setMessages(prev => {
        const next = [...prev, msg]
        saveLocal(hire.id, next)
        return next
      })
      setPendingImg(null)
    }

    if (text.trim()) {
      const content = text.trim()
      setText('')
      const msg = { id: `tmp-${Date.now()}`, senderId: user.id, content, createdAt: new Date().toISOString() }
      setMessages(prev => {
        const next = [...prev, msg]
        saveLocal(hire.id, next)
        return next
      })
      try {
        await messageApi.send(hire.id, { senderId: user.id, content })
        load()
      } catch {}
    }
  }

  const confirm = async () => {
    try { await hireApi.updateStatus(hire.id, 'accepted') } catch {}
    navigate('/payment', { state: { hire, worker } })
  }

  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })

  return (
    <div style={s.page}>
      <div style={s.header}>
        <button style={s.back} onClick={() => navigate(-1)}>‹</button>
        <WorkerAvatar />
        <div style={s.workerInfo}>
          <p style={s.wName}>{worker?.name || 'Profissional'}</p>
          <p style={s.wType}>{worker?.serviceTypes?.[0] || 'Profissional'}</p>
        </div>
        <button style={s.confirmBtn} onClick={confirm}>Confirmar orçamento</button>
      </div>

      <div style={s.messages}>
        <p style={s.dateSep}>{today}</p>

        <div style={s.notice}>
          <p style={s.noticeTitle}>Mensagem automática</p>
          <p style={s.noticeBody}>
            Não compartilhe dados pessoais ou bancários. Use o chat apenas para assuntos do serviço, com respeito e dentro das diretrizes da empresa.
          </p>
        </div>

        {messages.map(m => {
          const isMe = m.senderId === user.id
          return (
            <div key={m.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
              {m.img ? (
                <div style={{ ...s.bubble, ...(isMe ? s.bubbleMe : s.bubbleThem), padding: 4 }}>
                  <img src={m.img} style={{ maxWidth: 200, maxHeight: 200, borderRadius: 10, display: 'block' }} alt="" />
                </div>
              ) : (
                <div style={{ ...s.bubble, ...(isMe ? s.bubbleMe : s.bubbleThem) }}>
                  <p style={{ color: isMe ? '#fff' : '#1a1a1a', fontSize: 12, margin: 0 }}>{m.content}</p>
                </div>
              )}
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {pendingImg && (
        <div style={s.pendingWrap}>
          <img src={pendingImg} style={s.pendingImg} alt="" />
          <span style={s.pendingLabel}>Pronto para enviar</span>
          <button style={s.removePending} onClick={() => setPendingImg(null)}>✕</button>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*,video/*,application/pdf" style={{ display: 'none' }} onChange={handleFile} />

      <form style={s.inputRow} onSubmit={send}>
        <button type="button" style={s.attachBtn} onClick={handleAttach} title="Anexar arquivo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#3c3c3c" style={{ transform: 'rotate(-45deg)' }}>
            <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
          </svg>
        </button>
        <input
          style={s.input}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Digite uma mensagem..."
        />
        <button style={s.sendBtn} type="submit">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </form>
    </div>
  )
}

const s = {
  page: { display: 'flex', flexDirection: 'column', height: '100vh', background: '#fbfbfb' },
  header: {
    display: 'flex', alignItems: 'center', padding: '44px 20px 12px',
    borderBottom: '1px solid rgba(60,60,60,0.15)', gap: 8, background: '#fbfbfb', flexShrink: 0,
  },
  back: { background: 'none', border: 'none', fontSize: 30, cursor: 'pointer', color: '#252525', padding: 0, lineHeight: 1 },
  workerInfo: { flex: 1, minWidth: 0 },
  wName: { fontWeight: '600', fontSize: 12, color: '#000', lineHeight: 1.3, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  wType: { fontSize: 11, color: '#3c3c3c', lineHeight: 1.3, margin: 0 },
  confirmBtn: {
    border: 'none', borderRadius: 13, padding: '7px 10px', color: '#fff', fontSize: 12,
    fontWeight: 600, background: '#38b31f', cursor: 'pointer', flexShrink: 0,
  },
  messages: { flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column' },
  dateSep: { textAlign: 'center', fontSize: 11, color: '#3c3c3c', marginBottom: 14 },
  notice: {
    border: '1px solid rgba(60,60,60,0.4)', borderRadius: 8,
    padding: '12px 12px', marginBottom: 16, textAlign: 'center',
  },
  noticeTitle: { fontSize: 9, color: '#252525', fontWeight: '700', margin: '0 0 6px' },
  noticeBody: { fontSize: 11, color: '#444', lineHeight: 1.5, margin: 0 },
  bubble: { maxWidth: '75%', padding: '10px 14px', borderRadius: 16 },
  bubbleMe: { background: '#38b31f' },
  bubbleThem: { background: '#f0f0f0' },
  pendingWrap: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '8px 18px', background: '#f0fff0',
    borderTop: '1px solid rgba(56,179,31,0.3)', flexShrink: 0,
  },
  pendingImg: { width: 48, height: 48, objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(56,179,31,0.4)' },
  pendingLabel: { flex: 1, fontSize: 11, color: '#38b31f', fontWeight: '600' },
  removePending: {
    background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: '50%', color: '#fff',
    fontSize: 10, width: 20, height: 20, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0,
  },
  inputRow: {
    display: 'flex', alignItems: 'center',
    padding: '10px 16px 16px', gap: 8, background: '#fbfbfb',
    borderTop: '1px solid rgba(60,60,60,0.1)', flexShrink: 0,
  },
  attachBtn: { background: 'none', border: 'none', padding: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 },
  input: {
    flex: 1, border: '1px solid rgba(60,60,60,0.4)',
    borderRadius: 22, padding: '9px 16px',
    fontSize: 13, background: '#fff', color: '#252525', outline: 'none',
  },
  sendBtn: {
    background: '#38b31f', border: 'none', borderRadius: 24,
    padding: '9px 13px', cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0,
  },
}
