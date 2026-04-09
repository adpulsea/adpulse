// ============================================
// AdPulse — Agentes IA (ao serviço do cliente)
// ============================================

import Head from 'next/head'
import { useState, useEffect, useRef } from 'react'
import {
  Bot, Send, Loader, X, Sparkles, RefreshCw,
  MessageSquare, TrendingUp, Instagram, Search,
  Brain, Zap, ChevronDown, ChevronUp, Copy, Check
} from 'lucide-react'
import LayoutPainel from '@/components/layout/LayoutPainel'
import { useAuth } from '@/hooks/useAuth'

// ─── Tipos ───────────────────────────────────────────────────────────────────

type Mensagem = {
  role: 'user' | 'assistant'
  content: string
}

type Agente = {
  id: string
  nome: string
  cargo: string
  avatar: string
  cor: string
  descricao: string
  exemplos: string[]
  prompt_sistema: string
}

// ─── Os 5 Agentes ────────────────────────────────────────────────────────────

const AGENTES: Agente[] = [
  {
    id: 'suporte',
    nome: 'Agente de Suporte',
    cargo: 'Especialista AdPulse',
    avatar: '🤖',
    cor: '#7c7bfa',
    descricao: 'Tira todas as tuas dúvidas sobre a AdPulse — funcionalidades, planos, como usar cada ferramenta e resolver problemas.',
    exemplos: [
      'Como uso o Editor de Criativos?',
      'Qual a diferença entre o plano Pro e Agência?',
      'Como faço upload de fundos?',
      'O que é o Viral Lab?',
    ],
    prompt_sistema: `És o Agente de Suporte da AdPulse, uma plataforma portuguesa de marketing digital com IA. O teu papel é ajudar os utilizadores a tirar o máximo partido da AdPulse.

CONHECIMENTO COMPLETO DA ADPULSE:
- AI Content Studio: gera posts, legendas, scripts e conteúdo com IA para qualquer plataforma
- Editor de Criativos: editor visual estilo Canva com drag-and-drop, múltiplos slides para carrosséis, remoção de fundo automática com IA, fundos da biblioteca
- Biblioteca de Fundos: imagens prontas + upload próprio, definir fundos padrão por plataforma
- Biblioteca de Média: gestão de todos os ficheiros de media
- Viral Lab: análise de tendências virais e conteúdo em alta
- Creator Analyzer: análise de perfis de criadores de conteúdo
- Agentes IA: equipa de agentes especializados ao serviço do utilizador
- Equipa AdPulse: equipa interna de produção de conteúdo com IA
- Campanhas: gestão de campanhas de marketing
- Calendário: agendamento e calendário editorial
- Automação: fluxos automáticos de conteúdo
- Workspaces: espaços de trabalho para diferentes projetos
- Templates: modelos prontos a usar

PLANOS:
- Gratuito: 3 gerações de conteúdo por dia, acesso básico às ferramentas
- Pro (€29/mês): gerações ilimitadas, acesso a todas as ferramentas, agentes IA, editor completo
- Agência (€79/mês): tudo do Pro + multi-cliente, workspaces ilimitados, equipa colaborativa

Respondes sempre em português de Portugal. És simpático, claro e prático. Se não souberes algo, dizes honestamente e sugeres como o utilizador pode obter ajuda.`,
  },
  {
    id: 'consultor',
    nome: 'Consultor de Crescimento',
    cargo: 'Estratega Digital',
    avatar: '⚡',
    cor: '#fbbf24',
    descricao: 'Ajuda-te a definir a melhor estratégia de crescimento digital, escolher o plano ideal e criar um plano de ação personalizado.',
    exemplos: [
      'Qual plano é ideal para mim?',
      'Como crescer no Instagram rapidamente?',
      'Sou criador de conteúdo, por onde começo?',
      'Como usar a AdPulse para vender mais?',
    ],
    prompt_sistema: `És o Consultor de Crescimento da AdPulse, especialista em estratégia de marketing digital e crescimento nas redes sociais.

CONTEXTO ADPULSE:
A AdPulse é uma plataforma portuguesa de marketing digital com IA. Planos: Gratuito (3 gerações/dia), Pro (€29/mês, ilimitado), Agência (€79/mês, multi-cliente). Ferramentas: AI Content Studio, Editor de Criativos, Viral Lab, Creator Analyzer, Agentes IA, Calendário, Campanhas.

O teu papel é:
1. Perceber o perfil e objetivos do utilizador (criador, empresa, agência)
2. Recomendar o plano AdPulse mais adequado com justificação clara
3. Criar uma estratégia de crescimento personalizada com passos concretos
4. Sugerir como usar as ferramentas da AdPulse para atingir os objetivos
5. Dar dicas práticas de crescimento nas redes sociais

Fazes perguntas para perceber melhor a situação antes de dar recomendações. Os teus conselhos são específicos, práticos e baseados em dados reais de crescimento nas redes sociais. Respondes sempre em português de Portugal.`,
  },
  {
    id: 'instagram',
    nome: 'Agente Instagram',
    cargo: 'Especialista de Conteúdo Instagram',
    avatar: '📸',
    cor: '#e1306c',
    descricao: 'Cria planos semanais completos para o teu Instagram — temas, legendas, hashtags, horários e estratégia de crescimento.',
    exemplos: [
      'Cria um plano semanal para o meu Instagram',
      'Sou coach de fitness, o que publicar esta semana?',
      'Gera 5 ideias de Reels para a minha loja',
      'Que hashtags devo usar no meu nicho?',
    ],
    prompt_sistema: `És o Agente Instagram da AdPulse, especialista em criar estratégias e planos de conteúdo completos para Instagram.

O teu papel é criar planos semanais detalhados e personalizados para o Instagram do utilizador. Para cada plano incluis:

ESTRUTURA DO PLANO SEMANAL:
- Tema da semana e objetivo principal
- 7 ideias de conteúdo (1 por dia): tipo (post, reel, story, carrossel), tema específico, hook de abertura
- 3 legendas completas prontas a publicar (com emojis e CTA)
- Pack de hashtags: 10 grandes + 10 médias + 10 nicho
- Melhores horários de publicação para o nicho
- 1 tática de crescimento para a semana
- Dica de engagement (como responder a comentários, stories interativos)

Sempre perguntas o nicho/área do utilizador antes de criar o plano. O conteúdo é em português de Portugal por defeito mas adaptável. Respondes de forma organizada, com secções claras e conteúdo pronto a usar.`,
  },
  {
    id: 'prospeccao',
    nome: 'Agente de Prospeção',
    cargo: 'Especialista em Captação de Clientes',
    avatar: '🔍',
    cor: '#34d399',
    descricao: 'Encontra potenciais clientes para o teu negócio no Twitter/X, Reddit e LinkedIn, e cria mensagens de abordagem personalizadas.',
    exemplos: [
      'Encontra clientes para a minha agência de marketing',
      'Como prospectar no LinkedIn para vender serviços de design?',
      'Cria mensagens de abordagem para o meu negócio',
      'Que grupos do Reddit devo monitorizar?',
    ],
    prompt_sistema: `És o Agente de Prospeção da AdPulse, especialista em encontrar e abordar potenciais clientes nas redes sociais.

O teu papel é ajudar o utilizador a encontrar e converter potenciais clientes. Para cada sessão:

1. IDENTIFICAÇÃO DO PERFIL: Perguntas o negócio, produto/serviço, cliente ideal e plataformas preferidas

2. ESTRATÉGIA POR PLATAFORMA:
   - LinkedIn: tipos de perfis a procurar, palavras-chave de pesquisa, grupos relevantes, abordagem profissional
   - Twitter/X: hashtags a monitorizar, tipos de tweets que indicam necessidade, lista de perfis a seguir
   - Reddit: subreddits relevantes, tipo de posts a monitorizar, como participar genuinamente

3. TEMPLATES DE MENSAGENS:
   - Mensagem de conexão no LinkedIn (personalizada, não genérica)
   - DM no Twitter/X (curta e direta)
   - Resposta em comentários/posts do Reddit (que agrega valor)

4. PLANO DE PROSPEÇÃO: Rotina diária de 30 minutos com ações específicas por plataforma

O teu conselho é ético, baseado em criar valor genuíno, não em spam. Respondes sempre em português de Portugal.`,
  },
  {
    id: 'research',
    nome: 'Research & Intelligence',
    cargo: 'Analista de Mercado e IA',
    avatar: '🔬',
    cor: '#00f5d4',
    descricao: 'Monitoriza as últimas novidades de IA, mudanças de algoritmos das redes sociais, tendências do mercado e analisa a concorrência.',
    exemplos: [
      'Que novidades de IA saíram esta semana?',
      'O algoritmo do Instagram mudou recentemente?',
      'Analisa os concorrentes da AdPulse',
      'Quais as tendências de conteúdo para 2025?',
    ],
    prompt_sistema: `És o Agente Research & Intelligence da AdPulse, o especialista em monitorização de mercado, novidades de IA e inteligência competitiva.

O teu papel é produzir relatórios de inteligência detalhados sobre:

1. NOVIDADES DE IA: Últimos lançamentos e atualizações de OpenAI (ChatGPT, DALL-E), Anthropic (Claude), Google (Gemini), Meta AI, Midjourney, Stable Diffusion e outras ferramentas de IA relevantes para criadores de conteúdo e marketing digital

2. ALGORITMOS & PLATAFORMAS: Mudanças recentes nos algoritmos do Instagram, TikTok, YouTube, LinkedIn e Facebook. O que está a funcionar, o que mudou, o que vai mudar

3. TENDÊNCIAS DE CONTEÚDO: Formatos em alta, temas virais, tipos de conteúdo com maior engagement por plataforma

4. INTELIGÊNCIA COMPETITIVA: Análise de concorrentes da AdPulse (Canva, Buffer, Hootsuite, Later, Jasper, Copy.ai) — novas funcionalidades, preços, estratégias

5. OPORTUNIDADES: Gaps no mercado, oportunidades que a AdPulse pode aproveitar, tendências emergentes

Os teus relatórios são estruturados, com secções claras, bullet points e informação acionável. Respondes sempre em português de Portugal com consciência global do mercado.`,
  },
]

// ─── Componente principal ─────────────────────────────────────────────────────

export default function AgentesIA() {
  const { utilizador } = useAuth()
  const [agenteAtivo, setAgenteAtivo] = useState<Agente | null>(null)
  const [mensagens, setMensagens]     = useState<Mensagem[]>([])
  const [input, setInput]             = useState('')
  const [enviando, setEnviando]       = useState(false)
  const [copiado, setCopiado]         = useState<string | null>(null)
  const chatRef                       = useRef<HTMLDivElement>(null)
  const inputRef                      = useRef<HTMLInputElement>(null)

  // Scroll ao fundo
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [mensagens])

  // Foco no input ao abrir agente
  useEffect(() => {
    if (agenteAtivo) setTimeout(() => inputRef.current?.focus(), 100)
  }, [agenteAtivo])

  const abrirAgente = (agente: Agente) => {
    setAgenteAtivo(agente)
    setMensagens([{
      role: 'assistant',
      content: `Olá! Sou o ${agente.nome} da AdPulse. ${agente.descricao}\n\nComo te posso ajudar hoje?`,
    }])
    setInput('')
  }

  const fecharAgente = () => {
    setAgenteAtivo(null)
    setMensagens([])
    setInput('')
  }

  const enviar = async (texto?: string) => {
    const msg = texto || input.trim()
    if (!msg || !agenteAtivo || enviando) return
    setInput('')
    setMensagens(prev => [...prev, { role: 'user', content: msg }])
    setEnviando(true)

    try {
      const resp = await fetch('/api/ia/agente-executar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt_sistema: agenteAtivo.prompt_sistema,
          tarefa: msg,
          historico: mensagens.slice(-10),
        }),
      })
      const data = await resp.json()
      setMensagens(prev => [...prev, { role: 'assistant', content: data.resultado || 'Não consegui processar. Tenta novamente.' }])
    } catch {
      setMensagens(prev => [...prev, { role: 'assistant', content: 'Ocorreu um erro. Tenta novamente.' }])
    }
    setEnviando(false)
  }

  const copiar = (texto: string, id: string) => {
    navigator.clipboard.writeText(texto)
    setCopiado(id)
    setTimeout(() => setCopiado(null), 2000)
  }

  const limpar = () => {
    if (!agenteAtivo) return
    setMensagens([{
      role: 'assistant',
      content: `Olá! Sou o ${agenteAtivo.nome} da AdPulse. ${agenteAtivo.descricao}\n\nComo te posso ajudar hoje?`,
    }])
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <Head><title>Agentes IA — AdPulse</title></Head>
      <LayoutPainel titulo="Agentes IA">
        <div className="max-w-6xl mx-auto">

          {!agenteAtivo ? (
            /* ── Grelha de agentes ── */
            <div className="flex flex-col gap-6">

              {/* Header */}
              <div className="card" style={{ background: 'linear-gradient(135deg, rgba(124,123,250,0.1), rgba(0,245,212,0.06))', border: '1px solid rgba(124,123,250,0.2)' }}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                    style={{ background: 'rgba(124,123,250,0.15)', border: '1px solid rgba(124,123,250,0.3)' }}>
                    🤖
                  </div>
                  <div>
                    <h2 className="font-bold text-xl" style={{ fontFamily: 'var(--fonte-display)' }}>Agentes IA</h2>
                    <p className="text-sm mt-1" style={{ color: 'var(--cor-texto-muted)' }}>
                      A tua equipa de especialistas IA disponível 24/7 — suporte, estratégia, conteúdo, prospeção e inteligência de mercado.
                    </p>
                  </div>
                </div>
              </div>

              {/* Cards dos agentes */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {AGENTES.map(agente => (
                  <div key={agente.id}
                    onClick={() => abrirAgente(agente)}
                    className="card flex flex-col gap-4 cursor-pointer transition-all hover:scale-[1.02]"
                    style={{ border: `1px solid ${agente.cor}25` }}
                    onMouseOver={e => e.currentTarget.style.borderColor = `${agente.cor}60`}
                    onMouseOut={e => e.currentTarget.style.borderColor = `${agente.cor}25`}>

                    {/* Avatar + nome */}
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                        style={{ background: `${agente.cor}15`, border: `1px solid ${agente.cor}35` }}>
                        {agente.avatar}
                      </div>
                      <div>
                        <p className="font-semibold">{agente.nome}</p>
                        <p className="text-xs mt-0.5" style={{ color: agente.cor }}>{agente.cargo}</p>
                      </div>
                      <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
                        style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.25)' }}>
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        Online
                      </div>
                    </div>

                    {/* Descrição */}
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--cor-texto-muted)' }}>
                      {agente.descricao}
                    </p>

                    {/* Exemplos */}
                    <div className="flex flex-col gap-1.5">
                      <p className="text-xs font-medium" style={{ color: 'var(--cor-texto-fraco)' }}>Exemplos:</p>
                      {agente.exemplos.slice(0, 3).map((ex, i) => (
                        <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs"
                          style={{ background: 'var(--cor-elevado)', color: 'var(--cor-texto-muted)', border: '1px solid var(--cor-borda)' }}>
                          <span style={{ color: agente.cor }}>›</span> {ex}
                        </div>
                      ))}
                    </div>

                    {/* Botão */}
                    <button className="w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all"
                      style={{ background: `${agente.cor}15`, color: agente.cor, border: `1px solid ${agente.cor}30`, cursor: 'pointer' }}>
                      <MessageSquare size={15} /> Falar com o agente
                    </button>
                  </div>
                ))}
              </div>
            </div>

          ) : (
            /* ── Chat com agente ── */
            <div className="flex flex-col gap-4">

              {/* Header do chat */}
              <div className="flex items-center gap-4">
                <button onClick={fecharAgente}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
                  style={{ background: 'var(--cor-elevado)', color: 'var(--cor-texto-muted)', border: '1px solid var(--cor-borda)', cursor: 'pointer' }}>
                  ← Voltar
                </button>
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: `${agenteAtivo.cor}15`, border: `1px solid ${agenteAtivo.cor}35` }}>
                    {agenteAtivo.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{agenteAtivo.nome}</p>
                    <p className="text-xs" style={{ color: agenteAtivo.cor }}>{agenteAtivo.cargo}</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ml-2"
                    style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.25)' }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    Online
                  </div>
                </div>
                <button onClick={limpar}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs"
                  style={{ background: 'var(--cor-elevado)', color: 'var(--cor-texto-muted)', border: '1px solid var(--cor-borda)', cursor: 'pointer' }}>
                  <RefreshCw size={12} /> Nova conversa
                </button>
              </div>

              {/* Área do chat */}
              <div className="card flex flex-col gap-0" style={{ height: '60vh', padding: 0, overflow: 'hidden' }}>

                {/* Mensagens */}
                <div ref={chatRef} className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
                  {mensagens.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}>
                      {msg.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0 mt-1"
                          style={{ background: `${agenteAtivo.cor}15`, border: `1px solid ${agenteAtivo.cor}30` }}>
                          {agenteAtivo.avatar}
                        </div>
                      )}
                      <div className="flex flex-col gap-1.5 max-w-[78%]">
                        <div className="px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
                          style={{
                            background: msg.role === 'user' ? 'var(--cor-marca)' : 'var(--cor-elevado)',
                            color: msg.role === 'user' ? '#fff' : 'var(--cor-texto)',
                            border: msg.role === 'assistant' ? '1px solid var(--cor-borda)' : 'none',
                            borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          }}>
                          {msg.content}
                        </div>
                        {msg.role === 'assistant' && msg.content.length > 100 && (
                          <button onClick={() => copiar(msg.content, `${i}`)}
                            className="flex items-center gap-1 text-xs self-start px-2 py-1 rounded-lg transition-all"
                            style={{ background: 'var(--cor-elevado)', color: 'var(--cor-texto-fraco)', border: '1px solid var(--cor-borda)', cursor: 'pointer' }}>
                            {copiado === `${i}` ? <><Check size={10} /> Copiado!</> : <><Copy size={10} /> Copiar</>}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {enviando && (
                    <div className="flex justify-start gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                        style={{ background: `${agenteAtivo.cor}15`, border: `1px solid ${agenteAtivo.cor}30` }}>
                        {agenteAtivo.avatar}
                      </div>
                      <div className="px-4 py-3 rounded-2xl flex items-center gap-2 text-sm"
                        style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', borderRadius: '18px 18px 18px 4px' }}>
                        <Loader size={14} className="animate-spin" style={{ color: agenteAtivo.cor }} />
                        <span style={{ color: 'var(--cor-texto-muted)' }}>A pensar...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sugestões rápidas */}
                {mensagens.length <= 1 && (
                  <div className="px-5 pb-3 flex flex-wrap gap-2">
                    {agenteAtivo.exemplos.map((ex, i) => (
                      <button key={i} onClick={() => enviar(ex)}
                        className="text-xs px-3 py-1.5 rounded-full transition-all"
                        style={{ background: `${agenteAtivo.cor}12`, color: agenteAtivo.cor, border: `1px solid ${agenteAtivo.cor}30`, cursor: 'pointer' }}>
                        {ex}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input */}
                <div className="p-4 flex gap-3" style={{ borderTop: '1px solid var(--cor-borda)' }}>
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && enviar()}
                    placeholder={`Fala com o ${agenteAtivo.nome}...`}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm"
                    style={{ background: 'var(--cor-elevado)', border: `1px solid ${agenteAtivo.cor}40`, color: 'var(--cor-texto)', outline: 'none' }}
                  />
                  <button onClick={() => enviar()} disabled={enviando || !input.trim()}
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                    style={{ background: agenteAtivo.cor, border: 'none', cursor: enviando || !input.trim() ? 'default' : 'pointer', opacity: enviando || !input.trim() ? 0.6 : 1 }}>
                    {enviando ? <Loader size={16} className="text-white animate-spin" /> : <Send size={16} className="text-white" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </LayoutPainel>
    </>
  )
}
