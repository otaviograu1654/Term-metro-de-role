CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(10) UNIQUE NOT NULL,
  nome VARCHAR(100) NOT NULL,
  criado_em TIMESTAMP DEFAULT timezone('America/Sao_Paulo', now()),
  encerrado BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS participantes (
  id SERIAL PRIMARY KEY,
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  nome VARCHAR(60) NOT NULL,
  avatar VARCHAR(40),
  criado_em TIMESTAMP DEFAULT timezone('America/Sao_Paulo', now())
);

CREATE TABLE IF NOT EXISTS votos (
  id SERIAL PRIMARY KEY,
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  participante_id INTEGER NOT NULL REFERENCES participantes(id) ON DELETE CASCADE,
  nota INTEGER NOT NULL CHECK (nota >= 0 AND nota <= 100),
  status VARCHAR(80),
  comentario VARCHAR(30),
  anonimo BOOLEAN DEFAULT FALSE,
  criado_em TIMESTAMP DEFAULT timezone('America/Sao_Paulo', now())
);

CREATE TABLE IF NOT EXISTS sinal_respostas (
  id SERIAL PRIMARY KEY,
  voto_id INTEGER NOT NULL REFERENCES votos(id) ON DELETE CASCADE,
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  participante_id INTEGER NOT NULL REFERENCES participantes(id) ON DELETE CASCADE,
  resposta VARCHAR(80) NOT NULL,
  sugestao VARCHAR(40),
  criado_em TIMESTAMP DEFAULT timezone('America/Sao_Paulo', now()),
  UNIQUE (voto_id, participante_id)
);

CREATE TABLE IF NOT EXISTS sugestao_votos (
  id SERIAL PRIMARY KEY,
  sinal_resposta_id INTEGER NOT NULL REFERENCES sinal_respostas(id) ON DELETE CASCADE,
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  participante_id INTEGER NOT NULL REFERENCES participantes(id) ON DELETE CASCADE,
  valor SMALLINT NOT NULL CHECK (valor IN (-1, 1)),
  criado_em TIMESTAMP DEFAULT timezone('America/Sao_Paulo', now()),
  UNIQUE (sinal_resposta_id, participante_id)
);

CREATE INDEX IF NOT EXISTS idx_roles_codigo ON roles(codigo);
CREATE INDEX IF NOT EXISTS idx_participantes_role_id ON participantes(role_id);
CREATE INDEX IF NOT EXISTS idx_votos_role_id ON votos(role_id);
CREATE INDEX IF NOT EXISTS idx_votos_participante_id ON votos(participante_id);
CREATE INDEX IF NOT EXISTS idx_sinal_respostas_voto_id ON sinal_respostas(voto_id);
CREATE INDEX IF NOT EXISTS idx_sinal_respostas_role_id ON sinal_respostas(role_id);
CREATE INDEX IF NOT EXISTS idx_sinal_respostas_participante_id ON sinal_respostas(participante_id);
CREATE INDEX IF NOT EXISTS idx_sugestao_votos_sinal_resposta_id ON sugestao_votos(sinal_resposta_id);
CREATE INDEX IF NOT EXISTS idx_sugestao_votos_role_id ON sugestao_votos(role_id);
CREATE INDEX IF NOT EXISTS idx_sugestao_votos_participante_id ON sugestao_votos(participante_id);
