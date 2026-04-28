// AdPulse — Dashboard de Automação
// ============================================

import Head from 'next/head'
import { useEffect, useState } from 'react'
import {
  Zap, Plus, Trash2, Edit3, Clock,
  MessageCircle, Hash, CheckCircle,
  ToggleLeft, ToggleRight, ChevronDown, ChevronUp,
  Calendar, AlertCircle, X, Check, Loader,
  Bot, Save
} from 'lucide-react'
import LayoutPainel from '@/components/layout/LayoutPainel'
import BloqueadoPro from '@/components/BloqueadoPro'
import { usePlano } from '@/hooks/usePlano'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

// ---- Tipos ----
type Plataforma = 'instagram' | 'tiktok'

type PostAgendado = {
  id: string
  titulo: string
  legenda: string
  plataforma: Plataforma
  formato: string
  dataHora: string
  estado: 'agendado' | 'publicado' | 'falhou' | 'rascunho'
}

type Gatilho = {
  id: string
  nome: string
  ativo: boolean
  plataforma: Plataforma | 'ambos'
  palavrasChave: string[]
  tipo: 'comentario' | 'dm' | 'ambos'
  respostaDM: string
  respostaComentario?: string
  estatisticas: { ativacoes: number, dmsEnviados: number }
}

type AutoGeradorConfig = {
  id?: string
  ativo: boolean
  quantidade_dia: number
  nicho: string
  plataforma: string
  formato: string
  modo: string
  hora_preferida: string
}

// ---- Dados iniciais ----
const POSTS_INICIAIS: PostAgendado[] = [
  {
    id: '1',
    titulo: 'Dica de produtividade',
    legenda:
      '3 hábitos que mudaram a minha vida 👇\n\n1. Acordar às 6h\n2. Bloco de trabalho profundo\n3. Sem telemóvel nas primeiras 2h\n\nGuarda este post para não esqueceres! 💾',
    plataforma: 'instagram',
    formato: 'Reel',
    dataHora: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    estado: 'agendado',
  },
  {
    id: '2',
    titulo: '5 erros a evitar',
    legenda:
      'Erros que me custaram 3 anos de crescimento... 😤\n\n#empreendedorismo #crescimento #negocio',
    plataforma: 'tiktok',
    formato: 'Short',
    dataHora: new Date(Date.now() + 172800000).toISOString().slice(0, 16),
    estado: 'agendado',
  },
]

const GATILHOS_INICIAIS: Gatilho[] = [
  {
    id: '1',
    nome: 'Pedido de Info — Produto',
    ativo: true,
    plataforma: 'ambos',
    palavrasChave: ['INFO', 'PREÇO', 'QUERO', 'COMO COMPRO'],
    tipo: 'comentario',
    respostaDM:
      'Olá! 👋 Vi que tens interesse. Envia-me DM com a palavra PRODUTO e envio-te todos os detalhes!',
    respostaComentario: '📩 Envia-me DM com INFO que te respondo já!',
    estatisticas: { ativacoes: 47, dmsEnviados: 38 },
  },
  {
    id: '2',
    nome: 'Link do Freebie',
    ativo: true,
    plataforma: 'instagram',
    palavrasChave: ['GRATIS', 'FREEBIE', 'LINK', 'QUERO O PDF'],
    tipo: 'ambos',
    respostaDM:
      '🎁 Aqui está o teu link exclusivo: [LINK]. Aproveita e partilha com quem precisar! 🙌',
    respostaComentario: '📩 Manda-me DM com a palavra GRATIS e envio-te já!',
    estatisticas: { ativacoes: 123, dmsEnviados: 98 },
  },
]

const COR_PLATAFORMA: Record<string, string> = {
  instagram: '#E1306C',
  tiktok: '#00f2ea',
  ambos: '#7c7bfa',
}

const COR_ESTADO: Record<string, string> = {
  agendado: '#60a5fa',
  publicado: '#34d399',
  falhou: '#f87171',
  rascunho: '#8888aa',
}

// ---- Modal Gatilho ----
function ModalGatilho({
  gatilho,
  onGuardar,
  onFechar,
}: {
  gatilho?: Gatilho
  onGuardar: (g: Gatilho) => void
  onFechar: () => void
}) {
  const [nome, setNome] = useState(gatilho?.nome || '')
  const [plataforma, setPlat] = useState<Gatilho['plataforma']>(
    gatilho?.plataforma || 'ambos'
  )
  const [tipo, setTipo] = useState<Gatilho['tipo']>(
    gatilho?.tipo || 'comentario'
  )
  const [palavras, setPalavras] = useState(
    gatilho?.palavrasChave.join(', ') || ''
  )
  const [respostaDM, setRespostaDM] = useState(gatilho?.respostaDM || '')
  const [respostaC, setRespostaC] = useState(
    gatilho?.respostaComentario || ''
  )
  const [gerando, setGerando] = useState(false)

  const gerarResposta = async () => {
    if (!nome.trim()) return
    setGerando(true)

    try {
      const r = await fetch('/api/ia/agente-atendimento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sistema:
            'És um especialista em marketing digital. Cria respostas automáticas curtas, amigáveis e eficazes para DMs no Instagram/TikTok. Responde APENAS com o texto da mensagem, sem explicações.',
          mensagens: [
            {
              role: 'user',
              content: `Cria uma resposta automática de DM para o gatilho: "${nome}". Palavras-chave: ${palavras}. Deve ser curta (máx 2 frases), amigável e incluir um próximo passo claro.`,
            },
          ],
        }),
      })

      const d = await r.json()
      if (d.resposta) setRespostaDM(d.resposta)
    } catch {
      // silencioso
    } finally {
      setGerando(false)
    }
  }

  const guardar = () => {
    if (!nome.trim() || !respostaDM.trim()) return

    onGuardar({
      id: gatilho?.id || Date.now().toString(),
      nome,
      plataforma,
      tipo,
      palavrasChave: palavras
        .split(',')
        .map((p) => p.trim().toUpperCase())
        .filter(Boolean),
      respostaDM,
      respostaComentario: respostaC || undefined,
      ativo: gatilho?.ativo ?? true,
      estatisticas: gatilho?.estatisticas || {
        ativacoes: 0,
        dmsEnviados: 0,
      },
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-lg rounded-2xl p-6 flex flex-col gap-4 overflow-y-auto"
        style={{
          background: 'var(--cor-card)',
          border: '1px solid var(--cor-borda)',
          maxHeight: '90vh',
        }}
      >
        <div className="flex items-center justify-between">
          <h3
            className="font-semibold text-lg"
            style={{ fontFamily: 'var(--fonte-display)' }}
          >
            {gatilho ? 'Editar gatilho' : 'Novo gatilho'}
          </h3>

          <button onClick={onFechar} style={{ color: 'var(--cor-texto-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <div>
          <label
            className="text-xs mb-1.5 block"
            style={{ color: 'var(--cor-texto-muted)' }}
          >
            Nome do gatilho
          </label>
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Pedido de info sobre produto"
            className="input-campo w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              className="text-xs mb-1.5 block"
              style={{ color: 'var(--cor-texto-muted)' }}
            >
              Plataforma
            </label>

            <div className="flex flex-col gap-1.5">
              {(['instagram', 'tiktok', 'ambos'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPlat(p)}
                  className="px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all text-left"
                  style={{
                    background:
                      plataforma === p
                        ? `${COR_PLATAFORMA[p]}15`
                        : 'var(--cor-elevado)',
                    border: `1px solid ${
                      plataforma === p
                        ? COR_PLATAFORMA[p] + '40'
                        : 'var(--cor-borda)'
                    }`,
                    color:
                      plataforma === p
                        ? COR_PLATAFORMA[p]
                        : 'var(--cor-texto-muted)',
                  }}
                >
                  {p === 'ambos'
                    ? '🔗 Ambas'
                    : p === 'instagram'
                      ? '📸 Instagram'
                      : '🎵 TikTok'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              className="text-xs mb-1.5 block"
              style={{ color: 'var(--cor-texto-muted)' }}
            >
              Quando ativar
            </label>

            <div className="flex flex-col gap-1.5">
              {([
                { id: 'comentario', label: '💬 Comentário' },
                { id: 'dm', label: '📩 DM recebido' },
                { id: 'ambos', label: '🔗 Ambos' },
              ] as const).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTipo(t.id)}
                  className="px-3 py-2 rounded-xl text-xs font-medium transition-all text-left"
                  style={{
                    background:
                      tipo === t.id
                        ? 'rgba(124,123,250,0.12)'
                        : 'var(--cor-elevado)',
                    border: `1px solid ${
                      tipo === t.id
                        ? 'rgba(124,123,250,0.3)'
                        : 'var(--cor-borda)'
                    }`,
                    color:
                      tipo === t.id
                        ? 'var(--cor-marca)'
                        : 'var(--cor-texto-muted)',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label
            className="text-xs mb-1.5 block"
            style={{ color: 'var(--cor-texto-muted)' }}
          >
            Palavras-chave{' '}
            <span style={{ color: 'var(--cor-texto-fraco)' }}>
              (separadas por vírgula)
            </span>
          </label>

          <input
            value={palavras}
            onChange={(e) => setPalavras(e.target.value)}
            placeholder="Ex: INFO, PREÇO, QUERO, LINK"
            className="input-campo w-full"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              className="text-xs"
              style={{ color: 'var(--cor-texto-muted)' }}
            >
              Mensagem automática (DM)
            </label>

            <button
              onClick={gerarResposta}
              disabled={gerando || !nome.trim()}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg"
              style={{
                color: 'var(--cor-marca)',
                background: 'rgba(124,123,250,0.1)',
                opacity: gerando ? 0.6 : 1,
              }}
            >
              {gerando ? (
                <Loader size={10} className="animate-spin" />
              ) : (
                <Zap size={10} />
              )}
              {gerando ? 'A gerar...' : 'Gerar com IA'}
            </button>
          </div>

          <textarea
            value={respostaDM}
            onChange={(e) => setRespostaDM(e.target.value)}
            placeholder="Olá! 👋 Vi que tens interesse. Aqui está o que pediste: [LINK]"
            rows={3}
            className="input-campo w-full resize-none"
          />
        </div>

        {(tipo === 'comentario' || tipo === 'ambos') && (
          <div>
            <label
              className="text-xs mb-1.5 block"
              style={{ color: 'var(--cor-texto-muted)' }}
            >
              Resposta ao comentário{' '}
              <span style={{ color: 'var(--cor-texto-fraco)' }}>(opcional)</span>
            </label>

            <input
              value={respostaC}
              onChange={(e) => setRespostaC(e.target.value)}
              placeholder="📩 Manda-me DM com INFO que te respondo já!"
              className="input-campo w-full"
            />
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button
            onClick={onFechar}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium"
            style={{
              background: 'var(--cor-elevado)',
              border: '1px solid var(--cor-borda)',
              color: 'var(--cor-texto-muted)',
            }}
          >
            Cancelar
          </button>

          <button
            onClick={guardar}
            disabled={!nome.trim() || !respostaDM.trim()}
            className="flex-1 btn-primario py-2.5 justify-center"
            style={
              !nome.trim() || !respostaDM.trim()
                ? { opacity: 0.5, cursor: 'not-allowed' }
                : {}
            }
          >
            <Check size={16} /> Guardar
          </button>
        </div>
      </div>
    </div>
  )
}

// ---- Modal Post Agendado ----
function ModalPost({
  post,
  onGuardar,
  onFechar,
}: {
  post?: PostAgendado
  onGuardar: (p: PostAgendado) => void
  onFechar: () => void
}) {
  const [titulo, setTitulo] = useState(post?.titulo || '')
  const [legenda, setLegenda] = useState(post?.legenda || '')
  const [plataforma, setPlat] = useState<Plataforma>(
    post?.plataforma || 'instagram'
  )
  const [formato, setFormato] = useState(post?.formato || 'Reel')
  const [dataHora, setDataHora] = useState(post?.dataHora || '')
  const [gerando, setGerando] = useState(false)

  const gerarLegenda = async () => {
    if (!titulo.trim()) return
    setGerando(true)

    try {
      const r = await fetch('/api/ia/gerar-conteudo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topico: titulo, plataforma, tom: 'Informal', formato }),
      })

      const d = await r.json()
      if (d.legenda) setLegenda(d.legenda)
    } catch {
      // silencioso
    } finally {
      setGerando(false)
    }
  }

  const guardar = () => {
    if (!titulo.trim() || !dataHora) return

    onGuardar({
      id: post?.id || Date.now().toString(),
      titulo,
      legenda,
      plataforma,
      formato,
      dataHora,
      estado: post?.estado || 'agendado',
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-lg rounded-2xl p-6 flex flex-col gap-4"
        style={{
          background: 'var(--cor-card)',
          border: '1px solid var(--cor-borda)',
        }}
      >
        <div className="flex items-center justify-between">
          <h3
            className="font-semibold text-lg"
            style={{ fontFamily: 'var(--fonte-display)' }}
          >
            {post ? 'Editar post' : 'Agendar novo post'}
          </h3>

          <button onClick={onFechar} style={{ color: 'var(--cor-texto-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <div>
          <label
            className="text-xs mb-1.5 block"
            style={{ color: 'var(--cor-texto-muted)' }}
          >
            Título / Tópico
          </label>

          <input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex: Dica de produtividade"
            className="input-campo w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              className="text-xs mb-1.5 block"
              style={{ color: 'var(--cor-texto-muted)' }}
            >
              Plataforma
            </label>

            <div className="flex gap-2">
              {(['instagram', 'tiktok'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPlat(p)}
                  className="flex-1 py-2 rounded-xl text-xs font-medium capitalize transition-all"
                  style={{
                    background:
                      plataforma === p
                        ? `${COR_PLATAFORMA[p]}15`
                        : 'var(--cor-elevado)',
                    border: `1px solid ${
                      plataforma === p
                        ? COR_PLATAFORMA[p] + '40'
                        : 'var(--cor-borda)'
                    }`,
                    color:
                      plataforma === p
                        ? COR_PLATAFORMA[p]
                        : 'var(--cor-texto-muted)',
                  }}
                >
                  {p === 'instagram' ? '📸' : '🎵'} {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              className="text-xs mb-1.5 block"
              style={{ color: 'var(--cor-texto-muted)' }}
            >
              Formato
            </label>

            <div className="flex flex-wrap gap-1.5">
              {['Reel', 'Post', 'Story', 'Short'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFormato(f)}
                  className="px-2.5 py-1.5 rounded-lg text-xs transition-all"
                  style={{
                    background:
                      formato === f
                        ? 'rgba(124,123,250,0.15)'
                        : 'var(--cor-elevado)',
                    border: `1px solid ${
                      formato === f
                        ? 'rgba(124,123,250,0.4)'
                        : 'var(--cor-borda)'
                    }`,
                    color:
                      formato === f
                        ? 'var(--cor-marca)'
                        : 'var(--cor-texto-muted)',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label
            className="text-xs mb-1.5 block"
            style={{ color: 'var(--cor-texto-muted)' }}
          >
            Data e hora de publicação
          </label>

          <input
            type="datetime-local"
            value={dataHora}
            onChange={(e) => setDataHora(e.target.value)}
            className="input-campo w-full"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              className="text-xs"
              style={{ color: 'var(--cor-texto-muted)' }}
            >
              Legenda
            </label>

            <button
              onClick={gerarLegenda}
              disabled={gerando || !titulo.trim()}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg"
              style={{
                color: 'var(--cor-marca)',
                background: 'rgba(124,123,250,0.1)',
                opacity: gerando || !titulo.trim() ? 0.6 : 1,
              }}
            >
              {gerando ? (
                <Loader size={10} className="animate-spin" />
              ) : (
                <Zap size={10} />
              )}
              {gerando ? 'A gerar...' : 'Gerar com IA'}
            </button>
          </div>

          <textarea
            value={legenda}
            onChange={(e) => setLegenda(e.target.value)}
            placeholder="Legenda do post..."
            rows={4}
            className="input-campo w-full resize-none"
          />
        </div>

        <div
          className="p-3 rounded-xl flex items-start gap-2"
          style={{
            background: 'rgba(251,191,36,0.08)',
            border: '1px solid rgba(251,191,36,0.2)',
          }}
        >
          <AlertCircle
            size={14}
            style={{
              color: 'var(--cor-aviso)',
              flexShrink: 0,
              marginTop: 1,
            }}
          />

          <p className="text-xs" style={{ color: 'var(--cor-aviso)' }}>
            A publicação automática requer ligação à API do Instagram/TikTok. Por
            agora o post fica agendado e recebes uma notificação na hora de
            publicar.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onFechar}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium"
            style={{
              background: 'var(--cor-elevado)',
              border: '1px solid var(--cor-borda)',
              color: 'var(--cor-texto-muted)',
            }}
          >
            Cancelar
          </button>

          <button
            onClick={guardar}
            disabled={!titulo.trim() || !dataHora}
            className="flex-1 btn-primario py-2.5 justify-center"
            style={
              !titulo.trim() || !dataHora
                ? { opacity: 0.5, cursor: 'not-allowed' }
                : {}
            }
          >
            <Check size={16} /> Agendar
          </button>
        </div>
      </div>
    </div>
  )
}

// ---- Componente principal ----
export default function Automacao() {
  const { isPro, carregando: carregandoPlano } = usePlano()
  const { utilizador } = useAuth()

  const [abaAtiva, setAba] = useState<'posts' | 'gatilhos' | 'funcionario'>('posts')
  const [posts, setPosts] = useState<PostAgendado[]>(POSTS_INICIAIS)
  const [gatilhos, setGatilhos] = useState<Gatilho[]>(GATILHOS_INICIAIS)
  const [modalPost, setModalPost] = useState<{ post?: PostAgendado } | null>(null)
  const [modalGatilho, setModalGat] = useState<{ gatilho?: Gatilho } | null>(null)
  const [expandido, setExpandido] = useState<string | null>(null)

  const [autoConfig, setAutoConfig] = useState<AutoGeradorConfig>({
    ativo: false,
    quantidade_dia: 3,
    nicho: 'motivação',
    plataforma: 'instagram',
    formato: 'post',
    modo: 'viral',
    hora_preferida: '09:00',
  })

  const [carregandoAuto, setCarregandoAuto] = useState(false)
  const [guardandoAuto, setGuardandoAuto] = useState(false)
  const [mensagemAuto, setMensagemAuto] = useState('')

  useEffect(() => {
    if (!utilizador || !isPro) return

    const carregarConfig = async () => {
      setCarregandoAuto(true)

      const { data, error } = await supabase
        .from('auto_gerador_config')
        .select('*')
        .eq('utilizador_id', utilizador.id)
        .limit(1)

      if (!error && data && data.length > 0) {
        const config = data[0]

        setAutoConfig({
          id: config.id,
          ativo: config.ativo ?? false,
          quantidade_dia: config.quantidade_dia ?? 3,
          nicho: config.nicho || 'motivação',
          plataforma: config.plataforma || 'instagram',
          formato: config.formato || 'post',
          modo: config.modo || 'viral',
          hora_preferida: config.hora_preferida || '09:00',
        })
      }

      setCarregandoAuto(false)
    }

    carregarConfig()
  }, [utilizador, isPro])

  if (carregandoPlano) {
    return (
      <LayoutPainel titulo="Automação">
        <div className="flex items-center justify-center h-64">
          <div
            className="animate-spin w-6 h-6 border-2 border-t-transparent rounded-full"
            style={{ borderColor: 'var(--cor-marca)' }}
          />
        </div>
      </LayoutPainel>
    )
  }

  if (!isPro) {
    return (
      <LayoutPainel titulo="Automação">
        <BloqueadoPro
          funcionalidade="Automação"
          descricao="Cria gatilhos automáticos e agenda respostas para crescer no piloto automático."
          emoji="⚙️"
        />
      </LayoutPainel>
    )
  }

  const guardarPost = (p: PostAgendado) => {
    setPosts((prev) =>
      prev.find((x) => x.id === p.id)
        ? prev.map((x) => (x.id === p.id ? p : x))
        : [...prev, p]
    )
    setModalPost(null)
  }

  const guardarGatilho = (g: Gatilho) => {
    setGatilhos((prev) =>
      prev.find((x) => x.id === g.id)
        ? prev.map((x) => (x.id === g.id ? g : x))
        : [...prev, g]
    )
    setModalGat(null)
  }

  const toggleGatilho = (id: string) => {
    setGatilhos((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ativo: !g.ativo } : g))
    )
  }

  const apagarPost = (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }

  const apagarGatilho = (id: string) => {
    setGatilhos((prev) => prev.filter((g) => g.id !== id))
  }

  const guardarAutoGerador = async () => {
    if (!utilizador) return

    setGuardandoAuto(true)
    setMensagemAuto('')

    try {
      if (autoConfig.id) {
        const { error } = await supabase
          .from('auto_gerador_config')
          .update({
            ativo: autoConfig.ativo,
            quantidade_dia: autoConfig.quantidade_dia,
            nicho: autoConfig.nicho,
            plataforma: autoConfig.plataforma,
            formato: autoConfig.formato,
            modo: autoConfig.modo,
            hora_preferida: autoConfig.hora_preferida,
            atualizado_em: new Date().toISOString(),
          })
          .eq('id', autoConfig.id)

        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('auto_gerador_config')
          .insert({
            utilizador_id: utilizador.id,
            ativo: autoConfig.ativo,
            quantidade_dia: autoConfig.quantidade_dia,
            nicho: autoConfig.nicho,
            plataforma: autoConfig.plataforma,
            formato: autoConfig.formato,
            modo: autoConfig.modo,
            hora_preferida: autoConfig.hora_preferida,
          })
          .select()
          .single()

        if (error) throw error

        setAutoConfig((prev) => ({
          ...prev,
          id: data.id,
        }))
      }

      setMensagemAuto('✅ Funcionário IA guardado com sucesso.')
    } catch {
      setMensagemAuto('❌ Erro ao guardar configuração.')
    } finally {
      setGuardandoAuto(false)

      setTimeout(() => {
        setMensagemAuto('')
      }, 3000)
    }
  }

  const totalDMs = gatilhos.reduce((s, g) => s + g.estatisticas.dmsEnviados, 0)
  const postsAgendados = posts.filter((p) => p.estado === 'agendado').length

  return (
    <>
      <Head>
        <title>Automação — AdPulse</title>
      </Head>

      <LayoutPainel titulo="Automação">
        <div className="max-w-5xl mx-auto flex flex-col gap-6">
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Posts agendados', valor: postsAgendados, cor: '#60a5fa', icone: Calendar },
              {
                label: 'Posts publicados',
                valor: posts.filter((p) => p.estado === 'publicado').length,
                cor: '#34d399',
                icone: CheckCircle,
              },
              {
                label: 'Gatilhos ativos',
                valor: gatilhos.filter((g) => g.ativo).length,
                cor: '#7c7bfa',
                icone: Zap,
              },
              {
                label: 'Funcionário IA',
                valor: autoConfig.ativo ? 'ON' : 'OFF',
                cor: autoConfig.ativo ? '#34d399' : '#8888aa',
                icone: Bot,
              },
            ].map((m) => {
              const Icone = m.icone

              return (
                <div key={m.label} className="card text-center py-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2"
                    style={{
                      background: `${m.cor}15`,
                      border: `1px solid ${m.cor}30`,
                    }}
                  >
                    <Icone size={16} style={{ color: m.cor }} />
                  </div>

                  <div
                    className="text-2xl font-bold"
                    style={{
                      fontFamily: 'var(--fonte-display)',
                      color: m.cor,
                    }}
                  >
                    {m.valor}
                  </div>

                  <div
                    className="text-xs mt-0.5"
                    style={{ color: 'var(--cor-texto-muted)' }}
                  >
                    {m.label}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-between">
            <div
              className="flex rounded-xl overflow-hidden"
              style={{ border: '1px solid var(--cor-borda)' }}
            >
              {([
                { id: 'posts', label: '📅 Posts Agendados' },
                { id: 'gatilhos', label: '⚡ Gatilhos' },
                { id: 'funcionario', label: '🤖 Funcionário IA' },
              ] as const).map((a) => (
                <button
                  key={a.id}
                  onClick={() => setAba(a.id)}
                  className="px-4 py-2 text-sm font-medium transition-colors"
                  style={{
                    background:
                      abaAtiva === a.id
                        ? 'var(--cor-marca)'
                        : 'var(--cor-elevado)',
                    color:
                      abaAtiva === a.id
                        ? '#fff'
                        : 'var(--cor-texto-muted)',
                  }}
                >
                  {a.label}
                </button>
              ))}
            </div>

            {abaAtiva !== 'funcionario' && (
              <button
                onClick={() =>
                  abaAtiva === 'posts' ? setModalPost({}) : setModalGat({})
                }
                className="btn-primario"
              >
                <Plus size={16} />
                {abaAtiva === 'posts' ? 'Agendar post' : 'Novo gatilho'}
              </button>
            )}
          </div>

          {abaAtiva === 'posts' && (
            <div className="flex flex-col gap-3">
              {posts.length === 0 && (
                <div className="card text-center py-12">
                  <Calendar
                    size={32}
                    style={{
                      color: 'var(--cor-texto-fraco)',
                      margin: '0 auto 12px',
                    }}
                  />
                  <p className="font-medium mb-1">Sem posts agendados</p>
                  <p
                    className="text-sm"
                    style={{ color: 'var(--cor-texto-muted)' }}
                  >
                    Clica em "Agendar post" para começar
                  </p>
                </div>
              )}

              {posts.map((p) => (
                <div key={p.id} className="card flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                    style={{
                      background: `${COR_PLATAFORMA[p.plataforma]}15`,
                      border: `1px solid ${COR_PLATAFORMA[p.plataforma]}30`,
                    }}
                  >
                    {p.plataforma === 'instagram' ? '📸' : '🎵'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm truncate">
                        {p.titulo}
                      </span>

                      <span
                        className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          background: `${COR_ESTADO[p.estado]}15`,
                          color: COR_ESTADO[p.estado],
                          border: `1px solid ${COR_ESTADO[p.estado]}30`,
                        }}
                      >
                        {p.estado}
                      </span>

                      <span
                        className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          background: 'var(--cor-elevado)',
                          color: 'var(--cor-texto-muted)',
                          border: '1px solid var(--cor-borda)',
                        }}
                      >
                        {p.formato}
                      </span>
                    </div>

                    <p
                      className="text-xs line-clamp-1"
                      style={{ color: 'var(--cor-texto-muted)' }}
                    >
                      {p.legenda}
                    </p>

                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Clock
                        size={11}
                        style={{ color: 'var(--cor-texto-fraco)' }}
                      />

                      <span
                        className="text-xs"
                        style={{ color: 'var(--cor-texto-fraco)' }}
                      >
                        {new Date(p.dataHora).toLocaleString('pt-PT', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setModalPost({ post: p })}
                      className="p-2 rounded-lg transition-colors"
                      style={{
                        color: 'var(--cor-texto-muted)',
                        background: 'var(--cor-elevado)',
                      }}
                    >
                      <Edit3 size={14} />
                    </button>

                    <button
                      onClick={() => apagarPost(p.id)}
                      className="p-2 rounded-lg transition-colors"
                      style={{
                        color: 'var(--cor-erro)',
                        background: 'rgba(248,113,113,0.1)',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {abaAtiva === 'gatilhos' && (
            <div className="flex flex-col gap-3">
              <div
                className="p-4 rounded-xl flex items-start gap-3"
                style={{
                  background: 'rgba(124,123,250,0.08)',
                  border: '1px solid rgba(124,123,250,0.2)',
                }}
              >
                <Bot
                  size={18}
                  style={{ color: 'var(--cor-marca)', flexShrink: 0 }}
                />

                <div>
                  <p className="text-sm font-medium mb-0.5">
                    Como funcionam os gatilhos
                  </p>

                  <p
                    className="text-xs"
                    style={{ color: 'var(--cor-texto-muted)' }}
                  >
                    Quando alguém comenta ou envia DM com uma das palavras-chave,
                    o sistema envia automaticamente a resposta configurada.
                  </p>
                </div>
              </div>

              {gatilhos.map((g) => (
                <div key={g.id} className="card flex flex-col gap-0">
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleGatilho(g.id)} className="flex-shrink-0">
                      {g.ativo ? (
                        <ToggleRight
                          size={28}
                          style={{ color: 'var(--cor-marca)' }}
                        />
                      ) : (
                        <ToggleLeft
                          size={28}
                          style={{ color: 'var(--cor-texto-fraco)' }}
                        />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{g.nome}</span>

                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            background: `${COR_PLATAFORMA[g.plataforma]}15`,
                            color: COR_PLATAFORMA[g.plataforma],
                            border: `1px solid ${COR_PLATAFORMA[g.plataforma]}30`,
                          }}
                        >
                          {g.plataforma}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {g.palavrasChave.map((p) => (
                          <span
                            key={p}
                            className="text-xs px-2 py-0.5 rounded-full font-mono"
                            style={{
                              background: 'rgba(124,123,250,0.1)',
                              color: 'var(--cor-marca)',
                              border: '1px solid rgba(124,123,250,0.2)',
                            }}
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 hidden sm:block">
                      <p
                        className="text-xs"
                        style={{ color: 'var(--cor-texto-muted)' }}
                      >
                        <span
                          className="font-semibold"
                          style={{ color: 'var(--cor-texto)' }}
                        >
                          {g.estatisticas.ativacoes}
                        </span>{' '}
                        ativações
                      </p>

                      <p
                        className="text-xs"
                        style={{ color: 'var(--cor-texto-muted)' }}
                      >
                        <span
                          className="font-semibold"
                          style={{ color: 'var(--cor-marca)' }}
                        >
                          {g.estatisticas.dmsEnviados}
                        </span>{' '}
                        DMs enviados
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() =>
                          setExpandido(expandido === g.id ? null : g.id)
                        }
                        className="p-2 rounded-lg transition-colors"
                        style={{
                          color: 'var(--cor-texto-muted)',
                          background: 'var(--cor-elevado)',
                        }}
                      >
                        {expandido === g.id ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                      </button>

                      <button
                        onClick={() => setModalGat({ gatilho: g })}
                        className="p-2 rounded-lg transition-colors"
                        style={{
                          color: 'var(--cor-texto-muted)',
                          background: 'var(--cor-elevado)',
                        }}
                      >
                        <Edit3 size={14} />
                      </button>

                      <button
                        onClick={() => apagarGatilho(g.id)}
                        className="p-2 rounded-lg transition-colors"
                        style={{
                          color: 'var(--cor-erro)',
                          background: 'rgba(248,113,113,0.1)',
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {expandido === g.id && (
                    <div
                      className="mt-4 pt-4 flex flex-col gap-3"
                      style={{ borderTop: '1px solid var(--cor-borda)' }}
                    >
                      <div>
                        <p
                          className="text-xs font-medium mb-1.5 flex items-center gap-1.5"
                          style={{ color: 'var(--cor-texto-muted)' }}
                        >
                          <MessageCircle size={12} /> Mensagem automática (DM)
                        </p>

                        <div
                          className="p-3 rounded-xl text-sm"
                          style={{
                            background: 'var(--cor-elevado)',
                            border: '1px solid var(--cor-borda)',
                          }}
                        >
                          {g.respostaDM}
                        </div>
                      </div>

                      {g.respostaComentario && (
                        <div>
                          <p
                            className="text-xs font-medium mb-1.5 flex items-center gap-1.5"
                            style={{ color: 'var(--cor-texto-muted)' }}
                          >
                            <Hash size={12} /> Resposta ao comentário
                          </p>

                          <div
                            className="p-3 rounded-xl text-sm"
                            style={{
                              background: 'var(--cor-elevado)',
                              border: '1px solid var(--cor-borda)',
                            }}
                          >
                            {g.respostaComentario}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {abaAtiva === 'funcionario' && (
            <div className="flex flex-col gap-5">
              <div
                className="p-5 rounded-2xl flex items-start gap-4"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(124,123,250,0.12), rgba(192,132,252,0.08))',
                  border: '1px solid rgba(124,123,250,0.25)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{
                    background: 'rgba(124,123,250,0.18)',
                    border: '1px solid rgba(124,123,250,0.35)',
                  }}
                >
                  🤖
                </div>

                <div>
                  <h3
                    className="font-bold text-lg mb-1"
                    style={{ fontFamily: 'var(--fonte-display)' }}
                  >
                    Funcionário IA
                  </h3>

                  <p
                    className="text-sm"
                    style={{ color: 'var(--cor-texto-muted)' }}
                  >
                    Configura a AdPulse para gerar conteúdos automaticamente todos
                    os dias e guardar tudo na biblioteca.
                  </p>
                </div>
              </div>

              {carregandoAuto ? (
                <div className="card flex items-center justify-center py-12">
                  <Loader
                    size={22}
                    className="animate-spin"
                    style={{ color: 'var(--cor-marca)' }}
                  />
                </div>
              ) : (
                <div className="card flex flex-col gap-5">
                  <div className="flex items-center justify-between p-4 rounded-xl"
                    style={{
                      background: autoConfig.ativo
                        ? 'rgba(52,211,153,0.08)'
                        : 'var(--cor-elevado)',
                      border: `1px solid ${
                        autoConfig.ativo
                          ? 'rgba(52,211,153,0.25)'
                          : 'var(--cor-borda)'
                      }`,
                    }}
                  >
                    <div>
                      <p className="font-semibold text-sm">
                        Auto-geração diária
                      </p>

                      <p
                        className="text-xs mt-1"
                        style={{ color: 'var(--cor-texto-muted)' }}
                      >
                        {autoConfig.ativo
                          ? 'O funcionário IA está ativo.'
                          : 'O funcionário IA está desligado.'}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        setAutoConfig((prev) => ({
                          ...prev,
                          ativo: !prev.ativo,
                        }))
                      }
                    >
                      {autoConfig.ativo ? (
                        <ToggleRight size={34} style={{ color: '#34d399' }} />
                      ) : (
                        <ToggleLeft
                          size={34}
                          style={{ color: 'var(--cor-texto-fraco)' }}
                        />
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className="text-xs mb-1.5 block"
                        style={{ color: 'var(--cor-texto-muted)' }}
                      >
                        Quantidade por dia
                      </label>

                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={autoConfig.quantidade_dia}
                        onChange={(e) =>
                          setAutoConfig((prev) => ({
                            ...prev,
                            quantidade_dia: Number(e.target.value),
                          }))
                        }
                        className="input-campo w-full"
                      />
                    </div>

                    <div>
                      <label
                        className="text-xs mb-1.5 block"
                        style={{ color: 'var(--cor-texto-muted)' }}
                      >
                        Hora preferida
                      </label>

                      <input
                        type="time"
                        value={autoConfig.hora_preferida}
                        onChange={(e) =>
                          setAutoConfig((prev) => ({
                            ...prev,
                            hora_preferida: e.target.value,
                          }))
                        }
                        className="input-campo w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className="text-xs mb-1.5 block"
                      style={{ color: 'var(--cor-texto-muted)' }}
                    >
                      Nicho principal
                    </label>

                    <input
                      value={autoConfig.nicho}
                      onChange={(e) =>
                        setAutoConfig((prev) => ({
                          ...prev,
                          nicho: e.target.value,
                        }))
                      }
                      placeholder="Ex: motivação, negócios, desporto..."
                      className="input-campo w-full"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label
                        className="text-xs mb-1.5 block"
                        style={{ color: 'var(--cor-texto-muted)' }}
                      >
                        Plataforma
                      </label>

                      <select
                        value={autoConfig.plataforma}
                        onChange={(e) =>
                          setAutoConfig((prev) => ({
                            ...prev,
                            plataforma: e.target.value,
                          }))
                        }
                        className="input-campo w-full"
                      >
                        <option value="instagram">Instagram</option>
                        <option value="tiktok">TikTok</option>
                        <option value="youtube">YouTube</option>
                        <option value="linkedin">LinkedIn</option>
                      </select>
                    </div>

                    <div>
                      <label
                        className="text-xs mb-1.5 block"
                        style={{ color: 'var(--cor-texto-muted)' }}
                      >
                        Formato
                      </label>

                      <select
                        value={autoConfig.formato}
                        onChange={(e) =>
                          setAutoConfig((prev) => ({
                            ...prev,
                            formato: e.target.value,
                          }))
                        }
                        className="input-campo w-full"
                      >
                        <option value="post">Post</option>
                        <option value="reel">Reel</option>
                        <option value="carrossel">Carrossel</option>
                        <option value="story">Story</option>
                        <option value="short">Short</option>
                      </select>
                    </div>

                    <div>
                      <label
                        className="text-xs mb-1.5 block"
                        style={{ color: 'var(--cor-texto-muted)' }}
                      >
                        Modo
                      </label>

                      <select
                        value={autoConfig.modo}
                        onChange={(e) =>
                          setAutoConfig((prev) => ({
                            ...prev,
                            modo: e.target.value,
                          }))
                        }
                        className="input-campo w-full"
                      >
                        <option value="normal">Normal</option>
                        <option value="viral">Viral</option>
                        <option value="autoridade">Autoridade</option>
                        <option value="polemico">Polémico</option>
                        <option value="educativo">Educativo</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={guardarAutoGerador}
                    disabled={guardandoAuto}
                    className="btn-primario justify-center"
                  >
                    {guardandoAuto ? (
                      <>
                        <Loader size={16} className="animate-spin" />
                        A guardar...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Guardar funcionário IA
                      </>
                    )}
                  </button>

                  {mensagemAuto && (
                    <p
                      className="text-sm text-center"
                      style={{
                        color: mensagemAuto.startsWith('✅')
                          ? 'var(--cor-sucesso)'
                          : 'var(--cor-erro)',
                      }}
                    >
                      {mensagemAuto}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </LayoutPainel>

      {modalPost && (
        <ModalPost
          post={modalPost.post}
          onGuardar={guardarPost}
          onFechar={() => setModalPost(null)}
        />
      )}

      {modalGatilho && (
        <ModalGatilho
          gatilho={modalGatilho.gatilho}
          onGuardar={guardarGatilho}
          onFechar={() => setModalGat(null)}
        />
      )}
    </>
  )
}
