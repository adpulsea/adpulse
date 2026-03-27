// ============================================
// AdPulse — Painel de Administração
// ============================================

import Head from 'next/head'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import {
  Users, TrendingUp, Zap, AlertCircle, CheckCircle,
  AlertTriangle, Search, Filter, RefreshCw, Mail,
  Crown, Clock, BarChart2, MessageCircle, Eye,
  ChevronDown, X, Send, Loader, LogOut
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

// Cliente Supabase com service role (admin)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ---- Tipos ----
type SaudeUtilizador = 'verde' | 'amarelo' | 'vermelho'

type Utilizador = {
  id: string
  email: string
  nome: string
  plano: 'gratuito' | 'pro' | 'agencia'
  criado_em: string
  ultimo_login: string
  total_geracoes: number
  geracoes_ultima_semana: number
  posts_agendados: number
  posts_publicados: number
  saude: SaudeUtilizador
  motivo_saude: string
}

// ---- Calcular saúde do utilizador ----
function calcularSaude(u: Partial<Utilizador>): { saude: SaudeUtilizador, motivo: string } {
  const diasSemLogin = u.ultimo_login
    ? Math.floor((Date.now() - new Date(u.ultimo_login).getTime()) / 86400000)
    : 999

  if (diasSemLogin > 7 || (u.total_geracoes || 0) === 0) {
    return { saude: 'vermelho', motivo: diasSemLogin > 7 ? `Inativo há ${diasSemLogin} dias` : 'Nunca gerou conteúdo' }
  }
  if ((u.geracoes_ultima_semana || 0) < 3 || u.plano === 'gratuito') {
    return { saude: 'amarelo', motivo: (u.geracoes_ultima_semana || 0) < 3 ? 'Pouca atividade esta semana' : 'No plano gratuito há muito tempo' }
  }
  return { saude: 'verde', motivo: 'Utilizador ativo e a crescer' }
}

// ---- Dados simulados (substituir por Supabase real) ----
const UTILIZADORES_MOCK: Utilizador[] = [
  { id: '1', email: 'ana.silva@gmail.com',    nome: 'Ana Silva',     plano: 'pro',      criado_em: '2026-01-15', ultimo_login: new Date(Date.now() - 86400000).toISOString(),    total_geracoes: 142, geracoes_ultima_semana: 18, posts_agendados: 5, posts_publicados: 34, saude: 'verde',    motivo_saude: 'Utilizador ativo e a crescer' },
  { id: '2', email: 'pedro.costa@hotmail.com', nome: 'Pedro Costa',  plano: 'gratuito', criado_em: '2026-02-03', ultimo_login: new Date(Date.now() - 172800000).toISOString(),   total_geracoes: 8,   geracoes_ultima_semana: 2,  posts_agendados: 1, posts_publicados: 3,  saude: 'amarelo',  motivo_saude: 'Pouca atividade esta semana' },
  { id: '3', email: 'maria.j@empresa.pt',      nome: 'Maria João',   plano: 'agencia',  criado_em: '2025-12-10', ultimo_login: new Date(Date.now() - 3600000).toISOString(),     total_geracoes: 380, geracoes_ultima_semana: 47, posts_agendados: 12, posts_publicados: 89, saude: 'verde',   motivo_saude: 'Utilizador ativo e a crescer' },
  { id: '4', email: 'tiago.m@gmail.com',       nome: 'Tiago Mota',   plano: 'gratuito', criado_em: '2026-03-01', ultimo_login: new Date(Date.now() - 864000000).toISOString(),   total_geracoes: 2,   geracoes_ultima_semana: 0,  posts_agendados: 0, posts_publicados: 0,  saude: 'vermelho', motivo_saude: 'Inativo há 10 dias' },
  { id: '5', email: 'carla.r@outlook.com',     nome: 'Carla Ramos',  plano: 'pro',      criado_em: '2026-01-28', ultimo_login: new Date(Date.now() - 7200000).toISOString(),     total_geracoes: 95,  geracoes_ultima_semana: 12, posts_agendados: 3, posts_publicados: 21, saude: 'verde',    motivo_saude: 'Utilizador ativo e a crescer' },
  { id: '6', email: 'nuno.f@gmail.com',        nome: 'Nuno Ferreira', plano: 'gratuito', criado_em: '2026-02-20', ultimo_login: new Date(Date.now() - 1296000000).toISOString(),  total_geracoes: 0,   geracoes_ultima_semana: 0,  posts_agendados: 0, posts_publicados: 0,  saude: 'vermelho', motivo_saude: 'Nunca gerou conteúdo' },
  { id: '7', email: 'sofia.p@empresa.com',     nome: 'Sofia Pinto',  plano: 'pro',      criado_em: '2026-01-05', ultimo_login: new Date(Date.now() - 259200000).toISOString(),   total_geracoes: 67,  geracoes_ultima_semana: 4,  posts_agendados: 2, posts_publicados: 15, saude: 'amarelo',  motivo_saude: 'Pouca atividade esta semana' },
  { id: '8', email: 'rui.a@gmail.com',         nome: 'Rui Alves',    plano: 'gratuito', criado_em: '2026-03-10', ultimo_login: new Date(Date.now() - 432000000).toISOString(),   total_geracoes: 3,   geracoes_ultima_semana: 1,  posts_agendados: 0, posts_publicados: 1,  saude: 'amarelo',  motivo_saude: 'No plano gratuito há muito tempo' },
]

// ---- Cores ----
const COR_SAUDE = { verde: '#34d399', amarelo: '#fbbf24', vermelho: '#f87171' }
const BG_SAUDE  = { verde: 'rgba(52,211,153,0.1)', amarelo: 'rgba(251,191,36,0.1)', vermelho: 'rgba(248,113,113,0.1)' }
const COR_PLANO = { gratuito: '#8888aa', pro: '#7c7bfa', agencia: '#c084fc' }

// ---- Modal de contacto ----
function ModalContacto({ utilizador, onFechar }: { utilizador: Utilizador, onFechar: () => void }) {
  const [mensagem, setMensagem] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado]   = useState(false)

  const TEMPLATES = {
    vermelho: `Olá ${utilizador.nome.split(' ')[0]}! 👋\n\nReparei que não tens estado muito ativo na AdPulse e queria perceber se está tudo bem ou se precisas de ajuda.\n\nEstou aqui para te ajudar a tirar o máximo da plataforma. Tens alguma dúvida ou dificuldade?\n\nAbraço,\nEquipa AdPulse`,
    amarelo:  `Olá ${utilizador.nome.split(' ')[0]}! 👋\n\nVi que estás a usar a AdPulse mas talvez ainda não tenhas descoberto todas as funcionalidades.\n\nSabias que com o plano Pro tens gerações ilimitadas e o calendário automático? Posso mostrar-te como funciona?\n\nAbraço,\nEquipa AdPulse`,
    verde:    `Olá ${utilizador.nome.split(' ')[0]}! 🚀\n\nEstás a ir muito bem na AdPulse! Os teus números de criação de conteúdo são excelentes.\n\nQueria saber se há algo que possamos melhorar para tornar a tua experiência ainda melhor.\n\nAbraço,\nEquipa AdPulse`,
  }

  useEffect(() => {
    setMensagem(TEMPLATES[utilizador.saude])
  }, [utilizador])

  const enviar = async () => {
    setEnviando(true)
    await new Promise(r => setTimeout(r, 1500))
    setEnviando(false)
    setEnviado(true)
    setTimeout(onFechar, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-lg rounded-2xl p-6 flex flex-col gap-4"
        style={{ background: '#111118', border: '1px solid #22222e' }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 style={{ fontFamily: 'var(--fonte-display)', fontWeight: 600, fontSize: 16 }}>
              Contactar {utilizador.nome}
            </h3>
            <p style={{ fontSize: 12, color: '#8888aa', marginTop: 2 }}>{utilizador.email}</p>
          </div>
          <button onClick={onFechar} style={{ color: '#8888aa', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Badge saúde */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: BG_SAUDE[utilizador.saude], border: `1px solid ${COR_SAUDE[utilizador.saude]}30` }}>
          <span className="w-2 h-2 rounded-full" style={{ background: COR_SAUDE[utilizador.saude] }} />
          <span style={{ fontSize: 12, color: COR_SAUDE[utilizador.saude] }}>{utilizador.motivo_saude}</span>
        </div>

        <div>
          <label style={{ fontSize: 12, color: '#8888aa', display: 'block', marginBottom: 6 }}>Mensagem</label>
          <textarea
            value={mensagem}
            onChange={e => setMensagem(e.target.value)}
            rows={7}
            style={{
              width: '100%', padding: '12px', borderRadius: 12,
              background: '#16161f', border: '1px solid #22222e',
              color: '#f0f0f5', fontSize: 13, lineHeight: 1.6,
              resize: 'none', outline: 'none', fontFamily: 'var(--fonte-corpo)',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onFechar}
            style={{ flex: 1, padding: '10px', borderRadius: 12, background: '#16161f', border: '1px solid #22222e', color: '#8888aa', cursor: 'pointer', fontSize: 13 }}>
            Cancelar
          </button>
          <button onClick={enviar} disabled={enviando || enviado}
            style={{
              flex: 1, padding: '10px', borderRadius: 12,
              background: enviado ? '#34d399' : '#7c7bfa',
              border: 'none', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              opacity: enviando ? 0.7 : 1,
            }}>
            {enviando ? <><Loader size={14} className="animate-spin" /> A enviar...</>
             : enviado  ? <><CheckCircle size={14} /> Enviado!</>
             : <><Send size={14} /> Enviar email</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ---- Componente principal ----
export default function AdminDashboard() {
  const router = useRouter()
  const [senha, setSenha]           = useState('')
  const [autenticado, setAuth]      = useState(false)
  const [utilizadores, setUtils]    = useState<Utilizador[]>(UTILIZADORES_MOCK)
  const [filtro, setFiltro]         = useState<'todos' | SaudeUtilizador>('todos')
  const [pesquisa, setPesquisa]     = useState('')
  const [modalContacto, setModal]   = useState<Utilizador | null>(null)
  const [expandido, setExpandido]   = useState<string | null>(null)

  // Autenticação simples por senha
  const SENHA_ADMIN = 'adpulse2026'

  if (!autenticado) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f' }}>
        <div style={{ width: 360, padding: 32, borderRadius: 20, background: '#111118', border: '1px solid #22222e' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#7c7bfa', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Zap size={22} color="#fff" fill="#fff" />
            </div>
            <h1 style={{ fontFamily: 'var(--fonte-display)', fontSize: 20, fontWeight: 700, color: '#f0f0f5' }}>AdPulse Admin</h1>
            <p style={{ fontSize: 13, color: '#8888aa', marginTop: 4 }}>Acesso restrito à equipa</p>
          </div>
          <input
            type="password"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && senha === SENHA_ADMIN && setAuth(true)}
            placeholder="Palavra-passe de administrador"
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 12,
              background: '#16161f', border: '1px solid #22222e',
              color: '#f0f0f5', fontSize: 14, outline: 'none',
              fontFamily: 'var(--fonte-corpo)', marginBottom: 12,
            }}
          />
          <button
            onClick={() => senha === SENHA_ADMIN && setAuth(true)}
            style={{
              width: '100%', padding: '12px', borderRadius: 12,
              background: '#7c7bfa', border: 'none', color: '#fff',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>
            Entrar
          </button>
          {senha && senha !== SENHA_ADMIN && (
            <p style={{ fontSize: 12, color: '#f87171', textAlign: 'center', marginTop: 8 }}>Senha incorreta</p>
          )}
        </div>
      </div>
    )
  }

  // Filtrar utilizadores
  const utilizadoresFiltrados = utilizadores.filter(u => {
    const matchFiltro  = filtro === 'todos' || u.saude === filtro
    const matchPesquisa = pesquisa === '' || u.nome.toLowerCase().includes(pesquisa.toLowerCase()) || u.email.toLowerCase().includes(pesquisa.toLowerCase())
    return matchFiltro && matchPesquisa
  })

  const contagem = {
    total:    utilizadores.length,
    verde:    utilizadores.filter(u => u.saude === 'verde').length,
    amarelo:  utilizadores.filter(u => u.saude === 'amarelo').length,
    vermelho: utilizadores.filter(u => u.saude === 'vermelho').length,
    pro:      utilizadores.filter(u => u.plano !== 'gratuito').length,
  }

  return (
    <>
      <Head><title>Admin — AdPulse</title></Head>
      <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#f0f0f5', fontFamily: 'var(--fonte-corpo)' }}>

        {/* Topbar */}
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 32px',
          background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #22222e', position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: '#7c7bfa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={16} color="#fff" fill="#fff" />
            </div>
            <div>
              <span style={{ fontFamily: 'var(--fonte-display)', fontWeight: 700, fontSize: 16 }}>AdPulse</span>
              <span style={{ fontSize: 11, color: '#7c7bfa', marginLeft: 8, padding: '2px 8px', borderRadius: 6, background: 'rgba(124,123,250,0.15)', border: '1px solid rgba(124,123,250,0.3)' }}>ADMIN</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, color: '#8888aa' }}>Painel de Administração</span>
            <button onClick={() => setAuth(false)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', cursor: 'pointer', fontSize: 12 }}>
              <LogOut size={12} /> Sair
            </button>
          </div>
        </header>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>

          {/* Métricas principais */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 32 }}>
            {[
              { label: 'Total utilizadores', valor: contagem.total,    cor: '#7c7bfa', icone: Users       },
              { label: 'A crescer bem',       valor: contagem.verde,    cor: '#34d399', icone: CheckCircle },
              { label: 'Precisam atenção',    valor: contagem.amarelo,  cor: '#fbbf24', icone: AlertTriangle },
              { label: 'Em dificuldade',      valor: contagem.vermelho, cor: '#f87171', icone: AlertCircle },
              { label: 'Planos pagos',        valor: contagem.pro,      cor: '#c084fc', icone: Crown       },
            ].map(m => {
              const Icone = m.icone
              return (
                <div key={m.label} style={{
                  padding: '20px 16px', borderRadius: 16, textAlign: 'center',
                  background: '#111118', border: `1px solid ${m.cor}20`,
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${m.cor}15`, border: `1px solid ${m.cor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                    <Icone size={18} color={m.cor} />
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--fonte-display)', color: m.cor }}>{m.valor}</div>
                  <div style={{ fontSize: 11, color: '#8888aa', marginTop: 4 }}>{m.label}</div>
                </div>
              )
            })}
          </div>

          {/* Filtros e pesquisa */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
            {/* Filtros saúde */}
            <div style={{ display: 'flex', gap: 8 }}>
              {([
                { id: 'todos',    label: `Todos (${contagem.total})`,       cor: '#7c7bfa' },
                { id: 'verde',    label: `🟢 Bem (${contagem.verde})`,      cor: '#34d399' },
                { id: 'amarelo',  label: `🟡 Atenção (${contagem.amarelo})`, cor: '#fbbf24' },
                { id: 'vermelho', label: `🔴 Dificuldade (${contagem.vermelho})`, cor: '#f87171' },
              ] as const).map(f => (
                <button key={f.id} onClick={() => setFiltro(f.id)}
                  style={{
                    padding: '6px 14px', borderRadius: 10, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                    background: filtro === f.id ? `${f.cor}15` : '#111118',
                    border: `1px solid ${filtro === f.id ? f.cor + '40' : '#22222e'}`,
                    color: filtro === f.id ? f.cor : '#8888aa',
                  }}>
                  {f.label}
                </button>
              ))}
            </div>

            {/* Pesquisa */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 12, background: '#111118', border: '1px solid #22222e', flex: 1, maxWidth: 280 }}>
              <Search size={14} color="#8888aa" />
              <input
                value={pesquisa}
                onChange={e => setPesquisa(e.target.value)}
                placeholder="Pesquisar utilizador..."
                style={{ background: 'none', border: 'none', outline: 'none', color: '#f0f0f5', fontSize: 13, width: '100%', fontFamily: 'var(--fonte-corpo)' }}
              />
            </div>
          </div>

          {/* Lista de utilizadores */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {utilizadoresFiltrados.map(u => (
              <div key={u.id} style={{
                borderRadius: 16, background: '#111118',
                border: `1px solid ${COR_SAUDE[u.saude]}25`,
                overflow: 'hidden',
              }}>
                {/* Linha principal */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px' }}>

                  {/* Indicador de saúde */}
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                    background: COR_SAUDE[u.saude],
                    boxShadow: `0 0 8px ${COR_SAUDE[u.saude]}`,
                  }} />

                  {/* Avatar */}
                  <div style={{
                    width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                    background: `${COR_SAUDE[u.saude]}15`,
                    border: `1px solid ${COR_SAUDE[u.saude]}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: COR_SAUDE[u.saude],
                  }}>
                    {u.nome.slice(0, 2).toUpperCase()}
                  </div>

                  {/* Info principal */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{u.nome}</span>
                      <span style={{
                        fontSize: 10, padding: '2px 8px', borderRadius: 6, fontWeight: 600,
                        background: `${COR_PLANO[u.plano]}15`,
                        border: `1px solid ${COR_PLANO[u.plano]}30`,
                        color: COR_PLANO[u.plano], textTransform: 'uppercase',
                      }}>
                        {u.plano}
                      </span>
                      <span style={{
                        fontSize: 10, padding: '2px 8px', borderRadius: 6,
                        background: BG_SAUDE[u.saude],
                        border: `1px solid ${COR_SAUDE[u.saude]}30`,
                        color: COR_SAUDE[u.saude],
                      }}>
                        {u.motivo_saude}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: '#8888aa', marginTop: 2 }}>{u.email}</p>
                  </div>

                  {/* Métricas rápidas */}
                  <div style={{ display: 'flex', gap: 24, flexShrink: 0 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--fonte-display)', color: '#7c7bfa' }}>{u.total_geracoes}</div>
                      <div style={{ fontSize: 10, color: '#8888aa' }}>gerações</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--fonte-display)', color: '#34d399' }}>{u.posts_publicados}</div>
                      <div style={{ fontSize: 10, color: '#8888aa' }}>publicados</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--fonte-display)', color: '#fbbf24' }}>{u.geracoes_ultima_semana}</div>
                      <div style={{ fontSize: 10, color: '#8888aa' }}>esta semana</div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button onClick={() => setModal(u)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '7px 14px', borderRadius: 10, fontSize: 12, fontWeight: 500,
                        background: `${COR_SAUDE[u.saude]}15`,
                        border: `1px solid ${COR_SAUDE[u.saude]}30`,
                        color: COR_SAUDE[u.saude], cursor: 'pointer',
                      }}>
                      <Mail size={12} /> Contactar
                    </button>
                    <button onClick={() => setExpandido(expandido === u.id ? null : u.id)}
                      style={{ padding: '7px', borderRadius: 10, background: '#16161f', border: '1px solid #22222e', color: '#8888aa', cursor: 'pointer' }}>
                      <ChevronDown size={14} style={{ transform: expandido === u.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </button>
                  </div>
                </div>

                {/* Detalhe expandido */}
                {expandido === u.id && (
                  <div style={{ padding: '16px 20px', borderTop: '1px solid #22222e', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                    {[
                      { label: 'Membro desde',      valor: new Date(u.criado_em).toLocaleDateString('pt-PT'),  icone: Clock      },
                      { label: 'Último login',       valor: new Date(u.ultimo_login).toLocaleDateString('pt-PT'), icone: Eye      },
                      { label: 'Posts agendados',    valor: u.posts_agendados.toString(),                        icone: BarChart2  },
                      { label: 'Gerações esta semana', valor: u.geracoes_ultima_semana.toString(),               icone: TrendingUp },
                    ].map(d => {
                      const Icone = d.icone
                      return (
                        <div key={d.label} style={{ padding: '12px 16px', borderRadius: 12, background: '#16161f', border: '1px solid #22222e' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                            <Icone size={12} color="#8888aa" />
                            <span style={{ fontSize: 11, color: '#8888aa' }}>{d.label}</span>
                          </div>
                          <div style={{ fontSize: 16, fontWeight: 600, fontFamily: 'var(--fonte-display)' }}>{d.valor}</div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {utilizadoresFiltrados.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px', color: '#8888aa' }}>
              <Users size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <p>Nenhum utilizador encontrado</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal contacto */}
      {modalContacto && (
        <ModalContacto utilizador={modalContacto} onFechar={() => setModal(null)} />
      )}
    </>
  )
}
