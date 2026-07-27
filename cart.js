// ========================================
// INITIAL CONFIG & STATE
// ========================================
let cart = [];
const DELIVERY_FEE = 100;

const cartItems = document.getElementById("cartItems");
const cartSubtotal = document.getElementById("cartSubtotal");
const cartTotal = document.getElementById("cartTotal");
const checkoutBtn = document.getElementById("checkoutBtn");
const clearCartBtn = document.getElementById("clearCartBtn");
const emptyCart = document.getElementById("emptyCart");
const cartContent = document.getElementById("cartContent");
const yearElement = document.getElementById("year");

// ========================================
// DATA ACCESSORS
// ========================================
function loadCart() {
    try {
        cart = JSON.parse(localStorage.getItem("cart") || "[]");
    } catch (error) {
        console.error("Cart loading error:", error);
        cart = [];
    }
    if (!Array.isArray(cart)) cart = [];
    renderCart();
}

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
}

// ========================================
// RENDER CART VIEWPORT
// ========================================
function renderCart() {
    if (cart.length === 0) {
        if (emptyCart) emptyCart.style.display = "block";
        if (cartContent) cartContent.style.display = "none";
        if (checkoutBtn) checkoutBtn.disabled = true;
        if (cartSubtotal) cartSubtotal.textContent = "৳0";
        if (cartTotal) cartTotal.textContent = "৳0";
        return;
    }

    if (emptyCart) emptyCart.style.display = "none";
    if (cartContent) cartContent.style.display = "grid";
    if (checkoutBtn) checkoutBtn.disabled = false;

    let subtotal = 0;
    cart.forEach(item => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 1;
        subtotal += price * quantity;
    });

    if (cartSubtotal) cartSubtotal.textContent = "৳" + subtotal;
    if (cartTotal) cartTotal.textContent = "৳" + (subtotal + DELIVERY_FEE);

    if (!cartItems) return;
    cartItems.innerHTML = "";

    cart.forEach((item, index) => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 1;
        const itemTotal = price * quantity;

        const itemElement = document.createElement("div");
        itemElement.className = "cart-item";

        const imageHTML = item.image_url 
            ? `<img src="${escapeHTML(item.image_url)}" alt="${escapeHTML(item.name)}" class="cart-item-image">`
            : `<div class="cart-item-image" style="display:flex;align-items:center;justify-content:center;font-size:1.5rem;">🤖</div>`;

        itemElement.innerHTML = `
            ${imageHTML}
            <div class="cart-item-info">
                <h3>${escapeHTML(item.name)}</h3>
                <p>Unit Price: ৳${price}</p>
            </div>
            <div class="cart-item-controls">
                <div class="quantity-controls">
                    <button type="button" class="quantity-btn" data-action="decrease" data-index="${index}">−</button>
                    <span>${quantity}</span>
                    <button type="button" class="quantity-btn" data-action="increase" data-index="${index}">+</button>
                </div>
                <strong>৳${itemTotal}</strong>
                <button type="button" class="remove-btn" data-action="remove" data-index="${index}">Remove</button>
            </div>
        `;
        cartItems.appendChild(itemElement);
    });
}

// ========================================
// CONTROLLER MUTATIONS
// ========================================
function changeQuantity(index, delta) {
    const item = cart[index];
    if (!item) return;

    const currentQuantity = Number(item.quantity) || 1;
    const stock = Number(item.stock) || 999999;
    const targetQuantity = currentQuantity + delta;

    if (delta > 0 && targetQuantity > stock) {
        alert(`You cannot add more than ${stock} unit(s) of this product.`);
        return;
    }

    if (targetQuantity <= 0) {
        removeFromCart(index);
    } else {
        item.quantity = targetQuantity;
        saveCart();
    }
}

function removeFromCart(index) {
    if (!cart[index]) return;
    cart.splice(index, 1);
    saveCart();
}

// ========================================
// GLOBAL BINDINGS & DELEGATION
// ========================================
if (cartItems) {
    cartItems.addEventListener("click", (e) => {
        const targetBtn = e.target.closest("[data-action]");
        if (!targetBtn) return;

        const action = targetBtn.dataset.action;
        const index = Number(targetBtn.dataset.index);

        if (action === "increase") changeQuantity(index, 1);
        if (action === "decrease") changeQuantity(index, -1);
        if (action === "remove") removeFromCart(index);
    });
}

if (clearCartBtn) {
    clearCartBtn.addEventListener("click", () => {
        if (cart.length === 0) return;
        if (confirm("Are you sure you want to clear your cart?")) {
            cart = [];
            saveCart();
        }
    });
}

if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
        if (cart.length === 0) {
            alert("Your cart is empty.");
            return;
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        window.location.href = "checkout.html";
    });
}

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

// Initialize View Setup
loadCart();
