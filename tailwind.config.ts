import type { Config } from 'tailwindcss'

// Configuração do Tailwind com o tema visual do AdPulse
const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Paleta de cores principal do AdPulse
      colors: {
        marca: {
          50:  '#f0f0ff',
          100: '#e0e0ff',
          200: '#c4c4ff',
          300: '#a4a3ff',
          400: '#8b8aff',
          500: '#7c7bfa',  // cor principal
          600: '#6665e8',
          700: '#5251cc',
          800: '#3f3ea3',
          900: '#2e2d7a',
          950: '#1a1960',
        },
        fundo: {
          base:      '#0a0a0f',  // fundo principal
          card:      '#111118',  // cards
          elevado:   '#16161f',  // elementos elevados
          borda:     '#22222e',  // bordas
          bordaClara:'#2e2e3e',  // bordas mais visíveis
        }
      },
      // Fontes personalizadas
      fontFamily: {
        display: ['var(--fonte-display)', 'sans-serif'],
        corpo:   ['var(--fonte-corpo)',   'sans-serif'],
      },
      // Animações personalizadas
      animation: {
        'pulsar-lento': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'entrar':       'entrar 0.5s ease-out forwards',
        'entrar-cima':  'entrarCima 0.5s ease-out forwards',
        'brilho':       'brilho 2s ease-in-out infinite',
      },
      keyframes: {
        entrar: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        entrarCima: {
          '0%':   { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        brilho: {
          '0%, 100%': { opacity: '0.6' },
          '50%':      { opacity: '1' },
        },
      },
      // Tamanhos de background
      backgroundSize: {
        '300%': '300%',
      },
    },
  },
  plugins: [],
}

export default config
