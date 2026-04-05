// ============================================
// AdPulse — AI Content Studio
// ============================================

import Head from 'next/head'
import { useState, useEffect } from 'react'
import {
  Sparkles, Copy, RefreshCw, Hash, Zap,
  TrendingUp, CheckCircle, ChevronRight, ChevronLeft,
  Instagram, Youtube, Loader
} from 'lucide-react'
import LayoutPainel from '@/components/layout/LayoutPainel'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { usePlano } from '@/hooks/usePlano'

// Tipos de formato disponíveis
const FORMATOS = [
  { id: 'reel',      label: 'Reel',      emoji: '🎬' },
  { id: 'carrossel', label: 'Carrossel', emoji: '📸' },
  { id: 'story',     label: 'Story',     emoji: '⭕' },
  { id: 'post',      label: 'Post',      emoji: '🖼️' },
  { id: 'short',     label: 'Short',     emoji: '▶️' },
]

const PLATAFORMAS = [
  { id: 'instagram', label: 'Instagram', cor: '#E1306C' },
  { id: 'tiktok',    label: 'TikTok',    cor: '#00f2ea' },
  { id: 'youtube',   label: 'YouTube',   cor: '#FF0000' },
  { id: 'linkedin',  label: 'LinkedIn',  cor: '#0077B5' },
]

const TONS = ['Informal', 'Profissional', 'Divertido', 'Inspirador', 'Educativo']

const EXEMPLOS = [
  'Dica de produtividade para empreendedores',
  'Rotina da manhã que mudou a minha vida',
  'O erro que me custou 5000€',
  'Como cresci 10k seguidores em 30 dias',
]

// Calcular score do conteúdo
function calcularScore(hook: string, legenda: string, hashtags: string[]): {
  total: number, hook: number, legenda: number, hashtags: number, cta: number
} {
  const scoreHook     = Math.min(hook.length > 20 ? 85 + Math.random() * 15 : 40, 100)
  const scoreLegenda  = Math.min(legenda.length > 50 ? 75 + Math.random() * 20 : 30, 100)
  const scoreHashtags = Math.min(hashtags.length >= 5 ? 80 + Math.random() * 20 : hashtags.length * 15, 100)
  const scoreCta      = legenda.toLowerCase().includes('comentar') || legenda.toLowerCase().includes('guardar') || legenda.includes('?') ? 85 : 55

  const total = Math.round((scoreHook + scoreLegenda + scoreHashtags + scoreCta) / 4)

  return {
    total,
    hook:     Math.round(scoreHook),
    legenda:  Math.round(scoreLegenda),
    hashtags: Math.round(scoreHashtags),
    cta:      Math.round(scoreCta),
  }
}

// Barra de score
function BarraScore({ label, valor }: { label: string, valor: number }) {
  const cor = valor >= 80 ? 'var(--cor-sucesso)' : valor >= 60 ? 'var(--cor-aviso)' : 'var(--cor-erro)'
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span style={{ color: 'var(--cor-texto-muted)' }}>{label}</span>
        <span style={{ color: cor, fontWeight: 600 }}>{valor}</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background: 'var(--cor-borda)' }}>
        <div className="h-1.5 rounded-full transition-all duration-700"
          style={{ width: `${valor}%`, background: cor }} />
      </div>
    </div>
  )
}

export default function StudioConteudo() {
  const { utilizador } = useAuth()
  const { isPro } = usePlano()

  // Contador de gerações
  const [geracoesHoje, setGeracoesHoje] = useState(0)
  const limiteGeracoes = isPro ? 999 : 3
  const geracoesRestantes = Math.max(0, limiteGeracoes - geracoesHoje)

  // Carregar gerações de hoje
  useEffect(() => {
    if (!utilizador) return
    const carregar = async () => {
      const inicioHoje = new Date()
      inicioHoje.setHours(0, 0, 0, 0)
      const { count } = await supabase
        .from('geracoes_ai')
        .select('*', { count: 'exact', head: true })
        .eq('utilizador_id', utilizador.id)
        .gte('criado_em', inicioHoje.toISOString())
      setGeracoesHoje(count || 0)
    }
    carregar()
  }, [utilizador])

  // Estado do formulário
  const [topico, setTopico] = useState('')
  const [formato, setFormato] = useState('reel')
  const [plataforma, setPlataforma] = useState('instagram')
  const [tom, setTom] = useState('Informal')

  // Estado do resultado
  const [resultado, setResultado] = useState<{
    hook: string
    legenda: string
    hashtags: string[]
    slides: { tipo: string, conteudo: string }[]
  } | null>(null)

  const [slideAtual, setSlideAtual] = useState(0)
  const [gerandoLegenda, setGerandoLegenda] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [copiado, setCopiado] = useState<string | null>(null)
  const [erroLimite, setErroLimite] = useState(false)

  // Score calculado
  const score = resultado ? calcularScore(resultado.hook, resultado.legenda, resultado.hashtags) : null

  // Gerar conteúdo via API
  const gerarConteudo = async () => {
    if (!topico.trim()) return
    setCarregando(true)
    setErroLimite(false)

    try {
      const resposta = await fetch('/api/ia/gerar-conteudo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topico, plataforma, tom, formato }),
      })

      if (resposta.status === 429) {
        setErroLimite(true)
        return
      }

      const dados = await resposta.json()
      setResultado(dados)
      setSlideAtual(0)
      setGeracoesHoje(prev => prev + 1)
    } catch {
      console.error('Erro ao gerar conteúdo')
    } finally {
      setCarregando(false)
    }
  }

  // Regenerar apenas a legenda
  const regenerarLegenda = async () => {
    if (!resultado) return
    setGerandoLegenda(true)
    try {
      const resposta = await fetch('/api/ia/variacoes-legenda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topico, plataforma }),
      })
      const dados = await resposta.json()
      if (dados[0]) {
        setResultado(prev => prev ? { ...prev, legenda: dados[0] } : prev)
      }
    } catch {
      console.error('Erro ao regenerar legenda')
    } finally {
      setGerandoLegenda(false)
    }
  }

  // Copiar texto
  const copiar = (texto: string, id: string) => {
    navigator.clipboard.writeText(texto)
    setCopiado(id)
    setTimeout(() => setCopiado(null), 2000)
  }

  return (
    <>
      <Head><title>AI Content Studio — AdPulse</title></Head>
      <LayoutPainel titulo="AI Content Studio">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* ============================================================
                PAINEL ESQUERDO — Formulário de input
            ============================================================ */}
            <div className="flex flex-col gap-5">

              {/* Tópico */}
              <div className="card">
                <h3 className="font-semibold mb-4" style={{ fontFamily: 'var(--fonte-display)' }}>
                  Sobre o que é o teu conteúdo?
                </h3>
                <textarea
                  value={topico}
                  onChange={(e) => setTopico(e.target.value)}
                  placeholder="Ex: Como acordar mais cedo e ser mais produtivo..."
                  rows={3}
                  className="input-campo resize-none"
                />
                {/* Exemplos clicáveis */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {EXEMPLOS.map((ex) => (
                    <button key={ex} onClick={() => setTopico(ex)}
                      className="text-xs px-3 py-1.5 rounded-full transition-all duration-150"
                      style={{
                        background: 'var(--cor-elevado)',
                        border: '1px solid var(--cor-borda)',
                        color: 'var(--cor-texto-muted)',
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--cor-marca)'; e.currentTarget.style.color = 'var(--cor-marca)' }}
                      onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--cor-borda)'; e.currentTarget.style.color = 'var(--cor-texto-muted)' }}>
                      {ex}
                    </button>
                  ))}
                </div>
              </div>

              {/* Formato */}
              <div className="card">
                <h3 className="font-semibold mb-3" style={{ fontFamily: 'var(--fonte-display)' }}>
                  Formato
                </h3>
                <div className="flex flex-wrap gap-2">
                  {FORMATOS.map((f) => (
                    <button key={f.id} onClick={() => setFormato(f.id)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150"
                      style={{
                        background: formato === f.id ? 'rgba(124,123,250,0.15)' : 'var(--cor-elevado)',
                        border: `1px solid ${formato === f.id ? 'rgba(124,123,250,0.4)' : 'var(--cor-borda)'}`,
                        color: formato === f.id ? 'var(--cor-marca)' : 'var(--cor-texto-muted)',
                      }}>
                      <span>{f.emoji}</span> {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Plataforma + Tom */}
              <div className="grid grid-cols-2 gap-4">
                <div className="card">
                  <h3 className="font-semibold mb-3" style={{ fontFamily: 'var(--fonte-display)' }}>
                    Plataforma
                  </h3>
                  <div className="flex flex-col gap-2">
                    {PLATAFORMAS.map((p) => (
                      <button key={p.id} onClick={() => setPlataforma(p.id)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-150"
                        style={{
                          background: plataforma === p.id ? `${p.cor}18` : 'transparent',
                          border: `1px solid ${plataforma === p.id ? p.cor + '40' : 'transparent'}`,
                          color: plataforma === p.id ? p.cor : 'var(--cor-texto-muted)',
                        }}>
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.cor }} />
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <h3 className="font-semibold mb-3" style={{ fontFamily: 'var(--fonte-display)' }}>
                    Tom
                  </h3>
                  <div className="flex flex-col gap-2">
                    {TONS.map((t) => (
                      <button key={t} onClick={() => setTom(t)}
                        className="px-3 py-2 rounded-xl text-sm text-left transition-all duration-150"
                        style={{
                          background: tom === t ? 'rgba(124,123,250,0.12)' : 'transparent',
                          color: tom === t ? 'var(--cor-marca)' : 'var(--cor-texto-muted)',
                          border: `1px solid ${tom === t ? 'rgba(124,123,250,0.3)' : 'transparent'}`,
                        }}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contador de gerações */}
              {!isPro && (
                <div className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{
                    background: geracoesRestantes === 0 ? 'rgba(248,113,113,0.08)' : geracoesRestantes === 1 ? 'rgba(251,191,36,0.08)' : 'rgba(124,123,250,0.06)',
                    border: `1px solid ${geracoesRestantes === 0 ? 'rgba(248,113,113,0.3)' : geracoesRestantes === 1 ? 'rgba(251,191,36,0.3)' : 'rgba(124,123,250,0.15)'}`,
                  }}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{geracoesRestantes === 0 ? '🚫' : geracoesRestantes === 1 ? '⚠️' : '✨'}</span>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: geracoesRestantes === 0 ? 'var(--cor-erro)' : geracoesRestantes === 1 ? 'var(--cor-aviso)' : 'var(--cor-marca)' }}>
                        {geracoesRestantes === 0 ? 'Limite atingido' : `${geracoesRestantes} geraç${geracoesRestantes === 1 ? 'ão' : 'ões'} restante${geracoesRestantes === 1 ? '' : 's'} hoje`}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--cor-texto-muted)' }}>
                        {geracoesHoje}/{limiteGeracoes} gerações usadas
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {Array.from({ length: limiteGeracoes }).map((_, i) => (
                        <div key={i} className="w-2 h-5 rounded-sm"
                          style={{ background: i < geracoesHoje ? (geracoesRestantes === 0 ? 'var(--cor-erro)' : 'var(--cor-aviso)') : 'var(--cor-borda)' }} />
                      ))}
                    </div>
                    <a href="/precos" className="text-xs font-medium px-2.5 py-1 rounded-lg"
                      style={{ background: 'var(--cor-marca)', color: '#fff', textDecoration: 'none' }}>
                      Pro
                    </a>
                  </div>
                </div>
              )}

              {/* Aviso de limite */}
              {erroLimite && (
                <div className="p-4 rounded-xl text-sm" style={{
                  background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: 'var(--cor-aviso)' }}>
                  Atingiste o limite diário do plano gratuito (3 gerações).{' '}
                  <a href="/precos" className="underline font-medium">Faz upgrade para Pro</a> para gerações ilimitadas.
                </div>
              )}

              {/* Botão gerar */}
              <button onClick={gerarConteudo} disabled={carregando || !topico.trim()}
                className="btn-primario justify-center py-4 text-base w-full"
                style={(carregando || !topico.trim()) ? { opacity: 0.6, cursor: 'not-allowed' } : {}}>
                {carregando ? (
                  <><Loader size={18} className="animate-spin" /> A gerar conteúdo...</>
                ) : (
                  <><Sparkles size={18} /> Gerar com IA</>
                )}
              </button>
            </div>

            {/* ============================================================
                PAINEL DIREITO — Resultado
            ============================================================ */}
            <div className="flex flex-col gap-4">

              {resultado ? (
                <>
                  {/* Slides navegáveis */}
                  <div className="card">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold" style={{ fontFamily: 'var(--fonte-display)' }}>
                        {FORMATOS.find(f => f.id === formato)?.emoji} Preview do conteúdo
                      </h3>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSlideAtual(s => Math.max(0, s - 1))}
                          disabled={slideAtual === 0} className="p-1.5 rounded-lg transition-colors"
                          style={{ color: slideAtual === 0 ? 'var(--cor-borda)' : 'var(--cor-texto-muted)' }}>
                          <ChevronLeft size={16} />
                        </button>
                        <span className="text-xs" style={{ color: 'var(--cor-texto-muted)' }}>
                          {slideAtual + 1}/{resultado.slides?.length || 1}
                        </span>
                        <button onClick={() => setSlideAtual(s => Math.min((resultado.slides?.length || 1) - 1, s + 1))}
                          disabled={slideAtual >= (resultado.slides?.length || 1) - 1}
                          className="p-1.5 rounded-lg transition-colors"
                          style={{ color: slideAtual >= (resultado.slides?.length || 1) - 1 ? 'var(--cor-borda)' : 'var(--cor-texto-muted)' }}>
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Preview do slide */}
                    <div className="rounded-xl p-5 mb-4 min-h-[120px]"
                      style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)' }}>
                      <p className="text-xs mb-2 font-medium" style={{ color: 'var(--cor-marca)' }}>
                        {resultado.slides?.[slideAtual]?.tipo || 'Hook principal'}
                      </p>
                      <p className="text-sm leading-relaxed">
                        {resultado.slides?.[slideAtual]?.conteudo || resultado.hook}
                      </p>
                    </div>

                    {/* Indicadores de slide */}
                    <div className="flex justify-center gap-1.5">
                      {(resultado.slides || [resultado]).map((_, i) => (
                        <button key={i} onClick={() => setSlideAtual(i)}
                          className="rounded-full transition-all duration-200"
                          style={{
                            width: i === slideAtual ? '20px' : '6px',
                            height: '6px',
                            background: i === slideAtual ? 'var(--cor-marca)' : 'var(--cor-borda-clara)',
                          }} />
                      ))}
                    </div>
                  </div>

                  {/* Hook */}
                  <div className="card">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Zap size={16} style={{ color: 'var(--cor-aviso)' }} />
                        <span className="font-semibold text-sm" style={{ fontFamily: 'var(--fonte-display)' }}>Hook</span>
                      </div>
                      <button onClick={() => copiar(resultado.hook, 'hook')}
                        className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors"
                        style={{ color: copiado === 'hook' ? 'var(--cor-sucesso)' : 'var(--cor-texto-muted)', background: 'var(--cor-elevado)' }}>
                        {copiado === 'hook' ? <><CheckCircle size={12} /> Copiado!</> : <><Copy size={12} /> Copiar</>}
                      </button>
                    </div>
                    <p className="text-sm leading-relaxed">{resultado.hook}</p>
                  </div>

                  {/* Legenda */}
                  <div className="card">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-sm" style={{ fontFamily: 'var(--fonte-display)' }}>Legenda</span>
                      <div className="flex gap-2">
                        <button onClick={regenerarLegenda} disabled={gerandoLegenda}
                          className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors"
                          style={{ color: 'var(--cor-marca)', background: 'rgba(124,123,250,0.1)' }}>
                          <RefreshCw size={12} className={gerandoLegenda ? 'animate-spin' : ''} />
                          {gerandoLegenda ? 'A regenerar...' : '3 variações'}
                        </button>
                        <button onClick={() => copiar(resultado.legenda, 'legenda')}
                          className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors"
                          style={{ color: copiado === 'legenda' ? 'var(--cor-sucesso)' : 'var(--cor-texto-muted)', background: 'var(--cor-elevado)' }}>
                          {copiado === 'legenda' ? <><CheckCircle size={12} /> Copiado!</> : <><Copy size={12} /> Copiar</>}
                        </button>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-line">{resultado.legenda}</p>
                  </div>

                  {/* Hashtags */}
                  <div className="card">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Hash size={16} style={{ color: 'var(--cor-info)' }} />
                        <span className="font-semibold text-sm" style={{ fontFamily: 'var(--fonte-display)' }}>Hashtags</span>
                      </div>
                      <button onClick={() => copiar(resultado.hashtags.join(' '), 'hashtags')}
                        className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors"
                        style={{ color: copiado === 'hashtags' ? 'var(--cor-sucesso)' : 'var(--cor-texto-muted)', background: 'var(--cor-elevado)' }}>
                        {copiado === 'hashtags' ? <><CheckCircle size={12} /> Copiado!</> : <><Copy size={12} /> Copiar tudo</>}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {resultado.hashtags.map((h, i) => (
                        <span key={i} className="text-xs px-2.5 py-1 rounded-full"
                          style={{ background: 'rgba(96,165,250,0.12)', color: 'var(--cor-info)', border: '1px solid rgba(96,165,250,0.2)' }}>
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Score do conteúdo */}
                  {score && (
                    <div className="card">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp size={16} style={{ color: 'var(--cor-marca)' }} />
                          <span className="font-semibold text-sm" style={{ fontFamily: 'var(--fonte-display)' }}>Score do conteúdo</span>
                        </div>
                        <span className="text-2xl font-bold" style={{
                          fontFamily: 'var(--fonte-display)',
                          color: score.total >= 80 ? 'var(--cor-sucesso)' : score.total >= 60 ? 'var(--cor-aviso)' : 'var(--cor-erro)'
                        }}>
                          {score.total}
                        </span>
                      </div>
                      <div className="flex flex-col gap-3">
                        <BarraScore label="Hook" valor={score.hook} />
                        <BarraScore label="Legenda" valor={score.legenda} />
                        <BarraScore label="Hashtags" valor={score.hashtags} />
                        <BarraScore label="CTA" valor={score.cta} />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                // Estado vazio
                <div className="card flex-1 flex flex-col items-center justify-center text-center py-16"
                  style={{ minHeight: 400 }}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: 'rgba(124,123,250,0.1)', border: '1px solid rgba(124,123,250,0.2)' }}>
                    <Sparkles size={28} style={{ color: 'var(--cor-marca)' }} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2" style={{ fontFamily: 'var(--fonte-display)' }}>
                    Pronto para criar
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--cor-texto-muted)' }}>
                    Escreve o teu tópico e clica em<br />
                    &ldquo;Gerar com IA&rdquo; para começar.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </LayoutPainel>
    </>
  )
}
