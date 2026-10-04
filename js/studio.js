(() => {
  "use strict";

  const W = 420;
  const H = 594;
  const MM_X = W / 148;
  const MM_Y = H / 210;
  const STORAGE_KEY = "atelier-programme-studio-v1";
  const templates = {
    noir: {
      name: "Noir & Gold Wedding", title: "Wedding programme", bg: "#171719", accent: "#d7b34f", texture: true,
      pages: [
        [
          ["SAVE THE DATE", 47, 45, 54, 12, "display", true],
          ["FOR THE WEDDING OF", 45, 73, 58, 7, "serif", true],
          ["LARA & MAX", 39, 84, 70, 15, "display", true],
          ["YOUR CHURCH     |     25 DEC 2026     |     5:00 PM", 25, 117, 98, 6, "sans", true],
          ["STREET NAME 123\\nCITY COUNTRY", 38, 147, 72, 9, "serif", true]
        ],
        [
          ["Wedding", 34, 26, 80, 23, "script", true],
          ["MENU", 59, 48, 30, 7, "sans", true],
          ["STARTERS", 43, 68, 62, 9, "serif", true],
          ["Lemon prawn salad or sun-kissed\\nroasted garden vegetables", 28, 80, 92, 6, "serif", false],
          ["MAIN COURSE", 36, 105, 76, 9, "serif", true],
          ["Slow braised beef with herbs\\nor wild mushroom risotto", 29, 117, 90, 6, "serif", false],
          ["DESSERTS", 43, 144, 62, 9, "serif", true],
          ["Lemon tart, berries & cream\\nwith coffee to finish", 30, 156, 88, 6, "serif", false]
        ]
      ]
    },
    ivory: {
      name: "Ivory Garden Wedding", title: "Garden wedding", bg: "#f4eddf", accent: "#6b7555", texture: false,
      pages: [
        [
          ["A CELEBRATION OF LOVE", 34, 36, 84, 8, "sans", true],
          ["Amara & Niko", 24, 68, 100, 23, "script", true],
          ["AUGUST 24 · 2026", 48, 100, 52, 8, "serif", true],
          ["THE GARDEN AT SUNSET", 40, 132, 68, 8, "serif", false],
          ["With love,\\nThe Moyo & Dlamini families", 37, 163, 74, 8, "script", false]
        ],
        [
          ["THE ORDER OF THE DAY", 30, 30, 88, 10, "display", true],
          ["CEREMONY", 40, 65, 68, 9, "serif", true],
          ["Welcome & opening prayer", 34, 78, 80, 7, "serif", false],
          ["Reading · vows · exchange of rings", 27, 89, 94, 7, "serif", false],
          ["RECEPTION", 40, 119, 68, 9, "serif", true],
          ["Garden drinks & photographs", 30, 132, 88, 7, "serif", false],
          ["Dinner beneath the olive trees", 30, 144, 88, 7, "serif", false],
          ["Dancing until late", 38, 156, 72, 7, "serif", false]
        ]
      ]
    },
    modern: {
      name: "Modern Editorial", title: "Modern celebration", bg: "#efeae1", accent: "#9a5739", texture: false,
      pages: [
        [
          ["NO. 01  /  2026", 18, 18, 66, 7, "mono", true],
          ["THE", 18, 55, 80, 14, "sans", true],
          ["GOOD\\nGATHERING", 18, 70, 111, 25, "display", true],
          ["A day for the books.", 18, 122, 106, 10, "serif", false],
          ["JUNE 14  ·  CAPE TOWN", 18, 170, 105, 7, "mono", true]
        ],
        [
          ["TODAY'S\\nITINERARY", 18, 23, 112, 21, "display", true],
          ["15:00", 18, 85, 30, 8, "mono", true],
          ["THE CEREMONY", 53, 82, 81, 10, "sans", true],
          ["16:30", 18, 112, 30, 8, "mono", true],
          ["A TOAST IN THE GARDEN", 53, 109, 81, 9, "sans", true],
          ["18:00", 18, 139, 30, 8, "mono", true],
          ["SUPPER & SPEECHES", 53, 136, 81, 9, "sans", true],
          ["20:00", 18, 166, 30, 8, "mono", true],
          ["LET'S DANCE", 53, 163, 81, 10, "sans", true]
        ]
      ]
    },
    memorial: {
      name: "Everlasting Memorial", title: "In loving memory", bg: "#e9e5dc", accent: "#736e5e", texture: false,
      pages: [
        [
          ["IN LOVING MEMORY", 33, 38, 82, 9, "serif", true],
          ["Evelyn\\nGrace Moyo", 24, 69, 100, 24, "script", true],
          ["1948 — 2026", 45, 117, 58, 9, "serif", true],
          ["A life remembered, a love everlasting", 23, 151, 102, 8, "serif", false],
          ["RESTING IN PEACE", 42, 177, 64, 7, "sans", true]
        ],
        [
          ["A LIFE WELL LIVED", 30, 26, 88, 10, "display", true],
          ["ORDER OF SERVICE", 34, 55, 80, 8, "sans", true],
          ["Gathering & welcome", 32, 77, 84, 8, "serif", false],
          ["Opening hymn · Abide With Me", 27, 93, 94, 8, "serif", false],
          ["Tribute & family reflections", 27, 109, 94, 8, "serif", false],
          ["Reading · Psalm 23", 32, 125, 84, 8, "serif", false],
          ["Closing prayer & farewell", 27, 141, 94, 8, "serif", false],
          ["The family thanks you for your love", 23, 174, 102, 7, "script", false]
        ]
      ]
    },
    botanical: {
      name: "Botanical Tribute", title: "A life remembered", bg: "#f2eee5", accent: "#78816a", texture: false,
      pages: [
        [
          ["A LIFE REMEMBERED", 33, 34, 82, 8, "sans", true],
          ["Peter\\nJames Dube", 24, 66, 100, 23, "script", true],
          ["1942 — 2026", 44, 116, 60, 8, "serif", true],
          ["A gentle soul whose light stays with us", 21, 153, 106, 8, "serif", false],
          ["FOREVER IN OUR HEARTS", 38, 179, 72, 7, "sans", true]
        ],
        [
          ["CELEBRATION OF LIFE", 26, 28, 96, 10, "display", true],
          ["WELCOME", 42, 60, 64, 8, "serif", true],
          ["A moment of silence", 31, 74, 86, 8, "script", false],
          ["MUSICAL TRIBUTE", 35, 98, 78, 8, "serif", true],
          ["How Great Thou Art", 33, 112, 82, 8, "script", false],
          ["SHARING OF MEMORIES", 25, 136, 98, 8, "serif", true],
          ["Closing words & blessing", 30, 150, 88, 8, "serif", false],
          ["Thank you for celebrating a beautiful life.", 20, 177, 108, 7, "serif", false]
        ]
      ]
    },
    bistro: {
      name: "The Bistro Menu", title: "Bistro menu", bg: "#17231d", accent: "#d4b878", texture: false,
      pages: [
        [
          ["MAISON", 37, 52, 74, 24, "display", true],
          ["BISTRO & WINE BAR", 41, 86, 66, 8, "sans", true],
          ["EST. 1998", 51, 111, 46, 7, "mono", true],
          ["A TABLE FOR EVERY STORY", 30, 151, 88, 8, "serif", false]
        ],
        [
          ["DINNER MENU", 31, 25, 86, 17, "display", true],
          ["TO BEGIN", 43, 61, 62, 8, "sans", true],
          ["Burrata · heirloom tomato · basil", 20, 75, 108, 7, "serif", false],
          ["FROM THE KITCHEN", 34, 99, 74, 8, "sans", true],
          ["Herb-roasted chicken · lemon jus", 20, 113, 108, 7, "serif", false],
          ["Wild mushroom risotto · parmesan", 20, 125, 108, 7, "serif", false],
          ["SWEET THINGS", 38, 151, 68, 8, "sans", true],
          ["Vanilla bean creme brulee", 26, 165, 96, 7, "serif", false]
        ]
      ]
    },
    soir: {
      name: "Midnight Soiree", title: "Midnight soiree", bg: "#171a29", accent: "#d2b2db", texture: true,
      pages: [
        [
          ["YOU ARE INVITED", 33, 42, 82, 8, "sans", true],
          ["A Midnight\\nSoiree", 22, 72, 104, 25, "script", true],
          ["NEW YEAR'S EVE · 2026", 35, 126, 78, 8, "mono", true],
          ["THE GRAND ORCHID", 40, 157, 68, 8, "serif", true],
          ["DRESS TO DAZZLE", 43, 181, 62, 7, "sans", true]
        ],
        [
          ["THE EVENING", 34, 30, 80, 13, "display", true],
          ["8:00 PM", 49, 68, 50, 8, "mono", true],
          ["Champagne reception", 28, 81, 92, 8, "serif", false],
          ["9:00 PM", 49, 107, 50, 8, "mono", true],
          ["Dinner & live jazz", 28, 120, 92, 8, "serif", false],
          ["MIDNIGHT", 47, 147, 54, 9, "sans", true],
          ["A toast to everything ahead", 24, 161, 100, 8, "serif", false],
          ["DANCE WITH US", 41, 184, 66, 7, "sans", true]
        ]
      ]
    }
  };

  const $ = (selector) => document.querySelector(selector);
  const canvas = $("#design-canvas");
  const ctx = canvas.getContext("2d");
  const shell = $("#paper-shell");
  const selectionBox = $("#selection-box");
  const toast = $("#toast");
  const imageCache = new Map();
  const linkedProgrammeId = new URLSearchParams(window.location.search).get("id");
  const requestedType = new URLSearchParams(window.location.search).get("type");
  let project, linkedProgramme = null, activePage = 0, selectedId = null, zoom = 1, toastTimer, saveTimer, dirty = false;

  function makeId() { return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`; }
  function fontFamily(kind) {
    return ({ serif: 'Georgia, "Times New Roman", serif', script: '"Brush Script MT", "Segoe Script", cursive', sans: 'Arial, Helvetica, sans-serif', display: 'Georgia, "Times New Roman", serif', mono: '"Courier New", monospace' })[kind] || "Georgia, serif";
  }
  function createElement([text, x, y, w, size, font, bold]) {
    return { id: makeId(), type: "text", text, x, y, w, size, font, bold, italic: font === "script", color: null, align: "center", lineHeight: 1.18 };
  }
  function sampleProject(key) {
    const data = templates[key] || templates.noir;
    return {
      id: makeId(), name: data.name === "Noir & Gold Wedding" ? "Amara & Niko — Wedding" : data.name,
      template: key, updated: Date.now(), pages: data.pages.map((list) => ({
        bg: data.bg, accent: data.accent, texture: data.texture, backgroundImage: null,
        elements: list.map(createElement)
      }))
    };
  }

  let store = readStore();
  function readStore() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return { projects: Array.isArray(parsed.projects) ? parsed.projects : [], activeId: parsed.activeId || null };
    } catch (error) {
      console.error("Could not read the saved programme designs.", error);
      return { projects: [], activeId: null };
    }
  }
  project = store.projects.find((item) => item.id === store.activeId) || store.projects[0] || sampleProject("noir");
  if (!store.projects.some((item) => item.id === project.id)) store.projects.unshift(project);

  function templateForType(type) {
    return ({ wedding: "noir", funeral: "memorial", restaurant: "bistro", meeting: "modern" })[type] || "noir";
  }
  function programmeTitle(programme) {
    const content = programme.content || {};
    if (programme.type === "wedding") return [content.brideName, content.groomName].filter(Boolean).join(" & ") || "Wedding programme";
    if (programme.type === "funeral") return content.fullName ? `In memory of ${content.fullName}` : "Memorial programme";
    if (programme.type === "restaurant") return content.name || "Restaurant menu";
    return content.name || "Meeting programme";
  }
  function notify(message) {
    toast.textContent = message;
    toast.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("visible"), 2600);
  }
  function setSaveState(text, isError = false) {
    const label = $("#save-state");
    label.textContent = text;
    label.style.color = isError ? "#a34e42" : "";
  }
  function persist() {
    project.updated = Date.now();
    store.activeId = project.id;
    store.projects = [project, ...store.projects.filter((item) => item.id !== project.id)].slice(0, 15);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
      dirty = false;
      setSaveState("Saved on this device");
      renderRecent();
    } catch (error) {
      console.error("Could not save the programme in this browser.", error);
      setSaveState("Could not save — export a backup", true);
      notify("Browser storage is full. Export a JSON backup or use a smaller image.");
    }
  }
  function scheduleSave() {
    dirty = true;
    setSaveState("Saving…");
    clearTimeout(saveTimer);
    saveTimer = setTimeout(persist, 250);
  }
  function renderRecent() {
    const root = $("#recent-list");
    root.replaceChildren();
    const list = store.projects.slice(0, 4);
    if (!list.length) {
      const empty = document.createElement("p");
      empty.className = "helper";
      empty.textContent = "Your recent programmes will appear here.";
      root.append(empty);
      return;
    }
    list.forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "recent-item";
      button.title = `Open ${item.name}`;
      const swatch = document.createElement("span");
      swatch.className = "recent-swatch";
      swatch.style.background = item.pages?.[0]?.bg || "#171719";
      const label = document.createElement("span");
      label.textContent = item.name;
      button.append(swatch, label);
      button.addEventListener("click", () => openProject(item.id));
      root.append(button);
    });
  }
  function openProject(id) {
    const found = store.projects.find((item) => item.id === id);
    if (!found) return;
    project = found;
    activePage = 0;
    selectedId = null;
    updateUI();
    scheduleSave();
  }
  function currentPage() { return project.pages[activePage]; }
  function currentElement() { return currentPage().elements.find((element) => element.id === selectedId) || null; }
  function wrapText(text, maxWidth, font) {
    const result = [];
    String(text).split("\n").forEach((paragraph) => {
      if (!paragraph) { result.push(""); return; }
      const words = paragraph.split(/\s+/);
      let line = "";
      words.forEach((word) => {
        const candidate = line ? `${line} ${word}` : word;
        if (line && ctx.measureText(candidate).width > maxWidth) {
          result.push(line);
          line = word;
        } else line = candidate;
      });
      result.push(line);
    });
    return result.length ? result : [""];
  }
  function measureElement(element) {
    const width = element.w * MM_X;
    const size = Math.max(8, element.size * 1.333);
    ctx.font = `${element.italic ? "italic " : ""}${element.bold ? "700 " : ""}${size}px ${fontFamily(element.font)}`;
    const lines = wrapText(element.text, width, ctx.font);
    const lineHeight = size * (element.lineHeight || 1.18);
    return { x: element.x * MM_X, y: element.y * MM_Y, w: width, h: Math.max(lineHeight, lines.length * lineHeight), size, lines, lineHeight };
  }
  function drawDiamondTexture() {
    ctx.save();
    ctx.globalAlpha = .045;
    ctx.strokeStyle = currentPage().accent;
    ctx.lineWidth = .6;
    for (let x = -W; x < W * 2; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + H, H);
      ctx.moveTo(x, H);
      ctx.lineTo(x + H, 0);
      ctx.stroke();
    }
    ctx.restore();
  }
  function drawFlourish(x, y, flipX, flipY) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
    ctx.strokeStyle = currentPage().accent;
    ctx.fillStyle = currentPage().accent;
    ctx.lineWidth = 1;
    ctx.globalAlpha = .92;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(22, 4, 17, 27, 35, 23);
    ctx.bezierCurveTo(49, 20, 39, 9, 31, 13);
    ctx.stroke();
    for (let i = 0; i < 5; i++) {
      const px = 5 + i * 6;
      const py = 5 + Math.sin(i * 1.1) * 8;
      ctx.beginPath();
      ctx.ellipse(px, py, 3, 6, -.55, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  function drawDecoration() {
    const page = currentPage();
    const inset = 34;
    ctx.save();
    ctx.strokeStyle = page.accent;
    ctx.lineWidth = 1.15;
    ctx.strokeRect(inset, inset, W - inset * 2, H - inset * 2);
    [[inset, inset], [W - inset, inset], [inset, H - inset], [W - inset, H - inset]].forEach(([x, y]) => {
      ctx.beginPath(); ctx.arc(x, y, 4.4, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, 1.4, 0, Math.PI * 2); ctx.fillStyle = page.accent; ctx.fill();
    });
    drawFlourish(43, 50, false, false);
    drawFlourish(W - 43, H - 50, true, true);
    if (project.template === "noir" || project.template === "soir") {
      ctx.globalAlpha = .9;
      ctx.beginPath();
      ctx.moveTo(78, 95); ctx.lineTo(210, 76); ctx.lineTo(342, 95);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(78, 95); ctx.lineTo(210, 114); ctx.lineTo(342, 95);
      ctx.stroke();
    }
    ctx.restore();
  }
  function drawElement(element) {
    const box = measureElement(element);
    ctx.save();
    ctx.fillStyle = element.color || currentPage().accent;
    ctx.font = `${element.italic ? "italic " : ""}${element.bold ? "700 " : ""}${box.size}px ${fontFamily(element.font)}`;
    ctx.textBaseline = "top";
    ctx.textAlign = element.align || "center";
    const x = element.align === "left" ? box.x : element.align === "right" ? box.x + box.w : box.x + box.w / 2;
    box.lines.forEach((line, index) => ctx.fillText(line, x, box.y + index * box.lineHeight, box.w));
    ctx.restore();
  }
  function drawPage() {
    const page = currentPage();
    ctx.clearRect(0, 0, W * 2, H * 2);
    ctx.save();
    ctx.scale(2, 2);
    ctx.fillStyle = page.bg || "#ffffff";
    ctx.fillRect(0, 0, W, H);
    if (page.texture) drawDiamondTexture();
    if (page.backgroundImage) {
      const cached = imageCache.get(page.backgroundImage);
      if (cached?.complete && cached.naturalWidth) {
        ctx.save();
        ctx.globalAlpha = .88;
        ctx.drawImage(cached, 0, 0, W, H);
        ctx.restore();
      } else if (!cached) {
        const image = new Image();
        image.onload = drawPage;
        image.onerror = () => notify("The saved background image could not be loaded.");
        imageCache.set(page.backgroundImage, image);
        image.src = page.backgroundImage;
      }
      ctx.fillStyle = "rgba(0,0,0,.15)";
      ctx.fillRect(0, 0, W, H);
    }
    if (!page.backgroundImage) drawDecoration();
    page.elements.forEach(drawElement);
    ctx.restore();
    updateSelection();
    $("#element-count").textContent = page.elements.length;
    $("#page-indicator").textContent = activePage === 0 ? "COVER" : "INSIDE";
    $(".canvas-location b").textContent = project.name;
  }
  function updateSelection() {
    const element = currentElement();
    if (!element) {
      selectionBox.hidden = true;
      return;
    }
    const box = measureElement(element);
    selectionBox.hidden = false;
    selectionBox.style.left = `${box.x / W * 100}%`;
    selectionBox.style.top = `${box.y / H * 100}%`;
    selectionBox.style.width = `${box.w / W * 100}%`;
    selectionBox.style.height = `${box.h / H * 100}%`;
  }
  function updateUI() {
    $("#project-name").value = project.name;
    $("#template-select").value = project.template;
    $("#background-color").value = currentPage().bg;
    $("#background-hex").value = currentPage().bg;
    $("#accent-color").value = currentPage().accent;
    $("#accent-hex").value = currentPage().accent;
    $("#texture-toggle").checked = !!currentPage().texture;
    $("#clear-image").hidden = !currentPage().backgroundImage;
    document.querySelectorAll(".page-tab").forEach((tab, index) => {
      tab.classList.toggle("active", index === activePage);
      tab.setAttribute("aria-selected", String(index === activePage));
    });
    const element = currentElement();
    $("#page-properties").hidden = !!element;
    $("#element-properties").hidden = !element;
    $("#selected-kind").textContent = element ? "TEXT" : "PAGE";
    if (element) {
      $("#element-text").value = element.text;
      $("#font-family").value = element.font;
      $("#font-size").value = element.size;
      $("#text-align").value = element.align || "center";
      $("#text-color").value = element.color || currentPage().accent;
      $("#bold-toggle").setAttribute("aria-pressed", String(!!element.bold));
      $("#italic-toggle").setAttribute("aria-pressed", String(!!element.italic));
      $("#pos-x").value = element.x;
      $("#pos-y").value = element.y;
      $("#box-width").value = element.w;
      $("#line-spacing").value = element.lineHeight || 1.18;
    }
    $("#canvas-title").textContent = project.name;
    $("#page-count").textContent = `${project.pages.length} pages`;
    drawPage();
  }
  function setZoom(value) {
    zoom = Math.max(.55, Math.min(1.35, value));
    shell.style.transform = `scale(${zoom})`;
    $("#zoom-value").textContent = `${Math.round(zoom * 100)}%`;
  }
  function fitZoom() {
    const stage = $("#canvas-stage");
    const availableWidth = Math.max(120, stage.clientWidth - 60);
    const availableHeight = Math.max(180, stage.clientHeight - 60);
    setZoom(Math.min(1, availableWidth / W, availableHeight / H));
  }
  function addText() {
    const element = { id: makeId(), type: "text", text: "Your words here", x: 34, y: 97, w: 80, size: 12, font: "serif", bold: false, italic: false, color: null, align: "center", lineHeight: 1.2 };
    currentPage().elements.push(element);
    selectedId = element.id;
    updateUI();
    scheduleSave();
    $("#element-text").focus();
    $("#element-text").select();
  }
  function hitElement(x, y) {
    const elements = currentPage().elements;
    for (let index = elements.length - 1; index >= 0; index--) {
      const element = elements[index];
      const box = measureElement(element);
      if (x >= box.x - 5 && x <= box.x + box.w + 5 && y >= box.y - 5 && y <= box.y + box.h + 5) return element;
    }
    return null;
  }
  function download(filename, blob) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }
  function exportPng() {
    canvas.toBlob((blob) => {
      if (!blob) { notify("PNG export failed. Please try a different browser."); return; }
      const suffix = activePage === 0 ? "cover" : "inside";
      download(`${safeName(project.name)}-${suffix}.png`, blob);
      notify("Your programme page is ready as a PNG.");
    }, "image/png");
  }
  async function useDesignForProgramme() {
    if (!linkedProgramme) return;
    if (activePage !== 0) {
      notify("Select the Cover page before continuing.");
      return;
    }
    const button = $("#use-design");
    button.disabled = true;
    button.textContent = "Saving cover…";
    setSaveState("Uploading cover…");
    try {
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Could not render the cover image. Please try again.");
      const file = new File([blob], `${safeName(project.name)}-cover.png`, { type: "image/png" });
      const { url } = await window.api.upload("/api/uploads", file);
      await window.api.put(`/api/programmes/${encodeURIComponent(linkedProgramme.id)}`, { content: { coverImage: url } });
      const editors = { wedding: "editor-wedding.html", funeral: "editor-funeral.html", restaurant: "editor-restaurant.html", meeting: "editor-meeting.html" };
      project.serverProgrammeId = linkedProgramme.id;
      project.serverCoverUrl = url;
      persist();
      window.location.href = `/${editors[linkedProgramme.type]}?id=${encodeURIComponent(linkedProgramme.id)}&mode=design`;
    } catch (error) {
      console.error("Could not attach the Atelier cover to the programme.", error);
      setSaveState("Could not upload cover", true);
      notify(error.message || "Could not save this cover to your programme.");
      button.disabled = false;
      button.textContent = "Use cover & continue";
    }
  }
  function safeName(value) {
    return String(value || "programme").trim().replace(/[<>:"/\\|?*\x00-\x1f]/g, "-").replace(/\s+/g, "-").slice(0, 60) || "programme";
  }
  function exportBackup() {
    const payload = JSON.stringify({ format: "atelier-programme", version: 1, project }, null, 2);
    download(`${safeName(project.name)}-backup.json`, new Blob([payload], { type: "application/json" }));
    notify("Programme backup downloaded.");
  }
  function importBackup(file) {
    const reader = new FileReader();
    reader.onerror = () => notify("Could not read that backup file.");
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        const incoming = data.project;
        if (data.format !== "atelier-programme" || !incoming || !Array.isArray(incoming.pages) || incoming.pages.length < 1 || incoming.pages.some((page) => !Array.isArray(page.elements))) {
          throw new Error("This file is not a supported Atelier project backup.");
        }
        incoming.id = makeId();
        incoming.name = `${incoming.name || "Imported programme"} (imported)`;
        project = incoming;
        activePage = 0;
        selectedId = null;
        updateUI();
        scheduleSave();
        notify("Programme backup imported.");
      } catch (error) {
        console.error("Invalid programme backup.", error);
        notify(error.message || "That backup file is invalid.");
      }
    };
    reader.readAsText(file);
  }
  function loadBackground(file) {
    if (!file.type.startsWith("image/")) { notify("Choose a supported image file."); return; }
    if (file.size > 12 * 1024 * 1024) { notify("Choose an image smaller than 12 MB."); return; }
    const reader = new FileReader();
    reader.onerror = () => notify("Could not read that image file.");
    reader.onload = () => {
      const source = new Image();
      source.onerror = () => notify("That image could not be opened.");
      source.onload = () => {
        const ratio = Math.min(1, 1600 / Math.max(source.naturalWidth, source.naturalHeight));
        const scaled = document.createElement("canvas");
        scaled.width = Math.max(1, Math.round(source.naturalWidth * ratio));
        scaled.height = Math.max(1, Math.round(source.naturalHeight * ratio));
        const imageCtx = scaled.getContext("2d");
        imageCtx.fillStyle = "#ffffff";
        imageCtx.fillRect(0, 0, scaled.width, scaled.height);
        imageCtx.drawImage(source, 0, 0, scaled.width, scaled.height);
        try {
          const dataUrl = scaled.toDataURL("image/jpeg", .88);
          currentPage().backgroundImage = dataUrl;
          currentPage().bg = "#171719";
          currentPage().texture = false;
          imageCache.delete(dataUrl);
          selectedId = null;
          updateUI();
          scheduleSave();
          notify("Artwork added to this page. Add text boxes to personalize it.");
        } catch (error) {
          console.error("Could not prepare the uploaded programme image.", error);
          notify("This image could not be prepared. Try a smaller JPG or PNG.");
        }
      };
      source.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  }
  function updateElementFromInput(input) {
    const element = currentElement();
    if (!element) return;
    const fields = {
      "element-text": ["text", (value) => value],
      "font-family": ["font", (value) => value],
      "font-size": ["size", (value) => clamp(Number(value), 8, 72)],
      "text-align": ["align", (value) => value],
      "text-color": ["color", (value) => value],
      "pos-x": ["x", (value) => clamp(Number(value), 0, 148)],
      "pos-y": ["y", (value) => clamp(Number(value), 0, 210)],
      "box-width": ["w", (value) => clamp(Number(value), 12, 148)],
      "line-spacing": ["lineHeight", (value) => clamp(Number(value), .8, 2.5)]
    };
    const rule = fields[input.id];
    if (!rule) return;
    const value = rule[1](input.value);
    if (typeof value === "number" && !Number.isFinite(value)) return;
    element[rule[0]] = value;
    if (input.type === "number") input.value = value;
    drawPage();
    scheduleSave();
  }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function validHex(value) { return /^#[0-9a-f]{6}$/i.test(value); }
  function setColor(which, value) {
    if (!validHex(value)) return;
    currentPage()[which] = value;
    if (which === "accent") {
      const item = currentElement();
      if (item && !item.color) $("#text-color").value = value;
    }
    drawPage();
    scheduleSave();
  }

  $("#project-name").addEventListener("input", (event) => {
    project.name = event.target.value.trim() || "Untitled programme";
    $("#canvas-title").textContent = project.name;
    scheduleSave();
  });
  $("#template-select").addEventListener("change", (event) => {
    const confirmed = window.confirm("Start a new design from this sample? Your current programme will stay in Recent designs.");
    if (!confirmed) { event.target.value = project.template; return; }
    if (dirty) persist();
    project = sampleProject(event.target.value);
    activePage = 0;
    selectedId = null;
    updateUI();
    scheduleSave();
  });
  document.querySelectorAll(".page-tab").forEach((tab) => tab.addEventListener("click", () => {
    activePage = Number(tab.dataset.page);
    selectedId = null;
    updateUI();
  }));
  $("#add-text").addEventListener("click", addText);
  $("#image-upload").addEventListener("change", (event) => {
    const [file] = event.target.files || [];
    if (file) loadBackground(file);
    event.target.value = "";
  });
  $("#background-color").addEventListener("input", (event) => {
    currentPage().bg = event.target.value;
    $("#background-hex").value = event.target.value;
    currentPage().backgroundImage = null;
    drawPage(); scheduleSave();
  });
  $("#background-hex").addEventListener("change", (event) => {
    if (!validHex(event.target.value)) { event.target.value = currentPage().bg; notify("Enter a hex colour such as #171719."); return; }
    $("#background-color").value = event.target.value;
    setColor("bg", event.target.value);
    currentPage().backgroundImage = null;
  });
  $("#accent-color").addEventListener("input", (event) => {
    $("#accent-hex").value = event.target.value;
    setColor("accent", event.target.value);
  });
  $("#accent-hex").addEventListener("change", (event) => {
    if (!validHex(event.target.value)) { event.target.value = currentPage().accent; notify("Enter a hex colour such as #d7b34f."); return; }
    $("#accent-color").value = event.target.value;
    setColor("accent", event.target.value);
  });
  $("#texture-toggle").addEventListener("change", (event) => {
    currentPage().texture = event.target.checked;
    drawPage(); scheduleSave();
  });
  $("#clear-image").addEventListener("click", () => {
    currentPage().backgroundImage = null;
    updateUI();
    scheduleSave();
    notify("Uploaded artwork removed from this page.");
  });
  ["element-text", "font-family", "font-size", "text-align", "text-color", "pos-x", "pos-y", "box-width", "line-spacing"].forEach((id) => {
    const input = $(`#${id}`);
    input.addEventListener(id === "element-text" ? "input" : "change", () => updateElementFromInput(input));
  });
  $("#bold-toggle").addEventListener("click", () => {
    const element = currentElement(); if (!element) return;
    element.bold = !element.bold; updateUI(); scheduleSave();
  });
  $("#italic-toggle").addEventListener("click", () => {
    const element = currentElement(); if (!element) return;
    element.italic = !element.italic; updateUI(); scheduleSave();
  });
  $("#duplicate-element").addEventListener("click", () => {
    const element = currentElement(); if (!element) return;
    const copy = { ...element, id: makeId(), x: clamp(element.x + 5, 0, 148), y: clamp(element.y + 7, 0, 210) };
    currentPage().elements.push(copy); selectedId = copy.id; updateUI(); scheduleSave();
  });
  $("#delete-element").addEventListener("click", () => {
    currentPage().elements = currentPage().elements.filter((element) => element.id !== selectedId);
    selectedId = null; updateUI(); scheduleSave();
  });
  $("#new-project").addEventListener("click", () => {
    project = sampleProject("noir");
    project.name = "Untitled programme";
    activePage = 0; selectedId = null; updateUI(); scheduleSave();
    $("#project-name").focus(); $("#project-name").select();
  });
  $("#backup-project").addEventListener("click", exportBackup);
  $("#restore-project").addEventListener("click", () => $("#backup-file").click());
  $("#backup-file").addEventListener("change", (event) => {
    const [file] = event.target.files || [];
    if (file) importBackup(file);
    event.target.value = "";
  });
  $("#export-png").addEventListener("click", exportPng);
  $("#use-design").addEventListener("click", useDesignForProgramme);
  $("#zoom-out").addEventListener("click", () => setZoom(zoom - .1));
  $("#zoom-in").addEventListener("click", () => setZoom(zoom + .1));
  $("#zoom-fit").addEventListener("click", fitZoom);
  canvas.addEventListener("pointerdown", (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width * W;
    const y = (event.clientY - rect.top) / rect.height * H;
    const hit = hitElement(x, y);
    selectedId = hit?.id || null;
    updateUI();
    if (hit) {
      canvas.setPointerCapture(event.pointerId);
      const startX = x, startY = y, startLeft = hit.x, startTop = hit.y;
      const move = (moveEvent) => {
        const bounds = canvas.getBoundingClientRect();
        const nextX = (moveEvent.clientX - bounds.left) / bounds.width * W;
        const nextY = (moveEvent.clientY - bounds.top) / bounds.height * H;
        hit.x = clamp(startLeft + (nextX - startX) / MM_X, 0, 148);
        hit.y = clamp(startTop + (nextY - startY) / MM_Y, 0, 210);
        $("#pos-x").value = Math.round(hit.x);
        $("#pos-y").value = Math.round(hit.y);
        drawPage();
      };
      const end = () => {
        canvas.removeEventListener("pointermove", move);
        canvas.removeEventListener("pointerup", end);
        canvas.removeEventListener("pointercancel", end);
        scheduleSave();
      };
      canvas.addEventListener("pointermove", move);
      canvas.addEventListener("pointerup", end, { once: true });
      canvas.addEventListener("pointercancel", end, { once: true });
    }
  });
  document.addEventListener("keydown", (event) => {
    if ((event.key === "Delete" || event.key === "Backspace") && currentElement() && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
      $("#delete-element").click();
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault(); exportBackup();
    }
  });
  window.addEventListener("beforeunload", () => { if (dirty) persist(); });

  async function initializeStudio() {
    if (linkedProgrammeId) {
      setSaveState("Opening your programme…");
      try {
        if (!window.api) throw new Error("This linked design needs the Atelier server. Start the app with npm run dev.");
        const { programme } = await window.api.get(`/api/programmes/${encodeURIComponent(linkedProgrammeId)}`);
        if (!programme || (requestedType && programme.type !== requestedType)) throw new Error("This programme link does not match the selected occasion.");
        linkedProgramme = programme;
        const savedDesign = store.projects.find((item) => item.serverProgrammeId === programme.id);
        if (savedDesign) {
          project = savedDesign;
        } else {
          project = sampleProject(templateForType(programme.type));
          project.id = `programme-${programme.id}`;
          project.name = programmeTitle(programme);
          if (programme.content?.coverImage) project.pages[0].backgroundImage = programme.content.coverImage;
        }
        project.serverProgrammeId = programme.id;
        store.activeId = project.id;
        $("#use-design").hidden = false;
        $("#studio-footer-label").textContent = "Account programme";
        $("#studio-footer-mode").textContent = "COVER SAVED TO ACCOUNT";
      } catch (error) {
        console.error("Could not load the linked Atelier programme.", error);
        setSaveState("Programme unavailable", true);
        notify(error.message || "Could not open that programme. Please return to your dashboard and try again.");
      }
    }
    renderRecent();
    updateUI();
    fitZoom();
  }
  initializeStudio();
  window.addEventListener("resize", fitZoom);
})();
