/* ==================================================================== */
/* URLs
======================================================================= */
let url = new URL(window.location.href);
let baseURL = window.location.origin + window.location.pathname;
let folderURL = window.location.origin + '/' + window.location.pathname.replace(/\/[^\/]+$/, "");
let urlParams = new URLSearchParams(window.location.search);


/* ==================================================================== */
/* Load Header and Footer
======================================================================= */
$(function () {
    $(".load-html").each(function () {$(this).load(this.dataset.source)});
});


/* ==================================================================== */
/* Clean Sheet Data
======================================================================= */
const scrubData = (sheetData) => {

    cleanJson = JSON.parse(sheetData.substring(47).slice(0, -2));

    // Grab column headers
    const col = [];
    if (cleanJson.table.cols[0].label) {
        cleanJson.table.cols.forEach((headers) => {
            if (headers.label) {
                col.push(headers.label.toLowerCase().replace(/\s/g, ""));
            }
        });
    }

    // Scrubs columns and puts them in a readable object
    const scrubbedData = [];
    cleanJson.table.rows.forEach((info, num) => {
        const row = {};
        const isBoolean = val => 'boolean' === typeof val;
        col.forEach((ele, ind) => {
            row[ele] = info.c[ind] != null ? info.c[ind].f != null && !isBoolean(info.c[ind].v) ? info.c[ind].f : info.c[ind].v != null ? info.c[ind].v : "" : "";
        });
        scrubbedData.push(row);
    });

    let publicData = scrubbedData.filter((i) => { return i['hide'] !== true; });

    return publicData;

}


/* ================================================================ */
/* Sort Options
/* ================================================================ */
let optionSorter = (options) => {

    // Clean up the sheetID - in case they used a link instead
    let scrubbedSheetId = sheetID ? sheetID.includes('/d/') ? sheetID.split('/d/')[1].split('/edit')[0] : sheetID : "1l_F95Zhyj5OPQ0zs-54pqacO6bVDiH4rlh16VhPNFUc";

    // Call all options, make defaults of our own
    let userOptions = options;
    let defaultOptions = {

        sheetID: scrubbedSheetId,
        sheetPage: userOptions.sheetPage ? userOptions.sheetPage : "masterlist",

        fauxFolderColumn: userOptions.fauxFolderColumn ? keyCreator(userOptions.fauxFolderColumn) : false,
        filterColumn: userOptions.filterColumn ? keyCreator(userOptions.filterColumn) : false,
        searchFilterParams: userOptions.searchFilterParams ? addAll(userOptions.searchFilterParams) : false,

    }

    // Merge options
    let mergedOptions = {...userOptions, ...defaultOptions};

    return mergedOptions;

}


/* ================================================================ */
/* QOL Funcs
/* ================================================================ */
let sheetPage = (id, pageName) => {
    return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:json&headers=1&tq=WHERE A IS NOT NULL&sheet=${pageName}`
};

let fetchSheet = async (page, sheet = sheetID) => {
    const JSON = await fetch(sheetPage(sheet, page)).then(i => i.text());
    return scrubData(JSON);
}

let keyCreator = (key) => {
    return key.toLowerCase().replace(/\s/g, "");
};

let addAll = (key) => {
    key.unshift("All")
    return key;
};

let addOptions = (arr, filter) => {
    arr.forEach((val) => {
        let optionHTML = document.createElement('option');
        optionHTML.value = val.toLowerCase().replace(/\s/g, "");
        optionHTML.textContent = val;
        filter.append(optionHTML);
    });
};

let loadPage = () => {
    $('#loading').hide();
    $('.softload').addClass('active');
}

let urlParamFix = (key, folder, params = urlParams) => {
    return '?' + (url.search.includes(folder) ? folder + '=' + params.get(folder) + '&' : '') + `${key}=`;
};


/* ================================================================ */
/* Get a card's log
/* ================================================================ */
let getLog = (log, item, key = 'id') => {
    if ($("#log-table").length != 0) {

        let logArr = [];
        log.forEach((i) => {
            if (i[key].toLowerCase() === item[key].toLowerCase()) {
                let newLog = {
                    timestamp: i.timestamp,
                    reason: i.reason,
                };
                logArr.push(newLog);
            };
        });

        // Create Rows
        let rows = [];
        logArr.forEach((i) => {
            let HTML = $("#log-entry").clone();
            HTML.find(".timestamp").html(i.timestamp);
            HTML.find(".reason").html(i.reason);
            rows.push(HTML);
        });

        $("#log-table").html(rows);

    }
}


/* ================================================================ */
/* Get Keys
/* Makes an array for List.js to use
/* ================================================================ */
let sheetArrayKeys = (arr) => {
    let itemArray = Object.keys(arr[0]);
    if (itemArray.indexOf('cardlink')) itemArray[itemArray.indexOf('cardlink')] = { name: 'cardlink', attr: 'href' };
    if (itemArray.indexOf('cardlinkalt')) itemArray[itemArray.indexOf('cardlinkalt')] = { name: 'cardlinkalt', attr: 'href' };
    if (itemArray.indexOf('link')) itemArray[itemArray.indexOf('link')] = { name: 'link', attr: 'href' };
    if (itemArray.indexOf('image')) itemArray[itemArray.indexOf('image')] = { name: 'image', attr: 'src' };
    return itemArray;
};


/* ================================================================ */
/* Pagination
/* ================================================================ */
let showPagination = (arr, amt) => {
    $('.btn-next').on('click', () => { $('.pagination .active').next().children('a')[0].click(); })
    $('.btn-prev').on('click', () => { $('.pagination .active').prev().children('a')[0].click(); })
    if (arr.length > amt) $('#narasnature-pagination').show()
}


/* ================================================================ */
/* Search Filter
/* ================================================================ */
let narasnatureSearch = (info, searchArr) => {

    if (searchArr && searchArr.length > 2) {
        addOptions(searchArr, $('#search-filter'));
        $('#search-filter').parent().show();
        $('#search').addClass('filtered');
    }

    let arr = searchArr.map(function (v) { return v.toLowerCase().replace(/\s/g, ""); });

    $('#search').on('keyup', () => {
        let selection = $("#search-filter option:selected").val();
        let searchString = $('#search').val();
        if (selection && selection != 'all') {
            info.search(searchString, [selection]);
        } else {
            info.search(searchString, arr);
        }
    });

    $('#narasnature-filters').show();

};



/* ================================================================ */
/* Custom Filter
/* ================================================================ */
let narasnatureFilterSelect = (info, arr, key) => {
    if (key) {

        const filterArr = [...new Set(arr.map(i => i[key]))];

        if (filterArr.length > 2) {

            addOptions(addAll(filterArr), $('#filter'));

            $("#filter").on('change', () => {
                let selection = $("#filter option:selected").text().toLowerCase();
                if (selection && !selection.includes('all')) {
                    info.filter(function (i) { return i.values()[key].toLowerCase() == selection; });
                } else {
                    info.filter();
                }
            });

            $('#filter').parent().show();
            $('#narasnature-filters').show();

        }
    }
};



/* ================================================================ */
/* Faux Folder Function
/* ================================================================ */
let fauxFolderButtons = (array, fauxFolder, params = urlParams) => {
    if (array[0].hasOwnProperty(fauxFolder)) {

        // Create a set to store unique tags
        let tagSet = new Set();

        // Iterate through each entry and split tags properly
        array.forEach(entry => {
            if (entry[fauxFolder]) {
                let tags = Array.isArray(entry[fauxFolder]) ? entry[fauxFolder] : entry[fauxFolder].split(/,\s*/); // Adjust delimiter if needed
                tags.forEach(tag => tagSet.add(tag.trim())); // Add each tag to the set
            }
        });

        // Convert set back to array (ensures uniqueness)
        const uniqueTags = [...tagSet].filter(n => n); 

        // Create Param Object Array
        let urlParamArray = uniqueTags.map(tag => {
            return $('#narasnature-filter-buttons a').clone()
                .text(tag)
                .attr("href", baseURL + '?' + fauxFolder + '=' + tag.toLowerCase());
        });

        if (urlParamArray.length > 1) {
            // Add "All" button
            urlParamArray.unshift($('#narasnature-filter-buttons a')
                .text('All')
                .attr("href", baseURL));

            // Append buttons to the container
            let btnCols = urlParamArray.map(btn => $('#narasnature-filter-buttons').html(btn).clone());
            $('#filter-buttons .row').append(btnCols);

            // Show Buttons
            $('#filter-buttons').show();
        }
    }

    // Filters out information based on URL parameters
    if (params.has(fauxFolder) && fauxFolder) {
        return array.filter(entry => {
            let tags = Array.isArray(entry[fauxFolder]) ? entry[fauxFolder] : entry[fauxFolder].split(/,\s*/);
            return tags.map(tag => tag.toLowerCase()).includes(params.get(fauxFolder).toLowerCase());
        });
    } else {
        return array;
    }
};





/* ================================================================ */
/* Prev and Next Links
/* ================================================================ */
let prevNextLinks = (array, url, params, currParam, key, altkey = false) => {
    if ($("#entryPrev").length != 0) {

        let index = array.map(function (i) {return i[key];}).indexOf(currParam.get(key));
        let leftItem = array[index - 1];
        let rightItem = array[index + 1];

        // Basically a special declaration for the masterlist
        let chooseKey = altkey ? altkey : key;

        // Prev
        if (leftItem) {
            $("#entryPrev").attr("href", url + params + leftItem[chooseKey]);
            $("#entryPrev span").text(leftItem[chooseKey]);
        } else {
            $("#entryPrev i").remove();
        }

        // Next
        if (rightItem) {
            $("#entryNext").attr("href", url + params + rightItem[chooseKey]);
            $("#entryNext span").text(rightItem[chooseKey]);
        } else {
            $("#entryNext i").remove();
        }

        // Back to masterlist (keeps species parameter)
        $("#masterlistLink").attr("href", url);
        $('#prevNext').show();

    }
};


/* ==================================================================== */
/* narasnature w/ Gallery and Cards
======================================================================= */
const narasnatureLarge = async (options) => {

    // Sort through options
    const narasnatureInfo = optionSorter(options);

    // Grab the sheet
    let sheetArray = await fetchSheet(narasnatureInfo.sheetPage);

    // Grab all our url info
    let cardKey = Object.keys(sheetArray[0])[0];
    let preParam = urlParamFix(cardKey, narasnatureInfo.fauxFolderColumn);

    // Create faux folders
    // Filter through array based on folders
    if (narasnatureInfo.fauxFolderColumn) sheetArray = fauxFolderButtons(sheetArray, narasnatureInfo.fauxFolderColumn);

    // Reverse based on preference
    narasnatureInfo.itemOrder == 'asc' ? sheetArray.reverse() : '';

    // Add card links to the remaining array
    for (var i in sheetArray) { sheetArray[i].cardlink = baseURL + preParam + sheetArray[i][cardKey]; }

    // Decide if the url points to profile or entire gallery
    if (urlParams.has(cardKey)) {

        // Render the prev/next links on profiles
        prevNextLinks(sheetArray, baseURL, preParam, urlParams, cardKey);

        // List.js options
        let itemOptions = {
            valueNames: sheetArrayKeys(sheetArray),
            item: 'narasnature-card',
        };

        // Filter out the right card
        let singleCard = sheetArray.filter((i) => (i[cardKey] === urlParams.get(cardKey)))[0];

        // Render card
        let narasnatureItem = new List("narasnature-gallery", itemOptions, singleCard);


    } else {


        // Create the Gallery

        let galleryOptions = {
            item: 'narasnature-entries',
            valueNames: sheetArrayKeys(sheetArray),
            searchColumns: narasnatureInfo.searchFilterParams,
            page: narasnatureInfo.itemAmount,
            pagination: [{
                innerWindow: 1,
                left: 1,
                right: 1,
                item: `<li class='page-item'><a class='page page-link'></a></li>`,
                paginationClass: 'pagination-top',
            }],
        };

        // Render Gallery
        let narasnature = new List('narasnature-gallery', galleryOptions, sheetArray);

        // Make filters workie
        narasnatureFilterSelect(narasnature, sheetArray, narasnatureInfo.filterColumn);
        narasnatureSearch(narasnature, narasnatureInfo.searchFilterParams);

        // Show pagination
        showPagination(sheetArray, narasnatureInfo.itemAmount);

    }

};


/* ==================================================================== */
/* narasnature w/ just Gallery
======================================================================= */
const narasnatureSmall = async (options) => {

    // Sort through options
    const narasnatureInfo = optionSorter(options);

    // Grab the sheet
    let sheetArray = await fetchSheet(narasnatureInfo.sheetPage);

    // Create the Gallery
    let galleryOptions = {
        item: 'narasnature-entries',
        valueNames: sheetArrayKeys(sheetArray),
    };

    // Render Gallery
    let narasnature = new List('narasnature-gallery', galleryOptions, sheetArray);

};


/* ==================================================================== */
/* Masterlist Only
======================================================================= */
const masterlist = async (options) => {

    // Sort through options
    const narasnatureInfo = optionSorter(options);

    // Grab the sheet
    let sheetArray = await fetchSheet(narasnatureInfo.sheetPage);

    // Grab all our url info
    let cardKey = Object.keys(sheetArray[0])[3];
    let cardKeyAlt = Object.keys(sheetArray[0])[0];

    let preParam = urlParamFix(cardKey, narasnatureInfo.fauxFolderColumn);

    // Create faux folders
    // Filter through array based on folders
    if (narasnatureInfo.fauxFolderColumn) sheetArray = fauxFolderButtons(sheetArray, narasnatureInfo.fauxFolderColumn);

    // Reverse based on preference
    narasnatureInfo.itemOrder == 'asc' ? sheetArray.reverse() : '';

    // Add card links to the remaining array
    for (var i in sheetArray) { 
        sheetArray[i].cardlink = baseURL + preParam + sheetArray[i][cardKey]; 
        sheetArray[i].cardlinkalt = baseURL + urlParamFix(cardKeyAlt, narasnatureInfo.fauxFolderColumn) + sheetArray[i][Object.keys(sheetArray[0])[0]]; 
    }

    // Decide if the url points to profile or entire gallery
    if (urlParams.has(cardKey) || urlParams.has(cardKeyAlt)) {

        // Filter out the right card
        let currCardKey = urlParams.has(cardKey) ? cardKey : cardKeyAlt;
        let singleCard = sheetArray.filter((i) => (i[currCardKey] === urlParams.get(currCardKey)))[0];

        // Grab the log sheet and render log
        let logArray = await fetchSheet(narasnatureInfo.logSheetPage);
        getLog(logArray, singleCard);

        // List.js options
        let itemOptions = {
            valueNames: sheetArrayKeys(sheetArray),
            item: 'narasnature-card',
        };

        // Render the prev/next links on profiles
        prevNextLinks(sheetArray, baseURL, preParam, urlParams, currCardKey, cardKey);

        // Render card
        let narasnatureItem = new List("narasnature-gallery", itemOptions, singleCard);


    } else {

        // Show pagination
        showPagination(sheetArray, narasnatureInfo.itemAmount);

        // Create the Gallery
        let galleryOptions = {
            item: 'narasnature-entries',
            valueNames: sheetArrayKeys(sheetArray),
            searchColumns: narasnatureInfo.searchFilterParams,
            page: narasnatureInfo.itemAmount,
            pagination: [{
                innerWindow: 1,
                left: 1,
                right: 1,
                item: `<li class='page-item'><a class='page page-link'></a></li>`,
                paginationClass: 'pagination-top',
            }],
        };

        // Render Gallery
        let narasnature = new List('narasnature-gallery', galleryOptions, sheetArray);

        // Make filters workie
        narasnatureFilterSelect(narasnature, sheetArray, narasnatureInfo.filterColumn);
        narasnatureSearch(narasnature, narasnatureInfo.searchFilterParams);


    }

};


/* ==================================================================== */
/* Inventories
======================================================================= */
const inventory = async (options) => {

    // Sort through options
    const narasnatureInfo = optionSorter(options);

    // Grab the sheet
    let sheetArray = await fetchSheet(narasnatureInfo.sheetPage);

    // Grab all our url info
    let cardKey = Object.keys(sheetArray[0])[0];
    let preParam = `?${cardKey}=`;

    // Put in alphabetical order
    sheetArray.sort((a, b) => a.username.toLowerCase().localeCompare(b.username.toLowerCase()));

    // Add card links to the remaining array
    for (var i in sheetArray) { sheetArray[i].cardlink = baseURL + preParam + sheetArray[i][cardKey]; }

    // Decide if the url points to profile or entire gallery
    if (urlParams.has(cardKey)) {

        // Fetch item info from the item sheet
        let itemSheetArr = await fetchSheet(narasnatureInfo.itemSheetPage);
        let itemCardKey = Object.keys(itemSheetArr[0])[0];

        // List.js options
        let itemOptions = {
            valueNames: sheetArrayKeys(sheetArray),
            item: 'narasnature-card',
        };

        // Filter out the right card
        let singleCard = sheetArray.filter((i) => (i[cardKey] === urlParams.get(cardKey)))[0];

        // Merge the user's inventory with the item sheet
        // Also remove any items they dont have atm
        let inventoryItemArr = [];
        itemSheetArr.forEach((i) => {
            for (var c in singleCard) {
                if (c === keyCreator(i.item) && ((singleCard[keyCreator(i.item)] !== "0" && singleCard[keyCreator(i.item)] !== ""))) {
                    let inventoryItems = {
                        type: i.type,
                        item: i.item,
                        image: i.image,
                        itemlink: folderURL + "/items.html?" + itemCardKey + "=" + i[itemCardKey],
                        amount: singleCard[keyCreator(i.item)],
                    };
                    inventoryItemArr.push(inventoryItems);
                };
            }
        });

        // Sort items by type if applicable
        if (narasnatureInfo.sortTypes) {
            inventoryItemArr.sort(function (a, b) {
                return narasnatureInfo.sortTypes.indexOf(a.type) - narasnatureInfo.sortTypes.indexOf(b.type);
            });
        };

        // Group by the item type
        let orderItems = Object.groupBy(inventoryItemArr, ({ type }) => type);

        // Create Rows
        let rows = [];
        for (var i in orderItems) {

            // Get the headers and cols
            let cols = [];
            orderItems[i].forEach((v) => {
                let HTML = $("#item-list-col").clone();
                HTML.find(".item-img").attr('src', v.image);
                HTML.find(".itemlink").attr('href', v.itemlink);
                HTML.find(".item").html(v.item);
                HTML.find(".amount").html(v.amount);
                cols.push(HTML);
            });

            // Smack everything together
            let rowHTML = $("#item-list-section").clone().html([
                $("#item-list-header").clone().html(i),
                $("#item-list-row").clone().html(cols)
            ]);

            rows.push(rowHTML);

        };

        // Make items show up
        $("#item-list").html(rows);

        // Characters
        let addDesigns = async () => {
            if ($("#design-gallery").length != 0) {
                if (narasnatureInfo.numOfDesigns != 0) {

                    // Grab dah sheet
                    let designs = await fetchSheet(narasnatureInfo.masterlistSheetPage);

                    // Filter out any MYO slots, reverse and pull the first 4
                    let selectDesigns = designs.filter((i) => { return i.designtype != 'MYO Slot' }).reverse().slice(0, narasnatureInfo.numOfDesigns);

                    // Add cardlink
                    let cardKey = Object.keys(selectDesigns[0])[0];
                    for (var i in selectDesigns) { selectDesigns[i].cardlink = folderURL + "masterlist.html?" + cardKey + "=" + selectDesigns[i][cardKey]; }

                    // Nyoom
                    let galleryOptions = {
                        item: 'design-item',
                        valueNames: sheetArrayKeys(selectDesigns),
                    };

                    // Render Gallery
                    let narasnature = new List('design-gallery', galleryOptions, selectDesigns);

                } else {
                    $("#design-gallery").hide();
                }
            }
        }; addDesigns();

        // Grab the log sheet and render log
        let logArray = await fetchSheet(narasnatureInfo.logSheetPage);
        getLog(logArray, singleCard, "username");

        // Render card
        let narasnatureItem = new List("narasnature-gallery", itemOptions, singleCard);


    } else {

        // Show pagination
        showPagination(sheetArray, narasnatureInfo.itemAmount);

        // Create the Gallery
        let galleryOptions = {
            item: 'narasnature-entries',
            valueNames: sheetArrayKeys(sheetArray),
            searchColumns: [cardKey],
            page: narasnatureInfo.itemAmount,
            pagination: [{
                innerWindow: 1,
                left: 1,
                right: 1,
                item: `<li class='page-item'><a class='page page-link'></a></li>`,
                paginationClass: 'pagination-top',
            }],
        };

        // Render Gallery
        let narasnature = new List('narasnature-gallery', galleryOptions, sheetArray);

        // Make filters workie
        narasnatureSearch(narasnature, [cardKey]);


    }

};

/* ==================================================================== */
/* Nursery
======================================================================= */
const narling = async (options) => {

    // Sort through options
    const narasnatureInfo = optionSorter(options);

    // Grab the sheet
    let sheetArray = await fetchSheet(narasnatureInfo.sheetPage);

    // Grab all our url info
    let cardKey = Object.keys(sheetArray[0])[3];
    let cardKeyAlt = Object.keys(sheetArray[0])[0];

    let preParam = urlParamFix(cardKey, narasnatureInfo.fauxFolderColumn);

    // Create faux folders
    // Filter through array based on folders
    if (narasnatureInfo.fauxFolderColumn) sheetArray = fauxFolderButtons(sheetArray, narasnatureInfo.fauxFolderColumn);

    // Add card links to the remaining array
    for (var i in sheetArray) { 
        sheetArray[i].cardlink = baseURL + preParam + sheetArray[i][cardKey]; 
        sheetArray[i].cardlinkalt = baseURL + urlParamFix(cardKeyAlt, narasnatureInfo.fauxFolderColumn) + sheetArray[i][Object.keys(sheetArray[0])[0]]; 
    }

    // Decide if the url points to profile or entire gallery
    if (urlParams.has(cardKey) || urlParams.has(cardKeyAlt)) {

        // Filter out the right card
        let currCardKey = urlParams.has(cardKey) ? cardKey : cardKeyAlt;
        let singleCard = sheetArray.filter((i) => (i[currCardKey] === urlParams.get(currCardKey)))[0];

        // Grab the log sheet and render log
        let logArray = await fetchSheet(narasnatureInfo.logSheetPage);
        getLog(logArray, singleCard);

        // List.js options
        let itemOptions = {
            valueNames: sheetArrayKeys(sheetArray),
            item: 'narasnature-card',
        };

        // Render the prev/next links on profiles
        prevNextLinks(sheetArray, baseURL, preParam, urlParams, currCardKey, cardKey);

        // Render card
        let narasnatureItem = new List("narasnature-gallery", itemOptions, singleCard);


    } else {

// Filter Adoptables
sheetArray = sheetArray.filter((i) => i.designtype === 'Adoptable');

// Show pagination
showPagination(sheetArray, narasnatureInfo.itemAmount);

// Create the Gallery
let galleryOptions = {
    item: 'narasnature-entries',
    valueNames: sheetArrayKeys(sheetArray),
    searchColumns: narasnatureInfo.searchFilterParams,
    page: narasnatureInfo.itemAmount,
    pagination: [{
        innerWindow: 1,
        left: 1,
        right: 1,
        item: `<li class='page-item'><a class='page page-link'></a></li>`,
        paginationClass: 'pagination-top',
    }],
};

// Render Gallery
let narasnature = new List('narasnature-gallery', galleryOptions, sheetArray);

// Make filters workie
narasnatureFilterSelect(narasnature, sheetArray, narasnatureInfo.filterColumn);
narasnatureSearch(narasnature, narasnatureInfo.searchFilterParams);
    }

};

/* ==================================================================== */
/* This is just to fill out some of the front page automatically
/* You're free to delete and create something yourself!
======================================================================= */
const frontPage = (options) => {

    const narasnatureInfo = optionSorter(options);

    // Pursuits
    let addEvents = async () => {
        if ($("#quest-gallery").length != 0) {
            if ( narasnatureInfo.numOfpursuits != 0) {

                // Grab dah sheet
                let events = await fetchSheet(narasnatureInfo.pursuitsheetPage);
                let cardKey = Object.keys(events[0])[0];
    
                // Sort by End Date
                let newestEvents = events.sort(function (a, b) {
                    var c = new Date(a.enddate);
                    var d = new Date(b.enddate);
                    return d - c;
                });
    
                // Show x Amount on Index
                let indexEvents = newestEvents.slice(0, narasnatureInfo.numOfpursuits);
    
                // Add card link
                for (var i in indexEvents) { indexEvents[i].cardlink = folderURL + "pursuits.html?" + cardKey + "=" + indexEvents[i][cardKey]; }
    
                // Nyoom
                let galleryOptions = {
                    item: 'quest-item',
                    valueNames: sheetArrayKeys(indexEvents),
                };
    
                // Render Gallery
                let narasnature = new List('quest-gallery', galleryOptions, indexEvents);
    
            } else {
                $("#quest-gallery").hide();
            }
        }
    }; addEvents();

    // Staff
    let addStaff = async () => {
        if ($("#staff-gallery").length != 0) {
            if (narasnatureInfo.numOfStaff != 0) {

                // Grab dah sheet
                let mods = await fetchSheet(narasnatureInfo.staffSheetPage);

                // Show x Amount on Index
                let indexMods = mods.slice(0, narasnatureInfo.numOfStaff);

                // Nyoom
                let galleryOptions = {
                    item: 'staff-item',
                    valueNames: sheetArrayKeys(indexMods),
                };

                // Render Gallery
                let narasnature = new List('staff-gallery', galleryOptions, indexMods);

            } else {
                $("#staff-gallery").hide();
            }
        }
    }; addStaff();

    // Designs
    let addDesigns = async () => {
        if ($("#design-gallery").length != 0) {
            if (narasnatureInfo.numOfDesigns != 0) {

                // Grab dah sheet
                let designs = await fetchSheet(narasnatureInfo.masterlistSheetPage);

                // Filter out any MYO slots, reverse and pull the first 4
                let selectDesigns = designs.filter((i) => { return i.designtype != 'Unsummoned' }).reverse().slice(0, narasnatureInfo.numOfDesigns);

                // Add cardlink
                let cardKey = Object.keys(selectDesigns[0])[0];
                for (var i in selectDesigns) { selectDesigns[i].cardlink = folderURL + "masterlist.html?" + cardKey + "=" + selectDesigns[i][cardKey]; }

                // Nyoom
                let galleryOptions = {
                    item: 'design-item',
                    valueNames: sheetArrayKeys(selectDesigns),
                };

                // Render Gallery
                let narasnature = new List('design-gallery', galleryOptions, selectDesigns);

            } else {
                $("#design-gallery").hide();
            }
        }
    }; addDesigns();

}; 


/* ==================================================================== */
/* Softload pages
======================================================================= */
$(window).on('pageshow',function(){loadPage()});
