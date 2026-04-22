import { useState, useRef } from 'react'
import { api } from '../services/api'
import { useAuthStore } from '../stores/authStore'

const S3_BASE_URL = import.meta.env.VITE_S3_BASE_URL || ''

export function CreatePost() {
  const { user } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [text, setText] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [status, setStatus] = useState('')
  const [step, setStep] = useState(0)
  const [createdPost, setCreatedPost] = useState<any>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setStatus('Por favor selecciona un archivo de imagen.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setStatus('La imagen no debe pesar más de 5MB.')
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
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handlePublish = async () => {
    if (!user) {
      setStatus('Debes estar autenticado para publicar.')
      return
    }
    if (!text.trim() && !selectedFile) {
      setStatus('Escribe algo o adjunta una imagen.')
      return
    }

    setPublishing(true)
    setStatus('')
    setStep(0)
    setCreatedPost(null)

    try {
      let imageUrl: string | undefined

      // Si hay imagen, subirla a S3
      if (selectedFile) {
        // Paso 1: Obtener presigned URL
        setStep(1)
        setStatus('Paso 1/3: Obteniendo URL de subida...')
        const { data: uploadData } = await api.get('/api/feed/upload-url', {
          params: { fileName: selectedFile.name },
        })
        const { url, key } = uploadData.data

        // Paso 2: Subir a S3
        setStep(2)
        setStatus('Paso 2/3: Subiendo imagen a S3...')
        await fetch(url, {
          method: 'PUT',
          body: selectedFile,
          headers: { 'Content-Type': selectedFile.type },
        })

        imageUrl = S3_BASE_URL ? `${S3_BASE_URL}/${key}` : key
      }

      // Paso 3 (o único paso si no hay imagen): Crear post
      setStep(selectedFile ? 3 : 1)
      setStatus(selectedFile ? 'Paso 3/3: Publicando post...' : 'Publicando post...')
      const { data: postData } = await api.post('/api/feed', {
        text: text.trim(),
        imageUrl,
      })

      setCreatedPost(postData.data)
      setStep(10)
      setStatus('Post publicado correctamente.')
      setText('')
      removeImage()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setStatus(`Error: ${message}`)
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>
      <h1>Crear Post</h1>

      {user ? (
        <p style={{ color: '#666' }}>
          Publicando como <strong>{user.name}</strong>
        </p>
      ) : (
        <p style={{ color: '#c00' }}>
          No hay usuario autenticado. Inicia sesión primero.
        </p>
      )}

      {/* Flujo explicativo */}
      <div style={{
        background: '#f5f5f5',
        borderRadius: 8,
        padding: 16,
        marginBottom: 24,
        border: '1px solid #ddd',
      }}>
        <h3 style={{ marginTop: 0 }}>Flujo de creación de post</h3>
        <ol style={{ lineHeight: 1.8, margin: 0 }}>
          <li style={{ color: step >= 1 ? (step > 1 ? '#28a745' : '#007bff') : '#333' }}>
            {step > 1 ? '\u2705' : step === 1 ? '\u23F3' : '\u25CB'}{' '}
            <code>GET /api/feed/upload-url?fileName=...</code>
            <br />
            <small>Obtener presigned URL de S3 para la imagen (solo si hay imagen)</small>
          </li>
          <li style={{ color: step >= 2 ? (step > 2 ? '#28a745' : '#007bff') : '#333' }}>
            {step > 2 ? '\u2705' : step === 2 ? '\u23F3' : '\u25CB'}{' '}
            <code>PUT [presigned URL]</code>
            <br />
            <small>Subir imagen directamente a S3</small>
          </li>
          <li style={{ color: step >= 3 ? (step > 3 ? '#28a745' : '#007bff') : '#333' }}>
            {step > 3 ? '\u2705' : step === 3 ? '\u23F3' : '\u25CB'}{' '}
            <code>POST /api/feed</code> {' '}
            <small>con <code>{`{ text, imageUrl? }`}</code></small>
            <br />
            <small>Crear el post en el backend (imageUrl es opcional)</small>
          </li>
        </ol>
      </div>

      {/* Área de composición */}
      <div style={{
        border: '1px solid #ddd',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        background: 'white',
      }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="¿Qué está pasando en el pasillo?"
          disabled={publishing}
          style={{
            width: '100%',
            minHeight: 100,
            border: 'none',
            outline: 'none',
            resize: 'vertical',
            fontSize: 15,
            fontFamily: 'sans-serif',
            boxSizing: 'border-box',
          }}
        />

        {/* Preview de imagen adjunta */}
        {imagePreview && (
          <div style={{ position: 'relative', marginTop: 12 }}>
            <img
              src={imagePreview}
              alt="Preview"
              style={{
                width: '100%',
                maxHeight: 300,
                objectFit: 'cover',
                borderRadius: 8,
                border: '1px solid #eee',
              }}
            />
            <button
              onClick={removeImage}
              disabled={publishing}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                background: 'rgba(0,0,0,0.6)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: 28,
                height: 28,
                cursor: 'pointer',
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              X
            </button>
          </div>
        )}

        {/* Barra de acciones */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 12,
          paddingTop: 12,
          borderTop: '1px solid #eee',
        }}>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={publishing}
              title="Adjuntar imagen"
              style={{
                padding: '6px 12px',
                fontSize: 13,
                cursor: publishing ? 'not-allowed' : 'pointer',
                borderRadius: 6,
                border: '1px solid #007bff',
                background: 'white',
                color: '#007bff',
              }}
            >
              Adjuntar imagen
            </button>
            {selectedFile && (
              <span style={{ marginLeft: 8, color: '#666', fontSize: 13 }}>
                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </span>
            )}
          </div>

          <button
            onClick={handlePublish}
            disabled={publishing || !user || (!text.trim() && !selectedFile)}
            style={{
              padding: '8px 20px',
              fontSize: 14,
              fontWeight: 'bold',
              cursor: (publishing || !user || (!text.trim() && !selectedFile)) ? 'not-allowed' : 'pointer',
              borderRadius: 20,
              border: 'none',
              background: (publishing || !user || (!text.trim() && !selectedFile)) ? '#ccc' : '#007bff',
              color: 'white',
            }}
          >
            {publishing ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </div>

      {/* Estado */}
      {status && (
        <div style={{
          padding: 12,
          borderRadius: 6,
          background: status.startsWith('Error') ? '#ffe0e0' : step === 10 ? '#e0ffe0' : '#e0ecff',
          color: status.startsWith('Error') ? '#c00' : step === 10 ? '#060' : '#003',
          fontFamily: 'monospace',
          fontSize: 13,
          whiteSpace: 'pre-wrap',
        }}>
          {status}
        </div>
      )}

      {/* Post creado */}
      {createdPost && (
        <div style={{
          marginTop: 24,
          border: '1px solid #ddd',
          borderRadius: 8,
          padding: 16,
          background: '#fafafa',
        }}>
          <h3 style={{ marginTop: 0 }}>Post creado:</h3>
          <pre style={{
            background: '#f0f0f0',
            padding: 12,
            borderRadius: 6,
            overflow: 'auto',
            fontSize: 12,
          }}>
            {JSON.stringify(createdPost, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
