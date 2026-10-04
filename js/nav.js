(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.querySelector('[data-nav-toggle]');
    const links = document.querySelector('.nav-links');
    if (toggle && links) {
      toggle.addEventListener('click', () => links.classList.toggle('open'));
    }

    document.querySelectorAll('[data-logout]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        try {
          await window.api.post('/api/auth/logout');
        } catch (err) {
          /* ignore */
        }
        window.location.href = '/index.html';
      });
    });
  });
})();
