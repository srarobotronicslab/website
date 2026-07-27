// ========================================
// SUPABASE CONFIGURATION
// ========================================

const SUPABASE_URL =
    "https://xzhpbisrzhgbeiptdkfd.supabase.co/";

const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsImVxIjoieHphaHBpc3J6aGdiZWlwdGRrZmQiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc4NDk3MTU0NywiZXhwIjoyMTAwNTQ3NTQ3fQ.oGwKzJG7CuBG_bCDIz7vn5UMVDVMDJBZPM8H1Rxt1iw";


const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


// ========================================
// VARIABLES
// ========================================

let products = [];

let selectedCategory = "all";


// ========================================
// ELEMENTS
// ========================================

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


// ========================================
// CHECK USER
// ========================================

async function getCurrentUser() {

    const {
        data: { user },
        error
    } = await supabaseClient.auth.getUser();

    if (error) {

        console.error(
            "User check error:",
            error
        );

        return null;

    }

    return user;

}


// ========================================
// LOAD CART COUNT
// ========================================

async function loadCartCount() {

    const user =
        await getCurrentUser();


    // User is not logged in

    if (!user) {

        if (cartCount) {

            cartCount.textContent = "0";

        }

        return;

    }


    const {
        count,
        error
    } = await supabaseClient
        .from("cart_items")
        .select(
            "id",
            {
                count: "exact",
                head: true
            }
        )
        .eq(
            "user_id",
            user.id
        );


    if (error) {

        console.error(
            "Cart count error:",
            error
        );

        return;

    }


    if (cartCount) {

        cartCount.textContent =
            count || 0;

    }

}


// ========================================
// LOAD PRODUCTS
// ========================================

async function loadProducts() {

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

                <br>

                ${error.message}

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

    const searchTerm =

        searchInput.value
            .toLowerCase()
            .trim();


    const filteredProducts =

        products.filter(

            product => {

                const matchesSearch =

                    product.name
                        .toLowerCase()
                        .includes(
                            searchTerm
                        );


                const matchesCategory =

                    selectedCategory ===
                    "all"

                    ||

                    (
                        product.category &&
                        product.category
                            .toLowerCase()
                            ===
                        selectedCategory
                            .toLowerCase()
                    );


                return (

                    matchesSearch

                    &&

                    matchesCategory

                );

            }

        );


    if (
        filteredProducts.length === 0
    ) {

        productGrid.innerHTML =
            "";

        noResults.style.display =
            "block";

        return;

    }


    noResults.style.display =
        "none";


    productGrid.innerHTML =
        "";


    filteredProducts.forEach(

        product => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "product-card";


            // =================================
            // IMAGE
            // =================================

            const imageHTML =

                product.image_url

                ?

                `

                <img

                    src="${product.image_url}"

                    alt="${product.name}"

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

                product.stock > 0

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
            // CARD
            // =================================

            card.innerHTML = `

                ${imageHTML}


                <div
                    class="product-info"
                >


                    <span
                        class="product-category"
                    >

                        ${
                            product.category ||
                            "Other"
                        }

                    </span>


                    <h3>

                        ${product.name}

                    </h3>


                    <p
                        class="product-description"
                    >

                        ${
                            product.description ||
                            "No description available."
                        }

                    </p>


                    <div
                        class="product-bottom"
                    >

                        <strong
                            class="price"
                        >

                            ৳${product.price}

                        </strong>


                        ${stockHTML}

                    </div>


                    <div
                        class="product-actions"
                    >


                        <button

                            class="add-cart"

                            data-product-id="${product.id}"

                        >

                            Add to Cart

                        </button>


                        <button

                            class="buy-now"

                            data-product-id="${product.id}"

                        >

                            Buy Now

                        </button>


                    </div>


                </div>

            `;


            // =================================
            // ADD TO CART EVENT
            // =================================

            const addButton =
                card.querySelector(
                    ".add-cart"
                );


            addButton.addEventListener(

                "click",

                () => {

                    addToCart(
                        product
                    );

                }

            );


            // =================================
            // BUY NOW EVENT
            // =================================

            const buyButton =
                card.querySelector(
                    ".buy-now"
                );


            buyButton.addEventListener(

                "click",

                () => {

                    buyNow(
                        product
                    );

                }

            );


            // =================================
            // DISABLE IF OUT OF STOCK
            // =================================

            if (
                product.stock <= 0
            ) {

                addButton.disabled =
                    true;

                buyButton.disabled =
                    true;

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

async function addToCart(
    product
) {


    // ------------------------------------
    // CHECK LOGIN
    // ------------------------------------

    const user =
        await getCurrentUser();


    if (!user) {

        alert(

            "Please log in or create an account before adding products to your cart."

        );

        return;

    }


    // ------------------------------------
    // CHECK EXISTING CART ITEM
    // ------------------------------------

    const {
        data: existingItem,
        error: checkError
    } = await supabaseClient
        .from("cart_items")
        .select("*")
        .eq(
            "user_id",
            user.id
        )
        .eq(
            "product_id",
            product.id
        )
        .maybeSingle();


    if (checkError) {

        console.error(
            "Cart check error:",
            checkError
        );


        alert(

            "Could not check your cart:\n" +

            checkError.message

        );

        return;

    }


    // ------------------------------------
    // PRODUCT ALREADY IN CART
    // ------------------------------------

    if (existingItem) {


        const newQuantity =

            existingItem.quantity + 1;


        // Don't exceed stock

        if (
            newQuantity >
            product.stock
        ) {

            alert(

                "You cannot add more than the available stock."

            );

            return;

        }


        const {
            error: updateError
        } = await supabaseClient
            .from("cart_items")
            .update({

                quantity:
                    newQuantity

            })
            .eq(
                "id",
                existingItem.id
            );


        if (updateError) {

            alert(

                "Failed to update cart:\n" +

                updateError.message

            );

            return;

        }

    }


    // ------------------------------------
    // NEW CART ITEM
    // ------------------------------------

    else {


        const {
            error: insertError
        } = await supabaseClient
            .from("cart_items")
            .insert({

                user_id:
                    user.id,

                product_id:
                    product.id,

                quantity:
                    1

            });


        if (insertError) {

            alert(

                "Failed to add product to cart:\n" +

                insertError.message

            );

            return;

        }

    }


    // ------------------------------------
    // UPDATE CART COUNT
    // ------------------------------------

    await loadCartCount();


    alert(

        product.name +

        " has been added to your cart."

    );

}


// ========================================
// BUY NOW
// ========================================

async function buyNow(
    product
) {


    const user =
        await getCurrentUser();


    if (!user) {

        alert(

            "Please log in or create an account before purchasing."

        );

        return;

    }


    // For now we save a temporary Buy Now
    // item in localStorage.

    const buyNowProduct = {

        product_id:
            product.id,

        name:
            product.name,

        price:
            product.price,

        image_url:
            product.image_url,

        quantity:
            1

    };


    localStorage.setItem(

        "buyNowProduct",

        JSON.stringify(
            buyNowProduct
        )

    );


    // Redirect to checkout later

    window.location.href =
        "checkout.html";

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
                    this.dataset.category;


                displayProducts();

            }

        );

    }

);


// ========================================
// YEAR
// ========================================

const yearElement =
    document.getElementById(
        "year"
    );


if (yearElement) {

    yearElement.textContent =

        new Date()
            .getFullYear();

}


// ========================================
// START
// ========================================

loadProducts();

loadCartCount();
