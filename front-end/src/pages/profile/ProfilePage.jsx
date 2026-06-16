import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { userApi } from '../../api/api'

function UserAvatar() {
  return (
    <div style={av.circle}>
      <svg width="76" height="76" viewBox="0 0 24 24" fill="#252525">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>
    </div>
  )
}

const av = {
  circle: {
    width: 167, height: 167, borderRadius: '50%',
    background: '#d9d9d9',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }
}

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [address, setAddress] = useState('Rua dos bobos nº7')
  const [loading, setLoading] = useState(false)

  const handleUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await userApi.update(user.id, { name })
      alert('Informações atualizadas!')
      setEditing(false)
    } catch (e) {
      alert(e.response?.data?.error || 'Erro ao atualizar')
    } finally { setLoading(false) }
  }

  return (
    <div style={s.page}>
      <div style={s.top}>
        <UserAvatar />
        <p style={s.name}>{user?.name || 'Usuário da Silva'}</p>
        <p style={s.email}>{user?.email || 'fulanosilva@mail.com'}</p>
      </div>

      <div style={s.section}>
        {!editing ? (
          <div style={s.addrRow}>
            <div>
              <p style={s.addrLabel}>Endereço</p>
              <p style={s.addrValue}>{address}</p>
            </div>
            <button style={s.updateBtn} onClick={() => setEditing(true)}>Atualizar</button>
          </div>
        ) : (
          <form onSubmit={handleUpdate}>
            <p style={s.addrLabel}>Endereço</p>
            <input style={s.input} value={address} onChange={e => setAddress(e.target.value)} placeholder="Endereço" />
            <p style={s.addrLabel}>Nome</p>
            <input style={s.input} value={name} onChange={e => setName(e.target.value)} placeholder="Nome" />
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <button style={s.updateBtn} type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</button>
              <button style={s.cancelBtn} type="button" onClick={() => setEditing(false)}>Cancelar</button>
            </div>
          </form>
        )}
      </div>

      <button style={s.logoutBtn} onClick={signOut}>Sair da conta</button>
      <div style={{ height: 80 }} />
    </div>
  )
}

const s = {
  page: { background: '#fbfbfb', minHeight: '100vh' },
  top: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', padding: '50px 30px 20px', gap: 5,
  },
  name: { fontSize: 24, fontWeight: 'bold', color: '#000', marginTop: 8 },
  email: { fontSize: 12, color: '#000' },
  section: { padding: '10px 30px' },
  addrRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 6 },
  addrLabel: { fontSize: 16, fontWeight: '500', color: '#000', marginBottom: 2 },
  addrValue: { fontSize: 12, color: '#000' },
  updateBtn: {
    background: '#38b31f', color: '#fff',
    borderRadius: 4, padding: '8px 14px',
    fontWeight: 500, fontSize: 13, border: 'none', cursor: 'pointer',
  },
  input: {
    display: 'block', width: '100%', border: '1px solid rgba(60,60,60,0.5)',
    borderRadius: 5, padding: '10px 12px', fontSize: 12, marginBottom: 8, background: '#fbfbfb',
  },
  cancelBtn: {
    background: 'none', border: '1px solid #ddd',
    borderRadius: 4, padding: '8px 14px',
    fontSize: 13, cursor: 'pointer', color: '#555',
  },
  logoutBtn: {
    display: 'block', margin: '24px 30px',
    background: 'none', border: 'none',
    color: '#e74c3c', fontSize: 14, fontWeight: '600',
    padding: 0, cursor: 'pointer',
  },
}
