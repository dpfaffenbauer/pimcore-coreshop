/* STYLES  */
import '../scss/app.scss';
import 'swiper/css/bundle';

/* JS */
import 'bootstrap';
import './scripts/handle-prototypes.js';
import './plugin/coreshop.plugin.quantity.js';
import './plugin/coreshop.plugin.variant.js';
import './scripts/shop.js';
import './scripts/variant.js';
import './scripts/map.js';
import {Carousel} from './scripts/carousel';
import {CartInfo} from './scripts/cartInfo';

new CartInfo('/coreshop_get_cart_items', '.js-cart-widget');
new Carousel();