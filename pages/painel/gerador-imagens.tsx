// ============================================
// AdPulse — Gerador de Imagens com IA
// ============================================

import Head from 'next/head'
import { useState } from 'react'
import {
  Wand2, Download, Loader, RefreshCw, Copy, Check,
  Image as ImageIcon, Sparkles, ZoomIn, X
} from 'lucide-react'
import LayoutPainel from '@/components/layout/LayoutPainel'

type Imagem = {
  id: string
  url: string
  prompt: string
  promptRevisto?: string
  tamanho: string
  criado_em: string
}

const TAMANHOS = [
  { id: '1024x1024', label: 'Quadrado',  emoji: '⬛', desc: 'Feed Instagram' },
  { id: '1024x1792', label: 'Vertical',  emoji: '📱', desc: 'Stories / Reels' },
  { id: '1792x1024', label: 'Horizontal',emoji: '🖥️', desc: 'YouTube / LinkedIn' },
]

const ESTILOS = [
  { id: 'vivid',   label: 'Vívido',   desc: 'Cores intensas e dramáticas' },
  { id: 'natural', label: 'Natural',  desc: 'Mais realista e suave' },
]

const QUALIDADES = [
  { id: 'standard', label: 'Standard', desc: 'Rápido e económico' },
  { id: 'hd',       label: 'HD',       desc: 'Máxima qualidade' },
]

const PROMPTS_SUGERIDOS = [
  'Fundo gradiente roxo e rosa escuro para post de marketing digital, estilo moderno minimalista',
  'Pessoa a trabalhar com laptop num espaço moderno, luz suave, fotografia profissional',
  'Smartphone com redes sociais, fundo escuro elegante, luz néon roxa',
  'Gráfico de crescimento dourado em fundo escuro, estilo financial technology',
  'Criativo abstrato com partículas de luz e geometria, azul e roxo, fundo preto',
  'Empreendedor de sucesso em escritório moderno, fotografia editorial',
  'Logo AdPulse style: símbolo de raio elétrico em fundo gradiente roxo escuro',
  'Carrossel de redes sociais mockup em fundo escuro premium',
]

export default function GeradorImagens() {
  const [prompt, setPrompt]           = useState('')
  const [tamanho, setTamanho]         = useState('1024x1024')
  const [estilo, setEstilo]           = useState('vivid')
  const [qualidade, setQualidade]     = useState('standard')
  const [gerando, setGerando]         = useState(false)
  const [imagens, setImagens]         = useState<Imagem[]>([])
  const [erro, setErro]               = useState<string | null>(null)
  const [preview, setPreview]         = useState<Imagem | null>(null)
  const [copiado, setCopiado]         = useState(false)

  const gerarImagem = async () => {
    if (!prompt.trim() || gerando) return
    setGerando(true)
    setErro(null)

    try {
      const resp = await fetch('/api/ia/gerar-imagem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), tamanho, estilo, qualidade }),
      })
      const data = await resp.json()

      if (data.erro) {
        setErro(data.erro)
        return
      }

      const novaImagem: Imagem = {
        id: Date.now().toString(),
        url: data.url,
        prompt: prompt.trim(),
        promptRevisto: data.promptRevisto,
        tamanho,
        criado_em: new Date().toISOString(),
      }
      setImagens(prev => [novaImagem, ...prev])
      setPreview(novaImagem)
    } catch (err) {
      setErro('Erro ao gerar imagem. Verifica a tua ligação.')
    } finally {
      setGerando(false)
    }
  }

  const descarregar = async (imagem: Imagem) => {
    try {
      const resp = await fetch(imagem.url)
      const blob = await resp.blob()
      const url  = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href     = url
      link.download = `adpulse-ia-${Date.now()}.png`
      link.click()
      URL.revokeObjectURL(url)
    } catch {
      window.open(imagem.url, '_blank')
    }
  }

  const copiarUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <>
      <Head><title>Gerador de Imagens IA — AdPulse</title></Head>
      <LayoutPainel titulo="Gerador de Imagens IA">
        <div className="max-w-6xl mx-auto flex flex-col gap-6">

          {/* Header */}
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(124,123,250,0.1), rgba(244,114,182,0.08))', border: '1px solid rgba(124,123,250,0.2)' }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{ background: 'rgba(124,123,250,0.15)', border: '1px solid rgba(124,123,250,0.3)' }}>
                🎨
              </div>
              <div>
                <h2 className="font-bold text-xl" style={{ fontFamily: 'var(--fonte-display)' }}>Gerador de Imagens com IA</h2>
                <p className="text-sm mt-1" style={{ color: 'var(--cor-texto-muted)' }}>
                  Cria imagens profissionais com DALL-E 3 — fundos, criativos, fotos de produto e muito mais
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">

            {/* ── Painel de configuração ── */}
            <div className="flex flex-col gap-4">

              {/* Prompt */}
              <div className="card flex flex-col gap-3">
                <p className="text-sm font-semibold">✏️ Descreve a imagem</p>
                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && e.ctrlKey && gerarImagem()}
                  placeholder="Ex: Fundo gradiente roxo escuro para post de marketing digital, estilo moderno e premium, sem texto..."
                  rows={4}
                  className="w-full text-sm px-4 py-3 rounded-xl resize-none"
                  style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', color: 'var(--cor-texto)', outline: 'none', lineHeight: 1.6 }}
                />
                <p className="text-xs" style={{ color: 'var(--cor-texto-fraco)' }}>
                  Dica: quanto mais específico, melhor o resultado. Ctrl+Enter para gerar.
                </p>

                {/* Prompts sugeridos */}
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-medium" style={{ color: 'var(--cor-texto-fraco)' }}>💡 Sugestões:</p>
                  <div className="flex flex-wrap gap-2">
                    {PROMPTS_SUGERIDOS.map((p, i) => (
                      <button key={i} onClick={() => setPrompt(p)}
                        className="text-xs px-2.5 py-1.5 rounded-xl text-left transition-all"
                        style={{ background: 'var(--cor-elevado)', color: 'var(--cor-texto-muted)', border: '1px solid var(--cor-borda)', cursor: 'pointer' }}>
                        {p.slice(0, 40)}...
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Configurações */}
              <div className="card flex flex-col gap-5">
                <p className="text-sm font-semibold">⚙️ Configurações</p>

                {/* Tamanho */}
                <div>
                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--cor-texto-muted)' }}>Formato</p>
                  <div className="grid grid-cols-3 gap-2">
                    {TAMANHOS.map(t => (
                      <button key={t.id} onClick={() => setTamanho(t.id)}
                        className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-center transition-all"
                        style={{
                          background: tamanho === t.id ? 'rgba(124,123,250,0.15)' : 'var(--cor-elevado)',
                          border: `1px solid ${tamanho === t.id ? 'rgba(124,123,250,0.4)' : 'var(--cor-borda)'}`,
                          cursor: 'pointer',
                        }}>
                        <span className="text-2xl">{t.emoji}</span>
                        <span className="text-xs font-medium" style={{ color: tamanho === t.id ? 'var(--cor-marca)' : 'var(--cor-texto)' }}>{t.label}</span>
                        <span className="text-xs" style={{ color: 'var(--cor-texto-fraco)', fontSize: 10 }}>{t.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Estilo e Qualidade */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium mb-2" style={{ color: 'var(--cor-texto-muted)' }}>Estilo</p>
                    <div className="flex flex-col gap-2">
                      {ESTILOS.map(e => (
                        <button key={e.id} onClick={() => setEstilo(e.id)}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all"
                          style={{
                            background: estilo === e.id ? 'rgba(124,123,250,0.15)' : 'var(--cor-elevado)',
                            border: `1px solid ${estilo === e.id ? 'rgba(124,123,250,0.4)' : 'var(--cor-borda)'}`,
                            cursor: 'pointer',
                          }}>
                          <div className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ background: estilo === e.id ? 'var(--cor-marca)' : 'var(--cor-borda)' }} />
                          <div>
                            <p className="text-xs font-medium" style={{ color: estilo === e.id ? 'var(--cor-marca)' : 'var(--cor-texto)' }}>{e.label}</p>
                            <p className="text-xs" style={{ color: 'var(--cor-texto-fraco)', fontSize: 10 }}>{e.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium mb-2" style={{ color: 'var(--cor-texto-muted)' }}>Qualidade</p>
                    <div className="flex flex-col gap-2">
                      {QUALIDADES.map(q => (
                        <button key={q.id} onClick={() => setQualidade(q.id)}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all"
                          style={{
                            background: qualidade === q.id ? 'rgba(124,123,250,0.15)' : 'var(--cor-elevado)',
                            border: `1px solid ${qualidade === q.id ? 'rgba(124,123,250,0.4)' : 'var(--cor-borda)'}`,
                            cursor: 'pointer',
                          }}>
                          <div className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ background: qualidade === q.id ? 'var(--cor-marca)' : 'var(--cor-borda)' }} />
                          <div>
                            <p className="text-xs font-medium" style={{ color: qualidade === q.id ? 'var(--cor-marca)' : 'var(--cor-texto)' }}>{q.label}</p>
                            <p className="text-xs" style={{ color: 'var(--cor-texto-fraco)', fontSize: 10 }}>{q.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Botão gerar */}
              {erro && (
                <div className="px-4 py-3 rounded-xl text-sm"
                  style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
                  ❌ {erro}
                </div>
              )}

              <button onClick={gerarImagem} disabled={gerando || !prompt.trim()}
                className="btn-primario justify-center py-4 text-base"
                style={{ opacity: gerando || !prompt.trim() ? 0.6 : 1, cursor: gerando || !prompt.trim() ? 'default' : 'pointer' }}>
                {gerando
                  ? <><Loader size={20} className="animate-spin" /> A gerar com DALL-E 3...</>
                  : <><Sparkles size={20} /> Gerar Imagem</>}
              </button>

              {gerando && (
                <p className="text-xs text-center" style={{ color: 'var(--cor-texto-fraco)' }}>
                  O DALL-E 3 está a criar a tua imagem... pode demorar 10-20 segundos ⏳
                </p>
              )}
            </div>

            {/* ── Galeria de imagens ── */}
            <div className="flex flex-col gap-4">
              <p className="text-sm font-semibold">🖼️ Imagens geradas ({imagens.length})</p>

              {imagens.length === 0 && !gerando && (
                <div className="card flex flex-col items-center justify-center py-16 gap-3"
                  style={{ border: '1px dashed var(--cor-borda)' }}>
                  <ImageIcon size={32} style={{ color: 'var(--cor-texto-fraco)' }} />
                  <p className="text-sm text-center" style={{ color: 'var(--cor-texto-fraco)' }}>
                    As tuas imagens aparecem aqui.<br />Escreve um prompt e clica Gerar!
                  </p>
                </div>
              )}

              {gerando && (
                <div className="card flex flex-col items-center justify-center py-12 gap-3"
                  style={{ border: '1px solid rgba(124,123,250,0.2)', background: 'rgba(124,123,250,0.05)' }}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(124,123,250,0.15)' }}>
                    <Loader size={28} className="animate-spin" style={{ color: 'var(--cor-marca)' }} />
                  </div>
                  <p className="text-sm font-medium" style={{ color: 'var(--cor-marca)' }}>DALL-E 3 a trabalhar...</p>
                  <p className="text-xs" style={{ color: 'var(--cor-texto-fraco)' }}>10-20 segundos</p>
                </div>
              )}

              {imagens.map(img => (
                <div key={img.id} className="card flex flex-col gap-3"
                  style={{ border: preview?.id === img.id ? '1px solid rgba(124,123,250,0.4)' : '1px solid var(--cor-borda)' }}>
                  {/* Imagem */}
                  <div className="relative rounded-xl overflow-hidden cursor-pointer group"
                    onClick={() => setPreview(img)}>
                    <img src={img.url} alt={img.prompt}
                      className="w-full object-cover rounded-xl"
                      style={{ aspectRatio: img.tamanho === '1024x1792' ? '9/16' : img.tamanho === '1792x1024' ? '16/9' : '1/1' }} />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                      style={{ background: 'rgba(0,0,0,0.4)' }}>
                      <ZoomIn size={24} className="text-white" />
                    </div>
                  </div>

                  {/* Prompt */}
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--cor-texto-fraco)' }}>
                    {img.prompt.slice(0, 80)}{img.prompt.length > 80 ? '...' : ''}
                  </p>

                  {/* Ações */}
                  <div className="flex gap-2">
                    <button onClick={() => descarregar(img)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium"
                      style={{ background: 'var(--cor-marca)', color: '#fff', border: 'none', cursor: 'pointer' }}>
                      <Download size={13} /> Descarregar
                    </button>
                    <button onClick={() => copiarUrl(img.url)}
                      className="px-3 py-2 rounded-xl text-xs"
                      style={{ background: 'var(--cor-elevado)', color: copiado ? '#34d399' : 'var(--cor-texto-muted)', border: '1px solid var(--cor-borda)', cursor: 'pointer' }}>
                      {copiado ? <Check size={13} /> : <Copy size={13} />}
                    </button>
                    <button onClick={() => { setPrompt(img.prompt); gerarImagem() }}
                      className="px-3 py-2 rounded-xl text-xs"
                      style={{ background: 'var(--cor-elevado)', color: 'var(--cor-texto-muted)', border: '1px solid var(--cor-borda)', cursor: 'pointer' }}
                      title="Gerar variação">
                      <RefreshCw size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal preview */}
        {preview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(8px)' }}
            onClick={() => setPreview(null)}>
            <div className="relative max-w-3xl w-full flex flex-col gap-4" onClick={e => e.stopPropagation()}>
              <img src={preview.url} alt={preview.prompt}
                className="w-full rounded-2xl object-contain"
                style={{ maxHeight: '75vh' }} />
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-white opacity-70 flex-1">{preview.promptRevisto || preview.prompt}</p>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => descarregar(preview)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
                    style={{ background: 'var(--cor-marca)', color: '#fff', border: 'none', cursor: 'pointer' }}>
                    <Download size={15} /> Descarregar
                  </button>
                  <button onClick={() => setPreview(null)}
                    className="p-2.5 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', cursor: 'pointer' }}>
                    <X size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </LayoutPainel>
    </>
  )
}
