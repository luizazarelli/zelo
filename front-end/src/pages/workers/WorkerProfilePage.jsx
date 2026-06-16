import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { hireApi } from '../../api/api'

function StarIcons({ count = 4, size = 13 }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= count ? '#38b31f' : '#ccc'}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  )
}

function PhotoPlaceholder() {
  return (
    <div style={ph.wrap}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="rgba(60,60,60,0.5)">
        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
      </svg>
    </div>
  )
}

const ph = {
  wrap: {
    width: 64, height: 64,
    background: 'rgba(60,60,60,0.15)',
    borderRadius: 5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }
}

export default function WorkerProfilePage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { worker } = state || {}
  const { user } = useAuth()

  const handleHire = async () => {
    try {
      const serviceTypeId = worker.serviceTypeIds?.[0] || ''
      const { data } = await hireApi.create({
        clientId: user.id,
        workerId: worker.id,
        serviceTypeId,
        description: 'Solicitação de orçamento via app',
      })
      navigate('/chat', { state: { worker, hire: data.data } })
    } catch (e) {
      alert(e.response?.data?.error || 'Erro ao criar solicitação')
    }
  }

  if (!worker) return <div style={{ padding: 40, textAlign: 'center', color: '#aaa' }}>Profissional não encontrado</div>

  const years = worker.workingSince
    ? `${new Date().getFullYear() - new Date(worker.workingSince).getFullYear()} anos de experiência`
    : '5 anos de experiência'

  return (
    <div style={s.page}>
      <div style={s.coverWrap}>
        <button style={s.back} onClick={() => navigate(-1)}>‹</button>
        <div style={s.coverBg} />
        <div style={s.dots}>
          {[0,1,2,3].map(i => (
            <span key={i} style={{ ...s.dot, ...(i === 0 ? s.dotActive : {}) }} />
          ))}
        </div>
      </div>

      <div style={s.content}>
        <p style={s.name}>{worker.name}</p>
        <p style={s.years}>{years}</p>
        <StarIcons count={4} size={13} />

        <button style={s.hireBtn} onClick={handleHire}>Solicitar Orçamento</button>

        <p style={s.secTitle}>Avaliações</p>

        {[1, 2].map(i => (
          <div key={i} style={s.review}>
            <div style={s.reviewPhotos}>
              <PhotoPlaceholder /><PhotoPlaceholder /><PhotoPlaceholder />
            </div>
            <p style={s.reviewText}>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
            </p>
            <p style={s.reviewAuthor}>Cliente da Silva</p>
          </div>
        ))}

        <p style={s.secTitle}>Portfólio do profissional</p>

        {[1, 2].map(i => (
          <div key={i} style={s.portfolioImg}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="rgba(60,60,60,0.3)">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
          </div>
        ))}
      </div>
      <div style={{ height: 80 }} />
    </div>
  )
}

const s = {
  page: { background: '#fbfbfb', minHeight: '100vh' },
  coverWrap: {
    position: 'relative',
    height: 220,
    background: 'linear-gradient(160deg, #2d8f32 0%, #38b31f 100%)',
    overflow: 'hidden',
  },
  back: {
    position: 'absolute', top: 48, left: 16,
    background: 'none', border: 'none', fontSize: 36,
    cursor: 'pointer', color: '#252525', zIndex: 2, padding: 0,
  },
  coverBg: { position: 'absolute', inset: 0 },
  dots: {
    position: 'absolute', bottom: 10, left: '50%',
    transform: 'translateX(-50%)', display: 'flex', gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.5)', display: 'block' },
  dotActive: { background: '#fff' },
  content: { padding: '20px 30px 0' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#252525', marginBottom: 2 },
  years: { fontSize: 12, color: '#3c3c3c', marginBottom: 6 },
  hireBtn: {
    display: 'block', width: '100%',
    background: '#38b31f', color: '#fff',
    borderRadius: 5, padding: 10, fontSize: 16,
    fontWeight: '500', border: 'none', cursor: 'pointer',
    marginTop: 20, marginBottom: 24,
  },
  secTitle: { fontSize: 16, fontWeight: '500', color: '#38b31f', marginBottom: 10 },
  review: {
    border: '1px solid rgba(60,60,60,0.5)', borderRadius: 5,
    padding: 10, marginBottom: 10,
    display: 'flex', flexDirection: 'column', gap: 10,
  },
  reviewPhotos: { display: 'flex', gap: 10 },
  reviewText: { fontSize: 12, color: '#000', lineHeight: 1.5 },
  reviewAuthor: { fontSize: 12, color: 'rgba(60,60,60,0.5)', textAlign: 'right' },
  portfolioImg: {
    width: '100%', borderRadius: 10,
    background: '#e0e0e0', marginBottom: 14,
    aspectRatio: '3/2',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
}
