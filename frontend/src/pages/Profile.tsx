import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { PostCard } from '../components/PostCard'

const S3_BASE_URL = import.meta.env.VITE_S3_BASE_URL || 'https://social-media-ufm-elpasillo.s3.amazonaws.com'

function resolvePhotoUrl(photo?: string): string | undefined {
  if (!photo) return undefined
  if (photo.startsWith('http')) return photo
  return `${S3_BASE_URL}/${photo}`
}

interface ProfileData {
  id: number
  name: string
  email: string
  profilePhoto?: string
  friends?: { id: number; name: string }[]
  receivedRequests?: unknown[]
  sentRequests?: unknown[]
}

interface Post {
  authorId: number
  postId: string
  text: string
  imageUrl?: string | null
  createdAt: string
  isRepost?: boolean
  repostedAt?: string
}

export function Profile() {
  const { id } = useParams<{ id: string }>()
  const { user, isAuthenticated, setAuth } = useAuthStore()
  const profileId = id || user?.id
  const isOwnProfile = !id || id === String(user?.id)

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [tab, setTab] = useState('posts')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const photoRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (profileId) loadProfile()
  }, [profileId])

  const loadProfile = async () => {
    setLoading(true)
    try {
      const [profileRes, postsRes] = await Promise.allSettled([
        api.get(`/profile/${profileId}`),
        api.get(`/api/posts/user/${profileId}`),
      ])

      if (profileRes.status === 'fulfilled') {
        const raw = profileRes.value.data.data || profileRes.value.data
        setProfile(
          raw.user
            ? { ...raw.user, friends: raw.friends, receivedRequests: raw.receivedRequests, sentRequests: raw.sentRequests }
            : raw
        )
      } else if (user && isOwnProfile) {
        setProfile({
          id: Number(user.id),
          name: user.name,
          email: user.email,
        })
      }

      if (postsRes.status === 'fulfilled') {
        const postsData = postsRes.value.data.data || postsRes.value.data
        setPosts(Array.isArray(postsData) ? postsData : [])
      }
    } catch {
      if (user && isOwnProfile) {
        setProfile({
          id: Number(user.id),
          name: user.name,
          email: user.email,
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.id) return
    setUploading(true)
    try {
      const { data: uploadData } = await api.get('/api/users/upload-url', {
        params: { fileName: file.name },
      })
      const { url, key } = uploadData.data
      await fetch(url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      })
      await api.put(`/api/users/${user.id}/profile-photo`, { profilePhoto: key })
      setAuth({ ...user, profilePhoto: key }, useAuthStore.getState().token || '')
      loadProfile()
    } catch (err) {
      console.error('Error subiendo foto de perfil:', err)
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="empty-state">
        <div className="empty-state-title">Usuario no encontrado</div>
      </div>
    )
  }

  const displayName = profile.name || 'Usuario'
  const friendCount = profile.friends?.length || 0

  return (
    <>
      <div className="page-header">
        <div className="page-title">{displayName}</div>
      </div>

      {/* Banner */}
      <div className="profile-banner" />

      {/* Profile info */}
      <div className="profile-info">
        <div className="profile-avatar-row">
          <div
            className="avatar avatar-xl"
            onClick={() => isOwnProfile && photoRef.current?.click()}
            style={{ cursor: isOwnProfile ? 'pointer' : 'default' }}
            title={isOwnProfile ? 'Cambiar foto de perfil' : ''}
          >
            {resolvePhotoUrl(profile.profilePhoto) ? (
              <img src={resolvePhotoUrl(profile.profilePhoto)} alt={displayName} />
            ) : (
              displayName[0]!.toUpperCase()
            )}
          </div>
          {isOwnProfile && isAuthenticated && (
            <>
              <input
                ref={photoRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />
              <button
                className="profile-edit-btn"
                disabled={uploading}
                onClick={() => photoRef.current?.click()}
              >
                {uploading ? 'Subiendo...' : 'Cambiar foto'}
              </button>
            </>
          )}
          {!isOwnProfile && isAuthenticated && (
            <button className="btn-follow follow" style={{ marginTop: 76 }}>
              Seguir
            </button>
          )}
        </div>

        <div className="profile-name">{displayName}</div>
        <div className="profile-handle">{profile.email}</div>
        <div className="profile-bio">Estudiante universitario en Guatemala</div>
        <div className="profile-stats">
          <span>
            <span className="profile-stat-value">{friendCount}</span>{' '}
            <span style={{ color: 'var(--text-secondary)' }}>Amigos</span>
          </span>
          <span>
            <span className="profile-stat-value">{posts.length}</span>{' '}
            <span style={{ color: 'var(--text-secondary)' }}>Posts</span>
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="page-tabs">
        <button
          className={`page-tab ${tab === 'posts' ? 'active' : ''}`}
          onClick={() => setTab('posts')}
        >
          Posts
        </button>
        <button
          className={`page-tab ${tab === 'likes' ? 'active' : ''}`}
          onClick={() => setTab('likes')}
        >
          Me gusta
        </button>
      </div>

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">Sin posts</div>
          <p>{isOwnProfile ? 'Aun no has publicado nada' : 'Este usuario no tiene posts'}</p>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={`${post.authorId}-${post.postId}-${post.isRepost ? post.repostedAt ?? 'r' : 'own'}`}
            authorId={post.authorId}
            postId={post.postId}
            authorName={
              post.isRepost ? `Usuario ${post.authorId}` : displayName
            }
            text={post.text}
            imageUrl={post.imageUrl}
            createdAt={post.createdAt}
            isRepost={post.isRepost}
            repostedAt={post.repostedAt}
          />
        ))
      )}
    </>
  )
}
