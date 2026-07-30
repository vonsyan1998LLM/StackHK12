export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // API routes
    if (url.pathname.startsWith('/api/')) {
      return handleAPI(request, env);
    }

    // All other requests: serve static files directly
    return env.ASSETS.fetch(request);
  }
};

function handleAPI(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === '/api/templates') return handleTemplatesAPI(request, env);
  if (path === '/api/pages') return handlePagesAPI(request, env);
  if (path.startsWith('/api/data/')) return handleDataAPI(request, env, path);
  if (path === '/api/auth') return handleAuthAPI(request, env);

  return new Response(JSON.stringify({ error: 'Not Found' }), {
    status: 404, headers: { 'Content-Type': 'application/json' }
  });
}

// --- Templates API ---
async function handleTemplatesAPI(request, env) {
  if (request.method === 'GET') {
    const [header, footer, nav] = await Promise.all([
      env.STACKHK.get('template:header', 'text'),
      env.STACKHK.get('template:footer', 'text'),
      env.STACKHK.get('template:nav', 'text')
    ]);
    return new Response(JSON.stringify({
      header: header || '',
      footer: footer || '',
      nav: nav || ''
    }), { headers: { 'Content-Type': 'application/json' } });
  }

  if (request.method === 'POST') {
    try {
      const { key, content } = await request.json();
      if (!key || content === undefined) {
        return new Response(JSON.stringify({ error: 'Missing key or content' }), {
          status: 400, headers: { 'Content-Type': 'application/json' }
        });
      }
      const kvKey = key.startsWith('template:') ? key : `template:${key}`;
      await env.STACKHK.put(kvKey, content);
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405, headers: { 'Content-Type': 'application/json' }
  });
}

// --- Pages API ---
async function handlePagesAPI(request, env) {
  if (request.method === 'GET') {
    const list = await env.STACKHK.list({ prefix: 'page:' });
    const pages = await Promise.all(
      list.keys.map(async (key) => {
        const content = await env.STACKHK.get(key.name, 'text');
        return { key: key.name, content: content || '' };
      })
    );
    return new Response(JSON.stringify(pages), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (request.method === 'POST') {
    try {
      const { key, content } = await request.json();
      if (!key || content === undefined) {
        return new Response(JSON.stringify({ error: 'Missing key or content' }), {
          status: 400, headers: { 'Content-Type': 'application/json' }
        });
      }
      const kvKey = key.startsWith('page:') ? key : `page:${key}`;
      await env.STACKHK.put(kvKey, content);
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405, headers: { 'Content-Type': 'application/json' }
  });
}

// --- Data CRUD API ---
async function handleDataAPI(request, env, path) {
  // Path: /api/data/{collection}[/{id}]
  const parts = path.replace('/api/data/', '').split('/');
  const collection = parts[0];
  const id = parts[1];
  const kvPrefix = `data:${collection}:`;

  // GET /api/data/{collection} — list all
  if (request.method === 'GET' && !id) {
    const list = await env.STACKHK.list({ prefix: kvPrefix });
    const items = [];
    for (const key of list.keys) {
      const raw = await env.STACKHK.get(key.name, 'text');
      if (raw) items.push(JSON.parse(raw));
    }
    return new Response(JSON.stringify(items), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' }
    });
  }

  // GET /api/data/{collection}/{id} — get single
  if (request.method === 'GET' && id) {
    const raw = await env.STACKHK.get(kvPrefix + id, 'text');
    if (!raw) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404, headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response(raw, { headers: { 'Content-Type': 'application/json' } });
  }

  // POST /api/data/{collection} — bulk save (replaces all)
  if (request.method === 'POST' && !id) {
    try {
      const items = await request.json();
      if (!Array.isArray(items)) {
        return new Response(JSON.stringify({ error: 'Expected array' }), {
          status: 400, headers: { 'Content-Type': 'application/json' }
        });
      }
      // Delete existing keys for this collection
      const existing = await env.STACKHK.list({ prefix: kvPrefix });
      for (const key of existing.keys) {
        await env.STACKHK.delete(key.name);
      }
      // Write new items
      for (const item of items) {
        const itemId = item.id || item.slug || crypto.randomUUID();
        await env.STACKHK.put(kvPrefix + itemId, JSON.stringify(item));
      }
      return new Response(JSON.stringify({ success: true, count: items.length }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // PUT /api/data/{collection}/{id} — upsert single
  if ((request.method === 'PUT' || request.method === 'POST') && id) {
    try {
      const item = await request.json();
      await env.STACKHK.put(kvPrefix + id, JSON.stringify(item));
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // DELETE /api/data/{collection}/{id}
  if (request.method === 'DELETE' && id) {
    await env.STACKHK.delete(kvPrefix + id);
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405, headers: { 'Content-Type': 'application/json' }
  });
}

// --- Auth API ---
async function handleAuthAPI(request, env) {
  if (request.method === 'POST') {
    try {
      const { username, password } = await request.json();
      // Hardcoded credentials (same as login.html)
      if (username === 'Stackhk007' && password === 'Hk19982026LLM') {
        return new Response(JSON.stringify({
          success: true,
          token: 'admin-session-' + Date.now(),
          user: { username: 'Stackhk007', name: 'StackHK Admin', role: 'Administrator' }
        }), { headers: { 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401, headers: { 'Content-Type': 'application/json' }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405, headers: { 'Content-Type': 'application/json' }
  });
}
