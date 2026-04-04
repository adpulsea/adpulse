// ============================================
// AdPulse — Agente de Prospeção
// ============================================

import Head from 'next/head'
import { useState } from 'react'
import {
  Search, Loader, Copy, Check, RefreshCw,
  Twitter, Linkedin, MessageCircle, TrendingUp,
  User, ExternalLink, Sparkles, Filter, ChevronDown
} from 'lucide-react'
import LayoutPainel from '@/components/layout/LayoutPainel'

type Lead = {
  id: string
  nome: string
  handle: string
  plataforma: 'twitter' | 'reddit' | 'linkedin'
  texto: string
  url: string
  data: string
  relevancia: number
  categoria: 'dificuldade_conteudo' | 'quer_crescer' | 'procura_ferramenta'
  mensagem_sugerida: string
}

const COR_PLATAFORMA: Record<string, string> = {
  twitter:  '#1DA1F2',
  reddit:   '#FF4500',
  linkedin: '#0077B5',
}

const EMOJI_PLATAFORMA: Record<string, string> = {
  twitter:  '𝕏',
  reddit:   '🟠',
  linkedin: '💼',
}

const LABEL_CATEGORIA: Record<string, string> = {
  dificuldade_conteudo: '😩 Dificuldade com conteúdo',
  quer_crescer:         '📈 Quer crescer',
  procura_ferramenta:   '🔍 Procura ferramenta',
}

const COR_CATEGORIA: Record<string, string> = {
  dificuldade_conteudo: '#f87171',
  quer_crescer:         '#34d399',
  procura_ferramenta:   '#fbbf24',
}

const PALAVRAS_CHAVE = [
  'não sei o que publicar',
  'sem ideias para conteúdo',
  'como crescer no instagram',
  'ferramenta de marketing',
  'criação de conteúdo IA',
  'agenda posts automaticamente',
  'preciso de ajuda com redes sociais',
  'como viralizar',
]

export default function AgenteProspeccao() {
  const [carregando, setCarr]       = useState(false)
  const [leads, setLeads]           = useState<Lead[]>([])
  const [filtro, setFiltro]         = useState<'todos' | string>('todos')
  const [copiado, setCopiado]       = useState<string | null>(null)
  const [expandido, setExpand]      = useState<string | null>(null)
  const [palavras, setPalavras]     = useState<string[]>(['não sei o que publicar', 'como crescer no instagram', 'ferramenta de marketing'])
  const [progresso, setProgresso]   = useState(0)

  const copiar = (texto: string, chave: string) => {
    navigator.clipboard.writeText(texto)
    setCopiado(chave)
    setTimeout(() => setCopiado(null), 2000)
  }

  const togglePalavra = (p: string) => {
    setPalavras(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
  }

  const procurarLeads = async () => {
    setCarr(true)
    setLeads([])
    setProgresso(0)

    const intervalo = setInterval(() => {
      setProgresso(p => {
        if (p >= 90) { clearInterval(intervalo); return 90 }
        return p + Math.random() * 12
      })
    }, 300)

    try {
      const r = await fetch('/api/ia/agente-prospeccao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ palavras_chave: palavras }),
      })
      const d = await r.json()
      clearInterval(intervalo)
      setProgresso(100)
      if (d.leads) setLeads(d.leads)
    } catch (err) {
      console.error(err)
      clearInterval(intervalo)
    }
    setCarr(false)
  }

  const leadsFiltrados = filtro === 'todos'
    ? leads
    : leads.filter(l => l.plataforma === filtro || l.categoria === filtro)

  const contagem = {
    total:    leads.length,
    twitter:  leads.filter(l => l.plataforma === 'twitter').length,
    reddit:   leads.filter(l => l.plataforma === 'reddit').length,
    linkedin: leads.filter(l => l.plataforma === 'linkedin').length,
  }

  return (
    <>
      <Head><title>Agente de Prospeção — AdPulse</title></Head>
      <LayoutPainel titulo="Agente de Prospeção">
        <div className="max-w-5xl mx-auto flex flex-col gap-6">

          {/* Header */}
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.08), rgba(124,123,250,0.08))', border: '1px solid rgba(251,191,36,0.2)' }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #fbbf24, #7c7bfa)' }}>
                <span style={{ fontSize: 26 }}>🕵️</span>
              </div>
              <div>
                <h2 className="font-bold text-xl" style={{ fontFamily: 'var(--fonte-display)' }}>
                  Agente de Prospeção
                </h2>
                <p className="text-sm mt-1" style={{ color: 'var(--cor-texto-muted)' }}>
                  Encontra pessoas que precisam da AdPulse no Twitter/X, Reddit e LinkedIn. Gera mensagens personalizadas para cada lead.
                </p>
              </div>
            </div>
          </div>

          {/* Como funciona */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { num: '1', titulo: 'Monitoriza', desc: 'O agente procura por palavras-chave nas redes sociais', cor: '#7c7bfa' },
              { num: '2', titulo: 'Qualifica', desc: 'A IA analisa e pontua cada lead por relevância', cor: '#fbbf24' },
              { num: '3', titulo: 'Sugere', desc: 'Gera uma mensagem personalizada para cada pessoa', cor: '#34d399' },
            ].map(p => (
              <div key={p.num} className="card text-center py-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-bold"
                  style={{ background: `${p.cor}15`, border: `1px solid ${p.cor}30`, color: p.cor }}>
                  {p.num}
                </div>
                <p className="font-semibold text-sm mb-1">{p.titulo}</p>
                <p className="text-xs" style={{ color: 'var(--cor-texto-muted)' }}>{p.desc}</p>
              </div>
            ))}
          </div>

          {/* Configuração */}
          <div className="card flex flex-col gap-4">
            <h3 className="font-semibold" style={{ fontFamily: 'var(--fonte-display)' }}>
              Palavras-chave a monitorizar
            </h3>
            <div className="flex flex-wrap gap-2">
              {PALAVRAS_CHAVE.map(p => (
                <button key={p} onClick={() => togglePalavra(p)}
                  className="px-3 py-1.5 rounded-xl text-xs transition-all"
                  style={{
                    background: palavras.includes(p) ? 'rgba(124,123,250,0.15)' : 'var(--cor-elevado)',
                    border: `1px solid ${palavras.includes(p) ? 'rgba(124,123,250,0.4)' : 'var(--cor-borda)'}`,
                    color: palavras.includes(p) ? 'var(--cor-marca)' : 'var(--cor-texto-muted)',
                  }}>
                  {palavras.includes(p) ? '✓ ' : '+ '}{p}
                </button>
              ))}
            </div>

            {carregando && (
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span style={{ color: 'var(--cor-texto-muted)' }}>A procurar leads em Twitter/X, Reddit e LinkedIn...</span>
                  <span style={{ color: 'var(--cor-marca)' }}>{Math.round(progresso)}%</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: 'var(--cor-borda)' }}>
                  <div className="h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progresso}%`, background: 'linear-gradient(90deg, #fbbf24, #7c7bfa)' }} />
                </div>
              </div>
            )}

            <button onClick={procurarLeads} disabled={carregando || palavras.length === 0}
              className="btn-primario justify-center py-3"
              style={(carregando || palavras.length === 0) ? { opacity: 0.6, cursor: 'not-allowed' } : {}}>
              {carregando
                ? <><Loader size={16} className="animate-spin" /> A procurar leads...</>
                : <><Search size={16} /> Procurar leads agora</>}
            </button>
          </div>

          {/* Resultados */}
          {leads.length > 0 && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Total leads',  valor: contagem.total,    cor: '#7c7bfa' },
                  { label: 'Twitter/X',    valor: contagem.twitter,  cor: '#1DA1F2' },
                  { label: 'Reddit',       valor: contagem.reddit,   cor: '#FF4500' },
                  { label: 'LinkedIn',     valor: contagem.linkedin, cor: '#0077B5' },
                ].map(s => (
                  <div key={s.label} className="card text-center py-3">
                    <div className="text-2xl font-bold" style={{ color: s.cor, fontFamily: 'var(--fonte-display)' }}>{s.valor}</div>
                    <div className="text-xs mt-1" style={{ color: 'var(--cor-texto-muted)' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Filtros */}
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { id: 'todos',    label: `Todos (${contagem.total})` },
                  { id: 'twitter',  label: `𝕏 Twitter (${contagem.twitter})` },
                  { id: 'reddit',   label: `🟠 Reddit (${contagem.reddit})` },
                  { id: 'linkedin', label: `💼 LinkedIn (${contagem.linkedin})` },
                ].map(f => (
                  <button key={f.id} onClick={() => setFiltro(f.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                    style={{
                      background: filtro === f.id ? 'rgba(124,123,250,0.15)' : 'var(--cor-elevado)',
                      border: `1px solid ${filtro === f.id ? 'rgba(124,123,250,0.4)' : 'var(--cor-borda)'}`,
                      color: filtro === f.id ? 'var(--cor-marca)' : 'var(--cor-texto-muted)',
                    }}>
                    {f.label}
                  </button>
                ))}
                <button onClick={procurarLeads}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs ml-auto"
                  style={{ color: 'var(--cor-texto-muted)', background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)' }}>
                  <RefreshCw size={11} /> Atualizar
                </button>
              </div>

              {/* Lista de leads */}
              <div className="flex flex-col gap-3">
                {leadsFiltrados.map(lead => (
                  <div key={lead.id} className="card" style={{ padding: 0, overflow: 'hidden', border: `1px solid ${COR_PLATAFORMA[lead.plataforma]}20` }}>

                    {/* Header */}
                    <div className="flex items-center gap-4 p-4 cursor-pointer"
                      onClick={() => setExpand(expandido === lead.id ? null : lead.id)}>

                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold"
                        style={{ background: `${COR_PLATAFORMA[lead.plataforma]}15`, border: `1px solid ${COR_PLATAFORMA[lead.plataforma]}30`, color: COR_PLATAFORMA[lead.plataforma] }}>
                        {lead.nome.slice(0, 2).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold text-sm">{lead.nome}</span>
                          <span className="text-xs" style={{ color: COR_PLATAFORMA[lead.plataforma] }}>
                            {EMOJI_PLATAFORMA[lead.plataforma]} @{lead.handle}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: `${COR_CATEGORIA[lead.categoria]}15`, color: COR_CATEGORIA[lead.categoria], border: `1px solid ${COR_CATEGORIA[lead.categoria]}30` }}>
                            {LABEL_CATEGORIA[lead.categoria]}
                          </span>
                        </div>
                        <p className="text-xs truncate" style={{ color: 'var(--cor-texto-muted)' }}>
                          "{lead.texto}"
                        </p>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-center">
                          <div className="text-sm font-bold" style={{ color: lead.relevancia >= 80 ? '#34d399' : lead.relevancia >= 60 ? '#fbbf24' : '#f87171' }}>
                            {lead.relevancia}%
                          </div>
                          <div className="text-xs" style={{ color: 'var(--cor-texto-muted)' }}>relevância</div>
                        </div>
                        <ChevronDown size={14} style={{ color: 'var(--cor-texto-muted)', transform: expandido === lead.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                      </div>
                    </div>

                    {/* Expandido */}
                    {expandido === lead.id && (
                      <div className="flex flex-col gap-4 p-4 pt-0">
                        <div style={{ height: 1, background: 'var(--cor-borda)' }} />

                        {/* Post original */}
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--cor-texto-muted)' }}>
                            Post original
                          </p>
                          <div className="p-3 rounded-xl text-sm"
                            style={{ background: `${COR_PLATAFORMA[lead.plataforma]}08`, border: `1px solid ${COR_PLATAFORMA[lead.plataforma]}20`, color: 'var(--cor-texto-muted)' }}>
                            "{lead.texto}"
                          </div>
                          <a href={lead.url} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1 text-xs mt-2"
                            style={{ color: COR_PLATAFORMA[lead.plataforma], textDecoration: 'none' }}>
                            <ExternalLink size={11} /> Ver post original
                          </a>
                        </div>

                        {/* Mensagem sugerida */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Sparkles size={13} style={{ color: 'var(--cor-marca)' }} />
                              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--cor-texto-muted)' }}>
                                Mensagem sugerida pela IA
                              </p>
                            </div>
                            <button onClick={() => copiar(lead.mensagem_sugerida, `msg-${lead.id}`)}
                              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg"
                              style={{ color: copiado === `msg-${lead.id}` ? 'var(--cor-sucesso)' : 'var(--cor-marca)', background: 'rgba(124,123,250,0.1)', border: '1px solid rgba(124,123,250,0.2)' }}>
                              {copiado === `msg-${lead.id}` ? <><Check size={11} /> Copiado!</> : <><Copy size={11} /> Copiar mensagem</>}
                            </button>
                          </div>
                          <div className="p-3 rounded-xl text-sm leading-relaxed"
                            style={{ background: 'rgba(124,123,250,0.06)', border: '1px solid rgba(124,123,250,0.15)', color: 'var(--cor-texto-muted)', whiteSpace: 'pre-line' }}>
                            {lead.mensagem_sugerida}
                          </div>
                        </div>

                        {/* Ações */}
                        <div className="flex gap-2">
                          <a href={lead.url} target="_blank" rel="noreferrer"
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium flex-1 justify-center"
                            style={{ background: `${COR_PLATAFORMA[lead.plataforma]}15`, border: `1px solid ${COR_PLATAFORMA[lead.plataforma]}30`, color: COR_PLATAFORMA[lead.plataforma], textDecoration: 'none' }}>
                            <ExternalLink size={14} /> Responder no {lead.plataforma}
                          </a>
                          <button onClick={() => copiar(lead.mensagem_sugerida, `msg-${lead.id}`)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
                            style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', color: 'var(--cor-texto-muted)' }}>
                            <Copy size={14} /> Copiar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Estado vazio */}
          {!carregando && leads.length === 0 && (
            <div className="card flex flex-col items-center justify-center text-center py-16">
              <div className="text-5xl mb-4">🕵️</div>
              <h3 className="font-semibold text-lg mb-2" style={{ fontFamily: 'var(--fonte-display)' }}>
                Pronto para encontrar leads
              </h3>
              <p className="text-sm mb-2" style={{ color: 'var(--cor-texto-muted)', maxWidth: 380 }}>
                Seleciona as palavras-chave e clica em "Procurar leads agora".
              </p>
              <p className="text-xs" style={{ color: 'var(--cor-texto-fraco)' }}>
                O agente vai encontrar pessoas que precisam da AdPulse e gerar mensagens personalizadas.
              </p>
            </div>
          )}
        </div>
      </LayoutPainel>
    </>
  )
}
