// ============================================
// AdPulse — Creator Analyzer
// ============================================

import Head from 'next/head'
import { useState } from 'react'
import { BarChart2, Loader, Users, Calendar, TrendingUp, Zap } from 'lucide-react'
import LayoutPainel from '@/components/layout/LayoutPainel'

const PLATAFORMAS = ['Instagram', 'TikTok', 'YouTube', 'LinkedIn']
const NICHOS      = ['Lifestyle', 'Negócios', 'Fitness', 'Tecnologia', 'Educação', 'Entretenimento']

// Card de pontuação por categoria
function CardPontuacao({ icone: Icone, label, valor, cor }: {
  icone: React.ElementType, label: string, valor: number, cor: string
}) {
  const pct = (valor / 25) * 100
  return (
    <div className="card text-center">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
        style={{ background: `${cor}18`, border: `1px solid ${cor}30` }}>
        <Icone size={18} style={{ color: cor }} />
      </div>
      <p className="text-2xl font-bold mb-0.5" style={{ fontFamily: 'var(--fonte-display)', color: cor }}>
        {valor}
      </p>
      <p className="text-xs mb-2" style={{ color: 'var(--cor-texto-muted)' }}>{label}</p>
      <div className="h-1 rounded-full" style={{ background: 'var(--cor-borda)' }}>
        <div className="h-1 rounded-full" style={{ width: `${pct}%`, background: cor }} />
      </div>
    </div>
  )
}

type ResultadoAnalyzer = {
  creator_score: number
  pontuacao_engagement: number
  pontuacao_frequencia: number
  pontuacao_formato: number
  pontuacao_crescimento: number
  sugestoes: string[]
  plano_30_dias: { fase1: string, fase2: string, fase3: string }
}

export default function CreatorAnalyzer() {
  const [nicho, setNicho]                   = useState('Negócios')
  const [plataforma, setPlataforma]         = useState('Instagram')
  const [seguidores, setSeguidores]         = useState('')
  const [postsSemana, setPostsSemana]       = useState('')
  const [engagementMedio, setEngagementMedio] = useState('')
  const [carregando, setCarregando]         = useState(false)
  const [resultado, setResultado]           = useState<ResultadoAnalyzer | null>(null)

  const analisar = async () => {
    if (!seguidores || !postsSemana || !engagementMedio) return
    setCarregando(true)
    try {
      const resposta = await fetch('/api/ia/creator-analyzer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nicho, plataforma,
          seguidores:       parseInt(seguidores),
          posts_semana:     parseInt(postsSemana),
          engagement_medio: parseFloat(engagementMedio),
        }),
      })
      setResultado(await resposta.json())
    } catch {
      console.error('Erro no analyzer')
    } finally {
      setCarregando(false)
    }
  }

  const corScore = resultado
    ? resultado.creator_score >= 80 ? '#34d399' : resultado.creator_score >= 60 ? '#fbbf24' : '#f87171'
    : 'var(--cor-marca)'

  return (
    <>
      <Head><title>Creator Analyzer — AdPulse</title></Head>
      <LayoutPainel titulo="Creator Analyzer">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* ---- Formulário (2 colunas) ---- */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="card">
                <h3 className="font-semibold mb-1" style={{ fontFamily: 'var(--fonte-display)' }}>
                  As tuas métricas
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--cor-texto-muted)' }}>
                  Introduz os teus dados para receberes um plano de crescimento personalizado.
                </p>

                {/* Plataforma */}
                <div className="mb-4">
                  <label className="label-campo">Plataforma principal</label>
                  <div className="flex flex-wrap gap-2">
                    {PLATAFORMAS.map(p => (
                      <button key={p} onClick={() => setPlataforma(p)}
                        className="px-3 py-1.5 rounded-xl text-sm transition-all"
                        style={{
                          background: plataforma === p ? 'rgba(124,123,250,0.15)' : 'var(--cor-elevado)',
                          border: `1px solid ${plataforma === p ? 'rgba(124,123,250,0.4)' : 'var(--cor-borda)'}`,
                          color: plataforma === p ? 'var(--cor-marca)' : 'var(--cor-texto-muted)',
                        }}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nicho */}
                <div className="mb-4">
                  <label className="label-campo">Nicho</label>
                  <div className="flex flex-wrap gap-2">
                    {NICHOS.map(n => (
                      <button key={n} onClick={() => setNicho(n)}
                        className="px-3 py-1.5 rounded-xl text-sm transition-all"
                        style={{
                          background: nicho === n ? 'rgba(124,123,250,0.15)' : 'var(--cor-elevado)',
                          border: `1px solid ${nicho === n ? 'rgba(124,123,250,0.4)' : 'var(--cor-borda)'}`,
                          color: nicho === n ? 'var(--cor-marca)' : 'var(--cor-texto-muted)',
                        }}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Métricas numéricas */}
                <div className="flex flex-col gap-3 mb-5">
                  <div>
                    <label className="label-campo">Número de seguidores</label>
                    <input type="number" value={seguidores} onChange={e => setSeguidores(e.target.value)}
                      placeholder="Ex: 5000" className="input-campo" />
                  </div>
                  <div>
                    <label className="label-campo">Posts por semana</label>
                    <input type="number" value={postsSemana} onChange={e => setPostsSemana(e.target.value)}
                      placeholder="Ex: 4" className="input-campo" min="0" max="30" />
                  </div>
                  <div>
                    <label className="label-campo">Engagement médio (%)</label>
                    <input type="number" value={engagementMedio} onChange={e => setEngagementMedio(e.target.value)}
                      placeholder="Ex: 3.5" className="input-campo" step="0.1" min="0" max="100" />
                  </div>
                </div>

                <button onClick={analisar}
                  disabled={carregando || !seguidores || !postsSemana || !engagementMedio}
                  className="btn-primario justify-center py-3 w-full"
                  style={(carregando || !seguidores) ? { opacity: 0.6, cursor: 'not-allowed' } : {}}>
                  {carregando
                    ? <><Loader size={16} className="animate-spin" /> A analisar...</>
                    : <><BarChart2 size={16} /> Analisar o meu perfil</>}
                </button>
              </div>
            </div>

            {/* ---- Resultado (3 colunas) ---- */}
            <div className="lg:col-span-3 flex flex-col gap-4">
              {resultado ? (
                <>
                  {/* Creator Score */}
                  <div className="card flex flex-col items-center py-6">
                    <p className="text-sm mb-2" style={{ color: 'var(--cor-texto-muted)' }}>Creator Score</p>
                    <p className="text-7xl font-bold" style={{ fontFamily: 'var(--fonte-display)', color: corScore }}>
                      {resultado.creator_score}
                    </p>
                    <p className="text-sm mt-1" style={{ color: 'var(--cor-texto-muted)' }}>
                      {resultado.creator_score >= 80 ? 'Excelente! Continua assim 🎉' :
                       resultado.creator_score >= 60 ? 'Bom trabalho! Ainda tens margem para crescer' :
                       'Há muito a melhorar — segue o plano abaixo'}
                    </p>
                  </div>

                  {/* Métricas rápidas */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="card text-center py-3">
                      <Users size={18} className="mx-auto mb-1" style={{ color: 'var(--cor-marca)' }} />
                      <p className="text-lg font-bold" style={{ fontFamily: 'var(--fonte-display)' }}>
                        {parseInt(seguidores).toLocaleString('pt-PT')}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--cor-texto-muted)' }}>Seguidores</p>
                    </div>
                    <div className="card text-center py-3">
                      <Calendar size={18} className="mx-auto mb-1" style={{ color: '#c084fc' }} />
                      <p className="text-lg font-bold" style={{ fontFamily: 'var(--fonte-display)' }}>
                        {postsSemana}×
                      </p>
                      <p className="text-xs" style={{ color: 'var(--cor-texto-muted)' }}>Posts/semana</p>
                    </div>
                    <div className="card text-center py-3">
                      <TrendingUp size={18} className="mx-auto mb-1" style={{ color: '#34d399' }} />
                      <p className="text-lg font-bold" style={{ fontFamily: 'var(--fonte-display)' }}>
                        {engagementMedio}%
                      </p>
                      <p className="text-xs" style={{ color: 'var(--cor-texto-muted)' }}>Engagement</p>
                    </div>
                  </div>

                  {/* Breakdown por categoria */}
                  <div className="grid grid-cols-2 gap-3">
                    <CardPontuacao icone={TrendingUp} label="Engagement" valor={resultado.pontuacao_engagement} cor="#7c7bfa" />
                    <CardPontuacao icone={Calendar}   label="Frequência"  valor={resultado.pontuacao_frequencia}  cor="#c084fc" />
                    <CardPontuacao icone={Zap}        label="Formato"     valor={resultado.pontuacao_formato}     cor="#fb7185" />
                    <CardPontuacao icone={Users}      label="Crescimento" valor={resultado.pontuacao_crescimento} cor="#34d399" />
                  </div>

                  {/* Sugestões */}
                  <div className="card">
                    <h3 className="font-semibold mb-3" style={{ fontFamily: 'var(--fonte-display)' }}>
                      Sugestões personalizadas
                    </h3>
                    <div className="flex flex-col gap-2">
                      {resultado.sugestoes.map((s, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-sm">
                          <span style={{ color: 'var(--cor-marca)', flexShrink: 0 }}>✦</span>
                          <span style={{ color: 'var(--cor-texto-muted)' }}>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Plano 30 dias */}
                  <div className="card">
                    <h3 className="font-semibold mb-4" style={{ fontFamily: 'var(--fonte-display)' }}>
                      Plano de crescimento — 30 dias
                    </h3>
                    <div className="flex flex-col gap-3">
                      {[
                        { fase: 'Fase 1', dias: 'Dias 1–10', conteudo: resultado.plano_30_dias.fase1, cor: '#7c7bfa' },
                        { fase: 'Fase 2', dias: 'Dias 11–20', conteudo: resultado.plano_30_dias.fase2, cor: '#c084fc' },
                        { fase: 'Fase 3', dias: 'Dias 21–30', conteudo: resultado.plano_30_dias.fase3, cor: '#fb7185' },
                      ].map((f) => (
                        <div key={f.fase} className="flex gap-3 p-3 rounded-xl"
                          style={{ background: `${f.cor}0d`, border: `1px solid ${f.cor}25` }}>
                          <div className="flex-shrink-0 w-1 rounded-full" style={{ background: f.cor }} />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold" style={{ color: f.cor }}>{f.fase}</span>
                              <span className="text-xs" style={{ color: 'var(--cor-texto-fraco)' }}>{f.dias}</span>
                            </div>
                            <p className="text-sm" style={{ color: 'var(--cor-texto-muted)' }}>{f.conteudo}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="card flex flex-col items-center justify-center text-center py-16"
                  style={{ minHeight: 400 }}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: 'rgba(124,123,250,0.1)', border: '1px solid rgba(124,123,250,0.2)' }}>
                    <BarChart2 size={28} style={{ color: 'var(--cor-marca)' }} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2" style={{ fontFamily: 'var(--fonte-display)' }}>
                    Descobre o teu Creator Score
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--cor-texto-muted)' }}>
                    Introduz as tuas métricas e<br />
                    recebe um plano personalizado.
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
