(function () {
  const EC = window.EditorCommon;
  const esc = (value) => String(value || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

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
      ({ programme } = await window.api.get(`/api/programmes/${encodeURIComponent(id)}`));
    } catch (err) {
      window.showToast(err.message, 'error');
      window.location.href = '/dashboard.html';
      return;
    }

    const content = programme.content || {};
    Object.entries(content).forEach(([key, value]) => {
      const field = formEl.querySelector(`[data-field="${key}"]`);
      if (field && typeof value !== 'object') field.value = value;
    });
    templateSelect.value = programme.template;
    if (content.coverImage) {
      const preview = document.createElement('img');
      preview.className = 'cover-preview';
      preview.src = content.coverImage;
      preview.alt = 'Uploaded programme cover artwork';
      document.getElementById('cover-artwork').append(preview);
    }

    let schedule = Array.isArray(content.schedule) ? content.schedule : [];
    const preview = EC.setupPublishUI({
      programmeId: id,
      initialStatus: programme.status,
      publicPath: programme.publicPath || `/c/${programme.slug}`,
      publishBtn: document.getElementById('publish-btn'),
      previewFrame: document.getElementById('preview-frame'),
      mobilePreviewBtn: document.getElementById('mobile-preview-btn'),
    });
    const autosaver = EC.createAutosaver({
      programmeId: id,
      statusEl,
      getContent: () => ({ ...EC.readSimpleFields(formEl), schedule }),
      getExtra: () => ({ template: templateSelect.value }),
      onSaved: () => preview.refreshPreview(),
    });
    formEl.addEventListener('input', (event) => {
      if (!event.target.closest('.list-item')) autosaver.notifyChange();
    });
    templateSelect.addEventListener('change', () => autosaver.notifyChange());

    EC.createRepeatingList({
      listEl: document.getElementById('schedule-list'),
      addBtn: document.getElementById('add-schedule-item'),
      items: schedule,
      emptyMessage: 'No agenda items yet. Add the first session below.',
      createEmptyItem: () => ({ id: EC.uid(), time: '', title: '', speaker: '', role: '', details: '' }),
      renderFields: (item) => `
        <div class="field-row">
          <div class="field"><label>Time</label><input type="time" data-field="time" value="${esc(item.time)}"></div>
          <div class="field"><label>Session or activity</label><input data-field="title" value="${esc(item.title)}" placeholder="e.g. Opening address"></div>
        </div>
        <div class="field-row">
          <div class="field"><label>Speaker / person responsible</label><input data-field="speaker" value="${esc(item.speaker)}"></div>
          <div class="field"><label>Role</label><input data-field="role" value="${esc(item.role)}" placeholder="e.g. Keynote speaker"></div>
        </div>
        <div class="field"><label>Details</label><textarea data-field="details" rows="2">${esc(item.details)}</textarea></div>
      `,
      onChange: (items) => { schedule = items; autosaver.notifyChange(); },
    });

    document.getElementById('publish-btn').disabled = false;
    statusEl.textContent = 'Saved ✓';
  });
})();
