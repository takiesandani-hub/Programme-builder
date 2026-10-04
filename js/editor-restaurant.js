(function () {
  const EC = window.EditorCommon;
  const TAGS = [
    { key: 'vegetarian', label: '🌱 Vegetarian' },
    { key: 'spicy', label: '🌶️ Spicy' },
    { key: 'popular', label: '⭐ Popular' },
    { key: 'new', label: '🆕 New' },
  ];

  function esc(value) {
    return String(value || '').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }

  function renderTagCheckboxes() {
    return TAGS.map((t) => `<label><input type="checkbox" data-tag="${t.key}"> ${t.label}</label>`).join('');
  }

  function wireTagCheckboxes(itemEl, menuItem, onDirty) {
    itemEl.querySelectorAll('[data-tag]').forEach((cb) => {
      cb.checked = (menuItem.tags || []).includes(cb.dataset.tag);
      cb.addEventListener('change', () => {
        const tags = new Set(menuItem.tags || []);
        if (cb.checked) tags.add(cb.dataset.tag);
        else tags.delete(cb.dataset.tag);
        menuItem.tags = Array.from(tags);
        onDirty();
      });
    });
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

    if (content.logo) {
      const preview = document.getElementById('logo-preview');
      preview.src = content.logo;
      preview.style.display = '';
    }

    let hoursItems = content.hours || [];
    let categories = content.categories || [];

    const autosaver = EC.createAutosaver({
      programmeId: id,
      statusEl,
      getContent: () => ({
        ...EC.readSimpleFields(formEl),
        hours: hoursItems,
        categories,
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
      listEl: document.getElementById('hours-list'),
      addBtn: document.getElementById('add-hours-item'),
      items: hoursItems,
      emptyMessage: 'No hours added yet.',
      createEmptyItem: () => ({ id: EC.uid(), day: '', hours: '' }),
      renderFields: (item) => `
        <div class="field-row">
          <div class="field">
            <label>Day(s)</label>
            <input type="text" data-field="day" value="${esc(item.day)}" placeholder="e.g. Monday - Friday">
          </div>
          <div class="field">
            <label>Hours</label>
            <input type="text" data-field="hours" value="${esc(item.hours)}" placeholder="e.g. 08:00 - 22:00">
          </div>
        </div>
      `,
      onChange: () => autosaver.notifyChange(),
    });

    EC.createRepeatingList({
      listEl: document.getElementById('categories-list'),
      addBtn: document.getElementById('add-category'),
      items: categories,
      itemClassName: 'category-card',
      emptyMessage: 'No categories yet. Add your first one, e.g. "Starters".',
      createEmptyItem: () => ({ id: EC.uid(), name: '', items: [] }),
      renderFields: (category) => `
        <div class="field">
          <label>Category Name</label>
          <input type="text" data-field="name" value="${esc(category.name)}" placeholder="e.g. Starters">
        </div>
        <div class="nested-list">
          <div class="list-items" data-role="items-list"></div>
          <button type="button" class="btn btn-secondary btn-sm" data-role="add-item">+ Add Item</button>
        </div>
      `,
      onChange: () => autosaver.notifyChange(),
      afterRenderItem: (categoryEl, category) => {
        category.items = category.items || [];
        EC.createRepeatingList({
          listEl: categoryEl.querySelector('[data-role="items-list"]'),
          addBtn: categoryEl.querySelector('[data-role="add-item"]'),
          items: category.items,
          emptyMessage: 'No items yet.',
          createEmptyItem: () => ({ id: EC.uid(), name: '', description: '', price: '', image: '', tags: [] }),
          renderFields: (menuItem) => `
            <div class="field-row">
              <div class="field">
                <label>Name</label>
                <input type="text" data-field="name" value="${esc(menuItem.name)}" placeholder="e.g. Chicken Wings">
              </div>
              <div class="field">
                <label>Price (R)</label>
                <input type="text" data-field="price" value="${esc(menuItem.price)}" placeholder="e.g. 65">
              </div>
            </div>
            <div class="field">
              <label>Description</label>
              <textarea data-field="description" rows="2">${esc(menuItem.description)}</textarea>
            </div>
            <div class="field">
              <label>Image</label>
              <div class="image-field" data-image-field="image">
                <img class="image-preview" src="${menuItem.image || ''}" style="${menuItem.image ? '' : 'display:none'}">
                <input type="file" accept="image/*" data-image-input>
                <input type="hidden" data-field="image" value="${esc(menuItem.image)}">
              </div>
            </div>
            <div class="field">
              <label>Tags</label>
              <div class="tag-checks">${renderTagCheckboxes()}</div>
            </div>
          `,
          onChange: () => autosaver.notifyChange(),
          afterRenderItem: (itemEl, menuItem) => wireTagCheckboxes(itemEl, menuItem, () => autosaver.notifyChange()),
        });
      },
    });

    const preview = EC.setupPublishUI({
      programmeId: id,
      initialStatus: programme.status,
      publicPath: programme.publicPath || `/m/${programme.slug}`,
      publishBtn: document.getElementById('publish-btn'),
      previewFrame: document.getElementById('preview-frame'),
      mobilePreviewBtn: document.getElementById('mobile-preview-btn'),
    });
    document.getElementById('publish-btn').disabled = false;
    statusEl.textContent = 'Saved ✓';
  });
})();
