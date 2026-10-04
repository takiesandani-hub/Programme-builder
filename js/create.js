(function () {
  const EDITOR_PAGE = {
    wedding: 'editor-wedding.html',
    funeral: 'editor-funeral.html',
    restaurant: 'editor-restaurant.html',
    meeting: 'editor-meeting.html',
  };

  document.addEventListener('DOMContentLoaded', async () => {
    const user = await window.ScanProgram.requireAuthClient();
    if (!user) return;

    let selectedType = '';
    let busy = false;
    let draftId = null;
    const modeStep = document.getElementById('mode-step');
    const uploadStep = document.getElementById('upload-step');
    const errorEl = document.getElementById('flow-error');

    function chooseType(card) {
      if (selectedType && selectedType !== card.dataset.type) draftId = null;
      selectedType = card.dataset.type;
      errorEl.textContent = '';
      document.querySelectorAll('.type-card').forEach((item) => {
        item.setAttribute('aria-pressed', String(item === card));
      });
      modeStep.hidden = false;
      uploadStep.hidden = true;
      modeStep.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    document.querySelectorAll('.type-card').forEach((card) => {
      card.setAttribute('role', 'button');
      card.setAttribute('aria-pressed', 'false');
      card.tabIndex = 0;
      card.addEventListener('click', () => chooseType(card));
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          chooseType(card);
        }
      });
    });

    async function createProgramme(mode, imageFile) {
      if (busy || !selectedType) return;
      busy = true;
      errorEl.textContent = '';
      const buttons = document.querySelectorAll('.mode-card, #upload-continue, #back-to-options');
      buttons.forEach((button) => { button.disabled = true; });
      const continueButton = document.getElementById('upload-continue');
      if (mode === 'upload') continueButton.textContent = 'Uploading…';
      try {
        if (!draftId) {
          const result = await window.api.post('/api/programmes', { type: selectedType });
          draftId = result.id;
        }
        if (mode === 'programme') {
          window.location.href = `/${EDITOR_PAGE[selectedType]}?id=${encodeURIComponent(draftId)}`;
          return;
        }
        if (mode === 'upload') {
          const { url } = await window.api.upload('/api/uploads', imageFile);
          await window.api.put(`/api/programmes/${draftId}`, { content: { coverImage: url } });
          window.location.href = `/${EDITOR_PAGE[selectedType]}?id=${encodeURIComponent(draftId)}&mode=upload`;
          return;
        }
        window.location.href = `/atelier.html?id=${encodeURIComponent(draftId)}&type=${encodeURIComponent(selectedType)}`;
      } catch (err) {
        errorEl.textContent = `${err.message} Your draft may already be in your dashboard.`;
        buttons.forEach((button) => { button.disabled = false; });
        continueButton.textContent = 'Upload & continue';
        busy = false;
      }
    }

    document.querySelectorAll('.mode-card').forEach((button) => {
      button.addEventListener('click', () => {
        if (button.dataset.mode === 'programme' || button.dataset.mode === 'design') {
          createProgramme(button.dataset.mode, null);
          return;
        }
        modeStep.hidden = true;
        uploadStep.hidden = false;
        uploadStep.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });

    document.getElementById('back-to-options').addEventListener('click', () => {
      uploadStep.hidden = true;
      modeStep.hidden = false;
    });

    document.getElementById('upload-continue').addEventListener('click', () => {
      const file = document.getElementById('artwork-file').files[0];
      if (!file) {
        errorEl.textContent = 'Choose an artwork image to continue.';
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
        errorEl.textContent = 'Choose a JPEG, PNG, WEBP or GIF image.';
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        errorEl.textContent = 'This image is over 8 MB. Choose a smaller image.';
        return;
      }
      createProgramme('upload', file);
    });
  });
})();
