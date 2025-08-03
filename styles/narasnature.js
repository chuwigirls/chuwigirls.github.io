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
// ====== Header & Footer =======
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
            initDropdowns();
            initHamburger();
            initSidebar();  // <-- initialize sidebar buttons & behavior here
          }
        })
        .catch(err => {
          console.error("Failed to load:", source, err);
        });
    }
  });
}

function w3_open() {
  const sidebar = document.getElementById("mySidebar");
  const openBtn = document.getElementById("openNav");
  if (sidebar) sidebar.style.display = "block";
  if (openBtn) openBtn.style.display = "none";
  document.body.classList.add("sidebar-open");
}

function w3_close() {
  const sidebar = document.getElementById("mySidebar");
  const openBtn = document.getElementById("openNav");
  if (sidebar) sidebar.style.display = "none";
  if (openBtn) openBtn.style.display = "block";
  document.body.classList.remove("sidebar-open");
}

// On page load and resize, toggle sidebar visibility & hamburger button
function handleSidebarDisplay() {
  const width = window.innerWidth;
  const sidebar = document.getElementById("mySidebar");
  const openBtn = document.getElementById("openNav");
  
  if (width > 900) {
    if (sidebar) sidebar.style.display = "block";
    if (openBtn) openBtn.style.display = "none";
    document.body.classList.remove("sidebar-open");
  } else {
    if (sidebar) sidebar.style.display = "none";
    if (openBtn) openBtn.style.display = "block";
    document.body.classList.remove("sidebar-open");
  }
}

// Initialize sidebar button bindings and add resize listener
function initSidebar() {
  const openBtn = document.getElementById("openNav");
  if (openBtn) openBtn.addEventListener("click", w3_open);
  
  // Close buttons inside sidebar
  document.querySelectorAll("#mySidebar .w3-button").forEach(btn => {
    if (btn.textContent.trim().startsWith("Close")) {
      btn.addEventListener("click", w3_close);
    }
  });
  
  // Initial display
  handleSidebarDisplay();
  
  // Adjust on window resize
  window.addEventListener("resize", handleSidebarDisplay);
}

// Call initSidebar after your includes are loaded (e.g., in loadHeaderFooter)

function initDropdowns() {
  const dropdowns = document.querySelectorAll(".dropdown");

  dropdowns.forEach(dropdown => {
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

function initHamburger() {
  const hamburger = document.getElementById("hamburgerToggle");
  const navbarMenu = document.getElementById("navbarMenu");

  if (hamburger && navbarMenu) {
    hamburger.addEventListener("click", function () {
      navbarMenu.classList.toggle("show");
      document.body.classList.toggle("nav-open", navbarMenu.classList.contains("show"));
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  loadHeaderFooter();
});

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

  // Use event delegation for back button to prevent multiple handlers
  detailView.addEventListener("click", (e) => {
    if (e.target && (e.target.id === "back-btn" || e.target.closest("#back-btn"))) {
      detailView.style.display = "none";
      masterlistView.style.display = "grid";
    }
  });
}

// ==============================
// ========== Load Page ========
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  loadHeaderFooter();

  // Optional: fade in main content container on initial load (if you want)
  const mainContent = document.getElementById("output");
  if (mainContent) {
    mainContent.classList.add("fade-in");
  }

  loadGoogleSheetsAPI(() => {
    fetchSheetData(sheetConfigs.narapedia.id, sheetConfigs.narapedia.sheetName, data => {
      Masterlist(data);
    });
  });
});
