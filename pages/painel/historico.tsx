// ============================================
// AdPulse — Histórico de Gerações
// ============================================

import Head from 'next/head'
import { useState, useEffect } from 'react'
import { Copy, Check, Search, Loader, Trash2, Filter } from 'lucide-react'
import LayoutPainel from '@/components/layout/LayoutPainel'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

type Geracao = {
  id: string
  tipo: string
  prompt_entrada: string
  resultado: string
  tokens_usados: number
  criado_em: string
}

function tempoRelativo(data: string): string {
  const diff = Date.now() - new Date(data).getTime()
  const min  = Math.floor(diff / 60000)
  const h    = Math.floor(diff / 3600000)
  const d    = Math.floor(diff / 86400000)
  if (min < 1)  return 'agora'
  if (min < 60) return `há ${min}m`
  if (h < 24)   return `há ${h}h`
  if (d < 7)    return `há ${d} dia${d > 1 ? 's' : ''}`
  return new Date(data).toLocaleDateString('pt-PT')
}

export default function Historico() {
  const { utilizador }              = useAuth()
  const [geracoes, setGeracoes]     = useState<Geracao[]>([])
  const [carregando, setCarr]       = useState(true)
  const [pesquisa, setPesq]         = useState('')
  const [copiado, setCopiado]       = useState<string | null>(null)
  const [expandido, setExpand]      = useState<string | null>(null)
  const [filtroTipo, setFiltro]     = useState('todos')

  useEffect(() => {
    if (!utilizador) return
    const carregar = async () => {
      setCarr(true)
      const { data } = await supabase
        .from('geracoes_ai')
        .select('*')
        .eq('utilizador_id', utilizador.id)
        .order('criado_em', { ascending: false })
        .limit(100)
      if (data) setGeracoes(data)
      setCarr(false)
    }
    carregar()
  }, [utilizador])

  const copiar = (id: string, texto: string) => {
    navigator.clipboard.writeText(texto)
    setCopiado(id)
    setTimeout(() => setCopiado(null), 2000)
  }

  const apagar = async (id: string) => {
    await supabase.from('geracoes_ai').delete().eq('id', id)
    setGeracoes(prev => prev.filter(g => g.id !== id))
  }

  const tipos = ['todos', ...Array.from(new Set(geracoes.map(g => g.tipo).filter(Boolean)))]

  const filtradas = geracoes.filter(g => {
    const mTipo = filtroTipo === 'todos' || g.tipo === filtroTipo
    const mPesq = pesquisa === '' ||
      g.prompt_entrada?.toLowerCase().includes(pesquisa.toLowerCase()) ||
      g.resultado?.toLowerCase().includes(pesquisa.toLowerCase())
    return mTipo && mPesq
  })

  const totalTokens = geracoes.reduce((acc, g) => acc + (g.tokens_usados || 0), 0)

  return (
    <>
      <Head><title>Histórico — AdPulse</title></Head>
      <LayoutPainel titulo="Histórico de Gerações">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total gerações', valor: geracoes.length, cor: '#7c7bfa' },
              { label: 'Esta semana',    valor: geracoes.filter(g => Date.now() - new Date(g.criado_em).getTime() < 7 * 86400000).length, cor: '#34d399' },
              { label: 'Tokens usados',  valor: totalTokens > 1000 ? `${(totalTokens/1000).toFixed(1)}k` : totalTokens, cor: '#fbbf24' },
            ].map(s => (
              <div key={s.label} className="card text-center py-4">
                <div className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--fonte-display)', color: s.cor }}>
                  {carregando ? '...' : s.valor}
                </div>
                <div className="text-xs" style={{ color: 'var(--cor-texto-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2 flex-1 min-w-48 px-3 py-2 rounded-xl"
              style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)' }}>
              <Search size={14} style={{ color: 'var(--cor-texto-muted)', flexShrink: 0 }} />
              <input value={pesquisa} onChange={e => setPesq(e.target.value)}
                placeholder="Pesquisar no histórico..."
                style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--cor-texto)', fontSize: 13, width: '100%' }} />
            </div>
            <div className="flex gap-2 flex-wrap">
              {tipos.map(t => (
                <button key={t} onClick={() => setFiltro(t)}
                  className="px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all"
                  style={{
                    background: filtroTipo === t ? 'rgba(124,123,250,0.15)' : 'var(--cor-elevado)',
                    border: `1px solid ${filtroTipo === t ? 'rgba(124,123,250,0.4)' : 'var(--cor-borda)'}`,
                    color: filtroTipo === t ? 'var(--cor-marca)' : 'var(--cor-texto-muted)',
                  }}>
                  {t === 'todos' ? `Todos (${geracoes.length})` : t}
                </button>
              ))}
            </div>
          </div>

          {/* Lista */}
          {carregando ? (
            <div className="flex items-center justify-center py-16">
              <Loader size={24} className="animate-spin" style={{ color: 'var(--cor-marca)' }} />
            </div>
          ) : filtradas.length === 0 ? (
            <div className="card flex flex-col items-center justify-center text-center py-16">
              <div className="text-4xl mb-3">📭</div>
              <p className="font-semibold" style={{ fontFamily: 'var(--fonte-display)' }}>
                {geracoes.length === 0 ? 'Ainda não geraste conteúdo' : 'Nenhum resultado encontrado'}
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--cor-texto-muted)' }}>
                {geracoes.length === 0 ? 'Vai ao AI Content Studio e gera o teu primeiro conteúdo!' : 'Tenta outra pesquisa'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filtradas.map(g => {
                let resultado: any = {}
                try { resultado = JSON.parse(g.resultado || '{}') } catch { resultado = { legenda: g.resultado } }

                const legenda  = resultado.legenda  || resultado.texto || ''
                const hook     = resultado.hook     || ''
                const hashtags = resultado.hashtags || []

                return (
                  <div key={g.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    {/* Header */}
                    <div className="flex items-center gap-3 p-4 cursor-pointer"
                      style={{ background: expandido === g.id ? 'rgba(124,123,250,0.04)' : 'transparent' }}
                      onClick={() => setExpand(expandido === g.id ? null : g.id)}>

                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                        style={{ background: 'rgba(124,123,250,0.1)', border: '1px solid rgba(124,123,250,0.2)' }}>
                        ✨
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{g.prompt_entrada || 'Geração de conteúdo'}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {g.tipo && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full"
                              style={{ background: 'rgba(124,123,250,0.1)', color: 'var(--cor-marca)', border: '1px solid rgba(124,123,250,0.2)' }}>
                              {g.tipo}
                            </span>
                          )}
                          <span className="text-xs" style={{ color: 'var(--cor-texto-fraco)' }}>
                            {tempoRelativo(g.criado_em)}
                          </span>
                          {g.tokens_usados > 0 && (
                            <span className="text-xs" style={{ color: 'var(--cor-texto-fraco)' }}>
                              {g.tokens_usados} tokens
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={e => { e.stopPropagation(); copiar(g.id, legenda || g.resultado || '') }}
                          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg"
                          style={{ color: copiado === g.id ? 'var(--cor-sucesso)' : 'var(--cor-marca)', background: 'rgba(124,123,250,0.1)', border: '1px solid rgba(124,123,250,0.2)' }}>
                          {copiado === g.id ? <><Check size={11} /> Copiado</> : <><Copy size={11} /> Copiar</>}
                        </button>
                        <button onClick={e => { e.stopPropagation(); apagar(g.id) }}
                          className="p-1.5 rounded-lg"
                          style={{ color: 'var(--cor-texto-fraco)', background: 'none', border: 'none', cursor: 'pointer' }}
                          onMouseOver={e => { (e.currentTarget as HTMLElement).style.color = 'var(--cor-erro)'; (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.1)' }}
                          onMouseOut={e => { (e.currentTarget as HTMLElement).style.color = 'var(--cor-texto-fraco)'; (e.currentTarget as HTMLElement).style.background = 'none' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Conteúdo expandido */}
                    {expandido === g.id && (
                      <div className="flex flex-col gap-3 p-4 pt-0">
                        <div style={{ height: 1, background: 'var(--cor-borda)' }} />

                        {hook && (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--cor-aviso)' }}>⚡ Hook</p>
                            <p className="text-sm p-3 rounded-xl" style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)', color: 'var(--cor-texto-muted)' }}>
                              {hook}
                            </p>
                          </div>
                        )}

                        {legenda && (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--cor-marca)' }}>📝 Legenda</p>
                            <p className="text-sm p-3 rounded-xl leading-relaxed whitespace-pre-line"
                              style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', color: 'var(--cor-texto-muted)' }}>
                              {legenda}
                            </p>
                          </div>
                        )}

                        {hashtags.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--cor-info)' }}># Hashtags</p>
                            <div className="flex flex-wrap gap-1.5">
                              {hashtags.map((h: string, i: number) => (
                                <span key={i} className="text-xs px-2.5 py-1 rounded-full"
                                  style={{ background: 'rgba(96,165,250,0.1)', color: 'var(--cor-info)', border: '1px solid rgba(96,165,250,0.2)' }}>
                                  {h}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <button onClick={() => copiar(`${g.id}-tudo`, `${hook}\n\n${legenda}\n\n${hashtags.join(' ')}`)}
                          className="flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium"
                          style={{ background: 'rgba(124,123,250,0.1)', border: '1px solid rgba(124,123,250,0.2)', color: 'var(--cor-marca)' }}>
                          {copiado === `${g.id}-tudo` ? <><Check size={14} /> Copiado!</> : <><Copy size={14} /> Copiar tudo</>}
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </LayoutPainel>
    </>
  )
}
