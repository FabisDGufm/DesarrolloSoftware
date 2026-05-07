export interface User {
  id: string
  email: string
  name: string
  university?: string
  createdAt: string
}

export interface Post {
  id: string
  content: string
  authorId: string
  author?: User
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface Promotion {
  promotionId: string
  userId: number

  title: string
  description: string

  price?: number | null

  contact: string

  imageUrl?: string | null

  university?: string | null

  createdAt: string
}
