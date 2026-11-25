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

// Handle logout
document.getElementById("logout-btn").addEventListener("click", function() {

  sessionStorage.removeItem("unt-logged-in");

  location.hash = "#home";

  checkLogin();

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
  const credits = codes.reduce((n, c) => n + byCode(c).credits, 0);
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

show();
