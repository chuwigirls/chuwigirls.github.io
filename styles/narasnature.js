/* 
        _..---.--.
       .'\ __|/O.__)
      /__.' _/ .-'_\
     (____.'.-_\____)
      (_/ _)__(_ \_)\_
    mrf(_..)--(.._)'--'

    if you're looking at this page to learn about coding,
    ask chuwigirls for help! */

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
        headers.forEach((header, i) => {
          obj[header] = row[i];
        });
        return obj;
      });
      onSuccess(data);
    })
    .catch(err => console.error("Sheet fetch error:", err));
}

// ==============================
// === Header, Footer, Sidebar ==
// ==============================
function loadHeaderFooter() {
  const includes = document.querySelectorAll(".includes");
  let loadCount = 0;

  includes.forEach(el => {
    const source = el.getAttribute("data-source");
    if (source) {
      fetch(source)
        .then(res => res.text())
        .then(html => {
          el.innerHTML = html;
          loadCount++;
          if (loadCount === includes.length) {
            setTimeout(() => {
              initDropdowns();
              initNavbarToggler();
              initSidebar();
              setHeaderHeight();

              // ✅ Load Featured Nara after includes are inserted
              loadGoogleSheetsAPI(() => {
                loadRandomFeaturedNara(
                  "1lGc4CVqcFr9LtcyVW-78N5En7_imdfC8bTf6PRUD-Ms", // your spreadsheet ID
                  "Masterlist"
                );
              });

            }, 0);
          }
        })
        .catch(err => {
          console.error("Failed to load:", source, err);
        });
    }
  });
}

function setHeaderHeight() {
  const header = document.getElementById("siteHeader");
  if (header) {
    const height = header.offsetHeight;
    document.documentElement.style.setProperty('--header-height', `${height}px`);
  }
}

function w3_open() {
  document.body.classList.add("sidebar-open");
}

function w3_close() {
  document.body.classList.remove("sidebar-open");
}

function handleSidebarDisplay() {
  const width = window.innerWidth;
  if (width >= 1550) {
    if (!document.body.classList.contains("sidebar-closed")) {
      document.body.classList.add("sidebar-open");
    }
  } else {
    document.body.classList.remove("sidebar-open");
  }
}

function initSidebar() {
  const openBtn = document.getElementById("openNav");
  if (openBtn) openBtn.addEventListener("click", w3_open);

  const closeBtn = document.querySelector("#mySidebar .sidebar-close");
  if (closeBtn) closeBtn.addEventListener("click", w3_close);

  handleSidebarDisplay();
  window.addEventListener("resize", () => {
    handleSidebarDisplay();
    setHeaderHeight();
  });
}

function initDropdowns() {
  document.querySelectorAll(".dropdown").forEach(dropdown => {
    const button = dropdown.querySelector(".dropbtn");
    const menu = dropdown.querySelector(".dropdown-content");

    if (!button || !menu) return;

    dropdown.addEventListener("mouseenter", () => {
      menu.classList.add("show");
    });

    dropdown.addEventListener("mouseleave", () => {
      menu.classList.remove("show");
    });
  });
}

function initNavbarToggler() {
  let toggler = document.getElementById("navbarToggle");
  let navLinks = document.getElementById("navbarMenu");

  if (toggler && navLinks) {
    toggler.addEventListener("click", () => {
      navLinks.classList.toggle("show");
    });
  } else {
    // Retry after slight delay if not loaded yet
    setTimeout(initNavbarToggler, 100);
  }
}

document.addEventListener("DOMContentLoaded", loadHeaderFooter);

// ==============================
// ========= Masterlist =========
// ==============================
function Masterlist(data) {
  const masterlistView = document.getElementById("masterlist-view");
  const detailView = document.getElementById("nara-detail-view");

  if (!masterlistView || !detailView) return;

  const visibleNaras = data.filter(nara =>
    (nara.Hide !== true && nara.Hide !== "TRUE") &&
    nara["URL"] && nara["Nara"]
  );

  // Check for ?design= parameter
  const urlParams = new URLSearchParams(window.location.search);
  const selectedDesign = urlParams.get("design");

  masterlistView.innerHTML = "";
  masterlistView.classList.add("masterlist-grid");
  masterlistView.style.display = "grid";

  visibleNaras.forEach(nara => {
    const template = document.querySelector("#masterlist-card-template");
    if (!template) return;
    const card = template.content.cloneNode(true);
    const cardEl = card.querySelector(".masterlist-card");
    cardEl.querySelector(".masterlist-card-img").src = nara["URL"];
    cardEl.querySelector(".masterlist-card-img").alt = nara.Nara;
    cardEl.querySelector(".masterlist-card-name").textContent = nara.Nara;

    cardEl.addEventListener("click", () => {
      masterlistView.style.display = "none";

      const detailCard = document.querySelector("#nara-detail-template");
      if (!detailCard) return;
      const detailContent = detailCard.content.cloneNode(true);

      detailContent.querySelector(".nara-detail-img").src = nara["URL"];
      detailContent.querySelector(".nara-detail-img").alt = nara.Nara;
      detailContent.querySelector(".nara-detail-name").textContent = nara.Nara;
      detailContent.querySelector(".nara-detail-owner").textContent = nara.Owner || "—";
      detailContent.querySelector(".nara-detail-region").textContent = nara.Region || "—";
      detailContent.querySelector(".nara-detail-designer").textContent = nara.Designer || "—";
      detailContent.querySelector(".nara-detail-status").textContent = nara.Status || "—";
      detailContent.querySelector(".nara-detail-rarity").textContent = nara.Rarity || "—";

      detailView.innerHTML = "";
      detailView.appendChild(detailContent);
      detailView.style.display = "block";
    });

    masterlistView.appendChild(card);
  });

  // If a Nara was requested via URL, trigger its detail view
  if (selectedDesign) {
    const matchingNara = visibleNaras.find(n => n.Nara === selectedDesign);
    if (matchingNara) {
      masterlistView.style.display = "none";

      const detailCard = document.querySelector("#nara-detail-template");
      if (!detailCard) return;
      const detailContent = detailCard.content.cloneNode(true);

      detailContent.querySelector(".nara-detail-img").src = matchingNara["URL"];
      detailContent.querySelector(".nara-detail-img").alt = matchingNara.Nara;
      detailContent.querySelector(".nara-detail-name").textContent = matchingNara.Nara;
      detailContent.querySelector(".nara-detail-owner").textContent = matchingNara.Owner || "—";
      detailContent.querySelector(".nara-detail-region").textContent = matchingNara.Region || "—";
      detailContent.querySelector(".nara-detail-designer").textContent = matchingNara.Designer || "—";
      detailContent.querySelector(".nara-detail-status").textContent = matchingNara.Status || "—";
      detailContent.querySelector(".nara-detail-rarity").textContent = matchingNara.Rarity || "—";

      detailView.innerHTML = "";
      detailView.appendChild(detailContent);
      detailView.style.display = "block";
    }
  }

  detailView.addEventListener("click", (e) => {
    if (e.target && (e.target.id === "back-btn" || e.target.closest("#back-btn"))) {
      detailView.style.display = "none";
      masterlistView.style.display = "grid";
    }
  });
}


// ==============================
// =========== Featured =========
// ==============================
function loadRandomFeaturedNara(spreadsheetId, sheetName) {
  console.log("[Sidebar Nara] Starting load...");

  fetchSheetData(spreadsheetId, sheetName, data => {
    console.log("[Sidebar Nara] Sheet data:", data);
    console.log("[Sidebar Nara] First row keys:", Object.keys(data[0]));

    // Filter for visible Naras
    const visible = data.filter(nara =>
      (nara.Hide !== true && nara.Hide !== "TRUE") &&
      typeof nara.URL === "string" &&
      nara.URL.trim() !== ""
    );

    console.log("[Sidebar Nara] Visible Naras:", visible.length);

    if (visible.length === 0) {
      console.warn("[Sidebar Nara] No visible Naras to display");
      return;
    }

    // Pick a random one
    const randomNara = visible[Math.floor(Math.random() * visible.length)];

    // Inject into sidebar
    const container = document.createElement("div");
    container.className = "random-nara-preview";

    const link = document.createElement("a");
    link.href = `/narapedia/masterlist.html?design=${encodeURIComponent(randomNara.Nara || "")}`;
    link.style.textDecoration = "none";

    const img = document.createElement("img");
    img.src = randomNara.URL;
    img.alt = randomNara.Nara || "Featured Nara";
    img.className = "random-nara-img";

    const name = document.createElement("div");
    name.textContent = randomNara.Nara || "Unnamed Nara";
    name.className = "random-nara-name";

    link.appendChild(img);
    link.appendChild(name);
    container.appendChild(link);

    const sidebar = document.getElementById("featured-nara-sidebar");
    if (sidebar) {
      sidebar.innerHTML = "";
      sidebar.appendChild(container);
    } else {
      console.warn("[Sidebar Nara] #featured-nara-sidebar not found");
    }
  });
}

// ==============================
// ========== Load Page ========
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  loadHeaderFooter();

  // Fade-in effect
  const mainContent = document.getElementById("output");
  if (mainContent) {
    mainContent.classList.add("fade-in");
  }
});


// ==============================
// ========== Auth (Login) =====
// ==============================
const CLIENT_ID = '1319474218550689863';
const REDIRECT_URI = 'https://chuwigirls.github.io/user.html';
const SCOPES = 'identify';

function getStoredUser() {
  return JSON.parse(localStorage.getItem('discordUser'));
}

function setStoredUser(user) {
  localStorage.setItem('discordUser', JSON.stringify(user));
}

function clearStoredUser() {
  localStorage.removeItem('discordUser');
}

function isLoggedIn() {
  return !!getStoredUser();
}

function redirectToDiscordOAuth() {
  const oauthUrl = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=${SCOPES}`;
  window.location.href = oauthUrl;
}

function fetchDiscordUser(token) {
  return fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.json());
}

function handleOAuthRedirect() {
  if (window.location.hash.includes('access_token')) {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const token = params.get('access_token');
    if (token) {
      fetchDiscordUser(token).then(user => {
        setStoredUser({ ...user, token });
        updateNavbarUI();
      });
    }
  } else {
    updateNavbarUI();
  }
}

function updateNavbarUI() {
  const loginBtn = document.getElementById('login-btn');
  const userDropdown = document.getElementById('user-dropdown');

  const user = getStoredUser();
  if (user) {
    if (loginBtn) loginBtn.style.display = 'none';

    if (userDropdown) {
      const nameSlot = userDropdown.querySelector('.username');
      if (nameSlot) {
        nameSlot.innerHTML = `${user.username} <i class="fa fa-caret-down"></i>`;
      }
      userDropdown.style.display = 'block';
    }
  } else {
    if (loginBtn) loginBtn.style.display = 'block';
    if (userDropdown) userDropdown.style.display = 'none';
  }
}

function logout() {
  clearStoredUser();
  window.location.reload();
}

// Run auth checks after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  handleOAuthRedirect();

  // Login button on login.html
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) loginBtn.addEventListener('click', redirectToDiscordOAuth);

  // Logout button in dropdown menu
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);
});
