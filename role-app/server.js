require('dotenv').config();

const path = require('path');
const crypto = require('crypto');
const express = require('express');
const session = require('express-session');
const { Pool, types } = require('pg');

types.setTypeParser(1114, (value) => value);

const app = express();
const PORT = process.env.PORT || 3000;
const VOTE_COOLDOWN_ENABLED = process.env.VOTE_COOLDOWN_ENABLED === 'true';
const VOTE_COOLDOWN_MINUTES = Number(process.env.VOTE_COOLDOWN_MINUTES || 10);
const ROLE_EXPIRES_AFTER_HOURS = Number(process.env.ROLE_EXPIRES_AFTER_HOURS || 24);
const CREATOR_USERNAME = process.env.CREATOR_USERNAME || 'admin';
const CREATOR_PASSWORD = process.env.CREATOR_PASSWORD || 'admin123';
const COMMENT_COOLDOWN_MINUTES = Number(process.env.COMMENT_COOLDOWN_MINUTES || 5);

const STATUS_LIST = [
  '✨ Divou',
  '🔥 Tá rendendo',
  '✅ Rolê entregou',
  '😎 Clima bom',
  '😐 Tá meio parado',
  '📉 Deu uma caída',
  '🎧 Bora pra pista',
  '🌀 Vamo rodar',
  '📍 Bora trocar de canto',
  '🗺️ Vamo pra outro lugar',
  '🍺 Vamo pegar bebida',
  '🥃 Rodada de dose',
  '🐆 Vamo dar um tapa na pantera',
  '💸 Bebida tá cara',
  '🍻 À procura de after',
  '🌙 Onde é o after?',
  '🧍 Muito cheio',
  '⚠️ Tô desconfortável',
  '👀 Tem uma pessoa me encarando',
  '🚪 Embora?',
  '🚶 Quero ir embora',
  '🚻 Banheiro tá impossível'
];

const SENSITIVE_STATUSES = [
  '🚶 Quero ir embora',
  '🚪 Embora?',
  '⚠️ Tô desconfortável',
  '👀 Tem uma pessoa me encarando'
];

const QUICK_POLL_OPTIONS = {
  '🍺 Vamo pegar bebida': ['Vamo', 'Agora não, irmão'],
  '🚪 Embora?': ['Vamo', 'Agora não, irmão'],
  '🌙 Onde é o after?': ['Bora achar', 'Todo mundo ir dormir é o after'],
  '🗺️ Vamo pra outro lugar': ['Bora', 'Vamo ficar mais']
};

const COMMENTABLE_STATUSES = [
  '🍻 À procura de after',
  '🌙 Onde é o after?',
  '👀 Tem uma pessoa me encarando'
];

const FORCE_ANONYMOUS_STATUSES = [
  '👀 Tem uma pessoa me encarando'
];

const AVATAR_OPTIONS = [
  { id: 'barbudo', label: 'Avatar 1', image: '/imagens/barbudo.png' },
  { id: 'branca-cacheada', label: 'Avatar 2', image: '/imagens/brancacacheada.png' },
  { id: 'branca-luzes', label: 'Avatar 3', image: '/imagens/brancaluzes.png' },
  { id: 'branco-degrade', label: 'Avatar 4', image: '/imagens/brancodegrade.png' },
  { id: 'branco-old-money', label: 'Avatar 5', image: '/imagens/brancooldmoney.png' },
  { id: 'cabelo-preto-liso', label: 'Avatar 6', image: '/imagens/cabelopretoliso.png' },
  { id: 'cavanhaque', label: 'Avatar 7', image: '/imagens/cavanhaque.png' },
  { id: 'japinha', label: 'Avatar 8', image: '/imagens/japinha.png' },
  { id: 'japones', label: 'Avatar 9', image: '/imagens/japones.png' },
  { id: 'loira-olhos-claros', label: 'Avatar 10', image: '/imagens/loiraolhosclaros.png' },
  { id: 'loira-tingida', label: 'Avatar 11', image: '/imagens/loiratingida.png' },
  { id: 'morena-cacheada', label: 'Avatar 12', image: '/imagens/morenacacheada.png' },
  { id: 'morena-liso', label: 'Avatar 13', image: '/imagens/morenaliso.png' },
  { id: 'morena-luzes', label: 'Avatar 14', image: '/imagens/morenaluzes.png' },
  { id: 'moreno-barbudo', label: 'Avatar 15', image: '/imagens/morenobarbudo.png' },
  { id: 'moreno-bigodin', label: 'Avatar 16', image: '/imagens/morenobigodin.png' },
  { id: 'ruiva', label: 'Avatar 17', image: '/imagens/ruiva.png' }
];

const databaseUrl = process.env.DATABASE_URL || '';
const shouldUseSsl = process.env.NODE_ENV === 'production'
  || databaseUrl.includes('supabase.co')
  || databaseUrl.includes('pooler.supabase.com')
  || databaseUrl.includes('sslmode=require');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: shouldUseSsl ? { rejectUnauthorized: false } : false
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('trust proxy', 1);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/imagens', express.static(path.join(__dirname, 'imagens')));
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

function setFlash(req, mensagem) {
  req.session.flash = mensagem;
}

function consumeFlash(req) {
  const mensagem = req.session.flash || null;
  delete req.session.flash;
  return mensagem;
}

function isCreatorLoggedIn(req) {
  return Boolean(req.session && req.session.creatorLoggedIn);
}

function requireCreator(req, res, next) {
  if (!isCreatorLoggedIn(req)) {
    return res.redirect('/login');
  }

  return next();
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

async function getCreatorRoles() {
  const result = await query(`
    SELECT
      r.id,
      r.codigo,
      r.nome,
      r.criado_em,
      r.encerrado,
      COUNT(DISTINCT p.id)::int AS participantes,
      COUNT(v.id)::int AS avaliacoes
    FROM roles r
    LEFT JOIN participantes p ON p.role_id = r.id
    LEFT JOIN votos v ON v.role_id = r.id
    GROUP BY r.id
    ORDER BY r.criado_em DESC
    LIMIT 30
  `);

  return result.rows.map((role) => {
    const expiration = getRoleExpiration(role);

    return {
      ...role,
      criado_em_label: formatDateTime(role.criado_em),
      expiracao_label: expiration.expiresAtLabel,
      expirado: expiration.isExpired
    };
  });
}

async function getCreatorRoleDetails(codigo) {
  const role = await findRoleByCode(codigo);

  if (!role) {
    return null;
  }

  const participantesResult = await query(`
    SELECT
      p.id,
      p.nome,
      p.avatar,
      p.criado_em,
      COUNT(v.id)::int AS avaliacoes,
      MAX(v.criado_em) AS ultima_interacao
    FROM participantes p
    LEFT JOIN votos v ON v.participante_id = p.id
    WHERE p.role_id = $1
    GROUP BY p.id
    ORDER BY p.criado_em ASC
  `, [role.id]);

  const votosResult = await query(`
    SELECT
      v.id,
      v.nota,
      v.status,
      v.comentario,
      v.anonimo,
      v.criado_em,
      p.nome AS participante_nome,
      p.avatar AS participante_avatar,
      COUNT(sr.id)::int AS respostas
    FROM votos v
    JOIN participantes p ON p.id = v.participante_id
    LEFT JOIN sinal_respostas sr ON sr.voto_id = v.id
    WHERE v.role_id = $1
    GROUP BY v.id, p.nome, p.avatar
    ORDER BY v.criado_em DESC, v.id DESC
    LIMIT 40
  `, [role.id]);

  const expiration = getRoleExpiration(role);

  return {
    role: {
      ...role,
      criado_em_label: formatDateTime(role.criado_em),
      expiracao_label: expiration.expiresAtLabel,
      expirado: expiration.isExpired
    },
    participantes: participantesResult.rows.map((participante) => ({
      ...participante,
      criado_em_label: formatDateTime(participante.criado_em),
      ultima_interacao_label: participante.ultima_interacao
        ? formatDateTime(participante.ultima_interacao)
        : 'Sem avaliacao ainda'
    })),
    votos: votosResult.rows.map((voto) => ({
      ...voto,
      horario: formatDateTime(voto.criado_em)
    }))
  };
}

async function getRoleParticipants(roleId) {
  const result = await query(`
    SELECT
      p.id,
      p.nome,
      p.avatar,
      p.criado_em,
      MAX(v.criado_em) AS ultima_interacao,
      COUNT(v.id)::int AS avaliacoes
    FROM participantes p
    LEFT JOIN votos v ON v.participante_id = p.id
    WHERE p.role_id = $1
    GROUP BY p.id
    ORDER BY p.criado_em ASC
  `, [roleId]);

  return result.rows.map((participante) => ({
    ...participante,
    entrou_em_label: formatDateTime(participante.criado_em),
    ultima_interacao_label: participante.ultima_interacao
      ? formatDateTime(participante.ultima_interacao)
      : 'Ainda nao avaliou'
  }));
}

function getSessionParticipant(req, roleId) {
  const current = req.session.roles && req.session.roles[String(roleId)];
  return current || null;
}

async function ensureSessionParticipant(req, roleId) {
  const participante = getSessionParticipant(req, roleId);

  if (!participante) {
    return null;
  }

  const result = await query(
    'SELECT id, nome, avatar FROM participantes WHERE role_id = $1 AND id = $2',
    [roleId, participante.participante_id]
  );

  if (result.rowCount === 0) {
    delete req.session.roles[String(roleId)];
    return null;
  }

  return {
    role_id: roleId,
    participante_id: result.rows[0].id,
    participante_nome: result.rows[0].nome,
    participante_avatar: result.rows[0].avatar
  };
}

function saveSessionParticipant(req, roleId, participante) {
  if (!req.session.roles) {
    req.session.roles = {};
  }

  req.session.roles[String(roleId)] = {
    role_id: roleId,
    participante_id: participante.id,
    participante_nome: participante.nome,
    participante_avatar: participante.avatar
  };
}

function calculateThermometer(votes) {
  if (votes.length === 0) {
    return {
      media: 0,
      quantidade: 0,
      sinalMaisVotado: 'Ainda sem sinais'
    };
  }

  const total = votes.reduce((sum, vote) => sum + Number(vote.nota || 0), 0);
  const votesWithStatus = votes.filter((vote) => vote.status);
  const counts = votesWithStatus.reduce((acc, vote) => {
    acc[vote.status] = (acc[vote.status] || 0) + 1;
    return acc;
  }, {});

  const sinalMaisVotado = Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || STATUS_LIST.indexOf(a[0]) - STATUS_LIST.indexOf(b[0]))[0]?.[0]
    || 'Ainda sem sinais';

  return {
    media: Math.round(total / votes.length),
    quantidade: votes.length,
    sinalMaisVotado
  };
}

function normalizeScore(value) {
  const score = Number(value);

  if (!Number.isInteger(score) || score < 0 || score > 100) {
    return null;
  }

  return score;
}

function getQuickPollOptions(status) {
  return QUICK_POLL_OPTIONS[status] || null;
}

function canHaveComment(status) {
  return COMMENTABLE_STATUSES.includes(status);
}

function normalizeComment(value, status) {
  const comment = normalizeName(value, 30);

  if (!comment || !canHaveComment(status)) {
    return null;
  }

  return comment;
}

function getAvatarById(id) {
  return AVATAR_OPTIONS.find((avatar) => avatar.id === id) || AVATAR_OPTIONS[0];
}

function normalizeSuggestion(value, status, resposta) {
  const suggestion = normalizeName(value, 40);

  if (!suggestion) {
    return null;
  }

  if (status !== '🗺️ Vamo pra outro lugar' || resposta !== 'Bora') {
    return null;
  }

  return suggestion;
}

function formatDateTime(value) {
  if (typeof value === 'string') {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);

    if (match) {
      return `${match[3]}/${match[2]}, ${match[4]}:${match[5]}`;
    }
  }

  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

function dbTimestampToDate(value) {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'string') {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);

    if (match) {
      return new Date(Date.UTC(
        Number(match[1]),
        Number(match[2]) - 1,
        Number(match[3]),
        Number(match[4]) + 3,
        Number(match[5]),
        Number(match[6] || 0)
      ));
    }
  }

  return new Date(value);
}

function getRoleExpiration(role) {
  const createdAt = dbTimestampToDate(role.criado_em);
  const expiresAt = new Date(createdAt.getTime() + ROLE_EXPIRES_AFTER_HOURS * 60 * 60 * 1000);
  const isExpired = role.encerrado || Date.now() >= expiresAt.getTime();

  return {
    expiresAt,
    expiresAtLabel: formatDateTime(expiresAt),
    isExpired
  };
}

async function getLatestVotes(roleId) {
  const result = await query(`
    SELECT DISTINCT ON (v.participante_id)
      v.id,
      v.nota,
      v.status,
      v.anonimo,
      v.criado_em,
      p.nome AS participante_nome,
      p.avatar AS participante_avatar
    FROM votos v
    JOIN participantes p ON p.id = v.participante_id
    WHERE v.role_id = $1
    ORDER BY v.participante_id, v.criado_em DESC, v.id DESC
  `, [roleId]);

  return result.rows;
}

async function getLatestParticipantVote(roleId, participanteId) {
  const result = await query(`
    SELECT criado_em
    FROM votos
    WHERE role_id = $1 AND participante_id = $2
    ORDER BY criado_em DESC, id DESC
    LIMIT 1
  `, [roleId, participanteId]);

  return result.rows[0] || null;
}

async function getRecentVotes(roleId, participanteId) {
  const result = await query(`
    SELECT
      v.id,
      v.participante_id,
      v.status,
      v.nota,
      v.comentario,
      v.anonimo,
      v.criado_em,
      p.nome AS participante_nome,
      p.avatar AS participante_avatar
    FROM votos v
    JOIN participantes p ON p.id = v.participante_id
    WHERE v.role_id = $1
    ORDER BY v.criado_em DESC, v.id DESC
    LIMIT 8
  `, [roleId]);

  const votes = result.rows.map((vote) => ({
    ...vote,
    horario: formatDateTime(vote.criado_em),
    quickPollOptions: getQuickPollOptions(vote.status),
    quickPollCounts: {},
    quickPollUserResponse: null
  }));

  const quickPollIds = votes
    .filter((vote) => vote.quickPollOptions)
    .map((vote) => vote.id);

  if (quickPollIds.length === 0) {
    return votes;
  }

  const counts = await query(`
    SELECT voto_id, resposta, COUNT(*)::int AS total
    FROM sinal_respostas
    WHERE voto_id = ANY($1::int[])
    GROUP BY voto_id, resposta
  `, [quickPollIds]);

  counts.rows.forEach((row) => {
    const vote = votes.find((item) => item.id === row.voto_id);

    if (vote) {
      vote.quickPollCounts[row.resposta] = row.total;
    }
  });

  if (participanteId) {
    const userResponses = await query(`
      SELECT voto_id, resposta, sugestao
      FROM sinal_respostas
      WHERE voto_id = ANY($1::int[]) AND participante_id = $2
    `, [quickPollIds, participanteId]);

    userResponses.rows.forEach((row) => {
      const vote = votes.find((item) => item.id === row.voto_id);

      if (vote) {
        vote.quickPollUserResponse = row.resposta;
        vote.quickPollUserSuggestion = row.sugestao;
      }
    });
  }

  const suggestions = await query(`
    SELECT id, voto_id, participante_id, sugestao
    FROM sinal_respostas
    WHERE voto_id = ANY($1::int[])
      AND sugestao IS NOT NULL
    ORDER BY criado_em DESC
  `, [quickPollIds]);

  suggestions.rows.forEach((row) => {
    const vote = votes.find((item) => item.id === row.voto_id);

    if (vote) {
      vote.quickPollSuggestions = vote.quickPollSuggestions || [];
      vote.quickPollSuggestions.push({
        id: row.id,
        participante_id: row.participante_id,
        texto: row.sugestao,
        positivos: 0,
        negativos: 0,
        userVote: null
      });
    }
  });

  const suggestionIds = suggestions.rows.map((row) => row.id);

  if (suggestionIds.length > 0) {
    const suggestionVotes = await query(`
      SELECT sinal_resposta_id, valor, COUNT(*)::int AS total
      FROM sugestao_votos
      WHERE sinal_resposta_id = ANY($1::int[])
      GROUP BY sinal_resposta_id, valor
    `, [suggestionIds]);

    suggestionVotes.rows.forEach((row) => {
      votes.forEach((vote) => {
        const suggestion = vote.quickPollSuggestions
          && vote.quickPollSuggestions.find((item) => item.id === row.sinal_resposta_id);

        if (suggestion && row.valor === 1) {
          suggestion.positivos = row.total;
        }

        if (suggestion && row.valor === -1) {
          suggestion.negativos = row.total;
        }
      });
    });

    if (participanteId) {
      const userSuggestionVotes = await query(`
        SELECT sinal_resposta_id, valor
        FROM sugestao_votos
        WHERE sinal_resposta_id = ANY($1::int[])
          AND participante_id = $2
      `, [suggestionIds, participanteId]);

      userSuggestionVotes.rows.forEach((row) => {
        votes.forEach((vote) => {
          const suggestion = vote.quickPollSuggestions
            && vote.quickPollSuggestions.find((item) => item.id === row.sinal_resposta_id);

          if (suggestion) {
            suggestion.userVote = row.valor;
          }
        });
      });
    }
  }

  return votes;
}

async function findSignalVote(roleId, voteId) {
  const result = await query(`
    SELECT id, role_id, participante_id, status
    FROM votos
    WHERE role_id = $1 AND id = $2
  `, [roleId, voteId]);

  return result.rows[0] || null;
}

async function findSuggestion(roleId, suggestionId) {
  const result = await query(`
    SELECT sr.id, sr.role_id, sr.participante_id, sr.sugestao, v.status
    FROM sinal_respostas sr
    JOIN votos v ON v.id = sr.voto_id
    WHERE sr.role_id = $1
      AND sr.id = $2
      AND sr.sugestao IS NOT NULL
  `, [roleId, suggestionId]);

  return result.rows[0] || null;
}

async function getLatestParticipantComment(roleId, participanteId, status) {
  const result = await query(`
    SELECT criado_em
    FROM votos
    WHERE role_id = $1
      AND participante_id = $2
      AND status = $3
      AND comentario IS NOT NULL
    ORDER BY criado_em DESC, id DESC
    LIMIT 1
  `, [roleId, participanteId, status]);

  return result.rows[0] || null;
}

app.get('/', requireCreator, (req, res) => {
  res.redirect('/dashboard');
});

app.get('/login', (req, res) => {
  if (isCreatorLoggedIn(req)) {
    return res.redirect('/dashboard');
  }

  return res.render('login', { erro: null });
});

app.post('/login', (req, res) => {
  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '');

  if (username === CREATOR_USERNAME && password === CREATOR_PASSWORD) {
    req.session.creatorLoggedIn = true;
    return res.redirect('/dashboard');
  }

  return res.status(401).render('login', { erro: 'Usuario ou senha invalidos.' });
});

app.post('/logout', (req, res) => {
  req.session.creatorLoggedIn = false;
  return res.redirect('/login');
});

app.get('/dashboard', requireCreator, async (req, res) => {
  try {
    const roles = await getCreatorRoles();
    return res.render('dashboard', { roles });
  } catch (error) {
    console.error(error);
    return renderError(res, 'Nao foi possivel carregar sua area agora.', 500);
  }
});

app.get('/dashboard/role/:codigo', requireCreator, async (req, res) => {
  const codigo = req.params.codigo.toUpperCase();

  try {
    const details = await getCreatorRoleDetails(codigo);

    if (!details) {
      return renderError(res, 'Role nao encontrado.', 404);
    }

    return res.render('dashboard_role', {
      ...details,
      avatarOptions: AVATAR_OPTIONS,
      aviso: consumeFlash(req)
    });
  } catch (error) {
    console.error(error);
    return renderError(res, 'Nao foi possivel carregar a moderacao agora.', 500);
  }
});

app.post('/dashboard/role/:codigo/encerrar', requireCreator, async (req, res) => {
  const codigo = req.params.codigo.toUpperCase();

  try {
    const role = await findRoleByCode(codigo);

    if (!role) {
      return renderError(res, 'Role nao encontrado.', 404);
    }

    await query('UPDATE roles SET encerrado = TRUE WHERE id = $1', [role.id]);
    setFlash(req, 'Role encerrado. Ninguem novo entra ou vota agora.');
    return res.redirect(`/dashboard/role/${role.codigo}`);
  } catch (error) {
    console.error(error);
    return renderError(res, 'Nao foi possivel encerrar o role agora.', 500);
  }
});

app.post('/dashboard/role/:codigo/reabrir', requireCreator, async (req, res) => {
  const codigo = req.params.codigo.toUpperCase();

  try {
    const role = await findRoleByCode(codigo);

    if (!role) {
      return renderError(res, 'Role nao encontrado.', 404);
    }

    await query('UPDATE roles SET encerrado = FALSE WHERE id = $1', [role.id]);
    setFlash(req, 'Role reaberto se ainda estiver dentro das 24 horas.');
    return res.redirect(`/dashboard/role/${role.codigo}`);
  } catch (error) {
    console.error(error);
    return renderError(res, 'Nao foi possivel reabrir o role agora.', 500);
  }
});

app.post('/dashboard/role/:codigo/participante/:participanteId/remover', requireCreator, async (req, res) => {
  const codigo = req.params.codigo.toUpperCase();
  const participanteId = Number(req.params.participanteId);

  try {
    const role = await findRoleByCode(codigo);

    if (!role) {
      return renderError(res, 'Role nao encontrado.', 404);
    }

    if (!Number.isInteger(participanteId)) {
      return renderError(res, 'Participante invalido.');
    }

    await query('DELETE FROM participantes WHERE role_id = $1 AND id = $2', [role.id, participanteId]);
    setFlash(req, 'Participante removido junto com as avaliacoes dele.');
    return res.redirect(`/dashboard/role/${role.codigo}`);
  } catch (error) {
    console.error(error);
    return renderError(res, 'Nao foi possivel remover esse participante agora.', 500);
  }
});

app.post('/dashboard/role/:codigo/voto/:votoId/remover', requireCreator, async (req, res) => {
  const codigo = req.params.codigo.toUpperCase();
  const votoId = Number(req.params.votoId);

  try {
    const role = await findRoleByCode(codigo);

    if (!role) {
      return renderError(res, 'Role nao encontrado.', 404);
    }

    if (!Number.isInteger(votoId)) {
      return renderError(res, 'Avaliacao invalida.');
    }

    await query('DELETE FROM votos WHERE role_id = $1 AND id = $2', [role.id, votoId]);
    setFlash(req, 'Avaliacao ou sinal removido.');
    return res.redirect(`/dashboard/role/${role.codigo}`);
  } catch (error) {
    console.error(error);
    return renderError(res, 'Nao foi possivel remover essa avaliacao agora.', 500);
  }
});

app.post('/roles', requireCreator, async (req, res) => {
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

    const participante = await ensureSessionParticipant(req, role.id);
    const latestVotes = await getLatestVotes(role.id);
    const recentes = await getRecentVotes(role.id, participante && participante.participante_id);
    const participantes = participante ? await getRoleParticipants(role.id) : [];
    const termometro = calculateThermometer(latestVotes);
    const shareUrl = `${req.protocol}://${req.get('host')}/role/${role.codigo}`;
    const expiration = getRoleExpiration(role);

    return res.render('role', {
      role,
      participante,
      participantes,
      expiration,
      creatorLoggedIn: isCreatorLoggedIn(req),
      aviso: consumeFlash(req),
      statusList: STATUS_LIST,
      sensitiveStatuses: SENSITIVE_STATUSES,
      commentableStatuses: COMMENTABLE_STATUSES,
      avatarOptions: AVATAR_OPTIONS,
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
  const avatar = getAvatarById(req.body.avatar);

  if (!nome) {
    return renderError(res, 'Digite seu nome ou apelido para entrar no role.');
  }

  try {
    const role = await findRoleByCode(codigo);

    if (!role) {
      return renderError(res, 'Role nao encontrado.', 404);
    }

    if (getRoleExpiration(role).isExpired) {
      return renderError(res, 'Este role ja encerrou e nao aceita novos participantes.', 403);
    }

    const result = await query(
      'INSERT INTO participantes (role_id, nome, avatar) VALUES ($1, $2, $3) RETURNING id, nome, avatar',
      [role.id, nome, avatar.id]
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
  const nota = normalizeScore(req.body.nota);
  const comentario = normalizeComment(req.body.comentario, status);
  let anonimo = req.body.anonimo === 'true' || req.body.anonimo === 'on';

  if (FORCE_ANONYMOUS_STATUSES.includes(status)) {
    anonimo = true;
  }

  try {
    const role = await findRoleByCode(codigo);

    if (!role) {
      return renderError(res, 'Role nao encontrado.', 404);
    }

    if (getRoleExpiration(role).isExpired) {
      return renderError(res, 'Este role ja encerrou e nao aceita novos votos.', 403);
    }

    const participante = await ensureSessionParticipant(req, role.id);

    if (!participante || participante.role_id !== role.id) {
      return renderError(res, 'Entre no role antes de votar.', 403);
    }

    if (nota === null) {
      return renderError(res, 'Escolha uma nota de 0 a 100 para o role.');
    }

    if (status && !STATUS_LIST.includes(status)) {
      return renderError(res, 'Escolha um sinal valido para o role.');
    }

    if (String(req.body.comentario || '').trim() && !canHaveComment(status)) {
      return renderError(res, 'Comentario curto so esta disponivel em alguns sinais.');
    }

    if (comentario && status === '👀 Tem uma pessoa me encarando') {
      const latestComment = await getLatestParticipantComment(role.id, participante.participante_id, status);

      if (latestComment) {
        const elapsedMs = Date.now() - dbTimestampToDate(latestComment.criado_em).getTime();
        const cooldownMs = COMMENT_COOLDOWN_MINUTES * 60 * 1000;

        if (elapsedMs < cooldownMs) {
          const remainingMinutes = Math.ceil((cooldownMs - elapsedMs) / 60000);
          setFlash(req, `Calma ai calabreso, comenta daqui ${remainingMinutes} minutos.`);
          return res.redirect(`/role/${role.codigo}`);
        }
      }
    }

    if (VOTE_COOLDOWN_ENABLED) {
      const latestVote = await getLatestParticipantVote(role.id, participante.participante_id);

      if (latestVote) {
        const elapsedMs = Date.now() - dbTimestampToDate(latestVote.criado_em).getTime();
        const cooldownMs = VOTE_COOLDOWN_MINUTES * 60 * 1000;

        if (elapsedMs < cooldownMs) {
          const remainingMinutes = Math.ceil((cooldownMs - elapsedMs) / 60000);
          setFlash(req, `Calma ai calabreso, vota daqui ${remainingMinutes} minutos.`);
          return res.redirect(`/role/${role.codigo}`);
        }
      }
    }

    await query(
      'INSERT INTO votos (role_id, participante_id, nota, status, comentario, anonimo) VALUES ($1, $2, $3, $4, $5, $6)',
      [role.id, participante.participante_id, nota, status || null, comentario, anonimo]
    );

    return res.redirect(`/role/${role.codigo}`);
  } catch (error) {
    console.error(error);
    return renderError(res, 'Nao foi possivel registrar seu voto agora.', 500);
  }
});

app.post('/role/:codigo/sinal/:votoId/responder', async (req, res) => {
  const codigo = req.params.codigo.toUpperCase();
  const votoId = Number(req.params.votoId);
  const resposta = String(req.body.resposta || '').trim();
  const sugestao = normalizeName(req.body.sugestao, 40);

  try {
    const role = await findRoleByCode(codigo);

    if (!role) {
      return renderError(res, 'Role nao encontrado.', 404);
    }

    if (getRoleExpiration(role).isExpired) {
      return renderError(res, 'Este role ja encerrou e nao aceita novas interacoes.', 403);
    }

    const participante = await ensureSessionParticipant(req, role.id);

    if (!participante || participante.role_id !== role.id) {
      return renderError(res, 'Entre no role antes de responder.', 403);
    }

    if (!Number.isInteger(votoId)) {
      return renderError(res, 'Sinal invalido.');
    }

    const signalVote = await findSignalVote(role.id, votoId);

    if (!signalVote) {
      return renderError(res, 'Sinal nao encontrado.', 404);
    }

    if (signalVote.participante_id === participante.participante_id) {
      return renderError(res, 'Outras pessoas podem responder esse sinal.', 403);
    }

    const options = getQuickPollOptions(signalVote.status);

    if (!options || !options.includes(resposta)) {
      return renderError(res, 'Resposta invalida para esse sinal.');
    }

    const sugestaoFinal = normalizeSuggestion(sugestao, signalVote.status, resposta);

    await query(`
      INSERT INTO sinal_respostas (voto_id, role_id, participante_id, resposta, sugestao)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (voto_id, participante_id)
      DO NOTHING
    `, [signalVote.id, role.id, participante.participante_id, resposta, sugestaoFinal]);

    return res.redirect(`/role/${role.codigo}`);
  } catch (error) {
    console.error(error);
    return renderError(res, 'Nao foi possivel responder esse sinal agora.', 500);
  }
});

app.post('/role/:codigo/sugestao/:sugestaoId/votar', async (req, res) => {
  const codigo = req.params.codigo.toUpperCase();
  const sugestaoId = Number(req.params.sugestaoId);
  const valor = Number(req.body.valor);

  try {
    const role = await findRoleByCode(codigo);

    if (!role) {
      return renderError(res, 'Role nao encontrado.', 404);
    }

    if (getRoleExpiration(role).isExpired) {
      return renderError(res, 'Este role ja encerrou e nao aceita novas interacoes.', 403);
    }

    const participante = await ensureSessionParticipant(req, role.id);

    if (!participante || participante.role_id !== role.id) {
      return renderError(res, 'Entre no role antes de votar em sugestoes.', 403);
    }

    if (!Number.isInteger(sugestaoId) || ![-1, 1].includes(valor)) {
      return renderError(res, 'Voto de sugestao invalido.');
    }

    const suggestion = await findSuggestion(role.id, sugestaoId);

    if (!suggestion) {
      return renderError(res, 'Sugestao nao encontrada.', 404);
    }

    if (suggestion.participante_id === participante.participante_id) {
      return renderError(res, 'Outras pessoas podem votar na sua sugestao.', 403);
    }

    await query(`
      INSERT INTO sugestao_votos (sinal_resposta_id, role_id, participante_id, valor)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (sinal_resposta_id, participante_id)
      DO NOTHING
    `, [suggestion.id, role.id, participante.participante_id, valor]);

    return res.redirect(`/role/${role.codigo}`);
  } catch (error) {
    console.error(error);
    return renderError(res, 'Nao foi possivel votar nessa sugestao agora.', 500);
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

module.exports = { app, calculateThermometer, STATUS_LIST, formatDateTime, getRoleExpiration, QUICK_POLL_OPTIONS, AVATAR_OPTIONS };
