import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../../api/api'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleRegister = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) return setError('As senhas não coincidem')
    setLoading(true); setError('')
    try {
      await authApi.signUp({ name: form.name, email: form.email, phone: form.phone, password: form.password })
      alert('Conta criada com sucesso! Faça login.')
      navigate('/login')
    } catch (err) {
      const e = err.response?.data?.error
      if (typeof e === 'object' && e?.properties) {
        const msgs = Object.values(e.properties).flatMap(p => p.errors || [])
        setError(msgs.join('. ') || 'Dados inválidos')
      } else {
        setError(typeof e === 'string' ? e : 'Erro ao cadastrar')
      }
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    ['name', 'Nome', 'text', 'Seu nome completo'],
    ['email', 'E-mail', 'email', 'exemplo@emaill.com'],
    ['phone', 'Telefone', 'tel', '43999999999'],
    ['password', 'Senha', 'password', '**********'],
    ['confirm', 'Confirmar senha', 'password', '**********'],
  ]

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
        <h2 style={s.title}>Crie sua conta</h2>
        <form onSubmit={handleRegister}>
          {fields.map(([k, label, type, ph]) => (
            <div key={k}>
              <label style={s.label}>{label}</label>
              <input style={s.input} type={type} placeholder={ph} value={form[k]} onChange={set(k)} required />
            </div>
          ))}
          {error && <p style={s.error}>{error}</p>}
          <button style={s.btn} type="submit" disabled={loading}>{loading ? 'Cadastrando...' : 'Cadastrar'}</button>
        </form>
        <p style={s.linkText}>
          Já possui uma conta?{' '}
          <span style={s.link} onClick={() => navigate('/login')}>Entre aqui</span>
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
    paddingBottom: 40, paddingTop: 50,
    clipPath: 'polygon(0 0, 100% 0, 100% 75%, 50% 100%, 0 75%)',
    minHeight: 240,
  },
  logoWrap: { textAlign: 'center' },
  logoText: {
    color: '#252525', fontSize: 72, fontWeight: '700',
    letterSpacing: 7, lineHeight: 1, margin: '6px 0 0',
    fontFamily: '"Bakbak One", "Impact", sans-serif',
  },
  tagline: { color: '#252525', fontSize: 9.6, letterSpacing: 5, marginTop: 4, opacity: 0.8 },
  card: { flex: 1, padding: '24px 30px 40px' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#252525', marginBottom: 16 },
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
