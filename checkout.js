// ========================================
// SUPABASE CONFIGURATION
// ========================================

const SUPABASE_URL =
    "https://xzhpbisrzhgbeiptdkfd.supabase.co";

const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6aHBiaXNyemhnYmVpcHRka2ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NzE1NDcsImV4cCI6MjEwMDU0NzU0N30.oGwKzJG7CuBG_bCDIz7vn5UMVDVMDJBZPM8H1Rxt1iw";


// Create Supabase client
const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


// ========================================
// DELIVERY FEES
// ========================================

const INSIDE_DHAKA_FEE = 80;

const OUTSIDE_DHAKA_FEE = 150;


// ========================================
// PAYMENT NUMBERS
// ========================================

const BKASH_NUMBER =
    "01303614563";

const NOGOD_NUMBER =
    "01712108137";


// ========================================
// CART
// ========================================

let cart = [];

try {

    cart = JSON.parse(
        localStorage.getItem("cart") || "[]"
    );

} catch (error) {

    console.error(
        "Error loading cart:",
        error
    );

    cart = [];

}


if (!Array.isArray(cart)) {

    cart = [];

}


// ========================================
// ELEMENTS
// ========================================

const checkoutForm =
    document.getElementById(
        "checkoutForm"
    );

const checkoutItems =
    document.getElementById(
        "checkoutItems"
    );

const checkoutSubtotal =
    document.getElementById(
        "checkoutSubtotal"
    );

const checkoutDelivery =
    document.getElementById(
        "checkoutDelivery"
    );

const checkoutTotal =
    document.getElementById(
        "checkoutTotal"
    );

const paymentInstructions =
    document.getElementById(
        "paymentInstructions"
    );

const placeOrderBtn =
    document.getElementById(
        "placeOrderBtn"
    );

const checkoutMessage =
    document.getElementById(
        "checkoutMessage"
    );

const paymentLastTwo =
    document.getElementById(
        "paymentLastTwo"
    );

const yearElement =
    document.getElementById(
        "year"
    );


// ========================================
// GET DELIVERY LOCATION
// ========================================

function getDeliveryLocation() {

    const selected =
        document.querySelector(
            'input[name="deliveryLocation"]:checked'
        );

    return selected
        ? selected.value
        : "inside";

}


// ========================================
// GET PAYMENT METHOD
// ========================================

function getPaymentMethod() {

    const selected =
        document.querySelector(
            'input[name="paymentMethod"]:checked'
        );

    return selected
        ? selected.value
        : "cod";

}


// ========================================
// GET DELIVERY FEE
// ========================================

function getDeliveryFee() {

    const location =
        getDeliveryLocation();


    if (
        location === "outside"
    ) {

        return OUTSIDE_DHAKA_FEE;

    }


    return INSIDE_DHAKA_FEE;

}


// ========================================
// CALCULATE SUBTOTAL
// ========================================

function calculateSubtotal() {

    return cart.reduce(

        (total, item) => {

            const price =
                Number(
                    item.price
                ) || 0;


            const quantity =
                Number(
                    item.quantity
                ) || 1;


            return (
                total +
                (
                    price *
                    quantity
                )
            );

        },

        0

    );

}


// ========================================
// CALCULATE TOTAL
// ========================================

function calculateTotal() {

    const subtotal =
        calculateSubtotal();


    const deliveryFee =
        getDeliveryFee();


    return (
        subtotal +
        deliveryFee
    );

}


// ========================================
// UPDATE PAYMENT INSTRUCTIONS
// ========================================

function updatePaymentInstructions() {

    if (!paymentInstructions) {

        return;

    }


    const method =
        getPaymentMethod();


    const deliveryFee =
        getDeliveryFee();


    const subtotal =
        calculateSubtotal();


    const total =
        subtotal +
        deliveryFee;


    // ====================================
    // COD
    // ====================================

    if (
        method === "cod"
    ) {

        paymentInstructions.innerHTML = `

            <div class="payment-instruction-content">

                <h3>
                    Cash on Delivery
                </h3>

                <p>
                    Pay only the delivery charge
                    in advance.
                </p>

                <div class="payment-amount">

                    Delivery Charge:
                    <strong>
                        ৳${deliveryFee}
                    </strong>

                </div>

                <p>
                    Send the delivery charge to:
                </p>

                <div class="payment-number">

                    bKash:
                    <strong>
                        ${BKASH_NUMBER}
                    </strong>

                </div>

                <p>
                    After completing the payment,
                    enter the last 2 digits of your
                    transaction ID below.
                </p>

            </div>

        `;

    }


    // ====================================
    // BKASH
    // ====================================

    else if (
        method === "bkash"
    ) {

        paymentInstructions.innerHTML = `

            <div class="payment-instruction-content">

                <h3>
                    bKash Payment
                </h3>

                <p>
                    Please pay the full order amount.
                </p>

                <div class="payment-amount">

                    Total Amount:
                    <strong>
                        ৳${total}
                    </strong>

                </div>

                <p>
                    Send the payment to:
                </p>

                <div class="payment-number">

                    bKash:
                    <strong>
                        ${BKASH_NUMBER}
                    </strong>

                </div>

                <p>
                    After completing the payment,
                    enter the last 2 digits of your
                    transaction ID below.
                </p>

            </div>

        `;

    }


    // ====================================
    // NAGAD
    // ====================================

    else if (
        method === "nogod"
    ) {

        paymentInstructions.innerHTML = `

            <div class="payment-instruction-content">

                <h3>
                    Nagad Payment
                </h3>

                <p>
                    Please pay the full order amount.
                </p>

                <div class="payment-amount">

                    Total Amount:
                    <strong>
                        ৳${total}
                    </strong>

                </div>

                <p>
                    Send the payment to:
                </p>

                <div class="payment-number">

                    Nagad:
                    <strong>
                        ${NOGOD_NUMBER}
                    </strong>

                </div>

                <p>
                    After completing the payment,
                    enter the last 2 digits of your
                    transaction ID below.
                </p>

            </div>

        `;

    }

}


// ========================================
// RENDER CHECKOUT CART
// ========================================

function renderCheckoutCart() {

    // ====================================
    // EMPTY CART
    // ====================================

    if (
        cart.length === 0
    ) {

        if (checkoutItems) {

            checkoutItems.innerHTML = `

                <div class="empty-checkout">

                    <h3>
                        Your cart is empty
                    </h3>

                    <p>
                        Please add products before
                        proceeding to checkout.
                    </p>

                    <a
                        href="store.html"
                        class="back-store-btn"
                    >
                        Browse Store
                    </a>

                </div>

            `;

        }


        if (placeOrderBtn) {

            placeOrderBtn.disabled =
                true;

        }


        if (checkoutSubtotal) {

            checkoutSubtotal.textContent =
                "৳0";

        }


        if (checkoutDelivery) {

            checkoutDelivery.textContent =
                "৳0";

        }


        if (checkoutTotal) {

            checkoutTotal.textContent =
                "৳0";

        }


        return;

    }


    // ====================================
    // CART HAS ITEMS
    // ====================================

    if (placeOrderBtn) {

        placeOrderBtn.disabled =
            false;

    }


    let subtotal = 0;


    if (checkoutItems) {

        checkoutItems.innerHTML =
            "";

    }


    // ====================================
    // DISPLAY ITEMS
    // ====================================

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


            const itemTotal =
                price *
                quantity;


            subtotal +=
                itemTotal;


            if (!checkoutItems) {

                return;

            }


            const itemElement =
                document.createElement(
                    "div"
                );


            itemElement.className =
                "checkout-item";


            itemElement.innerHTML = `

                <div
                    class="checkout-item-info"
                >

                    <h3>

                        ${escapeHTML(
                            item.name
                        )}

                    </h3>

                    <p>

                        ৳${price}
                        ×
                        ${quantity}

                    </p>

                </div>


                <strong
                    class="checkout-item-price"
                >

                    ৳${itemTotal}

                </strong>

            `;


            checkoutItems.appendChild(
                itemElement
            );

        }

    );


    // ====================================
    // DELIVERY
    // ====================================

    const deliveryFee =
        getDeliveryFee();


    // ====================================
    // GRAND TOTAL
    // ====================================

    const total =
        subtotal +
        deliveryFee;


    // ====================================
    // UPDATE SUMMARY
    // ====================================

    if (checkoutSubtotal) {

        checkoutSubtotal.textContent =
            "৳" + subtotal;

    }


    if (checkoutDelivery) {

        checkoutDelivery.textContent =
            "৳" + deliveryFee;

    }


    if (checkoutTotal) {

        checkoutTotal.textContent =
            "৳" + total;

    }


    // ====================================
    // PAYMENT INSTRUCTIONS
    // ====================================

    updatePaymentInstructions();

}


// ========================================
// DELIVERY LOCATION CHANGE
// ========================================

document
    .querySelectorAll(
        'input[name="deliveryLocation"]'
    )
    .forEach(

        radio => {

            radio.addEventListener(

                "change",

                () => {

                    renderCheckoutCart();

                }

            );

        }

    );


// ========================================
// PAYMENT METHOD CHANGE
// ========================================

document
    .querySelectorAll(
        'input[name="paymentMethod"]'
    )
    .forEach(

        radio => {

            radio.addEventListener(

                "change",

                () => {

                    updatePaymentInstructions();

                }

            );

        }

    );


// ========================================
// SUBMIT ORDER
// ========================================

if (checkoutForm) {

    checkoutForm.addEventListener(

        "submit",

        async function(event) {

            event.preventDefault();


            // =================================
            // CHECK CART
            // =================================

            if (
                cart.length === 0
            ) {

                showMessage(

                    "Your cart is empty.",

                    "error"

                );

                return;

            }


            // =================================
            // CUSTOMER INFORMATION
            // =================================

            const customerName =
                document
                    .getElementById(
                        "customerName"
                    )
                    ?.value
                    .trim();


            const customerPhone =
                document
                    .getElementById(
                        "customerPhone"
                    )
                    ?.value
                    .trim();


            const customerAddress =
                document
                    .getElementById(
                        "customerAddress"
                    )
                    ?.value
                    .trim();


            const deliveryLocation =
                getDeliveryLocation();


            const paymentMethod =
                getPaymentMethod();


            const paymentLastTwoValue =
                paymentLastTwo
                    ?.value
                    .trim();


            // =================================
            // VALIDATION
            // =================================

            if (
                !customerName
            ) {

                showMessage(

                    "Please enter your name.",

                    "error"

                );

                return;

            }


            if (
                !customerPhone
            ) {

                showMessage(

                    "Please enter your phone number.",

                    "error"

                );

                return;

            }


            if (
                !/^[0-9]{11}$/.test(
                    customerPhone
                )
            ) {

                showMessage(

                    "Please enter a valid 11-digit Bangladeshi phone number.",

                    "error"

                );

                return;

            }


            if (
                !customerAddress
            ) {

                showMessage(

                    "Please enter your delivery address.",

                    "error"

                );

                return;

            }


            if (
                !/^[0-9]{2}$/.test(
                    paymentLastTwoValue || ""
                )
            ) {

                showMessage(

                    "Please enter exactly 2 digits of your transaction ID.",

                    "error"

                );

                return;

            }


            // =================================
            // CALCULATE ORDER
            // =================================

            const subtotal =
                calculateSubtotal();


            const deliveryFee =
                getDeliveryFee();


            const total =
                subtotal +
                deliveryFee;


            // =================================
            // DISABLE BUTTON
            // =================================

            if (placeOrderBtn) {

                placeOrderBtn.disabled =
                    true;

                placeOrderBtn.textContent =
                    "Placing Order...";

            }


            clearMessage();


            try {

                // =================================
                // CREATE ORDER
                // =================================

                const orderData = {

                    customer_name:
                        customerName,

                    customer_phone:
                        customerPhone,

                    address:
                        customerAddress,

                    delivery_location:
                        deliveryLocation,

                    payment_method:
                        paymentMethod,

                    payment_last_two:
                        paymentLastTwoValue,

                    subtotal:
                        subtotal,

                    delivery_fee:
                        deliveryFee,

                    total_amount:
                        total,

                    payment_status:
                        "pending",

                    order_status:
                        "pending"

                };


                console.log(
                    "Submitting order:",
                    orderData
                );


                const {

                    data: order,

                    error: orderError

                } =

                    await supabaseClient

                        .from(
                            "orders"
                        )

                        .insert(
                            [orderData]
                        )

                        .select()

                        .single();


                if (
                    orderError
                ) {

                    console.error(
                        "Order insert error:",
                        orderError
                    );

                    throw new Error(
                        orderError.message
                    );

                }


                if (
                    !order ||
                    !order.id
                ) {

                    throw new Error(
                        "Order was created but no order ID was returned."
                    );

                }


                // =================================
                // CREATE ORDER ITEMS
                // =================================

                const orderItems =

                    cart.map(

                        item => ({

                            order_id:
                                order.id,

                            product_id:
                                item.id,

                            product_name:
                                item.name,

                            price:
                                Number(
                                    item.price
                                ) || 0,

                            quantity:
                                Number(
                                    item.quantity
                                ) || 1

                        })

                    );


                const {

                    error: itemsError

                } =

                    await supabaseClient

                        .from(
                            "order_items"
                        )

                        .insert(
                            orderItems
                        );


                if (
                    itemsError
                ) {

                    console.error(
                        "Order items error:",
                        itemsError
                    );

                    throw new Error(
                        itemsError.message
                    );

                }


                // =================================
                // SUCCESS
                // =================================

                localStorage.removeItem(
                    "cart"
                );


                cart = [];


                showMessage(

                    "Order placed successfully! Order ID: #" +
                    order.id,

                    "success"

                );


                if (placeOrderBtn) {

                    placeOrderBtn.textContent =
                        "Order Placed ✓";

                }


                // =================================
                // REDIRECT
                // =================================

                setTimeout(

                    () => {

                        window.location.href =
                            "store.html";

                    },

                    3000

                );

            }


            catch (error) {

                console.error(
                    "Complete order error:",
                    error
                );


                showMessage(

                    "Failed to place order: " +
                    error.message,

                    "error"

                );


                if (placeOrderBtn) {

                    placeOrderBtn.disabled =
                        false;

                    placeOrderBtn.textContent =
                        "Place Order";

                }

            }

        }

    );

}


// ========================================
// SHOW MESSAGE
// ========================================

function showMessage(
    message,
    type
) {

    if (!checkoutMessage) {

        alert(
            message
        );

        return;

    }


    checkoutMessage.textContent =
        message;


    checkoutMessage.className =

        "checkout-message " +
        type;

}


// ========================================
// CLEAR MESSAGE
// ========================================

function clearMessage() {

    if (!checkoutMessage) {

        return;

    }


    checkoutMessage.textContent =
        "";

    checkoutMessage.className =
        "checkout-message";

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

renderCheckoutCart();
