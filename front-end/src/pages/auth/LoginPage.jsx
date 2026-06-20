import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../../api/api'
import { useAuth } from '../../context/AuthContext'
import Input from '../../components/Input'

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
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
      const payload = JSON.parse(decodeURIComponent(escape(atob(base64))))
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
      <div style={s.topImage}>
        <img src="/imgs/account-bg.svg" alt="Zelo" style={s.bgImg} />
      </div>
      <div style={s.card}>
        <h2 style={s.title}>Entre em sua conta</h2>
        <form onSubmit={handleLogin}>
          <Input label="E-mail" type="email" placeholder="exemplo@emaill.com" value={email} onChange={e => setEmail(e.target.value)} required />
          <Input label="Senha" type="password" placeholder="**********" value={password} onChange={e => setPassword(e.target.value)} required />
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
  topImage: { display: 'flex', justifyContent: 'center', width: '100%' },
  bgImg: { width: '100%', maxWidth: 600, display: 'block' },
  card: { flex: 1, padding: '32px 30px 40px' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#252525', marginBottom: 24 },
  btn: {
    width: '100%', background: '#38b31f', color: '#fff',
    borderRadius: 5, padding: 10, fontSize: 16,
    fontWeight: '500', marginTop: 10, marginBottom: 20, border: 'none', cursor: 'pointer',
  },
  error: { color: '#e74c3c', fontSize: 12, marginBottom: 10 },
  linkText: { textAlign: 'center', color: '#3c3c3c', fontSize: 16, fontWeight: '500' },
  link: { color: '#3c3c3c', fontWeight: '500', cursor: 'pointer' },
}
