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
const FEATURES_URL = FEATURES_BASE_URL + "/Features";

// ==============================
// Load Features → Dropdowns
// ==============================
// ==============================
// Load Features → Dropdowns
// ==============================
async function loadOptions(selectId, category, isMulti = false) {
  try {
    // Fetch the Features sheet directly from Narapedia
    const res = await fetch(FEATURES_BASE_URL);
    const rows = await res.json();

    // Filter by Type column (case-insensitive match)
    const features = rows
      .filter(r => r.Type && r.Type.trim().toLowerCase() === category.toLowerCase())
      .map(r => r.Feature)
      .filter(Boolean);

    console.log(`Features for ${category}:`, features);

    const container = document.getElementById(selectId);
    if (!container) {
      console.warn(`❌ No container with id ${selectId}`);
      return;
    }

    if (isMulti) {
      // Multi-select categories → spawn dynamic dropdowns
      container.innerHTML = "";
      spawnDropdown(container, features, category);
    } else {
      // Single-select categories → populate the existing <select>
      container.innerHTML = ""; // clear old options

      const blank = document.createElement("option");
      blank.value = "";
      blank.textContent = "-- Select --";
      container.appendChild(blank);

      features.forEach(f => {
        const opt = document.createElement("option");
        opt.value = f;
        opt.textContent = f;
        container.appendChild(opt);
      });
    }
  } catch (err) {
    console.error("Error loading features:", err);
  }
}

// ==============================
// Spawn Multi Dropdown + Remove
// ==============================
function spawnDropdown(container, features, category) {
  const wrapper = document.createElement("div");
  wrapper.classList.add("dropdown-wrapper");

  const selectEl = document.createElement("select");
  selectEl.name = `${category}[]`;
  selectEl.classList.add("dynamic-select");

  const blank = document.createElement("option");
  blank.value = "";
  blank.textContent = "-- Select --";
  selectEl.appendChild(blank);

  features.forEach(f => {
    const opt = document.createElement("option");
    opt.value = f;
    opt.textContent = f;
    selectEl.appendChild(opt);
  });

  // Only add remove button if this is NOT the first select
  let removeBtn = null;
  if (container.children.length > 0) {
    removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "×";
    removeBtn.classList.add("remove-btn");

    removeBtn.addEventListener("click", () => {
      container.removeChild(wrapper);
    });
  }

  // Append in the order: select first, then button (so button is on right)
  wrapper.appendChild(selectEl);
  if (removeBtn) wrapper.appendChild(removeBtn);

  selectEl.addEventListener("change", () => {
    if (selectEl.value && container.lastElementChild === wrapper) {
      spawnDropdown(container, features, category);
    }
  });

  container.appendChild(wrapper);
}

// ==============================
// DOM Ready
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  const dropdowns = [
    { id: "buildSelect", category: "Build", multi: false },
    { id: "vesselSelect", category: "Vessel", multi: true },
    { id: "ribbonsSelect", category: "Ribbons", multi: true },
    { id: "tailSelect", category: "Tail", multi: true },
    { id: "physiognomySelect", category: "Physiognomy", multi: true },
    { id: "aestheticsSelect", category: "Aesthetics", multi: true }
  ];

  dropdowns.forEach(d => loadOptions(d.id, d.category, d.multi));

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

  const imageUrl = "https://via.placeholder.com/300"; // placeholder

  const form = e.target;
  const now = new Date();
  const timestampISO = now.toISOString();
  const timestampEpoch = now.getTime().toString();

  function collectMulti(name) {
    return [...form.querySelectorAll(`select[name="${name}[]"]`)]
      .map(s => s.value)
      .filter(v => v)
      .join(", ");
  }

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
    Build: form.querySelector("#buildSelect")?.value || "",
    Inventory: "",
    Palcharms: "",
    Emblems: "",
    Titles: "",
    Guild: "",
    Vessel: collectMulti("Vessel"),
    Ribbons: collectMulti("Ribbons"),
    Tail: collectMulti("Tail"),
    Physiognomy: collectMulti("Physiognomy"),
    Aesthetics: collectMulti("Aesthetics"),
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
