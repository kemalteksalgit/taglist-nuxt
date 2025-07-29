// types/personalization.ts
export interface UserPreferences {
  categories: string[]
  brands: string[]
  priceRange: { min: number; max: number }
  colors: string[]
}

export interface UserProfile {
  id: string
  preferences: UserPreferences
  created: Date
  lastActive: Date
  segment?: string
  personality?: UserPersonality
}

export interface UserPersonality {
  openness: number
  conscientiousness: number
  extraversion: number
  agreeableness: number
  neuroticism: number
}

export interface UserBehavior {
  userId: string
  action: string
  productId?: string
  category?: string
  brand?: string
  timestamp: Date
  type?: string
  metadata?: Record<string, any>
}

export interface RecommendationRequest {
  userId: string
  context: string
  limit?: number
  filters?: {
    categories?: string[]
    brands?: string[]
    priceRange?: { min: number; max: number }
    excludeProducts?: string[]
  }
}

export interface PersonalizedRecommendations {
  userId: string
  context: string
  products: RecommendedProduct[]
  confidence: number
  explanation: string
  timestamp: Date
}

export interface RecommendedProduct {
  id: string
  title: string
  category: string
  brand: string
  price: number
  score: number
  reasons: string[]
  similarity: number
}
