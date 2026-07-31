document.addEventListener("DOMContentLoaded", async () => {
    // Set current year in footer
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Check Cart Data
    let cart = JSON.parse(localStorage.getItem("sra_cart")) || [];
    
    if (cart.length === 0) {
        alert("Your cart is empty!");
        window.location.href = "cart.html";
        return;
    }

    // Render Order Summary
    renderOrderSummary(cart);

    // Setup Dynamic Payment Disclaimer toggling
    setupPaymentDisclaimer(cart);

    // Setup Form Submission
    setupCheckoutForm(cart);
});

function calculateSubtotal(cart) {
    return cart.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
}

function getDeliveryFee() {
    const selectedLocation = document.querySelector('input[name="deliveryLocation"]:checked');
    return selectedLocation && selectedLocation.value === "outside" ? 150 : 80;
}

function renderOrderSummary(cart) {
    const itemsContainer = document.getElementById("checkoutItems");
    const subtotalEl = document.getElementById("checkoutSubtotal");
    const deliveryEl = document.getElementById("checkoutDelivery");
    const totalEl = document.getElementById("checkoutTotal");

    itemsContainer.innerHTML = cart.map(item => `
        <div class="checkout-item">
            <span class="checkout-item-name" title="${item.name}">${item.name}</span>
            <span class="checkout-item-quantity">x${item.quantity}</span>
            <span class="checkout-item-price">৳${Number(item.price) * Number(item.quantity)}</span>
        </div>
    `).join("");

    updateTotalsDisplay();

    // Listen to location changes to update delivery fee & totals
    document.querySelectorAll('input[name="deliveryLocation"]').forEach(radio => {
        radio.addEventListener("change", () => {
            updateTotalsDisplay();
            updateDisclaimerText(cart);
        });
    });
}

function updateTotalsDisplay() {
    let cart = JSON.parse(localStorage.getItem("sra_cart")) || [];
    const subtotal = calculateSubtotal(cart);
    const deliveryFee = getDeliveryFee();
    const total = subtotal + deliveryFee;

    document.getElementById("checkoutSubtotal").textContent = `৳${subtotal}`;
    document.getElementById("checkoutDelivery").textContent = `৳${deliveryFee}`;
    document.getElementById("checkoutTotal").textContent = `৳${total}`;
}

function setupPaymentDisclaimer(cart) {
    const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
    
    paymentRadios.forEach(radio => {
        radio.addEventListener("change", () => updateDisclaimerText(cart));
    });

    // Initial load call
    updateDisclaimerText(cart);
}

function updateDisclaimerText(cart) {
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    const disclaimerBox = document.getElementById("paymentDisclaimer");
    
    const subtotal = calculateSubtotal(cart);
    const deliveryFee = getDeliveryFee();
    const grandTotal = subtotal + deliveryFee;

    if (paymentMethod === "cod") {
        disclaimerBox.innerHTML = `(If cash on delivery)<br>Pay the delivery charge ${deliveryFee}/- in advance<br>Bkash: 01303614563<br>Nogod: 01303614563`;
    } else if (paymentMethod === "bkash") {
        disclaimerBox.innerHTML = `If bkash payment<br>Pay the total (${grandTotal} tk)<br>Bkash: 01303614563`;
    } else if (paymentMethod === "nogod") {
        disclaimerBox.innerHTML = `If nogod payment<br>Pay the total (${grandTotal} tk)<br>Nogod: 01303614563`;
    }
}

function setupCheckoutForm(cart) {
    const form = document.getElementById("checkoutForm");
    const placeOrderBtn = document.getElementById("placeOrderBtn");
    const messageEl = document.getElementById("checkoutMessage");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("customerName").value.trim();
        const phone = document.getElementById("customerPhone").value.trim();
        const address = document.getElementById("customerAddress").value.trim();
        const location = document.querySelector('input[name="deliveryLocation"]:checked').value;
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
        const lastDigits = document.getElementById("paymentLastTwo").value.trim();

        if (!name || !phone || !address) {
            showMsg("Please fill in all required contact details.", "error");
            return;
        }

        if (phone.length !== 11 || !phone.startsWith("01")) {
            showMsg("Please enter a valid 11-digit phone number.", "error");
            return;
        }

        if (lastDigits.length !== 2) {
            showMsg("Please provide the last 2 digits of your payment number.", "error");
            return;
        }

        placeOrderBtn.disabled = true;
        placeOrderBtn.textContent = "Placing Order...";

        const subtotal = calculateSubtotal(cart);
        const deliveryFee = getDeliveryFee();
        const total = subtotal + deliveryFee;

        const orderData = {
            customer_name: name,
            customer_phone: phone,
            customer_address: address,
            delivery_location: location,
            payment_method: paymentMethod,
            payment_last_digits: lastDigits,
            items: cart,
            subtotal: subtotal,
            delivery_fee: deliveryFee,
            total_amount: total,
            created_at: new Date().toISOString()
        };

        try {
            // Simulated or real Supabase integration depending on window configuration
            if (window.supabase) {
                // Adjust table name if necessary, e.g. "orders"
                const { error } = await window.supabase.from("orders").insert([orderData]);
                if (error) throw error;
            }

            showMsg("Order placed successfully! Redirecting...", "success");
            localStorage.removeItem("sra_cart");
            
            setTimeout(() => {
                window.location.href = "store.html";
            }, 1500);

        } catch (err) {
            console.error(err);
            showMsg("Failed to place order. Please check your network.", "error");
            placeOrderBtn.disabled = false;
            placeOrderBtn.textContent = "Place Order";
        }
    });

    function showMsg(text, type) {
        messageEl.textContent = text;
        messageEl.className = `checkout-message ${type}`;
    }
}
