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

  setupPageTransitions();

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

  updateNavbarUI();
}

// ==============================
// ===== Smooth Page Loads ======
// ==============================

function setupPageTransitions() {
  const wrapper = document.querySelector(".wrapper");
  if (!wrapper) return;

  // Fade in wrapper on page load
  wrapper.classList.add("fade-in");

  // Intercept all internal link clicks for smooth fade out then navigation
  document.body.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (
      link &&
      link.hostname === window.location.hostname && // only internal links
      !link.hasAttribute("target") && // skip if opens in new tab
      !link.href.includes("#") && // skip anchors
      !link.href.startsWith("javascript:") // skip JS links
    ) {
      e.preventDefault();

      // Fade out wrapper
      wrapper.classList.remove("fade-in");
      wrapper.classList.add("fade-out");

      // After fade out duration, navigate to new page
      setTimeout(() => {
        window.location.href = link.href;
      }, 500); // matches CSS 0.5s transition
    }
  });
}

