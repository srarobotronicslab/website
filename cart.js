// =========================================
// CART LOGIC - SRA ROBOTRONICS LAB
// =========================================

document.addEventListener('DOMContentLoaded', () => {
    // Set dynamic footer year
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.innerText = new Date().getFullYear();
    }

    // Initialize cart data from LocalStorage
    loadCart();

    // Event listener for clear cart button
    const clearCartBtn = document.getElementById('clearCartBtn');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', clearCart);
    }

    // Event listener for delivery option changes (Inside/Outside Dhaka)
    const deliveryRadios = document.querySelectorAll('input[name="deliveryOption"]');
    deliveryRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            updateCartUI();
        });
    });

    // Event listener for checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
    }
});

// Retrieve cart from localStorage (checks multiple keys to prevent empty cart bug)
function getCart() {
    try {
        const possibleKeys = ['sra_cart', 'cart', 'sra-cart', 'shopping_cart'];
        let rawData = null;
        
        for (const key of possibleKeys) {
            rawData = localStorage.getItem(key);
            if (rawData) break;
        }

        return rawData ? JSON.parse(rawData) : [];
    } catch (e) {
        return [];
    }
}

// Save cart to localStorage (saves back to primary 'sra_cart' and syncs common keys)
function saveCart(cart) {
    const cartString = JSON.stringify(cart);
    localStorage.setItem('sra_cart', cartString);
    localStorage.setItem('cart', cartString);
}

// Load and render cart UI
function loadCart() {
    const cart = getCart();
    const emptyCartSection = document.getElementById('emptyCart');
    const cartContentSection = document.getElementById('cartContent');
    const cartItemsContainer = document.getElementById('cartItems');
    const cartItemCount = document.getElementById('cartItemCount');

    if (!cartContentSection || !emptyCartSection) return;

    if (cart.length === 0) {
        emptyCartSection.style.display = 'block';
        cartContentSection.style.display = 'none';
        return;
    }

    emptyCartSection.style.display = 'none';
    cartContentSection.style.display = 'grid';

    // Update item count label
    const totalItemsCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    cartItemCount.innerText = `${totalItemsCount} item${totalItemsCount > 1 ? 's' : ''}`;

    // Clear current list and render items
    cartItemsContainer.innerHTML = '';

    cart.forEach((item, index) => {
        const qty = item.quantity || 1;
        const itemTotal = item.price * qty;
        
        // Added 'image_url' explicitly since that is what your database/store uses
        const rawImage = item.image_url || item.image || item.img || item.thumbnail || item.photo || item.imageUrl || '';
        
        const imageUrl = (typeof rawImage === 'string' && rawImage.trim() !== '') ? rawImage.trim() : 'logo.jpg';
        const itemName = item.name || item.title || 'Robotics Component';

        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.innerHTML = `
            <img src="${imageUrl}" alt="${itemName}" class="cart-item-image" onerror="this.src='logo.jpg'">
            <div class="cart-item-info">
                <h3>${itemName}</h3>
                <p>৳${item.price} each</p>
            </div>
            <div class="cart-item-controls">
                <div class="quantity-controls">
                    <button class="quantity-btn" type="button" onclick="updateQuantity(${index}, -1)">-</button>
                    <span>${qty}</span>
                    <button class="quantity-btn" type="button" onclick="updateQuantity(${index}, 1)">+</button>
                </div>
                <div class="item-total">৳${itemTotal}</div>
                <button class="remove-btn" type="button" onclick="removeItem(${index})">Remove</button>
            </div>
        `;
        cartItemsContainer.appendChild(cartItemElement);
    });

    updateCartUI();
}

// Update item quantity
function updateQuantity(index, change) {
    let cart = getCart();
    if (cart[index]) {
        cart[index].quantity = (cart[index].quantity || 1) + change;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        saveCart(cart);
        loadCart();
    }
}

// Remove single item
function removeItem(index) {
    let cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    loadCart();
}

// Clear entire cart
function clearCart() {
    if (confirm('Are you sure you want to clear your entire cart?')) {
        localStorage.removeItem('sra_cart');
        localStorage.removeItem('cart');
        loadCart();
    }
}

// Calculate totals and render summary
function updateCartUI() {
    const cart = getCart();
    
    // Calculate subtotal
    const subtotal = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

    // Get selected delivery fee option
    const selectedDeliveryRadio = document.querySelector('input[name="deliveryOption"]:checked');
    const deliveryFee = selectedDeliveryRadio ? parseInt(selectedDeliveryRadio.value) : 80;

    // Update fee display text
    const deliveryFeeElement = document.getElementById('deliveryFee');
    if (deliveryFeeElement) {
        deliveryFeeElement.innerText = `৳${deliveryFee}`;
    }

    // Calculate total amount
    const total = subtotal + (cart.length > 0 ? deliveryFee : 0);

    // Render values
    const subtotalElement = document.getElementById('cartSubtotal');
    const totalElement = document.getElementById('cartTotal');

    if (subtotalElement) subtotalElement.innerText = `৳${subtotal}`;
    if (totalElement) totalElement.innerText = `৳${cart.length > 0 ? total : 0}`;
}

// Handle Checkout process
function handleCheckout() {
    const cart = getCart();
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const selectedDeliveryRadio = document.querySelector('input[name="deliveryOption"]:checked');
    const deliveryFee = selectedDeliveryRadio ? parseInt(selectedDeliveryRadio.value) : 80;
    const deliveryLocation = deliveryFee === 80 ? 'Inside Dhaka' : 'Outside Dhaka';
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    const total = subtotal + deliveryFee;

    const orderDetails = {
        items: cart,
        subtotal: subtotal,
        deliveryLocation: deliveryLocation,
        deliveryFee: deliveryFee,
        total: total
    };

    localStorage.setItem('sra_pending_order', JSON.stringify(orderDetails));
    alert(`Proceeding to checkout!\nLocation: ${deliveryLocation}\nTotal Amount: ৳${total}`);
}
