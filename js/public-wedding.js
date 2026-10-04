(function () {
  function esc(value) {
    return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function render(content) {
    const c = content;
    const names = [c.brideName, c.groomName].filter(Boolean).join(' & ') || 'Our Wedding';

    const scheduleHtml = (c.schedule || [])
      .map((item) => `<li><span class="w-time">${esc(item.time)}</span><span><strong>${esc(item.title)}</strong>${item.speaker || item.role ? `<small style="display:block;margin-top:5px;color:#777">${esc(item.speaker)}${item.speaker && item.role ? ' · ' : ''}${esc(item.role)}</small>` : ''}${item.details ? `<small style="display:block;margin-top:5px;color:#777">${esc(item.details).replace(/\n/g, '<br>')}</small>` : ''}</span></li>`)
      .join('');

    const partyHtml = (c.party || [])
      .map(
        (p) => `
        <div>
          ${p.photo ? `<img src="${esc(p.photo)}" alt="${esc(p.name)}">` : '<div class="placeholder"></div>'}
          <div>${esc(p.name)}</div>
          <div class="role">${esc(p.role)}</div>
        </div>`
      )
      .join('');

    const galleryHtml = (c.gallery || []).map((url) => `<img src="${esc(url)}" alt="Wedding photo">`).join('');

    const venueLines = [c.venue, c.address, c.city].filter(Boolean).map(esc).join('<br>');
    const mapUrl = /^https?:\/\//i.test(c.mapUrl || '') ? c.mapUrl : '';

    return `
      <section class="w-hero">
        ${c.coverImage ? `<img src="${esc(c.coverImage)}" alt="Programme cover artwork" style="width:min(100%,520px);max-height:280px;object-fit:cover;margin:0 auto 20px;display:block;">` : ''}
        <div class="tagline">You're Invited</div>
        <h1 class="w-names">${esc(names)}</h1>
        <div class="heart">❤</div>
        <div class="date">${formatDate(c.date)}${c.time ? ` at ${esc(c.time)}` : ''}</div>
        <div class="place">${esc(c.city)}</div>
      </section>

      ${c.welcomeMessage ? `<section class="w-section"><h2>Welcome</h2><p>${esc(c.welcomeMessage).replace(/\n/g, '<br>')}</p></section>` : ''}

      ${c.story ? `<section class="w-section"><h2>Our Story</h2><p>${esc(c.story).replace(/\n/g, '<br>')}</p></section>` : ''}

      ${scheduleHtml ? `<section class="w-section"><h2>Today's Programme</h2><ul class="w-timeline">${scheduleHtml}</ul></section>` : ''}

      ${partyHtml ? `<section class="w-section"><h2>Wedding Party</h2><div class="w-party-grid">${partyHtml}</div></section>` : ''}

      ${galleryHtml ? `<section class="w-section"><h2>Gallery</h2><div class="w-gallery">${galleryHtml}</div></section>` : ''}

      ${venueLines || mapUrl ? `
      <section class="w-section">
        <h2>Venue</h2>
        <div class="w-info-grid">
          <div class="w-info-item">
            ${venueLines ? `<p>${venueLines}</p>` : ''}
            ${mapUrl ? `<a href="${esc(mapUrl)}" target="_blank" rel="noopener">Get Directions →</a>` : ''}
          </div>
        </div>
      </section>` : ''}

      <div class="w-footer">
        <p>Thank you for celebrating with us.</p>
        <a class="btn btn-secondary" href="https://wa.me/?text=${encodeURIComponent(window.location.href)}" target="_blank" rel="noopener">💬 Share on WhatsApp</a>
      </div>
    `;
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const slug = window.ScanProgramTracking.slugFromPath();
    const loading = document.getElementById('loading');
    const content = document.getElementById('content');

    try {
      await window.ScanProgramTracking.collectGuestDetails('wedding', slug);
      const data = await window.api.get(`/api/public/wedding/${slug}`);
      document.body.setAttribute('data-template', data.template || 'elegant');
      document.title = `${data.content.brideName || ''} & ${data.content.groomName || ''} — Wedding Programme`.trim();
      content.innerHTML = render(data.content);
      loading.style.display = 'none';
      content.style.display = 'block';
      window.ScanProgramTracking.trackView('wedding', slug);
    } catch (err) {
      loading.style.display = 'none';
      content.style.display = 'block';
      content.innerHTML = `<div class="w-notfound"><h2>💍 This programme isn't available</h2><p>It may be unpublished or the link may be incorrect.</p></div>`;
    }
  });
})();
