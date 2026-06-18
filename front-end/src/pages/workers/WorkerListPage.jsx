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
  { id: 'demo-w1',  name: 'Wagner Murbach',    serviceTypes: ['Elétrica'],   serviceTypeIds: ['st1'], workingSince: '2018-05-10' },
  { id: 'demo-w2',  name: 'Fabinho',           serviceTypes: ['Elétrica'],   serviceTypeIds: ['st1'], workingSince: '2020-03-15' },
  { id: 'demo-w3',  name: 'Carlos Eduardo',    serviceTypes: ['Pintura'],    serviceTypeIds: ['st2'], workingSince: '2017-08-22' },
  { id: 'demo-w4',  name: 'Renata Moura',      serviceTypes: ['Pintura'],    serviceTypeIds: ['st2'], workingSince: '2019-11-05' },
  { id: 'demo-w5',  name: 'Paulo Henrique',    serviceTypes: ['Construção'], serviceTypeIds: ['st3'], workingSince: '2015-03-14' },
  { id: 'demo-w6',  name: 'Sérgio Bonfim',     serviceTypes: ['Construção'], serviceTypeIds: ['st3'], workingSince: '2013-07-30' },
  { id: 'demo-w7',  name: 'Roberto Alves',     serviceTypes: ['Encanamento'],serviceTypeIds: ['st4'], workingSince: '2016-01-18' },
  { id: 'demo-w8',  name: 'Marcelo Teixeira',  serviceTypes: ['Encanamento'],serviceTypeIds: ['st4'], workingSince: '2021-04-09' },
  { id: 'demo-w9',  name: 'João Batista',      serviceTypes: ['Jardinagem'], serviceTypeIds: ['st5'], workingSince: '2018-09-01' },
  { id: 'demo-w10', name: 'Fernanda Lima',     serviceTypes: ['Jardinagem'], serviceTypeIds: ['st5'], workingSince: '2022-02-20' },
  { id: 'demo-w11', name: 'Alexandre Ramos',   serviceTypes: ['Marcenaria'], serviceTypeIds: ['st6'], workingSince: '2014-06-11' },
  { id: 'demo-w12', name: 'Guilherme Neto',    serviceTypes: ['Marcenaria'], serviceTypeIds: ['st6'], workingSince: '2019-10-03' },
]

function StarIcons({ count = 4 }) {
  return (
    <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill={i <= count ? '#38b31f' : 'rgba(255,255,255,0.4)'}>
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
        const extras = DEMO_WORKERS.filter(d =>
          !apiNames.has(d.name.toLowerCase()) &&
          (!serviceTypeId || d.serviceTypeIds?.includes(serviceTypeId))
        )
        setWorkers([...ws, ...extras])
      })
      .catch(() => setWorkers(
        DEMO_WORKERS.filter(d => !serviceTypeId || d.serviceTypeIds?.includes(serviceTypeId))
      ))
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
