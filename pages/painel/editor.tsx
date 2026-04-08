// ============================================
// AdPulse — Editor de Criativos (estilo Canva)
// ============================================

import Head from 'next/head'
import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Download, RotateCcw, Plus, X, Trash2, Bold, Italic,
  AlignLeft, AlignCenter, AlignRight, Upload, Wand2,
  Loader, Image as ImageIcon, Type, Layers, ChevronUp,
  ChevronDown, Eye, EyeOff, Lock, Unlock, Frame, Sparkles,
  Move, CornerUpLeft
} from 'lucide-react'
import LayoutPainel from '@/components/layout/LayoutPainel'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

// ─── Tipos ───────────────────────────────────────────────────────────────────

type TipoElemento = 'texto' | 'imagem'

type Elemento = {
  id: string
  tipo: TipoElemento
  x: number       // px no canvas
  y: number       // px no canvas
  largura: number
  altura: number
  visivel: boolean
  bloqueado: boolean
  // Texto
  texto?: string
  tamanho?: number
  cor?: string
  peso?: 'normal' | 'bold'
  estilo?: 'normal' | 'italic'
  alinhamento?: 'left' | 'center' | 'right'
  fontFamily?: string
  sombra?: boolean
  // Imagem
  url?: string
  opacidade?: number
}

type Fundo = {
  id: string
  nome: string
  url: string
  tipo: 'predefinido' | 'personalizado'
}

type Formato = {
  id: string
  label: string
  emoji: string
  largura: number
  altura: number
}

// ─── Constantes ──────────────────────────────────────────────────────────────

const FORMATOS: Formato[] = [
  { id: 'feed',      label: 'Feed Quadrado',    emoji: '⬛', largura: 1080, altura: 1080 },
  { id: 'stories',   label: 'Stories / Reels',  emoji: '📱', largura: 1080, altura: 1920 },
  { id: 'landscape', label: 'Paisagem YouTube', emoji: '🖥️', largura: 1920, altura: 1080 },
  { id: 'portrait',  label: 'Retrato',          emoji: '📷', largura: 1080, altura: 1350 },
  { id: 'linkedin',  label: 'LinkedIn',         emoji: '💼', largura: 1200, altura: 627  },
]

const FUNDOS_PREDEFINIDOS: Fundo[] = [
  { id: 'pre-1', nome: 'Gradiente Roxo',  url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800&q=80', tipo: 'predefinido' },
  { id: 'pre-2', nome: 'Gradiente Rosa',  url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80', tipo: 'predefinido' },
  { id: 'pre-3', nome: 'Gradiente Azul',  url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', tipo: 'predefinido' },
  { id: 'pre-4', nome: 'Cidade Noturna',  url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80', tipo: 'predefinido' },
  { id: 'pre-5', nome: 'Natureza Verde',  url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80', tipo: 'predefinido' },
  { id: 'pre-6', nome: 'Tecnologia',      url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80', tipo: 'predefinido' },
  { id: 'pre-7', nome: 'Abstrato',        url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&q=80', tipo: 'predefinido' },
  { id: 'pre-8', nome: 'Café',            url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80', tipo: 'predefinido' },
]

const FONTES = [
  { label: 'Inter',        value: 'Inter, sans-serif'           },
  { label: 'Playfair',     value: 'Playfair Display, serif'     },
  { label: 'Montserrat',   value: 'Montserrat, sans-serif'      },
  { label: 'Oswald',       value: 'Oswald, sans-serif'          },
  { label: 'Raleway',      value: 'Raleway, sans-serif'         },
  { label: 'Bebas Neue',   value: 'Bebas Neue, cursive'         },
]

const CORES_RAPIDAS = ['#ffffff', '#000000', '#7c7bfa', '#f472b6', '#fbbf24', '#34d399', '#f87171', '#60a5fa']

const ESCALA_CANVAS = 0.45 // escala de preview

// ─── Utils ────────────────────────────────────────────────────────────────────

const novoId = () => `el_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`

const novoTexto = (formato: Formato, texto = 'O teu texto aqui'): Elemento => ({
  id: novoId(),
  tipo: 'texto',
  x: formato.largura * 0.1,
  y: formato.altura * 0.4,
  largura: formato.largura * 0.8,
  altura: 80,
  visivel: true,
  bloqueado: false,
  texto,
  tamanho: 64,
  cor: '#ffffff',
  peso: 'bold',
  estilo: 'normal',
  alinhamento: 'center',
  fontFamily: 'Inter, sans-serif',
  sombra: true,
})

const novaImagem = (url: string, formato: Formato): Elemento => ({
  id: novoId(),
  tipo: 'imagem',
  x: formato.largura * 0.2,
  y: formato.altura * 0.15,
  largura: formato.largura * 0.6,
  altura: formato.altura * 0.6,
  visivel: true,
  bloqueado: false,
  url,
  opacidade: 1,
})

// ─── Componente principal ─────────────────────────────────────────────────────

export default function EditorCriativos() {
  const { utilizador } = useAuth()
  const canvasWrapRef  = useRef<HTMLDivElement>(null)

  // Estado global
  const [formato, setFormato]               = useState<Formato>(FORMATOS[0])
  const [fundoUrl, setFundoUrl]             = useState<string | null>(null)
  const [fundosSaved, setFundosSaved]       = useState<Fundo[]>([])
  const [elementos, setElementos]           = useState<Elemento[]>([])
  const [selecionado, setSelecionado]       = useState<string | null>(null)
  const [aba, setAba]                       = useState<'fundo' | 'elementos' | 'formato'>('fundo')
  const [overlayOpacity, setOverlayOpacity] = useState(0.35)

  // Upload produto
  const [removendoBg, setRemovendoBg]       = useState(false)
  const [uploadingProd, setUploadingProd]   = useState(false)

  // Geração IA
  const [promptIA, setPromptIA]             = useState('')
  const [gerando, setGerando]               = useState(false)

  // Drag state (coordenadas no canvas real)
  const dragRef = useRef<{
    elId: string
    startMouseX: number
    startMouseY: number
    startElX: number
    startElY: number
    handle: 'move' | 'resize-br'
  } | null>(null)

  // Histórico undo
  const historicoRef = useRef<Elemento[][]>([[]])
  const [podeDesfazer, setPodeDesfazer] = useState(false)

  // ── Carregar fundos ──
  useEffect(() => {
    if (!utilizador) return
    supabase.from('fundos').select('*').eq('utilizador_id', utilizador.id)
      .then(({ data }) => setFundosSaved(data || []))
  }, [utilizador])

  // ── Estado inicial ──
  useEffect(() => {
    const headline = novoTexto(formato, 'O teu título aqui')
    headline.y = formato.altura * 0.72
    const cta = novoTexto(formato, 'Clica aqui →')
    cta.tamanho = 36
    cta.y = formato.altura * 0.84
    cta.cor = '#fbbf24'
    setElementos([headline, cta])
    setSelecionado(headline.id)
  }, [])

  // ── Guardar histórico ──
  const guardarHistorico = useCallback((els: Elemento[]) => {
    historicoRef.current = [...historicoRef.current.slice(-20), [...els]]
    setPodeDesfazer(historicoRef.current.length > 1)
  }, [])

  const desfazer = () => {
    if (historicoRef.current.length <= 1) return
    historicoRef.current.pop()
    const anterior = historicoRef.current[historicoRef.current.length - 1]
    setElementos([...anterior])
    setPodeDesfazer(historicoRef.current.length > 1)
  }

  // ── Elemento selecionado ──
  const el = elementos.find(e => e.id === selecionado)

  const atualizarEl = (id: string, campos: Partial<Elemento>) => {
    setElementos(prev => {
      const novo = prev.map(e => e.id === id ? { ...e, ...campos } : e)
      guardarHistorico(novo)
      return novo
    })
  }

  // ── Drag & drop no canvas ──
  const escala = ESCALA_CANVAS

  const onMouseDownEl = (e: React.MouseEvent, elId: string, handle: 'move' | 'resize-br' = 'move') => {
    e.stopPropagation()
    e.preventDefault()
    const el = elementos.find(x => x.id === elId)
    if (!el || el.bloqueado) return
    setSelecionado(elId)
    dragRef.current = {
      elId,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startElX: el.x,
      startElY: el.y,
      handle,
    }
  }

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return
      const { elId, startMouseX, startMouseY, startElX, startElY, handle } = dragRef.current
      const dx = (e.clientX - startMouseX) / escala
      const dy = (e.clientY - startMouseY) / escala

      setElementos(prev => prev.map(el => {
        if (el.id !== elId) return el
        if (handle === 'move') {
          return {
            ...el,
            x: Math.max(0, Math.min(formato.largura - el.largura, startElX + dx)),
            y: Math.max(0, Math.min(formato.altura - 20, startElY + dy)),
          }
        } else {
          return {
            ...el,
            largura: Math.max(80, el.largura + dx),
            altura: Math.max(40, el.altura + dy),
          }
        }
      }))
    }

    const onMouseUp = () => {
      if (dragRef.current) {
        const el = elementos.find(e => e.id === dragRef.current?.elId)
        if (el) guardarHistorico(elementos)
        dragRef.current = null
      }
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [elementos, formato, escala, guardarHistorico])

  // ── Adicionar texto ──
  const adicionarTexto = () => {
    const novo = novoTexto(formato)
    novo.y = Math.random() * (formato.altura * 0.6) + formato.altura * 0.1
    setElementos(prev => {
      const atualizado = [...prev, novo]
      guardarHistorico(atualizado)
      return atualizado
    })
    setSelecionado(novo.id)
    setAba('elementos')
  }

  // ── Upload produto com remoção de fundo ──
  const uploadProduto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    setUploadingProd(true)

    // Ler como base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

    // Tentar remoção de fundo
    setRemovendoBg(true)
    try {
      const resp = await fetch('/api/ia/remove-bg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64 }),
      })
      const data = await resp.json()
      const urlFinal = data.resultado || base64
      const novoEl = novaImagem(urlFinal, formato)
      setElementos(prev => {
        const atualizado = [...prev, novoEl]
        guardarHistorico(atualizado)
        return atualizado
      })
      setSelecionado(novoEl.id)
      setAba('elementos')
    } catch {
      // Fallback: usar imagem original
      const novoEl = novaImagem(base64, formato)
      setElementos(prev => [...prev, novoEl])
      setSelecionado(novoEl.id)
    }

    setRemovendoBg(false)
    setUploadingProd(false)
  }

  // ── Remover elemento ──
  const removerEl = (id: string) => {
    setElementos(prev => {
      const atualizado = prev.filter(e => e.id !== id)
      guardarHistorico(atualizado)
      return atualizado
    })
    if (selecionado === id) setSelecionado(null)
  }

  // ── Ordem camadas ──
  const moverCamada = (id: string, dir: 'up' | 'down') => {
    setElementos(prev => {
      const idx = prev.findIndex(e => e.id === id)
      if (idx === -1) return prev
      const novo = [...prev]
      if (dir === 'up' && idx < novo.length - 1) {
        [novo[idx], novo[idx + 1]] = [novo[idx + 1], novo[idx]]
      } else if (dir === 'down' && idx > 0) {
        [novo[idx], novo[idx - 1]] = [novo[idx - 1], novo[idx]]
      }
      guardarHistorico(novo)
      return novo
    })
  }

  // ── Gerar texto com IA ──
  const gerarTexto = async () => {
    if (!promptIA.trim() || !el || el.tipo !== 'texto') return
    setGerando(true)
    try {
      const resp = await fetch('/api/ia/gerar-conteudo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Gera um texto curto e impactante para um criativo de anúncio sobre: "${promptIA}". Máximo 6 palavras. Sem aspas. Sem pontos finais.`
        }),
      })
      const data = await resp.json()
      if (data?.conteudo) atualizarEl(el.id, { texto: data.conteudo.trim() })
    } catch {}
    setGerando(false)
  }

  // ── Exportar ──
  const exportar = () => {
    const canvas = document.createElement('canvas')
    canvas.width  = formato.largura
    canvas.height = formato.altura
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const desenhar = (fundoImg: HTMLImageElement | null) => {
      // Fundo
      if (fundoImg) {
        const r = fundoImg.width / fundoImg.height
        const cr = formato.largura / formato.altura
        let sx = 0, sy = 0, sw = fundoImg.width, sh = fundoImg.height
        if (r > cr) { sw = fundoImg.height * cr; sx = (fundoImg.width - sw) / 2 }
        else { sh = fundoImg.width / cr; sy = (fundoImg.height - sh) / 2 }
        ctx.drawImage(fundoImg, sx, sy, sw, sh, 0, 0, formato.largura, formato.altura)
        ctx.fillStyle = `rgba(0,0,0,${overlayOpacity})`
        ctx.fillRect(0, 0, formato.largura, formato.altura)
      } else {
        const grad = ctx.createLinearGradient(0, 0, formato.largura, formato.altura)
        grad.addColorStop(0, '#0f0c29')
        grad.addColorStop(1, '#302b63')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, formato.largura, formato.altura)
      }

      // Elementos (por ordem)
      const carregarImagens = elementos.filter(e => e.visivel).map(el => {
        return new Promise<void>(resolve => {
          if (el.tipo === 'texto') {
            ctx.save()
            ctx.globalAlpha = 1
            if (el.sombra) {
              ctx.shadowColor = 'rgba(0,0,0,0.7)'
              ctx.shadowBlur  = 12
            }
            ctx.font      = `${el.estilo} ${el.peso} ${el.tamanho}px ${el.fontFamily || 'Inter, sans-serif'}`
            ctx.fillStyle = el.cor || '#fff'
            ctx.textAlign = el.alinhamento as CanvasTextAlign
            ctx.textBaseline = 'top'
            const tx = el.alinhamento === 'center' ? el.x + el.largura / 2
                     : el.alinhamento === 'right'  ? el.x + el.largura
                     : el.x
            // Wrap texto
            const palavras = (el.texto || '').split(' ')
            let linha = ''
            let offsetY = 0
            const lineH = (el.tamanho || 32) * 1.25
            for (const palavra of palavras) {
              const teste = linha ? linha + ' ' + palavra : palavra
              if (ctx.measureText(teste).width > el.largura && linha) {
                ctx.fillText(linha, tx, el.y + offsetY)
                linha = palavra
                offsetY += lineH
              } else { linha = teste }
            }
            ctx.fillText(linha, tx, el.y + offsetY)
            ctx.restore()
            resolve()
          } else if (el.tipo === 'imagem' && el.url) {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.onload = () => {
              ctx.save()
              ctx.globalAlpha = el.opacidade ?? 1
              ctx.drawImage(img, el.x, el.y, el.largura, el.altura)
              ctx.restore()
              resolve()
            }
            img.onerror = () => resolve()
            img.src = el.url
          } else resolve()
        })
      })

      Promise.all(carregarImagens).then(() => {
        const link = document.createElement('a')
        link.href = canvas.toDataURL('image/png', 1)
        link.download = `adpulse-${Date.now()}.png`
        link.click()
      })
    }

    if (fundoUrl) {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => desenhar(img)
      img.onerror = () => desenhar(null)
      img.src = fundoUrl
    } else {
      desenhar(null)
    }
  }

  // ── Dimensões do canvas de preview ──
  const canvasW = Math.round(formato.largura  * escala)
  const canvasH = Math.round(formato.altura * escala)

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <Head>
        <title>Editor de Criativos — AdPulse</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Oswald:wght@600&family=Raleway:wght@400;700&family=Bebas+Neue&family=Montserrat:wght@400;700&display=swap" rel="stylesheet" />
      </Head>
      <LayoutPainel titulo="Editor de Criativos">
        <div className="max-w-7xl mx-auto">

          {/* Topbar */}
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <button onClick={desfazer} disabled={!podeDesfazer}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all"
                style={{
                  background: 'var(--cor-elevado)',
                  color: podeDesfazer ? 'var(--cor-texto-muted)' : 'var(--cor-texto-fraco)',
                  border: '1px solid var(--cor-borda)',
                  opacity: podeDesfazer ? 1 : 0.4,
                  cursor: podeDesfazer ? 'pointer' : 'default',
                }}>
                <CornerUpLeft size={14} /> Desfazer
              </button>
              <button
                onClick={() => {
                  const h = novoTexto(formato)
                  h.y = formato.altura * 0.72
                  const c = novoTexto(formato, 'Clica aqui →')
                  c.tamanho = 36; c.y = formato.altura * 0.84; c.cor = '#fbbf24'
                  setElementos([h, c])
                  setSelecionado(h.id)
                  setFundoUrl(null)
                  guardarHistorico([h, c])
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all"
                style={{ background: 'var(--cor-elevado)', color: 'var(--cor-texto-muted)', border: '1px solid var(--cor-borda)', cursor: 'pointer' }}>
                <RotateCcw size={14} /> Novo
              </button>
            </div>
            <button onClick={exportar} className="btn-primario">
              <Download size={16} /> Exportar PNG
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_260px] gap-5">

            {/* ── Painel Esquerdo ── */}
            <div className="flex flex-col gap-4">

              {/* Tabs */}
              <div className="grid grid-cols-3 rounded-xl overflow-hidden" style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)' }}>
                {[
                  { id: 'fundo',     label: 'Fundo',    icon: ImageIcon },
                  { id: 'elementos', label: 'Adicionar', icon: Plus      },
                  { id: 'formato',   label: 'Formato',  icon: Layers    },
                ].map(tab => (
                  <button key={tab.id} onClick={() => setAba(tab.id as any)}
                    className="flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-all"
                    style={{
                      background: aba === tab.id ? 'var(--cor-marca)' : 'transparent',
                      color: aba === tab.id ? '#fff' : 'var(--cor-texto-muted)',
                    }}>
                    <tab.icon size={15} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* ─ Painel Fundo ─ */}
              {aba === 'fundo' && (
                <div className="card flex flex-col gap-4">
                  <p className="text-sm font-semibold">Escolher Fundo</p>

                  <div className="grid grid-cols-3 gap-2">
                    {/* Sem fundo */}
                    <div onClick={() => setFundoUrl(null)}
                      className="aspect-square rounded-xl cursor-pointer flex items-center justify-center text-xs transition-all"
                      style={{
                        background: 'linear-gradient(135deg, #0f0c29, #302b63)',
                        border: `2px solid ${!fundoUrl ? 'var(--cor-marca)' : 'transparent'}`,
                      }}>
                      {!fundoUrl && <span style={{ color: 'var(--cor-marca)', fontSize: 18 }}>✓</span>}
                    </div>

                    {[...FUNDOS_PREDEFINIDOS, ...fundosSaved.filter(f => f.tipo === 'personalizado')].map(f => (
                      <div key={f.id} onClick={() => setFundoUrl(f.url)}
                        className="relative aspect-square rounded-xl cursor-pointer overflow-hidden transition-all"
                        style={{ border: `2px solid ${fundoUrl === f.url ? 'var(--cor-marca)' : 'transparent'}` }}>
                        <img src={f.url} alt={f.nome} className="w-full h-full object-cover" loading="lazy" />
                        {fundoUrl === f.url && (
                          <div className="absolute inset-0 flex items-center justify-center text-lg"
                            style={{ background: 'rgba(124,123,250,0.35)' }}>✓</div>
                        )}
                      </div>
                    ))}
                  </div>

                  <Link href="/painel/fundos" className="text-xs text-center py-2 rounded-xl"
                    style={{ background: 'rgba(124,123,250,0.08)', color: 'var(--cor-marca)', border: '1px dashed rgba(124,123,250,0.3)' }}>
                    + Gerir biblioteca de fundos
                  </Link>

                  {/* Overlay */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <p className="text-xs font-medium" style={{ color: 'var(--cor-texto-muted)' }}>Escurecimento do fundo</p>
                      <p className="text-xs" style={{ color: 'var(--cor-texto-fraco)' }}>{Math.round(overlayOpacity * 100)}%</p>
                    </div>
                    <input type="range" min={0} max={0.9} step={0.05} value={overlayOpacity}
                      onChange={e => setOverlayOpacity(parseFloat(e.target.value))}
                      className="w-full" style={{ accentColor: 'var(--cor-marca)' }} />
                  </div>
                </div>
              )}

              {/* ─ Painel Adicionar ─ */}
              {aba === 'elementos' && (
                <div className="card flex flex-col gap-3">
                  <p className="text-sm font-semibold">Adicionar Elementos</p>

                  {/* Adicionar texto */}
                  <button onClick={adicionarTexto}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all w-full"
                    style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', color: 'var(--cor-texto-muted)', cursor: 'pointer' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(124,123,250,0.15)' }}>
                      <Type size={18} style={{ color: 'var(--cor-marca)' }} />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm" style={{ color: 'var(--cor-texto)' }}>Texto</p>
                      <p className="text-xs" style={{ color: 'var(--cor-texto-fraco)' }}>Arrastar para reposicionar</p>
                    </div>
                  </button>

                  {/* Upload produto */}
                  <label className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all w-full cursor-pointer"
                    style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', color: 'var(--cor-texto-muted)' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(244,114,182,0.15)' }}>
                      {removendoBg
                        ? <Loader size={18} className="animate-spin" style={{ color: '#f472b6' }} />
                        : <ImageIcon size={18} style={{ color: '#f472b6' }} />}
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm" style={{ color: 'var(--cor-texto)' }}>
                        {removendoBg ? 'A remover fundo...' : 'Produto / Imagem'}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--cor-texto-fraco)' }}>
                        {removendoBg ? 'Remove.bg a trabalhar ✨' : 'Fundo removido automaticamente'}
                      </p>
                    </div>
                    <input type="file" accept="image/*" onChange={uploadProduto} className="hidden" disabled={removendoBg} />
                  </label>

                  {/* Upload logo */}
                  <label className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all w-full cursor-pointer"
                    style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', color: 'var(--cor-texto-muted)' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(251,191,36,0.15)' }}>
                      <Sparkles size={18} style={{ color: '#fbbf24' }} />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm" style={{ color: 'var(--cor-texto)' }}>Logo / Marca</p>
                      <p className="text-xs" style={{ color: 'var(--cor-texto-fraco)' }}>PNG com fundo transparente</p>
                    </div>
                    <input type="file" accept="image/png" onChange={async e => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      e.target.value = ''
                      const base64 = await new Promise<string>((resolve, reject) => {
                        const r = new FileReader()
                        r.onload = () => resolve(r.result as string)
                        r.onerror = reject
                        r.readAsDataURL(file)
                      })
                      const novoEl: Elemento = {
                        id: novoId(), tipo: 'imagem',
                        x: formato.largura * 0.05, y: formato.altura * 0.05,
                        largura: formato.largura * 0.25, altura: formato.largura * 0.12,
                        visivel: true, bloqueado: false, url: base64, opacidade: 1,
                      }
                      setElementos(prev => { const a = [...prev, novoEl]; guardarHistorico(a); return a })
                      setSelecionado(novoEl.id)
                    }} className="hidden" />
                  </label>
                </div>
              )}

              {/* ─ Painel Formato ─ */}
              {aba === 'formato' && (
                <div className="card flex flex-col gap-2">
                  <p className="text-sm font-semibold mb-1">Formato do Criativo</p>
                  {FORMATOS.map(f => (
                    <button key={f.id} onClick={() => setFormato(f)}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all w-full"
                      style={{
                        background: formato.id === f.id ? 'rgba(124,123,250,0.12)' : 'var(--cor-elevado)',
                        border: `1px solid ${formato.id === f.id ? 'rgba(124,123,250,0.35)' : 'var(--cor-borda)'}`,
                        cursor: 'pointer',
                      }}>
                      <span className="text-xl">{f.emoji}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{f.label}</p>
                        <p className="text-xs" style={{ color: 'var(--cor-texto-fraco)' }}>{f.largura}×{f.altura}px</p>
                      </div>
                      {formato.id === f.id && <span style={{ color: 'var(--cor-marca)' }}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Canvas Central ── */}
            <div className="flex flex-col items-center gap-4">
              <div
                ref={canvasWrapRef}
                className="relative select-none"
                style={{
                  width: canvasW,
                  height: canvasH,
                  borderRadius: 16,
                  overflow: 'hidden',
                  boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
                  cursor: 'default',
                  flexShrink: 0,
                }}
                onClick={() => setSelecionado(null)}>

                {/* Fundo */}
                {fundoUrl ? (
                  <img src={fundoUrl} alt="Fundo"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    crossOrigin="anonymous" />
                ) : (
                  <div className="absolute inset-0 pointer-events-none"
                    style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }} />
                )}

                {/* Overlay */}
                {fundoUrl && (
                  <div className="absolute inset-0 pointer-events-none"
                    style={{ background: `rgba(0,0,0,${overlayOpacity})` }} />
                )}

                {/* Elementos */}
                {elementos.filter(e => e.visivel).map(el => (
                  <div key={el.id}
                    onMouseDown={e => onMouseDownEl(e, el.id, 'move')}
                    onClick={e => { e.stopPropagation(); setSelecionado(el.id) }}
                    style={{
                      position: 'absolute',
                      left: el.x * escala,
                      top:  el.y * escala,
                      width: el.largura * escala,
                      height: el.tipo === 'texto' ? 'auto' : el.altura * escala,
                      cursor: el.bloqueado ? 'default' : 'move',
                      outline: selecionado === el.id ? '2px solid rgba(124,123,250,0.9)' : '2px solid transparent',
                      outlineOffset: 2,
                      borderRadius: el.tipo === 'imagem' ? 4 : 0,
                      zIndex: elementos.indexOf(el) + 1,
                      userSelect: 'none',
                    }}>

                    {el.tipo === 'texto' && (
                      <div
                        contentEditable={selecionado === el.id && !el.bloqueado}
                        suppressContentEditableWarning
                        onInput={e => atualizarEl(el.id, { texto: (e.target as HTMLDivElement).innerText })}
                        style={{
                          fontSize: (el.tamanho || 32) * escala,
                          color: el.cor || '#fff',
                          fontWeight: el.peso || 'bold',
                          fontStyle: el.estilo || 'normal',
                          textAlign: el.alinhamento || 'center',
                          fontFamily: el.fontFamily || 'Inter, sans-serif',
                          textShadow: el.sombra ? '0 2px 8px rgba(0,0,0,0.7)' : 'none',
                          lineHeight: 1.2,
                          wordBreak: 'break-word',
                          whiteSpace: 'pre-wrap',
                          outline: 'none',
                          padding: '2px 4px',
                          minWidth: 60,
                          width: '100%',
                          cursor: selecionado === el.id ? 'text' : 'move',
                        }}>
                        {el.texto}
                      </div>
                    )}

                    {el.tipo === 'imagem' && el.url && (
                      <img src={el.url} alt="Elemento"
                        style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: el.opacidade ?? 1, pointerEvents: 'none' }} />
                    )}

                    {/* Handle resize */}
                    {selecionado === el.id && !el.bloqueado && (
                      <div
                        onMouseDown={e => onMouseDownEl(e, el.id, 'resize-br')}
                        style={{
                          position: 'absolute', bottom: -5, right: -5,
                          width: 12, height: 12, borderRadius: '50%',
                          background: 'var(--cor-marca)', cursor: 'se-resize',
                          border: '2px solid white', zIndex: 10,
                        }} />
                    )}
                  </div>
                ))}

                {/* Hint quando vazio */}
                {elementos.length === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Adiciona elementos no painel esquerdo</p>
                  </div>
                )}
              </div>

              <p className="text-xs" style={{ color: 'var(--cor-texto-fraco)' }}>
                {formato.emoji} {formato.label} · {formato.largura}×{formato.altura}px · Clica nos elementos para editar · Arrasta para mover
              </p>
            </div>

            {/* ── Painel Direito — Propriedades ── */}
            <div className="flex flex-col gap-4">

              {/* Camadas */}
              <div className="card flex flex-col gap-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold">Camadas</p>
                  <span className="text-xs" style={{ color: 'var(--cor-texto-fraco)' }}>{elementos.length}</span>
                </div>
                {[...elementos].reverse().map((el, i) => (
                  <div key={el.id}
                    onClick={() => { setSelecionado(el.id) }}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-xl cursor-pointer transition-all"
                    style={{
                      background: selecionado === el.id ? 'rgba(124,123,250,0.12)' : 'var(--cor-elevado)',
                      border: `1px solid ${selecionado === el.id ? 'rgba(124,123,250,0.3)' : 'var(--cor-borda)'}`,
                    }}>
                    {el.tipo === 'texto' ? <Type size={12} style={{ color: 'var(--cor-marca)', flexShrink: 0 }} />
                      : <ImageIcon size={12} style={{ color: '#f472b6', flexShrink: 0 }} />}
                    <span className="text-xs flex-1 truncate" style={{ color: 'var(--cor-texto-muted)' }}>
                      {el.tipo === 'texto' ? (el.texto?.slice(0, 18) || 'Texto') : 'Imagem'}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <button onClick={e => { e.stopPropagation(); atualizarEl(el.id, { visivel: !el.visivel }) }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--cor-texto-fraco)' }}>
                        {el.visivel ? <Eye size={11} /> : <EyeOff size={11} />}
                      </button>
                      <button onClick={e => { e.stopPropagation(); atualizarEl(el.id, { bloqueado: !el.bloqueado }) }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--cor-texto-fraco)' }}>
                        {el.bloqueado ? <Lock size={11} /> : <Unlock size={11} />}
                      </button>
                      <button onClick={e => { e.stopPropagation(); moverCamada(el.id, 'up') }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--cor-texto-fraco)' }}>
                        <ChevronUp size={11} />
                      </button>
                      <button onClick={e => { e.stopPropagation(); moverCamada(el.id, 'down') }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--cor-texto-fraco)' }}>
                        <ChevronDown size={11} />
                      </button>
                      <button onClick={e => { e.stopPropagation(); removerEl(el.id) }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#f87171' }}>
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                ))}
                {elementos.length === 0 && (
                  <p className="text-xs text-center py-3" style={{ color: 'var(--cor-texto-fraco)' }}>Sem elementos</p>
                )}
              </div>

              {/* Propriedades do elemento selecionado */}
              {el && (
                <div className="card flex flex-col gap-3">
                  <p className="text-sm font-semibold">
                    {el.tipo === 'texto' ? '✏️ Texto' : '🖼️ Imagem'}
                  </p>

                  {/* Propriedades de TEXTO */}
                  {el.tipo === 'texto' && (
                    <>
                      {/* Texto editável */}
                      <textarea value={el.texto} rows={2}
                        onChange={e => atualizarEl(el.id, { texto: e.target.value })}
                        className="w-full text-sm px-3 py-2 rounded-xl resize-none"
                        style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', color: 'var(--cor-texto)', outline: 'none' }} />

                      {/* IA */}
                      <div className="flex gap-2">
                        <input value={promptIA} onChange={e => setPromptIA(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && gerarTexto()}
                          placeholder="Produto / nicho..."
                          className="flex-1 text-xs px-2.5 py-1.5 rounded-lg"
                          style={{ background: 'var(--cor-elevado)', border: '1px solid rgba(124,123,250,0.3)', color: 'var(--cor-texto)', outline: 'none' }} />
                        <button onClick={gerarTexto} disabled={gerando || !promptIA.trim()}
                          className="px-2.5 py-1.5 rounded-lg flex items-center gap-1 text-xs"
                          style={{ background: 'var(--cor-marca)', color: '#fff', border: 'none', cursor: 'pointer', opacity: gerando ? 0.7 : 1 }}>
                          {gerando ? <Loader size={12} className="animate-spin" /> : <Wand2 size={12} />}
                          IA
                        </button>
                      </div>

                      {/* Fonte */}
                      <select value={el.fontFamily}
                        onChange={e => atualizarEl(el.id, { fontFamily: e.target.value })}
                        className="w-full text-xs px-2.5 py-2 rounded-xl"
                        style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', color: 'var(--cor-texto)', outline: 'none' }}>
                        {FONTES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                      </select>

                      {/* Tamanho */}
                      <div>
                        <div className="flex justify-between mb-1">
                          <p className="text-xs" style={{ color: 'var(--cor-texto-muted)' }}>Tamanho</p>
                          <p className="text-xs" style={{ color: 'var(--cor-texto-fraco)' }}>{el.tamanho}px</p>
                        </div>
                        <input type="range" min={12} max={200} value={el.tamanho}
                          onChange={e => atualizarEl(el.id, { tamanho: parseInt(e.target.value) })}
                          className="w-full" style={{ accentColor: 'var(--cor-marca)' }} />
                      </div>

                      {/* Cor */}
                      <div>
                        <p className="text-xs mb-2" style={{ color: 'var(--cor-texto-muted)' }}>Cor</p>
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {CORES_RAPIDAS.map(cor => (
                            <button key={cor} onClick={() => atualizarEl(el.id, { cor })}
                              style={{ width: 20, height: 20, borderRadius: '50%', background: cor, cursor: 'pointer',
                                border: `2px solid ${el.cor === cor ? 'var(--cor-marca)' : 'rgba(255,255,255,0.1)'}` }} />
                          ))}
                          <input type="color" value={el.cor}
                            onChange={e => atualizarEl(el.id, { cor: e.target.value })}
                            style={{ width: 20, height: 20, borderRadius: '50%', cursor: 'pointer', border: 0, padding: 0, background: 'none' }} />
                        </div>
                      </div>

                      {/* Estilo */}
                      <div className="grid grid-cols-3 gap-1.5">
                        <button onClick={() => atualizarEl(el.id, { peso: el.peso === 'bold' ? 'normal' : 'bold' })}
                          className="py-1.5 rounded-lg text-xs flex items-center justify-center gap-1"
                          style={{ background: el.peso === 'bold' ? 'rgba(124,123,250,0.15)' : 'var(--cor-elevado)',
                            color: el.peso === 'bold' ? 'var(--cor-marca)' : 'var(--cor-texto-muted)',
                            border: `1px solid ${el.peso === 'bold' ? 'rgba(124,123,250,0.3)' : 'var(--cor-borda)'}`, cursor: 'pointer' }}>
                          <Bold size={12} />
                        </button>
                        <button onClick={() => atualizarEl(el.id, { estilo: el.estilo === 'italic' ? 'normal' : 'italic' })}
                          className="py-1.5 rounded-lg text-xs flex items-center justify-center gap-1"
                          style={{ background: el.estilo === 'italic' ? 'rgba(124,123,250,0.15)' : 'var(--cor-elevado)',
                            color: el.estilo === 'italic' ? 'var(--cor-marca)' : 'var(--cor-texto-muted)',
                            border: `1px solid ${el.estilo === 'italic' ? 'rgba(124,123,250,0.3)' : 'var(--cor-borda)'}`, cursor: 'pointer' }}>
                          <Italic size={12} />
                        </button>
                        <button onClick={() => atualizarEl(el.id, { sombra: !el.sombra })}
                          className="py-1.5 rounded-lg text-xs flex items-center justify-center gap-1"
                          style={{ background: el.sombra ? 'rgba(124,123,250,0.15)' : 'var(--cor-elevado)',
                            color: el.sombra ? 'var(--cor-marca)' : 'var(--cor-texto-muted)',
                            border: `1px solid ${el.sombra ? 'rgba(124,123,250,0.3)' : 'var(--cor-borda)'}`, cursor: 'pointer',
                            fontSize: 10 }}>
                          S
                        </button>
                      </div>

                      {/* Alinhamento */}
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: 'left',   icon: AlignLeft   },
                          { id: 'center', icon: AlignCenter },
                          { id: 'right',  icon: AlignRight  },
                        ].map(({ id, icon: Icon }) => (
                          <button key={id} onClick={() => atualizarEl(el.id, { alinhamento: id as any })}
                            className="py-1.5 rounded-lg flex items-center justify-center"
                            style={{ background: el.alinhamento === id ? 'rgba(124,123,250,0.15)' : 'var(--cor-elevado)',
                              color: el.alinhamento === id ? 'var(--cor-marca)' : 'var(--cor-texto-muted)',
                              border: `1px solid ${el.alinhamento === id ? 'rgba(124,123,250,0.3)' : 'var(--cor-borda)'}`, cursor: 'pointer' }}>
                            <Icon size={14} />
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Propriedades de IMAGEM */}
                  {el.tipo === 'imagem' && (
                    <>
                      <div>
                        <div className="flex justify-between mb-1">
                          <p className="text-xs" style={{ color: 'var(--cor-texto-muted)' }}>Opacidade</p>
                          <p className="text-xs" style={{ color: 'var(--cor-texto-fraco)' }}>{Math.round((el.opacidade ?? 1) * 100)}%</p>
                        </div>
                        <input type="range" min={0.1} max={1} step={0.05} value={el.opacidade ?? 1}
                          onChange={e => atualizarEl(el.id, { opacidade: parseFloat(e.target.value) })}
                          className="w-full" style={{ accentColor: 'var(--cor-marca)' }} />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="mb-1" style={{ color: 'var(--cor-texto-muted)' }}>Largura</p>
                          <input type="number" value={Math.round(el.largura)}
                            onChange={e => atualizarEl(el.id, { largura: parseInt(e.target.value) || el.largura })}
                            className="w-full px-2 py-1.5 rounded-lg"
                            style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', color: 'var(--cor-texto)', outline: 'none' }} />
                        </div>
                        <div>
                          <p className="mb-1" style={{ color: 'var(--cor-texto-muted)' }}>Altura</p>
                          <input type="number" value={Math.round(el.altura)}
                            onChange={e => atualizarEl(el.id, { altura: parseInt(e.target.value) || el.altura })}
                            className="w-full px-2 py-1.5 rounded-lg"
                            style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', color: 'var(--cor-texto)', outline: 'none' }} />
                        </div>
                      </div>
                    </>
                  )}

                  <button onClick={() => removerEl(el.id)}
                    className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs mt-1"
                    style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)', cursor: 'pointer' }}>
                    <Trash2 size={12} /> Remover elemento
                  </button>
                </div>
              )}

              {!el && (
                <div className="card flex flex-col items-center justify-center py-8 gap-2"
                  style={{ border: '1px dashed var(--cor-borda)' }}>
                  <Move size={24} style={{ color: 'var(--cor-texto-fraco)' }} />
                  <p className="text-xs text-center" style={{ color: 'var(--cor-texto-fraco)' }}>
                    Clica num elemento<br />para editar as propriedades
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
