(function () {
  function showMessage(text, type) {
    const el = document.getElementById('form-message');
    if (!el) return;
    el.innerHTML = `<div class="form-${type}">${text}</div>`;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reset-form');
    if (!form) return;

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
      showMessage('This reset link is missing a token. Please request a new one.', 'error');
      form.style.display = 'none';
      return;
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      try {
        await window.api.post('/api/auth/reset-password', {
          token,
          password: form.password.value,
        });
        showMessage('Your password has been reset. Redirecting to log in…', 'success');
        setTimeout(() => (window.location.href = '/login.html'), 1500);
      } catch (err) {
        showMessage(err.message, 'error');
        submitBtn.disabled = false;
      }
    });
  });
})();
