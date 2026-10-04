(function () {
  const EC = window.EditorCommon;

  function esc(value) {
    return String(value || '').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const user = await window.ScanProgram.requireAuthClient();
    if (!user) return;

    const id = EC.qs('id');
    if (!id) {
      window.location.href = '/dashboard.html';
      return;
    }

    const statusEl = document.getElementById('save-status');
    const formEl = document.querySelector('.editor-form');
    const templateSelect = document.getElementById('template');

    let programme;
    try {
      const result = await window.api.get(`/api/programmes/${id}`);
      programme = result.programme;
    } catch (err) {
      window.showToast(err.message, 'error');
      window.location.href = '/dashboard.html';
      return;
    }

    const content = programme.content;
    EC.showCoverArtwork(content.coverImage, formEl.querySelector('.editor-form-section'));

    Object.entries(content).forEach(([key, value]) => {
      const el = formEl.querySelector(`[data-field="${key}"]`);
      if (el && typeof value !== 'object') el.value = value;
    });
    templateSelect.value = programme.template;

    if (content.photo) {
      const preview = document.getElementById('photo-preview');
      preview.src = content.photo;
      preview.style.display = '';
    }

    let orderItems = content.orderOfService || [];
    let tributeItems = content.tributes || [];
    let galleryUrls = content.gallery || [];

    const autosaver = EC.createAutosaver({
      programmeId: id,
      statusEl,
      getContent: () => ({
        ...EC.readSimpleFields(formEl),
        orderOfService: orderItems,
        tributes: tributeItems,
        gallery: galleryUrls,
      }),
      getExtra: () => ({ template: templateSelect.value }),
      onSaved: () => preview && preview.refreshPreview(),
    });

    EC.bindImageFields(formEl, () => autosaver.notifyChange());

    formEl.addEventListener('input', (e) => {
      if (e.target.closest('.list-item') || e.target.closest('#gallery-grid')) return;
      autosaver.notifyChange();
    });
    templateSelect.addEventListener('change', () => autosaver.notifyChange());

    EC.createRepeatingList({
      listEl: document.getElementById('order-list'),
      addBtn: document.getElementById('add-order-item'),
      items: orderItems,
      emptyMessage: 'No items yet. Add the first part of the service below.',
      createEmptyItem: () => ({ id: EC.uid(), time: '', title: '', speaker: '', role: '', details: '' }),
      renderFields: (item) => `
        <div class="field-row">
          <div class="field"><label>Time</label><input type="time" data-field="time" value="${esc(item.time)}"></div>
          <div class="field"><label>Activity</label><input type="text" data-field="title" value="${esc(item.title)}" placeholder="e.g. Opening Prayer"></div>
        </div>
        <div class="field-row">
          <div class="field"><label>Speaker / person responsible</label><input type="text" data-field="speaker" value="${esc(item.speaker)}"></div>
          <div class="field"><label>Role</label><input type="text" data-field="role" value="${esc(item.role)}"></div>
        </div>
        <div class="field"><label>Details</label><textarea data-field="details" rows="2">${esc(item.details)}</textarea></div>
      `,
      onChange: (items) => {
        orderItems = items;
        autosaver.notifyChange();
      },
    });

    EC.createRepeatingList({
      listEl: document.getElementById('tributes-list'),
      addBtn: document.getElementById('add-tribute-item'),
      items: tributeItems,
      emptyMessage: 'No tributes yet.',
      createEmptyItem: () => ({ id: EC.uid(), author: '', message: '' }),
      renderFields: (item) => `
        <div class="field">
          <label>From</label>
          <input type="text" data-field="author" value="${esc(item.author)}" placeholder="e.g. The Family">
        </div>
        <div class="field">
          <label>Message</label>
          <textarea data-field="message" rows="3">${esc(item.message)}</textarea>
        </div>
      `,
      onChange: (items) => {
        tributeItems = items;
        autosaver.notifyChange();
      },
    });

    EC.createGalleryManager({
      gridEl: document.getElementById('gallery-grid'),
      uploadInput: document.getElementById('gallery-upload'),
      urls: galleryUrls,
      onChange: (urls) => {
        galleryUrls = urls;
        autosaver.notifyChange();
      },
    });

    const preview = EC.setupPublishUI({
      programmeId: id,
      initialStatus: programme.status,
      publicPath: programme.publicPath || `/f/${programme.slug}`,
      publishBtn: document.getElementById('publish-btn'),
      previewFrame: document.getElementById('preview-frame'),
      mobilePreviewBtn: document.getElementById('mobile-preview-btn'),
    });
    document.getElementById('publish-btn').disabled = false;
    statusEl.textContent = 'Saved ✓';
  });
})();
