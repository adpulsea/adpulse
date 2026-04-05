// ============================================
// AdPulse — Hook: Verificar Plano
// ============================================

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export function usePlano() {
  const { utilizador } = useAuth()
  const [plano, setPlano]         = useState<string | null>(null)
  const [carregando, setCarr]     = useState(true)

  useEffect(() => {
    if (!utilizador) { setCarr(false); return }
    const carregar = async () => {
      const { data } = await supabase
        .from('perfis')
        .select('plano')
        .eq('id', utilizador.id)
        .single()
      setPlano(data?.plano || 'gratuito')
      setCarr(false)
    }
    carregar()
  }, [utilizador])

  const isPro     = plano === 'pro' || plano === 'agencia'
  const isAgencia = plano === 'agencia'
  const isGratuito = plano === 'gratuito'

  return { plano, isPro, isAgencia, isGratuito, carregando }
}
