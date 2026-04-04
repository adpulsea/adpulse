// ============================================
// AdPulse — Painel de Administração (dados reais)
// ============================================

import Head from 'next/head'
import { useEffect, useState } from 'react'
import {
  Users, Zap, AlertCircle, CheckCircle,
  AlertTriangle, Search, Mail,
  Crown, Clock, BarChart2, Eye,
  ChevronDown, X, Send, Loader, LogOut, RefreshCw
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type SaudeUtilizador = 'verde' | 'amarelo' | 'vermelho'

type Utilizador = {
  id: string
  email: string
  nome: string
  plano: 'gratuito' | 'pro' | 'agencia'
  criado_em: string
  total_geracoes: number
  geracoes_ultima_semana: number
  posts_agendados: number
  posts_publicados: number
  saude: SaudeUtilizador
  motivo_saude: string
}

function calcularSaude(u: Partial<Utilizador>): { saude: SaudeUtilizador, motivo: string } {
  if ((u.total_geracoes || 0) === 0) {
    return { saude: 'vermelho', motivo: 'Nunca gerou conteúdo' }
  }
  if ((u.geracoes_ultima_semana || 0) < 3 || u.plano === 'gratuito') {
    return { saude: 'amarelo', motivo: (u.geracoes_ultima_semana || 0) < 3 ? 'Pouca atividade esta semana' : 'No plano gratuito' }
  }
  return { saude: 'verde', motivo: 'Utilizador ativo e a crescer' }
}

const COR_SAUDE = { verde: '#34d399', amarelo: '#fbbf24', vermelho: '#f87171' }
const BG_SAUDE  = { verde: 'rgba(52,211,153,0.1)', amarelo: 'rgba(251,191,36,0.1)', vermelho: 'rgba(248,113,113,0.1)' }
const COR_PLANO = { gratuito: '#8888aa', pro: '#7c7bfa', agencia: '#c084fc' }

function ModalContacto({ utilizador, onFechar }: { utilizador: Utilizador, onFechar: () => void }) {
  const [mensagem, setMensagem] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado]   = useState(false)

  useEffect(() => {
    const templates: Record<SaudeUtilizador, string> = {
      vermelho: `Olá ${utilizador.nome.split(' ')[0]}! 👋\n\nReparei que não tens estado muito ativo na AdPulse e queria perceber se está tudo bem.\n\nEstou aqui para te ajudar. Tens alguma dúvida?\n\nAbraço,\nEquipa AdPulse`,
      amarelo:  `Olá ${utilizador.nome.split(' ')[0]}! 👋\n\nVi que estás a usar a AdPulse! Sabias que com o plano Pro tens gerações ilimitadas?\n\nPosso mostrar-te como funciona?\n\nAbraço,\nEquipa AdPulse`,
      verde:    `Olá ${utilizador.nome.split(' ')[0]}! 🚀\n\nEstás a ir muito bem na AdPulse!\n\nHá algo que possamos melhorar para ti?\n\nAbraço,\nEquipa AdPulse`,
    }
    setMensagem(templates[utilizador.saude])
  }, [utilizador])

  const enviar = async () => {
    setEnviando(true)
    await new Promise(r => setTimeout(r, 1500))
    setEnviando(false)
    setEnviado(true)
    setTimeout(onFechar, 1500)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div style={{ width: '100%', maxWidth: 520, background: '#111118', border: '1px solid #22222e', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontWeight: 600, fontSize: 16, color: '#f0f0f5', margin: 0 }}>Contactar {utilizador.nome}</h3>
            <p style={{ fontSize: 12, color: '#8888aa', margin: '2px 0 0' }}>{utilizador.email}</p>
          </div>
          <button onClick={onFechar} style={{ color: '#8888aa', background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
        </div>
        <div style={{ padding: '8px 12px', borderRadius: 10, background: BG_SAUDE[utilizador.saude], border: `1px solid ${COR_SAUDE[utilizador.saude]}30`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: COR_SAUDE[utilizador.saude], flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: COR_SAUDE[utilizador.saude] }}>{utilizador.motivo_saude}</span>
        </div>
        <textarea value={mensagem} onChange={e => setMensagem(e.target.value)} rows={7}
          style={{ width: '100%', padding: 12, borderRadius: 12, background: '#16161f', border: '1px solid #22222e', color: '#f0f0f5', fontSize: 13, lineHeight: 1.6, resize: 'none', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onFechar} style={{ flex: 1, padding: 10, borderRadius: 12, background: '#16161f', border: '1px solid #22222e', color: '#8888aa', cursor: 'pointer', fontSize: 13 }}>Cancelar</button>
          <button onClick={enviar} disabled={enviando || enviado}
            style={{ flex: 1, padding: 10, borderRadius: 12, background: enviado ? '#34d399' : '#7c7bfa', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: enviando ? 0.7 : 1 }}>
            {enviando ? <><Loader size={14} /> A enviar...</> : enviado ? <><CheckCircle size={14} /> Enviado!</> : <><Send size={14} /> Enviar email</>}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [senha, setSenha]         = useState('')
  const [autenticado, setAuth]    = useState(false)
  const [utilizadores, setUtils]  = useState<Utilizador[]>([])
  const [carregando, setCarr]     = useState(false)
  const [filtro, setFiltro]       = useState<'todos' | SaudeUtilizador>('todos')
  const [pesquisa, setPesquisa]   = useState('')
  const [modal, setModal]         = useState<Utilizador | null>(null)
  const [expandido, setExpand]    = useState<string | null>(null)

  const SENHA_ADMIN = 'adpulse2026'

  const carregar = async () => {
    setCarr(true)
    try {
      const inicioSemana = new Date()
      inicioSemana.setDate(inicioSemana.getDate() - 7)

      const { data: perfis } = await supabase.from('perfis').select('*').order('criado_em', { ascending: false })
      if (!perfis) { setCarr(false); return }

      const utils: Utilizador[] = await Promise.all(perfis.map(async p => {
        const [
          { count: totalGeracoes },
          { count: geracoesSemana },
          { count: postsAgendados },
          { count: postsPublicados },
        ] = await Promise.all([
          supabase.from('geracoes_ai').select('*', { count: 'exact', head: true }).eq('utilizador_id', p.id),
          supabase.from('geracoes_ai').select('*', { count: 'exact', head: true }).eq('utilizador_id', p.id).gte('criado_em', inicioSemana.toISOString()),
          supabase.from('posts').select('*', { count: 'exact', head: true }).eq('utilizador_id', p.id).eq('estado', 'agendado'),
          supabase.from('posts').select('*', { count: 'exact', head: true }).eq('utilizador_id', p.id).eq('estado', 'publicado'),
        ])

        const u = {
          id: p.id,
          email: p.email,
          nome: p.nome || p.email?.split('@')[0] || 'Utilizador',
          plano: p.plano || 'gratuito',
          criado_em: p.criado_em,
          total_geracoes: totalGeracoes || 0,
          geracoes_ultima_semana: geracoesSemana || 0,
          posts_agendados: postsAgendados || 0,
          posts_publicados: postsPublicados || 0,
          saude: 'verde' as SaudeUtilizador,
          motivo_saude: '',
        }
        const { saude, motivo } = calcularSaude(u)
        return { ...u, saude, motivo_saude: motivo }
      }))

      setUtils(utils)
    } catch (err) { console.error(err) }
    setCarr(false)
  }

  useEffect(() => { if (autenticado) carregar() }, [autenticado])

  if (!autenticado) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f' }}>
        <div style={{ width: 360, padding: 32, borderRadius: 20, background: '#111118', border: '1px solid #22222e' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#7c7bfa', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <Zap size={22} color="#fff" fill="#fff" />
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#f0f0f5', margin: 0 }}>AdPulse Admin</h1>
            <p style={{ fontSize: 13, color: '#8888aa', marginTop: 4 }}>Acesso restrito à equipa</p>
          </div>
          <input type="password" value={senha} onChange={e => setSenha(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && senha === SENHA_ADMIN && setAuth(true)}
            placeholder="Palavra-passe de administrador"
            style={{ width: '100%', padding: '12px 16px', borderRadius: 12, background: '#16161f', border: '1px solid #22222e', color: '#f0f0f5', fontSize: 14, outline: 'none', marginBottom: 12, boxSizing: 'border-box' }} />
          <button onClick={() => senha === SENHA_ADMIN && setAuth(true)}
            style={{ width: '100%', padding: 12, borderRadius: 12, background: '#7c7bfa', border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Entrar
          </button>
          {senha && senha !== SENHA_ADMIN && <p style={{ fontSize: 12, color: '#f87171', textAlign: 'center', marginTop: 8 }}>Senha incorreta</p>}
        </div>
      </div>
    )
  }

  const filtrados = utilizadores.filter(u => {
    const mF = filtro === 'todos' || u.saude === filtro
    const mP = pesquisa === '' || u.nome.toLowerCase().includes(pesquisa.toLowerCase()) || u.email.toLowerCase().includes(pesquisa.toLowerCase())
    return mF && mP
  })

  const cont = {
    total:    utilizadores.length,
    verde:    utilizadores.filter(u => u.saude === 'verde').length,
    amarelo:  utilizadores.filter(u => u.saude === 'amarelo').length,
    vermelho: utilizadores.filter(u => u.saude === 'vermelho').length,
    pro:      utilizadores.filter(u => u.plano !== 'gratuito').length,
  }

  return (
    <>
      <Head><title>Admin — AdPulse</title></Head>
      <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#f0f0f5', fontFamily: 'inherit' }}>

        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #22222e', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: '#7c7bfa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={16} color="#fff" fill="#fff" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 16 }}>AdPulse</span>
            <span style={{ fontSize: 11, color: '#7c7bfa', padding: '2px 8px', borderRadius: 6, background: 'rgba(124,123,250,0.15)', border: '1px solid rgba(124,123,250,0.3)' }}>ADMIN</span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={carregar} disabled={carregando}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: 'rgba(124,123,250,0.1)', border: '1px solid rgba(124,123,250,0.2)', color: '#7c7bfa', cursor: 'pointer', fontSize: 12 }}>
              <RefreshCw size={12} /> Atualizar
            </button>
            <button onClick={() => setAuth(false)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', cursor: 'pointer', fontSize: 12 }}>
              <LogOut size={12} /> Sair
            </button>
          </div>
        </header>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>

          {/* Métricas */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 32 }}>
            {[
              { label: 'Total utilizadores', valor: cont.total,    cor: '#7c7bfa', icone: Users         },
              { label: 'A crescer bem',       valor: cont.verde,    cor: '#34d399', icone: CheckCircle   },
              { label: 'Precisam atenção',    valor: cont.amarelo,  cor: '#fbbf24', icone: AlertTriangle },
              { label: 'Em dificuldade',      valor: cont.vermelho, cor: '#f87171', icone: AlertCircle   },
              { label: 'Planos pagos',        valor: cont.pro,      cor: '#c084fc', icone: Crown         },
            ].map(m => {
              const Icone = m.icone
              return (
                <div key={m.label} style={{ padding: '20px 16px', borderRadius: 16, textAlign: 'center', background: '#111118', border: `1px solid ${m.cor}20` }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${m.cor}15`, border: `1px solid ${m.cor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                    <Icone size={18} color={m.cor} />
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: m.cor }}>{carregando ? '...' : m.valor}</div>
                  <div style={{ fontSize: 11, color: '#8888aa', marginTop: 4 }}>{m.label}</div>
                </div>
              )
            })}
          </div>

          {/* Filtros */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {([
                { id: 'todos',    label: `Todos (${cont.total})`,        cor: '#7c7bfa' },
                { id: 'verde',    label: `🟢 Bem (${cont.verde})`,       cor: '#34d399' },
                { id: 'amarelo',  label: `🟡 Atenção (${cont.amarelo})`, cor: '#fbbf24' },
                { id: 'vermelho', label: `🔴 Dif. (${cont.vermelho})`,   cor: '#f87171' },
              ] as const).map(f => (
                <button key={f.id} onClick={() => setFiltro(f.id)}
                  style={{ padding: '6px 14px', borderRadius: 10, fontSize: 12, fontWeight: 500, cursor: 'pointer', background: filtro === f.id ? `${f.cor}15` : '#111118', border: `1px solid ${filtro === f.id ? f.cor + '40' : '#22222e'}`, color: filtro === f.id ? f.cor : '#8888aa' }}>
                  {f.label}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 12, background: '#111118', border: '1px solid #22222e', flex: 1, maxWidth: 280 }}>
              <Search size={14} color="#8888aa" />
              <input value={pesquisa} onChange={e => setPesquisa(e.target.value)} placeholder="Pesquisar..."
                style={{ background: 'none', border: 'none', outline: 'none', color: '#f0f0f5', fontSize: 13, width: '100%' }} />
            </div>
          </div>

          {carregando && (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <Loader size={28} style={{ color: '#7c7bfa', margin: '0 auto 12px', display: 'block' }} />
              <p style={{ color: '#8888aa', fontSize: 13 }}>A carregar utilizadores reais...</p>
            </div>
          )}

          {!carregando && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtrados.length === 0 && (
                <div style={{ textAlign: 'center', padding: 48, color: '#8888aa' }}>
                  <Users size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                  <p>Nenhum utilizador encontrado</p>
                </div>
              )}
              {filtrados.map(u => (
                <div key={u.id} style={{ borderRadius: 16, background: '#111118', border: `1px solid ${COR_SAUDE[u.saude]}25`, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, background: COR_SAUDE[u.saude], boxShadow: `0 0 8px ${COR_SAUDE[u.saude]}` }} />
                    <div style={{ width: 38, height: 38, borderRadius: 12, flexShrink: 0, background: `${COR_SAUDE[u.saude]}15`, border: `1px solid ${COR_SAUDE[u.saude]}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: COR_SAUDE[u.saude] }}>
                      {u.nome.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{u.nome}</span>
                        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, fontWeight: 600, background: `${COR_PLANO[u.plano]}15`, border: `1px solid ${COR_PLANO[u.plano]}30`, color: COR_PLANO[u.plano], textTransform: 'uppercase' }}>{u.plano}</span>
                        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, background: BG_SAUDE[u.saude], border: `1px solid ${COR_SAUDE[u.saude]}30`, color: COR_SAUDE[u.saude] }}>{u.motivo_saude}</span>
                      </div>
                      <p style={{ fontSize: 12, color: '#8888aa', margin: '2px 0 0' }}>{u.email}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 24, flexShrink: 0 }}>
                      {[
                        { valor: u.total_geracoes, label: 'gerações', cor: '#7c7bfa' },
                        { valor: u.posts_publicados, label: 'publicados', cor: '#34d399' },
                        { valor: u.geracoes_ultima_semana, label: 'esta semana', cor: '#fbbf24' },
                      ].map(s => (
                        <div key={s.label} style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 18, fontWeight: 700, color: s.cor }}>{s.valor}</div>
                          <div style={{ fontSize: 10, color: '#8888aa' }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <button onClick={() => setModal(u)}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, fontSize: 12, fontWeight: 500, background: `${COR_SAUDE[u.saude]}15`, border: `1px solid ${COR_SAUDE[u.saude]}30`, color: COR_SAUDE[u.saude], cursor: 'pointer' }}>
                        <Mail size={12} /> Contactar
                      </button>
                      <button onClick={() => setExpand(expandido === u.id ? null : u.id)}
                        style={{ padding: 7, borderRadius: 10, background: '#16161f', border: '1px solid #22222e', color: '#8888aa', cursor: 'pointer' }}>
                        <ChevronDown size={14} style={{ transform: expandido === u.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                      </button>
                    </div>
                  </div>
                  {expandido === u.id && (
                    <div style={{ padding: '16px 20px', borderTop: '1px solid #22222e', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                      {[
                        { label: 'Membro desde',        valor: new Date(u.criado_em).toLocaleDateString('pt-PT'), icone: Clock     },
                        { label: 'Posts agendados',      valor: u.posts_agendados.toString(),                       icone: BarChart2 },
                        { label: 'Gerações esta semana', valor: u.geracoes_ultima_semana.toString(),                icone: Zap       },
                        { label: 'Total gerações',       valor: u.total_geracoes.toString(),                        icone: Eye       },
                      ].map(d => {
                        const Icone = d.icone
                        return (
                          <div key={d.label} style={{ padding: '12px 16px', borderRadius: 12, background: '#16161f', border: '1px solid #22222e' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                              <Icone size={12} color="#8888aa" />
                              <span style={{ fontSize: 11, color: '#8888aa' }}>{d.label}</span>
                            </div>
                            <div style={{ fontSize: 16, fontWeight: 600 }}>{d.valor}</div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {modal && <ModalContacto utilizador={modal} onFechar={() => setModal(null)} />}
    </>
  )
}
