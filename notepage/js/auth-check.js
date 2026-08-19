// StackHK Admin - Auth check (token-based)
// This check runs on page load. It verifies the stored token with the backend.
// A token is required; localStorage flag 'stackhk_admin_auth' is no longer trusted.
(function() {
  if (window.location.pathname.includes('login.html')) return;

  const token = localStorage.getItem('stackhk_admin_token');
  if (!token) {
    window.location.replace('login.html');
    document.write('');
    document.close();
    return;
  }

  // Verify token with backend before showing any content
  fetch('/api/auth/verify', {
    headers: { 'Authorization': 'Bearer ' + token }
  })
  .then(r => r.json())
  .then(data => {
    if (!data || !data.valid) {
      localStorage.removeItem('stackhk_admin_token');
      localStorage.removeItem('stackhk_admin_user');
      window.location.replace('login.html');
      document.write('');
      document.close();
    }
  })
  .catch(() => {
    // Backend unreachable — do not grant access
    localStorage.removeItem('stackhk_admin_token');
    window.location.replace('login.html');
    document.write('');
    document.close();
  });
})();
