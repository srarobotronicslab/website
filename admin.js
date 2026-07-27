// ========================================
// SUPABASE CONFIGURATION
// ========================================

const SUPABASE_URL =
    "https://xzhpbisrzhgbeiptdkfd.supabase.co";

const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6aHBiaXNyemhnYmVpcHRka2ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NzE1NDcsImV4cCI6MjEwMDU0NzU0N30.oGwKzJG7CuBG_bCDIz7vn5UMVDVMDJBZPM8H1Rxt1iw";


const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );



// ========================================
// ELEMENTS
// ========================================

const loginSection =
    document.getElementById("loginSection");

const adminSection =
    document.getElementById("adminSection");

const loginForm =
    document.getElementById("loginForm");

const loginMessage =
    document.getElementById("loginMessage");

const logoutBtn =
    document.getElementById("logoutBtn");

const productForm =
    document.getElementById("productForm");

const productImage =
    document.getElementById("productImage");

const imagePreview =
    document.getElementById("imagePreview");

const productsList =
    document.getElementById("productsList");

const productMessage =
    document.getElementById("productMessage");

const refreshBtn =
    document.getElementById("refreshBtn");


// Edit mode elements

const editingProductId =
    document.getElementById(
        "editingProductId"
    );

const formTitle =
    document.getElementById(
        "formTitle"
    );

const submitProductBtn =
    document.getElementById(
        "submitProductBtn"
    );

const cancelEditBtn =
    document.getElementById(
        "cancelEditBtn"
    );



// ========================================
// CHECK LOGIN
// ========================================

async function checkUser() {

    const {
        data,
        error
    } =
        await supabaseClient.auth.getUser();


    if (error) {

        console.error(
            "Auth error:",
            error
        );

        showLogin();

        return;

    }


    if (data.user) {

        showAdmin();

    } else {

        showLogin();

    }

}



// ========================================
// SHOW ADMIN
// ========================================

function showAdmin() {

    loginSection.classList.add(
        "hidden"
    );

    adminSection.classList.remove(
        "hidden"
    );

    loadProducts();

}



// ========================================
// SHOW LOGIN
// ========================================

function showLogin() {

    loginSection.classList.remove(
        "hidden"
    );

    adminSection.classList.add(
        "hidden"
    );

}



// ========================================
// LOGIN
// ========================================

loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const email =
            document
                .getElementById("email")
                .value
                .trim();


        const password =
            document
                .getElementById("password")
                .value;


        loginMessage.textContent =
            "Logging in...";


        const {
            error
        } =
            await supabaseClient.auth
                .signInWithPassword({

                    email:
                        email,

                    password:
                        password

                });


        if (error) {

            loginMessage.textContent =
                "Login failed: " +
                error.message;

            return;

        }


        loginMessage.textContent =
            "Login successful!";


        showAdmin();

    }
);



// ========================================
// LOGOUT
// ========================================

logoutBtn.addEventListener(
    "click",
    async () => {

        await supabaseClient.auth.signOut();

        showLogin();

    }
);



// ========================================
// IMAGE PREVIEW
// ========================================

productImage.addEventListener(
    "change",
    () => {

        const file =
            productImage.files[0];


        if (!file) {

            return;

        }


        const imageURL =
            URL.createObjectURL(
                file
            );


        imagePreview.innerHTML = `

            <img
                src="${imageURL}"
                alt="Image Preview"
            >

        `;

    }
);



// ========================================
// RESET FORM
// ========================================

function resetProductForm() {

    productForm.reset();

    editingProductId.value =
        "";

    imagePreview.innerHTML =
        "";

    formTitle.textContent =
        "Add New Product";

    submitProductBtn.textContent =
        "Add Product";

    cancelEditBtn.classList.add(
        "hidden"
    );

    productMessage.textContent =
        "";

}



// ========================================
// ADD / UPDATE PRODUCT
// ========================================

productForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const name =
            document
                .getElementById(
                    "productName"
                )
                .value
                .trim();


        const description =
            document
                .getElementById(
                    "productDescription"
                )
                .value
                .trim();


        const price =
            Number(
                document
                    .getElementById(
                        "productPrice"
                    )
                    .value
            );


        const category =
            document
                .getElementById(
                    "productCategory"
                )
                .value;


        const stock =
            Number(
                document
                    .getElementById(
                        "productStock"
                    )
                    .value
            );


        const isAvailable =
            document
                .getElementById(
                    "productAvailable"
                )
                .checked;


        const imageFile =
            productImage.files[0];


        const productId =
            editingProductId.value;



        // =================================
        // VALIDATION
        // =================================

        if (!name) {

            productMessage.textContent =
                "Please enter a product name.";

            return;

        }


        if (
            !Number.isFinite(price) ||
            price < 0
        ) {

            productMessage.textContent =
                "Please enter a valid price.";

            return;

        }


        if (
            !Number.isInteger(stock) ||
            stock < 0
        ) {

            productMessage.textContent =
                "Please enter a valid stock quantity.";

            return;

        }



        const isEditing =
            productId !== "";



        productMessage.textContent =

            isEditing

            ? "Updating product..."

            : "Adding product...";



        // =================================
        // IMAGE URL
        // =================================

        let imageURL = null;



        // =================================
        // EDITING:
        // GET CURRENT IMAGE
        // =================================

        if (isEditing) {

            const {
                data: existingProduct,
                error: existingError
            } =
                await supabaseClient
                    .from("products")
                    .select("image_url")
                    .eq(
                        "id",
                        productId
                    )
                    .single();


            if (existingError) {

                console.error(
                    existingError
                );

                productMessage.textContent =
                    "Failed to load existing product: " +
                    existingError.message;

                return;

            }


            imageURL =
                existingProduct.image_url;

        }



        // =================================
        // UPLOAD NEW IMAGE IF SELECTED
        // =================================

        if (imageFile) {

            const fileExtension =
                imageFile.name
                    .split(".")
                    .pop()
                    .toLowerCase();


            const fileName =
                Date.now() +
                "-" +
                Math.random()
                    .toString(36)
                    .substring(2) +
                "." +
                fileExtension;


            const filePath =
                "products/" +
                fileName;



            const {
                error: uploadError
            } =
                await supabaseClient
                    .storage
                    .from(
                        "product-images"
                    )
                    .upload(
                        filePath,
                        imageFile
                    );


            if (uploadError) {

                console.error(
                    "Image upload error:",
                    uploadError
                );

                productMessage.textContent =
                    "Image upload failed: " +
                    uploadError.message;

                return;

            }



            const {
                data:
                    publicURLData
            } =
                supabaseClient
                    .storage
                    .from(
                        "product-images"
                    )
                    .getPublicUrl(
                        filePath
                    );


            imageURL =
                publicURLData.publicUrl;

        }



        // =================================
        // UPDATE EXISTING PRODUCT
        // =================================

        if (isEditing) {

            const {
                error: updateError
            } =
                await supabaseClient
                    .from("products")
                    .update({

                        name:
                            name,

                        description:
                            description,

                        price:
                            price,

                        category:
                            category,

                        image_url:
                            imageURL,

                        stock:
                            stock,

                        is_available:
                            isAvailable

                    })
                    .eq(
                        "id",
                        productId
                    );


            if (updateError) {

                console.error(
                    "Update error:",
                    updateError
                );

                productMessage.textContent =
                    "Failed to update product: " +
                    updateError.message;

                return;

            }


            alert(
                "Product updated successfully!"
            );

        }



        // =================================
        // ADD NEW PRODUCT
        // =================================

        else {

            const {
                error: insertError
            } =
                await supabaseClient
                    .from("products")
                    .insert({

                        name:
                            name,

                        description:
                            description,

                        price:
                            price,

                        category:
                            category,

                        image_url:
                            imageURL,

                        stock:
                            stock,

                        is_available:
                            isAvailable

                    });


            if (insertError) {

                console.error(
                    "Add product error:",
                    insertError
                );

                productMessage.textContent =
                    "Failed to add product: " +
                    insertError.message;

                return;

            }


            alert(
                "Product added successfully!"
            );

        }



        // =================================
        // RESET
        // =================================

        resetProductForm();


        // =================================
        // RELOAD
        // =================================

        await loadProducts();

    }
);



// ========================================
// LOAD PRODUCTS
// ========================================

async function loadProducts() {

    productsList.innerHTML = `

        <p class="loading">
            Loading products...
        </p>

    `;


    const {
        data,
        error
    } =
        await supabaseClient
            .from("products")
            .select("*")
            .order(
                "created_at",
                {
                    ascending:
                        false
                }
            );


    if (error) {

        console.error(
            "Load products error:",
            error
        );


        productsList.innerHTML = `

            <p class="error">

                Error loading products:

                <br>

                ${error.message}

            </p>

        `;

        return;

    }



    if (
        !data ||
        data.length === 0
    ) {

        productsList.innerHTML = `

            <p class="loading">

                No products added yet.

            </p>

        `;

        return;

    }



    productsList.innerHTML =
        "";



    data.forEach(
        product => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "product-item";


            const image =
                product.image_url ||
                "logo.jpg";



            item.innerHTML = `

                <img
                    src="${image}"
                    class="product-image"
                    alt="${product.name}"
                >


                <div
                    class="product-info"
                >

                    <h3>
                        ${product.name}
                    </h3>


                    <div
                        class="product-price"
                    >

                        ৳${product.price}

                    </div>


                    <div
                        class="product-category"
                    >

                        ${
                            product.category ||
                            "Uncategorized"
                        }

                    </div>


                    <div
                        class="product-status ${
                            product.is_available
                                ? "available"
                                : "unavailable"
                        }"
                    >

                        ${
                            product.is_available
                                ? "Available"
                                : "Hidden"
                        }

                        · Stock:

                        ${
                            product.stock ??
                            0
                        }

                    </div>

                </div>



                <div
                    class="product-actions"
                >

                    <button
                        type="button"
                        class="edit-btn"
                        data-id="${product.id}"
                    >
                        Edit
                    </button>


                    <button
                        type="button"
                        class="delete-btn"
                        data-id="${product.id}"
                    >
                        Delete
                    </button>

                </div>

            `;



            // EDIT BUTTON

            item
                .querySelector(
                    ".edit-btn"
                )
                .addEventListener(
                    "click",
                    () => {

                        editProduct(
                            product.id
                        );

                    }
                );



            // DELETE BUTTON

            item
                .querySelector(
                    ".delete-btn"
                )
                .addEventListener(
                    "click",
                    () => {

                        deleteProduct(
                            product.id
                        );

                    }
                );



            productsList
                .appendChild(
                    item
                );

        }
    );

}



// ========================================
// EDIT PRODUCT
// ========================================

async function editProduct(id) {

    productMessage.textContent =
        "Loading product...";


    const {
        data: product,
        error
    } =
        await supabaseClient
            .from("products")
            .select("*")
            .eq(
                "id",
                id
            )
            .single();


    if (error) {

        console.error(
            "Edit load error:",
            error
        );

        productMessage.textContent =
            "Failed to load product: " +
            error.message;

        return;

    }



    // =================================
    // FILL FORM
    // =================================

    document
        .getElementById(
            "productName"
        )
        .value =
            product.name || "";


    document
        .getElementById(
            "productDescription"
        )
        .value =
            product.description || "";


    document
        .getElementById(
            "productPrice"
        )
        .value =
            product.price ?? "";


    document
        .getElementById(
            "productStock"
        )
        .value =
            product.stock ?? 0;


    document
        .getElementById(
            "productCategory"
        )
        .value =
            product.category || "Other";


    document
        .getElementById(
            "productAvailable"
        )
        .checked =
            product.is_available === true;


    editingProductId.value =
        product.id;



    // =================================
    // IMAGE PREVIEW
    // =================================

    if (product.image_url) {

        imagePreview.innerHTML = `

            <img
                src="${product.image_url}"
                alt="Current Product Image"
            >

            <p>
                Current image.
                Select a new image only if you want to replace it.
            </p>

        `;

    } else {

        imagePreview.innerHTML = `

            <p>
                No product image.
            </p>

        `;

    }



    // =================================
    // CHANGE FORM TO EDIT MODE
    // =================================

    formTitle.textContent =
        "Edit Product";


    submitProductBtn.textContent =
        "Update Product";


    cancelEditBtn.classList.remove(
        "hidden"
    );


    productMessage.textContent =
        "Editing: " +
        product.name;



    // =================================
    // SCROLL TO FORM
    // =================================

    productForm.scrollIntoView({

        behavior:
            "smooth",

        block:
            "start"

    });

}



// ========================================
// CANCEL EDIT
// ========================================

cancelEditBtn.addEventListener(
    "click",
    () => {

        resetProductForm();

    }
);



// ========================================
// DELETE PRODUCT
// ========================================

async function deleteProduct(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this product?"
        );


    if (!confirmed) {

        return;

    }


    const {
        error
    } =
        await supabaseClient
            .from("products")
            .delete()
            .eq(
                "id",
                id
            );


    if (error) {

        console.error(
            "Delete error:",
            error
        );


        alert(
            "Failed to delete product: " +
            error.message
        );

        return;

    }


    alert(
        "Product deleted successfully."
    );


    await loadProducts();

}



// ========================================
// REFRESH
// ========================================

refreshBtn.addEventListener(
    "click",
    async () => {

        await loadProducts();

    }
);



// ========================================
// START
// ========================================

checkUser();
