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

function getBrand(num) {
  const n = (num || '').replace(/\s/g, '')
  if (/^4/.test(n)) return 'visa'
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'mastercard'
  if (/^3[47]/.test(n)) return 'amex'
  if (/^(636368|438935|504175|451416|636297|5067|4576|4011)/.test(n)) return 'elo'
  if (/^(606282|3841)/.test(n)) return 'hipercard'
  return 'unknown'
}

const BRAND_GRADIENT = {
  visa:       'linear-gradient(135deg, #1a237e 0%, #1565c0 100%)',
  mastercard: 'linear-gradient(135deg, #263238 0%, #455a64 100%)',
  amex:       'linear-gradient(135deg, #00695c 0%, #00897b 100%)',
  elo:        'linear-gradient(135deg, #e65100 0%, #ff8f00 100%)',
  hipercard:  'linear-gradient(135deg, #b71c1c 0%, #e53935 100%)',
  unknown:    'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
}

function BrandLogo({ brand }) {
  if (brand === 'visa') return (
    <svg width="52" height="17" viewBox="0 0 52 17">
      <text x="0" y="15" fill="white" fontSize="19" fontWeight="800" fontFamily="serif" fontStyle="italic">VISA</text>
    </svg>
  )
  if (brand === 'mastercard') return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#eb001b' }} />
      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#f79e1b', marginLeft: -10, opacity: 0.92 }} />
    </div>
  )
  if (brand === 'amex') return (
    <svg width="50" height="17" viewBox="0 0 50 17">
      <text x="0" y="14" fill="white" fontSize="13" fontWeight="800" fontFamily="sans-serif" letterSpacing="1">AMERICAN EXPRESS</text>
    </svg>
  )
  if (brand === 'elo') return (
    <svg width="36" height="18" viewBox="0 0 36 18">
      <text x="0" y="15" fill="white" fontSize="18" fontWeight="900" fontFamily="sans-serif" fontStyle="italic">elo</text>
    </svg>
  )
  if (brand === 'hipercard') return (
    <svg width="56" height="16" viewBox="0 0 56 16">
      <text x="0" y="13" fill="white" fontSize="12" fontWeight="700" fontFamily="sans-serif">Hipercard</text>
    </svg>
  )
  return null
}

function CardVisual({ num, name, expiry, cvv, flipped }) {
  const brand = getBrand(num)
  const raw = (num || '').replace(/\s/g, '')
  const disp = (raw.padEnd(16, '•').match(/.{1,4}/g) || []).join(' ')
  const bg = BRAND_GRADIENT[brand]

  return (
    <div style={{ perspective: 700, marginBottom: 20 }}>
      <div style={{
        position: 'relative', height: 170, borderRadius: 14,
        transformStyle: 'preserve-3d',
        transition: 'transform 0.55s ease',
        transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
      }}>
        {/* Frente */}
        <div style={{ ...cv.face, background: bg }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
            <svg width="34" height="26" viewBox="0 0 34 26" style={{ display: 'block' }}>
              <rect width="34" height="26" rx="4" fill="#d4a843"/>
              <rect x="7" y="5" width="20" height="16" rx="2" fill="none" stroke="#b8922f" strokeWidth="1.5"/>
              <line x1="17" y1="5" x2="17" y2="21" stroke="#b8922f" strokeWidth="1.5"/>
              <line x1="7" y1="13" x2="27" y2="13" stroke="#b8922f" strokeWidth="1.5"/>
            </svg>
            <BrandLogo brand={brand} />
          </div>
          <p style={cv.num}>{disp}</p>
          <div style={cv.foot}>
            <div>
              <p style={cv.lbl}>TITULAR</p>
              <p style={cv.val}>{(name || 'NOME TITULAR').toUpperCase()}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={cv.lbl}>VALIDADE</p>
              <p style={cv.val}>{expiry || 'MM/AA'}</p>
            </div>
          </div>
        </div>

        {/* Verso */}
        <div style={{ ...cv.face, background: bg, transform: 'rotateY(180deg)' }}>
          <div style={cv.stripe} />
          <div style={cv.cvvArea}>
            <div style={cv.cvvStrip}>
              <p style={cv.cvvVal}>{(cvv || '').padEnd(3, '•')}</p>
            </div>
            <p style={cv.cvvLabel}>CVV</p>
          </div>
          <div style={{ position: 'absolute', bottom: 14, right: 18 }}>
            <BrandLogo brand={brand} />
          </div>
        </div>
      </div>
    </div>
  )
}

const cv = {
  face: {
    position: 'absolute', inset: 0, borderRadius: 14,
    padding: '18px 20px', color: '#fff',
    backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
    boxShadow: '0 8px 24px rgba(0,0,0,0.28)',
    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
  },
  num: { fontSize: 15, letterSpacing: 3, fontWeight: '600', margin: 0, fontFamily: 'monospace' },
  foot: { display: 'flex', justifyContent: 'space-between' },
  lbl: { fontSize: 8, opacity: 0.65, margin: '0 0 2px', letterSpacing: 1 },
  val: { fontSize: 12, fontWeight: '700', margin: 0 },
  stripe: {
    position: 'absolute', top: 32, left: 0, right: 0,
    height: 44, background: 'rgba(0,0,0,0.55)',
  },
  cvvArea: { position: 'absolute', top: 96, left: 20, right: 20 },
  cvvStrip: {
    background: '#fff', borderRadius: 4, height: 34,
    display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
    paddingRight: 12, marginBottom: 4,
  },
  cvvVal: { color: '#222', fontSize: 16, fontFamily: 'monospace', letterSpacing: 3, fontWeight: '700', margin: 0 },
  cvvLabel: { fontSize: 10, color: 'rgba(255,255,255,0.75)', textAlign: 'right', margin: 0 },
}

const METHODS = [
  { id: 'pix', label: 'Pix' },
  { id: 'credit', label: 'Cartão de crédito' },
  { id: 'debit', label: 'Cartão de débito' },
]

export default function PaymentPage() {
  const { state } = useLocation()
  const { hire, worker } = state || {}
  const navigate = useNavigate()

  const [selected, setSelected] = useState('pix')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [copied, setCopied] = useState(false)

  const [address, setAddress] = useState('Rua dos Bobos, n 0, Centro')
  const [editAddr, setEditAddr] = useState(false)
  const [addrInput, setAddrInput] = useState('')

  const [cardNum, setCardNum] = useState('')
  const [cardName, setCardName] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [cardFlipped, setCardFlipped] = useState(false)

  const copyPix = () => {
    navigator.clipboard?.writeText(PIX_KEY).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const fmtNum = v => v.replace(/\D/g, '').slice(0, 16).match(/.{1,4}/g)?.join(' ') || ''
  const fmtExp = v => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d }

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
    try { await paymentApi.process(hire?.id, 75.99) } catch {}
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
        <div style={s.summaryRow}><span>Subtotal</span><span>R$ 70,00</span></div>
        <div style={s.summaryRow}><span>Taxa de serviço</span><span>R$ 5,99</span></div>
        <div style={s.totalRow}>
          <span style={s.totalLabel}>Total a pagar</span>
          <span style={s.totalLabel}>R$ 75,99</span>
        </div>
      </div>

      <div style={s.paySection}>
        <p style={s.payTitle}>Forma de pagamento</p>
        <div style={s.methodTabs}>
          {METHODS.map(m => (
            <button
              key={m.id}
              style={{ ...s.tab, ...(selected === m.id ? s.tabActive : {}) }}
              onClick={() => setSelected(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>

        {selected === 'pix' && (
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
        )}

        {(selected === 'credit' || selected === 'debit') && (
          <div style={s.cardForm}>
            <CardVisual num={cardNum} name={cardName} expiry={cardExpiry} cvv={cardCvv} flipped={cardFlipped} />
            <input
              style={s.field}
              placeholder="Número do cartão"
              value={cardNum}
              onChange={e => setCardNum(fmtNum(e.target.value))}
              maxLength={19}
              inputMode="numeric"
              onFocus={() => setCardFlipped(false)}
            />
            <input
              style={s.field}
              placeholder="Nome do titular"
              value={cardName}
              onChange={e => setCardName(e.target.value)}
              onFocus={() => setCardFlipped(false)}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                style={{ ...s.field, flex: 1, marginBottom: 0 }}
                placeholder="Validade MM/AA"
                value={cardExpiry}
                onChange={e => setCardExpiry(fmtExp(e.target.value))}
                maxLength={5}
                inputMode="numeric"
                onFocus={() => setCardFlipped(false)}
              />
              <input
                style={{ ...s.field, width: 88, marginBottom: 0 }}
                placeholder="CVV"
                value={cardCvv}
                onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                maxLength={3}
                inputMode="numeric"
                onFocus={() => setCardFlipped(true)}
                onBlur={() => setCardFlipped(false)}
              />
            </div>
            {cardNum && (
              <p style={s.brandHint}>
                Bandeira detectada: <strong>{getBrand(cardNum) === 'unknown' ? 'não identificada' : getBrand(cardNum).charAt(0).toUpperCase() + getBrand(cardNum).slice(1)}</strong>
              </p>
            )}
          </div>
        )}
      </div>

      <button style={{ ...s.payBtn, ...(loading ? s.payBtnDisabled : {}) }} onClick={handlePay} disabled={loading}>
        {loading ? 'Processando...' : 'Confirmar pagamento · R$ 75,99'}
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
  methodTabs: { display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' },
  tab: {
    border: '1px solid rgba(60,60,60,0.35)', borderRadius: 20,
    padding: '7px 14px', fontSize: 12, background: '#fbfbfb', cursor: 'pointer', color: '#3c3c3c',
  },
  tabActive: { background: '#38b31f', borderColor: '#38b31f', color: '#fff', fontWeight: '600' },

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

  cardForm: {},
  field: {
    display: 'block', width: '100%', boxSizing: 'border-box',
    border: '0.5px solid rgba(60,60,60,0.45)', borderRadius: 8,
    padding: '11px 12px', fontSize: 13,
    background: '#fff', color: '#252525', outline: 'none', marginBottom: 10,
  },
  brandHint: { fontSize: 11, color: '#3c3c3c', margin: '8px 0 0', textAlign: 'right' },

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
