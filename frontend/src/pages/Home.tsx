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
      let data: any

      // 🔥 POSTS NORMALES
      if (tab === 'foryou') {
        const res = await api.get('/api/posts/social-feed')
        data = res.data.data || res.data
      }

      // 🎓 UNIVERSIDAD
      else if (tab === 'university') {
        const res = await api.get('/api/posts/social-feed')
        const feed = res.data.data || res.data

        data = Array.isArray(feed)
          ? feed.filter(
              (p: Post) => p.university && p.university === user?.university
            )
          : []
      }

      
      else if (tab === 'following') {
        // 1. obtener amigos
        const friendsRes = await api.get(
          `/api/user-relations/${user?.id}/friends`
        )

        const friendIds: number[] =
          friendsRes.data.data || friendsRes.data || []

        if (!friendIds.length) {
          setPosts([])
          setLoading(false)
          return
        }

        // 2. traer posts de esos amigos
        const postsRes = await api.post('/api/posts/by-authors', {
          authorIds: friendIds,
        })

        data = postsRes.data.data || postsRes.data
      }

      setPosts(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
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

      await api.post('/api/posts', {
        text: composeText.trim(),
        imageUrl,
      })

      setComposeText('')
      removeImage()
      loadFeed()
    } finally {
      setPublishing(false)
    }
  }

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

      {/* COMPOSE */}
      {isAuthenticated && (
        <div className="compose-area">
          <div className="avatar">
            {(user?.name || '?')[0]!.toUpperCase()}
          </div>

          <div className="compose-input">
            <textarea
              value={composeText}
              onChange={(e) => setComposeText(e.target.value)}
              placeholder="Que esta pasando en el pasillo?"
              disabled={publishing}
            />

            {composePreview && (
              <div className="compose-image-preview">
                <img src={composePreview} alt="preview" />
                <button className="compose-image-remove" onClick={removeImage}>
                  X
                </button>
              </div>
            )}

            <div className="compose-toolbar">
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
              >
                📷
              </button>

              <button
                className="compose-submit"
                onClick={handlePublish}
                disabled={publishing}
              >
                Publicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FEED */}
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner" />
        </div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">No hay posts</div>
        </div>
      ) : (
        posts.map((post) => (
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