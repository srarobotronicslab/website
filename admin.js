// ========================================
// SUPABASE CONFIGURATION
// ========================================

const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";

const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


// ========================================
// ELEMENTS
// ========================================

const loginSection = document.getElementById("loginSection");
const adminSection = document.getElementById("adminSection");

const loginForm = document.getElementById("loginForm");

const loginMessage = document.getElementById("loginMessage");

const logoutBtn = document.getElementById("logoutBtn");

const productForm = document.getElementById("productForm");

const productImage = document.getElementById("productImage");

const imagePreview = document.getElementById("imagePreview");

const productsList = document.getElementById("productsList");

const productMessage = document.getElementById("productMessage");

const refreshBtn = document.getElementById("refreshBtn");


// ========================================
// CHECK LOGIN
// ========================================

async function checkUser() {

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    if (user) {

        showAdmin();

    } else {

        showLogin();

    }

}


function showAdmin() {

    loginSection.classList.add("hidden");

    adminSection.classList.remove("hidden");

    loadProducts();

}


function showLogin() {

    loginSection.classList.remove("hidden");

    adminSection.classList.add("hidden");

}


// ========================================
// LOGIN
// ========================================

loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;


    loginMessage.textContent = "Logging in...";


    const { error } =
        await supabaseClient.auth.signInWithPassword({

            email: email,

            password: password

        });


    if (error) {

        loginMessage.textContent =
            "Login failed: " + error.message;

    } else {

        loginMessage.textContent =
            "Login successful!";

        showAdmin();

    }

});


// ========================================
// LOGOUT
// ========================================

logoutBtn.addEventListener("click", async () => {

    await supabaseClient.auth.signOut();

    showLogin();

});


// ========================================
// IMAGE PREVIEW
// ========================================

productImage.addEventListener("change", () => {

    const file = productImage.files[0];

    if (!file) {

        imagePreview.innerHTML = "";

        return;

    }


    const imageURL =
        URL.createObjectURL(file);


    imagePreview.innerHTML = `

        <img
            src="${imageURL}"
            alt="Image Preview"
        >

    `;

});


// ========================================
// ADD PRODUCT
// ========================================

productForm.addEventListener("submit", async (event) => {

    event.preventDefault();


    const name =
        document.getElementById("productName").value.trim();

    const description =
        document.getElementById("productDescription").value.trim();

    const price =
        Number(document.getElementById("productPrice").value);

    const category =
        document.getElementById("productCategory").value;

    const stock =
        Number(document.getElementById("productStock").value);

    const isAvailable =
        document.getElementById("productAvailable").checked;

    const imageFile =
        productImage.files[0];


    productMessage.textContent =
        "Adding product...";


    let imageURL = null;


    // ========================================
    // UPLOAD IMAGE
    // ========================================

    if (imageFile) {

        const fileExtension =
            imageFile.name.split(".").pop();

        const fileName =
            `${Date.now()}-${Math.random()
            .toString(36)
            .substring(2)}.${fileExtension}`;


        const filePath =
            `products/${fileName}`;


        const {
            error: uploadError
        } = await supabaseClient.storage
            .from("product-images")
            .upload(filePath, imageFile);


        if (uploadError) {

            productMessage.textContent =
                "Image upload failed: " +
                uploadError.message;

            return;

        }


        const {
            data: publicURLData
        } = supabaseClient.storage
            .from("product-images")
            .getPublicUrl(filePath);


        imageURL =
            publicURLData.publicUrl;

    }


    // ========================================
    // SAVE PRODUCT
    // ========================================

    const {
        error
    } = await supabaseClient
        .from("products")
        .insert({

            name: name,

            description: description,

            price: price,

            category: category,

            image_url: imageURL,

            stock: stock,

            is_available: isAvailable

        });


    if (error) {

        productMessage.textContent =
            "Failed to add product: " +
            error.message;

        return;

    }


    productMessage.textContent =
        "Product added successfully!";


    productForm.reset();

    imagePreview.innerHTML = "";


    loadProducts();

});


// ========================================
// LOAD PRODUCTS
// ========================================

async function loadProducts() {

    productsList.innerHTML =
        `<p class="loading">
            Loading products...
        </p>`;


    const {
        data,
        error
    } = await supabaseClient
        .from("products")
        .select("*")
        .order("created_at", {
            ascending: false
        });


    if (error) {

        productsList.innerHTML =
            `<p>
                Error loading products:
                ${error.message}
            </p>`;

        return;

    }


    if (!data || data.length === 0) {

        productsList.innerHTML =
            `<p class="loading">
                No products added yet.
            </p>`;

        return;

    }


    productsList.innerHTML = "";


    data.forEach(product => {

        const item =
            document.createElement("div");

        item.className =
            "product-item";


        const image =
            product.image_url
            ? product.image_url
            : "logo.jpg";


        item.innerHTML = `

            <img
                src="${image}"
                class="product-image"
                alt="${product.name}"
            >


            <div class="product-info">

                <h3>
                    ${product.name}
                </h3>

                <div class="product-price">
                    ৳${product.price}
                </div>

                <div class="product-category">
                    ${product.category}
                </div>

                <div class="product-status
                    ${product.is_available
                        ? "available"
                        : "unavailable"}">

                    ${product.is_available
                        ? "Available"
                        : "Hidden"}

                    · Stock: ${product.stock}

                </div>

            </div>


            <button
                class="delete-btn"
                onclick="deleteProduct('${product.id}')"
            >
                Delete
            </button>

        `;


        productsList.appendChild(item);

    });

}


// ========================================
// DELETE PRODUCT
// ========================================

async function deleteProduct(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this product?"
        );


    if (!confirmed) return;


    const {
        error
    } = await supabaseClient
        .from("products")
        .delete()
        .eq("id", id);


    if (error) {

        alert(
            "Failed to delete product: " +
            error.message
        );

        return;

    }


    alert(
        "Product deleted successfully."
    );


    loadProducts();

}


// ========================================
// REFRESH
// ========================================

refreshBtn.addEventListener(
    "click",
    loadProducts
);


// ========================================
// START
// ========================================

checkUser();
