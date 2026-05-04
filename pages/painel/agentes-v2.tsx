import Head from 'next/head'
import LayoutPainel from '@/components/layout/LayoutPainel'

export default function AgentesV2() {
  return (
    <>
      <Head>
        <title>Agentes V2 — AdPulse</title>
      </Head>

      <LayoutPainel titulo="TESTE AGENTES V2 ATIVO ⚡">
        <div style={{ maxWidth: 900, margin: '0 auto', padding: 30 }}>
          <div
            style={{
              background: '#111827',
              border: '1px solid #7c7bfa',
              borderRadius: 18,
              padding: 30,
              color: '#fff',
            }}
          >
            <h1 style={{ fontSize: 32, marginBottom: 12 }}>
              ⚡ Página nova dos Agentes V2 ativa
            </h1>

            <p style={{ fontSize: 16, opacity: 0.8 }}>
              Esta é a nova página da Equipa AdPulse. Se estás a ver isto, a rota nova funciona.
            </p>

            <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                style={{
                  padding: '12px 18px',
                  borderRadius: 10,
                  border: 'none',
                  background: '#f59e0b',
                  color: '#fff',
                  fontWeight: 800,
                }}
              >
                ⚡ Gerar post rápido
              </button>

              <button
                style={{
                  padding: '12px 18px',
                  borderRadius: 10,
                  border: 'none',
                  background: '#7c7bfa',
                  color: '#fff',
                  fontWeight: 800,
                }}
              >
                🚀 Gerar campanha GOD MODE
              </button>
            </div>
          </div>
        </div>
      </LayoutPainel>
    </>
  )
}
