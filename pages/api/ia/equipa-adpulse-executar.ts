import type { NextApiRequest, NextApiResponse } from 'next'

type Tarefa = {
  id: string
  agente_id: string
  agente_nome: string
  agente_cargo: string
  fase: string
  titulo: string
  conteudo: string
  estado: string
  formato?: string
  plataforma?: string
  legenda?: string
  texto_criativo?: string
  hashtags?: string
  cta?: string
  prompt_imagem?: string
  hora_sugerida?: string
}

const AGENTES = [
  { id: 'explorador', nome: 'Explorador', cargo: 'Chief Intelligence Officer', fase: 'Inteligência' },
  { id: 'rui', nome: 'Rui Ferreira', cargo: 'Research & Tendências', fase: 'Inteligência' },
  { id: 'sofia', nome: 'Sofia Martins', cargo: 'Estratégia de Conteúdo', fase: 'Estratégia' },
  { id: 'joao', nome: 'João Silva', cargo: 'Copywriter & Hooks', fase: 'Criação' },
  { id: 'ines', nome: 'Inês Rodrigues', cargo: 'Video Content Specialist', fase: 'Criação' },
  { id: 'ana', nome: 'Ana Costa', cargo: 'Designer Visual', fase: 'Criação' },
  { id: 'tiago', nome: 'Tiago Rocha', cargo: 'SEO & Hashtags', fase: 'Criação' },
  { id: 'miguel', nome: 'Miguel Santos', cargo: 'Revisor de Conteúdo', fase: 'Qualidade' },
  { id: 'mariana', nome: 'Mariana Sousa', cargo: 'Brand Voice', fase: 'Qualidade' },
  { id: 'carla', nome: 'Carla Nunes', cargo: 'Publicação & Agendamento', fase: 'Execução' },
  { id: 'beatriz', nome: 'Beatriz Lima', cargo: 'Community Manager', fase: 'Execução' },
  { id: 'pedro', nome: 'Pedro Alves', cargo: 'Analytics & Performance', fase: 'Performance' },
  { id: 'antonio', nome: 'António Mendes', cargo: 'Growth Hacker', fase: 'Performance' },
]

function safeText(value: any, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function fallbackTarefas(nicho: string, plataforma: string, objetivo: string): Tarefa[] {
  const p = plataforma.charAt(0).toUpperCase() + plataforma.slice(1)
  const baseHashtags = '#adpulse #marketingdigital #inteligenciaartificial #conteudodigital #socialmedia #empreendedorismo'
  const tema = `Como usar IA para ${objetivo}`
  const hora = '16:25'

  return [
    {
      id: 'explorador_1',
      agente_id: 'explorador',
      agente_nome: 'Explorador',
      agente_cargo: 'Chief Intelligence Officer',
      fase: 'Inteligência',
      titulo: 'Briefing global de inteligência',
      conteudo: `### Tendências principais para ${nicho}

1. Conteúdo educativo com aplicação prática imediata.
2. Vídeos curtos com hooks muito fortes nos primeiros 3 segundos.
3. Criativos dark mode, look premium e mensagens muito claras.
4. Prova de resultado: mostrar benefício concreto e rapidez.
5. Chamadas à ação diretas para teste gratuito.

Recomendação:
Criar uma campanha focada em utilidade, simplicidade e demonstração visual do valor da AdPulse em ${p}.`,
      estado: 'concluido',
      formato: 'Post',
      plataforma,
      legenda: `Hoje mostramos como a IA pode ajudar-te a criar conteúdo mais rápido, mais estratégico e com melhor aspeto visual. A AdPulse junta estratégia, copy, imagem e organização num só lugar.`,
      texto_criativo: 'Cria conteúdo melhor. Mais rápido. Com IA.',
      hashtags: baseHashtags,
      cta: 'Descobre a AdPulse e acelera o teu conteúdo.',
      prompt_imagem: 'Criativo moderno dark mode, estilo SaaS premium, interface futurista, foco em marketing digital e IA, título principal: Cria conteúdo melhor. Mais rápido. Com IA.',
      hora_sugerida: hora,
    },
    {
      id: 'rui_1',
      agente_id: 'rui',
      agente_nome: 'Rui Ferreira',
      agente_cargo: 'Research & Tendências',
      fase: 'Inteligência',
      titulo: 'Tendências e oportunidades do dia',
      conteudo: `Oportunidades imediatas para ${p}:
- Mostrar bastidores de criação.
- Publicar checklists curtas e úteis.
- Comparar "antes vs depois" de usar a AdPulse.
- Reforçar rapidez, clareza e resultado final.

Ângulo recomendado:
"${tema}" com prova visual e linguagem simples.`,
      estado: 'concluido',
      formato: 'Carrossel',
      plataforma,
      legenda: `Queres crescer com mais consistência? A oportunidade está em simplificar a criação e manter uma presença regular. É exatamente isso que a AdPulse te ajuda a fazer.`,
      texto_criativo: 'A oportunidade de crescer está na consistência.',
      hashtags: baseHashtags,
      cta: 'Experimenta uma rotina de conteúdo mais simples com a AdPulse.',
      prompt_imagem: 'Carrossel Instagram tech premium, dark mode, gráficos suaves, ícones de tendências, texto central: A oportunidade de crescer está na consistência.',
      hora_sugerida: hora,
    },
    {
      id: 'sofia_1',
      agente_id: 'sofia',
      agente_nome: 'Sofia Martins',
      agente_cargo: 'Estratégia de Conteúdo',
      fase: 'Estratégia',
      titulo: 'Plano estratégico do dia',
      conteudo: `### Plano de Conteúdo do Dia

Tema central:
"${tema}"

Objetivo:
${objetivo}

Estrutura recomendada:
1. Post principal: mostrar o benefício imediato da AdPulse.
2. Story: teaser curto com CTA para ver o post.
3. Reel: dica rápida de conteúdo em 30 segundos.
4. CTA final: levar o utilizador a testar ou pedir demonstração.

Mensagem principal:
A AdPulse poupa tempo, organiza ideias e ajuda a publicar com mais qualidade.`,
      estado: 'concluido',
      formato: 'Post',
      plataforma,
      legenda: `Se ainda estás a criar conteúdo sem sistema, estás a perder tempo todos os dias. A AdPulse ajuda-te a passar da ideia à publicação com muito mais rapidez.`,
      texto_criativo: 'Da ideia à publicação em menos tempo.',
      hashtags: baseHashtags,
      cta: 'Experimenta a AdPulse e organiza o teu conteúdo hoje.',
      prompt_imagem: 'Instagram post dark mode, premium SaaS, mulher ou criador a trabalhar num painel de marketing, interface moderna, headline: Da ideia à publicação em menos tempo.',
      hora_sugerida: hora,
    },
    {
      id: 'joao_1',
      agente_id: 'joao',
      agente_nome: 'João Silva',
      agente_cargo: 'Copywriter & Hooks',
      fase: 'Criação',
      titulo: 'Copy principal do post',
      conteudo: `Hook:
"Estás a perder horas a criar conteúdo que podia ficar pronto em minutos?"

Legenda longa:
Criar conteúdo não devia ser uma dor de cabeça. Se passas demasiado tempo a pensar no que publicar, a escrever legendas ou a decidir como organizar tudo, estás a gastar energia no processo em vez de crescer.

A AdPulse ajuda-te a simplificar tudo:
- ideias de conteúdo
- copy pronta
- apoio visual
- organização no calendário
- planeamento mais rápido

Se queres ${objetivo}, começa por criar com mais método e menos esforço.

CTA:
Experimenta a AdPulse e vê a diferença no teu fluxo de conteúdo.`,
      estado: 'concluido',
      formato: 'Post',
      plataforma,
      legenda: `Estás a perder horas a criar conteúdo que podia ficar pronto em minutos?

Criar conteúdo não devia ser uma dor de cabeça. Se passas demasiado tempo a pensar no que publicar, a escrever legendas ou a organizar tudo, estás a gastar energia no processo em vez de crescer.

A AdPulse ajuda-te a simplificar:
• ideias
• copy
• imagem
• calendário
• estratégia

Se queres ${objetivo}, começa por criar com mais método e menos esforço.

👉 Experimenta a AdPulse.`,
      texto_criativo: 'Perdes horas a criar conteúdo?',
      hashtags: `${baseHashtags} #copywriting #instagrammarketing`,
      cta: 'Experimenta a AdPulse.',
      prompt_imagem: 'Social media post, premium dark mode, question-style ad, big headline: Perdes horas a criar conteúdo?, visual clean tech, subtle purple gradients.',
      hora_sugerida: hora,
    },
    {
      id: 'ines_1',
      agente_id: 'ines',
      agente_nome: 'Inês Rodrigues',
      agente_cargo: 'Video Content Specialist',
      fase: 'Criação',
      titulo: 'Guião de Reel/TikTok',
      conteudo: `### Guião curto

0-3s:
"Se crias conteúdo, isto vai poupar-te tempo."

3-10s:
Mostrar o problema: muitas ideias soltas, falta de organização, dificuldade em publicar.

10-20s:
Apresentar a AdPulse como solução: estratégia, copy, criativos e calendário.

20-30s:
Fechar com benefício:
"Mais rapidez, menos bloqueio e mais consistência."

CTA:
"Queres ver como funciona? Experimenta a AdPulse."`,
      estado: 'concluido',
      formato: 'Reel',
      plataforma,
      legenda: `Se crias conteúdo, isto vai poupar-te tempo.

Mostra o problema.
Mostra a solução.
Mostra o resultado.

É isso que um bom Reel deve fazer — e a AdPulse ajuda-te a construir esse processo mais depressa.`,
      texto_criativo: 'Pára de complicar a criação de conteúdo.',
      hashtags: `${baseHashtags} #reelsportugal #conteudoviral`,
      cta: 'Cria o teu próximo Reel com apoio da AdPulse.',
      prompt_imagem: 'Vertical social media cover for Reel, dark premium, bold typography, headline: Pára de complicar a criação de conteúdo.',
      hora_sugerida: '18:00',
    },
    {
      id: 'ana_1',
      agente_id: 'ana',
      agente_nome: 'Ana Costa',
      agente_cargo: 'Designer Visual',
      fase: 'Criação',
      titulo: 'Direção visual do criativo',
      conteudo: `Direção visual sugerida:
- Estilo dark mode premium
- Roxo e azul como cores de acento
- Tipografia bold nos títulos
- Layout limpo com bloco principal + CTA
- Sensação SaaS, moderna e profissional

Elementos do criativo:
1. Headline forte
2. 3 benefícios rápidos
3. CTA visual
4. Ambiente tech/produtivo`,
      estado: 'concluido',
      formato: 'Post',
      plataforma,
      legenda: `O visual certo muda a perceção do conteúdo. Um criativo claro, moderno e direto ajuda-te a prender a atenção logo nos primeiros segundos.`,
      texto_criativo: 'Mais clareza visual. Mais impacto.',
      hashtags: `${baseHashtags} #designsocialmedia #criativosdigitais`,
      cta: 'Usa um visual mais profissional com a AdPulse.',
      prompt_imagem: 'Professional social media creative, dark mode, premium SaaS style, clean composition, tech aesthetic, headline: Mais clareza visual. Mais impacto.',
      hora_sugerida: hora,
    },
    {
      id: 'tiago_1',
      agente_id: 'tiago',
      agente_nome: 'Tiago Rocha',
      agente_cargo: 'SEO & Hashtags',
      fase: 'Criação',
      titulo: 'Hashtags estratégicas',
      conteudo: `Pack de hashtags:
#adpulse
#marketingdigital
#socialmedia
#conteudodigital
#inteligenciaartificial
#instagrammarketing
#empreendedorismo
#copywriting
#criacaodeconteudo
#gestaoderedessociais

Sugestão:
Misturar hashtags amplas + nichadas + de marca.`,
      estado: 'concluido',
      formato: 'Post',
      plataforma,
      legenda: `As hashtags certas ajudam a posicionar melhor o teu conteúdo. O segredo está no equilíbrio entre alcance, nicho e consistência de marca.`,
      texto_criativo: 'Hashtags certas = melhor alcance.',
      hashtags: '#adpulse #marketingdigital #socialmedia #conteudodigital #inteligenciaartificial #instagrammarketing #empreendedorismo #copywriting #criacaodeconteudo #gestaoderedessociais',
      cta: 'Usa uma estratégia de hashtags mais inteligente.',
      prompt_imagem: 'Minimal social media design with hashtag symbols, dark mode, neon accents, headline: Hashtags certas = melhor alcance.',
      hora_sugerida: hora,
    },
    {
      id: 'miguel_1',
      agente_id: 'miguel',
      agente_nome: 'Miguel Santos',
      agente_cargo: 'Revisor de Conteúdo',
      fase: 'Qualidade',
      titulo: 'Revisão final do conteúdo',
      conteudo: `Checklist de qualidade:
- Hook forte: sim
- CTA claro: sim
- Benefício visível: sim
- Linguagem simples: sim
- Alinhamento com AdPulse: sim

Melhoria aplicada:
Reduzimos complexidade, reforçámos clareza e deixámos a mensagem mais comercial.`,
      estado: 'concluido',
      formato: 'Post',
      plataforma,
      legenda: `Antes de publicar, garante sempre 3 coisas: mensagem clara, benefício visível e chamada à ação direta. É isso que separa um post bonito de um post que funciona.`,
      texto_criativo: 'Publica melhor. Não só mais.',
      hashtags: baseHashtags,
      cta: 'Melhora a qualidade do teu conteúdo com a AdPulse.',
      prompt_imagem: 'Quality control themed social media post, dark premium style, checklist elements, headline: Publica melhor. Não só mais.',
      hora_sugerida: hora,
    },
    {
      id: 'mariana_1',
      agente_id: 'mariana',
      agente_nome: 'Mariana Sousa',
      agente_cargo: 'Brand Voice',
      fase: 'Qualidade',
      titulo: 'Ajuste de tom e voz',
      conteudo: `Tom recomendado:
- Direto
- Próximo
- Confiante
- Simples
- Sem jargão excessivo

Frase-chave:
"Cria, organiza e publica com mais rapidez."`,
      estado: 'concluido',
      formato: 'Post',
      plataforma,
      legenda: `Uma marca forte não fala de forma complicada. Fala de forma clara, útil e consistente. É isso que a AdPulse quer transmitir em cada publicação.`,
      texto_criativo: 'Fala claro. Cresce melhor.',
      hashtags: `${baseHashtags} #branding #brandvoice`,
      cta: 'Dá mais consistência à tua comunicação com a AdPulse.',
      prompt_imagem: 'Brand voice concept, modern typography, dark mode, premium branding style, headline: Fala claro. Cresce melhor.',
      hora_sugerida: hora,
    },
    {
      id: 'carla_1',
      agente_id: 'carla',
      agente_nome: 'Carla Nunes',
      agente_cargo: 'Publicação & Agendamento',
      fase: 'Execução',
      titulo: 'Plano de publicação',
      conteudo: `Plano recomendado:
- Story teaser: 12:00
- Post principal: 16:25
- Reel complementar: 18:00
- Story de reforço: 20:30

Motivo:
Maximizar visibilidade durante o período de maior atenção da audiência.`,
      estado: 'concluido',
      formato: 'Post',
      plataforma,
      legenda: `Publicar bem não é só criar bom conteúdo. Também é escolher o momento certo. Um calendário simples melhora a consistência e a execução.`,
      texto_criativo: 'Conteúdo certo. Hora certa.',
      hashtags: `${baseHashtags} #calendariodeconteudo`,
      cta: 'Organiza o teu calendário com a AdPulse.',
      prompt_imagem: 'Scheduling themed social media post, calendar and clock visuals, premium dark UI, headline: Conteúdo certo. Hora certa.',
      hora_sugerida: hora,
    },
    {
      id: 'beatriz_1',
      agente_id: 'beatriz',
      agente_nome: 'Beatriz Lima',
      agente_cargo: 'Community Manager',
      fase: 'Execução',
      titulo: 'Respostas e engagement',
      conteudo: `Templates rápidos:
1. "Boa pergunta 👏 Na AdPulse tens ajuda para criar e organizar conteúdo com mais rapidez."
2. "Se quiseres, mostramos-te como transformar uma ideia num post pronto."
3. "Obrigado! O objetivo é mesmo simplificar o teu processo."

Pergunta sugerida no fim do post:
"O que te demora mais tempo na criação de conteúdo?"`,
      estado: 'concluido',
      formato: 'Post',
      plataforma,
      legenda: `Engagement não é responder por obrigação. É continuar a conversa com utilidade e proximidade.`,
      texto_criativo: 'Transforma comentários em conversa.',
      hashtags: `${baseHashtags} #communitymanager #engagement`,
      cta: 'Cria mais ligação com a tua audiência.',
      prompt_imagem: 'Community engagement social media post, speech bubbles, dark premium theme, headline: Transforma comentários em conversa.',
      hora_sugerida: hora,
    },
    {
      id: 'pedro_1',
      agente_id: 'pedro',
      agente_nome: 'Pedro Alves',
      agente_cargo: 'Analytics & Performance',
      fase: 'Performance',
      titulo: 'KPIs e métricas a acompanhar',
      conteudo: `KPIs principais:
- Alcance
- Guardados
- Cliques
- Respostas a stories
- Comentários
- CTR do link

Objetivo do conteúdo:
Medir se a mensagem gera atenção e intenção de experimentar.`,
      estado: 'concluido',
      formato: 'Post',
      plataforma,
      legenda: `Sem métricas, publicas às cegas. Os números certos mostram-te o que funciona e onde tens de melhorar.`,
      texto_criativo: 'Conteúdo sem métricas = conteúdo às cegas.',
      hashtags: `${baseHashtags} #metricas #analytics`,
      cta: 'Acompanha melhor o desempenho com a AdPulse.',
      prompt_imagem: 'Analytics dashboard style social media creative, premium dark mode, charts and KPI visuals, headline: Conteúdo sem métricas = conteúdo às cegas.',
      hora_sugerida: hora,
    },
    {
      id: 'antonio_1',
      agente_id: 'antonio',
      agente_nome: 'António Mendes',
      agente_cargo: 'Growth Hacker',
      fase: 'Performance',
      titulo: 'Tática de crescimento acelerado',
      conteudo: `Tática do dia:
Criar um mini desafio de 3 dias:
"3 dias para organizar o teu conteúdo"

Passos:
1. Post inicial com benefício.
2. Story com prova e CTA.
3. Reel com dica prática.
4. CTA para experimentar a AdPulse.

Benefício:
Mais atenção, mais repetição da mensagem e mais conversão.`,
      estado: 'concluido',
      formato: 'Post',
      plataforma,
      legenda: `Se queres crescer, não publiques peças soltas. Cria uma sequência. Um pequeno desafio ou série aumenta retenção, reconhecimento e ação.`,
      texto_criativo: 'Crescimento acontece com sequência.',
      hashtags: `${baseHashtags} #growthhacking #estrategiadigital`,
      cta: 'Monta a tua próxima sequência com a AdPulse.',
      prompt_imagem: 'Growth hacking themed social media post, dark premium style, sequence/steps visual, headline: Crescimento acontece com sequência.',
      hora_sugerida: hora,
    },
  ]
}

function normalizarTarefas(tarefas: any[], plataforma: string): Tarefa[] {
  const fallback = fallbackTarefas('marketing digital', plataforma, 'crescer audiência e gerar leads')

  return AGENTES.map((agente, index) => {
    const original = Array.isArray(tarefas)
      ? tarefas.find((t: any) => t?.agente_id === agente.id || t?.agente_nome === agente.nome)
      : null

    const fb = fallback.find(f => f.agente_id === agente.id)!

    return {
      id: safeText(original?.id, `${agente.id}_${Date.now()}_${index}`),
      agente_id: agente.id,
      agente_nome: agente.nome,
      agente_cargo: agente.cargo,
      fase: agente.fase,
      titulo: safeText(original?.titulo, fb.titulo),
      conteudo: safeText(original?.conteudo, fb.conteudo),
      estado: 'concluido',
      formato: safeText(original?.formato, fb.formato || 'Post'),
      plataforma: safeText(original?.plataforma, plataforma),
      legenda: safeText(original?.legenda, fb.legenda || ''),
      texto_criativo: safeText(original?.texto_criativo, fb.texto_criativo || ''),
      hashtags: safeText(original?.hashtags, fb.hashtags || ''),
      cta: safeText(original?.cta, fb.cta || ''),
      prompt_imagem: safeText(original?.prompt_imagem, fb.prompt_imagem || ''),
      hora_sugerida: safeText(original?.hora_sugerida, fb.hora_sugerida || '09:00'),
    }
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' })
  }

  const nicho = safeText(req.body?.nicho, 'marketing digital')
  const plataforma = safeText(req.body?.plataforma, 'instagram').toLowerCase()
  const objetivo = safeText(req.body?.objetivo, 'crescer audiência e gerar leads')

  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return res.status(200).json({
      tarefas: fallbackTarefas(nicho, plataforma, objetivo),
      modo: 'fallback',
    })
  }

  try {
    const promptSistema = `
És a Equipa AdPulse, uma agência IA com 13 especialistas de marketing.

Tens de devolver UMA campanha completa em JSON.
Idioma: português de Portugal.
Tens de criar 13 tarefas, uma para cada agente abaixo:

1. Explorador — Chief Intelligence Officer — fase Inteligência
2. Rui Ferreira — Research & Tendências — fase Inteligência
3. Sofia Martins — Estratégia de Conteúdo — fase Estratégia
4. João Silva — Copywriter & Hooks — fase Criação
5. Inês Rodrigues — Video Content Specialist — fase Criação
6. Ana Costa — Designer Visual — fase Criação
7. Tiago Rocha — SEO & Hashtags — fase Criação
8. Miguel Santos — Revisor de Conteúdo — fase Qualidade
9. Mariana Sousa — Brand Voice — fase Qualidade
10. Carla Nunes — Publicação & Agendamento — fase Execução
11. Beatriz Lima — Community Manager — fase Execução
12. Pedro Alves — Analytics & Performance — fase Performance
13. António Mendes — Growth Hacker — fase Performance

Contexto do cliente:
- Nicho: ${nicho}
- Plataforma principal: ${plataforma}
- Objetivo: ${objetivo}

Regras:
- Cada tarefa deve vir pronta a usar.
- Cada tarefa deve incluir conteúdo útil e prático.
- Para cada tarefa, inclui também:
  - legenda
  - texto_criativo
  - hashtags
  - cta
  - prompt_imagem
  - formato
  - plataforma
  - hora_sugerida
- Usa "concluido" no estado.
- Não fales fora do JSON.
- O JSON final deve ter esta estrutura exata:

{
  "tarefas": [
    {
      "id": "string",
      "agente_id": "string",
      "agente_nome": "string",
      "agente_cargo": "string",
      "fase": "string",
      "titulo": "string",
      "conteudo": "string",
      "estado": "concluido",
      "formato": "string",
      "plataforma": "string",
      "legenda": "string",
      "texto_criativo": "string",
      "hashtags": "string",
      "cta": "string",
      "prompt_imagem": "string",
      "hora_sugerida": "string"
    }
  ]
}
`.trim()

    const openaiResp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.8,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: promptSistema },
          {
            role: 'user',
            content: `Cria agora a campanha completa para ${plataforma}, nicho ${nicho}, objetivo ${objetivo}.`,
          },
        ],
      }),
    })

    const openaiData = await openaiResp.json()

    if (!openaiResp.ok) {
      return res.status(200).json({
        tarefas: fallbackTarefas(nicho, plataforma, objetivo),
        modo: 'fallback',
        detalhe: openaiData,
      })
    }

    const content = openaiData?.choices?.[0]?.message?.content
    let parsed: any = null

    try {
      parsed = JSON.parse(content)
    } catch {
      parsed = null
    }

    const tarefas = normalizarTarefas(parsed?.tarefas || [], plataforma)

    return res.status(200).json({
      tarefas,
      modo: 'openai',
    })
  } catch (error: any) {
    return res.status(200).json({
      tarefas: fallbackTarefas(nicho, plataforma, objetivo),
      modo: 'fallback',
      detalhe: error?.message || 'Erro inesperado.',
    })
  }
}
