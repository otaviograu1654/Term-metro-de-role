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
```

O app usa `process.env.PORT || 3000`, entao funciona localmente e no Render. O link compartilhavel usa o host atual da requisicao, sem depender de localhost fixo.

## Banco de dados

O arquivo `database.sql` cria:

- `roles`
- `participantes`
- `votos`

Um participante pode votar varias vezes, mas o termometro considera apenas o voto mais recente de cada participante.
