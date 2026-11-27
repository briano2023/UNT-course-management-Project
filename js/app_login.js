
// Saved in the browser (localStorage) for now. A backend/database can replace this later.

const loginPage = document.getElementById("login-page");
const appShell = document.getElementById("app-shell");
const loginForm = document.getElementById("login-form");

// Check whether the user is already logged in
function checkLogin() {
  const loggedIn = sessionStorage.getItem("unt-logged-in") === "true";

  loginPage.style.display = loggedIn ? "none" : "flex";
  appShell.hidden = !loggedIn;
}

// Handle login
loginForm.addEventListener("submit", function(e) {
  e.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  const error = document.getElementById("login-error");

  // Demo login validation
  if (email && password.length >= 6) {

    sessionStorage.setItem("unt-logged-in", "true");

    error.textContent = "";

    loginForm.reset();

    checkLogin();

    show();

  } else {
    error.textContent = "Please enter a valid email and password.";
  }
});

checkLogin();

const KEY = "unt-course-manager";
let state = JSON.parse(localStorage.getItem(KEY) || '{"profile":null,"plan":{}}');
const save = () => localStorage.setItem(KEY, JSON.stringify(state));
const $ = id => document.getElementById(id);
const byCode = code => COURSES.find(c => c.code === code);

// ---- Navigation ----
function show() {
  const v = (location.hash || "#home").slice(1);
  document.querySelectorAll(".view").forEach(s => s.classList.toggle("show", s.id === v));
  document.querySelectorAll("nav a").forEach(a => a.classList.toggle("active", a.dataset.v === v));
  if (v === "catalog") renderCatalog();
  if (v === "path") renderPath();
  if (v === "transfer") renderTransfers();
  if (v === "dashboard") renderDashboard();
}
window.addEventListener("hashchange", show);

// ---- Intro / profile ----
if (state.profile) {
  $("p-name").value = state.profile.name;
  $("p-major").value = state.profile.major;
  $("p-year").value = state.profile.year;
}
$("profile").addEventListener("submit", e => {
  e.preventDefault();
  state.profile = {name: $("p-name").value, major: $("p-major").value, year: $("p-year").value};
  save();
  location.hash = "#catalog";
});

    // ---- Dashboard ----
function renderDashboard() {
  const p = state.profile;
  $("dash-greet").textContent = p && p.name ? "Welcome back, " + p.name : "Welcome";
  $("dash-major").textContent = p ? p.major + "  |  " + p.year : "Fill out the Home page to set your major and year.";
  const codes = Object.keys(state.plan);
  const approved = (state.transfers || []).filter(c => c.status === "Approved");
  const equiv = new Set(approved.map(c => c.equivalent.trim().toUpperCase()).filter(Boolean));
  const planned = codes.filter(c => !equiv.has(c.toUpperCase())).reduce((n, c) => n + byCode(c).credits, 0);
  const transfer = approved.reduce((n, c) => n + c.credits, 0);
  const credits = planned + transfer;
  $("dash-credits").textContent = credits;
  $("dash-courses").textContent = codes.length;
  $("dash-unassigned").textContent = codes.filter(c => state.plan[c] < 0).length;
  $("dash-transfer").textContent = transfer;
  $("dash-bar-fill").style.width = Math.min(100, credits / TOTAL_CREDITS * 100) + "%";
  $("dash-bar-text").textContent = credits + " / " + TOTAL_CREDITS + " credits";
}

// ---- Catalog (Feature 1) ----
[...new Set(COURSES.map(c => c.type))].forEach(t => $("f-type").add(new Option(t, t)));
["f-search", "f-type", "f-level"].forEach(id => $(id).addEventListener("input", renderCatalog));

function renderCatalog() {
  const q = $("f-search").value.toLowerCase(), type = $("f-type").value, lvl = $("f-level").value;
  const list = COURSES.filter(c =>
    (c.code + " " + c.title).toLowerCase().includes(q) &&
    (!type || c.type === type) &&
    (!lvl || c.code.match(/\d/) && c.code.split(" ")[1][0] === lvl));
  $("rows").innerHTML = list.map(c => {
    const inPlan = c.code in state.plan;
    return `<tr><td>${c.code}</td><td>${c.title}</td><td>${c.type}</td><td>${c.credits}</td>
      <td><button class="btn ${inPlan ? "done" : ""}" data-add="${c.code}">${inPlan ? "In plan ✔" : "+ Add to plan"}</button></td></tr>`;
  }).join("") || '<tr><td colspan="5">No courses match.</td></tr>';
}
$("rows").addEventListener("click", e => {
  const code = e.target.dataset.add;
  if (!code) return;
  if (code in state.plan) delete state.plan[code]; else state.plan[code] = -1;
  save(); renderCatalog();
});

// ---- Degree Path (Feature 2) ----
function chip(code, sem) {
  const opts = `<option value="-1">Unassigned</option>` +
    SEMESTERS.map((s, i) => `<option value="${i}" ${i === sem ? "selected" : ""}>${s}</option>`).join("");
  return `<div class="chip"><span>${code}</span><select data-move="${code}">${opts}</select><button data-del="${code}" title="Remove">✕</button></div>`;
}
function renderPath() {
  const codes = Object.keys(state.plan);
  const approvedTransfers = state.transfers.filter(
  c => c.status === "Approved"
  );
const transferredEquivalents = new Set(
  approvedTransfers
    .map(c => c.equivalent.trim().toUpperCase())
    .filter(Boolean)
);
const plannedCredits = codes
  .filter(c => !transferredEquivalents.has(c.toUpperCase()))
  .reduce((n, c) => n + byCode(c).credits, 0);
const transferCredits = approvedTransfers.reduce(
  (n, c) => n + c.credits, 0
);
const credits = plannedCredits + transferCredits;
  $("bar-fill").style.width = Math.min(100, credits / TOTAL_CREDITS * 100) + "%";
  $("bar-text").textContent = `${credits} / ${TOTAL_CREDITS} credits planned`;
  const un = codes.filter(c => state.plan[c] < 0);
  $("unassigned").innerHTML = `<b>Unassigned courses</b>` +
    (un.length ? un.map(c => chip(c, -1)).join("") : `<p class="note">Add courses from the Catalog, then pick a semester for each.</p>`);
  $("grid").innerHTML = SEMESTERS.map((name, i) => {
    const cs = codes.filter(c => state.plan[c] === i);
    const tot = cs.reduce((n, c) => n + byCode(c).credits, 0);
    return `<div class="sem"><h4>${name}</h4>${cs.map(c => chip(c, i)).join("")}
      <div class="tot ${tot > 18 ? "over" : ""}">${tot} credits${tot > 18 ? " (heavy load)" : ""}</div></div>`;
  }).join("");
}
document.addEventListener("change", e => {
  if (e.target.dataset.move) { state.plan[e.target.dataset.move] = +e.target.value; save(); renderPath(); }
});
document.addEventListener("click", e => {
  if (e.target.dataset.del) { delete state.plan[e.target.dataset.del]; save(); renderPath(); }
});
$("suggest").addEventListener("click", () => { state.plan = {...SUGGESTED}; save(); renderPath(); });
$("clear").addEventListener("click", () => { state.plan = {}; save(); renderPath(); });

// ---- Credit Transfer System (Feature 3) ----

// Initialize transfer records
if (!Array.isArray(state.transfers)) {
  state.transfers = [];
}

const saveTransfers = () => save();

// Prevent HTML injection in transfer records
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}


// ---- Add Transfer Course ----

$("transfer-form").addEventListener("submit", e => {
  e.preventDefault();

  const school = $("transfer-school").value.trim();
  const code = $("transfer-code").value.trim();
  const title = $("transfer-title").value.trim();
  const credits = Number($("transfer-credits").value);
  const equivalent = $("transfer-equivalent").value.trim();

  if (
    !school ||
    !code ||
    !title ||
    !Number.isInteger(credits) ||
    credits < 1 ||
    credits > 12
  ) {
    alert("Please enter valid transfer course information.");
    return;
  }

  state.transfers.push({
    id: crypto.randomUUID(),
    school,
    code,
    title,
    credits,
    equivalent,
    status: "Pending"
  });

  saveTransfers();

  $("transfer-form").reset();

  renderTransfers();

  alert("Transfer course submitted successfully!");
});


// ---- Display Transfer Courses and Credit Totals ----

function renderTransfers() {
  const transfers = state.transfers;

  const approved = transfers
    .filter(c => c.status === "Approved")
    .reduce((sum, c) => sum + c.credits, 0);

  const pending = transfers
    .filter(c => c.status === "Pending")
    .reduce((sum, c) => sum + c.credits, 0);

  const rejected = transfers
    .filter(c => c.status === "Rejected")
    .reduce((sum, c) => sum + c.credits, 0);

  const total = transfers.reduce(
    (sum, c) => sum + c.credits, 0
  );

  $("transfer-total").textContent = total;
  $("transfer-approved").textContent = approved;
  $("transfer-pending").textContent = pending;
  $("transfer-rejected").textContent = rejected;

  const filter = $("transfer-filter").value;

  const filtered = transfers.filter(c =>
    !filter || c.status === filter
  );

  $("transfer-rows").innerHTML = filtered.map(c => `
    <tr>
      <td>${escapeHTML(c.school)}</td>

      <td>
        <strong>${escapeHTML(c.code)}</strong><br>
        ${escapeHTML(c.title)}
      </td>

      <td>${escapeHTML(c.equivalent || "Not assigned")}</td>

      <td>${c.credits}</td>

      <td>
        <select class="status-select"
          data-transfer-status="${escapeHTML(c.id)}">

          <option value="Pending"
            ${c.status === "Pending" ? "selected" : ""}>
            Pending
          </option>

          <option value="Approved"
            ${c.status === "Approved" ? "selected" : ""}>
            Approved
          </option>

          <option value="Rejected"
            ${c.status === "Rejected" ? "selected" : ""}>
            Rejected
          </option>

        </select>
      </td>

      <td>
        <button class="transfer-delete"
          data-transfer-delete="${escapeHTML(c.id)}">
          Delete
        </button>
      </td>
    </tr>
  `).join("") || `
    <tr>
      <td colspan="6">No transfer courses found.</td>
    </tr>
  `;
}


// ---- Change Transfer Status ----

$("transfer-rows").addEventListener("change", e => {
  const id = e.target.dataset.transferStatus;

  if (!id) return;

  const course = state.transfers.find(c => c.id === id);

  if (!course) return;

  course.status = e.target.value;

  saveTransfers();
  renderTransfers();

  renderPath();
});


// ---- Delete Transfer Course ----

$("transfer-rows").addEventListener("click", e => {
  const id = e.target.dataset.transferDelete;

  if (!id) return;

  if (!confirm("Delete this transfer course?")) return;

  state.transfers = state.transfers.filter(c => c.id !== id);

  saveTransfers();
  renderTransfers();
  renderPath();
});


// ---- Filter Transfer Courses ----

$("transfer-filter").addEventListener(
  "change",
  renderTransfers
);


// ---- Initialize Application ----

show();
renderTransfers();
