// ============================================
// AdPulse — Onboarding (após registo)
// ============================================

import Head from 'next/head'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { Zap, ArrowRight, ArrowLeft, Check, Plus, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

// ---- Nichos predefinidos ----
const NICHOS_SUGERIDOS = [
  'Fitness & Saúde', 'Nutrição', 'Yoga & Bem-estar',
  'Moda & Estilo', 'Beleza & Maquilhagem', 'Lifestyle',
  'Empreendedorismo', 'Marketing Digital', 'Finanças Pessoais',
  'Investimentos', 'Imobiliário', 'E-commerce',
  'Viagens', 'Gastronomia & Culinária', 'Arte & Design',
  'Fotografia', 'Música', 'Gaming',
  'Educação & Cursos', 'Coaching', 'Psicologia',
  'Tecnologia', 'Programação', 'IA & Inovação',
  'Sustentabilidade', 'Animais de Estimação', 'Parenting',
]

const PLATAFORMAS = [
  { id: 'instagram', label: 'Instagram', emoji: '📸' },
  { id: 'tiktok',    label: 'TikTok',    emoji: '🎵' },
  { id: 'youtube',   label: 'YouTube',   emoji: '▶️' },
  { id: 'linkedin',  label: 'LinkedIn',  emoji: '💼' },
  { id: 'twitter',   label: 'Twitter/X', emoji: '🐦' },
  { id: 'facebook',  label: 'Facebook',  emoji: '👥' },
  { id: 'pinterest', label: 'Pinterest', emoji: '📌' },
]

const TONS = [
  { id: 'informal',      label: 'Informal',      desc: 'Descontraído e próximo' },
  { id: 'profissional',  label: 'Profissional',  desc: 'Sério e credível' },
  { id: 'divertido',     label: 'Divertido',     desc: 'Bem-humorado e criativo' },
  { id: 'inspirador',    label: 'Inspirador',    desc: 'Motivacional e positivo' },
  { id: 'educativo',     label: 'Educativo',     desc: 'Informativo e didático' },
  { id: 'provocador',    label: 'Provocador',    desc: 'Direto e desafiante' },
]

export default function Onboarding() {
  const router   = useRouter()
  const { utilizador } = useAuth()
  const [passo, setPasso]           = useState(1)
  const [guardando, setGuardando]   = useState(false)

  // Dados do perfil
  const [nomeMarca, setNomeMarca]   = useState('')
  const [nichos, setNichos]         = useState<string[]>([])
  const [nichoCustom, setNichoC]    = useState('')
  const [plataformas, setPlats]     = useState<string[]>([])
  const [tom, setTom]               = useState('')
  const [publicoAlvo, setPublico]   = useState('')
  const [bio, setBio]               = useState('')

  const toggleNicho = (n: string) => {
    setNichos(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n])
  }

  const adicionarNichoCustom = () => {
    const n = nichoCustom.trim()
    if (n && !nichos.includes(n)) {
      setNichos(prev => [...prev, n])
      setNichoC('')
    }
  }

  const togglePlat = (p: string) => {
    setPlats(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
  }

  const guardarPerfil = async () => {
    if (!utilizador) return
    setGuardando(true)
    try {
      await supabase.from('perfis').upsert({
        id: utilizador.id,
        email: utilizador.email,
        nome: utilizador.user_metadata?.nome || utilizador.email?.split('@')[0],
        nome_marca: nomeMarca,
        nichos,
        plataformas_principais: plataformas,
        tom_preferido: tom,
        publico_alvo: publicoAlvo,
        bio,
        onboarding_completo: true,
      })
      router.push('/painel')
    } catch (err) {
      console.error(err)
    } finally {
      setGuardando(false)
    }
  }

  const nomeUtilizador = utilizador?.user_metadata?.nome?.split(' ')[0] || 'por aí'

  return (
    <>
      <Head><title>Configura o teu perfil — AdPulse</title></Head>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
        style={{ background: 'var(--cor-fundo)' }}>

        {/* Fundo */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="efeito-glow w-96 h-96 top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ background: 'rgba(124,123,250,0.1)' }} />
        </div>

        <div className="w-full max-w-2xl relative z-10">

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: 'var(--cor-marca)' }}>
                <Zap size={20} className="text-white" fill="white" />
              </div>
              <span className="text-xl font-bold" style={{ fontFamily: 'var(--fonte-display)' }}>AdPulse</span>
            </div>

            {/* Barra de progresso */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {[1, 2, 3].map(p => (
                <div key={p} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                    style={{
                      background: passo > p ? 'var(--cor-sucesso)' : passo === p ? 'var(--cor-marca)' : 'var(--cor-elevado)',
                      border: `2px solid ${passo > p ? 'var(--cor-sucesso)' : passo === p ? 'var(--cor-marca)' : 'var(--cor-borda)'}`,
                      color: passo >= p ? '#fff' : 'var(--cor-texto-fraco)',
                    }}>
                    {passo > p ? <Check size={14} /> : p}
                  </div>
                  {p < 3 && <div className="w-12 h-0.5 rounded-full" style={{ background: passo > p ? 'var(--cor-sucesso)' : 'var(--cor-borda)' }} />}
                </div>
              ))}
            </div>
          </div>

          {/* ---- PASSO 1: Marca + Nichos ---- */}
          {passo === 1 && (
            <div className="card flex flex-col gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--fonte-display)' }}>
                  Olá, {nomeUtilizador}! 👋
                </h2>
                <p style={{ color: 'var(--cor-texto-muted)' }}>
                  Vamos configurar o teu perfil para a IA gerar conteúdo personalizado para ti.
                </p>
              </div>

              {/* Nome da marca */}
              <div>
                <label className="label-campo">Nome da tua marca ou projeto <span style={{ color: 'var(--cor-texto-fraco)' }}>(opcional)</span></label>
                <input value={nomeMarca} onChange={e => setNomeMarca(e.target.value)}
                  placeholder="Ex: Motivação, FitLife, Studio Ana..."
                  className="input-campo w-full" />
              </div>

              {/* Nichos */}
              <div>
                <label className="label-campo">Os teus nichos <span style={{ color: 'var(--cor-texto-fraco)' }}>(seleciona todos os que se aplicam)</span></label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {NICHOS_SUGERIDOS.map(n => (
                    <button key={n} onClick={() => toggleNicho(n)}
                      className="px-3 py-1.5 rounded-full text-sm transition-all"
                      style={{
                        background: nichos.includes(n) ? 'rgba(124,123,250,0.15)' : 'var(--cor-elevado)',
                        border: `1px solid ${nichos.includes(n) ? 'rgba(124,123,250,0.4)' : 'var(--cor-borda)'}`,
                        color: nichos.includes(n) ? 'var(--cor-marca)' : 'var(--cor-texto-muted)',
                      }}>
                      {nichos.includes(n) && <span className="mr-1">✓</span>}
                      {n}
                    </button>
                  ))}
                </div>

                {/* Nicho personalizado */}
                <div className="flex gap-2">
                  <input value={nichoCustom} onChange={e => setNichoC(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && adicionarNichoCustom()}
                    placeholder="O teu nicho não está na lista? Escreve aqui..."
                    className="input-campo flex-1" />
                  <button onClick={adicionarNichoCustom} disabled={!nichoCustom.trim()}
                    className="btn-primario px-4"
                    style={!nichoCustom.trim() ? { opacity: 0.5, cursor: 'not-allowed' } : {}}>
                    <Plus size={16} />
                  </button>
                </div>

                {/* Nichos selecionados */}
                {nichos.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {nichos.map(n => (
                      <span key={n} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm"
                        style={{ background: 'rgba(124,123,250,0.15)', border: '1px solid rgba(124,123,250,0.3)', color: 'var(--cor-marca)' }}>
                        {n}
                        <button onClick={() => toggleNicho(n)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cor-marca)', padding: 0, display: 'flex' }}>
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={() => setPasso(2)}
                className="btn-primario justify-center py-3">
                Continuar <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* ---- PASSO 2: Plataformas + Tom ---- */}
          {passo === 2 && (
            <div className="card flex flex-col gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--fonte-display)' }}>
                  Onde publicas? 📱
                </h2>
                <p style={{ color: 'var(--cor-texto-muted)' }}>
                  Seleciona as tuas plataformas e o tom de voz da tua marca.
                </p>
              </div>

              {/* Plataformas */}
              <div>
                <label className="label-campo">Plataformas principais</label>
                <div className="grid grid-cols-2 gap-2">
                  {PLATAFORMAS.map(p => (
                    <button key={p.id} onClick={() => togglePlat(p.id)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left"
                      style={{
                        background: plataformas.includes(p.id) ? 'rgba(124,123,250,0.12)' : 'var(--cor-elevado)',
                        border: `1px solid ${plataformas.includes(p.id) ? 'rgba(124,123,250,0.35)' : 'var(--cor-borda)'}`,
                        color: plataformas.includes(p.id) ? 'var(--cor-marca)' : 'var(--cor-texto-muted)',
                      }}>
                      <span className="text-lg">{p.emoji}</span>
                      <span>{p.label}</span>
                      {plataformas.includes(p.id) && <Check size={14} className="ml-auto" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tom de voz */}
              <div>
                <label className="label-campo">Tom de voz da tua marca</label>
                <div className="grid grid-cols-2 gap-2">
                  {TONS.map(t => (
                    <button key={t.id} onClick={() => setTom(t.id)}
                      className="flex flex-col px-4 py-3 rounded-xl text-left transition-all"
                      style={{
                        background: tom === t.id ? 'rgba(124,123,250,0.12)' : 'var(--cor-elevado)',
                        border: `1px solid ${tom === t.id ? 'rgba(124,123,250,0.35)' : 'var(--cor-borda)'}`,
                      }}>
                      <span className="text-sm font-medium" style={{ color: tom === t.id ? 'var(--cor-marca)' : 'var(--cor-texto)' }}>{t.label}</span>
                      <span className="text-xs mt-0.5" style={{ color: 'var(--cor-texto-muted)' }}>{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setPasso(1)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
                  style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', color: 'var(--cor-texto-muted)' }}>
                  <ArrowLeft size={16} /> Voltar
                </button>
                <button onClick={() => setPasso(3)} className="btn-primario flex-1 justify-center py-3">
                  Continuar <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ---- PASSO 3: Público-alvo + Bio ---- */}
          {passo === 3 && (
            <div className="card flex flex-col gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--fonte-display)' }}>
                  Fala-nos do teu público 🎯
                </h2>
                <p style={{ color: 'var(--cor-texto-muted)' }}>
                  Quanto mais detalhes deres, melhor a IA personaliza o teu conteúdo.
                </p>
              </div>

              {/* Público-alvo */}
              <div>
                <label className="label-campo">Quem é o teu público-alvo?</label>
                <textarea value={publicoAlvo} onChange={e => setPublico(e.target.value)}
                  placeholder="Ex: Mulheres entre 25-40 anos, interessadas em saúde e bem-estar, que querem perder peso de forma saudável..."
                  rows={3} className="input-campo w-full resize-none" />
              </div>

              {/* Bio */}
              <div>
                <label className="label-campo">
                  A tua bio / sobre ti <span style={{ color: 'var(--cor-texto-fraco)' }}>(opcional)</span>
                </label>
                <textarea value={bio} onChange={e => setBio(e.target.value)}
                  placeholder="Ex: Personal trainer há 5 anos, ajudo pessoas a transformar o seu corpo e mente através de treino funcional e alimentação equilibrada..."
                  rows={4} className="input-campo w-full resize-none" />
                <p className="text-xs mt-1" style={{ color: 'var(--cor-texto-fraco)' }}>
                  A IA usa isto para criar conteúdo com a tua voz e história
                </p>
              </div>

              {/* Resumo */}
              {nichos.length > 0 && (
                <div className="p-4 rounded-xl" style={{ background: 'rgba(124,123,250,0.06)', border: '1px solid rgba(124,123,250,0.15)' }}>
                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--cor-marca)' }}>✨ O teu perfil resumido</p>
                  <div className="flex flex-wrap gap-1.5">
                    {nichos.map(n => (
                      <span key={n} className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(124,123,250,0.15)', color: 'var(--cor-marca)' }}>{n}</span>
                    ))}
                    {plataformas.map(p => (
                      <span key={p} className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(52,211,153,0.1)', color: 'var(--cor-sucesso)' }}>
                        {PLATAFORMAS.find(x => x.id === p)?.label}
                      </span>
                    ))}
                    {tom && (
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(251,191,36,0.1)', color: 'var(--cor-aviso)' }}>
                        Tom: {TONS.find(t => t.id === tom)?.label}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setPasso(2)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
                  style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', color: 'var(--cor-texto-muted)' }}>
                  <ArrowLeft size={16} /> Voltar
                </button>
                <button onClick={guardarPerfil} disabled={guardando}
                  className="btn-primario flex-1 justify-center py-3"
                  style={guardando ? { opacity: 0.7, cursor: 'not-allowed' } : {}}>
                  {guardando ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> A guardar...</>
                  ) : (
                    <><Check size={16} /> Entrar no painel</>
                  )}
                </button>
              </div>
            </div>
          )}

          <p className="text-center text-sm mt-4" style={{ color: 'var(--cor-texto-fraco)' }}>
            Podes editar o teu perfil a qualquer momento no painel
          </p>
        </div>
      </div>
    </>
  )
}
