import Swiper from 'swiper';
import {Thumbs} from "swiper/modules";

export class Carousel {
    constructor() {
        this._initCarousel();
    }

    _initCarousel = () => {
        /* Init swiper with thumbs */
        const sliderThumbnail = new Swiper('.js-slider-thumbnail', {
            slidesPerView: 3,
            freeMode: true,
            spaceBetween: '8px',
            watchSlidesProgress: true,
        });
        const mainSlider = new Swiper('.js-slider', {
            modules: [Thumbs], // Include the Thumbs module
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            thumbs: {
                swiper: sliderThumbnail // Link thumbnail swiper
            }
        });

        console.log(mainSlider);
    }
}
