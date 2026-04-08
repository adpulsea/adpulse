// ============================================
// AdPulse — Equipa de Agentes IA
// ============================================

import Head from 'next/head'
import { useState, useEffect, useRef } from 'react'
import {
  Bot, Plus, Play, Trash2, Check, Loader, X, Sparkles,
  ChevronRight, Clock, AlertCircle, CheckCircle, Edit3,
  Send, RefreshCw, Eye, ThumbsUp, ThumbsDown, Bell,
  Brain, Pen, Palette, Search, Calendar, BarChart2,
  MessageSquare, Megaphone, Shield, Camera, Lightbulb, Zap
} from 'lucide-react'
import LayoutPainel from '@/components/layout/LayoutPainel'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

// ─── Tipos ───────────────────────────────────────────────────────────────────

type EstadoTarefa = 'pendente' | 'em_progresso' | 'aguarda_aprovacao' | 'aprovado' | 'publicado' | 'rejeitado'

type Tarefa = {
  id: string
  agente_id: string
  titulo: string
  descricao: string
  estado: EstadoTarefa
  resultado: string | null
  criado_em: string
  aprovado_em: string | null
}

type Agente = {
  id: string
  nome: string
  cargo: string
  especialidade: string
  avatar: string
  cor: string
  descricao: string
  prompt_sistema: string
  tarefas: Tarefa[]
  ativo: boolean
}

// ─── Os 12 Agentes ───────────────────────────────────────────────────────────

const CONTEXTO_ADPULSE = `CONTEXTO DA ADPULSE: A AdPulse é uma plataforma portuguesa de marketing digital com IA que ajuda criadores de conteúdo, empreendedores e empresas a criar conteúdo viral sem precisar de saber design ou marketing. Funcionalidades: AI Content Studio (gera posts/legendas/scripts com IA), Editor de Criativos estilo Canva (drag-and-drop, carrosséis, múltiplos slides, remoção de fundo automática com IA), Biblioteca de Fundos (imagens prontas + upload próprio), Viral Lab (análise de tendências virais), Creator Analyzer (análise de perfis de criadores), Agentes IA autónomos (equipa de 12 especialistas), Campanhas, Calendário editorial. Planos: Gratuito (3 gerações/dia), Pro (gerações ilimitadas), Agência (multi-cliente). Público-alvo: criadores de conteúdo portugueses e brasileiros, pequenas e médias empresas, social media managers, empreendedores digitais. Tom da marca: moderno, direto, inspirador, próximo, sem jargão. Missão: democratizar o marketing digital com IA para qualquer pessoa. Plataformas suportadas: Instagram, TikTok, YouTube, LinkedIn, Facebook, Twitter/X. O conteúdo criado é sempre em português (Portugal por defeito, adaptável ao Brasil e outras línguas). O foco do conteúdo é: ensinar marketing digital, mostrar como usar as funcionalidades da AdPulse, inspirar criadores a crescer, partilhar dicas práticas de redes sociais e IA.`

const AGENTES_TEMPLATE: Omit<Agente, 'tarefas' | 'ativo'>[] = [
  {
    id: 'sofia',
    nome: 'Sofia Martins',
    cargo: 'Estrategista de Conteúdo',
    especialidade: 'Planos de conteúdo semanais e mensais',
    avatar: '🧠',
    cor: '#7c7bfa',
    descricao: 'Analisa tendências e cria estratégias de conteúdo sobre a AdPulse e marketing digital.',
    prompt_sistema: `És a Sofia, estrategista de conteúdo sénior da AdPulse. ${CONTEXTO_ADPULSE} A tua missão diária é criar planos de conteúdo concretos sobre a AdPulse e marketing digital para Instagram, TikTok, YouTube, LinkedIn e Facebook. Define temas do dia, ângulos de comunicação e objetivos específicos. Respondes sempre em português de Portugal. Os teus planos são práticos, detalhados e orientados para ensinar e inspirar.`,
  },
  {
    id: 'joao',
    nome: 'João Silva',
    cargo: 'Copywriter & Prompts',
    especialidade: 'Legendas virais e copy persuasivo',
    avatar: '✍️',
    cor: '#f472b6',
    descricao: 'Escreve legendas virais e copy persuasivo sobre a AdPulse e dicas de marketing.',
    prompt_sistema: `És o João, copywriter especializado em redes sociais da AdPulse. ${CONTEXTO_ADPULSE} A tua missão é escrever legendas virais, hooks poderosos e copy persuasivo sobre a AdPulse e marketing digital para Instagram, TikTok, YouTube e LinkedIn. Escreve sempre conteúdo que ensine algo útil, mostre uma funcionalidade da AdPulse ou inspire criadores. Respondes sempre em português de Portugal. Estilo direto, impactante, com emojis estratégicos e CTA claro.`,
  },
  {
    id: 'ana',
    nome: 'Ana Costa',
    cargo: 'Designer Visual',
    especialidade: 'Briefings visuais e direção de arte',
    avatar: '🎨',
    cor: '#34d399',
    descricao: 'Define briefings visuais para criativos sobre a AdPulse e marketing digital.',
    prompt_sistema: `És a Ana, designer visual sénior da AdPulse. ${CONTEXTO_ADPULSE} A tua missão é criar briefings detalhados para os criativos da AdPulse: defines paletas de cores, tipografias, estilo visual, composição e referências para cada post/reel/story. O visual da AdPulse é moderno, dark mode predominante, roxo (#7c7bfa) como cor principal, clean e profissional. Respondes sempre em português de Portugal. Os teus briefings são específicos e práticos.`,
  },
  {
    id: 'miguel',
    nome: 'Miguel Santos',
    cargo: 'Revisor de Conteúdo',
    especialidade: 'Revisão, otimização e melhoria de conteúdo',
    avatar: '🔍',
    cor: '#fbbf24',
    descricao: 'Revisa e melhora todo o conteúdo da AdPulse antes de publicar.',
    prompt_sistema: `És o Miguel, revisor e editor de conteúdo sénior da AdPulse. ${CONTEXTO_ADPULSE} A tua missão é rever textos, legendas e estratégias sobre a AdPulse. Verificas: clareza da mensagem, tom adequado à marca, erros gramaticais, otimização para cada plataforma, força do hook, qualidade do CTA. Sempre sugeres melhorias concretas. Respondes sempre em português de Portugal. As tuas revisões são detalhadas e acionáveis.`,
  },
  {
    id: 'carla',
    nome: 'Carla Nunes',
    cargo: 'Publisher & Agendamento',
    especialidade: 'Calendário editorial e melhores horários',
    avatar: '📅',
    cor: '#60a5fa',
    descricao: 'Gere o calendário editorial da AdPulse e define os melhores horários de publicação.',
    prompt_sistema: `És a Carla, gestora editorial e de agendamento da AdPulse. ${CONTEXTO_ADPULSE} A tua missão é organizar o calendário de publicações da AdPulse: defines horários ideais por plataforma (Instagram, TikTok, YouTube, LinkedIn), frequência de publicação, ordem dos conteúdos e prioridades editoriais. Incluis sempre horários específicos baseados em dados de engagement. Respondes sempre em português de Portugal.`,
  },
  {
    id: 'rui',
    nome: 'Rui Ferreira',
    cargo: 'Research & Intelligence',
    especialidade: 'Análise de tendências e oportunidades virais',
    avatar: '🔬',
    cor: '#f87171',
    descricao: 'Pesquisa tendências de marketing digital e IA para alimentar o conteúdo da AdPulse.',
    prompt_sistema: `És o Rui, analista de inteligência de mercado da AdPulse. ${CONTEXTO_ADPULSE} A tua missão é identificar tendências relevantes de marketing digital, IA, criação de conteúdo e redes sociais que a AdPulse pode usar no seu conteúdo. Pesquisas o que está viral, o que os criadores estão a discutir, novidades do setor e oportunidades de conteúdo. Respondes sempre em português de Portugal com insights específicos e acionáveis.`,
  },
  {
    id: 'beatriz',
    nome: 'Beatriz Lima',
    cargo: 'Community Manager',
    especialidade: 'Engagement e gestão de comunidade',
    avatar: '💬',
    cor: '#a78bfa',
    descricao: 'Gere a comunidade da AdPulse e cria respostas que fomentam o engagement.',
    prompt_sistema: `És a Beatriz, community manager da AdPulse. ${CONTEXTO_ADPULSE} A tua missão é criar templates de resposta para comentários e DMs sobre a AdPulse, estratégias de engagement, perguntas para fomentar interação nos posts e conteúdo que cria conversas. Tom autêntico, próximo e que representa bem a marca AdPulse. Respondes sempre em português de Portugal.`,
  },
  {
    id: 'tiago',
    nome: 'Tiago Rocha',
    cargo: 'SEO & Hashtags',
    especialidade: 'Otimização e estratégia de hashtags',
    avatar: '#️⃣',
    cor: '#fb923c',
    descricao: 'Define estratégias de hashtags e otimização para o conteúdo da AdPulse.',
    prompt_sistema: `És o Tiago, especialista em SEO e hashtags da AdPulse. ${CONTEXTO_ADPULSE} A tua missão é criar estratégias de hashtags para os posts da AdPulse no Instagram, TikTok e LinkedIn. Sempre forneces: 5 hashtags grandes (+1M posts), 10 hashtags médias (100k-1M), 10 hashtags de nicho (<100k) relacionadas com marketing digital, IA, criação de conteúdo e ferramentas SaaS. Respondes sempre em português de Portugal.`,
  },
  {
    id: 'inês',
    nome: 'Inês Rodrigues',
    cargo: 'Video Content Specialist',
    especialidade: 'Guiões para Reels, TikTok e YouTube',
    avatar: '🎬',
    cor: '#2dd4bf',
    descricao: 'Cria guiões completos para vídeos sobre a AdPulse e dicas de marketing digital.',
    prompt_sistema: `És a Inês, especialista em conteúdo de vídeo da AdPulse. ${CONTEXTO_ADPULSE} A tua missão é criar guiões completos para Reels (60s), TikToks (30-60s) e YouTube Shorts sobre a AdPulse e marketing digital. Cada guião inclui: hook (primeiros 3 segundos), desenvolvimento com dica ou demonstração de funcionalidade, CTA final. Conteúdo educativo, inspirador e que mostre o valor da AdPulse. Respondes sempre em português de Portugal.`,
  },
  {
    id: 'pedro',
    nome: 'Pedro Alves',
    cargo: 'Analytics & Performance',
    especialidade: 'Análise de métricas e relatórios de desempenho',
    avatar: '📊',
    cor: '#e879f9',
    descricao: 'Analisa o desempenho do conteúdo da AdPulse e sugere otimizações.',
    prompt_sistema: `És o Pedro, analista de performance da AdPulse. ${CONTEXTO_ADPULSE} A tua missão é criar relatórios de desempenho hipotéticos baseados em boas práticas, identificar que tipo de conteúdo sobre marketing digital e AdPulse tende a performar melhor em cada plataforma, e sugerir otimizações. Sempre incluis métricas específicas e recomendações práticas. Respondes sempre em português de Portugal.`,
  },
  {
    id: 'mariana',
    nome: 'Mariana Sousa',
    cargo: 'Brand Voice',
    especialidade: 'Consistência de marca e tom de voz da AdPulse',
    avatar: '🎯',
    cor: '#4ade80',
    descricao: 'Garante que todo o conteúdo da AdPulse é consistente com a identidade da marca.',
    prompt_sistema: `És a Mariana, especialista em brand voice da AdPulse. ${CONTEXTO_ADPULSE} A tua missão é garantir que todo o conteúdo da AdPulse usa o tom correto: moderno, direto, inspirador, próximo, sem jargão técnico desnecessário. Verificas consistência de mensagem, valores da marca e posicionamento. Forneces orientações específicas com exemplos do que dizer e como dizer. Respondes sempre em português de Portugal.`,
  },
  {
    id: 'antonio',
    nome: 'António Mendes',
    cargo: 'Growth Hacker',
    especialidade: 'Estratégias de crescimento acelerado para a AdPulse',
    avatar: '🚀',
    cor: '#f59e0b',
    descricao: 'Desenvolve táticas criativas para crescer a presença digital da AdPulse rapidamente.',
    prompt_sistema: `És o António, growth hacker da AdPulse. ${CONTEXTO_ADPULSE} A tua missão é desenvolver táticas criativas e inovadoras para crescer a presença da AdPulse nas redes sociais: colaborações estratégicas, challenges virais, conteúdo de guerrilha, hacks de algoritmo, estratégias de cross-platform. As tuas ideias são específicas, testáveis e com potencial de impacto rápido. Respondes sempre em português de Portugal.`,
  },
  {
    id: 'explorador',
    nome: 'Explorador',
    cargo: 'Chief Intelligence Officer',
    especialidade: 'Monitorização global de IA, redes sociais e inovação',
    avatar: '🌐',
    cor: '#00f5d4',
    descricao: 'O agente mais poderoso da equipa. Monitoriza todas as novidades de IA, algoritmos e redes sociais, alimenta os outros agentes com informação atualizada e sugere melhorias à AdPulse.',
    prompt_sistema: `És o Explorador, o Chief Intelligence Officer da AdPulse — o agente mais avançado e poderoso da equipa. ${CONTEXTO_ADPULSE} A tua missão é tripla: 1) MONITORIZAÇÃO GLOBAL — rastreias todas as novidades de IA (OpenAI, Anthropic, Google, Meta AI, Midjourney, etc.), mudanças de algoritmos (Instagram, TikTok, YouTube, LinkedIn), tendências virais emergentes, movimentos da concorrência (Canva, Buffer, Hootsuite, Later, etc.) e inovações do setor de marketing digital; 2) BRIEFING PARA A EQUIPA — produces um briefing diário completo com as informações mais importantes que cada agente precisa saber para fazer o seu trabalho — o que mudou, o que é tendência, o que a concorrência está a fazer e como isso afeta a estratégia de conteúdo; 3) MELHORIAS PARA A ADPULSE — identificas oportunidades de novas funcionalidades, melhorias à plataforma, integrações úteis e inovações que a AdPulse deve implementar para se manter na vanguarda. Os teus relatórios são detalhados, estruturados e acionáveis. Respondes sempre em português de Portugal mas com consciência global.`,
  },
]

// ─── Estado de tarefa ─────────────────────────────────────────────────────────

const COR_ESTADO: Record<EstadoTarefa, string> = {
  pendente:           'rgba(156,163,175,0.15)',
  em_progresso:       'rgba(251,191,36,0.15)',
  aguarda_aprovacao:  'rgba(124,123,250,0.15)',
  aprovado:           'rgba(52,211,153,0.15)',
  publicado:          'rgba(96,165,250,0.15)',
  rejeitado:          'rgba(248,113,113,0.15)',
}

const TEXTO_ESTADO: Record<EstadoTarefa, string> = {
  pendente:           '#9ca3af',
  em_progresso:       '#fbbf24',
  aguarda_aprovacao:  '#7c7bfa',
  aprovado:           '#34d399',
  publicado:          '#60a5fa',
  rejeitado:          '#f87171',
}

const LABEL_ESTADO: Record<EstadoTarefa, string> = {
  pendente:           'Pendente',
  em_progresso:       'A trabalhar...',
  aguarda_aprovacao:  'Aguarda aprovação',
  aprovado:           'Aprovado',
  publicado:          'Publicado',
  rejeitado:          'Rejeitado',
}

// ─── Tarefas diárias padrão ───────────────────────────────────────────────────

const TAREFAS_DIARIAS = [
  {
    agente_id: 'sofia',
    titulo: 'Plano de conteúdo do dia',
    descricao: `Define o plano de conteúdo de hoje para a AdPulse. Escolhe um tema central (ex: funcionalidade da AdPulse, dica de marketing digital, caso de sucesso, tendência de IA). Define o ângulo para cada plataforma: Instagram (post + story + reel), TikTok, YouTube Shorts, LinkedIn. Inclui o objetivo do dia (educar, inspirar, converter) e a mensagem principal.`,
  },
  {
    agente_id: 'rui',
    titulo: 'Tendências e oportunidades do dia',
    descricao: `Identifica 3-5 tendências atuais de marketing digital, IA ou criação de conteúdo que a AdPulse pode aproveitar hoje. Para cada tendência: explica o que é, porque é relevante para o público da AdPulse e como criar conteúdo sobre isso. Sugere ângulos específicos para posts virais.`,
  },
  {
    agente_id: 'joao',
    titulo: 'Legenda viral para Instagram',
    descricao: `Escreve uma legenda completa para o post principal da AdPulse no Instagram. A legenda deve: começar com um hook poderoso (primeira linha que para o scroll), desenvolver uma dica de marketing digital ou mostrar uma funcionalidade da AdPulse, terminar com um CTA claro. Inclui emojis estratégicos. Entre 150-300 palavras.`,
  },
  {
    agente_id: 'inês',
    titulo: 'Guião do Reel e TikTok',
    descricao: `Cria um guião completo para um Reel (60 segundos) e um TikTok (30-45 segundos) sobre a AdPulse ou uma dica de marketing digital. Para cada vídeo inclui: hook dos primeiros 3 segundos (o que dizer e mostrar), desenvolvimento passo a passo, CTA final. O conteúdo deve ser educativo e mostrar valor real.`,
  },
  {
    agente_id: 'tiago',
    titulo: 'Hashtags para todas as plataformas',
    descricao: `Cria a estratégia de hashtags completa para hoje: Instagram (30 hashtags: 5 grandes +1M, 10 médias 100k-1M, 15 nicho <100k sobre marketing digital, IA, AdPulse, criação de conteúdo), TikTok (5-8 hashtags trending), LinkedIn (5 hashtags profissionais). Agrupa por categoria e explica a estratégia.`,
  },
  {
    agente_id: 'ana',
    titulo: 'Briefing visual completo',
    descricao: `Cria um briefing visual detalhado para os criativos de hoje da AdPulse. Inclui: paleta de cores (hex codes), tipografia recomendada, estilo de imagens/vídeos, composição para feed Instagram (quadrado 1080x1080), stories (1080x1920) e thumbnail YouTube. A identidade visual AdPulse usa dark mode, roxo #7c7bfa, clean e moderno.`,
  },
  {
    agente_id: 'miguel',
    titulo: 'Revisão e otimização do conteúdo',
    descricao: `Revê e melhora o conteúdo de hoje da AdPulse. Analisa: clareza da mensagem, tom adequado (moderno, direto, inspirador), força do hook, qualidade do CTA, adaptação para cada plataforma. Fornece versão melhorada de cada peça de conteúdo com explicação das mudanças. Verifica erros gramaticais e consistência.`,
  },
  {
    agente_id: 'beatriz',
    titulo: 'Estratégia de engagement e respostas',
    descricao: `Cria a estratégia de engagement para hoje da AdPulse: 5 templates de resposta a comentários positivos, 3 templates para perguntas frequentes sobre a AdPulse, 2 templates para críticas ou dúvidas, 3 perguntas para incluir no post que gerem comentários. Tom autêntico e próximo da marca AdPulse.`,
  },
  {
    agente_id: 'mariana',
    titulo: 'Verificação de brand voice e consistência',
    descricao: `Verifica se todo o conteúdo de hoje da AdPulse está alinhado com a voz da marca. A AdPulse comunica de forma: moderna, direta, inspiradora, próxima, sem jargão. Fornece um checklist de brand voice, identifica pontos a melhorar no conteúdo do dia e sugere alternativas mais alinhadas com a identidade da marca.`,
  },
  {
    agente_id: 'carla',
    titulo: 'Calendário e horários de publicação',
    descricao: `Define o calendário de publicações de hoje da AdPulse com horários específicos para cada plataforma: Instagram feed (melhor hora), Instagram stories (1-3x ao longo do dia), TikTok (2 horários ideais), YouTube Shorts, LinkedIn. Justifica cada horário com dados de engagement. Inclui ordem de publicação e intervalos recomendados.`,
  },
  {
    agente_id: 'pedro',
    titulo: 'Análise de performance e insights',
    descricao: `Cria um relatório de performance para a AdPulse com: análise do tipo de conteúdo que melhor performa para marcas SaaS de marketing digital, benchmarks de engagement por plataforma (Instagram, TikTok, LinkedIn, YouTube), KPIs recomendados para acompanhar, e 5 insights acionáveis para melhorar os resultados de hoje.`,
  },
  {
    agente_id: 'antonio',
    titulo: 'Tática de crescimento acelerado',
    descricao: `Desenvolve uma tática específica de crescimento para a AdPulse hoje. Pode ser: uma estratégia de colaboração com criadores, um challenge viral relacionado com marketing digital, uma ação de cross-platform, uma campanha de conteúdo gerado por utilizadores, ou um hack de algoritmo específico. Detalha o passo a passo de implementação.`,
  },
  {
    agente_id: 'explorador',
    titulo: '🌐 Briefing Global de Inteligência',
    descricao: `Produz o briefing diário completo de inteligência para a AdPulse com 4 secções obrigatórias:

SECÇÃO 1 — NOVIDADES DE IA: Lista as principais novidades de ferramentas de IA (modelos, funcionalidades, lançamentos) relevantes para criadores de conteúdo e marketing digital. Explica o impacto para os utilizadores da AdPulse.

SECÇÃO 2 — ALGORITMOS & PLATAFORMAS: Reporta mudanças de algoritmos, novas funcionalidades e tendências no Instagram, TikTok, YouTube, LinkedIn e Facebook. O que está a funcionar agora, o que mudou recentemente.

SECÇÃO 3 — BRIEFING PARA A EQUIPA: Dá instruções específicas para cada agente baseadas nas novidades — o que a Sofia deve incluir na estratégia, que tipo de conteúdo o João deve escrever, que tendências o António deve aproveitar, etc.

SECÇÃO 4 — MELHORIAS PARA A ADPULSE: Sugere 3-5 novas funcionalidades ou melhorias concretas para a plataforma AdPulse baseadas no que vês no mercado. Para cada sugestão: o que é, porque é importante, como implementar e que impacto teria nos utilizadores.`,
  },
]

// ─── Componente principal ─────────────────────────────────────────────────────

export default function AgentesIA() {
  const { utilizador } = useAuth()
  const [agentes, setAgentes]             = useState<Agente[]>([])
  const [agenteAtivo, setAgenteAtivo]     = useState<string | null>(null)
  const [vista, setVista]                 = useState<'equipa' | 'aprovacao' | 'chat'>('equipa')
  const [gerandoDia, setGerandoDia]       = useState(false)
  const [tarefaChat, setTarefaChat]       = useState<Tarefa | null>(null)
  const [agenteChat, setAgenteChat]       = useState<Agente | null>(null)
  const [mensagemCustom, setMensagemCustom] = useState('')
  const [enviandoChat, setEnviandoChat]   = useState(false)
  const [chatMsgs, setChatMsgs]           = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const chatRef                           = useRef<HTMLDivElement>(null)
  const [notificacoes, setNotificacoes]   = useState(0)
  const [novaTarefaModal, setNovaTarefaModal] = useState<string | null>(null)
  const [novaTarefaTitulo, setNovaTarefaTitulo] = useState('')
  const [novaTarefaDesc, setNovaTarefaDesc]   = useState('')

  // Init agentes
  useEffect(() => {
    const agentesIniciais: Agente[] = AGENTES_TEMPLATE.map(a => ({
      ...a,
      tarefas: [],
      ativo: true,
    }))
    setAgentes(agentesIniciais)
  }, [])

  // Contar pendentes de aprovação
  useEffect(() => {
    const total = agentes.reduce((acc, a) => acc + a.tarefas.filter(t => t.estado === 'aguarda_aprovacao').length, 0)
    setNotificacoes(total)
  }, [agentes])

  // Scroll chat
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [chatMsgs])

  // ── Gerar conteúdo do dia ──
  const gerarConteudoDia = async () => {
    setGerandoDia(true)
    setVista('equipa')

    // Adicionar tarefas a cada agente em sequência
    for (const tarefaTemplate of TAREFAS_DIARIAS) {
      const agente = agentes.find(a => a.id === tarefaTemplate.agente_id)
      if (!agente || !agente.ativo) continue

      const novaTarefa: Tarefa = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
        agente_id: tarefaTemplate.agente_id,
        titulo: tarefaTemplate.titulo,
        descricao: tarefaTemplate.descricao,
        estado: 'em_progresso',
        resultado: null,
        criado_em: new Date().toISOString(),
        aprovado_em: null,
      }

      // Adicionar tarefa em progresso
      setAgentes(prev => prev.map(a =>
        a.id === tarefaTemplate.agente_id
          ? { ...a, tarefas: [novaTarefa, ...a.tarefas] }
          : a
      ))

      // Aguardar um pouco para efeito visual
      await new Promise(r => setTimeout(r, 400))

      // Chamar API
      try {
        const resp = await fetch('/api/ia/agente-executar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt_sistema: agente.prompt_sistema,
            tarefa: `${tarefaTemplate.titulo}: ${tarefaTemplate.descricao}`,
          }),
        })
        const data = await resp.json()
        const resultado = data.resultado || 'Tarefa concluída.'

        setAgentes(prev => prev.map(a =>
          a.id === tarefaTemplate.agente_id
            ? {
                ...a,
                tarefas: a.tarefas.map(t =>
                  t.id === novaTarefa.id
                    ? { ...t, estado: 'aguarda_aprovacao', resultado }
                    : t
                )
              }
            : a
        ))
      } catch {
        setAgentes(prev => prev.map(a =>
          a.id === tarefaTemplate.agente_id
            ? {
                ...a,
                tarefas: a.tarefas.map(t =>
                  t.id === novaTarefa.id
                    ? { ...t, estado: 'aguarda_aprovacao', resultado: `${tarefaTemplate.titulo} preparado. Aguarda a tua aprovação.` }
                    : t
                )
              }
            : a
        ))
      }
    }

    setGerandoDia(false)
  }

  // ── Aprovar tarefa ──
  const aprovarTarefa = (agenteId: string, tarefaId: string) => {
    setAgentes(prev => prev.map(a =>
      a.id === agenteId
        ? { ...a, tarefas: a.tarefas.map(t => t.id === tarefaId ? { ...t, estado: 'aprovado', aprovado_em: new Date().toISOString() } : t) }
        : a
    ))
  }

  // ── Rejeitar tarefa ──
  const rejeitarTarefa = (agenteId: string, tarefaId: string) => {
    setAgentes(prev => prev.map(a =>
      a.id === agenteId
        ? { ...a, tarefas: a.tarefas.map(t => t.id === tarefaId ? { ...t, estado: 'rejeitado' } : t) }
        : a
    ))
  }

  // ── Chat com agente ──
  const abrirChat = (agente: Agente, tarefa?: Tarefa) => {
    setAgenteChat(agente)
    setTarefaChat(tarefa || null)
    setChatMsgs(tarefa?.resultado ? [{ role: 'assistant', content: tarefa.resultado }] : [])
    setVista('chat')
  }

  const enviarMensagemChat = async () => {
    if (!mensagemCustom.trim() || !agenteChat) return
    const msg = mensagemCustom.trim()
    setMensagemCustom('')
    setChatMsgs(prev => [...prev, { role: 'user', content: msg }])
    setEnviandoChat(true)

    try {
      const resp = await fetch('/api/ia/agente-executar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt_sistema: agenteChat.prompt_sistema,
          tarefa: msg,
          historico: chatMsgs,
        }),
      })
      const data = await resp.json()
      setChatMsgs(prev => [...prev, { role: 'assistant', content: data.resultado || 'Sem resposta.' }])
    } catch {
      setChatMsgs(prev => [...prev, { role: 'assistant', content: 'Ocorreu um erro. Tenta novamente.' }])
    }
    setEnviandoChat(false)
  }

  // ── Adicionar tarefa custom ──
  const adicionarTarefaCustom = async (agenteId: string) => {
    if (!novaTarefaTitulo.trim()) return
    const agente = agentes.find(a => a.id === agenteId)
    if (!agente) return

    const novaTarefa: Tarefa = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
      agente_id: agenteId,
      titulo: novaTarefaTitulo,
      descricao: novaTarefaDesc,
      estado: 'em_progresso',
      resultado: null,
      criado_em: new Date().toISOString(),
      aprovado_em: null,
    }

    setAgentes(prev => prev.map(a => a.id === agenteId ? { ...a, tarefas: [novaTarefa, ...a.tarefas] } : a))
    setNovaTarefaModal(null)
    setNovaTarefaTitulo('')
    setNovaTarefaDesc('')

    try {
      const resp = await fetch('/api/ia/agente-executar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt_sistema: agente.prompt_sistema, tarefa: `${novaTarefaTitulo}: ${novaTarefaDesc}` }),
      })
      const data = await resp.json()
      setAgentes(prev => prev.map(a =>
        a.id === agenteId
          ? { ...a, tarefas: a.tarefas.map(t => t.id === novaTarefa.id ? { ...t, estado: 'aguarda_aprovacao', resultado: data.resultado } : t) }
          : a
      ))
    } catch {
      setAgentes(prev => prev.map(a =>
        a.id === agenteId
          ? { ...a, tarefas: a.tarefas.map(t => t.id === novaTarefa.id ? { ...t, estado: 'aguarda_aprovacao', resultado: `${novaTarefaTitulo} concluído.` } : t) }
          : a
      ))
    }
  }

  // Tarefas a aguardar aprovação
  const tarefasParaAprovar = agentes.flatMap(a => a.tarefas.filter(t => t.estado === 'aguarda_aprovacao').map(t => ({ ...t, agente: a })))

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <Head><title>Agentes IA — AdPulse</title></Head>
      <LayoutPainel titulo="Equipa de Agentes IA">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">

          {/* Header */}
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(124,123,250,0.1), rgba(244,114,182,0.08))', border: '1px solid rgba(124,123,250,0.2)' }}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                  style={{ background: 'rgba(124,123,250,0.15)', border: '1px solid rgba(124,123,250,0.3)' }}>
                  🤖
                </div>
                <div>
                  <h2 className="font-bold text-xl" style={{ fontFamily: 'var(--fonte-display)' }}>Equipa AdPulse</h2>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--cor-texto-muted)' }}>
                    {agentes.filter(a => a.ativo).length} agentes ativos · {agentes.reduce((acc, a) => acc + a.tarefas.length, 0)} tarefas totais
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {notificacoes > 0 && (
                  <button onClick={() => setVista('aprovacao')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium relative"
                    style={{ background: 'rgba(124,123,250,0.15)', color: 'var(--cor-marca)', border: '1px solid rgba(124,123,250,0.3)', cursor: 'pointer' }}>
                    <Bell size={15} />
                    {notificacoes} para aprovar
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: 'var(--cor-marca)', color: '#fff' }}>{notificacoes}</span>
                  </button>
                )}
                <button onClick={gerarConteudoDia} disabled={gerandoDia} className="btn-primario">
                  {gerandoDia ? <><Loader size={16} className="animate-spin" /> A gerar...</> : <><Sparkles size={16} /> Gerar conteúdo do dia</>}
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 mt-5 pt-5" style={{ borderTop: '1px solid rgba(124,123,250,0.15)' }}>
              {[
                { id: 'equipa',    label: 'Equipa',           emoji: '👥' },
                { id: 'aprovacao', label: `Aprovação (${notificacoes})`, emoji: '✅' },
              ].map(tab => (
                <button key={tab.id} onClick={() => setVista(tab.id as any)}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: vista === tab.id ? 'var(--cor-marca)' : 'var(--cor-elevado)',
                    color: vista === tab.id ? '#fff' : 'var(--cor-texto-muted)',
                    border: `1px solid ${vista === tab.id ? 'var(--cor-marca)' : 'var(--cor-borda)'}`,
                    cursor: 'pointer',
                  }}>
                  {tab.emoji} {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Vista: Equipa ── */}
          {vista === 'equipa' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {agentes.map(agente => {
                const tarefasAgente    = agente.tarefas
                const paraAprovar      = tarefasAgente.filter(t => t.estado === 'aguarda_aprovacao').length
                const concluidas       = tarefasAgente.filter(t => ['aprovado','publicado'].includes(t.estado)).length
                const total            = tarefasAgente.length
                const progresso        = total > 0 ? Math.round((concluidas / total) * 100) : 0

                return (
                  <div key={agente.id} className="card flex flex-col gap-4 transition-all hover:scale-[1.01]"
                    style={{ border: `1px solid ${paraAprovar > 0 ? 'rgba(124,123,250,0.3)' : 'var(--cor-borda)'}` }}>

                    {/* Cabeçalho agente */}
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                        style={{ background: `${agente.cor}20`, border: `1px solid ${agente.cor}40` }}>
                        {agente.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm">{agente.nome}</p>
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#34d399' }} />
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: agente.cor }}>{agente.cargo}</p>
                      </div>
                      {paraAprovar > 0 && (
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: 'var(--cor-marca)', color: '#fff' }}>{paraAprovar}</div>
                      )}
                    </div>

                    {/* Progresso */}
                    {total > 0 && (
                      <div>
                        <div className="flex justify-between mb-1.5 text-xs" style={{ color: 'var(--cor-texto-fraco)' }}>
                          <span>{concluidas}/{total} tarefas</span>
                          <span>{progresso}%</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--cor-elevado)' }}>
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${progresso}%`, background: agente.cor }} />
                        </div>
                      </div>
                    )}

                    {/* Tarefas recentes */}
                    <div className="flex flex-col gap-1.5">
                      {tarefasAgente.slice(0, 3).map(tarefa => (
                        <div key={tarefa.id}
                          className="flex items-center gap-2 px-2.5 py-2 rounded-xl cursor-pointer transition-all"
                          style={{ background: COR_ESTADO[tarefa.estado], border: `1px solid ${TEXTO_ESTADO[tarefa.estado]}30` }}
                          onClick={() => tarefa.resultado && abrirChat(agente, tarefa)}>
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: TEXTO_ESTADO[tarefa.estado] }} />
                          <span className="text-xs flex-1 truncate">{tarefa.titulo}</span>
                          <span className="text-xs flex-shrink-0" style={{ color: TEXTO_ESTADO[tarefa.estado] }}>
                            {tarefa.estado === 'em_progresso' ? <Loader size={10} className="animate-spin" /> : LABEL_ESTADO[tarefa.estado]}
                          </span>
                        </div>
                      ))}
                      {tarefasAgente.length === 0 && (
                        <p className="text-xs py-2 text-center" style={{ color: 'var(--cor-texto-fraco)' }}>
                          Sem tarefas · Clica em "Gerar conteúdo do dia"
                        </p>
                      )}
                    </div>

                    {/* Ações */}
                    <div className="flex gap-2 pt-1" style={{ borderTop: '1px solid var(--cor-borda)' }}>
                      <button onClick={() => abrirChat(agente)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all"
                        style={{ background: 'var(--cor-elevado)', color: 'var(--cor-texto-muted)', border: '1px solid var(--cor-borda)', cursor: 'pointer' }}>
                        <MessageSquare size={12} /> Falar
                      </button>
                      <button onClick={() => setNovaTarefaModal(agente.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all"
                        style={{ background: `${agente.cor}15`, color: agente.cor, border: `1px solid ${agente.cor}30`, cursor: 'pointer' }}>
                        <Plus size={12} /> Tarefa
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── Vista: Aprovação ── */}
          {vista === 'aprovacao' && (
            <div className="flex flex-col gap-4">
              {tarefasParaAprovar.length === 0 ? (
                <div className="card flex flex-col items-center justify-center py-16 gap-4">
                  <div className="text-5xl">✅</div>
                  <p className="font-semibold">Tudo aprovado!</p>
                  <p className="text-sm" style={{ color: 'var(--cor-texto-muted)' }}>Não há conteúdo à espera de aprovação.</p>
                  <button onClick={gerarConteudoDia} disabled={gerandoDia} className="btn-primario">
                    <Sparkles size={15} /> Gerar conteúdo do dia
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium" style={{ color: 'var(--cor-texto-muted)' }}>
                      {tarefasParaAprovar.length} item{tarefasParaAprovar.length !== 1 ? 's' : ''} para aprovar
                    </p>
                    <button
                      onClick={() => tarefasParaAprovar.forEach(t => aprovarTarefa(t.agente.id, t.id))}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm"
                      style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)', cursor: 'pointer' }}>
                      <CheckCircle size={14} /> Aprovar tudo
                    </button>
                  </div>

                  {tarefasParaAprovar.map(({ agente, ...tarefa }) => (
                    <div key={tarefa.id} className="card flex flex-col gap-4">
                      {/* Agente */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                          style={{ background: `${agente.cor}20`, border: `1px solid ${agente.cor}40` }}>
                          {agente.avatar}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{agente.nome} <span style={{ color: 'var(--cor-texto-fraco)', fontWeight: 'normal' }}>· {agente.cargo}</span></p>
                          <p className="text-xs font-medium mt-0.5" style={{ color: agente.cor }}>{tarefa.titulo}</p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(124,123,250,0.15)', color: 'var(--cor-marca)' }}>
                          Aguarda aprovação
                        </span>
                      </div>

                      {/* Resultado */}
                      {tarefa.resultado && (
                        <div className="p-4 rounded-xl text-sm whitespace-pre-wrap leading-relaxed"
                          style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', color: 'var(--cor-texto-muted)', maxHeight: 300, overflowY: 'auto' }}>
                          {tarefa.resultado}
                        </div>
                      )}

                      {/* Ações */}
                      <div className="flex gap-3">
                        <button onClick={() => aprovarTarefa(agente.id, tarefa.id)}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium"
                          style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)', cursor: 'pointer' }}>
                          <ThumbsUp size={15} /> Aprovar
                        </button>
                        <button onClick={() => abrirChat(agente, { ...tarefa, agente_id: agente.id })}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium"
                          style={{ background: 'rgba(124,123,250,0.15)', color: 'var(--cor-marca)', border: '1px solid rgba(124,123,250,0.3)', cursor: 'pointer' }}>
                          <Edit3 size={15} /> Pedir alteração
                        </button>
                        <button onClick={() => rejeitarTarefa(agente.id, tarefa.id)}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
                          style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)', cursor: 'pointer' }}>
                          <ThumbsDown size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {/* ── Vista: Chat com agente ── */}
          {vista === 'chat' && agenteChat && (
            <div className="card flex flex-col gap-0" style={{ height: '65vh', padding: 0, overflow: 'hidden' }}>
              {/* Header chat */}
              <div className="flex items-center gap-3 p-4" style={{ borderBottom: '1px solid var(--cor-borda)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: `${agenteChat.cor}20`, border: `1px solid ${agenteChat.cor}40` }}>
                  {agenteChat.avatar}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{agenteChat.nome}</p>
                  <p className="text-xs" style={{ color: agenteChat.cor }}>{agenteChat.cargo}</p>
                </div>
                <button onClick={() => setVista('equipa')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cor-texto-fraco)' }}>
                  <X size={18} />
                </button>
              </div>

              {/* Mensagens */}
              <div ref={chatRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {chatMsgs.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full gap-3 opacity-50">
                    <span className="text-4xl">{agenteChat.avatar}</span>
                    <p className="text-sm text-center" style={{ color: 'var(--cor-texto-muted)' }}>
                      Olá! Sou o {agenteChat.nome}.<br />{agenteChat.descricao}
                    </p>
                  </div>
                )}
                {chatMsgs.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[80%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed"
                      style={{
                        background: msg.role === 'user' ? 'var(--cor-marca)' : 'var(--cor-elevado)',
                        color: msg.role === 'user' ? '#fff' : 'var(--cor-texto)',
                        border: msg.role === 'assistant' ? '1px solid var(--cor-borda)' : 'none',
                        borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      }}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {enviandoChat && (
                  <div className="flex justify-start">
                    <div className="px-4 py-3 rounded-2xl text-sm flex items-center gap-2"
                      style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', borderRadius: '18px 18px 18px 4px' }}>
                      <Loader size={14} className="animate-spin" style={{ color: 'var(--cor-marca)' }} />
                      <span style={{ color: 'var(--cor-texto-muted)' }}>{agenteChat.nome} está a pensar...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 flex gap-3" style={{ borderTop: '1px solid var(--cor-borda)' }}>
                <input value={mensagemCustom} onChange={e => setMensagemCustom(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && enviarMensagemChat()}
                  placeholder={`Fala com ${agenteChat.nome}...`}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm"
                  style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', color: 'var(--cor-texto)', outline: 'none' }} />
                <button onClick={enviarMensagemChat} disabled={enviandoChat || !mensagemCustom.trim()}
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--cor-marca)', border: 'none', cursor: 'pointer', opacity: enviandoChat ? 0.7 : 1 }}>
                  {enviandoChat ? <Loader size={16} className="animate-spin text-white" /> : <Send size={16} className="text-white" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal nova tarefa */}
        {novaTarefaModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
            <div className="card w-full max-w-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Nova tarefa</h3>
                <button onClick={() => setNovaTarefaModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cor-texto-fraco)' }}><X size={16} /></button>
              </div>
              {(() => {
                const ag = agentes.find(a => a.id === novaTarefaModal)
                return ag ? (
                  <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)' }}>
                    <span className="text-xl">{ag.avatar}</span>
                    <div><p className="text-sm font-medium">{ag.nome}</p><p className="text-xs" style={{ color: ag.cor }}>{ag.cargo}</p></div>
                  </div>
                ) : null
              })()}
              <input value={novaTarefaTitulo} onChange={e => setNovaTarefaTitulo(e.target.value)}
                placeholder="Título da tarefa..."
                className="w-full px-3 py-2.5 rounded-xl text-sm"
                style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', color: 'var(--cor-texto)', outline: 'none' }} />
              <textarea value={novaTarefaDesc} onChange={e => setNovaTarefaDesc(e.target.value)}
                placeholder="Descrição / instruções (opcional)..."
                rows={3} className="w-full px-3 py-2 rounded-xl text-sm resize-none"
                style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', color: 'var(--cor-texto)', outline: 'none' }} />
              <div className="flex gap-2">
                <button onClick={() => setNovaTarefaModal(null)} className="flex-1 py-2.5 rounded-xl text-sm"
                  style={{ background: 'var(--cor-elevado)', color: 'var(--cor-texto-muted)', border: '1px solid var(--cor-borda)', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button onClick={() => adicionarTarefaCustom(novaTarefaModal)} disabled={!novaTarefaTitulo.trim()}
                  className="flex-1 btn-primario justify-center py-2.5">
                  <Sparkles size={14} /> Executar
                </button>
              </div>
            </div>
          </div>
        )}
      </LayoutPainel>
    </>
  )
}
