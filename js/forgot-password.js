(function () {
  function showMessage(html, type) {
    const el = document.getElementById('form-message');
    if (!el) return;
    el.innerHTML = `<div class="form-${type}">${html}</div>`;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('forgot-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      try {
        const result = await window.api.post('/api/auth/forgot-password', {
          email: form.email.value.trim(),
        });
        if (result.resetLink) {
          showMessage(
            `We found your account. In production this link would be emailed to you — for this demo, use it directly: <br><a href="${result.resetLink}">${result.resetLink}</a>`,
            'success'
          );
        } else {
          showMessage('If an account exists for that email, a reset link has been generated.', 'success');
        }
      } catch (err) {
        showMessage(err.message, 'error');
      } finally {
        submitBtn.disabled = false;
      }
    });
  });
})();
