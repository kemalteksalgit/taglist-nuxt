// 2025 Design System - UI Tokens & Constants
// Taglist Modern Interface Standards

export const uiTokens = {
  // 2025 Color Palette - Dark Mode First
  colors: {
    primary: {
      50: '#f0f7ff',
      100: '#e0efff', 
      500: '#3b82f6', // Vivid Blue
      600: '#2563eb',
      700: '#1d4ed8',
      900: '#1e3a8a'
    },
    secondary: {
      500: '#8b5cf6', // Rich Purple
      600: '#7c3aed',
      700: '#6d28d9'
    },
    success: {
      500: '#10b981', // Bold Green
      600: '#059669'
    },
    warning: {
      500: '#f59e0b', // Vibrant Orange
      600: '#d97706'
    },
    error: {
      500: '#ef4444',
      600: '#dc2626'
    },
    neutral: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      500: '#6b7280',
      700: '#374151',
      800: '#1f2937',
      900: '#111827'
    }
  },

  // Modern Typography
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      display: ['Clash Display', 'Inter', 'sans-serif']
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem', 
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    }
  },

  // 2025 Spacing & Layout
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem'
  },

  // Modern Border Radius
  borderRadius: {
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    full: '9999px'
  },

  // Glassmorphism & Depth
  effects: {
    blur: {
      sm: 'blur(4px)',
      md: 'blur(8px)',
      lg: 'blur(16px)'
    },
    shadow: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      xl: '0 25px 50px -12px rgb(0 0 0 / 0.25)'
    }
  },

  // Animation & Transitions
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    },
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    }
  }
}

// Component Class Builders
export const buildButtonClasses = (variant: 'primary' | 'secondary' | 'success' | 'warning' = 'primary', size: 'sm' | 'md' | 'lg' = 'md') => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold transition-all duration-300 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm rounded-lg',
    md: 'px-4 py-3 text-base rounded-xl', 
    lg: 'px-6 py-4 text-lg rounded-xl'
  }
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 focus:ring-blue-200 shadow-lg hover:shadow-xl',
    secondary: 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 focus:ring-purple-200 shadow-lg hover:shadow-xl',
    success: 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 focus:ring-green-200 shadow-lg hover:shadow-xl',
    warning: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 focus:ring-orange-200 shadow-lg hover:shadow-xl'
  }
  
  return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`
}

export const buildCardClasses = (elevated = false) => {
  const baseClasses = 'bg-white/80 backdrop-blur-md border border-white/20 transition-all duration-300'
  const elevatedClasses = elevated ? 'shadow-xl hover:shadow-2xl hover:scale-[1.02]' : 'shadow-md hover:shadow-lg'
  return `${baseClasses} ${elevatedClasses} rounded-xl`
}

export const buildModalClasses = () => {
  return 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'
}
