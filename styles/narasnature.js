/* 
        _..---.--.
       .'\ __|/O.__)
      /__.' _/ .-'_\
     (____.'.-_\____)
      (_/ _)__(_ \_)_
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

  return new Promise((resolve, reject) => {
    if (includes.length === 0) {
      // No includes to load, resolve immediately
      resolve();
      return;
    }

    includes.forEach(el => {
      const source = el.getAttribute("data-source");
      if (!source) {
        loadCount++;
        if (loadCount === includes.length) {
          resolve();
        }
        return;
      }
      fetch(source)
        .then(res => res.text())
        .then(html => {
          el.innerHTML = html;
          loadCount++;
          if (loadCount === includes.length) {
            // Delay init to next event loop tick
            setTimeout(() => {
              initDropdowns();
              initNavbarToggler();
              initSidebar();
              updateHeaderHeightCSSVar();

              handleOAuthCallback().then(() => {
                updateNavbarUI();

                const loginBtn = document.getElementById("loginBtn");
                if (loginBtn) {
                  loginBtn.addEventListener("click", () => {
                    window.location.href = getDiscordOAuthURL();
                  });
                }

                const logoutBtn = document.getElementById("logoutBtn");
                if (logoutBtn) {
                  logoutBtn.addEventListener("click", e => {
                    e.preventDefault();
                    localStorage.removeItem("discordUser");
                    localStorage.removeItem("access_token");
                    updateNavbarUI();
                    window.location.href = "/index.html";
                  });
                }

                loadGoogleSheetsAPI(() => {
                  loadRandomFeaturedNara(
                    "1lGc4CVqcFr9LtcyVW-78N5En7_imdfC8bTf6PRUD-Ms",
                    "Masterlist"
                  );
                });

                resolve();
              });
            }, 0);
          }
        })
        .catch(err => {
          console.error("Failed to load:", source, err);
          reject(err);
        });
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadHeaderFooter();

    const path = window.location.pathname;
    const userData = JSON.parse(localStorage.getItem("discordUser") || "{}");

    if (userData.username && path.endsWith("/login.html")) {
      window.location.href = "/user.html";
      return;
    }
    if ((!userData.username) && path.endsWith("/user.html")) {
      window.location.href = "/login.html";
      return;
    }

    const mainContent = document.getElementById("output");
    if (mainContent) {
      mainContent.classList.add("fade-in");
    }
  } catch (err) {
    console.error("Error loading header/footer or initializing:", err);
  }
});

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
    if (e.target && (e.target.id === "backML" || e.target.closest("#backML"))) {
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
// Discord OAuth Config
// ==============================
const CLIENT_ID = "1319474218550689863";
const REDIRECT_URI = "https://chuwigirls.github.io/user.html";
const GAS_ENDPOINT = "https://script.google.com/macros/s/AKfycbzO5xAQ9iUtJWgkeYYfhlIZmHQSj4kHjs5tnfQLvuU6L5HGyguUMU-9tTWTi8KGJ69U3A/exec"; 

function getDiscordOAuthURL() {
  const scope = "identify";
  return `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=${scope}`;
}

// ==============================
// Navbar UI Updates
// ==============================
function updateNavbarUI() {
  const userData = JSON.parse(localStorage.getItem("discordUser"));
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

// ==============================
// Handle Discord OAuth Callback
// ==============================
async function handleOAuthCallback() {
  if (window.location.hash) {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = params.get("access_token");

    if (accessToken) {
      localStorage.setItem("access_token", accessToken);

      try {
        // Fetch Discord profile
        const discordUser = await fetch("https://discord.com/api/users/@me", {
          headers: { Authorization: `Bearer ${accessToken}` }
        }).then(res => res.json());

        // Store locally
        localStorage.setItem("discordUser", JSON.stringify(discordUser));

        // Call GAS endpoint to sync data
        if (discordUser.id) {
          const gasUrl = `${GAS_ENDPOINT}?id=${discordUser.id}&username=${encodeURIComponent(discordUser.username)}`;
          const gasData = await fetch(gasUrl).then(res => res.json());

          // Save GAS data to localStorage
          localStorage.setItem("userData", JSON.stringify(gasData));
        }

        // Update UI instantly
        updateNavbarUI();
        history.replaceState(null, "", window.location.pathname);
      } catch (err) {
        console.error("OAuth handling error:", err);
      }
    }
  }
}

// ==============================
// Logout Handler
// ==============================
function setupLogoutButton() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", e => {
      e.preventDefault();
      localStorage.removeItem("discordUser");
      localStorage.removeItem("access_token");
      localStorage.removeItem("userData");
      updateNavbarUI(); // instantly show login button again
    });
  }
}

// ==============================
// Page Load Init
// ==============================
document.addEventListener("DOMContentLoaded", async () => {
  await handleOAuthCallback();
  updateNavbarUI();

  // Attach login redirect
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      window.location.href = getDiscordOAuthURL();
    });
  }

  setupLogoutButton();

  // Redirect guard
  const path = window.location.pathname;
  const userData = JSON.parse(localStorage.getItem("discordUser") || "{}");

  if (userData.username && path.endsWith("/login.html")) {
    window.location.href = "/user.html";
  } else if (!userData.username && path.endsWith("/user.html")) {
    window.location.href = "/login.html";
  }
});

// ==============================
// ========== Page Load =========
// ==============================
document.addEventListener("DOMContentLoaded", async () => {
  loadHeaderFooter();

  await handleOAuthCallback(); // wait for async OAuth fetch to finish

  updateNavbarUI();      // update UI now that user data is ready

  // Redirect logic after user data is guaranteed loaded
  const path = window.location.pathname;
  const userData = JSON.parse(localStorage.getItem("discordUser"));

  if (userData && userData.username && path.endsWith("/login.html")) {
    window.location.href = "/user.html";
    return;
  }

  if ((!userData || !userData.username) && path.endsWith("/user.html")) {
    window.location.href = "/login.html";
    return;
  }

  const mainContent = document.getElementById("output");
  if (mainContent) {
    mainContent.classList.add("fade-in");
  }
});
