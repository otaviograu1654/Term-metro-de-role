const crypto = require('crypto');

function validateProductionConfig(env) {
  if (env.NODE_ENV !== 'production') return;
  const invalid = [];
  if (!env.DATABASE_URL) invalid.push('DATABASE_URL');
  if (!env.CREATOR_USERNAME || !env.CREATOR_USERNAME.trim()) invalid.push('CREATOR_USERNAME');
  if (!env.CREATOR_PASSWORD || env.CREATOR_PASSWORD.length < 12
      || ['admin123', 'troque-essa-senha'].includes(env.CREATOR_PASSWORD)) invalid.push('CREATOR_PASSWORD');
  if (!env.SESSION_SECRET || env.SESSION_SECRET.length < 32
      || ['dev-secret-change-me', 'um_segredo_forte'].includes(env.SESSION_SECRET)) invalid.push('SESSION_SECRET');
  if (invalid.length) throw new Error(`Configure as variaveis obrigatorias de producao: ${invalid.join(', ')}.`);
}

function securityHeaders(req, res, next) {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; object-src 'none'"
  });
  if (req.secure) res.set('Strict-Transport-Security', 'max-age=31536000');
  next();
}

function csrfProtection(req, res, next) {
  if (!req.session.csrfToken) req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  res.locals.csrfToken = req.session.csrfToken;
  res.set('Cache-Control', 'no-store');
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const token = req.body && req.body._csrf;
  if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)
      || !crypto.timingSafeEqual(Buffer.from(token), Buffer.from(req.session.csrfToken))) {
    return res.status(403).render('erro', { mensagem: 'Sua sessao mudou ou expirou. Recarregue a pagina e tente novamente.' });
  }
  return next();
}

// Fixed windows, bounded storage, and no persistent participant tracking.
function createRateLimiter({ limit, windowMs, key, message, now = Date.now }) {
  const entries = new Map();
  return (req, res, next) => {
    const time = now();
    for (const [entryKey, entry] of entries) {
      if (entry.expires <= time) entries.delete(entryKey);
    }
    const entryKey = key(req);
    let entry = entries.get(entryKey);
    if (!entry) {
      if (entries.size >= 10000) {
        res.set('Retry-After', String(Math.ceil(windowMs / 1000)));
        return res.status(429).render('erro', { mensagem: message });
      }
      entry = { count: 0, expires: time + windowMs };
      entries.set(entryKey, entry);
    }
    entry.count += 1;
    if (entry.count > limit) {
      res.set('Retry-After', String(Math.ceil((entry.expires - time) / 1000)));
      return res.status(429).render('erro', { mensagem: message });
    }
    return next();
  };
}

function validateForm(req, res, next) {
  if (req.method !== 'POST') return next();
  const limits = {
    _csrf: 64, username: 60, password: 256,
    nome: /^\/role\/[^/]+\/entrar$/.test(req.path) ? 60 : 100,
    descricao: 280, tipo_role: 40, regras: 700, aviso_fixado: 180,
    local_nome: 120, endereco: 180, maps_url: 500, avatar: 40,
    nota: 3, status: 80, comentario: 30, anonimo: 5,
    resposta: 80, sugestao: 40, valor: 2
  };
  for (const [field, value] of Object.entries(req.body || {})) {
    if (!Object.hasOwn(limits, field) || typeof value !== 'string' || value.length > limits[field]) {
      return res.status(400).render('erro', { mensagem: 'Formulario invalido. Confira os campos e tente novamente.' });
    }
  }
  return next();
}

module.exports = { validateProductionConfig, securityHeaders, csrfProtection, createRateLimiter, validateForm };
