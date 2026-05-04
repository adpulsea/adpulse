# ⚡ AdPulse — Guia de Instalação Completo

O primeiro estúdio de conteúdo viral em português.

---

## 📋 Pré-requisitos

- Node.js 18+ instalado ([nodejs.org](https://nodejs.org))
- Conta gratuita no [Supabase](https://supabase.com)
- Conta no [OpenAI](https://platform.openai.com) com créditos (~$5 chega para começar)
- Conta no [Vercel](https://vercel.com) para deploy (gratuito)

---

## 🚀 Instalação Passo a Passo

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar as variáveis de ambiente

Copia o ficheiro de exemplo:
```bash
cp .env.example .env.local
```

Preenche o `.env.local` com os teus valores (ver abaixo).

### 3. Configurar o Supabase

1. Vai a [app.supabase.com](https://app.supabase.com)
2. Cria um projeto novo (escolhe a região mais próxima)
3. Vai a **Settings → API** e copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Vai a **SQL Editor → New Query**
5. Cola o conteúdo do ficheiro `supabase-schema.sql`
6. Clica em **Run** para criar todas as tabelas

### 4. Configurar a OpenAI

1. Vai a [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Cria uma nova chave API
3. Copia para `OPENAI_API_KEY` no `.env.local`

### 5. Correr em modo de desenvolvimento

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) 🎉

---

## 🌐 Deploy no Vercel (gratuito)

1. Faz push do código para um repositório GitHub
2. Vai a [vercel.com](https://vercel.com) e clica em "Import Project"
3. Seleciona o repositório
4. Adiciona as variáveis de ambiente na secção "Environment Variables"
5. Clica em "Deploy"

O Vercel faz deploy automático sempre que fazes push para o main! ✅

---

## 📁 Estrutura do Projeto

```
adpulse/
├── components/
│   └── layout/
│       ├── Navbar.tsx          ← Barra de navegação da landing
│       └── LayoutPainel.tsx    ← Sidebar + topbar do dashboard
├── hooks/
│   └── useAuth.ts              ← Hook de autenticação
├── lib/
│   ├── supabase.ts             ← Cliente Supabase
│   ├── openai.ts               ← Funções de chamada à IA
│   └── auth.ts                 ← Funções de login/registo
├── pages/
│   ├── index.tsx               ← Landing page
│   ├── _app.tsx                ← Raiz da app + auth guard
│   ├── auth/
│   │   ├── login.tsx           ← Página de login
│   │   └── registar.tsx        ← Página de registo
│   ├── painel/
│   │   ├── index.tsx           ← Dashboard principal
│   │   ├── studio.tsx          ← AI Content Studio
│   │   ├── viral-lab.tsx       ← Viral Lab
│   │   ├── analyzer.tsx        ← Creator Analyzer
│   │   └── campanhas.tsx       ← Gestão de campanhas
│   └── api/
│       └── ia/
│           ├── gerar-conteudo.ts    ← API geração de conteúdo
│           ├── viral-lab.ts         ← API Viral Lab
│           ├── creator-analyzer.ts  ← API Creator Analyzer
│           └── variacoes-legenda.ts ← API variações de legenda
├── styles/
│   └── globals.css             ← Estilos globais + classes CSS
├── types/
│   └── index.ts                ← Tipos TypeScript
├── supabase-schema.sql         ← SQL para criar as tabelas
└── .env.example                ← Exemplo de variáveis de ambiente
```

---

## 💡 Variáveis de Ambiente

| Variável | Onde obter | Obrigatória |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API | ✅ |
| `OPENAI_API_KEY` | platform.openai.com/api-keys | ✅ |
| `NEXT_PUBLIC_SITE_URL` | URL do teu site em produção | ✅ |

---

## 🗺️ Roadmap (próximas funcionalidades)

- [ ] Agendamento de posts
- [ ] Analytics dashboard com dados reais
- [ ] Integração Stripe (pagamentos)
- [ ] Geração de imagens com DALL-E
- [ ] Colaboração em equipa
- [ ] API pública

---

## 🆓 Stack 100% gratuito para começar

| Ferramenta | Plano gratuito inclui |
|---|---|
| **Next.js** | Open source |
| **Supabase** | 500MB DB, 50k utilizadores |
| **Vercel** | Deploy ilimitado, domínio grátis |
| **OpenAI** | ~$5 crédito inicial |

---

Feito em Portugal, para o mundo. 🇵🇹

deploy test
