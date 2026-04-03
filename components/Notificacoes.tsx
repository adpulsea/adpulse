// ============================================
// AdPulse — Componente de Notificações
// ============================================

import { useState, useEffect, useRef } from 'react'
import { Bell, Check, CheckCheck, X, Calendar, Sparkles, AlertTriangle, Info, Trophy } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

type Notificacao = {
  id: string
  titulo: string
  mensagem: string
  tipo: 'info' | 'sucesso' | 'aviso' | 'erro'
  lida: boolean
  link?: string
  criado_em: string
}

const COR_TIPO: Record<string, string> = {
  info:    '#60a5fa',
  sucesso: '#34d399',
  aviso:   '#fbbf24',
  erro:    '#f87171',
}

const ICONE_TIPO: Record<string, any> = {
  info:    Info,
  sucesso: Trophy,
  aviso:   AlertTriangle,
  erro:    X,
}

function tempoRelativo(data: string): string {
  const diff = Date.now() - new Date(data).getTime()
  const min  = Math.floor(diff / 60000)
  const h    = Math.floor(diff / 3600000)
  const d    = Math.floor(diff / 86400000)
  if (min < 1)  return 'agora'
  if (min < 60) return `há ${min}m`
  if (h < 24)   return `há ${h}h`
  return `há ${d}d`
}

export default function Notificacoes() {
  const { utilizador }                    = useAuth()
  const [aberto, setAberto]               = useState(false)
  const [notificacoes, setNotificacoes]   = useState<Notificacao[]>([])
  const [carregando, setCarr]             = useState(false)
  const ref                               = useRef<HTMLDivElement>(null)

  const naoLidas = notificacoes.filter(n => !n.lida).length

  // Fechar ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAberto(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Carregar notificações
  useEffect(() => {
    if (!utilizador) return
    const carregar = async () => {
      setCarr(true)
      const { data } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('utilizador_id', utilizador.id)
        .order('criado_em', { ascending: false })
        .limit(20)
      if (data) setNotificacoes(data)
      setCarr(false)
    }
    carregar()

    // Subscrever a novas notificações em tempo real
    const canal = supabase
      .channel('notificacoes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notificacoes',
        filter: `utilizador_id=eq.${utilizador.id}`,
      }, payload => {
        setNotificacoes(prev => [payload.new as Notificacao, ...prev])
      })
      .subscribe()

    return () => { supabase.removeChannel(canal) }
  }, [utilizador])

  const marcarLida = async (id: string) => {
    await supabase.from('notificacoes').update({ lida: true }).eq('id', id)
    setNotificacoes(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n))
  }

  const marcarTodasLidas = async () => {
    if (!utilizador) return
    await supabase.from('notificacoes').update({ lida: true }).eq('utilizador_id', utilizador.id)
    setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })))
  }

  const apagarNotificacao = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await supabase.from('notificacoes').delete().eq('id', id)
    setNotificacoes(prev => prev.filter(n => n.id !== id))
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Botão do sininho */}
      <button
        onClick={() => setAberto(o => !o)}
        style={{
          position: 'relative', padding: '8px', borderRadius: '12px',
          background: aberto ? 'var(--cor-elevado)' : 'transparent',
          border: 'none', cursor: 'pointer', color: 'var(--cor-texto-muted)',
          transition: 'all 0.2s',
        }}
        onMouseOver={e => { e.currentTarget.style.background = 'var(--cor-elevado)'; e.currentTarget.style.color = 'var(--cor-texto)' }}
        onMouseOut={e => { if (!aberto) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--cor-texto-muted)' } }}>
        <Bell size={18} />
        {naoLidas > 0 && (
          <span style={{
            position: 'absolute', top: 4, right: 4,
            width: 16, height: 16, borderRadius: '50%',
            background: 'var(--cor-marca)', color: '#fff',
            fontSize: 9, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--cor-fundo)',
          }}>
            {naoLidas > 9 ? '9+' : naoLidas}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {aberto && (
        <div style={{
          position: 'absolute', top: '48px', right: 0,
          width: 360, maxHeight: 480,
          background: 'var(--cor-card)',
          border: '1px solid var(--cor-borda)',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden', zIndex: 100,
        }}>

          {/* Header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--cor-borda)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'linear-gradient(135deg, rgba(124,123,250,0.06), transparent)',
          }}>
            <div>
              <p style={{ fontFamily: 'var(--fonte-display)', fontWeight: 600, fontSize: 15 }}>Notificações</p>
              {naoLidas > 0 && (
                <p style={{ fontSize: 12, color: 'var(--cor-texto-muted)', marginTop: 2 }}>
                  {naoLidas} não {naoLidas === 1 ? 'lida' : 'lidas'}
                </p>
              )}
            </div>
            {naoLidas > 0 && (
              <button onClick={marcarTodasLidas}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 12, color: 'var(--cor-marca)',
                  background: 'rgba(124,123,250,0.1)', border: '1px solid rgba(124,123,250,0.2)',
                  padding: '5px 10px', borderRadius: '8px', cursor: 'pointer',
                }}>
                <CheckCheck size={12} /> Marcar todas
              </button>
            )}
          </div>

          {/* Lista */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {carregando ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--cor-texto-muted)', fontSize: 13 }}>
                A carregar...
              </div>
            ) : notificacoes.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center' }}>
                <Bell size={32} style={{ color: 'var(--cor-texto-fraco)', margin: '0 auto 12px', opacity: 0.3 }} />
                <p style={{ color: 'var(--cor-texto-muted)', fontSize: 13 }}>Sem notificações</p>
              </div>
            ) : (
              notificacoes.map(n => {
                const Icone = ICONE_TIPO[n.tipo] || Info
                const cor = COR_TIPO[n.tipo] || '#60a5fa'
                const conteudo = (
                  <div
                    key={n.id}
                    onClick={() => marcarLida(n.id)}
                    style={{
                      padding: '14px 20px',
                      borderBottom: '1px solid var(--cor-borda)',
                      background: n.lida ? 'transparent' : 'rgba(124,123,250,0.04)',
                      cursor: 'pointer',
                      display: 'flex', gap: 12, alignItems: 'flex-start',
                      transition: 'background 0.15s',
                      textDecoration: 'none',
                      color: 'inherit',
                    }}
                    onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                    onMouseOut={e => (e.currentTarget.style.background = n.lida ? 'transparent' : 'rgba(124,123,250,0.04)')}>

                    {/* Ícone */}
                    <div style={{
                      width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
                      background: `${cor}15`, border: `1px solid ${cor}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icone size={16} color={cor} />
                    </div>

                    {/* Conteúdo */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--cor-texto)' }}>{n.titulo}</p>
                        {!n.lida && (
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--cor-marca)', flexShrink: 0 }} />
                        )}
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--cor-texto-muted)', lineHeight: 1.5 }}>{n.mensagem}</p>
                      <p style={{ fontSize: 11, color: 'var(--cor-texto-fraco)', marginTop: 4 }}>{tempoRelativo(n.criado_em)}</p>
                    </div>

                    {/* Apagar */}
                    <button onClick={e => apagarNotificacao(n.id, e)}
                      style={{
                        flexShrink: 0, width: 24, height: 24, borderRadius: '6px',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--cor-texto-fraco)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        opacity: 0,
                      }}
                      onMouseOver={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; e.currentTarget.style.color = 'var(--cor-erro)' }}
                      onMouseOut={e => { e.currentTarget.style.opacity = '0'; e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--cor-texto-fraco)' }}>
                      <X size={12} />
                    </button>
                  </div>
                )

                return n.link ? (
                  <Link key={n.id} href={n.link} style={{ textDecoration: 'none' }} onClick={() => { marcarLida(n.id); setAberto(false) }}>
                    {conteudo}
                  </Link>
                ) : (
                  <div key={n.id}>{conteudo}</div>
                )
              })
            )}
          </div>

          {/* Footer */}
          {notificacoes.length > 0 && (
            <div style={{ padding: '10px 20px', borderTop: '1px solid var(--cor-borda)', textAlign: 'center' }}>
              <button onClick={marcarTodasLidas}
                style={{ fontSize: 12, color: 'var(--cor-texto-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                Limpar todas as notificações
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
