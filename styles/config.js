/* 
        _..---.--.
       .'\ __|/O.__)
      /__.' _/ .-'_\
     (____.'.-_\____)
      (_/ _)__(_ \_)\_
    mrf(_..)--(.._)'--'

    if you're looking at this page to learn about coding,
    you can ask chuwigirls for help! */

// ==============================
// =========== Sheets ===========
// ==============================
const sheetConfigs = {
  narapedia: {
    id: "1lGc4CVqcFr9LtcyVW-78N5En7_imdfC8bTf6PRUD-Ms",
    sheetName: "Masterlist"
  },
  naratrove: {
    id: "1FGsqhNZ_fYW-njhJlP39r-nQeK2X4FCIXeC_FTeU6lM",
    sheetName: "Inventory"
  }
};

// ==============================
// ======== Discord OAuth =======
// ==============================
const discordClientId = '1319474218550689863';
const redirectUri = 'https://chuwigirls.github.io/user.html';
const discordScopes = 'identify';

// ==============================
// ======== Render Sheets =======
// ==============================
renderSheets(data, {
  listId: "masterlist-view",
  detailId: "nara-detail-view",
  cardTemplate: "#masterlist-card-template",
  detailTemplate: "#nara-detail-template",
  imageField: "URL",
  nameField: "Nara",
  queryParam: "design",
  extraFields: [
    { field: "Owner", className: "nara-detail-owner" },
    { field: "Region", className: "nara-detail-region" },
    { field: "Designer", className: "nara-detail-designer" },
    { field: "Status", className: "nara-detail-status" },
    { field: "Rarity", className: "nara-detail-rarity" }
  ]
});

renderSheets(data, {
  listId: "artifact-view",
  detailId: "artifact-detail-view",
  cardTemplate: "#artifact-card-template",
  detailTemplate: "#artifact-detail-template",
  imageField: "Image",
  nameField: "Artifact",
  queryParam: "artifact",
  extraFields: [
    { field: "Type", className: "artifact-detail-type" },
    { field: "Price", className: "artifact-detail-price" },
    { field: "Rarity", className: "artifact-detail-rarity" },
    { field: "Found", className: "artifact-detail-found" },
    { field: "Description", className: "artifact-detail-description" }
  ]
});

renderSheets(data, {
  listId: "palcharm-view",
  detailId: "palcharm-detail-view",
  cardTemplate: "#palcharm-card-template",
  detailTemplate: "#palcharm-detail-template",
  imageField: "Image",
  nameField: "Palcharm",
  queryParam: "palcharm",
  extraFields: [
    { field: "Ability", className: "palcharm-detail-ability" }
  ]
});



