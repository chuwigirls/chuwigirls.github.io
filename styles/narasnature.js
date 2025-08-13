/* 
        _..---.--.
       .'\ __|/O.__)
      /__.' _/ .-'_\
     (____.'.-_\____)
      (_/ _)__(_ \_)_
    mrf(_..)--(.._)'--'
*/

// ==============================
// Load Google Visualization API
// ==============================
function loadGoogleSheetsAPI(callback) {
  const script = document.createElement("script");
  script.src = "https://www.gstatic.com/charts/loader.js";
  script.onload = () => {
    google.charts.load("current", { packages: ["corechart", "table"] });
    google.charts.setOnLoadCallback(callback);
  };
  document.head.appendChild(script);
}

// ==============================
// Fetch Sheet Data
// ==============================
function fetchSheetData(spreadsheetId, sheetName, onSuccess) {
  const query = encodeURIComponent(`SELECT *`);
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?sheet=${sheetName}&tq=${query}`;

  fetch(url)
    .then(res => res.text())
    .then(raw => {
      const json = JSON.parse(raw.substring(47).slice(0, -2));
      const headers = json.table.cols.map(col => col.label);
      const rows = json.table.rows.map(row =>
        row.c.map(cell => (cell ? cell.v : ""))
      );
      const data = rows.map(row => {
        const obj = {};
        headers.forEach((header, i) => obj[header] = row[i]);
        return obj;
      });
      onSuccess(data);
    })
    .catch(err => console.error("Sheet fetch error:", err));
}

// ==============================
// Header / Footer / Sidebar Includes
// ==============================
async function loadHeaderFooter() {
  const includes = document.querySelectorAll(".includes");

  for (const el of includes) {
    const source = el.getAttribute("data-source");
    if (!source) continue;
    try {
      const res = await fetch(source);
      const html = await res.text();
      el.innerHTML = html;
    } catch (err) {
      console.error("Failed to load include:", source, err);
    }
  }

  // Initialize UI after includes
  initDropdowns();
  initNavbarToggler();
  initSidebar();
  updateHeaderHeightCSSVar();

  // OAuth
  await handleOAuthCallback();
  updateNavbarUI();
  setupLogoutButton();

  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) loginBtn.addEventListener("click", () => {
    window.location.href = getDiscordOAuthURL();
  });
}

// ==============================
// Discord OAuth Config
// ==============================
const CLIENT_ID = "1319474218550689863";
const REDIRECT_URI = `${window.location.origin}/user.html`;
const GAS_ENDPOINT = "https://script.google.com/macros/s/AKfycbzO5xAQ9iUtJWgkeYYfhlIZmHQSj4kHjs5tnfQLvuU6L5HGyguUMU-9tTWTi8KGJ69U3A/exec`;

function getDiscordOAuthURL() {
  const scope = "identify";
  return `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=${scope}`;
}

// ==============================
// Navbar / Sidebar / Header Helpers
// ==============================
function updateHeaderHeightCSSVar() {
  const header = document.getElementById('siteHeader');
  if (header) document.documentElement.style.setProperty('--header-height', `${header.offsetHeight}px`);
}

function toggleSidebar() { document.body.classList.toggle("sidebar-open"); }

function handleSidebarDisplay() {
  if (window.innerWidth >= 1275) {
    if (!document.body.classList.contains("sidebar-closed")) document.body.classList.add("sidebar-open");
  } else document.body.classList.remove("sidebar-open");
}

function handleSidebarScrollPosition() {
  const headerHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 0;
  if (window.scrollY > headerHeight) document.body.classList.add("sidebar-fixed");
  else document.body.classList.remove("sidebar-fixed");
}

function initSidebar() {
  const toggleBtn = document.getElementById("openNav");
  if (toggleBtn) toggleBtn.addEventListener("click", toggleSidebar);

  handleSidebarDisplay();
  handleSidebarScrollPosition();

  window.addEventListener("resize", () => {
    handleSidebarDisplay();
    updateHeaderHeightCSSVar();
    handleSidebarScrollPosition();
  });
  window.addEventListener("scroll", handleSidebarScrollPosition);
}

function initDropdowns() {
  document.querySelectorAll(".dropdown").forEach(dropdown => {
    const button = dropdown.querySelector(".dropbtn");
    const menu = dropdown.querySelector(".dropdown-content");
    if (!button || !menu) return;

    dropdown.addEventListener("mouseenter", () => menu.classList.add("show"));
    dropdown.addEventListener("mouseleave", () => menu.classList.remove("show"));

    menu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        menu.classList.remove("show");
        const navbarMenu = document.getElementById("navbarMenu");
        if (navbarMenu?.classList.contains("show")) navbarMenu.classList.remove("show");
      });
    });
  });
}

function initNavbarToggler() {
  const toggler = document.getElementById("navbarToggle");
  const navLinks = document.getElementById("navbarMenu");
  if (!toggler || !navLinks) return setTimeout(initNavbarToggler, 100);

  const newToggler = toggler.cloneNode(true);
  toggler.parentNode.replaceChild(newToggler, toggler);
  newToggler.addEventListener("click", () => navLinks.classList.toggle("show"));
}

// ==============================
// Logout Handler
// ==============================
function setupLogoutButton() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", e => {
    e.preventDefault();
    localStorage.removeItem("discordUser");
    localStorage.removeItem("access_token");
    localStorage.removeItem("userData");
    updateNavbarUI();
    window.location.href = "/index.html";
  });
}

// ==============================
// OAuth Callback
// ==============================
async function handleOAuthCallback() {
  if (!window.location.hash) return;

  const params = new URLSearchParams(window.location.hash.slice(1));
  const accessToken = params.get("access_token");
  if (!accessToken) return;

  localStorage.setItem("access_token", accessToken);

  try {
    const discordUser = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${accessToken}` }
    }).then(res => res.json());

    localStorage.setItem("discordUser", JSON.stringify(discordUser));

    if (discordUser.id) {
      const gasUrl = `${GAS_ENDPOINT}?id=${discordUser.id}&username=${encodeURIComponent(discordUser.username)}`;
      const gasData = await fetch(gasUrl).then(res => res.json());
      localStorage.setItem("userData", JSON.stringify(gasData));
    }

    history.replaceState(null, "", window.location.pathname);
  } catch (err) { console.error("OAuth handling error:", err); }
}

// ==============================
// Sheet Rendering (Modular)
// ==============================
function renderMasterlist(data) { /* same as previous modular code */ }
function renderFeaturedNara(data) { /* same as previous modular code */ }

// ==============================
// Centralized Page Load
// ==============================
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // 1️⃣ Load includes first (header, footer, sidebar)
    await loadHeaderFooter();

    // 2️⃣ Redirect login/user
    const path = window.location.pathname;
    const userData = JSON.parse(localStorage.getItem("discordUser") || "{}");
    if (userData.username && path.endsWith("/login.html")) return window.location.href = "/user.html";
    if (!userData.username && path.endsWith("/user.html")) return window.location.href = "/login.html";

    // 3️⃣ Fade-in main content
    const mainContent = document.getElementById("output");
    if (mainContent) mainContent.classList.add("fade-in");

    // 4️⃣ Fetch and render sheets
    fetchSheetData("1lGc4CVqcFr9LtcyVW-78N5En7_imdfC8bTf6PRUD-Ms", "Masterlist", renderMasterlist);
    fetchSheetData("1lGc4CVqcFr9LtcyVW-78N5En7_imdfC8bTf6PRUD-Ms", "Masterlist", renderFeaturedNara);

  } catch (err) { console.error("Page initialization error:", err); }
});
