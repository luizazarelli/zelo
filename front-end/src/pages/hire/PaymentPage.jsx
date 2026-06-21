import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { paymentApi } from '../../api/api'

const PIX_KEY = 'zeloapps@pix.com.br'

const QR_ROWS = [
  '111111101011010111111',
  '100000100110101000001',
  '101110100010101011101',
  '101110101001001011101',
  '101110100110101011101',
  '100000101001001000001',
  '111111101010101111111',
  '000000001100110000000',
  '110101110110101001011',
  '010110001001100100010',
  '101010111001010010101',
  '001001010100101100110',
  '110011011011011101011',
  '000000010010001000100',
  '111111101001010011011',
  '100000101100101000101',
  '101110100110010110100',
  '101110101001101010101',
  '101110100010100110010',
  '100000100101001001101',
  '111111100110110101011',
]

function PixQRCode() {
  const mods = QR_ROWS.map(r => r.split('').map(c => c === '1'))
  const S = 5, P = 6, total = 21 * S + P * 2
  return (
    <svg width={total} height={total} viewBox={`0 0 ${total} ${total}`}>
      <rect width={total} height={total} fill="white"/>
      {mods.map((row, r) =>
        row.map((on, c) => on ? (
          <rect key={`${r}-${c}`} x={P + c * S} y={P + r * S} width={S} height={S} fill="#000"/>
        ) : null)
      )}
    </svg>
  )
}

export default function PaymentPage() {
  const { state } = useLocation()
  const { hire, worker, agreedAmount } = state || {}
  const fmtAmount = agreedAmount
    ? Number(agreedAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '0,00'
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [copied, setCopied] = useState(false)

  const [address, setAddress] = useState('Rua dos Bobos, n 0, Centro')
  const [editAddr, setEditAddr] = useState(false)
  const [addrInput, setAddrInput] = useState('')

  const copyPix = () => {
    navigator.clipboard?.writeText(PIX_KEY).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handlePay = async () => {
    setLoading(true)
    const entry = {
      id: hire?.id || `demo-${Date.now()}`,
      worker,
      description: 'Serviço de ' + (worker?.serviceTypes?.[0] || 'serviço'),
      createdAt: new Date().toISOString(),
      status: 'paid',
    }
    const existing = JSON.parse(localStorage.getItem('zelo_hires') || '[]')
    localStorage.setItem('zelo_hires', JSON.stringify([entry, ...existing.filter(h => h.id !== entry.id)]))
    try { await paymentApi.process(hire?.id, agreedAmount || 0) } catch {}
    setLoading(false)
    setSuccess(true)
    setTimeout(() => navigate('/'), 2400)
  }

  if (success) return (
    <div style={s.successPage}>
      <div style={s.successCircle}>
        <svg width="56" height="56" viewBox="0 0 24 24" fill="#fff">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
      </div>
      <p style={s.successTitle}>Pagamento confirmado!</p>
      <p style={s.successSub}>Seu serviço foi contratado com sucesso. Você pode acompanhar pelo histórico de solicitações.</p>
    </div>
  )

  const serviceLabel = worker?.serviceTypes?.[0] || 'serviço'
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })

  return (
    <div style={s.page}>
      <div style={s.topBar}>
        <button style={s.back} onClick={() => navigate(-1)}>‹</button>
      </div>

      <div style={s.addrRow}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#252525" style={{ flexShrink: 0, marginTop: 1 }}>
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={s.addrLabel}>Endereço da solicitação</p>
          {editAddr ? (
            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
              <input
                style={s.addrInput}
                value={addrInput}
                onChange={e => setAddrInput(e.target.value)}
                placeholder="Rua, número, bairro..."
                autoFocus
              />
              <button style={s.addrOk} onClick={() => { if (addrInput.trim()) setAddress(addrInput.trim()); setEditAddr(false) }}>✓</button>
              <button style={s.addrX} onClick={() => setEditAddr(false)}>✕</button>
            </div>
          ) : (
            <p style={s.addrValue}>{address}</p>
          )}
        </div>
        {!editAddr && (
          <button style={s.changeBtn} onClick={() => { setAddrInput(address); setEditAddr(true) }}>Trocar</button>
        )}
      </div>

      <div style={s.card}>
        <p style={s.cardTitle}>Confirmação da solicitação</p>
        <div style={s.detail}>
          <p style={s.detailBold}>Serviço de {serviceLabel}</p>
          <p style={s.detailGray}>Profissional: {worker?.name || 'Profissional'}</p>
        </div>
        <div style={s.detail}>
          <p style={s.detailBold}>{today}</p>
          <p style={s.detailGray}>Data de agendamento</p>
        </div>
        <p style={s.summaryTitle}>Resumo dos valores</p>
        <div style={s.totalRow}>
          <span style={s.totalLabel}>Total acordado</span>
          <span style={s.totalLabel}>R$ {fmtAmount}</span>
        </div>
      </div>

      <div style={s.paySection}>
        <p style={s.payTitle}>Forma de pagamento</p>
        <div style={s.pixSection}>
          <div style={s.qrBorder}>
            <PixQRCode />
          </div>
          <p style={s.pixInstr}>Abra seu app bancário e escaneie o QR code, ou copie a chave Pix abaixo.</p>
          <div style={s.pixKeyBox}>
            <span style={s.pixKeyText}>{PIX_KEY}</span>
            <button style={{ ...s.copyBtn, ...(copied ? s.copiedBtn : {}) }} onClick={copyPix}>
              {copied ? '✓ Copiado!' : 'Copiar'}
            </button>
          </div>
          <div style={s.bankHint}>
            <p style={s.bankHintText}>Compatível com: Nubank, Itaú, Bradesco, PicPay, Inter e todos os bancos com Pix.</p>
          </div>
        </div>
      </div>

      <button style={{ ...s.payBtn, ...(loading ? s.payBtnDisabled : {}) }} onClick={handlePay} disabled={loading}>
        {loading ? 'Processando...' : `Confirmar pagamento · R$ ${fmtAmount}`}
      </button>

      <div style={{ height: 40 }} />
    </div>
  )
}

const s = {
  page: { background: '#fbfbfb', minHeight: '100vh' },
  topBar: { padding: '44px 22px 0' },
  back: { background: 'none', border: 'none', fontSize: 30, cursor: 'pointer', color: '#252525', padding: 0, lineHeight: 1 },

  addrRow: {
    display: 'flex', alignItems: 'flex-start', padding: '14px 22px',
    gap: 8, borderBottom: '0.5px solid rgba(60,60,60,0.15)',
  },
  addrLabel: { fontSize: 11, fontWeight: '600', color: '#000', margin: 0, marginBottom: 2 },
  addrValue: { fontSize: 11, color: '#3c3c3c', margin: 0 },
  addrInput: {
    flex: 1, border: '1px solid rgba(60,60,60,0.5)', borderRadius: 6,
    padding: '5px 8px', fontSize: 11, color: '#252525', outline: 'none', background: '#fff',
  },
  addrOk: {
    background: '#38b31f', color: '#fff', border: 'none', borderRadius: 6,
    padding: '5px 9px', cursor: 'pointer', fontSize: 13,
  },
  addrX: {
    background: 'none', color: '#3c3c3c', border: '1px solid rgba(60,60,60,0.3)', borderRadius: 6,
    padding: '5px 9px', cursor: 'pointer', fontSize: 13,
  },
  changeBtn: {
    background: '#38b31f', color: '#fff', borderRadius: 13,
    padding: '5px 11px', fontWeight: 500, fontSize: 12, border: 'none', cursor: 'pointer',
    flexShrink: 0, alignSelf: 'center',
  },

  card: {
    margin: '12px 22px', border: '0.5px solid rgba(60,60,60,0.4)',
    borderRadius: 10, padding: '14px', background: '#fff',
  },
  cardTitle: { textAlign: 'center', fontSize: 12, color: '#252525', fontWeight: '600', margin: '0 0 12px' },
  detail: { marginBottom: 8 },
  detailBold: { fontWeight: '600', fontSize: 12, color: '#000', margin: 0 },
  detailGray: { fontSize: 11, color: '#3c3c3c', margin: 0 },
  summaryTitle: { fontWeight: '600', fontSize: 12, color: '#000', margin: '10px 0 6px' },
  summaryRow: {
    display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#3c3c3c', marginBottom: 3,
  },
  totalRow: {
    display: 'flex', justifyContent: 'space-between', marginTop: 8,
    borderTop: '0.5px solid rgba(60,60,60,0.3)', paddingTop: 8,
  },
  totalLabel: { fontWeight: '700', fontSize: 13, color: '#000' },

  paySection: { padding: '16px 22px 0' },
  payTitle: { fontSize: 15, fontWeight: '600', color: '#000', margin: '0 0 12px' },

  pixSection: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  qrBorder: {
    border: '2.5px solid #38b31f', borderRadius: 14, padding: 10, marginBottom: 16,
    background: '#fff', boxShadow: '0 2px 12px rgba(56,179,31,0.15)',
  },
  pixInstr: { fontSize: 12, color: '#3c3c3c', textAlign: 'center', marginBottom: 14, lineHeight: 1.5 },
  pixKeyBox: {
    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
    border: '0.5px solid rgba(60,60,60,0.3)', borderRadius: 10,
    padding: '10px 14px', background: '#f8f8f8', width: '100%', boxSizing: 'border-box',
  },
  pixKeyText: { flex: 1, fontSize: 12, color: '#252525', fontFamily: 'monospace' },
  copyBtn: {
    background: '#38b31f', color: '#fff', border: 'none', borderRadius: 8,
    padding: '6px 12px', fontSize: 12, cursor: 'pointer', flexShrink: 0, fontWeight: '600',
  },
  copiedBtn: { background: '#2a8a15' },
  bankHint: {
    background: '#f0fff0', borderRadius: 8, padding: '10px 14px', width: '100%', boxSizing: 'border-box',
  },
  bankHintText: { fontSize: 11, color: '#3c3c3c', margin: 0, textAlign: 'center', lineHeight: 1.5 },


  payBtn: {
    display: 'block', width: 'calc(100% - 44px)', margin: '22px 22px 0',
    background: '#38b31f', color: '#fff', borderRadius: 10,
    padding: '14px 0', fontSize: 15, fontWeight: '700', border: 'none', cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(56,179,31,0.35)',
  },
  payBtnDisabled: { opacity: 0.7, cursor: 'default' },

  successPage: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    height: '100vh', background: '#fbfbfb', padding: '0 40px', textAlign: 'center',
  },
  successCircle: {
    width: 96, height: 96, borderRadius: '50%', background: '#38b31f',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 24, boxShadow: '0 6px 24px rgba(56,179,31,0.45)',
  },
  successTitle: { fontSize: 26, fontWeight: 'bold', color: '#252525', margin: '0 0 10px' },
  successSub: { fontSize: 14, color: '#3c3c3c', lineHeight: 1.6, margin: 0 },
}
