(function () {
  const EMOJI = { wedding: '💍', funeral: '🕊️', restaurant: '🍽️', meeting: '🎙️' };
  let guestScanRecords = [];

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[char]);
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function formatTimestamp(iso) {
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? 'Unknown' : date.toLocaleString('en-ZA');
  }

  function statusBadge(status) {
    if (status === 'published') return '<span class="badge badge-published">Published</span>';
    if (status === 'disabled') return '<span class="badge badge-disabled">Disabled</span>';
    return '<span class="badge badge-draft">Draft</span>';
  }

  function renderStats(stats) {
    const cards = [
      ['Total Users', stats.totalUsers],
      ['Total Programmes', stats.totalProgrammes],
      ['💍 Weddings', stats.wedding],
      ['🕊️ Funerals', stats.funeral],
      ['🍽️ Restaurants', stats.restaurant],
      ['🎙️ Meetings & conferences', stats.meeting],
      ['Published', stats.published],
      ['Total Views', stats.totalViews],
    ];
    return cards
      .map(([label, value]) => `<div class="stat-card"><div class="stat-value">${value}</div><div class="stat-label">${label}</div></div>`)
      .join('');
  }

  async function loadProgrammes() {
    const { programmes } = await window.api.get('/api/admin/programmes');
    const tbody = document.getElementById('programmes-body');
    tbody.innerHTML = programmes
      .map(
        (p) => `
        <tr data-id="${p.id}">
          <td>${EMOJI[p.type] || ''} ${p.title}</td>
          <td>${p.type}</td>
          <td>${p.ownerName}<br><span style="color:var(--color-text-muted); font-size:12px;">${p.ownerEmail}</span></td>
          <td>${statusBadge(p.status)}</td>
          <td>${p.views}</td>
          <td>${p.scans}</td>
          <td>${formatDate(p.createdAt)}</td>
          <td>
            ${
              p.status === 'disabled'
                ? '<button type="button" class="btn btn-secondary btn-sm" data-action="enable">Enable</button>'
                : '<button type="button" class="btn btn-secondary btn-sm" data-action="disable">Disable</button>'
            }
            <button type="button" class="btn btn-danger btn-sm" data-action="delete">Delete</button>
          </td>
        </tr>`
      )
      .join('');

    tbody.querySelectorAll('[data-action="disable"]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.closest('tr').dataset.id;
        await window.api.post(`/api/admin/programmes/${id}/disable`);
        window.showToast('Programme disabled.', 'success');
        loadProgrammes();
      });
    });
    tbody.querySelectorAll('[data-action="enable"]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.closest('tr').dataset.id;
        await window.api.post(`/api/admin/programmes/${id}/enable`);
        window.showToast('Programme re-enabled as a draft.', 'success');
        loadProgrammes();
      });
    });
    tbody.querySelectorAll('[data-action="delete"]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const row = btn.closest('tr');
        const ok = await window.confirmDialog('This will permanently delete this programme. This cannot be undone.', {
          title: 'Delete programme?',
          confirmLabel: 'Delete',
        });
        if (!ok) return;
        await window.api.del(`/api/admin/programmes/${row.dataset.id}`);
        window.showToast('Programme deleted.', 'success');
        loadProgrammes();
      });
    });
  }

  async function loadUsers() {
    const { users } = await window.api.get('/api/admin/users');
    document.getElementById('users-body').innerHTML = users
      .map(
        (u) => `
        <tr>
          <td>${u.name}</td>
          <td>${u.email}</td>
          <td>${u.role}</td>
          <td>${formatDate(u.createdAt)}</td>
        </tr>`
      )
      .join('');
  }

  async function loadGuestScans() {
    const { guestScans } = await window.api.get('/api/admin/guest-scans');
    guestScanRecords = guestScans;
    const tbody = document.getElementById('guest-scans-body');
    const empty = document.getElementById('guest-scans-empty');
    tbody.innerHTML = guestScans.map((scan) => `
      <tr>
        <td>${escapeHtml(scan.eventTitle)}<br><span class="scan-type">${escapeHtml(scan.eventType)}</span></td>
        <td>${escapeHtml(scan.clientName)}${scan.clientEmail ? `<br><span class="scan-type">${escapeHtml(scan.clientEmail)}</span>` : ''}</td>
        <td>${escapeHtml(scan.firstName)} ${escapeHtml(scan.surname)}</td>
        <td><a href="tel:${encodeURIComponent(scan.phone)}">${escapeHtml(scan.phone)}</a></td>
        <td>${escapeHtml(formatTimestamp(scan.scannedAt))}</td>
        <td><button type="button" class="btn btn-danger btn-sm" data-delete-guest-scan="${escapeHtml(scan.id)}">Delete</button></td>
      </tr>
    `).join('');
    empty.hidden = guestScans.length > 0;
    document.getElementById('download-guest-scans').disabled = guestScans.length === 0;
    tbody.querySelectorAll('[data-delete-guest-scan]').forEach((button) => {
      button.addEventListener('click', async () => {
        const ok = await window.confirmDialog('This permanently removes this guest name and phone number from the platform.', {
          title: 'Delete guest registration?',
          confirmLabel: 'Delete',
        });
        if (!ok) return;
        try {
          await window.api.del(`/api/admin/guest-scans/${encodeURIComponent(button.dataset.deleteGuestScan)}`);
          window.showToast('Guest registration deleted.', 'success');
          await loadGuestScans();
        } catch (err) {
          window.showToast(err.message, 'error');
        }
      });
    });
  }

  function downloadGuestScans() {
    if (!guestScanRecords.length) return;
    const columns = ['Event', 'Programme type', 'Programme client', 'Client email', 'Guest first name', 'Guest surname', 'Phone', 'Scanned at'];
    const quote = (value) => {
      let safe = String(value || '');
      if (/^[=+\-@]/.test(safe)) safe = `'${safe}`;
      return `"${safe.replace(/"/g, '""')}"`;
    };
    const rows = guestScanRecords.map((scan) => [
      scan.eventTitle, scan.eventType, scan.clientName, scan.clientEmail,
      scan.firstName, scan.surname, scan.phone, scan.scannedAt,
    ]);
    const csv = [columns, ...rows].map((row) => row.map(quote).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'atelier-qr-guest-registrations.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const user = await window.ScanProgram.requireAuthClient({ adminOnly: true });
    if (!user) return;

    try {
      const stats = await window.api.get('/api/admin/stats');
      document.getElementById('stats-grid').innerHTML = renderStats(stats);
      await Promise.all([loadProgrammes(), loadUsers(), loadGuestScans()]);
      document.getElementById('download-guest-scans').addEventListener('click', downloadGuestScans);
      document.getElementById('loading').style.display = 'none';
      document.getElementById('admin-content').style.display = 'block';
    } catch (err) {
      window.showToast(err.message, 'error');
    }
  });
})();
