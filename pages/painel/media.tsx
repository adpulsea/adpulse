// ============================================
// AdPulse — Biblioteca de Média
// ============================================

import Head from 'next/head'
import { useState, useEffect, useRef } from 'react'
import {
  FolderPlus, Upload, X, Check, Trash2, Edit3,
  Image as ImageIcon, Video, File, Loader, Sparkles,
  ChevronRight, Home, Plus, Copy, Download, Eye
} from 'lucide-react'
import LayoutPainel from '@/components/layout/LayoutPainel'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

// ---- Tipos ----
type Pasta = {
  id: string
  nome: string
  cor: string
  emoji: string
  criado_em: string
  total?: number
}

type Ficheiro = {
  id: string
  pasta_id: string | null
  nome: string
  tipo: string
  url: string
  tamanho: number
  legenda_ia?: string
  hashtags_ia?: string[]
  criado_em: string
}

// ---- Constantes ----
const CORES = ['#7c7bfa', '#c084fc', '#f472b6', '#34d399', '#60a5fa', '#fbbf24', '#f87171', '#a78bfa']
const EMOJIS_PASTA = ['📁', '📸', '🎵', '🎬', '💼', '🌟', '🔥', '💡', '🎨', '🏆', '🌿', '💪']

function formatarTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function tipoFicheiro(tipo: string): 'imagem' | 'video' | 'outro' {
  if (tipo.startsWith('image/')) return 'imagem'
  if (tipo.startsWith('video/')) return 'video'
  return 'outro'
}

// ---- Modal Nova Pasta ----
function ModalPasta({ pasta, onGuardar, onFechar }: {
  pasta?: Pasta
  onGuardar: (nome: string, cor: string, emoji: string) => void
  onFechar: () => void
}) {
  const [nome, setNome] = useState(pasta?.nome || '')
  const [cor, setCor]   = useState(pasta?.cor || '#7c7bfa')
  const [emoji, setEmoji] = useState(pasta?.emoji || '📁')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-4"
        style={{ background: 'var(--cor-card)', border: '1px solid var(--cor-borda)' }}>

        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg" style={{ fontFamily: 'var(--fonte-display)' }}>
            {pasta ? 'Editar pasta' : 'Nova pasta'}
          </h3>
          <button onClick={onFechar} style={{ color: 'var(--cor-texto-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Preview */}
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--cor-elevado)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: `${cor}20`, border: `1px solid ${cor}40` }}>
            {emoji}
          </div>
          <span className="font-medium">{nome || 'Nome da pasta'}</span>
        </div>

        {/* Nome */}
        <div>
          <label className="label-campo">Nome da pasta</label>
          <input value={nome} onChange={e => setNome(e.target.value)}
            placeholder="Ex: FitLife, Cliente Moda, Viagens..."
            className="input-campo w-full" />
        </div>

        {/* Emoji */}
        <div>
          <label className="label-campo">Emoji</label>
          <div className="flex flex-wrap gap-2">
            {EMOJIS_PASTA.map(e => (
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
          <label className="label-campo">Cor</label>
          <div className="flex gap-2 flex-wrap">
            {CORES.map(c => (
              <button key={c} onClick={() => setCor(c)}
                className="w-8 h-8 rounded-full transition-all"
                style={{
                  background: c,
                  border: cor === c ? '3px solid #fff' : '3px solid transparent',
                  boxShadow: cor === c ? `0 0 0 2px ${c}` : 'none',
                }} />
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button onClick={onFechar}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium"
            style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', color: 'var(--cor-texto-muted)' }}>
            Cancelar
          </button>
          <button onClick={() => nome.trim() && onGuardar(nome.trim(), cor, emoji)}
            disabled={!nome.trim()}
            className="flex-1 btn-primario py-2.5 justify-center"
            style={!nome.trim() ? { opacity: 0.5, cursor: 'not-allowed' } : {}}>
            <Check size={16} /> {pasta ? 'Guardar' : 'Criar pasta'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ---- Modal Detalhe do Ficheiro ----
function ModalFicheiro({ ficheiro, onFechar, onAtualizarLegenda }: {
  ficheiro: Ficheiro
  onFechar: () => void
  onAtualizarLegenda: (id: string, legenda: string, hashtags: string[]) => void
}) {
  const [gerando, setGerando]   = useState(false)
  const [copiado, setCopiado]   = useState<string | null>(null)
  const tipo = tipoFicheiro(ficheiro.tipo)

  const gerarLegenda = async () => {
    setGerando(true)
    try {
      const r = await fetch('/api/ia/agente-atendimento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sistema: 'És um especialista em marketing de conteúdo. Analisa o nome e tipo do ficheiro e cria uma legenda viral para Instagram/TikTok em português de Portugal. Responde APENAS em JSON com este formato: {"legenda": "...", "hashtags": ["#tag1", "#tag2"]}',
          mensagens: [{ role: 'user', content: `Cria uma legenda viral para um ${tipo} chamado "${ficheiro.nome}". Inclui emojis, call-to-action e 5-8 hashtags relevantes.` }]
        }),
      })
      const d = await r.json()
      try {
        const parsed = JSON.parse(d.resposta)
        onAtualizarLegenda(ficheiro.id, parsed.legenda, parsed.hashtags)
      } catch {
        onAtualizarLegenda(ficheiro.id, d.resposta, [])
      }
    } catch { /* silencioso */ }
    finally { setGerando(false) }
  }

  const copiar = (texto: string, id: string) => {
    navigator.clipboard.writeText(texto)
    setCopiado(id)
    setTimeout(() => setCopiado(null), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col"
        style={{ background: 'var(--cor-card)', border: '1px solid var(--cor-borda)', maxHeight: '90vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--cor-borda)' }}>
          <div className="flex items-center gap-2">
            {tipo === 'imagem' ? <ImageIcon size={16} style={{ color: 'var(--cor-marca)' }} />
              : tipo === 'video' ? <Video size={16} style={{ color: 'var(--cor-aviso)' }} />
              : <File size={16} style={{ color: 'var(--cor-texto-muted)' }} />}
            <span className="font-medium text-sm truncate max-w-xs">{ficheiro.nome}</span>
            <span className="text-xs" style={{ color: 'var(--cor-texto-muted)' }}>
              {formatarTamanho(ficheiro.tamanho)}
            </span>
          </div>
          <button onClick={onFechar} style={{ color: 'var(--cor-texto-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">

            {/* Preview */}
            <div className="p-5 flex items-center justify-center border-b md:border-b-0 md:border-r"
              style={{ borderColor: 'var(--cor-borda)', background: 'var(--cor-elevado)', minHeight: 240 }}>
              {tipo === 'imagem' ? (
                <img src={ficheiro.url} alt={ficheiro.nome}
                  className="max-w-full max-h-64 rounded-xl object-contain" />
              ) : tipo === 'video' ? (
                <video src={ficheiro.url} controls className="max-w-full max-h-64 rounded-xl" />
              ) : (
                <div className="text-center">
                  <File size={48} style={{ color: 'var(--cor-texto-fraco)', margin: '0 auto 8px' }} />
                  <p className="text-sm" style={{ color: 'var(--cor-texto-muted)' }}>{ficheiro.nome}</p>
                </div>
              )}
            </div>

            {/* Legenda IA */}
            <div className="p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm" style={{ fontFamily: 'var(--fonte-display)' }}>
                  Legenda gerada por IA
                </span>
                <button onClick={gerarLegenda} disabled={gerando}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
                  style={{ color: 'var(--cor-marca)', background: 'rgba(124,123,250,0.1)', border: '1px solid rgba(124,123,250,0.2)', opacity: gerando ? 0.6 : 1 }}>
                  {gerando ? <Loader size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  {gerando ? 'A gerar...' : ficheiro.legenda_ia ? 'Regenerar' : 'Gerar legenda'}
                </button>
              </div>

              {ficheiro.legenda_ia ? (
                <>
                  <div className="p-3 rounded-xl text-sm leading-relaxed"
                    style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', color: 'var(--cor-texto)' }}>
                    {ficheiro.legenda_ia}
                  </div>
                  <button onClick={() => copiar(ficheiro.legenda_ia!, 'legenda')}
                    className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition-all"
                    style={{ color: copiado === 'legenda' ? 'var(--cor-sucesso)' : 'var(--cor-texto-muted)', background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)' }}>
                    {copiado === 'legenda' ? <><Check size={12} /> Copiado!</> : <><Copy size={12} /> Copiar legenda</>}
                  </button>

                  {ficheiro.hashtags_ia && ficheiro.hashtags_ia.length > 0 && (
                    <>
                      <div className="flex flex-wrap gap-1.5">
                        {ficheiro.hashtags_ia.map(h => (
                          <span key={h} className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(96,165,250,0.1)', color: 'var(--cor-info)', border: '1px solid rgba(96,165,250,0.2)' }}>
                            {h}
                          </span>
                        ))}
                      </div>
                      <button onClick={() => copiar(ficheiro.hashtags_ia!.join(' '), 'hashtags')}
                        className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition-all"
                        style={{ color: copiado === 'hashtags' ? 'var(--cor-sucesso)' : 'var(--cor-texto-muted)', background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)' }}>
                        {copiado === 'hashtags' ? <><Check size={12} /> Copiado!</> : <><Copy size={12} /> Copiar hashtags</>}
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-8"
                  style={{ color: 'var(--cor-texto-muted)' }}>
                  <Sparkles size={28} style={{ marginBottom: 8, opacity: 0.4 }} />
                  <p className="text-sm">Clica em "Gerar legenda" para a IA criar uma legenda viral para este ficheiro</p>
                </div>
              )}

              {/* Download */}
              <a href={ficheiro.url} download={ficheiro.nome} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg mt-auto"
                style={{ color: 'var(--cor-texto-muted)', background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', textDecoration: 'none' }}>
                <Download size={12} /> Descarregar ficheiro
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---- Componente principal ----
export default function BibliotecaMedia() {
  const { utilizador }              = useAuth()
  const [pastas, setPastas]         = useState<Pasta[]>([])
  const [ficheiros, setFicheiros]   = useState<Ficheiro[]>([])
  const [pastaAtiva, setPastaAtiva] = useState<Pasta | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [uploading, setUploading]   = useState(false)
  const [modalPasta, setModalPasta] = useState<{ pasta?: Pasta } | null>(null)
  const [modalFich, setModalFich]   = useState<Ficheiro | null>(null)
  const [selecionados, setSel]      = useState<string[]>([])
  const inputRef                    = useRef<HTMLInputElement>(null)

  // Carregar pastas
  useEffect(() => {
    if (!utilizador) return
    const carregar = async () => {
      const { data: p } = await supabase.from('pastas_media').select('*').eq('utilizador_id', utilizador.id).order('criado_em')
      if (p) setPastas(p)
      setCarregando(false)
    }
    carregar()
  }, [utilizador])

  // Carregar ficheiros da pasta ativa
  useEffect(() => {
    if (!utilizador) return
    const carregar = async () => {
      const query = supabase.from('ficheiros_media').select('*').eq('utilizador_id', utilizador.id)
      if (pastaAtiva) query.eq('pasta_id', pastaAtiva.id)
      else query.is('pasta_id', null)
      const { data } = await query.order('criado_em', { ascending: false })
      if (data) setFicheiros(data)
    }
    carregar()
  }, [utilizador, pastaAtiva])

  // Criar pasta
  const criarPasta = async (nome: string, cor: string, emoji: string) => {
    if (!utilizador) return
    if (modalPasta?.pasta) {
      const { data } = await supabase.from('pastas_media').update({ nome, cor, emoji }).eq('id', modalPasta.pasta.id).select().single()
      if (data) setPastas(prev => prev.map(p => p.id === data.id ? data : p))
    } else {
      const { data } = await supabase.from('pastas_media').insert({ nome, cor, emoji, utilizador_id: utilizador.id }).select().single()
      if (data) setPastas(prev => [...prev, data])
    }
    setModalPasta(null)
  }

  // Apagar pasta
  const apagarPasta = async (id: string) => {
    await supabase.from('pastas_media').delete().eq('id', id)
    setPastas(prev => prev.filter(p => p.id !== id))
    if (pastaAtiva?.id === id) setPastaAtiva(null)
  }

  // Upload ficheiros
  const fazerUpload = async (files: FileList) => {
    if (!utilizador) return
    setUploading(true)
    for (const file of Array.from(files)) {
      const caminho = `${utilizador.id}/${pastaAtiva?.id || 'raiz'}/${Date.now()}_${file.name}`
      const { data: up, error } = await supabase.storage.from('media').upload(caminho, file)
      if (error) { console.error(error); continue }
      const { data: urlData } = supabase.storage.from('media').getPublicUrl(caminho)
      const { data: fich } = await supabase.from('ficheiros_media').insert({
        utilizador_id: utilizador.id,
        pasta_id: pastaAtiva?.id || null,
        nome: file.name,
        tipo: file.type,
        url: urlData.publicUrl,
        tamanho: file.size,
      }).select().single()
      if (fich) setFicheiros(prev => [fich, ...prev])
    }
    setUploading(false)
  }

  // Apagar ficheiros
  const apagarFicheiros = async () => {
    for (const id of selecionados) {
      await supabase.from('ficheiros_media').delete().eq('id', id)
    }
    setFicheiros(prev => prev.filter(f => !selecionados.includes(f.id)))
    setSel([])
  }

  // Atualizar legenda
  const atualizarLegenda = async (id: string, legenda: string, hashtags: string[]) => {
    await supabase.from('ficheiros_media').update({ legenda_ia: legenda, hashtags_ia: hashtags }).eq('id', id)
    setFicheiros(prev => prev.map(f => f.id === id ? { ...f, legenda_ia: legenda, hashtags_ia: hashtags } : f))
    if (modalFich?.id === id) setModalFich(prev => prev ? { ...prev, legenda_ia: legenda, hashtags_ia: hashtags } : prev)
  }

  const toggleSel = (id: string) => setSel(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  return (
    <>
      <Head><title>Biblioteca de Média — AdPulse</title></Head>
      <LayoutPainel titulo="Biblioteca de Média">
        <div className="max-w-6xl mx-auto flex flex-col gap-6">

          {/* Breadcrumb + ações */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 text-sm">
              <button onClick={() => setPastaAtiva(null)}
                className="flex items-center gap-1 transition-colors"
                style={{ color: pastaAtiva ? 'var(--cor-texto-muted)' : 'var(--cor-texto)', background: 'none', border: 'none', cursor: 'pointer' }}>
                <Home size={14} /> Biblioteca
              </button>
              {pastaAtiva && (
                <>
                  <ChevronRight size={14} style={{ color: 'var(--cor-texto-fraco)' }} />
                  <span style={{ color: 'var(--cor-texto)' }}>{pastaAtiva.emoji} {pastaAtiva.nome}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {selecionados.length > 0 && (
                <button onClick={apagarFicheiros}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all"
                  style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: 'var(--cor-erro)' }}>
                  <Trash2 size={14} /> Apagar ({selecionados.length})
                </button>
              )}
              {!pastaAtiva && (
                <button onClick={() => setModalPasta({})}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all"
                  style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', color: 'var(--cor-texto-muted)' }}>
                  <FolderPlus size={14} /> Nova pasta
                </button>
              )}
              <button onClick={() => inputRef.current?.click()} disabled={uploading}
                className="btn-primario"
                style={uploading ? { opacity: 0.6, cursor: 'not-allowed' } : {}}>
                {uploading ? <Loader size={14} className="animate-spin" /> : <Upload size={14} />}
                {uploading ? 'A carregar...' : 'Carregar ficheiros'}
              </button>
              <input ref={inputRef} type="file" multiple accept="image/*,video/*"
                className="hidden"
                onChange={e => e.target.files && fazerUpload(e.target.files)} />
            </div>
          </div>

          {/* Zona de drag & drop */}
          <div
            className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-8 cursor-pointer transition-all"
            style={{ borderColor: 'var(--cor-borda)', background: 'rgba(124,123,250,0.02)' }}
            onClick={() => inputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--cor-marca)' }}
            onDragLeave={e => { e.currentTarget.style.borderColor = 'var(--cor-borda)' }}
            onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--cor-borda)'; e.dataTransfer.files && fazerUpload(e.dataTransfer.files) }}>
            <Upload size={24} style={{ color: 'var(--cor-texto-fraco)', marginBottom: 8 }} />
            <p className="text-sm font-medium" style={{ color: 'var(--cor-texto-muted)' }}>
              Arrasta ficheiros aqui ou clica para carregar
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--cor-texto-fraco)' }}>
              Suporta imagens e vídeos — do PC ou telemóvel
            </p>
          </div>

          {carregando && (
            <div className="flex items-center justify-center py-16">
              <Loader size={24} className="animate-spin" style={{ color: 'var(--cor-marca)' }} />
            </div>
          )}

          {/* Pastas (só na raiz) */}
          {!carregando && !pastaAtiva && pastas.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-3" style={{ color: 'var(--cor-texto-muted)' }}>Pastas</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {pastas.map(p => (
                  <div key={p.id} className="group relative">
                    <button onClick={() => setPastaAtiva(p)}
                      className="w-full flex flex-col items-center gap-2 p-4 rounded-2xl transition-all"
                      style={{ background: 'var(--cor-card)', border: `1px solid ${p.cor}25` }}
                      onMouseOver={e => (e.currentTarget.style.borderColor = p.cor + '50')}
                      onMouseOut={e => (e.currentTarget.style.borderColor = p.cor + '25')}>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                        style={{ background: `${p.cor}15` }}>
                        {p.emoji}
                      </div>
                      <span className="text-xs font-medium text-center truncate w-full">{p.nome}</span>
                    </button>
                    {/* Ações da pasta */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button onClick={() => setModalPasta({ pasta: p })}
                        className="w-6 h-6 rounded-lg flex items-center justify-center"
                        style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', color: 'var(--cor-texto-muted)' }}>
                        <Edit3 size={10} />
                      </button>
                      <button onClick={() => apagarPasta(p.id)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: 'var(--cor-erro)' }}>
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ficheiros */}
          {!carregando && (
            <div>
              {ficheiros.length > 0 && (
                <p className="text-sm font-medium mb-3" style={{ color: 'var(--cor-texto-muted)' }}>
                  {pastaAtiva ? `Ficheiros em ${pastaAtiva.emoji} ${pastaAtiva.nome}` : 'Ficheiros na raiz'}
                  <span className="ml-2" style={{ color: 'var(--cor-texto-fraco)' }}>({ficheiros.length})</span>
                </p>
              )}

              {ficheiros.length === 0 && pastas.length === 0 && (
                <div className="text-center py-16">
                  <ImageIcon size={40} style={{ color: 'var(--cor-texto-fraco)', margin: '0 auto 12px', opacity: 0.4 }} />
                  <h3 className="font-semibold mb-2" style={{ fontFamily: 'var(--fonte-display)' }}>Biblioteca vazia</h3>
                  <p className="text-sm" style={{ color: 'var(--cor-texto-muted)' }}>
                    Carrega as tuas primeiras imagens ou vídeos
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {ficheiros.map(f => {
                  const tipo = tipoFicheiro(f.tipo)
                  const sel  = selecionados.includes(f.id)
                  return (
                    <div key={f.id} className="group relative rounded-2xl overflow-hidden cursor-pointer"
                      style={{
                        border: sel ? '2px solid var(--cor-marca)' : '2px solid transparent',
                        background: 'var(--cor-elevado)',
                      }}>

                      {/* Checkbox seleção */}
                      <button onClick={() => toggleSel(f.id)}
                        className="absolute top-2 left-2 z-10 w-5 h-5 rounded-md flex items-center justify-center transition-all"
                        style={{
                          background: sel ? 'var(--cor-marca)' : 'rgba(0,0,0,0.5)',
                          border: `1px solid ${sel ? 'var(--cor-marca)' : 'rgba(255,255,255,0.3)'}`,
                          opacity: sel ? 1 : 0,
                        }}
                        onMouseOver={e => (e.currentTarget.style.opacity = '1')}
                        onMouseOut={e => { if (!sel) e.currentTarget.style.opacity = '0' }}>
                        {sel && <Check size={10} color="#fff" />}
                      </button>

                      {/* Preview */}
                      <div className="aspect-square" onClick={() => setModalFich(f)}>
                        {tipo === 'imagem' ? (
                          <img src={f.url} alt={f.nome}
                            className="w-full h-full object-cover" />
                        ) : tipo === 'video' ? (
                          <div className="w-full h-full flex items-center justify-center"
                            style={{ background: '#000' }}>
                            <Video size={28} color="#fff" />
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"
                            style={{ background: 'var(--cor-card)' }}>
                            <File size={28} style={{ color: 'var(--cor-texto-muted)' }} />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-2">
                        <p className="text-xs truncate font-medium">{f.nome}</p>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-xs" style={{ color: 'var(--cor-texto-fraco)' }}>
                            {formatarTamanho(f.tamanho)}
                          </span>
                          {f.legenda_ia && (
                            <span className="text-xs" style={{ color: 'var(--cor-sucesso)' }}>✓ IA</span>
                          )}
                        </div>
                      </div>

                      {/* Hover overlay */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
                        style={{ background: 'rgba(0,0,0,0.5)' }}
                        onClick={() => setModalFich(f)}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ background: 'rgba(255,255,255,0.2)' }}>
                          <Eye size={14} color="#fff" />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </LayoutPainel>

      {/* Modais */}
      {modalPasta !== null && (
        <ModalPasta pasta={modalPasta.pasta} onGuardar={criarPasta} onFechar={() => setModalPasta(null)} />
      )}
      {modalFich && (
        <ModalFicheiro ficheiro={modalFich} onFechar={() => setModalFich(null)} onAtualizarLegenda={atualizarLegenda} />
      )}
    </>
  )
}
