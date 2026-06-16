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
    width: 49, height: 48,
    background: '#38b31f',
    borderRadius: 90,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  }
}

export default function ChatPage() {
  const { state } = useLocation()
  const { worker, hire } = state || {}
  const { user } = useAuth()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const bottomRef = useRef()

  useEffect(() => { if (hire) load() }, [hire])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const load = async () => {
    try {
      const { data } = await messageApi.list(hire.id, user.id)
      setMessages(data.data?.messages || [])
    } catch {}
  }

  const send = async (e) => {
    e.preventDefault()
    if (!text.trim() || !hire) return
    const content = text.trim(); setText('')
    try {
      await messageApi.send(hire.id, { senderId: user.id, content })
      load()
    } catch {}
  }

  const confirm = async () => {
    try {
      await hireApi.updateStatus(hire.id, 'accepted')
      navigate('/payment', { state: { hire, worker } })
    } catch (e) {
      alert(e.response?.data?.error || 'Erro ao confirmar')
    }
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
              <div style={{ ...s.bubble, ...(isMe ? s.bubbleMe : s.bubbleThem) }}>
                <p style={{ color: isMe ? '#fff' : '#1a1a1a', fontSize: 12 }}>{m.content}</p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form style={s.inputRow} onSubmit={send}>
        <div style={s.attachIcon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#3c3c3c" style={{ transform: 'rotate(-45deg)' }}>
            <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
          </svg>
        </div>
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
    display: 'flex', alignItems: 'center', padding: '44px 30px 12px',
    borderBottom: '1px solid rgba(60,60,60,0.15)', gap: 8, background: '#fbfbfb',
  },
  back: { background: 'none', border: 'none', fontSize: 30, cursor: 'pointer', color: '#252525', padding: 0, lineHeight: 1 },
  workerInfo: { flex: 1 },
  wName: { fontWeight: '600', fontSize: 12, color: '#000', lineHeight: 1.3 },
  wType: { fontSize: 12, color: '#3c3c3c', lineHeight: 1.3 },
  confirmBtn: {
    border: '1.5px solid #38b31f', borderRadius: 13,
    padding: '6px 10px', color: '#fff', fontSize: 13,
    fontWeight: 500, background: '#38b31f', cursor: 'pointer', flexShrink: 0,
  },
  messages: { flex: 1, overflowY: 'auto', padding: '16px 30px' },
  dateSep: { textAlign: 'center', fontSize: 12, color: '#3c3c3c', marginBottom: 14 },
  notice: {
    border: '1px solid rgba(60,60,60,0.5)', borderRadius: 5,
    padding: '15px 10px 10px', marginBottom: 16, textAlign: 'center',
  },
  noticeTitle: { fontSize: 9, color: '#252525', fontWeight: '600', marginBottom: 6 },
  noticeBody: { fontSize: 12, color: '#000', lineHeight: 1.5 },
  bubble: { maxWidth: '75%', padding: '10px 14px', borderRadius: 16 },
  bubbleMe: { background: '#38b31f' },
  bubbleThem: { background: '#f0f0f0' },
  inputRow: {
    display: 'flex', alignItems: 'center',
    padding: '10px 18px 20px', gap: 8, background: '#fbfbfb',
    borderTop: '1px solid rgba(60,60,60,0.1)',
  },
  attachIcon: { flexShrink: 0, display: 'flex', alignItems: 'center' },
  input: {
    flex: 1, border: '1px solid rgba(60,60,60,0.5)',
    borderRadius: 21, padding: '8px 14px',
    fontSize: 12, background: 'transparent', color: '#252525',
  },
  sendBtn: {
    background: '#38b31f', border: 'none', borderRadius: 24,
    padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center',
  },
}
