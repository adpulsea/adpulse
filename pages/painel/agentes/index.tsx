// ============================================
// AdPulse — Hub de Agentes IA
// ============================================

import Head from 'next/head'
import Link from 'next/link'
import { Bot, Zap, MessageCircle, TrendingUp, Shield, Star } from 'lucide-react'
import LayoutPainel from '@/components/layout/LayoutPainel'

const AGENTES = [
  {
    id: 'atendimento',
    href: '/painel/agentes/atendimento',
    icone: Bot,
    cor: '#7c7bfa',
    titulo: 'Agente de Suporte',
    descricao: 'Tira todas as tuas dúvidas sobre a AdPulse. Sabe tudo sobre as funcionalidades, planos e como resolver problemas.',
    tags: ['Suporte 24/7', 'Respostas instantâneas', 'Especialista AdPulse'],
    cta: 'Falar com suporte',
  },
  {
    id: 'vendas',
    href: '/painel/agentes/vendas',
    icone: Zap,
    cor: '#c084fc',
    titulo: 'Consultor de Crescimento',
    descricao: 'Descobre qual o plano ideal para ti e como tirar o máximo partido da AdPulse para crescer nas redes sociais.',
    tags: ['Planos e preços', 'Estratégia de crescimento', 'ROI calculado'],
    cta: 'Falar com consultor',
  },
]

export default function PaginaAgentes() {
  return (
    <>
      <Head><title>Agentes IA — AdPulse</title></Head>
      <LayoutPainel titulo="Agentes IA">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 text-sm"
              style={{ background: 'rgba(124,123,250,0.1)', border: '1px solid rgba(124,123,250,0.2)', color: 'var(--cor-marca)' }}>
              <Bot size={14} /> Equipa de Agentes AdPulse
            </div>
            <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: 'var(--fonte-display)' }}>
              A tua equipa de IA está pronta
            </h2>
            <p style={{ color: 'var(--cor-texto-muted)', maxWidth: 480, margin: '0 auto' }}>
              Dois agentes especializados para te ajudar a crescer e a tirar o máximo da AdPulse.
            </p>
          </div>

          {/* Cards dos agentes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {AGENTES.map(a => {
              const Icone = a.icone
              return (
                <div key={a.id} className="card flex flex-col gap-5 group"
                  style={{ transition: 'border-color 0.2s' }}
                  onMouseOver={e => (e.currentTarget.style.borderColor = a.cor + '40')}
                  onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--cor-borda)')}>

                  {/* Avatar + título */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${a.cor}15`, border: `1px solid ${a.cor}30` }}>
                      <Icone size={26} style={{ color: a.cor }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg" style={{ fontFamily: 'var(--fonte-display)' }}>
                        {a.titulo}
                      </h3>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: '#34d399' }} />
                        <span className="text-xs" style={{ color: 'var(--cor-texto-muted)' }}>Online agora</span>
                      </div>
                    </div>
                  </div>

                  {/* Descrição */}
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--cor-texto-muted)' }}>
                    {a.descricao}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {a.tags.map(t => (
                      <span key={t} className="text-xs px-2.5 py-1 rounded-full"
                        style={{ background: `${a.cor}10`, color: a.cor, border: `1px solid ${a.cor}25` }}>
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <Link href={a.href}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: `${a.cor}15`,
                      border: `1px solid ${a.cor}30`,
                      color: a.cor,
                    }}
                    onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = `${a.cor}25` }}
                    onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = `${a.cor}15` }}>
                    <MessageCircle size={16} />
                    {a.cta}
                  </Link>
                </div>
              )
            })}
          </div>

          {/* Info extra */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icone: Shield, label: 'Privacidade garantida', desc: 'As tuas conversas não são partilhadas' },
              { icone: TrendingUp, label: 'Sempre a melhorar', desc: 'Os agentes aprendem continuamente' },
              { icone: Star, label: '4.9/5 de satisfação', desc: 'Avaliado por +500 utilizadores' },
            ].map(i => {
              const Icone = i.icone
              return (
                <div key={i.label} className="card text-center py-4">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2"
                    style={{ background: 'rgba(124,123,250,0.1)', border: '1px solid rgba(124,123,250,0.2)' }}>
                    <Icone size={16} style={{ color: 'var(--cor-marca)' }} />
                  </div>
                  <p className="text-xs font-semibold mb-0.5">{i.label}</p>
                  <p className="text-xs" style={{ color: 'var(--cor-texto-muted)' }}>{i.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </LayoutPainel>
    </>
  )
}
