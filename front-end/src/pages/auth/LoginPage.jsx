import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../../api/api'
import { useAuth } from '../../context/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data } = await authApi.signIn({ email, password })
      const token = data.data.token
      const payload = JSON.parse(atob(token.split('.')[1]))
      signIn(token, payload.id, payload.name)
      navigate('/')
    } catch {
      setError('Email ou senha inválidos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.greenTop}>
        <div style={s.logoWrap}>
          <svg width="148" height="20" viewBox="0 0 148 20" fill="none" style={{ marginBottom: 0 }}>
            <path d="M2 10 L74 2 L146 10" stroke="#38b31f" strokeWidth="4" strokeLinecap="round" fill="none"/>
          </svg>
          <p style={s.logoText}>ZELO</p>
          <p style={s.tagline}>CUIDADO A UM TOQUE</p>
        </div>
      </div>
      <div style={s.card}>
        <h2 style={s.title}>Entre em sua conta</h2>
        <form onSubmit={handleLogin}>
          <label style={s.label}>E-mail</label>
          <input style={s.input} type="email" placeholder="exemplo@emaill.com" value={email} onChange={e => setEmail(e.target.value)} required />
          <label style={s.label}>Senha</label>
          <input style={s.input} type="password" placeholder="**********" value={password} onChange={e => setPassword(e.target.value)} required />
          {error && <p style={s.error}>{error}</p>}
          <button style={s.btn} type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
        </form>
        <p style={s.linkText}>
          Ainda não possui uma conta?{' '}
          <span style={s.link} onClick={() => navigate('/register')}>Registre-se</span>
        </p>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: '#fbfbfb', display: 'flex', flexDirection: 'column' },
  greenTop: {
    background: '#38b31f',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
    paddingBottom: 40, paddingTop: 60,
    clipPath: 'polygon(0 0, 100% 0, 100% 75%, 50% 100%, 0 75%)',
    minHeight: 320,
  },
  logoWrap: { textAlign: 'center' },
  logoText: {
    color: '#252525', fontSize: 72, fontWeight: '700',
    letterSpacing: 7, lineHeight: 1, margin: '6px 0 0',
    fontFamily: '"Bakbak One", "Impact", sans-serif',
  },
  tagline: { color: '#252525', fontSize: 9.6, letterSpacing: 5, marginTop: 4, opacity: 0.8 },
  card: { flex: 1, padding: '32px 30px 40px' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#252525', marginBottom: 24 },
  label: { display: 'block', fontSize: 16, fontWeight: '500', color: '#252525', marginBottom: 5, marginTop: 10 },
  input: {
    display: 'block', width: '100%',
    border: '1px solid #3c3c3c', borderRadius: 5,
    padding: '10px', fontSize: 12, marginBottom: 10,
    color: '#3c3c3c', background: '#fbfbfb', boxSizing: 'border-box',
  },
  btn: {
    width: '100%', background: '#38b31f', color: '#fff',
    borderRadius: 5, padding: 10, fontSize: 16,
    fontWeight: '500', marginTop: 10, marginBottom: 20, border: 'none', cursor: 'pointer',
  },
  error: { color: '#e74c3c', fontSize: 12, marginBottom: 10 },
  linkText: { textAlign: 'center', color: '#3c3c3c', fontSize: 16, fontWeight: '500' },
  link: { color: '#3c3c3c', fontWeight: '500', cursor: 'pointer' },
}
