(function () {
  window.ScanProgram = window.ScanProgram || {};

  window.ScanProgram.requireAuthClient = async function (opts) {
    opts = opts || {};
    try {
      const { user } = await window.api.get('/api/auth/me');
      if (opts.adminOnly && user.role !== 'admin') {
        window.location.href = '/dashboard.html';
        return null;
      }
      document.querySelectorAll('[data-user-name]').forEach((el) => {
        el.textContent = user.name;
      });
      document.querySelectorAll('[data-admin-only]').forEach((el) => {
        el.style.display = user.role === 'admin' ? '' : 'none';
      });
      return user;
    } catch (err) {
      window.location.href = '/login.html';
      return null;
    }
  };
})();
