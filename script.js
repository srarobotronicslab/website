/* =========================================
   HEADER SCROLL EFFECT
========================================= */

const header = document.querySelector(".header");

window.addEventListener("scroll", () => {

    if (window.scrollY > 20) {

        header.style.boxShadow =
            "0 8px 30px rgba(0,0,0,0.08)";

    } else {

        header.style.boxShadow = "none";

    }

});


/* =========================================
   MOBILE MENU
========================================= */

const menuButton =
    document.getElementById("menuButton");

const topNav =
    document.querySelector(".top-nav");


menuButton.addEventListener("click", () => {

    if (topNav.style.display === "flex") {

        topNav.style.display = "none";

    } else {

        topNav.style.display = "flex";

        topNav.style.position = "absolute";

        topNav.style.top = "68px";

        topNav.style.left = "20px";

        topNav.style.right = "20px";

        topNav.style.padding = "15px";

        topNav.style.flexDirection = "column";

        topNav.style.background = "#fefefe";

        topNav.style.borderRadius = "15px";

        topNav.style.boxShadow =
            "0 15px 40px rgba(0,0,0,0.12)";

    }

});


/* =========================================
   CURRENT YEAR
========================================= */

document.getElementById("year").textContent =
    new Date().getFullYear();
