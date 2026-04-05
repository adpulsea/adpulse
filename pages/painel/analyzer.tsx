// ============================================
// AdPulse — Creator Analyzer (com bloqueio Pro)
// ============================================

import Head from 'next/head'
import { useState } from 'react'
import { BarChart2, Loader, Users, Calendar, TrendingUp, Zap } from 'lucide-react'
import LayoutPainel from '@/components/layout/LayoutPainel'
import BloqueadoPro from '@/components/BloqueadoPro'
import { usePlano } from '@/hooks/usePlano'

const PLATAFORMAS = ['Instagram', 'TikTok', 'YouTube', 'LinkedIn']
const NICHOS      = ['Lifestyle', 'Negócios', 'Fitness', 'Tecnologia', 'Educação', 'Entretenimento']

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

type ResultadoAnalise = {
  score_geral: number
  consistencia: number
  engagement: number
  crescimento: number
  viral_potential: number
  pontos_fortes: string[]
  areas_melhoria: string[]
  plano_acao: string[]
  resumo: string
}

export default function CreatorAnalyzer() {
  const { isPro, carregando: carregandoPlano } = usePlano()
  const [handle, setHandle]       = useState('')
  const [plataforma, setPlat]     = useState('Instagram')
  const [nicho, setNicho]         = useState('Negócios')
  const [carregando, setCarr]     = useState(false)
  const [resultado, setResultado] = useState<ResultadoAnalise | null>(null)

  if (carregandoPlano) {
    return (
      <LayoutPainel titulo="Creator Analyzer">
        <div className="flex items-center justify-center h-64">
          <Loader size={24} className="animate-spin" style={{ color: 'var(--cor-marca)' }} />
        </div>
      </LayoutPainel>
    )
  }

  if (!isPro) {
    return (
      <LayoutPainel titulo="Creator Analyzer">
        <BloqueadoPro
          funcionalidade="Creator Analyzer"
          descricao="Analisa o teu perfil e recebe um relatório completo com pontos fortes, áreas de melhoria e um plano de ação personalizado para cresceres mais rápido."
          emoji="📊"
        />
      </LayoutPainel>
    )
  }

  const analisar = async () => {
    if (!handle.trim()) return
    setCarr(true)
    setResultado(null)
    try {
      const r = await fetch('/api/ia/creator-analyzer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle, plataforma, nicho }),
      })
      const d = await r.json()
      setResultado(d)
    } catch { /* silencioso */ }
    setCarr(false)
  }

  return (
    <>
      <Head><title>Creator Analyzer — AdPulse</title></Head>
      <LayoutPainel titulo="Creator Analyzer">
        <div className="max-w-5xl mx-auto flex flex-col gap-6">

          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 size={18} style={{ color: 'var(--cor-marca)' }} />
              <h3 className="font-semibold" style={{ fontFamily: 'var(--fonte-display)' }}>Analisar perfil</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="label-campo">Handle / username</label>
                <input value={handle} onChange={e => setHandle(e.target.value)}
                  placeholder="@o_teu_username" className="input-campo w-full" />
              </div>
              <div>
                <label className="label-campo">Plataforma</label>
                <div className="flex flex-wrap gap-2">
                  {PLATAFORMAS.map(p => (
                    <button key={p} onClick={() => setPlat(p)}
                      className="px-3 py-1.5 rounded-xl text-sm transition-all"
                      style={{ background: plataforma === p ? 'rgba(124,123,250,0.15)' : 'var(--cor-elevado)', border: `1px solid ${plataforma === p ? 'rgba(124,123,250,0.4)' : 'var(--cor-borda)'}`, color: plataforma === p ? 'var(--cor-marca)' : 'var(--cor-texto-muted)' }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label-campo">Nicho</label>
                <div className="flex flex-wrap gap-2">
                  {NICHOS.map(n => (
                    <button key={n} onClick={() => setNicho(n)}
                      className="px-3 py-1.5 rounded-xl text-sm transition-all"
                      style={{ background: nicho === n ? 'rgba(124,123,250,0.15)' : 'var(--cor-elevado)', border: `1px solid ${nicho === n ? 'rgba(124,123,250,0.4)' : 'var(--cor-borda)'}`, color: nicho === n ? 'var(--cor-marca)' : 'var(--cor-texto-muted)' }}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={analisar} disabled={carregando || !handle.trim()}
              className="btn-primario justify-center py-3 w-full"
              style={(carregando || !handle.trim()) ? { opacity: 0.6, cursor: 'not-allowed' } : {}}>
              {carregando ? <><Loader size={16} className="animate-spin" /> A analisar...</> : <><BarChart2 size={16} /> Analisar criador</>}
            </button>
          </div>

          {resultado && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <CardPontuacao icone={Zap}        label="Consistência"      valor={resultado.consistencia}    cor="#7c7bfa" />
                <CardPontuacao icone={Users}      label="Engagement"        valor={resultado.engagement}      cor="#c084fc" />
                <CardPontuacao icone={TrendingUp} label="Crescimento"       valor={resultado.crescimento}     cor="#34d399" />
                <CardPontuacao icone={Calendar}   label="Potencial viral"   valor={resultado.viral_potential} cor="#fbbf24" />
              </div>

              <div className="card" style={{ background: 'rgba(124,123,250,0.06)', border: '1px solid rgba(124,123,250,0.15)' }}>
                <p className="text-sm font-semibold mb-2" style={{ color: 'var(--cor-marca)' }}>📊 Resumo da análise</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--cor-texto-muted)' }}>{resultado.resumo}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card">
                  <h3 className="font-semibold mb-3" style={{ fontFamily: 'var(--fonte-display)' }}>✅ Pontos fortes</h3>
                  <div className="flex flex-col gap-2">
                    {resultado.pontos_fortes.map((p, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <span style={{ color: 'var(--cor-sucesso)', flexShrink: 0 }}>→</span>
                        <span style={{ color: 'var(--cor-texto-muted)' }}>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card">
                  <h3 className="font-semibold mb-3" style={{ fontFamily: 'var(--fonte-display)' }}>⚠️ Áreas de melhoria</h3>
                  <div className="flex flex-col gap-2">
                    {resultado.areas_melhoria.map((a, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <span style={{ color: 'var(--cor-aviso)', flexShrink: 0 }}>→</span>
                        <span style={{ color: 'var(--cor-texto-muted)' }}>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="font-semibold mb-3" style={{ fontFamily: 'var(--fonte-display)' }}>🚀 Plano de ação</h3>
                <div className="flex flex-col gap-2">
                  {resultado.plano_acao.map((a, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: 'rgba(124,123,250,0.15)', color: 'var(--cor-marca)' }}>
                        {i + 1}
                      </span>
                      <p className="text-sm" style={{ color: 'var(--cor-texto-muted)' }}>{a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {!resultado && !carregando && (
            <div className="card flex flex-col items-center justify-center text-center py-16">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(124,123,250,0.1)', border: '1px solid rgba(124,123,250,0.2)' }}>
                <BarChart2 size={28} style={{ color: 'var(--cor-marca)' }} />
              </div>
              <h3 className="font-semibold text-lg mb-2" style={{ fontFamily: 'var(--fonte-display)' }}>
                Analisa o teu perfil
              </h3>
              <p className="text-sm" style={{ color: 'var(--cor-texto-muted)' }}>
                Introduz o teu username e recebe um relatório completo.
              </p>
            </div>
          )}
        </div>
      </LayoutPainel>
    </>
  )
}
