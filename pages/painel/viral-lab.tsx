// ============================================
// AdPulse — Viral Lab
// ============================================

import Head from 'next/head'
import { useState } from 'react'
import { TrendingUp, Loader, CheckCircle, Sparkles } from 'lucide-react'
import LayoutPainel from '@/components/layout/LayoutPainel'

const PLATAFORMAS = ['Instagram', 'TikTok', 'YouTube', 'LinkedIn']
const NICHOS = ['Lifestyle', 'Negócios', 'Fitness', 'Tecnologia', 'Educação', 'Entretenimento', 'Culinária', 'Moda']

const CHIPS_EXEMPLO = [
  'POV: acordas às 5h da manhã por 30 dias',
  'O erro que me custou 10.000€ este ano',
  'Rotina da manhã que triplicou a minha energia',
  '3 hábitos que os ricos fazem diferente',
]

// Anel de progresso SVG animado
function AnelScore({ score, animar }: { score: number, animar: boolean }) {
  const raio = 54
  const circunf = 2 * Math.PI * raio
  const preenchido = animar ? (score / 100) * circunf : 0
  const cor = score >= 80 ? '#34d399' : score >= 60 ? '#fbbf24' : '#f87171'
  const veredicto = score >= 85 ? 'Viral quase certo! 🔥' : score >= 70 ? 'Alto potencial' : score >= 55 ? 'Precisa de ajuste' : 'Reformula o conteúdo'

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <svg width="144" height="144" viewBox="0 0 144 144">
          {/* Fundo do anel */}
          <circle cx="72" cy="72" r={raio} fill="none"
            stroke="var(--cor-borda)" strokeWidth="10" />
          {/* Anel preenchido */}
          <circle cx="72" cy="72" r={raio} fill="none"
            stroke={cor} strokeWidth="10"
            strokeDasharray={`${preenchido} ${circunf}`}
            strokeLinecap="round"
            transform="rotate(-90 72 72)"
            style={{ transition: 'stroke-dasharray 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        </svg>
        {/* Score central */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold" style={{ fontFamily: 'var(--fonte-display)', color: cor }}>
            {animar ? score : 0}
          </span>
          <span className="text-xs" style={{ color: 'var(--cor-texto-muted)' }}>/ 100</span>
        </div>
      </div>
      <span className="text-sm font-semibold" style={{ color: cor }}>{veredicto}</span>
    </div>
  )
}

// Barra de dimensão
function BarraDimensao({ label, valor, descricao }: { label: string, valor: number, descricao: string }) {
  const cor = valor >= 20 ? '#34d399' : valor >= 14 ? '#fbbf24' : '#f87171'
  return (
    <div className="p-3 rounded-xl" style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-bold" style={{ color: cor }}>{valor}/25</span>
      </div>
      <div className="h-1.5 rounded-full mb-2" style={{ background: 'var(--cor-borda)' }}>
        <div className="h-1.5 rounded-full transition-all duration-1000"
          style={{ width: `${(valor / 25) * 100}%`, background: cor }} />
      </div>
      <p className="text-xs" style={{ color: 'var(--cor-texto-fraco)' }}>{descricao}</p>
    </div>
  )
}

type ResultadoViral = {
  score: number
  hook: number
  trend: number
  nicho: number
  formato: number
  sugestoes: string[]
  hooks_alternativos: string[]
  hookSelecionado: number | null
}

export default function ViralLab() {
  const [conteudo, setConteudo] = useState('')
  const [plataforma, setPlataforma] = useState('TikTok')
  const [nicho, setNicho] = useState('Negócios')
  const [carregando, setCarregando] = useState(false)
  const [progresso, setProgresso] = useState(0)
  const [resultado, setResultado] = useState<ResultadoViral | null>(null)
  const [animar, setAnimar] = useState(false)

  const analisar = async () => {
    if (!conteudo.trim()) return
    setCarregando(true)
    setAnimar(false)
    setProgresso(0)

    // Simula progresso de análise
    const intervalo = setInterval(() => {
      setProgresso(p => {
        if (p >= 90) { clearInterval(intervalo); return 90 }
        return p + 15
      })
    }, 400)

    try {
      const resposta = await fetch('/api/ia/viral-lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conteudo, plataforma, nicho }),
      })
      const dados = await resposta.json()
      clearInterval(intervalo)
      setProgresso(100)
      setTimeout(() => {
        setResultado({ ...dados, hookSelecionado: null })
        setAnimar(true)
        setCarregando(false)
      }, 300)
    } catch {
      clearInterval(intervalo)
      setCarregando(false)
    }
  }

  return (
    <>
      <Head><title>Viral Lab — AdPulse</title></Head>
      <LayoutPainel titulo="Viral Lab">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* ---- Painel esquerdo: input ---- */}
            <div className="flex flex-col gap-4">
              <div className="card">
                <h3 className="font-semibold mb-1" style={{ fontFamily: 'var(--fonte-display)' }}>
                  Analisa o potencial viral
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--cor-texto-muted)' }}>
                  Cola o teu hook ou ideia de conteúdo e recebe uma análise detalhada.
                </p>

                <textarea value={conteudo} onChange={(e) => setConteudo(e.target.value)}
                  placeholder="Cola aqui o teu hook ou ideia de conteúdo..."
                  rows={4} className="input-campo resize-none mb-3" />

                {/* Chips de exemplo */}
                <div className="flex flex-col gap-2 mb-4">
                  <p className="text-xs" style={{ color: 'var(--cor-texto-fraco)' }}>Exemplos para testar:</p>
                  <div className="flex flex-wrap gap-2">
                    {CHIPS_EXEMPLO.map((chip) => (
                      <button key={chip} onClick={() => setConteudo(chip)}
                        className="text-xs px-3 py-1.5 rounded-full transition-all"
                        style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', color: 'var(--cor-texto-muted)' }}
                        onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--cor-marca)'; e.currentTarget.style.color = 'var(--cor-marca)' }}
                        onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--cor-borda)'; e.currentTarget.style.color = 'var(--cor-texto-muted)' }}>
                        {chip.length > 35 ? chip.slice(0, 35) + '…' : chip}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Plataforma */}
                <div className="mb-4">
                  <label className="label-campo">Plataforma</label>
                  <div className="flex flex-wrap gap-2">
                    {PLATAFORMAS.map((p) => (
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
                <div className="mb-5">
                  <label className="label-campo">Nicho</label>
                  <div className="flex flex-wrap gap-2">
                    {NICHOS.map((n) => (
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

                {/* Barra de progresso */}
                {carregando && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: 'var(--cor-texto-muted)' }}>A analisar conteúdo...</span>
                      <span style={{ color: 'var(--cor-marca)' }}>{progresso}%</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'var(--cor-borda)' }}>
                      <div className="h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${progresso}%`, background: 'var(--cor-marca)' }} />
                    </div>
                  </div>
                )}

                <button onClick={analisar} disabled={carregando || !conteudo.trim()}
                  className="btn-primario justify-center py-3 w-full"
                  style={(carregando || !conteudo.trim()) ? { opacity: 0.6, cursor: 'not-allowed' } : {}}>
                  {carregando
                    ? <><Loader size={16} className="animate-spin" /> A analisar...</>
                    : <><TrendingUp size={16} /> Analisar viral score</>}
                </button>
              </div>
            </div>

            {/* ---- Painel direito: resultado ---- */}
            <div className="flex flex-col gap-4">
              {resultado ? (
                <>
                  {/* Score principal */}
                  <div className="card flex flex-col items-center py-6">
                    <AnelScore score={resultado.score} animar={animar} />
                  </div>

                  {/* 4 dimensões */}
                  <div className="card">
                    <h3 className="font-semibold mb-3" style={{ fontFamily: 'var(--fonte-display)' }}>
                      Análise por dimensão
                    </h3>
                    <div className="flex flex-col gap-2">
                      <BarraDimensao label="🎣 Hook" valor={resultado.hook}
                        descricao="Força do gancho inicial para prender a atenção" />
                      <BarraDimensao label="📈 Tendência" valor={resultado.trend}
                        descricao="Alinhamento com o que está viral na plataforma" />
                      <BarraDimensao label="🎯 Nicho" valor={resultado.nicho}
                        descricao="Relevância para o teu público específico" />
                      <BarraDimensao label="📐 Formato" valor={resultado.formato}
                        descricao="Adequação ao formato e plataforma escolhidos" />
                    </div>
                  </div>

                  {/* Sugestões */}
                  <div className="card">
                    <h3 className="font-semibold mb-3" style={{ fontFamily: 'var(--fonte-display)' }}>
                      Sugestões de melhoria
                    </h3>
                    <div className="flex flex-col gap-2">
                      {resultado.sugestoes.map((s, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-sm">
                          <span style={{ color: 'var(--cor-sucesso)', flexShrink: 0 }}>→</span>
                          <span style={{ color: 'var(--cor-texto-muted)' }}>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hooks alternativos */}
                  <div className="card">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles size={16} style={{ color: 'var(--cor-marca)' }} />
                      <h3 className="font-semibold" style={{ fontFamily: 'var(--fonte-display)' }}>
                        3 Hooks alternativos
                      </h3>
                    </div>
                    <div className="flex flex-col gap-2">
                      {resultado.hooks_alternativos.map((hook, i) => (
                        <button key={i} onClick={() => setResultado(r => r ? { ...r, hookSelecionado: i } : r)}
                          className="p-3 rounded-xl text-sm text-left transition-all"
                          style={{
                            background: resultado.hookSelecionado === i ? 'rgba(124,123,250,0.12)' : 'var(--cor-elevado)',
                            border: `1px solid ${resultado.hookSelecionado === i ? 'rgba(124,123,250,0.35)' : 'var(--cor-borda)'}`,
                            color: resultado.hookSelecionado === i ? 'var(--cor-texto)' : 'var(--cor-texto-muted)',
                          }}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold" style={{ color: 'var(--cor-marca)' }}>#{i + 1}</span>
                            {resultado.hookSelecionado === i && (
                              <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--cor-sucesso)' }}>
                                <CheckCircle size={11} /> Selecionado
                              </span>
                            )}
                          </div>
                          {hook}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="card flex flex-col items-center justify-center text-center py-16"
                  style={{ minHeight: 400 }}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: 'rgba(124,123,250,0.1)', border: '1px solid rgba(124,123,250,0.2)' }}>
                    <TrendingUp size={28} style={{ color: 'var(--cor-marca)' }} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2" style={{ fontFamily: 'var(--fonte-display)' }}>
                    Descobre o teu potencial viral
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--cor-texto-muted)' }}>
                    Analisa qualquer hook ou ideia<br />
                    e vê o score antes de publicar.
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
