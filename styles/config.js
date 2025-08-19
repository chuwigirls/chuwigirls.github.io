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
const SHEET_ID = "1lGc4CVqcFr9LtcyVW-78N5En7_imdfC8bTf6PRUD-Ms"; // <-- replace with your actual sheet ID
const SHEET_BASE_URL = `https://opensheet.elk.sh/${SHEET_ID}`;

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
    { field: "Rarity", className: "masterlist-detail-rarty" },
    { field: "Calling", className: "masterlist-detail-calling" },
    { field: "Value", className: "masterlist-detail-region" },
    { field: "Build", className: "masterlist-detail-Build" }
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
    { field: "Description", className: "artifact-detail-description" }
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
    { field: "Type", className: "trial-detail-type" },
    { field: "Price", className: "trial-detail-price" },
    { field: "Rarity", className: "trial-detail-rarity" },
    { field: "Found", className: "trial-detail-found" },
    { field: "Description", className: "trial-detail-description" }
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

// ==============================
// ======== Discord OAuth =======
// ==============================
const discordClientId = '1319474218550689863';
const redirectUri = 'https://chuwigirls.github.io/user.html';
const discordScopes = 'identify';
