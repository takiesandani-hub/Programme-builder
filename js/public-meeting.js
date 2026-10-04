(function () {
  const esc = (value) => String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const formatDate = (value) => {
    if (!value) return '';
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  function render(content) {
    const c = content || {};
    const schedule = Array.isArray(c.schedule) ? c.schedule : [];
    const agenda = schedule.map((item) => `
      <li>
        <div class="agenda-time">${esc(item.time)}</div>
        <div><h3>${esc(item.title || 'Agenda item')}</h3>
          ${item.speaker || item.role ? `<div class="person">${esc(item.speaker)}${item.speaker && item.role ? ' · ' : ''}${esc(item.role)}</div>` : ''}
          ${item.details ? `<p class="details">${esc(item.details).replace(/\n/g, '<br>')}</p>` : ''}
        </div>
      </li>`).join('');
    const address = [c.venue, c.address, c.city].filter(Boolean).join('\n');
    const dateLine = [formatDate(c.date), [c.startTime, c.endTime].filter(Boolean).join('–')].filter(Boolean).join(' · ');
    const cover = c.coverImage ? `<img src="${esc(c.coverImage)}" alt="Programme cover artwork">` : '';
    const mapUrl = /^https?:\/\//i.test(c.mapUrl || '') ? c.mapUrl : '';
    const map = mapUrl ? `<a href="${esc(mapUrl)}" target="_blank" rel="noopener">Open directions ↗</a>` : '';
    return `<article class="event-page">
      <header class="event-hero">${cover}<div class="event-tag">${esc(c.eventType || 'Event Programme')}</div>
      <h1>${esc(c.name || 'Event Programme')}</h1>${dateLine ? `<div class="event-date">${esc(dateLine)}</div>` : ''}</header>
      ${c.description ? `<section class="event-section"><h2>Welcome</h2><p>${esc(c.description).replace(/\n/g, '<br>')}</p></section>` : ''}
      ${agenda ? `<section class="event-section"><h2>Agenda</h2><ol class="agenda">${agenda}</ol></section>` : ''}
      ${address || map ? `<section class="event-section"><h2>Venue</h2>${address ? `<p class="venue-lines">${esc(address)}</p>` : ''}${map}</section>` : ''}
      <div class="event-actions">
        ${c.date ? '<a id="download-calendar" href="#">Add agenda to calendar</a>' : ''}
        <button type="button" id="share-event">Share programme</button>
        <a target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(window.location.href)}">Share on WhatsApp</a>
      </div><footer class="event-footer">A thoughtful guide to being here.</footer></article>`;
  }

  function escapeIcs(value) {
    return String(value || '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
  }
  function icsDate(date, time) {
    return `${String(date || '').replace(/-/g, '')}T${String(time || '09:00').replace(':', '')}00`;
  }
  function prepareCalendar(content) {
    const day = content.date.replace(/-/g, '');
    const hasAgendaItems = Boolean(content.schedule && content.schedule.length);
    const schedule = hasAgendaItems ? content.schedule : [{ title: content.name || 'Event', time: content.startTime || '09:00', details: content.description }];
    const events = schedule.map((item, index) => {
      const time = item.time || content.startTime || '09:00';
      const start = icsDate(content.date, time);
      const endHour = Number(time.slice(0, 2));
      const endMinute = Number(time.slice(3, 5));
      const defaultEndTime = `${String((endHour + 1) % 24).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
      const end = icsDate(content.date, !hasAgendaItems && content.endTime ? content.endTime : defaultEndTime);
      const summary = item.title || content.name || 'Event';
      const description = [item.speaker, item.role, item.details].filter(Boolean).join(' — ');
      return `BEGIN:VEVENT\r\nUID:${day}-${index}-${Date.now()}@atelier\r\nDTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}\r\nDTSTART:${start}\r\nDTEND:${end}\r\nSUMMARY:${escapeIcs(summary)}\r\nDESCRIPTION:${escapeIcs(description)}\r\nLOCATION:${escapeIcs(content.venue || '')}\r\nEND:VEVENT`;
    }).join('\r\n');
    const blob = new Blob([`BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Atelier//Event Programme//EN\r\nCALSCALE:GREGORIAN\r\n${events}\r\nEND:VCALENDAR`], { type: 'text/calendar;charset=utf-8' });
    return {
      url: URL.createObjectURL(blob),
      filename: `${(content.name || 'event-programme').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.ics`,
    };
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const slug = window.ScanProgramTracking.slugFromPath();
    const loading = document.getElementById('loading');
    const contentEl = document.getElementById('content');
    try {
      await window.ScanProgramTracking.collectGuestDetails('meeting', slug);
      const data = await window.api.get(`/api/public/meeting/${encodeURIComponent(slug)}`);
      document.body.setAttribute('data-template', data.template || 'editorial');
      contentEl.innerHTML = render(data.content);
      contentEl.hidden = false;
      loading.hidden = true;
      document.title = `${data.content.name || 'Event Programme'} — Atelier`;
      const calendarBtn = document.getElementById('download-calendar');
      if (calendarBtn) {
        const calendar = prepareCalendar(data.content);
        calendarBtn.href = calendar.url;
        calendarBtn.download = calendar.filename;
        window.addEventListener('pagehide', () => URL.revokeObjectURL(calendar.url), { once: true });
      }
      document.getElementById('share-event').addEventListener('click', async () => {
        try {
          if (navigator.share) await navigator.share({ title: data.content.name || 'Event Programme', url: window.location.href });
          else {
            await navigator.clipboard.writeText(window.location.href);
            document.getElementById('share-event').textContent = 'Link copied';
          }
        } catch (err) { /* User cancelled native sharing. */ }
      });
      window.ScanProgramTracking.trackView('meeting', slug);
    } catch (err) {
      loading.hidden = true;
      contentEl.hidden = false;
      contentEl.innerHTML = '<div class="not-found"><h1>Programme unavailable</h1><p>This event page may be unpublished or the link may be incorrect.</p></div>';
    }
  });
})();
