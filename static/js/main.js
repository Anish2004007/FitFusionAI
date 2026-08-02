console.log("Main.js Loaded!");

window.addEventListener("scroll", function () {

    console.log("Scrolling...", window.scrollY);

    const navbar = document.querySelector(".navbar");

    if (window.scrollY > 0) {
    navbar.classList.add("scrolled");
} else {
    navbar.classList.remove("scrolled");
}

});