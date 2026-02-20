/*
        _..---.--.
       .'\ __|/O.__)
      /__.' _/ .-'_\
     (____.'.-_\____)
      (_/ _)__(_ \_)\_
    mrf(_..)--(.._)'--'
    
    if you're looking at this page to learn about coding,
    you can ask chuwigirls for help! */

// ==========================
// Google Sheets Config
// ==========================
// Narapedia (Masterlist, Staff, etc.)
const SHEET_ID_NARAPEDIA = "1lGc4CVqcFr9LtcyVW-78N5En7_imdfC8bTf6PRUD-Ms";
const SHEET_BASE_URL_NARAPEDIA = `https://opensheet.elk.sh/${SHEET_ID_NARAPEDIA}`;

// NaraTrove (Currencies, Inventory, Palcharms for Civilians)
const SHEET_ID_TROVE = "1FGsqhNZ_fYW-njhJlP39r-nQeK2X4FCIXeC_FTeU6lM";
const SHEET_BASE_URL_TROVE = `https://opensheet.elk.sh/${SHEET_ID_TROVE}`;

// Narapprovals
const SCRIPT_URL_SUMMONS = "https://script.google.com/macros/s/AKfycbyYg8RUmOYKgbBuz8mtFqq_KM6JUcW_uTzt83gITg2-qLZRaWoaFFFo0OtZQOD9mGOY/exec";
const FEATURES_BASE_URL = `${SHEET_BASE_URL_NARAPEDIA}/Features`; 


// ==========================
// Masterlist Config
// ==========================
const MASTERLIST_CONFIG = {
  listId: "narapedia-view",
  detailId: "masterlist-detail-view",
  cardTemplate: "#narapedia-card-template",
  detailTemplate: "#masterlist-detail-template",
  imageField: "URL",
  nameField: "Nara",
  queryParam: "design",
  extraFields: [
    { field: "Owner", className: "masterlist-detail-owner" },
    { field: "Designer", className: "masterlist-detail-designer" },
    { field: "Artist", className: "masterlist-detail-artist" },
    { field: "Region", className: "masterlist-detail-region" },
    { field: "Status", className: "masterlist-detail-status" },
    { field: "Rarity", className: "masterlist-detail-rarity" },
    { field: "Calling", className: "masterlist-detail-calling" },
    { field: "Value", className: "masterlist-detail-region" },
    { field: "Build", className: "masterlist-detail-build" },
    { field: "Palcharms", className: "masterlist-detail-palcharms" },
    { field: "Inventory", className: "masterlist-detail-inventory" },
    { field: "Titles", className: "masterlist-detail-titles" },
    { field: "Vessel", className: "masterlist-detail-vessel" },
    { field: "Ribbons", className: "masterlist-detail-ribbons" },
    { field: "Tail", className: "masterlist-detail-tail" },
    { field: "Physiognomy", className: "masterlist-detail-physiognomy" },
    { field: "Aesthetics", className: "masterlist-detail-aesthetics" }
  ]
};

// ==========================
// Features Config
// ==========================
const FEATURES_CONFIG = {
  listId: "narapedia-view",
  detailId: "feature-detail-view",
  cardTemplate: "#narapedia-card-template",
  detailTemplate: "#feature-detail-template",
  imageField: "URL",
  nameField: "Feature",
  queryParam: "feature",
  extraFields: [
    { field: "Type", className: "feature-detail-type" },
    { field: "Rarity", className: "feature-detail-rarity" },
    { field: "Found", className: "feature-detail-found" },
    { field: "Description", className: "feature-detail-description" },
    { field: "Examples", className: "feature-detail-example" }
  ]
};

// ==========================
// Artifacts Config
// ==========================
const ARTIFACTS_CONFIG = {
  listId: "narapedia-view",
  detailId: "artifact-detail-view",
  cardTemplate: "#narapedia-card-template",
  detailTemplate: "#artifact-detail-template",
  imageField: "URL",
  nameField: "Artifact",
  queryParam: "artifact",
  extraFields: [
    { field: "Type", className: "artifact-detail-type" },
    { field: "Price", className: "artifact-detail-price" },
    { field: "Rarity", className: "artifact-detail-rarity" },
    { field: "Found", className: "artifact-detail-found" },
    { field: "Description", className: "artifact-detail-description" },
    { field: "Useage", className: "artifact-detail-useage" },
    { field: "Tradeable", className: "artifact-detail-trade" },
    { field: "Recycleable", className: "artifact-detail-recycle" }
  ]
};

// ==========================
// Palcharms Config
// ==========================
const PALCHARMS_CONFIG = {
  listId: "narapedia-view",
  detailId: "palcharm-detail-view",
  cardTemplate: "#narapedia-card-template",
  detailTemplate: "#palcharm-detail-template",
  imageField: "URL",
  nameField: "Palcharm",
  queryParam: "palcharm",
  extraFields: [
    { field: "Type", className: "palcharm-detail-type" },
    { field: "Price", className: "palcharm-detail-price" },
    { field: "Rarity", className: "palcharm-detail-rarity" },
    { field: "Found", className: "palcharm-detail-found" },
    { field: "Description", className: "palcharm-detail-description" }
  ]
};

// ==========================
// Trials Config
// ==========================
const TRIALS_CONFIG = {
  listId: "narapedia-view",
  detailId: "trial-detail-view",
  cardTemplate: "#narapedia-card-template",
  detailTemplate: "#trial-detail-template",
  imageField: "URL",
  nameField: "Trial",
  queryParam: "trial",
  extraFields: [
    { field: "Status", className: "trial-detail-status" },
    { field: "Start", className: "trial-detail-start" },
    { field: "End", className: "trial-detail-end" },
    { field: "Flavor text", className: "trial-detail-flavor" },
    { field: "Description", className: "trial-detail-description" },
    { field: "Requirements", className: "trial-detail-reqs" },
    { field: "Rewards", className: "trial-detail-rewards" },
    { field: "Tags", className: "trial-detail-tags" }
  ]
};

// ==========================
// Emblems Config
// ==========================
const EMBLEMS_CONFIG = {
  listId: "narapedia-view",
  detailId: "emblem-detail-view",
  cardTemplate: "#narapedia-card-template",
  detailTemplate: "#emblem-detail-template",
  imageField: "URL",
  nameField: "Emblem",
  queryParam: "emblem",
  extraFields: [
    { field: "Type", className: "emblem-detail-type" },
    { field: "Price", className: "emblem-detail-price" },
    { field: "Rarity", className: "emblem-detail-rarity" },
    { field: "Found", className: "emblem-detail-found" },
    { field: "Description", className: "emblem-detail-description" }
  ]
};

// ==========================
// Staff Config
// ==========================
const STAFF_CONFIG = {
  listId: "staff-view",
  detailId: "staff-detail-view",
  cardTemplate: "#narapedia-card-template",
  detailTemplate: "#staff-detail-template",
  imageField: "URL",
  nameField: "Celestial",
  queryParam: "celestial",
  extraFields: [
    { field: "Role", className: "staff-detail-role" },
    { field: "Pronouns", className: "staff-detail-pronouns" },
    { field: "Civilian Profile", className: "staff-detail-civilian" },
    { field: "Duties", className: "staff-detail-duties" },
    { field: "Custom Status", className: "staff-detail-status" },
    { field: "Blurb", className: "staff-detail-blurb" }
  ]
};

// ==========================
// FAQ Config
// ==========================
const FAQ_CONFIG = {
  listId: "narapedia-view",
  detailId: "faq-detail-view",
  cardTemplate: "#narapedia-card-template",
  detailTemplate: "#faq-detail-template",
  nameField: "FAQ",
  queryParam: "faq",
  extraFields: [
    { field: "Question", className: "faq-detail-question" },
    { field: "Answer", className: "faq-detail-answer" },
    { field: "Keywords", className: "faq-detail-keywords" },
    { field: "Duties", className: "faq-detail-duties" },
    { field: "Custom Status", className: "faq-detail-status" },
    { field: "Blurb", className: "faq-detail-blurb" }
  ]
};

const CIVILIANS_CONFIG = {
  listId: "civilians-view",
  detailId: "civilian-detail-view",
  cardTemplate: "#civilians-card-template",   // <- updated
  detailTemplate: "#civilian-detail-template",
  imageField: "URL",
  nameField: "Civilian",
  extraFields: [
    { field: "Owner", className: "civilian-detail-owner" },
    { field: "Region", className: "civilian-detail-region" },
    { field: "Rarity", className: "civilian-detail-rarity" },
    { field: "Status", className: "civilian-detail-status" },
    { field: "Titles", className: "civilian-detail-titles" },
    { field: "Inventory", className: "civilian-detail-inventory" },
    { field: "Palcharms", className: "civilian-detail-palcharms" },
    { field: "Build", className: "civilian-detail-build" }
  ]
};

// ==============================
// ======== Discord OAuth =======
// ==============================
const discordClientId = '1319474218550689863';
const redirectUri = 'https://chuwigirls.github.io/user.html';
const discordScopes = 'identify';
