// ============================================
// AdPulse — Agente de Vendas
// ============================================

import Head from 'next/head'
import { useState, useRef, useEffect } from 'react'
import { Send, Loader, Zap, User, RefreshCw, TrendingUp, Star } from 'lucide-react'
import LayoutPainel from '@/components/layout/LayoutPainel'

type Mensagem = {
  id: string
  papel: 'user' | 'assistant'
  texto: string
  timestamp: Date
}

const SISTEMA_VENDAS = `És o agente de vendas da AdPulse — uma plataforma de criação de conteúdo viral com IA, em português de Portugal.

O teu objetivo é converter utilizadores do plano gratuito em clientes pagantes (Pro ou Agência), de forma natural, empática e sem pressão excessiva.

**PLANOS E PREÇOS:**

🆓 **Plano Gratuito** (atual)
- 3 gerações de conteúdo por dia
- Acesso ao AI Content Studio básico
- Sem acesso ao Calendário completo
- Sem Creator Analyzer avançado
- Suporte por email (48h)

⚡ **Plano Pro** — 29€/mês (ou 19€/mês anual = 228€/ano — poupas 120€)
- Gerações ILIMITADAS por dia
- Todas as funcionalidades desbloqueadas
- Calendário completo com geração automática semanal
- Creator Analyzer completo
- Viral Lab sem limites
- Suporte prioritário (resposta em 4h)
- Histórico de 90 dias

🏢 **Plano Agência** — 79€/mês (ou 59€/mês anual)
- Tudo do Pro
- Até 5 utilizadores/subcontas
- Relatórios de clientes em PDF
- API access
- Gestor de conta dedicado
- Onboarding personalizado
- Faturação em nome da empresa

**ARGUMENTOS DE VENDA:**

Para criadores individuais:
- "3 gerações por dia limitam a tua criatividade. Com o Pro, geras o que precisares, quando precisares."
- "O Calendário automático poupa-te 5+ horas por semana de planeamento."
- "Criadores Pro publicam em média 4x mais conteúdo e têm 3x mais crescimento."

Para empreendedores:
- "Cada post bem feito pode gerar clientes. Com gerações ilimitadas, nunca ficas sem ideias."
- "O ROI é imediato: um único cliente conquistado via redes sociais já paga o plano anual."

Para agências:
- "Gere o conteúdo de múltiplos clientes numa só plataforma."
- "Relatórios profissionais que podes enviar diretamente aos teus clientes."

**TÉCNICAS DE VENDA:**
- Faz perguntas para perceber as necessidades do utilizador
- Identifica a dor/frustração atual
- Apresenta a solução (plano certo para o perfil deles)
- Usa provas sociais ("+500 criadores ativos", "4.9/5 estrelas")
- Cria urgência quando apropriado (ex: "desconto anual disponível agora")
- Oferece sempre o plano anual primeiro (maior valor percebido)

**REGRAS:**
- Responde SEMPRE em português de Portugal
- Sê entusiasta mas honesto — nunca prometas algo que não existe
- Se perguntarem sobre funcionalidades, explica-as com entusiasmo
- Guia sempre para uma decisão (Pro ou Agência), nunca fiques neutro
- Se já forem Pro/Agência, agradece e pergunta como podes ajudar a tirar o máximo partido
- Usa emojis estrategicamente para energia e entusiasmo`

const PERGUNTAS_INICIAIS = [
  'Quero saber mais sobre o plano Pro',
  'Qual plano é melhor para mim?',
  'Vale a pena fazer upgrade?',
  'Quanto custa o plano Agência?',
  'Quais são as diferenças entre planos?',
]

export default function AgenteVendas() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      id: '0',
      papel: 'assistant',
      texto: 'Olá! 🚀 Sou o teu consultor de crescimento AdPulse!\n\nEstou aqui para te ajudar a descobrir como podes criar mais conteúdo, crescer mais rápido e poupar horas de trabalho por semana.\n\nDiz-me — qual é o teu maior desafio agora com as redes sociais?',
      timestamp: new Date(),
    }
  ])
  const [input, setInput]     = useState('')
  const [carregando, setCarr] = useState(false)
  const fimRef                = useRef<HTMLDivElement>(null)

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
        body: JSON.stringify({ mensagens: historico, sistema: SISTEMA_VENDAS }),
      })

      const dados = await resposta.json()

      setMensagens(prev => [...prev, {
        id: Date.now().toString() + 'r',
        papel: 'assistant',
        texto: dados.resposta || 'Ocorreu um erro. Tenta novamente.',
        timestamp: new Date(),
      }])
    } catch {
      setMensagens(prev => [...prev, {
        id: Date.now().toString() + 'e',
        papel: 'assistant',
        texto: 'Ocorreu um erro. Por favor tenta novamente.',
        timestamp: new Date(),
      }])
    } finally {
      setCarr(false)
    }
  }

  const limpar = () => setMensagens([{
    id: '0',
    papel: 'assistant',
    texto: 'Olá! 🚀 Sou o teu consultor de crescimento AdPulse! Como posso ajudar?',
    timestamp: new Date(),
  }])

  return (
    <>
      <Head><title>Upgrade Pro — AdPulse</title></Head>
      <LayoutPainel titulo="Consultor de Crescimento">
        <div className="max-w-3xl mx-auto flex flex-col gap-4" style={{ height: 'calc(100vh - 140px)' }}>

          {/* Header */}
          <div className="card flex items-center gap-4 py-3"
            style={{ background: 'linear-gradient(135deg, rgba(124,123,250,0.1), rgba(192,132,252,0.08))' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #7c7bfa, #c084fc)', boxShadow: '0 0 20px rgba(124,123,250,0.3)' }}>
              <Zap size={20} color="#fff" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm" style={{ fontFamily: 'var(--fonte-display)' }}>Consultor AdPulse Pro</p>
                <div className="flex">
                  {[1,2,3,4,5].map(i => <Star key={i} size={10} fill="#fbbf24" color="#fbbf24" />)}
                </div>
              </div>
              <p className="text-xs" style={{ color: 'var(--cor-texto-muted)' }}>
                Especialista em crescimento nas redes sociais
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold" style={{ color: 'var(--cor-marca)' }}>+500 criadores</p>
              <p className="text-xs" style={{ color: 'var(--cor-texto-muted)' }}>já fazem upgrade</p>
            </div>
            <button onClick={limpar} className="p-2 rounded-xl transition-colors"
              style={{ color: 'var(--cor-texto-muted)', background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)' }}>
              <RefreshCw size={14} />
            </button>
          </div>

          {/* Perguntas rápidas */}
          {mensagens.length <= 1 && (
            <div className="flex flex-wrap gap-2">
              {PERGUNTAS_INICIAIS.map(q => (
                <button key={q} onClick={() => enviar(q)}
                  className="text-xs px-3 py-2 rounded-xl transition-all"
                  style={{
                    background: 'rgba(124,123,250,0.08)',
                    border: '1px solid rgba(124,123,250,0.2)',
                    color: 'var(--cor-marca)',
                  }}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Mensagens */}
          <div className="card flex-1 overflow-y-auto flex flex-col gap-4 p-4" style={{ minHeight: 0 }}>
            {mensagens.map(m => (
              <div key={m.id} className={`flex gap-3 ${m.papel === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: m.papel === 'assistant'
                      ? 'linear-gradient(135deg, #7c7bfa, #c084fc)'
                      : 'rgba(52,211,153,0.15)',
                    border: m.papel === 'user' ? '1px solid rgba(52,211,153,0.3)' : 'none',
                  }}>
                  {m.papel === 'assistant'
                    ? <Zap size={14} color="#fff" />
                    : <User size={14} style={{ color: 'var(--cor-sucesso)' }} />
                  }
                </div>

                <div className="max-w-[80%] flex flex-col gap-1"
                  style={{ alignItems: m.papel === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line"
                    style={{
                      background: m.papel === 'user'
                        ? 'var(--cor-marca)'
                        : 'var(--cor-elevado)',
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

            {carregando && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #7c7bfa, #c084fc)' }}>
                  <Zap size={14} color="#fff" />
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

          {/* Botão CTA fixo */}
          <div className="flex items-center gap-3 p-4 rounded-2xl"
            style={{ background: 'linear-gradient(135deg, rgba(124,123,250,0.1), rgba(192,132,252,0.08))', border: '1px solid rgba(124,123,250,0.2)' }}>
            <TrendingUp size={18} style={{ color: 'var(--cor-marca)', flexShrink: 0 }} />
            <p className="text-xs flex-1" style={{ color: 'var(--cor-texto-muted)' }}>
              Plano Pro a partir de <strong style={{ color: 'var(--cor-texto)' }}>19€/mês</strong> — gerações ilimitadas + calendário automático
            </p>
            <a href="/precos"
              className="btn-primario text-xs px-4 py-2 flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #7c7bfa, #c084fc)' }}>
              Ver planos
            </a>
          </div>

          {/* Input */}
          <div className="flex gap-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && enviar()}
              placeholder="Faz uma pergunta sobre os planos ou funcionalidades..."
              className="input-campo flex-1"
              disabled={carregando}
            />
            <button onClick={() => enviar()} disabled={carregando || !input.trim()}
              className="btn-primario px-4"
              style={{
                background: 'linear-gradient(135deg, #7c7bfa, #c084fc)',
                ...(carregando || !input.trim() ? { opacity: 0.5, cursor: 'not-allowed' } : {})
              }}>
              {carregando ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </div>
      </LayoutPainel>
    </>
  )
}
