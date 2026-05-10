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
        status: 'draft',
        score: 8.2,
        excerpt: 'Suno can generate full songs from a text prompt.',
        author: 'StackHK Team',
        date: '2025-05-06',
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
