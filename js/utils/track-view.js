(function () {
  function slugFromPath() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    return parts[1] || '';
  }

  function isQrEntry() {
    return new URLSearchParams(window.location.search).get('src') === 'qr';
  }

  function trackView(type, slug) {
    if (isQrEntry()) return;
    fetch(`/api/public/${encodeURIComponent(type)}/${encodeURIComponent(slug)}/view`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'link' }),
    }).catch(() => {});
  }

  function collectGuestDetails(type, slug) {
    if (!isQrEntry()) return Promise.resolve(true);

    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'guest-checkin-overlay';
      overlay.innerHTML = `
        <section class="guest-checkin-card" role="dialog" aria-modal="true" aria-labelledby="guest-checkin-title">
          <p class="guest-checkin-kicker">WELCOME</p>
          <h1 id="guest-checkin-title">Before you join us</h1>
          <p class="guest-checkin-intro">Please share your name and phone number to register this QR check-in.</p>
          <form class="guest-checkin-form">
            <label>First name<input name="firstName" autocomplete="given-name" maxlength="80" required></label>
            <label>Surname<input name="surname" autocomplete="family-name" maxlength="80" required></label>
            <label>Phone number<input name="phone" type="tel" autocomplete="tel" inputmode="tel" maxlength="30" placeholder="+27 00 000 0000" required></label>
            <label class="guest-checkin-consent"><input name="consent" type="checkbox" required><span>I agree that ScanProgram platform administrators can see this check-in with this event and its programme owner's account. Event organizers and other clients cannot see my contact details.</span></label>
            <p class="guest-checkin-privacy">Your details are stored by the platform for event check-in records. They are not shown on the public programme. Contact the platform administrator if you need your information corrected or removed.</p>
            <p class="guest-checkin-error" role="alert" aria-live="polite"></p>
            <button type="submit">Continue to programme</button>
          </form>
        </section>`;
      const style = document.createElement('style');
      style.textContent = `
        .guest-checkin-overlay{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;padding:20px;background:rgba(15,20,19,.82);overflow:auto}
        .guest-checkin-card{width:min(100%,470px);background:#fbf8f0;color:#17221e;padding:clamp(24px,6vw,42px);box-shadow:0 24px 80px #0005}
        .guest-checkin-kicker{color:#987536;font:700 10px Arial,sans-serif;letter-spacing:.18em}
        .guest-checkin-card h1{font:500 clamp(28px,7vw,38px) Georgia,serif;margin:8px 0 10px}
        .guest-checkin-intro{color:#62645e;font:14px/1.6 Arial,sans-serif;margin:0 0 22px}
        .guest-checkin-form>label:not(.guest-checkin-consent){display:block;margin:13px 0;color:#4c4d47;font:600 12px Arial,sans-serif}
        .guest-checkin-form input:not([type=checkbox]){display:block;box-sizing:border-box;width:100%;height:43px;margin-top:6px;padding:0 11px;border:1px solid #d8d2c5;background:#fffefa;border-radius:2px;font:15px Arial,sans-serif}
        .guest-checkin-consent{display:flex;align-items:flex-start;gap:9px;margin:19px 0 8px;color:#4e504b;font:12px/1.55 Arial,sans-serif}
        .guest-checkin-consent input{margin-top:3px;accent-color:#92713c}
        .guest-checkin-privacy{color:#77766e;font:11px/1.55 Arial,sans-serif}
        .guest-checkin-error{min-height:18px;color:#a23f35;font:12px Arial,sans-serif}
        .guest-checkin-form button{width:100%;min-height:46px;border:0;background:#202823;color:#fff;font:600 13px Arial,sans-serif;cursor:pointer}
        .guest-checkin-form button:disabled{opacity:.65;cursor:wait}
        .guest-checkin-form :focus-visible{outline:3px solid #c39b52;outline-offset:2px}
      `;
      overlay.append(style);
      document.body.append(overlay);

      const form = overlay.querySelector('form');
      const firstName = form.elements.firstName;
      firstName.focus();
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const button = form.querySelector('button');
        const error = form.querySelector('.guest-checkin-error');
        button.disabled = true;
        button.textContent = 'Registering…';
        error.textContent = '';
        try {
          const response = await fetch(`/api/public/${encodeURIComponent(type)}/${encodeURIComponent(slug)}/guest-scan`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              firstName: form.elements.firstName.value,
              surname: form.elements.surname.value,
              phone: form.elements.phone.value,
              consent: form.elements.consent.checked,
            }),
          });
          const result = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(result.error || 'Could not register your check-in. Please try again.');
          overlay.remove();
          resolve(true);
        } catch (err) {
          error.textContent = err.message;
          button.disabled = false;
          button.textContent = 'Continue to programme';
        }
      });
    });
  }

  window.ScanProgramTracking = { slugFromPath, trackView, isQrEntry, collectGuestDetails };
})();
