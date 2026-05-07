import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { PromotionCard } from '../components/PromotionCard'
import type { Promotion } from '../types'

export function Promotions() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPromotions()
  }, [])

  const loadPromotions = async () => {
    try {
      const { data } = await api.get('/api/promotions/feed')

      setPromotions(data.data || [])
    } catch {
      setPromotions([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="page-title">Emprendimientos</div>
          {isAuthenticated && (
            <button className="top-bar-publish" onClick={() => navigate('/create-promotion')} style={{ margin: '8px 0' }}>
              + Promocionate
            </button>
          )}
        </div>
      </div>

      <div
        style={{
          padding: 20,
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--primary-muted)',
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            marginBottom: 6,
          }}
        >
          Marketplace estudiantil
        </div>

        <div
          style={{
            color: 'var(--text-secondary)',
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          Descubre emprendimientos y negocios creados por estudiantes.
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner" />
        </div>
      ) : promotions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">
            No hay promociones
          </div>

          <p>
            Aun no existen emprendimientos publicados.
          </p>
        </div>
      ) : (
        promotions.map((promotion) => (
          <PromotionCard
            key={`${promotion.userId}-${promotion.promotionId}`}
            title={promotion.title}
            description={promotion.description}
            imageUrl={promotion.imageUrl}
            price={promotion.price}
            contact={promotion.contact}
            university={promotion.university}
            createdAt={promotion.createdAt}
          />
        ))
      )}
    </>
  )
}