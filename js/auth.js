(function () {
  function showMessage(text, type) {
    const el = document.getElementById('form-message');
    if (!el) return;
    el.innerHTML = `<div class="form-${type}">${text}</div>`;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        try {
          await window.api.post('/api/auth/login', {
            email: loginForm.email.value.trim(),
            password: loginForm.password.value,
          });
          window.location.href = '/dashboard.html';
        } catch (err) {
          showMessage(err.message, 'error');
          submitBtn.disabled = false;
        }
      });
    }

    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
      signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = signupForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        try {
          await window.api.post('/api/auth/signup', {
            name: signupForm.name.value.trim(),
            email: signupForm.email.value.trim(),
            password: signupForm.password.value,
          });
          window.location.href = '/dashboard.html';
        } catch (err) {
          showMessage(err.message, 'error');
          submitBtn.disabled = false;
        }
      });
    }
  });
})();
