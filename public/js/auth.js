// public/js/auth.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const username = form.username.value.trim();
      const password = form.password.value.trim();
      try {
        const { token, user } = await SMS.apiRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ username, password })
        });
        localStorage.setItem('sms_token', token);
        localStorage.setItem('sms_user', JSON.stringify(user));
        SMS.showNotification('Login successful!', 'success');
        window.location.href = 'dashboard.html';
      } catch (err) {
        SMS.showNotification(err.message, 'error');
      }
    });
  }
  // If already logged in, go to dashboard
  if (localStorage.getItem('sms_token') && window.location.pathname.endsWith('login.html')) {
    window.location.href = 'dashboard.html';
  }
});
