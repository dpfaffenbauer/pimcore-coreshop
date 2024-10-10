/* STYLES  */
import '../scss/app.scss';
import 'swiper/css/bundle';

/* JS */
import 'bootstrap';
import Swiper from 'swiper';
import './scripts/handle-prototypes.js';
import './plugin/coreshop.plugin.quantity.js';
import './plugin/coreshop.plugin.variant.js';
import './scripts/shop.js';
import './scripts/variant.js';
import './scripts/map.js';
import {Thumbs} from "swiper/modules";

/* Init swiper with thumbs */
const sliderThumbnail = new Swiper('.js-slider-thumbnail', {
    slidesPerView: 3,
    freeMode: true,
    spaceBetween: '8px',
    watchSlidesProgress: true,
});
const slider = new Swiper('.js-slider', {
    modules: [Thumbs],
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    thumbs: {
        swiper: sliderThumbnail
    }
});