// ========================================
// SUPABASE CONFIGURATION
// ========================================

const SUPABASE_URL =
    "https://xzhpbisrzhgbeiptdkfd.supabase.co/";

const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6Inh6aHBiaXNyemhnYmVpcHRka2ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NzE1NDcsImV4cCI6MjEwMDU0NzU0N30.oGwKzJG7CuBG_bCDIz7vn5UMVDVMDJBZPM8H1Rxt1iw";


const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


// ========================================
// ELEMENTS
// ========================================

const loadingMessage =
    document.getElementById(
        "loadingMessage"
    );

const loginMessage =
    document.getElementById(
        "loginMessage"
    );

const emptyCart =
    document.getElementById(
        "emptyCart"
    );

const cartContent =
    document.getElementById(
        "cartContent"
    );

const cartItems =
    document.getElementById(
        "cartItems"
    );

const productTotal =
    document.getElementById(
        "productTotal"
    );

const cartTotal =
    document.getElementById(
        "cartTotal"
    );

const checkoutBtn =
    document.getElementById(
        "checkoutBtn"
    );


// ========================================
// GET CURRENT USER
// ========================================

async function getCurrentUser() {

    const {

        data: {
            user
        },

        error

    } = await supabaseClient
        .auth
        .getUser();


    if (error) {

        console.error(
            "User error:",
            error
        );

        return null;

    }


    return user;

}


// ========================================
// LOAD CART
// ========================================

async function loadCart() {

    loadingMessage.classList.remove(
        "hidden"
    );

    loginMessage.classList.add(
        "hidden"
    );

    emptyCart.classList.add(
        "hidden"
    );

    cartContent.classList.add(
        "hidden"
    );


    const user =
        await getCurrentUser();


    // ====================================
    // NOT LOGGED IN
    // ====================================

    if (!user) {

        loadingMessage.classList.add(
            "hidden"
        );

        loginMessage.classList.remove(
            "hidden"
        );

        return;

    }


    // ====================================
    // GET CART
    // ====================================

    const {

        data,
        error

    } = await supabaseClient

        .from(
            "cart_items"
        )

        .select(`

            id,

            quantity,

            product_id,

            products (

                id,

                name,

                price,

                image_url,

                stock,

                is_available

            )

        `)

        .eq(
            "user_id",
            user.id
        )

        .order(
            "created_at",
            {
                ascending:
                    false
            }
        );


    loadingMessage.classList.add(
        "hidden"
    );


    // ====================================
    // ERROR
    // ====================================

    if (error) {

        console.error(
            "Cart loading error:",
            error
        );


        cartItems.innerHTML = `

            <p>

                Failed to load cart.

                <br><br>

                ${error.message}

            </p>

        `;


        cartContent.classList.remove(
            "hidden"
        );


        return;

    }


    // ====================================
    // EMPTY CART
    // ====================================

    if (
        !data ||
        data.length === 0
    ) {

        emptyCart.classList.remove(
            "hidden"
        );

        return;

    }


    // ====================================
    // DISPLAY CART
    // ====================================

    displayCart(
        data
    );

}


// ========================================
// DISPLAY CART
// ========================================

function displayCart(
    items
) {

    cartContent.classList.remove(
        "hidden"
    );


    cartItems.innerHTML =
        "";


    let total =
        0;


    items.forEach(

        item => {


            const product =
                item.products;


            if (!product) {

                return;

            }


            const quantity =
                item.quantity;


            const price =
                Number(
                    product.price
                );


            const subtotal =
                price *
                quantity;


            total +=
                subtotal;


            const image =

                product.image_url

                ?

                product.image_url

                :

                "logo.jpg";


            const cartItem =
                document.createElement(
                    "div"
                );


            cartItem.className =
                "cart-item";


            cartItem.innerHTML = `

                <img

                    src="${image}"

                    alt="${product.name}"

                    class="cart-item-image"

                >


                <div>

                    <div
                        class="cart-item-name"
                    >

                        ${product.name}

                    </div>


                    <div
                        class="cart-item-price"
                    >

                        ৳${price}

                        each

                    </div>


                    <div
                        class="quantity-controls"
                    >


                        <button

                            class="quantity-btn"

                            onclick="
                                changeQuantity(
                                    '${item.id}',
                                    ${quantity - 1},
                                    ${product.stock}
                                )
                            "

                        >

                            −

                        </button>


                        <span
                            class="quantity-number"
                        >

                            ${quantity}

                        </span>


                        <button

                            class="quantity-btn"

                            onclick="
                                changeQuantity(
                                    '${item.id}',
                                    ${quantity + 1},
                                    ${product.stock}
                                )
                            "

                        >

                            +

                        </button>


                    </div>


                    <button

                        class="remove-btn"

                        onclick="
                            removeCartItem(
                                '${item.id}'
                            )
                        "

                    >

                        Remove

                    </button>

                </div>


                <div
                    class="cart-item-total"
                >

                    ৳${subtotal}

                </div>

            `;


            cartItems.appendChild(
                cartItem
            );

        }

    );


    productTotal.textContent =
        "৳" + total;


    cartTotal.textContent =
        "৳" + total;

}


// ========================================
// CHANGE QUANTITY
// ========================================

async function changeQuantity(

    cartItemId,

    newQuantity,

    stock

) {


    if (
        newQuantity <= 0
    ) {

        await removeCartItem(
            cartItemId
        );

        return;

    }


    if (
        newQuantity > stock
    ) {

        alert(

            "You cannot add more than the available stock."

        );

        return;

    }


    const {

        error

    } = await supabaseClient

        .from(
            "cart_items"
        )

        .update({

            quantity:
                newQuantity

        })

        .eq(
            "id",
            cartItemId
        );


    if (error) {

        alert(

            "Failed to update quantity:\n" +

            error.message

        );

        return;

    }


    loadCart();

}


// ========================================
// REMOVE ITEM
// ========================================

async function removeCartItem(
    cartItemId
) {


    const confirmed =
        confirm(

            "Remove this product from your cart?"

        );


    if (!confirmed) {

        return;

    }


    const {

        error

    } = await supabaseClient

        .from(
            "cart_items"
        )

        .delete()

        .eq(
            "id",
            cartItemId
        );


    if (error) {

        alert(

            "Failed to remove item:\n" +

            error.message

        );

        return;

    }


    loadCart();

}


// ========================================
// CHECKOUT
// ========================================

checkoutBtn.addEventListener(

    "click",

    () => {

        window.location.href =
            "checkout.html";

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

loadCart();
