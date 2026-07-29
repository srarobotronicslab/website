// ========================================
// SUPABASE CONFIGURATION
// ========================================

const SUPABASE_URL =
    "https://xzhpbisrzhgbeiptdkfd.supabase.co/";

const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6aHBiaXNyemhnYmVpcHRka2ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NzE1NDcsImV4cCI6MjEwMDU0NzU0N30.oGwKzJG7CuBG_bCDIz7vn5UMVDVMDJBZPM8H1Rxt1iw";


const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


// ========================================
// HEADER SCROLL EFFECT
// ========================================

const header =
    document.querySelector(".header");


window.addEventListener(
    "scroll",
    () => {

        if (
            window.scrollY > 20
        ) {

            header.style.boxShadow =
                "0 8px 30px rgba(0,0,0,0.08)";

        } else {

            header.style.boxShadow =
                "none";

        }

    }
);


// ========================================
// MOBILE MENU
// ========================================

const menuButton =
    document.getElementById(
        "menuButton"
    );


const topNav =
    document.querySelector(
        ".top-nav"
    );


if (
    menuButton &&
    topNav
) {

    menuButton.addEventListener(
        "click",
        () => {

            if (
                topNav.style.display ===
                "flex"
            ) {

                topNav.style.display =
                    "none";

            } else {

                topNav.style.display =
                    "flex";

                topNav.style.position =
                    "absolute";

                topNav.style.top =
                    "68px";

                topNav.style.left =
                    "20px";

                topNav.style.right =
                    "20px";

                topNav.style.padding =
                    "15px";

                topNav.style.flexDirection =
                    "column";

                topNav.style.background =
                    "#fefefe";

                topNav.style.borderRadius =
                    "15px";

                topNav.style.boxShadow =
                    "0 15px 40px rgba(0,0,0,0.12)";

            }

        }
    );

}


// ========================================
// ELEMENTS
// ========================================

const productGrid =
    document.getElementById(
        "productGrid"
    );


const searchInput =
    document.getElementById(
        "searchInput"
    );


const noResults =
    document.getElementById(
        "noResults"
    );


const categoryButtons =
    document.querySelectorAll(
        ".category"
    );


const cartCount =
    document.getElementById(
        "cartCount"
    );


// ========================================
// CART
// ========================================

// Load existing cart from browser

let cart =

    JSON.parse(

        localStorage.getItem(
            "cart"
        ) || "[]"

    );


// ========================================
// PRODUCTS
// ========================================

let products = [];

let selectedCategory =
    "all";


// ========================================
// UPDATE CART COUNT
// ========================================

function updateCartCount() {


    if (
        !cartCount
    ) {

        return;

    }


    let totalQuantity =
        0;


    cart.forEach(

        item => {

            totalQuantity +=

                Number(
                    item.quantity
                ) || 1;

        }

    );


    cartCount.textContent =
        totalQuantity;

}


// ========================================
// SAVE CART
// ========================================

function saveCart() {


    localStorage.setItem(

        "cart",

        JSON.stringify(
            cart
        )

    );


    updateCartCount();

}


// ========================================
// LOAD PRODUCTS FROM SUPABASE
// ========================================

async function loadProducts() {


    if (
        !productGrid
    ) {

        return;

    }


    productGrid.innerHTML = `

        <p class="loading">

            Loading products...

        </p>

    `;


    const {

        data,

        error

    } =

        await supabaseClient

            .from(
                "products"
            )

            .select("*")

            .eq(
                "is_available",
                true
            )

            .order(

                "created_at",

                {

                    ascending:
                        false

                }

            );


    // ====================================
    // ERROR
    // ====================================

    if (
        error
    ) {


        console.error(

            "Error loading products:",

            error

        );


        productGrid.innerHTML = `

            <p class="error">

                Failed to load products.

                <br><br>

                ${error.message}

            </p>

        `;


        return;

    }


    // ====================================
    // SAVE PRODUCTS
    // ====================================

    products =
        data || [];


    // ====================================
    // DISPLAY PRODUCTS
    // ====================================

    displayProducts();

}


// ========================================
// DISPLAY PRODUCTS
// ========================================

function displayProducts() {


    if (
        !productGrid
    ) {

        return;

    }


    const searchTerm =

        searchInput

            ? searchInput.value
                .toLowerCase()
                .trim()

            : "";


    // ====================================
    // FILTER PRODUCTS
    // ====================================

   // Inside displayProducts() in store.js
const filteredProducts = products.filter(product => {
    const name = String(product.name || "").toLowerCase();
    const description = String(product.description || "").toLowerCase();
    const category = String(product.category || "Other").toLowerCase();

    const matchesSearch = name.includes(searchTerm) || description.includes(searchTerm);
    
    // Direct category matching without prefix stripping
    const matchesCategory = selectedCategory === "all" || category.trim().toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
});

                const productCategory =

                    (
                        product.category ||
                        ""
                    )

                    .toLowerCase();


                const matchesSearch =

                    productName.includes(
                        searchTerm
                    );


                const matchesCategory =

                    selectedCategory ===
                    "all"

                    ||

                    productCategory ===

                    selectedCategory
                        .toLowerCase();


                return (

                    matchesSearch &&

                    matchesCategory

                );

            }

        );


    // ====================================
    // NO RESULTS
    // ====================================

    if (

        filteredProducts.length ===
        0

    ) {


        productGrid.innerHTML =
            "";


        if (
            noResults
        ) {

            noResults.style.display =
                "block";

        }


        return;

    }


    if (
        noResults
    ) {

        noResults.style.display =
            "none";

    }


    // ====================================
    // CLEAR GRID
    // ====================================

    productGrid.innerHTML =
        "";


    // ====================================
    // CREATE PRODUCT CARDS
    // ====================================

    filteredProducts.forEach(

        product => {


            const card =

                document.createElement(
                    "article"
                );


            card.className =
                "product-card";


            // =================================
            // PRODUCT IMAGE
            // =================================

            let imageHTML;


            if (
                product.image_url
            ) {

                imageHTML = `

                    <img

                        src="${product.image_url}"

                        alt="${escapeHTML(
                            product.name
                        )}"

                        class="product-image"

                    >

                `;

            } else {

                imageHTML = `

                    <div
                        class="product-image"
                    >

                        <span>

                            Product Image

                        </span>

                    </div>

                `;

            }


            // =================================
            // STOCK STATUS
            // =================================

            const stock =
                Number(
                    product.stock
                ) || 0;


            const isInStock =
                stock > 0;


            let stockHTML;


            if (
                isInStock
            ) {

                stockHTML = `

                    <span class="stock">

                        In Stock

                    </span>

                `;

            } else {

                stockHTML = `

                    <span class="stock">

                        Out of Stock

                    </span>

                `;

            }


            // =================================
            // PRODUCT CARD
            // =================================

            card.innerHTML = `

                ${imageHTML}


                <div
                    class="product-info"
                >


                    <span
                        class="product-category"
                    >

                        ${escapeHTML(
                            product.category ||
                            "Other"
                        )}

                    </span>


                    <h3>

                        ${escapeHTML(
                            product.name
                        )}

                    </h3>


                    <p
                        class="product-description"
                    >

                        ${escapeHTML(

                            product.description ||

                            "No description available."

                        )}

                    </p>


                    <div
                        class="product-bottom"
                    >


                        <strong
                            class="price"
                        >

                            ৳${Number(
                                product.price
                            )}

                        </strong>


                        ${stockHTML}


                    </div>


                    <div
                        class="product-actions"
                    >


                        <button

                            class="add-cart"

                            type="button"

                            data-product-id="${product.id}"

                        >

                            Add to Cart

                        </button>


                        <button

                            class="buy-now"

                            type="button"

                            data-product-id="${product.id}"

                        >

                            Buy Now

                        </button>


                    </div>


                </div>

            `;


            // =================================
            // BUTTONS
            // =================================

            const addCartButton =

                card.querySelector(
                    ".add-cart"
                );


            const buyNowButton =

                card.querySelector(
                    ".buy-now"
                );


            // =================================
            // DISABLE IF OUT OF STOCK
            // =================================

            if (
                !isInStock
            ) {

                addCartButton.disabled =
                    true;

                buyNowButton.disabled =
                    true;

            }


            // =================================
            // ADD TO CART
            // =================================

            addCartButton.addEventListener(

                "click",

                () => {

                    addToCart(
                        product
                    );

                }

            );


            // =================================
            // BUY NOW
            // =================================

            buyNowButton.addEventListener(

                "click",

                () => {

                    buyNow(
                        product
                    );

                }

            );


            // =================================
            // ADD CARD
            // =================================

            productGrid.appendChild(
                card
            );

        }

    );

}


// ========================================
// ADD TO CART
// ========================================

function addToCart(
    product
) {


    // ====================================
    // CHECK STOCK
    // ====================================

    const stock =
        Number(
            product.stock
        ) || 0;


    if (
        stock <= 0
    ) {

        alert(
            "This product is currently out of stock."
        );

        return;

    }


    // ====================================
    // CHECK EXISTING ITEM
    // ====================================

    const existingItem =

        cart.find(

            item =>

                item.id ===
                product.id

        );


    if (
        existingItem
    ) {


        const currentQuantity =

            Number(
                existingItem.quantity
            ) || 1;


        // =================================
        // PREVENT EXCEEDING STOCK
        // =================================

        if (
            currentQuantity >=
            stock
        ) {

            alert(

                "You cannot add more than " +

                stock +

                " unit(s) of this product."

            );

            return;

        }


        existingItem.quantity =

            currentQuantity + 1;


    } else {


        // =================================
        // ADD NEW ITEM
        // =================================

        cart.push({
    id: product.id,
    name: product.name,
    price: Number(product.price),
    quantity: 1,
    stock: stock,
    image_url: product.image_url || null
});

    }


    // ====================================
    // SAVE
    // ====================================

    saveCart();


    alert(

        product.name +

        " has been added to your cart."

    );

}


// ========================================
// BUY NOW
// ========================================

function buyNow(
    product
) {


    const stock =
        Number(
            product.stock
        ) || 0;


    if (
        stock <= 0
    ) {

        alert(
            "This product is currently out of stock."
        );

        return;

    }


    // ====================================
    // REMOVE OTHER CART ITEMS
    // ====================================

    cart = [

        {

            id:
                product.id,

            name:
                product.name,

            price:
                Number(
                    product.price
                ),

            quantity:
                1,

            stock:
                stock

        }

    ];


    // ====================================
    // SAVE CART
    // ====================================

    saveCart();


    // ====================================
    // GO TO CART
    // ====================================

    window.location.href =
        "cart.html";

}


// ========================================
// SEARCH
// ========================================

if (
    searchInput
) {


    searchInput.addEventListener(

        "input",

        () => {

            displayProducts();

        }

    );

}


// ========================================
// CATEGORY FILTER
// ========================================

categoryButtons.forEach(

    button => {


        button.addEventListener(

            "click",

            function () {


                // =========================
                // REMOVE ACTIVE
                // =========================

                categoryButtons.forEach(

                    btn => {

                        btn.classList.remove(
                            "active"
                        );

                    }

                );


                // =========================
                // ADD ACTIVE
                // =========================

                this.classList.add(
                    "active"
                );


                // =========================
                // SAVE CATEGORY
                // =========================

                selectedCategory =

                    this.dataset.category ||
                    "all";


                // =========================
                // DISPLAY
                // =========================

                displayProducts();

            }

        );

    }

);


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(
    value
) {


    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(
            value
        );


    return div.innerHTML;

}


// ========================================
// CART BUTTON
// ========================================

const cartButton =

    document.querySelector(
        ".cart-button"
    );


if (
    cartButton
) {


    cartButton.addEventListener(

        "click",

        event => {


            event.preventDefault();


            window.location.href =
                "cart.html";

        }

    );

}


// ========================================
// CURRENT YEAR
// ========================================

const yearElement =

    document.getElementById(
        "year"
    );


if (
    yearElement
) {

    yearElement.textContent =

        new Date()
            .getFullYear();

}


// ========================================
// INITIAL CART COUNT
// ========================================

updateCartCount();


// ========================================
// START
// ========================================

loadProducts();
