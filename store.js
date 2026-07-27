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
// CART
// ========================================

let cart = JSON.parse(
    localStorage.getItem("cart") || "[]"
);


// ========================================
// PRODUCTS
// ========================================

let products = [];

let selectedCategory = "all";


// ========================================
// ELEMENTS
// ========================================

const header =
    document.querySelector(".header");

const menuButton =
    document.getElementById("menuButton");

const topNav =
    document.querySelector(".top-nav");

const productGrid =
    document.getElementById("productGrid");

const searchInput =
    document.getElementById("searchInput");

const noResults =
    document.getElementById("noResults");

const categoryButtons =
    document.querySelectorAll(".category");

const cartCount =
    document.getElementById("cartCount");

const cartButton =
    document.querySelector(".cart-button");

const yearElement =
    document.getElementById("year");


// ========================================
// HEADER SCROLL EFFECT
// ========================================

if (header) {

    window.addEventListener(
        "scroll",
        () => {

            if (window.scrollY > 20) {

                header.style.boxShadow =
                    "0 8px 30px rgba(0,0,0,0.08)";

            } else {

                header.style.boxShadow =
                    "none";

            }

        }
    );

}


// ========================================
// MOBILE MENU
// ========================================

if (
    menuButton &&
    topNav
) {

    menuButton.addEventListener(
        "click",
        () => {

            if (
                topNav.style.display === "flex"
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
// CART COUNT
// ========================================

function updateCartCount() {

    if (!cartCount) {

        return;

    }


    let totalQuantity = 0;


    cart.forEach(
        item => {

            totalQuantity +=
                Number(item.quantity) || 1;

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
        JSON.stringify(cart)
    );


    updateCartCount();

}


// ========================================
// LOAD PRODUCTS
// ========================================

async function loadProducts() {

    if (!productGrid) {

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
    } = await supabaseClient

        .from("products")

        .select("*")

        .eq(
            "is_available",
            true
        )

        .order(
            "created_at",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(
            "Error loading products:",
            error
        );


        productGrid.innerHTML = `

            <p class="error">

                Failed to load products.

                <br><br>

                ${escapeHTML(
                    error.message
                )}

            </p>

        `;

        return;

    }


    products =
        data || [];


    displayProducts();

}


// ========================================
// DISPLAY PRODUCTS
// ========================================

function displayProducts() {

    if (!productGrid) {

        return;

    }


    const searchTerm =

        searchInput

            ? searchInput.value
                .toLowerCase()
                .trim()

            : "";


    const filteredProducts =

        products.filter(
            product => {


                const name =

                    (
                        product.name ||
                        ""
                    )
                    .toLowerCase();


                const category =

                    (
                        product.category ||
                        ""
                    )
                    .toLowerCase();


                const matchesSearch =

                    name.includes(
                        searchTerm
                    );


                const matchesCategory =

                    selectedCategory ===
                    "all"

                    ||

                    category ===

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
        filteredProducts.length === 0
    ) {

        productGrid.innerHTML =
            "";


        if (noResults) {

            noResults.style.display =
                "block";

        }

        return;

    }


    if (noResults) {

        noResults.style.display =
            "none";

    }


    productGrid.innerHTML =
        "";


    // ====================================
    // PRODUCT CARDS
    // ====================================

    filteredProducts.forEach(
        product => {


            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "product-card";


            const stock =
                Number(
                    product.stock
                ) || 0;


            const inStock =
                stock > 0;


            // =================================
            // IMAGE
            // =================================

            const imageHTML =

                product.image_url

                ?

                `

                    <img

                        src="${escapeHTML(
                            product.image_url
                        )}"

                        alt="${escapeHTML(
                            product.name
                        )}"

                        class="product-image"

                    >

                `

                :

                `

                    <div
                        class="product-image"
                    >

                        <span>
                            Product Image
                        </span>

                    </div>

                `;


            // =================================
            // STOCK
            // =================================

            const stockHTML =

                inStock

                ?

                `

                    <span class="stock">

                        In Stock

                    </span>

                `

                :

                `

                    <span class="stock">

                        Out of Stock

                    </span>

                `;


            // =================================
            // CARD HTML
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

                        >

                            Add to Cart

                        </button>


                        <button

                            class="buy-now"

                            type="button"

                        >

                            Buy Now

                        </button>


                    </div>


                </div>

            `;


            const addCartButton =

                card.querySelector(
                    ".add-cart"
                );


            const buyNowButton =

                card.querySelector(
                    ".buy-now"
                );


            // =================================
            // OUT OF STOCK
            // =================================

            if (!inStock) {

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


            productGrid.appendChild(
                card
            );

        }
    );

}


// ========================================
// ADD TO CART
// ========================================

function addToCart(product) {

    const stock =
        Number(
            product.stock
        ) || 0;


    if (stock <= 0) {

        alert(
            "This product is currently out of stock."
        );

        return;

    }


    // ====================================
    // FIND EXISTING ITEM
    // ====================================

    const existingItem =

        cart.find(
            item =>

                String(item.id) ===
                String(product.id)
        );


    // ====================================
    // EXISTING ITEM
    // ====================================

    if (existingItem) {


        const currentQuantity =

            Number(
                existingItem.quantity
            ) || 1;


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


    }

    // ====================================
    // NEW ITEM
    // ====================================

    else {


        cart.push({

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
                stock,

            image_url:
                product.image_url ||
                null

        });

    }


    // ====================================
    // SAVE TO LOCAL STORAGE
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

function buyNow(product) {

    const stock =
        Number(
            product.stock
        ) || 0;


    if (stock <= 0) {

        alert(
            "This product is currently out of stock."
        );

        return;

    }


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
                stock,

            image_url:
                product.image_url ||
                null

        }

    ];


    saveCart();


    window.location.href =
        "cart.html";

}


// ========================================
// SEARCH
// ========================================

if (searchInput) {

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


                categoryButtons.forEach(
                    btn => {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );


                this.classList.add(
                    "active"
                );


                selectedCategory =

                    this.dataset.category ||
                    "all";


                displayProducts();

            }
        );

    }
);


// ========================================
// CART BUTTON
// ========================================

if (cartButton) {

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
// ESCAPE HTML
// ========================================

function escapeHTML(value) {

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
        String(value);


    return div.innerHTML;

}


// ========================================
// YEAR
// ========================================

if (yearElement) {

    yearElement.textContent =

        new Date()
            .getFullYear();

}


// ========================================
// INITIALIZE
// ========================================

updateCartCount();

loadProducts();
