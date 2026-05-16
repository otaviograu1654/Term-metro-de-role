ALTER TABLE votos
  ADD COLUMN IF NOT EXISTS nota INTEGER;

UPDATE votos
SET nota = 50
WHERE nota IS NULL;

ALTER TABLE votos
  ALTER COLUMN nota SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'votos_nota_range'
  ) THEN
    ALTER TABLE votos
      ADD CONSTRAINT votos_nota_range CHECK (nota >= 0 AND nota <= 100);
  END IF;
END $$;

ALTER TABLE votos
  ALTER COLUMN status DROP NOT NULL;
