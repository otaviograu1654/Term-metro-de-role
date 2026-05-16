require('dotenv').config();

const path = require('path');
const crypto = require('crypto');
const express = require('express');
const session = require('express-session');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

const STATUS_SCORES = {
  '🔥 Tá massa': 100,
  '😎 Tá bom': 80,
  '😐 Tá normal': 60,
  '🍻 À procura de after': 70,
  '😴 Tá fraco': 35,
  '🔁 Bora mudar de lugar': 30,
  '🚶 Quero ir embora': 20,
  '⚠️ Tô desconfortável': 10
};

const STATUS_LIST = Object.keys(STATUS_SCORES);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('trust proxy', 1);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  }
}));

function query(text, params) {
  return pool.query(text, params);
}

function renderError(res, mensagem, statusCode = 400) {
  return res.status(statusCode).render('erro', { mensagem });
}

function normalizeName(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';

  for (let i = 0; i < 6; i += 1) {
    code += chars[crypto.randomInt(chars.length)];
  }

  return code;
}

async function createUniqueCode() {
  for (let attempts = 0; attempts < 8; attempts += 1) {
    const code = generateCode();
    const existing = await query('SELECT id FROM roles WHERE codigo = $1', [code]);

    if (existing.rowCount === 0) {
      return code;
    }
  }

  throw new Error('Nao foi possivel gerar um codigo unico.');
}

async function findRoleByCode(codigo) {
  const result = await query('SELECT * FROM roles WHERE codigo = $1', [codigo]);
  return result.rows[0];
}

function getSessionParticipant(req, roleId) {
  const current = req.session.roles && req.session.roles[String(roleId)];
  return current || null;
}

function saveSessionParticipant(req, roleId, participante) {
  if (!req.session.roles) {
    req.session.roles = {};
  }

  req.session.roles[String(roleId)] = {
    role_id: roleId,
    participante_id: participante.id,
    participante_nome: participante.nome
  };
}

function calculateThermometer(votes) {
  if (votes.length === 0) {
    return {
      media: 0,
      quantidade: 0,
      statusMaisVotado: 'Ainda sem votos'
    };
  }

  const total = votes.reduce((sum, vote) => sum + STATUS_SCORES[vote.status], 0);
  const counts = votes.reduce((acc, vote) => {
    acc[vote.status] = (acc[vote.status] || 0) + 1;
    return acc;
  }, {});

  const statusMaisVotado = Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || STATUS_LIST.indexOf(a[0]) - STATUS_LIST.indexOf(b[0]))[0][0];

  return {
    media: Math.round(total / votes.length),
    quantidade: votes.length,
    statusMaisVotado
  };
}

async function getLatestVotes(roleId) {
  const result = await query(`
    SELECT DISTINCT ON (v.participante_id)
      v.id,
      v.status,
      v.anonimo,
      v.criado_em,
      p.nome AS participante_nome
    FROM votos v
    JOIN participantes p ON p.id = v.participante_id
    WHERE v.role_id = $1
    ORDER BY v.participante_id, v.criado_em DESC, v.id DESC
  `, [roleId]);

  return result.rows;
}

async function getRecentVotes(roleId) {
  const result = await query(`
    SELECT
      v.status,
      v.anonimo,
      v.criado_em,
      p.nome AS participante_nome
    FROM votos v
    JOIN participantes p ON p.id = v.participante_id
    WHERE v.role_id = $1
    ORDER BY v.criado_em DESC, v.id DESC
    LIMIT 8
  `, [roleId]);

  return result.rows;
}

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/roles', async (req, res) => {
  const nome = normalizeName(req.body.nome, 100);

  if (!nome) {
    return renderError(res, 'Digite um nome para criar o role.');
  }

  try {
    const codigo = await createUniqueCode();
    await query('INSERT INTO roles (codigo, nome) VALUES ($1, $2)', [codigo, nome]);
    return res.redirect(`/role/${codigo}`);
  } catch (error) {
    console.error(error);
    return renderError(res, 'Nao foi possivel criar o role agora.', 500);
  }
});

app.get('/role/:codigo', async (req, res) => {
  const codigo = req.params.codigo.toUpperCase();

  try {
    const role = await findRoleByCode(codigo);

    if (!role) {
      return renderError(res, 'Role nao encontrado.', 404);
    }

    const participante = getSessionParticipant(req, role.id);
    const latestVotes = await getLatestVotes(role.id);
    const recentes = await getRecentVotes(role.id);
    const termometro = calculateThermometer(latestVotes);
    const shareUrl = `${req.protocol}://${req.get('host')}/role/${role.codigo}`;

    return res.render('role', {
      role,
      participante,
      statusList: STATUS_LIST,
      sensitiveStatuses: [
        '🚶 Quero ir embora',
        '🔁 Bora mudar de lugar',
        '⚠️ Tô desconfortável'
      ],
      termometro,
      recentes,
      shareUrl
    });
  } catch (error) {
    console.error(error);
    return renderError(res, 'Falha ao carregar o role.', 500);
  }
});

app.post('/role/:codigo/entrar', async (req, res) => {
  const codigo = req.params.codigo.toUpperCase();
  const nome = normalizeName(req.body.nome, 60);

  if (!nome) {
    return renderError(res, 'Digite seu nome ou apelido para entrar no role.');
  }

  try {
    const role = await findRoleByCode(codigo);

    if (!role) {
      return renderError(res, 'Role nao encontrado.', 404);
    }

    const result = await query(
      'INSERT INTO participantes (role_id, nome) VALUES ($1, $2) RETURNING id, nome',
      [role.id, nome]
    );

    saveSessionParticipant(req, role.id, result.rows[0]);
    return res.redirect(`/role/${role.codigo}`);
  } catch (error) {
    console.error(error);
    return renderError(res, 'Nao foi possivel entrar no role agora.', 500);
  }
});

app.post('/role/:codigo/votar', async (req, res) => {
  const codigo = req.params.codigo.toUpperCase();
  const status = String(req.body.status || '').trim();
  const anonimo = req.body.anonimo === 'true' || req.body.anonimo === 'on';

  try {
    const role = await findRoleByCode(codigo);

    if (!role) {
      return renderError(res, 'Role nao encontrado.', 404);
    }

    const participante = getSessionParticipant(req, role.id);

    if (!participante || participante.role_id !== role.id) {
      return renderError(res, 'Entre no role antes de votar.', 403);
    }

    if (!STATUS_LIST.includes(status)) {
      return renderError(res, 'Escolha um status valido para votar.');
    }

    await query(
      'INSERT INTO votos (role_id, participante_id, status, anonimo) VALUES ($1, $2, $3, $4)',
      [role.id, participante.participante_id, status, anonimo]
    );

    return res.redirect(`/role/${role.codigo}`);
  } catch (error) {
    console.error(error);
    return renderError(res, 'Nao foi possivel registrar seu voto agora.', 500);
  }
});

app.use((req, res) => {
  renderError(res, 'Pagina nao encontrada.', 404);
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`role-app rodando em http://localhost:${PORT}`);
  });
}

module.exports = { app, calculateThermometer, STATUS_SCORES, STATUS_LIST };
