const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { createRequire } = require('module');
const { validateProductionConfig, createRateLimiter } = require('../security');

test('production refuses missing and example secrets without revealing their values', () => {
  assert.throws(() => validateProductionConfig({ NODE_ENV: 'production' }), /DATABASE_URL/);
  const env = { NODE_ENV: 'production', DATABASE_URL: 'postgres://test', CREATOR_USERNAME: 'owner',
    CREATOR_PASSWORD: 'troque-essa-senha', SESSION_SECRET: 'x'.repeat(32) };
  assert.throws(() => validateProductionConfig(env), /CREATOR_PASSWORD/);
  env.CREATOR_PASSWORD = 'test-password-123456';
  assert.doesNotThrow(() => validateProductionConfig(env));
  assert.doesNotThrow(() => validateProductionConfig({ NODE_ENV: 'development' }));
});

test('rate limits isolate keys and expire instead of permanently blocking', () => {
  let now = 1000;
  const limiter = createRateLimiter({ limit: 2, windowMs: 10000, key: (req) => req.ip,
    message: 'wait', now: () => now });
  let allowed = 0;
  let status;
  const res = { set() {}, status(value) { status = value; return this; }, render() {} };
  const run = (ip) => limiter({ ip }, res, () => allowed++);
  run('a'); run('a'); run('a');
  assert.equal(allowed, 2);
  assert.equal(status, 429);
  run('b');
  assert.equal(allowed, 3);
  now += 10000;
  run('a');
  assert.equal(allowed, 4);
});

function loadApp() {
  const filename = path.resolve(__dirname, '../server.js');
  const realRequire = createRequire(filename);
  const queries = [];
  const statements = [];
  const fakePool = { query: async (sql, params) => {
    queries.push(sql);
    statements.push({ sql, params });
    if (sql.includes('SELECT id, role_id, participante_id, status')) return {
      rowCount: 1, rows: [{ id: params[1], role_id: 1, participante_id: 2,
        status: params[1] === 99 ? '🗺️ Vamo pra outro lugar' : '🗺️ Bora pra outro lugar?' }]
    };
    if (sql.includes('FROM roles WHERE codigo')) return { rowCount: 1, rows: [
      { id: 1, codigo: 'TEST01', nome: 'Test', criado_em: new Date(), encerrado: false }
    ] };
    if (sql.includes('SELECT id, nome, avatar FROM participantes') || sql.includes('INSERT INTO participantes')) return {
      rowCount: 1, rows: [{ id: 1, nome: 'Tester', avatar: 'barbudo' }]
    };
    return { rowCount: 0, rows: [] };
  } };
  const mockRequire = (name) => {
    if (name === 'dotenv') return { config() {} };
    if (name === 'pg') return { Pool: function () { return fakePool; }, types: { setTypeParser() {} } };
    return realRequire(name);
  };
  const module = { exports: {} };
  vm.runInNewContext(fs.readFileSync(filename, 'utf8'), { require: mockRequire, module,
    __dirname: path.dirname(filename), console, URL, Buffer,
    process: { env: { NODE_ENV: 'test', CREATOR_USERNAME: 'owner', CREATOR_PASSWORD: 'test-password' } }
  }, { filename });
  return { ...module.exports, queries, statements };
}

test('HTTP protections preserve login and voting while blocking forged requests', async (t) => {
  const { app, queries, statements } = loadApp();
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  let cookie = '';
  let token;
  const request = async (route, body) => {
    const response = await fetch(base + route, { method: body ? 'POST' : 'GET', redirect: 'manual',
      headers: { ...(cookie ? { Cookie: cookie } : {}), ...(body ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}) },
      body: body ? new URLSearchParams(body).toString() : undefined });
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) cookie = setCookie.split(';')[0];
    return response;
  };
  const getToken = async () => {
    const response = await request('/login');
    token = (await response.text()).match(/name="_csrf" value="([a-f0-9]+)"/)[1];
    return response;
  };
  const login = await getToken();
  assert.equal(login.headers.get('x-powered-by'), null);
  assert.equal(login.headers.get('x-frame-options'), 'DENY');
  assert.equal(login.headers.get('cache-control'), 'no-store');
  assert.match(login.headers.get('content-security-policy'), /form-action 'self'/);
  assert.equal((await request('/login', { username: 'owner', password: 'test-password' })).status, 403);
  assert.equal((await request('/roles', { _csrf: 'a'.repeat(64), nome: 'Forged' })).status, 403);
  const cookieBeforeLogin = cookie;
  assert.equal((await request('/login', { _csrf: token, username: 'owner', password: 'test-password' })).status, 302);
  assert.notEqual(cookie, cookieBeforeLogin);
  assert.equal((await request('/dashboard')).status, 200);
  const moderation = await request('/dashboard/role/TEST01');
  assert.equal(moderation.status, 200);
  assert.match(await moderation.text(), /name="_csrf"/);
  assert.equal((await request('/logout', { _csrf: token })).status, 403);
  const dashboard = await request('/dashboard');
  token = (await dashboard.text()).match(/name="_csrf" value="([a-f0-9]+)"/)[1];
  assert.equal((await request('/logout', { _csrf: token })).status, 302);
  assert.equal((await request('/dashboard')).status, 302);
  await getToken();
  const invitation = await request('/role/TEST01');
  assert.equal(invitation.status, 200);
  assert.match(await invitation.text(), /name="_csrf"/);
  assert.equal((await request('/roles', { _csrf: token, nome: 'Unauthorized' })).status, 302);
  assert.equal((await request('/role/TEST01/entrar', { _csrf: token, nome: 'x'.repeat(61) })).status, 400);
  assert.equal((await request('/role/TEST01/entrar', { _csrf: token, nome: 'Tester', avatar: 'barbudo' })).status, 302);
  const participantPage = await request('/role/TEST01');
  assert.equal(participantPage.status, 200);
  assert.match(await participantPage.text(), /id="voteForm"/);
  const page = await request('/role/TEST01');
  const html = await page.text();
  assert.match(html, /Cheguei agora/);
  assert.match(html, /Saída/);
  assert.doesNotMatch(html, /pantera|Que pancada|Vamo pegar bebida/);
  for (const nota of ['', ' ', '101', '-1', '1.5', 'NaN']) {
    assert.equal((await request('/role/TEST01/votar', { _csrf: token, nota })).status, 400, `invalid score ${nota}`);
  }
  assert.equal(queries.some((sql) => sql.includes('INSERT INTO votos')), false);
  assert.equal((await request('/role/TEST01/votar', { _csrf: token, nota: '0' })).status, 302);
  assert.equal((await request('/role/TEST01/votar', { _csrf: token, nota: '100' })).status, 302);
  assert.equal((await request('/role/TEST01/votar', { _csrf: token, nota: '80', status: '📍 Cheguei agora' })).status, 302);
  assert.equal((await request('/role/TEST01/votar', { _csrf: token, nota: '80', status: '🍺 Vamo pegar bebida' })).status, 400);
  assert.equal((await request('/role/TEST01/votar', { _csrf: token, nota: '80',
    status: '👀 Tem alguém me incomodando', comentario: 'perto da entrada', anonimo: 'false' })).status, 302);
  const anonymousVote = statements.filter(({ sql }) => sql.includes('INSERT INTO votos')).at(-1);
  assert.equal(anonymousVote.params[5], true);
  assert.ok(statements.some(({ sql, params }) => sql.includes('comentario IS NOT NULL') && params[2] === '👀 Tem alguém me incomodando'));
  for (const id of [10, 99]) {
    assert.equal((await request(`/role/TEST01/sinal/${id}/responder`, { _csrf: token,
      resposta: 'Bora', sugestao: 'Bar da esquina' })).status, 302);
    const response = statements.filter(({ sql }) => sql.includes('INSERT INTO sinal_respostas')).at(-1);
    assert.ok(response.params.includes('Bar da esquina'));
  }
  assert.equal((await request('/role/TEST01/votar', { _csrf: token, nota: ['1', '2'] })).status, 400);
  assert.equal((await request('/login', { _csrf: token, password: 'x'.repeat(17000) })).status, 413);
  assert.equal((await request('/dashboard/role/TEST01/voto/abc/remover', { _csrf: token })).status, 400);
  for (let attempt = 0; attempt < 5; attempt++) {
    assert.equal((await request('/login', { _csrf: token, username: 'invalid', password: 'wrong' })).status, 401);
  }
  const limited = await request('/login', { _csrf: token, username: ' invalid ', password: 'wrong' });
  assert.equal(limited.status, 429);
  assert.ok(Number(limited.headers.get('retry-after')) > 0);
});

test('every POST form includes a session-bound token', () => {
  const directory = path.resolve(__dirname, '../views');
  for (const name of fs.readdirSync(directory).filter((name) => name.endsWith('.ejs'))) {
    const source = fs.readFileSync(path.join(directory, name), 'utf8');
    const forms = [...source.matchAll(/<form\b[^\n]*method="POST"[\s\S]*?<\/form>/g)];
    assert.equal(forms.length, (source.match(/method="POST"/g) || []).length, name);
    for (const form of forms) {
      assert.match(form[0], /name="_csrf" value="<%= csrfToken %>"/, name);
    }
    require('ejs').compile(source, { filename: name });
  }
});
