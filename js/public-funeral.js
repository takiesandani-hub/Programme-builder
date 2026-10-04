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

    const orderHtml = (c.orderOfService || []).map((item) => `<li>${item.time ? `<strong>${esc(item.time)}</strong> ` : ''}${esc(item.title)}${item.speaker || item.role ? `<small style="display:block;margin:4px 0 0">${esc(item.speaker)}${item.speaker && item.role ? ' · ' : ''}${esc(item.role)}</small>` : ''}${item.details ? `<small style="display:block;margin:4px 0 0">${esc(item.details).replace(/\n/g, '<br>')}</small>` : ''}</li>`).join('');

    const tributesHtml = (c.tributes || [])
      .map(
        (t) => `
        <div class="f-tribute">
          <div class="author">${esc(t.author || 'From the Family')}</div>
          <p>${esc(t.message).replace(/\n/g, '<br>')}</p>
        </div>`
      )
      .join('');

    const galleryHtml = (c.gallery || []).map((url) => `<img src="${esc(url)}" alt="Photo">`).join('');

    const funeralLines = [c.venue, c.burialLocation].filter(Boolean).map(esc).join('<br>');
    const funeralDateLine = [formatDate(c.funeralDate), c.funeralTime].filter(Boolean).join(' at ');
    const mapUrl = /^https?:\/\//i.test(c.mapUrl || '') ? c.mapUrl : '';

    return `
      <section class="f-hero">
        <div class="tagline">In Loving Memory</div>
        ${c.coverImage ? `<img src="${esc(c.coverImage)}" alt="Programme cover artwork" style="width:min(100%,520px);max-height:250px;object-fit:cover;margin:0 auto 20px;display:block;">` : ''}
        ${c.photo ? `<img src="${esc(c.photo)}" alt="${esc(c.fullName)}">` : '<div class="placeholder-photo"></div>'}
        <h1 class="f-name">${esc(c.fullName) || 'In Loving Memory'}</h1>
        <div class="f-dates">${formatDate(c.dob)} – ${formatDate(c.dop)}${c.age ? ` · Age ${esc(c.age)}` : ''}</div>
        <div class="f-location">${esc(c.location)}</div>
      </section>

      ${c.memorialMessage ? `<section class="f-section"><p style="text-align:center; font-style:italic;">${esc(c.memorialMessage).replace(/\n/g, '<br>')}</p></section>` : ''}

      ${c.biography ? `<section class="f-section"><h2>Life &amp; Memories</h2><p>${esc(c.biography).replace(/\n/g, '<br>')}</p></section>` : ''}

      ${orderHtml ? `<section class="f-section"><h2>Order of Service</h2><ul class="f-order-list">${orderHtml}</ul></section>` : ''}

      ${tributesHtml ? `<section class="f-section"><h2>Tributes</h2>${tributesHtml}</section>` : ''}

      ${galleryHtml ? `<section class="f-section"><h2>Gallery</h2><div class="f-gallery">${galleryHtml}</div></section>` : ''}

      ${funeralDateLine || funeralLines || mapUrl || c.additionalInfo ? `
      <section class="f-section">
        <h2>Funeral Details</h2>
        <div class="f-info-item">
          ${funeralDateLine ? `<p><strong>${funeralDateLine}</strong></p>` : ''}
          ${funeralLines ? `<p>${funeralLines}</p>` : ''}
          ${mapUrl ? `<p><a href="${esc(mapUrl)}" target="_blank" rel="noopener">Get Directions →</a></p>` : ''}
          ${c.additionalInfo ? `<p>${esc(c.additionalInfo).replace(/\n/g, '<br>')}</p>` : ''}
        </div>
      </section>` : ''}

      <div class="f-footer">
        <p>With love and remembrance.</p>
      </div>
    `;
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const slug = window.ScanProgramTracking.slugFromPath();
    const loading = document.getElementById('loading');
    const content = document.getElementById('content');

    try {
      await window.ScanProgramTracking.collectGuestDetails('funeral', slug);
      const data = await window.api.get(`/api/public/funeral/${slug}`);
      document.body.setAttribute('data-template', data.template || 'classic');
      document.title = `In Loving Memory of ${data.content.fullName || ''}`.trim();
      content.innerHTML = render(data.content);
      loading.style.display = 'none';
      content.style.display = 'block';
      window.ScanProgramTracking.trackView('funeral', slug);
    } catch (err) {
      loading.style.display = 'none';
      content.style.display = 'block';
      content.innerHTML = `<div class="f-notfound"><h2>🕊️ This programme isn't available</h2><p>It may be unpublished or the link may be incorrect.</p></div>`;
    }
  });
})();
