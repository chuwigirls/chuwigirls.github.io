/*       _..---.--.
       .'\ __|/O.__)
      /__.' _/ .-'_\
     (____.'.-_\____)
      (_/ _)__(_ \_ )_
    mrf(_..)--(.._)'--'

    if you're looking at this page to learn about coding,
    you can ask chuwigirls for help!

==============================
===== Summoning New Nara =====
============================== */
const IMGUR_CLIENT_ID = "YOUR_IMGUR_CLIENT_ID";  // for later
const SUMMONS_URL = SCRIPT_URL_SUMMONS;
const FEATURES_URL = FEATURES_BASE_URL;

// ==============================
// Load Features → Dropdowns
// ==============================
async function loadOptions(selectId, category) {
  try {
    const res = await fetch(`${FEATURES_URL}?type=features&category=${encodeURIComponent(category)}`);
    const result = await res.json();

    if (!result.success) {
      throw new Error(result.error || "Failed to load features");
    }

    const features = result.features || [];
    const selectEl = document.getElementById(selectId);
    if (!selectEl) return;

    selectEl.innerHTML = ""; // clear old

    // Add a blank option at top (for single selects only)
    if (!selectEl.multiple) {
      const blank = document.createElement("option");
      blank.value = "";
      blank.textContent = "-- Select --";
      selectEl.appendChild(blank);
    }

    features.forEach(f => {
      const opt = document.createElement("option");
      opt.value = f;
      opt.textContent = f;
      selectEl.appendChild(opt);
    });
  } catch (err) {
    console.error("Error loading features:", err);
  }
}

// ==============================
// Helper: get value(s) from select
// ==============================
function getSelectValue(selectEl) {
  if (!selectEl) return "";
  if (selectEl.multiple) {
    return Array.from(selectEl.selectedOptions).map(opt => opt.value).join(", ");
  }
  return selectEl.value;
}

// ==============================
// DOM Ready
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  // Map categories to select IDs
  const dropdowns = [
    { id: "buildSelect", category: "Build" },
    { id: "vesselSelect", category: "Vessel" },
    { id: "ribbonsSelect", category: "Ribbons" },
    { id: "tailSelect", category: "Tail" },
    { id: "physiognomySelect", category: "Physiognomy" },
    { id: "aestheticsSelect", category: "Aesthetics" }
  ];

  dropdowns.forEach(d => loadOptions(d.id, d.category));

  // Attach submit handler
  const form = document.getElementById("naraForm");
  form.addEventListener("submit", handleFormSubmit);
});

// ==============================
// Form Submit Handler
// ==============================
async function handleFormSubmit(e) {
  e.preventDefault();
  const statusMsg = document.getElementById("statusMsg");
  statusMsg.textContent = "Preparing Summon...";

  const imageUrl = "https://via.placeholder.com/300"; // 👈 placeholder

  const form = e.target;
  const now = new Date();
  const timestampISO = now.toISOString();
  const timestampEpoch = now.getTime().toString();

  const payload = {
    type: "summonNara",
    Timestamp: timestampISO,
    TimestampEpoch: timestampEpoch,
    Comments: "",
    Hide: "",
    URL: imageUrl,
    Art: "",
    Stage: form.Stage.value,
    Owner: form.Owner.value,
    "Discord ID": "",
    Designer: form.Designer.value,
    Artist: form.Artist.value,
    Status: "Pending",
    Rarity: "",
    Region: "",
    Calling: "",
    Value: "",
    Build: getSelectValue(document.getElementById("buildSelect")),
    Inventory: "",
    Palcharms: "",
    Emblems: "",
    Titles: "",
    Guild: "",
    Vessel: getSelectValue(document.getElementById("vesselSelect")),
    Ribbons: getSelectValue(document.getElementById("ribbonsSelect")),
    Tail: getSelectValue(document.getElementById("tailSelect")),
    Physiognomy: getSelectValue(document.getElementById("physiognomySelect")),
    Aesthetics: getSelectValue(document.getElementById("aestheticsSelect")),
    "Narling Form": "",
    Mernara: "",
    Humanara: "",
    Transformation: "",
    "Alt form": ""
  };

  try {
    const res = await fetch(SUMMONS_URL, {
      method: "POST",
      body: new URLSearchParams(payload)
    });
    const result = await res.json();

    if (result.success) {
      statusMsg.textContent = "✅ Nara submitted successfully!";
      form.reset();
    } else {
      statusMsg.textContent = "❌ Error: " + result.error;
    }
  } catch (err) {
    console.error(err);
    statusMsg.textContent = "❌ Summon failed: " + err.message;
  }
}
