UPDATE votos
SET nota = 50
WHERE status IN (
  '🔥 Tá massa',
  '😎 Tá bom',
  '😐 Tá normal',
  '🍻 À procura de after',
  '😴 Tá fraco',
  '🔁 Bora mudar de lugar',
  '🚶 Quero ir embora',
  '⚠️ Tô desconfortável'
)
AND nota IN (100, 80, 70, 60, 35, 30, 20, 10);
