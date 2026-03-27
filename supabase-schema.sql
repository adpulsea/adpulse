-- ============================================
-- AdPulse — SQL para o Supabase
-- ============================================
-- Copia e cola este SQL no Supabase:
-- Dashboard → SQL Editor → New Query → Executar

-- ============================================
-- TABELA: perfis (dados extra dos utilizadores)
-- ============================================
CREATE TABLE IF NOT EXISTS perfis (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                 TEXT NOT NULL,
  nome                  TEXT,
  avatar_url            TEXT,
  plano                 TEXT NOT NULL DEFAULT 'gratuito' CHECK (plano IN ('gratuito', 'pro', 'agencia')),
  nicho                 TEXT,
  plataformas_principais TEXT[] DEFAULT ARRAY[]::TEXT[],
  criado_em             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Activar Row Level Security (segurança a nível de linha)
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;

-- Políticas: cada utilizador só vê os seus próprios dados
CREATE POLICY "perfis_select" ON perfis FOR SELECT USING (auth.uid() = id);
CREATE POLICY "perfis_insert" ON perfis FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "perfis_update" ON perfis FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- TABELA: campanhas
-- ============================================
CREATE TABLE IF NOT EXISTS campanhas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  utilizador_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome            TEXT NOT NULL,
  descricao       TEXT,
  plataformas     TEXT[] DEFAULT ARRAY[]::TEXT[],
  total_posts     INTEGER NOT NULL DEFAULT 0,
  criado_em       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE campanhas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "campanhas_all" ON campanhas FOR ALL USING (auth.uid() = utilizador_id);

-- ============================================
-- TABELA: posts
-- ============================================
CREATE TABLE IF NOT EXISTS posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campanha_id     UUID REFERENCES campanhas(id) ON DELETE SET NULL,
  utilizador_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo          TEXT NOT NULL,
  legenda         TEXT,
  hashtags        TEXT[] DEFAULT ARRAY[]::TEXT[],
  hook            TEXT,
  plataforma      TEXT,
  formato         TEXT DEFAULT 'post',
  estado          TEXT NOT NULL DEFAULT 'rascunho' CHECK (estado IN ('rascunho', 'agendado', 'publicado')),
  viral_score     INTEGER,
  criado_em       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "posts_all" ON posts FOR ALL USING (auth.uid() = utilizador_id);

-- ============================================
-- TABELA: geracoes_ai (para controlar limites diários)
-- ============================================
CREATE TABLE IF NOT EXISTS geracoes_ai (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  utilizador_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo            TEXT NOT NULL,
  prompt_entrada  TEXT,
  resultado       TEXT,
  tokens_usados   INTEGER DEFAULT 0,
  data_geracao    DATE NOT NULL DEFAULT CURRENT_DATE,  -- para agrupar por dia
  criado_em       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE geracoes_ai ENABLE ROW LEVEL SECURITY;

CREATE POLICY "geracoes_all" ON geracoes_ai FOR ALL USING (auth.uid() = utilizador_id);

-- Índice para pesquisas rápidas por utilizador + data
CREATE INDEX IF NOT EXISTS idx_geracoes_utilizador_data
  ON geracoes_ai(utilizador_id, data_geracao);

-- ============================================
-- TRIGGER: criar perfil automaticamente ao registar
-- ============================================
CREATE OR REPLACE FUNCTION criar_perfil_novo_utilizador()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO perfis (id, email, nome)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;  -- evitar duplicados
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Executar trigger após novo utilizador ser criado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION criar_perfil_novo_utilizador();

-- ============================================
-- TRIGGER: atualizar o timestamp de campanhas
-- ============================================
CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER campanhas_atualizar_timestamp
  BEFORE UPDATE ON campanhas
  FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();
