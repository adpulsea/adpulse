// ============================================
// AdPulse — Dashboard Principal
// ============================================

import Head from 'next/head'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import {
  TrendingUp, Users, Zap, Eye,
  ArrowUpRight, ArrowDownRight, Plus,
  Sparkles, TrendingDown, Bell, ChevronRight
} from 'lucide-react'
import LayoutPainel from '@/components/layout/LayoutPainel'
import { useAuth } from '@/hooks/useAuth'

// ---- Dados simulados (substituir por Supabase) ----

const METRICAS = [
  { titulo: 'Conteúdos gerados', valor: '47', variacao: 23, icone: Zap,        cor: '#7c7bfa' },
  { titulo: 'Alcance estimado',  valor: '12.4k', variacao: 18, icone: Eye,     cor: '#c084fc' },
  { titulo: 'Campanhas ativas',  valor: '3',   variacao: 0,  icone: TrendingUp,cor: '#34d399' },
  { titulo: 'Score médio viral', valor: '74',  variacao: -5, icone: Users,     cor: '#fbbf24' },
]

const ALERTAS = [
  { tipo: 'tendencia', mensagem: '🔥 "POV" e "dia na vida" estão em alta no TikTok hoje', acao: 'Criar conteúdo', rota: '/painel/studio' },
  { tipo: 'sugestao',  mensagem: '💡 Óptima hora para publicar no Instagram — engagement 40% acima da média', acao: null, rota: null },
  { tipo: 'aviso',     mensagem: '⚠️ Usaste 2 das 3 gerações grátis de hoje', acao: 'Fazer upgrade', rota: '/precos' },
]

const CALENDÁRIO_SEMANA = [
  { dia: 'Seg', hora: '09:00', tipo: 'Reel',     titulo: 'Dica rápida de produtividade', vazio: false },
  { dia: 'Ter', hora: '11:00', tipo: null,        titulo: null,                           vazio: true  },
  { dia: 'Qua', hora: '18:00', tipo: 'Carrossel', titulo: '5 erros a evitar em 2025',    vazio: false },
  { dia: 'Qui', hora: '10:00', tipo: null,        titulo: null,                           vazio: true  },
  { dia: 'Sex', hora: '19:00', tipo: 'Story',     titulo: 'Bastidores da semana',         vazio: false },
  { dia: 'Sáb', hora: '12:00', tipo: 'Post',      titulo: 'Reflexão semanal',             vazio: false },
  { dia: 'Dom', hora: null,    tipo: null,         titulo: null,                           vazio: true  },
]

const SUGESTOES_IA = [
  { titulo: 'Tendência: "Rotina da manhã"', descricao: 'Alto engagement esta semana no seu nicho', score: 92 },
  { titulo: '"O erro que me custou 1000€"', descricao: 'Hooks de erro pessoal têm 3x mais partilhas', score: 87 },
  { titulo: 'Tutorial passo-a-passo curto', descricao: 'Reels de tutorial entre 30-45s estão a viralizar', score: 81 },
]

// Dados do gráfico de crescimento (30 dias simulados)
function gerarDadosCrescimento() {
  const dados = []
  let base = 1200
  for (let i = 0; i < 30; i++) {
    base += Math.floor(Math.random() * 120) - 20
    dados.push(Math.max(base, 1000))
  }
  return dados
}

// Componente do gráfico SVG simples (sem dependências)
function GraficoCrescimento() {
  const dados = gerarDadosCrescimento()
  const max = Math.max(...dados)
  const min = Math.min(...dados)
  const h = 120
  const w = 600
  const pad = 10

  // Converter dados em pontos do SVG
  const pontos = dados.map((v, i) => {
    const x = pad + (i / (dados.length - 1)) * (w - pad * 2)
    const y = pad + ((max - v) / (max - min)) * (h - pad * 2)
    return `${x},${y}`
  })

  const caminhoLinha = `M ${pontos.join(' L ')}`
  const caminhoArea = `M ${pontos[0]} L ${pontos.join(' L ')} L ${w - pad},${h} L ${pad},${h} Z`

  const ultimoX = parseFloat(pontos[pontos.length - 1].split(',')[0])
  const ultimoY = parseFloat(pontos[pontos.length - 1].split(',')[1])

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${w} ${h + 20}`} width="100%" style={{ minWidth: 280 }}>
        <defs>
          <linearGradient id="gradArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#7c7bfa" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#7c7bfa" stopOpacity="0"/>
          </linearGradient>
        </defs>
        {/* Área preenchida */}
        <path d={caminhoArea} fill="url(#gradArea)" />
        {/* Linha principal */}
        <path d={caminhoLinha} fill="none" stroke="#7c7bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        {/* Ponto final */}
        <circle cx={ultimoX} cy={ultimoY} r="4" fill="#7c7bfa" />
        <circle cx={ultimoX} cy={ultimoY} r="8" fill="#7c7bfa" fillOpacity="0.2"/>
        {/* Labels eixo X */}
        {['1 Mar', '10 Mar', '20 Mar', 'Hoje'].map((label, i) => (
          <text key={label} x={pad + (i / 3) * (w - pad * 2)} y={h + 16}
            textAnchor="middle" fontSize="10" fill="var(--cor-texto-fraco)"
            fontFamily="var(--fonte-corpo)">
            {label}
          </text>
        ))}
      </svg>
    </div>
  )
}

export default function Dashboard() {
  const { utilizador } = useAuth()
  const nomeUtilizador = utilizador?.user_metadata?.nome
    || utilizador?.email?.split('@')[0] || 'criador'

  return (
    <>
      <Head><title>Dashboard — AdPulse</title></Head>
      <LayoutPainel titulo="Dashboard">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* ---- Saudação ---- */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--fonte-display)' }}>
                Olá, {nomeUtilizador} 👋
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--cor-texto-muted)' }}>
                Aqui está um resumo do teu crescimento esta semana.
              </p>
            </div>
            <Link href="/painel/studio" className="btn-primario hidden sm:inline-flex">
              <Sparkles size={16} />
              Criar conteúdo
            </Link>
          </div>

          {/* ---- Barra de alertas IA ---- */}
          <div className="flex flex-col gap-2">
            {ALERTAS.map((alerta, i) => (
              <div key={i} className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl text-sm"
                style={{
                  background: alerta.tipo === 'aviso' ? 'rgba(251,191,36,0.08)' : 'rgba(124,123,250,0.08)',
                  border: `1px solid ${alerta.tipo === 'aviso' ? 'rgba(251,191,36,0.2)' : 'rgba(124,123,250,0.15)'}`,
                }}>
                <span style={{ color: 'var(--cor-texto-muted)' }}>{alerta.mensagem}</span>
                {alerta.acao && (
                  <Link href={alerta.rota!} className="text-xs font-medium whitespace-nowrap flex items-center gap-1"
                    style={{ color: 'var(--cor-marca)' }}>
                    {alerta.acao} <ChevronRight size={12} />
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* ---- 4 Métricas ---- */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {METRICAS.map((m) => {
              const Icone = m.icone
              const subiu = m.variacao > 0
              const igual = m.variacao === 0
              return (
                <div key={m.titulo} className="card">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: `${m.cor}18`, border: `1px solid ${m.cor}30` }}>
                      <Icone size={18} style={{ color: m.cor }} />
                    </div>
                    {!igual && (
                      <div className="flex items-center gap-1 text-xs font-medium"
                        style={{ color: subiu ? 'var(--cor-sucesso)' : 'var(--cor-erro)' }}>
                        {subiu ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {Math.abs(m.variacao)}%
                      </div>
                    )}
                  </div>
                  <p className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--fonte-display)' }}>
                    {m.valor}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--cor-texto-muted)' }}>{m.titulo}</p>
                </div>
              )
            })}
          </div>

          {/* ---- Gráfico + Breakdown plataforma ---- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Gráfico crescimento */}
            <div className="card lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold" style={{ fontFamily: 'var(--fonte-display)' }}>
                  Crescimento de seguidores
                </h3>
                <span className="badge-marca text-xs">Últimos 30 dias</span>
              </div>
              <GraficoCrescimento />
            </div>

            {/* Breakdown por plataforma */}
            <div className="card">
              <h3 className="font-semibold mb-4" style={{ fontFamily: 'var(--fonte-display)' }}>
                Por plataforma
              </h3>
              <div className="flex flex-col gap-4">
                {[
                  { nome: 'Instagram', seguidores: '8.2k', pct: 66, cor: '#c084fc' },
                  { nome: 'TikTok',    seguidores: '3.1k', pct: 25, cor: '#fb7185' },
                  { nome: 'YouTube',   seguidores: '1.1k', pct: 9,  cor: '#fbbf24' },
                ].map((p) => (
                  <div key={p.nome}>
                    <div className="flex items-center justify-between mb-1.5 text-sm">
                      <span>{p.nome}</span>
                      <span style={{ color: 'var(--cor-texto-muted)' }}>{p.seguidores}</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: 'var(--cor-borda)' }}>
                      <div className="h-2 rounded-full transition-all duration-500"
                        style={{ width: `${p.pct}%`, background: p.cor }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ---- Calendário semanal + Sugestões IA ---- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Calendário */}
            <div className="card lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold" style={{ fontFamily: 'var(--fonte-display)' }}>
                  Calendário desta semana
                </h3>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {CALENDÁRIO_SEMANA.map((item) => (
                  <div key={item.dia} className="text-center">
                    <p className="text-xs mb-2 font-medium" style={{ color: 'var(--cor-texto-muted)' }}>
                      {item.dia}
                    </p>
                    {item.vazio ? (
                      <Link href="/painel/studio">
                        <div className="aspect-square rounded-xl flex items-center justify-center text-xs cursor-pointer transition-all duration-150 hover:scale-105"
                          style={{
                            border: '1px dashed var(--cor-borda-clara)',
                            color: 'var(--cor-texto-fraco)',
                          }}>
                          <Plus size={14} />
                        </div>
                      </Link>
                    ) : (
                      <div className="aspect-square rounded-xl flex flex-col items-center justify-center p-1 gap-0.5"
                        style={{ background: 'rgba(124,123,250,0.12)', border: '1px solid rgba(124,123,250,0.2)' }}>
                        <span className="text-xs font-bold" style={{ color: 'var(--cor-marca)', fontSize: '9px' }}>
                          {item.tipo}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--cor-texto-fraco)', fontSize: '9px' }}>
                          {item.hora}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Sugestões da IA */}
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={16} style={{ color: 'var(--cor-marca)' }} />
                <h3 className="font-semibold" style={{ fontFamily: 'var(--fonte-display)' }}>
                  Sugestões da IA
                </h3>
              </div>
              <div className="flex flex-col gap-3">
                {SUGESTOES_IA.map((s, i) => (
                  <Link key={i} href="/painel/viral-lab">
                    <div className="p-3 rounded-xl cursor-pointer transition-all duration-150 hover:scale-[1.01]"
                      style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)' }}>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-medium leading-tight">{s.titulo}</p>
                        <span className="text-xs font-bold flex-shrink-0 px-1.5 py-0.5 rounded-lg"
                          style={{
                            background: s.score >= 90 ? 'rgba(52,211,153,0.15)' : 'rgba(124,123,250,0.15)',
                            color: s.score >= 90 ? 'var(--cor-sucesso)' : 'var(--cor-marca)',
                          }}>
                          {s.score}
                        </span>
                      </div>
                      <p className="text-xs" style={{ color: 'var(--cor-texto-fraco)' }}>{s.descricao}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

        </div>
      </LayoutPainel>
    </>
  )
}
