// ========================================
// CART
// ========================================

let cart = JSON.parse(
    localStorage.getItem("cart") || "[]"
);


// ========================================
// DELIVERY FEE
// ========================================

const DELIVERY_FEE = 100;


// ========================================
// ELEMENTS
// ========================================

const cartItems =
    document.getElementById("cartItems");

const cartSubtotal =
    document.getElementById("cartSubtotal");

const cartTotal =
    document.getElementById("cartTotal");

const checkoutBtn =
    document.getElementById("checkoutBtn");

const clearCartBtn =
    document.getElementById("clearCartBtn");

const emptyCart =
    document.getElementById("emptyCart");

const cartContent =
    document.getElementById("cartContent");


// ========================================
// LOAD CART
// ========================================

function loadCart() {

    try {

        cart = JSON.parse(
            localStorage.getItem("cart") || "[]"
        );

    } catch (error) {

        console.error(
            "Failed to load cart:",
            error
        );

        cart = [];

    }


    renderCart();

}


// ========================================
// SAVE CART
// ========================================

function saveCart() {

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );


    renderCart();

}


// ========================================
// RENDER CART
// ========================================

function renderCart() {

    // ====================================
    // CHECK EMPTY CART
    // ====================================

    if (
        cart.length === 0
    ) {

        // Show empty cart section

        if (emptyCart) {

            emptyCart.style.display =
                "block";

        }


        // Hide cart content

        if (cartContent) {

            cartContent.style.display =
                "none";

        }


        // Disable checkout

        if (checkoutBtn) {

            checkoutBtn.disabled =
                true;

        }


        return;

    }


    // ====================================
    // SHOW CART
    // ====================================

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


    // ====================================
    // CALCULATE SUBTOTAL
    // ====================================

    let subtotal = 0;


    cart.forEach(

        item => {

            const price =
                Number(
                    item.price
                ) || 0;


            const quantity =
                Number(
                    item.quantity
                ) || 1;


            subtotal +=
                price * quantity;

        }

    );


    // ====================================
    // GRAND TOTAL
    // ====================================

    const grandTotal =
        subtotal +
        DELIVERY_FEE;


    // ====================================
    // UPDATE SUBTOTAL
    // ====================================

    if (cartSubtotal) {

        cartSubtotal.textContent =
            "৳" + subtotal;

    }


    // ====================================
    // UPDATE TOTAL
    // ====================================

    if (cartTotal) {

        cartTotal.textContent =
            "৳" + grandTotal;

    }


    // ====================================
    // CLEAR OLD ITEMS
    // ====================================

    if (!cartItems) {

        return;

    }


    cartItems.innerHTML = "";


    // ====================================
    // DISPLAY CART ITEMS
    // ====================================

    cart.forEach(

        (item, index) => {


            const price =
                Number(
                    item.price
                ) || 0;


            const quantity =
                Number(
                    item.quantity
                ) || 1;


            const itemTotal =
                price *
                quantity;


            // =================================
            // CREATE ITEM
            // =================================

            const itemElement =
                document.createElement(
                    "div"
                );


            itemElement.className =
                "cart-item";


            // =================================
            // IMAGE
            // =================================

            let imageHTML = "";


            if (
                item.image_url
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

                    >

                `;

            }


            // =================================
            // ITEM HTML
            // =================================

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
                        ৳${price}

                    </p>


                    <p>

                        Quantity:
                        ${quantity}

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


                    <strong>

                        ৳${itemTotal}

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


            // =================================
            // ADD TO CART ITEMS
            // =================================

            cartItems.appendChild(
                itemElement
            );

        }

    );


    // ====================================
    // ADD BUTTON EVENTS
    // ====================================

    const actionButtons =

        cartItems.querySelectorAll(
            "[data-action]"
        );


    actionButtons.forEach(

        button => {


            button.addEventListener(

                "click",

                () => {


                    const action =
                        button.dataset.action;


                    const index =
                        Number(
                            button.dataset.index
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


// ========================================
// INCREASE QUANTITY
// ========================================

function increaseQuantity(
    index
) {


    const item =
        cart[index];


    if (!item) {

        return;

    }


    const currentQuantity =
        Number(
            item.quantity
        ) || 1;


    const stock =
        Number(
            item.stock
        ) || 999999;


    // ====================================
    // STOCK CHECK
    // ====================================

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


    // ====================================
    // INCREASE
    // ====================================

    item.quantity =
        currentQuantity + 1;


    saveCart();

}


// ========================================
// DECREASE QUANTITY
// ========================================

function decreaseQuantity(
    index
) {


    const item =
        cart[index];


    if (!item) {

        return;

    }


    const currentQuantity =
        Number(
            item.quantity
        ) || 1;


    // ====================================
    // REMOVE IF ONE
    // ====================================

    if (
        currentQuantity <= 1
    ) {

        removeFromCart(
            index
        );

        return;

    }


    // ====================================
    // DECREASE
    // ====================================

    item.quantity =
        currentQuantity - 1;


    saveCart();

}


// ========================================
// REMOVE ITEM
// ========================================

function removeFromCart(
    index
) {


    if (
        !cart[index]
    ) {

        return;

    }


    const itemName =
        cart[index].name;


    const confirmed =
        confirm(

            "Remove " +

            itemName +

            " from your cart?"

        );


    if (
        !confirmed
    ) {

        return;

    }


    cart.splice(
        index,
        1
    );


    saveCart();

}


// ========================================
// CLEAR CART
// ========================================

if (
    clearCartBtn
) {

    clearCartBtn.addEventListener(

        "click",

        () => {


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


// ========================================
// CHECKOUT
// ========================================

if (
    checkoutBtn
) {


    checkoutBtn.addEventListener(

        "click",

        () => {


            // =================================
            // CHECK EMPTY
            // =================================

            if (
                cart.length === 0
            ) {

                alert(

                    "Your cart is empty."

                );

                return;

            }


            // =================================
            // SAVE CART AGAIN
            // =================================

            localStorage.setItem(

                "cart",

                JSON.stringify(
                    cart
                )

            );


            // =================================
            // GO TO CHECKOUT
            // =================================

            window.location.href =
                "checkout.html";

        }

    );

}


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
        new Date().getFullYear();

}


// ========================================
// START
// ========================================

loadCart();
