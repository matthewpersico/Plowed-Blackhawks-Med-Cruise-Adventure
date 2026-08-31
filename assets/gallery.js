(() => {
    "use strict";

    const lightbox = document.getElementById("lightbox");
    const lightboxImage = document.getElementById("lightbox-image");
    const lightboxCaption = document.getElementById("lightbox-caption");

    const closeButton = document.getElementById("lightbox-close");
    const prevButton = document.getElementById("lightbox-prev");
    const nextButton = document.getElementById("lightbox-next");

    let currentGallery = [];
    let currentIndex = 0;


    function showPhoto(index) {
        if (currentGallery.length === 0) {
            return;
        }

        if (index < 0) {
            index = currentGallery.length - 1;
        }

        if (index >= currentGallery.length) {
            index = 0;
        }

        currentIndex = index;

        const item = currentGallery[currentIndex];
        const image = item.querySelector("img");

        lightboxImage.src = item.href;
        lightboxImage.alt = image.alt;

        lightboxCaption.textContent =
            item.dataset.filename || "";

        lightbox.classList.add("open");
        lightbox.setAttribute("aria-hidden", "false");

        document.body.style.overflow = "hidden";
    }


    function closeLightbox() {
        lightbox.classList.remove("open");
        lightbox.setAttribute("aria-hidden", "true");

        lightboxImage.src = "";

        document.body.style.overflow = "";
    }


    function previousPhoto() {
        showPhoto(currentIndex - 1);
    }


    function nextPhoto() {
        showPhoto(currentIndex + 1);
    }


    document.querySelectorAll(".gallery").forEach(gallery => {

        const items = Array.from(
            gallery.querySelectorAll(".gallery-item")
        );

        items.forEach((item, index) => {

            item.addEventListener("click", event => {

                event.preventDefault();

                currentGallery = items;
                showPhoto(index);

            });

        });

    });


    closeButton.addEventListener("click", closeLightbox);
    prevButton.addEventListener("click", previousPhoto);
    nextButton.addEventListener("click", nextPhoto);


    lightbox.addEventListener("click", event => {

        if (event.target === lightbox) {
            closeLightbox();
        }

    });


    document.addEventListener("keydown", event => {

        if (!lightbox.classList.contains("open")) {
            return;
        }

        switch (event.key) {

            case "Escape":
                closeLightbox();
                break;

            case "ArrowLeft":
                previousPhoto();
                break;

            case "ArrowRight":
                nextPhoto();
                break;

        }

    });


    /*
     * Touch swipe support.
     */

    let touchStartX = null;

    lightbox.addEventListener(
        "touchstart",
        event => {

            if (event.touches.length === 1) {
                touchStartX = event.touches[0].clientX;
            }

        },
        { passive: true }
    );


    lightbox.addEventListener(
        "touchend",
        event => {

            if (
                touchStartX === null ||
                event.changedTouches.length !== 1
            ) {
                return;
            }

            const touchEndX =
                event.changedTouches[0].clientX;

            const distance =
                touchEndX - touchStartX;

            touchStartX = null;

            /*
             * Ignore small movements that are probably
             * taps rather than intentional swipes.
             */

            if (Math.abs(distance) < 50) {
                return;
            }

            if (distance > 0) {
                previousPhoto();
            } else {
                nextPhoto();
            }

        },
        { passive: true }
    );

})();
