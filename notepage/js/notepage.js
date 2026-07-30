// StackHK Admin - Shared Utilities
// This file provides helper functions used across admin pages

// Data storage helpers
function getStorageData(key) {
  const data = localStorage.getItem(`stackhk_${key}`);
  return data ? JSON.parse(data) : null;
}

function setStorageData(key, data) {
  localStorage.setItem(`stackhk_${key}`, JSON.stringify(data));
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

// Toast notifications
const toastContainer = document.createElement('div');
toastContainer.className = 'toast-container';
document.body.appendChild(toastContainer);

function showToast(message, type = 'success') {
  const icons = {
    success: '\u2713',
    error: '\u2717',
    warning: '!'
  };
  
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <div class="toast-icon ${type}">${icons[type] || '\u2713'}</div>
    <div class="toast-message">${message}</div>
    <button class="toast-close" onclick="this.parentElement.remove()">\u2715</button>
  `;
  
  toastContainer.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 10);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
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
