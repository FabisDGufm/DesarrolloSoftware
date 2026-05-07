import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { useAuthStore } from '../stores/authStore'

export function CreatePromotion() {
  const navigate = useNavigate()

  const { user, isAuthenticated } = useAuthStore()

  const fileRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [contact, setContact] = useState('')
  const [price, setPrice] = useState('')

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null)

  const [imagePreview, setImagePreview] =
    useState<string | null>(null)

  const [publishing, setPublishing] = useState(false)

  const [status, setStatus] = useState('')

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    const file = e.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
      setStatus('Selecciona una imagen valida')
      return
    }

    setSelectedFile(file)

    const reader = new FileReader()

    reader.onload = () => {
      setImagePreview(reader.result as string)
    }

    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setSelectedFile(null)
    setImagePreview(null)

    if (fileRef.current) {
      fileRef.current.value = ''
    }
  }

  const handlePublish = async () => {

    if (
      !title.trim() ||
      !description.trim() ||
      !contact.trim()
    ) {
      setStatus('Completa todos los campos')
      return
    }

    setPublishing(true)

    try {

      let imageUrl: string | undefined

      if (selectedFile) {

        setStatus('Subiendo imagen...')

        const { data: uploadData } =
          await api.get('/api/promotions/upload-url', {
            params: {
              fileName: selectedFile.name,
            },
          })

        const { url, key } = uploadData.data

        await fetch(url, {
          method: 'PUT',
          body: selectedFile,
          headers: {
            'Content-Type': selectedFile.type,
          },
        })

        imageUrl = key
      }

      setStatus('Publicando...')

      await api.post('/api/promotions', {
        title,
        description,
        contact,
        imageUrl,
        price: price ? Number(price) : undefined,
      })

      navigate('/promotions')

    } catch {
      setStatus('Error al publicar')
    } finally {
      setPublishing(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="empty-state">
        <div className="empty-state-title">
          Inicia sesion
        </div>

        <p>
          Necesitas iniciar sesion para publicar.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="page-header">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <button
              onClick={() => navigate(-1)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 20,
                color: 'var(--text-primary)',
              }}
            >
              ←
            </button>

            <div className="page-title">
              Crear emprendimiento
            </div>
          </div>

          <button
            className="compose-submit"
            disabled={publishing}
            onClick={handlePublish}
          >
            {publishing ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </div>

      <div
        style={{
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nombre del emprendimiento"
          className="search-bar"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe tu producto o servicio"
          style={{
            minHeight: 140,
            resize: 'vertical',
            padding: 16,
            borderRadius: 14,
            border: '1px solid var(--border-color)',
            background: 'var(--background-secondary)',
            color: 'var(--text-primary)',
          }}
        />

        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Precio (opcional)"
          type="number"
          className="search-bar"
        />

        <input
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Telefono, Instagram, WhatsApp..."
          className="search-bar"
        />

        {imagePreview && (
          <div className="compose-image-preview">
            <img src={imagePreview} alt="Preview" />

            <button
              className="compose-image-remove"
              onClick={removeImage}
            >
              X
            </button>
          </div>
        )}

        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />

          <button
            className="compose-tool-btn"
            onClick={() => fileRef.current?.click()}
          >
            Agregar imagen
          </button>
        </div>

        {status && (
          <div
            style={{
              fontSize: 14,
              color: 'var(--accent)',
            }}
          >
            {status}
          </div>
        )}

        <div
          style={{
            fontSize: 13,
            color: 'var(--text-muted)',
          }}
        >
          Publicado como {user?.name}
        </div>
      </div>
    </>
  )
}