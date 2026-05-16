ALTER TABLE roles
  ALTER COLUMN criado_em SET DEFAULT timezone('America/Sao_Paulo', now());

ALTER TABLE participantes
  ALTER COLUMN criado_em SET DEFAULT timezone('America/Sao_Paulo', now());

ALTER TABLE votos
  ALTER COLUMN criado_em SET DEFAULT timezone('America/Sao_Paulo', now());

ALTER TABLE sinal_respostas
  ALTER COLUMN criado_em SET DEFAULT timezone('America/Sao_Paulo', now());
