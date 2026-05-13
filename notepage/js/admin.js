// StackHK Admin - Main JavaScript

// Auth check
function checkAuth() {
  const isAuth = localStorage.getItem('stackhk_admin_auth');
  if (!isAuth || isAuth !== 'true') {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// Get current user
function getCurrentUser() {
  const user = localStorage.getItem('stackhk_admin_user');
  return user ? JSON.parse(user) : null;
}

// Logout
function logout() {
  localStorage.removeItem('stackhk_admin_auth');
  localStorage.removeItem('stackhk_admin_user');
  localStorage.removeItem('stackhk_admin_remember');
  window.location.href = 'login.html';
}

// Initialize sidebar user info
function initSidebarUser() {
  const user = getCurrentUser();
  if (user) {
    const userName = document.querySelector('.sidebar-user-name');
    const userRole = document.querySelector('.sidebar-user-role');
    if (userName) userName.textContent = user.name || 'Admin';
    if (userRole) userRole.textContent = user.role || 'Administrator';
  }
}

// Mobile sidebar toggle
function initSidebarToggle() {
  const toggleBtn = document.querySelector('.header-toggle');
  const sidebar = document.querySelector('.admin-sidebar');
  const closeBtn = document.querySelector('.sidebar-close');
  
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('active');
    });
  }
  
  if (closeBtn && sidebar) {
    closeBtn.addEventListener('click', () => {
      sidebar.classList.remove('active');
    });
  }
}

// Toast notifications
const toastContainer = document.createElement('div');
toastContainer.className = 'toast-container';
document.body.appendChild(toastContainer);

function showToast(message, type = 'success') {
  const icons = {
    success: '✓',
    error: '✗',
    warning: '!'
  };
  
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <div class="toast-icon ${type}">${icons[type] || '✓'}</div>
    <div class="toast-message">${message}</div>
    <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
  `;
  
  toastContainer.appendChild(toast);
  
  // Trigger animation
  setTimeout(() => toast.classList.add('show'), 10);
  
  // Auto remove after 4 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Modal functions
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
    document.body.style.overflow = '';
  }
});

// Data storage helpers
function getStorageData(key) {
  const data = localStorage.getItem(`stackhk_${key}`);
  return data ? JSON.parse(data) : null;
}

function setStorageData(key, data) {
  localStorage.setItem(`stackhk_${key}`, JSON.stringify(data));
}

// Initialize sample data if not exists
function initSampleData() {
  // Reviews
  if (!getStorageData('reviews')) {
    const reviews = [
      {
        id: 1,
        title: 'Claude Pro Review: The AI Writer That Actually Thinks',
        slug: 'claude-pro',
        category: 'writing',
        status: 'published',
        score: 9.4,
        excerpt: 'After 3 weeks of daily use, we found Claude Pro consistently produces the most nuanced long-form content.',
        author: 'StackHK Team',
        date: '2025-05-01',
        featured: true
      },
      {
        id: 2,
        title: 'Cursor AI: The Best IDE Add-On for Developers in 2025',
        slug: 'cursor-ai',
        category: 'coding',
        status: 'published',
        score: 9.1,
        excerpt: 'Cursor\'s tab-complete and multi-file context editing is genuinely transformative.',
        author: 'StackHK Team',
        date: '2025-04-15',
        featured: true
      },
      {
        id: 3,
        title: 'ChatGPT-4o Review: Still the King of AI Chat?',
        slug: 'chatgpt-4o',
        category: 'productivity',
        status: 'published',
        score: 8.7,
        excerpt: 'OpenAI\'s latest model brings multimodal capabilities to the masses.',
        author: 'StackHK Team',
        date: '2025-05-08',
        featured: false
      },
      {
        id: 4,
        title: 'Perplexity Pro: AI-Powered Search Done Right',
        slug: 'perplexity-pro',
        category: 'productivity',
        status: 'published',
        score: 9.0,
        excerpt: 'Perplexity combines search and AI in a way that actually works.',
        author: 'StackHK Team',
        date: '2025-04-29',
        featured: false
      },
      {
        id: 5,
        title: 'Midjourney v7 vs DALL·E 3: Which AI Image Tool Wins?',
        slug: 'midjourney-v7',
        category: 'image',
        status: 'published',
        score: 8.8,
        excerpt: 'We ran 200 prompts across both platforms.',
        author: 'StackHK Team',
        date: '2025-04-20',
        featured: true
      },
      {
        id: 6,
        title: 'Suno AI: Music from Text in Minutes',
        slug: 'suno-ai',
        category: 'audio',
        status: 'published',
        score: 8.2,
        excerpt: 'Suno can generate full songs from a text prompt.',
        author: 'StackHK Team',
        date: '2025-05-06',
        featured: false
      },
      {
        id: 7,
        title: 'GitHub Copilot Review: AI Pair Programming',
        slug: 'github-copilot',
        category: 'coding',
        status: 'published',
        score: 8.9,
        excerpt: 'GitHub Copilot revolutionized how we write code.',
        author: 'StackHK Team',
        date: '2025-05-10',
        featured: false
      },
      {
        id: 8,
        title: 'Runway ML: AI Video Generation',
        slug: 'runway-ml',
        category: 'image',
        status: 'published',
        score: 8.5,
        excerpt: 'Runway ML brings AI video generation to creators.',
        author: 'StackHK Team',
        date: '2025-05-10',
        featured: false
      },
      {
        id: 9,
        title: 'Grammarly Review: The Best AI Writing Assistant?',
        slug: 'grammarly-ai',
        category: 'writing',
        status: 'published',
        score: 8.5,
        excerpt: 'Grammarly catches errors and improves clarity.',
        author: 'StackHK Team',
        date: '2025-05-03',
        featured: false
      },
      {
        id: 10,
        title: 'Notion AI: The Best AI for Knowledge Workers?',
        slug: 'notion-ai',
        category: 'productivity',
        status: 'published',
        score: 8.6,
        excerpt: 'Notion AI is deeply woven into the workspace.',
        author: 'StackHK Team',
        date: '2025-03-15',
        featured: false
      },
      {
        id: 11,
        title: 'Adobe Firefly 3: Closer to Midjourney?',
        slug: 'adobe-firefly',
        category: 'image',
        status: 'published',
        score: 7.8,
        excerpt: 'Adobe Firefly gets a major upgrade.',
        author: 'StackHK Team',
        date: '2025-04-22',
        featured: false
      },
      {
        id: 12,
        title: 'Julius AI: Data Analysis for Non-Technical Teams',
        slug: 'julius-ai',
        category: 'business',
        status: 'published',
        score: 8.4,
        excerpt: 'Julius lets you analyze data with natural language.',
        author: 'StackHK Team',
        date: '2025-04-26',
        featured: false
      },
      {
        id: 13,
        title: 'Claude 3.5 Haiku Review: The Fastest AI That Still Thinks',
        slug: 'claude-3-5-haiku',
        category: 'writing',
        status: 'published',
        score: 8.9,
        excerpt: 'Anthropic\'s Haiku model delivers near-instant responses without sacrificing reasoning quality.',
        author: 'StackHK Team',
        date: '2025-05-12',
        featured: false
      },
      {
        id: 14,
        title: 'Gemini 2.0 Pro Review: Google\'s Multimodal Powerhouse',
        slug: 'gemini-2-0-pro',
        category: 'productivity',
        status: 'published',
        score: 8.7,
        excerpt: 'Google\'s Gemini 2.0 Pro excels at understanding and generating across text, images, audio, and video.',
        author: 'StackHK Team',
        date: '2025-05-11',
        featured: false
      },
      {
        id: 15,
        title: 'Llama 3.3 70B Review: The Best Open-Source AI Model',
        slug: 'llama-3-3',
        category: 'coding',
        status: 'published',
        score: 8.5,
        excerpt: 'Meta\'s Llama 3.3 70B delivers GPT-4-class performance as a free, open-weight model.',
        author: 'StackHK Team',
        date: '2025-05-10',
        featured: false
      },
      {
        id: 16,
        title: 'Copilot Vision Review: Microsoft\'s AI Sees What You See',
        slug: 'copilot-vision',
        category: 'productivity',
        status: 'published',
        score: 8.3,
        excerpt: 'Copilot Vision lets you share your screen with AI for real-time assistance.',
        author: 'StackHK Team',
        date: '2025-05-09',
        featured: false
      },
      {
        id: 17,
        title: 'ElevenLabs v2 Review: The Gold Standard of AI Voice',
        slug: 'elevenlabs-v2',
        category: 'audio',
        status: 'published',
        score: 9.0,
        excerpt: 'ElevenLabs v2 produces the most realistic AI voices available.',
        author: 'StackHK Team',
        date: '2025-05-08',
        featured: false
      }
    ];
    setStorageData('reviews', reviews);
  }
  
  // Categories
  if (!getStorageData('categories')) {
    const categories = [
      { id: 1, name: 'Writing Tools', slug: 'writing', emoji: '✍️', count: 28, description: 'AI writing assistants and content generators' },
      { id: 2, name: 'Coding Tools', slug: 'coding', emoji: '💻', count: 22, description: 'AI-powered IDEs and developer tools' },
      { id: 3, name: 'Productivity', slug: 'productivity', emoji: '⚡', count: 31, description: 'AI tools for task management and automation' },
      { id: 4, name: 'Image & Video', slug: 'image', emoji: '🎨', count: 19, description: 'AI image generators and video editors' },
      { id: 5, name: 'Audio & Voice', slug: 'audio', emoji: '🎙️', count: 11, description: 'AI voice generators and music creation' },
      { id: 6, name: 'Business AI', slug: 'business', emoji: '📊', count: 14, description: 'AI tools for data analysis and business' }
    ];
    setStorageData('categories', categories);
  }
  
  // Deals
  if (!getStorageData('deals')) {
    const deals = [
      {
        id: 1,
        tool: 'Jasper AI',
        category: 'writing',
        discount: '20% OFF — First 3 Months',
        code: 'STACKHK20',
        expires: '2025-05-31',
        status: 'active'
      },
      {
        id: 2,
        tool: 'Cursor Pro',
        category: 'coding',
        discount: '2 Months Free — Annual Plan',
        code: 'CURSOR2FREE',
        expires: '2025-06-15',
        status: 'active'
      },
      {
        id: 3,
        tool: 'Notion AI',
        category: 'productivity',
        discount: 'Free Trial — 30 Days',
        code: 'NOTION30',
        expires: '2025-12-31',
        status: 'active'
      },
      {
        id: 4,
        tool: 'Grammarly Premium',
        category: 'writing',
        discount: '25% OFF — Annual Plan',
        code: 'GRAMMAR25',
        expires: '2025-05-20',
        status: 'active'
      }
    ];
    setStorageData('deals', deals);
  }
  
  // Newsletters
  if (!getStorageData('newsletters')) {
    const newsletters = [
      { id: 47, title: 'Claude Pro Review + ChatGPT vs Claude Comparison', date: '2025-05-08', status: 'sent', subscribers: 4218, openRate: 42.5, clickRate: 8.3 },
      { id: 46, title: 'Cursor AI Deep Dive + Best Coding Tools Roundup', date: '2025-05-01', status: 'sent', subscribers: 4190, openRate: 45.2, clickRate: 9.1 },
      { id: 45, title: 'Midjourney v7 First Look + AI Image Tool Comparison', date: '2025-04-24', status: 'sent', subscribers: 4156, openRate: 48.1, clickRate: 10.2 },
      { id: 44, title: 'Perplexity Pro Review + AI Search Tools Compared', date: '2025-04-17', status: 'sent', subscribers: 4120, openRate: 44.8, clickRate: 8.9 },
      { id: 48, title: 'Best AI Tools for Productivity in 2025', date: '2025-05-15', status: 'draft', subscribers: 0, openRate: 0, clickRate: 0 }
    ];
    setStorageData('newsletters', newsletters);
  }

  // Pages
  if (!getStorageData('pages')) {
    const pages = [
      { id: 'home', name: 'Homepage', url: 'index.html', lastUpdated: '2025-05-11', status: 'published', heroTitle: 'The AI tool reviews you can actually trust.', heroSubtitle: 'We test, compare, and recommend the best AI products.' },
      { id: 'about', name: 'About Us', url: 'about.html', lastUpdated: '2025-05-10', status: 'published', heroTitle: 'About StackHK', heroSubtitle: "Hong Kong's premier AI tool review media." },
      { id: 'deals', name: 'Deals', url: 'deals.html', lastUpdated: '2025-05-09', status: 'published', heroTitle: 'AI Tool Deals & Discounts', heroSubtitle: 'Exclusive coupons and special offers.' },
      { id: 'submit', name: 'Submit Tool', url: 'submit.html', lastUpdated: '2025-05-08', status: 'published', heroTitle: 'Submit Your AI Tool', heroSubtitle: 'Have an AI tool you would like us to review?' },
      { id: 'search', name: 'Search', url: 'search.html', lastUpdated: '2025-05-11', status: 'published', heroTitle: 'Search StackHK', heroSubtitle: 'Find AI tool reviews, comparisons, deals, and more.' }
    ];
    setStorageData('pages', pages);
  }

  // Subscribers
  if (!getStorageData('subscribers')) {
    const subscribers = [
      { id: 1, email: 'sarah@example.com', name: 'Sarah L.', date: '2025-01-15', status: 'active' },
      { id: 2, email: 'james@startup.hk', name: 'James K.', date: '2025-02-20', status: 'active' },
      { id: 3, email: 'michael@dev.co', name: 'Michael T.', date: '2025-03-10', status: 'active' },
      { id: 4, email: 'emma@design.io', name: 'Emma W.', date: '2025-04-05', status: 'active' },
      { id: 5, email: 'david@tech.com', name: 'David C.', date: '2025-04-20', status: 'unsubscribed' }
    ];
    setStorageData('subscribers', subscribers);
  }
}

// Format date
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Generate unique ID
function generateId(items) {
  return items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
}

// Confirm delete
function confirmDelete(message = 'Are you sure you want to delete this item?') {
  return confirm(message);
}

// Get category badge class
function getCategoryBadgeClass(category) {
  const classes = {
    writing: 'badge-writing',
    coding: 'badge-coding',
    productivity: 'badge-productivity',
    image: 'badge-image',
    audio: 'badge-audio',
    business: 'badge-business'
  };
  return classes[category] || 'badge-writing';
}

// Get category name
function getCategoryName(slug) {
  const names = {
    writing: 'Writing',
    coding: 'Coding',
    productivity: 'Productivity',
    image: 'Image & Video',
    audio: 'Audio',
    business: 'Business'
  };
  return names[slug] || slug;
}

// Debounce
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
  // Check auth (except for login page)
  if (!window.location.pathname.includes('login.html')) {
    if (!checkAuth()) return;
    initSidebarUser();
    initSidebarToggle();
    initSampleData();
  }
});
