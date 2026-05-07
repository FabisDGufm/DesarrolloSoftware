import { useState, useRef, useEffect } from 'react'
import { api } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { PostCard } from '../components/PostCard'

interface Post {
  authorId: number
  postId: string
  text: string
  imageUrl?: string | null
  createdAt: string
  authorName?: string
  university?: string | null
}

type Tab = 'foryou' | 'university' | 'following'

export function Home() {
  const { user, isAuthenticated } = useAuthStore()
  const [tab, setTab] = useState<Tab>('foryou')
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  const [composeText, setComposeText] = useState('')
  const [composeFile, setComposeFile] = useState<File | null>(null)
  const [composePreview, setComposePreview] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadFeed()
  }, [tab])

  const loadFeed = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/posts/social-feed')
      const feedData = data.data || data
      setPosts(Array.isArray(feedData) ? feedData : [])
    } catch {
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    setComposeFile(file)
    const reader = new FileReader()
    reader.onload = () => setComposePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setComposeFile(null)
    setComposePreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handlePublish = async () => {
    if (!isAuthenticated || (!composeText.trim() && !composeFile)) return
    setPublishing(true)
    try {
      let imageUrl: string | undefined
      if (composeFile) {
        const { data: uploadData } = await api.get('/api/posts/upload-url', {
          params: { fileName: composeFile.name },
        })
        const { url, key } = uploadData.data
        await fetch(url, {
          method: 'PUT',
          body: composeFile,
          headers: { 'Content-Type': composeFile.type },
        })
        imageUrl = key
      }
      await api.post('/api/posts', { text: composeText.trim(), imageUrl })
      setComposeText('')
      removeImage()
      loadFeed()
    } catch {
      // silently fail
    } finally {
      setPublishing(false)
    }
  }

  // Filter posts by tab
  const filteredPosts = tab === 'university'
    ? posts.filter((p) => p.university && p.university === (user as unknown as { university?: string })?.university)
    : posts

  return (
    <>
      <div className="page-header">
        <div className="page-title">Inicio</div>
        <div className="page-tabs">
          <button
            className={`page-tab ${tab === 'foryou' ? 'active' : ''}`}
            onClick={() => setTab('foryou')}
          >
            Para ti
          </button>
          <button
            className={`page-tab ${tab === 'university' ? 'active' : ''}`}
            onClick={() => setTab('university')}
          >
            Tu Universidad
          </button>
          <button
            className={`page-tab ${tab === 'following' ? 'active' : ''}`}
            onClick={() => setTab('following')}
          >
            Siguiendo
          </button>
        </div>
      </div>

      {/* University tab banner */}
      {tab === 'university' && (
        <div style={{
          padding: '20px',
          borderBottom: '1px solid var(--border-color)',
          background: 'linear-gradient(135deg, rgba(232,168,56,0.08), rgba(91,141,239,0.06))',
        }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            marginBottom: 4,
          }}>
            Tu Universidad
          </div>
          <div style={{
            fontSize: 13,
            color: 'var(--text-muted)',
            lineHeight: 1.4,
          }}>
            Posts de tus companeros de U. Solo veras publicaciones de estudiantes de tu misma universidad.
          </div>
        </div>
      )}

      {isAuthenticated && (
        <div className="compose-area">
          <div className="avatar">
            {(user?.name || '?')[0]!.toUpperCase()}
          </div>
          <div className="compose-input">
            <textarea
              value={composeText}
              onChange={(e) => setComposeText(e.target.value)}
              placeholder={tab === 'university' ? 'Comparte algo con tu U...' : 'Que esta pasando en el pasillo?'}
              disabled={publishing}
            />
            {composePreview && (
              <div className="compose-image-preview">
                <img src={composePreview} alt="Preview" />
                <button className="compose-image-remove" onClick={removeImage}>
                  X
                </button>
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
                  title="Imagen"
                >
                  &#128247;
                </button>
              </div>
              <button
                className="compose-submit"
                onClick={handlePublish}
                disabled={publishing || (!composeText.trim() && !composeFile)}
              >
                {publishing ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner" />
        </div>
      ) : tab === 'university' && filteredPosts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">Sin posts de tu U</div>
          <p style={{ marginTop: 4 }}>
            Aun no hay publicaciones de companeros de tu universidad. Se el primero en compartir algo.
          </p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">No hay posts aun</div>
          <p>Se el primero en publicar algo en El Pasillo</p>
        </div>
      ) : (
        filteredPosts.map((post) => (
          <PostCard
            key={`${post.authorId}-${post.postId}`}
            authorId={post.authorId}
            postId={post.postId}
            authorName={post.authorName}
            text={post.text}
            imageUrl={post.imageUrl}
            createdAt={post.createdAt}
          />
        ))
      )}
    </>
  )
}
