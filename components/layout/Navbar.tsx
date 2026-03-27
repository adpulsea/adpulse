// ============================================
// AdPulse — Navbar da Landing Page
// ============================================

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Zap } from 'lucide-react'

export default function Navbar() {
  const [menuAberto, setMenuAberto] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Detectar scroll para mudar aparência da navbar
  useEffect(() => {
    const aoScrollar = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', aoScrollar)
    return () => window.removeEventListener('scroll', aoScrollar)
  }, [])

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? 'rgba(10, 10, 15, 0.92)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--cor-borda)' : 'none',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
            style={{ background: 'var(--cor-marca)' }}
          >
            <Zap size={16} className="text-white" fill="white" />
          </div>
          <span
            className="text-lg font-bold tracking-tight"
            style={{ fontFamily: 'var(--fonte-display)', color: 'var(--cor-texto)' }}
          >
            AdPulse
          </span>
        </Link>

        {/* Links de navegação (desktop) */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: 'Funcionalidades', href: '#funcionalidades' },
            { label: 'Como funciona', href: '#como-funciona' },
            { label: 'Preços', href: '#precos' },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm transition-colors duration-200"
              style={{ color: 'var(--cor-texto-muted)' }}
              onMouseOver={(e) => (e.currentTarget.style.color = 'var(--cor-texto)')}
              onMouseOut={(e) => (e.currentTarget.style.color = 'var(--cor-texto-muted)')}
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Botões de ação (desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/auth/login" className="btn-secundario text-sm py-2 px-4">
            Entrar
          </Link>
          <Link href="/auth/registar" className="btn-primario text-sm py-2 px-4">
            Começar grátis
          </Link>
        </div>

        {/* Botão hamburger (mobile) */}
        <button
          className="md:hidden p-2 rounded-lg transition-colors"
          onClick={() => setMenuAberto(!menuAberto)}
          style={{ color: 'var(--cor-texto-muted)' }}
        >
          {menuAberto ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Menu mobile */}
      {menuAberto && (
        <div
          className="md:hidden px-6 pb-6 pt-2"
          style={{ borderTop: '1px solid var(--cor-borda)' }}
        >
          <div className="flex flex-col gap-4">
            {[
              { label: 'Funcionalidades', href: '#funcionalidades' },
              { label: 'Como funciona', href: '#como-funciona' },
              { label: 'Preços', href: '#precos' },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm py-2"
                style={{ color: 'var(--cor-texto-muted)' }}
                onClick={() => setMenuAberto(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-2" style={{ borderTop: '1px solid var(--cor-borda)' }}>
              <Link href="/auth/login" className="btn-secundario justify-center">
                Entrar
              </Link>
              <Link href="/auth/registar" className="btn-primario justify-center">
                Começar grátis
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
