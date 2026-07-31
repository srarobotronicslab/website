document.addEventListener("DOMContentLoaded", () => {
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

    // Setup Dynamic Payment Instructions
    setupPaymentInstructions(cart);

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
    if (!itemsContainer) return;

    itemsContainer.innerHTML = cart.map(item => {
        return `
            <div class="checkout-item">
                <div class="checkout-item-name" title="${item.name}">
                    ${item.name}
                    <div class="checkout-item-quantity">Qty: ${item.quantity}</div>
                </div>
                <div class="checkout-item-price">৳${Number(item.price) * Number(item.quantity)}</div>
            </div>
        `;
    }).join("");

    updateTotalsDisplay();

    document.querySelectorAll('input[name="deliveryLocation"]').forEach(radio => {
        radio.addEventListener("change", () => {
            updateTotalsDisplay();
            updateInstructionsText(cart);
        });
    });
}

function updateTotalsDisplay() {
    let cart = JSON.parse(localStorage.getItem("sra_cart")) || [];
    const subtotal = calculateSubtotal(cart);
    const deliveryFee = getDeliveryFee();
    const total = subtotal + deliveryFee;

    const subEl = document.getElementById("checkoutSubtotal");
    const delEl = document.getElementById("checkoutDelivery");
    const totEl = document.getElementById("checkoutTotal");

    if (subEl) subEl.textContent = `৳${subtotal}`;
    if (delEl) delEl.textContent = `৳${deliveryFee}`;
    if (totEl) totEl.textContent = `৳${total}`;
}

function setupPaymentInstructions(cart) {
    const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
    
    paymentRadios.forEach(radio => {
        radio.addEventListener("change", () => updateInstructionsText(cart));
    });

    updateInstructionsText(cart);
}

function updateInstructionsText(cart) {
    const paymentRadio = document.querySelector('input[name="paymentMethod"]:checked');
    const instructionsBox = document.getElementById("paymentInstructions");
    if (!instructionsBox || !paymentRadio) return;

    const paymentMethod = paymentRadio.value;
    const subtotal = calculateSubtotal(cart);
    const deliveryFee = getDeliveryFee();
    const grandTotal = subtotal + deliveryFee;

    if (paymentMethod === "cod") {
        instructionsBox.innerHTML = `<strong>Cash on Delivery:</strong> Pay the delivery charge ${deliveryFee}/- in advance.<br><strong>Bkash / Nagad:</strong> 01303614563`;
    } else if (paymentMethod === "bkash") {
        instructionsBox.innerHTML = `<strong>bKash Payment:</strong> Send total amount (${grandTotal} tk) to <strong>01303614563</strong> (Personal/Merchant).`;
    } else if (paymentMethod === "nogod") {
        instructionsBox.innerHTML = `<strong>Nagad Payment:</strong> Send total amount (${grandTotal} tk) to <strong>01303614563</strong> (Personal/Merchant).`;
    }
}

function setupCheckoutForm(cart) {
    const form = document.getElementById("checkoutForm");
    if (!form) return;

    const placeOrderBtn = document.getElementById("placeOrderBtn");
    const messageEl = document.getElementById("checkoutMessage");

    form.addEventListener("submit", async (e) => {
        e.preventDefault(); 
        e.stopPropagation();

        const name = document.getElementById("customerName")?.value.trim() || "";
        const phone = document.getElementById("customerPhone")?.value.trim() || "";
        const address = document.getElementById("customerAddress")?.value.trim() || "";
        const lastDigits = document.getElementById("paymentLastTwo")?.value.trim() || "";

        if (!name || !phone || !address || !lastDigits) {
            showMsg("Please fill in all required fields.", "error");
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

        if (placeOrderBtn) {
            placeOrderBtn.disabled = true;
            placeOrderBtn.textContent = "Placing Order...";
        }

        const subtotal = calculateSubtotal(cart);
        const deliveryFee = getDeliveryFee();
        const total = subtotal + deliveryFee;
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || "cod";

        try {
            if (!window.supabase) {
                throw new Error("Supabase is not initialized on this page.");
            }

            // 1. Insert into 'orders' table matching exact schema columns
            const orderPayload = {
                customer_name: name,
                phone: phone,
                delivery_address: address,
                payment_method: paymentMethod,
                payment_sender_last_two: lastDigits,
                payment_status: "Pending",
                order_status: "Pending",
                subtotal: subtotal,
                delivery_fee: deliveryFee,
                total_amount: total
            };

            const { data: orderData, error: orderError } = await window.supabase
                .from("orders")
                .insert([orderPayload])
                .select()
                .single();

            if (orderError) throw orderError;

            const orderId = orderData.id;

            // 2. Insert items into 'order_items' table matching exact schema columns
            const orderItemsPayload = cart.map(item => {
                const itemPrice = Number(item.price);
                const itemQty = Number(item.quantity);
                return {
                    order_id: orderId,
                    product_id: item.id || null, // Handles if item has id or not
                    product_name: item.name,
                    product_price: itemPrice,
                    price: itemPrice,
                    quantity: itemQty,
                    subtotal: itemPrice * itemQty
                };
            });

            const { error: itemsError } = await window.supabase
                .from("order_items")
                .insert(orderItemsPayload);

            if (itemsError) throw itemsError;

            showMsg("Order placed successfully! Redirecting...", "success");
            localStorage.removeItem("sra_cart");
            
            setTimeout(() => {
                window.location.href = "store.html";
            }, 1500);

        } catch (err) {
            console.error("Supabase Error:", err);
            showMsg("Error: " + (err.message || JSON.stringify(err)), "error");
            
            if (placeOrderBtn) {
                placeOrderBtn.disabled = false;
                placeOrderBtn.textContent = "Place Order";
            }
        }
    });

    function showMsg(text, type) {
        if (!messageEl) return;
        messageEl.textContent = text;
        messageEl.className = `checkout-message ${type}`;
    }
}
