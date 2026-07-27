// ========================================
// CART
// ========================================

let cart = JSON.parse(
    localStorage.getItem("cart") || "[]"
);


// ========================================
// ELEMENTS
// ========================================

const cartItems =
    document.getElementById("cartItems");

const cartTotal =
    document.getElementById("cartTotal");

const checkoutBtn =
    document.getElementById("checkoutBtn");


// ========================================
// LOAD CART
// ========================================

function loadCart() {

    // Reload latest cart from localStorage

    cart = JSON.parse(
        localStorage.getItem("cart") || "[]"
    );


    renderCart();

}


// ========================================
// RENDER CART
// ========================================

function renderCart() {

    if (!cartItems) {
        return;
    }


    // EMPTY CART

    if (
        cart.length === 0
    ) {

        cartItems.innerHTML = `

            <div class="empty-cart">

                <h3>
                    Your cart is empty
                </h3>

                <p>
                    Add some products from our store.
                </p>

                <a href="store.html">
                    Continue Shopping
                </a>

            </div>

        `;


        if (cartTotal) {

            cartTotal.textContent =
                "৳0";

        }


        if (checkoutBtn) {

            checkoutBtn.disabled =
                true;

        }


        return;

    }


    // ====================================
    // CART HAS ITEMS
    // ====================================

    let total = 0;


    cartItems.innerHTML = "";


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
                price * quantity;


            total +=
                itemTotal;


            const itemElement =
                document.createElement(
                    "div"
                );


            itemElement.className =
                "cart-item";


            itemElement.innerHTML = `

                <div class="cart-item-info">

                    <h3>

                        ${escapeHTML(
                            item.name
                        )}

                    </h3>

                    <p>

                        ৳${price} × ${quantity}

                    </p>

                </div>


                <div class="cart-item-controls">

                    <button
                        type="button"
                        onclick="decreaseQuantity(${index})"
                    >
                        −
                    </button>


                    <span>

                        ${quantity}

                    </span>


                    <button
                        type="button"
                        onclick="increaseQuantity(${index})"
                    >
                        +
                    </button>


                    <strong>

                        ৳${itemTotal}

                    </strong>


                    <button
                        type="button"
                        class="remove-btn"
                        onclick="removeFromCart(${index})"
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


    // ====================================
    // TOTAL
    // ====================================

    if (cartTotal) {

        cartTotal.textContent =
            "৳" + total;

    }


    // ====================================
    // ENABLE CHECKOUT
    // ====================================

    if (checkoutBtn) {

        checkoutBtn.disabled =
            false;

    }

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


    const stock =
        Number(
            item.stock
        ) || 999999;


    const currentQuantity =
        Number(
            item.quantity
        ) || 1;


    if (
        currentQuantity >=
        stock
    ) {

        alert(
            "You cannot add more than the available stock."
        );

        return;

    }


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


    if (
        currentQuantity <= 1
    ) {

        removeFromCart(
            index
        );

        return;

    }


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

    cart.splice(
        index,
        1
    );


    saveCart();

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


    renderCart();

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

            if (
                cart.length === 0
            ) {

                alert(
                    "Your cart is empty."
                );

                return;

            }


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

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(
            value || ""
        );


    return div.innerHTML;

}


// ========================================
// START
// ========================================

loadCart();
