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
// ====== Init Site Scripts =====
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  loadHeaderFooter();

  const mainContent = document.getElementById("smooth-load");
  if (mainContent) mainContent.classList.add("fade-in");

  // Load Google Sheets data and Masterlist
  loadGoogleSheetsAPI(() => {
    fetchSheetData(sheetConfigs.narapedia.id, sheetConfigs.narapedia.sheetName, data => {
      Masterlist(data);
    });
  });

  // Back to top button setup
  const mybutton = document.getElementById("top");

  window.onscroll = function () {
    scrollFunction();
  };

  window.topFunction = function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
});

// ==============================
// ===== Global Hook ===========
// ==============================
async function afterContentLoad() {
  const masterlistView = document.getElementById("masterlist-view");
  if (masterlistView) {
    loadGoogleSheetsAPI(() => {
      fetchSheetData(sheetConfigs.narapedia.id, sheetConfigs.narapedia.sheetName, data => {
        Masterlist(data);
      });
    });
  }

  // Re-run auth UI update on every partial load (if any)
  updateNavbarUI();
}

// ===== Removed the popstate event listener to disable partial loads and AJAX smooth loads =====
