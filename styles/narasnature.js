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

// Example usage
loadGoogleSheetsAPI(() => {
  fetchSheetData(sheetConfigs.narapedia.id, sheetConfigs.narapedia.sheetName, data => {
    console.log("Narapedia Data:", data);
    // renderNarapedia(data); // You can render it however you like
  });

  fetchSheetData(sheetConfigs.naratrove.id, sheetConfigs.naratrove.sheetName, data => {
    console.log("Naratrove Data:", data);
    // renderNaratrove(data); // You can render it however you like
  });
});

// ==============================
// ====== Header & Footer ======
// ==============================
function loadHeaderFooter() {
  document.querySelectorAll(".load-html").forEach(el => {
    const source = el.getAttribute("data-source");
    if (source) {
      fetch(source)
        .then(res => res.text())
        .then(html => {
          el.innerHTML = html;
        })
        .catch(err => {
          console.error("Failed to load:", source, err);
        });
    }
  });
}

// ==============================
// ========= Masterlist =========
// ==============================
function Masterlist(data) {
  const container = document.getElementById("output");
  if (!container) return;

  const visibleNaras = data.filter(nara =>
    (nara.Hide !== true && nara.Hide !== "TRUE") &&
    nara["Image URL"] && nara["Nara"] // must have image + name
  );

  if (visibleNaras.length === 0) {
    container.innerHTML = "<p>No Naras available.</p>";
    return;
  }

  const grid = document.createElement("div");
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = "repeat(auto-fit, minmax(250px, 1fr))";
  grid.style.gap = "1rem";

  visibleNaras.forEach(nara => {
    const card = document.createElement("div");
    card.className = "nara-card";
    card.style.border = "1px solid #ccc";
    card.style.padding = "1rem";
    card.style.borderRadius = "12px";
    card.style.background = "#fff";
    card.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";

    card.innerHTML = `
      <img src="${nara["Image URL"]}" alt="${nara.Nara}" style="width:100%; border-radius: 8px;">
      <h3 style="margin-top: 0.5rem;">${nara.Nara}</h3>
      <p><strong>Owner:</strong> ${nara.Owner || "—"}</p>
      <p><strong>Region:</strong> ${nara.Region || "—"}</p>
      <p><strong>Designer:</strong> ${nara.Designer || "—"}</p>
      <p><strong>Status:</strong> ${nara.Status || "—"}</p>
      <p><strong>Rarity:</strong> ${nara.Rarity || "—"}</p>
    `;
    grid.appendChild(card);
  });

  container.appendChild(grid);
}

// Load data and call Masterlist
loadGoogleSheetsAPI(() => {
  fetchSheetData(sheetConfigs.narapedia.id, sheetConfigs.narapedia.sheetName, data => {
    Masterlist(data);
  });
});

// ==============================
// ========= Load page =========
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  loadHeaderFooter();
});
