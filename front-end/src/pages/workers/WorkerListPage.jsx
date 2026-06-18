import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { workerApi } from '../../api/api'

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

const getServicePhoto = (name = '') => SERVICE_PHOTOS[norm(name)] || '/imgs/worker.jpg'

const DEMO_WORKERS = [
  { id: 'w1', name: 'Lucas Martins',   workingSince: '2019-01-01' },
  { id: 'w2', name: 'Pedro Santos',    workingSince: '2021-06-15' },
  { id: 'w3', name: 'Thiago Costa',    workingSince: '2018-03-20' },
  { id: 'w4', name: 'Marcos Oliveira', workingSince: '2020-11-01' },
  { id: 'w5', name: 'Diego Pereira',   workingSince: '2016-07-10' },
  { id: 'w6', name: 'Gustavo Lima',    workingSince: '2017-09-05' },
]

function StarIcons({ count = 4 }) {
  return (
    <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="7" height="7" viewBox="0 0 24 24" fill={i <= count ? '#38b31f' : '#ccc'}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
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
      .then(r => {
        const ws = r.data.data?.workers || []
        const apiNames = new Set(ws.map(w => w.name?.toLowerCase()))
        const extras = DEMO_WORKERS.filter(d => !apiNames.has(d.name.toLowerCase()))
        setWorkers([...ws, ...extras])
      })
      .catch(() => setWorkers(DEMO_WORKERS))
  }, [])

  return (
    <div style={s.page}>
      <div style={s.topBar}>
        <button style={s.back} onClick={() => navigate(-1)}>‹</button>
      </div>

      <div style={s.content}>
        <p style={s.title}>Profissionais em {serviceTypeName || 'elétrica'}</p>
        <p style={s.sub}>Encontre o profissional perfeito</p>

        <div style={s.grid}>
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
                <img src={getServicePhoto(w.serviceTypes?.[0] || serviceTypeName)} style={s.cardImg} alt="" />
                <div style={s.cardOverlay} />
                <div style={s.cardInfo}>
                  <p style={s.workerName}>{w.name}</p>
                  <p style={s.workerYears}>{years}</p>
                  <StarIcons count={4} />
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
  title: { fontSize: 24, fontWeight: 'bold', color: '#252525', marginBottom: 2, marginTop: 0 },
  sub: { fontSize: 12, color: '#38b31f', fontWeight: '300', marginBottom: 20, marginTop: 0 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  card: {
    borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
    aspectRatio: '1 / 1', position: 'relative',
  },
  cardImg: {
    position: 'absolute', inset: 0, width: '100%', height: '100%',
    objectFit: 'cover', objectPosition: 'center 15%',
  },
  cardOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%',
    background: 'linear-gradient(to top, rgba(56,179,31,0.92) 0%, transparent 100%)',
  },
  cardInfo: { position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1, padding: '0 0 10px 10px' },
  workerName: { fontWeight: 'bold', fontSize: 14, color: '#fff', margin: 0 },
  workerYears: { fontSize: 9, color: 'rgba(255,255,255,0.88)', marginTop: 1, marginBottom: 0 },
}
