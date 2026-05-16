CREATE TABLE IF NOT EXISTS sugestao_votos (
  id SERIAL PRIMARY KEY,
  sinal_resposta_id INTEGER NOT NULL REFERENCES sinal_respostas(id) ON DELETE CASCADE,
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  participante_id INTEGER NOT NULL REFERENCES participantes(id) ON DELETE CASCADE,
  valor SMALLINT NOT NULL CHECK (valor IN (-1, 1)),
  criado_em TIMESTAMP DEFAULT timezone('America/Sao_Paulo', now()),
  UNIQUE (sinal_resposta_id, participante_id)
);

CREATE INDEX IF NOT EXISTS idx_sugestao_votos_sinal_resposta_id ON sugestao_votos(sinal_resposta_id);
CREATE INDEX IF NOT EXISTS idx_sugestao_votos_role_id ON sugestao_votos(role_id);
CREATE INDEX IF NOT EXISTS idx_sugestao_votos_participante_id ON sugestao_votos(participante_id);
