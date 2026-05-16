const data = window.PROJECT_REFERENCES;

const tabsEl = document.querySelector("#section-tabs");
const sectionRefsEl = document.querySelector("#section-references");
const fullBibEl = document.querySelector("#full-bibliography");
const validationEl = document.querySelector("#reference-validation");
const searchEl = document.querySelector("#reference-search");

let activeSection = 0;
let query = "";

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function searchable(ref) {
  return [ref.key, ref.title, ref.authors, ref.year, ref.venue].join(" ").toLowerCase();
}

function refMatches(ref) {
  return !query || searchable(ref).includes(query);
}

function refCard(ref, showStatus = false) {
  const status = showStatus && !ref.sectionCited
    ? '<span class="uncited-note">not section-cited in compiled source</span>'
    : "";
  const classes = ["ref-item", !ref.sectionCited && showStatus ? "uncited" : ""].filter(Boolean).join(" ");
  return `
    <article class="${classes}" id="ref-${escapeHtml(ref.key)}">
      <span class="ref-key">${escapeHtml(ref.key)}</span>
      <p class="ref-title">${escapeHtml(ref.title || ref.key)}</p>
      <p class="ref-meta">${escapeHtml([ref.authors, ref.year, ref.venue].filter(Boolean).join(" · "))}</p>
      ${status}
    </article>
  `;
}

function renderValidation() {
  const counts = data.counts;
  validationEl.innerHTML = `
    <span class="pill">${counts.bibliographyEntries} BibTeX entries</span>
    <span class="pill">${counts.sectionCitedEntries} section-cited entries</span>
    <span class="pill">${counts.uncitedEntries} not section-cited</span>
    <span class="pill">${counts.missingCitationKeys} missing citation keys</span>
  `;
}

function renderTabs() {
  tabsEl.innerHTML = data.sections.map((section, index) => `
    <button class="section-tab" type="button" aria-selected="${index === activeSection}" data-section="${index}">
      <span>${escapeHtml(section.title)}</span>
      <span class="section-count">${section.references.length}</span>
    </button>
  `).join("");

  tabsEl.querySelectorAll(".section-tab").forEach((button) => {
    button.addEventListener("click", () => {
      activeSection = Number(button.dataset.section);
      render();
    });
  });
}

function renderSection() {
  const section = data.sections[activeSection];
  const refs = section.references.filter(refMatches);
  const subsectionHtml = section.subsections
    .filter((subsection) => subsection.references.some(refMatches))
    .map((subsection) => `
      <p class="ref-meta"><strong>${escapeHtml(subsection.title)}:</strong>
      ${subsection.references.filter(refMatches).map((ref) => escapeHtml(ref.key)).join(", ")}</p>
    `)
    .join("");

  sectionRefsEl.innerHTML = `
    <section class="reference-section">
      <header>
        <h3>${escapeHtml(section.title)}</h3>
        <p>${refs.length} matching references from ${section.references.length} section citations.</p>
        ${subsectionHtml}
      </header>
      <div class="ref-list">
        ${refs.length ? refs.map((ref) => refCard(ref)).join("") : "<p>No references match the current search.</p>"}
      </div>
    </section>
  `;
}

function renderFullBibliography() {
  const refs = data.bibliography.filter(refMatches);
  fullBibEl.innerHTML = `
    <div class="ref-list">
      ${refs.map((ref) => refCard(ref, true)).join("")}
    </div>
  `;
}

function render() {
  renderValidation();
  renderTabs();
  renderSection();
  renderFullBibliography();
}

searchEl.addEventListener("input", (event) => {
  query = event.target.value.trim().toLowerCase();
  renderSection();
  renderFullBibliography();
});

render();
