# role-app

Mini prototipo web para testar a ideia de um termometro do role em grupos privados. Uma pessoa cria um role, compartilha o link, os amigos entram com nome ou apelido, votam no clima e acompanham o resultado geral.

A primeira versao e apenas um MVP privado por link. Nao inclui painel publico de bares, eventos, mapa, pagamento, login completo ou app mobile nativo.

## Stack

- Node.js
- Express
- EJS
- PostgreSQL/Supabase
- dotenv
- pg
- express-session
- CSS puro
- Render para deploy

## Como rodar localmente

1. Instale as dependencias:

```bash
npm install
```

2. Crie um arquivo `.env` baseado no `.env.example`:

```env
DATABASE_URL=sua_url_postgresql
SESSION_SECRET=um_segredo_forte
PORT=3000
```

3. Crie as tabelas executando o conteudo de `database.sql` no PostgreSQL ou Supabase.

4. Inicie o projeto:

```bash
npm start
```

5. Acesse:

```text
http://localhost:3000
```

## Como configurar Supabase

1. Crie um projeto no Supabase.
2. Abra o SQL Editor.
3. Execute o arquivo `database.sql`.
4. Copie a connection string PostgreSQL.
5. Use essa URL em `DATABASE_URL`.

## Deploy no Render

1. Suba o projeto para o GitHub.
2. Crie um Web Service no Render.
3. Configure:

```text
Build Command: npm install
Start Command: npm start
```

4. Adicione as variaveis de ambiente:

```text
DATABASE_URL
SESSION_SECRET
CREATOR_USERNAME
CREATOR_PASSWORD
NODE_ENV=production
```

O app usa `process.env.PORT || 3000`, entao funciona localmente e no Render. O link compartilhavel usa o host atual da requisicao, sem depender de localhost fixo.

## Seguranca base (Fase 24)

Em producao, o servidor exige `DATABASE_URL`, `CREATOR_USERNAME`, uma senha propria com pelo menos 12 caracteres e `SESSION_SECRET` com pelo menos 32 caracteres. Senhas de exemplo sao rejeitadas. Use um segredo aleatorio e mantenha seu valor entre deploys. As mensagens de configuracao nao exibem os valores das variaveis.

Todos os formularios POST incluem um token CSRF vinculado a sessao. Formularios antigos abertos antes de um login, logout ou reinicio podem precisar de recarga. Login e logout renovam o identificador da sessao, preservando os vinculos de participante que ja existiam.

Limites atuais:

- login: 5 tentativas por usuario/IP, 30 por IP e 50 por usuario em 15 minutos; contam tentativas validas e invalidas;
- entrada: 30 requisicoes por IP por minuto;
- interacoes de participante: 60 requisicoes por sessao por minuto, alem do intervalo de voto configurado;
- formularios: ate 16 KiB e 30 parametros, apenas campos conhecidos e valores textuais dentro dos limites.

Os limites usam memoria temporaria do processo e retornam HTTP 429 com `Retry-After`. Reiniciar o servidor reinicia os contadores; multiplas instancias nao os compartilham. O IP depende do proxy confiavel configurado (`trust proxy = 1`), que deve ser validado no Render antes de considerar a protecao operacionalmente concluida.

Cookies usam `httpOnly`, `sameSite=lax` e `secure` em producao. Cabecalhos restringem scripts a arquivos locais, bloqueiam incorporacao em frames e evitam enviar o link privado como referer. Paginas dinamicas nao sao armazenadas em cache.

Execute `npm test` para verificar as protecoes por HTTP com banco simulado, sem acessar ou alterar dados reais. A revisao de permissoes do usuario do banco e a validacao no Render continuam pendentes. A Fase 41 (sessao persistente) e a exclusao de dados ao encerrar o role nao fazem parte desta implementacao.

## Banco de dados

O catálogo de sinais está em `signals.js`, organizado em Chegada, Saída, Ambiente, Grupo e Cuidado. Alterar o catálogo não apaga o histórico; opções de enquetes antigas são preservadas para rolês já existentes. Sinais são enviados junto da avaliação de 0 a 100 e seguem o intervalo de voto configurado.

O arquivo `database.sql` cria:

- `roles`
- `participantes`
- `votos`

Um participante pode votar varias vezes, mas o termometro considera apenas o voto mais recente de cada participante.
