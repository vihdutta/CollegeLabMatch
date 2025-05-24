/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}', './index.html'],
  theme: {
    extend: {
      colors: {
        // New professional college color palette
        'primary-red': '#8B2635',        // Deep burgundy for primary actions and headers
        'primary-red-light': '#A13444',  // Lighter burgundy for hovers
        'primary-red-dark': '#6B1D29',   // Darker burgundy for emphasis
        'dark-green': '#2E3532',         // Dark charcoal green for backgrounds and text
        'dark-green-light': '#3F4742',   // Lighter version for secondary elements
        'cream': '#E0E2DB',              // Light cream for backgrounds
        'cream-dark': '#D6D9D1',         // Slightly darker cream for contrast
        'sage': '#D2D4C8',               // Sage green for subtle accents
        'sage-dark': '#C1C4B8',          // Darker sage for borders
        'sage-light': '#E1E4DA',         // Lighter sage for very subtle backgrounds
        
        // Keep some legacy names for easier transition
        'off-black': '#2E3532',          // Map to dark-green
        'charcoal': '#3F4742',           // Map to dark-green-light
        'ivory': '#E0E2DB',              // Map to cream
        'gold': '#8B2635',               // Map to primary-red for accent color
        'gold-light': '#A13444',         // Map to primary-red-light
        
        // Semantic colors updated to match new palette
        'success': '#2E3532',
        'warning': '#8B2635',
        'error': '#8B2635',
        'info': '#D2D4C8'
      },
      fontFamily: {
        'serif': ['Merriweather', 'Georgia', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Consolas', 'monospace']
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5' }],
        'sm': ['0.875rem', { lineHeight: '1.5' }],
        'base': ['1rem', { lineHeight: '1.6' }],
        'lg': ['1.125rem', { lineHeight: '1.6' }],
        'xl': ['1.25rem', { lineHeight: '1.5' }],
        '2xl': ['1.5rem', { lineHeight: '1.4' }],
        '3xl': ['1.875rem', { lineHeight: '1.3' }],
        '4xl': ['2.25rem', { lineHeight: '1.2' }],
        '5xl': ['3rem', { lineHeight: '1.1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }]
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem'
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      },
      boxShadow: {
        'elegant': '0 4px 6px -1px rgba(46, 53, 50, 0.1), 0 2px 4px -1px rgba(46, 53, 50, 0.06)',
        'elegant-lg': '0 10px 15px -3px rgba(46, 53, 50, 0.1), 0 4px 6px -2px rgba(46, 53, 50, 0.05)',
        'glow': '0 0 20px rgba(139, 38, 53, 0.3)',
        'glow-sage': '0 0 20px rgba(210, 212, 200, 0.3)'
      }
    },
  },
  plugins: [],
} 