// ============================================
// AdPulse — Componente de Bloqueio Pro
// ============================================

import Link from 'next/link'
import { Lock, Sparkles, Zap, Check } from 'lucide-react'

type Props = {
  funcionalidade: string
  descricao: string
  emoji: string
}

export default function BloqueadoPro({ funcionalidade, descricao, emoji }: Props) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4"
      style={{ minHeight: '60vh' }}>

      {/* Fundo glow */}
      <div style={{
        position: 'absolute', width: 400, height: 400,
        background: 'rgba(124,123,250,0.06)', borderRadius: '50%',
        filter: 'blur(60px)', pointerEvents: 'none',
      }} />

      <div className="relative z-10 flex flex-col items-center gap-6 max-w-md">

        {/* Ícone */}
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl"
            style={{ background: 'rgba(124,123,250,0.1)', border: '1px solid rgba(124,123,250,0.2)' }}>
            {emoji}
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'var(--cor-aviso)', border: '2px solid var(--cor-fundo)' }}>
            <Lock size={14} color="#000" />
          </div>
        </div>

        {/* Texto */}
        <div>
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--fonte-display)' }}>
            {funcionalidade} é Pro
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--cor-texto-muted)' }}>
            {descricao}
          </p>
        </div>

        {/* Benefícios Pro */}
        <div className="w-full p-5 rounded-2xl text-left"
          style={{ background: 'rgba(124,123,250,0.06)', border: '1px solid rgba(124,123,250,0.2)' }}>
          <p className="text-xs font-semibold mb-3 uppercase tracking-wide" style={{ color: 'var(--cor-marca)' }}>
            ✨ O que tens com o Pro
          </p>
          <div className="flex flex-col gap-2">
            {[
              'Gerações ilimitadas de conteúdo por dia',
              'Acesso ao Viral Lab e Creator Analyzer',
              'Automação e agendamento inteligente',
              'Workspaces para múltiplas marcas',
              'Agentes IA de suporte, crescimento e prospeção',
              'Equipa de gestão de conteúdo interna',
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-2.5 text-sm">
                <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)' }}>
                  <Check size={10} style={{ color: 'var(--cor-sucesso)' }} />
                </div>
                <span style={{ color: 'var(--cor-texto-muted)' }}>{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Preço */}
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold" style={{ fontFamily: 'var(--fonte-display)', color: 'var(--cor-marca)' }}>19€</span>
          <span className="text-sm" style={{ color: 'var(--cor-texto-muted)' }}>/mês</span>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3 w-full">
          <Link href="/precos" className="btn-primario justify-center py-3.5 text-base"
            style={{ textDecoration: 'none' }}>
            <Sparkles size={18} /> Fazer upgrade para Pro
          </Link>
          <Link href="/painel" className="text-sm text-center"
            style={{ color: 'var(--cor-texto-muted)', textDecoration: 'none' }}>
            Voltar ao dashboard
          </Link>
        </div>

        <p className="text-xs" style={{ color: 'var(--cor-texto-fraco)' }}>
          Sem compromisso. Cancela quando quiseres.
        </p>
      </div>
    </div>
  )
}
