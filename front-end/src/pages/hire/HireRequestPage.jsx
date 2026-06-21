// front-end/src/pages/hire/HireRequestPage.jsx
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { hireApi } from '../../api/api'
import { useAuth } from '../../context/AuthContext'

export default function HireRequestPage() {
  const { state } = useLocation()
  const { worker } = state || {}
  const { user } = useAuth()
  const navigate = useNavigate()

  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const fmtAmount = (v) => {
    const digits = v.replace(/\D/g, '')
    if (!digits) return ''
    const num = (parseInt(digits, 10) / 100).toFixed(2)
    return num.replace('.', ',')
  }

  const parsedAmount = parseFloat((amount || '0').replace(',', '.'))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (description.trim().length < 10) {
      toast.error('Descreva o serviço com pelo menos 10 caracteres')
      return
    }
    if (parsedAmount <= 0) {
      toast.error('Informe um valor válido')
      return
    }
    setLoading(true)
    try {
      const serviceTypeId = worker?.serviceTypeIds?.[0] ?? ''
      const { data } = await hireApi.create({
        clientId: user.id,
        workerId: worker.id,
        serviceTypeId,
        description: description.trim(),
        amount: parsedAmount,
      })
      navigate('/chat', { state: { worker, hire: data.data, isWorkerView: false } })
    } catch (err) {
      const msg = err?.response?.data?.error
      toast.error(typeof msg === 'string' ? msg : 'Erro ao criar solicitação. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (!worker) return (
    <div style={{ padding: 40, textAlign: 'center', color: '#aaa' }}>
      Profissional não encontrado
    </div>
  )

  return (
    <div style={s.page}>
      <div style={s.header}>
        <button style={s.back} onClick={() => navigate(-1)}>‹</button>
        <p style={s.title}>Solicitar serviço</p>
      </div>

      <div style={s.workerRow}>
        <div style={s.avatar}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
        <div>
          <p style={s.workerName}>{worker.name}</p>
          <p style={s.workerType}>{worker.serviceTypes?.[0] || 'Profissional'}</p>
        </div>
      </div>

      <form style={s.form} onSubmit={handleSubmit}>
        <label style={s.label}>Descreva o serviço</label>
        <textarea
          style={s.textarea}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Ex: Preciso instalar 3 tomadas e trocar 2 interruptores no quarto..."
          rows={4}
        />

        <label style={s.label}>Seu valor proposto</label>
        <div style={s.amountRow}>
          <span style={s.currency}>R$</span>
          <input
            style={s.amountInput}
            value={amount}
            onChange={e => setAmount(fmtAmount(e.target.value))}
            placeholder="0,00"
            inputMode="numeric"
          />
        </div>
        <p style={s.hint}>O profissional pode aceitar ou fazer uma contra-proposta.</p>

        <button style={{ ...s.btn, ...(loading ? s.btnDisabled : {}) }} type="submit" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar solicitação'}
        </button>
      </form>
    </div>
  )
}

const s = {
  page: { background: '#fbfbfb', minHeight: '100vh' },
  header: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '48px 20px 16px', borderBottom: '0.5px solid rgba(60,60,60,0.12)',
  },
  back: { background: 'none', border: 'none', fontSize: 30, cursor: 'pointer', color: '#252525', padding: 0, lineHeight: 1 },
  title: { fontSize: 17, fontWeight: '600', color: '#252525', margin: 0 },
  workerRow: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '16px 24px', borderBottom: '0.5px solid rgba(60,60,60,0.12)',
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22, background: '#38b31f',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  workerName: { fontWeight: '600', fontSize: 14, color: '#252525', margin: 0 },
  workerType: { fontSize: 12, color: '#3c3c3c', margin: 0 },
  form: { padding: '24px', display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 13, fontWeight: '600', color: '#252525', marginBottom: 4 },
  textarea: {
    border: '0.5px solid rgba(60,60,60,0.4)', borderRadius: 8,
    padding: '10px 12px', fontSize: 13, color: '#252525',
    background: '#fff', outline: 'none', resize: 'vertical', fontFamily: 'inherit',
    marginBottom: 12,
  },
  amountRow: {
    display: 'flex', alignItems: 'center',
    border: '0.5px solid rgba(60,60,60,0.4)', borderRadius: 8,
    background: '#fff', overflow: 'hidden', marginBottom: 4,
  },
  currency: {
    padding: '10px 12px', fontSize: 14, fontWeight: '600',
    color: '#38b31f', borderRight: '0.5px solid rgba(60,60,60,0.2)', background: '#f4faf2',
  },
  amountInput: {
    flex: 1, border: 'none', padding: '10px 12px',
    fontSize: 18, fontWeight: '700', color: '#252525',
    outline: 'none', background: 'transparent',
  },
  hint: { fontSize: 11, color: '#888', margin: '0 0 20px', lineHeight: 1.4 },
  btn: {
    background: '#38b31f', color: '#fff', border: 'none',
    borderRadius: 10, padding: '14px', fontSize: 15, fontWeight: '700',
    cursor: 'pointer', boxShadow: '0 4px 14px rgba(56,179,31,0.3)',
  },
  btnDisabled: { opacity: 0.7, cursor: 'default' },
}
