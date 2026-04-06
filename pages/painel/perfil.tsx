// ============================================
// AdPulse — Página de Perfil + Sistema de Referidos
// ============================================

import Head from 'next/head'
import { useState, useEffect } from 'react'
import { Check, Plus, X, Save, Loader, Copy, Gift, Users, Star } from 'lucide-react'
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

type DadosReferidos = {
  codigo: string
  total_referidos: number
  total_pagos: number
  meses_ganhos: number
}

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

  // Handles das plataformas
  const [handles, setHandles] = useState<Record<string, string | string[]>>({})

  // Referidos
  const [referidos, setReferidos]   = useState<DadosReferidos | null>(null)
  const [copiado, setCopiado]       = useState(false)

  const linkReferido = referidos
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://adpulse-pf3b.vercel.app'}/r/${referidos.codigo}`
    : ''

  useEffect(() => {
    if (!utilizador) return
    const carregar = async () => {
      // Carregar perfil
      const { data } = await supabase.from('perfis').select('*').eq('id', utilizador.id).single()
      if (data) {
        setNome(data.nome || '')
        setNomeMarca(data.nome_marca || '')
        setBio(data.bio || '')
        setPublico(data.publico_alvo || '')
        setNichos(data.nichos || [])
        setPlats(data.plataformas_principais || [])
        setTom(data.tom_preferido || '')
        setHandles(data.handles || {})
      }

      // Carregar ou criar referidos
      const { data: ref } = await supabase
        .from('referidos')
        .select('*')
        .eq('utilizador_id', utilizador.id)
        .single()

      if (ref) {
        setReferidos(ref)
      } else {
        // Criar código único baseado no nome/email
        const base = (data?.nome || utilizador.email?.split('@')[0] || 'user')
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')
          .slice(0, 12)
        const codigo = `${base}${Math.random().toString(36).slice(2, 6)}`

        const { data: novoRef } = await supabase
          .from('referidos')
          .insert({ utilizador_id: utilizador.id, codigo })
          .select()
          .single()
        if (novoRef) setReferidos(novoRef)
      }

      setCarregando(false)
    }
    carregar()
  }, [utilizador])

  const copiarLink = () => {
    navigator.clipboard.writeText(linkReferido)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

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
        handles,
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

          {/* ---- SISTEMA DE REFERIDOS ---- */}
          <div className="card flex flex-col gap-5"
            style={{ background: 'linear-gradient(135deg, rgba(124,123,250,0.06), rgba(192,132,252,0.06))', border: '1px solid rgba(124,123,250,0.2)' }}>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(124,123,250,0.15)', border: '1px solid rgba(124,123,250,0.3)' }}>
                <Gift size={20} style={{ color: 'var(--cor-marca)' }} />
              </div>
              <div>
                <h3 className="font-semibold" style={{ fontFamily: 'var(--fonte-display)' }}>
                  Programa de Referidos
                </h3>
                <p className="text-xs" style={{ color: 'var(--cor-texto-muted)' }}>
                  Ganha 1 mês grátis por cada amigo que pagar
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Referidos',    valor: referidos?.total_referidos || 0, cor: '#7c7bfa', icone: Users },
                { label: 'Pagaram',      valor: referidos?.total_pagos || 0,     cor: '#34d399', icone: Star  },
                { label: 'Meses ganhos', valor: referidos?.meses_ganhos || 0,    cor: '#fbbf24', icone: Gift  },
              ].map(s => {
                const Icone = s.icone
                return (
                  <div key={s.label} className="text-center p-3 rounded-xl"
                    style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2"
                      style={{ background: `${s.cor}15`, border: `1px solid ${s.cor}25` }}>
                      <Icone size={14} style={{ color: s.cor }} />
                    </div>
                    <div className="text-xl font-bold" style={{ color: s.cor, fontFamily: 'var(--fonte-display)' }}>
                      {s.valor}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--cor-texto-muted)' }}>{s.label}</div>
                  </div>
                )
              })}
            </div>

            {/* Link de referido */}
            <div>
              <label className="label-campo">O teu link de referido</label>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center px-3 py-2.5 rounded-xl text-sm truncate"
                  style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', color: 'var(--cor-texto-muted)' }}>
                  {linkReferido}
                </div>
                <button onClick={copiarLink}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium flex-shrink-0"
                  style={{
                    background: copiado ? 'rgba(52,211,153,0.15)' : 'rgba(124,123,250,0.15)',
                    border: `1px solid ${copiado ? 'rgba(52,211,153,0.3)' : 'rgba(124,123,250,0.3)'}`,
                    color: copiado ? 'var(--cor-sucesso)' : 'var(--cor-marca)',
                  }}>
                  {copiado ? <><Check size={14} /> Copiado!</> : <><Copy size={14} /> Copiar</>}
                </button>
              </div>
            </div>

            {/* Como funciona */}
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--cor-texto-muted)' }}>
                Como funciona
              </p>
              {[
                { num: '1', texto: 'Partilha o teu link com amigos e seguidores' },
                { num: '2', texto: 'Quando se registam pelo teu link, ficamos a saber' },
                { num: '3', texto: 'Quando pagarem o Pro, ganhas 1 mês grátis automaticamente' },
              ].map(p => (
                <div key={p.num} className="flex items-center gap-3 text-xs" style={{ color: 'var(--cor-texto-muted)' }}>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                    style={{ background: 'rgba(124,123,250,0.15)', color: 'var(--cor-marca)' }}>
                    {p.num}
                  </span>
                  {p.texto}
                </div>
              ))}
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

          {/* Handles das plataformas */}
          <div className="card flex flex-col gap-4">
            <div>
              <h3 className="font-semibold" style={{ fontFamily: 'var(--fonte-display)' }}>
                Os teus usernames
              </h3>
              <p className="text-xs mt-1" style={{ color: 'var(--cor-texto-muted)' }}>
                Regista os teus @usernames para publicar diretamente da AdPulse
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { id: 'instagram', label: 'Instagram',  emoji: '📸', placeholder: 'username',  baseUrl: 'https://instagram.com/' },
                { id: 'tiktok',    label: 'TikTok',     emoji: '🎵', placeholder: 'username',  baseUrl: 'https://tiktok.com/@' },
                { id: 'youtube',   label: 'YouTube',    emoji: '▶️', placeholder: 'username',  baseUrl: 'https://youtube.com/@' },
                { id: 'linkedin',  label: 'LinkedIn',   emoji: '💼', placeholder: 'username',  baseUrl: 'https://linkedin.com/in/' },
                { id: 'twitter',   label: 'Twitter/X',  emoji: '🐦', placeholder: 'username',  baseUrl: 'https://x.com/' },
                { id: 'facebook',  label: 'Facebook',   emoji: '👥', placeholder: 'pagina',    baseUrl: 'https://facebook.com/' },
              ].map(p => {
                const lista: string[] = Array.isArray(handles[p.id]) ? (handles[p.id] as string[]) : handles[p.id] ? [handles[p.id] as string] : ['']
                return (
                  <div key={p.id} className="p-3 rounded-xl flex flex-col gap-2"
                    style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{p.emoji}</span>
                        <p className="text-sm font-medium">{p.label}</p>
                        <span className="text-xs px-1.5 py-0.5 rounded-full"
                          style={{ background: 'rgba(124,123,250,0.1)', color: 'var(--cor-marca)', border: '1px solid rgba(124,123,250,0.2)' }}>
                          {lista.filter(h => h.trim()).length} conta{lista.filter(h => h.trim()).length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <button onClick={() => setHandles(prev => ({ ...prev, [p.id]: [...lista, ''] }))}
                        className="text-xs flex items-center gap-1 px-2 py-1 rounded-lg"
                        style={{ color: 'var(--cor-marca)', background: 'rgba(124,123,250,0.1)', border: '1px solid rgba(124,123,250,0.2)', cursor: 'pointer' }}>
                        <Plus size={11} /> Adicionar conta
                      </button>
                    </div>
                    {lista.map((h, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-xs" style={{ color: 'var(--cor-texto-fraco)', flexShrink: 0 }}>@</span>
                        <input
                          value={h}
                          onChange={e => {
                            const nova = [...lista]
                            nova[i] = e.target.value.replace('@', '')
                            setHandles(prev => ({ ...prev, [p.id]: nova }))
                          }}
                          placeholder={p.placeholder}
                          className="input-campo flex-1"
                          style={{ padding: '4px 8px', fontSize: 12 }}
                        />
                        {h && (
                          <a href={`${p.baseUrl}${h}`} target="_blank" rel="noopener noreferrer"
                            className="text-xs px-2 py-1 rounded-lg flex-shrink-0"
                            style={{ background: 'rgba(124,123,250,0.1)', color: 'var(--cor-marca)', border: '1px solid rgba(124,123,250,0.2)', textDecoration: 'none' }}>
                            Ver
                          </a>
                        )}
                        {lista.length > 1 && (
                          <button onClick={() => {
                            const nova = lista.filter((_, j) => j !== i)
                            setHandles(prev => ({ ...prev, [p.id]: nova }))
                          }}
                          style={{ color: 'var(--cor-erro)', background: 'none', border: 'none', cursor: 'pointer', padding: 2, flexShrink: 0 }}>
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )
              })}
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
