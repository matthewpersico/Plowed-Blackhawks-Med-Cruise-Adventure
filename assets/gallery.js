(() => {
    "use strict";


    const lightbox =
        document.getElementById("lightbox");

    const lightboxImage =
        document.getElementById("lightbox-image");

    const lightboxVideo =
        document.getElementById("lightbox-video");

    const lightboxCaption =
        document.getElementById("lightbox-caption");


    const closeButton =
        document.getElementById("lightbox-close");

    const prevButton =
        document.getElementById("lightbox-prev");

    const nextButton =
        document.getElementById("lightbox-next");


    let currentGallery = [];
    let currentIndex = 0;



    /*
     * Stop and reset the current video.
     */

    function stopVideo() {

        lightboxVideo.pause();

        lightboxVideo.removeAttribute("src");

        lightboxVideo.load();

        lightboxVideo.style.display = "none";
    }



    /*
     * Hide the image.
     */

    function hideImage() {

        lightboxImage.style.display = "none";

        lightboxImage.removeAttribute("src");
    }



    /*
     * Display one gallery item.
     */

    function showItem(index) {

        if (currentGallery.length === 0) {
            return;
        }


        if (index < 0) {

            index =
                currentGallery.length - 1;
        }


        if (
            index >=
            currentGallery.length
        ) {

            index = 0;
        }


        currentIndex = index;


        const item =
            currentGallery[currentIndex];

        const type =
            item.dataset.type;

        const filename =
            item.dataset.filename || "";


        /*
         * Stop whatever was previously displayed.
         */

        stopVideo();
        hideImage();


        if (type === "video") {

            lightboxVideo.src =
                item.href;

            lightboxVideo.style.display =
                "block";

            /*
             * Do not force autoplay.
             *
             * This avoids surprising users with
             * sound and works better on phones.
             */

            lightboxVideo.load();

        } else {

            const thumbnail =
                item.querySelector("img");

            lightboxImage.src =
                item.href;

            lightboxImage.alt =
                thumbnail
                    ? thumbnail.alt
                    : filename;

            lightboxImage.style.display =
                "block";
        }


        lightboxCaption.textContent =
            filename;


        lightbox.classList.add("open");

        lightbox.setAttribute(
            "aria-hidden",
            "false"
        );


        document.body.style.overflow =
            "hidden";
    }



    /*
     * Close the lightbox.
     */

    function closeLightbox() {

        stopVideo();
        hideImage();


        lightbox.classList.remove("open");

        lightbox.setAttribute(
            "aria-hidden",
            "true"
        );


        lightboxCaption.textContent = "";

        document.body.style.overflow = "";
    }



    function previousItem() {

        showItem(
            currentIndex - 1
        );
    }



    function nextItem() {

        showItem(
            currentIndex + 1
        );
    }



    /*
     * Attach click handlers separately to each
     * person's gallery.
     *
     * That means previous/next navigation never
     * crosses from one person's collection into
     * another person's collection.
     */

    document
        .querySelectorAll(".gallery")
        .forEach(gallery => {

            const items = Array.from(
                gallery.querySelectorAll(
                    ".gallery-item"
                )
            );


            items.forEach(
                (item, index) => {

                    item.addEventListener(
                        "click",
                        event => {

                            event.preventDefault();

                            currentGallery =
                                items;

                            showItem(index);
                        }
                    );

                }
            );

        });



    /*
     * Lightbox controls.
     */

    closeButton.addEventListener(
        "click",
        closeLightbox
    );


    prevButton.addEventListener(
        "click",
        previousItem
    );


    nextButton.addEventListener(
        "click",
        nextItem
    );



    /*
     * Clicking the dark background closes
     * the lightbox.
     *
     * Clicking the actual photo or video does not.
     */

    lightbox.addEventListener(
        "click",
        event => {

            if (
                event.target === lightbox
            ) {

                closeLightbox();
            }

        }
    );



    /*
     * Keyboard navigation.
     */

    document.addEventListener(
        "keydown",
        event => {

            if (
                !lightbox.classList.contains(
                    "open"
                )
            ) {

                return;
            }


            switch (event.key) {

                case "Escape":

                    closeLightbox();

                    break;


                case "ArrowLeft":

                    previousItem();

                    break;


                case "ArrowRight":

                    nextItem();

                    break;
            }

        }
    );



    /*
     * Touch swipe navigation.
     */

    let touchStartX = null;
    let touchStartY = null;


    lightbox.addEventListener(
        "touchstart",
        event => {

            if (
                event.touches.length !== 1
            ) {

                return;
            }


            touchStartX =
                event.touches[0].clientX;

            touchStartY =
                event.touches[0].clientY;

        },
        {
            passive: true
        }
    );



    lightbox.addEventListener(
        "touchend",
        event => {

            if (
                touchStartX === null ||
                touchStartY === null ||
                event.changedTouches.length !== 1
            ) {

                return;
            }


            const touchEndX =
                event.changedTouches[0].clientX;

            const touchEndY =
                event.changedTouches[0].clientY;


            const distanceX =
                touchEndX - touchStartX;

            const distanceY =
                touchEndY - touchStartY;


            touchStartX = null;
            touchStartY = null;


            /*
             * Ignore primarily vertical movement.
             *
             * This prevents normal phone scrolling
             * gestures from changing pictures.
             */

            if (
                Math.abs(distanceY) >
                Math.abs(distanceX)
            ) {

                return;
            }


            /*
             * Ignore small movements that were
             * probably taps rather than swipes.
             */

            if (
                Math.abs(distanceX) < 50
            ) {

                return;
            }


            if (distanceX > 0) {

                previousItem();

            } else {

                nextItem();
            }

        },
        {
            passive: true
        }
    );

})();
