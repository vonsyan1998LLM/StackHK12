export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // API 路由 → 走 API 处理
    if (url.pathname.startsWith('/api/')) {
      return handleAPI(request, env);
    }
    
    // 页面请求 → 注入模板
    const pageKey = getPageKey(url.pathname);
    const pageHtml = await env.STACKHK.get(pageKey, 'text');
    
    if (!pageHtml) {
      return env.ASSETS.fetch(request); // 回退到静态文件
    }
    
    // 从 KV 读取头部和底部
    const [header, footer] = await Promise.all([
      env.STACKHK.get('template:header', 'text'),
      env.STACKHK.get('template:footer', 'text')
    ]);
    
    // 拼装
    const fullHtml = assemblePage(pageHtml, header, footer, url.pathname);
    
    return new Response(fullHtml, {
      headers: { 'Content-Type': 'text/html;charset=utf-8' }
    });
  }
};

function getPageKey(pathname) {
  // 处理根路径
  if (pathname === '/' || pathname === '/index.html') {
    return 'page:index';
  }
  
  // 移除开头的斜杠和 .html 后缀
  let key = pathname.slice(1).replace(/\.html$/, '');
  
  // 处理子目录
  if (key.startsWith('reviews/')) {
    return `review:${key.slice(8)}`;
  }
  
  return `page:${key}`;
}

function assemblePage(body, header, footer, pathname) {
  // 根据页面类型设置 active 状态
  const activeLink = getActiveLink(pathname);
  
  // 替换 header 中的 active 类
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
  <!-- SEO meta 从 KV 读取 -->
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
  
  // 处理模板 API
  if (path === '/api/templates') {
    return handleTemplatesAPI(request, env);
  }
  
  // 处理页面 API
  if (path === '/api/pages') {
    return handlePagesAPI(request, env);
  }
  
  return new Response('Not Found', { status: 404 });
}

async function handleTemplatesAPI(request, env) {
  if (request.method === 'GET') {
    // 获取所有模板
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
    // 获取页面列表
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