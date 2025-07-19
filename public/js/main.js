// public/js/main.js
const SMS = (() => {
  async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('sms_token');
    const config = {
      headers: { 'Content-Type': 'application/json', ...(options.headers||{}) },
      ...options
    };
    if (token) config.headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`/api${endpoint}`, config);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'API request failed');
    return data;
  }

  function showNotification(msg, type = 'info') {
    // You can later replace with a fancy toast
    alert(`${type === 'error' ? 'Error: ' : ''}${msg}`);
  }

  function validateForm(form) {
    return Array.from(form.elements)
      .filter(el => el.hasAttribute('required'))
      .every(el => el.value.trim() !== '');
  }

  function protectPage() {
    if (!localStorage.getItem('sms_token')) {
      window.location.href = 'login.html';
    }
  }

  return { apiRequest, showNotification, validateForm, protectPage };
})();
