(function () {
  const TAG_LABELS = { vegetarian: '🌱 Vegetarian', spicy: '🌶️ Spicy', popular: '⭐ Popular', new: '🆕 New' };

  function esc(value) {
    return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function formatPrice(price) {
    if (!price) return '';
    const num = String(price).replace(/[^0-9.]/g, '');
    return num ? `R${num}` : esc(price);
  }

  function renderItem(item) {
    const tags = (item.tags || []).map((t) => `<span class="r-tag">${TAG_LABELS[t] || t}</span>`).join('');
    return `
      <div class="r-item">
        ${item.image ? `<img src="${esc(item.image)}" alt="${esc(item.name)}">` : ''}
        <div style="flex:1;">
          <div class="r-item-header">
            <span>${esc(item.name)}</span>
            <span class="price">${formatPrice(item.price)}</span>
          </div>
          ${item.description ? `<p>${esc(item.description)}</p>` : ''}
          ${tags ? `<div class="r-tags">${tags}</div>` : ''}
        </div>
      </div>
    `;
  }

  function render(content) {
    const c = content;
    const categories = c.categories || [];

    const popularItems = [];
    categories.forEach((cat) => (cat.items || []).forEach((item) => {
      if ((item.tags || []).includes('popular')) popularItems.push(item);
    }));

    const categoriesHtml = categories
      .filter((cat) => (cat.items || []).length > 0)
      .map(
        (cat) => `
        <section class="r-section">
          <h2>${esc(cat.name)}</h2>
          <div class="r-items">${(cat.items || []).map(renderItem).join('')}</div>
        </section>`
      )
      .join('');

    const hoursHtml = (c.hours || [])
      .map((h) => `<div><strong>${esc(h.day)}</strong><br>${esc(h.hours)}</div>`)
      .join('');
    const mapUrl = /^https?:\/\//i.test(c.mapUrl || '') ? c.mapUrl : '';

    return `
      <section class="r-hero">
        ${c.coverImage ? `<img src="${esc(c.coverImage)}" alt="Menu cover artwork" style="width:min(100%,520px);max-height:250px;object-fit:cover;margin:0 auto 20px;display:block;">` : ''}
        ${c.logo ? `<img src="${esc(c.logo)}" alt="${esc(c.name)}" class="logo">` : ''}
        <h1>${esc(c.name) || 'Restaurant Menu'}</h1>
        ${c.description ? `<p>${esc(c.description)}</p>` : ''}
      </section>

      ${popularItems.length ? `<section class="r-section"><h2>⭐ Popular</h2><div class="r-items">${popularItems.map(renderItem).join('')}</div></section>` : ''}

      ${categoriesHtml}

      <footer class="r-footer">
        <div class="r-footer-grid">
          ${c.location ? `<div><h3>📍 Location</h3><p>${esc(c.location)}</p></div>` : ''}
          ${hoursHtml ? `<div><h3>🕐 Opening Hours</h3>${hoursHtml}</div>` : ''}
        </div>
        ${c.contact ? `<a class="btn btn-secondary" href="tel:${esc(c.contact)}">📞 Call Restaurant</a>` : ''}
        ${mapUrl ? `<a class="btn btn-secondary" href="${esc(mapUrl)}" target="_blank" rel="noopener">🗺️ Get Directions</a>` : ''}
      </footer>
    `;
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const slug = window.ScanProgramTracking.slugFromPath();
    const loading = document.getElementById('loading');
    const content = document.getElementById('content');

    try {
      await window.ScanProgramTracking.collectGuestDetails('restaurant', slug);
      const data = await window.api.get(`/api/public/restaurant/${slug}`);
      document.body.setAttribute('data-template', data.template || 'modern');
      document.title = `${data.content.name || 'Restaurant Menu'} — ScanProgram`;
      content.innerHTML = render(data.content);
      loading.style.display = 'none';
      content.style.display = 'block';
      window.ScanProgramTracking.trackView('restaurant', slug);
    } catch (err) {
      loading.style.display = 'none';
      content.style.display = 'block';
      content.innerHTML = `<div class="r-notfound"><h2>🍽️ This menu isn't available</h2><p>It may be unpublished or the link may be incorrect.</p></div>`;
    }
  });
})();
