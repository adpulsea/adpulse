// ============================================
// AdPulse — Agente de Atendimento ao Cliente
// ============================================

import Head from 'next/head'
import { useState, useRef, useEffect } from 'react'
import { Send, Loader, Bot, User, RefreshCw, Sparkles } from 'lucide-react'
import LayoutPainel from '@/components/layout/LayoutPainel'

type Mensagem = {
  id: string
  papel: 'user' | 'assistant'
  texto: string
  timestamp: Date
}

const SISTEMA_ATENDIMENTO = `És o assistente de suporte da AdPulse — uma plataforma de criação de conteúdo viral com IA, em português.

CONHECIMENTO COMPLETO DA APLICAÇÃO:

**O que é a AdPulse:**
A AdPulse é uma plataforma SaaS que ajuda criadores de conteúdo, empreendedores e agências a criar conteúdo viral para redes sociais usando Inteligência Artificial. O slogan é: "De ideia a post pronto em menos de 60 segundos."

**Funcionalidades da plataforma:**

1. **AI Content Studio** (/painel/studio)
   - Gera hooks, legendas e hashtags com IA (OpenAI GPT-4)
   - Suporta formatos: Reel, Carrossel, Story, Post, Short
   - Plataformas: Instagram, TikTok, YouTube, LinkedIn
   - Tons disponíveis: Informal, Profissional, Divertido, Inspirador, Educativo
   - Permite regenerar a legenda com 3 variações
   - Calcula score do conteúdo (Hook, Legenda, Hashtags, CTA)

2. **Viral Lab** (/painel/viral-lab)
   - Analisa tendências virais
   - Sugere tópicos com alto potencial de alcance
   - Score viral para cada sugestão

3. **Creator Analyzer** (/painel/analyzer)
   - Analisa perfis de criadores
   - Métricas de engagement e crescimento
   - Sugestões de melhoria

4. **Campanhas** (/painel/campanhas)
   - Organiza conteúdo em campanhas
   - Agrupa posts por tema ou período

5. **Calendário de Conteúdo** (/painel/calendario)
   - Vista mensal e semanal
   - Agendamento de posts
   - Botão "Gerar semana com IA" — preenche automaticamente a semana com sugestões
   - Estados: rascunho, agendado, publicado

6. **Agentes de IA** (/painel/agentes)
   - Agente de atendimento (este!)
   - Agente de vendas

**Planos:**
- **Gratuito**: 3 gerações por dia, acesso básico
- **Pro**: Gerações ilimitadas, todas as funcionalidades, acesso prioritário
- **Agência**: Multi-utilizador, relatórios avançados, suporte dedicado

**Tecnologia:**
- Construído com Next.js 14, TypeScript, Tailwind CSS
- Base de dados: Supabase (PostgreSQL)
- IA: OpenAI GPT-4
- Autenticação: Supabase Auth

**Problemas comuns e soluções:**
- "Erro de variáveis de ambiente" → Verificar ficheiro .env.local com NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY
- "Limite de gerações atingido" → Fazer upgrade para o plano Pro
- "Conteúdo não gera" → Verificar OPENAI_API_KEY no .env.local
- "Não consigo fazer login" → Verificar configurações do Supabase Auth

**Regras de resposta:**
- Responde SEMPRE em português de Portugal
- Sê amigável, conciso e útil
- Se não souberes algo sobre a AdPulse, diz "Vou verificar e volto já"
- NUNCA respondas sobre tópicos fora da AdPulse
- Se perguntarem sobre preços, explica os planos
- Usa emojis com moderação para tornar as respostas mais acolhedoras`

const PERGUNTAS_RAPIDAS = [
  'Como funciona o AI Content Studio?',
  'Qual é a diferença entre os planos?',
  'Como agendar posts no calendário?',
  'Como gero uma semana completa de conteúdo?',
  'Porque é que o conteúdo não está a gerar?',
]

export default function AgenteAtendimento() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      id: '0',
      papel: 'assistant',
      texto: 'Olá! 👋 Sou o assistente de suporte da AdPulse. Estou aqui para te ajudar com qualquer dúvida sobre a plataforma. Como posso ajudar?',
      timestamp: new Date(),
    }
  ])
  const [input, setInput]       = useState('')
  const [carregando, setCarr]   = useState(false)
  const fimRef                  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens])

  const enviar = async (texto?: string) => {
    const msg = texto || input.trim()
    if (!msg || carregando) return

    const novaMensagem: Mensagem = {
      id: Date.now().toString(),
      papel: 'user',
      texto: msg,
      timestamp: new Date(),
    }

    setMensagens(prev => [...prev, novaMensagem])
    setInput('')
    setCarr(true)

    try {
      const historico = [...mensagens, novaMensagem].map(m => ({
        role: m.papel,
        content: m.texto,
      }))

      const resposta = await fetch('/api/ia/agente-atendimento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensagens: historico, sistema: SISTEMA_ATENDIMENTO }),
      })

      const dados = await resposta.json()

      setMensagens(prev => [...prev, {
        id: Date.now().toString() + 'r',
        papel: 'assistant',
        texto: dados.resposta || 'Desculpa, ocorreu um erro. Tenta novamente.',
        timestamp: new Date(),
      }])
    } catch {
      setMensagens(prev => [...prev, {
        id: Date.now().toString() + 'e',
        papel: 'assistant',
        texto: 'Ocorreu um erro de ligação. Por favor tenta novamente.',
        timestamp: new Date(),
      }])
    } finally {
      setCarr(false)
    }
  }

  const limpar = () => setMensagens([{
    id: '0',
    papel: 'assistant',
    texto: 'Olá! 👋 Sou o assistente de suporte da AdPulse. Como posso ajudar?',
    timestamp: new Date(),
  }])

  return (
    <>
      <Head><title>Suporte — AdPulse</title></Head>
      <LayoutPainel titulo="Agente de Atendimento">
        <div className="max-w-3xl mx-auto flex flex-col gap-4" style={{ height: 'calc(100vh - 140px)' }}>

          {/* Header info */}
          <div className="card flex items-center gap-4 py-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(124,123,250,0.15)', border: '1px solid rgba(124,123,250,0.3)' }}>
              <Bot size={20} style={{ color: 'var(--cor-marca)' }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm" style={{ fontFamily: 'var(--fonte-display)' }}>Assistente AdPulse</p>
                <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(52,211,153,0.1)', color: 'var(--cor-sucesso)', border: '1px solid rgba(52,211,153,0.2)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Online
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--cor-texto-muted)' }}>
                Especialista em AdPulse — responde só sobre a plataforma
              </p>
            </div>
            <button onClick={limpar} className="p-2 rounded-xl transition-colors"
              style={{ color: 'var(--cor-texto-muted)', background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)' }}>
              <RefreshCw size={14} />
            </button>
          </div>

          {/* Perguntas rápidas */}
          {mensagens.length <= 1 && (
            <div className="flex flex-wrap gap-2">
              {PERGUNTAS_RAPIDAS.map(q => (
                <button key={q} onClick={() => enviar(q)}
                  className="text-xs px-3 py-2 rounded-xl transition-all"
                  style={{
                    background: 'var(--cor-elevado)',
                    border: '1px solid var(--cor-borda)',
                    color: 'var(--cor-texto-muted)',
                  }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--cor-marca)'; e.currentTarget.style.color = 'var(--cor-marca)' }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--cor-borda)'; e.currentTarget.style.color = 'var(--cor-texto-muted)' }}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Mensagens */}
          <div className="card flex-1 overflow-y-auto flex flex-col gap-4 p-4" style={{ minHeight: 0 }}>
            {mensagens.map(m => (
              <div key={m.id} className={`flex gap-3 ${m.papel === 'user' ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: m.papel === 'assistant' ? 'rgba(124,123,250,0.15)' : 'rgba(52,211,153,0.15)',
                    border: `1px solid ${m.papel === 'assistant' ? 'rgba(124,123,250,0.3)' : 'rgba(52,211,153,0.3)'}`,
                  }}>
                  {m.papel === 'assistant'
                    ? <Bot size={14} style={{ color: 'var(--cor-marca)' }} />
                    : <User size={14} style={{ color: 'var(--cor-sucesso)' }} />
                  }
                </div>

                {/* Balão */}
                <div className="max-w-[80%] flex flex-col gap-1" style={{ alignItems: m.papel === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line"
                    style={{
                      background: m.papel === 'user' ? 'var(--cor-marca)' : 'var(--cor-elevado)',
                      color: m.papel === 'user' ? '#fff' : 'var(--cor-texto)',
                      border: m.papel === 'user' ? 'none' : '1px solid var(--cor-borda)',
                      borderTopRightRadius: m.papel === 'user' ? '4px' : '16px',
                      borderTopLeftRadius: m.papel === 'assistant' ? '4px' : '16px',
                    }}>
                    {m.texto}
                  </div>
                  <span className="text-xs px-1" style={{ color: 'var(--cor-texto-fraco)' }}>
                    {m.timestamp.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {carregando && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(124,123,250,0.15)', border: '1px solid rgba(124,123,250,0.3)' }}>
                  <Bot size={14} style={{ color: 'var(--cor-marca)' }} />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5"
                  style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)' }}>
                  {[0,1,2].map(i => (
                    <span key={i} className="w-2 h-2 rounded-full animate-bounce"
                      style={{ background: 'var(--cor-marca)', animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={fimRef} />
          </div>

          {/* Input */}
          <div className="flex gap-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && enviar()}
              placeholder="Escreve a tua dúvida sobre a AdPulse..."
              className="input-campo flex-1"
              disabled={carregando}
            />
            <button onClick={() => enviar()} disabled={carregando || !input.trim()}
              className="btn-primario px-4"
              style={(carregando || !input.trim()) ? { opacity: 0.5, cursor: 'not-allowed' } : {}}>
              {carregando ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </div>
      </LayoutPainel>
    </>
  )
}
