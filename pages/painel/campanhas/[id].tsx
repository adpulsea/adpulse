// ============================================
// AdPulse — Detalhe da Campanha
// Preparar posts, stories, legendas e conteúdos
// Preparar posts, stories, legendas, imagens e conteúdos
// Com editar campanha + nova campanha + gerar imagem
// ============================================
import Head from 'next/head'
@@ -20,6 +21,10 @@ import {
  FileText,
  ImageIcon,
  MessageSquare,
  Edit3,
  Sparkles,
  X,
  FolderOpen,
} from 'lucide-react'
import LayoutPainel from '@/components/layout/LayoutPainel'
import { useAuth } from '@/hooks/useAuth'
@@ -97,10 +102,25 @@ export default function DetalheCampanha() {
  const [conteudos, setConteudos] = useState<ConteudoCampanha[]>([])
  const [carregando, setCarregando] = useState(true)
  const [formAberto, setFormAberto] = useState(false)
  const [modalEditarAberto, setModalEditarAberto] = useState(false)
  const [modalNovaCampanhaAberto, setModalNovaCampanhaAberto] = useState(false)

  const [salvando, setSalvando] = useState(false)
  const [salvandoCampanha, setSalvandoCampanha] = useState(false)
  const [criandoNovaCampanha, setCriandoNovaCampanha] = useState(false)
  const [gerandoImagem, setGerandoImagem] = useState(false)

  const [mensagem, setMensagem] = useState('')
  const [form, setForm] = useState(FORM_INICIAL)

  const [editNome, setEditNome] = useState('')
  const [editDescricao, setEditDescricao] = useState('')
  const [editPlataformas, setEditPlataformas] = useState<string[]>(['instagram'])

  const [novoNome, setNovoNome] = useState('')
  const [novaDescricao, setNovaDescricao] = useState('')
  const [novaPlataformas, setNovaPlataformas] = useState<string[]>(['instagram'])

  const campanhaId = typeof id === 'string' ? id : ''

  useEffect(() => {
@@ -137,9 +157,176 @@ export default function DetalheCampanha() {

    setCampanha(campanhaData || null)
    setConteudos(conteudosData || [])

    if (campanhaData) {
      setEditNome(campanhaData.nome || '')
      setEditDescricao(campanhaData.descricao || '')
      setEditPlataformas(campanhaData.plataformas || ['instagram'])
    }

    setCarregando(false)
  }

  const toggleEditPlataforma = (p: string) => {
    setEditPlataformas((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    )
  }

  const toggleNovaPlataforma = (p: string) => {
    setNovaPlataformas((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    )
  }

  const guardarEdicaoCampanha = async () => {
    if (!utilizador || !campanha || !editNome.trim()) return

    setSalvandoCampanha(true)

    const { data, error } = await supabase
      .from('campanhas')
      .update({
        nome: editNome.trim(),
        descricao: editDescricao.trim(),
        plataformas: editPlataformas.length ? editPlataformas : ['instagram'],
      })
      .eq('id', campanha.id)
      .eq('utilizador_id', utilizador.id)
      .select('*')
      .single()

    if (error) {
      alert(error.message || 'Erro ao editar campanha.')
      setSalvandoCampanha(false)
      return
    }

    setCampanha(data)
    setModalEditarAberto(false)
    setSalvandoCampanha(false)
    mostrarMensagem('Campanha atualizada.')
  }

  const criarNovaCampanha = async () => {
    if (!utilizador || !novoNome.trim()) return

    setCriandoNovaCampanha(true)

    const { data, error } = await supabase
      .from('campanhas')
      .insert({
        utilizador_id: utilizador.id,
        nome: novoNome.trim(),
        descricao: novaDescricao.trim(),
        plataformas: novaPlataformas.length ? novaPlataformas : ['instagram'],
        total_posts: 0,
      })
      .select('*')
      .single()

    if (error) {
      alert(error.message || 'Erro ao criar nova campanha.')
      setCriandoNovaCampanha(false)
      return
    }

    setNovoNome('')
    setNovaDescricao('')
    setNovaPlataformas(['instagram'])
    setModalNovaCampanhaAberto(false)
    setCriandoNovaCampanha(false)

    router.push(`/painel/campanhas/${data.id}`)
  }

  const gerarImagemAdPulse = async () => {
    if (!form.texto.trim() && !form.titulo.trim()) {
      alert('Escreve primeiro o texto para imagem ou o título.')
      return
    }

    setGerandoImagem(true)

    const textoImagem = form.texto.trim() || form.titulo.trim()

    const promptAdPulse = `
Cria uma imagem vertical premium para Instagram, formato 4:5 ou 1:1, para a marca AdPulse.

Identidade visual obrigatória:
- fundo escuro quase preto / navy profundo
- estilo SaaS premium
- neon roxo, violeta e rosa
- glow subtil
- cards arredondados tipo interface
- visual moderno, tecnológico e limpo
- alto contraste
- tipografia grande e muito legível
- composição profissional para feed de Instagram
- estética semelhante a uma plataforma de IA para criação de conteúdo

Marca:
AdPulse é uma plataforma com IA para criar posts, imagens e calendário de conteúdo para redes sociais.

Texto principal que deve aparecer na imagem:
"${textoImagem}"

Contexto da campanha:
"${campanha?.nome || 'Campanha AdPulse'}"

Descrição:
"${campanha?.descricao || ''}"

Não uses elementos confusos.
Não coloques texto pequeno demais.
Não inventes preços se não forem pedidos.
Mantém o visual pronto para publicação.
`

    try {
      const res = await fetch('/api/ia/gerar-imagem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptAdPulse,
          texto: textoImagem,
          plataforma: form.plataforma,
          formato: form.formato,
          estilo: 'adpulse_premium_dark_neon',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.erro || data?.error || 'Erro ao gerar imagem.')
      }

      const imagem =
        data?.url ||
        data?.imagem_url ||
        data?.imageUrl ||
        data?.image_url ||
        data?.data?.[0]?.url ||
        ''

      if (!imagem) {
        throw new Error('A imagem foi gerada, mas a API não devolveu uma URL reconhecida.')
      }

      setForm((atual) => ({
        ...atual,
        imagem_url: imagem,
      }))

      mostrarMensagem('Imagem gerada e adicionada ao conteúdo.')
    } catch (error: any) {
      alert(error?.message || 'Erro ao gerar imagem.')
    } finally {
      setGerandoImagem(false)
    }
  }

  const guardarConteudo = async () => {
    if (!utilizador || !campanhaId || !form.titulo.trim()) return

@@ -260,6 +447,7 @@ ${c.imagem_url || 'Sem imagem'}`
        <Head>
          <title>Campanha — AdPulse</title>
        </Head>

        <LayoutPainel titulo="Campanha">
          <div className="flex items-center justify-center py-20">
            <Loader size={26} className="animate-spin" style={{ color: 'var(--cor-marca)' }} />
@@ -275,6 +463,7 @@ ${c.imagem_url || 'Sem imagem'}`
        <Head>
          <title>Campanha não encontrada — AdPulse</title>
        </Head>

        <LayoutPainel titulo="Campanha">
          <div className="card text-center py-14">
            <h2 className="text-xl font-bold mb-2">Campanha não encontrada</h2>
@@ -340,10 +529,22 @@ ${c.imagem_url || 'Sem imagem'}`
                </div>
              </div>

              <button onClick={() => setFormAberto(true)} className="btn-primario">
                <Plus size={16} />
                Adicionar conteúdo
              </button>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setModalEditarAberto(true)} className="btn-secundario">
                  <Edit3 size={15} />
                  Editar campanha
                </button>

                <button onClick={() => setModalNovaCampanhaAberto(true)} className="btn-secundario">
                  <FolderOpen size={15} />
                  Nova campanha
                </button>

                <button onClick={() => setFormAberto(true)} className="btn-primario">
                  <Plus size={16} />
                  Adicionar conteúdo
                </button>
              </div>
            </div>
          </div>

@@ -455,6 +656,43 @@ ${c.imagem_url || 'Sem imagem'}`
                  onChange={(e) => setForm({ ...form, texto: e.target.value })}
                  placeholder="Texto que vai aparecer na imagem, story ou criativo..."
                />

                <div
                  className="mt-3 rounded-xl p-3 flex items-start justify-between gap-3 flex-wrap"
                  style={{
                    background: 'rgba(124,123,250,0.08)',
                    border: '1px solid rgba(124,123,250,0.20)',
                  }}
                >
                  <div>
                    <p className="text-sm font-semibold flex items-center gap-2">
                      <Sparkles size={15} style={{ color: 'var(--cor-marca)' }} />
                      Gerar imagem com visual AdPulse
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--cor-texto-muted)' }}>
                      Usa o texto acima e cria uma imagem no estilo escuro, premium e neon da AdPulse.
                    </p>
                  </div>

                  <button
                    onClick={gerarImagemAdPulse}
                    disabled={gerandoImagem}
                    className="btn-primario"
                    style={gerandoImagem ? { opacity: 0.7 } : {}}
                  >
                    {gerandoImagem ? (
                      <>
                        <Loader size={14} className="animate-spin" />
                        A gerar...
                      </>
                    ) : (
                      <>
                        <Sparkles size={15} />
                        Gerar imagem
                      </>
                    )}
                  </button>
                </div>
              </Campo>

              <Campo label="Legenda">
@@ -482,8 +720,26 @@ ${c.imagem_url || 'Sem imagem'}`
                  className="input-campo"
                  value={form.imagem_url}
                  onChange={(e) => setForm({ ...form, imagem_url: e.target.value })}
                  placeholder="Cola aqui a URL da imagem, se já existir."
                  placeholder="A imagem gerada aparece aqui automaticamente."
                />

                {form.imagem_url && (
                  <div className="mt-3">
                    <p className="text-xs mb-2" style={{ color: 'var(--cor-texto-muted)' }}>
                      Pré-visualização da imagem
                    </p>
                    <img
                      src={form.imagem_url}
                      alt={form.titulo || 'Imagem gerada'}
                      className="rounded-xl max-h-80 object-contain"
                      style={{
                        border: '1px solid var(--cor-borda)',
                        background: '#050510',
                        maxWidth: '100%',
                      }}
                    />
                  </div>
                )}
              </Campo>

              <div className="flex gap-3 justify-end flex-wrap mt-5">
@@ -664,10 +920,192 @@ ${c.imagem_url || 'Sem imagem'}`
          )}
        </div>
      </LayoutPainel>

      {modalEditarAberto && (
        <ModalBase onFechar={() => setModalEditarAberto(false)} titulo="Editar campanha">
          <Campo label="Nome da campanha">
            <input
              className="input-campo"
              value={editNome}
              onChange={(e) => setEditNome(e.target.value)}
            />
          </Campo>

          <Campo label="Descrição">
            <textarea
              rows={4}
              className="input-campo resize-none"
              value={editDescricao}
              onChange={(e) => setEditDescricao(e.target.value)}
            />
          </Campo>

          <Campo label="Plataformas">
            <div className="flex flex-wrap gap-2">
              {['instagram', 'tiktok', 'youtube', 'linkedin'].map((p) => (
                <button
                  key={p}
                  onClick={() => toggleEditPlataforma(p)}
                  className="px-3 py-1.5 rounded-xl text-sm transition-all capitalize"
                  style={{
                    background: editPlataformas.includes(p)
                      ? `${COR_PLATAFORMA[p]}18`
                      : 'var(--cor-elevado)',
                    border: `1px solid ${
                      editPlataformas.includes(p)
                        ? COR_PLATAFORMA[p] + '50'
                        : 'var(--cor-borda)'
                    }`,
                    color: editPlataformas.includes(p)
                      ? COR_PLATAFORMA[p]
                      : 'var(--cor-texto-muted)',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </Campo>

          <div className="flex justify-end gap-3 mt-5">
            <button onClick={() => setModalEditarAberto(false)} className="btn-secundario">
              Cancelar
            </button>

            <button
              onClick={guardarEdicaoCampanha}
              disabled={salvandoCampanha || !editNome.trim()}
              className="btn-primario"
              style={salvandoCampanha || !editNome.trim() ? { opacity: 0.65 } : {}}
            >
              {salvandoCampanha ? (
                <>
                  <Loader size={14} className="animate-spin" />
                  A guardar...
                </>
              ) : (
                <>
                  <CheckCircle size={15} />
                  Guardar alterações
                </>
              )}
            </button>
          </div>
        </ModalBase>
      )}

      {modalNovaCampanhaAberto && (
        <ModalBase onFechar={() => setModalNovaCampanhaAberto(false)} titulo="Nova campanha">
          <Campo label="Nome da campanha">
            <input
              className="input-campo"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              placeholder="Ex: Conteúdo da próxima semana"
            />
          </Campo>

          <Campo label="Descrição">
            <textarea
              rows={4}
              className="input-campo resize-none"
              value={novaDescricao}
              onChange={(e) => setNovaDescricao(e.target.value)}
              placeholder="Objetivo desta campanha..."
            />
          </Campo>

          <Campo label="Plataformas">
            <div className="flex flex-wrap gap-2">
              {['instagram', 'tiktok', 'youtube', 'linkedin'].map((p) => (
                <button
                  key={p}
                  onClick={() => toggleNovaPlataforma(p)}
                  className="px-3 py-1.5 rounded-xl text-sm transition-all capitalize"
                  style={{
                    background: novaPlataformas.includes(p)
                      ? `${COR_PLATAFORMA[p]}18`
                      : 'var(--cor-elevado)',
                    border: `1px solid ${
                      novaPlataformas.includes(p)
                        ? COR_PLATAFORMA[p] + '50'
                        : 'var(--cor-borda)'
                    }`,
                    color: novaPlataformas.includes(p)
                      ? COR_PLATAFORMA[p]
                      : 'var(--cor-texto-muted)',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </Campo>

          <div className="flex justify-end gap-3 mt-5">
            <button onClick={() => setModalNovaCampanhaAberto(false)} className="btn-secundario">
              Cancelar
            </button>

            <button
              onClick={criarNovaCampanha}
              disabled={criandoNovaCampanha || !novoNome.trim()}
              className="btn-primario"
              style={criandoNovaCampanha || !novoNome.trim() ? { opacity: 0.65 } : {}}
            >
              {criandoNovaCampanha ? (
                <>
                  <Loader size={14} className="animate-spin" />
                  A criar...
                </>
              ) : (
                <>
                  <Plus size={15} />
                  Criar e abrir
                </>
              )}
            </button>
          </div>
        </ModalBase>
      )}
    </>
  )
}

function ModalBase({
  titulo,
  children,
  onFechar,
}: {
  titulo: string
  children: React.ReactNode
  onFechar: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(5px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onFechar()
      }}
    >
      <div className="card w-full max-w-xl" style={{ minWidth: 0 }}>
        <div className="flex items-center justify-between gap-4 mb-5">
          <h3 className="font-bold text-lg" style={{ fontFamily: 'var(--fonte-display)' }}>
            {titulo}
          </h3>

          <button onClick={onFechar} className="btn-secundario" style={{ padding: 8 }}>
            <X size={16} />
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}

function Campo({
  label,
  children,
