import type { NextApiRequest, NextApiResponse } from 'next'

type PostRapido = {
  titulo: string
  conteudo: string
  legenda: string
  texto_criativo: string
  hashtags: string
  cta: string
  prompt_imagem: string
  formato: string
  plataforma: string
  hora_sugerida: string
}

function textoSeguro(valor: any, fallback = '') {
  return typeof valor === 'string' && valor.trim() ? valor.trim() : fallback
}

function fallbackPostRapido(nicho: string, plataforma: string, objetivo: string): PostRapido {
  return {
    titulo: `Como criar conteúdo melhor para ${nicho}`,
    conteudo: `Post rápido criado para ${plataforma} com foco em ${objetivo}.

Estrutura recomendada:
1. Começar com uma pergunta forte.
2. Mostrar o problema principal do público.
3. Apresentar uma solução simples.
4. Terminar com uma chamada à ação clara.

Este conteúdo está pronto para ser usado como post, carrossel ou base para criativo visual.`,
    legenda: `Estás a perder demasiado tempo a criar conteúdo?

Se trabalhas em ${nicho}, sabes que ter ideias, escrever legendas e manter consistência pode ser cansativo.

A verdade é simples: não precisas de criar mais confusão. Precisas de um sistema.

Com a AdPulse, consegues transformar uma ideia num conteúdo pronto para publicar, com legenda, texto para criativo, hashtags e calendário.

Menos bloqueio.
Mais consistência.
Mais conteúdo com intenção.

👉 Experimenta criar o teu próximo post com a AdPulse.`,
    texto_criativo: `Cria conteúdo melhor. Em menos tempo.`,
    hashtags: `#adpulse #marketingdigital #conteudodigital #socialmedia #inteligenciaartificial #criacaodeconteudo #instagrammarketing #empreendedorismo #negociosdigitais #produtividade`,
    cta: `Experimenta a AdPulse e cria o teu próximo conteúdo em minutos.`,
    prompt_imagem: `Criar imagem quadrada 1080x1080 para Instagram, estilo SaaS premium, dark mode, fundo moderno com gradientes roxo e azul, visual tecnológico e profissional. Texto principal grande: "Cria conteúdo melhor. Em menos tempo." Incluir elementos visuais de calendário, IA, redes sociais e crescimento digital. Composição limpa, moderna, alto contraste, pronta para publicação no Instagram.`,
    formato: 'Post',
    plataforma,
    hora_sugerida: '16:25',
  }
}

function normalizarPost(post: any, nicho: string, plataforma: string, objetivo: string): PostRapido {
  const fallback = fallbackPostRapido(nicho, plataforma, objetivo)

  return {
    titulo: textoSeguro(post?.titulo, fallback.titulo),
    conteudo: textoSeguro(post?.conteudo, fallback.conteudo),
    legenda: textoSeguro(post?.legenda, fallback.legenda),
    texto_criativo: textoSeguro(post?.texto_criativo, fallback.texto_criativo),
    hashtags: textoSeguro(post?.hashtags, fallback.hashtags),
    cta: textoSeguro(post?.cta, fallback.cta),
    prompt_imagem: textoSeguro(post?.prompt_imagem, fallback.prompt_imagem),
    formato: textoSeguro(post?.formato, fallback.formato),
    plataforma: textoSeguro(post?.plataforma, plataforma),
    hora_sugerida: textoSeguro(post?.hora_sugerida, fallback.hora_sugerida),
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      erro: 'Método não permitido.',
    })
  }

  const nicho = textoSeguro(req.body?.nicho, 'marketing digital')
  const plataforma = textoSeguro(req.body?.plataforma, 'instagram').toLowerCase()
  const objetivo = textoSeguro(req.body?.objetivo, 'crescer audiência e gerar leads')

  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return res.status(200).json({
      post: fallbackPostRapido(nicho, plataforma, objetivo),
      modo: 'fallback',
    })
  }

  try {
    const promptSistema = `
És a AdPulse, uma plataforma SaaS de marketing digital com IA.

A tua tarefa é criar UM POST RÁPIDO, pronto a publicar, para redes sociais.

Idioma: português de Portugal.
Tom: moderno, direto, útil, profissional e próximo.
Não uses explicações fora do JSON.

Contexto:
- Nicho: ${nicho}
- Plataforma: ${plataforma}
- Objetivo: ${objetivo}

Tens de devolver JSON válido com esta estrutura exata:

{
  "post": {
    "titulo": "string",
    "conteudo": "string",
    "legenda": "string",
    "texto_criativo": "string",
    "hashtags": "string",
    "cta": "string",
    "prompt_imagem": "string",
    "formato": "Post",
    "plataforma": "${plataforma}",
    "hora_sugerida": "HH:MM"
  }
}

Regras obrigatórias:
- A legenda tem de estar pronta para copiar e publicar.
- O texto_criativo deve ser curto e forte, para aparecer na imagem.
- As hashtags devem vir numa só linha.
- O CTA deve ser direto.
- O prompt_imagem deve explicar exatamente como gerar a imagem do post.
- O conteúdo deve ser útil para o nicho.
- Não devolvas markdown fora do JSON.
`.trim()

    const resposta = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.7,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: promptSistema,
          },
          {
            role: 'user',
            content: `Cria um post rápido para ${plataforma}, nicho ${nicho}, objetivo ${objetivo}.`,
          },
        ],
      }),
    })

    const data = await resposta.json()

    if (!resposta.ok) {
      return res.status(200).json({
        post: fallbackPostRapido(nicho, plataforma, objetivo),
        modo: 'fallback',
        detalhe: data,
      })
    }

    const conteudo = data?.choices?.[0]?.message?.content

    let parsed: any = null

    try {
      parsed = JSON.parse(conteudo)
    } catch {
      parsed = null
    }

    const post = normalizarPost(parsed?.post || parsed, nicho, plataforma, objetivo)

    return res.status(200).json({
      post,
      modo: 'openai',
    })
  } catch (error: any) {
    return res.status(200).json({
      post: fallbackPostRapido(nicho, plataforma, objetivo),
      modo: 'fallback',
      detalhe: error?.message || 'Erro inesperado.',
    })
  }
}
