// ========================================
// SUPABASE CONFIGURATION
// ========================================
const SUPABASE_URL = "https://xzhpbisrzhgbeiptdkfd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6aHBiaXNyemhnYmVpcHRka2ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NzE1NDcsImV4cCI6MjEwMDU0NzU0N30.oGwKzJG7CuBG_bCDIz7vn5UMVDVMDJBZPM8H1Rxt1iw";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let cart = [];
try {
    const savedCart = localStorage.getItem("cart");
    cart = savedCart ? JSON.parse(savedCart) : [];
} catch (error) {
    cart = [];
}

let products = [];
let selectedCategory = "all";

const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const noResults = document.getElementById("noResults");
const categoryButtons = document.querySelectorAll(".category");
const cartCount = document.getElementById("cartCount");
const yearElement = document.getElementById("year");

// ========================================
// UPDATE CART COUNT
// ========================================
function updateCartCount() {
    if (!cartCount) return;
    let totalQuantity = 0;
    cart.forEach(item => {
        const qty = Number(item.quantity);
        if (Number.isFinite(qty) && qty > 0) totalQuantity += qty;
    });
    cartCount.textContent = totalQuantity;
}

function saveCart() {
    try {
        localStorage.setItem("cart", JSON.stringify(cart));
    } catch (e) {}
    updateCartCount();
}

// ========================================
// LOAD PRODUCTS FROM SUPABASE
// ========================================
async function loadProducts() {
    if (!productGrid) return;
    productGrid.innerHTML = `<p class="loading">Loading products...</p>`;

    try {
        const { data, error } = await supabaseClient
            .from("products")
            .select("*")
            .eq("is_available", true)
            .order("created_at", { ascending: false });

        if (error) throw error;
        products = Array.isArray(data) ? data : [];
        displayProducts();
    } catch (error) {
        productGrid.innerHTML = `<p class="error">Unable to load products.</p>`;
    }
}

// ========================================
// DISPLAY PRODUCTS WITH CATEGORY FILTER
// ========================================
function displayProducts() {
    if (!productGrid) return;

    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : "";

    const filteredProducts = products.filter(product => {
        const name = String(product.name || "").toLowerCase();
        const description = String(product.description || "").toLowerCase();
        const category = String(product.category || "Other").toLowerCase();

        const matchesSearch = name.includes(searchTerm) || description.includes(searchTerm);
        
        // Exact or clean category matching
        const cleanSelectedCat = selectedCategory.replace(/^\d+\.\s*/, "").toLowerCase();
        const matchesCategory = selectedCategory === "all" || category.trim().toLowerCase() === cleanSelectedCat;

        return matchesSearch && matchesCategory;
    });

    if (filteredProducts.length === 0) {
        productGrid.innerHTML = "";
        if (noResults) noResults.style.display = "block";
        return;
    }

    if (noResults) noResults.style.display = "none";
    productGrid.innerHTML = "";

    filteredProducts.forEach(product => {
        const card = document.createElement("article");
        card.className = "product-card";

        const imageHTML = product.image_url 
            ? `<img src="${escapeHTML(product.image_url)}" alt="${escapeHTML(product.name)}" class="product-image">`
            : `<div class="image-placeholder">No Image Available</div>`;

        card.innerHTML = `
            <div class="product-image-wrapper">${imageHTML}</div>
            <div class="product-info">
                <span class="product-category">${escapeHTML(product.category || 'General')}</span>
                <h3>${escapeHTML(product.name || "Unnamed Product")}</h3>
                <p class="product-description">${escapeHTML(product.description || "")}</p>
                <strong class="price">৳${product.price || 0}</strong>
                <div class="product-actions">
                    <button class="add-cart" type="button">Add to Cart</button>
                    <button class="buy-now" type="button">Buy Now</button>
                </div>
            </div>
        `;

        card.querySelector(".add-cart").addEventListener("click", () => addToCart(product));
        card.querySelector(".buy-now").addEventListener("click", () => buyNow(product));

        productGrid.appendChild(card);
    });
}

function addToCart(product) {
    const existing = cart.find(item => String(item.id) === String(product.id));
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1, image_url: product.image_url });
    }
    saveCart();
    alert(`${product.name} added to cart.`);
}

function buyNow(product) {
    cart = [{ id: product.id, name: product.name, price: product.price, quantity: 1, image_url: product.image_url }];
    saveCart();
    window.location.href = "cart.html";
}

// Global Category Selection Trigger
function selectCategory(catName) {
    selectedCategory = catName;
    categoryButtons.forEach(btn => {
        const btnCat = btn.dataset.category;
        if (btnCat === catName) btn.classList.add("active");
        else btn.classList.remove("active");
    });
    displayProducts();
}

// Event Listeners
if (searchInput) searchInput.addEventListener("input", displayProducts);

categoryButtons.forEach(button => {
    button.addEventListener("click", () => {
        categoryButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
        selectedCategory = button.dataset.category || "all";
        displayProducts();
    });
});

if (yearElement) yearElement.textContent = new Date().getFullYear();

updateCartCount();
loadProducts();
