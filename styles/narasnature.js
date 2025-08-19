/* 
        _..---.--.
       .'\ __|/O.__)
      /__.' _/ .-'_\
     (____.'.-_\____)
      (_/ _)__(_ \_)\_
    mrf(_..)--(.._)'--'

    if you're looking at this page to learn about coding,
    you can ask chuwigirls for help! */

/* ==============================
   ===== Discord OAuth Config ===
   ============================== */
const CLIENT_ID = "1319474218550689863";
const REDIRECT_URI = `${window.location.origin}/user.html`;
const GAS_ENDPOINT = "https://script.google.com/macros/s/AKfycbzO5xAQ9iUtJWgkeYYfhlIZmHQSj4kHjs5tnfQLvuU6L5HGyguUMU-9tTWTi8KGJ69U3A/exec";

function getDiscordOAuthURL() {
  const scope = "identify";
  return `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=${scope}`;
}

/* ==============================
   ===== Navbar =================
   ============================== */
function updateNavbarUI(userDataParam) {
  const userData = userDataParam || JSON.parse(localStorage.getItem("discordUser") || "{}");
  const loginNav = document.getElementById("loginNav");
  const userDropdown = document.getElementById("userDropdown");

  if (userData && userData.username) {
    if (loginNav) loginNav.style.display = "none";
    if (userDropdown) {
      userDropdown.style.display = "flex";
      const usernameSpan = userDropdown.querySelector(".username");
      if (usernameSpan) usernameSpan.textContent = userData.username;
    }
  } else {
    if (loginNav) loginNav.style.display = "flex";
    if (userDropdown) userDropdown.style.display = "none";
  }
}

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
        .catch(() => {}); // ignore GAS errors
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

/* ==============================
   ===== Sidebar, Header ========
   ============================== */
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

function handleSidebarScrollPosition() {
  const headerHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 0;
  if (window.scrollY > headerHeight) {
    document.body.classList.add("sidebar-fixed");
  } else {
    document.body.classList.remove("sidebar-fixed");
  }
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

/* ==========================
   Load Header & Footer
   ========================== */
function loadHeaderFooter() {
  const includes = document.querySelectorAll(".includes");
  let loadCount = 0;

  return new Promise((resolve) => {
    if (!includes.length) return resolve();
    includes.forEach(el => {
      const source = el.getAttribute("data-source");
      if (source) {
        fetch(source)
          .then(res => res.text())
          .then(data => {
            el.innerHTML = data;
            loadCount++;
            if (loadCount === includes.length) resolve();
          })
          .catch(err => {
            console.error("Error loading include:", err);
            loadCount++;
            if (loadCount === includes.length) resolve();
          });
      } else {
        loadCount++;
        if (loadCount === includes.length) resolve();
      }
    });
  });
}

/* ==========================
   Fetch Sheets (New System)
   ========================== */
async function fetchSheetData(sheetName) {
  if (!SHEET_BASE_URL) {
    throw new Error("SHEET_BASE_URL is not defined. Set it at the top of this file or on window.SHEET_BASE_URL.");
  }
  const url = `${SHEET_BASE_URL}/${encodeURIComponent(sheetName)}`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Error fetching sheet: ${sheetName}`);
  return await response.json();
}

/* ==========================
   Universal Renderer
   ========================== */
function renderSheets(data, config) {
  const listEl = document.getElementById(config.listId);
  const detailEl = document.getElementById(config.detailId);
  const pageEl = document.querySelector(".page");
  const cardTemplate = document.querySelector(config.cardTemplate);
  const detailTemplate = document.querySelector(config.detailTemplate);

  if (!listEl || !detailEl || !cardTemplate || !detailTemplate) {
    console.error("Missing required DOM elements for rendering:", config);
    return;
  }

  const pageDefaultDisplay = pageEl ? getComputedStyle(pageEl).display : "block";

  listEl.innerHTML = "";
  detailEl.innerHTML = "";

  // Render Cards
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

  // URL param → open detail
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

/* ==============================
   Universal Init Function
   ============================== */
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
   Universal Spinner Helpers
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
  container.style.display = "grid"; // Use CSS to override per-container if needed
}

/* ==============================
   Featured Nara (Monthly Seeded)
   ============================== */
/**
 * Deterministically pick one visible Nara per month from Masterlist.
 * Uses UTC year-month to avoid TZ edge cases.
 */
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
    const hasImg = typeof row["Image URL"] === "string" && row["Image URL"].trim() !== "";
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
    const data = await fetchSheetData("Masterlist");
    const nara = getMonthlySeededNara(data);
    if (!nara) return;

    const img = nara["Image URL"] || "";
    const name = nara["Nara"] || "Unnamed Nara";
    const design = nara["Design"] || name; // fallback if Design missing

    sidebar.innerHTML = `
      <a href="/narapedia/masterlist.html?design=${encodeURIComponent(design)}" class="featured-nara-link" style="text-decoration:none;">
        <img src="${img}" alt="${name}" class="featured-nara-img" />
        <div class="featured-nara-name">${name}</div>
      </a>
    `;
  } catch (err) {
    console.error("Error loading featured Nara:", err);
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

    // ================================
    // ✅ Auth routing
    // ================================
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

    // Navbar login button
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

    // Featured Nara (monthly, from Masterlist via new system)
    loadFeaturedNaraSidebar();

    setupPageTransitions();
    setupBackToTop();

    // Fade-in animation
    const mainContent = document.querySelector(".smoothLoad, .wrapper");
    if (mainContent) mainContent.classList.add("fade-in");

    // ================================
    // ✅ Universal Sheet Loader
    // ================================
    const pageName = path.split("/").pop().replace(".html", "");

    // map page names → configs
    const SHEET_CONFIGS = {
      masterlist: { sheet: "Masterlist", config: MASTERLIST_CONFIG },
      features: { sheet: "Features", config: FEATURES_CONFIG },
      artifacts: { sheet: "Artifacts", config: ARTIFACTS_CONFIG },
      palcharms: { sheet: "Palcharms", config: PALCHARMS_CONFIG },
      trials: { sheet: "Trials", config: TRIALS_CONFIG },
      emblems: { sheet: "Emblems", config: EMBLEMS_CONFIG },
      civilians: { sheet: "Staff", config: STAFF_CONFIG },
      civilians: { sheet: "FAQ", config: FAQ_CONFIG }
    };

    if (SHEET_CONFIGS[pageName]) {
      const { sheet, config } = SHEET_CONFIGS[pageName];
      const data = await fetchSheetData(sheet);
      renderSheets(data, config);
    }

  } catch (err) {
    console.error("Error during page initialization:", err);
  }
});

window.addEventListener("load", () => {
  const smooth = document.querySelector(".smoothLoad");
  if (smooth) smooth.classList.add("loaded");
});
