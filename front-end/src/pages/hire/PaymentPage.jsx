import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { paymentApi } from '../../api/api'

const METHODS = [
  { id: 'pix', label: 'Pix', icon: (
    <svg width="16" height="16" viewBox="0 0 32 32" fill="#32bcad">
      <path d="M16 0C7.163 0 0 7.163 0 16s7.163 16 16 16 16-7.163 16-16S24.837 0 16 0zm7.16 18.38l-2.93 2.93a.83.83 0 01-.59.25.83.83 0 01-.59-.25l-2.07-2.07c-.33-.33-.87-.33-1.2 0l-2.07 2.07a.83.83 0 01-.59.25.83.83 0 01-.59-.25l-2.93-2.93a.83.83 0 010-1.18l2.07-2.07c.33-.33.33-.87 0-1.2l-2.07-2.07a.83.83 0 010-1.18l2.93-2.93a.83.83 0 011.18 0l2.07 2.07c.33.33.87.33 1.2 0l2.07-2.07a.83.83 0 011.18 0l2.93 2.93a.83.83 0 010 1.18l-2.07 2.07c-.33.33-.33.87 0 1.2l2.07 2.07a.83.83 0 010 1.18z"/>
    </svg>
  )},
  { id: 'credit', label: 'Cartão de crédito', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#3c3c3c">
      <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
    </svg>
  )},
  { id: 'debit', label: 'Cartão de débito', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#3c3c3c">
      <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
    </svg>
  )},
]

export default function PaymentPage() {
  const { state } = useLocation()
  const { hire } = state || {}
  const navigate = useNavigate()
  const [selected, setSelected] = useState('pix')
  const [loading, setLoading] = useState(false)

  const handlePay = async () => {
    setLoading(true)
    try {
      await paymentApi.process(hire.id, 75.99)
      alert('Pagamento confirmado! Serviço contratado com sucesso.')
      navigate('/')
    } catch (e) {
      alert(e.response?.data?.error || 'Erro ao processar pagamento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.topBar}>
        <button style={s.back} onClick={() => navigate(-1)}>‹</button>
      </div>

      <div style={s.addressRow}>
        <div style={s.addrIcon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#252525">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <p style={s.addrLabel}>Endereço da solicitação</p>
          <p style={s.addrValue}>Rua dos bobos, n 0</p>
        </div>
        <button style={s.changeBtn}>Trocar</button>
      </div>

      <div style={s.card}>
        <p style={s.cardTitle}>Confirmação da solicitação</p>
        <div style={s.detail}>
          <p style={s.detailBold}>Serviço de elétrica</p>
          <p style={s.detailGray}>Detalhes da solicitação</p>
        </div>
        <div style={s.detail}>
          <p style={s.detailBold}>Hoje, 13:30 - 14:00</p>
          <p style={s.detailGray}>Detalhes da solicitação</p>
        </div>
        <div style={s.detail}>
          <p style={s.detailBold}>Hoje, 13:30 - 14:00</p>
          <p style={s.detailGray}>Detalhes da solicitação</p>
        </div>
        <p style={s.summaryTitle}>Resumo dos valores</p>
        <div style={s.summaryRows}>
          <div style={s.summaryRow}><span>Subtotal</span><span>R$ 70,00</span></div>
          <div style={s.summaryRow}><span>Frete</span><span>R$ 5,00</span></div>
          <div style={s.summaryRow}><span>Taxa de Serviço</span><span>R$ 0,99</span></div>
        </div>
        <div style={s.totalRow}>
          <span style={s.totalLabel}>Total a pagar</span>
          <span style={s.totalLabel}>R$ 75,99</span>
        </div>
      </div>

      <div style={s.paySection}>
        <div style={s.payHeader}>
          <div style={s.payHeaderIcon}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="#252525">
              <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
            </svg>
          </div>
          <p style={s.payTitle}>Forma de pagamento</p>
        </div>

        {METHODS.map(m => (
          <div
            key={m.id}
            style={{ ...s.method, ...(selected === m.id ? s.methodSelected : {}) }}
            onClick={() => setSelected(m.id)}
          >
            <span style={s.methodIcon}>{m.icon}</span>
            <span style={{ ...s.methodText, ...(selected === m.id ? { color: '#38b31f', fontWeight: '600' } : {}) }}>
              {m.label}
            </span>
          </div>
        ))}
      </div>

      <button style={s.payBtn} onClick={handlePay} disabled={loading}>
        {loading ? 'Processando...' : 'Confirmar pagamento'}
      </button>

      <div style={{ height: 80 }} />
    </div>
  )
}

const s = {
  page: { background: '#fbfbfb', minHeight: '100vh' },
  topBar: { padding: '44px 30px 0' },
  back: { background: 'none', border: 'none', fontSize: 30, cursor: 'pointer', color: '#252525', padding: 0, lineHeight: 1 },
  addressRow: {
    display: 'flex', alignItems: 'center',
    padding: '16px 32px', gap: 4, background: '#fbfbfb',
  },
  addrIcon: { marginRight: 4, flexShrink: 0 },
  addrLabel: { fontSize: 12, fontWeight: '600', color: '#000' },
  addrValue: { fontSize: 12, color: '#3c3c3c' },
  changeBtn: {
    background: '#38b31f', color: '#fff',
    borderRadius: 13, padding: '6px 10px',
    fontWeight: 500, fontSize: 13, border: 'none', cursor: 'pointer', flexShrink: 0,
  },
  card: {
    margin: '8px 30px', border: '1px solid rgba(60,60,60,0.5)',
    borderRadius: 5, padding: '15px 10px 10px', background: '#fbfbfb',
  },
  cardTitle: { textAlign: 'center', fontSize: 12, color: '#252525', marginBottom: 14 },
  detail: { marginBottom: 8 },
  detailBold: { fontWeight: '600', fontSize: 12, color: '#000' },
  detailGray: { fontSize: 12, color: '#3c3c3c' },
  summaryTitle: { fontWeight: '600', fontSize: 13, color: '#000', marginTop: 8, marginBottom: 4 },
  summaryRows: {},
  summaryRow: {
    display: 'flex', justifyContent: 'space-between',
    fontSize: 11, color: '#3c3c3c', marginBottom: 2,
  },
  totalRow: { display: 'flex', justifyContent: 'space-between', marginTop: 8 },
  totalLabel: { fontWeight: '600', fontSize: 12, color: '#000' },
  paySection: { padding: '20px 30px 0' },
  payHeader: { display: 'flex', alignItems: 'center', gap: 1, marginBottom: 16 },
  payHeaderIcon: { marginRight: 0 },
  payTitle: { fontSize: 16, fontWeight: '600', color: '#000' },
  method: {
    display: 'flex', alignItems: 'center', gap: 10,
    border: '1px solid rgba(60,60,60,0.5)',
    borderRadius: 5, padding: '10px 35px',
    marginBottom: 8, cursor: 'pointer', background: '#fbfbfb',
  },
  methodSelected: { borderColor: '#38b31f', background: '#f0fff0' },
  methodIcon: { flexShrink: 0 },
  methodText: { fontSize: 12, color: '#000' },
  payBtn: {
    display: 'block', width: 'calc(100% - 60px)',
    margin: '20px 30px 0',
    background: '#38b31f', color: '#fff',
    borderRadius: 5, padding: 10,
    fontSize: 16, fontWeight: 500, border: 'none', cursor: 'pointer',
  },
}
