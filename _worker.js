export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      return handleAPI(request, env);
    }

    return env.ASSETS.fetch(request);
  }
};

// ============================================================================
// Auth helpers
// ============================================================================

// HMAC-SHA256 signature (base64url)
async function hmacSign(secret, data) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// SHA-256 hex
async function sha256Hex(str) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Issue a signed token: base64url(payload).signature
async function issueToken(env, username) {
  const secret = env.ADMIN_TOKEN_SECRET || 'change-me-stackhk-secret';
  const expiry = Date.now() + (parseInt(env.ADMIN_TOKEN_TTL || '86400000', 10)); // 24h default
  const payload = JSON.stringify({ username, exp: expiry });
  const payloadB64 = btoa(unescape(encodeURIComponent(payload)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const sig = await hmacSign(secret, payloadB64);
  return `${payloadB64}.${sig}`;
}

// Verify a signed token; returns payload object or null
async function verifyToken(env, token) {
  if (!token) return null;
  const secret = env.ADMIN_TOKEN_SECRET || 'change-me-stackhk-secret';
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, sig] = parts;
  const expected = await hmacSign(secret, payloadB64);
  if (expected !== sig) return null;
  try {
    const payload = JSON.parse(decodeURIComponent(escape(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')))));
    if (!payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

// Extract bearer token from Authorization header
function getBearerToken(request) {
  const auth = request.headers.get('Authorization') || '';
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

// Require valid token for write operations
async function requireAuth(request, env) {
  const token = getBearerToken(request);
  const payload = await verifyToken(env, token);
  return payload;
}

// ============================================================================
// API router
// ============================================================================
function handleAPI(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === '/api/auth') return handleAuthAPI(request, env);
  if (path === '/api/auth/verify') return handleVerifyAPI(request, env);
  if (path === '/api/secrets') return handleSecretsAPI(request, env);
  if (path === '/api/templates') return handleTemplatesAPI(request, env);
  if (path === '/api/pages') return handlePagesAPI(request, env);
  if (path.startsWith('/api/data/')) return handleDataAPI(request, env, path);

  return json({ error: 'Not Found' }, 404);
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}

// ============================================================================
// Auth API
// ============================================================================
async function handleAuthAPI(request, env) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return json({ error: 'Missing username or password' }, 400);
    }

    const expectedUser = env.ADMIN_USERNAME || 'Stackhk007';
    // Compare SHA-256 hash of the provided password against the stored hash.
    const expectedHash = env.ADMIN_PASSWORD_HASH;
    const providedHash = await sha256Hex(password);

    const userOk = username === expectedUser;
    const passOk = expectedHash
      ? (providedHash === expectedHash)
      : (providedHash === 'e66d98212d93ebfb4d2eda348354d1773d2d4310323bf2700f2a4e922e79bfc3');

    if (!userOk || !passOk) {
      return json({ error: 'Invalid credentials' }, 401);
    }

    const token = await issueToken(env, username);
    return json({
      success: true,
      token,
      user: { username, name: 'StackHK Admin', role: 'Administrator' }
    });
  } catch (e) {
    return json({ error: 'Invalid JSON body' }, 400);
  }
}

async function handleVerifyAPI(request, env) {
  const payload = await requireAuth(request, env);
  if (!payload) return json({ valid: false }, 401);
  return json({ valid: true, username: payload.username });
}

// ============================================================================
// Secrets API — stores API keys on the server (KV), auth required for both read & write
// ============================================================================
async function handleSecretsAPI(request, env) {
  const auth = await requireAuth(request, env);
  if (!auth) return json({ error: 'Unauthorized' }, 401);

  const kvPrefix = 'secret:';

  if (request.method === 'GET') {
    const list = await env.STACKHK.list({ prefix: kvPrefix });
    const secrets = {};
    for (const key of list.keys) {
      const raw = await env.STACKHK.get(key.name, 'text');
      if (raw) secrets[key.name.replace(kvPrefix, '')] = raw;
    }
    return json(secrets);
  }

  if (request.method === 'POST') {
    try {
      const body = await request.json();
      if (!body || typeof body !== 'object') return json({ error: 'Expected object of key->value pairs' }, 400);
      // Upsert each secret
      for (const [name, value] of Object.entries(body)) {
        if (value === null || value === undefined) {
          await env.STACKHK.delete(kvPrefix + name);
        } else {
          await env.STACKHK.put(kvPrefix + name, String(value));
        }
      }
      return json({ success: true });
    } catch (e) {
      return json({ error: 'Invalid JSON body' }, 400);
    }
  }

  if (request.method === 'DELETE') {
    try {
      const { key } = await request.json();
      if (!key) return json({ error: 'Missing key' }, 400);
      await env.STACKHK.delete(kvPrefix + key);
      return json({ success: true });
    } catch (e) {
      return json({ error: 'Invalid JSON body' }, 400);
    }
  }

  return json({ error: 'Method not allowed' }, 405);
}

// ============================================================================
// Templates API
// ============================================================================
async function handleTemplatesAPI(request, env) {
  if (request.method === 'GET') {
    const [header, footer, nav] = await Promise.all([
      env.STACKHK.get('template:header', 'text'),
      env.STACKHK.get('template:footer', 'text'),
      env.STACKHK.get('template:nav', 'text')
    ]);
    return json({ header: header || '', footer: footer || '', nav: nav || '' });
  }

  if (request.method === 'POST') {
    const auth = await requireAuth(request, env);
    if (!auth) return json({ error: 'Unauthorized' }, 401);
    try {
      const { key, content } = await request.json();
      if (!key || content === undefined) return json({ error: 'Missing key or content' }, 400);
      const kvKey = key.startsWith('template:') ? key : `template:${key}`;
      await env.STACKHK.put(kvKey, content);
      return json({ success: true });
    } catch (e) {
      return json({ error: 'Invalid JSON body' }, 400);
    }
  }

  return json({ error: 'Method not allowed' }, 405);
}

// ============================================================================
// Pages API
// ============================================================================
async function handlePagesAPI(request, env) {
  if (request.method === 'GET') {
    const list = await env.STACKHK.list({ prefix: 'page:' });
    const pages = await Promise.all(
      list.keys.map(async (key) => {
        const content = await env.STACKHK.get(key.name, 'text');
        return { key: key.name, content: content || '' };
      })
    );
    return json(pages);
  }

  if (request.method === 'POST') {
    const auth = await requireAuth(request, env);
    if (!auth) return json({ error: 'Unauthorized' }, 401);
    try {
      const { key, content } = await request.json();
      if (!key || content === undefined) return json({ error: 'Missing key or content' }, 400);
      const kvKey = key.startsWith('page:') ? key : `page:${key}`;
      await env.STACKHK.put(kvKey, content);
      return json({ success: true });
    } catch (e) {
      return json({ error: 'Invalid JSON body' }, 400);
    }
  }

  return json({ error: 'Method not allowed' }, 405);
}

// ============================================================================
// Data CRUD API
// ============================================================================
async function handleDataAPI(request, env, path) {
  const parts = path.replace('/api/data/', '').split('/');
  const collection = parts[0];
  const id = parts[1];
  if (!collection) return json({ error: 'Missing collection' }, 400);
  const kvPrefix = `data:${collection}:`;

  // GET — read (public, no auth required for reading review content)
  if (request.method === 'GET' && !id) {
    const list = await env.STACKHK.list({ prefix: kvPrefix });
    const items = [];
    for (const key of list.keys) {
      const raw = await env.STACKHK.get(key.name, 'text');
      if (raw) items.push(JSON.parse(raw));
    }
    return json(items);
  }

  if (request.method === 'GET' && id) {
    const raw = await env.STACKHK.get(kvPrefix + id, 'text');
    if (!raw) return json({ error: 'Not found' }, 404);
    return new Response(raw, { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
  }

  // All write operations require auth
  if (request.method === 'POST' && !id) {
    const auth = await requireAuth(request, env);
    if (!auth) return json({ error: 'Unauthorized' }, 401);
    try {
      const items = await request.json();
      if (!Array.isArray(items)) return json({ error: 'Expected array' }, 400);
      const existing = await env.STACKHK.list({ prefix: kvPrefix });
      for (const key of existing.keys) await env.STACKHK.delete(key.name);
      for (const item of items) {
        const itemId = item.id || item.slug || crypto.randomUUID();
        await env.STACKHK.put(kvPrefix + itemId, JSON.stringify(item));
      }
      return json({ success: true, count: items.length });
    } catch (e) {
      return json({ error: 'Invalid JSON body' }, 400);
    }
  }

  if ((request.method === 'PUT' || request.method === 'POST') && id) {
    const auth = await requireAuth(request, env);
    if (!auth) return json({ error: 'Unauthorized' }, 401);
    try {
      const item = await request.json();
      await env.STACKHK.put(kvPrefix + id, JSON.stringify(item));
      return json({ success: true });
    } catch (e) {
      return json({ error: 'Invalid JSON body' }, 400);
    }
  }

  if (request.method === 'DELETE' && id) {
    const auth = await requireAuth(request, env);
    if (!auth) return json({ error: 'Unauthorized' }, 401);
    await env.STACKHK.delete(kvPrefix + id);
    return json({ success: true });
  }

  return json({ error: 'Method not allowed' }, 405);
}
