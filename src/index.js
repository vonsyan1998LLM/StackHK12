export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // API routes → handle separately
    if (url.pathname.startsWith('/api/')) {
      return handleAPI(request, env);
    }
    
    // Page requests → inject templates
    const pageKey = getPageKey(url.pathname);
    const pageHtml = await env.STACKHK.get(pageKey, 'text');
    
    if (!pageHtml) {
      return env.ASSETS.fetch(request); // Fallback to static files
    }
    
    // Read header and footer from KV
    const [header, footer] = await Promise.all([
      env.STACKHK.get('template:header', 'text'),
      env.STACKHK.get('template:footer', 'text')
    ]);
    
    // Assemble
    const fullHtml = assemblePage(pageHtml, header, footer, url.pathname);
    
    return new Response(fullHtml, {
      headers: { 'Content-Type': 'text/html;charset=utf-8' }
    });
  }
};

function getPageKey(pathname) {
  // Handle root path
  if (pathname === '/' || pathname === '/index.html') {
    return 'page:index';
  }
  
  // Remove leading slash and .html suffix
  let key = pathname.slice(1).replace(/\.html$/, '');
  
  // Handle subdirectories
  if (key.startsWith('reviews/')) {
    return `review:${key.slice(8)}`;
  }
  
  return `page:${key}`;
}

function assemblePage(body, header, footer, pathname) {
  // Set active state based on page type
  const activeLink = getActiveLink(pathname);
  
  // Replace active class in header
  let processedHeader = header || '';
  if (activeLink) {
    processedHeader = processedHeader.replace(/class="active"/g, '');
    processedHeader = processedHeader.replace(
      new RegExp(`href="${activeLink}"`, 'g'),
      `href="${activeLink}" class="active"`
    );
  }
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.css">
  <!-- SEO meta read from KV -->
</head>
<body>
  ${processedHeader}
  <main>${body}</main>
  ${footer}
  <script src="/js/main.js"></script>
</body>
</html>`;
}

function getActiveLink(pathname) {
  if (pathname === '/' || pathname === '/index.html') return 'index.html';
  if (pathname.startsWith('/reviews')) return 'reviews.html';
  if (pathname.startsWith('/compare')) return 'compare.html';
  if (pathname.startsWith('/categories')) return 'categories.html';
  if (pathname.startsWith('/deals')) return 'deals.html';
  if (pathname.startsWith('/weekly')) return 'weekly.html';
  return null;
}

async function handleAPI(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // Handle templates API
  if (path === '/api/templates') {
    return handleTemplatesAPI(request, env);
  }
  
  // Handle pages API
  if (path === '/api/pages') {
    return handlePagesAPI(request, env);
  }
  
  return new Response('Not Found', { status: 404 });
}

async function handleTemplatesAPI(request, env) {
  if (request.method === 'GET') {
    // Get all templates
    const [header, footer, nav] = await Promise.all([
      env.STACKHK.get('template:header', 'text'),
      env.STACKHK.get('template:footer', 'text'),
      env.STACKHK.get('template:nav', 'text')
    ]);
    
    return new Response(JSON.stringify({ header, footer, nav }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  if (request.method === 'POST') {
    const { key, content } = await request.json();
    await env.STACKHK.put(`template:${key}`, content);
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response('Method not allowed', { status: 405 });
}

async function handlePagesAPI(request, env) {
  if (request.method === 'GET') {
    // Get page list
    const list = await env.STACKHK.list({ prefix: 'page:' });
    const pages = await Promise.all(
      list.keys.map(async (key) => {
        const content = await env.STACKHK.get(key.name, 'text');
        return { key: key.name, content };
      })
    );
    
    return new Response(JSON.stringify(pages), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  if (request.method === 'POST') {
    const { key, content } = await request.json();
    await env.STACKHK.put(`page:${key}`, content);
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response('Method not allowed', { status: 405 });
}