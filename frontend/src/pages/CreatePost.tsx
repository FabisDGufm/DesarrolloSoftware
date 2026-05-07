import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { useAuthStore } from '../stores/authStore'

export function CreatePost() {
  const { user, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)

  const [text, setText] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [status, setStatus] = useState('')

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setStatus('Selecciona un archivo de imagen')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setStatus('La imagen no debe pesar mas de 5MB')
      return
    }
    setSelectedFile(file)
    setStatus('')
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setSelectedFile(null)
    setImagePreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handlePublish = async () => {
    if (!isAuthenticated || (!text.trim() && !selectedFile)) return
    setPublishing(true)
    setStatus('')
    try {
      let imageUrl: string | undefined
      if (selectedFile) {
        setStatus('Subiendo imagen...')
        const { data: uploadData } = await api.get('/api/posts/upload-url', {
          params: { fileName: selectedFile.name },
        })
        const { url, key } = uploadData.data
        await fetch(url, {
          method: 'PUT',
          body: selectedFile,
          headers: { 'Content-Type': selectedFile.type },
        })
        imageUrl = key
      }
      setStatus('Publicando...')
      await api.post('/api/posts/', { text: text.trim(), imageUrl })
      navigate('/')
    } catch {
      setStatus('Error al publicar')
    } finally {
      setPublishing(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <>
        <div className="page-header">
          <div className="page-title">Crear post</div>
        </div>
        <div className="empty-state">
          <div className="empty-state-title">Inicia sesion</div>
          <p>Necesitas iniciar sesion para publicar</p>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: 20,
                cursor: 'pointer',
                padding: '12px 0',
              }}
            >
              &#8592;
            </button>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>Crear post</span>
          </div>
          <button
            className="compose-submit"
            onClick={handlePublish}
            disabled={publishing || (!text.trim() && !selectedFile)}
            style={{ margin: '8px 0' }}
          >
            {publishing ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </div>

      <div className="compose-area" style={{ borderBottom: 'none' }}>
        <div className="avatar">
          {(user?.name || '?')[0]!.toUpperCase()}
        </div>
        <div className="compose-input">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Que esta pasando en el pasillo?"
            disabled={publishing}
            style={{ minHeight: 120, fontSize: 16 }}
            autoFocus
          />

          {imagePreview && (
            <div className="compose-image-preview">
              <img src={imagePreview} alt="Preview" />
              <button className="compose-image-remove" onClick={removeImage}>
                X
              </button>
            </div>
          )}

          {selectedFile && (
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>
              {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
            </div>
          )}

          <div className="compose-toolbar">
            <div className="compose-tools">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <button
                className="compose-tool-btn"
                onClick={() => fileRef.current?.click()}
                disabled={publishing}
                title="Adjuntar imagen"
              >
                &#128247;
              </button>
            </div>
          </div>
        </div>
      </div>

      {status && (
        <div
          style={{
            padding: '12px 16px',
            margin: '0 16px',
            borderRadius: 'var(--r-sm)',
            background: status.startsWith('Error')
              ? 'rgba(244, 33, 46, 0.1)'
              : 'rgba(29, 155, 240, 0.1)',
            color: status.startsWith('Error') ? 'var(--danger)' : 'var(--accent)',
            fontSize: 14,
          }}
        >
          {status}
        </div>
      )}
    </>
  )
}
