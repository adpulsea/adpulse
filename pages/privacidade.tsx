// ============================================
// AdPulse — Política de Privacidade
// ============================================

import Head from 'next/head'
import Link from 'next/link'
import { Zap, ArrowLeft } from 'lucide-react'

export default function Privacidade() {
  return (
    <>
      <Head><title>Política de Privacidade — AdPulse</title></Head>
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
              Política de Privacidade
            </h1>
            <p style={{ color: 'var(--cor-texto-muted)', fontSize: 14 }}>
              Última atualização: 3 de abril de 2026
            </p>
          </div>

          {/* Intro */}
          <div style={{ padding: '20px 24px', borderRadius: 16, marginBottom: 40, background: 'rgba(124,123,250,0.06)', border: '1px solid rgba(124,123,250,0.15)' }}>
            <p style={{ color: 'var(--cor-texto-muted)', lineHeight: 1.8, fontSize: 15 }}>
              Na AdPulse, a tua privacidade é uma prioridade. Esta política explica de forma clara e transparente como recolhemos, usamos e protegemos os teus dados pessoais, em conformidade com o Regulamento Geral sobre a Proteção de Dados (RGPD) e a legislação portuguesa aplicável.
            </p>
          </div>

          {[
            {
              titulo: '1. Responsável pelo Tratamento',
              conteudo: `A AdPulse é responsável pelo tratamento dos teus dados pessoais. Para questões relacionadas com privacidade, podes contactar-nos através do suporte na plataforma.`,
            },
            {
              titulo: '2. Dados que Recolhemos',
              conteudo: `Recolhemos os seguintes tipos de dados:

Dados de conta:
• Nome e endereço de email (fornecidos no registo)
• Informações de perfil (nicho, plataformas, tom de voz)
• Plano de subscrição e histórico de pagamentos

Dados de utilização:
• Conteúdo gerado através da plataforma
• Posts criados e agendados
• Ficheiros carregados para a biblioteca de média
• Histórico de gerações de IA

Dados técnicos:
• Endereço IP e informações do browser
• Cookies e dados de sessão
• Logs de acesso ao serviço`,
            },
            {
              titulo: '3. Como Usamos os Teus Dados',
              conteudo: `Utilizamos os teus dados para:
• Fornecer e melhorar o Serviço AdPulse
• Processar pagamentos e gerir a tua subscrição
• Enviar notificações e comunicações relacionadas com o Serviço
• Personalizar a tua experiência (sugestões de conteúdo, etc.)
• Garantir a segurança da plataforma
• Cumprir obrigações legais

Nunca vendemos os teus dados a terceiros.`,
            },
            {
              titulo: '4. Base Legal para o Tratamento',
              conteudo: `Tratamos os teus dados com base em:
• Execução do contrato: para fornecer o Serviço que subscreveste
• Consentimento: para comunicações de marketing (podes retirar a qualquer momento)
• Interesse legítimo: para melhorar o Serviço e garantir a segurança
• Obrigação legal: para cumprir requisitos fiscais e legais`,
            },
            {
              titulo: '5. Partilha de Dados',
              conteudo: `Partilhamos dados apenas com:

Prestadores de serviços essenciais:
• Supabase (base de dados e autenticação) — servidores na UE
• Stripe (processamento de pagamentos) — certificado PCI DSS
• OpenAI (geração de conteúdo com IA) — processamento de prompts
• Vercel (alojamento da aplicação)

Todos os nossos prestadores estão sujeitos a acordos de proteção de dados e só podem usar os teus dados para os fins especificados.`,
            },
            {
              titulo: '6. Retenção de Dados',
              conteudo: `Mantemos os teus dados enquanto tiveres uma conta ativa na AdPulse. Após o encerramento da conta:
• Dados de conta: eliminados em 30 dias
• Conteúdo gerado: eliminado em 90 dias
• Dados de faturação: mantidos por 7 anos (obrigação legal)

Podes solicitar a eliminação dos teus dados a qualquer momento.`,
            },
            {
              titulo: '7. Os Teus Direitos (RGPD)',
              conteudo: `Tens os seguintes direitos sobre os teus dados:

• Direito de acesso: saber que dados temos sobre ti
• Direito de retificação: corrigir dados incorretos
• Direito ao apagamento: eliminar os teus dados ("direito a ser esquecido")
• Direito à portabilidade: receber os teus dados em formato legível
• Direito de oposição: opor-te a determinados tratamentos
• Direito de limitação: restringir o tratamento dos teus dados

Para exercer qualquer destes direitos, contacta-nos através do suporte na plataforma. Respondemos em até 30 dias.`,
            },
            {
              titulo: '8. Cookies',
              conteudo: `Utilizamos cookies essenciais para o funcionamento da plataforma (autenticação e sessão). Não utilizamos cookies de rastreamento ou publicidade de terceiros.

Podes gerir as preferências de cookies nas definições do teu browser.`,
            },
            {
              titulo: '9. Segurança',
              conteudo: `Implementamos medidas técnicas e organizacionais para proteger os teus dados:
• Encriptação de dados em trânsito (HTTPS/TLS)
• Autenticação segura via Supabase Auth
• Acesso restrito aos dados por princípio de necessidade
• Monitorização regular de segurança

Em caso de violação de dados que afete os teus direitos, serás notificado em até 72 horas.`,
            },
            {
              titulo: '10. Alterações a esta Política',
              conteudo: `Podemos atualizar esta Política de Privacidade periodicamente. Serás notificado por email e/ou através da plataforma sobre alterações significativas. A data de "última atualização" no topo desta página indica quando foi modificada pela última vez.`,
            },
            {
              titulo: '11. Contacto e Reclamações',
              conteudo: `Para qualquer questão sobre privacidade, contacta-nos através do suporte na plataforma.

Se considerares que o tratamento dos teus dados viola o RGPD, tens o direito de apresentar uma reclamação à Comissão Nacional de Proteção de Dados (CNPD) em www.cnpd.pt.`,
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
            <Link href="/termos" style={{ fontSize: 13, color: 'var(--cor-marca)', textDecoration: 'none' }}>
              Termos de Serviço
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
