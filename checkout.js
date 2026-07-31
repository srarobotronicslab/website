} catch (err) {
            console.error("Supabase Error Details:", err);
            // This will show the real error directly on the screen
            showMsg("Error: " + (err.message || JSON.stringify(err)), "error");
            placeOrderBtn.disabled = false;
            placeOrderBtn.textContent = "Place Order";
        }
