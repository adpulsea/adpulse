// ============================================
// AdPulse — Layout do Painel (Sidebar + Topbar)
// ============================================

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  Zap,
  LayoutDashboard,
  Sparkles,
  TrendingUp,
  BarChart2,
  FolderOpen,
  Menu,
  X,
  LogOut,
  ChevronRight,
  CalendarDays,
  Bot,
  Workflow,
  UserCircle,
  Layers,
  ImageIcon,
  Users,
  BookOpen,
  History,
  Frame,
  HeartHandshake,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { fazerLogout } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import ChatWidget from '@/components/ChatWidget'
import Notificacoes from '@/components/Notificacoes'

const ITENS_NAV = [
  { label: 'Dashboard', href: '/painel', icone: LayoutDashboard },
  { label: 'AI Content Studio', href: '/painel/studio', icone: Sparkles },
  { label: 'Calendário', href: '/painel/calendario', icone: CalendarDays },
  { label: 'Biblioteca de Média', href: '/painel/media', icone: ImageIcon },
  { label: 'Viral Lab', href: '/painel/viral-lab', icone: TrendingUp },
  { label: 'Creator Analyzer', href: '/painel/analyzer', icone: BarChart2 },
  { label: 'Campanhas', href: '/painel/campanhas', icone: FolderOpen },
  { label: 'Automação', href: '/painel/automacao', icone: Workflow },
  { label: 'Workspaces', href: '/painel/workspaces', icone: Layers },
  { label: 'Agentes Cliente', href: '/painel/agentes-cliente', icone: HeartHandshake },
  { label: 'Equipa AdPulse', href: '/painel/agentes', icone: Bot },
  { label: 'Templates', href: '/painel/templates', icone: BookOpen },
  { label: 'Histórico', href: '/painel/historico', icone: History },
  { label: 'Fundos', href: '/painel/fundos', icone: Frame },
  { label: 'Equipa', href: '/painel/equipa', icone: Users },
  { label: 'Perfil', href: '/painel/perfil', icone: UserCircle },
]

const COR_PLANO: Record<string, string> = {
  gratuito: 'var(--cor-marca)',
  pro: '#fbbf24',
  agencia: '#c084fc',
}

type Props = {
  children: React.ReactNode
  titulo?: string
}

export default function LayoutPainel({ children, titulo }: Props) {
  const { utilizador } = useAuth()
  const router = useRouter()
  const [sidebarAberta, setSidebarAberta] = useState(false)
  const [plano, setPlano] = useState('gratuito')

  useEffect(() => {
    if (!utilizador) return

    const carregarPlano = async () => {
      const { data } = await supabase
        .from('perfis')
        .select('plano')
        .eq('id', utilizador.id)
        .single()

      if (data?.plano) setPlano(data.plano)
    }

    carregarPlano()
  }, [utilizador])

  const aoFazerLogout = async () => {
    await fazerLogout()
    router.push('/')
  }

  const nomeUtilizador =
    utilizador?.user_metadata?.nome ||
    utilizador?.email?.split('@')[0] ||
    'Utilizador'

  const iniciais = nomeUtilizador.slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--cor-fundo)' }}>
      {sidebarAberta && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setSidebarAberta(false)}
        />
      )}

      <aside
        className="fixed left-0 top-0 bottom-0 z-40 w-64 flex flex-col transition-transform duration-300"
        style={{
          background: 'var(--cor-card)',
          borderRight: '1px solid var(--cor-borda)',
          transform: sidebarAberta ? 'translateX(0)' : undefined,
        }}
      >
        <div
          className="p-5 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--cor-borda)' }}
        >
          <Link href="/painel" className="flex items-center gap-2.5 group">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
              style={{ background: 'var(--cor-marca)' }}
            >
              <Zap size={16} className="text-white" fill="white" />
            </div>

            <span
              className="text-base font-bold"
              style={{ fontFamily: 'var(--fonte-display)' }}
            >
              AdPulse
            </span>
          </Link>

          <button
            className="md:hidden p-1 rounded-lg"
            onClick={() => setSidebarAberta(false)}
            style={{ color: 'var(--cor-texto-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="flex flex-col gap-1">
            {ITENS_NAV.map((item) => {
              const Icone = item.icone
              const ativo = router.pathname === item.href
              const isNovo = [
                '/painel/agentes',
                '/painel/automacao',
                '/painel/workspaces',
                '/painel/media',
                '/painel/equipa',
                '/painel/templates',
                '/painel/fundos',
              ].includes(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarAberta(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
                  style={{
                    background: ativo
                      ? 'rgba(124, 123, 250, 0.15)'
                      : 'transparent',
                    color: ativo
                      ? 'var(--cor-marca)'
                      : 'var(--cor-texto-muted)',
                    border: ativo
                      ? '1px solid rgba(124, 123, 250, 0.25)'
                      : '1px solid transparent',
                  }}
                  onMouseOver={(e) => {
                    if (!ativo) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  }}
                  onMouseOut={(e) => {
                    if (!ativo) e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <Icone size={18} />
                  <span className="flex-1">{item.label}</span>

                  {isNovo && !ativo && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                      style={{
                        background: 'rgba(124,123,250,0.15)',
                        color: 'var(--cor-marca)',
                        fontSize: 9,
                      }}
                    >
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
          <div
            className="mb-4 px-3 py-3 rounded-xl"
            style={{
              background: `${COR_PLANO[plano] || COR_PLANO.gratuito}12`,
              border: `1px solid ${COR_PLANO[plano] || COR_PLANO.gratuito}25`,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p
                  className="text-xs font-medium capitalize"
                  style={{ color: COR_PLANO[plano] || COR_PLANO.gratuito }}
                >
                  Plano {plano.charAt(0).toUpperCase() + plano.slice(1)}
                </p>

                <p
                  className="text-xs"
                  style={{ color: 'var(--cor-texto-fraco)' }}
                >
                  {plano === 'gratuito'
                    ? '3 gerações/dia'
                    : plano === 'pro'
                      ? 'Gerações ilimitadas'
                      : 'Multi-cliente'}
                </p>
              </div>
            </div>

            {plano === 'gratuito' && (
              <Link
                href="/precos"
                className="block text-center text-xs font-semibold px-3 py-2 rounded-lg"
                style={{
                  background: 'var(--cor-marca)',
                  color: '#fff',
                  textDecoration: 'none',
                }}
              >
                Fazer upgrade para Pro
              </Link>
            )}

            {plano === 'pro' && (
              <Link
                href="/precos"
                className="block text-center text-xs font-semibold px-3 py-2 rounded-lg"
                style={{
                  background: '#c084fc',
                  color: '#fff',
                  textDecoration: 'none',
                }}
              >
                Upgrade para Agência
              </Link>
            )}

            {plano === 'agencia' && (
              <Link
                href="/precos"
                className="block text-center text-xs font-semibold px-3 py-2 rounded-lg"
                style={{
                  background: 'rgba(192,132,252,0.15)',
                  color: '#c084fc',
                  border: '1px solid rgba(192,132,252,0.3)',
                  textDecoration: 'none',
                }}
              >
                Gerir plano
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/painel/perfil"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 transition-opacity hover:opacity-80"
              style={{
                background: 'rgba(124, 123, 250, 0.2)',
                color: 'var(--cor-marca)',
              }}
            >
              {iniciais}
            </Link>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{nomeUtilizador}</p>
              <p
                className="text-xs truncate"
                style={{ color: 'var(--cor-texto-fraco)' }}
              >
                {utilizador?.email}
              </p>
            </div>

            <button
              onClick={aoFazerLogout}
              className="p-1.5 rounded-lg transition-colors flex-shrink-0"
              style={{ color: 'var(--cor-texto-fraco)' }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = 'var(--cor-erro)'
                e.currentTarget.style.background = 'rgba(248,113,113,0.1)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = 'var(--cor-texto-fraco)'
                e.currentTarget.style.background = 'transparent'
              }}
              title="Sair"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 md:ml-64">
        <header
          className="sticky top-0 z-20 flex items-center justify-between px-6 py-4"
          style={{
            background: 'rgba(10, 10, 15, 0.85)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--cor-borda)',
          }}
        >
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-lg"
              onClick={() => setSidebarAberta(true)}
              style={{ color: 'var(--cor-texto-muted)' }}
            >
              <Menu size={20} />
            </button>

            {titulo && (
              <h1
                className="text-lg font-semibold"
                style={{ fontFamily: 'var(--fonte-display)' }}
              >
                {titulo}
              </h1>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Notificacoes />

            <Link
              href="/painel/perfil"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold hover:opacity-80 transition-opacity"
              style={{
                background: 'rgba(124, 123, 250, 0.2)',
                color: 'var(--cor-marca)',
              }}
            >
              {iniciais}
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>

      <ChatWidget />
    </div>
  )
}
