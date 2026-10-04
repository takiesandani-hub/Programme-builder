(function () {
  const EMOJI = { wedding: '💍', funeral: '🕊️', restaurant: '🍽️', meeting: '🎙️' };
  const EDITOR_PAGE = { wedding: 'editor-wedding.html', funeral: 'editor-funeral.html', restaurant: 'editor-restaurant.html', meeting: 'editor-meeting.html' };

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function statusBadge(status) {
    if (status === 'published') return '<span class="badge badge-published">Published</span>';
    if (status === 'disabled') return '<span class="badge badge-disabled">Disabled</span>';
    return '<span class="badge badge-draft">Draft</span>';
  }

  function renderCard(programme) {
    const card = document.createElement('div');
    card.className = 'programme-card';
    card.innerHTML = `
      <div class="top-row">
        <div>
          <div class="emoji">${EMOJI[programme.type]}</div>
          <h3>${programme.title}</h3>
          <div class="meta">${programme.subtitle}</div>
        </div>
        ${statusBadge(programme.status)}
      </div>
      <div class="meta">Created: ${formatDate(programme.createdAt)}</div>
      <div class="stats">
        <span>👁️ ${programme.views} views</span>
        <span>📷 ${programme.scans} scans</span>
      </div>
      <div class="card-actions">
        <a class="btn btn-secondary btn-sm" href="${programme.publicPath}" target="_blank" rel="noopener">View</a>
        <a class="btn btn-secondary btn-sm" href="/${EDITOR_PAGE[programme.type]}?id=${programme.id}">Edit</a>
        <a class="btn btn-secondary btn-sm" href="/qrcode.html?id=${programme.id}">QR Code</a>
        <button type="button" class="btn btn-secondary btn-sm" data-action="share">Share</button>
        <button type="button" class="btn btn-secondary btn-sm" data-action="duplicate">Duplicate</button>
        <button type="button" class="btn btn-danger btn-sm" data-action="delete">Delete</button>
      </div>
    `;

    card.querySelector('[data-action="share"]').addEventListener('click', () => window.openShareMenu(programme));

    card.querySelector('[data-action="duplicate"]').addEventListener('click', async () => {
      try {
        await window.api.post(`/api/programmes/${programme.id}/duplicate`);
        window.showToast('Programme duplicated.', 'success');
        loadProgrammes();
      } catch (err) {
        window.showToast(err.message, 'error');
      }
    });

    card.querySelector('[data-action="delete"]').addEventListener('click', async () => {
      const ok = await window.confirmDialog(`This will permanently delete "${programme.title}". This cannot be undone.`, {
        title: 'Delete programme?',
        confirmLabel: 'Delete',
      });
      if (!ok) return;
      try {
        await window.api.del(`/api/programmes/${programme.id}`);
        window.showToast('Programme deleted.', 'success');
        loadProgrammes();
      } catch (err) {
        window.showToast(err.message, 'error');
      }
    });

    return card;
  }

  async function loadProgrammes() {
    const grid = document.getElementById('programme-grid');
    const loading = document.getElementById('loading');
    const emptyState = document.getElementById('empty-state');

    loading.style.display = 'block';
    grid.innerHTML = '';
    emptyState.style.display = 'none';

    try {
      const { programmes } = await window.api.get('/api/programmes');
      loading.style.display = 'none';
      if (programmes.length === 0) {
        emptyState.style.display = 'block';
        return;
      }
      programmes.forEach((p) => grid.appendChild(renderCard(p)));
    } catch (err) {
      loading.style.display = 'none';
      window.showToast(err.message, 'error');
    }
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const user = await window.ScanProgram.requireAuthClient();
    if (!user) return;
    loadProgrammes();
  });
})();
