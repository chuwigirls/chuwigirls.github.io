// ==============================
// ====== Smooth Load Utils =====
// ==============================
async function smoothLoad(container, loadContent, duration = 300) {
  container.classList.remove("fade-in", "fade-out");
  container.classList.add("fade-out");
  await new Promise(resolve => setTimeout(resolve, duration));
  await loadContent();
  container.classList.remove("fade-out");
  container.classList.add("fade-in");
}

// ==============================
// ===== Load page content ======
// ==============================
async function loadPage(url, container) {
  try {
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) throw new Error(`Failed to load page: ${res.status}`);

    const text = await res.text();
    // Parse the fetched HTML and extract the #output content
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");
    const newContent = doc.getElementById("output");
    if (!newContent) throw new Error("No #output found in fetched page");

    await smoothLoad(container, async () => {
      container.innerHTML = newContent.innerHTML;

      // Optional: re-run scripts or re-initialize JS here for new content if needed
      // e.g. re-attach event handlers for new content elements like Masterlist

      if (typeof afterContentLoad === "function") {
        await afterContentLoad(); // call global hook after content loaded
      }
    });

    // Update the URL without reload
    history.pushState({ url }, "", url);
  } catch (err) {
    console.error(err);
    // fallback: do a hard navigation
    window.location.href = url;
  }
}

// ==============================
// ===== Intercept clicks =======
// ==============================
function interceptInternalLinks() {
  document.body.addEventListener("click", e => {
    const anchor = e.target.closest("a");
    if (!anchor) return;

    const href = anchor.getAttribute("href");
    // Ignore empty, external, or hash links
    if (!href || href.startsWith("http") && !href.startsWith(window.location.origin)) return;
    if (href.startsWith("#")) return;

    // Prevent default nav
    e.preventDefault();

    const container = document.getElementById("output");
    if (!container) {
      window.location.href = href; // fallback
      return;
    }

    // If clicking same page, do nothing
    if (href === window.location.pathname || href === window.location.href) return;

    // Load the new page content smoothly
    loadPage(href, container);
  });
}

// ==============================
// ===== Handle back/forward ====
// ==============================
window.addEventListener("popstate", event => {
  const url = event.state && event.state.url ? event.state.url : window.location.href;
  const container = document.getElementById("output");
  if (!container) {
    window.location.href = url; // fallback
    return;
  }
  loadPage(url, container);
});

// ==============================
// ====== Init Site Scripts =====
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  loadHeaderFooter();

  const mainContent = document.getElementById("output");
  if (mainContent) mainContent.classList.add("fade-in");

  // Initialize intercept on links
  interceptInternalLinks();

  // Load Google Sheets data and Masterlist
  loadGoogleSheetsAPI(() => {
    fetchSheetData(sheetConfigs.narapedia.id, sheetConfigs.narapedia.sheetName, data => {
      Masterlist(data);
    });
  });
});

// ==============================
// ===== Global Hook ===========
// ==============================
// Called after new content is loaded via smoothLoad
async function afterContentLoad() {
  // If Masterlist is on this page, re-initialize it with data
  // You may want to check if #masterlist-view exists before reloading

  const masterlistView = document.getElementById("masterlist-view");
  if (masterlistView) {
    // Re-fetch data and re-render masterlist
    loadGoogleSheetsAPI(() => {
      fetchSheetData(sheetConfigs.narapedia.id, sheetConfigs.narapedia.sheetName, data => {
        Masterlist(data);
      });
    });
  }

  // Similarly, re-run any page-specific JS needed on new content load here
}
