(function () {
  function confirmDialog(message, options) {
    options = options || {};
    const title = options.title || 'Are you sure?';
    const confirmLabel = options.confirmLabel || 'Confirm';
    const cancelLabel = options.cancelLabel || 'Cancel';
    const danger = options.danger !== false;

    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.innerHTML = `
        <div class="modal-box" role="dialog" aria-modal="true">
          <h3>${title}</h3>
          <p>${message}</p>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" data-action="cancel">${cancelLabel}</button>
            <button type="button" class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-action="confirm">${confirmLabel}</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);

      function close(result) {
        overlay.remove();
        resolve(result);
      }

      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) close(false);
      });
      overlay.querySelector('[data-action="cancel"]').addEventListener('click', () => close(false));
      overlay.querySelector('[data-action="confirm"]').addEventListener('click', () => close(true));
    });
  }

  window.confirmDialog = confirmDialog;
})();
