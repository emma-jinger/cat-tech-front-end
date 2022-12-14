//****** Fixing Mobile Nav Menu Automatic Collapse (Lecture59)******

// the outer jquery $: Same as document.addEventListener("DOMContentLoaded", function(){});
$(
    function () {
        // document.querySelector("#navbarToggle").addEventListener("blur", function(){...});
        $("#navbarToggle").blur(function () {
            // Gets the width of the content area of the browser window
            let screenWidth = window.innerWidth;
            // xs screen size
            if (screenWidth < 768) {
                //collapse function is from bootstrap, but is a plugin to jquery
                $("#collapsable-nav").collapse("hide");
            };
        });
    }
);

//**************Dynamically loading home view content **********

//Helper function for inserting innerHTML identified by 'selector' 
const insertHtml = function (selector, html) {
    let targetElem = document.querySelector(selector);
    targetElem.innerHTML = html;
};

//show loading icon inside element identified by 'selector' 
const showLoading = function (selector) {
    let html = "<dic class='text-center'>";
    html += "<img src='images/ajax-loader.gif'></div>";
    insertHtml(selector, html);
};

// homeHtml to be inserted to #main-content 
let homeHtml = "snippets/home-snippet.html";

// On page load (before images or CSS)
// Using jquery $(function(){}) sign should still work? YES!
document.addEventListener("DOMContentLoaded", function () {
    // On first load, show ajax-loader gif
    showLoading("#main-content");
    //sendGetRequest takes 3 arguments: requestUrl, responseHandler, isJsonResponse 
    ajaxUtils.sendGetRequest(
        homeHtml,
        // value of responseText is <request.responseText>
        // obtained by executing sendGetRequest() function
        function (responseText) {
            // reponse handler
            insertHtml("#main-content", responseText)
        },
        false
    );
});

// ******** Dynamically load Menu Categories ************
let dc = {};
let allCategoriesUrl =
    "https://davids-restaurant.herokuapp.com/categories.json";
let categoriesTitleHtml = "snippets/categories-title-snippet.html";
let categoryHtml = "snippets/category-snippet.html";

// Function to load the menu categories view
dc.loadMenuCategories = function () {
    showLoading("#main-content");
    switchMenuToActive();
    // Insert data from allCategoriesUrl to html snippets and build them together
    ajaxUtils.sendGetRequest(allCategoriesUrl, buildAndShowCategoriesHTML);
};

// Helpful function to the above function
// function: Build and show HTML for the categories page based on the data from the server
function buildAndShowCategoriesHTML(categories) {
    // Load title snippet of categories page
    ajaxUtils.sendGetRequest(categoriesTitleHtml, function (categoriesTitleHtml) {
        // Retrieve single category and use it to build Categories View Html
        ajaxUtils.sendGetRequest(categoryHtml,
            function (categoryHtml) {
                let categoriesViewHtml = buildCategoriesViewHtml(categories, categoriesTitleHtml, categoryHtml);
                insertHtml("#main-content", categoriesViewHtml);
            },
            false);
    },
        false);
};

// Helpper function to the above function
// Function: Usin categories data and snippet html to build categories view html to be inserted into page
function buildCategoriesViewHtml(categories, categoriesTitleHtml, categoryHtml) {
    // Use categoriesTitleHtml as the base to build on
    let finalHtml = categoriesTitleHtml;
    finalHtml += "<section class='row'>";

    // Loop over the categories
    for (let i = 0; i < categories.length; i++) {
        // Insert category values
        // Use categoryHtml as the base to add real values each time
        let html = categoryHtml;
        let name = "" + categories[i].name;
        let short_name = "" + categories[i].short_name;
        html = insertProperty(html, "name", name);
        html = insertProperty(html, "short_name", short_name);
        finalHtml += html;
    }
    finalHtml += "</section>";
    return finalHtml;
};

// Helper Function to substitude property that has 
// double curly brackets with a value
const insertProperty = function (string, propName, propValue) {
    // string would be the whole category-snippet as a string
    let propToReplace = "{{" + propName + "}}";
    // Using RegExp() constructor with the flag "g" as an argument 
    //of the method repalace() will replace all the matches
    string = string.replace(new RegExp(propToReplace, "g"), propValue);
    return string;
};


// ******** Dynamically load Single Category View (Menu Items) ************
let menuItemsTitleHtml = "snippets/menu-items-title.html";
let menuItemHtml = "snippets/menu-item.html";
let menuItemsUrl =
    // value short_name used in this project is grabbed when the allCategories Html is built
    "https://davids-restaurant.herokuapp.com/menu_items.json?category=";

// Helper function
// Remove the class 'active' from home and switch to Menu button
const switchMenuToActive = function () {
    // Remove 'active' from home button 
    // className property value is a string
    let classes = document.querySelector("#navHomeButton").className;
    // Reason to use new RegExp constructor is to use "g" (global)--find all occurence of 'active' if for some reason exist
    classes = classes.replace(new RegExp("active", "g"), "");
    document.querySelector("#navHomeButton").className = classes;

    // Add 'active' to menu button if not already there
    classes = document.querySelector("#navMenuButton").className;
    // If #navMenuButton has no active as a class
    // indexOf string method returns -1 when the searched substring is not found 
    if (classes.indexOf("active") == -1) {
        classes += " active";
        document.querySelector("#navMenuButton").className = classes;
    }
};

dc.loadMenuItems = function (categoryShort) {
    showLoading("#main-content");
    switchMenuToActive();
    ajaxUtils.sendGetRequest(menuItemsUrl + categoryShort, buildAndShowMenuItemsHTML);
};

function buildAndShowMenuItemsHTML(categoryMenuItems) {
    // Retieve menu item title html
    ajaxUtils.sendGetRequest(
        menuItemsTitleHtml,
        function (menuItemsTitleHtml_resp) {
            // Retrieve menu items html
            ajaxUtils.sendGetRequest(
                menuItemHtml,
                // The actual build of the final html
                function (menuItemHtml_resp) {
                    let final_html = buildMenuItemsViewHtml(menuItemsTitleHtml_resp, menuItemHtml_resp, categoryMenuItems);
                    insertHtml("#main-content", final_html);
                },
                false);
        },
        false)
};

function buildMenuItemsViewHtml(menuItemsTitleHtml, menuItemHtml, categoryMenuItems) {
    // Replace the place holders in the title html with the actual values
    menuItemsTitleHtml = insertProperty(menuItemsTitleHtml, "name", categoryMenuItems.category.name);
    menuItemsTitleHtml = insertProperty(menuItemsTitleHtml, "special_instructions", categoryMenuItems.category.special_instructions);
    let final_html = menuItemsTitleHtml;
    final_html += "<section class='row'>";

    // Menu Items View Html
    // Loop over menu items 
    let menu_items = categoryMenuItems.menu_items;
    let catShortName = categoryMenuItems.category.short_name;
    for (let i = 0; i < menu_items.length; i++) {
        let newMenuItemHtml = menuItemHtml;
        console.log("inside for loop, catShortName is: " + catShortName);
        // Replace the place holders in the title html with the actual values
        newMenuItemHtml = insertProperty(newMenuItemHtml, "catShortName", catShortName);
        newMenuItemHtml = insertProperty(newMenuItemHtml, "short_name", menu_items[i].short_name);
        newMenuItemHtml = insertItemPrice(newMenuItemHtml, "price_small", menu_items[i].price_small);
        newMenuItemHtml = insertItemPortionName(newMenuItemHtml, "small_portion_name", menu_items[i].small_portion_name);
        newMenuItemHtml = insertItemPrice(newMenuItemHtml, "price_large", menu_items[i].price_large);
        newMenuItemHtml = insertItemPortionName(newMenuItemHtml, "large_portion_name", menu_items[i].large_portion_name);
        newMenuItemHtml = insertProperty(newMenuItemHtml, "name", menu_items[i].name);
        newMenuItemHtml = insertProperty(newMenuItemHtml, "description", menu_items[i].description);
        // Add clearfix after every second menu ietm
        if (i % 2 != 0) {
            newMenuItemHtml += "<div class='clearfix visible-lg-block visible-md-block'></div>"
        }
        final_html += newMenuItemHtml;
    };
    final_html += "</section>";
    return final_html;
};

// Append price with "$" if price exist
// Handle when the price tag for some items do not exist
function insertItemPrice(html, pricePropName, priceValue) {
    // If not specified, replace with empty string (priceValue is undefined if not exists)
    if (!priceValue) {
        return insertProperty(html, pricePropName, "");
    }
    priceValue = "$" + priceValue.toFixed(2);
    html = insertProperty(html, pricePropName, priceValue);
    return html;
};

// Handle when the portion name for some items do not exist
function insertItemPortionName(html, portionPropName, portionValue) {
    if (!portionValue) {
        return insertProperty(html, portionPropName, "");
    }
    portionValue = "(" + portionValue + ")";
    return insertProperty(html, portionPropName, portionValue);
};