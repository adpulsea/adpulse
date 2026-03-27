// ============================================
// AdPulse — Hook de Autenticação
// ============================================
// Este hook fornece o estado do utilizador em
// qualquer componente React.

import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

type EstadoAuth = {
  utilizador: User | null
  sessao: Session | null
  carregando: boolean
}

export function useAuth(): EstadoAuth {
  const [utilizador, setUtilizador] = useState<User | null>(null)
  const [sessao, setSessao] = useState<Session | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    // Buscar sessão atual ao carregar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessao(session)
      setUtilizador(session?.user ?? null)
      setCarregando(false)
    })

    // Ouvir mudanças de autenticação (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_evento, session) => {
        setSessao(session)
        setUtilizador(session?.user ?? null)
        setCarregando(false)
      }
    )

    // Limpar o listener quando o componente é desmontado
    return () => subscription.unsubscribe()
  }, [])

  return { utilizador, sessao, carregando }
}
