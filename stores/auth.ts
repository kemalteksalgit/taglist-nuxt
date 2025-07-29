// stores/auth.ts
import { defineStore } from 'pinia'
import { secureStorage, authRateLimiter, generateCSRFToken } from '~/utils/security'

// Enhanced encryption utility
const encryptData = (data: string): string => {
  // Simple base64 encoding for now - replace with proper encryption in production
  try {
    return btoa(data)
  } catch {
    return data
  }
}

const decryptData = (encryptedData: string): string => {
  try {
    return atob(encryptedData)
  } catch {
    return encryptedData
  }
}

// API Response types
interface LoginResponse {
  user: User
  token: string
  refreshToken: string
  expiresIn: number
}

interface RefreshResponse {
  token: string
  expiresIn: number
}

export interface User {
  id: string
  email: string
  username: string
  fullName: string
  avatar?: string
  phone?: string
  isVerified: boolean
  isEmailVerified: boolean
  isPhoneVerified: boolean
  createdAt: string
  lastLoginAt?: string
  profile: {
    bio?: string
    location?: string
    dateOfBirth?: string
    gender?: 'male' | 'female' | 'other'
    preferences: {
      notifications: boolean
      marketing: boolean
      sms: boolean
    }
  }
  stats: {
    totalSales: number
    totalPurchases: number
    rating: number
    reviewCount: number
  }
}

export interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  sessionExpiry: number | null
  loginAttempts: number
  lastLoginAttempt: number | null
  isLocked: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    sessionExpiry: null,
    loginAttempts: 0,
    lastLoginAttempt: null,
    isLocked: false
  }),

  getters: {
    isLoggedIn: (state) => state.isAuthenticated && !!state.user && !state.isLocked,
    userInitials: (state) => {
      if (!state.user) return ''
      const names = state.user.fullName.split(' ')
      return names.map(name => name.charAt(0)).join('').toUpperCase()
    },
    userRating: (state) => state.user?.stats.rating || 0,
    canSell: (state) => state.user?.isVerified || false,
    isSessionValid: (state) => {
      if (!state.sessionExpiry) return false
      return Date.now() < state.sessionExpiry
    },
    isAccountLocked: (state) => {
      if (!state.lastLoginAttempt) return false
      const lockoutDuration = 15 * 60 * 1000 // 15 minutes
      return state.loginAttempts >= 5 && (Date.now() - state.lastLoginAttempt) < lockoutDuration
    }
  },

  actions: {
    // Check if account is locked
    checkAccountLock() {
      this.isLocked = this.isAccountLocked
      if (this.isLocked) {
        this.error = 'Account temporarily locked due to multiple failed login attempts. Please try again later.'
      }
    },

    // Login with enhanced security
    async login(credentials: { email: string; password: string; rememberMe?: boolean }) {
      // Check if account is locked
      this.checkAccountLock()
      if (this.isLocked) {
        return { success: false, error: this.error }
      }

      this.isLoading = true
      this.error = null

      try {
        // Record login attempt
        this.lastLoginAttempt = Date.now()

        // Input validation
        if (!credentials.email || !credentials.password) {
          throw new Error('Email and password are required')
        }

        if (!/\S+@\S+\.\S+/.test(credentials.email)) {
          throw new Error('Please enter a valid email address')
        }

        // Rate limiting check
        const userIp = 'user-login' // In production, use real IP
        if (!authRateLimiter.isAllowed(userIp)) {
          throw new Error('Too many login attempts. Please try again later.')
        }

        // Simulate API call with proper error handling
        const response = await $fetch('/api/auth/login', {
          method: 'POST',
          body: {
            email: credentials.email.toLowerCase().trim(),
            password: credentials.password,
            rememberMe: credentials.rememberMe || false,
            csrfToken: generateCSRFToken()
          }
        }).catch((error) => {
          // Handle API errors
          if (error.status === 401) {
            this.loginAttempts++
            throw new Error('Invalid email or password')
          } else if (error.status === 429) {
            throw new Error('Too many login attempts. Please try again later.')
          } else if (error.status === 423) {
            throw new Error('Account is locked. Please contact support.')
          } else {
            throw new Error('Login failed. Please try again.')
          }
        }) as LoginResponse

        // Reset login attempts on successful login
        this.loginAttempts = 0
        this.lastLoginAttempt = null
        this.isLocked = false

        // Set session data
        this.user = response.user
        this.token = response.token
        this.refreshToken = response.refreshToken
        this.isAuthenticated = true
        this.sessionExpiry = Date.now() + (response.expiresIn * 1000)

        // Secure storage
        if (process.client) {
          const sessionData = {
            token: this.token,
            refreshToken: this.refreshToken,
            expiry: this.sessionExpiry,
            user: this.user
          }

          if (credentials.rememberMe) {
            // Store in localStorage for persistent session
            localStorage.setItem('auth-session', encryptData(JSON.stringify(sessionData)))
          } else {
            // Store in sessionStorage for session-only
            sessionStorage.setItem('auth-session', encryptData(JSON.stringify(sessionData)))
          }
        }

        return { success: true }
      } catch (error: any) {
        this.error = error.message
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    // Register
    async register(userData: {
      email: string
      password: string
      fullName: string
      phone: string
      acceptTerms: boolean
    }) {
      this.isLoading = true
      this.error = null

      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Mock registration
        const newUser: User = {
          id: Date.now().toString(),
          email: userData.email,
          username: userData.email?.split('@')[0] || `user${Date.now()}`,
          fullName: userData.fullName,
          phone: userData.phone,
          isVerified: false,
          isEmailVerified: false,
          isPhoneVerified: false,
          createdAt: new Date().toISOString(),
          profile: {
            preferences: {
              notifications: true,
              marketing: true,
              sms: true
            }
          },
          stats: {
            totalSales: 0,
            totalPurchases: 0,
            rating: 0,
            reviewCount: 0
          }
        }

        this.user = newUser
        this.token = 'mock-jwt-token-' + Date.now()
        this.isAuthenticated = true

        // Store in localStorage
        if (process.client) {
          localStorage.setItem('auth-token', this.token)
          localStorage.setItem('user', JSON.stringify(this.user))
        }

        return { success: true }
      } catch (error) {
        this.error = 'Kayıt başarısız. Lütfen tekrar deneyin.'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    // Logout with cleanup
    logout() {
      this.user = null
      this.token = null
      this.refreshToken = null
      this.isAuthenticated = false
      this.sessionExpiry = null
      this.error = null
      this.loginAttempts = 0
      this.lastLoginAttempt = null
      this.isLocked = false

      // Clear all storage
      if (process.client) {
        localStorage.removeItem('auth-session')
        sessionStorage.removeItem('auth-session')
        
        // Clear all auth-related cookies
        document.cookie.split(";").forEach(cookie => {
          const eqPos = cookie.indexOf("=")
          const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
          if (name.trim().startsWith('auth-')) {
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"
          }
        })
      }

      // Redirect to home
      navigateTo('/')
    },

    // Initialize auth from storage with validation
    initAuth() {
      if (!process.client) return

      try {
        // Try localStorage first (remember me)
        let sessionData = localStorage.getItem('auth-session')
        if (!sessionData) {
          // Try sessionStorage (session only)
          sessionData = sessionStorage.getItem('auth-session')
        }

        if (sessionData) {
          const decrypted = decryptData(sessionData)
          const parsed = JSON.parse(decrypted)
          
          // Validate session expiry
          if (parsed.expiry && Date.now() < parsed.expiry) {
            this.token = parsed.token
            this.refreshToken = parsed.refreshToken
            this.user = parsed.user
            this.sessionExpiry = parsed.expiry
            this.isAuthenticated = true
            
            // Schedule token refresh if needed
            this.scheduleTokenRefresh()
          } else {
            // Session expired, clear storage
            this.logout()
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth from storage:', error)
        this.logout()
      }
    },

    // Token refresh
    async refreshAuthToken() {
      if (!this.refreshToken) {
        this.logout()
        return false
      }

      try {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ refreshToken: this.refreshToken })
        })

        if (!response.ok) {
          throw new Error('Refresh failed')
        }

        const data = await response.json() as RefreshResponse

        this.token = data.token
        this.sessionExpiry = Date.now() + (data.expiresIn * 1000)
        
        // Update storage
        if (process.client) {
          const sessionData = {
            token: this.token,
            refreshToken: this.refreshToken,
            expiry: this.sessionExpiry,
            user: this.user
          }
          
          // Update both storages if they exist
          const localStorage_session = localStorage.getItem('auth-session')
          const sessionStorage_session = sessionStorage.getItem('auth-session')
          
          if (localStorage_session) {
            localStorage.setItem('auth-session', encryptData(JSON.stringify(sessionData)))
          }
          if (sessionStorage_session) {
            sessionStorage.setItem('auth-session', encryptData(JSON.stringify(sessionData)))
          }
        }

        this.scheduleTokenRefresh()
        return true
      } catch (error) {
        console.error('Token refresh failed:', error)
        this.logout()
        return false
      }
    },

    // Schedule automatic token refresh
    scheduleTokenRefresh() {
      if (!this.sessionExpiry) return

      const refreshTime = this.sessionExpiry - Date.now() - (5 * 60 * 1000) // 5 minutes before expiry
      
      if (refreshTime > 0) {
        setTimeout(() => {
          this.refreshAuthToken()
        }, refreshTime)
      }
    },

    // Update profile
    async updateProfile(updates: Partial<User>) {
      if (!this.user) return { success: false, error: 'Not authenticated' }

      this.isLoading = true
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        this.user = { ...this.user, ...updates }

        // Update localStorage
        if (process.client) {
          localStorage.setItem('user', JSON.stringify(this.user))
        }

        return { success: true }
      } catch (error) {
        this.error = 'Profil güncellenirken hata oluştu'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    // Verify email
    async verifyEmail(code: string) {
      this.isLoading = true
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        if (this.user) {
          this.user.isEmailVerified = true
          
          // Update localStorage
          if (process.client) {
            localStorage.setItem('user', JSON.stringify(this.user))
          }
        }

        return { success: true }
      } catch (error) {
        this.error = 'E-posta doğrulama başarısız'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    // Forgot password
    async forgotPassword(email: string) {
      this.isLoading = true
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        return { success: true }
      } catch (error) {
        this.error = 'Şifre sıfırlama e-postası gönderilemedi'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    // Reset password
    async resetPassword(token: string, newPassword: string) {
      this.isLoading = true
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        return { success: true }
      } catch (error) {
        this.error = 'Şifre sıfırlama başarısız'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    // Clear error
    clearError() {
      this.error = null
    }
  }
})
