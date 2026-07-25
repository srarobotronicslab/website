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

            console.error(
                "Login error:",
                error
            );


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


        imagePreview.innerHTML =
            "";


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
// ADD PRODUCT
// ========================================

productForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        // --------------------------------
        // GET FORM VALUES
        // --------------------------------

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


        // --------------------------------
        // VALIDATION
        // --------------------------------

        if (!name) {

            productMessage.textContent =
                "Please enter a product name.";

            return;

        }


        if (
            isNaN(price) ||
            price < 0
        ) {

            productMessage.textContent =
                "Please enter a valid price.";

            return;

        }


        productMessage.textContent =
            "Adding product...";



        // --------------------------------
        // IMAGE URL
        // --------------------------------

        let imageURL =
            null;



        // =================================
        // UPLOAD IMAGE
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
                error:
                    uploadError
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



            // --------------------------------
            // GET PUBLIC IMAGE URL
            // --------------------------------

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
                publicURLData
                    .publicUrl;

        }



        // =================================
        // INSERT PRODUCT
        // =================================

        const {
            data:
                insertedProduct,

            error
        } =

            await supabaseClient
                .from(
                    "products"
                )
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

                })

                .select()
                .single();



        // =================================
        // HANDLE ERROR
        // =================================

        if (error) {

            console.error(
                "Add product error:",
                error
            );


            productMessage.textContent =
                "Failed to add product: " +
                error.message;


            return;

        }



        // =================================
        // SUCCESS
        // =================================

        console.log(
            "Product added:",
            insertedProduct
        );


        productMessage.textContent =
            "Product added successfully!";


        // Reset form

        productForm.reset();


        // Clear preview

        imagePreview.innerHTML =
            "";



        // =================================
        // RELOAD PRODUCT LIST
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
            .from(
                "products"
            )
            .select("*")
            .order(
                "created_at",
                {
                    ascending:
                        false
                }
            );



    // =================================
    // DATABASE ERROR
    // =================================

    if (error) {

        console.error(
            "LOAD PRODUCTS ERROR:",
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



    // =================================
    // DEBUG
    // =================================

    console.log(
        "PRODUCTS FROM SUPABASE:",
        data
    );



    // =================================
    // NO PRODUCTS
    // =================================

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



    // =================================
    // CLEAR LIST
    // =================================

    productsList.innerHTML =
        "";



    // =================================
    // DISPLAY PRODUCTS
    // =================================

    data.forEach(
        product => {


            const item =
                document
                    .createElement(
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


                <button

                    class="delete-btn"

                    onclick="
                        deleteProduct(
                            '${product.id}'
                        )
                    "

                >

                    Delete

                </button>

            `;



            productsList
                .appendChild(
                    item
                );

        }
    );

}



// ========================================
// DELETE PRODUCT
// ========================================

async function deleteProduct(
    id
) {


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
            .from(
                "products"
            )
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
// REFRESH BUTTON
// ========================================

refreshBtn.addEventListener(
    "click",
    async () => {

        await loadProducts();

    }
);



// ========================================
// START APPLICATION
// ========================================

checkUser();
