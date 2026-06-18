import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { userApi } from '../../api/api'

function UserAvatar() {
  return (
    <div style={av.circle}>
      <svg width="76" height="76" viewBox="0 0 24 24" fill="#252525">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    </div>
  )
}

const av = {
  circle: {
    width: 167, height: 167, borderRadius: '50%',
    background: '#d9d9d9',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
}

function Field({ label, value }) {
  return (
    <div style={f.wrap}>
      <p style={f.label}>{label}</p>
      <p style={f.value}>{value || '—'}</p>
    </div>
  )
}

const f = {
  wrap: { marginBottom: 18, textAlign: 'left' },
  label: { fontSize: 16, fontWeight: '500', color: '#252525', margin: '0 0 3px' },
  value: { fontSize: 12, color: '#3c3c3c', margin: 0 },
}

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState(user?.phone || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await userApi.update(user.id, { name, phone })
      setEditing(false)
    } catch {
      setError('Erro ao salvar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      {/* Cabeçalho com avatar */}
      <div style={s.top}>
        <UserAvatar />
        <p style={s.displayName}>{user?.name || 'Usuário'}</p>
        <p style={s.email}>{user?.email || 'email@exemplo.com'}</p>
      </div>

      <div style={s.body}>
        {!editing ? (
          <>
            <Field label="Nome" value={name || user?.name} />
            <Field label="Endereço" value={address} />
            <Field label="Contato" value={phone || user?.phone} />
            <button style={s.editBtn} onClick={() => setEditing(true)}>
              Editar perfil
            </button>
          </>
        ) : (
          <form onSubmit={handleSave}>
            <p style={s.formTitle}>Atualizar dados de perfil</p>

            <label style={s.label}>Nome</label>
            <input
              style={s.input}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Seu nome completo"
            />

            <label style={s.label}>Endereço</label>
            <input
              style={s.input}
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Rua, número, bairro"
            />

            <label style={s.label}>Contato</label>
            <input
              style={s.input}
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+55 43 99999-9999"
              type="tel"
            />

            {error && <p style={s.error}>{error}</p>}

            <button style={s.saveBtn} type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Atualizar'}
            </button>
            <button style={s.cancelBtn} type="button" onClick={() => setEditing(false)}>
              Cancelar
            </button>
          </form>
        )}

        <button style={s.logoutBtn} type="button" onClick={signOut}>
          Sair da conta
        </button>
      </div>

      <div style={{ height: 80 }} />
    </div>
  )
}

const s = {
  page: { background: '#fbfbfb', minHeight: '100vh' },
  top: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', padding: '50px 30px 24px', gap: 5,
  },
  displayName: { fontSize: 24, fontWeight: 'bold', color: '#000', marginTop: 8, marginBottom: 0 },
  email: { fontSize: 12, color: '#000', margin: 0 },
  body: { padding: '8px 30px', textAlign: 'center' },
  formTitle: { fontSize: 16, fontWeight: '500', color: '#252525', marginBottom: 16, marginTop: 0 },
  label: { display: 'block', fontSize: 16, fontWeight: '500', color: '#252525', marginBottom: 6, marginTop: 14, textAlign: 'left' },
  input: {
    display: 'block', width: '100%', boxSizing: 'border-box',
    border: '1px solid rgba(60,60,60,0.5)', borderRadius: 5,
    padding: '10px 12px', fontSize: 14,
    background: '#fff', color: '#252525', outline: 'none', textAlign: 'left',
  },
  error: { color: '#e74c3c', fontSize: 12, marginTop: 8 },
  editBtn: {
    display: 'block', width: '100%',
    background: '#38b31f', color: '#fff',
    borderRadius: 5, padding: '10px 0', fontSize: 16,
    fontWeight: '500', border: 'none', cursor: 'pointer',
    marginTop: 8,
  },
  saveBtn: {
    display: 'block', width: '100%',
    background: '#38b31f', color: '#fff',
    borderRadius: 5, padding: '10px 0', fontSize: 16,
    fontWeight: '500', border: 'none', cursor: 'pointer',
    marginTop: 20,
  },
  cancelBtn: {
    display: 'block', width: '100%',
    background: 'none', color: '#3c3c3c',
    border: '1px solid rgba(60,60,60,0.4)', borderRadius: 5,
    padding: '10px 0', fontSize: 16,
    cursor: 'pointer', marginTop: 10,
  },
  logoutBtn: {
    display: 'block', marginTop: 24,
    background: 'none', border: 'none',
    color: '#e74c3c', fontSize: 14, fontWeight: '600',
    padding: 0, cursor: 'pointer',
  },
}
