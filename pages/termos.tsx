// ============================================
// AdPulse — Termos de Serviço
// ============================================

import Head from 'next/head'
import Link from 'next/link'
import { Zap, ArrowLeft } from 'lucide-react'

export default function TermosServico() {
  return (
    <>
      <Head><title>Termos de Serviço — AdPulse</title></Head>
      <div style={{ minHeight: '100vh', background: 'var(--cor-fundo)', color: 'var(--cor-texto)' }}>

        {/* Navbar */}
        <nav style={{ padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--cor-borda)' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--cor-marca)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={16} color="#fff" fill="#fff" />
            </div>
            <span style={{ fontFamily: 'var(--fonte-display)', fontWeight: 700, fontSize: 16, color: 'var(--cor-texto)' }}>AdPulse</span>
          </Link>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--cor-texto-muted)', textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Voltar
          </Link>
        </nav>

        <div style={{ maxWidth: 760, margin: '0 auto', padding: '60px 24px' }}>

          {/* Header */}
          <div style={{ marginBottom: 48 }}>
            <h1 style={{ fontFamily: 'var(--fonte-display)', fontSize: 36, fontWeight: 800, marginBottom: 12 }}>
              Termos de Serviço
            </h1>
            <p style={{ color: 'var(--cor-texto-muted)', fontSize: 14 }}>
              Última atualização: 3 de abril de 2026
            </p>
          </div>

          {/* Conteúdo */}
          {[
            {
              titulo: '1. Aceitação dos Termos',
              conteudo: `Ao aceder ou utilizar a plataforma AdPulse ("Serviço"), concordas com estes Termos de Serviço. Se não concordares com qualquer parte destes termos, não deves utilizar o Serviço.

A AdPulse é uma plataforma de criação de conteúdo com Inteligência Artificial destinada a criadores de conteúdo, empreendedores e agências.`,
            },
            {
              titulo: '2. Descrição do Serviço',
              conteudo: `A AdPulse oferece ferramentas de geração de conteúdo com IA, incluindo mas não limitado a:
• Geração de legendas, hooks e hashtags para redes sociais
• Calendário de conteúdo e agendamento de posts
• Biblioteca de média para armazenamento de imagens e vídeos
• Análise de criadores e sugestões de conteúdo viral
• Automação de respostas e gatilhos por palavra-chave
• Agentes de IA para suporte e consultoria

O Serviço é fornecido "tal como está" e pode ser atualizado ou modificado a qualquer momento.`,
            },
            {
              titulo: '3. Planos e Pagamentos',
              conteudo: `A AdPulse oferece os seguintes planos:

Plano Gratuito: Acesso limitado com 3 gerações por dia, sem custos.

Plano Pro (19€/mês ou 15€/mês anual): Gerações ilimitadas e acesso a todas as funcionalidades.

Plano Agência (49€/mês ou 39€/mês anual): Todas as funcionalidades Pro mais gestão de múltiplos clientes.

Os pagamentos são processados de forma segura pela Stripe. As subscrições renovam-se automaticamente no início de cada período de faturação. Podes cancelar a qualquer momento através das definições da tua conta.

Não são emitidos reembolsos por períodos parciais de subscrição, exceto conforme exigido por lei.`,
            },
            {
              titulo: '4. Conta de Utilizador',
              conteudo: `Para utilizar o Serviço, deves criar uma conta com informações verdadeiras e atualizadas. És responsável por:
• Manter a confidencialidade das tuas credenciais de acesso
• Todas as atividades realizadas na tua conta
• Notificar-nos imediatamente de qualquer uso não autorizado

A AdPulse reserva-se o direito de suspender ou encerrar contas que violem estes Termos.`,
            },
            {
              titulo: '5. Uso Aceitável',
              conteudo: `Ao utilizar a AdPulse, comprometes-te a não:
• Usar o Serviço para fins ilegais ou prejudiciais
• Gerar conteúdo que infrinja direitos de propriedade intelectual de terceiros
• Tentar aceder a partes não autorizadas do Serviço
• Usar o Serviço para enviar spam ou conteúdo enganoso
• Revender ou sublicenciar o Serviço sem autorização prévia
• Usar o Serviço de forma que possa danificar, sobrecarregar ou comprometer a plataforma`,
            },
            {
              titulo: '6. Propriedade Intelectual',
              conteudo: `O conteúdo gerado pela IA da AdPulse com base nos teus inputs é teu. A AdPulse não reivindica propriedade sobre o conteúdo que crias através da plataforma.

A AdPulse e os seus elementos distintivos (logo, design, código) são propriedade exclusiva da AdPulse e estão protegidos por leis de propriedade intelectual.`,
            },
            {
              titulo: '7. Privacidade e Dados',
              conteudo: `O tratamento dos teus dados pessoais é regido pela nossa Política de Privacidade, que faz parte integrante destes Termos. Ao utilizar o Serviço, consentes com o tratamento dos teus dados conforme descrito na Política de Privacidade.`,
            },
            {
              titulo: '8. Limitação de Responsabilidade',
              conteudo: `A AdPulse não se responsabiliza por:
• Danos indiretos, incidentais ou consequentes resultantes do uso do Serviço
• Perda de dados ou interrupções do Serviço
• Conteúdo gerado pela IA que possa ser impreciso ou inadequado
• Ações de terceiros relacionadas com o uso do Serviço

A responsabilidade total da AdPulse não excederá o valor pago pelo Serviço nos últimos 3 meses.`,
            },
            {
              titulo: '9. Alterações aos Termos',
              conteudo: `A AdPulse reserva-se o direito de modificar estes Termos a qualquer momento. As alterações serão comunicadas por email ou através da plataforma. O uso continuado do Serviço após as alterações constitui aceitação dos novos Termos.`,
            },
            {
              titulo: '10. Lei Aplicável',
              conteudo: `Estes Termos são regidos pela lei portuguesa. Qualquer litígio será resolvido nos tribunais competentes de Portugal.

Para questões relacionadas com estes Termos, contacta-nos através do nosso agente de suporte na plataforma.`,
            },
          ].map((s, i) => (
            <div key={i} style={{ marginBottom: 40 }}>
              <h2 style={{ fontFamily: 'var(--fonte-display)', fontSize: 18, fontWeight: 700, marginBottom: 12, color: 'var(--cor-texto)' }}>
                {s.titulo}
              </h2>
              <p style={{ color: 'var(--cor-texto-muted)', lineHeight: 1.8, fontSize: 15, whiteSpace: 'pre-line' }}>
                {s.conteudo}
              </p>
            </div>
          ))}

          {/* Footer */}
          <div style={{ marginTop: 60, paddingTop: 32, borderTop: '1px solid var(--cor-borda)', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <Link href="/privacidade" style={{ fontSize: 13, color: 'var(--cor-marca)', textDecoration: 'none' }}>
              Política de Privacidade
            </Link>
            <Link href="/precos" style={{ fontSize: 13, color: 'var(--cor-texto-muted)', textDecoration: 'none' }}>
              Preços
            </Link>
            <Link href="/painel/agentes/atendimento" style={{ fontSize: 13, color: 'var(--cor-texto-muted)', textDecoration: 'none' }}>
              Suporte
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
