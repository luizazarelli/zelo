import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { workerApi } from '../../api/api'

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

export default function WorkerListPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { serviceTypeId, serviceTypeName } = state || {}
  const [workers, setWorkers] = useState([])

  useEffect(() => {
    workerApi.search(serviceTypeId ? [serviceTypeId] : undefined)
      .then(r => setWorkers(r.data.data?.workers || []))
      .catch(() => {})
  }, [])

  return (
    <div style={s.page}>
      <div style={s.topBar}>
        <button style={s.back} onClick={() => navigate(-1)}>‹</button>
      </div>

      <div style={s.content}>
        <p style={s.title}>Profissionais em {serviceTypeName || 'todos'}</p>
        <p style={s.sub}>Encontre o profissional perfeito</p>

        <div style={s.grid}>
          {workers.length === 0 && (
            <p style={s.empty}>Nenhum profissional encontrado</p>
          )}
          {workers.map(w => {
            const years = w.workingSince
              ? `${new Date().getFullYear() - new Date(w.workingSince).getFullYear()} anos de experiência`
              : '5 anos de experiência'
            return (
              <div
                key={w.id}
                style={s.card}
                onClick={() => navigate(`/workers/${w.id}`, { state: { worker: w } })}
              >
                <div style={s.imgWrap}>
                  <div style={s.imgGradient} />
                  <div style={s.cardInfo}>
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
      <div style={{ height: 80 }} />
    </div>
  )
}

const s = {
  page: { background: '#fbfbfb', minHeight: '100vh' },
  topBar: { padding: '48px 30px 0' },
  back: { background: 'none', border: 'none', fontSize: 36, cursor: 'pointer', color: '#252525', lineHeight: 1, padding: 0 },
  content: { padding: '10px 30px' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#252525', marginBottom: 2 },
  sub: { fontSize: 12, color: '#38b31f', fontWeight: '300', marginBottom: 20 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  card: { borderRadius: 10, overflow: 'hidden', cursor: 'pointer' },
  imgWrap: {
    width: '100%',
    aspectRatio: '1 / 1',
    background: 'linear-gradient(160deg, #2d8f32 0%, #38b31f 100%)',
    borderRadius: 10,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  imgGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    background: 'linear-gradient(31deg, #38b31f 27%, transparent 77%)',
  },
  cardInfo: {
    position: 'relative',
    zIndex: 1,
    padding: '0 0 10px 10px',
  },
  workerName: { fontWeight: 'bold', fontSize: 16, color: '#252525' },
  workerYears: { fontSize: 10, color: '#3c3c3c', marginTop: 1 },
  empty: { gridColumn: '1 / -1', textAlign: 'center', color: '#aaa', fontStyle: 'italic', padding: 40, fontSize: 13 },
}
