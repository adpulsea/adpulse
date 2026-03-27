// ============================================
// AdPulse — Chat Widget Flutuante
// ============================================

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader, Bot, User, Minimize2 } from 'lucide-react'

type Mensagem = {
  id: string
  papel: 'user' | 'assistant'
  texto: string
}

const SISTEMA_WIDGET = `És o assistente de suporte da AdPulse — uma plataforma de criação de conteúdo viral com IA, em português de Portugal.

Responde de forma MUITO concisa (máximo 3 frases por resposta) sobre a AdPulse.

Funcionalidades: AI Content Studio (gera hooks/legendas/hashtags), Viral Lab, Creator Analyzer, Campanhas, Calendário de Conteúdo, Agentes de IA.
Planos: Gratuito (3 gerações/dia), Pro (29€/mês ou 19€/mês anual - ilimitado), Agência (79€/mês).
Stack: Next.js, Supabase, OpenAI.

Para questões complexas, diz "Podes ver mais detalhes no Suporte completo 👉 /painel/agentes".
NUNCA respondas sobre tópicos fora da AdPulse.
Responde sempre em português de Portugal.`

export default function ChatWidget() {
  const [aberto, setAberto]       = useState(false)
  const [minimizado, setMin]      = useState(false)
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    { id: '0', papel: 'assistant', texto: 'Olá! 👋 Como posso ajudar com a AdPulse?' }
  ])
  const [input, setInput]         = useState('')
  const [carregando, setCarr]     = useState(false)
  const [naoLidas, setNaoLidas]   = useState(0)
  const fimRef                    = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (aberto) {
      setNaoLidas(0)
      fimRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [aberto, mensagens])

  const enviar = async () => {
    const msg = input.trim()
    if (!msg || carregando) return

    const nova: Mensagem = { id: Date.now().toString(), papel: 'user', texto: msg }
    setMensagens(prev => [...prev, nova])
    setInput('')
    setCarr(true)

    try {
      const historico = [...mensagens, nova].map(m => ({ role: m.papel, content: m.texto }))
      const r = await fetch('/api/ia/agente-atendimento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensagens: historico, sistema: SISTEMA_WIDGET }),
      })
      const d = await r.json()
      const resposta: Mensagem = {
        id: Date.now().toString() + 'r',
        papel: 'assistant',
        texto: d.resposta || 'Ocorreu um erro. Tenta novamente.',
      }
      setMensagens(prev => [...prev, resposta])
      if (!aberto) setNaoLidas(n => n + 1)
    } catch {
      setMensagens(prev => [...prev, {
        id: Date.now().toString() + 'e',
        papel: 'assistant',
        texto: 'Erro de ligação. Tenta novamente.',
      }])
    } finally {
      setCarr(false)
    }
  }

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000 }}>

      {aberto && !minimizado && (
        <div style={{
          position: 'absolute', bottom: '70px', right: 0,
          width: '340px',
          background: 'var(--cor-card)',
          border: '1px solid var(--cor-borda)',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden', maxHeight: '480px',
        }}>
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid var(--cor-borda)',
            background: 'linear-gradient(135deg, rgba(124,123,250,0.1), transparent)',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '10px',
              background: 'rgba(124,123,250,0.2)',
              border: '1px solid rgba(124,123,250,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Bot size={16} color="var(--cor-marca)" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--cor-texto)', fontFamily: 'var(--fonte-display)' }}>
                Suporte AdPulse
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
                <span style={{ fontSize: 11, color: 'var(--cor-texto-muted)' }}>Online agora</span>
              </div>
            </div>
            <button onClick={() => setMin(true)} style={{ color: 'var(--cor-texto-muted)', padding: 4, cursor: 'pointer', background: 'none', border: 'none' }}>
              <Minimize2 size={14} />
            </button>
            <button onClick={() => setAberto(false)} style={{ color: 'var(--cor-texto-muted)', padding: 4, cursor: 'pointer', background: 'none', border: 'none' }}>
              <X size={16} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', minHeight: 0, maxHeight: '320px' }}>
            {mensagens.map(m => (
              <div key={m.id} style={{ display: 'flex', gap: 8, flexDirection: m.papel === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '8px', flexShrink: 0,
                  background: m.papel === 'assistant' ? 'rgba(124,123,250,0.15)' : 'rgba(52,211,153,0.15)',
                  border: `1px solid ${m.papel === 'assistant' ? 'rgba(124,123,250,0.3)' : 'rgba(52,211,153,0.3)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {m.papel === 'assistant'
                    ? <Bot size={12} color="var(--cor-marca)" />
                    : <User size={12} color="var(--cor-sucesso)" />
                  }
                </div>
                <div style={{
                  maxWidth: '80%', padding: '8px 12px',
                  borderRadius: m.papel === 'user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                  background: m.papel === 'user' ? 'var(--cor-marca)' : 'var(--cor-elevado)',
                  border: m.papel === 'user' ? 'none' : '1px solid var(--cor-borda)',
                  color: m.papel === 'user' ? '#fff' : 'var(--cor-texto)',
                  fontSize: 12, lineHeight: 1.5,
                }}>
                  {m.texto}
                </div>
              </div>
            ))}
            {carregando && (
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: '8px', background: 'rgba(124,123,250,0.15)', border: '1px solid rgba(124,123,250,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={12} color="var(--cor-marca)" />
                </div>
                <div style={{ padding: '8px 12px', borderRadius: '4px 14px 14px 14px', background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', display: 'flex', gap: 4, alignItems: 'center' }}>
                  {[0,1,2].map(i => (
                    <span key={i} style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: 'var(--cor-marca)', display: 'inline-block',
                      animation: 'bounce 1s infinite',
                      animationDelay: `${i * 0.15}s`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={fimRef} />
          </div>

          <div style={{ padding: '6px 12px', borderTop: '1px solid var(--cor-borda)' }}>
            <a href="/painel/agentes" style={{ fontSize: 11, color: 'var(--cor-marca)', textDecoration: 'none' }}>
              Ver suporte completo →
            </a>
          </div>

          <div style={{ padding: '10px 12px', borderTop: '1px solid var(--cor-borda)', display: 'flex', gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && enviar()}
              placeholder="Escreve a tua dúvida..."
              disabled={carregando}
              style={{
                flex: 1, padding: '8px 12px', borderRadius: '10px',
                background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)',
                color: 'var(--cor-texto)', fontSize: 12, outline: 'none',
                fontFamily: 'var(--fonte-corpo)',
              }}
            />
            <button onClick={enviar} disabled={carregando || !input.trim()}
              style={{
                width: 34, height: 34, borderRadius: '10px',
                background: 'var(--cor-marca)', border: 'none',
                cursor: carregando || !input.trim() ? 'not-allowed' : 'pointer',
                opacity: carregando || !input.trim() ? 0.5 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
              {carregando ? <Loader size={14} color="#fff" /> : <Send size={14} color="#fff" />}
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => { setAberto(o => !o); setMin(false) }}
        style={{
          width: 52, height: 52, borderRadius: '50%',
          background: aberto ? 'var(--cor-elevado)' : 'linear-gradient(135deg, #7c7bfa, #c084fc)',
          border: aberto ? '1px solid var(--cor-borda)' : 'none',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 30px rgba(124,123,250,0.4)',
          transition: 'all 0.2s ease', position: 'relative',
        }}>
        {aberto ? <X size={20} color="var(--cor-texto-muted)" /> : <MessageCircle size={22} color="#fff" />}
        {naoLidas > 0 && !aberto && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            width: 18, height: 18, borderRadius: '50%',
            background: '#f87171', color: '#fff',
            fontSize: 10, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--cor-fundo)',
          }}>
            {naoLidas}
          </span>
        )}
      </button>
    </div>
  )
}