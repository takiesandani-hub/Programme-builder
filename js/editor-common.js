(function () {
  function qs(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function uid() {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function showCoverArtwork(url, target) {
    if (!url || !target) return;
    const image = document.createElement('img');
    image.src = url;
    image.alt = 'Uploaded programme cover artwork';
    image.style.cssText = 'display:block;max-width:100%;max-height:240px;object-fit:cover;margin:14px 0;border:1px solid var(--color-border);';
    target.appendChild(image);
  }

  function debounce(fn, delay) {
    let timeout = null;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  }

  function readSimpleFields(root) {
    const result = {};
    root.querySelectorAll('[data-field]').forEach((el) => {
      if (el.closest('.list-item')) return;
      result[el.dataset.field] = el.value;
    });
    return result;
  }

  function bindImageFields(root, onChange) {
    root.querySelectorAll('[data-image-field]').forEach((wrap) => {
      if (wrap.dataset.bound === 'true') return;
      wrap.dataset.bound = 'true';
      const field = wrap.dataset.imageField;
      const fileInput = wrap.querySelector('[data-image-input]');
      const hiddenInput = wrap.querySelector('[data-field]');
      const preview = wrap.querySelector('.image-preview');

      fileInput.addEventListener('change', async () => {
        const file = fileInput.files[0];
        if (!file) return;
        try {
          const { url } = await window.api.upload('/api/uploads', file);
          if (hiddenInput) hiddenInput.value = url;
          if (preview) {
            preview.src = url;
            preview.style.display = '';
          }
          onChange(field, url, wrap);
        } catch (err) {
          window.showToast(err.message, 'error');
        } finally {
          fileInput.value = '';
        }
      });
    });
  }

  function createRepeatingList({ listEl, addBtn, items, renderFields, createEmptyItem, onChange, emptyMessage, afterRenderItem, itemClassName }) {
    function renderAll() {
      listEl.innerHTML = '';
      if (items.length === 0 && emptyMessage) {
        const p = document.createElement('p');
        p.style.cssText = 'color:var(--color-text-muted); font-size:14px;';
        p.textContent = emptyMessage;
        listEl.appendChild(p);
      }
      items.forEach((item, index) => {
        const itemEl = document.createElement('div');
        itemEl.className = itemClassName ? `list-item ${itemClassName}` : 'list-item';
        itemEl.innerHTML = `
          <div class="list-item-header">
            <button type="button" class="icon-btn" data-action="up" ${index === 0 ? 'disabled' : ''} title="Move up">↑</button>
            <button type="button" class="icon-btn" data-action="down" ${index === items.length - 1 ? 'disabled' : ''} title="Move down">↓</button>
            <button type="button" class="icon-btn" data-action="delete" title="Delete">🗑</button>
          </div>
          <div class="list-item-fields">${renderFields(item)}</div>
        `;

        itemEl.querySelector('[data-action="up"]').addEventListener('click', () => {
          if (index === 0) return;
          [items[index - 1], items[index]] = [items[index], items[index - 1]];
          renderAll();
          onChange(items);
        });
        itemEl.querySelector('[data-action="down"]').addEventListener('click', () => {
          if (index === items.length - 1) return;
          [items[index + 1], items[index]] = [items[index], items[index + 1]];
          renderAll();
          onChange(items);
        });
        itemEl.querySelector('[data-action="delete"]').addEventListener('click', () => {
          items.splice(index, 1);
          renderAll();
          onChange(items);
        });

        itemEl.querySelectorAll('[data-field]').forEach((fieldEl) => {
          const evt = fieldEl.tagName === 'SELECT' ? 'change' : 'input';
          fieldEl.addEventListener(evt, () => {
            item[fieldEl.dataset.field] = fieldEl.value;
            onChange(items);
          });
        });

        bindImageFields(itemEl, (field, url) => {
          item[field] = url;
          onChange(items);
        });

        listEl.appendChild(itemEl);

        if (afterRenderItem) afterRenderItem(itemEl, item, index);
      });
    }

    addBtn.addEventListener('click', () => {
      items.push(createEmptyItem());
      renderAll();
      onChange(items);
    });

    renderAll();
    return { renderAll };
  }

  function createGalleryManager({ gridEl, uploadInput, urls, onChange }) {
    function renderAll() {
      gridEl.innerHTML = '';
      urls.forEach((url, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.innerHTML = `
          <img src="${url}" alt="Gallery photo ${index + 1}">
          <div class="gallery-controls">
            <button type="button" data-action="left" ${index === 0 ? 'disabled' : ''} title="Move left">←</button>
            <button type="button" data-action="delete" title="Delete">✕</button>
            <button type="button" data-action="right" ${index === urls.length - 1 ? 'disabled' : ''} title="Move right">→</button>
          </div>
        `;
        item.querySelector('[data-action="left"]').addEventListener('click', () => {
          if (index === 0) return;
          [urls[index - 1], urls[index]] = [urls[index], urls[index - 1]];
          renderAll();
          onChange(urls);
        });
        item.querySelector('[data-action="right"]').addEventListener('click', () => {
          if (index === urls.length - 1) return;
          [urls[index + 1], urls[index]] = [urls[index], urls[index + 1]];
          renderAll();
          onChange(urls);
        });
        item.querySelector('[data-action="delete"]').addEventListener('click', () => {
          urls.splice(index, 1);
          renderAll();
          onChange(urls);
        });
        gridEl.appendChild(item);
      });
    }

    uploadInput.addEventListener('change', async () => {
      const files = Array.from(uploadInput.files || []);
      for (const file of files) {
        try {
          const { url } = await window.api.upload('/api/uploads', file);
          urls.push(url);
        } catch (err) {
          window.showToast(err.message, 'error');
        }
      }
      uploadInput.value = '';
      renderAll();
      onChange(urls);
    });

    renderAll();
    return { renderAll };
  }

  function createAutosaver({ programmeId, getContent, getExtra, statusEl, delay, onSaved }) {
    let timeout = null;

    function setStatus(text) {
      if (statusEl) statusEl.textContent = text;
    }

    async function saveNow() {
      setStatus('Saving…');
      try {
        const body = { content: getContent() };
        if (getExtra) Object.assign(body, getExtra());
        await window.api.put(`/api/programmes/${programmeId}`, body);
        setStatus('Saved ✓');
        if (onSaved) onSaved();
      } catch (err) {
        setStatus('Could not save');
        window.showToast(err.message, 'error');
      }
    }

    function notifyChange() {
      setStatus('Unsaved changes…');
      clearTimeout(timeout);
      timeout = setTimeout(saveNow, delay || 900);
    }

    return { notifyChange, saveNow };
  }

  function showPublishSuccessModal({ programmeId, publicPath }) {
    const publicUrl = `${window.location.origin}${publicPath}`;
    const qrUrl = `/api/programmes/${programmeId}/qrcode.png`;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-box publish-result" role="dialog" aria-modal="true">
        <h3>🎉 Your programme is ready!</h3>
        <img src="${qrUrl}" alt="QR code" class="qr-preview">
        <div class="publish-link-box">${publicUrl}</div>
        <div style="display:flex; flex-direction:column; gap: var(--space-3);">
          <a class="btn btn-secondary btn-block" target="_blank" rel="noopener" href="${publicUrl}">👁️ View Public Page</a>
          <a class="btn btn-secondary btn-block" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(publicUrl)}">💬 Share on WhatsApp</a>
          <button type="button" class="btn btn-secondary btn-block" data-action="copy">🔗 Copy Link</button>
          <a class="btn btn-primary btn-block" href="${qrUrl}" download="qrcode.png">⬇️ Download QR Code</a>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" data-action="close">Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });
    overlay.querySelector('[data-action="close"]').addEventListener('click', () => overlay.remove());
    overlay.querySelector('[data-action="copy"]').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(publicUrl);
        window.showToast('Link copied to clipboard.', 'success');
      } catch (err) {
        window.showToast('Could not copy link.', 'error');
      }
    });
  }

  function setupPublishUI({ programmeId, initialStatus, publicPath, publishBtn, previewFrame, mobilePreviewBtn }) {
    let status = initialStatus;

    function updateButton() {
      publishBtn.textContent = status === 'published' ? 'Unpublish' : 'Publish Programme';
      publishBtn.className = status === 'published' ? 'btn btn-secondary' : 'btn btn-primary';
    }

    if (previewFrame) previewFrame.src = publicPath;
    if (mobilePreviewBtn) {
      mobilePreviewBtn.href = publicPath;
      mobilePreviewBtn.target = '_blank';
      mobilePreviewBtn.rel = 'noopener';
    }

    updateButton();

    publishBtn.addEventListener('click', async () => {
      publishBtn.disabled = true;
      try {
        if (status === 'published') {
          await window.api.post(`/api/programmes/${programmeId}/unpublish`);
          status = 'draft';
          window.showToast('Programme unpublished. Only you can preview it now.', 'success');
          updateButton();
        } else {
          await window.api.post(`/api/programmes/${programmeId}/publish`);
          status = 'published';
          updateButton();
          showPublishSuccessModal({ programmeId, publicPath });
        }
      } catch (err) {
        window.showToast(err.message, 'error');
      } finally {
        publishBtn.disabled = false;
      }
    });

    function refreshPreview() {
      if (!previewFrame) return;
      try {
        previewFrame.contentWindow.location.reload();
      } catch (err) {
        previewFrame.src = publicPath;
      }
    }

    return { refreshPreview };
  }

  window.EditorCommon = {
    qs,
    uid,
    showCoverArtwork,
    debounce,
    readSimpleFields,
    bindImageFields,
    createRepeatingList,
    createGalleryManager,
    createAutosaver,
    setupPublishUI,
    showPublishSuccessModal,
  };
})();
