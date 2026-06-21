import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
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


const fmtBRL = (n) => Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function NegotiationBanner({ hire, proposals, isWorkerView, user, onAccept, onCounter, onCancel }) {
  const [showInput, setShowInput] = useState(false)
  const [counterVal, setCounterVal] = useState('')

  const latest = proposals.length > 0 ? proposals[proposals.length - 1] : null
  const isMyTurn = latest ? latest.authorId !== user.id : false

  const fmtCounter = (v) => {
    const digits = v.replace(/\D/g, '')
    if (!digits) return ''
    return (parseInt(digits, 10) / 100).toFixed(2).replace('.', ',')
  }

  const handleConfirmCounter = () => {
    const val = parseFloat((counterVal || '0').replace(',', '.'))
    if (val <= 0) { toast.error('Informe um valor válido'); return }
    onCounter(val)
    setShowInput(false)
    setCounterVal('')
  }

  if (hire?.status === 'completed') return null

  if (hire?.status === 'cancelled') {
    return (
      <div style={bn.cancelled}>
        <p style={bn.cancelledText}>Contratação cancelada</p>
      </div>
    )
  }

  if (hire?.status === 'accepted') {
    return (
      <div style={bn.accepted}>
        <p style={bn.acceptedText}>
          Proposta aceita — R$ {fmtBRL(latest?.amount ?? 0)}
        </p>
        {!isWorkerView && (
          <button style={bn.payBtn} onClick={() => onAccept()}>Pagar</button>
        )}
        {isWorkerView && (
          <p style={bn.waitingPay}>Aguardando pagamento</p>
        )}
      </div>
    )
  }

  if (!latest) return null

  if (!isMyTurn) {
    return (
      <div style={bn.waiting}>
        <p style={bn.waitingText}>Aguardando resposta — sua proposta: R$ {fmtBRL(latest.amount)}</p>
      </div>
    )
  }

  if (showInput) {
    return (
      <div style={bn.inputBanner}>
        <span style={bn.inputLabel}>Seu valor:</span>
        <div style={bn.inputRow}>
          <span style={bn.inputCurrency}>R$</span>
          <input
            style={bn.inputField}
            value={counterVal}
            onChange={e => setCounterVal(fmtCounter(e.target.value))}
            placeholder="0,00"
            inputMode="numeric"
            autoFocus
          />
        </div>
        <button style={bn.confirmBtn} onClick={handleConfirmCounter}>Confirmar</button>
        <button style={bn.cancelInputBtn} onClick={() => { setShowInput(false); setCounterVal('') }}>✕</button>
      </div>
    )
  }

  return (
    <div style={bn.active}>
      <p style={bn.proposalText}>Proposta: R$ {fmtBRL(latest.amount)}</p>
      <div style={bn.actions}>
        <button style={bn.acceptBtn} onClick={onAccept}>Aceitar</button>
        <button style={bn.counterBtn} onClick={() => setShowInput(true)}>Contra-proposta</button>
        {!isWorkerView && (
          <button style={bn.cancelBtn} onClick={onCancel}>Cancelar</button>
        )}
      </div>
    </div>
  )
}

const bn = {
  active: {
    background: '#f4faf2', borderBottom: '1px solid rgba(56,179,31,0.25)',
    padding: '10px 20px',
  },
  proposalText: { fontSize: 13, fontWeight: '600', color: '#252525', margin: '0 0 8px' },
  actions: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  acceptBtn: {
    background: '#38b31f', color: '#fff', border: 'none', borderRadius: 8,
    padding: '7px 14px', fontSize: 12, fontWeight: '600', cursor: 'pointer',
  },
  counterBtn: {
    background: 'none', color: '#38b31f', border: '1px solid #38b31f', borderRadius: 8,
    padding: '7px 14px', fontSize: 12, fontWeight: '600', cursor: 'pointer',
  },
  cancelBtn: {
    background: 'none', color: '#e53935', border: '1px solid #e53935', borderRadius: 8,
    padding: '7px 14px', fontSize: 12, fontWeight: '600', cursor: 'pointer',
  },
  waiting: {
    background: '#f8f8f8', borderBottom: '1px solid rgba(60,60,60,0.1)',
    padding: '10px 20px',
  },
  waitingText: { fontSize: 12, color: '#888', margin: 0 },
  accepted: {
    background: '#f4faf2', borderBottom: '1px solid rgba(56,179,31,0.25)',
    padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  acceptedText: { fontSize: 13, fontWeight: '600', color: '#38b31f', margin: 0 },
  payBtn: {
    background: '#38b31f', color: '#fff', border: 'none', borderRadius: 8,
    padding: '7px 16px', fontSize: 13, fontWeight: '700', cursor: 'pointer',
  },
  waitingPay: { fontSize: 11, color: '#888', margin: 0 },
  cancelled: {
    background: '#fafafa', borderBottom: '1px solid rgba(60,60,60,0.1)',
    padding: '10px 20px',
  },
  cancelledText: { fontSize: 12, color: '#aaa', margin: 0 },
  inputBanner: {
    background: '#f4faf2', borderBottom: '1px solid rgba(56,179,31,0.25)',
    padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 8,
  },
  inputLabel: { fontSize: 12, fontWeight: '600', color: '#252525' },
  inputRow: {
    display: 'flex', alignItems: 'center',
    border: '1px solid rgba(56,179,31,0.5)', borderRadius: 8,
    overflow: 'hidden', background: '#fff',
  },
  inputCurrency: { padding: '6px 8px', fontSize: 13, fontWeight: '600', color: '#38b31f', background: '#f4faf2' },
  inputField: {
    border: 'none', padding: '6px 8px', fontSize: 15, fontWeight: '700',
    color: '#252525', outline: 'none', width: 90, background: 'transparent',
  },
  confirmBtn: {
    background: '#38b31f', color: '#fff', border: 'none', borderRadius: 8,
    padding: '7px 14px', fontSize: 12, fontWeight: '600', cursor: 'pointer',
  },
  cancelInputBtn: {
    background: 'none', border: 'none', color: '#888', fontSize: 16, cursor: 'pointer', padding: 4,
  },
}

export default function ChatPage() {
  const { state } = useLocation()
  const { worker, client, isWorkerView } = state || {}
  const [hire, setHire] = useState(state?.hire || null)
  const { user } = useAuth()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [proposals, setProposals] = useState([])
  const [text, setText] = useState('')
  const bottomRef = useRef()

  useEffect(() => { if (hire?.id) loadAll() }, [hire?.id])

  useEffect(() => {
    if (!hire?.id) return
    const interval = setInterval(loadAll, 3000)
    return () => clearInterval(interval)
  }, [hire?.id])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const loadAll = async () => {
    if (!hire?.id) return
    await Promise.all([loadMessages(), loadProposals()])
  }

  const loadMessages = async () => {
    try {
      const { data } = await messageApi.list(hire.id, user.id)
      setMessages(data.data?.messages || [])
    } catch {
      setMessages([])
    }
  }

  const loadProposals = async () => {
    try {
      const { data } = await hireApi.getProposals(hire.id)
      setProposals(data.data?.proposals || [])
    } catch {}
  }

  const send = async (e) => {
    e.preventDefault()
    if (!hire) return

    if (text.trim()) {
      const content = text.trim()
      setText('')
      setMessages(prev => [...prev, { id: `tmp-${Date.now()}`, senderId: user.id, content, createdAt: new Date().toISOString() }])
      try {
        await messageApi.send(hire.id, { senderId: user.id, content })
        await loadMessages()
      } catch (err) {
        const msg = err?.response?.data?.error
        toast.error(typeof msg === 'string' ? msg : 'Erro ao enviar mensagem')
      }
    }
  }

  const handleAccept = async () => {
    const latest = proposals[proposals.length - 1]
    if (!latest) return
    if (hire?.status === 'accepted') {
      navigate('/payment', { state: { hire, worker, agreedAmount: latest.amount } })
      return
    }
    try {
      const { data } = await hireApi.acceptProposal(hire.id, { acceptorId: user.id })
      setHire(prev => ({ ...prev, status: 'accepted' }))
      const agreedAmount = data.data?.agreedAmount ?? latest.amount
      if (!isWorkerView) {
        navigate('/payment', { state: { hire: { ...hire, status: 'accepted' }, worker, agreedAmount } })
      }
    } catch (err) {
      const msg = err?.response?.data?.error
      toast.error(typeof msg === 'string' ? msg : 'Erro ao aceitar proposta')
    }
  }

  const handleCounter = async (amount) => {
    try {
      await hireApi.submitProposal(hire.id, { authorId: user.id, amount })
      await loadProposals()
    } catch (err) {
      const msg = err?.response?.data?.error
      toast.error(typeof msg === 'string' ? msg : 'Erro ao enviar contra-proposta')
    }
  }

  const handleCancel = async () => {
    try {
      await hireApi.updateStatus(hire.id, 'cancelled')
      setHire(prev => ({ ...prev, status: 'cancelled' }))
    } catch {}
  }

  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })

  return (
    <div style={s.page}>
      <div style={s.header}>
        <button style={s.back} onClick={() => navigate(-1)}>‹</button>
        <WorkerAvatar />
        <div style={s.workerInfo}>
          {isWorkerView ? (
            <>
              <p style={s.wName}>{client?.name || 'Cliente'}</p>
              <p style={s.wType}>Solicitante</p>
            </>
          ) : (
            <>
              <p style={s.wName}>{worker?.name || 'Profissional'}</p>
              <p style={s.wType}>{worker?.serviceTypes?.[0] || 'Profissional'}</p>
            </>
          )}
        </div>
      </div>

      <NegotiationBanner
        hire={hire}
        proposals={proposals}
        isWorkerView={isWorkerView}
        user={user}
        onAccept={handleAccept}
        onCounter={handleCounter}
        onCancel={handleCancel}
      />

      <div style={s.messages}>
        <p style={s.dateSep}>{today}</p>

        <div style={s.notice}>
          <p style={s.noticeTitle}>Mensagem automática</p>
          <p style={s.noticeBody}>
            Não compartilhe dados pessoais ou bancários. Use o chat apenas para assuntos do serviço, com respeito e dentro das diretrizes da empresa.
          </p>
        </div>

        {isWorkerView && hire?.description && (
          <div style={s.requestCard}>
            <p style={s.requestTitle}>Solicitação do cliente</p>
            <p style={s.requestBody}>{hire.description}</p>
          </div>
        )}

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
                  <p style={{ color: isMe ? '#fff' : '#1a1a1a', fontSize: 12, margin: 0, textAlign: 'left' }}>{m.content}</p>
                </div>
              )}
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {hire?.status === 'cancelled' ? (
        <div style={s.closedBar}>
          <p style={s.closedText}>Esta contratação foi cancelada</p>
        </div>
      ) : (
      <form style={s.inputRow} onSubmit={send}>
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
      )}
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
  messages: { flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column' },
  dateSep: { textAlign: 'center', fontSize: 11, color: '#3c3c3c', marginBottom: 14 },
  notice: { border: '1px solid rgba(60,60,60,0.4)', borderRadius: 8, padding: '12px 12px', marginBottom: 16, textAlign: 'center' },
  noticeTitle: { fontSize: 9, color: '#252525', fontWeight: '700', margin: '0 0 6px' },
  noticeBody: { fontSize: 11, color: '#444', lineHeight: 1.5, margin: 0 },
  requestCard: { border: '1px solid rgba(56,179,31,0.3)', borderRadius: 8, padding: '12px', marginBottom: 16, background: '#f4faf2' },
  requestTitle: { fontSize: 9, color: '#38b31f', fontWeight: '700', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: 0.5 },
  requestBody: { fontSize: 12, color: '#252525', lineHeight: 1.5, margin: 0 },
  bubble: { maxWidth: '75%', padding: '10px 14px', borderRadius: 16 },
  bubbleMe: { background: '#38b31f' },
  bubbleThem: { background: '#f0f0f0' },
  inputRow: { display: 'flex', alignItems: 'center', padding: '10px 16px 16px', gap: 8, background: '#fbfbfb', borderTop: '1px solid rgba(60,60,60,0.1)', flexShrink: 0 },
  input: { flex: 1, border: '1px solid rgba(60,60,60,0.4)', borderRadius: 22, padding: '9px 16px', fontSize: 13, background: '#fff', color: '#252525', outline: 'none' },
  sendBtn: { background: '#38b31f', border: 'none', borderRadius: 24, padding: '9px 13px', cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 },
  closedBar: { padding: '14px 20px', borderTop: '1px solid rgba(60,60,60,0.1)', background: '#f8f8f8', flexShrink: 0, textAlign: 'center' },
  closedText: { fontSize: 12, color: '#aaa', margin: 0 },
}
