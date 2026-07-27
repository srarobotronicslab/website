/* =========================================
   CART CONFIGURATION
========================================= */

const DELIVERY_FEE = 100;


/* =========================================
   CART DATA
========================================= */

let cart = [];


/* =========================================
   DOM ELEMENTS
========================================= */

const emptyCart =
    document.getElementById("emptyCart");

const cartContent =
    document.getElementById("cartContent");

const cartItems =
    document.getElementById("cartItems");

const cartItemCount =
    document.getElementById("cartItemCount");

const cartSubtotal =
    document.getElementById("cartSubtotal");

const cartTotal =
    document.getElementById("cartTotal");

const checkoutBtn =
    document.getElementById("checkoutBtn");

const clearCartBtn =
    document.getElementById("clearCartBtn");

const yearElement =
    document.getElementById("year");


/* =========================================
   LOAD CART FROM LOCAL STORAGE
========================================= */

function loadCart() {

    try {

        const savedCart =
            localStorage.getItem("cart");

        cart =
            savedCart
                ? JSON.parse(savedCart)
                : [];

    }

    catch (error) {

        console.error(
            "Failed to load cart:",
            error
        );

        cart = [];

    }


    /*
       Make sure cart is actually an array
    */

    if (!Array.isArray(cart)) {

        cart = [];

    }


    /*
       Normalize old cart data

       This is important because your
       previous cart may have items like:

       {
           name: "...",
           price: 100
       }

       instead of:

       {
           name: "...",
           price: 100,
           quantity: 1,
           image_url: "..."
       }
    */

    cart = cart.map(item => {

        return {

            id:
                item.id ||
                item.product_id ||
                null,

            name:
                item.name ||
                "Unnamed Product",

            price:
                Number(item.price) || 0,

            quantity:
                Math.max(
                    1,
                    Number(item.quantity) || 1
                ),

            stock:
                Number(item.stock) > 0
                    ? Number(item.stock)
                    : 999999,

            image_url:
                item.image_url ||
                item.image ||
                ""

        };

    });


    /*
       Save normalized data
    */

    saveCart(false);


    /*
       Display cart
    */

    renderCart();

}


/* =========================================
   SAVE CART
========================================= */

function saveCart(
    shouldRender = true
) {

    localStorage.setItem(

        "cart",

        JSON.stringify(cart)

    );


    if (shouldRender) {

        renderCart();

    }

}


/* =========================================
   RENDER CART
========================================= */

function renderCart() {


    /*
       EMPTY CART
    */

    if (
        cart.length === 0
    ) {

        if (emptyCart) {

            emptyCart.style.display =
                "block";

        }


        if (cartContent) {

            cartContent.style.display =
                "none";

        }


        if (cartSubtotal) {

            cartSubtotal.textContent =
                "৳0";

        }


        if (cartTotal) {

            cartTotal.textContent =
                "৳0";

        }


        if (cartItemCount) {

            cartItemCount.textContent =
                "0 items";

        }


        if (checkoutBtn) {

            checkoutBtn.disabled =
                true;

        }


        return;

    }



    /*
       SHOW CART
    */

    if (emptyCart) {

        emptyCart.style.display =
            "none";

    }


    if (cartContent) {

        cartContent.style.display =
            "grid";

    }


    if (checkoutBtn) {

        checkoutBtn.disabled =
            false;

    }



    /*
       CALCULATE SUBTOTAL
    */

    let subtotal = 0;

    let totalQuantity = 0;


    cart.forEach(item => {

        const price =
            Number(item.price) || 0;

        const quantity =
            Number(item.quantity) || 1;


        subtotal +=
            price *
            quantity;


        totalQuantity +=
            quantity;

    });



    /*
       GRAND TOTAL
    */

    const grandTotal =

        subtotal +
        DELIVERY_FEE;



    /*
       UPDATE SUMMARY
    */

    if (cartSubtotal) {

        cartSubtotal.textContent =

            "৳" +
            subtotal.toFixed(0);

    }


    if (cartTotal) {

        cartTotal.textContent =

            "৳" +
            grandTotal.toFixed(0);

    }


    if (cartItemCount) {

        cartItemCount.textContent =

            totalQuantity +

            (
                totalQuantity === 1
                    ? " item"
                    : " items"
            );

    }



    /*
       CLEAR PREVIOUS ITEMS
    */

    if (!cartItems) {

        console.error(
            "cartItems element not found."
        );

        return;

    }


    cartItems.innerHTML =
        "";



    /*
       CREATE EACH CART ITEM
    */

    cart.forEach(
        (item, index) => {


            const price =
                Number(item.price) || 0;


            const quantity =
                Number(item.quantity) || 1;


            const itemTotal =

                price *
                quantity;



            /*
               CREATE ITEM
            */

            const itemElement =

                document.createElement(
                    "div"
                );


            itemElement.className =
                "cart-item";



            /*
               PRODUCT IMAGE
            */

            let imageHTML = "";


            if (
                item.image_url &&
                item.image_url.trim() !== ""
            ) {

                imageHTML = `

                    <img

                        src="${escapeHTML(
                            item.image_url
                        )}"

                        alt="${escapeHTML(
                            item.name
                        )}"

                        class="cart-item-image"

                        loading="lazy"

                    >

                `;

            }

            else {

                imageHTML = `

                    <div
                        class="cart-item-image-placeholder"
                    >

                        🤖

                    </div>

                `;

            }



            /*
               COMPLETE ITEM
            */

            itemElement.innerHTML = `

                ${imageHTML}


                <div
                    class="cart-item-info"
                >

                    <h3>

                        ${escapeHTML(
                            item.name
                        )}

                    </h3>


                    <p>

                        Unit Price:
                        ৳${price.toFixed(0)}

                    </p>

                </div>


                <div
                    class="cart-item-controls"
                >


                    <div
                        class="quantity-controls"
                    >


                        <button

                            type="button"

                            class="quantity-btn"

                            data-action="decrease"

                            data-index="${index}"

                        >

                            −

                        </button>


                        <span>

                            ${quantity}

                        </span>


                        <button

                            type="button"

                            class="quantity-btn"

                            data-action="increase"

                            data-index="${index}"

                        >

                            +

                        </button>


                    </div>


                    <strong
                        class="item-total"
                    >

                        ৳${itemTotal.toFixed(0)}

                    </strong>


                    <button

                        type="button"

                        class="remove-btn"

                        data-action="remove"

                        data-index="${index}"

                    >

                        Remove

                    </button>


                </div>

            `;


            cartItems.appendChild(
                itemElement
            );

        }

    );



    /*
       ADD BUTTON EVENTS
    */

    const actionButtons =

        cartItems.querySelectorAll(
            "[data-action]"
        );


    actionButtons.forEach(
        button => {

            button.addEventListener(

                "click",

                function () {


                    const action =

                        this.dataset.action;


                    const index =

                        Number(
                            this.dataset.index
                        );


                    if (
                        action ===
                        "increase"
                    ) {

                        increaseQuantity(
                            index
                        );

                    }


                    else if (
                        action ===
                        "decrease"
                    ) {

                        decreaseQuantity(
                            index
                        );

                    }


                    else if (
                        action ===
                        "remove"
                    ) {

                        removeFromCart(
                            index
                        );

                    }

                }

            );

        }

    );

}


/* =========================================
   INCREASE QUANTITY
========================================= */

function increaseQuantity(
    index
) {

    const item =
        cart[index];


    if (!item) {

        return;

    }


    const quantity =

        Number(
            item.quantity
        ) || 1;


    const stock =

        Number(
            item.stock
        ) || 999999;


    if (
        quantity >=
        stock
    ) {

        alert(

            "Only " +
            stock +
            " unit(s) available."

        );

        return;

    }


    item.quantity =
        quantity + 1;


    saveCart();

}


/* =========================================
   DECREASE QUANTITY
========================================= */

function decreaseQuantity(
    index
) {

    const item =
        cart[index];


    if (!item) {

        return;

    }


    const quantity =

        Number(
            item.quantity
        ) || 1;


    if (
        quantity <= 1
    ) {

        removeFromCart(
            index
        );

        return;

    }


    item.quantity =
        quantity - 1;


    saveCart();

}


/* =========================================
   REMOVE ITEM
========================================= */

function removeFromCart(
    index
) {

    if (
        !cart[index]
    ) {

        return;

    }


    cart.splice(
        index,
        1
    );


    saveCart();

}


/* =========================================
   CLEAR CART
========================================= */

if (clearCartBtn) {

    clearCartBtn.addEventListener(

        "click",

        function () {


            if (
                cart.length === 0
            ) {

                return;

            }


            const confirmed =

                confirm(

                    "Are you sure you want to clear your cart?"

                );


            if (
                !confirmed
            ) {

                return;

            }


            cart = [];


            saveCart();

        }

    );

}


/* =========================================
   CHECKOUT
========================================= */

if (checkoutBtn) {

    checkoutBtn.addEventListener(

        "click",

        function () {


            if (
                cart.length === 0
            ) {

                alert(
                    "Your cart is empty."
                );

                return;

            }


            /*
               Save latest cart
            */

            localStorage.setItem(

                "cart",

                JSON.stringify(
                    cart
                )

            );


            /*
               Go to checkout
            */

            window.location.href =
                "checkout.html";

        }

    );

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(
            value ||
            ""
        );


    return div.innerHTML;

}


/* =========================================
   YEAR
========================================= */

if (yearElement) {

    yearElement.textContent =

        new Date()
            .getFullYear();

}


/* =========================================
   START
========================================= */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        loadCart();

    }

);
