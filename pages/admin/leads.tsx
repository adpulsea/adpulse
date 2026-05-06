import Head from 'next/head'
import { useEffect, useMemo, useState } from 'react'
import {
  Zap,
  Search,
  Plus,
  Copy,
  Trash2,
  RefreshCw,
  LogOut,
  MessageCircle,
  Instagram,
  Star,
  CheckCircle,
  Clock,
  UserPlus,
  Send,
  Loader,
  Lock,
  Sparkles,
} from 'lucide-react'

type Lead = {
  id: string
  data_criacao: string
  data_atualizacao: string
  nome: string
  username_instagram: string
  link_perfil: string
  nicho: string
  localizacao: string
  tipo_lead: string
  origem: string
  problema_identificado: string
  oportunidade_adpulse: string
  score: number
  comentario_sugerido: string
  mensagem_sugerida: string
  follow_up_sugerido: string
  estado: string
  resposta: string
  proximo_passo: string
  notas: string
}

const ESTADOS = [
  'novo',
  'analisado',
  'aprovado',
  'comentado',
  'contactado',
  'respondeu',
  'acesso_enviado',
  'teste_ativo',
  'cliente',
  'sem_interesse',
  'follow_up',
]

const ESTADO_LABEL: Record<string, string> = {
  novo: 'Novo',
  analisado: 'Analisado',
  aprovado: 'Aprovado',
  comentado: 'Comentado',
  contactado: 'Contactado',
  respondeu: 'Respondeu',
  acesso_enviado: 'Acesso enviado',
  teste_ativo: 'Teste ativo',
  cliente: 'Cliente',
  sem_interesse: 'Sem interesse',
  follow_up: 'Follow-up',
}

const ESTADO_COR: Record<string, string> = {
  novo: '#7c7bfa',
  analisado: '#38bdf8',
  aprovado: '#34d399',
  comentado: '#a78bfa',
  contactado: '#fbbf24',
  respondeu: '#22c55e',
  acesso_enviado: '#14b8a6',
  teste_ativo: '#f472b6',
  cliente: '#34d399',
  sem_interesse: '#f87171',
  follow_up: '#fb923c',
}

const LEAD_INICIAL = {
  nome: '',
  username_instagram: '',
  link_perfil: '',
  nicho: '',
  localizacao: '',
  tipo_lead: 'pequeno_negocio',
  origem: 'instagram',
  problema_identificado: '',
  oportunidade_adpulse: '',
  score: 50,
  comentario_sugerido: '',
  mensagem_sugerida: '',
  follow_up_sugerido: '',
  estado: 'novo',
  resposta: '',
  proximo_passo: '',
  notas: '',
}

export default function AdminLeads() {
  const [autenticado, setAutenticado] = useState(false)
  const [aVerificar, setAVerificar] = useState(true)
  const [senha, setSenha] = useState('')
  const [erroLogin, setErroLogin] = useState('')
  const [leads, setLeads] = useState<Lead[]>([])
  const [carregando, setCarregando] = useState(false)
  const [aGuardar, setAGuardar] = useState(false)
  const [aGerarSofia, setAGerarSofia] = useState(false)
  const [observacaoSofia, setObservacaoSofia] = useState('')
  const [pesquisa, setPesquisa] = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState('todos')
  const [formAberto, setFormAberto] = useState(false)
  const [form, setForm] = useState(LEAD_INICIAL)

  useEffect(() => {
    verificarAdmin()
  }, [])

  useEffect(() => {
    if (autenticado) carregarLeads()
  }, [autenticado])

  const verificarAdmin = async () => {
    setAVerificar(true)

    try {
      const res = await fetch('/api/admin/check')
      setAutenticado(res.ok)
    } catch {
      setAutenticado(false)
    } finally {
      setAVerificar(false)
    }
  }

  const fazerLogin = async () => {
    setErroLogin('')

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: senha }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.erro || 'Erro ao entrar.')
      }

      setAutenticado(true)
      setSenha('')
    } catch (error: any) {
      setErroLogin(error?.message || 'Senha incorreta.')
    }
  }

  const sair = async () => {
    await fetch('/api/admin/logout')
    setAutenticado(false)
  }

  const carregarLeads = async () => {
    setCarregando(true)

    try {
      const res = await fetch('/api/admin/leads')
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.erro || 'Erro ao carregar leads.')
      }

      setLeads(data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setCarregando(false)
    }
  }

  const gerarComSofia = async () => {
    setAGerarSofia(true)

    try {
      const res = await fetch('/api/admin/gerar-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: form.nome,
          username_instagram: form.username_instagram,
          link_perfil: form.link_perfil,
          nicho: form.nicho,
          localizacao: form.localizacao,
          observacao: observacaoSofia,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.erro || 'Erro ao gerar com Sofia.')
      }

      setForm((atual) => ({
        ...atual,
        problema_identificado: data.problema_identificado || '',
        oportunidade_adpulse: data.oportunidade_adpulse || '',
        score: Number(data.score || 50),
        comentario_sugerido: data.comentario_sugerido || '',
        mensagem_sugerida: data.mensagem_sugerida || '',
        follow_up_sugerido: data.follow_up_sugerido || '',
        proximo_passo: data.proximo_passo || '',
      }))
    } catch (error: any) {
      alert(error?.message || 'Erro ao gerar com Sofia.')
    } finally {
      setAGerarSofia(false)
    }
  }

  const criarLead = async () => {
    setAGuardar(true)

    try {
      const res = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.erro || 'Erro ao criar lead.')
      }

      setLeads((atuais) => [data, ...atuais])
      setForm(LEAD_INICIAL)
      setObservacaoSofia('')
      setFormAberto(false)
    } catch (error: any) {
      alert(error?.message || 'Erro ao criar lead.')
    } finally {
      setAGuardar(false)
    }
  }

  const atualizarLead = async (id: string, updates: Partial<Lead>) => {
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.erro || 'Erro ao atualizar lead.')
      }

      setLeads((atuais) =>
        atuais.map((lead) => (lead.id === id ? data : lead))
      )
    } catch (error: any) {
      alert(error?.message || 'Erro ao atualizar lead.')
    }
  }

  const apagarLead = async (id: string) => {
    const confirmar = window.confirm('Queres apagar este lead?')

    if (!confirmar) return

    try {
      const res = await fetch('/api/admin/leads', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.erro || 'Erro ao apagar lead.')
      }

      setLeads((atuais) => atuais.filter((lead) => lead.id !== id))
    } catch (error: any) {
      alert(error?.message || 'Erro ao apagar lead.')
    }
  }

  const copiar = async (texto: string) => {
    await navigator.clipboard.writeText(texto || '')
    alert('Copiado!')
  }

  const abrirNovoLead = () => {
    setForm(LEAD_INICIAL)
    setObservacaoSofia('')
    setFormAberto(true)
  }

  const leadsFiltrados = useMemo(() => {
    return leads.filter((lead) => {
      const matchEstado = estadoFiltro === 'todos' || lead.estado === estadoFiltro

      const termo = pesquisa.toLowerCase().trim()

      const matchPesquisa =
        !termo ||
        lead.nome?.toLowerCase().includes(termo) ||
        lead.username_instagram?.toLowerCase().includes(termo) ||
        lead.nicho?.toLowerCase().includes(termo) ||
        lead.localizacao?.toLowerCase().includes(termo)

      return matchEstado && matchPesquisa
    })
  }, [leads, pesquisa, estadoFiltro])

  const metricas = {
    total: leads.length,
    novos: leads.filter((lead) => lead.estado === 'novo').length,
    contactados: leads.filter((lead) => lead.estado === 'contactado').length,
    responderam: leads.filter((lead) => lead.estado === 'respondeu').length,
    clientes: leads.filter((lead) => lead.estado === 'cliente').length,
  }

  if (aVerificar) {
    return (
      <AdminShell simples>
        <div style={centerBoxStyle}>
          <Loader size={28} color="#7c7bfa" />
          <p style={{ color: '#8888aa' }}>A verificar acesso...</p>
        </div>
      </AdminShell>
    )
  }

  if (!autenticado) {
    return (
      <>
        <Head>
          <title>Sofia Growth Agent — AdPulse</title>
        </Head>

        <AdminShell simples>
          <div style={loginCardStyle}>
            <div style={logoBoxStyle}>
              <Zap size={24} color="#fff" fill="#fff" />
            </div>

            <h1 style={loginTitleStyle}>Sofia Growth Agent</h1>
            <p style={loginTextStyle}>Área interna de prospeção da AdPulse.</p>

            <div style={lockBoxStyle}>
              <Lock size={15} />
              Acesso reservado à equipa
            </div>

            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') fazerLogin()
              }}
              placeholder="Senha de administrador"
              style={inputStyle}
            />

            {erroLogin && (
              <div style={errorStyle}>{erroLogin}</div>
            )}

            <button onClick={fazerLogin} style={primaryButtonStyle}>
              Entrar
            </button>
          </div>
        </AdminShell>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Sofia Growth Agent — AdPulse</title>
      </Head>

      <AdminShell onLogout={sair} onRefresh={carregarLeads} carregando={carregando}>
        <div style={containerStyle}>
          <div style={heroStyle}>
            <div>
              <div style={pillStyle}>
                <Instagram size={14} />
                Sofia Growth Agent
              </div>

              <h1 style={titleStyle}>Leads de prospeção</h1>

              <p style={subtitleStyle}>
                Encontra potenciais clientes, prepara comentários humanos,
                mensagens privadas e acompanha o estado de cada contacto.
              </p>
            </div>

            <button
              onClick={abrirNovoLead}
              style={primaryButtonStyle}
            >
              <Plus size={16} />
              Novo lead
            </button>
          </div>

          <div style={metricsGridStyle}>
            <MetricCard label="Total leads" valor={metricas.total} icon={UserPlus} cor="#7c7bfa" />
            <MetricCard label="Novos" valor={metricas.novos} icon={Clock} cor="#38bdf8" />
            <MetricCard label="Contactados" valor={metricas.contactados} icon={Send} cor="#fbbf24" />
            <MetricCard label="Responderam" valor={metricas.responderam} icon={MessageCircle} cor="#22c55e" />
            <MetricCard label="Clientes" valor={metricas.clientes} icon={CheckCircle} cor="#34d399" />
          </div>

          {formAberto && (
            <div style={formCardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                <div>
                  <h2 style={sectionTitleStyle}>Adicionar lead</h2>
                  <p style={{ margin: '6px 0 0', color: '#8888aa', fontSize: 12 }}>
                    Preenche os dados base e deixa a Sofia preparar a abordagem.
                  </p>
                </div>

                <button
                  onClick={() => setFormAberto(false)}
                  style={secondaryButtonStyle}
                >
                  Fechar
                </button>
              </div>

              <div style={sofiaBoxStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={sofiaIconStyle}>
                    <Sparkles size={17} />
                  </div>

                  <div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: '#f0f0f5' }}>
                      Gerar com Sofia
                    </div>

                    <p style={{ margin: '3px 0 0', fontSize: 12, color: '#8888aa', lineHeight: 1.5 }}>
                      Escreve uma observação rápida sobre o perfil. A Sofia preenche a análise,
                      comentário, mensagem, follow-up, score e próximo passo.
                    </p>
                  </div>
                </div>

                <textarea
                  value={observacaoSofia}
                  onChange={(e) => setObservacaoSofia(e.target.value)}
                  rows={4}
                  placeholder="Ex: Café em Quarteira. Publica boas fotos, mas tem poucas legendas e não parece ter calendário de conteúdo."
                  style={textareaStyle}
                />

                <button
                  type="button"
                  onClick={gerarComSofia}
                  disabled={aGerarSofia}
                  style={{
                    ...primaryButtonStyle,
                    alignSelf: 'flex-start',
                    opacity: aGerarSofia ? 0.7 : 1,
                    cursor: aGerarSofia ? 'not-allowed' : 'pointer',
                  }}
                >
                  {aGerarSofia ? (
                    <>
                      <Loader size={15} />
                      A Sofia está a preparar...
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} />
                      Gerar com Sofia
                    </>
                  )}
                </button>
              </div>

              <div style={formGridStyle}>
                <Input label="Nome" value={form.nome} onChange={(v) => setForm({ ...form, nome: v })} />
                <Input label="@ Instagram" value={form.username_instagram} onChange={(v) => setForm({ ...form, username_instagram: v })} />
                <Input label="Link do perfil" value={form.link_perfil} onChange={(v) => setForm({ ...form, link_perfil: v })} />
                <Input label="Nicho" value={form.nicho} onChange={(v) => setForm({ ...form, nicho: v })} />
                <Input label="Localização" value={form.localizacao} onChange={(v) => setForm({ ...form, localizacao: v })} />
                <Input label="Score 0-100" type="number" value={String(form.score)} onChange={(v) => setForm({ ...form, score: Number(v) })} />
              </div>

              <Textarea label="Problema identificado" value={form.problema_identificado} onChange={(v) => setForm({ ...form, problema_identificado: v })} />
              <Textarea label="Oportunidade para a AdPulse" value={form.oportunidade_adpulse} onChange={(v) => setForm({ ...form, oportunidade_adpulse: v })} />
              <Textarea label="Comentário sugerido" value={form.comentario_sugerido} onChange={(v) => setForm({ ...form, comentario_sugerido: v })} />
              <Textarea label="Mensagem sugerida" value={form.mensagem_sugerida} onChange={(v) => setForm({ ...form, mensagem_sugerida: v })} />
              <Textarea label="Follow-up sugerido" value={form.follow_up_sugerido} onChange={(v) => setForm({ ...form, follow_up_sugerido: v })} />
              <Textarea label="Próximo passo" value={form.proximo_passo} onChange={(v) => setForm({ ...form, proximo_passo: v })} />

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setFormAberto(false)}
                  style={secondaryButtonStyle}
                >
                  Cancelar
                </button>

                <button
                  onClick={criarLead}
                  disabled={aGuardar}
                  style={{
                    ...primaryButtonStyle,
                    opacity: aGuardar ? 0.7 : 1,
                  }}
                >
                  {aGuardar ? (
                    <>
                      <Loader size={15} />
                      A guardar...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={15} />
                      Guardar lead
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          <div style={toolbarStyle}>
            <div style={searchBoxStyle}>
              <Search size={15} color="#8888aa" />
              <input
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
                placeholder="Pesquisar lead..."
                style={searchInputStyle}
              />
            </div>

            <select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
              style={selectStyle}
            >
              <option value="todos">Todos os estados</option>
              {ESTADOS.map((estado) => (
                <option key={estado} value={estado}>
                  {ESTADO_LABEL[estado] || estado}
                </option>
              ))}
            </select>
          </div>

          {carregando && (
            <div style={centerBoxStyle}>
              <Loader size={28} color="#7c7bfa" />
              <p style={{ color: '#8888aa' }}>A carregar leads...</p>
            </div>
          )}

          {!carregando && leadsFiltrados.length === 0 && (
            <div style={emptyStyle}>
              <UserPlus size={34} />
              <p>Nenhum lead encontrado.</p>
            </div>
          )}

          {!carregando && leadsFiltrados.length > 0 && (
            <div style={leadsListStyle}>
              {leadsFiltrados.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onCopy={copiar}
                  onUpdate={atualizarLead}
                  onDelete={apagarLead}
                />
              ))}
            </div>
          )}
        </div>
      </AdminShell>
    </>
  )
}

function AdminShell({
  children,
  simples,
  onLogout,
  onRefresh,
  carregando,
}: {
  children: React.ReactNode
  simples?: boolean
  onLogout?: () => void
  onRefresh?: () => void
  carregando?: boolean
}) {
  return (
    <div style={pageStyle}>
      {!simples && (
        <header style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={smallLogoStyle}>
              <Zap size={16} color="#fff" fill="#fff" />
            </div>
            <span style={{ fontWeight: 800 }}>AdPulse</span>
            <span style={adminBadgeStyle}>ADMIN</span>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {onRefresh && (
              <button onClick={onRefresh} style={headerButtonStyle}>
                <RefreshCw size={13} />
                {carregando ? 'A atualizar...' : 'Atualizar'}
              </button>
            )}

            {onLogout && (
              <button onClick={onLogout} style={logoutButtonStyle}>
                <LogOut size={13} />
                Sair
              </button>
            )}
          </div>
        </header>
      )}

      {children}
    </div>
  )
}

function MetricCard({
  label,
  valor,
  icon: Icon,
  cor,
}: {
  label: string
  valor: number
  icon: any
  cor: string
}) {
  return (
    <div style={metricCardStyle}>
      <div style={{
        ...metricIconStyle,
        color: cor,
        background: `${cor}15`,
        border: `1px solid ${cor}30`,
      }}>
        <Icon size={18} />
      </div>

      <div style={{ fontSize: 28, fontWeight: 900, color: cor }}>{valor}</div>
      <div style={{ fontSize: 12, color: '#8888aa' }}>{label}</div>
    </div>
  )
}

function LeadCard({
  lead,
  onCopy,
  onUpdate,
  onDelete,
}: {
  lead: Lead
  onCopy: (texto: string) => void
  onUpdate: (id: string, updates: Partial<Lead>) => void
  onDelete: (id: string) => void
}) {
  const corEstado = ESTADO_COR[lead.estado] || '#7c7bfa'

  return (
    <div style={leadCardStyle}>
      <div style={leadHeaderStyle}>
        <div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <h3 style={leadTitleStyle}>
              {lead.nome || 'Lead sem nome'}
            </h3>

            <span style={{
              ...estadoBadgeStyle,
              color: corEstado,
              background: `${corEstado}15`,
              border: `1px solid ${corEstado}35`,
            }}>
              {ESTADO_LABEL[lead.estado] || lead.estado}
            </span>

            <span style={scoreBadgeStyle}>
              <Star size={12} />
              {lead.score}/100
            </span>
          </div>

          <p style={leadMetaStyle}>
            {lead.username_instagram || '@instagram'} · {lead.nicho || 'sem nicho'} · {lead.localizacao || 'sem localização'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {lead.link_perfil && (
            <a
              href={lead.link_perfil}
              target="_blank"
              rel="noreferrer"
              style={secondaryButtonStyle}
            >
              Ver perfil
            </a>
          )}

          <button onClick={() => onDelete(lead.id)} style={dangerButtonStyle}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div style={leadGridStyle}>
        <InfoBox title="Problema" text={lead.problema_identificado} />
        <InfoBox title="Oportunidade" text={lead.oportunidade_adpulse} />
      </div>

      <div style={messageGridStyle}>
        <TextAction
          title="Comentário sugerido"
          text={lead.comentario_sugerido}
          onCopy={() => onCopy(lead.comentario_sugerido)}
        />

        <TextAction
          title="Mensagem privada"
          text={lead.mensagem_sugerida}
          onCopy={() => onCopy(lead.mensagem_sugerida)}
        />

        <TextAction
          title="Follow-up"
          text={lead.follow_up_sugerido}
          onCopy={() => onCopy(lead.follow_up_sugerido)}
        />
      </div>

      <div style={leadFooterStyle}>
        <select
          value={lead.estado}
          onChange={(e) => onUpdate(lead.id, { estado: e.target.value })}
          style={selectStyle}
        >
          {ESTADOS.map((estado) => (
            <option key={estado} value={estado}>
              {ESTADO_LABEL[estado] || estado}
            </option>
          ))}
        </select>

        <button
          onClick={() => onUpdate(lead.id, { estado: 'contactado' })}
          style={secondaryButtonStyle}
        >
          Marcar contactado
        </button>

        <button
          onClick={() => onUpdate(lead.id, { estado: 'respondeu' })}
          style={secondaryButtonStyle}
        >
          Marcar respondeu
        </button>

        <button
          onClick={() => onUpdate(lead.id, { estado: 'cliente' })}
          style={primarySmallButtonStyle}
        >
          Marcar cliente
        </button>
      </div>
    </div>
  )
}

function InfoBox({ title, text }: { title: string; text: string }) {
  return (
    <div style={infoBoxStyle}>
      <div style={infoTitleStyle}>{title}</div>
      <p style={infoTextStyle}>{text || '—'}</p>
    </div>
  )
}

function TextAction({
  title,
  text,
  onCopy,
}: {
  title: string
  text: string
  onCopy: () => void
}) {
  return (
    <div style={textActionStyle}>
      <div style={textActionHeaderStyle}>
        <span>{title}</span>
        <button onClick={onCopy} style={copyButtonStyle}>
          <Copy size={13} />
          Copiar
        </button>
      </div>

      <p style={textActionTextStyle}>
        {text || '—'}
      </p>
    </div>
  )
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
}) {
  return (
    <label style={fieldStyle}>
      <span style={fieldLabelStyle}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
      />
    </label>
  )
}

function Textarea({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label style={fieldStyle}>
      <span style={fieldLabelStyle}>{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        style={textareaStyle}
      />
    </label>
  )
}

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: '#0a0a0f',
  color: '#f0f0f5',
  fontFamily:
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
}

const headerStyle: React.CSSProperties = {
  height: 64,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 28px',
  borderBottom: '1px solid #22222e',
  background: 'rgba(10,10,15,0.9)',
  backdropFilter: 'blur(12px)',
  position: 'sticky',
  top: 0,
  zIndex: 20,
}

const smallLogoStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 10,
  background: '#7c7bfa',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const adminBadgeStyle: React.CSSProperties = {
  fontSize: 11,
  color: '#7c7bfa',
  padding: '2px 8px',
  borderRadius: 6,
  background: 'rgba(124,123,250,0.15)',
  border: '1px solid rgba(124,123,250,0.3)',
  fontWeight: 800,
}

const headerButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 12px',
  borderRadius: 10,
  background: 'rgba(124,123,250,0.1)',
  border: '1px solid rgba(124,123,250,0.2)',
  color: '#a5b4fc',
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 800,
}

const logoutButtonStyle: React.CSSProperties = {
  ...headerButtonStyle,
  background: 'rgba(248,113,113,0.1)',
  border: '1px solid rgba(248,113,113,0.2)',
  color: '#f87171',
}

const containerStyle: React.CSSProperties = {
  maxWidth: 1220,
  margin: '0 auto',
  padding: '34px 24px 60px',
}

const heroStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 20,
  alignItems: 'flex-start',
  marginBottom: 26,
}

const pillStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '7px 12px',
  borderRadius: 999,
  background: 'rgba(124,123,250,0.14)',
  border: '1px solid rgba(124,123,250,0.32)',
  color: '#c4b5fd',
  fontSize: 12,
  fontWeight: 900,
  marginBottom: 14,
}

const titleStyle: React.CSSProperties = {
  fontSize: 42,
  lineHeight: 1,
  margin: 0,
  fontWeight: 950,
  letterSpacing: '-0.05em',
}

const subtitleStyle: React.CSSProperties = {
  margin: '12px 0 0',
  color: '#a1a1aa',
  fontSize: 15,
  lineHeight: 1.6,
  maxWidth: 720,
}

const metricsGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
  gap: 14,
  marginBottom: 24,
}

const metricCardStyle: React.CSSProperties = {
  background: '#111118',
  border: '1px solid #22222e',
  borderRadius: 18,
  padding: 18,
  textAlign: 'center',
}

const metricIconStyle: React.CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 10px',
}

const formCardStyle: React.CSSProperties = {
  background: '#111118',
  border: '1px solid #22222e',
  borderRadius: 20,
  padding: 22,
  marginBottom: 24,
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
}

const sofiaBoxStyle: React.CSSProperties = {
  padding: 16,
  borderRadius: 16,
  background: 'linear-gradient(135deg, rgba(124,123,250,0.12), rgba(244,114,182,0.08))',
  border: '1px solid rgba(124,123,250,0.28)',
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
}

const sofiaIconStyle: React.CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 12,
  background: 'rgba(124,123,250,0.18)',
  border: '1px solid rgba(124,123,250,0.35)',
  color: '#c4b5fd',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
}

const sectionTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: 900,
}

const formGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: 12,
}

const fieldStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
}

const fieldLabelStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#8888aa',
  fontWeight: 700,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 13px',
  borderRadius: 12,
  background: '#16161f',
  border: '1px solid #22222e',
  color: '#f0f0f5',
  fontSize: 13,
  outline: 'none',
  boxSizing: 'border-box',
}

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: 'vertical',
  minHeight: 92,
  lineHeight: 1.55,
  fontFamily: 'inherit',
}

const primaryButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: '12px 16px',
  borderRadius: 12,
  background: '#7c7bfa',
  border: 'none',
  color: '#fff',
  fontWeight: 900,
  cursor: 'pointer',
  textDecoration: 'none',
}

const primarySmallButtonStyle: React.CSSProperties = {
  ...primaryButtonStyle,
  padding: '8px 11px',
  fontSize: 12,
}

const secondaryButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 7,
  padding: '8px 11px',
  borderRadius: 10,
  background: '#16161f',
  border: '1px solid #22222e',
  color: '#f0f0f5',
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: 800,
  textDecoration: 'none',
}

const dangerButtonStyle: React.CSSProperties = {
  ...secondaryButtonStyle,
  color: '#f87171',
}

const toolbarStyle: React.CSSProperties = {
  display: 'flex',
  gap: 12,
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 18,
}

const searchBoxStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  gap: 9,
  padding: '10px 13px',
  borderRadius: 12,
  background: '#111118',
  border: '1px solid #22222e',
}

const searchInputStyle: React.CSSProperties = {
  flex: 1,
  background: 'none',
  border: 'none',
  outline: 'none',
  color: '#f0f0f5',
  fontSize: 13,
}

const selectStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: 12,
  background: '#111118',
  border: '1px solid #22222e',
  color: '#f0f0f5',
  fontSize: 12,
  outline: 'none',
}

const leadsListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
}

const leadCardStyle: React.CSSProperties = {
  background: '#111118',
  border: '1px solid #22222e',
  borderRadius: 20,
  padding: 18,
}

const leadHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 16,
  alignItems: 'flex-start',
  marginBottom: 14,
}

const leadTitleStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 900,
  margin: 0,
}

const leadMetaStyle: React.CSSProperties = {
  margin: '6px 0 0',
  color: '#8888aa',
  fontSize: 12,
}

const estadoBadgeStyle: React.CSSProperties = {
  padding: '3px 8px',
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 900,
}

const scoreBadgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  padding: '3px 8px',
  borderRadius: 999,
  background: 'rgba(251,191,36,0.12)',
  border: '1px solid rgba(251,191,36,0.25)',
  color: '#fbbf24',
  fontSize: 11,
  fontWeight: 900,
}

const leadGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 12,
  marginBottom: 12,
}

const infoBoxStyle: React.CSSProperties = {
  padding: 13,
  borderRadius: 14,
  background: '#16161f',
  border: '1px solid #22222e',
}

const infoTitleStyle: React.CSSProperties = {
  fontSize: 11,
  color: '#8888aa',
  fontWeight: 900,
  textTransform: 'uppercase',
  marginBottom: 6,
}

const infoTextStyle: React.CSSProperties = {
  margin: 0,
  color: '#d4d4dc',
  fontSize: 13,
  lineHeight: 1.5,
}

const messageGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: 12,
}

const textActionStyle: React.CSSProperties = {
  padding: 13,
  borderRadius: 14,
  background: '#0f0f16',
  border: '1px solid #22222e',
}

const textActionHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 10,
  color: '#c4b5fd',
  fontSize: 12,
  fontWeight: 900,
  marginBottom: 9,
}

const copyButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  padding: '5px 8px',
  borderRadius: 8,
  border: '1px solid rgba(124,123,250,0.3)',
  background: 'rgba(124,123,250,0.12)',
  color: '#c4b5fd',
  fontSize: 11,
  fontWeight: 800,
  cursor: 'pointer',
}

const textActionTextStyle: React.CSSProperties = {
  margin: 0,
  whiteSpace: 'pre-wrap',
  color: '#d4d4dc',
  fontSize: 12,
  lineHeight: 1.55,
}

const leadFooterStyle: React.CSSProperties = {
  display: 'flex',
  gap: 10,
  flexWrap: 'wrap',
  alignItems: 'center',
  marginTop: 14,
}

const centerBoxStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  gap: 12,
}

const loginCardStyle: React.CSSProperties = {
  width: 380,
  maxWidth: 'calc(100vw - 32px)',
  padding: 32,
  borderRadius: 22,
  background: '#111118',
  border: '1px solid #22222e',
  boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
}

const logoBoxStyle: React.CSSProperties = {
  width: 54,
  height: 54,
  borderRadius: 16,
  background: '#7c7bfa',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 14px',
}

const loginTitleStyle: React.CSSProperties = {
  textAlign: 'center',
  margin: 0,
  fontSize: 23,
  fontWeight: 950,
}

const loginTextStyle: React.CSSProperties = {
  textAlign: 'center',
  color: '#8888aa',
  margin: '7px 0 18px',
  fontSize: 13,
}

const lockBoxStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 7,
  padding: 10,
  borderRadius: 12,
  background: 'rgba(124,123,250,0.12)',
  border: '1px solid rgba(124,123,250,0.25)',
  color: '#c4b5fd',
  fontSize: 12,
  fontWeight: 800,
  marginBottom: 14,
}

const errorStyle: React.CSSProperties = {
  padding: 10,
  borderRadius: 10,
  background: 'rgba(248,113,113,0.12)',
  border: '1px solid rgba(248,113,113,0.30)',
  color: '#fecaca',
  fontSize: 12,
  margin: '10px 0',
}

const emptyStyle: React.CSSProperties = {
  padding: 54,
  borderRadius: 18,
  background: '#111118',
  border: '1px solid #22222e',
  color: '#8888aa',
  textAlign: 'center',
}
