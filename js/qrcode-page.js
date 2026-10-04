(function () {
  const POSTER_HEADING = {
    wedding: 'Scan to View Our Wedding Programme',
    funeral: 'Scan to View the Memorial Programme',
    restaurant: 'Scan to View Our Menu',
    meeting: 'Scan to View the Event Programme',
  };

  function triggerDownload(href, filename) {
    const link = document.createElement('a');
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function drawPoster(canvas, qrImage, heading) {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#1f2430';
    ctx.textAlign = 'center';
    ctx.font = '700 56px Georgia, serif';
    wrapText(ctx, heading, canvas.width / 2, 160, 820, 66);

    const qrSize = 640;
    const qrX = (canvas.width - qrSize) / 2;
    const qrY = 380;
    ctx.strokeStyle = '#e8e5e0';
    ctx.lineWidth = 2;
    ctx.strokeRect(qrX - 20, qrY - 20, qrSize + 40, qrSize + 40);
    ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

    ctx.font = '600 34px Arial, sans-serif';
    ctx.fillStyle = '#6d28d9';
    ctx.fillText('No App Required', canvas.width / 2, qrY + qrSize + 90);

    ctx.font = '400 24px Arial, sans-serif';
    ctx.fillStyle = '#6b7280';
    ctx.fillText('Powered by ScanProgram', canvas.width / 2, canvas.height - 60);
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    const lines = [];
    words.forEach((word) => {
      const testLine = line ? `${line} ${word}` : word;
      if (ctx.measureText(testLine).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    });
    if (line) lines.push(line);
    const startY = y - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((l, i) => ctx.fillText(l, x, startY + i * lineHeight));
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const user = await window.ScanProgram.requireAuthClient();
    if (!user) return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) {
      window.location.href = '/dashboard.html';
      return;
    }

    let programme;
    try {
      const result = await window.api.get(`/api/programmes/${id}`);
      programme = result.programme;
    } catch (err) {
      window.showToast(err.message, 'error');
      window.location.href = '/dashboard.html';
      return;
    }

    const publicUrl = `${window.location.origin}${programme.publicPath}`;
    const qrUrl = `/api/programmes/${id}/qrcode.png`;

    // Fetch the QR PNG once up front (authenticated, same-origin) so the
    // download/poster buttons can act synchronously on click -- Chrome can
    // silently cancel a download if it happens after an async gap that
    // loses the click's user-activation.
    let qrObjectUrl = null;
    let qrImageEl = null;
    let qrReady = null;
    try {
      const res = await fetch(qrUrl, { credentials: 'include' });
      const blob = await res.blob();
      qrObjectUrl = URL.createObjectURL(blob);
      qrImageEl = new Image();
      qrReady = new Promise((resolve) => {
        qrImageEl.onload = resolve;
      });
      qrImageEl.src = qrObjectUrl;
    } catch (err) {
      window.showToast('Could not load QR code.', 'error');
    }

    document.getElementById('loading').style.display = 'none';
    document.getElementById('qr-content').style.display = 'block';
    document.getElementById('qr-image').src = qrObjectUrl || qrUrl;
    const downloadQrLink = document.getElementById('download-qr');
    downloadQrLink.href = qrObjectUrl || qrUrl;
    downloadQrLink.download = `${programme.slug}-qrcode.png`;
    document.getElementById('public-link').textContent = publicUrl;
    document.getElementById('whatsapp-share').href = `https://wa.me/?text=${encodeURIComponent(publicUrl)}`;

    if (programme.status !== 'published') {
      document.getElementById('not-published').style.display = 'block';
    }

    if (navigator.share) {
      const shareBtn = document.getElementById('native-share');
      shareBtn.style.display = 'inline-flex';
      shareBtn.addEventListener('click', () => {
        navigator.share({ title: publicUrl, url: publicUrl }).catch(() => {});
      });
    }

    document.getElementById('copy-link').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(publicUrl);
        window.showToast('Link copied to clipboard.', 'success');
      } catch (err) {
        window.showToast('Could not copy link.', 'error');
      }
    });

    document.getElementById('download-poster').addEventListener('click', async () => {
      if (!qrImageEl) return;
      await qrReady;
      const canvas = document.getElementById('poster-canvas');
      drawPoster(canvas, qrImageEl, POSTER_HEADING[programme.type] || 'Scan to View');
      triggerDownload(canvas.toDataURL('image/png'), `${programme.slug}-poster.png`);
    });
  });
})();
