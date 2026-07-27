// ========================================
// SUPABASE CONFIGURATION
// ========================================

const SUPABASE_URL =
    "https://xzhpbisrzhgbeiptdkfd.supabase.co/";

const SUPABASE_ANON_KEY =
    "YOUR_SUPABASE_ANON_KEY";


const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


// ========================================
// CONFIGURATION
// ========================================

const DELIVERY_FEE = 100;

const BKASH_NUMBER =
    "01303614563";


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

const checkoutTotal =
    document.getElementById(
        "checkoutTotal"
    );

const paymentInstructions =
    document.getElementById(
        "paymentInstructions"
    );

const senderDigitsGroup =
    document.getElementById(
        "senderDigitsGroup"
    );

const senderLastTwo =
    document.getElementById(
        "senderLastTwo"
    );

const checkoutMessage =
    document.getElementById(
        "checkoutMessage"
    );

const placeOrderBtn =
    document.getElementById(
        "placeOrderBtn"
    );


// ========================================
// LOAD CART
// ========================================

let cart =
    JSON.parse(
        localStorage.getItem(
            "cart"
        ) || "[]"
    );


// ========================================
// CHECK CART
// ========================================

if (
    cart.length === 0
) {

    alert(
        "Your cart is empty."
    );

    window.location.href =
        "store.html";

}


// ========================================
// DISPLAY ORDER
// ========================================

function displayOrder() {


    checkoutItems.innerHTML =
        "";


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


            const itemSubtotal =
                price *
                quantity;


            subtotal +=
                itemSubtotal;


            const element =
                document.createElement(
                    "div"
                );


            element.className =
                "checkout-item";


            element.innerHTML = `

                <div>

                    <strong>
                        ${item.name}
                    </strong>

                    <small>
                        × ${quantity}
                    </small>

                </div>

                <strong>

                    ৳${itemSubtotal}

                </strong>

            `;


            checkoutItems.appendChild(
                element
            );

        }

    );


    checkoutSubtotal.textContent =
        "৳" + subtotal;


    checkoutTotal.textContent =
        "৳" +
        (
            subtotal +
            DELIVERY_FEE
        );

}


displayOrder();


// ========================================
// PAYMENT METHOD
// ========================================

const paymentMethods =
    document.querySelectorAll(
        'input[name="paymentMethod"]'
    );


paymentMethods.forEach(

    method => {


        method.addEventListener(

            "change",

            () => {


                const selected =
                    document.querySelector(
                        'input[name="paymentMethod"]:checked'
                    ).value;


                if (
                    selected ===
                    "COD"
                ) {


                    paymentInstructions.innerHTML = `

                        <h3>
                            Delivery Charge Payment
                        </h3>

                        <p>

                            For Cash on Delivery orders,
                            please pay the ৳100 delivery
                            charge in advance.

                        </p>

                        <div class="payment-number">

                            bKash:

                            <strong>
                                ${BKASH_NUMBER}
                            </strong>

                        </div>

                        <p>

                            Send ৳100 to the number above,
                            then enter the last 2 digits
                            of the sender's phone number.

                        </p>

                    `;


                    senderDigitsGroup.style.display =
                        "block";


                    senderLastTwo.required =
                        true;


                }

                else if (
                    selected ===
                    "bKash"
                ) {


                    paymentInstructions.innerHTML = `

                        <h3>
                            bKash Payment
                        </h3>

                        <p>

                            Please send the required
                            payment to:

                        </p>

                        <div class="payment-number">

                            bKash:

                            <strong>
                                ${BKASH_NUMBER}
                            </strong>

                        </div>

                        <p>

                            After sending the payment,
                            enter the last 2 digits
                            of the sender's phone number.

                        </p>

                    `;


                    senderDigitsGroup.style.display =
                        "block";


                    senderLastTwo.required =
                        true;

                }

                else {


                    paymentInstructions.innerHTML = `

                        <h3>
                            Nagad Payment
                        </h3>

                        <p>

                            Please send the required
                            payment to our Nagad number.

                        </p>

                        <p>

                            Nagad payment details
                            will be added soon.

                        </p>

                    `;


                    senderDigitsGroup.style.display =
                        "block";


                    senderLastTwo.required =
                        true;

                }

            }

        );

    }

);


// ========================================
// SUBMIT ORDER
// ========================================

checkoutForm.addEventListener(

    "submit",

    async event => {


        event.preventDefault();


        // =================================
        // CUSTOMER DETAILS
        // =================================

        const customerName =
            document.getElementById(
                "customerName"
            ).value.trim();


        const phone =
            document.getElementById(
                "customerPhone"
            ).value.trim();


        const address =
            document.getElementById(
                "customerAddress"
            ).value.trim();


        const paymentMethod =
            document.querySelector(
                'input[name="paymentMethod"]:checked'
            ).value;


        const lastTwo =
            senderLastTwo.value.trim();


        // =================================
        // VALIDATION
        // =================================

        if (
            lastTwo.length !== 2 ||
            !/^\d{2}$/.test(lastTwo)
        ) {

            checkoutMessage.textContent =
                "Please enter exactly the last 2 digits of the sender's phone number.";

            return;

        }


        // =================================
        // CALCULATE TOTAL
        // =================================

        let subtotal =
            0;


        cart.forEach(

            item => {

                subtotal +=

                    (
                        Number(
                            item.price
                        ) || 0
                    )

                    *

                    (
                        Number(
                            item.quantity
                        ) || 1
                    );

            }

        );


        const total =
            subtotal +
            DELIVERY_FEE;


        // =================================
        // DISABLE BUTTON
        // =================================

        placeOrderBtn.disabled =
            true;


        placeOrderBtn.textContent =
            "Placing Order...";


        checkoutMessage.textContent =
            "";


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

                        phone:
                            phone,

                        delivery_address:
                            address,

                        payment_method:
                            paymentMethod,

                        payment_status:
                            "submitted",

                        order_status:
                            "pending",

                        payment_sender_last_two:
                            lastTwo,

                        delivery_fee:
                            DELIVERY_FEE,

                        subtotal:
                            subtotal,

                        total_amount:
                            total

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

                        product_price:
                            Number(
                                item.price
                            ),

                        quantity:
                            Number(
                                item.quantity
                            ) || 1,

                        subtotal:

                            (
                                Number(
                                    item.price
                                )

                                *

                                (
                                    Number(
                                        item.quantity
                                    ) || 1
                                )
                            )

                    })

                );



            const {

                error:
                    itemError

            } =

                await supabaseClient

                    .from(
                        "order_items"
                    )

                    .insert(
                        orderItems
                    );



            if (
                itemError
            ) {

                throw itemError;

            }



            // =================================
            // SUCCESS
            // =================================

            localStorage.removeItem(
                "cart"
            );


            checkoutMessage.className =
                "checkout-message success";


            checkoutMessage.textContent =

                "Order placed successfully! " +

                "We will contact you shortly.";


            checkoutForm.reset();


            setTimeout(

                () => {

                    window.location.href =
                        "store.html";

                },

                3000

            );


        }

        catch (
            error
        ) {


            console.error(
                "Order error:",
                error
            );


            checkoutMessage.className =
                "checkout-message error";


            checkoutMessage.textContent =

                "Failed to place order: " +

                error.message;


            placeOrderBtn.disabled =
                false;


            placeOrderBtn.textContent =
                "Place Order";

        }


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
