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
        "Cart loading error:",
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
                price * quantity
            );

        },

        0

    );

}


// ========================================
// UPDATE PAYMENT INSTRUCTIONS
// ========================================

function updatePaymentInstructions() {

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

            <strong>
                Cash on Delivery
            </strong>

            <br><br>

            Please pay the delivery charge
            of

            <strong>
                ৳${deliveryFee}
            </strong>

            in advance to:

            <br><br>

            <strong>
                bKash / Payment:
                ${BKASH_NUMBER}
            </strong>

            <br><br>

            After sending the money,
            enter the last 2 digits of
            the phone number used for
            the payment below.

        `;

    }


    // ====================================
    // BKASH
    // ====================================

    else if (
        method === "bkash"
    ) {

        paymentInstructions.innerHTML = `

            <strong>
                bKash Payment
            </strong>

            <br><br>

            Please pay the full order amount
            of

            <strong>
                ৳${total}
            </strong>

            to:

            <br><br>

            <strong>
                bKash / Payment:
                ${BKASH_NUMBER}
            </strong>

            <br><br>

            After sending the money,
            enter the last 2 digits of
            the phone number used for
            the payment below.

        `;

    }


    // ====================================
    // NAGAD
    // ====================================

    else if (
        method === "nogod"
    ) {

        paymentInstructions.innerHTML = `

            <strong>
                Nagad Payment
            </strong>

            <br><br>

            Please pay the full order amount
            of

            <strong>
                ৳${total}
            </strong>

            to:

            <br><br>

            <strong>
                Nagad / Payment:
                ${NOGOD_NUMBER}
            </strong>

            <br><br>

            After sending the money,
            enter the last 2 digits of
            the phone number used for
            the payment below.

        `;

    }

}


// ========================================
// RENDER CART
// ========================================

function renderCheckoutCart() {

    if (
        cart.length === 0
    ) {

        checkoutItems.innerHTML = `

            <p>
                Your cart is empty.
            </p>

        `;

        placeOrderBtn.disabled =
            true;

        return;

    }


    let subtotal = 0;


    checkoutItems.innerHTML =
        "";


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


            const itemElement =
                document.createElement(
                    "div"
                );


            itemElement.className =
                "checkout-item";


            itemElement.innerHTML = `

                <div>

                    <div
                        class="checkout-item-name"
                    >

                        ${escapeHTML(
                            item.name
                        )}

                    </div>

                    <div
                        class="checkout-item-quantity"
                    >

                        Quantity:
                        ${quantity}

                    </div>

                </div>


                <div
                    class="checkout-item-price"
                >

                    ৳${itemTotal}

                </div>

            `;


            checkoutItems.appendChild(
                itemElement
            );

        }

    );


    const deliveryFee =
        getDeliveryFee();


    const total =
        subtotal +
        deliveryFee;


    checkoutSubtotal.textContent =
        "৳" + subtotal;


    checkoutDelivery.textContent =
        "৳" + deliveryFee;


    checkoutTotal.textContent =
        "৳" + total;


    updatePaymentInstructions();

}


// ========================================
// LOCATION CHANGE
// ========================================

document
    .querySelectorAll(
        'input[name="deliveryLocation"]'
    )
    .forEach(

        radio => {

            radio.addEventListener(
                "change",
                renderCheckoutCart
            );

        }

    );


// ========================================
// PAYMENT CHANGE
// ========================================

document
    .querySelectorAll(
        'input[name="paymentMethod"]'
    )
    .forEach(

        radio => {

            radio.addEventListener(

                "change",

                updatePaymentInstructions

            );

        }

    );


// ========================================
// SUBMIT ORDER
// ========================================

checkoutForm.addEventListener(

    "submit",

    async function(event) {

        event.preventDefault();


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
                .value
                .trim();


        const customerPhone =
            document
                .getElementById(
                    "customerPhone"
                )
                .value
                .trim();


        const customerAddress =
            document
                .getElementById(
                    "customerAddress"
                )
                .value
                .trim();


        const deliveryLocation =
            getDeliveryLocation();


        const paymentMethod =
            getPaymentMethod();


        const paymentLastTwoValue =
            paymentLastTwo
                .value
                .trim();


        // =================================
        // VALIDATION
        // =================================

        if (
            !/^[0-9]{11}$/.test(
                customerPhone
            )
        ) {

            showMessage(

                "Please enter a valid 11-digit phone number.",

                "error"

            );

            return;

        }


        if (
            !/^[0-9]{2}$/.test(
                paymentLastTwoValue
            )
        ) {

            showMessage(

                "Please enter exactly the last 2 digits of the payment phone number.",

                "error"

            );

            return;

        }


        // =================================
        // CALCULATE TOTAL
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

        placeOrderBtn.disabled =
            true;


        placeOrderBtn.textContent =
            "Placing Order...";


        clearMessage();


        try {


            // =================================
            // CREATE ORDER
            // =================================

            const {
                data: order,
                error: orderError
            } =

                await supabaseClient

                    .from(
                        "orders"
                    )

                    .insert({

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

                    })

                    .select()

                    .single();


            if (
                orderError
            ) {

                throw orderError;

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

                throw itemsError;

            }


            // =================================
            // SUCCESS
            // =================================

            localStorage.removeItem(
                "cart"
            );


            showMessage(

                "Order placed successfully! Your order ID is #" +
                order.id,

                "success"

            );


            checkoutForm.reset();


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
                "Order error:",
                error
            );


            showMessage(

                "Failed to place order: " +
                error.message,

                "error"

            );


            placeOrderBtn.disabled =
                false;


            placeOrderBtn.textContent =
                "Place Order";

        }

    }

);


// ========================================
// SHOW MESSAGE
// ========================================

function showMessage(
    message,
    type
) {

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
// YEAR
// ========================================

if (
    yearElement
) {

    yearElement.textContent =

        new Date()
            .getFullYear();

}


// ========================================
// START
// ========================================

renderCheckoutCart();
