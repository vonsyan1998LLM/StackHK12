// StackHK - Global JavaScript

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
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

// Search functionality
const searchBtn = document.querySelector('.search-btn');
if (searchBtn) {
  searchBtn.addEventListener('click', () => {
    // Toggle search overlay or expand search input
    const searchOverlay = document.querySelector('.search-overlay');
    if (searchOverlay) {
      searchOverlay.classList.toggle('active');
    }
  });
}

// Newsletter form submission
const nlForm = document.querySelector('.nl-form');
if (nlForm) {
  nlForm.addEventListener('submit', e => {
    e.preventDefault();
    const input = nlForm.querySelector('.nl-input');
    const btn = nlForm.querySelector('.nl-btn');
    if (input.value && btn) {
      const originalText = btn.textContent;
      btn.textContent = 'Subscribed!';
      input.value = '';
      setTimeout(() => btn.textContent = originalText, 3000);
    }
  });
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

// Search with debounce
const searchInput = document.querySelector('.search-input');
if (searchInput) {
  const handleSearch = debounce((e) => {
    const query = e.target.value.toLowerCase();
    // Implement search logic here
    console.log('Searching for:', query);
  }, 300);
  searchInput.addEventListener('input', handleSearch);
}
