// ============================================
// AdPulse — Raiz da Aplicação
// ============================================

import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import '@/styles/globals.css'

// Páginas que NÃO precisam de autenticação
const PAGINAS_PUBLICAS = [
  '/',
  '/auth/login',
  '/auth/registar',
  '/precos',
  '/termos',
  '/privacidade',
  '/onboarding',
  '/admin',
  '/r',
]

export default function App({ Component, pageProps }: AppProps) {
  const { utilizador, carregando } = useAuth()
  const router = useRouter()
  const paginaAtual = router.pathname

  useEffect(() => {
    if (carregando) return
    const ePaginaPublica = PAGINAS_PUBLICAS.includes(paginaAtual)

    // Se não está autenticado e tenta aceder a página protegida → login
    if (!utilizador && !ePaginaPublica) {
      router.replace('/auth/login')
      return
    }

    // Se está autenticado e tenta aceder ao login/registo → painel
    if (utilizador && (paginaAtual === '/auth/login' || paginaAtual === '/auth/registar')) {
      router.replace('/painel')
      return
    }
  }, [utilizador, carregando, paginaAtual, router])

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--cor-fundo)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'var(--cor-marca)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white" strokeWidth="1.5"/>
            </svg>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 rounded-full"
                style={{ background: 'var(--cor-marca)', animation: `pulsar 1s ease-in-out ${i * 0.15}s infinite` }} />
            ))}
          </div>
        </div>
        <style>{`
          @keyframes pulsar {
            0%, 100% { opacity: 0.3; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </div>
    )
  }

  return <Component {...pageProps} />
}