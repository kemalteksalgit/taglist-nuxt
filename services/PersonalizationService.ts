// services/PersonalizationService.ts - Minimal Clean Implementation
import type { 
  UserProfile, 
  UserBehavior, 
  RecommendationRequest, 
  PersonalizedRecommendations 
} from '~/types/personalization'

// Export additional types that components need
export type PersonalizedProduct = {
  id: string
  title: string
  price: number
  image: string
  category: string
  relevanceScore: number
  personalityScore: number
  trendingScore: number
  reasons: string[]
  brand?: string
  tags?: string[]
  metadata?: {
    viewedBy: number
    likedBy: number
    averageRating: number
    freshness: number
  }
  similarityScore?: number
}

export type PersonalizationQuery = {
  userId: string
  limit?: number
  category?: string
  context: string | { page: string; category?: string; searchQuery?: string; previousProducts?: string[] }
  preferences?: UserPreferences
  behaviorHistory?: UserBehavior[]
}

export type PersonalizedResult = {
  recommendations: PersonalizedProduct[]
  total: number
  confidence: number
  products?: PersonalizedProduct[] // Alias for recommendations
  segments?: string[]
  freshness?: number
  diversity?: number
  timing?: {
    dataProcessing: number
    modelInference: number
    total: number
  }
}

export type BehaviorEvent = {
  id: string
  userId: string
  action: string
  productId?: string
  timestamp: Date
}

export class PersonalizationService {
  private profiles = new Map<string, UserProfile>()

  // Create user profile (public method for testing)
  async createUserProfile(userId: string): Promise<UserProfile> {
    const profile: UserProfile = {
      id: userId,
      preferences: {
        categories: [],
        brands: [],
        priceRange: { min: 0, max: 10000 },
        colors: []
      },
      created: new Date(),
      lastActive: new Date()
    }
    
    this.profiles.set(userId, profile)
    return profile
  }

  // Get user profile
  getUserProfile(userId: string): UserProfile | undefined {
    return this.profiles.get(userId)
  }

  // Track behavior - takes UserBehavior object directly 
  trackBehavior(behavior: UserBehavior): void {
    const profile = this.profiles.get(behavior.userId)
    if (profile) {
      profile.lastActive = new Date()
    }
  }

  // Get recommendations
  async getRecommendations(userId: string, context: string, limit = 5): Promise<PersonalizedRecommendations> {
    // TODO: Implement actual recommendation logic with API calls
    return {
      userId,
      context,
      products: [],
      confidence: 0.8,
      explanation: 'Mock recommendations - API not implemented yet',
      timestamp: new Date()
    }
  }

  // Get personalized recommendations (for PersonalizedRecommendations component)
  async getPersonalizedRecommendations(query: PersonalizationQuery): Promise<PersonalizedResult> {
    // Mock implementation
    const mockProducts: PersonalizedProduct[] = [
      {
        id: '1',
        title: 'Sample Product',
        price: 100,
        image: '/placeholder.jpg',
        category: 'Electronics',
        relevanceScore: 0.8,
        personalityScore: 0.7,
        trendingScore: 0.9,
        reasons: ['Based on your recent views', 'Popular in your area']
      }
    ]

    return {
      recommendations: mockProducts.slice(0, query.limit || 5),
      total: mockProducts.length,
      confidence: 0.8
    }
  }

  // Get analytics 
  getAnalytics(userId: string): { profileCompleteness: number } | null {
    const profile = this.profiles.get(userId)
    if (!profile) {
      return null
    }
    
    // Simple completeness calculation
    let completeness = 30 // Base score for having a profile
    if (profile.preferences.categories.length > 0) completeness += 20
    if (profile.preferences.brands.length > 0) completeness += 20
    if (profile.preferences.colors.length > 0) completeness += 30
    
    return { profileCompleteness: Math.min(completeness, 100) }
  }

  // Initialize user data if needed
  async initializeUser(userId: string): Promise<UserProfile> {
    const existing = this.profiles.get(userId)
    if (existing) {
      return existing
    }
    return this.createUserProfile(userId)
  }

  // Clear user data
  clearUserData(userId: string): void {
    this.profiles.delete(userId)
  }

  // Get all profiles (for testing)
  getAllProfiles(): UserProfile[] {
    return Array.from(this.profiles.values())
  }
}

// Export singleton instance
export const personalizationService = new PersonalizationService()
export default PersonalizationService
