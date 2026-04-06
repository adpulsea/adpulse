// ============================================
// AdPulse — Componente: Exportar PDF
// ============================================

import { useState } from 'react'
import { Download, Loader, Check } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

type Props = {
  mesAtual: number
  anoAtual: number
}

export default function ExportarPDF({ mesAtual, anoAtual }: Props) {
  const { utilizador }          = useAuth()
  const [estado, setEstado]     = useState<'idle' | 'gerando' | 'pronto'>('idle')

  const exportar = async () => {
    if (!utilizador) return
    setEstado('gerando')

    try {
      const inicioMes = new Date(anoAtual, mesAtual, 1).toISOString()
      const fimMes    = new Date(anoAtual, mesAtual + 1, 0, 23, 59, 59).toISOString()

      const r = await fetch('/api/exportar-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          utilizador_id: utilizador.id,
          semana_inicio: inicioMes,
          semana_fim: fimMes,
          email: utilizador.email,
        }),
      })

      const d = await r.json()
      if (!d.html) throw new Error('Sem HTML')

      // Abrir janela de impressão com o HTML
      const janela = window.open('', '_blank')
      if (janela) {
        janela.document.write(d.html)
        janela.document.close()
        setTimeout(() => {
          janela.print()
        }, 500)
      }

      setEstado('pronto')
      setTimeout(() => setEstado('idle'), 3000)
    } catch (err) {
      console.error(err)
      setEstado('idle')
    }
  }

  const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

  return (
    <button onClick={exportar} disabled={estado === 'gerando'}
      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all"
      style={{
        background: estado === 'pronto' ? 'rgba(52,211,153,0.1)' : 'var(--cor-elevado)',
        border: `1px solid ${estado === 'pronto' ? 'rgba(52,211,153,0.3)' : 'var(--cor-borda)'}`,
        color: estado === 'pronto' ? 'var(--cor-sucesso)' : 'var(--cor-texto-muted)',
        opacity: estado === 'gerando' ? 0.7 : 1,
        cursor: estado === 'gerando' ? 'not-allowed' : 'pointer',
      }}
      title={`Exportar plano de ${MESES[mesAtual]} em PDF`}>
      {estado === 'gerando' ? <Loader size={14} className="animate-spin" />
       : estado === 'pronto'  ? <Check size={14} />
       : <Download size={14} />}
      {estado === 'gerando' ? 'A gerar...'
       : estado === 'pronto'  ? 'Pronto!'
       : 'Exportar PDF'}
    </button>
  )
}
