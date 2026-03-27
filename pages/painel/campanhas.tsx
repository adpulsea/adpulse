// ============================================
// AdPulse — Gestão de Campanhas
// ============================================

import Head from 'next/head'
import { useState, useEffect } from 'react'
import { Plus, FolderOpen, Trash2, Instagram, Youtube, Linkedin, Loader } from 'lucide-react'
import LayoutPainel from '@/components/layout/LayoutPainel'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

type Campanha = {
  id: string
  nome: string
  descricao: string
  plataformas: string[]
  total_posts: number
  criado_em: string
}

const ICONES_PLATAFORMA: Record<string, React.ElementType> = {
  instagram: Instagram,
  youtube: Youtube,
  linkedin: Linkedin,
}

const COR_PLATAFORMA: Record<string, string> = {
  instagram: '#E1306C',
  tiktok: '#00f2ea',
  youtube: '#FF0000',
  linkedin: '#0077B5',
}

export default function Campanhas() {
  const { utilizador } = useAuth()
  const [campanhas, setCampanhas] = useState<Campanha[]>([])
  const [carregando, setCarregando] = useState(true)
  const [criandoCampanha, setCriandoCampanha] = useState(false)

  // Formulário de nova campanha
  const [nomeCampanha, setNomeCampanha] = useState('')
  const [descricaoCampanha, setDescricaoCampanha] = useState('')
  const [plataformasSelecionadas, setPlataformasSelecionadas] = useState<string[]>(['instagram'])
  const [salvando, setSalvando] = useState(false)

  // Buscar campanhas do utilizador
  useEffect(() => {
    if (!utilizador) return
    buscarCampanhas()
  }, [utilizador])

  const buscarCampanhas = async () => {
    setCarregando(true)
    const { data } = await supabase
      .from('campanhas')
      .select('*')
      .eq('utilizador_id', utilizador?.id)
      .order('criado_em', { ascending: false })
    setCampanhas(data || [])
    setCarregando(false)
  }

  const togglePlataforma = (p: string) => {
    setPlataformasSelecionadas(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    )
  }

  const criarCampanha = async () => {
    if (!nomeCampanha.trim() || !utilizador) return
    setSalvando(true)
    await supabase.from('campanhas').insert({
      utilizador_id: utilizador.id,
      nome: nomeCampanha,
      descricao: descricaoCampanha,
      plataformas: plataformasSelecionadas,
      total_posts: 0,
    })
    setNomeCampanha('')
    setDescricaoCampanha('')
    setPlataformasSelecionadas(['instagram'])
    setCriandoCampanha(false)
    setSalvando(false)
    buscarCampanhas()
  }

  const apagarCampanha = async (id: string) => {
    if (!confirm('Tens a certeza que queres apagar esta campanha?')) return
    await supabase.from('campanhas').delete().eq('id', id)
    setCampanhas(prev => prev.filter(c => c.id !== id))
  }

  return (
    <>
      <Head><title>Campanhas — AdPulse</title></Head>
      <LayoutPainel titulo="Campanhas">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm" style={{ color: 'var(--cor-texto-muted)' }}>
                {campanhas.length} campanha{campanhas.length !== 1 ? 's' : ''} ativa{campanhas.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button onClick={() => setCriandoCampanha(true)} className="btn-primario">
              <Plus size={16} /> Nova campanha
            </button>
          </div>

          {/* Modal de criar campanha */}
          {criandoCampanha && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
              onClick={(e) => { if (e.target === e.currentTarget) setCriandoCampanha(false) }}>
              <div className="card w-full max-w-md" style={{ minWidth: 0 }}>
                <h3 className="font-semibold text-lg mb-4" style={{ fontFamily: 'var(--fonte-display)' }}>
                  Nova campanha
                </h3>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="label-campo">Nome da campanha</label>
                    <input value={nomeCampanha} onChange={e => setNomeCampanha(e.target.value)}
                      placeholder="Ex: Lançamento produto Março" className="input-campo" />
                  </div>
                  <div>
                    <label className="label-campo">Descrição (opcional)</label>
                    <textarea value={descricaoCampanha} onChange={e => setDescricaoCampanha(e.target.value)}
                      placeholder="Descreve o objetivo desta campanha..." rows={2} className="input-campo resize-none" />
                  </div>
                  <div>
                    <label className="label-campo">Plataformas</label>
                    <div className="flex flex-wrap gap-2">
                      {['instagram', 'tiktok', 'youtube', 'linkedin'].map(p => (
                        <button key={p} onClick={() => togglePlataforma(p)}
                          className="px-3 py-1.5 rounded-xl text-sm transition-all capitalize"
                          style={{
                            background: plataformasSelecionadas.includes(p) ? `${COR_PLATAFORMA[p]}18` : 'var(--cor-elevado)',
                            border: `1px solid ${plataformasSelecionadas.includes(p) ? COR_PLATAFORMA[p] + '50' : 'var(--cor-borda)'}`,
                            color: plataformasSelecionadas.includes(p) ? COR_PLATAFORMA[p] : 'var(--cor-texto-muted)',
                          }}>
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setCriandoCampanha(false)} className="btn-secundario flex-1 justify-center">
                      Cancelar
                    </button>
                    <button onClick={criarCampanha} disabled={salvando || !nomeCampanha.trim()}
                      className="btn-primario flex-1 justify-center"
                      style={(!nomeCampanha.trim() || salvando) ? { opacity: 0.6 } : {}}>
                      {salvando ? <><Loader size={14} className="animate-spin" /> A criar...</> : 'Criar campanha'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lista de campanhas */}
          {carregando ? (
            <div className="flex items-center justify-center py-16">
              <Loader size={24} className="animate-spin" style={{ color: 'var(--cor-marca)' }} />
            </div>
          ) : campanhas.length === 0 ? (
            <div className="card flex flex-col items-center justify-center text-center py-16">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(124,123,250,0.1)', border: '1px solid rgba(124,123,250,0.2)' }}>
                <FolderOpen size={28} style={{ color: 'var(--cor-marca)' }} />
              </div>
              <h3 className="font-semibold text-lg mb-2" style={{ fontFamily: 'var(--fonte-display)' }}>
                Sem campanhas ainda
              </h3>
              <p className="text-sm mb-6" style={{ color: 'var(--cor-texto-muted)' }}>
                Cria a tua primeira campanha para organizar o teu conteúdo.
              </p>
              <button onClick={() => setCriandoCampanha(true)} className="btn-primario">
                <Plus size={16} /> Criar primeira campanha
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campanhas.map((campanha) => (
                <div key={campanha.id} className="card-hover group relative">
                  {/* Botão apagar */}
                  <button onClick={() => apagarCampanha(campanha.id)}
                    className="absolute top-4 right-4 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    style={{ color: 'var(--cor-texto-fraco)' }}
                    onMouseOver={e => { e.currentTarget.style.color = 'var(--cor-erro)'; e.currentTarget.style.background = 'rgba(248,113,113,0.1)' }}
                    onMouseOut={e => { e.currentTarget.style.color = 'var(--cor-texto-fraco)'; e.currentTarget.style.background = 'transparent' }}>
                    <Trash2 size={14} />
                  </button>

                  {/* Ícone + Nome */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(124,123,250,0.12)', border: '1px solid rgba(124,123,250,0.2)' }}>
                      <FolderOpen size={18} style={{ color: 'var(--cor-marca)' }} />
                    </div>
                    <div className="flex-1 min-w-0 pr-6">
                      <h3 className="font-semibold truncate">{campanha.nome}</h3>
                      {campanha.descricao && (
                        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--cor-texto-muted)' }}>
                          {campanha.descricao}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Plataformas */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {campanha.plataformas.map(p => (
                      <span key={p} className="text-xs px-2 py-0.5 rounded-full capitalize"
                        style={{
                          background: `${COR_PLATAFORMA[p] || 'var(--cor-marca)'}18`,
                          color: COR_PLATAFORMA[p] || 'var(--cor-marca)',
                          border: `1px solid ${COR_PLATAFORMA[p] || 'var(--cor-marca)'}30`,
                        }}>
                        {p}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-3"
                    style={{ borderTop: '1px solid var(--cor-borda)' }}>
                    <span className="text-xs" style={{ color: 'var(--cor-texto-fraco)' }}>
                      {campanha.total_posts} post{campanha.total_posts !== 1 ? 's' : ''}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--cor-texto-fraco)' }}>
                      {new Date(campanha.criado_em).toLocaleDateString('pt-PT')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </LayoutPainel>
    </>
  )
}
