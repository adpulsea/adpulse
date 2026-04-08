// ============================================
// AdPulse — Editor de Criativos com Slides
// ============================================

import Head from 'next/head'
import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Download, RotateCcw, Plus, Trash2, Bold, Italic,
  AlignLeft, AlignCenter, AlignRight, Wand2,
  Loader, Image as ImageIcon, Type, ChevronUp,
  ChevronDown, Eye, EyeOff, Lock, Unlock, Sparkles,
  Move, CornerUpLeft, Copy, Archive
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
  x: number
  y: number
  largura: number
  altura: number
  visivel: boolean
  bloqueado: boolean
  texto?: string
  tamanho?: number
  cor?: string
  peso?: 'normal' | 'bold'
  estilo?: 'normal' | 'italic'
  alinhamento?: 'left' | 'center' | 'right'
  fontFamily?: string
  sombra?: boolean
  url?: string
  opacidade?: number
}

type Slide = {
  id: string
  fundoUrl: string | null
  overlayOpacity: number
  elementos: Elemento[]
}

type Fundo = { id: string; nome: string; url: string; tipo: string }
type Formato = { id: string; label: string; emoji: string; largura: number; altura: number }

// ─── Constantes ──────────────────────────────────────────────────────────────

const FORMATOS: Formato[] = [
  { id: 'feed',      label: 'Feed Quadrado',   emoji: '⬛', largura: 1080, altura: 1080 },
  { id: 'stories',   label: 'Stories / Reels', emoji: '📱', largura: 1080, altura: 1920 },
  { id: 'landscape', label: 'YouTube',         emoji: '🖥️', largura: 1920, altura: 1080 },
  { id: 'portrait',  label: 'Retrato',         emoji: '📷', largura: 1080, altura: 1350 },
  { id: 'linkedin',  label: 'LinkedIn',        emoji: '💼', largura: 1200, altura: 627  },
]

const FUNDOS_PREDEFINIDOS: Fundo[] = [
  { id: 'pre-1', nome: 'Gradiente Roxo', url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800&q=80', tipo: 'predefinido' },
  { id: 'pre-2', nome: 'Gradiente Rosa', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80', tipo: 'predefinido' },
  { id: 'pre-3', nome: 'Gradiente Azul', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', tipo: 'predefinido' },
  { id: 'pre-4', nome: 'Cidade Noturna', url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80', tipo: 'predefinido' },
  { id: 'pre-5', nome: 'Natureza',       url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80', tipo: 'predefinido' },
  { id: 'pre-6', nome: 'Tecnologia',     url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80', tipo: 'predefinido' },
  { id: 'pre-7', nome: 'Abstrato',       url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&q=80', tipo: 'predefinido' },
  { id: 'pre-8', nome: 'Café',           url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80', tipo: 'predefinido' },
]

const FONTES = [
  { label: 'Inter',      value: 'Inter, sans-serif'       },
  { label: 'Playfair',   value: 'Playfair Display, serif' },
  { label: 'Montserrat', value: 'Montserrat, sans-serif'  },
  { label: 'Oswald',     value: 'Oswald, sans-serif'      },
  { label: 'Raleway',    value: 'Raleway, sans-serif'     },
  { label: 'Bebas Neue', value: 'Bebas Neue, cursive'     },
]

const CORES = ['#ffffff', '#000000', '#7c7bfa', '#f472b6', '#fbbf24', '#34d399', '#f87171', '#60a5fa']

// ─── Utils ────────────────────────────────────────────────────────────────────

const novoId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`

const novoTexto = (fmt: Formato, texto = 'O teu texto aqui'): Elemento => ({
  id: novoId(), tipo: 'texto',
  x: fmt.largura * 0.1, y: fmt.altura * 0.72,
  largura: fmt.largura * 0.8, altura: 80,
  visivel: true, bloqueado: false,
  texto, tamanho: 64, cor: '#ffffff',
  peso: 'bold', estilo: 'normal', alinhamento: 'center',
  fontFamily: 'Inter, sans-serif', sombra: true,
})

const novoSlide = (fmt: Formato, n: number): Slide => {
  const h = novoTexto(fmt, `Slide ${n}`)
  h.y = fmt.altura * 0.72
  const cta = { ...novoTexto(fmt, 'Subtítulo aqui'), tamanho: 36, y: fmt.altura * 0.84, cor: '#fbbf24', id: novoId() }
  return { id: novoId(), fundoUrl: null, overlayOpacity: 0.35, elementos: [h, cta] }
}

// ─── Mini preview de slide ────────────────────────────────────────────────────

function MiniSlide({ slide, formato, ativo, onClick, numero }: {
  slide: Slide; formato: Formato; ativo: boolean; onClick: () => void; numero: number
}) {
  const W = 90
  const H = Math.round(W * formato.altura / formato.largura)
  const escala = W / formato.largura

  return (
    <div onClick={onClick} className="flex flex-col items-center gap-1 cursor-pointer flex-shrink-0">
      <div style={{
        width: W, height: H, borderRadius: 8, overflow: 'hidden', position: 'relative',
        border: `2px solid ${ativo ? 'var(--cor-marca)' : 'rgba(255,255,255,0.1)'}`,
        flexShrink: 0,
      }}>
        {slide.fundoUrl
          ? <img src={slide.fundoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#0f0c29,#302b63)' }} />
        }
        {slide.fundoUrl && (
          <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${slide.overlayOpacity})` }} />
        )}
        {slide.elementos.filter(e => e.visivel && e.tipo === 'texto').map(el => (
          <div key={el.id} style={{
            position: 'absolute',
            left: el.x * escala, top: el.y * escala,
            width: el.largura * escala,
            fontSize: (el.tamanho || 32) * escala,
            color: el.cor, fontWeight: el.peso, fontStyle: el.estilo,
            textAlign: el.alinhamento as any,
            fontFamily: el.fontFamily,
            textShadow: el.sombra ? '0 1px 3px rgba(0,0,0,0.8)' : 'none',
            lineHeight: 1.2, wordBreak: 'break-word', whiteSpace: 'pre-wrap',
            pointerEvents: 'none',
          }}>{el.texto}</div>
        ))}
        {slide.elementos.filter(e => e.visivel && e.tipo === 'imagem' && e.url).map(el => (
          <img key={el.id} src={el.url} style={{
            position: 'absolute',
            left: el.x * escala, top: el.y * escala,
            width: el.largura * escala, height: el.altura * escala,
            objectFit: 'contain', opacity: el.opacidade ?? 1, pointerEvents: 'none',
          }} />
        ))}
      </div>
      <span style={{ fontSize: 10, color: ativo ? 'var(--cor-marca)' : 'var(--cor-texto-fraco)' }}>{numero}</span>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function EditorCriativos() {
  const { utilizador } = useAuth()
  const [formato, setFormato] = useState<Formato>(FORMATOS[0])
  const [slides, setSlides] = useState<Slide[]>([])
  const [slideIdx, setSlideIdx] = useState(0)
  const [selecionado, setSelecionado] = useState<string | null>(null)
  const [aba, setAba] = useState<'fundo' | 'adicionar' | 'formato'>('fundo')
  const [fundosSaved, setFundosSaved] = useState<Fundo[]>([])
  const [removendoBg, setRemovendoBg] = useState(false)
  const [promptIA, setPromptIA] = useState('')
  const [gerando, setGerando] = useState(false)
  const [exportando, setExportando] = useState(false)
  const [podeDesfazer, setPodeDesfazer] = useState(false)
  const historicoRef = useRef<Slide[][]>([[]])
  const dragRef = useRef<{ elId: string; startMouseX: number; startMouseY: number; startElX: number; startElY: number; handle: 'move' | 'resize-br' } | null>(null)

  // Slide atual
  const slide = slides[slideIdx]

  // Escala dinâmica
  const MAX_W = 400
  const MAX_H = 560
  const escala = Math.min(MAX_W / formato.largura, MAX_H / formato.altura)
  const canvasW = Math.round(formato.largura * escala)
  const canvasH = Math.round(formato.altura * escala)

  // Init
  useEffect(() => {
    const s1 = novoSlide(formato, 1)
    setSlides([s1])
    setSelecionado(s1.elementos[0].id)
  }, [])

  useEffect(() => {
    if (!utilizador) return
    supabase.from('fundos').select('*').eq('utilizador_id', utilizador.id)
      .then(({ data }) => setFundosSaved(data || []))
  }, [utilizador])

  // ── Helpers slides ──
  const atualizarSlide = useCallback((idx: number, campos: Partial<Slide>) => {
    setSlides(prev => {
      const novo = prev.map((s, i) => i === idx ? { ...s, ...campos } : s)
      historicoRef.current = [...historicoRef.current.slice(-20), [...novo]]
      setPodeDesfazer(historicoRef.current.length > 1)
      return novo
    })
  }, [])

  const atualizarElementos = useCallback((idx: number, els: Elemento[]) => {
    atualizarSlide(idx, { elementos: els })
  }, [atualizarSlide])

  const atualizarEl = (campo: Partial<Elemento>) => {
    if (!slide || !selecionado) return
    atualizarElementos(slideIdx, slide.elementos.map(e => e.id === selecionado ? { ...e, ...campo } : e))
  }

  const el = slide?.elementos.find(e => e.id === selecionado)

  // ── Slides ──
  const adicionarSlide = () => {
    const novo = novoSlide(formato, slides.length + 1)
    // Copiar fundo do slide atual
    if (slide) { novo.fundoUrl = slide.fundoUrl; novo.overlayOpacity = slide.overlayOpacity }
    setSlides(prev => [...prev, novo])
    setSlideIdx(slides.length)
    setSelecionado(novo.elementos[0].id)
  }

  const duplicarSlide = () => {
    if (!slide) return
    const copia: Slide = {
      ...slide,
      id: novoId(),
      elementos: slide.elementos.map(e => ({ ...e, id: novoId() })),
    }
    const novoSlides = [...slides.slice(0, slideIdx + 1), copia, ...slides.slice(slideIdx + 1)]
    setSlides(novoSlides)
    setSlideIdx(slideIdx + 1)
    setSelecionado(copia.elementos[0]?.id || null)
  }

  const removerSlide = (idx: number) => {
    if (slides.length <= 1) return
    const novo = slides.filter((_, i) => i !== idx)
    setSlides(novo)
    setSlideIdx(Math.min(idx, novo.length - 1))
    setSelecionado(null)
  }

  // ── Elementos ──
  const adicionarTexto = () => {
    if (!slide) return
    const novo = novoTexto(formato)
    novo.y = Math.random() * (formato.altura * 0.5) + formato.altura * 0.1
    atualizarElementos(slideIdx, [...slide.elementos, novo])
    setSelecionado(novo.id)
  }

  const removerEl = (id: string) => {
    if (!slide) return
    atualizarElementos(slideIdx, slide.elementos.filter(e => e.id !== id))
    if (selecionado === id) setSelecionado(null)
  }

  const moverCamada = (id: string, dir: 'up' | 'down') => {
    if (!slide) return
    const idx2 = slide.elementos.findIndex(e => e.id === id)
    if (idx2 === -1) return
    const novo = [...slide.elementos]
    if (dir === 'up' && idx2 < novo.length - 1) [novo[idx2], novo[idx2 + 1]] = [novo[idx2 + 1], novo[idx2]]
    else if (dir === 'down' && idx2 > 0) [novo[idx2], novo[idx2 - 1]] = [novo[idx2 - 1], novo[idx2]]
    atualizarElementos(slideIdx, novo)
  }

  // ── Drag ──
  const onMouseDownEl = (e: React.MouseEvent, elId: string, handle: 'move' | 'resize-br' = 'move') => {
    e.stopPropagation(); e.preventDefault()
    const el = slide?.elementos.find(x => x.id === elId)
    if (!el || el.bloqueado) return
    setSelecionado(elId)
    dragRef.current = { elId, startMouseX: e.clientX, startMouseY: e.clientY, startElX: el.x, startElY: el.y, handle }
  }

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current || !slide) return
      const { elId, startMouseX, startMouseY, startElX, startElY, handle } = dragRef.current
      const dx = (e.clientX - startMouseX) / escala
      const dy = (e.clientY - startMouseY) / escala
      atualizarElementos(slideIdx, slide.elementos.map(el => {
        if (el.id !== elId) return el
        if (handle === 'move') return { ...el, x: Math.max(0, Math.min(formato.largura - el.largura, startElX + dx)), y: Math.max(0, Math.min(formato.altura - 20, startElY + dy)) }
        return { ...el, largura: Math.max(80, el.largura + dx), altura: Math.max(40, el.altura + dy) }
      }))
    }
    const onUp = () => { dragRef.current = null }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [slide, slideIdx, escala, formato, atualizarElementos])

  // ── Desfazer ──
  const desfazer = () => {
    if (historicoRef.current.length <= 1) return
    historicoRef.current.pop()
    setSlides([...historicoRef.current[historicoRef.current.length - 1]])
    setPodeDesfazer(historicoRef.current.length > 1)
  }

  // ── Upload produto ──
  const uploadProduto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !slide) return
    e.target.value = ''
    setRemovendoBg(true)
    const base64 = await new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(file) })
    try {
      const resp = await fetch('/api/ia/remove-bg', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageBase64: base64 }) })
      const data = await resp.json()
      const url = data.resultado || base64
      const novoEl: Elemento = { id: novoId(), tipo: 'imagem', x: formato.largura * 0.2, y: formato.altura * 0.1, largura: formato.largura * 0.6, altura: formato.altura * 0.55, visivel: true, bloqueado: false, url, opacidade: 1 }
      atualizarElementos(slideIdx, [...slide.elementos, novoEl])
      setSelecionado(novoEl.id)
    } catch {
      const novoEl: Elemento = { id: novoId(), tipo: 'imagem', x: formato.largura * 0.2, y: formato.altura * 0.1, largura: formato.largura * 0.6, altura: formato.altura * 0.55, visivel: true, bloqueado: false, url: base64, opacidade: 1 }
      atualizarElementos(slideIdx, [...slide.elementos, novoEl])
      setSelecionado(novoEl.id)
    }
    setRemovendoBg(false)
  }

  // ── Gerar IA ──
  const gerarTexto = async () => {
    if (!promptIA.trim() || !el || el.tipo !== 'texto') return
    setGerando(true)
    try {
      const resp = await fetch('/api/ia/gerar-conteudo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: `Gera um texto curto e impactante para um criativo de anúncio sobre: "${promptIA}". Máximo 6 palavras. Sem aspas. Sem pontos finais.` }) })
      const data = await resp.json()
      if (data?.conteudo) atualizarEl({ texto: data.conteudo.trim() })
    } catch {}
    setGerando(false)
  }

  // ── Renderizar um slide para canvas ──
  const renderizarSlide = (s: Slide): Promise<string> => {
    return new Promise(resolve => {
      const canvas = document.createElement('canvas')
      canvas.width = formato.largura; canvas.height = formato.altura
      const ctx = canvas.getContext('2d')!

      const desenhar = (fundoImg: HTMLImageElement | null) => {
        if (fundoImg) {
          const r = fundoImg.width / fundoImg.height, cr = formato.largura / formato.altura
          let sx = 0, sy = 0, sw = fundoImg.width, sh = fundoImg.height
          if (r > cr) { sw = fundoImg.height * cr; sx = (fundoImg.width - sw) / 2 }
          else { sh = fundoImg.width / cr; sy = (fundoImg.height - sh) / 2 }
          ctx.drawImage(fundoImg, sx, sy, sw, sh, 0, 0, formato.largura, formato.altura)
          ctx.fillStyle = `rgba(0,0,0,${s.overlayOpacity})`
          ctx.fillRect(0, 0, formato.largura, formato.altura)
        } else {
          const grad = ctx.createLinearGradient(0, 0, formato.largura, formato.altura)
          grad.addColorStop(0, '#0f0c29'); grad.addColorStop(1, '#302b63')
          ctx.fillStyle = grad; ctx.fillRect(0, 0, formato.largura, formato.altura)
        }

        const promessas = s.elementos.filter(e => e.visivel).map(el => new Promise<void>(res2 => {
          if (el.tipo === 'texto') {
            ctx.save()
            if (el.sombra) { ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 12 }
            ctx.font = `${el.estilo} ${el.peso} ${el.tamanho}px ${el.fontFamily || 'Inter'}`
            ctx.fillStyle = el.cor || '#fff'; ctx.textAlign = el.alinhamento as CanvasTextAlign; ctx.textBaseline = 'top'
            const tx = el.alinhamento === 'center' ? el.x + el.largura / 2 : el.alinhamento === 'right' ? el.x + el.largura : el.x
            const palavras = (el.texto || '').split(' ')
            let linha = '', offsetY = 0
            const lineH = (el.tamanho || 32) * 1.25
            for (const p of palavras) {
              const t = linha ? linha + ' ' + p : p
              if (ctx.measureText(t).width > el.largura && linha) { ctx.fillText(linha, tx, el.y + offsetY); linha = p; offsetY += lineH } else linha = t
            }
            ctx.fillText(linha, tx, el.y + offsetY)
            ctx.restore(); res2()
          } else if (el.url) {
            const img = new Image(); img.crossOrigin = 'anonymous'
            img.onload = () => { ctx.save(); ctx.globalAlpha = el.opacidade ?? 1; ctx.drawImage(img, el.x, el.y, el.largura, el.altura); ctx.restore(); res2() }
            img.onerror = () => res2(); img.src = el.url
          } else res2()
        }))

        Promise.all(promessas).then(() => resolve(canvas.toDataURL('image/png', 1)))
      }

      if (s.fundoUrl) {
        const img = new Image(); img.crossOrigin = 'anonymous'
        img.onload = () => desenhar(img); img.onerror = () => desenhar(null); img.src = s.fundoUrl
      } else desenhar(null)
    })
  }

  // ── Exportar todos os slides ──
  const exportarTodos = async () => {
    setExportando(true)
    for (let i = 0; i < slides.length; i++) {
      const dataUrl = await renderizarSlide(slides[i])
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `adpulse-slide-${i + 1}.png`
      link.click()
      await new Promise(r => setTimeout(r, 300))
    }
    setExportando(false)
  }

  const exportarAtual = async () => {
    if (!slide) return
    const dataUrl = await renderizarSlide(slide)
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `adpulse-slide-${slideIdx + 1}.png`
    link.click()
  }

  if (!slide) return null

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <Head>
        <title>Editor de Criativos — AdPulse</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Oswald:wght@600&family=Raleway:wght@400;700&family=Bebas+Neue&family=Montserrat:wght@400;700&display=swap" rel="stylesheet" />
      </Head>
      <LayoutPainel titulo="Editor de Criativos">
        <div className="max-w-7xl mx-auto flex flex-col gap-4">

          {/* Topbar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <button onClick={desfazer} disabled={!podeDesfazer}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm"
                style={{ background: 'var(--cor-elevado)', color: 'var(--cor-texto-muted)', border: '1px solid var(--cor-borda)', opacity: podeDesfazer ? 1 : 0.4, cursor: podeDesfazer ? 'pointer' : 'default' }}>
                <CornerUpLeft size={14} /> Desfazer
              </button>
              <select value={formato.id} onChange={e => setFormato(FORMATOS.find(f => f.id === e.target.value)!)}
                className="px-3 py-2 rounded-xl text-sm"
                style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', color: 'var(--cor-texto)', outline: 'none', cursor: 'pointer' }}>
                {FORMATOS.map(f => <option key={f.id} value={f.id}>{f.emoji} {f.label}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={exportarAtual}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm"
                style={{ background: 'var(--cor-elevado)', color: 'var(--cor-texto-muted)', border: '1px solid var(--cor-borda)', cursor: 'pointer' }}>
                <Download size={14} /> Este slide
              </button>
              <button onClick={exportarTodos} disabled={exportando} className="btn-primario">
                {exportando ? <><Loader size={15} className="animate-spin" /> A exportar...</> : <><Archive size={15} /> Exportar todos ({slides.length})</>}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_240px] gap-4">

            {/* ── Painel Esquerdo ── */}
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-3 rounded-xl overflow-hidden" style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)' }}>
                {[
                  { id: 'fundo',    label: 'Fundo',    icon: ImageIcon },
                  { id: 'adicionar', label: 'Adicionar', icon: Plus     },
                  { id: 'formato',  label: 'Formato',  icon: Type      },
                ].map(tab => (
                  <button key={tab.id} onClick={() => setAba(tab.id as any)}
                    className="flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-all"
                    style={{ background: aba === tab.id ? 'var(--cor-marca)' : 'transparent', color: aba === tab.id ? '#fff' : 'var(--cor-texto-muted)', border: 'none', cursor: 'pointer' }}>
                    <tab.icon size={15} /> {tab.label}
                  </button>
                ))}
              </div>

              {/* Fundo */}
              {aba === 'fundo' && (
                <div className="card flex flex-col gap-3">
                  <p className="text-sm font-semibold">Fundo do slide {slideIdx + 1}</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div onClick={() => atualizarSlide(slideIdx, { fundoUrl: null })}
                      className="aspect-square rounded-xl cursor-pointer flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg,#0f0c29,#302b63)', border: `2px solid ${!slide.fundoUrl ? 'var(--cor-marca)' : 'transparent'}` }}>
                      {!slide.fundoUrl && <span style={{ color: 'var(--cor-marca)' }}>✓</span>}
                    </div>
                    {[...FUNDOS_PREDEFINIDOS, ...fundosSaved.filter(f => f.tipo === 'personalizado')].map(f => (
                      <div key={f.id} onClick={() => atualizarSlide(slideIdx, { fundoUrl: f.url })}
                        className="relative aspect-square rounded-xl cursor-pointer overflow-hidden"
                        style={{ border: `2px solid ${slide.fundoUrl === f.url ? 'var(--cor-marca)' : 'transparent'}` }}>
                        <img src={f.url} className="w-full h-full object-cover" loading="lazy" />
                        {slide.fundoUrl === f.url && <div className="absolute inset-0 flex items-center justify-center text-lg" style={{ background: 'rgba(124,123,250,0.35)' }}>✓</div>}
                      </div>
                    ))}
                  </div>
                  <Link href="/painel/fundos" className="text-xs text-center py-2 rounded-xl"
                    style={{ background: 'rgba(124,123,250,0.08)', color: 'var(--cor-marca)', border: '1px dashed rgba(124,123,250,0.3)' }}>
                    + Gerir biblioteca
                  </Link>
                  <div>
                    <div className="flex justify-between mb-1">
                      <p className="text-xs" style={{ color: 'var(--cor-texto-muted)' }}>Escurecimento</p>
                      <p className="text-xs" style={{ color: 'var(--cor-texto-fraco)' }}>{Math.round(slide.overlayOpacity * 100)}%</p>
                    </div>
                    <input type="range" min={0} max={0.9} step={0.05} value={slide.overlayOpacity}
                      onChange={e => atualizarSlide(slideIdx, { overlayOpacity: parseFloat(e.target.value) })}
                      className="w-full" style={{ accentColor: 'var(--cor-marca)' }} />
                  </div>
                </div>
              )}

              {/* Adicionar */}
              {aba === 'adicionar' && (
                <div className="card flex flex-col gap-3">
                  <p className="text-sm font-semibold">Adicionar ao slide {slideIdx + 1}</p>
                  <button onClick={adicionarTexto}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl w-full"
                    style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', cursor: 'pointer' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(124,123,250,0.15)' }}>
                      <Type size={18} style={{ color: 'var(--cor-marca)' }} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium" style={{ color: 'var(--cor-texto)' }}>Texto</p>
                      <p className="text-xs" style={{ color: 'var(--cor-texto-fraco)' }}>Clica para arrastar</p>
                    </div>
                  </button>
                  <label className="flex items-center gap-3 px-4 py-3 rounded-xl w-full cursor-pointer"
                    style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(244,114,182,0.15)' }}>
                      {removendoBg ? <Loader size={18} className="animate-spin" style={{ color: '#f472b6' }} /> : <ImageIcon size={18} style={{ color: '#f472b6' }} />}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium" style={{ color: 'var(--cor-texto)' }}>{removendoBg ? 'A remover fundo...' : 'Produto'}</p>
                      <p className="text-xs" style={{ color: 'var(--cor-texto-fraco)' }}>Fundo removido automaticamente</p>
                    </div>
                    <input type="file" accept="image/*" onChange={uploadProduto} className="hidden" disabled={removendoBg} />
                  </label>
                  <label className="flex items-center gap-3 px-4 py-3 rounded-xl w-full cursor-pointer"
                    style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(251,191,36,0.15)' }}>
                      <Sparkles size={18} style={{ color: '#fbbf24' }} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium" style={{ color: 'var(--cor-texto)' }}>Logo</p>
                      <p className="text-xs" style={{ color: 'var(--cor-texto-fraco)' }}>PNG transparente</p>
                    </div>
                    <input type="file" accept="image/png" onChange={async e => {
                      const file = e.target.files?.[0]; if (!file || !slide) return; e.target.value = ''
                      const base64 = await new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(file) })
                      const novoEl: Elemento = { id: novoId(), tipo: 'imagem', x: formato.largura * 0.05, y: formato.altura * 0.05, largura: formato.largura * 0.25, altura: formato.largura * 0.12, visivel: true, bloqueado: false, url: base64, opacidade: 1 }
                      atualizarElementos(slideIdx, [...slide.elementos, novoEl]); setSelecionado(novoEl.id)
                    }} className="hidden" />
                  </label>
                </div>
              )}

              {/* Formato */}
              {aba === 'formato' && (
                <div className="card flex flex-col gap-2">
                  <p className="text-sm font-semibold mb-1">Formato</p>
                  {FORMATOS.map(f => (
                    <button key={f.id} onClick={() => setFormato(f)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left w-full"
                      style={{ background: formato.id === f.id ? 'rgba(124,123,250,0.12)' : 'var(--cor-elevado)', border: `1px solid ${formato.id === f.id ? 'rgba(124,123,250,0.35)' : 'var(--cor-borda)'}`, cursor: 'pointer' }}>
                      <span className="text-lg">{f.emoji}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{f.label}</p>
                        <p className="text-xs" style={{ color: 'var(--cor-texto-fraco)' }}>{f.largura}×{f.altura}</p>
                      </div>
                      {formato.id === f.id && <span style={{ color: 'var(--cor-marca)' }}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Canvas Central + Slides ── */}
            <div className="flex flex-col items-center gap-4">

              {/* Canvas */}
              <div style={{ width: canvasW, height: canvasH, borderRadius: 16, overflow: 'hidden', position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.6)', flexShrink: 0 }}
                onClick={() => setSelecionado(null)}>
                {slide.fundoUrl
                  ? <img src={slide.fundoUrl} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} crossOrigin="anonymous" />
                  : <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#0f0c29 0%,#302b63 50%,#24243e 100%)' }} />}
                {slide.fundoUrl && <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${slide.overlayOpacity})`, pointerEvents: 'none' }} />}

                {slide.elementos.filter(e => e.visivel).map(el => (
                  <div key={el.id}
                    onMouseDown={ev => onMouseDownEl(ev, el.id, 'move')}
                    onClick={ev => { ev.stopPropagation(); setSelecionado(el.id) }}
                    style={{
                      position: 'absolute',
                      left: el.x * escala, top: el.y * escala,
                      width: el.largura * escala,
                      height: el.tipo === 'texto' ? 'auto' : el.altura * escala,
                      cursor: el.bloqueado ? 'default' : 'move',
                      outline: selecionado === el.id ? '2px solid rgba(124,123,250,0.9)' : '2px solid transparent',
                      outlineOffset: 2, borderRadius: el.tipo === 'imagem' ? 4 : 0,
                      zIndex: slide.elementos.indexOf(el) + 1,
                    }}>
                    {el.tipo === 'texto' && (
                      <div contentEditable={selecionado === el.id && !el.bloqueado}
                        suppressContentEditableWarning
                        onInput={ev => atualizarEl({ texto: (ev.target as HTMLDivElement).innerText })}
                        style={{
                          fontSize: (el.tamanho || 32) * escala, color: el.cor, fontWeight: el.peso,
                          fontStyle: el.estilo, textAlign: el.alinhamento as any, fontFamily: el.fontFamily,
                          textShadow: el.sombra ? '0 2px 8px rgba(0,0,0,0.7)' : 'none',
                          lineHeight: 1.2, wordBreak: 'break-word', whiteSpace: 'pre-wrap',
                          outline: 'none', padding: '2px 4px', width: '100%',
                          cursor: selecionado === el.id ? 'text' : 'move',
                        }}>{el.texto}</div>
                    )}
                    {el.tipo === 'imagem' && el.url && (
                      <img src={el.url} style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: el.opacidade ?? 1, pointerEvents: 'none' }} />
                    )}
                    {selecionado === el.id && !el.bloqueado && (
                      <div onMouseDown={ev => onMouseDownEl(ev, el.id, 'resize-br')}
                        style={{ position: 'absolute', bottom: -5, right: -5, width: 12, height: 12, borderRadius: '50%', background: 'var(--cor-marca)', cursor: 'se-resize', border: '2px solid white', zIndex: 10 }} />
                    )}
                  </div>
                ))}
              </div>

              {/* Faixa de slides */}
              <div className="flex flex-col gap-3 w-full" style={{ maxWidth: canvasW }}>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium" style={{ color: 'var(--cor-texto-muted)' }}>
                    Slides do carrossel — {slides.length} slide{slides.length !== 1 ? 's' : ''}
                  </p>
                  <div className="flex gap-2">
                    <button onClick={duplicarSlide}
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                      style={{ background: 'var(--cor-elevado)', color: 'var(--cor-texto-muted)', border: '1px solid var(--cor-borda)', cursor: 'pointer' }}>
                      <Copy size={11} /> Duplicar
                    </button>
                    <button onClick={adicionarSlide}
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                      style={{ background: 'rgba(124,123,250,0.15)', color: 'var(--cor-marca)', border: '1px solid rgba(124,123,250,0.3)', cursor: 'pointer' }}>
                      <Plus size={11} /> Novo slide
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
                  {slides.map((s, i) => (
                    <div key={s.id} className="relative flex-shrink-0 group">
                      <MiniSlide slide={s} formato={formato} ativo={i === slideIdx} onClick={() => { setSlideIdx(i); setSelecionado(null) }} numero={i + 1} />
                      {slides.length > 1 && (
                        <button onClick={() => removerSlide(i)}
                          className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: '#f87171', border: 'none', cursor: 'pointer', color: '#fff' }}>
                          <Trash2 size={8} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Painel Direito — Propriedades ── */}
            <div className="flex flex-col gap-3">
              <div className="card flex flex-col gap-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold">Camadas</p>
                  <span className="text-xs" style={{ color: 'var(--cor-texto-fraco)' }}>Slide {slideIdx + 1}</span>
                </div>
                {[...slide.elementos].reverse().map(el => (
                  <div key={el.id} onClick={() => setSelecionado(el.id)}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-xl cursor-pointer"
                    style={{ background: selecionado === el.id ? 'rgba(124,123,250,0.12)' : 'var(--cor-elevado)', border: `1px solid ${selecionado === el.id ? 'rgba(124,123,250,0.3)' : 'var(--cor-borda)'}` }}>
                    {el.tipo === 'texto' ? <Type size={11} style={{ color: 'var(--cor-marca)', flexShrink: 0 }} /> : <ImageIcon size={11} style={{ color: '#f472b6', flexShrink: 0 }} />}
                    <span className="text-xs flex-1 truncate" style={{ color: 'var(--cor-texto-muted)' }}>{el.tipo === 'texto' ? (el.texto?.slice(0, 16) || 'Texto') : 'Imagem'}</span>
                    <div className="flex items-center gap-0.5">
                      <button onClick={ev => { ev.stopPropagation(); atualizarEl({ ...el, visivel: !el.visivel }); atualizarElementos(slideIdx, slide.elementos.map(e => e.id === el.id ? { ...e, visivel: !e.visivel } : e)) }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--cor-texto-fraco)' }}>{el.visivel ? <Eye size={10} /> : <EyeOff size={10} />}</button>
                      <button onClick={ev => { ev.stopPropagation(); atualizarElementos(slideIdx, slide.elementos.map(e => e.id === el.id ? { ...e, bloqueado: !e.bloqueado } : e)) }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--cor-texto-fraco)' }}>{el.bloqueado ? <Lock size={10} /> : <Unlock size={10} />}</button>
                      <button onClick={ev => { ev.stopPropagation(); moverCamada(el.id, 'up') }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--cor-texto-fraco)' }}><ChevronUp size={10} /></button>
                      <button onClick={ev => { ev.stopPropagation(); moverCamada(el.id, 'down') }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--cor-texto-fraco)' }}><ChevronDown size={10} /></button>
                      <button onClick={ev => { ev.stopPropagation(); removerEl(el.id) }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#f87171' }}><Trash2 size={10} /></button>
                    </div>
                  </div>
                ))}
                {slide.elementos.length === 0 && <p className="text-xs text-center py-2" style={{ color: 'var(--cor-texto-fraco)' }}>Sem elementos</p>}
              </div>

              {/* Propriedades */}
              {el && (
                <div className="card flex flex-col gap-3">
                  <p className="text-sm font-semibold">{el.tipo === 'texto' ? '✏️ Texto' : '🖼️ Imagem'}</p>

                  {el.tipo === 'texto' && (
                    <>
                      <textarea value={el.texto} rows={2} onChange={e => atualizarEl({ texto: e.target.value })}
                        className="w-full text-sm px-3 py-2 rounded-xl resize-none"
                        style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', color: 'var(--cor-texto)', outline: 'none' }} />
                      <div className="flex gap-2">
                        <input value={promptIA} onChange={e => setPromptIA(e.target.value)} onKeyDown={e => e.key === 'Enter' && gerarTexto()}
                          placeholder="Produto / nicho..."
                          className="flex-1 text-xs px-2.5 py-1.5 rounded-lg"
                          style={{ background: 'var(--cor-elevado)', border: '1px solid rgba(124,123,250,0.3)', color: 'var(--cor-texto)', outline: 'none' }} />
                        <button onClick={gerarTexto} disabled={gerando || !promptIA.trim()}
                          className="px-2.5 py-1.5 rounded-lg flex items-center gap-1 text-xs"
                          style={{ background: 'var(--cor-marca)', color: '#fff', border: 'none', cursor: 'pointer', opacity: gerando ? 0.7 : 1 }}>
                          {gerando ? <Loader size={12} className="animate-spin" /> : <Wand2 size={12} />} IA
                        </button>
                      </div>
                      <select value={el.fontFamily} onChange={e => atualizarEl({ fontFamily: e.target.value })}
                        className="w-full text-xs px-2.5 py-2 rounded-xl"
                        style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', color: 'var(--cor-texto)', outline: 'none' }}>
                        {FONTES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                      </select>
                      <div>
                        <div className="flex justify-between mb-1"><p className="text-xs" style={{ color: 'var(--cor-texto-muted)' }}>Tamanho</p><p className="text-xs" style={{ color: 'var(--cor-texto-fraco)' }}>{el.tamanho}px</p></div>
                        <input type="range" min={12} max={200} value={el.tamanho} onChange={e => atualizarEl({ tamanho: parseInt(e.target.value) })} className="w-full" style={{ accentColor: 'var(--cor-marca)' }} />
                      </div>
                      <div>
                        <p className="text-xs mb-2" style={{ color: 'var(--cor-texto-muted)' }}>Cor</p>
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {CORES.map(cor => <button key={cor} onClick={() => atualizarEl({ cor })} style={{ width: 20, height: 20, borderRadius: '50%', background: cor, cursor: 'pointer', border: `2px solid ${el.cor === cor ? 'var(--cor-marca)' : 'rgba(255,255,255,0.1)'}` }} />)}
                          <input type="color" value={el.cor} onChange={e => atualizarEl({ cor: e.target.value })} style={{ width: 20, height: 20, borderRadius: '50%', cursor: 'pointer', border: 0, padding: 0 }} />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button onClick={() => atualizarEl({ peso: el.peso === 'bold' ? 'normal' : 'bold' })} style={{ padding: '6px', borderRadius: 8, background: el.peso === 'bold' ? 'rgba(124,123,250,0.15)' : 'var(--cor-elevado)', color: el.peso === 'bold' ? 'var(--cor-marca)' : 'var(--cor-texto-muted)', border: `1px solid ${el.peso === 'bold' ? 'rgba(124,123,250,0.3)' : 'var(--cor-borda)'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bold size={13} /></button>
                        <button onClick={() => atualizarEl({ estilo: el.estilo === 'italic' ? 'normal' : 'italic' })} style={{ padding: '6px', borderRadius: 8, background: el.estilo === 'italic' ? 'rgba(124,123,250,0.15)' : 'var(--cor-elevado)', color: el.estilo === 'italic' ? 'var(--cor-marca)' : 'var(--cor-texto-muted)', border: `1px solid ${el.estilo === 'italic' ? 'rgba(124,123,250,0.3)' : 'var(--cor-borda)'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Italic size={13} /></button>
                        <button onClick={() => atualizarEl({ sombra: !el.sombra })} style={{ padding: '6px', borderRadius: 8, background: el.sombra ? 'rgba(124,123,250,0.15)' : 'var(--cor-elevado)', color: el.sombra ? 'var(--cor-marca)' : 'var(--cor-texto-muted)', border: `1px solid ${el.sombra ? 'rgba(124,123,250,0.3)' : 'var(--cor-borda)'}`, cursor: 'pointer', fontSize: 11, fontWeight: 'bold' }}>S</button>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[{ id: 'left', icon: AlignLeft }, { id: 'center', icon: AlignCenter }, { id: 'right', icon: AlignRight }].map(({ id, icon: Icon }) => (
                          <button key={id} onClick={() => atualizarEl({ alinhamento: id as any })}
                            style={{ padding: '6px', borderRadius: 8, background: el.alinhamento === id ? 'rgba(124,123,250,0.15)' : 'var(--cor-elevado)', color: el.alinhamento === id ? 'var(--cor-marca)' : 'var(--cor-texto-muted)', border: `1px solid ${el.alinhamento === id ? 'rgba(124,123,250,0.3)' : 'var(--cor-borda)'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={13} /></button>
                        ))}
                      </div>
                    </>
                  )}

                  {el.tipo === 'imagem' && (
                    <div>
                      <div className="flex justify-between mb-1"><p className="text-xs" style={{ color: 'var(--cor-texto-muted)' }}>Opacidade</p><p className="text-xs" style={{ color: 'var(--cor-texto-fraco)' }}>{Math.round((el.opacidade ?? 1) * 100)}%</p></div>
                      <input type="range" min={0.1} max={1} step={0.05} value={el.opacidade ?? 1} onChange={e => atualizarEl({ opacidade: parseFloat(e.target.value) })} className="w-full" style={{ accentColor: 'var(--cor-marca)' }} />
                    </div>
                  )}

                  <button onClick={() => removerEl(el.id)}
                    className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs"
                    style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)', cursor: 'pointer' }}>
                    <Trash2 size={12} /> Remover
                  </button>
                </div>
              )}

              {!el && (
                <div className="card flex flex-col items-center justify-center py-8 gap-2" style={{ border: '1px dashed var(--cor-borda)' }}>
                  <Move size={22} style={{ color: 'var(--cor-texto-fraco)' }} />
                  <p className="text-xs text-center" style={{ color: 'var(--cor-texto-fraco)' }}>Clica num elemento<br />para editar</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </LayoutPainel>
    </>
  )
}
