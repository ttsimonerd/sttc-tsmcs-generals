/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'theme-primary': 'var(--color-primary)',
        'theme-primary-hover': 'var(--color-primary-hover)',
        'theme-accent': 'var(--color-accent)',
        'theme-primary-rgb': 'var(--color-primary-rgb)',
        'theme-accent-rgb': 'var(--color-accent-rgb)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pop-in': 'popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'shake': 'shake 0.5s ease-in-out',
        'success-pop': 'successPop 0.3s ease-out',
        'success-glow': 'successGlow 1s ease-in-out infinite',
        'failure-shake': 'failureShake 0.5s ease-in-out',
        'failure-glow': 'failureGlow 1s ease-in-out infinite',
        'warning-pulse': 'warningPulse 1s ease-in-out infinite',
        'warning-shake': 'warningShake 0.5s ease-in-out',
        'purple-glow': 'purpleGlow 1s ease-in-out infinite',
        'holographic': 'holographic 2s ease-in-out infinite',
        'success-sparkle': 'successSparkle 0.8s ease-out forwards',
        'failure-pulse': 'failurePulse 0.5s ease-out',
        'pop-in': 'popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' }
        },
        fadeInUp: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' }
        },
        popIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0', filter: 'blur(10px)' },
          '60%': { transform: 'scale(1.1)', opacity: '1', filter: 'blur(0px)' },
          '100%': { transform: 'scale(1)' }
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' }
        },
        successPop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' }
        },
        successGlow: {
          '0%, 100%': { boxShadow: '0 0 0 rgba(16, 185, 129, 0)' },
          '50%': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.8)' }
        },
        failureShake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' }
        },
        failureGlow: {
          '0%, 100%': { boxShadow: '0 0 0 rgba(239, 68, 68, 0)' },
          '50%': { boxShadow: '0 0 20px rgba(239, 68, 68, 0.8)' }
        },
        warningPulse: {
          '0%, 100%': { boxShadow: '0 0 0 rgba(245, 158, 11, 0)' },
          '50%': { boxShadow: '0 0 20px rgba(245, 158, 11, 0.8)' }
        },
        warningShake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' }
        },
        purpleGlow: {
          '0%, 100%': { boxShadow: '0 0 0 rgba(168, 85, 247, 0)' },
          '50%': { boxShadow: '0 0 20px rgba(168, 85, 247, 0.8)' }
        },
        holographic: {
          '0%': { filter: 'hue-rotate(0deg)' },
          '100%': { filter: 'hue-rotate(360deg)' }
        },
        successSparkle: {
          '0%': { opacity: '0', transform: 'scale(0)' },
          '50%': { opacity: '1', transform: 'scale(1.5)' },
          '100%': { opacity: '0', transform: 'scale(0)' }
        },
        failurePulse: {
          '0%': { opacity: '1' },
          '50%': { opacity: '0.5' },
          '100%': { opacity: '1' }
        }
      }
    },
  },
  plugins: [],
}
