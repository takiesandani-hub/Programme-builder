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

    let scheduleItems = content.schedule || [];
    let partyItems = content.party || [];
    let galleryUrls = content.gallery || [];

    const autosaver = EC.createAutosaver({
      programmeId: id,
      statusEl,
      getContent: () => ({
        ...EC.readSimpleFields(formEl),
        schedule: scheduleItems,
        party: partyItems,
        gallery: galleryUrls,
      }),
      getExtra: () => ({ template: templateSelect.value }),
      onSaved: () => preview && preview.refreshPreview(),
    });

    formEl.addEventListener('input', (e) => {
      if (e.target.closest('.list-item') || e.target.closest('#gallery-grid')) return;
      autosaver.notifyChange();
    });
    templateSelect.addEventListener('change', () => autosaver.notifyChange());

    EC.createRepeatingList({
      listEl: document.getElementById('schedule-list'),
      addBtn: document.getElementById('add-schedule-item'),
      items: scheduleItems,
      emptyMessage: 'No events yet. Add your first one below.',
      createEmptyItem: () => ({ id: EC.uid(), time: '', title: '', speaker: '', role: '', details: '' }),
      renderFields: (item) => `
        <div class="field-row">
          <div class="field">
            <label>Time</label>
            <input type="time" data-field="time" value="${esc(item.time)}">
          </div>
          <div class="field">
            <label>Event</label>
            <input type="text" data-field="title" value="${esc(item.title)}" placeholder="e.g. Ceremony">
          </div>
        </div>
        <div class="field-row">
          <div class="field">
            <label>Speaker / person responsible</label>
            <input type="text" data-field="speaker" value="${esc(item.speaker)}">
          </div>
          <div class="field">
            <label>Role</label>
            <input type="text" data-field="role" value="${esc(item.role)}">
          </div>
        </div>
        <div class="field">
          <label>Details</label>
          <textarea data-field="details" rows="2">${esc(item.details)}</textarea>
        </div>
      `,
      onChange: (items) => {
        scheduleItems = items;
        autosaver.notifyChange();
      },
    });

    EC.createRepeatingList({
      listEl: document.getElementById('party-list'),
      addBtn: document.getElementById('add-party-item'),
      items: partyItems,
      emptyMessage: 'No one added yet.',
      createEmptyItem: () => ({ id: EC.uid(), name: '', role: '', photo: '' }),
      renderFields: (item) => `
        <div class="field-row">
          <div class="field">
            <label>Name</label>
            <input type="text" data-field="name" value="${esc(item.name)}">
          </div>
          <div class="field">
            <label>Role</label>
            <input type="text" data-field="role" value="${esc(item.role)}" placeholder="e.g. Maid of Honour">
          </div>
        </div>
        <div class="field">
          <label>Photo</label>
          <div class="image-field" data-image-field="photo">
            <img class="image-preview" src="${item.photo || ''}" style="${item.photo ? '' : 'display:none'}">
            <input type="file" accept="image/*" data-image-input>
            <input type="hidden" data-field="photo" value="${esc(item.photo)}">
          </div>
        </div>
      `,
      onChange: (items) => {
        partyItems = items;
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
      publicPath: programme.publicPath || `/w/${programme.slug}`,
      publishBtn: document.getElementById('publish-btn'),
      previewFrame: document.getElementById('preview-frame'),
      mobilePreviewBtn: document.getElementById('mobile-preview-btn'),
    });
    document.getElementById('publish-btn').disabled = false;
    statusEl.textContent = 'Saved ✓';
  });
})();
