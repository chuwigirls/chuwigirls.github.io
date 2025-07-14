/* ------------------------------------------------------------------- */
/* Sheet ID
/* Your sheet ID
/* ------------------------------------------------------------------- */
let sheetID = "1BSya1MjgYUdWnrYvqoGJjhsU_OulWb-LwW_82GLP8gY";


/* ------------------------------------------------------------------- */
/* All sheet pages
/* ------------------------------------------------------------------- */
let sheetPages = {

    masterlist: "masterlist",
    masterlistLog: "masterlist log",
    inventory: "inventory",
    inventoryLog: "inventory log",
    artifacts: "artifacts",
    features: "features",
    pursuits: "pursuits",
    faq: "faq",
    staff: "staff",

}


/* ------------------------------------------------------------------- */
/* All Site Options
/* ------------------------------------------------------------------- */
let options = {


    /* Index
    /* --------------------------------------------------------------- */
    index: {

        pursuitsheetPage: sheetPages.pursuits,
        numOfpursuits: 2,

        staffSheetPage: sheetPages.staff,
        numOfStaff: 8,

        masterlistSheetPage: sheetPages.masterlist,
        numOfDesigns: 8,
    
    },


    /* Masterlist
    /* --------------------------------------------------------------- */
    masterlist: {

        sheetPage: sheetPages.masterlist,
        logSheetPage: sheetPages.masterlistLog,

        itemAmount: 12,
        itemOrder: "asc",

        searchFilterParams: ['ID', 'Owner', 'Designer', 'Artist'],
        fauxFolderColumn: 'Design Type',

    },

    /* Nursery
    /* --------------------------------------------------------------- */
    nursery: {

        sheetPage: sheetPages.masterlist,
        logSheetPage: sheetPages.masterlistLog,

        itemAmount: 12,
        itemOrder: "asc",

        searchFilterParams: ['Region', 'Rarity', 'Build'], 
        /* fauxFolderColumn: 'Design Type', */

    },


    /* Artifact catalogue
    /* --------------------------------------------------------------- */
    artifacts: {

        sheetPage: sheetPages.artifacts,
    
        itemAmount: 24,
        itemOrder: "dsc",
    
        filterColumn: 'Rarity',
        searchFilterParams: ['Artifact'],
        fauxFolderColumn: 'Type',
    
    },


    /* Invetory
    /* --------------------------------------------------------------- */
    inventory: {

        sheetPage: sheetPages.inventory,
        itemSheetPage: sheetPages.artifacts,
        logSheetPage: sheetPages.inventoryLog,
        masterlistSheetPage: sheetPages.masterlist,
    
        itemAmount: 24,
        sortTypes: ['Currency', 'Summoning Scroll', 'Pet', 'Trait', 'Misc'],
        
        searchFilterParams: ['Username'],
        
        numOfDesigns: 8,
    
    },


    /* pursuits
    /* --------------------------------------------------------------- */
    pursuits: {
    
        sheetPage: sheetPages.pursuits,
        optionsSheetPage: sheetPages.options,

        itemAmount: 24,
        itemOrder: "desc",

        searchFilterParams: ['Title', 'Description'],
        fauxFolderColumn: 'Tags',
    
    },


    /* Features
    /* --------------------------------------------------------------- */
    features: {
    
        sheetPage: sheetPages.features,

        itemAmount: 24,
        itemOrder: "dsc",

        filterColumn: 'Rarity',
        searchFilterParams: ['Feature'],
        fauxFolderColumn: 'Type',
    
    },

    /* Activities
    /* --------------------------------------------------------------- */
    activities: {
    
        sheetPage: sheetPages.games,

        itemAmount: 24,
        itemOrder: "desc",
    
    },

    /* Staff
    /* --------------------------------------------------------------- */
    staff: {
    
        sheetPage: sheetPages.staff,
    
    },


    /* FAQ
    /* --------------------------------------------------------------- */
    faq: {
    
        sheetPage: sheetPages.faq,
    
        itemAmount: 24,
        itemOrder: "asc",
    
        searchFilterParams: ['Tags'],
    
    },


}

/* ------------------------------------------------------------------- */
/* to Top button
/* ------------------------------------------------------------------- */
let mybutton = document.getElementById("top");

window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    mybutton.style.display = "block";
  } else {
    mybutton.style.display = "none";
  }
}

function topFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}


