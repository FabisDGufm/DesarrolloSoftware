import { useState, useRef } from 'react'
import { api } from '../services/api'
import { useAuthStore } from '../stores/authStore'

const S3_BASE_URL = import.meta.env.VITE_S3_BASE_URL || ''

export function ProfilePhotoUpload() {
  const { user } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [preview, setPreview] = useState<string | null>(null)
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState<string>('')
  const [step, setStep] = useState<number>(0)

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
    setStep(0)

    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!selectedFile || !user) {
      setStatus('Selecciona una imagen y asegúrate de estar autenticado.')
      return
    }

    setUploading(true)
    setStatus('')

    try {
      // Paso 1: Obtener presigned URL de S3
      setStep(1)
      setStatus('Paso 1/3: Obteniendo URL de subida desde S3...')
      const { data: uploadData } = await api.get('/api/users/upload-url', {
        params: { fileName: selectedFile.name },
      })
      const { url, key } = uploadData.data
      setStatus(`Paso 1/3 completado. Key: ${key}`)

      // Paso 2: Subir imagen directamente a S3
      setStep(2)
      setStatus('Paso 2/3: Subiendo imagen a S3...')
      await fetch(url, {
        method: 'PUT',
        body: selectedFile,
        headers: { 'Content-Type': selectedFile.type },
      })
      setStatus('Paso 2/3 completado. Imagen subida a S3.')

      // Paso 3: Guardar referencia en el backend
      setStep(3)
      setStatus('Paso 3/3: Guardando referencia en el servidor...')
      const photoUrl = S3_BASE_URL ? `${S3_BASE_URL}/${key}` : key
      await api.put(`/api/users/${user.id}/profile-photo`, {
        profilePhoto: photoUrl,
      })

      setCurrentPhoto(photoUrl)
      setStatus('Foto de perfil actualizada correctamente.')
      setStep(4)
      setSelectedFile(null)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      setStatus(`Error: ${message}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>
      <h1>Subir Foto de Perfil</h1>

      {user ? (
        <p style={{ color: '#666' }}>
          Usuario: <strong>{user.name}</strong> (ID: {user.id})
        </p>
      ) : (
        <p style={{ color: '#c00' }}>
          No hay usuario autenticado. Inicia sesión primero.
        </p>
      )}

      {/* Diagrama del flujo */}
      <div style={{
        background: '#f5f5f5',
        borderRadius: 8,
        padding: 16,
        marginBottom: 24,
        border: '1px solid #ddd',
      }}>
        <h3 style={{ marginTop: 0 }}>Flujo de subida (Presigned URL con S3)</h3>
        <ol style={{ lineHeight: 1.8 }}>
          <li style={{ color: step >= 1 ? (step > 1 ? '#28a745' : '#007bff') : '#333' }}>
            {step > 1 ? '\u2705' : step === 1 ? '\u23F3' : '\u25CB'}{' '}
            <code>GET /api/users/upload-url?fileName=...</code>
            <br />
            <small>El backend genera una presigned URL de S3 (válida 5 min)</small>
          </li>
          <li style={{ color: step >= 2 ? (step > 2 ? '#28a745' : '#007bff') : '#333' }}>
            {step > 2 ? '\u2705' : step === 2 ? '\u23F3' : '\u25CB'}{' '}
            <code>PUT [presigned URL]</code> con el archivo
            <br />
            <small>El frontend sube la imagen directamente a S3 (sin pasar por el backend)</small>
          </li>
          <li style={{ color: step >= 3 ? (step > 3 ? '#28a745' : '#007bff') : '#333' }}>
            {step > 3 ? '\u2705' : step === 3 ? '\u23F3' : '\u25CB'}{' '}
            <code>PUT /api/users/:id/profile-photo</code>
            <br />
            <small>El backend guarda la referencia (key/URL) de la foto en la base de datos</small>
          </li>
        </ol>
      </div>

      {/* Fotos: actual y preview */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 24, flexWrap: 'wrap' }}>
        {currentPhoto && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontWeight: 'bold', marginBottom: 8 }}>Foto actual</p>
            <img
              src={currentPhoto.startsWith('http') ? currentPhoto : `${S3_BASE_URL}/${currentPhoto}`}
              alt="Foto de perfil actual"
              style={{ width: 150, height: 150, borderRadius: '50%', objectFit: 'cover', border: '3px solid #28a745' }}
            />
          </div>
        )}
        {preview && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontWeight: 'bold', marginBottom: 8 }}>Preview</p>
            <img
              src={preview}
              alt="Preview"
              style={{ width: 150, height: 150, borderRadius: '50%', objectFit: 'cover', border: '3px solid #007bff' }}
            />
          </div>
        )}
      </div>

      {/* Input de archivo */}
      <div style={{ marginBottom: 16 }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{
            padding: '10px 20px',
            fontSize: 14,
            cursor: uploading ? 'not-allowed' : 'pointer',
            borderRadius: 6,
            border: '1px solid #007bff',
            background: 'white',
            color: '#007bff',
            marginRight: 8,
          }}
        >
          Seleccionar imagen
        </button>
        <button
          onClick={handleUpload}
          disabled={uploading || !selectedFile || !user}
          style={{
            padding: '10px 20px',
            fontSize: 14,
            cursor: (uploading || !selectedFile || !user) ? 'not-allowed' : 'pointer',
            borderRadius: 6,
            border: 'none',
            background: (uploading || !selectedFile || !user) ? '#ccc' : '#007bff',
            color: 'white',
          }}
        >
          {uploading ? 'Subiendo...' : 'Subir foto'}
        </button>
      </div>

      {selectedFile && (
        <p style={{ color: '#666', fontSize: 14 }}>
          Archivo: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
        </p>
      )}

      {/* Estado */}
      {status && (
        <div style={{
          padding: 12,
          borderRadius: 6,
          marginTop: 16,
          background: status.startsWith('Error') ? '#ffe0e0' : step === 4 ? '#e0ffe0' : '#e0ecff',
          color: status.startsWith('Error') ? '#c00' : step === 4 ? '#060' : '#003',
          fontFamily: 'monospace',
          fontSize: 13,
          whiteSpace: 'pre-wrap',
        }}>
          {status}
        </div>
      )}
    </div>
  )
}
