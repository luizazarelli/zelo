import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { serviceTypeApi } from '../../api/api'
import { useAuth } from '../../context/AuthContext'

const norm = (s = '') => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

const DEMO_SERVICE_TYPES = [
  { id: 'st1', name: 'Elétrica' },
  { id: 'st2', name: 'Pintura' },
  { id: 'st3', name: 'Construção' },
  { id: 'st4', name: 'Encanamento' },
  { id: 'st5', name: 'Jardinagem' },
  { id: 'st6', name: 'Marcenaria' },
]

const BANNER_SLIDES = [
  { src: '/imgs/banner.jpg',    title: 'CONTRATE COM\nCONFIANÇA' },
  { src: '/imgs/pintura.jpg',   title: 'PROFISSIONAIS\nDE CONFIANÇA' },
  { src: '/imgs/construcao.jpg',title: 'SEU LAR EM\nBOAS MÃOS' },
]

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


export default function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [serviceTypes, setServiceTypes] = useState([])
  const [bannerIdx, setBannerIdx] = useState(0)

  const drag = useRef({ active: false, startX: 0, deltaX: 0 })
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    serviceTypeApi.list()
      .then(r => {
        const sts = r.data.data?.serviceTypes || []
        const seen = new Set()
        const unique = sts.filter(s => {
          const k = norm(s.name)
          if (seen.has(k) || k === 'eletricista') return false
          seen.add(k); return true
        })
        const extras = DEMO_SERVICE_TYPES.filter(d => !seen.has(norm(d.name)))
        setServiceTypes([...unique, ...extras])
      })
      .catch(() => setServiceTypes(DEMO_SERVICE_TYPES))

  }, [])

  useEffect(() => {
    if (dragging) return
    const t = setInterval(() => setBannerIdx(i => (i + 1) % BANNER_SLIDES.length), 3500)
    return () => clearInterval(t)
  }, [dragging])

  const startDrag = (x) => {
    drag.current = { active: true, startX: x, deltaX: 0 }
    setDragging(true)
  }
  const moveDrag = (x) => {
    if (!drag.current.active) return
    const d = x - drag.current.startX
    drag.current.deltaX = d
    setDragX(d)
  }
  const endDrag = () => {
    if (!drag.current.active) return
    drag.current.active = false
    setDragging(false)
    if (drag.current.deltaX < -60) setBannerIdx(i => Math.min(i + 1, BANNER_SLIDES.length - 1))
    else if (drag.current.deltaX > 60) setBannerIdx(i => Math.max(i - 1, 0))
    setDragX(0)
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <p style={s.welcome}>Bem-vindo(a),</p>
        <p style={s.userName}>{user?.name}</p>
      </div>

      {/* Banner com swipe */}
      <div style={s.bannerWrap}>
        <div
          style={s.bannerOuter}
          onMouseDown={e => startDrag(e.clientX)}
          onMouseMove={e => moveDrag(e.clientX)}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          onTouchStart={e => startDrag(e.touches[0].clientX)}
          onTouchMove={e => { e.preventDefault(); moveDrag(e.touches[0].clientX) }}
          onTouchEnd={endDrag}
        >
          <div style={{
            ...s.bannerTrack,
            transform: `translateX(calc(-${bannerIdx * 100}% + ${dragX}px))`,
            transition: dragging ? 'none' : 'transform 0.4s ease',
          }}>
            {BANNER_SLIDES.map((slide, i) => (
              <div key={i} style={s.slide}>
                <img src={slide.src} style={s.slideImg} alt="" draggable={false} />
                <div style={s.slideOverlay} />
                <div style={s.slideLogoWrap}>
                  <p style={s.slideLogo}>ZELO</p>
                  <p style={s.slideTagline}>CUIDADO A UM TOQUE</p>
                </div>
                <p style={s.slideTitle}>{slide.title}</p>
              </div>
            ))}
          </div>
        </div>
        <div style={s.dots}>
          {BANNER_SLIDES.map((_slide, i) => (
            <span
              key={i}
              style={{ ...s.dot, ...(i === bannerIdx ? s.dotActive : {}) }}
              onClick={() => setBannerIdx(i)}
            />
          ))}
        </div>
      </div>

      {/* Serviços */}
      <div style={s.section}>
        <p style={s.sTitle}>Serviços disponíveis</p>
        <p style={s.sSub}>Encontre o profissional perfeito</p>
        {serviceTypes.map(st => (
          <div
            key={st.id}
            style={s.serviceCard}
            onClick={() => navigate('/workers', { state: { serviceTypeId: st.id, serviceTypeName: st.name } })}
          >
            <img src={getServicePhoto(st.name)} style={s.serviceImg} alt="" />
            <div style={s.serviceOverlay} />
            <p style={s.serviceLabel}>{st.name}</p>
          </div>
        ))}
      </div>

      <div style={{ height: 80 }} />
    </div>
  )
}

const s = {
  page: { background: '#fbfbfb', minHeight: '100vh' },
  header: { padding: '50px 20px 10px', textAlign: 'left' },
  welcome: { color: '#38b31f', fontSize: 12, fontWeight: '600', lineHeight: 1.2, margin: 0 },
  userName: { color: '#252525', fontSize: 12, lineHeight: 1.2, margin: 0 },

  bannerWrap: { padding: '0 20px 16px' },
  bannerOuter: { borderRadius: 10, overflow: 'hidden', cursor: 'grab', userSelect: 'none' },
  bannerTrack: { display: 'flex', willChange: 'transform' },
  slide: { minWidth: '100%', height: 188, position: 'relative', overflow: 'hidden', flexShrink: 0 },
  slideImg: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%', pointerEvents: 'none' },
  slideOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(31deg, rgba(56,179,31,0.82) 27%, transparent 77%)' },
  slideLogoWrap: { position: 'absolute', top: 10, right: 12, textAlign: 'center' },
  slideLogo: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 2, lineHeight: 1, margin: 0 },
  slideTagline: { color: '#fff', fontSize: 4, letterSpacing: 1, opacity: 0.9, margin: 0 },
  slideTitle: { position: 'absolute', bottom: 20, left: 20, color: '#fff', fontSize: 17, fontWeight: '900', whiteSpace: 'pre-line', margin: 0 },
  dots: { display: 'flex', justifyContent: 'center', gap: 6, marginTop: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, background: '#ccc', display: 'inline-block', cursor: 'pointer' },
  dotActive: { background: '#38b31f' },

  section: { marginTop: 10, padding: '16px 20px' },
  sTitle: { fontSize: 24, fontWeight: 'bold', color: '#252525', marginBottom: 2, marginTop: 0 },
  sSub: { fontSize: 12, color: '#38b31f', fontWeight: '300', marginBottom: 14, marginTop: 0 },

  serviceCard: {
    position: 'relative', borderRadius: 10, marginBottom: 10,
    cursor: 'pointer', height: 114, overflow: 'hidden',
    display: 'flex', alignItems: 'flex-end',
  },
  serviceImg: {
    position: 'absolute', inset: 0, width: '100%', height: '100%',
    objectFit: 'cover', objectPosition: 'center 25%',
  },
  serviceOverlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)',
  },
  serviceLabel: { position: 'relative', zIndex: 1, color: '#fff', fontSize: 17, fontWeight: '900', padding: '0 20px 16px', margin: 0 },

}
