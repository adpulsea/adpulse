// ============================================
// AdPulse — Layout do Painel (Sidebar + Topbar)
// ============================================

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  Zap, LayoutDashboard, Sparkles, TrendingUp,
  BarChart2, FolderOpen, Menu, X, LogOut,
  ChevronRight, Bell, CalendarDays, Bot, Workflow, UserCircle, Layers
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { fazerLogout } from '@/lib/auth'
import ChatWidget from '@/components/ChatWidget'

const ITENS_NAV = [
  { label: 'Dashboard',         href: '/painel',               icone: LayoutDashboard },
  { label: 'AI Content Studio', href: '/painel/studio',        icone: Sparkles        },
  { label: 'Calendário',        href: '/painel/calendario',    icone: CalendarDays    },
  { label: 'Viral Lab',         href: '/painel/viral-lab',     icone: TrendingUp      },
  { label: 'Creator Analyzer',  href: '/painel/analyzer',      icone: BarChart2       },
  { label: 'Campanhas',         href: '/painel/campanhas',     icone: FolderOpen      },
  { label: 'Automação',         href: '/painel/automacao',     icone: Workflow        },
  { label: 'Workspaces',        href: '/painel/workspaces',    icone: Layers          },
  { label: 'Agentes IA',        href: '/painel/agentes',       icone: Bot             },
  { label: 'Perfil',            href: '/painel/perfil',        icone: UserCircle      },
]

type Props = {
  children: React.ReactNode
  titulo?: string
}

export default function LayoutPainel({ children, titulo }: Props) {
  const { utilizador } = useAuth()
  const router = useRouter()
  const [sidebarAberta, setSidebarAberta] = useState(false)

  const aoFazerLogout = async () => {
    await fazerLogout()
    router.push('/')
  }

  const nomeUtilizador = utilizador?.user_metadata?.nome
    || utilizador?.email?.split('@')[0]
    || 'Utilizador'

  const iniciais = nomeUtilizador.slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--cor-fundo)' }}>

      {sidebarAberta && (
        <div className="fixed inset-0 z-30 md:hidden" style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setSidebarAberta(false)} />
      )}

      <aside className="fixed left-0 top-0 bottom-0 z-40 w-64 flex flex-col transition-transform duration-300"
        style={{ background: 'var(--cor-card)', borderRight: '1px solid var(--cor-borda)', transform: sidebarAberta ? 'translateX(0)' : undefined }}>

        <div className="p-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--cor-borda)' }}>
          <Link href="/painel" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
              style={{ background: 'var(--cor-marca)' }}>
              <Zap size={16} className="text-white" fill="white" />
            </div>
            <span className="text-base font-bold" style={{ fontFamily: 'var(--fonte-display)' }}>AdPulse</span>
          </Link>
          <button className="md:hidden p-1 rounded-lg" onClick={() => setSidebarAberta(false)}
            style={{ color: 'var(--cor-texto-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="flex flex-col gap-1">
            {ITENS_NAV.map((item) => {
              const Icone = item.icone
              const ativo = router.pathname === item.href
              const isNovo = item.href === '/painel/agentes' || item.href === '/painel/automacao' || item.href === '/painel/workspaces'
              return (
                <Link key={item.href} href={item.href} onClick={() => setSidebarAberta(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
                  style={{
                    background: ativo ? 'rgba(124, 123, 250, 0.15)' : 'transparent',
                    color: ativo ? 'var(--cor-marca)' : 'var(--cor-texto-muted)',
                    border: ativo ? '1px solid rgba(124, 123, 250, 0.25)' : '1px solid transparent',
                  }}
                  onMouseOver={e => { if (!ativo) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                  onMouseOut={e => { if (!ativo) e.currentTarget.style.background = 'transparent' }}>
                  <Icone size={18} />
                  <span className="flex-1">{item.label}</span>
                  {isNovo && !ativo && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                      style={{ background: 'rgba(124,123,250,0.15)', color: 'var(--cor-marca)', fontSize: 9 }}>
                      NOVO
                    </span>
                  )}
                  {ativo && <ChevronRight size={14} />}
                </Link>
              )
            })}
          </div>
        </nav>

        <div className="p-4" style={{ borderTop: '1px solid var(--cor-borda)' }}>
          <div className="flex items-center justify-between mb-4 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(124, 123, 250, 0.08)', border: '1px solid rgba(124, 123, 250, 0.15)' }}>
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--cor-marca)' }}>Plano Gratuito</p>
              <p className="text-xs" style={{ color: 'var(--cor-texto-fraco)' }}>3 gerações/dia</p>
            </div>
            <Link href="/precos" className="text-xs font-medium px-2 py-1 rounded-lg"
              style={{ background: 'var(--cor-marca)', color: '#fff' }}>
              Pro
            </Link>