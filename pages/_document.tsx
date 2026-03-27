// ============================================
// AdPulse — Documento HTML Base
// ============================================

import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="pt">
      <Head>
        {/* Favicon simples com SVG */}
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>" />
        {/* Meta tags base */}
        <meta name="description" content="AdPulse — Cria conteúdo viral com Inteligência Artificial em minutos." />
        <meta name="theme-color" content="#0a0a0f" />
        {/* Open Graph */}
        <meta property="og:title" content="AdPulse — Conteúdo Viral com IA" />
        <meta property="og:description" content="O primeiro estúdio de conteúdo viral em português." />
        <meta property="og:type" content="website" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
