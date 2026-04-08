// ============================================
// AdPulse — Biblioteca de Fundos (v2)
// ============================================

import Head from 'next/head'
import { useState, useEffect, useRef } from 'react'
import { Upload, Trash2, Star, Check, Loader, Plus, X, Image as ImageIcon, Eye } from 'lucide-react'
import LayoutPainel from '@/components/layout/LayoutPainel'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

type Fundo = {
  id: string
  nome: string
  url: string
  tipo: 'predefinido' | 'personalizado'
  plataformas: string[]
  padrao_para: string[]
  criado_em: string
}

const PLATAFORMAS = [
  { id: 'instagram', label: 'Instagram', emoji: '📸' },
  { id: 'tiktok',    label: 'TikTok',    emoji: '🎵' },
  { id: 'youtube',   label: 'YouTube',   emoji: '▶️' },
  { id: 'linkedin',  label: 'LinkedIn',  emoji: '💼' },
  { id: 'twitter',   label: 'Twitter/X', emoji: '🐦' },
  { id: 'facebook',  label: 'Facebook',  emoji: '👥' },
]

const FUNDOS_PREDEFINIDOS: Omit<Fundo, 'criado_em'>[] = [
  { id: 'pre-1',  nome: 'Gradiente Roxo',     url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=400&q=80',  tipo: 'predefinido', plataformas: [], padrao_para: [] },
  { id: 'pre-2',  nome: 'Gradiente Rosa',      url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&q=80',  tipo: 'predefinido', plataformas: [], padrao_para: [] },
  { id: 'pre-3',  nome: 'Gradiente Azul',      url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',  tipo: 'predefinido', plataformas: [], padrao_para: [] },
  { id: 'pre-4',  nome: 'Gradiente Verde',     url: 'https://images.unsplash.com/photo-1596276122653-651a3898309f?w=400&q=80',  tipo: 'predefinido', plataformas: [], padrao_para: [] },
  { id: 'pre-5',  nome: 'Escuro Elegante',     url: 'https://images.unsplash.com/photo-1502691876148-a84978e59af8?w=400&q=80',  tipo: 'predefinido', plataformas: [], padrao_para: [] },
  { id: 'pre-6',  nome: 'Minimalista',         url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',  tipo: 'predefinido', plataformas: [], padrao_para: [] },
  { id: 'pre-7',  nome: 'Natureza Verde',      url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80',  tipo: 'predefinido', plataformas: [], padrao_para: [] },
  { id: 'pre-8',  nome: 'Cidade Noturna',      url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&q=80',  tipo: 'predefinido', plataformas: [], padrao_para: [] },
  { id: 'pre-9',  nome: 'Abstrato Laranja',    url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&q=80',  tipo: 'predefinido', plataformas: [], padrao_para: [] },
  { id: 'pre-10', nome: 'Tecnologia',          url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80',  tipo: 'predefinido', plataformas: [], padrao_para: [] },
  { id: 'pre-11', nome: 'Café & Trabalho',     url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80',  tipo: 'predefinido', plataformas: [], padrao_para: [] },
  { id: 'pre-12', nome: 'Fitness',             url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80',  tipo: 'predefinido', plataformas: [], padrao_para: [] },
]

export default function BibliotecaFundos() {
  const { utilizador }              = useAuth()
  const [fundos, setFundos]         = useState<Fundo[]>([])
  const [carregando, setCarr]       = useState(true)
  const [uploading, setUploading]   = useState(false)
  const [filtro, setFiltro]         = useState<'todos' | 'predefinido' | 'personalizado'>('todos')
  const [modalPadrao, setModal]     = useState<Fundo | null>(null)
  const [fundoSelecionado, setFsel] = useState<string | null>(null)
  const [previewFundo, setPreview]  = useState<string | null>(null)
  const [dragOver, setDragOver]     = useState(false)
  const [erro, setErro]             = useState<string | null>(null)
  const [sucesso, setSucesso]       = useState<string | null>(null)
  const inputRef                    = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!utilizador) return
    const carregar = async () => {
      setCarr(true)
      const { data } = await supabase
        .from('fundos')
        .select('*')
        .eq('utilizador_id', utilizador.id)
        .order('criado_em', { ascending: false })
      setFundos(data || [])
      setCarr(false)
    }
    carregar()
  }, [utilizador])

  // Fechar notificações automaticamente
  useEffect(() => {
    if (!sucesso && !erro) return
    const t = setTimeout(() => { setSucesso(null); setErro(null) }, 3500)
    return () => clearTimeout(t)
  }, [sucesso, erro])

  const processarFicheiro = async (file: File) => {
    if (!utilizador) return
    if (!file.type.startsWith('image/')) { setErro('Apenas imagens são suportadas (PNG, JPG, WebP)'); return }
    if (file.size > 10 * 1024 * 1024) { setErro('Imagem demasiado grande. Máximo 10MB.'); return }

    setUploading(true)
    try {
      const ext  = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const path = `fundos/${utilizador.id}/${Date.now()}.${ext}`

      const { error: upErr } = await supabase.storage.from('media').upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      })
      if (upErr) throw upErr

      const { data: urlData } = supabase.storage.from('media').getPublicUrl(path)
      const nome = file.name.replace(`.${ext}`, '').replace(/[-_]/g, ' ')

      const { data: novoFundo, error: dbErr } = await supabase
        .from('fundos')
        .insert({
          utilizador_id: utilizador.id,
          nome,
          url: urlData.publicUrl,
          tipo: 'personalizado',
          plataformas: [],
          padrao_para: [],
        })
        .select()
        .single()

      if (dbErr) throw dbErr
      if (novoFundo) {
        setFundos(prev => [novoFundo, ...prev])
        setFsel(novoFundo.id)
        setSucesso(`"${nome}" adicionado com sucesso!`)
      }
    } catch (err: any) {
      console.error(err)
      setErro(err?.message || 'Erro ao carregar imagem. Tenta novamente.')
    }
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  const uploadFundo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processarFicheiro(file)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processarFicheiro(file)
  }

  const apagarFundo = async (id: string, nome: string) => {
    if (!confirm(`Apagar "${nome}"?`)) return
    await supabase.from('fundos').delete().eq('id', id)
    setFundos(prev => prev.filter(f => f.id !== id))
    if (fundoSelecionado === id) setFsel(null)
    setSucesso(`"${nome}" apagado.`)
  }

  const definirPadrao = async (fundo: Fundo, plataforma: string) => {
    // Remover plataforma de outros fundos
    const outrosFundos = fundos.filter(f => f.id !== fundo.id && f.padrao_para.includes(plataforma))
    for (const f of outrosFundos) {
      const novoPadrao = f.padrao_para.filter(p => p !== plataforma)
      await supabase.from('fundos').update({ padrao_para: novoPadrao }).eq('id', f.id)
      setFundos(prev => prev.map(x => x.id === f.id ? { ...x, padrao_para: novoPadrao } : x))
    }

    const jaPadrao   = fundo.padrao_para.includes(plataforma)
    const novoPadrao = jaPadrao
      ? fundo.padrao_para.filter(p => p !== plataforma)
      : [...fundo.padrao_para, plataforma]

    if (fundo.tipo === 'personalizado') {
      await supabase.from('fundos').update({ padrao_para: novoPadrao }).eq('id', fundo.id)
    }
    setFundos(prev => prev.map(f => f.id === fundo.id ? { ...f, padrao_para: novoPadrao } : f))
    // Atualizar o modal em tempo real
    setModal(prev => prev?.id === fundo.id ? { ...prev, padrao_para: novoPadrao } : prev)
  }

  const guardarPredefinido = async (fundo: Omit<Fundo, 'criado_em'>) => {
    if (!utilizador) return
    const jaGuardado = fundos.find(f => f.url === fundo.url)
    if (jaGuardado) { setFsel(jaGuardado.id); return }
    const { data } = await supabase
      .from('fundos')
      .insert({
        utilizador_id: utilizador.id,
        nome: fundo.nome,
        url: fundo.url,
        tipo: 'predefinido',
        plataformas: [],
        padrao_para: [],
      })
      .select()
      .single()
    if (data) {
      setFundos(prev => [data, ...prev])
      setFsel(data.id)
      setSucesso(`"${fundo.nome}" guardado na tua biblioteca!`)
    }
  }

  const todosFundos = [
    ...FUNDOS_PREDEFINIDOS.map(f => ({ ...f, criado_em: '', _guardado: fundos.some(x => x.url === f.url) })),
    ...fundos.filter(f => f.tipo === 'personalizado').map(f => ({ ...f, _guardado: true })),
  ]

  const fundosFiltrados = filtro === 'todos'
    ? todosFundos
    : filtro === 'predefinido'
      ? todosFundos.filter(f => f.tipo === 'predefinido')
      : todosFundos.filter(f => f.tipo === 'personalizado')

  const fundosPadrao = PLATAFORMAS.map(p => ({
    plataforma: p,
    fundo: fundos.find(f => f.padrao_para.includes(p.id)),
  }))

  return (
    <>
      <Head><title>Biblioteca de Fundos — AdPulse</title></Head>
      <LayoutPainel titulo="Biblioteca de Fundos">
        <div className="max-w-5xl mx-auto flex flex-col gap-6">

          {/* Toast notifications */}
          {(sucesso || erro) && (
            <div className="fixed top-6 right-6 z-50 animate-fade-in">
              <div className="px-4 py-3 rounded-xl text-sm font-medium shadow-lg flex items-center gap-2"
                style={{
                  background: sucesso ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)',
                  border: `1px solid ${sucesso ? 'rgba(52,211,153,0.4)' : 'rgba(248,113,113,0.4)'}`,
                  color: sucesso ? '#34d399' : '#f87171',
                  backdropFilter: 'blur(8px)',
                }}>
                {sucesso ? <Check size={14} /> : <X size={14} />}
                {sucesso || erro}
              </div>
            </div>
          )}

          {/* Header */}
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(124,123,250,0.08), rgba(244,114,182,0.08))', border: '1px solid rgba(124,123,250,0.2)' }}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: 'rgba(124,123,250,0.15)', border: '1px solid rgba(124,123,250,0.3)' }}>
                  🖼️
                </div>
                <div>
                  <h2 className="font-bold text-xl" style={{ fontFamily: 'var(--fonte-display)' }}>Biblioteca de Fundos</h2>
                  <p className="text-sm mt-1" style={{ color: 'var(--cor-texto-muted)' }}>
                    {fundos.length} fundos guardados · Define fundos padrão por plataforma
                  </p>
                </div>
              </div>
              <label className="btn-primario cursor-pointer">
                {uploading
                  ? <><Loader size={16} className="animate-spin" /> A carregar...</>
                  : <><Upload size={16} /> Carregar fundo</>}
                <input ref={inputRef} type="file" accept="image/*,image/webp,image/png,image/jpeg" onChange={uploadFundo} className="hidden" disabled={uploading} />
              </label>
            </div>
          </div>

          {/* Drag & Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className="cursor-pointer rounded-2xl flex items-center justify-center gap-3 py-5 transition-all"
            style={{
              border: `2px dashed ${dragOver ? 'var(--cor-marca)' : 'var(--cor-borda)'}`,
              background: dragOver ? 'rgba(124,123,250,0.06)' : 'transparent',
              color: dragOver ? 'var(--cor-marca)' : 'var(--cor-texto-fraco)',
            }}>
            <ImageIcon size={18} />
            <span className="text-sm">
              {uploading ? 'A carregar...' : 'Arrasta imagens aqui ou clica para selecionar · PNG, JPG, WebP · Max 10MB'}
            </span>
          </div>

          {/* Fundos padrão por plataforma */}
          <div className="card flex flex-col gap-4">
            <h3 className="font-semibold" style={{ fontFamily: 'var(--fonte-display)' }}>
              🎯 Fundos padrão por plataforma
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {fundosPadrao.map(({ plataforma, fundo }) => (
                <div key={plataforma.id} className="flex items-center gap-3 p-3 rounded-xl transition-all"
                  style={{ background: 'var(--cor-elevado)', border: `1px solid ${fundo ? 'rgba(124,123,250,0.25)' : 'var(--cor-borda)'}` }}>
                  <span className="text-xl flex-shrink-0">{plataforma.emoji}</span>
                  {fundo ? (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <img src={fundo.url} alt={fundo.nome} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{fundo.nome}</p>
                        <p className="text-xs" style={{ color: 'var(--cor-marca)', fontSize: 10 }}>✓ Definido</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs flex-1" style={{ color: 'var(--cor-texto-fraco)' }}>Sem padrão definido</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { id: 'todos',         label: `Todos (${todosFundos.length})` },
              { id: 'predefinido',   label: `Pré-definidos (${FUNDOS_PREDEFINIDOS.length})` },
              { id: 'personalizado', label: `Os meus (${fundos.filter(f => f.tipo === 'personalizado').length})` },
            ].map(f => (
              <button key={f.id} onClick={() => setFiltro(f.id as any)}
                className="px-3 py-2 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: filtro === f.id ? 'var(--cor-marca)' : 'var(--cor-elevado)',
                  color:      filtro === f.id ? '#fff' : 'var(--cor-texto-muted)',
                  border:     `1px solid ${filtro === f.id ? 'var(--cor-marca)' : 'var(--cor-borda)'}`,
                }}>
                {f.label}
              </button>
            ))}
          </div>

          {/* Grid de fundos */}
          {carregando ? (
            <div className="flex items-center justify-center py-16">
              <Loader size={24} className="animate-spin" style={{ color: 'var(--cor-marca)' }} />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

              {/* Upload card */}
              <label
                className="cursor-pointer group"
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}>
                <div className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 transition-all"
                  style={{
                    background: dragOver ? 'rgba(124,123,250,0.08)' : 'var(--cor-elevado)',
                    border: `2px dashed ${dragOver ? 'var(--cor-marca)' : 'var(--cor-borda)'}`,
                  }}>
                  {uploading
                    ? <Loader size={24} className="animate-spin" style={{ color: 'var(--cor-marca)' }} />
                    : <Plus size={24} style={{ color: 'var(--cor-texto-fraco)' }} />}
                  <p className="text-xs text-center px-2" style={{ color: 'var(--cor-texto-fraco)' }}>
                    {uploading ? 'A carregar...' : 'Adicionar fundo'}
                  </p>
                </div>
                <input ref={inputRef} type="file" accept="image/*" onChange={uploadFundo} className="hidden" disabled={uploading} />
              </label>

              {fundosFiltrados.map((fundo: any) => {
                const guardado  = fundo._guardado || fundo.tipo === 'personalizado'
                const fundoReal = fundos.find(f => f.url === fundo.url)
                const padroes   = fundoReal?.padrao_para || []
                const isPessoal = fundo.tipo === 'personalizado'
                const isAtivo   = fundoSelecionado === fundo.id || (fundoReal && fundoSelecionado === fundoReal.id)

                return (
                  <div key={fundo.id} className="relative group rounded-2xl overflow-hidden cursor-pointer"
                    onClick={() => setFsel(isAtivo ? null : (fundoReal?.id || fundo.id))}
                    style={{ border: `2px solid ${isAtivo ? 'var(--cor-marca)' : 'transparent'}`, transition: 'border-color 0.15s' }}>
                    <div className="aspect-square">
                      <img src={fundo.url} alt={fundo.nome} className="w-full h-full object-cover" loading="lazy" />
                    </div>

                    {/* Overlay hover */}
                    <div className="absolute inset-0 flex flex-col justify-between p-2 opacity-0 group-hover:opacity-100 transition-all"
                      style={{ background: 'rgba(0,0,0,0.65)' }}>
                      <div className="flex justify-between items-start">
                        {/* Badges padrão */}
                        <div className="flex flex-wrap gap-1">
                          {padroes.map(p => {
                            const plat = PLATAFORMAS.find(x => x.id === p)
                            return plat ? (
                              <span key={p} className="text-xs px-1.5 py-0.5 rounded-full"
                                style={{ background: 'rgba(124,123,250,0.9)', color: '#fff', fontSize: 9 }}>
                                {plat.emoji}
                              </span>
                            ) : null
                          })}
                        </div>
                        <div className="flex gap-1">
                          {/* Preview */}
                          <button onClick={e => { e.stopPropagation(); setPreview(fundo.url) }}
                            className="p-1 rounded-lg"
                            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', cursor: 'pointer' }}>
                            <Eye size={12} />
                          </button>
                          {isPessoal && (
                            <button onClick={e => { e.stopPropagation(); apagarFundo(fundo.id, fundo.nome) }}
                              className="p-1 rounded-lg"
                              style={{ background: 'rgba(248,113,113,0.8)', color: '#fff', border: 'none', cursor: 'pointer' }}>
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <p className="text-xs font-medium text-white truncate">{fundo.nome}</p>
                        <div className="flex gap-1.5">
                          {!isPessoal && (
                            <button onClick={e => { e.stopPropagation(); guardarPredefinido(fundo) }}
                              className="flex-1 text-xs py-1 rounded-lg font-medium flex items-center justify-center gap-1"
                              style={{ background: guardado ? 'rgba(52,211,153,0.85)' : 'rgba(124,123,250,0.85)', color: '#fff', border: 'none', cursor: 'pointer' }}>
                              {guardado ? <><Check size={10} /> Guardado</> : <><Plus size={10} /> Guardar</>}
                            </button>
                          )}
                          <button onClick={e => { e.stopPropagation(); setModal(fundoReal || { ...fundo, padrao_para: [], criado_em: '' }) }}
                            className="flex-1 text-xs py-1 rounded-lg font-medium flex items-center justify-center gap-1"
                            style={{ background: 'rgba(251,191,36,0.85)', color: '#000', border: 'none', cursor: 'pointer' }}>
                            <Star size={10} /> Padrão
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Badge AdPulse */}
                    {fundo.tipo === 'predefinido' && !guardado && (
                      <div className="absolute top-2 left-2 pointer-events-none group-hover:opacity-0 transition-opacity">
                        <span className="text-xs px-1.5 py-0.5 rounded-full"
                          style={{ background: 'rgba(124,123,250,0.9)', color: '#fff', fontSize: 9 }}>
                          AdPulse
                        </span>
                      </div>
                    )}

                    {/* Check selecionado */}
                    {isAtivo && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: 'var(--cor-marca)' }}>
                        <Check size={11} className="text-white" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Empty state — Os meus */}
          {!carregando && filtro === 'personalizado' && fundos.filter(f => f.tipo === 'personalizado').length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)' }}>
                🖼️
              </div>
              <div className="text-center">
                <p className="font-medium mb-1">Ainda não tens fundos personalizados</p>
                <p className="text-sm" style={{ color: 'var(--cor-texto-muted)' }}>
                  Carrega a tua primeira imagem usando o botão acima ou arrasta aqui
                </p>
              </div>
              <label className="btn-primario cursor-pointer">
                <Upload size={16} /> Carregar primeiro fundo
                <input type="file" accept="image/*" onChange={uploadFundo} className="hidden" disabled={uploading} />
              </label>
            </div>
          )}
        </div>

        {/* Modal preview */}
        {previewFundo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}
            onClick={() => setPreview(null)}>
            <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
              <img src={previewFundo} alt="Preview" className="w-full rounded-2xl object-contain max-h-[80vh]" />
              <button onClick={() => setPreview(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Modal definir padrão */}
        {modalPadrao && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
            <div className="card w-full max-w-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold" style={{ fontFamily: 'var(--fonte-display)' }}>
                  Definir como padrão
                </h3>
                <button onClick={() => setModal(null)}
                  style={{ color: 'var(--cor-texto-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={16} />
                </button>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)' }}>
                <img src={modalPadrao.url} alt={modalPadrao.nome} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">{modalPadrao.nome}</p>
                  <p className="text-xs" style={{ color: 'var(--cor-texto-muted)' }}>
                    {modalPadrao.padrao_para?.length > 0
                      ? `Padrão em ${modalPadrao.padrao_para.length} plataforma(s)`
                      : 'Sem plataformas definidas'}
                  </p>
                </div>
              </div>

              <p className="text-sm" style={{ color: 'var(--cor-texto-muted)' }}>
                Seleciona as plataformas onde este fundo será usado por padrão:
              </p>

              <div className="grid grid-cols-2 gap-2">
                {PLATAFORMAS.map(p => {
                  const ePadrao = modalPadrao.padrao_para?.includes(p.id)
                  return (
                    <button key={p.id}
                      onClick={async () => {
                        // Guardar predefinido primeiro se necessário
                        let fundoParaAtualizar = modalPadrao
                        if (modalPadrao.tipo === 'predefinido' && !fundos.find(f => f.url === modalPadrao.url)) {
                          const { data } = await supabase
                            .from('fundos')
                            .insert({ utilizador_id: utilizador?.id, nome: modalPadrao.nome, url: modalPadrao.url, tipo: 'predefinido', plataformas: [], padrao_para: [] })
                            .select().single()
                          if (data) {
                            setFundos(prev => [data, ...prev])
                            fundoParaAtualizar = data
                          }
                        } else {
                          const real = fundos.find(f => f.url === modalPadrao.url)
                          if (real) fundoParaAtualizar = real
                        }
                        await definirPadrao(fundoParaAtualizar, p.id)
                      }}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all"
                      style={{
                        background: ePadrao ? 'rgba(124,123,250,0.15)' : 'var(--cor-elevado)',
                        border:     `1px solid ${ePadrao ? 'rgba(124,123,250,0.4)' : 'var(--cor-borda)'}`,
                        color:      ePadrao ? 'var(--cor-marca)' : 'var(--cor-texto-muted)',
                        cursor: 'pointer',
                      }}>
                      <span>{p.emoji}</span>
                      <span className="flex-1 text-left">{p.label}</span>
                      {ePadrao && <Check size={12} />}
                    </button>
                  )
                })}
              </div>

              <button onClick={() => { setModal(null); setSucesso('Fundos padrão guardados!') }} className="btn-primario justify-center py-2.5">
                <Check size={16} /> Feito
              </button>
            </div>
          </div>
        )}
      </LayoutPainel>
    </>
  )
}
