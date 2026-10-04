(function () {
  function openShareMenu(programme) {
    const publicUrl = `${window.location.origin}${programme.publicPath}`;
    const qrUrl = `/api/programmes/${programme.id}/qrcode.png`;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-box" role="dialog" aria-modal="true">
        <h3>Share ${programme.title}</h3>
        <p style="word-break: break-all; color: var(--color-text-muted); font-size: 14px;">${publicUrl}</p>
        <div style="display:flex; flex-direction:column; gap: var(--space-3); margin-top: var(--space-4);">
          <a class="btn btn-secondary btn-block" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(publicUrl)}">💬 Share on WhatsApp</a>
          <button type="button" class="btn btn-secondary btn-block" data-action="copy">🔗 Copy Link</button>
          <a class="btn btn-secondary btn-block" href="${qrUrl}" download="${programme.slug}-qrcode.png">⬇️ Download QR Code</a>
          ${navigator.share ? '<button type="button" class="btn btn-secondary btn-block" data-action="native-share">📤 Share</button>' : ''}
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" data-action="close">Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });
    overlay.querySelector('[data-action="close"]').addEventListener('click', () => overlay.remove());

    overlay.querySelector('[data-action="copy"]').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(publicUrl);
        window.showToast('Link copied to clipboard.', 'success');
      } catch (err) {
        window.showToast('Could not copy link.', 'error');
      }
    });

    const nativeShareBtn = overlay.querySelector('[data-action="native-share"]');
    if (nativeShareBtn) {
      nativeShareBtn.addEventListener('click', () => {
        navigator.share({ title: programme.title, url: publicUrl }).catch(() => {});
      });
    }
  }

  window.openShareMenu = openShareMenu;
})();
