/* GDPD — Client-side Protected Archives (Option C) */

/* ----- CONFIG ----- */
/* WARNING: Client-side password protection is for UX/demo only.
   For real security, implement server-side auth and encrypted storage. */
const PASSWORD = "gdpd-archive-2025"; // <<-- CHANGE THIS BEFORE PUBLISH
const STORAGE_KEY_UNLOCKED = "gdpd_archives_unlocked_v1";

/* ----- SAMPLE ARCHIVE DATA ----- 
   You can expand, edit, or replace this array with more entries.
   Each entry: id, title, category, clearance (open|restricted|confidential|black),
   tags (array), summary, content (HTML/text), date
*/
const ARCHIVES = [
  {
    id: "A-001",
    title: "Autonomous Loitering Drone Evaluation",
    category: "military-technology",
    clearance: "restricted",
    tags: ["UAV","Loitering","AI"],
    summary: "Field evaluation of loitering munitions and target recognition algorithms.",
    content: "<h4>Executive Summary</h4><p>Test results indicate improved target retention under simulated EW conditions...</p>",
    date: "2024-11-12"
  },
  {
    id: "A-002",
    title: "Black Sea Naval Movements: Analysis",
    category: "global-conflicts",
    clearance: "confidential",
    tags: ["naval","intel"],
    summary: "Consolidated satellite and HUMINT reports on recent task group manoeuvres.",
    content: "<h4>Intel Notes</h4><p>Confluence of high-speed transits observed near waypoint Charlie...</p>",
    date: "2025-03-02"
  },
  {
    id: "A-003",
    title: "Operation Nightfall — After Action",
    category: "special-operations",
    clearance: "black",
    tags: ["SOF","AAR"],
    summary: "After-action report for Operation Nightfall — limited distribution.",
    content: "<h4>After Action Report</h4><p>Lessons learned, stovepipe mitigation measures, operator heatmaps...</p>",
    date: "2025-06-18"
  },
  {
    id: "A-004",
    title: "Open Brief: Defence R&D Funding Trends",
    category: "intelligence-reports",
    clearance: "open",
    tags: ["policy","research"],
    summary: "Publicly releasable summary of global defence R&D budgets and trends.",
    content: "<p>Global defence R&D budgets rose 4.2% in Q1 2025; emphasis on space and AI.</p>",
    date: "2025-07-01"
  },
  {
    id: "A-005",
    title: "Classified: Supply Chain Tampering — Analysis",
    category: "classified-releases",
    clearance: "confidential",
    tags: ["supply-chain","cyber"],
    summary: "Detailed analysis of identified supply chain integrity breaches in contractor network.",
    content: "<p>Indicators point to compromised firmware updates across nodes; recommended mitigation includes cryptographic signing and OT segmentation.</p>",
    date: "2025-08-20"
  }
];

/* ----- Utilities ----- */
function $id(id) { return document.getElementById(id); }
function qSel(sel) { return document.querySelector(sel); }

function getUnlockedSet() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_UNLOCKED);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(arr);
  } catch {
    return new Set();
  }
}
function saveUnlockedSet(set) {
  try {
    const arr = Array.from(set);
    sessionStorage.setItem(STORAGE_KEY_UNLOCKED, JSON.stringify(arr));
  } catch {}
}

/* ----- Render list ----- */
function renderArchiveList(filterText="", category="all", clearance="all") {
  const container = $id("archiveList") || qSel(".archive-list") || qSel("#archiveList");
  if (!container) return;
  container.innerHTML = "";

  const unlocked = getUnlockedSet();

  const filtered = ARCHIVES.filter(item => {
    const matchesText = !filterText || (item.title + " " + item.summary + " " + (item.tags||[]).join(" ")).toLowerCase().includes(filterText.toLowerCase());
    const matchesCat = category === "all" || item.category === category;
    const matchesClear = clearance === "all" || item.clearance === clearance;
    return matchesText && matchesCat && matchesClear;
  });

  if (!filtered.length) {
    container.innerHTML = `<div class="archive-card"><p class="small-muted">No archive entries match your search/filters.</p></div>`;
    return;
  }

  filtered.forEach(item => {
    const card = document.createElement("div");
    card.className = "archive-card";

    const isLocked = item.clearance !== "open" && !unlocked.has(item.id);

    card.innerHTML = `
      <h3>${escapeHtml(item.title)}</h3>
      <div class="archive-meta">
        <span class="tag">${escapeHtml(humanCategory(item.category))}</span>
        <span style="margin-left:8px" class="${isLocked? 'lock-badge' : 'tag'}">${escapeHtml(capitalize(item.clearance))}${isLocked? ' • 🔒' : ''}</span>
        <span style="float:right" class="small-muted">${escapeHtml(item.date)}</span>
      </div>
      <p class="archive-summary">${escapeHtml(item.summary)}</p>
      <div class="archive-actions">
        ${isLocked ? `<button class="btn" data-id="${item.id}" data-action="unlock">Enter Password</button>` : `<button class="btn primary" data-id="${item.id}" data-action="open">Open File</button>`}
        <button class="btn" data-id="${item.id}" data-action="meta">Details</button>
      </div>
    `;
    container.appendChild(card);
  });
}

/* ----- Helpers ----- */
function escapeHtml(s=''){ return (s+'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function capitalize(s=''){ return (s+'').charAt(0).toUpperCase() + (s||'').slice(1) }
function humanCategory(key){
  return {
    'military-technology': 'Military Technology',
    'global-conflicts': 'Global Conflicts',
    'special-operations': 'Special Operations',
    'intelligence-reports': 'Intelligence Reports',
    'classified-releases': 'Classified Releases'
  }[key] || key;
}

/* ----- Modal Controls ----- */
const pwModal = document.getElementById("pwModal");
const pwInput = document.getElementById("pwInput");
const pwSubmit = document.getElementById("pwSubmit");
const pwCancel = document.getElementById("pwCancel");
const pwError = document.getElementById("pwError");
const pwHint = document.getElementById("pwModalHint");

const viewerModal = document.getElementById("viewerModal");
const viewerContent = document.getElementById("viewerContent");
const viewerClose = document.getElementById("viewerClose");

let pendingUnlockId = null;

pwCancel.addEventListener("click", ()=> closePwModal());
pwModal.addEventListener("click", (e)=> { if(e.target === pwModal) closePwModal(); });
viewerClose.addEventListener("click", ()=> closeViewer());

pwSubmit.addEventListener("click", ()=>{
  const entered = pwInput.value || "";
  if (entered === PASSWORD) {
    // unlock pending doc
    if (pendingUnlockId) {
      const s = getUnlockedSet();
      s.add(pendingUnlockId);
      saveUnlockedSet(s);
      pendingUnlockId = null;
      closePwModal();
      renderArchiveList($id("searchInput")?.value||"", $id("categoryFilter")?.value||"all", $id("clearanceFilter")?.value||"all");
    }
    pwInput.value = "";
    pwError.classList.add("hidden");
  } else {
    pwError.classList.remove("hidden");
  }
});

/* ----- Viewer modal functions ----- */
function openViewer(item) {
  if (!item) return;
  viewerContent.innerHTML = item.content || `<p>No content available.</p>`;
  viewerModal.classList.remove("hidden");
}
function closeViewer(){ viewerModal.classList.add("hidden"); viewerContent.innerHTML = ""; }

/* ----- Open password modal ----- */
function openPwModal(id, hintText="This file requires elevated clearance") {
  pendingUnlockId = id;
  pwHint.textContent = hintText;
  pwError.classList.add("hidden");
  pwInput.value = "";
  pwModal.classList.remove("hidden");
  pwInput.focus();
}
function closePwModal(){ pendingUnlockId = null; pwModal.classList.add("hidden"); pwInput.value=""; pwError.classList.add("hidden"); }

/* ----- Event delegation for archive actions ----- */
document.addEventListener("click", (e)=>{
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const action = btn.getAttribute("data-action");
  const id = btn.getAttribute("data-id");
  const item = ARCHIVES.find(x=>x.id===id);
  if (!item) return;

  if (action === "unlock") {
    openPwModal(id, `Unlock ${item.title} — clearance ${capitalize(item.clearance)}`);
  } else if (action === "open") {
    openViewer(item);
  } else if (action === "meta") {
    alert(`ID: ${item.id}\nCategory: ${humanCategory(item.category)}\nClearance: ${capitalize(item.clearance)}\nTags: ${(item.tags||[]).join(", ")}`);
  }
});

/* ----- Controls: search, filters ----- */
const searchInput = $id("searchInput");
const categoryFilter = $id("categoryFilter");
const clearanceFilter = $id("clearanceFilter");
const unlockAllBtn = $id("unlockAllBtn");

if (searchInput) searchInput.addEventListener("input", ()=> renderArchiveList(searchInput.value, categoryFilter.value, clearanceFilter.value));
if (categoryFilter) categoryFilter.addEventListener("change", ()=> renderArchiveList(searchInput.value, categoryFilter.value, clearanceFilter.value));
if (clearanceFilter) clearanceFilter.addEventListener("change", ()=> renderArchiveList(searchInput.value, categoryFilter.value, clearanceFilter.value));

if (unlockAllBtn) unlockAllBtn.addEventListener("click", ()=>{
  const pass = prompt("Enter GDPD archives password to unlock this session:");
  if (pass === PASSWORD) {
    const s = getUnlockedSet();
    ARCHIVES.forEach(a => s.add(a.id));
    saveUnlockedSet(s);
    alert("All archives unlocked for this browser session.");
    renderArchiveList(searchInput?.value||"", categoryFilter?.value||"all", clearanceFilter?.value||"all");
  } else {
    alert("Invalid password.");
  }
});

/* ----- initial render ----- */
document.addEventListener("DOMContentLoaded", ()=> {
  // create archive-list container if missing
  if (!$id("archiveList")) {
    const wrapper = document.createElement("div");
    wrapper.id = "archiveList";
    wrapper.className = "archive-list";
    const ref = document.querySelector(".archive-list") || document.querySelector(".archive-list") || document.querySelector("#archiveList");
    // place after controls
    const controls = document.querySelector(".archive-controls") || document.querySelector(".archive-controls");
    if (controls && controls.parentNode) controls.parentNode.insertBefore(wrapper, controls.nextSibling);
    else document.querySelector(".container")?.appendChild(wrapper);
  }

  renderArchiveList("", "all", "all");
});
