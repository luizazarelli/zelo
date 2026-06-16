import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { serviceTypeApi, workerApi } from '../../api/api'
import { useAuth } from '../../context/AuthContext'

const SERVICE_GRADIENTS = [
  'linear-gradient(160deg, #2d6a4f 0%, #38b31f 100%)',
  'linear-gradient(160deg, #1b4332 0%, #52b788 100%)',
  'linear-gradient(160deg, #40916c 0%, #74c69d 100%)',
]

function StarIcons({ count = 4 }) {
  return (
    <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="7" height="7" viewBox="0 0 24 24" fill={i <= count ? '#38b31f' : '#ccc'}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  )
}

export default function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [serviceTypes, setServiceTypes] = useState([])
  const [workers, setWorkers] = useState([])
  const [bannerIdx, setBannerIdx] = useState(0)

  useEffect(() => {
    serviceTypeApi.list().then(r => setServiceTypes(r.data.data?.serviceTypes || [])).catch(() => {})
    workerApi.search().then(r => setWorkers(r.data.data?.workers || [])).catch(() => {})
  }, [])

  const workersByType = serviceTypes.map(st => ({
    ...st,
    workers: workers.filter(w => w.serviceTypes?.includes(st.name))
  })).filter(st => st.workers.length > 0)

  const allWorkerSections = workersByType.length > 0 ? workersByType : (
    workers.length > 0 ? [{ id: 'all', name: 'disponíveis', workers }] : []
  )

  const bannerCount = Math.max(serviceTypes.length, 1)

  return (
    <div style={s.page}>
      <div style={s.header}>
        <p style={s.welcome}>Bem-vindo(a),</p>
        <p style={s.name}>{user?.name}</p>
      </div>

      <div style={s.bannerWrap}>
        <div style={s.bannerSlider}>
          <div style={{ ...s.banner, background: SERVICE_GRADIENTS[bannerIdx % 3] }}>
            <div style={s.bannerLogoWrap}>
              <p style={s.bannerLogoText}>ZELO</p>
              <p style={s.bannerLogoSub}>CUIDADO A UM TOQUE</p>
            </div>
            <p style={s.bannerTitle}>CONTRATE COM{'\n'}CONFIANÇA</p>
          </div>
        </div>
        <div style={s.dots}>
          {Array.from({ length: bannerCount }).map((_, i) => (
            <span
              key={i}
              style={{ ...s.dot, ...(i === bannerIdx ? s.dotActive : {}) }}
              onClick={() => setBannerIdx(i)}
            />
          ))}
        </div>
      </div>

      <div style={s.section}>
        <p style={s.sTitle}>Serviços disponíveis</p>
        <p style={s.sSub}>Encontre o profissional perfeito</p>
        {serviceTypes.length === 0 && <p style={s.empty}>Nenhum serviço cadastrado</p>}
        {serviceTypes.map((st, i) => (
          <div
            key={st.id}
            style={{ ...s.serviceCard, background: SERVICE_GRADIENTS[i % 3] }}
            onClick={() => {
              setBannerIdx(i)
              navigate('/workers', { state: { serviceTypeId: st.id, serviceTypeName: st.name } })
            }}
          >
            <p style={s.serviceLabel}>{st.name}</p>
          </div>
        ))}
      </div>

      {allWorkerSections.map(st => (
        <div key={st.id} style={s.section}>
          <p style={s.sTitle}>Profissionais em {st.name}</p>
          <p style={s.sSub}>Encontre o profissional perfeito</p>
          <div style={s.workerRow}>
            {st.workers.map(w => {
              const years = w.workingSince
                ? `${new Date().getFullYear() - new Date(w.workingSince).getFullYear()} anos de experiência`
                : '5 anos de experiência'
              return (
                <div
                  key={w.id}
                  style={s.workerCard}
                  onClick={() => navigate(`/workers/${w.id}`, { state: { worker: w } })}
                >
                  <div style={s.workerImgWrap}>
                    <div style={s.workerGradient} />
                    <div style={s.workerCardInfo}>
                      <p style={s.workerName}>{w.name}</p>
                      <p style={s.workerYears}>{years}</p>
                      <StarIcons count={4} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      <div style={{ height: 80 }} />
    </div>
  )
}

const s = {
  page: { background: '#fbfbfb', minHeight: '100vh' },
  header: { padding: '50px 30px 10px' },
  welcome: { color: '#38b31f', fontSize: 12, fontWeight: '600', lineHeight: 1.2 },
  name: { color: '#252525', fontSize: 12, lineHeight: 1.2 },
  bannerWrap: { padding: '0 30px 16px' },
  bannerSlider: { borderRadius: 10, overflow: 'hidden' },
  banner: {
    borderRadius: 10,
    padding: '20px 20px 20px 20px',
    minHeight: 188,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
  },
  bannerLogoWrap: { alignSelf: 'flex-end', textAlign: 'center' },
  bannerLogoText: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 2, lineHeight: 1 },
  bannerLogoSub: { color: '#fff', fontSize: 2, letterSpacing: 1, opacity: 0.8 },
  bannerTitle: { color: '#fff', fontSize: 17, fontWeight: '900', whiteSpace: 'pre-line', marginTop: 60 },
  dots: { display: 'flex', justifyContent: 'center', gap: 6, marginTop: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, background: '#ccc', display: 'inline-block', cursor: 'pointer' },
  dotActive: { background: '#38b31f' },
  section: { background: '#fff', marginTop: 10, padding: '16px 30px' },
  sTitle: { fontSize: 24, fontWeight: 'bold', color: '#252525', marginBottom: 2 },
  sSub: { fontSize: 12, color: '#38b31f', fontWeight: '300', marginBottom: 14 },
  empty: { color: '#aaa', fontStyle: 'italic', fontSize: 13 },
  serviceCard: {
    borderRadius: 10,
    marginBottom: 10,
    cursor: 'pointer',
    height: 114,
    display: 'flex',
    alignItems: 'flex-end',
    padding: '0 20px 20px',
    overflow: 'hidden',
  },
  serviceLabel: { color: '#fff', fontSize: 17, fontWeight: '900' },
  workerRow: { display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 },
  workerCard: { minWidth: 161, maxWidth: 161, cursor: 'pointer', flexShrink: 0, borderRadius: 10, overflow: 'hidden' },
  workerImgWrap: {
    width: 161,
    height: 161,
    background: 'linear-gradient(160deg, #2d8f32 0%, #38b31f 100%)',
    borderRadius: 10,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  workerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    background: 'linear-gradient(31deg, #38b31f 27%, transparent 77%)',
  },
  workerCardInfo: {
    position: 'relative',
    zIndex: 1,
    padding: '0 0 10px 10px',
  },
  workerName: { fontWeight: 'bold', fontSize: 16, color: '#252525' },
  workerYears: { fontSize: 10, color: '#3c3c3c', marginTop: 1 },
}
