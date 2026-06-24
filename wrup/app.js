const library = window.WRITEUP_LIBRARY || [];
const state = {
  filter: "all",
  search: ""
};

const els = {
  root: document.documentElement,
  vaultGrid: document.querySelector("#vaultGrid"),
  latestGrid: document.querySelector("#latestGrid"),
  searchInput: document.querySelector("#searchInput"),
  filterPills: document.querySelector("#filterPills"),
  modal: document.querySelector("#vaultModal"),
  modalTitle: document.querySelector("#modalTitle"),
  modalDescription: document.querySelector("#modalDescription"),
  modalTags: document.querySelector("#modalTags"),
  modalWriteups: document.querySelector("#modalWriteups"),
  categoryCount: document.querySelector("#category-count"),
  writeupCount: document.querySelector("#writeup-count")
};

const normalize = (value) => String(value || "").toLowerCase().trim();
const field = (value, fallback = "—") => value || fallback;
const formatPoints = (points) => points ? `${points} pts` : "No points listed";
const formatSolves = (solves) => solves ? `${solves} solves` : "Solves not listed";
const allWriteups = () => library.flatMap((ctf) =>
  ctf.writeups.map((writeup) => ({ ...writeup, ctfCollection: ctf }))
);

function init() {
  els.categoryCount.textContent = library.length;
  els.writeupCount.textContent = allWriteups().length;
  renderFilters();
  renderVaults();
  renderLatest();
  bindEvents();
  initPointerGlow();
  initNebula();
}

function renderFilters() {
  const filters = [
    { id: "all", label: "All CTFs" },
    ...library.map((ctf) => ({ id: ctf.id, label: ctf.shortName }))
  ];

  els.filterPills.innerHTML = filters.map((filter) => `
    <button class="pill ${state.filter === filter.id ? "active" : ""}" type="button" data-filter="${filter.id}">
      ${filter.label}
    </button>
  `).join("");
}

function categoryMatches(ctf) {
  const haystack = normalize([
    ctf.name,
    ctf.shortName,
    ctf.description,
    ...ctf.tags,
    ...ctf.writeups.flatMap((writeup) => [writeup.title, writeup.summary, writeup.difficulty, writeup.ctf, writeup.category, writeup.tags, writeup.skills])
  ].join(" "));

  const matchesFilter = state.filter === "all" || ctf.id === state.filter;
  const matchesSearch = !state.search || haystack.includes(normalize(state.search));
  return matchesFilter && matchesSearch;
}

function categorySummary(ctf) {
  const categories = [...new Set(ctf.writeups.map((entry) => entry.category).filter(Boolean))];
  return categories.join(" · ");
}

function renderVaults() {
  const visible = library.filter(categoryMatches);

  if (!visible.length) {
    els.vaultGrid.innerHTML = `<div class="empty-state">No CTF collection matched your search. Try another challenge name, category, or tag.</div>`;
    return;
  }

  els.vaultGrid.innerHTML = visible.map((ctf, index) => `
    <article class="vault-card" tabindex="0" role="button" aria-label="Open ${ctf.name}" data-vault="${ctf.id}" style="--accent:${ctf.accent}; --accent-soft:${ctf.accentSoft}; --tilt:${index % 2 ? "-2deg" : "2deg"}">
      <div class="vault-door" aria-hidden="true"></div>
      <div class="vault-content">
        <div class="vault-icon" aria-hidden="true">${ctf.icon}</div>
        <h3>${ctf.name}</h3>
        <p>${ctf.description}</p>
        <div class="vault-meta">
          <span class="meta-chip">${ctf.writeups.length} writeups</span>
          <span class="meta-chip">${categorySummary(ctf)}</span>
          <span class="meta-chip">Open CTF</span>
        </div>
      </div>
    </article>
  `).join("");
}

function renderLatest() {
  const latest = allWriteups()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  els.latestGrid.innerHTML = latest.map((entry) => `
    <article class="latest-card" style="--accent:${entry.ctfCollection.accent}">
      <span class="meta-chip">${entry.ctfCollection.shortName}</span>
      <h3>${entry.title}</h3>
      <p>${entry.summary}</p>
      <div class="vault-meta">
        <span class="meta-chip">${field(entry.ctf, entry.ctfCollection.shortName)}</span>
        <span class="meta-chip">${field(entry.category, "Category")}</span>
        <span class="meta-chip">${entry.difficulty}</span>
        <span class="meta-chip">${formatPoints(entry.points)}</span>
        <span class="meta-chip">${formatSolves(entry.solves)}</span>
        <span class="meta-chip">${entry.date}</span>
      </div>
      <p class="skill-line">${field(entry.skills, "Skills documented inside")}</p>
      <a class="writeup-link" href="${entry.url}">Read casefile →</a>
    </article>
  `).join("");
}

function groupWriteupsByCategory(writeups) {
  return writeups.reduce((groups, writeup) => {
    const key = writeup.category || "General";
    if (!groups[key]) groups[key] = [];
    groups[key].push(writeup);
    return groups;
  }, {});
}

function openVault(ctfId) {
  const ctf = library.find((item) => item.id === ctfId);
  if (!ctf) return;

  els.modal.style.setProperty("--modal-accent", ctf.accentSoft);
  els.modalTitle.textContent = ctf.name;
  els.modalDescription.textContent = ctf.description;
  els.modalTags.innerHTML = ctf.tags.map((tag) => `<span class="meta-chip">${tag}</span>`).join("");

  const grouped = groupWriteupsByCategory(ctf.writeups);
  els.modalWriteups.innerHTML = ctf.writeups.length ? Object.entries(grouped).map(([groupName, items]) => `
    <section class="writeup-group">
      <div class="writeup-group-head">
        <span class="meta-chip">${groupName}</span>
        <span>${items.length} ${items.length === 1 ? "entry" : "entries"}</span>
      </div>
      ${items.map((writeup) => `
        <article class="writeup-item">
          <div>
            <h3>${writeup.title}</h3>
            <p>${writeup.summary}</p>
            <div class="vault-meta" style="margin-top: 10px;">
              <span class="meta-chip">${field(writeup.ctf, ctf.shortName)}</span>
              <span class="meta-chip">${field(writeup.category, "Category")}</span>
              <span class="meta-chip">${writeup.difficulty}</span>
              <span class="meta-chip">${formatPoints(writeup.points)}</span>
              <span class="meta-chip">${formatSolves(writeup.solves)}</span>
              <span class="meta-chip">${writeup.date}</span>
            </div>
            <p class="skill-line">${field(writeup.skills, "Skills documented inside")}</p>
          </div>
          <a href="${writeup.url}">Open casefile</a>
        </article>
      `).join("")}
    </section>
  `).join("") : `<div class="empty-state">This CTF collection is ready, but it has no writeups yet.</div>`;

  document.body.classList.add("no-scroll");
  els.modal.showModal();
}

function closeVault() {
  els.modal.close();
  document.body.classList.remove("no-scroll");
}

function bindEvents() {
  els.searchInput.addEventListener("input", (event) => {
    state.search = event.target.value;
    renderVaults();
  });

  els.filterPills.addEventListener("click", (event) => {
    const pill = event.target.closest("[data-filter]");
    if (!pill) return;
    state.filter = pill.dataset.filter;
    renderFilters();
    renderVaults();
  });

  els.vaultGrid.addEventListener("click", (event) => {
    const card = event.target.closest("[data-vault]");
    if (card) openVault(card.dataset.vault);
  });

  els.vaultGrid.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const card = event.target.closest("[data-vault]");
    if (card) {
      event.preventDefault();
      openVault(card.dataset.vault);
    }
  });

  document.querySelector("[data-close-modal]").addEventListener("click", closeVault);
  els.modal.addEventListener("click", (event) => {
    if (event.target === els.modal) closeVault();
  });

  document.querySelector("[data-open-random]").addEventListener("click", () => {
    const ctf = library[Math.floor(Math.random() * library.length)];
    if (ctf) openVault(ctf.id);
  });
}

function initPointerGlow() {
  window.addEventListener("pointermove", (event) => {
    els.root.style.setProperty("--mx", `${event.clientX}px`);
    els.root.style.setProperty("--my", `${event.clientY}px`);
  }, { passive: true });
}

function initNebula() {
  const canvas = document.querySelector("#nebula");
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let stars = [];
  let width = 0;
  let height = 0;
  let raf;

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.width = Math.floor(innerWidth * ratio);
    height = canvas.height = Math.floor(innerHeight * ratio);
    canvas.style.width = `${innerWidth}px`;
    canvas.style.height = `${innerHeight}px`;
    stars = Array.from({ length: Math.min(170, Math.floor(innerWidth / 8)) }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.9 + 0.2,
      a: Math.random() * 0.7 + 0.2,
      v: Math.random() * 0.28 + 0.05
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    for (const star of stars) {
      star.y += star.v;
      if (star.y > height) star.y = -5;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(210, 252, 255, ${star.a})`;
      ctx.fill();
    }
    if (!reduceMotion) raf = requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener("resize", () => {
    cancelAnimationFrame(raf);
    resize();
    draw();
  });
}

init();
