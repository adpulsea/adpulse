// ============================================
// AdPulse — Página de Perfil
// ============================================

import Head from 'next/head'
import { useState, useEffect } from 'react'
import { Check, Plus, X, Save, User, Loader } from 'lucide-react'
import LayoutPainel from '@/components/layout/LayoutPainel'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

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
  { id: 'informal',     label: 'Informal',     desc: 'Descontraído e próximo' },
  { id: 'profissional', label: 'Profissional', desc: 'Sério e credível' },
  { id: 'divertido',    label: 'Divertido',    desc: 'Bem-humorado e criativo' },
  { id: 'inspirador',   label: 'Inspirador',   desc: 'Motivacional e positivo' },
  { id: 'educativo',    label: 'Educativo',    desc: 'Informativo e didático' },
  { id: 'provocador',   label: 'Provocador',   desc: 'Direto e desafiante' },
]

export default function Perfil() {
  const { utilizador } = useAuth()
  const [carregando, setCarregando] = useState(true)
  const [guardando, setGuardando]   = useState(false)
  const [guardado, setGuardado]     = useState(false)

  // Campos do perfil
  const [nome, setNome]             = useState('')
  const [nomeMarca, setNomeMarca]   = useState('')
  const [bio, setBio]               = useState('')
  const [publicoAlvo, setPublico]   = useState('')
  const [nichos, setNichos]         = useState<string[]>([])
  const [nichoCustom, setNichoC]    = useState('')
  const [plataformas, setPlats]     = useState<string[]>([])
  const [tom, setTom]               = useState('')

  // Carregar perfil existente
  useEffect(() => {
    if (!utilizador) return
    const carregar = async () => {
      const { data } = await supabase.from('perfis').select('*').eq('id', utilizador.id).single()
      if (data) {
        setNome(data.nome || '')
        setNomeMarca(data.nome_marca || '')
        setBio(data.bio || '')
        setPublico(data.publico_alvo || '')
        setNichos(data.nichos || [])
        setPlats(data.plataformas_principais || [])
        setTom(data.tom_preferido || '')
      }
      setCarregando(false)
    }
    carregar()
  }, [utilizador])

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

  const guardar = async () => {
    if (!utilizador) return
    setGuardando(true)
    try {
      await supabase.from('perfis').upsert({
        id: utilizador.id,
        email: utilizador.email,
        nome,
        nome_marca: nomeMarca,
        bio,
        publico_alvo: publicoAlvo,
        nichos,
        plataformas_principais: plataformas,
        tom_preferido: tom,
      })
      setGuardado(true)
      setTimeout(() => setGuardado(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setGuardando(false)
    }
  }

  if (carregando) {
    return (
      <LayoutPainel titulo="Perfil">
        <div className="flex items-center justify-center h-64">
          <Loader size={24} className="animate-spin" style={{ color: 'var(--cor-marca)' }} />
        </div>
      </LayoutPainel>
    )
  }

  return (
    <>
      <Head><title>Perfil — AdPulse</title></Head>
      <LayoutPainel titulo="Perfil">
        <div className="max-w-3xl mx-auto flex flex-col gap-6">

          {/* Avatar + info básica */}
          <div className="card flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
              style={{ background: 'rgba(124,123,250,0.2)', color: 'var(--cor-marca)', fontFamily: 'var(--fonte-display)' }}>
              {(nome || utilizador?.email || 'U').slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-semibold" style={{ fontFamily: 'var(--fonte-display)' }}>{nome || utilizador?.email}</p>
              <p className="text-sm" style={{ color: 'var(--cor-texto-muted)' }}>{utilizador?.email}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {nichos.slice(0, 3).map(n => (
                  <span key={n} className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(124,123,250,0.12)', color: 'var(--cor-marca)', border: '1px solid rgba(124,123,250,0.2)' }}>
                    {n}
                  </span>
                ))}
                {nichos.length > 3 && (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ color: 'var(--cor-texto-muted)' }}>
                    +{nichos.length - 3}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Info básica */}
          <div className="card flex flex-col gap-4">
            <h3 className="font-semibold" style={{ fontFamily: 'var(--fonte-display)' }}>Informação básica</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-campo">O teu nome</label>
                <input value={nome} onChange={e => setNome(e.target.value)}
                  placeholder="O teu nome" className="input-campo w-full" />
              </div>
              <div>
                <label className="label-campo">Nome da marca <span style={{ color: 'var(--cor-texto-fraco)' }}>(opcional)</span></label>
                <input value={nomeMarca} onChange={e => setNomeMarca(e.target.value)}
                  placeholder="Ex: FitLife, Studio Ana..." className="input-campo w-full" />
              </div>
            </div>
            <div>
              <label className="label-campo">Bio / Sobre ti</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)}
                placeholder="Conta a tua história... A IA usa isto para criar conteúdo com a tua voz."
                rows={3} className="input-campo w-full resize-none" />
            </div>
            <div>
              <label className="label-campo">Público-alvo</label>
              <textarea value={publicoAlvo} onChange={e => setPublico(e.target.value)}
                placeholder="Ex: Mulheres entre 25-40 anos interessadas em saúde e bem-estar..."
                rows={2} className="input-campo w-full resize-none" />
            </div>
          </div>

          {/* Nichos */}
          <div className="card flex flex-col gap-4">
            <h3 className="font-semibold" style={{ fontFamily: 'var(--fonte-display)' }}>
              Os teus nichos
              <span className="ml-2 text-sm font-normal" style={{ color: 'var(--cor-texto-muted)' }}>
                ({nichos.length} selecionados)
              </span>
            </h3>

            <div className="flex flex-wrap gap-2">
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
                placeholder="Adicionar nicho personalizado..."
                className="input-campo flex-1" />
              <button onClick={adicionarNichoCustom} disabled={!nichoCustom.trim()}
                className="btn-primario px-4"
                style={!nichoCustom.trim() ? { opacity: 0.5, cursor: 'not-allowed' } : {}}>
                <Plus size={16} />
              </button>
            </div>

            {/* Nichos ativos */}
            {nichos.filter(n => !NICHOS_SUGERIDOS.includes(n)).length > 0 && (
              <div>
                <p className="text-xs mb-2" style={{ color: 'var(--cor-texto-muted)' }}>Nichos personalizados:</p>
                <div className="flex flex-wrap gap-2">
                  {nichos.filter(n => !NICHOS_SUGERIDOS.includes(n)).map(n => (
                    <span key={n} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm"
                      style={{ background: 'rgba(124,123,250,0.15)', border: '1px solid rgba(124,123,250,0.3)', color: 'var(--cor-marca)' }}>
                      {n}
                      <button onClick={() => toggleNicho(n)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cor-marca)', padding: 0, display: 'flex' }}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Plataformas */}
          <div className="card flex flex-col gap-4">
            <h3 className="font-semibold" style={{ fontFamily: 'var(--fonte-display)' }}>Plataformas principais</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PLATAFORMAS.map(p => (
                <button key={p.id} onClick={() => togglePlat(p.id)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: plataformas.includes(p.id) ? 'rgba(124,123,250,0.12)' : 'var(--cor-elevado)',
                    border: `1px solid ${plataformas.includes(p.id) ? 'rgba(124,123,250,0.35)' : 'var(--cor-borda)'}`,
                    color: plataformas.includes(p.id) ? 'var(--cor-marca)' : 'var(--cor-texto-muted)',
                  }}>
                  <span>{p.emoji}</span> {p.label}
                  {plataformas.includes(p.id) && <Check size={12} className="ml-auto" />}
                </button>
              ))}
            </div>
          </div>

          {/* Tom de voz */}
          <div className="card flex flex-col gap-4">
            <h3 className="font-semibold" style={{ fontFamily: 'var(--fonte-display)' }}>Tom de voz</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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

          {/* Guardar */}
          <button onClick={guardar} disabled={guardando}
            className="btn-primario justify-center py-4 text-base w-full"
            style={guardando ? { opacity: 0.7, cursor: 'not-allowed' } : {}}>
            {guardando ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> A guardar...</>
            ) : guardado ? (
              <><Check size={18} /> Perfil guardado!</>
            ) : (
              <><Save size={18} /> Guardar perfil</>
            )}
          </button>

        </div>
      </LayoutPainel>
    </>
  )
}
