// ========================================
// SUPABASE CONFIGURATION
// ========================================

const SUPABASE_URL =
    "https://xzhpbisrzhgbeiptdkfd.supabase.co";

const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6aHBiaXNyemhnYmVpcHRka2ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NzE1NDcsImV4cCI6MjEwMDU0NzU0N30.oGwKzJG7CuBG_bCDIz7vn5UMVDVMDJBZPM8H1Rxt1iw";


// ========================================
// SUPABASE CLIENT
// ========================================

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


// ========================================
// CART
// ========================================

let cart = [];

try {

    const savedCart =
        localStorage.getItem("cart");

    const parsedCart =
        savedCart
            ? JSON.parse(savedCart)
            : [];

    cart =
        Array.isArray(parsedCart)
            ? parsedCart
            : [];

} catch (error) {

    console.error(
        "Failed to load cart:",
        error
    );

    cart = [];

}


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

                header.classList.add(
                    "scrolled"
                );

            } else {

                header.classList.remove(
                    "scrolled"
                );

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

            const isOpen =
                topNav.classList.contains(
                    "mobile-open"
                );


            if (isOpen) {

                topNav.classList.remove(
                    "mobile-open"
                );

            } else {

                topNav.classList.add(
                    "mobile-open"
                );

            }

        }
    );


    // Close menu after clicking a link

    topNav
        .querySelectorAll("a")
        .forEach(
            link => {

                link.addEventListener(
                    "click",
                    () => {

                        topNav.classList.remove(
                            "mobile-open"
                        );

                    }
                );

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

            const quantity =
                Number(
                    item.quantity
                );


            if (
                Number.isFinite(
                    quantity
                ) &&
                quantity > 0
            ) {

                totalQuantity +=
                    quantity;

            }

        }
    );


    cartCount.textContent =
        totalQuantity;

}


// ========================================
// SAVE CART
// ========================================

function saveCart() {

    try {

        localStorage.setItem(
            "cart",
            JSON.stringify(cart)
        );

    } catch (error) {

        console.error(
            "Failed to save cart:",
            error
        );

    }


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

        <div class="loading">

            Loading products...

        </div>

    `;


    try {

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

            throw error;

        }


        products =
            Array.isArray(data)
                ? data
                : [];


        displayProducts();

    } catch (error) {

        console.error(
            "Error loading products:",
            error
        );


        productGrid.innerHTML = `

            <div class="error">

                <h3>
                    Unable to load products
                </h3>

                <p>
                    ${escapeHTML(
                        error.message ||
                        "Something went wrong."
                    )}
                </p>

                <button
                    type="button"
                    onclick="loadProducts()"
                >
                    Try Again
                </button>

            </div>

        `;

    }

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

                    String(
                        product.name ||
                        ""
                    )
                    .toLowerCase();


                const description =

                    String(
                        product.description ||
                        ""
                    )
                    .toLowerCase();


                const category =

                    String(
                        product.category ||
                        "Other"
                    )
                    .toLowerCase();


                const matchesSearch =

                    name.includes(
                        searchTerm
                    )

                    ||

                    description.includes(
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
    // NO PRODUCTS
    // ====================================

    if (
        filteredProducts.length === 0
    ) {

        productGrid.innerHTML = "";

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


    productGrid.innerHTML = "";


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
            // PRODUCT DATA
            // =================================

            const productId =
                product.id;


            const productName =
                product.name ||
                "Unnamed Product";


            const productCategory =
                product.category ||
                "Other";


            const productDescription =
                product.description ||
                "No description available.";


            const price =
                Number(
                    product.price
                ) || 0;


            const stock =
                Number(
                    product.stock
                ) || 0;


            const imageURL =
                product.image_url ||
                "";


            const inStock =
                stock > 0;


            // =================================
            // IMAGE
            // =================================

            let imageHTML;


            if (imageURL) {

                imageHTML = `

                    <div class="product-image-wrapper">

                        <img

                            src="${escapeHTML(
                                imageURL
                            )}"

                            alt="${escapeHTML(
                                productName
                            )}"

                            class="product-image"

                            loading="lazy"

                            onerror="
                                this.style.display='none';
                                this.parentElement.classList.add('image-error');
                            "

                        >

                        <div class="image-placeholder">

                            Product Image

                        </div>

                    </div>

                `;

            } else {

                imageHTML = `

                    <div class="product-image-wrapper image-error">

                        <div class="image-placeholder">

                            Product Image

                        </div>

                    </div>

                `;

            }


            // =================================
            // STOCK
            // =================================

            const stockHTML =

                inStock

                ? `

                    <span class="stock in-stock">

                        In Stock

                    </span>

                `

                : `

                    <span class="stock out-of-stock">

                        Out of Stock

                    </span>

                `;


            // =================================
            // CARD HTML
            // =================================

            card.innerHTML = `

                ${imageHTML}


                <div class="product-info">


                    <span class="product-category">

                        ${escapeHTML(
                            productCategory
                        )}

                    </span>


                    <h3>

                        ${escapeHTML(
                            productName
                        )}

                    </h3>


                    <p class="product-description">

                        ${escapeHTML(
                            productDescription
                        )}

                    </p>


                    <div class="product-bottom">


                        <strong class="price">

                            ৳${price}

                        </strong>


                        ${stockHTML}


                    </div>


                    <div class="product-actions">


                        <button

                            class="add-cart"

                            type="button"

                            ${!inStock
                                ? "disabled"
                                : ""}

                        >

                            Add to Cart

                        </button>


                        <button

                            class="buy-now"

                            type="button"

                            ${!inStock
                                ? "disabled"
                                : ""}

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
            // ADD TO CART
            // =================================

            if (
                addCartButton &&
                inStock
            ) {

                addCartButton.addEventListener(
                    "click",
                    () => {

                        addToCart(
                            product
                        );

                    }
                );

            }


            // =================================
            // BUY NOW
            // =================================

            if (
                buyNowButton &&
                inStock
            ) {

                buyNowButton.addEventListener(
                    "click",
                    () => {

                        buyNow(
                            product
                        );

                    }
                );

            }


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


    if (
        stock <= 0
    ) {

        alert(
            "This product is currently out of stock."
        );

        return;

    }


    const productId =
        String(
            product.id
        );


    // ====================================
    // FIND EXISTING ITEM
    // ====================================

    const existingItem =

        cart.find(
            item =>

                String(
                    item.id
                ) ===
                productId
        );


    // ====================================
    // EXISTING ITEM
    // ====================================

    if (existingItem) {


        const currentQuantity =

            Number(
                existingItem.quantity
            ) || 0;


        if (
            currentQuantity >=
            stock
        ) {

            alert(

                `Only ${stock} unit(s) of this product are available.`

            );

            return;

        }


        existingItem.quantity =

            currentQuantity + 1;


        // Update stock in case
        // database stock changed

        existingItem.stock =
            stock;


        // Update latest image

        existingItem.image_url =
            product.image_url ||
            existingItem.image_url ||
            null;

    }


    // ====================================
    // NEW ITEM
    // ====================================

    else {

        cart.push({

            id:
                product.id,

            name:
                product.name ||
                "Unnamed Product",

            price:
                Number(
                    product.price
                ) || 0,

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
    // SAVE
    // ====================================

    saveCart();


    // ====================================
    // FEEDBACK
    // ====================================

    alert(

        `${product.name} has been added to your cart.`

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


    if (
        stock <= 0
    ) {

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
                product.name ||
                "Unnamed Product",

            price:
                Number(
                    product.price
                ) || 0,

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
        displayProducts
    );

}


// ========================================
// CATEGORY FILTER
// ========================================

categoryButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {


                categoryButtons.forEach(
                    btn => {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                selectedCategory =

                    button.dataset.category ||
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


            // Save latest cart
            saveCart();


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
