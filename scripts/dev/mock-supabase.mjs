// Minimal in-memory stand-in for the parts of Supabase that RB uses (Auth with password, REST read,
// RPC rb_save_state). For local smoke tests only: no real security, nothing persists between runs.
//
//   node scripts/dev/mock-supabase.mjs            → http://127.0.0.1:54321
//   MOCK_CONFIRM_EMAIL=1 node scripts/dev/mock-supabase.mjs   → signup returns no session (confirmation on)
//
// Then run the app with NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_mock
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';

const PORT = Number(process.env.MOCK_PORT || 54321);
const CONFIRM_EMAIL = process.env.MOCK_CONFIRM_EMAIL === '1';
const users = new Map(); // email -> { id, email, password, confirmed }
const tokens = new Map(); // access_token -> user id
const rows = new Map(); // user id -> { payload, revision }
const log = (...parts) => console.log(new Date().toISOString().slice(11, 19), ...parts);

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Max-Age': '86400',
};
function send(res, status, body, extra = {}) {
  const text = body === undefined ? '' : typeof body === 'string' ? body : JSON.stringify(body);
  res.writeHead(status, { ...cors, 'Content-Type': 'application/json', ...extra });
  res.end(text);
}
function userJson(user) {
  const now = new Date().toISOString();
  return {
    id: user.id,
    aud: 'authenticated',
    role: 'authenticated',
    email: user.email,
    email_confirmed_at: user.confirmed ? now : null,
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: {},
    identities: [],
    created_at: now,
    updated_at: now,
  };
}
function session(user) {
  const access_token = `mock-${randomUUID()}`;
  tokens.set(access_token, user.id);
  return {
    access_token,
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    refresh_token: `refresh-${randomUUID()}`,
    user: userJson(user),
  };
}
function authError(res, status, code, msg) {
  send(res, status, { code: status, error_code: code, msg });
}
function bearer(req) {
  const header = req.headers.authorization || '';
  const token = header.replace(/^Bearer\s+/i, '');
  const id = tokens.get(token);
  return id ? [...users.values()].find((u) => u.id === id) : null;
}
async function body(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString('utf8');
  return text ? JSON.parse(text) : {};
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (req.method === 'OPTIONS') return send(res, 204);
  log(req.method, url.pathname + url.search);
  try {
    // ---- Auth -----------------------------------------------------------------------------
    if (url.pathname === '/auth/v1/signup' && req.method === 'POST') {
      const { email, password } = await body(req);
      if (!email || !password)
        return authError(res, 422, 'validation_failed', 'Email and password are required');
      if (users.has(email)) return authError(res, 422, 'user_already_exists', 'User already registered');
      if (password.length < 6)
        return authError(res, 422, 'weak_password', 'Password should be at least 6 characters');
      const user = { id: randomUUID(), email, password, confirmed: !CONFIRM_EMAIL };
      users.set(email, user);
      return send(res, 200, CONFIRM_EMAIL ? userJson(user) : session(user));
    }
    if (url.pathname === '/auth/v1/token' && req.method === 'POST') {
      const grant = url.searchParams.get('grant_type');
      const payload = await body(req);
      if (grant === 'password') {
        const user = users.get(payload.email);
        if (!user || user.password !== payload.password)
          return authError(res, 400, 'invalid_credentials', 'Invalid login credentials');
        if (!user.confirmed) return authError(res, 400, 'email_not_confirmed', 'Email not confirmed');
        return send(res, 200, session(user));
      }
      if (grant === 'refresh_token') {
        const user = [...users.values()][0];
        return user
          ? send(res, 200, session(user))
          : authError(res, 400, 'refresh_token_not_found', 'Invalid Refresh Token');
      }
      return authError(res, 400, 'unsupported_grant_type', 'Unsupported grant');
    }
    if (url.pathname === '/auth/v1/recover' && req.method === 'POST') return send(res, 200, {});
    if (url.pathname === '/auth/v1/logout' && req.method === 'POST') return send(res, 204);
    if (url.pathname === '/auth/v1/user') {
      const user = bearer(req);
      if (!user) return authError(res, 401, 'no_session', 'Invalid JWT');
      if (req.method === 'PUT') {
        const { password } = await body(req);
        if (password) {
          if (password === user.password)
            return authError(
              res,
              422,
              'same_password',
              'New password should be different from the old password.'
            );
          user.password = password;
        }
      }
      return send(res, 200, userJson(user));
    }
    // ---- REST ------------------------------------------------------------------------------
    if (url.pathname === '/rest/v1/rb_user_data' && req.method === 'GET') {
      const user = bearer(req);
      if (!user) return send(res, 401, { message: 'JWT required' });
      const row = rows.get(user.id);
      return send(res, 200, row ? [{ payload: row.payload, revision: row.revision }] : []);
    }
    if (url.pathname === '/rest/v1/rpc/rb_save_state' && req.method === 'POST') {
      const user = bearer(req);
      if (!user) return send(res, 401, { message: 'JWT required' });
      const { expected_revision, new_payload } = await body(req);
      const row = rows.get(user.id);
      if (expected_revision === 0) {
        if (row) return send(res, 400, { code: '40001', message: 'Conflicto de sincronización' });
        rows.set(user.id, { payload: new_payload, revision: 1 });
        return send(res, 200, '1');
      }
      if (!row || row.revision !== expected_revision)
        return send(res, 400, { code: '40001', message: 'Conflicto de sincronización' });
      rows.set(user.id, { payload: new_payload, revision: row.revision + 1 });
      return send(res, 200, String(row.revision + 1));
    }
    // ---- test helpers -------------------------------------------------------------------
    if (url.pathname === '/__mock/recovery-link' && req.method === 'GET') {
      // Builds the hash a real recovery email would carry (implicit flow) for the given email.
      const user = users.get(url.searchParams.get('email'));
      if (!user) return send(res, 404, { message: 'unknown user' });
      const s = session(user);
      return send(res, 200, {
        hash: `#access_token=${s.access_token}&expires_in=3600&refresh_token=${s.refresh_token}&token_type=bearer&type=recovery`,
      });
    }
    return send(res, 404, { message: `mock: no route for ${req.method} ${url.pathname}` });
  } catch (err) {
    log('error', err);
    return send(res, 500, { message: String(err) });
  }
});
server.listen(PORT, '127.0.0.1', () =>
  log(`mock supabase listening on http://127.0.0.1:${PORT} (confirm email: ${CONFIRM_EMAIL})`)
);
