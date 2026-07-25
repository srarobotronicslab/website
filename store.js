/* =========================================
   CART
========================================= */

let cart = [];


/* =========================================
   ADD TO CART
========================================= */

function addToCart(name, price) {

    cart.push({

        name: name,

        price: price

    });


    updateCart();


    alert(
        name +
        " has been added to your cart."
    );

}


/* =========================================
   UPDATE CART
========================================= */

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


    if (cart.length === 0) {

        cartItems.innerHTML =

            '<p class="empty-cart">' +

            'Your cart is empty.' +

            '</p>';

        cartTotal.textContent =
            "৳0";

        return;

    }


    let total = 0;


    cartItems.innerHTML = "";


    cart.forEach(

        (item, index) => {

            total += item.price;


            const itemElement =
                document.createElement(
                    "div"
                );


            itemElement.innerHTML = `

                <div style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    padding:15px 0;
                    border-bottom:1px solid #dededb;
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


/* =========================================
   BUY NOW
========================================= */

function buyNow(name, price) {

    alert(

        "Buy Now selected:\n\n" +

        name +

        "\nPrice: ৳" +

        price +

        "\n\nCheckout will be connected later."

    );

}


/* =========================================
   SEARCH
========================================= */

const searchInput =
    document.getElementById(
        "searchInput"
    );


const products =
    document.querySelectorAll(
        ".product-card"
    );


const noResults =
    document.getElementById(
        "noResults"
    );


searchInput.addEventListener(

    "input",

    function () {

        const searchTerm =
            this.value
            .toLowerCase()
            .trim();


        let found = false;


        products.forEach(

            product => {

                const productName =
                    product.dataset.name
                    .toLowerCase();


                if (
                    productName.includes(
                        searchTerm
                    )
                ) {

                    product.style.display =
                        "block";

                    found = true;

                } else {

                    product.style.display =
                        "none";

                }

            }

        );


        noResults.style.display =
            found ? "none" : "block";

    }

);


/* =========================================
   CATEGORY FILTER
========================================= */

const categoryButtons =
    document.querySelectorAll(
        ".category"
    );


categoryButtons.forEach(

    button => {

        button.addEventListener(

            "click",

            function () {


                categoryButtons.forEach(

                    btn =>

                    btn.classList.remove(
                        "active"
                    )

                );


                this.classList.add(
                    "active"
                );


                const category =
                    this.dataset.category;


                let found = false;


                products.forEach(

                    product => {


                        const matches =

                            category ===
                            "all" ||

                            product.dataset.category ===
                            category;


                        if (matches) {

                            product.style.display =
                                "block";

                            found = true;

                        } else {

                            product.style.display =
                                "none";

                        }

                    }

                );


                noResults.style.display =

                    found ?
                    "none" :
                    "block";


            }

        );

    }

);


/* =========================================
   YEAR
========================================= */

document.getElementById(
    "year"
).textContent =

    new Date().getFullYear();
