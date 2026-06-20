import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { userApi, workerApi, SERVER_BASE } from '../../api/api'

function UserAvatar({ photo, onPick, uploading }) {
  const inputRef = useRef()
  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    onPick(file)
  }
  return (
    <div style={av.wrap} onClick={() => !uploading && inputRef.current.click()}>
      {photo
        ? <img src={photo.startsWith('/uploads') ? `${SERVER_BASE}${photo}` : photo} style={av.img} alt="foto de perfil" />
        : <div style={av.circle}>
            <svg width="76" height="76" viewBox="0 0 24 24" fill="#252525">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
      }
      <div style={{ ...av.badge, opacity: uploading ? 0.5 : 1 }}>
        {uploading
          ? <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>
          : <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7-10h-2.17l-1.24-1.35A2 2 0 0 0 14.12 3H9.88c-.56 0-1.1.24-1.47.65L7.17 5H5C3.9 5 3 5.9 3 7v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7c0-1.1-.9-2-2-2z" /></svg>
        }
      </div>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
    </div>
  )
}

const av = {
  wrap: { position: 'relative', width: 167, height: 167, borderRadius: '50%', cursor: 'pointer' },
  circle: {
    width: 167, height: 167, borderRadius: '50%', background: '#d9d9d9',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  img: { width: 167, height: 167, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center', display: 'block' },
  badge: {
    position: 'absolute', bottom: 6, right: 6, width: 30, height: 30, borderRadius: '50%',
    background: '#38b31f', display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
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
  wrap: { marginBottom: 20, textAlign: 'left' },
  label: { fontSize: 18, fontWeight: '600', color: '#252525', margin: '0 0 3px' },
  value: { fontSize: 16, color: '#3c3c3c', margin: 0 },
}

function WorkerPortfolio({ userId }) {
  const fileInputRef = useRef()
  const [photos, setPhotos] = useState([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    workerApi.getPhotos(userId)
      .then(r => setPhotos(r.data.data || []))
      .catch(() => {})
  }, [userId])

  const handleAdd = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const r = await workerApi.uploadPhoto(userId, fd)
      setPhotos(prev => [...prev, r.data.data])
    } catch {
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDelete = async (photo) => {
    try {
      await workerApi.deletePhoto(userId, photo.id)
      setPhotos(prev => prev.filter(p => p.id !== photo.id))
    } catch {}
  }

  return (
    <div style={{ marginTop: 24, textAlign: 'left' }}>
      <p style={{ fontSize: 16, fontWeight: '600', color: '#38b31f', marginBottom: 12, marginTop: 0 }}>
        Portfólio de fotos
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        {photos.map(photo => (
          <div key={photo.id} style={{ position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden' }}>
            <img
              src={`${SERVER_BASE}${photo.url}`}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            <button
              onClick={() => handleDelete(photo)}
              style={{
                position: 'absolute', top: 4, right: 4,
                background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: '50%',
                width: 24, height: 24, cursor: 'pointer', color: '#fff', fontSize: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >✕</button>
          </div>
        ))}
      </div>
      <button
        style={{
          display: 'block', width: '100%', border: '1.5px dashed rgba(56,179,31,0.6)',
          borderRadius: 8, padding: '10px 0', fontSize: 14, color: '#38b31f',
          background: 'none', cursor: uploading ? 'not-allowed' : 'pointer',
        }}
        disabled={uploading}
        onClick={() => fileInputRef.current.click()}
      >
        {uploading ? 'Enviando…' : '+ Adicionar foto'}
      </button>
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAdd} />
    </div>
  )
}

export default function ProfilePage() {
  const { user, signOut, updateProfilePicture } = useAuth()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState(user?.phone || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [photo, setPhoto] = useState(user?.profilePicture || null)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [isWorker, setIsWorker] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    workerApi.getPhotos(user.id)
      .then(() => setIsWorker(true))
      .catch(() => setIsWorker(false))
  }, [user?.id])

  const handlePhotoPick = async (file) => {
    setPhotoUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const r = await userApi.uploadPhoto(user.id, fd)
      const url = r.data.data?.url
      if (url) {
        setPhoto(url)
        updateProfilePicture(url)
      }
    } catch {
    } finally {
      setPhotoUploading(false)
    }
  }

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
      <div style={s.top}>
        <UserAvatar photo={photo} onPick={handlePhotoPick} uploading={photoUploading} />
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

        {isWorker && <WorkerPortfolio userId={user.id} />}

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
    display: 'block', width: '100%', background: '#38b31f', color: '#fff',
    borderRadius: 5, padding: '10px 0', fontSize: 16,
    fontWeight: '500', border: 'none', cursor: 'pointer', marginTop: 8,
  },
  saveBtn: {
    display: 'block', width: '100%', background: '#38b31f', color: '#fff',
    borderRadius: 5, padding: '10px 0', fontSize: 16,
    fontWeight: '500', border: 'none', cursor: 'pointer', marginTop: 20,
  },
  cancelBtn: {
    display: 'block', width: '100%', background: 'none', color: '#3c3c3c',
    border: '1px solid rgba(60,60,60,0.4)', borderRadius: 5,
    padding: '10px 0', fontSize: 16, cursor: 'pointer', marginTop: 10,
  },
  logoutBtn: {
    display: 'block', marginTop: 24, background: 'none', border: 'none',
    color: '#e74c3c', fontSize: 14, fontWeight: '600', padding: 0, cursor: 'pointer',
  },
}
