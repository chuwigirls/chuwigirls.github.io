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
const IMGUR_CLIENT_ID = "YOUR_IMGUR_CLIENT_ID"; // for later
const SUMMONS_URL = SCRIPT_URL_SUMMONS;
const FEATURES_URL = "https://opensheet.elk.sh/1lGc4CVqcFr9LtcyVW-78N5En7_imdfC8bTf6PRUD-Ms/Features";
const OPTIONS_URL  = "https://opensheet.elk.sh/1lGc4CVqcFr9LtcyVW-78N5En7_imdfC8bTf6PRUD-Ms/Options";
const ARTIFACTS_URL  = "https://opensheet.elk.sh/1lGc4CVqcFr9LtcyVW-78N5En7_imdfC8bTf6PRUD-Ms/Artifacts";

// ==============================
// Generic loader for all sheets
// ==============================
async function loadSheetOptions(selectId, category, isMulti = false, sheet = "features") {
  try {
    // 🧩 Choose correct sheet
    let url;
    if (sheet === "options") url = OPTIONS_URL;
    else if (sheet === "artifacts") url = ARTIFACTS_URL;
    else url = FEATURES_URL;

    const res = await fetch(url);
    const rows = await res.json();

    const fieldName =
      sheet === "options" ? "Option" :
      sheet === "artifacts" ? "Artifact" : "Feature";

    const filterField = rows[0].Type ? "Type" : "Category";

    // 🧠 Filter logic
    let filteredRows;
    if (sheet === "artifacts") {
      filteredRows = rows.filter(r =>
        ["Design Artifact", "Feature Artifact"].includes(r[filterField])
      );
    } else {
      filteredRows = rows.filter(r =>
        r[filterField] && r[filterField].trim().toLowerCase() === category.toLowerCase()
      );
    }

    const values = filteredRows
      .map(r => r[fieldName])
      .filter(Boolean);

    console.log(`Loaded [${category}] from ${sheet}:`, values);

    const container = document.getElementById(selectId);
    if (!container) {
      console.warn(`❌ No container with id ${selectId}`);
      return;
    }

    container.innerHTML = "";

    if (isMulti) {
      spawnDropdown(container, values, category, true);
      return;
    }

    const select = document.createElement("select");
    select.name = category;
    select.required = true;

    const blank = document.createElement("option");
    blank.value = "";
    blank.textContent = `-- Select ${category} --`;
    select.appendChild(blank);

    values.forEach(v => {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = v;
      select.appendChild(opt);
    });

    container.appendChild(select);
  } catch (err) {
    console.error(`Error loading ${category} from ${sheet}:`, err);
  }
}

// ==============================
// Multi-select dropdown spawner
// ==============================
function spawnDropdown(container, features, category) {
  const existingAddBtn = container.querySelector(".add-btn");
  if (existingAddBtn) existingAddBtn.remove();

  const wrapper = document.createElement("div");
  wrapper.classList.add("dropdown-wrapper");

  const selectEl = document.createElement("select");
  selectEl.name = `${category}[]`;
  selectEl.classList.add("dynamic-select");
  if (container.children.length === 0) selectEl.required = true;

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

  let removeBtn = null;
  if (container.children.length > 0) {
    removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "×";
    removeBtn.classList.add("remove-btn");
    removeBtn.addEventListener("click", () => {
      container.removeChild(wrapper);
      updateAddButton(container, features, category);
    });
  }

  wrapper.appendChild(selectEl);
  if (removeBtn) wrapper.appendChild(removeBtn);
  container.appendChild(wrapper);

  selectEl.addEventListener("change", () => {
    updateAddButton(container, features, category);
  });

  updateAddButton(container, features, category);
}

function updateAddButton(container, features, category) {
  const existingAddBtn = container.querySelector(".add-btn");
  if (existingAddBtn) existingAddBtn.remove();

  const selects = container.querySelectorAll("select.dynamic-select");
  const lastSelect = selects[selects.length - 1];

  if (selects.length >= 5) return;
  if (!lastSelect || !lastSelect.value) return;

  const addBtn = document.createElement("button");
  addBtn.type = "button";
  addBtn.textContent = "+";
  addBtn.classList.add("add-btn");
  addBtn.addEventListener("click", () => {
    spawnDropdown(container, features, category);
  });

  container.appendChild(addBtn);
}

// ==============================
// DOM Ready
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  const dropdowns = [
    { id: "stageSelect", category: "Stage", multi: false, sheet: "options" },
    { id: "artifactSelect", category: "Artifacts", multi: true, sheet: "artifacts" },
    { id: "buildSelect", category: "Build", multi: false, sheet: "features" },
    { id: "vesselSelect", category: "Vessel", multi: true, sheet: "features" },
    { id: "ribbonsSelect", category: "Ribbons", multi: true, sheet: "features" },
    { id: "tailSelect", category: "Tail", multi: true, sheet: "features" },
    { id: "physiognomySelect", category: "Physiognomy", multi: true, sheet: "features" },
    { id: "aestheticsSelect", category: "Aesthetics", multi: true, sheet: "features" }
  ];

  dropdowns.forEach(d => loadSheetOptions(d.id, d.category, d.multi, d.sheet));

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

  const imageUrl = "/assets/narwhal.png";
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
    Stage: form.querySelector("select[name='Stage']")?.value || "",
    Artifacts: collectMulti("Artifacts"),
    Owner: form.Owner.value,
    "Discord ID": "",
    Designer: form.Designer.value,
    Artist: form.Artist.value,
    Status: "Pending",
    Rarity: "",
    Region: "",
    Calling: "",
    Value: "",
    Build: form.querySelector("select[name='Build']")?.value || "",
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
