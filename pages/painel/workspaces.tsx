// ============================================
// AdPulse — Workspaces (Múltiplas Marcas)
// ============================================

import Head from 'next/head'
import { useState, useEffect } from 'react'
import {
  Plus, X, Check, Edit3, Trash2, Loader,
  Sparkles, ChevronDown
} from 'lucide-react'
import LayoutPainel from '@/components/layout/LayoutPainel'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

// ---- Tipos ----
type Workspace = {
  id: string
  utilizador_id: string
  nome: string
  descricao?: string
  nichos: string[]
  plataformas: string[]
  tom: string
  publico_alvo?: string
  bio?: string
  cor: string
  emoji: string
  ativo: boolean
  criado_em: string
}

// ---- Constantes ----
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

const TONS = ['Informal', 'Profissional', 'Divertido', 'Inspirador', 'Educativo', 'Provocador']

const CORES = ['#7c7bfa', '#c084fc', '#f472b6', '#34d399', '#60a5fa', '#fbbf24', '#f87171', '#a78bfa']

const EMOJIS = ['🚀', '💼', '🎯', '✨', '🔥', '💪', '🌟', '🎨', '📸', '🎵', '💡', '🌿', '👑', '🦋', '🎭', '🏆']

// ---- Modal de criação/edição ----
function ModalWorkspace({
  workspace, onGuardar, onFechar
}: {
  workspace?: Workspace
  onGuardar: (w: Partial<Workspace>) => void
  onFechar: () => void
}) {
  const [nome, setNome]           = useState(workspace?.nome || '')
  const [descricao, setDesc]      = useState(workspace?.descricao || '')
  const [nichos, setNichos]       = useState<string[]>(workspace?.nichos || [])
  const [nichoC, setNichoC]       = useState('')
  const [plataformas, setPlats]   = useState<string[]>(workspace?.plataformas || [])
  const [tom, setTom]             = useState(workspace?.tom || '')
  const [publico, setPublico]     = useState(workspace?.publico_alvo || '')
  const [bio, setBio]             = useState(workspace?.bio || '')
  const [cor, setCor]             = useState(workspace?.cor || '#7c7bfa')
  const [emoji, setEmoji]         = useState(workspace?.emoji || '🚀')
  const [passo, setPasso]         = useState(1)

  const toggleNicho = (n: string) => setNichos(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n])
  const togglePlat  = (p: string) => setPlats(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])

  const adicionarNichoC = () => {
    const n = nichoC.trim()
    if (n && !nichos.includes(n)) { setNichos(prev => [...prev, n]); setNichoC('') }
  }

  const guardar = () => {
    if (!nome.trim()) return
    onGuardar({ nome, descricao, nichos, plataformas, tom, publico_alvo: publico, bio, cor, emoji })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-xl rounded-2xl flex flex-col overflow-hidden"
        style={{ background: 'var(--cor-card)', border: '1px solid var(--cor-borda)', maxHeight: '90vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: `${cor}20`, border: `1px solid ${cor}40` }}>
              {emoji}
            </div>
            <div>
              <h3 className="font-semibold" style={{ fontFamily: 'var(--fonte-display)' }}>
                {workspace ? 'Editar workspace' : 'Novo workspace'}
              </h3>
              <p className="text-xs" style={{ color: 'var(--cor-texto-muted)' }}>Passo {passo} de 3</p>
            </div>
          </div>
          <button onClick={onFechar} style={{ color: 'var(--cor-texto-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Barra progresso */}
        <div className="px-6 pb-4">
          <div className="flex gap-1.5">
            {[1,2,3].map(p => (
              <div key={p} className="flex-1 h-1 rounded-full transition-all"
                style={{ background: passo >= p ? cor : 'var(--cor-borda)' }} />
            ))}
          </div>
        </div>

        {/* Conteúdo scrollável */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 flex flex-col gap-5">

          {/* Passo 1 — Identidade */}
          {passo === 1 && (
            <>
              <div>
                <label className="label-campo">Nome da marca / projeto *</label>
                <input value={nome} onChange={e => setNome(e.target.value)}
                  placeholder="Ex: FitLife, Studio Ana, Cliente Moda X..."
                  className="input-campo w-full" />
              </div>

              <div>
                <label className="label-campo">Descrição <span style={{ color: 'var(--cor-texto-fraco)' }}>(opcional)</span></label>
                <input value={descricao} onChange={e => setDesc(e.target.value)}
                  placeholder="Ex: Conta de fitness para mulheres 25-40 anos"
                  className="input-campo w-full" />
              </div>

              {/* Emoji */}
              <div>
                <label className="label-campo">Emoji da marca</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJIS.map(e => (
                    <button key={e} onClick={() => setEmoji(e)}
                      className="w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all"
                      style={{
                        background: emoji === e ? `${cor}20` : 'var(--cor-elevado)',
                        border: `2px solid ${emoji === e ? cor : 'var(--cor-borda)'}`,
                      }}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cor */}
              <div>
                <label className="label-campo">Cor da marca</label>
                <div className="flex gap-2 flex-wrap">
                  {CORES.map(c => (
                    <button key={c} onClick={() => setCor(c)}
                      className="w-8 h-8 rounded-full transition-all"
                      style={{
                        background: c,
                        border: cor === c ? `3px solid #fff` : '3px solid transparent',
                        boxShadow: cor === c ? `0 0 0 2px ${c}` : 'none',
                      }} />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Passo 2 — Nichos + Plataformas */}
          {passo === 2 && (
            <>
              <div>
                <label className="label-campo">Nichos</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {NICHOS_SUGERIDOS.map(n => (
                    <button key={n} onClick={() => toggleNicho(n)}
                      className="px-3 py-1.5 rounded-full text-xs transition-all"
                      style={{
                        background: nichos.includes(n) ? `${cor}15` : 'var(--cor-elevado)',
                        border: `1px solid ${nichos.includes(n) ? cor + '50' : 'var(--cor-borda)'}`,
                        color: nichos.includes(n) ? cor : 'var(--cor-texto-muted)',
                      }}>
                      {nichos.includes(n) && '✓ '}{n}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={nichoC} onChange={e => setNichoC(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && adicionarNichoC()}
                    placeholder="Nicho personalizado..."
                    className="input-campo flex-1" />
                  <button onClick={adicionarNichoC} disabled={!nichoC.trim()}
                    className="btn-primario px-4" style={{ background: cor, ...(!nichoC.trim() ? { opacity: 0.5, cursor: 'not-allowed' } : {}) }}>
                    <Plus size={16} />
                  </button>
                </div>
                {nichos.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {nichos.map(n => (
                      <span key={n} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs"
                        style={{ background: `${cor}15`, border: `1px solid ${cor}30`, color: cor }}>
                        {n}
                        <button onClick={() => toggleNicho(n)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: cor, padding: 0, display: 'flex' }}>
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="label-campo">Plataformas</label>
                <div className="grid grid-cols-2 gap-2">
                  {PLATAFORMAS.map(p => (
                    <button key={p.id} onClick={() => togglePlat(p.id)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all text-left"
                      style={{
                        background: plataformas.includes(p.id) ? `${cor}12` : 'var(--cor-elevado)',
                        border: `1px solid ${plataformas.includes(p.id) ? cor + '40' : 'var(--cor-borda)'}`,
                        color: plataformas.includes(p.id) ? cor : 'var(--cor-texto-muted)',
                      }}>
                      <span>{p.emoji}</span> {p.label}
                      {plataformas.includes(p.id) && <Check size={12} className="ml-auto" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label-campo">Tom de voz</label>
                <div className="flex flex-wrap gap-2">
                  {TONS.map(t => (
                    <button key={t} onClick={() => setTom(t)}
                      className="px-3 py-2 rounded-xl text-sm transition-all"
                      style={{
                        background: tom === t ? `${cor}15` : 'var(--cor-elevado)',
                        border: `1px solid ${tom === t ? cor + '40' : 'var(--cor-borda)'}`,
                        color: tom === t ? cor : 'var(--cor-texto-muted)',
                      }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Passo 3 — Público + Bio */}
          {passo === 3 && (
            <>
              <div>
                <label className="label-campo">Público-alvo</label>
                <textarea value={publico} onChange={e => setPublico(e.target.value)}
                  placeholder="Ex: Mulheres 25-40 anos interessadas em saúde e bem-estar..."
                  rows={3} className="input-campo w-full resize-none" />
              </div>
              <div>
                <label className="label-campo">Bio / Sobre a marca <span style={{ color: 'var(--cor-texto-fraco)' }}>(opcional)</span></label>
                <textarea value={bio} onChange={e => setBio(e.target.value)}
                  placeholder="Descreve a marca, os valores, o que a torna única..."
                  rows={4} className="input-campo w-full resize-none" />
                <p className="text-xs mt-1" style={{ color: 'var(--cor-texto-fraco)' }}>
                  A IA usa isto para gerar conteúdo com a voz desta marca
                </p>
              </div>

              {/* Preview */}
              <div className="p-4 rounded-xl" style={{ background: `${cor}08`, border: `1px solid ${cor}20` }}>
                <p className="text-xs font-medium mb-2" style={{ color: cor }}>✨ Preview do workspace</p>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: `${cor}20` }}>{emoji}</div>
                  <div>
                    <p className="font-semibold text-sm">{nome || 'Nome da marca'}</p>
                    <p className="text-xs" style={{ color: 'var(--cor-texto-muted)' }}>{descricao || 'Sem descrição'}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {nichos.slice(0, 3).map(n => (
                    <span key={n} className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${cor}15`, color: cor }}>{n}</span>
                  ))}
                  {plataformas.slice(0, 3).map(p => (
                    <span key={p} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--cor-elevado)', color: 'var(--cor-texto-muted)' }}>
                      {PLATAFORMAS.find(x => x.id === p)?.emoji} {PLATAFORMAS.find(x => x.id === p)?.label}
                    </span>
                  ))}
                  {tom && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--cor-elevado)', color: 'var(--cor-texto-muted)' }}>{tom}</span>}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Botões navegação */}
        <div className="p-6 pt-0 flex gap-3">
          {passo > 1 && (
            <button onClick={() => setPasso(p => p - 1)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', color: 'var(--cor-texto-muted)' }}>
              Voltar
            </button>
          )}
          {passo < 3 ? (
            <button onClick={() => setPasso(p => p + 1)} disabled={passo === 1 && !nome.trim()}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ background: cor, opacity: passo === 1 && !nome.trim() ? 0.5 : 1, cursor: passo === 1 && !nome.trim() ? 'not-allowed' : 'pointer' }}>
              Continuar
            </button>
          ) : (
            <button onClick={guardar} disabled={!nome.trim()}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
              style={{ background: cor }}>
              <Check size={16} /> Criar workspace
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ---- Componente principal ----
export default function Workspaces() {
  const { utilizador }              = useAuth()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [carregando, setCarregando] = useState(true)
  const [modal, setModal]           = useState<{ workspace?: Workspace } | null>(null)
  const [ativoId, setAtivoId]       = useState<string | null>(null)

  useEffect(() => {
    if (!utilizador) return
    const carregar = async () => {
      const { data } = await supabase.from('workspaces').select('*').eq('utilizador_id', utilizador.id).order('criado_em')
      if (data) setWorkspaces(data)
      setCarregando(false)
    }
    carregar()
  }, [utilizador])

  const guardarWorkspace = async (dados: Partial<Workspace>) => {
    if (!utilizador) return
    if (modal?.workspace) {
      // Editar
      const { data } = await supabase.from('workspaces').update(dados).eq('id', modal.workspace.id).select().single()
      if (data) setWorkspaces(prev => prev.map(w => w.id === data.id ? data : w))
    } else {
      // Criar
      const { data } = await supabase.from('workspaces').insert({ ...dados, utilizador_id: utilizador.id }).select().single()
      if (data) setWorkspaces(prev => [...prev, data])
    }
    setModal(null)
  }

  const apagarWorkspace = async (id: string) => {
    await supabase.from('workspaces').delete().eq('id', id)
    setWorkspaces(prev => prev.filter(w => w.id !== id))
    if (ativoId === id) setAtivoId(null)
  }

  return (
    <>
      <Head><title>Workspaces — AdPulse</title></Head>
      <LayoutPainel titulo="Workspaces">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'var(--cor-texto-muted)' }}>
                Gere múltiplas marcas ou clientes num só lugar. A IA adapta o conteúdo a cada workspace.
              </p>
            </div>
            <button onClick={() => setModal({})} className="btn-primario">
              <Plus size={16} /> Novo workspace
            </button>
          </div>

          {/* Workspace ativo */}
          {ativoId && (
            <div className="p-4 rounded-xl flex items-center gap-3"
              style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
              <Check size={16} style={{ color: 'var(--cor-sucesso)' }} />
              <p className="text-sm" style={{ color: 'var(--cor-sucesso)' }}>
                Workspace <strong>{workspaces.find(w => w.id === ativoId)?.nome}</strong> ativo —
                o AI Content Studio vai usar este perfil para gerar conteúdo
              </p>
              <button onClick={() => setAtivoId(null)} className="ml-auto text-xs px-2 py-1 rounded-lg"
                style={{ color: 'var(--cor-sucesso)', background: 'rgba(52,211,153,0.1)' }}>
                Desativar
              </button>
            </div>
          )}

          {/* Loading */}
          {carregando && (
            <div className="flex items-center justify-center py-16">
              <Loader size={24} className="animate-spin" style={{ color: 'var(--cor-marca)' }} />
            </div>
          )}

          {/* Lista de workspaces */}
          {!carregando && workspaces.length === 0 && (
            <div className="card text-center py-16">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="font-semibold text-lg mb-2" style={{ fontFamily: 'var(--fonte-display)' }}>
                Cria o teu primeiro workspace
              </h3>
              <p className="text-sm mb-6" style={{ color: 'var(--cor-texto-muted)' }}>
                Cada workspace tem os seus nichos, plataformas e tom de voz.<br />
                A IA gera conteúdo personalizado para cada um.
              </p>
              <button onClick={() => setModal({})} className="btn-primario mx-auto">
                <Plus size={16} /> Criar workspace
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workspaces.map(w => (
              <div key={w.id} className="card flex flex-col gap-4 transition-all"
                style={{
                  border: ativoId === w.id ? `1px solid ${w.cor}50` : '1px solid var(--cor-borda)',
                  background: ativoId === w.id ? `${w.cor}05` : 'var(--cor-card)',
                }}>

                {/* Header do workspace */}
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: `${w.cor}15`, border: `1px solid ${w.cor}30` }}>
                    {w.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate" style={{ fontFamily: 'var(--fonte-display)' }}>{w.nome}</h3>
                      {ativoId === w.id && (
                        <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: 'rgba(52,211,153,0.1)', color: 'var(--cor-sucesso)', border: '1px solid rgba(52,211,153,0.2)' }}>
                          ativo
                        </span>
                      )}
                    </div>
                    {w.descricao && <p className="text-xs truncate" style={{ color: 'var(--cor-texto-muted)' }}>{w.descricao}</p>}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {w.nichos.slice(0, 3).map(n => (
                    <span key={n} className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: `${w.cor}12`, color: w.cor, border: `1px solid ${w.cor}25` }}>
                      {n}
                    </span>
                  ))}
                  {w.nichos.length > 3 && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ color: 'var(--cor-texto-muted)', background: 'var(--cor-elevado)' }}>
                      +{w.nichos.length - 3}
                    </span>
                  )}
                  {w.plataformas.slice(0, 2).map(p => (
                    <span key={p} className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'var(--cor-elevado)', color: 'var(--cor-texto-muted)', border: '1px solid var(--cor-borda)' }}>
                      {PLATAFORMAS.find(x => x.id === p)?.emoji} {PLATAFORMAS.find(x => x.id === p)?.label}
                    </span>
                  ))}
                  {w.tom && (
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'var(--cor-elevado)', color: 'var(--cor-texto-muted)', border: '1px solid var(--cor-borda)' }}>
                      {w.tom}
                    </span>
                  )}
                </div>

                {/* Ações */}
                <div className="flex gap-2 pt-1" style={{ borderTop: '1px solid var(--cor-borda)' }}>
                  <button
                    onClick={() => setAtivoId(ativoId === w.id ? null : w.id)}
                    className="flex-1 py-2 rounded-xl text-xs font-medium transition-all"
                    style={{
                      background: ativoId === w.id ? `${w.cor}15` : 'var(--cor-elevado)',
                      border: `1px solid ${ativoId === w.id ? w.cor + '40' : 'var(--cor-borda)'}`,
                      color: ativoId === w.id ? w.cor : 'var(--cor-texto-muted)',
                    }}>
                    {ativoId === w.id ? '✓ Ativo' : 'Usar este'}
                  </button>
                  <button onClick={() => setModal({ workspace: w })}
                    className="p-2 rounded-xl transition-colors"
                    style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', color: 'var(--cor-texto-muted)' }}>
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => apagarWorkspace(w.id)}
                    className="p-2 rounded-xl transition-colors"
                    style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: 'var(--cor-erro)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </LayoutPainel>

      {modal && (
        <ModalWorkspace
          workspace={modal.workspace}
          onGuardar={guardarWorkspace}
          onFechar={() => setModal(null)}
        />
      )}
    </>
  )
}
