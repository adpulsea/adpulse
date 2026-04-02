// ============================================
// AdPulse — Ecrã de Publicação
// ============================================

import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  Download, Copy, Check, ExternalLink, CheckCircle,
  Clock, Image as ImageIcon, Hash, FileText,
  Instagram, Youtube, Loader, ArrowLeft, Sparkles
} from 'lucide-react'
import LayoutPainel from '@/components/layout/LayoutPainel'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

// ---- Tipos ----
type Post = {
  id: string
  titulo: string
  legenda: string
  hashtags: string[]
  hook: string
  plataforma: string
  formato: string
  estado: string
  imagem_url?: string
  imagem_nome?: string
  hora_publicacao?: string
}

type Ficheiro = {
  id: string
  nome: string
  url: string
  tipo: string
}

// ---- Instruções por plataforma ----
const INSTRUCOES: Record<string, {
  cor: string
  emoji: string
  tamanhos: { formato: string, dimensoes: string, duracao?: string }[]
  melhoresHoras: string[]
  dicas: string[]
  linkApp: string
}> = {
  instagram: {
    cor: '#E1306C',
    emoji: '📸',
    tamanhos: [
      { formato: 'Reel', dimensoes: '1080x1920px (9:16)', duracao: '15-90 segundos' },
      { formato: 'Post', dimensoes: '1080x1080px (1:1)' },
      { formato: 'Story', dimensoes: '1080x1920px (9:16)', duracao: 'até 15 segundos' },
      { formato: 'Carrossel', dimensoes: '1080x1080px (1:1)', duracao: 'até 10 slides' },
    ],
    melhoresHoras: ['08:00 - 09:00', '12:00 - 13:00', '18:00 - 21:00'],
    dicas: [
      'Usa os primeiros 3 segundos para captar a atenção',
      'Adiciona legendas ao vídeo — 85% vê sem som',
      'Responde a todos os comentários nas primeiras horas',
      'Publica nos Stories após o post para mais alcance',
    ],
    linkApp: 'instagram://app',
  },
  tiktok: {
    cor: '#00f2ea',
    emoji: '🎵',
    tamanhos: [
      { formato: 'Short/Vídeo', dimensoes: '1080x1920px (9:16)', duracao: '15-60 segundos (ideal)' },
    ],
    melhoresHoras: ['06:00 - 09:00', '12:00 - 14:00', '19:00 - 22:00'],
    dicas: [
      'Hook nos primeiros 2 segundos é fundamental',
      'Usa sons trending para mais alcance orgânico',
      'Hashtags: 3-5 nicho + 2-3 trending',
      'Publica consistentemente — mínimo 1x por dia',
    ],
    linkApp: 'tiktok://app',
  },
  youtube: {
    cor: '#FF0000',
    emoji: '▶️',
    tamanhos: [
      { formato: 'Short', dimensoes: '1080x1920px (9:16)', duracao: 'até 60 segundos' },
      { formato: 'Vídeo', dimensoes: '1920x1080px (16:9)', duracao: 'mínimo 8 minutos para monetização' },
    ],
    melhoresHoras: ['15:00 - 16:00', '20:00 - 21:00'],
    dicas: [
      'Thumbnail é o fator mais importante para cliques',
      'Primeiros 30 segundos determinam a retenção',
      'Usa capítulos na descrição para melhor SEO',
      'Pede like e subscrição no início E no fim',
    ],
    linkApp: 'youtube://app',
  },
  linkedin: {
    cor: '#0077B5',
    emoji: '💼',
    tamanhos: [
      { formato: 'Post', dimensoes: '1200x627px (1.91:1)' },
      { formato: 'Vídeo', dimensoes: '1920x1080px (16:9)', duracao: '30 segundos - 10 minutos' },
    ],
    melhoresHoras: ['07:00 - 08:00', '12:00 - 13:00', '17:00 - 18:00'],
    dicas: [
      'Terça a Quinta são os melhores dias',
      'Primeiras 3 linhas são cruciais — sem "ver mais"',
      'Conteúdo profissional e insights pessoais performam melhor',
      'Hashtags: máximo 5, muito específicas',
    ],
    linkApp: 'linkedin://app',
  },
}

export default function PaginaPublicacao() {
  const router = useRouter()
  const { utilizador } = useAuth()
  const { id } = router.query

  const [post, setPost]           = useState<Post | null>(null)
  const [ficheiros, setFicheiros] = useState<Ficheiro[]>([])
  const [ficheiroSel, setFichSel] = useState<Ficheiro | null>(null)
  const [carregando, setCarr]     = useState(true)
  const [copiado, setCopiado]     = useState<string | null>(null)
  const [publicado, setPublicado] = useState(false)
  const [marcando, setMarcando]   = useState(false)

  useEffect(() => {
    if (!id || !utilizador) return
    const carregar = async () => {
      // Carregar post
      const { data: p } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single()
      if (p) {
        setPost(p)
        if (p.estado === 'publicado') setPublicado(true)
        // Se já tem imagem associada, carregá-la
        if (p.imagem_url) {
          setFichSel({ id: '', nome: p.imagem_nome || 'imagem', url: p.imagem_url, tipo: 'image/jpeg' })
        }
      }

      // Carregar ficheiros da biblioteca
      const { data: f } = await supabase
        .from('ficheiros_media')
        .select('*')
        .eq('utilizador_id', utilizador.id)
        .like('tipo', 'image/%')
        .order('criado_em', { ascending: false })
        .limit(20)
      if (f) setFicheiros(f)

      setCarr(false)
    }
    carregar()
  }, [id, utilizador])

  const copiar = (texto: string, chave: string) => {
    navigator.clipboard.writeText(texto)
    setCopiado(chave)
    setTimeout(() => setCopiado(null), 2000)
  }

  const marcarPublicado = async () => {
    if (!post) return
    setMarcando(true)
    await supabase.from('posts').update({ estado: 'publicado' }).eq('id', post.id)
    setPublicado(true)
    setMarcando(false)
  }

  const associarImagem = async (f: Ficheiro) => {
    setFichSel(f)
    if (post) {
      await supabase.from('posts').update({
        imagem_url: f.url,
        imagem_nome: f.nome,
      }).eq('id', post.id)
    }
  }

  if (carregando) {
    return (
      <LayoutPainel titulo="Publicar">
        <div className="flex items-center justify-center h-64">
          <Loader size={24} className="animate-spin" style={{ color: 'var(--cor-marca)' }} />
        </div>
      </LayoutPainel>
    )
  }

  if (!post) {
    return (
      <LayoutPainel titulo="Publicar">
        <div className="text-center py-16">
          <p style={{ color: 'var(--cor-texto-muted)' }}>Post não encontrado.</p>
          <button onClick={() => router.back()} className="btn-primario mx-auto mt-4">
            <ArrowLeft size={16} /> Voltar
          </button>
        </div>
      </LayoutPainel>
    )
  }

  const instrucoes = INSTRUCOES[post.plataforma] || INSTRUCOES.instagram
  const legendaCompleta = `${post.legenda}\n\n${post.hashtags?.join(' ') || ''}`

  return (
    <>
      <Head><title>Publicar — {post.titulo}</title></Head>
      <LayoutPainel titulo="Ecrã de Publicação">
        <div className="max-w-5xl mx-auto flex flex-col gap-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <button onClick={() => router.back()}
              className="flex items-center gap-2 text-sm transition-colors"
              style={{ color: 'var(--cor-texto-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
              <ArrowLeft size={16} /> Voltar ao calendário
            </button>

            {publicado ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl"
                style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
                <CheckCircle size={16} style={{ color: 'var(--cor-sucesso)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--cor-sucesso)' }}>Publicado!</span>
              </div>
            ) : (
              <button onClick={marcarPublicado} disabled={marcando}
                className="btn-primario"
                style={marcando ? { opacity: 0.6, cursor: 'not-allowed' } : {}}>
                {marcando ? <Loader size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                Marcar como publicado
              </button>
            )}
          </div>

          {/* Info do post */}
          <div className="card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: `${instrucoes.cor}15`, border: `1px solid ${instrucoes.cor}30` }}>
              {instrucoes.emoji}
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-lg" style={{ fontFamily: 'var(--fonte-display)' }}>{post.titulo}</h2>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                  style={{ background: `${instrucoes.cor}15`, color: instrucoes.cor, border: `1px solid ${instrucoes.cor}30` }}>
                  {post.plataforma}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--cor-elevado)', color: 'var(--cor-texto-muted)', border: '1px solid var(--cor-borda)' }}>
                  {post.formato}
                </span>
                {post.hora_publicacao && (
                  <span className="text-xs flex items-center gap-1" style={{ color: 'var(--cor-texto-muted)' }}>
                    <Clock size={11} /> {post.hora_publicacao}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* COLUNA ESQUERDA — Conteúdo */}
            <div className="flex flex-col gap-4">

              {/* Imagem */}
              <div className="card flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <ImageIcon size={16} style={{ color: 'var(--cor-marca)' }} />
                  <h3 className="font-semibold text-sm" style={{ fontFamily: 'var(--fonte-display)' }}>Imagem / Vídeo</h3>
                </div>

                {ficheiroSel ? (
                  <div className="relative">
                    <img src={ficheiroSel.url} alt={ficheiroSel.nome}
                      className="w-full rounded-xl object-cover" style={{ maxHeight: 280 }} />
                    <div className="absolute bottom-2 right-2 flex gap-2">
                      <a href={ficheiroSel.url} download={ficheiroSel.nome} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
                        style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', textDecoration: 'none', backdropFilter: 'blur(4px)' }}>
                        <Download size={12} /> Descarregar
                      </a>
                      <button onClick={() => setFichSel(null)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
                        style={{ background: 'rgba(0,0,0,0.7)', color: '#fff', backdropFilter: 'blur(4px)', border: 'none', cursor: 'pointer' }}>
                        Trocar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="rounded-xl p-6 text-center mb-3"
                      style={{ background: 'var(--cor-elevado)', border: '2px dashed var(--cor-borda)' }}>
                      <ImageIcon size={28} style={{ color: 'var(--cor-texto-fraco)', margin: '0 auto 8px' }} />
                      <p className="text-sm" style={{ color: 'var(--cor-texto-muted)' }}>Escolhe uma imagem da biblioteca</p>
                    </div>

                    {ficheiros.length > 0 && (
                      <div className="grid grid-cols-4 gap-2">
                        {ficheiros.slice(0, 8).map(f => (
                          <button key={f.id} onClick={() => associarImagem(f)}
                            className="aspect-square rounded-xl overflow-hidden transition-all hover:opacity-80"
                            style={{ border: '2px solid var(--cor-borda)', padding: 0, cursor: 'pointer' }}>
                            <img src={f.url} alt={f.nome} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Hook */}
              {post.hook && (
                <div className="card flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} style={{ color: 'var(--cor-aviso)' }} />
                      <h3 className="font-semibold text-sm" style={{ fontFamily: 'var(--fonte-display)' }}>Hook</h3>
                    </div>
                    <button onClick={() => copiar(post.hook, 'hook')}
                      className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg"
                      style={{ color: copiado === 'hook' ? 'var(--cor-sucesso)' : 'var(--cor-texto-muted)', background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', cursor: 'pointer' }}>
                      {copiado === 'hook' ? <><Check size={12} /> Copiado!</> : <><Copy size={12} /> Copiar</>}
                    </button>
                  </div>
                  <p className="text-sm leading-relaxed">{post.hook}</p>
                </div>
              )}

              {/* Legenda */}
              <div className="card flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText size={16} style={{ color: 'var(--cor-marca)' }} />
                    <h3 className="font-semibold text-sm" style={{ fontFamily: 'var(--fonte-display)' }}>Legenda completa</h3>
                  </div>
                  <button onClick={() => copiar(legendaCompleta, 'legenda')}
                    className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg"
                    style={{ color: copiado === 'legenda' ? 'var(--cor-sucesso)' : 'var(--cor-marca)', background: 'rgba(124,123,250,0.1)', border: '1px solid rgba(124,123,250,0.2)', cursor: 'pointer' }}>
                    {copiado === 'legenda' ? <><Check size={12} /> Copiado!</> : <><Copy size={12} /> Copiar tudo</>}
                  </button>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-line">{post.legenda}</p>

                {/* Hashtags */}
                {post.hashtags && post.hashtags.length > 0 && (
                  <>
                    <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--cor-borda)' }}>
                      <div className="flex items-center gap-2">
                        <Hash size={14} style={{ color: 'var(--cor-info)' }} />
                        <span className="text-xs font-medium" style={{ color: 'var(--cor-texto-muted)' }}>Hashtags</span>
                      </div>
                      <button onClick={() => copiar(post.hashtags.join(' '), 'hashtags')}
                        className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg"
                        style={{ color: copiado === 'hashtags' ? 'var(--cor-sucesso)' : 'var(--cor-texto-muted)', background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', cursor: 'pointer' }}>
                        {copiado === 'hashtags' ? <><Check size={12} /> Copiado!</> : <><Copy size={12} /> Copiar</>}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {post.hashtags.map((h, i) => (
                        <span key={i} className="text-xs px-2.5 py-1 rounded-full"
                          style={{ background: 'rgba(96,165,250,0.1)', color: 'var(--cor-info)', border: '1px solid rgba(96,165,250,0.2)' }}>
                          {h}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* COLUNA DIREITA — Instruções */}
            <div className="flex flex-col gap-4">

              {/* Tamanhos recomendados */}
              <div className="card flex flex-col gap-4">
                <h3 className="font-semibold text-sm" style={{ fontFamily: 'var(--fonte-display)' }}>
                  {instrucoes.emoji} Tamanhos para {post.plataforma}
                </h3>
                <div className="flex flex-col gap-2">
                  {instrucoes.tamanhos.map((t, i) => (
                    <div key={i} className="p-3 rounded-xl"
                      style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)' }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold" style={{ color: instrucoes.cor }}>{t.formato}</span>
                        <span className="text-xs font-mono" style={{ color: 'var(--cor-texto-muted)' }}>{t.dimensoes}</span>
                      </div>
                      {t.duracao && (
                        <p className="text-xs" style={{ color: 'var(--cor-texto-fraco)' }}>⏱ {t.duracao}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Melhores horas */}
              <div className="card flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Clock size={16} style={{ color: 'var(--cor-aviso)' }} />
                  <h3 className="font-semibold text-sm" style={{ fontFamily: 'var(--fonte-display)' }}>Melhores horas para publicar</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {instrucoes.melhoresHoras.map((h, i) => (
                    <span key={i} className="text-xs px-3 py-1.5 rounded-xl font-medium"
                      style={{ background: 'rgba(251,191,36,0.1)', color: 'var(--cor-aviso)', border: '1px solid rgba(251,191,36,0.2)' }}>
                      🕐 {h}
                    </span>
                  ))}
                </div>
              </div>

              {/* Dicas */}
              <div className="card flex flex-col gap-3">
                <h3 className="font-semibold text-sm" style={{ fontFamily: 'var(--fonte-display)' }}>
                  💡 Dicas para mais alcance
                </h3>
                <div className="flex flex-col gap-2">
                  {instrucoes.dicas.map((d, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 font-bold mt-0.5"
                        style={{ background: `${instrucoes.cor}15`, color: instrucoes.cor }}>
                        {i + 1}
                      </span>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--cor-texto-muted)' }}>{d}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Abrir app */}
              <div className="card flex flex-col gap-3">
                <h3 className="font-semibold text-sm" style={{ fontFamily: 'var(--fonte-display)' }}>
                  📱 Passos para publicar
                </h3>
                <div className="flex flex-col gap-2">
                  {[
                    ficheiroSel ? '✅ Imagem selecionada — clica em "Descarregar"' : '1. Escolhe a imagem da biblioteca acima',
                    '2. Copia a legenda completa (botão acima)',
                    `3. Abre o ${post.plataforma} no telemóvel`,
                    '4. Cria um novo post e cola a legenda',
                    '5. Volta aqui e marca como "Publicado"',
                  ].map((passo, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--cor-texto-muted)' }}>
                      <span>{passo}</span>
                    </div>
                  ))}
                </div>

                <a href={`https://www.${post.plataforma}.com`} target="_blank" rel="noreferrer"
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all mt-2"
                  style={{ background: `${instrucoes.cor}15`, color: instrucoes.cor, border: `1px solid ${instrucoes.cor}30`, textDecoration: 'none' }}>
                  <ExternalLink size={14} /> Abrir {post.plataforma}
                </a>
              </div>
            </div>
          </div>
        </div>
      </LayoutPainel>
    </>
  )
}
