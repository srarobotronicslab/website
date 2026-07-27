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
// STATE
// ========================================

let orders = [];

let selectedOrder = null;


// ========================================
// DOM ELEMENTS
// ========================================

const ordersTableBody =
    document.getElementById(
        "ordersTableBody"
    );

const searchInput =
    document.getElementById(
        "searchInput"
    );

const statusFilter =
    document.getElementById(
        "statusFilter"
    );

const paymentFilter =
    document.getElementById(
        "paymentFilter"
    );

const refreshBtn =
    document.getElementById(
        "refreshBtn"
    );

const orderModal =
    document.getElementById(
        "orderModal"
    );

const closeModalBtn =
    document.getElementById(
        "closeModalBtn"
    );

const orderDetails =
    document.getElementById(
        "orderDetails"
    );

const modalOrderId =
    document.getElementById(
        "modalOrderId"
    );


// ========================================
// LOAD ORDERS
// ========================================

async function loadOrders() {

    ordersTableBody.innerHTML = `

        <tr>

            <td
                colspan="8"
                class="loading"
            >

                Loading orders...

            </td>

        </tr>

    `;


    try {

        const {

            data,

            error

        } =

            await supabaseClient

                .from("orders")

                .select("*")

                .order(

                    "created_at",

                    {
                        ascending: false
                    }

                );


        if (error) {

            throw error;

        }


        orders = data || [];


        updateStatistics();

        renderOrders();

    }


    catch (error) {

        console.error(

            "Load orders error:",

            error

        );


        ordersTableBody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="loading"
                >

                    Failed to load orders:

                    ${escapeHTML(
                        error.message
                    )}

                </td>

            </tr>

        `;

    }

}


// ========================================
// STATISTICS
// ========================================

function updateStatistics() {

    const total =
        orders.length;


    const pending =

        orders.filter(

            order =>

                order.order_status ===
                "pending"

        ).length;


    const processing =

        orders.filter(

            order =>

                order.order_status ===
                "processing"

        ).length;


    const shipped =

        orders.filter(

            order =>

                order.order_status ===
                "shipped"

        ).length;


    const delivered =

        orders.filter(

            order =>

                order.order_status ===
                "delivered"

        ).length;


    const revenue =

        orders.reduce(

            (
                sum,
                order
            ) =>

                sum +

                (
                    Number(
                        order.total_amount
                    ) || 0
                ),

            0

        );


    document.getElementById(
        "totalOrders"
    ).textContent = total;


    document.getElementById(
        "pendingOrders"
    ).textContent = pending;


    document.getElementById(
        "processingOrders"
    ).textContent = processing;


    document.getElementById(
        "shippedOrders"
    ).textContent = shipped;


    document.getElementById(
        "deliveredOrders"
    ).textContent = delivered;


    document.getElementById(
        "totalRevenue"
    ).textContent =

        "৳" +

        revenue.toLocaleString();

}


// ========================================
// FILTER ORDERS
// ========================================

function getFilteredOrders() {

    const search =

        searchInput.value

            .trim()

            .toLowerCase();


    const status =

        statusFilter.value;


    const payment =

        paymentFilter.value;


    return orders.filter(

        order => {

            const matchesSearch =

                !search ||

                String(
                    order.id
                )
                    .toLowerCase()
                    .includes(search) ||

                String(
                    order.customer_name
                )
                    .toLowerCase()
                    .includes(search) ||

                String(
                    order.phone
                )
                    .toLowerCase()
                    .includes(search);


            const matchesStatus =

                status === "all" ||

                order.order_status ===
                status;


            const matchesPayment =

                payment === "all" ||

                order.payment_status ===
                payment;


            return (

                matchesSearch &&

                matchesStatus &&

                matchesPayment

            );

        }

    );

}


// ========================================
// RENDER ORDERS
// ========================================

function renderOrders() {

    const filteredOrders =

        getFilteredOrders();


    if (

        filteredOrders.length ===
        0

    ) {

        ordersTableBody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="loading"
                >

                    No orders found.

                </td>

            </tr>

        `;

        return;

    }


    ordersTableBody.innerHTML =

        filteredOrders

            .map(

                order => {

                    const shortId =

                        order.id.substring(
                            0,
                            8
                        );


                    const date =

                        new Date(
                            order.created_at
                        ).toLocaleString();


                    return `

                        <tr>

                            <td>

                                <span
                                    class="order-id"
                                >

                                    #${shortId}

                                </span>

                            </td>


                            <td>

                                <span
                                    class="customer-name"
                                >

                                    ${escapeHTML(
                                        order.customer_name
                                    )}

                                </span>

                            </td>


                            <td>

                                ${escapeHTML(
                                    order.phone
                                )}

                            </td>


                            <td>

                                <strong>

                                    ৳${Number(
                                        order.total_amount
                                    ).toLocaleString()}

                                </strong>

                            </td>


                            <td>

                                <span
                                    class="badge ${getBadgeClass(
                                        order.payment_status
                                    )}"
                                >

                                    ${escapeHTML(
                                        order.payment_status
                                    )}

                                </span>

                            </td>


                            <td>

                                <span
                                    class="badge ${getBadgeClass(
                                        order.order_status
                                    )}"
                                >

                                    ${escapeHTML(
                                        order.order_status
                                    )}

                                </span>

                            </td>


                            <td>

                                <span
                                    class="date"
                                >

                                    ${date}

                                </span>

                            </td>


                            <td>

                                <button

                                    class="view-btn"

                                    onclick="openOrder('${order.id}')"

                                >

                                    View

                                </button>

                            </td>

                        </tr>

                    `;

                }

            )

            .join("");

}


// ========================================
// OPEN ORDER
// ========================================

async function openOrder(orderId) {

    selectedOrder =

        orders.find(

            order =>

                order.id ===
                orderId

        );


    if (!selectedOrder) {

        return;

    }


    modalOrderId.textContent =

        "#" +

        selectedOrder.id;


    orderDetails.innerHTML = `

        <div class="loading">

            Loading order items...

        </div>

    `;


    orderModal.classList.add(
        "show"
    );


    try {

        const {

            data: items,

            error

        } =

            await supabaseClient

                .from(
                    "order_items"
                )

                .select("*")

                .eq(
                    "order_id",
                    orderId
                );


        if (error) {

            throw error;

        }


        renderOrderDetails(

            selectedOrder,

            items || []

        );

    }


    catch (error) {

        console.error(
            error
        );


        orderDetails.innerHTML = `

            <p>

                Failed to load order items:

                ${escapeHTML(
                    error.message
                )}

            </p>

        `;

    }

}


// ========================================
// RENDER ORDER DETAILS
// ========================================

function renderOrderDetails(

    order,

    items

) {

    const itemsHTML =

        items

            .map(

                item => `

                    <div
                        class="item-row"
                    >

                        <div
                            class="item-info"
                        >

                            <strong>

                                ${escapeHTML(
                                    item.product_name
                                )}

                            </strong>

                            <span>

                                ৳${Number(
                                    item.product_price
                                ).toLocaleString()}

                                ×

                                ${item.quantity}

                            </span>

                        </div>


                        <div
                            class="item-price"
                        >

                            ৳${Number(
                                item.subtotal
                            ).toLocaleString()}

                        </div>

                    </div>

                `

            )

            .join("");


    orderDetails.innerHTML = `

        <!-- CUSTOMER -->

        <div class="detail-section">

            <h3>
                Customer Information
            </h3>


            <div class="customer-grid">

                <div class="detail-item">

                    <span>
                        Name
                    </span>

                    <strong>

                        ${escapeHTML(
                            order.customer_name
                        )}

                    </strong>

                </div>


                <div class="detail-item">

                    <span>
                        Phone
                    </span>

                    <strong>

                        ${escapeHTML(
                            order.phone
                        )}

                    </strong>

                </div>


                <div class="detail-item">

                    <span>
                        Delivery Address
                    </span>

                    <strong>

                        ${escapeHTML(
                            order.delivery_address
                        )}

                    </strong>

                </div>


                <div class="detail-item">

                    <span>
                        Order Date
                    </span>

                    <strong>

                        ${new Date(
                            order.created_at
                        ).toLocaleString()}

                    </strong>

                </div>

            </div>

        </div>


        <!-- ITEMS -->

        <div class="detail-section">

            <h3>
                Order Items
            </h3>


            ${

                itemsHTML ||

                "<p>No items found.</p>"

            }


            <div class="summary-row">

                <span>
                    Subtotal
                </span>

                <strong>

                    ৳${Number(
                        order.subtotal
                    ).toLocaleString()}

                </strong>

            </div>


            <div class="summary-row">

                <span>
                    Delivery Fee
                </span>

                <strong>

                    ৳${Number(
                        order.delivery_fee
                    ).toLocaleString()}

                </strong>

            </div>


            <div class="summary-row total">

                <span>
                    Total
                </span>

                <strong>

                    ৳${Number(
                        order.total_amount
                    ).toLocaleString()}

                </strong>

            </div>

        </div>


        <!-- PAYMENT -->

        <div class="detail-section">

            <h3>
                Payment Information
            </h3>


            <div class="customer-grid">

                <div class="detail-item">

                    <span>
                        Payment Method
                    </span>

                    <strong>

                        ${escapeHTML(
                            order.payment_method
                        )}

                    </strong>

                </div>


                <div class="detail-item">

                    <span>
                        Transaction Last 2
                    </span>

                    <strong>

                        ${escapeHTML(

                            order.payment_sender_last_two ||

                            "Not provided"

                        )}

                    </strong>

                </div>


                <div class="detail-item">

                    <span>
                        Payment Status
                    </span>

                    <strong>

                        ${escapeHTML(
                            order.payment_status
                        )}

                    </strong>

                </div>

            </div>

        </div>


        <!-- STATUS -->

        <div class="detail-section">

            <h3>
                Update Order
            </h3>


            <div class="status-controls">


                <div class="status-control">

                    <label>
                        Order Status
                    </label>


                    <select id="modalOrderStatus">

                        ${createStatusOptions(

                            [

                                "pending",

                                "confirmed",

                                "processing",

                                "shipped",

                                "delivered",

                                "cancelled"

                            ],

                            order.order_status

                        )}

                    </select>

                </div>


                <div class="status-control">

                    <label>
                        Payment Status
                    </label>


                    <select id="modalPaymentStatus">

                        ${createStatusOptions(

                            [

                                "pending",

                                "submitted",

                                "verified",

                                "failed",

                                "refunded"

                            ],

                            order.payment_status

                        )}

                    </select>

                </div>


            </div>


            <button

                class="update-btn"

                onclick="updateOrderStatus()"

            >

                Update Order

            </button>


        </div>


        <!-- DELETE ORDER -->

        <div class="detail-section delete-section">

            <h3>
                Danger Zone
            </h3>


            <p>

                Permanently delete this order
                and all associated order items.

                This action cannot be undone.

            </p>


            <button

                class="delete-order-btn"

                onclick="deleteOrder('${order.id}')"

            >

                Delete Order

            </button>

        </div>

    `;

}


// ========================================
// CREATE SELECT OPTIONS
// ========================================

function createStatusOptions(

    statuses,

    selected

) {

    return statuses

        .map(

            status => `

                <option

                    value="${status}"

                    ${

                        status === selected

                            ? "selected"

                            : ""

                    }

                >

                    ${status

                        .charAt(0)

                        .toUpperCase() +

                    status.slice(1)}

                </option>

            `

        )

        .join("");

}


// ========================================
// UPDATE ORDER STATUS
// ========================================

async function updateOrderStatus() {

    if (!selectedOrder) {

        return;

    }


    const newOrderStatus =

        document.getElementById(
            "modalOrderStatus"
        ).value;


    const newPaymentStatus =

        document.getElementById(
            "modalPaymentStatus"
        ).value;


    try {

        const {

            error

        } =

            await supabaseClient

                .from("orders")

                .update({

                    order_status:
                        newOrderStatus,

                    payment_status:
                        newPaymentStatus

                })

                .eq(

                    "id",

                    selectedOrder.id

                );


        if (error) {

            throw error;

        }


        showMessage(

            "Order updated successfully.",

            "success"

        );


        selectedOrder.order_status =

            newOrderStatus;


        selectedOrder.payment_status =

            newPaymentStatus;


        updateStatistics();

        renderOrders();

        closeModal();

    }


    catch (error) {

        console.error(

            "Update order error:",

            error

        );


        showMessage(

            "Failed to update order: " +

            error.message,

            "error"

        );

    }

}


// ========================================
// DELETE ORDER
// ========================================

async function deleteOrder(orderId) {

    if (!orderId) {

        return;

    }


    const order =

        orders.find(

            item =>

                item.id ===
                orderId

        );


    if (!order) {

        showMessage(

            "Order not found.",

            "error"

        );

        return;

    }


    const shortId =

        orderId.substring(
            0,
            8
        );


    // ====================================
    // CONFIRMATION
    // ====================================

    const confirmed =

        confirm(

            "Are you sure you want to permanently delete Order #" +

            shortId +

            "?\n\n" +

            "Customer: " +

            order.customer_name +

            "\n" +

            "Total: ৳" +

            Number(
                order.total_amount
            ).toLocaleString() +

            "\n\n" +

            "This will also delete all order items.\n" +

            "This action cannot be undone."

        );


    if (!confirmed) {

        return;

    }


    try {

        // =================================
        // DELETE ORDER ITEMS FIRST
        // =================================

        const {

            error: itemsError

        } =

            await supabaseClient

                .from(
                    "order_items"
                )

                .delete()

                .eq(

                    "order_id",

                    orderId

                );


        if (itemsError) {

            throw new Error(

                "Failed to delete order items: " +

                itemsError.message

            );

        }


        // =================================
        // DELETE MAIN ORDER
        // =================================

        const {

            error: orderError

        } =

            await supabaseClient

                .from(
                    "orders"
                )

                .delete()

                .eq(

                    "id",

                    orderId

                );


        if (orderError) {

            throw new Error(

                "Failed to delete order: " +

                orderError.message

            );

        }


        // =================================
        // REMOVE FROM LOCAL ARRAY
        // =================================

        orders =

            orders.filter(

                order =>

                    order.id !==
                    orderId

            );


        selectedOrder = null;


        // =================================
        // UPDATE UI
        // =================================

        updateStatistics();

        renderOrders();

        closeModal();


        showMessage(

            "Order #" +

            shortId +

            " deleted successfully.",

            "success"

        );

    }


    catch (error) {

        console.error(

            "Delete order error:",

            error

        );


        showMessage(

            "Failed to delete order: " +

            error.message,

            "error"

        );

    }

}


// ========================================
// CLOSE MODAL
// ========================================

function closeModal() {

    orderModal.classList.remove(
        "show"
    );

    selectedOrder = null;

}


closeModalBtn.addEventListener(

    "click",

    closeModal

);


orderModal.addEventListener(

    "click",

    event => {

        if (

            event.target ===
            orderModal

        ) {

            closeModal();

        }

    }

);


// ========================================
// SEARCH & FILTER EVENTS
// ========================================

searchInput.addEventListener(

    "input",

    renderOrders

);


statusFilter.addEventListener(

    "change",

    renderOrders

);


paymentFilter.addEventListener(

    "change",

    renderOrders

);


refreshBtn.addEventListener(

    "click",

    loadOrders

);


// ========================================
// MESSAGE
// ========================================

function showMessage(

    message,

    type

) {

    const element =

        document.getElementById(

            "adminMessage"

        );


    element.textContent =

        message;


    element.className =

        "admin-message show";


    if (

        type === "error"

    ) {

        element.style.background =

            "#b91c1c";

    }

    else {

        element.style.background =

            "#15803d";

    }


    setTimeout(

        () => {

            element.classList.remove(
                "show"
            );

        },

        3000

    );

}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(

    value

) {

    if (

        value === null ||

        value === undefined

    ) {

        return "";

    }


    const div =

        document.createElement(
            "div"
        );


    div.textContent =

        String(value);


    return div.innerHTML;

}


// ========================================
// BADGE CLASS
// ========================================

function getBadgeClass(

    status

) {

    return String(

        status || ""

    )

        .toLowerCase()

        .replace(

            /\s+/g,

            "-"

        );

}


// ========================================
// INITIALIZE
// ========================================

loadOrders();
