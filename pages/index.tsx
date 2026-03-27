// ============================================
// AdPulse — Landing Page Principal
// ============================================

import Head from 'next/head'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import {
  Zap, Sparkles, TrendingUp, BarChart2, Calendar,
  Users, Check, ArrowRight, Star, Play
} from 'lucide-react'

// --- Dados das funcionalidades ---
const funcionalidades = [
  {
    icone: Sparkles,
    titulo: 'AI Content Studio',
    descricao: 'Gera legendas, hooks e hashtags virais para qualquer plataforma em segundos.',
    cor: '#7c7bfa',
  },
  {
    icone: TrendingUp,
    titulo: 'Viral Lab',
    descricao: 'Analisa o potencial viral do teu conteúdo com um score detalhado em 4 dimensões.',
    cor: '#c084fc',
  },
  {
    icone: BarChart2,
    titulo: 'Creator Analyzer',
    descricao: 'Recebe um plano de crescimento personalizado com base no teu nicho e métricas.',
    cor: '#fb7185',
  },
  {
    icone: Calendar,
    titulo: 'Calendário Editorial',
    descricao: 'Organiza e planeia o teu conteúdo com sugestões de horário da IA.',
    cor: '#34d399',
  },
  {
    icone: Users,
    titulo: 'Gestão de Campanhas',
    descricao: 'Agrupa os teus posts por campanha e mantém tudo organizado num só lugar.',
    cor: '#fbbf24',
  },
  {
    icone: Zap,
    titulo: 'Geração Rápida',
    descricao: 'De ideia a conteúdo pronto para publicar em menos de 60 segundos.',
    cor: '#60a5fa',
  },
]

// --- Passos de como funciona ---
const passos = [
  {
    numero: '01',
    titulo: 'Escreve o teu tópico',
    descricao: 'Diz-nos sobre o que queres criar conteúdo. Pode ser uma palavra, uma ideia ou um produto.',
  },
  {
    numero: '02',
    titulo: 'A IA gera o conteúdo',
    descricao: 'O nosso modelo analisa tendências e cria legendas, hooks e hashtags otimizados para viralizar.',
  },
  {
    numero: '03',
    titulo: 'Edita e publica',
    descricao: 'Ajusta ao teu estilo, copia com um clique e publica diretamente na tua plataforma.',
  },
]

// --- Planos de preços ---
const planos = [
  {
    nome: 'Gratuito',
    preco: '€0',
    periodo: '/mês',
    descricao: 'Para experimentar e começar',
    destaques: false,
    funcionalidades: [
      '3 gerações de IA por dia',
      '1 campanha ativa',
      'Content Studio básico',
      'Exportar conteúdo',
    ],
    naoInclui: [
      'Viral Lab',
      'Creator Analyzer',
      'Múltiplas campanhas',
    ],
    cta: 'Começar grátis',
    href: '/auth/registar',
  },
  {
    nome: 'Pro',
    preco: '€24',
    periodo: '/mês',
    descricao: 'Para criadores a crescer',
    destaques: true,
    funcionalidades: [
      'Gerações ilimitadas',
      'Campanhas ilimitadas',
      'Viral Lab completo',
      'Creator Analyzer',
      'Calendário editorial',
      'Sem marca de água',
      'Suporte prioritário',
    ],
    naoInclui: [],
    cta: 'Começar Pro',
    href: '/auth/registar?plano=pro',
  },
  {
    nome: 'Agência',
    preco: '€59',
    periodo: '/mês',
    descricao: 'Para equipas e agências',
    destaques: false,
    funcionalidades: [
      'Tudo do Pro',
      'Até 5 contas de cliente',
      'Relatórios avançados',
      'Gestão de equipa',
      'Suporte dedicado',
      'Acesso API (em breve)',
    ],
    naoInclui: [],
    cta: 'Falar connosco',
    href: '/auth/registar?plano=agencia',
  },
]

// --- Testemunhos (placeholder realista) ---
const testemunhos = [
  {
    nome: 'Mariana Costa',
    papel: 'Criadora de conteúdo — 42k seguidores',
    texto: 'Triplicou a minha velocidade de criação de conteúdo. Os hooks gerados pela IA são incríveis.',
    estrelas: 5,
  },
  {
    nome: 'Tiago Ferreira',
    papel: 'Social Media Manager',
    texto: 'Gero conteúdo para 8 clientes por dia. O AdPulse tornou isso possível sem enlouquecer.',
    estrelas: 5,
  },
  {
    nome: 'Ana Rodrigues',
    papel: 'Dono de pequena empresa',
    texto: 'Não sabia nada de redes sociais. Agora tenho conteúdo profissional todos os dias.',
    estrelas: 5,
  },
]

export default function LandingPage() {
  return (
    <>
      <Head>
        <title>AdPulse — Cria Conteúdo Viral com IA</title>
        <meta name="description" content="O primeiro estúdio de conteúdo viral em português. Gera legendas, hooks e hashtags em segundos com Inteligência Artificial." />
      </Head>

      <Navbar />

      <main style={{ background: 'var(--cor-fundo)' }}>

        {/* ====================================
            SECÇÃO HERO
        ==================================== */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">

          {/* Efeitos de fundo */}
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="efeito-glow w-96 h-96 -top-20 left-1/4"
              style={{ background: 'rgba(124, 123, 250, 0.15)' }}
            />
            <div
              className="efeito-glow w-80 h-80 top-1/3 right-1/4"
              style={{ background: 'rgba(192, 132, 252, 0.1)' }}
            />
            {/* Grelha de fundo */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `
                  linear-gradient(var(--cor-borda) 1px, transparent 1px),
                  linear-gradient(90deg, var(--cor-borda) 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px',
              }}
            />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">

            {/* Badge de lançamento */}
            <div className="inline-flex items-center gap-2 mb-8">
              <span className="badge-marca">
                <Zap size={12} />
                Novo — AI Content Studio 2.0
              </span>
            </div>

            {/* Título principal */}
            <h1
              className="text-5xl md:text-7xl font-bold leading-tight mb-6"
              style={{ fontFamily: 'var(--fonte-display)' }}
            >
              Cria{' '}
              <span className="texto-gradiente">Conteúdo Viral</span>
              <br />
              com Inteligência Artificial
            </h1>

            {/* Subtítulo */}
            <p
              className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto leading-relaxed"
              style={{ color: 'var(--cor-texto-muted)' }}
            >
              O primeiro estúdio de conteúdo viral em português.
              De ideia a post pronto em menos de 60 segundos.
            </p>

            {/* Botões CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/auth/registar" className="btn-primario text-base py-3 px-8">
                <Sparkles size={18} />
                Começar grátis
              </Link>
              <a href="#como-funciona" className="btn-secundario text-base py-3 px-8">
                <Play size={18} />
                Ver como funciona
              </a>
            </div>

            {/* Prova social rápida */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm" style={{ color: 'var(--cor-texto-muted)' }}>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[0,1,2,3].map(i => (
                    <div key={i} className="w-7 h-7 rounded-full -ml-2 first:ml-0 border-2 flex items-center justify-center text-xs font-bold"
                      style={{ borderColor: 'var(--cor-fundo)', background: ['#7c7bfa','#c084fc','#fb7185','#34d399'][i], color: '#fff' }}>
                      {['M','T','A','R'][i]}
                    </div>
                  ))}
                </div>
                <span>+500 criadores ativos</span>
              </div>
              <div className="flex items-center gap-1">
                {[0,1,2,3,4].map(i => <Star key={i} size={14} fill="#fbbf24" stroke="none" />)}
                <span>4.9/5 estrelas</span>
              </div>
              <span>✓ Sem cartão de crédito</span>
            </div>
          </div>
        </section>

        {/* ====================================
            SECÇÃO FUNCIONALIDADES
        ==================================== */}
        <section id="funcionalidades" className="py-24 px-6">
          <div className="max-w-6xl mx-auto">

            <div className="text-center mb-16">
              <span className="badge-marca mb-4 inline-flex">Funcionalidades</span>
              <h2 className="titulo-secao text-4xl md:text-5xl mb-4">
                Tudo o que precisas para<br />
                <span className="texto-gradiente">dominar as redes sociais</span>
              </h2>
              <p className="text-lg" style={{ color: 'var(--cor-texto-muted)' }}>
                Ferramentas de IA pensadas para criadores portugueses e brasileiros.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {funcionalidades.map((f) => {
                const Icone = f.icone
                return (
                  <div key={f.titulo} className="card-hover group">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                      style={{ background: `${f.cor}20`, border: `1px solid ${f.cor}40` }}
                    >
                      <Icone size={20} style={{ color: f.cor }} />
                    </div>
                    <h3 className="font-semibold text-lg mb-2" style={{ fontFamily: 'var(--fonte-display)' }}>
                      {f.titulo}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--cor-texto-muted)' }}>
                      {f.descricao}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ====================================
            SECÇÃO COMO FUNCIONA
        ==================================== */}
        <section id="como-funciona" className="py-24 px-6" style={{ borderTop: '1px solid var(--cor-borda)' }}>
          <div className="max-w-4xl mx-auto">

            <div className="text-center mb-16">
              <span className="badge-marca mb-4 inline-flex">Como funciona</span>
              <h2 className="titulo-secao text-4xl md:text-5xl mb-4">
                Em 3 passos simples
              </h2>
            </div>

            <div className="flex flex-col gap-8">
              {passos.map((passo, i) => (
                <div key={i} className="flex gap-6 items-start">
                  <div
                    className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold"
                    style={{
                      fontFamily: 'var(--fonte-display)',
                      background: 'rgba(124, 123, 250, 0.1)',
                      color: 'var(--cor-marca)',
                      border: '1px solid rgba(124, 123, 250, 0.2)',
                    }}
                  >
                    {passo.numero}
                  </div>
                  <div className="pt-2">
                    <h3 className="font-semibold text-xl mb-2" style={{ fontFamily: 'var(--fonte-display)' }}>
                      {passo.titulo}
                    </h3>
                    <p style={{ color: 'var(--cor-texto-muted)' }}>{passo.descricao}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ====================================
            SECÇÃO TESTEMUNHOS
        ==================================== */}
        <section className="py-24 px-6" style={{ borderTop: '1px solid var(--cor-borda)' }}>
          <div className="max-w-6xl mx-auto">

            <div className="text-center mb-16">
              <h2 className="titulo-secao text-4xl mb-4">
                O que dizem os criadores
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testemunhos.map((t, i) => (
                <div key={i} className="card">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.estrelas }).map((_, j) => (
                      <Star key={j} size={16} fill="#fbbf24" stroke="none" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--cor-texto-muted)' }}>
                    &quot;{t.texto}&quot;
                  </p>
                  <div>
                    <p className="font-medium text-sm">{t.nome}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--cor-texto-fraco)' }}>{t.papel}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ====================================
            SECÇÃO PREÇOS
        ==================================== */}
        <section id="precos" className="py-24 px-6" style={{ borderTop: '1px solid var(--cor-borda)' }}>
          <div className="max-w-6xl mx-auto">

            <div className="text-center mb-16">
              <span className="badge-marca mb-4 inline-flex">Preços</span>
              <h2 className="titulo-secao text-4xl md:text-5xl mb-4">
                Simples e transparente
              </h2>
              <p style={{ color: 'var(--cor-texto-muted)' }}>
                Começa grátis. Faz upgrade quando quiseres crescer mais rápido.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {planos.map((plano) => (
                <div
                  key={plano.nome}
                  className="card relative transition-all duration-200"
                  style={plano.destaques ? {
                    borderColor: 'var(--cor-marca)',
                    boxShadow: '0 0 0 1px var(--cor-marca), 0 16px 48px rgba(124, 123, 250, 0.2)',
                  } : {}}
                >
                  {/* Badge popular */}
                  {plano.destaques && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="badge-marca text-xs py-1 px-3">
                        Mais popular
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <p className="font-semibold text-lg mb-1" style={{ fontFamily: 'var(--fonte-display)' }}>
                      {plano.nome}
                    </p>
                    <p className="text-sm mb-4" style={{ color: 'var(--cor-texto-muted)' }}>
                      {plano.descricao}
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold" style={{ fontFamily: 'var(--fonte-display)' }}>
                        {plano.preco}
                      </span>
                      <span style={{ color: 'var(--cor-texto-muted)' }}>{plano.periodo}</span>
                    </div>
                  </div>

                  <Link
                    href={plano.href}
                    className={plano.destaques ? 'btn-primario w-full justify-center mb-6' : 'btn-secundario w-full justify-center mb-6'}
                  >
                    {plano.cta}
                    <ArrowRight size={16} />
                  </Link>

                  <div className="flex flex-col gap-3">
                    {plano.funcionalidades.map((f) => (
                      <div key={f} className="flex items-start gap-2.5">
                        <Check size={16} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--cor-sucesso)' }} />
                        <span className="text-sm">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ====================================
            CTA FINAL
        ==================================== */}
        <section className="py-24 px-6" style={{ borderTop: '1px solid var(--cor-borda)' }}>
          <div className="max-w-2xl mx-auto text-center">
            <div
              className="rounded-3xl p-12 relative overflow-hidden"
              style={{ background: 'rgba(124, 123, 250, 0.08)', border: '1px solid rgba(124, 123, 250, 0.2)' }}
            >
              <div className="efeito-glow w-64 h-64 top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ background: 'rgba(124, 123, 250, 0.2)' }} />

              <div className="relative z-10">
                <h2 className="titulo-secao text-4xl mb-4">
                  Pronto para viralizar?
                </h2>
                <p className="mb-8" style={{ color: 'var(--cor-texto-muted)' }}>
                  Junta-te a centenas de criadores que já usam o AdPulse.<br />
                  Começa grátis hoje, sem cartão de crédito.
                </p>
                <Link href="/auth/registar" className="btn-primario text-base py-3 px-8 inline-flex">
                  <Sparkles size={18} />
                  Criar conta grátis
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 text-center" style={{ borderTop: '1px solid var(--cor-borda)' }}>
          <p className="text-sm" style={{ color: 'var(--cor-texto-fraco)' }}>
            © 2025 AdPulse. Feito em Portugal, para o mundo.
          </p>
        </footer>
      </main>
    </>
  )
}
