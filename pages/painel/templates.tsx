// ============================================
// AdPulse — Biblioteca de Templates (Pro)
// ============================================

import Head from 'next/head'
import { useState } from 'react'
import { Copy, Check, Search, Sparkles, Star } from 'lucide-react'
import LayoutPainel from '@/components/layout/LayoutPainel'
import BloqueadoPro from '@/components/BloqueadoPro'
import { usePlano } from '@/hooks/usePlano'

type Template = {
  id: string
  titulo: string
  conteudo: string
  categoria: 'hook' | 'legenda' | 'carrossel' | 'ideia'
  nicho: string
  plataforma: string
  score: number
  pro: boolean
}

const TEMPLATES: Template[] = [
  // ---- HOOKS ----
  { id: 'h1', titulo: 'Hook de erro pessoal', conteudo: 'O erro que me custou [valor] este ano (e o que aprendi)...', categoria: 'hook', nicho: 'Negócios', plataforma: 'Instagram', score: 94, pro: true },
  { id: 'h2', titulo: 'Hook POV', conteudo: 'POV: Acordas às 5h da manhã por 30 dias seguidos e isto acontece...', categoria: 'hook', nicho: 'Lifestyle', plataforma: 'TikTok', score: 91, pro: true },
  { id: 'h3', titulo: 'Hook de transformação', conteudo: 'Em [tempo], passei de [situação inicial] para [situação final]. Aqui está como...', categoria: 'hook', nicho: 'Fitness', plataforma: 'Instagram', score: 89, pro: true },
  { id: 'h4', titulo: 'Hook de lista', conteudo: '[Número] coisas que ninguém te conta sobre [tema] (o #[número] vai surpreender-te)...', categoria: 'hook', nicho: 'Educação', plataforma: 'YouTube', score: 87, pro: true },
  { id: 'h5', titulo: 'Hook de segredo', conteudo: 'O segredo que os [autoridade no nicho] não querem que saibas sobre [tema]...', categoria: 'hook', nicho: 'Marketing', plataforma: 'LinkedIn', score: 85, pro: true },
  { id: 'h6', titulo: 'Hook de pergunta', conteudo: 'Já te perguntaste porque é que [situação comum] acontece mesmo quando [esforço]?', categoria: 'hook', nicho: 'Psicologia', plataforma: 'Instagram', score: 83, pro: true },
  { id: 'h7', titulo: 'Hook de contradição', conteudo: 'Para de [ação comum]. É isso que te está a impedir de [resultado desejado]...', categoria: 'hook', nicho: 'Negócios', plataforma: 'TikTok', score: 92, pro: true },
  { id: 'h8', titulo: 'Hook de urgência', conteudo: 'Se ainda fazes [ação], para AGORA. Aqui está o porquê...', categoria: 'hook', nicho: 'Saúde', plataforma: 'Instagram', score: 88, pro: true },

  // ---- LEGENDAS ----
  { id: 'l1', titulo: 'Legenda storytelling', conteudo: 'Há [tempo], estava [situação difícil].\n\nNão sabia o que fazer.\n\nFoi então que descobri [solução/aprendizagem].\n\nIsso mudou tudo.\n\n[Resultado alcançado].\n\nSe estás a passar pelo mesmo, sabe que [mensagem de esperança].\n\nGuarda este post para quando precisares lembrar. 💜\n\n[hashtags]', categoria: 'legenda', nicho: 'Lifestyle', plataforma: 'Instagram', score: 93, pro: true },
  { id: 'l2', titulo: 'Legenda educativa', conteudo: '[Número] razões porque [tema]:\n\n1️⃣ [Razão 1]\n2️⃣ [Razão 2]\n3️⃣ [Razão 3]\n\nQual delas não sabias?\n\nGuarda este post e partilha com alguém que precisa de ver isto! 👇\n\n[hashtags]', categoria: 'legenda', nicho: 'Educação', plataforma: 'Instagram', score: 88, pro: true },
  { id: 'l3', titulo: 'Legenda de produto/serviço', conteudo: 'Cansado/a de [problema comum]?\n\n[Nome do produto/serviço] foi criado exatamente para isso.\n\n✅ [Benefício 1]\n✅ [Benefício 2]\n✅ [Benefício 3]\n\n[CTA] 👇\n\n[hashtags]', categoria: 'legenda', nicho: 'E-commerce', plataforma: 'Instagram', score: 85, pro: true },
  { id: 'l4', titulo: 'Legenda motivacional', conteudo: 'Lembra-te:\n\n[Frase motivacional poderosa].\n\nNão importa onde estás agora.\n\nO que importa é para onde vais.\n\nGuarda este post para os dias difíceis. 💪\n\n[hashtags]', categoria: 'legenda', nicho: 'Motivação', plataforma: 'Instagram', score: 86, pro: true },

  // ---- CARROSSEIS ----
  { id: 'c1', titulo: 'Carrossel "X erros"', conteudo: 'Slide 1: [Número] erros que estás a cometer em [tema]\nSlide 2: Erro #1 — [Erro] → [Solução]\nSlide 3: Erro #2 — [Erro] → [Solução]\nSlide 4: Erro #3 — [Erro] → [Solução]\nSlide 5: Erro #4 — [Erro] → [Solução]\nSlide 6: O que fazer em vez disso\nSlide 7: Resumo + CTA (Guarda este carrossel!)', categoria: 'carrossel', nicho: 'Negócios', plataforma: 'Instagram', score: 95, pro: true },
  { id: 'c2', titulo: 'Carrossel "Guia passo a passo"', conteudo: 'Slide 1: Como [resultado] em [tempo] (Guia completo)\nSlide 2: Passo 1 — [Ação]\nSlide 3: Passo 2 — [Ação]\nSlide 4: Passo 3 — [Ação]\nSlide 5: Passo 4 — [Ação]\nSlide 6: Erros a evitar\nSlide 7: Resultado final + CTA', categoria: 'carrossel', nicho: 'Educação', plataforma: 'Instagram', score: 92, pro: true },
  { id: 'c3', titulo: 'Carrossel "Antes vs Depois"', conteudo: 'Slide 1: Antes vs Depois de [tema]\nSlide 2: ANTES — [Situação negativa]\nSlide 3: O que mudou\nSlide 4: DEPOIS — [Situação positiva]\nSlide 5: Como chegaste aqui\nSlide 6: A tua vez — CTA', categoria: 'carrossel', nicho: 'Transformação', plataforma: 'Instagram', score: 90, pro: true },
  { id: 'c4', titulo: 'Carrossel "Dicas rápidas"', conteudo: 'Slide 1: [Número] dicas rápidas sobre [tema]\nSlide 2: Dica 1 — [Dica curta e direta]\nSlide 3: Dica 2 — [Dica curta e direta]\nSlide 4: Dica 3 — [Dica curta e direta]\nSlide 5: Dica 4 — [Dica curta e direta]\nSlide 6: Dica 5 — [Dica curta e direta]\nSlide 7: Partilha com alguém que precisa!', categoria: 'carrossel', nicho: 'Geral', plataforma: 'Instagram', score: 88, pro: true },

  // ---- IDEIAS ----
  { id: 'i1', titulo: 'Bastidores do negócio', conteudo: 'Mostra um dia na tua vida / bastidores do teu trabalho. As pessoas adoram ver o processo real por trás dos resultados.', categoria: 'ideia', nicho: 'Negócios', plataforma: 'Instagram', score: 89, pro: true },
  { id: 'i2', titulo: 'Responde a uma dúvida comum', conteudo: 'Pergunta frequente que recebes → responde em formato Reel ou carrossel. Começa com "A pergunta que me fazem SEMPRE..."', categoria: 'ideia', nicho: 'Educação', plataforma: 'TikTok', score: 91, pro: true },
  { id: 'i3', titulo: 'Tendência adaptada ao nicho', conteudo: 'Pega numa tendência viral (som, formato, challenge) e adapta ao teu nicho. Mantém o formato mas muda o conteúdo para o teu tema.', categoria: 'ideia', nicho: 'Geral', plataforma: 'TikTok', score: 93, pro: true },
  { id: 'i4', titulo: 'Opinião polémica (mas construtiva)', conteudo: '"Opinião impopular sobre [tema do teu nicho]: [opinião que vai contra o senso comum mas que tens razão]." Gera debate e engagement.', categoria: 'ideia', nicho: 'Negócios', plataforma: 'LinkedIn', score: 87, pro: true },
  { id: 'i5', titulo: 'Tutorial ultra-rápido (60 segundos)', conteudo: 'Ensina uma coisa específica em menos de 60 segundos. Quanto mais específico e útil, melhor. Ex: "Como fazer X em 3 passos"', categoria: 'ideia', nicho: 'Educação', plataforma: 'YouTube', score: 90, pro: true },
  { id: 'i6', titulo: 'Comparação "X vs Y"', conteudo: 'Compara duas opções, ferramentas, métodos ou estratégias do teu nicho. Dá a tua opinião honesta sobre qual é melhor e porquê.', categoria: 'ideia', nicho: 'Tecnologia', plataforma: 'YouTube', score: 86, pro: true },
]

const CATEGORIAS = [
  { id: 'todos',    label: 'Todos',      emoji: '✨' },
  { id: 'hook',     label: 'Hooks',      emoji: '🎣' },
  { id: 'legenda',  label: 'Legendas',   emoji: '✍️' },
  { id: 'carrossel',label: 'Carrosseis', emoji: '🎠' },
  { id: 'ideia',    label: 'Ideias',     emoji: '💡' },
]

const COR_CAT: Record<string, string> = {
  hook:      '#7c7bfa',
  legenda:   '#34d399',
  carrossel: '#f472b6',
  ideia:     '#fbbf24',
}

export default function Templates() {
  const { isPro, carregando } = usePlano()
  const [categoria, setCat]   = useState('todos')
  const [pesquisa, setPesq]   = useState('')
  const [copiado, setCopiado] = useState<string | null>(null)

  const copiar = (id: string, texto: string) => {
    navigator.clipboard.writeText(texto)
    setCopiado(id)
    setTimeout(() => setCopiado(null), 2000)
  }

  if (carregando) return (
    <LayoutPainel titulo="Templates">
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-6 h-6 border-2 border-t-transparent rounded-full" style={{ borderColor: 'var(--cor-marca)' }} />
      </div>
    </LayoutPainel>
  )

  if (!isPro) return (
    <LayoutPainel titulo="Templates">
      <BloqueadoPro
        funcionalidade="Biblioteca de Templates"
        descricao="Acede a dezenas de hooks, legendas, estruturas de carrossel e ideias de conteúdo prontas a usar e personalizar."
        emoji="📚"
      />
    </LayoutPainel>
  )

  const filtrados = TEMPLATES.filter(t => {
    const mCat = categoria === 'todos' || t.categoria === categoria
    const mPesq = pesquisa === '' ||
      t.titulo.toLowerCase().includes(pesquisa.toLowerCase()) ||
      t.conteudo.toLowerCase().includes(pesquisa.toLowerCase()) ||
      t.nicho.toLowerCase().includes(pesquisa.toLowerCase())
    return mCat && mPesq
  })

  return (
    <>
      <Head><title>Templates — AdPulse</title></Head>
      <LayoutPainel titulo="Biblioteca de Templates">
        <div className="max-w-5xl mx-auto flex flex-col gap-6">

          {/* Header */}
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(124,123,250,0.08), rgba(244,114,182,0.08))', border: '1px solid rgba(124,123,250,0.2)' }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: 'rgba(124,123,250,0.15)', border: '1px solid rgba(124,123,250,0.3)' }}>
                📚
              </div>
              <div>
                <h2 className="font-bold text-xl" style={{ fontFamily: 'var(--fonte-display)' }}>
                  Biblioteca de Templates
                </h2>
                <p className="text-sm mt-1" style={{ color: 'var(--cor-texto-muted)' }}>
                  {TEMPLATES.length} templates prontos a usar — copia, personaliza e publica!
                </p>
              </div>
            </div>
          </div>

          {/* Filtros + Pesquisa */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-2 flex-wrap">
              {CATEGORIAS.map(c => (
                <button key={c.id} onClick={() => setCat(c.id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: categoria === c.id ? 'rgba(124,123,250,0.15)' : 'var(--cor-elevado)',
                    border: `1px solid ${categoria === c.id ? 'rgba(124,123,250,0.4)' : 'var(--cor-borda)'}`,
                    color: categoria === c.id ? 'var(--cor-marca)' : 'var(--cor-texto-muted)',
                  }}>
                  {c.emoji} {c.label}
                  <span className="text-xs px-1.5 py-0.5 rounded-full"
                    style={{ background: categoria === c.id ? 'rgba(124,123,250,0.2)' : 'var(--cor-borda)', color: categoria === c.id ? 'var(--cor-marca)' : 'var(--cor-texto-fraco)' }}>
                    {c.id === 'todos' ? TEMPLATES.length : TEMPLATES.filter(t => t.categoria === c.id).length}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 flex-1 min-w-48 px-3 py-2 rounded-xl"
              style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)' }}>
              <Search size={14} style={{ color: 'var(--cor-texto-muted)', flexShrink: 0 }} />
              <input value={pesquisa} onChange={e => setPesq(e.target.value)}
                placeholder="Pesquisar templates..."
                style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--cor-texto)', fontSize: 13, width: '100%' }} />
            </div>
          </div>

          {/* Grid de templates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtrados.map(t => (
              <div key={t.id} className="card flex flex-col gap-3"
                style={{ border: `1px solid ${COR_CAT[t.categoria]}20` }}>

                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
                      style={{ background: `${COR_CAT[t.categoria]}15`, color: COR_CAT[t.categoria], border: `1px solid ${COR_CAT[t.categoria]}25` }}>
                      {t.categoria === 'hook' ? '🎣 Hook' : t.categoria === 'legenda' ? '✍️ Legenda' : t.categoria === 'carrossel' ? '🎠 Carrossel' : '💡 Ideia'}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'var(--cor-elevado)', color: 'var(--cor-texto-muted)', border: '1px solid var(--cor-borda)' }}>
                      {t.nicho}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'var(--cor-elevado)', color: 'var(--cor-texto-muted)', border: '1px solid var(--cor-borda)' }}>
                      {t.plataforma}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Star size={11} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
                    <span className="text-xs font-bold" style={{ color: t.score >= 90 ? 'var(--cor-sucesso)' : 'var(--cor-marca)' }}>{t.score}</span>
                  </div>
                </div>

                <h3 className="font-semibold text-sm" style={{ fontFamily: 'var(--fonte-display)' }}>{t.titulo}</h3>

                {/* Conteúdo */}
                <div className="p-3 rounded-xl text-xs leading-relaxed whitespace-pre-line flex-1"
                  style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', color: 'var(--cor-texto-muted)', maxHeight: 120, overflow: 'hidden', position: 'relative' }}>
                  {t.conteudo}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, background: 'linear-gradient(transparent, var(--cor-elevado))' }} />
                </div>

                {/* Botão copiar */}
                <button onClick={() => copiar(t.id, t.conteudo)}
                  className="flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: copiado === t.id ? 'rgba(52,211,153,0.1)' : `${COR_CAT[t.categoria]}10`,
                    border: `1px solid ${copiado === t.id ? 'rgba(52,211,153,0.3)' : COR_CAT[t.categoria] + '25'}`,
                    color: copiado === t.id ? 'var(--cor-sucesso)' : COR_CAT[t.categoria],
                  }}>
                  {copiado === t.id
                    ? <><Check size={14} /> Copiado!</>
                    : <><Copy size={14} /> Copiar template</>}
                </button>
              </div>
            ))}
          </div>

          {filtrados.length === 0 && (
            <div className="card flex flex-col items-center justify-center text-center py-16">
              <div className="text-4xl mb-3">🔍</div>
              <p className="font-semibold" style={{ fontFamily: 'var(--fonte-display)' }}>Nenhum template encontrado</p>
              <p className="text-sm mt-1" style={{ color: 'var(--cor-texto-muted)' }}>Tenta outra pesquisa ou categoria</p>
            </div>
          )}
        </div>
      </LayoutPainel>
    </>
  )
}
