import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../../api/api'
import Input from '../../components/Input'
import toast from 'react-hot-toast'

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
      toast.success('Conta criada com sucesso! Faça login.')
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
      <div style={s.topImage}>
        <img src="/imgs/account-bg.svg" alt="Zelo" style={s.bgImg} />
      </div>
      <div style={s.card}>
        <h2 style={s.title}>Crie sua conta</h2>
        <form onSubmit={handleRegister}>
          {fields.map(([k, label, type, ph]) => (
            <Input key={k} label={label} type={type} placeholder={ph} value={form[k]} onChange={set(k)} required />
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
  topImage: { display: 'flex', justifyContent: 'center', width: '100%' },
  bgImg: { width: '100%', maxWidth: 600, display: 'block', marginTop: -40 },
  card: { flex: 1, padding: '24px 30px 40px' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#252525', marginBottom: 16 },
  btn: {
    width: '100%', background: '#38b31f', color: '#fff',
    borderRadius: 5, padding: 10, fontSize: 16,
    fontWeight: '500', marginTop: 10, marginBottom: 20, border: 'none', cursor: 'pointer',
  },
  error: { color: '#e74c3c', fontSize: 12, marginBottom: 10 },
  linkText: { textAlign: 'center', color: '#3c3c3c', fontSize: 16, fontWeight: '500' },
  link: { color: '#3c3c3c', fontWeight: '500', cursor: 'pointer' },
}
