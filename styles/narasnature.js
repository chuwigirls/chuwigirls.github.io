/*       _..---.--.
       .'\ __|/O.__)
      /__.' _/ .-'_\
     (____.'.-_\____)
      (_/ _)__(_ \_ )_
    mrf(_..)--(.._)'--'

    if you're looking at this page to learn about coding,
    you can ask chuwigirls for help!

   ==============================
   ===== Discord OAuth Config ===
   ============================== */
const CLIENT_ID = "1319474218550689863";
const REDIRECT_URI = `${window.location.origin}/user.html`;
const GAS_ENDPOINT = "https://script.google.com/macros/s/AKfycbzO5xAQ9iUtJWgkeYYfhlIZmHQSj4kHjs5tnfQLvuU6L5HGyguUMU-9tTWTi8KGJ69U3A/exec";

function getDiscordOAuthURL() {
  const scope = "identify";
  return `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&response_type=token&scope=${scope}`;
}

/* ==============================
   ===== Navbar =================
   ============================== */
function updateNavbarUI(userDataParam) {
  const userData = userDataParam || JSON.parse(localStorage.getItem("discordUser") || "{}");
  const loginNav = document.getElementById("loginNav");
  const userDropdown = document.getElementById("userDropdown");

  if (userData && userData.id && userData.username) {
    // Logged in
    if (loginNav) loginNav.style.display = "none";
    if (userDropdown) {
      userDropdown.style.display = "flex";
      const usernameSpan = userDropdown.querySelector(".username");
      if (usernameSpan) usernameSpan.textContent = userData.username;
    }

    // ✅ Only fetch profile if user is logged in
    fetchUserProfile();
  } else {
    // Logged out
    if (loginNav) loginNav.style.display = "flex";
    if (userDropdown) userDropdown.style.display = "none";
  }
}

/* ==============================
   ===== Fetch Profile ==========
   ============================== */
async function fetchUserProfile() {
  try {
    const discordUser = JSON.parse(localStorage.getItem("discordUser") || "{}");
    if (!discordUser.id) return; // Guard: don’t run if logged out

    console.log("Discord user from localStorage:", discordUser);

    // Show spinner, hide others
    document.getElementById("profile-spinner").style.display = "block";
    document.getElementById("profile-content").style.display = "none";
    document.getElementById("profile-error").style.display = "none";

    const url = `${GAS_ENDPOINT}?action=getUserProfile&discordId=${encodeURIComponent(discordUser.id)}`;
    console.log("Fetching user profile from:", url);

    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    console.log("✅ GAS Response:", data);

    renderUserProfile(data);

    // Success → show profile
    document.getElementById("profile-spinner").style.display = "none";
    document.getElementById("profile-content").style.display = "block";
    document.getElementById("profile-error").style.display = "none";
  } catch (err) {
    console.error("❌ Error fetching user profile:", err);

    // Error → show fallback
    document.getElementById("profile-spinner").style.display = "none";
    document.getElementById("profile-content").style.display = "none";
    document.getElementById("profile-error").style.display = "block";
  }
}

// Attach retry button event on DOM load
document.addEventListener("DOMContentLoaded", () => {
  const retryBtn = document.getElementById("retryProfileBtn");
  if (retryBtn) retryBtn.addEventListener("click", fetchUserProfile);
});

/* ==============================
   ===== Page Guard =============
   ============================== */
document.addEventListener("DOMContentLoaded", () => {
  const isUserPage = window.location.pathname.endsWith("/user.html");
  const discordUser = JSON.parse(localStorage.getItem("discordUser") || "{}");

  if (isUserPage && !discordUser.id) {
    console.warn("🚫 No user logged in — redirecting to login.html");
    window.location.href = "login.html";
  }
});

/* ==============================
   ===== Header Auth Spinner ====
   ============================== */
function showHeaderAuthSpinner() {
  const loginNav = document.getElementById("loginNav");
  if (!loginNav) return;

  if (!loginNav.dataset.prevHtml) {
    loginNav.dataset.prevHtml = loginNav.innerHTML;
  }

  loginNav.innerHTML = '<div class="spinner" id="authSpinner"><i class="fa-solid fa-spinner fa-spin"></i></div>';
  loginNav.style.display = "flex";
}

function hideHeaderAuthSpinner() {
  const loginNav = document.getElementById("loginNav");
  if (!loginNav) return;

  const prev = loginNav.dataset.prevHtml;
  if (prev) {
    loginNav.innerHTML = prev;
    delete loginNav.dataset.prevHtml;
  } else {
    const s = document.getElementById("authSpinner");
    if (s && s.parentNode) s.parentNode.removeChild(s);
  }
}

/* ==============================
   ===== OAuth ==================
   ============================== */
async function handleOAuthCallback() {
  const params = new URLSearchParams(window.location.hash.substring(1));
  const accessToken = params.get("access_token");
  if (!accessToken) return;

  showHeaderAuthSpinner();

  try {
    localStorage.setItem("access_token", accessToken);

    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!userResponse.ok) throw new Error("Failed to fetch user info");

    const userData = await userResponse.json();
    localStorage.setItem("discordUser", JSON.stringify(userData));

    if (userData.id) {
      fetch(`${GAS_ENDPOINT}?id=${userData.id}&username=${encodeURIComponent(userData.username)}`)
        .then(res => res.json())
        .then(gasData => localStorage.setItem("userData", JSON.stringify(gasData)))
        .catch(() => {});
    }

    if (!window.location.pathname.endsWith("/user.html")) {
      window.location.replace("/user.html");
      return;
    } else {
      history.replaceState(null, "", window.location.pathname);
      updateNavbarUI();
      hideHeaderAuthSpinner();
    }
  } catch (err) {
    console.error("OAuth handling error:", err);
    history.replaceState(null, "", window.location.pathname);
    hideHeaderAuthSpinner();
  }
}

function setupLogoutButton() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", e => {
      e.preventDefault();
      localStorage.removeItem("discordUser");
      localStorage.removeItem("userData");
      localStorage.removeItem("access_token");
      localStorage.removeItem("discordAccessToken");
      updateNavbarUI();
      window.location.href = "/index.html";
    });
  }
}

// ==============================
// ===== Sidebar, Header ========
// ==============================
function updateHeaderHeightCSSVar() {
  const header = document.getElementById('siteHeader');
  if (header) {
    document.documentElement.style.setProperty('--header-height', `${header.offsetHeight}px`);
  }
}

function toggleSidebar() {
  document.body.classList.toggle("sidebar-open");
}

function handleSidebarDisplay() {
  if (window.innerWidth >= 1275) {
    if (!document.body.classList.contains("sidebar-closed")) {
      document.body.classList.add("sidebar-open");
    }
  } else {
    document.body.classList.remove("sidebar-open");
  }
}

function updateHeaderHeightCSSVar() {
  const header = document.getElementById('siteHeader');
  if (header) {
    document.documentElement.style.setProperty('--header-height', `${header.offsetHeight}px`);
  }
}

function toggleSidebar() {
  document.body.classList.toggle("sidebar-open");
}

function handleSidebarDisplay() {
  if (window.innerWidth >= 1275) {
    if (!document.body.classList.contains("sidebar-closed")) {
      document.body.classList.add("sidebar-open");
    }
  } else {
    document.body.classList.remove("sidebar-open");
  }
}

function initSidebar() {
  const toggleBtn = document.getElementById("openNav");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", toggleSidebar);
  }

  handleSidebarDisplay();

  window.addEventListener("resize", () => {
    updateHeaderHeightCSSVar();
    handleSidebarDisplay();
  });
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
        if (navbarMenu?.classList.contains("show")) {
          navbarMenu.classList.remove("show");
        }
      });
    });
  });
}

function initNavbarToggler() {
  const toggler = document.getElementById("navbarToggle");
  const navLinks = document.getElementById("navbarMenu");

  if (!toggler || !navLinks) {
    setTimeout(initNavbarToggler, 100);
    return;
  }

  const newToggler = toggler.cloneNode(true);
  toggler.parentNode.replaceChild(newToggler, toggler);

  newToggler.addEventListener("click", () => navLinks.classList.toggle("show"));
}

window.addEventListener('load', updateHeaderHeightCSSVar);
window.addEventListener('resize', updateHeaderHeightCSSVar);

// ==============================
// ===== Load Includes & Initialize Page ====
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

  await handleOAuthCallback(); 
  updateNavbarUI();
  setupLogoutButton();

  initDropdowns();
  initNavbarToggler();
  initSidebar();
  updateHeaderHeightCSSVar();

  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) loginBtn.addEventListener("click", () => {
    window.location.href = getDiscordOAuthURL();
  });

  setupPageTransitions();
  setupBackToTop();
}

/* ==========================
   Fetch Sheets
   ========================== */
async function fetchSheetData(sheetName) {
  if (!SHEET_BASE_URL) {
    throw new Error("SHEET_BASE_URL is not defined.");
  }
  const url = `${SHEET_BASE_URL}/${encodeURIComponent(sheetName)}`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Error fetching sheet: ${sheetName}`);
  return await response.json();
}

/* ==========================
   Render Sheets
   ========================== */
function renderSheets(data, config) {
  const listEl = document.getElementById(config.listId);
  const detailEl = document.getElementById(config.detailId);
  const pageEl = document.querySelector(".page");
  const cardTemplate = document.querySelector(config.cardTemplate);
  const detailTemplate = document.querySelector(config.detailTemplate);

  if (!listEl || !detailEl || !cardTemplate || !detailTemplate) {
    console.error("Missing DOM elements for rendering:", config);
    return;
  }

  const pageDefaultDisplay = pageEl ? getComputedStyle(pageEl).display : "block";

  listEl.innerHTML = "";
  detailEl.innerHTML = "";

  data.forEach(row => {
    const isHidden = String(row.Hide || "").toLowerCase() === "true" || row.Hide === true;
    if (isHidden) return;

    const hasName = row[config.nameField] && String(row[config.nameField]).trim() !== "";
    const hasImage = row[config.imageField] && String(row[config.imageField]).trim() !== "";
    if (!hasName && !hasImage) return;

    const card = cardTemplate.content.cloneNode(true);
    const imgEl = card.querySelector("img");
    const nameEl = card.querySelector(".narapedia-card-name");

    if (imgEl) imgEl.src = row[config.imageField] || "../assets/placeholder.png";
    if (nameEl) nameEl.textContent = hasName ? row[config.nameField] : "Unnamed";

    const clickable = card.querySelector(".narapedia-card") || card.firstElementChild;
    if (clickable) {
      clickable.addEventListener("click", () => {
        renderDetail(row, config);
        const qp = config.queryParam || "id";
        history.pushState({ view: "detail", name: row[config.nameField] }, "", `?${qp}=${encodeURIComponent(row[config.nameField] || "")}`);
      });
    }

    listEl.appendChild(card);
  });

  const params = new URLSearchParams(window.location.search);
  const target = params.get(config.queryParam || "id");
  if (target) {
    const match = data.find(row => String(row[config.nameField]) === target);
    if (match) renderDetail(match, config);
  }

  function renderDetail(row, config) {
    hideSpinner(config.listId);

    listEl.style.display = "none";
    detailEl.style.display = "block";
    if (pageEl) pageEl.style.display = "none";
    detailEl.innerHTML = "";

    window.scrollTo(0, 0);

    const detail = detailTemplate.content.cloneNode(true);
    const imgEl = detail.querySelector("img");
    const nameEl = detail.querySelector("h2");

    if (imgEl) imgEl.src = row[config.imageField] || "../assets/placeholder.png";
    if (nameEl) nameEl.textContent = row[config.nameField] || "Unnamed";

    if (config.extraFields) {
      config.extraFields.forEach(fieldConf => {
        const el = detail.querySelector(`.${fieldConf.className}`);
        if (el) el.textContent = row[fieldConf.field] || "";
      });
    }

    const backBtn = detail.querySelector(".back-btn") || detail.querySelector("button");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        showGrid();
        history.pushState({ view: "grid" }, "", window.location.pathname);
      });
    }

    detailEl.appendChild(detail);
  }

  function showGrid() {
    detailEl.style.display = "none";
    listEl.style.display = "grid";
    if (pageEl) pageEl.style.display = pageDefaultDisplay;
  }

  window.addEventListener("popstate", () => {
    const params = new URLSearchParams(window.location.search);
    const target = params.get(config.queryParam || "id");
    if (target) {
      const match = data.find(row => String(row[config.nameField]) === target);
      if (match) {
        renderDetail(match, config);
      }
    } else {
      showGrid();
    }
  });
}

async function initSheet(sheetName, config) {
  try {
    showSpinner(config.listId, `Loading ${sheetName}...`);
    const data = await fetchSheetData(sheetName);
    renderSheets(data, config);
  } catch (err) {
    console.error(`Error loading ${sheetName}:`, err);
    const container = document.getElementById(config.listId);
    if (container) {
      container.insertAdjacentHTML("beforebegin", `<div class="loading-spinner">⚠️ Failed to load ${sheetName}.</div>`);
    }
  } finally {
    hideSpinner(config.listId);
  }
}

/* ==============================
   Sheet Rendering Spinners
   ============================== */
function showSpinner(containerId, message = "Loading...") {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.style.display = "none";

  let spinner = container.previousElementSibling;
  if (!spinner || !spinner.classList.contains("loading-spinner")) {
    spinner = document.createElement("div");
    spinner.className = "loading-spinner";
    spinner.innerHTML = `<i class="fa fa-spinner fa-spin"></i> ${message}`;
    container.insertAdjacentElement("beforebegin", spinner);
  }
  spinner.style.display = "block";
}

function hideSpinner(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const spinner = container.previousElementSibling;
  if (spinner && spinner.classList.contains("loading-spinner")) {
    spinner.style.display = "none";
  }
  container.style.display = "grid";
}

/* ==============================
   Featured Nara - Sidebar
   ============================== */
function getMonthlySeededNara(data) {
  const now = new Date();
  const seed = `${now.getUTCFullYear()}-${now.getUTCMonth() + 1}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }

  const visible = data.filter(row => {
    const hidden = String(row.Hide || "").toLowerCase() === "true" || row.Hide === true;
    const hasImg = typeof row["URL"] === "string" && row["URL"].trim() !== "";
    const hasName = typeof row["Nara"] === "string" && row["Nara"].trim() !== "";
    return !hidden && hasImg && hasName;
  });

  if (!visible.length) return null;
  const index = Math.abs(hash) % visible.length;
  return visible[index];
}

async function loadFeaturedNaraSidebar() {
  const sidebar = document.getElementById("featured-nara-sidebar");
  if (!sidebar) return;

  try {
    // Fetch the sheet (make sure spreadsheetId + sheetName are correct)
    const data = await fetchSheetData("Masterlist");


    const nara = getMonthlySeededNara(data);
    if (!nara) {
      sidebar.innerHTML = "";
      const placeholder = document.createElement("div");
      placeholder.className = "featured-nara-placeholder";
      placeholder.textContent = "Where'd all the Naras go?";
      sidebar.appendChild(placeholder);
      return;
    }

    // Create container
    const container = document.createElement("div");
    container.className = "random-nara-preview";

    // Link to masterlist detail
    const link = document.createElement("a");
    link.href = `/narapedia/masterlist.html?design=${encodeURIComponent(nara.Nara)}`;
    link.className = "featured-nara-link";
    link.style.textDecoration = "none";

    // Image
    const img = document.createElement("img");
    img.src = nara.URL;
    img.alt = nara.Nara;
    img.className = "random-nara-img";

    // Name
    const name = document.createElement("div");
    name.textContent = nara.Nara;
    name.className = "random-nara-name";

    // Assemble
    link.appendChild(img);
    link.appendChild(name);
    container.appendChild(link);

    // Render into sidebar
    sidebar.innerHTML = "";
    sidebar.appendChild(container);

  } catch (err) {
    console.error("Error loading featured Nara:", err);
    sidebar.innerHTML = "";
    const errorDiv = document.createElement("div");
    errorDiv.className = "featured-nara-placeholder";
    errorDiv.textContent = "⚠️ Failed to load Featured Nara";
    sidebar.appendChild(errorDiv);
  }
}

/* =======================================
   Featured Trials - Sidebar & Frontpage
   ======================================= */
let cachedEligibleTrials = null;
let cachedAllTrials = null;

async function getEligibleTrials() {
  if (cachedEligibleTrials && cachedAllTrials) return { eligible: cachedEligibleTrials, all: cachedAllTrials };

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0); // normalize to UTC midnight

  const trials = await fetchSheetData("Trials");

  // Cache all unhidden trials
  cachedAllTrials = trials.filter(row => {
    const hideVal = String(row.Hide || "").trim().toLowerCase();
    return !(hideVal === "true" || row.Hide === true);
  });

  // Filter eligible trials (ephemeral + ongoing)
  cachedEligibleTrials = cachedAllTrials.filter(row => {
    const start = row.Start ? new Date(row.Start) : null;
    const end = row.End ? new Date(row.End) : null;
    const tags = (row.Tags || "").toLowerCase();

    if (!tags.includes("ephemeral")) return false;
    if (start && start > today) return false;
    if (end && end < today) return false;

    return true;
  });

  return { eligible: cachedEligibleTrials, all: cachedAllTrials };
}

/* ===== Helper: format "August 22, 2025" ===== */
function formatDateLong(d) {
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

/* ===== Helper: format date or fallback text ===== */
function formatDateOrText(value) {
  if (!value) return "";
  const date = new Date(value);
  return isNaN(date.getTime()) ? value : formatDateLong(date);
}

// ==============================
// Build Trial Card
// ==============================
function makeTrialCard(trial, showDates = false) {
  const wrapper = document.createElement("div");
  wrapper.className = "featured-trial-card";

  const link = document.createElement("a");
  link.href = `/recreation/trials.html?trial=${encodeURIComponent(trial.Trial)}`;
  link.className = "featured-trial-link";
  link.style.textDecoration = "none";

  const img = document.createElement("img");
  img.src = trial.URL || "../assets/placeholder.png";
  img.alt = trial.Trial;
  img.className = "featured-trial-img";

  const name = document.createElement("div");
  name.textContent = trial.Trial;
  name.className = "featured-trial-name";

  link.appendChild(img);
  link.appendChild(name);

  if (showDates) {
    const dates = document.createElement("div");
    dates.className = "featured-trial-dates";

    if (trial.Start) {
      const startSpan = document.createElement("span");
      startSpan.className = "featured-trial-start";
      startSpan.textContent = `${formatDateOrText(trial.Start)} - `;
      dates.appendChild(startSpan);
    }

    if (trial.End) {
      const endSpan = document.createElement("span");
      endSpan.className = "featured-trial-end";
      endSpan.textContent = `${formatDateOrText(trial.End)}`;
      dates.appendChild(endSpan);
    }

    link.appendChild(dates);
  }

  wrapper.appendChild(link);
  return wrapper;
}

// ==============================
// Featured Trial - Sidebar
// ==============================
async function renderSidebarFeaturedTrial(targetId = "featured-trial-sidebar") {
  try {
    const { eligible, all } = await getEligibleTrials();
    const container = document.getElementById(targetId);
    if (!container) return;
    container.innerHTML = "";

    // Use eligible pool, else fallback to any unhidden trial with a name
    let pool = (eligible && eligible.length > 0) ? eligible : all.filter(t => t.Trial && t.Trial.trim());

    if (!pool || pool.length === 0) {
      const placeholder = document.createElement("div");
      placeholder.className = "featured-trial-placeholder";
      placeholder.textContent = "No Trials available.";
      container.appendChild(placeholder);
      return;
    }

    const chosen = pool[Math.floor(Math.random() * pool.length)];
    container.appendChild(makeTrialCard(chosen, false));


  } catch (err) {
    console.error("Error rendering sidebar featured trial:", err);
    const container = document.getElementById(targetId);
    if (container) {
      container.innerHTML = "";
      const errorDiv = document.createElement("div");
      errorDiv.className = "featured-trial-placeholder";
      errorDiv.textContent = "⚠️ Failed to load Featured Trial";
      container.appendChild(errorDiv);
    }
  }
}

/* ===== Helper: format "August 22, 2025" ===== */
function formatDateLong(d) {
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

/* ===== Helper: format date or fallback text ===== */
function formatDateOrText(value) {
  if (!value) return "";
  const date = new Date(value);
  return isNaN(date.getTime()) ? value : formatDateLong(date);
}

// ==============================
// Build Trial Card
// ==============================
function makeTrialCard(trial, showDates = false) {
  const wrapper = document.createElement("div");
  wrapper.className = "featured-trial-card";

  const link = document.createElement("a");
  link.href = `/recreation/trials.html?trial=${encodeURIComponent(trial.Trial)}`;
  link.className = "featured-trial-link";
  link.style.textDecoration = "none";

  const img = document.createElement("img");
  img.src = trial.URL || "../assets/placeholder.png";
  img.alt = trial.Trial;
  img.className = "featured-trial-img";

  const name = document.createElement("div");
  name.textContent = trial.Trial;
  name.className = "featured-trial-name";

  link.appendChild(img);
  link.appendChild(name);

  // Show dates on frontpage
  if (showDates) {
    const dates = document.createElement("div");
    dates.className = "featured-trial-dates";

    if (trial.Start) {
      const startSpan = document.createElement("span");
      startSpan.className = "featured-trial-start";
      startSpan.textContent = `${formatDateOrText(trial.Start)} - `;
      dates.appendChild(startSpan);
    }

    if (trial.End) {
      const endSpan = document.createElement("span");
      endSpan.className = "featured-trial-end";
      endSpan.textContent = `${formatDateOrText(trial.End)}`;
      dates.appendChild(endSpan);
    }

    link.appendChild(dates);
  }

  wrapper.appendChild(link);
  return wrapper;
}

// ==============================
// Featured Trials - Frontpage (1 random trial) with debug logs
// ==============================
async function renderFrontpageFeaturedTrials(targetId = "featured-trial-frontpage") {
  try {
    const { eligible, all } = await getEligibleTrials();
    const container = document.getElementById(targetId);
    if (!container) return;
    container.innerHTML = "";

    // Use eligible pool, else fallback to any unhidden trial with a name
    let pool = (eligible && eligible.length > 0) ? eligible : all.filter(t => t.Trial && t.Trial.trim());

    if (!pool || pool.length === 0) {
      const placeholder = document.createElement("div");
      placeholder.className = "featured-trial-placeholder";
      placeholder.textContent = "No Trials available.";
      container.appendChild(placeholder);
      return;
    }

    const chosen = pool[Math.floor(Math.random() * pool.length)];

    container.appendChild(makeTrialCard(chosen, true));

  } catch (err) {
    console.error("Error rendering frontpage featured trials:", err);
    const container = document.getElementById(targetId);
    if (container) {
      container.innerHTML = "";
      const errorDiv = document.createElement("div");
      errorDiv.className = "featured-trial-placeholder";
      errorDiv.textContent = "⚠️ Failed to load Featured Trials";
      container.appendChild(errorDiv);
    }
  }
}

/* ==============================
   Recent Naras - Frontpaage
   ============================== */
async function renderRecentNaras(targetId = "recent-naras", limit = 8) {
  try {
    const container = document.getElementById(targetId);
    if (!container) return console.error(`Container #${targetId} not found`);

    // Fetch full masterlist
    const data = await fetchSheetData("Masterlist");

    // Filter out hidden Naras and MYOs
    const visibleNaras = data.filter(row => {
      const isHidden = String(row.Hide || "").toLowerCase() === "true" || row.Hide === true;
      const isMYO = String(row.Type || "").toLowerCase() === "myo";
      return !isHidden && !isMYO && row.Nara && row.URL;
    });

    // Sort by most recently added (assuming last rows are newest)
    const recentNaras = visibleNaras.slice(-limit).reverse(); // last 'limit' rows

    // Clear container
    container.innerHTML = "";

    // Create cards
    recentNaras.forEach(row => {
      const card = document.createElement("div");
      card.className = "narapedia-card recent-card";
      card.innerHTML = `
        <img src="${row.URL || '../assets/placeholder.png'}" alt="${row.Nara}">
        <div class="narapedia-card-name">${row.Nara}</div>
      `;

      // Link to detail page
      card.addEventListener("click", () => {
        const url = `narapedia/masterlist.html?design=${encodeURIComponent(row.Nara)}`;
        window.location.href = url;
      });

      container.appendChild(card);
    });

  } catch (err) {
    console.error("Error rendering recent Naras:", err);
  }
}

// ===============================
// Render user profile into existing HTML
// ===============================
function renderUserProfile(data) {
  console.log("=== User Profile Data ===", data);

  // Username
  const usernameEl = document.getElementById("username");
  if (usernameEl && data.username) {
    usernameEl.textContent = data.username;
  }

  // Balance
  const balanceEl = document.getElementById("balance");
  if (balanceEl && data.inventory?.balance !== undefined) {
    balanceEl.textContent = data.inventory.balance;
  }

  // Inventory
  const inventoryList = document.getElementById("inventory-list");
  if (inventoryList && data.inventory) {
    inventoryList.innerHTML = "";
    Object.entries(data.inventory).forEach(([key, value]) => {
      if (key !== "balance") {
        const li = document.createElement("li");
        li.textContent = `${key}: ${value}`;
        inventoryList.appendChild(li);
      }
    });
  }

  // Palcharms
  const palcharmsList = document.getElementById("palcharms-list");
  if (palcharmsList && data.palcharms) {
    palcharmsList.innerHTML = "";
    Object.entries(data.palcharms).forEach(([key, value]) => {
      const li = document.createElement("li");
      li.textContent = `${key}: ${value}`;
      palcharmsList.appendChild(li);
    });
  }

  // Characters
  const charactersContainer = document.getElementById("characters");
  if (charactersContainer && data.characters) {
    charactersContainer.innerHTML = "";
    data.characters.forEach(c => {
      const div = document.createElement("div");
      div.classList.add("char-card");

      const img = document.createElement("img");
      img.src = c.image;
      img.alt = c.design;

      const p = document.createElement("p");
      p.textContent = c.design;

      div.appendChild(img);
      div.appendChild(p);
      charactersContainer.appendChild(div);
    });
  }
}

/* ==============================
   Transitions & Back To Top
   ============================== */
function setupPageTransitions() {
  const wrapper = document.querySelector(".wrapper");
  if (!wrapper) return;

  wrapper.classList.add("fade-in");

  document.body.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (
      link &&
      link.hostname === window.location.hostname &&
      !link.hasAttribute("target") &&
      !link.href.includes("#") &&
      !link.href.startsWith("javascript:")
    ) {
      e.preventDefault();

      wrapper.classList.remove("fade-in");
      wrapper.classList.add("fade-out");

      setTimeout(() => {
        window.location.href = link.href;
      }, 400);
    }
  });

  window.addEventListener("beforeunload", () => {
    wrapper.classList.remove("fade-in");
    wrapper.classList.add("fade-out");
  });
}

function setupBackToTop() {
  const button = document.getElementById("top");
  if (!button) return;

  function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
      button.style.display = "block";
    } else {
      button.style.display = "none";
    }
  }

  window.addEventListener("scroll", scrollFunction);

  button.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ==============================
   Centralized Load
   ============================== */
document.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadHeaderFooter();

    // Auth routing
    const path = window.location.pathname;
    const userData = JSON.parse(localStorage.getItem("discordUser") || "{}");

    if (userData.username && path.endsWith("/login.html")) {
      window.location.href = "/user.html";
      return;
    }
    if (!userData.username && path.endsWith("/user.html")) {
      window.location.href = "/login.html";
      return;
    }

    const loginBtn = document.getElementById("loginBtn");
    if (loginBtn) loginBtn.addEventListener("click", () => {
      window.location.href = getDiscordOAuthURL();
    });

    await handleOAuthCallback();
    updateNavbarUI();
    setupLogoutButton();

    initDropdowns();
    initNavbarToggler();
    initSidebar();
    updateHeaderHeightCSSVar();

    // ✅ Featured Nara (monthly) — run only if sidebar exists
    const sidebar = document.getElementById("featured-nara-sidebar");
    if (sidebar) {
      // Show loading state first
      sidebar.innerHTML = `<div class="featured-nara-placeholder">⏳ Loading featured Nara...</div>`;
      loadFeaturedNaraSidebar();
    }

    renderRecentNaras("recent-naras", 8);
    renderFrontpageFeaturedTrials("featured-trial-frontpage");
    renderSidebarFeaturedTrial("featured-trial-sidebar");  

    setupPageTransitions();
    setupBackToTop();

    const mainContent = document.querySelector(".smoothLoad, .wrapper");
    if (mainContent) mainContent.classList.add("fade-in");

    // Universal Sheet Loader
    const pageName = path.split("/").pop().replace(".html", "");

    const SHEET_CONFIGS = {
      masterlist: { sheet: "Masterlist", config: MASTERLIST_CONFIG },
      features: { sheet: "Features", config: FEATURES_CONFIG },
      artifacts: { sheet: "Artifacts", config: ARTIFACTS_CONFIG },
      palcharms: { sheet: "Palcharms", config: PALCHARMS_CONFIG },
      trials: { sheet: "Trials", config: TRIALS_CONFIG },
      emblems: { sheet: "Emblems", config: EMBLEMS_CONFIG },
      civilians: { sheet: "Staff", config: STAFF_CONFIG },
      faq: { sheet: "FAQ", config: FAQ_CONFIG }
    };

    if (SHEET_CONFIGS[pageName]) {
      const { sheet, config } = SHEET_CONFIGS[pageName];
      const data = await fetchSheetData(sheet);
      renderSheets(data, config);
      
    }

    const discordId = sessionStorage.getItem("discordId");
    const username = sessionStorage.getItem("username");
    const profile = await fetchUserProfile(discordId, username);
    if (profile) renderUserProfile(profile);

  } catch (err) {
    console.error("Error during page initialization:", err);
  }
});

window.addEventListener("load", () => {
  const smooth = document.querySelector(".smoothLoad");
  if (smooth) smooth.classList.add("loaded");
});

