// StackHK - Global JavaScript

// Utility: Get base path for links
function getBasePath() {
  const path = window.location.pathname;
  if (path.includes('/notepage/') || path.includes('/reviews/') || path.includes('/categories/') || path.includes('/compare/')) {
    return '../';
  }
  return '';
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    // Skip if it's just "#"
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Nav scroll effect
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
  nav.style.boxShadow = window.scrollY > 10 ? '0 2px 20px rgba(0,0,0,.08)' : 'none';
});

// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileOverlay = document.querySelector('.mobile-overlay');
const mobileClose = document.querySelector('.mobile-close');

if (hamburger && mobileMenu && mobileOverlay) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.add('active');
    mobileOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  const closeMenu = () => {
    mobileMenu.classList.remove('active');
    mobileOverlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  mobileClose?.addEventListener('click', closeMenu);
  mobileOverlay.addEventListener('click', closeMenu);

  // Close on link click
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

// Copy coupon code
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const code = btn.parentElement.querySelector('.code-text')?.textContent?.trim() || 
                 btn.previousSibling?.textContent?.trim() || 
                 'STACKHK20';
    navigator.clipboard?.writeText(code);
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = originalText, 2000);
  });
});

// Search functionality - Open search page
const searchBtn = document.querySelector('.search-btn');
if (searchBtn) {
  searchBtn.addEventListener('click', () => {
    const basePath = getBasePath();
    window.location.href = basePath + 'search.html';
  });
}

// Keyboard shortcut: Cmd/Ctrl + K to open search
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    const basePath = getBasePath();
    window.location.href = basePath + 'search.html';
  }
});

// Newsletter subscription - Store in localStorage
function getSubscribers() {
  const data = localStorage.getItem('stackhk_subscribers');
  return data ? JSON.parse(data) : [
    { id: 1, email: 'sarah@example.com', name: 'Sarah L.', date: '2025-01-15', status: 'active' },
    { id: 2, email: 'james@startup.hk', name: 'James K.', date: '2025-02-20', status: 'active' },
    { id: 3, email: 'michael@dev.co', name: 'Michael T.', date: '2025-03-10', status: 'active' },
    { id: 4, email: 'emma@design.io', name: 'Emma W.', date: '2025-04-05', status: 'active' },
    { id: 5, email: 'david@tech.com', name: 'David C.', date: '2025-04-20', status: 'unsubscribed' }
  ];
}

function addSubscriber(email) {
  const subscribers = getSubscribers();
  const exists = subscribers.find(s => s.email.toLowerCase() === email.toLowerCase());
  
  if (exists) {
    if (exists.status === 'unsubscribed') {
      exists.status = 'active';
      localStorage.setItem('stackhk_subscribers', JSON.stringify(subscribers));
      return { success: true, message: 'Welcome back! Your subscription has been reactivated.' };
    }
    return { success: false, message: 'This email is already subscribed.' };
  }
  
  const newSubscriber = {
    id: subscribers.length > 0 ? Math.max(...subscribers.map(s => s.id)) + 1 : 1,
    email: email,
    name: email.split('@')[0],
    date: new Date().toISOString().split('T')[0],
    status: 'active'
  };
  
  subscribers.push(newSubscriber);
  localStorage.setItem('stackhk_subscribers', JSON.stringify(subscribers));
  return { success: true, message: 'Successfully subscribed! Check your inbox every Thursday.' };
}

// Newsletter form submission
document.querySelectorAll('.nl-form').forEach(form => {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = form.querySelector('.nl-input');
    const btn = form.querySelector('.nl-btn');
    
    if (!input || !input.value) return;
    
    const email = input.value.trim();
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showSubscribeToast('Please enter a valid email address.', 'error');
      input.focus();
      return;
    }
    
    const result = addSubscriber(email);
    
    if (result.success) {
      input.value = '';
      showSubscribeToast(result.message, 'success');
      if (btn) {
        const originalText = btn.textContent;
        btn.textContent = '✓ Subscribed!';
        btn.style.background = 'var(--teal)';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
        }, 3000);
      }
    } else {
      showSubscribeToast(result.message, 'warning');
    }
  });
});

// Subscribe toast notification
function showSubscribeToast(message, type = 'success') {
  // Remove existing toast if any
  const existing = document.querySelector('.subscribe-toast');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.className = 'subscribe-toast';
  toast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 1rem 1.5rem;
    box-shadow: 0 10px 40px rgba(0,0,0,.15);
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: .75rem;
    max-width: 400px;
    transform: translateY(120%);
    transition: transform .3s ease;
    font-family: var(--font-sans);
  `;
  
  const iconColors = {
    success: { bg: '#EDFAF6', color: '#0B8E72' },
    error: { bg: '#FEF2F2', color: '#E83B3B' },
    warning: { bg: '#FFF7EC', color: '#CC6B0B' }
  };
  
  const icons = {
    success: '✓',
    error: '✗',
    warning: '!'
  };
  
  const colors = iconColors[type] || iconColors.success;
  
  toast.innerHTML = `
    <div style="width:28px;height:28px;background:${colors.bg};color:${colors.color};border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.85rem;flex-shrink:0">${icons[type]}</div>
    <div style="flex:1;font-size:.9rem;color:var(--text)">${message}</div>
    <button onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;color:var(--muted);padding:.25rem;font-size:.85rem">✕</button>
  `;
  
  document.body.appendChild(toast);
  
  // Trigger animation
  setTimeout(() => toast.style.transform = 'translateY(0)', 10);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    toast.style.transform = 'translateY(120%)';
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

// Filter pills toggle
document.querySelectorAll('.filter-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    // If it's a single-select group, remove active from siblings
    const parent = pill.parentElement;
    if (parent.classList.contains('single-select')) {
      parent.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    }
    pill.classList.toggle('active');
  });
});

// Lazy load images with IntersectionObserver
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        img.classList.add('loaded');
        observer.unobserve(img);
      }
    });
  }, { rootMargin: '50px' });

  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

// Add hover effect to review cards
document.querySelectorAll('.review-card, .cat-card, .pick-card, .deal-item').forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-3px)';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// Score bar animation
if ('IntersectionObserver' in window) {
  const scoreObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fills = entry.target.querySelectorAll('.score-fill');
        fills.forEach(fill => {
          const width = fill.dataset.width;
          if (width) {
            fill.style.width = width;
          }
        });
        scoreObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.score-breakdown').forEach(el => {
    scoreObserver.observe(el);
  });
}

// Debounce utility
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
