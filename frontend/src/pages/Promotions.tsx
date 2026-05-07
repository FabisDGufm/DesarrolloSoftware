import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { PromotionCard } from '../components/PromotionCard'
import type { Promotion } from '../types'

export function Promotions() {
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
        <div className="page-title">
          Emprendimientos
        </div>
      </div>

      <div
        style={{
          padding: 20,
          borderBottom: '1px solid var(--border-color)',
          background: 'rgba(91,141,239,0.05)',
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