// ============================================
// AdPulse — Agente de Research & Intelligence
// ============================================

import Head from 'next/head'
import { useState } from 'react'
import {
  Search, Loader, RefreshCw, ExternalLink,
  TrendingUp, Zap, Users, Star, ChevronDown, ChevronUp,
  Copy, Check, Sparkles
} from 'lucide-react'
import LayoutPainel from '@/components/layout/LayoutPainel'

type Categoria = 'ia' | 'tendencias' | 'concorrentes' | 'oportunidades'

type Item = {
  titulo: string
  descricao: string
  impacto: 'alto' | 'medio' | 'baixo'
  acao_sugerida: string
  fonte?: string
}

type Relatorio = {
  resumo_executivo: string
  ia: Item[]
  tendencias: Item[]
  concorrentes: Item[]
  oportunidades: Item[]
}

const COR_CAT: Record<Categoria, string> = {
  ia:            '#7c7bfa',
  tendencias:    '#f472b6',
  concorrentes:  '#fbbf24',
  oportunidades: '#34d399',
}

const EMOJI_CAT: Record<Categoria, string> = {
  ia:            '🤖',
  tendencias:    '📈',
  concorrentes:  '🔍',
  oportunidades: '💡',
}

const LABEL_CAT: Record<Categoria, string> = {
  ia:            'Novidades de IA',
  tendencias:    'Tendências Virais',
  concorrentes:  'Análise Concorrentes',
  oportunidades: 'Oportunidades AdPulse',
}

const COR_IMPACTO: Record<string, string> = {
  alto:  '#f87171',
  medio: '#fbbf24',
  baixo: '#34d399',
}

export default function AgenteResearch() {
  const [carregando, setCarr]     = useState(false)
  const [relatorio, setRelatorio] = useState<Relatorio | null>(null)
  const [progresso, setProgresso] = useState(0)
  const [expandido, setExpand]    = useState<Categoria | null>('ia')
  const [copiado, setCopiado]     = useState(false)
  const [foco, setFoco]           = useState('')

  const FOCOS = [
    'Novas ferramentas de IA para criadores',
    'Algoritmo do Instagram esta semana',
    'Funcionalidades do Buffer e Later',
    'Tendências de vídeo curto',
    'Novas APIs de publicação automática',
  ]

  const gerarRelatorio = async () => {
    setCarr(true)
    setRelatorio(null)
    setProgresso(0)

    const intervalo = setInterval(() => {
      setProgresso(p => {
        if (p >= 90) { clearInterval(intervalo); return 90 }
        return p + Math.random() * 8
      })
    }, 400)

    try {
      const r = await fetch('/api/ia/agente-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foco }),
      })
      const d = await r.json()
      clearInterval(intervalo)
      setProgresso(100)
      if (d.relatorio) {
        setRelatorio(d.relatorio)
        setExpand('ia')
      }
    } catch (err) {
      console.error(err)
      clearInterval(intervalo)
    }
    setCarr(false)
  }

  const copiarRelatorio = () => {
    if (!relatorio) return
    const texto = `RELATÓRIO ADPULSE — RESEARCH & INTELLIGENCE\n\n${relatorio.resumo_executivo}\n\n[IA]\n${relatorio.ia.map(i => `• ${i.titulo}: ${i.descricao}`).join('\n')}\n\n[TENDÊNCIAS]\n${relatorio.tendencias.map(i => `• ${i.titulo}: ${i.descricao}`).join('\n')}\n\n[CONCORRENTES]\n${relatorio.concorrentes.map(i => `• ${i.titulo}: ${i.descricao}`).join('\n')}\n\n[OPORTUNIDADES]\n${relatorio.oportunidades.map(i => `• ${i.titulo}: ${i.acao_sugerida}`).join('\n')}`
    navigator.clipboard.writeText(texto)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const CATEGORIAS: Categoria[] = ['ia', 'tendencias', 'concorrentes', 'oportunidades']

  return (
    <>
      <Head><title>Agente Research — AdPulse</title></Head>
      <LayoutPainel titulo="Agente Research & Intelligence">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">

          {/* Header */}
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(96,165,250,0.08), rgba(124,123,250,0.08))', border: '1px solid rgba(96,165,250,0.2)' }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #60a5fa, #7c7bfa)' }}>
                <span style={{ fontSize: 26 }}>🔬</span>
              </div>
              <div>
                <h2 className="font-bold text-xl" style={{ fontFamily: 'var(--fonte-display)' }}>
                  Agente Research & Intelligence
                </h2>
                <p className="text-sm mt-1" style={{ color: 'var(--cor-texto-muted)' }}>
                  Monitoriza novidades de IA, tendências virais, concorrentes e oportunidades para a AdPulse estar sempre à frente.
                </p>
              </div>
            </div>
          </div>

          {/* O que monitoriza */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(Object.keys(LABEL_CAT) as Categoria[]).map(cat => (
              <div key={cat} className="card text-center py-4"
                style={{ border: `1px solid ${COR_CAT[cat]}20` }}>
                <div className="text-2xl mb-2">{EMOJI_CAT[cat]}</div>
                <p className="text-xs font-medium" style={{ color: COR_CAT[cat] }}>{LABEL_CAT[cat]}</p>
              </div>
            ))}
          </div>

          {/* Configuração */}
          <div className="card flex flex-col gap-4">
            <h3 className="font-semibold" style={{ fontFamily: 'var(--fonte-display)' }}>
              Foco desta semana
            </h3>

            <div>
              <label className="label-campo">Área de foco especial (opcional)</label>
              <input value={foco} onChange={e => setFoco(e.target.value)}
                placeholder="Ex: novas ferramentas de IA para criadores de conteúdo..."
                className="input-campo w-full" />
            </div>

            <div className="flex flex-wrap gap-2">
              {FOCOS.map(f => (
                <button key={f} onClick={() => setFoco(f)}
                  className="px-3 py-1.5 rounded-xl text-xs transition-all"
                  style={{ background: foco === f ? 'rgba(96,165,250,0.15)' : 'var(--cor-elevado)', border: `1px solid ${foco === f ? 'rgba(96,165,250,0.4)' : 'var(--cor-borda)'}`, color: foco === f ? '#60a5fa' : 'var(--cor-texto-muted)' }}
                  onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(96,165,250,0.3)' }}
                  onMouseOut={e => { if (foco !== f) (e.currentTarget as HTMLElement).style.borderColor = 'var(--cor-borda)' }}>
                  + {f}
                </button>
              ))}
            </div>

            {carregando && (
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span style={{ color: 'var(--cor-texto-muted)' }}>
                    {progresso < 30 ? '🤖 A pesquisar novidades de IA...' :
                     progresso < 55 ? '📈 A analisar tendências virais...' :
                     progresso < 75 ? '🔍 A monitorizar concorrentes...' :
                     '💡 A identificar oportunidades...'}
                  </span>
                  <span style={{ color: '#60a5fa' }}>{Math.round(progresso)}%</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: 'var(--cor-borda)' }}>
                  <div className="h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progresso}%`, background: 'linear-gradient(90deg, #60a5fa, #7c7bfa)' }} />
                </div>
              </div>
            )}

            <button onClick={gerarRelatorio} disabled={carregando}
              className="btn-primario justify-center py-3"
              style={carregando ? { opacity: 0.6, cursor: 'not-allowed' } : { background: '#60a5fa' }}>
              {carregando
                ? <><Loader size={16} className="animate-spin" /> A pesquisar...</>
                : <><Search size={16} /> Gerar relatório semanal</>}
            </button>
          </div>

          {/* Relatório */}
          {relatorio && (
            <>
              {/* Resumo executivo */}
              <div className="card" style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.2)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} style={{ color: '#60a5fa' }} />
                    <h3 className="font-semibold" style={{ fontFamily: 'var(--fonte-display)' }}>Resumo executivo</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={gerarRelatorio}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
                      style={{ color: 'var(--cor-texto-muted)', background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)' }}>
                      <RefreshCw size={11} /> Regenerar
                    </button>
                    <button onClick={copiarRelatorio}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg"
                      style={{ color: copiado ? 'var(--cor-sucesso)' : '#60a5fa', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)' }}>
                      {copiado ? <><Check size={11} /> Copiado!</> : <><Copy size={11} /> Copiar tudo</>}
                    </button>
                  </div>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--cor-texto-muted)' }}>{relatorio.resumo_executivo}</p>
              </div>

              {/* Categorias */}
              {CATEGORIAS.map(cat => (
                <div key={cat} className="card" style={{ padding: 0, overflow: 'hidden', border: `1px solid ${COR_CAT[cat]}20` }}>
                  <div className="flex items-center gap-3 p-4 cursor-pointer"
                    style={{ background: expandido === cat ? `${COR_CAT[cat]}06` : 'transparent' }}
                    onClick={() => setExpand(expandido === cat ? null : cat)}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: `${COR_CAT[cat]}15`, border: `1px solid ${COR_CAT[cat]}30` }}>
                      {EMOJI_CAT[cat]}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm" style={{ color: COR_CAT[cat] }}>{LABEL_CAT[cat]}</p>
                      <p className="text-xs" style={{ color: 'var(--cor-texto-muted)' }}>
                        {relatorio[cat].length} items encontrados
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {relatorio[cat].filter(i => i.impacto === 'alto').length > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
                          {relatorio[cat].filter(i => i.impacto === 'alto').length} alto impacto
                        </span>
                      )}
                      {expandido === cat ? <ChevronUp size={16} style={{ color: 'var(--cor-texto-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--cor-texto-muted)' }} />}
                    </div>
                  </div>

                  {expandido === cat && (
                    <div className="flex flex-col gap-3 p-4 pt-0">
                      <div style={{ height: 1, background: 'var(--cor-borda)' }} />
                      {relatorio[cat].map((item, i) => (
                        <div key={i} className="p-3 rounded-xl flex flex-col gap-2"
                          style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)' }}>
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-sm">{item.titulo}</p>
                            <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                              style={{ background: `${COR_IMPACTO[item.impacto]}15`, color: COR_IMPACTO[item.impacto], border: `1px solid ${COR_IMPACTO[item.impacto]}30` }}>
                              {item.impacto} impacto
                            </span>
                          </div>
                          <p className="text-sm" style={{ color: 'var(--cor-texto-muted)' }}>{item.descricao}</p>
                          <div className="flex items-start gap-2 p-2 rounded-lg"
                            style={{ background: `${COR_CAT[cat]}08`, border: `1px solid ${COR_CAT[cat]}15` }}>
                            <span className="text-xs font-semibold flex-shrink-0" style={{ color: COR_CAT[cat] }}>→ Ação:</span>
                            <p className="text-xs" style={{ color: 'var(--cor-texto-muted)' }}>{item.acao_sugerida}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {/* Estado vazio */}
          {!carregando && !relatorio && (
            <div className="card flex flex-col items-center justify-center text-center py-16">
              <div className="text-5xl mb-4">🔬</div>
              <h3 className="font-semibold text-lg mb-2" style={{ fontFamily: 'var(--fonte-display)' }}>
                Pronto para pesquisar
              </h3>
              <p className="text-sm mb-1" style={{ color: 'var(--cor-texto-muted)', maxWidth: 380 }}>
                Clica em "Gerar relatório semanal" e o agente vai pesquisar as últimas novidades de IA, tendências e concorrentes.
              </p>
              <p className="text-xs" style={{ color: 'var(--cor-texto-fraco)' }}>
                Recomendamos usar uma vez por semana para manteres a AdPulse sempre atualizada.
              </p>
            </div>
          )}
        </div>
      </LayoutPainel>
    </>
  )
}
