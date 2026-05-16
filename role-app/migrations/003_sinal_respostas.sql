CREATE TABLE IF NOT EXISTS sinal_respostas (
  id SERIAL PRIMARY KEY,
  voto_id INTEGER NOT NULL REFERENCES votos(id) ON DELETE CASCADE,
  role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  participante_id INTEGER NOT NULL REFERENCES participantes(id) ON DELETE CASCADE,
  resposta VARCHAR(80) NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (voto_id, participante_id)
);

CREATE INDEX IF NOT EXISTS idx_sinal_respostas_voto_id ON sinal_respostas(voto_id);
CREATE INDEX IF NOT EXISTS idx_sinal_respostas_role_id ON sinal_respostas(role_id);
CREATE INDEX IF NOT EXISTS idx_sinal_respostas_participante_id ON sinal_respostas(participante_id);
