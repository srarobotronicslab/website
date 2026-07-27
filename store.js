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

let cart = [];



// ========================================
// PRODUCTS
// ========================================

let products = [];

let selectedCategory = "all";



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



// ========================================
// LOAD PRODUCTS FROM SUPABASE
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
    } =

        await supabaseClient
            .from("products")
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



    // ====================================
    // SAVE PRODUCTS
    // ====================================

    products =
        data || [];



    // ====================================
    // DISPLAY
    // ====================================

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



    // ====================================
    // FILTER PRODUCTS
    // ====================================

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

                    product.category
                        .toLowerCase()
                        ===
                        selectedCategory
                            .toLowerCase();



                return (

                    matchesSearch

                    &&

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

        productGrid.innerHTML =
            "";

        noResults.style.display =
            "block";

        return;

    }



    noResults.style.display =
        "none";



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



            // IMAGE

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



            // STOCK

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



            // PRODUCT CARD

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

                            onclick="
                                addToCart(
                                    '${escapeQuotes(product.name)}',
                                    ${product.price}
                                )
                            "

                            ${
                                product.stock <= 0
                                    ? "disabled"
                                    : ""
                            }

                        >

                            Add to Cart

                        </button>


                        <button

                            class="buy-now"

                            onclick="
                                buyNow(
                                    '${escapeQuotes(product.name)}',
                                    ${product.price}
                                )
                            "

                            ${
                                product.stock <= 0
                                    ? "disabled"
                                    : ""
                            }

                        >

                            Buy Now

                        </button>


                    </div>


                </div>

            `;



            productGrid.appendChild(
                card
            );

        }

    );

}



// ========================================
// ESCAPE QUOTES
// ========================================

function escapeQuotes(
    text
) {

    return text
        .replace(
            /'/g,
            "\\'"
        )
        .replace(
            /"/g,
            "&quot;"
        );

}



// ========================================
// ADD TO CART
// ========================================

function addToCart(
    name,
    price
) {


    cart.push({

        name:
            name,

        price:
            price

    });


    updateCart();


    alert(

        name +

        " has been added to your cart."

    );

}



// ========================================
// UPDATE CART
// ========================================

function updateCart() {


    const cartCount =
        document.getElementById(
            "cartCount"
        );


    const cartItems =
        document.getElementById(
            "cartItems"
        );


    const cartTotal =
        document.getElementById(
            "cartTotal"
        );



    cartCount.textContent =
        cart.length;



    // EMPTY CART

    if (
        cart.length === 0
    ) {


        cartItems.innerHTML =

            `

            <p class="empty-cart">

                Your cart is empty.

            </p>

            `;


        cartTotal.textContent =
            "৳0";


        return;

    }



    // CALCULATE TOTAL

    let total =
        0;



    cartItems.innerHTML =
        "";



    cart.forEach(

        (
            item,
            index
        ) => {


            total +=
                Number(
                    item.price
                );



            const itemElement =
                document.createElement(
                    "div"
                );



            itemElement.innerHTML = `

                <div style="

                    display:flex;

                    justify-content:
                        space-between;

                    align-items:
                        center;

                    padding:
                        15px 0;

                    border-bottom:
                        1px solid #dededb;

                ">


                    <span>

                        ${item.name}

                    </span>


                    <strong>

                        ৳${item.price}

                    </strong>


                </div>

            `;



            cartItems.appendChild(
                itemElement
            );

        }

    );



    cartTotal.textContent =
        "৳" + total;

}



// ========================================
// BUY NOW
// ========================================

function buyNow(
    name,
    price
) {


    alert(

        "Buy Now selected:\n\n" +

        name +

        "\nPrice: ৳" +

        price +

        "\n\nCheckout will be connected later."

    );

}



// ========================================
// SEARCH
// ========================================

searchInput.addEventListener(

    "input",

    () => {

        displayProducts();

    }

);



// ========================================
// CATEGORY FILTER
// ========================================

categoryButtons.forEach(

    button => {


        button.addEventListener(

            "click",

            function () {


                // REMOVE ACTIVE

                categoryButtons.forEach(

                    btn => {

                        btn.classList.remove(
                            "active"
                        );

                    }

                );



                // ADD ACTIVE

                this.classList.add(
                    "active"
                );



                // SAVE CATEGORY

                selectedCategory =
                    this.dataset.category;



                // DISPLAY

                displayProducts();

            }

        );

    }

);



// ========================================
// YEAR
// ========================================

document.getElementById(
    "year"
).textContent =

    new Date()
        .getFullYear();



// ========================================
// START
// ========================================

loadProducts();
