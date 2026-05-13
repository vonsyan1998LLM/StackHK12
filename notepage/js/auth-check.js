// StackHK Admin - Immediate Auth Check (runs before any content loads)
(function() {
  // Skip check for login page
  if (window.location.pathname.includes('login.html')) return;
  
  const isAuth = localStorage.getItem('stackhk_admin_auth');
  if (!isAuth || isAuth !== 'true') {
    window.location.replace('login.html');
    // Stop further execution
    document.write('');
    document.close();
  }
})();
