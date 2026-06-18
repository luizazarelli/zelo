import { useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { hireApi } from '../../api/api'

const norm = (s = '') => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

const SERVICE_PHOTOS = {
  eletrica:    '/imgs/worker.jpg',
  pintura:     '/imgs/pintura.jpg',
  construcao:  '/imgs/construcao.jpg',
  encanamento: '/imgs/worker-cover.jpg',
  jardinagem:  '/imgs/banner.jpg',
  marcenaria:  '/imgs/construcao.jpg',
  limpeza:     '/imgs/pintura.jpg',
}

const getServicePhoto = (name = '') => SERVICE_PHOTOS[norm(name)] || '/imgs/worker-cover.jpg'

const COVER_SLIDES = ['/imgs/worker-cover.jpg', '/imgs/portfolio1.jpg', '/imgs/portfolio2.jpg', '/imgs/worker.jpg']

function StarIcons({ count = 4, size = 13 }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= count ? '#38b31f' : '#ccc'}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

export default function WorkerProfilePage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { worker } = state || {}
  const { user } = useAuth()

  const [coverIdx, setCoverIdx] = useState(0)
  const [loading, setLoading] = useState(false)

  const drag = useRef({ active: false, startX: 0, deltaX: 0 })
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)

  const startDrag = (x) => { drag.current = { active: true, startX: x, deltaX: 0 }; setDragging(true) }
  const moveDrag = (x) => {
    if (!drag.current.active) return
    const d = x - drag.current.startX
    drag.current.deltaX = d; setDragX(d)
  }
  const endDrag = () => {
    if (!drag.current.active) return
    drag.current.active = false; setDragging(false)
    if (drag.current.deltaX < -60) setCoverIdx(i => Math.min(i + 1, COVER_SLIDES.length - 1))
    else if (drag.current.deltaX > 60) setCoverIdx(i => Math.max(i - 1, 0))
    setDragX(0)
  }

  const handleHire = async () => {
    setLoading(true)
    try {
      const serviceTypeId = worker.serviceTypeIds?.[0] || ''
      const { data } = await hireApi.create({
        clientId: user.id,
        workerId: worker.id,
        serviceTypeId,
        description: 'Solicitação de orçamento via app',
      })
      navigate('/chat', { state: { worker, hire: data.data } })
    } catch {
      const mockHire = { id: `demo-${Date.now()}`, status: 'pending', workerId: worker.id }
      navigate('/chat', { state: { worker, hire: mockHire } })
    } finally {
      setLoading(false)
    }
  }

  if (!worker) return (
    <div style={{ padding: 40, textAlign: 'center', color: '#aaa' }}>
      Profissional não encontrado
    </div>
  )

  const years = worker.workingSince
    ? `${new Date().getFullYear() - new Date(worker.workingSince).getFullYear()} anos de experiência`
    : '5 anos de experiência'

  const profPhoto = getServicePhoto(worker.serviceTypes?.[0])
  const slides = [profPhoto, '/imgs/portfolio1.jpg', '/imgs/portfolio2.jpg']

  return (
    <div style={s.page}>
      {/* Cover com swipe */}
      <div
        style={s.coverWrap}
        onMouseDown={e => startDrag(e.clientX)}
        onMouseMove={e => moveDrag(e.clientX)}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        onTouchStart={e => startDrag(e.touches[0].clientX)}
        onTouchMove={e => { e.preventDefault(); moveDrag(e.touches[0].clientX) }}
        onTouchEnd={endDrag}
      >
        <div style={{
          ...s.coverTrack,
          transform: `translateX(calc(-${coverIdx * 100}% + ${dragX}px))`,
          transition: dragging ? 'none' : 'transform 0.4s ease',
        }}>
          {slides.map((src, i) => (
            <div key={i} style={s.coverSlide}>
              <img src={src} style={s.coverImg} alt="" draggable={false} />
              <div style={s.coverOverlay} />
            </div>
          ))}
        </div>

        <button style={s.back} onClick={() => navigate(-1)}>‹</button>
        <div style={s.dots}>
          {slides.map((_, i) => (
            <span
              key={i}
              style={{ ...s.dot, ...(i === coverIdx ? s.dotActive : {}) }}
              onClick={() => setCoverIdx(i)}
            />
          ))}
        </div>
      </div>

      <div style={s.content}>
        <p style={s.name}>{worker.name}</p>
        <p style={s.years}>{years}</p>
        <StarIcons count={4} size={13} />

        <button style={s.hireBtn} onClick={handleHire} disabled={loading}>
          {loading ? 'Aguarde...' : 'Solicitar Orçamento'}
        </button>

        <p style={s.secTitle}>Avaliações</p>

        {[
          { stars: 5, text: 'Serviço excelente, pontual e muito cuidadoso. Super recomendo!', author: 'Mariana Costa' },
          { stars: 4, text: 'Ótimo profissional, resolveu o problema rapidinho. Só chegou um pouquinho atrasado, mas o trabalho ficou perfeito.', author: 'Ricardo Souza' },
        ].map((r, i) => (
          <div key={i} style={s.review}>
            <div style={s.reviewHeader}>
              <p style={s.reviewAuthor}>{r.author}</p>
              <StarIcons count={r.stars} size={13} />
            </div>
            <p style={s.reviewText}>{r.text}</p>
          </div>
        ))}

        <p style={s.secTitle}>Portfólio do profissional</p>
        <div style={s.portfolioImg}><img src="/imgs/portfolio1.jpg" style={s.portfolioImgEl} alt="" /></div>
        <div style={s.portfolioImg}><img src="/imgs/portfolio2.jpg" style={s.portfolioImgEl} alt="" /></div>
      </div>
      <div style={{ height: 80 }} />
    </div>
  )
}

const s = {
  page: { background: '#fbfbfb', minHeight: '100vh' },
  coverWrap: { position: 'relative', height: 220, overflow: 'hidden', cursor: 'grab', userSelect: 'none' },
  coverTrack: { display: 'flex', height: '100%', willChange: 'transform' },
  coverSlide: { minWidth: '100%', height: '100%', position: 'relative', flexShrink: 0 },
  coverImg: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%', pointerEvents: 'none' },
  coverOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(31deg, rgba(56,179,31,0.4) 0%, transparent 60%)' },
  back: {
    position: 'absolute', top: 48, left: 16,
    background: 'none', border: 'none', fontSize: 36,
    cursor: 'pointer', color: '#fff', zIndex: 2, padding: 0,
    textShadow: '0 1px 4px rgba(0,0,0,0.5)',
  },
  dots: {
    position: 'absolute', bottom: 10, left: '50%',
    transform: 'translateX(-50%)', display: 'flex', gap: 6, zIndex: 2,
  },
  dot: { width: 6, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.5)', display: 'block', cursor: 'pointer' },
  dotActive: { background: '#fff' },
  content: { padding: '20px 30px 0' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#252525', marginBottom: 2, marginTop: 0 },
  years: { fontSize: 12, color: '#3c3c3c', marginBottom: 6, marginTop: 0 },
  hireBtn: {
    display: 'block', width: '100%',
    background: '#38b31f', color: '#fff',
    borderRadius: 5, padding: 10, fontSize: 16,
    fontWeight: '500', border: 'none', cursor: 'pointer',
    marginTop: 20, marginBottom: 24,
  },
  secTitle: { fontSize: 16, fontWeight: '500', color: '#38b31f', marginBottom: 10, marginTop: 0 },
  review: {
    border: '1px solid rgba(60,60,60,0.15)', borderRadius: 8,
    padding: 12, marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 6,
    background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  reviewHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  reviewAuthor: { fontSize: 13, fontWeight: '600', color: '#252525', margin: 0 },
  reviewText: { fontSize: 12, color: '#3c3c3c', lineHeight: 1.5, margin: 0 },
  portfolioImg: { width: '100%', borderRadius: 10, marginBottom: 14, aspectRatio: '3/2', overflow: 'hidden' },
  portfolioImgEl: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
}
