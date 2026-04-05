// ============================================
// AdPulse — Tour de Boas-Vindas
// ============================================

import { useState } from 'react'
import Link from 'next/link'
import {
  Sparkles, CalendarDays, ImageIcon, TrendingUp,
  ArrowRight, X, Check, Zap
} from 'lucide-react'

type Props = {
  nome: string
  onFechar: () => void
}

const PASSOS = [
  {
    icone: Sparkles,
    cor: '#7c7bfa',
    emoji: '✨',
    titulo: 'Gera conteúdo com IA',
    descricao: 'Escreve o teu tópico e a IA cria uma legenda completa com hook e hashtags em segundos.',
    cta: 'Ir para o AI Content Studio',
    href: '/painel/studio',
    dica: 'Dica: começa por descrever o teu negócio ou um tema que queiras abordar esta semana.',
  },
  {
    icone: CalendarDays,
    cor: '#34d399',
    emoji: '📅',
    titulo: 'Planeia o teu calendário',
    descricao: 'Organiza todos os teus posts numa vista semanal. Clica num dia para adicionar um post.',
    cta: 'Ver o calendário',
    href: '/painel/calendario',
    dica: 'Dica: usa o botão "Gerar semana com IA" para criar 5 posts de uma vez!',
  },
  {
    icone: ImageIcon,
    cor: '#fbbf24',
    emoji: '🖼️',
    titulo: 'Carrega as tuas imagens',
    descricao: 'Guarda todas as tuas fotos e vídeos na Biblioteca de Média para usar nos teus posts.',
    cta: 'Ir para a biblioteca',
    href: '/painel/media',
    dica: 'Dica: organiza as tuas imagens em pastas por campanha ou tema.',
  },
  {
    icone: TrendingUp,
    cor: '#f472b6',
    emoji: '🔥',
    titulo: 'Descobre o potencial viral',
    descricao: 'O Viral Lab analisa qualquer hook ou ideia e diz-te o score viral antes de publicares.',
    cta: 'Ver o Viral Lab',
    href: '/painel/viral-lab',
    dica: 'Dica: testa os hooks gerados pela IA e escolhe o que tem maior score.',
  },
]

export default function TourBoasVindas({ nome, onFechar }: Props) {
  const [passo, setPasso] = useState(0)
  const passoAtual = PASSOS[passo]
  const Icone = passoAtual.icone
  const isUltimo = passo === PASSOS.length - 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-lg flex flex-col gap-0 overflow-hidden"
        style={{ background: 'var(--cor-card)', border: '1px solid var(--cor-borda)', borderRadius: 24 }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--cor-borda)', background: 'rgba(124,123,250,0.04)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--cor-marca)' }}>
              <Zap size={14} color="#fff" fill="#fff" />
            </div>
            <span className="font-semibold text-sm" style={{ fontFamily: 'var(--fonte-display)' }}>
              Tour rápido — {passo + 1} de {PASSOS.length}
            </span>
          </div>
          <button onClick={onFechar}
            style={{ color: 'var(--cor-texto-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={16} />
          </button>
        </div>

        {/* Barra de progresso */}
        <div className="h-1" style={{ background: 'var(--cor-borda)' }}>
          <div className="h-1 transition-all duration-500"
            style={{ width: `${((passo + 1) / PASSOS.length) * 100}%`, background: 'var(--cor-marca)' }} />
        </div>

        {/* Conteúdo */}
        <div className="p-6 flex flex-col gap-5">

          {/* Saudação só no primeiro passo */}
          {passo === 0 && (
            <div className="text-center pb-2">
              <p className="text-2xl mb-1">🎉</p>
              <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--fonte-display)' }}>
                Bem-vindo à AdPulse, {nome}!
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--cor-texto-muted)' }}>
                Deixa-nos mostrar-te as 4 funcionalidades principais.
              </p>
            </div>
          )}

          {/* Card do passo */}
          <div className="p-5 rounded-2xl flex flex-col gap-4"
            style={{ background: `${passoAtual.cor}08`, border: `1px solid ${passoAtual.cor}25` }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{ background: `${passoAtual.cor}15`, border: `1px solid ${passoAtual.cor}30` }}>
                {passoAtual.emoji}
              </div>
              <div>
                <h3 className="font-bold text-lg" style={{ fontFamily: 'var(--fonte-display)', color: passoAtual.cor }}>
                  {passoAtual.titulo}
                </h3>
                <p className="text-sm mt-0.5" style={{ color: 'var(--cor-texto-muted)' }}>
                  {passoAtual.descricao}
                </p>
              </div>
            </div>

            {/* Dica */}
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--cor-borda)' }}>
              <span style={{ fontSize: 14 }}>💡</span>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--cor-texto-muted)' }}>
                {passoAtual.dica}
              </p>
            </div>
          </div>

          {/* Dots de progresso */}
          <div className="flex items-center justify-center gap-2">
            {PASSOS.map((_, i) => (
              <button key={i} onClick={() => setPasso(i)}
                style={{
                  width: i === passo ? 20 : 6,
                  height: 6,
                  borderRadius: 3,
                  background: i === passo ? 'var(--cor-marca)' : 'var(--cor-borda)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  padding: 0,
                }} />
            ))}
          </div>

          {/* Botões */}
          <div className="flex gap-3">
            {passo > 0 && (
              <button onClick={() => setPasso(p => p - 1)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: 'var(--cor-elevado)', border: '1px solid var(--cor-borda)', color: 'var(--cor-texto-muted)' }}>
                Anterior
              </button>
            )}

            {!isUltimo ? (
              <button onClick={() => setPasso(p => p + 1)}
                className="btn-primario flex-1 justify-center py-2.5">
                Próximo <ArrowRight size={14} />
              </button>
            ) : (
              <Link href={passoAtual.href} onClick={onFechar}
                className="btn-primario flex-1 justify-center py-2.5"
                style={{ textDecoration: 'none' }}>
                <Check size={14} /> Começar agora!
              </Link>
            )}
          </div>

          {/* Ir direto */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {PASSOS.map((p, i) => (
              <button key={i} onClick={() => setPasso(i)}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-all"
                style={{
                  background: i === passo ? `${p.cor}15` : 'transparent',
                  color: i === passo ? p.cor : 'var(--cor-texto-fraco)',
                  border: `1px solid ${i === passo ? p.cor + '30' : 'transparent'}`,
                }}>
                {p.emoji} {p.titulo.split(' ')[0]}
              </button>
            ))}
          </div>

          <button onClick={onFechar}
            className="text-xs text-center"
            style={{ color: 'var(--cor-texto-fraco)', background: 'none', border: 'none', cursor: 'pointer' }}>
            Saltar tour — vou explorar sozinho
          </button>
        </div>
      </div>
    </div>
  )
}
