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
// Generic loader for all sheets (with Subtype grouping support)
// ==============================
async function loadSheetOptions(selectId, category, isMulti = false, sheet = "features") {
  try {
    // choose sheet url
    let url;
    if (sheet === "options") url = OPTIONS_URL;
    else if (sheet === "artifacts") url = ARTIFACTS_URL;
    else url = FEATURES_URL;

    const res = await fetch(url);
    const rows = await res.json();

    if (!Array.isArray(rows)) {
      console.warn(`Expected rows array from ${url} but got:`, rows);
      return;
    }

    // determine which field holds the label
    const fieldName = sheet === "options" ? "Option" : (sheet === "artifacts" ? "Artifact" : "Feature");

    // support either "Type" or "Category" header
    const filterField = rows.length && rows[0].Type ? "Type" : "Category";

    // Filtering:
    let filteredRows;
    if (sheet === "artifacts") {
      // include both Design Artifact and Feature Artifact when category is "Artifacts"
      filteredRows = rows.filter(r =>
        category.toLowerCase() === "artifacts"
          ? ["design artifact", "feature artifact"].includes((r[filterField] || "").trim().toLowerCase())
          : (r[filterField] && (r[filterField] || "").trim().toLowerCase() === category.toLowerCase())
      );
    } else {
      filteredRows = rows.filter(r =>
        r[filterField] && (r[filterField] || "").trim().toLowerCase() === category.toLowerCase()
      );
    }

    if (!filteredRows.length) {
      console.warn(`⚠️ No matches found for ${category} in ${sheet}`);
      // still clear container to avoid stale options
      const containerEmpty = document.getElementById(selectId);
      if (containerEmpty) containerEmpty.innerHTML = "";
      return;
    }

    const container = document.getElementById(selectId);
    if (!container) {
      console.warn(`❌ No container with id ${selectId}`);
      return;
    }

    // detect Subtype grouping
    const hasSubtype = filteredRows.some(r => r.Subtype && r.Subtype.toString().trim() !== "");
    // grouped: { SubtypeName: [ values... ] }
    const grouped = {};
    if (hasSubtype) {
      filteredRows.forEach(r => {
        const g = (r.Subtype || "Other").toString().trim() || "Other";
        if (!grouped[g]) grouped[g] = [];
        // push the label for this row (fieldName)
        const label = r[fieldName];
        if (label) grouped[g].push(label);
      });
    }

    // clear container
    container.innerHTML = "";

    // -------------------------
    // SINGLE SELECT (no multi)
    // -------------------------
    if (!isMulti) {
      const select = document.createElement("select");
      select.name = category;
      select.required = true;

      const blank = document.createElement("option");
      blank.value = "";
      blank.textContent = `-- Select ${category} --`;
      select.appendChild(blank);

      if (hasSubtype) {
        // add optgroups
        for (const [group, items] of Object.entries(grouped)) {
          const optgroup = document.createElement("optgroup");
          optgroup.label = group;
          items.forEach(v => {
            const opt = document.createElement("option");
            opt.value = v;
            opt.textContent = v;
            optgroup.appendChild(opt);
          });
          select.appendChild(optgroup);
        }
      } else {
        // simple list
        filteredRows.forEach(r => {
          const opt = document.createElement("option");
          opt.value = r[fieldName];
          opt.textContent = r[fieldName];
          select.appendChild(opt);
        });
      }

      container.appendChild(select);
      return;
    }

    // -------------------------
    // MULTI-SELECT (dynamic grouped selects)
    // -------------------------
    // create function that will build a grouped select wrapper and append it to container
    // closure captures grouped and filteredRows + hasSubtype
    function createGroupedSelect() {
      // remove existing add button (we'll re-create it)
      const existingAddBtn = container.querySelector(".add-btn");
      if (existingAddBtn) existingAddBtn.remove();

      const wrapper = document.createElement("div");
      wrapper.classList.add("dropdown-wrapper");

      const selectEl = document.createElement("select");
      selectEl.name = `${category}[]`;
      selectEl.classList.add("dynamic-select");
      // make first required
      if (container.querySelectorAll(".dropdown-wrapper").length === 0) {
        selectEl.required = true;
      }

      // blank top option
      const blank = document.createElement("option");
      blank.value = "";
      blank.textContent = "-- Select --";
      selectEl.appendChild(blank);

      if (hasSubtype) {
        // add optgroups in the same order as grouped object's keys
        for (const [group, items] of Object.entries(grouped)) {
          const optgroup = document.createElement("optgroup");
          optgroup.label = group;
          items.forEach(v => {
            const opt = document.createElement("option");
            opt.value = v;
            opt.textContent = v;
            optgroup.appendChild(opt);
          });
          selectEl.appendChild(optgroup);
        }
      } else {
        filteredRows.forEach(r => {
          const opt = document.createElement("option");
          opt.value = r[fieldName];
          opt.textContent = r[fieldName];
          selectEl.appendChild(opt);
        });
      }

      // remove button for additional selects only
      let removeBtn = null;
      if (container.querySelectorAll(".dropdown-wrapper").length > 0) {
        removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.textContent = "×";
        removeBtn.classList.add("remove-btn");
        removeBtn.addEventListener("click", () => {
          container.removeChild(wrapper);
          // after remove, update the add button state
          updateAddButton();
        });
      }

      wrapper.appendChild(selectEl);
      if (removeBtn) wrapper.appendChild(removeBtn);
      container.appendChild(wrapper);

      selectEl.addEventListener("change", () => {
        updateAddButton();
      });

      // refresh add button state after adding new select
      updateAddButton();
    }

    // updateAddButton checks last select value and count, shows/hides + button
    function updateAddButton() {
      // remove existing add button
      const existingAddBtn = container.querySelector(".add-btn");
      if (existingAddBtn) existingAddBtn.remove();

      const selects = container.querySelectorAll("select.dynamic-select");
      const lastSelect = selects[selects.length - 1];

      // limit 5 selects
      if (selects.length >= 5) return;

      // only show + when last select exists and has a value
      if (!lastSelect || !lastSelect.value) return;

      const addBtn = document.createElement("button");
      addBtn.type = "button";
      addBtn.textContent = "+";
      addBtn.classList.add("add-btn");
      addBtn.addEventListener("click", () => {
        createGroupedSelect();
      });

      container.appendChild(addBtn);
    }

    // initial create
    createGroupedSelect();

  } catch (err) {
    console.error(`Error loading ${category} from ${sheet}:`, err);
  }
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
