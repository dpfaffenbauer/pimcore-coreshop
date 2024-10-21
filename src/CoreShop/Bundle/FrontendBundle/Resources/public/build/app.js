/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./js/plugin/coreshop.plugin.quantity.js":
/*!***********************************************!*\
  !*** ./js/plugin/coreshop.plugin.quantity.js ***!
  \***********************************************/
/***/ (() => {

(function () {
  function coreshopQuantitySelector(options) {
    initQuantityFields(options);
  }
  function initQuantityFields(options) {
    const fields = document.querySelectorAll('input.cs-unit-input');
    const precisionPresetSelector = document.querySelector('select.cs-unit-selector');
    if (precisionPresetSelector) {
      // Listen to unit definition selector
      precisionPresetSelector.addEventListener('change', function () {
        if (!this.dataset.csUnitIdentifier) {
          return;
        }
        const selectedOption = this.options[this.selectedIndex];
        const quantityIdentifier = this.dataset.csUnitIdentifier;
        const quantityInput = document.querySelector("input[data-cs-unit-identifier=\"".concat(quantityIdentifier, "\"]"));

        // Set step to 1 or whatever integer value you want
        const step = 1; // Change this if you want a different increment

        if (!quantityInput) {
          return;
        }

        // Use integer step directly
        quantityInput.step = step; // Set step as an integer
        quantityInput.dataset.csUnitPrecision = 0; // Optional, since precision is no longer relevant

        // Update input settings
        updateTouchSpinSettings(quantityInput, 0, step.toString());
      });
    }
    if (fields) {
      // Initialize quantity fields with integer step
      fields.forEach(function (field) {
        // You might not need precision anymore
        initializeTouchSpin(field, 0, '1', options); // Change '1' to your desired integer increment
      });
    }
  }
  function initializeTouchSpin(input, precision, step, options) {
    const container = document.createElement('div');
    container.classList.add('touchspin-container');
    const decrementButton = document.createElement('button');
    decrementButton.type = 'button';
    decrementButton.textContent = '-';
    decrementButton.classList.add('touchspin-decrement');
    const incrementButton = document.createElement('button');
    incrementButton.type = 'button';
    incrementButton.textContent = '+';
    incrementButton.classList.add('touchspin-increment');
    input.parentNode.insertBefore(container, input);
    container.appendChild(decrementButton);
    container.appendChild(input);
    container.appendChild(incrementButton);

    // Set up event listeners for increment and decrement
    decrementButton.addEventListener('click', function () {
      let value = parseInt(input.value) || 0; // Ensure value is an integer
      value -= parseInt(step); // Decrement by integer step
      if (value >= 0) {
        input.value = value;
      }
    });
    incrementButton.addEventListener('click', function () {
      let value = parseInt(input.value) || 0; // Ensure value is an integer
      value += parseInt(step); // Increment by integer step
      input.value = value;
    });

    // Add input validation based on integer value
    input.addEventListener('input', function () {
      let value = parseInt(input.value);
      if (isNaN(value)) {
        input.value = 0; // Default to zero if invalid input
      } else {
        input.value = value; // Keep it as an integer
      }
    });
  }
  function updateTouchSpinSettings(input, precision, step) {
    input.min = 0;
    input.max = 1000000000;
    input.step = step;
    input.dataset.csUnitPrecision = precision;
  }

  // Export the function to the global scope
  window.coreshopQuantitySelector = coreshopQuantitySelector;
})();

/***/ }),

/***/ "./js/plugin/coreshop.plugin.variant.js":
/*!**********************************************!*\
  !*** ./js/plugin/coreshop.plugin.variant.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

__webpack_require__(/*! core-js/modules/es.object.from-entries.js */ "../../../../../../../../node_modules/core-js/modules/es.object.from-entries.js");
(function () {
  const coreshopVariantSelector = function (attributeContainer) {
    let _attributeContainer = undefined;
    let _config = {};
    let _attributeGroups = [];
    const _clearGroup = function (group) {
      delete group.selected;
      group.elements.forEach(element => {
        element.disabled = true;
        element.checked = false;

        // remove options on select
        if (element.tagName.toLowerCase() === 'select') {
          const options = element.querySelectorAll('option:not([value=""])');
          options.forEach(option => {
            element.removeChild(option);
          });
        }
      });
    };
    const _clearGroups = function (group) {
      do {
        _clearGroup(group);
        group = group.nextGroup;
      } while (group);
    };
    const _filterAttributes = function (attributes, group) {
      let filterAttributes = [];
      group = group.prevGroup;
      while (group) {
        if (group.selected && group.nextGroup) {
          filterAttributes.push({
            group: group.group.id,
            selected: group.selected
          });
        }
        group = group.prevGroup;
      }
      let filtered = [];
      attributes.forEach(attribute => {
        attribute.products.forEach(product => {
          if (filterAttributes.every(x => {
            return _config.index[product.id]['attributes'].hasOwnProperty(x.group) && _config.index[product.id]['attributes'][x.group] === x.selected;
          }) && !filtered.includes(attribute)) {
            filtered.push(attribute);
          }
        });
      });
      return filtered.length ? filtered : attributes;
    };
    const _configureGroup = function (group) {
      let attributes = group.attributes.slice();
      attributes = _filterAttributes(attributes, group);
      if (attributes) {
        group.elements.forEach(element => {
          attributes.forEach(attribute => {
            // set options on select, otherwise only enable inputs
            if (element.tagName.toLowerCase() === 'select') {
              const option = new Option(attribute.attribute.name, attribute.attribute.id);
              option.id = 'attribute-' + attribute.attribute.id;
              if (group.selected === attribute.attribute.id) {
                option.selected = true;
              }
              element.add(option);
              element.disabled = false;
            } else {
              if (parseInt(element.dataset.group) === group.group.id && parseInt(element.value) === attribute.attribute.id) {
                element.disabled = false;
                if (group.selected === attribute.attribute.id) {
                  element.checked = true;
                }
              }
            }
          });
        });
      }
    };
    const _setupAttributeGroupSettings = function () {
      let index = _attributeGroups.length;
      while (index--) {
        _attributeGroups[index].prevGroup = _attributeGroups[index - 1];
        _attributeGroups[index].nextGroup = _attributeGroups[index + 1];
      }
      index = _attributeGroups.length;
      while (index--) {
        if (!index || _attributeGroups[index].selected) {
          _configureGroup(_attributeGroups[index]);
        } else {
          _clearGroup(_attributeGroups[index]);
        }
      }
    };
    const _setupChangeEvents = function () {
      _attributeGroups.forEach(group => {
        group.elements.forEach(element => {
          element.onchange = e => {
            _configureElement(group, element);
          };
        });
      });
    };
    const _init = function (attributeContainer) {
      if (!attributeContainer) {
        return;
      }
      _attributeContainer = attributeContainer;
      _config = JSON.parse(_attributeContainer.dataset.config);
      _config.attributes.forEach(group => {
        group.elements = _attributeContainer.querySelectorAll('[data-group="' + group.group.id + '"]');
        _attributeGroups.push(group);
      });
      _setupAttributeGroupSettings();
      _setupChangeEvents();
    };
    const _redirectToVariant = function () {
      const groups = _attributeGroups.filter(g => g.selected);
      const selected = Object.fromEntries(groups.map(g => {
        return [g.group.id, g.selected];
      }));
      const filtered = Object.values(_config.index).filter(p => {
        return JSON.stringify(p.attributes) === JSON.stringify(selected);
      });

      // length should always be 1, but let's check it
      if (filtered.length === 1 && filtered[0]['url']) {
        window.location.href = filtered[0]['url'];
      }
    };
    const _createEvent = function (name) {
      let data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return new CustomEvent('variant_selector.' + name, {
        bubbles: true,
        cancelable: false,
        detail: data
      });
    };
    const _configureElement = function (group, element) {
      window.variantReady = false;
      _attributeContainer.dispatchEvent(_createEvent('change', {
        element: element
      }));
      if (element.value) {
        group.selected = parseInt(element.value);
        if (group.nextGroup) {
          _attributeContainer.dispatchEvent(_createEvent('select', {
            element: element
          }));
          _clearGroups(group.nextGroup);
          _configureGroup(group.nextGroup);
        } else {
          _attributeContainer.dispatchEvent(_createEvent('redirect', {
            element: element
          }));
          _redirectToVariant();
        }
      } else {
        delete group.selected;
        if (group.nextGroup) {
          _clearGroups(group.nextGroup);
        }
      }
      window.variantReady = true;
    };
    _init(attributeContainer);
  };
  window.coreshopVariantSelector = coreshopVariantSelector;
})();

/***/ }),

/***/ "./js/scripts/handle-prototypes.js":
/*!*****************************************!*\
  !*** ./js/scripts/handle-prototypes.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

__webpack_require__(/*! core-js/modules/es.string.trim.js */ "../../../../../../../../node_modules/core-js/modules/es.string.trim.js");
(function () {
  'use strict';

  const methods = {
    init: function (options) {
      const settings = Object.assign({
        'prototypePrefix': false,
        'containerSelector': false,
        'selectorAttr': false
      }, options);
      const elements = document.querySelectorAll(this.selector);
      elements.forEach(function (element) {
        show(element, false);
        element.addEventListener('change', function () {
          show(element, true);
        });
        function show(element, replace) {
          let selectedValue = element.value;
          let prototypePrefix = element.id;
          if (settings.selectorAttr) {
            const selectedOption = Array.from(element.options).find(option => option.value === selectedValue);
            if (selectedOption) {
              selectedValue = selectedOption.getAttribute(settings.selectorAttr);
            }
          }
          if (settings.prototypePrefix) {
            prototypePrefix = settings.prototypePrefix;
          }
          const prototypeElement = document.getElementById(prototypePrefix + '_' + selectedValue);
          let container;
          if (settings.containerSelector) {
            container = document.querySelector(settings.containerSelector);
          } else {
            const dataContainerId = prototypeElement ? prototypeElement.dataset.container : null;
            container = document.getElementById(dataContainerId);
          }
          if (!container) {
            return;
          }
          if (!prototypeElement) {
            container.innerHTML = '';
            return;
          }
          if (replace || !container.innerHTML.trim()) {
            container.innerHTML = prototypeElement.dataset.prototype;
          }
        }
      });
    }
  };

  // Extending the prototype of NodeList
  NodeList.prototype.handlePrototypes = function (method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      throw new Error('Method ' + method + ' does not exist on handlePrototypes');
    }
  };

  // To allow calling handlePrototypes directly on any element
  HTMLElement.prototype.handlePrototypes = function (method) {
    return methods.handlePrototypes.call([this], method);
  };
})();

/***/ }),

/***/ "./js/scripts/map.js":
/*!***************************!*\
  !*** ./js/scripts/map.js ***!
  \***************************/
/***/ (() => {

document.addEventListener('DOMContentLoaded', function () {
  const mapBlock = document.getElementById('map-block');
  if (mapBlock) {
    mapBlock.style.height = document.getElementById('map-wrapper').clientHeight + 'px';
    function initialize() {
      const mapOptions = {
        zoom: 18,
        center: new google.maps.LatLng(48.1592513, 14.02302510000004),
        disableDefaultUI: true
      };
      const map = new google.maps.Map(mapBlock, mapOptions);
    }
    window.addEventListener('load', initialize);
  }
});

/***/ }),

/***/ "./js/scripts/shop.js":
/*!****************************!*\
  !*** ./js/scripts/shop.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

__webpack_require__(/*! core-js/modules/es.string.replace.js */ "../../../../../../../../node_modules/core-js/modules/es.string.replace.js");
__webpack_require__(/*! core-js/modules/es.string.trim.js */ "../../../../../../../../node_modules/core-js/modules/es.string.trim.js");
__webpack_require__(/*! core-js/modules/web.dom-collections.iterator.js */ "../../../../../../../../node_modules/core-js/modules/web.dom-collections.iterator.js");
__webpack_require__(/*! core-js/modules/web.url-search-params.js */ "../../../../../../../../node_modules/core-js/modules/web.url-search-params.js");
document.addEventListener('DOMContentLoaded', function () {
  shop.init();
});
function handlePrototypes(options) {
  const settings = {
    prototypePrefix: options.prototypePrefix || false,
    containerSelector: options.containerSelector || false,
    selectorAttr: options.selectorAttr || false
  };
  document.querySelectorAll("[data-".concat(settings.prototypePrefix, "]")).forEach(function (element) {
    show(element, false);
    element.addEventListener('change', function () {
      show(element, true);
    });
  });
  function show(element, replace) {
    let selectedValue = element.value;
    let prototypePrefix = element.id;
    if (settings.selectorAttr) {
      selectedValue = element.querySelector("[value=\"".concat(element.value, "\"]")).getAttribute(settings.selectorAttr);
    }
    if (settings.prototypePrefix) {
      prototypePrefix = settings.prototypePrefix;
    }
    const prototypeElement = document.getElementById("".concat(prototypePrefix, "_").concat(selectedValue));
    let container;
    if (settings.containerSelector) {
      container = document.querySelector(settings.containerSelector);
    } else {
      container = prototypeElement ? document.querySelector(prototypeElement.dataset.container) : null;
    }
    if (!container) {
      return;
    }
    if (!prototypeElement) {
      container.innerHTML = '';
      return;
    }
    if (replace || !container.innerHTML.trim()) {
      container.innerHTML = prototypeElement.dataset.prototype;
    }
  }
}
(function (shop) {
  shop.init = function () {
    shop.initChangeAddress();
    shop.initCartShipmentCalculator();
    shop.initQuantityValidator();
    shop.initCategorySelect();
    handlePrototypes({
      'prototypePrefix': 'paymentProvider',
      'containerSelector': '.paymentSettings',
      'selectorAttr': 'data-factory'
    });
    document.querySelectorAll('.copy-to-clipboard').forEach(function (button) {
      button.addEventListener('click', function () {
        const targetId = this.dataset.target;
        const copyText = document.getElementById(targetId);
        if (copyText) {
          copyText.select();
          copyText.setSelectionRange(0, 99999); // For mobile devices

          navigator.clipboard.writeText(copyText.value).then(() => {
            // Optionally show a tooltip or confirmation here
            // Example: using a tooltip library or custom implementation
            // Show tooltip logic goes here
            console.log(this.dataset.copiedText); // You can replace this with your tooltip logic
          });
        }
      });
    });
  };
  shop.initCategorySelect = function () {
    function updateQueryStringParameter(uri, key, value) {
      const re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
      const separator = uri.indexOf('?') !== -1 ? "&" : "?";
      if (uri.match(re)) {
        return uri.replace(re, '$1' + key + "=" + value + '$2');
      } else {
        return uri + separator + key + "=" + value;
      }
    }
    document.querySelectorAll(".site-reload").forEach(function (select) {
      select.addEventListener('change', function () {
        location.href = updateQueryStringParameter(window.location.href, this.name, this.value);
      });
    });
  };
  shop.initQuantityValidator = function () {
    coreshopQuantitySelector({
      buttondown_class: 'btn btn-secondary',
      buttonup_class: 'btn btn-secondary'
    });
  };
  shop.initCartShipmentCalculator = function () {
    document.addEventListener('submit', function (ev) {
      const form = ev.target.closest('form[name="coreshop_shipping_calculator"]');
      if (form) {
        ev.preventDefault();
        form.classList.add('loading');
        form.querySelector('button[type="submit"]').setAttribute('disabled', 'disabled');
        form.closest('.cart-shipment-calculation-box').querySelector('.cart-shipment-available-carriers').style.opacity = 0.2;
        fetch(form.action, {
          method: 'POST',
          body: new URLSearchParams(new FormData(form)) // Serialize form data
        }).then(response => response.text()).then(res => {
          form.classList.remove('loading');
          form.closest('.cart-shipment-calculation-box').outerHTML = res; // Replace the entire container
        }).catch(error => {
          console.error('Error:', error);
          form.classList.remove('loading');
          form.querySelector('button[type="submit"]').removeAttribute('disabled');
        });
      }
    });
  };
  shop.initChangeAddress = function () {
    const addressStep = document.querySelector('.checkout-step.step-address');
    if (!addressStep) {
      return;
    }
    const invoiceAddress = addressStep.querySelector('select[name="coreshop[invoiceAddress]"]');
    const invoicePanel = addressStep.querySelector('.panel-invoice-address');
    const invoiceField = addressStep.querySelector('.invoice-address-selector');
    const shippingAddress = addressStep.querySelector('select[name="coreshop[shippingAddress]"]');
    const shippingPanel = addressStep.querySelector('.panel-shipping-address');
    const shippingField = addressStep.querySelector('.shipping-address-selector');
    const shippingAddAddressButton = shippingPanel.parentElement.querySelector('.card-footer');
    const useIasS = addressStep.querySelector('[name="coreshop[useInvoiceAsShipping]"]');
    invoiceAddress.addEventListener('change', function () {
      const selected = this.options[this.selectedIndex];
      const addressDecode = JSON.parse(selected.dataset.address);
      const address = addressDecode.html;
      const addressType = selected.dataset.addressType;
      if (useIasS) {
        if (addressType === 'invoice') {
          useIasS.disabled = true;
          useIasS.checked = false;
          useIasS.dispatchEvent(new Event('change'));
        } else {
          useIasS.disabled = false;
        }
      }
      if (address) {
        invoicePanel.innerHTML = address;
        if (useIasS.checked) {
          shippingAddress.value = this.value;
          shippingAddress.dispatchEvent(new Event('change'));
        }
      } else {
        invoicePanel.innerHTML = '';
        if (useIasS.checked) {
          shippingPanel.innerHTML = '';
          shippingAddress.value = '';
          shippingAddress.dispatchEvent(new Event('change'));
        }
      }
    });
    shippingAddress.addEventListener('change', function () {
      const selected = this.options[this.selectedIndex];
      const addressDecode = JSON.parse(selected.dataset.address);
      const address = addressDecode.html;
      shippingPanel.innerHTML = address ? address : '';
    });
    if (!useIasS.checked && shippingAddAddressButton) {
      shippingAddAddressButton.classList.remove('d-none');
    }
    useIasS.addEventListener('change', function () {
      if (this.checked) {
        shippingField.style.display = 'none';
        const address = invoiceAddress.options[invoiceAddress.selectedIndex].dataset.address;
        const value = invoiceAddress.value;
        if (address) {
          shippingAddress.value = value;
          shippingAddress.dispatchEvent(new Event('change'));
        }
        if (shippingAddAddressButton) {
          shippingAddAddressButton.classList.add('d-none');
        }
      } else {
        shippingField.style.display = '';
        if (shippingAddAddressButton) {
          shippingAddAddressButton.classList.remove('d-none');
        }
      }
    });
    if (invoiceAddress.querySelector('option:checked')) {
      const selected = invoiceAddress.querySelector('option:checked');
      const addressDecode = JSON.parse(selected.dataset.address);
      const address = addressDecode.html;
      const addressType = invoiceAddress.querySelector('option:checked').dataset.addressType;
      if (useIasS) {
        if (addressType === 'invoice') {
          useIasS.disabled = true;
          useIasS.checked = false;
          useIasS.dispatchEvent(new Event('change'));
        } else {
          useIasS.disabled = false;
        }
      }
      if (address) {
        invoicePanel.innerHTML = address;
      }
    }
    if (shippingAddress.querySelector('option:checked')) {
      const selected = shippingAddress.querySelector('option:checked');
      const addressDecode = JSON.parse(selected.dataset.address);
      const address = addressDecode.html;
      if (address) {
        shippingPanel.innerHTML = address;
      }
    }
  };
})(window.shop = window.shop || {});

/***/ }),

/***/ "./js/scripts/variant.js":
/*!*******************************!*\
  !*** ./js/scripts/variant.js ***!
  \*******************************/
/***/ (() => {

(function (variant) {
  document.addEventListener('DOMContentLoaded', function () {
    window.variantReady = false;
    variant.init();
    window.variantReady = true;
  });
  variant.init = function () {
    const variants = document.querySelector('.product-info__attributes');
    if (!variants) {
      return;
    }
    coreshopVariantSelector(variants); // Ensure this function is defined in your global scope

    variants.addEventListener('variant_selector.select', e => {
      const options = document.querySelector('.product-info .product-details .options');
      if (options) {
        const submits = options.querySelectorAll('[type="submit"]');
        options.classList.add('disabled');
        submits.forEach(submit => {
          submit.disabled = true;
        });
      }
    });
  };
})(window.variant = window.variant || {});

/***/ }),

/***/ "./js/app.ts":
/*!*******************!*\
  !*** ./js/app.ts ***!
  \*******************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _scss_app_scss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../scss/app.scss */ "./scss/app.scss");
/* harmony import */ var swiper_css_bundle__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! swiper/css/bundle */ "./node_modules/swiper/swiper-bundle.css");
/* harmony import */ var bootstrap__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! bootstrap */ "./node_modules/bootstrap/dist/js/bootstrap.esm.js");
/* harmony import */ var _scripts_handle_prototypes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./scripts/handle-prototypes.js */ "./js/scripts/handle-prototypes.js");
/* harmony import */ var _scripts_handle_prototypes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_scripts_handle_prototypes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _plugin_coreshop_plugin_quantity_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./plugin/coreshop.plugin.quantity.js */ "./js/plugin/coreshop.plugin.quantity.js");
/* harmony import */ var _plugin_coreshop_plugin_quantity_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_plugin_coreshop_plugin_quantity_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _plugin_coreshop_plugin_variant_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./plugin/coreshop.plugin.variant.js */ "./js/plugin/coreshop.plugin.variant.js");
/* harmony import */ var _plugin_coreshop_plugin_variant_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_plugin_coreshop_plugin_variant_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _scripts_shop_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./scripts/shop.js */ "./js/scripts/shop.js");
/* harmony import */ var _scripts_shop_js__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_scripts_shop_js__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _scripts_variant_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./scripts/variant.js */ "./js/scripts/variant.js");
/* harmony import */ var _scripts_variant_js__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(_scripts_variant_js__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var _scripts_map_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./scripts/map.js */ "./js/scripts/map.js");
/* harmony import */ var _scripts_map_js__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(_scripts_map_js__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var _scripts_carousel__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./scripts/carousel */ "./js/scripts/carousel.ts");
/* harmony import */ var _scripts_cartInfo__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./scripts/cartInfo */ "./js/scripts/cartInfo.ts");
/* STYLES  */


/* JS */









var App = /** @class */function () {
  function App() {
    new _scripts_cartInfo__WEBPACK_IMPORTED_MODULE_10__.CartInfo('/coreshop_get_cart_items', '.js-cart-widget');
    new _scripts_carousel__WEBPACK_IMPORTED_MODULE_9__.Carousel();
  }
  return App;
}();
new App();

/***/ }),

/***/ "./js/scripts/carousel.ts":
/*!********************************!*\
  !*** ./js/scripts/carousel.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Carousel: () => (/* binding */ Carousel)
/* harmony export */ });
/* harmony import */ var swiper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! swiper */ "./node_modules/swiper/swiper.mjs");
/* harmony import */ var swiper_modules__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! swiper/modules */ "./node_modules/swiper/modules/index.mjs");


var Carousel = /** @class */function () {
  function Carousel() {
    this._initCarousel = function () {
      /* Init swiper with thumbs */
      var sliderThumbnail = new swiper__WEBPACK_IMPORTED_MODULE_0__["default"]('.js-slider-thumbnail', {
        slidesPerView: 3,
        freeMode: true,
        spaceBetween: '8px',
        watchSlidesProgress: true
      });
      var slider = new swiper__WEBPACK_IMPORTED_MODULE_0__["default"]('.js-slider', {
        modules: [swiper_modules__WEBPACK_IMPORTED_MODULE_1__.Thumbs],
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev'
        },
        thumbs: {
          swiper: sliderThumbnail
        }
      });
    };
    this._initCarousel();
  }
  return Carousel;
}();


/***/ }),

/***/ "./js/scripts/cartInfo.ts":
/*!********************************!*\
  !*** ./js/scripts/cartInfo.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CartInfo: () => (/* binding */ CartInfo)
/* harmony export */ });
/* harmony import */ var core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! core-js/modules/es.symbol.description.js */ "../../../../../../../../node_modules/core-js/modules/es.symbol.description.js");
/* harmony import */ var core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_es_symbol_description_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! core-js/modules/web.dom-collections.iterator.js */ "../../../../../../../../node_modules/core-js/modules/web.dom-collections.iterator.js");
/* harmony import */ var core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(core_js_modules_web_dom_collections_iterator_js__WEBPACK_IMPORTED_MODULE_1__);


var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var __generator = undefined && undefined.__generator || function (thisArg, body) {
  var _ = {
      label: 0,
      sent: function () {
        if (t[0] & 1) throw t[1];
        return t[1];
      },
      trys: [],
      ops: []
    },
    f,
    y,
    t,
    g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
  return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function () {
    return this;
  }), g;
  function verb(n) {
    return function (v) {
      return step([n, v]);
    };
  }
  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");
    while (g && (g = 0, op[0] && (_ = 0)), _) try {
      if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
      if (y = 0, t) op = [op[0] & 2, t.value];
      switch (op[0]) {
        case 0:
        case 1:
          t = op;
          break;
        case 4:
          _.label++;
          return {
            value: op[1],
            done: false
          };
        case 5:
          _.label++;
          y = op[1];
          op = [0];
          continue;
        case 7:
          op = _.ops.pop();
          _.trys.pop();
          continue;
        default:
          if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
            _ = 0;
            continue;
          }
          if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
            _.label = op[1];
            break;
          }
          if (op[0] === 6 && _.label < t[1]) {
            _.label = t[1];
            t = op;
            break;
          }
          if (t && _.label < t[2]) {
            _.label = t[2];
            _.ops.push(op);
            break;
          }
          if (t[2]) _.ops.pop();
          _.trys.pop();
          continue;
      }
      op = body.call(thisArg, _);
    } catch (e) {
      op = [6, e];
      y = 0;
    } finally {
      f = t = 0;
    }
    if (op[0] & 5) throw op[1];
    return {
      value: op[0] ? op[1] : void 0,
      done: true
    };
  }
};
var CartInfo = /** @class */function () {
  function CartInfo(apiUrl, elementSelector) {
    this.apiUrl = apiUrl;
    this.elementSelector = elementSelector;
    this._initCartWidget();
  }
  CartInfo.prototype.fetchCartItems = function () {
    return __awaiter(this, void 0, void 0, function () {
      var response, html, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3,, 4]);
            return [4 /*yield*/, fetch(this.apiUrl)];
          case 1:
            response = _a.sent();
            if (!response.ok) {
              console.error('There has been a problem with your fetch operation:', response.statusText);
            }
            return [4 /*yield*/, response.text()];
          case 2:
            html = _a.sent();
            this.displayCartItems(html);
            return [3 /*break*/, 4];
          case 3:
            error_1 = _a.sent();
            console.error('There has been a problem with your fetch operation:', error_1);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  CartInfo.prototype._initCartWidget = function () {
    this.fetchCartItems();
  };
  CartInfo.prototype.displayCartItems = function (html) {
    var cartFlag = document.querySelector(this.elementSelector);
    if (cartFlag) {
      var loader = document.querySelector('.js-cart-loader');
      if (loader) {
        loader.remove();
      }
      cartFlag.innerHTML += html;
    }
  };
  return CartInfo;
}();


/***/ }),

/***/ "./scss/app.scss":
/*!***********************!*\
  !*** ./scss/app.scss ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var chunkIds = deferred[i][0];
/******/ 				var fn = deferred[i][1];
/******/ 				var priority = deferred[i][2];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"app": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var chunkIds = data[0];
/******/ 			var moreModules = data[1];
/******/ 			var runtime = data[2];
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunk"] = self["webpackChunk"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["vendors-node_modules_bootstrap_dist_js_bootstrap_esm_js-node_modules_swiper_swiper-bundle_css-0cdedb"], () => (__webpack_require__("./js/app.ts")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7OztXQ05BOztXQUVBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTs7V0FFQTs7V0FFQTs7V0FFQTs7V0FFQTs7V0FFQTs7V0FFQTs7V0FFQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsTUFBTSxxQkFBcUI7V0FDM0I7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTs7V0FFQTtXQUNBO1dBQ0E7Ozs7O1VFbERBO1VBQ0E7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9qcy9wbHVnaW4vY29yZXNob3AucGx1Z2luLnF1YW50aXR5LmpzIiwid2VicGFjazovLy8uL2pzL3BsdWdpbi9jb3Jlc2hvcC5wbHVnaW4udmFyaWFudC5qcyIsIndlYnBhY2s6Ly8vLi9qcy9zY3JpcHRzL2hhbmRsZS1wcm90b3R5cGVzLmpzIiwid2VicGFjazovLy8uL2pzL3NjcmlwdHMvbWFwLmpzIiwid2VicGFjazovLy8uL2pzL3NjcmlwdHMvc2hvcC5qcyIsIndlYnBhY2s6Ly8vLi9qcy9zY3JpcHRzL3ZhcmlhbnQuanMiLCJ3ZWJwYWNrOi8vLy4vanMvYXBwLnRzIiwid2VicGFjazovLy8uL2pzL3NjcmlwdHMvY2Fyb3VzZWwudHMiLCJ3ZWJwYWNrOi8vLy4vanMvc2NyaXB0cy9jYXJ0SW5mby50cyIsIndlYnBhY2s6Ly8vLi9zY3NzL2FwcC5zY3NzIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2NodW5rIGxvYWRlZCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2dsb2JhbCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2pzb25wIGNodW5rIGxvYWRpbmciLCJ3ZWJwYWNrOi8vL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly8vd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gY29yZXNob3BRdWFudGl0eVNlbGVjdG9yKG9wdGlvbnMpIHtcbiAgICAgICAgaW5pdFF1YW50aXR5RmllbGRzKG9wdGlvbnMpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluaXRRdWFudGl0eUZpZWxkcyhvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IGZpZWxkcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2lucHV0LmNzLXVuaXQtaW5wdXQnKTtcbiAgICAgICAgY29uc3QgcHJlY2lzaW9uUHJlc2V0U2VsZWN0b3IgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdzZWxlY3QuY3MtdW5pdC1zZWxlY3RvcicpO1xuXG4gICAgICAgIGlmKHByZWNpc2lvblByZXNldFNlbGVjdG9yKSB7XG4gICAgICAgICAgICAvLyBMaXN0ZW4gdG8gdW5pdCBkZWZpbml0aW9uIHNlbGVjdG9yXG4gICAgICAgICAgICBwcmVjaXNpb25QcmVzZXRTZWxlY3Rvci5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmRhdGFzZXQuY3NVbml0SWRlbnRpZmllcikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRPcHRpb24gPSB0aGlzLm9wdGlvbnNbdGhpcy5zZWxlY3RlZEluZGV4XTtcbiAgICAgICAgICAgICAgICBjb25zdCBxdWFudGl0eUlkZW50aWZpZXIgPSB0aGlzLmRhdGFzZXQuY3NVbml0SWRlbnRpZmllcjtcbiAgICAgICAgICAgICAgICBjb25zdCBxdWFudGl0eUlucHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgaW5wdXRbZGF0YS1jcy11bml0LWlkZW50aWZpZXI9XCIke3F1YW50aXR5SWRlbnRpZmllcn1cIl1gKTtcblxuICAgICAgICAgICAgICAgIC8vIFNldCBzdGVwIHRvIDEgb3Igd2hhdGV2ZXIgaW50ZWdlciB2YWx1ZSB5b3Ugd2FudFxuICAgICAgICAgICAgICAgIGNvbnN0IHN0ZXAgPSAxOyAvLyBDaGFuZ2UgdGhpcyBpZiB5b3Ugd2FudCBhIGRpZmZlcmVudCBpbmNyZW1lbnRcblxuICAgICAgICAgICAgICAgIGlmICghcXVhbnRpdHlJbnB1dCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gVXNlIGludGVnZXIgc3RlcCBkaXJlY3RseVxuICAgICAgICAgICAgICAgIHF1YW50aXR5SW5wdXQuc3RlcCA9IHN0ZXA7IC8vIFNldCBzdGVwIGFzIGFuIGludGVnZXJcbiAgICAgICAgICAgICAgICBxdWFudGl0eUlucHV0LmRhdGFzZXQuY3NVbml0UHJlY2lzaW9uID0gMDsgLy8gT3B0aW9uYWwsIHNpbmNlIHByZWNpc2lvbiBpcyBubyBsb25nZXIgcmVsZXZhbnRcblxuICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSBpbnB1dCBzZXR0aW5nc1xuICAgICAgICAgICAgICAgIHVwZGF0ZVRvdWNoU3BpblNldHRpbmdzKHF1YW50aXR5SW5wdXQsIDAsIHN0ZXAudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGZpZWxkcykge1xuICAgICAgICAgICAgLy8gSW5pdGlhbGl6ZSBxdWFudGl0eSBmaWVsZHMgd2l0aCBpbnRlZ2VyIHN0ZXBcbiAgICAgICAgICAgIGZpZWxkcy5mb3JFYWNoKGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAgICAgICAgICAgIC8vIFlvdSBtaWdodCBub3QgbmVlZCBwcmVjaXNpb24gYW55bW9yZVxuICAgICAgICAgICAgICAgIGluaXRpYWxpemVUb3VjaFNwaW4oZmllbGQsIDAsICcxJywgb3B0aW9ucyk7IC8vIENoYW5nZSAnMScgdG8geW91ciBkZXNpcmVkIGludGVnZXIgaW5jcmVtZW50XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluaXRpYWxpemVUb3VjaFNwaW4oaW5wdXQsIHByZWNpc2lvbiwgc3RlcCwgb3B0aW9ucykge1xuICAgICAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ3RvdWNoc3Bpbi1jb250YWluZXInKTtcblxuICAgICAgICBjb25zdCBkZWNyZW1lbnRCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgZGVjcmVtZW50QnV0dG9uLnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgZGVjcmVtZW50QnV0dG9uLnRleHRDb250ZW50ID0gJy0nO1xuICAgICAgICBkZWNyZW1lbnRCdXR0b24uY2xhc3NMaXN0LmFkZCgndG91Y2hzcGluLWRlY3JlbWVudCcpO1xuXG4gICAgICAgIGNvbnN0IGluY3JlbWVudEJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICBpbmNyZW1lbnRCdXR0b24udHlwZSA9ICdidXR0b24nO1xuICAgICAgICBpbmNyZW1lbnRCdXR0b24udGV4dENvbnRlbnQgPSAnKyc7XG4gICAgICAgIGluY3JlbWVudEJ1dHRvbi5jbGFzc0xpc3QuYWRkKCd0b3VjaHNwaW4taW5jcmVtZW50Jyk7XG5cbiAgICAgICAgaW5wdXQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoY29udGFpbmVyLCBpbnB1dCk7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChkZWNyZW1lbnRCdXR0b24pO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoaW5wdXQpO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoaW5jcmVtZW50QnV0dG9uKTtcblxuICAgICAgICAvLyBTZXQgdXAgZXZlbnQgbGlzdGVuZXJzIGZvciBpbmNyZW1lbnQgYW5kIGRlY3JlbWVudFxuICAgICAgICBkZWNyZW1lbnRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBsZXQgdmFsdWUgPSBwYXJzZUludChpbnB1dC52YWx1ZSkgfHwgMDsgLy8gRW5zdXJlIHZhbHVlIGlzIGFuIGludGVnZXJcbiAgICAgICAgICAgIHZhbHVlIC09IHBhcnNlSW50KHN0ZXApOyAvLyBEZWNyZW1lbnQgYnkgaW50ZWdlciBzdGVwXG4gICAgICAgICAgICBpZiAodmFsdWUgPj0gMCkge1xuICAgICAgICAgICAgICAgIGlucHV0LnZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGluY3JlbWVudEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IHBhcnNlSW50KGlucHV0LnZhbHVlKSB8fCAwOyAvLyBFbnN1cmUgdmFsdWUgaXMgYW4gaW50ZWdlclxuICAgICAgICAgICAgdmFsdWUgKz0gcGFyc2VJbnQoc3RlcCk7IC8vIEluY3JlbWVudCBieSBpbnRlZ2VyIHN0ZXBcbiAgICAgICAgICAgIGlucHV0LnZhbHVlID0gdmFsdWU7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEFkZCBpbnB1dCB2YWxpZGF0aW9uIGJhc2VkIG9uIGludGVnZXIgdmFsdWVcbiAgICAgICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBsZXQgdmFsdWUgPSBwYXJzZUludChpbnB1dC52YWx1ZSk7XG4gICAgICAgICAgICBpZiAoaXNOYU4odmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgaW5wdXQudmFsdWUgPSAwOyAvLyBEZWZhdWx0IHRvIHplcm8gaWYgaW52YWxpZCBpbnB1dFxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpbnB1dC52YWx1ZSA9IHZhbHVlOyAvLyBLZWVwIGl0IGFzIGFuIGludGVnZXJcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlVG91Y2hTcGluU2V0dGluZ3MoaW5wdXQsIHByZWNpc2lvbiwgc3RlcCkge1xuICAgICAgICBpbnB1dC5taW4gPSAwO1xuICAgICAgICBpbnB1dC5tYXggPSAxMDAwMDAwMDAwO1xuICAgICAgICBpbnB1dC5zdGVwID0gc3RlcDtcbiAgICAgICAgaW5wdXQuZGF0YXNldC5jc1VuaXRQcmVjaXNpb24gPSBwcmVjaXNpb247XG4gICAgfVxuXG4gICAgLy8gRXhwb3J0IHRoZSBmdW5jdGlvbiB0byB0aGUgZ2xvYmFsIHNjb3BlXG4gICAgd2luZG93LmNvcmVzaG9wUXVhbnRpdHlTZWxlY3RvciA9IGNvcmVzaG9wUXVhbnRpdHlTZWxlY3Rvcjtcbn0pKCk7XG4iLCIoZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IGNvcmVzaG9wVmFyaWFudFNlbGVjdG9yID0gZnVuY3Rpb24gKGF0dHJpYnV0ZUNvbnRhaW5lcikge1xuICAgICAgICBsZXQgX2F0dHJpYnV0ZUNvbnRhaW5lciA9IHVuZGVmaW5lZDtcbiAgICAgICAgbGV0IF9jb25maWcgPSB7fTtcbiAgICAgICAgbGV0IF9hdHRyaWJ1dGVHcm91cHMgPSBbXTtcblxuICAgICAgICBjb25zdCBfY2xlYXJHcm91cCA9IGZ1bmN0aW9uIChncm91cCkge1xuICAgICAgICAgICAgZGVsZXRlIGdyb3VwLnNlbGVjdGVkO1xuICAgICAgICAgICAgZ3JvdXAuZWxlbWVudHMuZm9yRWFjaCgoZWxlbWVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuY2hlY2tlZCA9IGZhbHNlO1xuXG4gICAgICAgICAgICAgICAgLy8gcmVtb3ZlIG9wdGlvbnMgb24gc2VsZWN0XG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnc2VsZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBvcHRpb25zID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCdvcHRpb246bm90KFt2YWx1ZT1cIlwiXSknKTtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5mb3JFYWNoKChvcHRpb24pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlQ2hpbGQob3B0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgX2NsZWFyR3JvdXBzID0gZnVuY3Rpb24gKGdyb3VwKSB7XG4gICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgX2NsZWFyR3JvdXAoZ3JvdXApO1xuICAgICAgICAgICAgICAgIGdyb3VwID0gZ3JvdXAubmV4dEdyb3VwO1xuICAgICAgICAgICAgfSB3aGlsZSAoZ3JvdXApO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9maWx0ZXJBdHRyaWJ1dGVzID0gZnVuY3Rpb24gKGF0dHJpYnV0ZXMsIGdyb3VwKSB7XG4gICAgICAgICAgICBsZXQgZmlsdGVyQXR0cmlidXRlcyA9IFtdO1xuXG4gICAgICAgICAgICBncm91cCA9IGdyb3VwLnByZXZHcm91cDtcbiAgICAgICAgICAgIHdoaWxlIChncm91cCkge1xuICAgICAgICAgICAgICAgIGlmIChncm91cC5zZWxlY3RlZCAmJiBncm91cC5uZXh0R3JvdXApIHtcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyQXR0cmlidXRlcy5wdXNoKHsgZ3JvdXA6IGdyb3VwLmdyb3VwLmlkLCBzZWxlY3RlZDogZ3JvdXAuc2VsZWN0ZWQgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGdyb3VwID0gZ3JvdXAucHJldkdyb3VwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgZmlsdGVyZWQgPSBbXTtcbiAgICAgICAgICAgIGF0dHJpYnV0ZXMuZm9yRWFjaCgoYXR0cmlidXRlKSA9PiB7XG4gICAgICAgICAgICAgICAgYXR0cmlidXRlLnByb2R1Y3RzLmZvckVhY2goKHByb2R1Y3QpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbHRlckF0dHJpYnV0ZXMuZXZlcnkoKHgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfY29uZmlnLmluZGV4W3Byb2R1Y3QuaWRdWydhdHRyaWJ1dGVzJ10uaGFzT3duUHJvcGVydHkoeC5ncm91cCkgJiYgX2NvbmZpZy5pbmRleFtwcm9kdWN0LmlkXVsnYXR0cmlidXRlcyddW3guZ3JvdXBdID09PSB4LnNlbGVjdGVkO1xuICAgICAgICAgICAgICAgICAgICB9KSAmJiAhZmlsdGVyZWQuaW5jbHVkZXMoYXR0cmlidXRlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyZWQucHVzaChhdHRyaWJ1dGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIGZpbHRlcmVkLmxlbmd0aCA/IGZpbHRlcmVkIDogYXR0cmlidXRlcztcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfY29uZmlndXJlR3JvdXAgPSBmdW5jdGlvbiAoZ3JvdXApIHtcbiAgICAgICAgICAgIGxldCBhdHRyaWJ1dGVzID0gZ3JvdXAuYXR0cmlidXRlcy5zbGljZSgpO1xuICAgICAgICAgICAgYXR0cmlidXRlcyA9IF9maWx0ZXJBdHRyaWJ1dGVzKGF0dHJpYnV0ZXMsIGdyb3VwKTtcblxuICAgICAgICAgICAgaWYgKGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgICAgICAgICBncm91cC5lbGVtZW50cy5mb3JFYWNoKChlbGVtZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMuZm9yRWFjaCgoYXR0cmlidXRlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzZXQgb3B0aW9ucyBvbiBzZWxlY3QsIG90aGVyd2lzZSBvbmx5IGVuYWJsZSBpbnB1dHNcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ3NlbGVjdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBvcHRpb24gPSBuZXcgT3B0aW9uKGF0dHJpYnV0ZS5hdHRyaWJ1dGUubmFtZSwgYXR0cmlidXRlLmF0dHJpYnV0ZS5pZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uLmlkID0gJ2F0dHJpYnV0ZS0nICsgYXR0cmlidXRlLmF0dHJpYnV0ZS5pZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZ3JvdXAuc2VsZWN0ZWQgPT09IGF0dHJpYnV0ZS5hdHRyaWJ1dGUuaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5hZGQob3B0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmRpc2FibGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYXJzZUludChlbGVtZW50LmRhdGFzZXQuZ3JvdXApID09PSBncm91cC5ncm91cC5pZCAmJiBwYXJzZUludChlbGVtZW50LnZhbHVlKSA9PT0gYXR0cmlidXRlLmF0dHJpYnV0ZS5pZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmRpc2FibGVkID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGdyb3VwLnNlbGVjdGVkID09PSBhdHRyaWJ1dGUuYXR0cmlidXRlLmlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmNoZWNrZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfc2V0dXBBdHRyaWJ1dGVHcm91cFNldHRpbmdzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgbGV0IGluZGV4ID0gX2F0dHJpYnV0ZUdyb3Vwcy5sZW5ndGg7XG5cbiAgICAgICAgICAgIHdoaWxlIChpbmRleC0tKSB7XG4gICAgICAgICAgICAgICAgX2F0dHJpYnV0ZUdyb3Vwc1tpbmRleF0ucHJldkdyb3VwID0gX2F0dHJpYnV0ZUdyb3Vwc1tpbmRleCAtIDFdO1xuICAgICAgICAgICAgICAgIF9hdHRyaWJ1dGVHcm91cHNbaW5kZXhdLm5leHRHcm91cCA9IF9hdHRyaWJ1dGVHcm91cHNbaW5kZXggKyAxXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaW5kZXggPSBfYXR0cmlidXRlR3JvdXBzLmxlbmd0aDtcbiAgICAgICAgICAgIHdoaWxlIChpbmRleC0tKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFpbmRleCB8fCBfYXR0cmlidXRlR3JvdXBzW2luZGV4XS5zZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICBfY29uZmlndXJlR3JvdXAoX2F0dHJpYnV0ZUdyb3Vwc1tpbmRleF0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIF9jbGVhckdyb3VwKF9hdHRyaWJ1dGVHcm91cHNbaW5kZXhdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgX3NldHVwQ2hhbmdlRXZlbnRzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX2F0dHJpYnV0ZUdyb3Vwcy5mb3JFYWNoKChncm91cCkgPT4ge1xuICAgICAgICAgICAgICAgIGdyb3VwLmVsZW1lbnRzLmZvckVhY2goKGVsZW1lbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5vbmNoYW5nZSA9IChlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfY29uZmlndXJlRWxlbWVudChncm91cCwgZWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfaW5pdCA9IGZ1bmN0aW9uIChhdHRyaWJ1dGVDb250YWluZXIpIHtcbiAgICAgICAgICAgIGlmICghYXR0cmlidXRlQ29udGFpbmVyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBfYXR0cmlidXRlQ29udGFpbmVyID0gYXR0cmlidXRlQ29udGFpbmVyO1xuICAgICAgICAgICAgX2NvbmZpZyA9IEpTT04ucGFyc2UoX2F0dHJpYnV0ZUNvbnRhaW5lci5kYXRhc2V0LmNvbmZpZyk7XG4gICAgICAgICAgICBfY29uZmlnLmF0dHJpYnV0ZXMuZm9yRWFjaCgoZ3JvdXApID0+IHtcbiAgICAgICAgICAgICAgICBncm91cC5lbGVtZW50cyA9IF9hdHRyaWJ1dGVDb250YWluZXIucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZ3JvdXA9XCInICsgZ3JvdXAuZ3JvdXAuaWQgKyAnXCJdJyk7XG4gICAgICAgICAgICAgICAgX2F0dHJpYnV0ZUdyb3Vwcy5wdXNoKGdyb3VwKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBfc2V0dXBBdHRyaWJ1dGVHcm91cFNldHRpbmdzKCk7XG4gICAgICAgICAgICBfc2V0dXBDaGFuZ2VFdmVudHMoKTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfcmVkaXJlY3RUb1ZhcmlhbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjb25zdCBncm91cHMgPSBfYXR0cmlidXRlR3JvdXBzLmZpbHRlcigoZykgPT4gZy5zZWxlY3RlZCk7XG5cbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkID0gT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgICAgICAgICAgICAgIGdyb3Vwcy5tYXAoKGcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtnLmdyb3VwLmlkLCBnLnNlbGVjdGVkXTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgY29uc3QgZmlsdGVyZWQgPSBPYmplY3QudmFsdWVzKF9jb25maWcuaW5kZXgpLmZpbHRlcigocCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShwLmF0dHJpYnV0ZXMpID09PSBKU09OLnN0cmluZ2lmeShzZWxlY3RlZCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gbGVuZ3RoIHNob3VsZCBhbHdheXMgYmUgMSwgYnV0IGxldCdzIGNoZWNrIGl0XG4gICAgICAgICAgICBpZiAoZmlsdGVyZWQubGVuZ3RoID09PSAxICYmIGZpbHRlcmVkWzBdWyd1cmwnXSkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gZmlsdGVyZWRbMF1bJ3VybCddO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9jcmVhdGVFdmVudCA9IGZ1bmN0aW9uIChuYW1lLCBkYXRhID0ge30pIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgQ3VzdG9tRXZlbnQoJ3ZhcmlhbnRfc2VsZWN0b3IuJyArIG5hbWUsIHtcbiAgICAgICAgICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNhbmNlbGFibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGRldGFpbDogZGF0YVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgX2NvbmZpZ3VyZUVsZW1lbnQgPSBmdW5jdGlvbiAoZ3JvdXAsIGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHdpbmRvdy52YXJpYW50UmVhZHkgPSBmYWxzZTtcbiAgICAgICAgICAgIF9hdHRyaWJ1dGVDb250YWluZXIuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgICAgICAgICBfY3JlYXRlRXZlbnQoJ2NoYW5nZScsIHsgZWxlbWVudDogZWxlbWVudCB9KVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgaWYgKGVsZW1lbnQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICBncm91cC5zZWxlY3RlZCA9IHBhcnNlSW50KGVsZW1lbnQudmFsdWUpO1xuICAgICAgICAgICAgICAgIGlmIChncm91cC5uZXh0R3JvdXApIHtcbiAgICAgICAgICAgICAgICAgICAgX2F0dHJpYnV0ZUNvbnRhaW5lci5kaXNwYXRjaEV2ZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgX2NyZWF0ZUV2ZW50KCdzZWxlY3QnLCB7IGVsZW1lbnQ6IGVsZW1lbnQgfSlcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgX2NsZWFyR3JvdXBzKGdyb3VwLm5leHRHcm91cCk7XG4gICAgICAgICAgICAgICAgICAgIF9jb25maWd1cmVHcm91cChncm91cC5uZXh0R3JvdXApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIF9hdHRyaWJ1dGVDb250YWluZXIuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgICAgICAgICAgICAgICAgIF9jcmVhdGVFdmVudCgncmVkaXJlY3QnLCB7IGVsZW1lbnQ6IGVsZW1lbnQgfSlcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgX3JlZGlyZWN0VG9WYXJpYW50KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgZ3JvdXAuc2VsZWN0ZWQ7XG4gICAgICAgICAgICAgICAgaWYgKGdyb3VwLm5leHRHcm91cCkge1xuICAgICAgICAgICAgICAgICAgICBfY2xlYXJHcm91cHMoZ3JvdXAubmV4dEdyb3VwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB3aW5kb3cudmFyaWFudFJlYWR5ID0gdHJ1ZTtcbiAgICAgICAgfTtcblxuICAgICAgICBfaW5pdChhdHRyaWJ1dGVDb250YWluZXIpO1xuICAgIH07XG5cbiAgICB3aW5kb3cuY29yZXNob3BWYXJpYW50U2VsZWN0b3IgPSBjb3Jlc2hvcFZhcmlhbnRTZWxlY3Rvcjtcbn0pKCk7XG4iLCIoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIGNvbnN0IG1ldGhvZHMgPSB7XG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICAgICAgICBjb25zdCBzZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgICAgICAgICAgICdwcm90b3R5cGVQcmVmaXgnOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAnY29udGFpbmVyU2VsZWN0b3InOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAnc2VsZWN0b3JBdHRyJzogZmFsc2VcbiAgICAgICAgICAgIH0sIG9wdGlvbnMpO1xuXG4gICAgICAgICAgICBjb25zdCBlbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5zZWxlY3Rvcik7XG4gICAgICAgICAgICBlbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgc2hvdyhlbGVtZW50LCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHNob3coZWxlbWVudCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBzaG93KGVsZW1lbnQsIHJlcGxhY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNlbGVjdGVkVmFsdWUgPSBlbGVtZW50LnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBsZXQgcHJvdG90eXBlUHJlZml4ID0gZWxlbWVudC5pZDtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoc2V0dGluZ3Muc2VsZWN0b3JBdHRyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzZWxlY3RlZE9wdGlvbiA9IEFycmF5LmZyb20oZWxlbWVudC5vcHRpb25zKS5maW5kKG9wdGlvbiA9PiBvcHRpb24udmFsdWUgPT09IHNlbGVjdGVkVmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGVjdGVkT3B0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRWYWx1ZSA9IHNlbGVjdGVkT3B0aW9uLmdldEF0dHJpYnV0ZShzZXR0aW5ncy5zZWxlY3RvckF0dHIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHNldHRpbmdzLnByb3RvdHlwZVByZWZpeCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvdG90eXBlUHJlZml4ID0gc2V0dGluZ3MucHJvdG90eXBlUHJlZml4O1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJvdG90eXBlRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHByb3RvdHlwZVByZWZpeCArICdfJyArIHNlbGVjdGVkVmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgY29udGFpbmVyO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChzZXR0aW5ncy5jb250YWluZXJTZWxlY3Rvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZXR0aW5ncy5jb250YWluZXJTZWxlY3Rvcik7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkYXRhQ29udGFpbmVySWQgPSBwcm90b3R5cGVFbGVtZW50ID8gcHJvdG90eXBlRWxlbWVudC5kYXRhc2V0LmNvbnRhaW5lciA6IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChkYXRhQ29udGFpbmVySWQpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjb250YWluZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmICghcHJvdG90eXBlRWxlbWVudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyLmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlcGxhY2UgfHwgIWNvbnRhaW5lci5pbm5lckhUTUwudHJpbSgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXIuaW5uZXJIVE1MID0gcHJvdG90eXBlRWxlbWVudC5kYXRhc2V0LnByb3RvdHlwZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIEV4dGVuZGluZyB0aGUgcHJvdG90eXBlIG9mIE5vZGVMaXN0XG4gICAgTm9kZUxpc3QucHJvdG90eXBlLmhhbmRsZVByb3RvdHlwZXMgPSBmdW5jdGlvbiAobWV0aG9kKSB7XG4gICAgICAgIGlmIChtZXRob2RzW21ldGhvZF0pIHtcbiAgICAgICAgICAgIHJldHVybiBtZXRob2RzW21ldGhvZF0uYXBwbHkodGhpcywgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG1ldGhvZCA9PT0gJ29iamVjdCcgfHwgIW1ldGhvZCkge1xuICAgICAgICAgICAgcmV0dXJuIG1ldGhvZHMuaW5pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNZXRob2QgJyArIG1ldGhvZCArICcgZG9lcyBub3QgZXhpc3Qgb24gaGFuZGxlUHJvdG90eXBlcycpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIFRvIGFsbG93IGNhbGxpbmcgaGFuZGxlUHJvdG90eXBlcyBkaXJlY3RseSBvbiBhbnkgZWxlbWVudFxuICAgIEhUTUxFbGVtZW50LnByb3RvdHlwZS5oYW5kbGVQcm90b3R5cGVzID0gZnVuY3Rpb24gKG1ldGhvZCkge1xuICAgICAgICByZXR1cm4gbWV0aG9kcy5oYW5kbGVQcm90b3R5cGVzLmNhbGwoW3RoaXNdLCBtZXRob2QpO1xuICAgIH07XG5cbn0oKSk7XG4iLCJkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IG1hcEJsb2NrID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hcC1ibG9jaycpO1xuXG4gICAgaWYgKG1hcEJsb2NrKSB7XG4gICAgICAgIG1hcEJsb2NrLnN0eWxlLmhlaWdodCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYXAtd3JhcHBlcicpLmNsaWVudEhlaWdodCArICdweCc7XG5cbiAgICAgICAgZnVuY3Rpb24gaW5pdGlhbGl6ZSgpIHtcbiAgICAgICAgICAgIGNvbnN0IG1hcE9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgem9vbTogMTgsXG4gICAgICAgICAgICAgICAgY2VudGVyOiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKDQ4LjE1OTI1MTMsIDE0LjAyMzAyNTEwMDAwMDA0KSxcbiAgICAgICAgICAgICAgICBkaXNhYmxlRGVmYXVsdFVJOiB0cnVlXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3QgbWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcChtYXBCbG9jaywgbWFwT3B0aW9ucyk7XG4gICAgICAgIH1cblxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGluaXRpYWxpemUpO1xuICAgIH1cbn0pO1xuIiwiZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uICgpIHtcbiAgICBzaG9wLmluaXQoKTtcbn0pO1xuXG5mdW5jdGlvbiBoYW5kbGVQcm90b3R5cGVzKG9wdGlvbnMpIHtcbiAgICBjb25zdCBzZXR0aW5ncyA9IHtcbiAgICAgICAgcHJvdG90eXBlUHJlZml4OiBvcHRpb25zLnByb3RvdHlwZVByZWZpeCB8fCBmYWxzZSxcbiAgICAgICAgY29udGFpbmVyU2VsZWN0b3I6IG9wdGlvbnMuY29udGFpbmVyU2VsZWN0b3IgfHwgZmFsc2UsXG4gICAgICAgIHNlbGVjdG9yQXR0cjogb3B0aW9ucy5zZWxlY3RvckF0dHIgfHwgZmFsc2VcbiAgICB9O1xuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChgW2RhdGEtJHtzZXR0aW5ncy5wcm90b3R5cGVQcmVmaXh9XWApLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgc2hvdyhlbGVtZW50LCBmYWxzZSk7XG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2hvdyhlbGVtZW50LCB0cnVlKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBzaG93KGVsZW1lbnQsIHJlcGxhY2UpIHtcbiAgICAgICAgbGV0IHNlbGVjdGVkVmFsdWUgPSBlbGVtZW50LnZhbHVlO1xuICAgICAgICBsZXQgcHJvdG90eXBlUHJlZml4ID0gZWxlbWVudC5pZDtcblxuICAgICAgICBpZiAoc2V0dGluZ3Muc2VsZWN0b3JBdHRyKSB7XG4gICAgICAgICAgICBzZWxlY3RlZFZhbHVlID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yKGBbdmFsdWU9XCIke2VsZW1lbnQudmFsdWV9XCJdYCkuZ2V0QXR0cmlidXRlKHNldHRpbmdzLnNlbGVjdG9yQXR0cik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2V0dGluZ3MucHJvdG90eXBlUHJlZml4KSB7XG4gICAgICAgICAgICBwcm90b3R5cGVQcmVmaXggPSBzZXR0aW5ncy5wcm90b3R5cGVQcmVmaXg7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwcm90b3R5cGVFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYCR7cHJvdG90eXBlUHJlZml4fV8ke3NlbGVjdGVkVmFsdWV9YCk7XG4gICAgICAgIGxldCBjb250YWluZXI7XG5cbiAgICAgICAgaWYgKHNldHRpbmdzLmNvbnRhaW5lclNlbGVjdG9yKSB7XG4gICAgICAgICAgICBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNldHRpbmdzLmNvbnRhaW5lclNlbGVjdG9yKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnRhaW5lciA9IHByb3RvdHlwZUVsZW1lbnQgPyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHByb3RvdHlwZUVsZW1lbnQuZGF0YXNldC5jb250YWluZXIpIDogbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghY29udGFpbmVyKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXByb3RvdHlwZUVsZW1lbnQpIHtcbiAgICAgICAgICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyZXBsYWNlIHx8ICFjb250YWluZXIuaW5uZXJIVE1MLnRyaW0oKSkge1xuICAgICAgICAgICAgY29udGFpbmVyLmlubmVySFRNTCA9IHByb3RvdHlwZUVsZW1lbnQuZGF0YXNldC5wcm90b3R5cGU7XG4gICAgICAgIH1cbiAgICB9XG59XG5cblxuKGZ1bmN0aW9uIChzaG9wKSB7XG4gICAgc2hvcC5pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBzaG9wLmluaXRDaGFuZ2VBZGRyZXNzKCk7XG4gICAgICAgIHNob3AuaW5pdENhcnRTaGlwbWVudENhbGN1bGF0b3IoKTtcbiAgICAgICAgc2hvcC5pbml0UXVhbnRpdHlWYWxpZGF0b3IoKTtcbiAgICAgICAgc2hvcC5pbml0Q2F0ZWdvcnlTZWxlY3QoKTtcblxuICAgICAgICBoYW5kbGVQcm90b3R5cGVzKHtcbiAgICAgICAgICAgICdwcm90b3R5cGVQcmVmaXgnOiAncGF5bWVudFByb3ZpZGVyJyxcbiAgICAgICAgICAgICdjb250YWluZXJTZWxlY3Rvcic6ICcucGF5bWVudFNldHRpbmdzJyxcbiAgICAgICAgICAgICdzZWxlY3RvckF0dHInOiAnZGF0YS1mYWN0b3J5J1xuICAgICAgICB9KTtcblxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY29weS10by1jbGlwYm9hcmQnKS5mb3JFYWNoKGZ1bmN0aW9uIChidXR0b24pIHtcbiAgICAgICAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRhcmdldElkID0gdGhpcy5kYXRhc2V0LnRhcmdldDtcbiAgICAgICAgICAgICAgICBjb25zdCBjb3B5VGV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRhcmdldElkKTtcblxuICAgICAgICAgICAgICAgIGlmIChjb3B5VGV4dCkge1xuICAgICAgICAgICAgICAgICAgICBjb3B5VGV4dC5zZWxlY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgY29weVRleHQuc2V0U2VsZWN0aW9uUmFuZ2UoMCwgOTk5OTkpOyAvLyBGb3IgbW9iaWxlIGRldmljZXNcblxuICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChjb3B5VGV4dC52YWx1ZSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBPcHRpb25hbGx5IHNob3cgYSB0b29sdGlwIG9yIGNvbmZpcm1hdGlvbiBoZXJlXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBFeGFtcGxlOiB1c2luZyBhIHRvb2x0aXAgbGlicmFyeSBvciBjdXN0b20gaW1wbGVtZW50YXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNob3cgdG9vbHRpcCBsb2dpYyBnb2VzIGhlcmVcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMuZGF0YXNldC5jb3BpZWRUZXh0KTsgLy8gWW91IGNhbiByZXBsYWNlIHRoaXMgd2l0aCB5b3VyIHRvb2x0aXAgbG9naWNcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBzaG9wLmluaXRDYXRlZ29yeVNlbGVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZnVuY3Rpb24gdXBkYXRlUXVlcnlTdHJpbmdQYXJhbWV0ZXIodXJpLCBrZXksIHZhbHVlKSB7XG4gICAgICAgICAgICBjb25zdCByZSA9IG5ldyBSZWdFeHAoXCIoWz8mXSlcIiArIGtleSArIFwiPS4qPygmfCQpXCIsIFwiaVwiKTtcbiAgICAgICAgICAgIGNvbnN0IHNlcGFyYXRvciA9IHVyaS5pbmRleE9mKCc/JykgIT09IC0xID8gXCImXCIgOiBcIj9cIjtcbiAgICAgICAgICAgIGlmICh1cmkubWF0Y2gocmUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVyaS5yZXBsYWNlKHJlLCAnJDEnICsga2V5ICsgXCI9XCIgKyB2YWx1ZSArICckMicpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdXJpICsgc2VwYXJhdG9yICsga2V5ICsgXCI9XCIgKyB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuc2l0ZS1yZWxvYWRcIikuZm9yRWFjaChmdW5jdGlvbiAoc2VsZWN0KSB7XG4gICAgICAgICAgICBzZWxlY3QuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgbG9jYXRpb24uaHJlZiA9IHVwZGF0ZVF1ZXJ5U3RyaW5nUGFyYW1ldGVyKHdpbmRvdy5sb2NhdGlvbi5ocmVmLCB0aGlzLm5hbWUsIHRoaXMudmFsdWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBzaG9wLmluaXRRdWFudGl0eVZhbGlkYXRvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29yZXNob3BRdWFudGl0eVNlbGVjdG9yKHtcbiAgICAgICAgICAgIGJ1dHRvbmRvd25fY2xhc3M6ICdidG4gYnRuLXNlY29uZGFyeScsXG4gICAgICAgICAgICBidXR0b251cF9jbGFzczogJ2J0biBidG4tc2Vjb25kYXJ5JyxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHNob3AuaW5pdENhcnRTaGlwbWVudENhbGN1bGF0b3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgY29uc3QgZm9ybSA9IGV2LnRhcmdldC5jbG9zZXN0KCdmb3JtW25hbWU9XCJjb3Jlc2hvcF9zaGlwcGluZ19jYWxjdWxhdG9yXCJdJyk7XG4gICAgICAgICAgICBpZiAoZm9ybSkge1xuICAgICAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgZm9ybS5jbGFzc0xpc3QuYWRkKCdsb2FkaW5nJyk7XG4gICAgICAgICAgICAgICAgZm9ybS5xdWVyeVNlbGVjdG9yKCdidXR0b25bdHlwZT1cInN1Ym1pdFwiXScpLnNldEF0dHJpYnV0ZSgnZGlzYWJsZWQnLCAnZGlzYWJsZWQnKTtcbiAgICAgICAgICAgICAgICBmb3JtLmNsb3Nlc3QoJy5jYXJ0LXNoaXBtZW50LWNhbGN1bGF0aW9uLWJveCcpLnF1ZXJ5U2VsZWN0b3IoJy5jYXJ0LXNoaXBtZW50LWF2YWlsYWJsZS1jYXJyaWVycycpLnN0eWxlLm9wYWNpdHkgPSAwLjI7XG5cbiAgICAgICAgICAgICAgICBmZXRjaChmb3JtLmFjdGlvbiwge1xuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgICAgICAgICAgYm9keTogbmV3IFVSTFNlYXJjaFBhcmFtcyhuZXcgRm9ybURhdGEoZm9ybSkpIC8vIFNlcmlhbGl6ZSBmb3JtIGRhdGFcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlLnRleHQoKSlcbiAgICAgICAgICAgICAgICAudGhlbihyZXMgPT4ge1xuICAgICAgICAgICAgICAgICAgICBmb3JtLmNsYXNzTGlzdC5yZW1vdmUoJ2xvYWRpbmcnKTtcbiAgICAgICAgICAgICAgICAgICAgZm9ybS5jbG9zZXN0KCcuY2FydC1zaGlwbWVudC1jYWxjdWxhdGlvbi1ib3gnKS5vdXRlckhUTUwgPSByZXM7IC8vIFJlcGxhY2UgdGhlIGVudGlyZSBjb250YWluZXJcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yOicsIGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgZm9ybS5jbGFzc0xpc3QucmVtb3ZlKCdsb2FkaW5nJyk7XG4gICAgICAgICAgICAgICAgICAgIGZvcm0ucXVlcnlTZWxlY3RvcignYnV0dG9uW3R5cGU9XCJzdWJtaXRcIl0nKS5yZW1vdmVBdHRyaWJ1dGUoJ2Rpc2FibGVkJyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBzaG9wLmluaXRDaGFuZ2VBZGRyZXNzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zdCBhZGRyZXNzU3RlcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jaGVja291dC1zdGVwLnN0ZXAtYWRkcmVzcycpO1xuXG4gICAgICAgIGlmICghYWRkcmVzc1N0ZXApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGludm9pY2VBZGRyZXNzID0gYWRkcmVzc1N0ZXAucXVlcnlTZWxlY3Rvcignc2VsZWN0W25hbWU9XCJjb3Jlc2hvcFtpbnZvaWNlQWRkcmVzc11cIl0nKTtcbiAgICAgICAgY29uc3QgaW52b2ljZVBhbmVsID0gYWRkcmVzc1N0ZXAucXVlcnlTZWxlY3RvcignLnBhbmVsLWludm9pY2UtYWRkcmVzcycpO1xuICAgICAgICBjb25zdCBpbnZvaWNlRmllbGQgPSBhZGRyZXNzU3RlcC5xdWVyeVNlbGVjdG9yKCcuaW52b2ljZS1hZGRyZXNzLXNlbGVjdG9yJyk7XG4gICAgICAgIGNvbnN0IHNoaXBwaW5nQWRkcmVzcyA9IGFkZHJlc3NTdGVwLnF1ZXJ5U2VsZWN0b3IoJ3NlbGVjdFtuYW1lPVwiY29yZXNob3Bbc2hpcHBpbmdBZGRyZXNzXVwiXScpO1xuICAgICAgICBjb25zdCBzaGlwcGluZ1BhbmVsID0gYWRkcmVzc1N0ZXAucXVlcnlTZWxlY3RvcignLnBhbmVsLXNoaXBwaW5nLWFkZHJlc3MnKTtcbiAgICAgICAgY29uc3Qgc2hpcHBpbmdGaWVsZCA9IGFkZHJlc3NTdGVwLnF1ZXJ5U2VsZWN0b3IoJy5zaGlwcGluZy1hZGRyZXNzLXNlbGVjdG9yJyk7XG4gICAgICAgIGNvbnN0IHNoaXBwaW5nQWRkQWRkcmVzc0J1dHRvbiA9IHNoaXBwaW5nUGFuZWwucGFyZW50RWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuY2FyZC1mb290ZXInKTtcbiAgICAgICAgY29uc3QgdXNlSWFzUyA9IGFkZHJlc3NTdGVwLnF1ZXJ5U2VsZWN0b3IoJ1tuYW1lPVwiY29yZXNob3BbdXNlSW52b2ljZUFzU2hpcHBpbmddXCJdJyk7XG5cbiAgICAgICAgaW52b2ljZUFkZHJlc3MuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWQgPSB0aGlzLm9wdGlvbnNbdGhpcy5zZWxlY3RlZEluZGV4XTtcbiAgICAgICAgICAgIGNvbnN0IGFkZHJlc3NEZWNvZGUgPSBKU09OLnBhcnNlKHNlbGVjdGVkLmRhdGFzZXQuYWRkcmVzcyk7XG4gICAgICAgICAgICBjb25zdCBhZGRyZXNzID0gYWRkcmVzc0RlY29kZS5odG1sO1xuICAgICAgICAgICAgY29uc3QgYWRkcmVzc1R5cGUgPSBzZWxlY3RlZC5kYXRhc2V0LmFkZHJlc3NUeXBlO1xuXG4gICAgICAgICAgICBpZiAodXNlSWFzUykge1xuICAgICAgICAgICAgICAgIGlmIChhZGRyZXNzVHlwZSA9PT0gJ2ludm9pY2UnKSB7XG4gICAgICAgICAgICAgICAgICAgIHVzZUlhc1MuZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB1c2VJYXNTLmNoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdXNlSWFzUy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnY2hhbmdlJykpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHVzZUlhc1MuZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChhZGRyZXNzKSB7XG4gICAgICAgICAgICAgICAgaW52b2ljZVBhbmVsLmlubmVySFRNTCA9IGFkZHJlc3M7XG4gICAgICAgICAgICAgICAgaWYgKHVzZUlhc1MuY2hlY2tlZCkge1xuICAgICAgICAgICAgICAgICAgICBzaGlwcGluZ0FkZHJlc3MudmFsdWUgPSB0aGlzLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBzaGlwcGluZ0FkZHJlc3MuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2NoYW5nZScpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGludm9pY2VQYW5lbC5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgICAgICAgICBpZiAodXNlSWFzUy5jaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIHNoaXBwaW5nUGFuZWwuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIHNoaXBwaW5nQWRkcmVzcy52YWx1ZSA9ICcnO1xuICAgICAgICAgICAgICAgICAgICBzaGlwcGluZ0FkZHJlc3MuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2NoYW5nZScpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHNoaXBwaW5nQWRkcmVzcy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjb25zdCBzZWxlY3RlZCA9IHRoaXMub3B0aW9uc1t0aGlzLnNlbGVjdGVkSW5kZXhdO1xuICAgICAgICAgICAgY29uc3QgYWRkcmVzc0RlY29kZSA9IEpTT04ucGFyc2Uoc2VsZWN0ZWQuZGF0YXNldC5hZGRyZXNzKTtcbiAgICAgICAgICAgIGNvbnN0IGFkZHJlc3MgPSBhZGRyZXNzRGVjb2RlLmh0bWw7XG4gICAgICAgICAgICBzaGlwcGluZ1BhbmVsLmlubmVySFRNTCA9IGFkZHJlc3MgPyBhZGRyZXNzIDogJyc7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICghdXNlSWFzUy5jaGVja2VkICYmIHNoaXBwaW5nQWRkQWRkcmVzc0J1dHRvbikge1xuICAgICAgICAgICAgc2hpcHBpbmdBZGRBZGRyZXNzQnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoJ2Qtbm9uZScpO1xuICAgICAgICB9XG5cbiAgICAgICAgdXNlSWFzUy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5jaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgc2hpcHBpbmdGaWVsZC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgICAgIGNvbnN0IGFkZHJlc3MgPSBpbnZvaWNlQWRkcmVzcy5vcHRpb25zW2ludm9pY2VBZGRyZXNzLnNlbGVjdGVkSW5kZXhdLmRhdGFzZXQuYWRkcmVzcztcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGludm9pY2VBZGRyZXNzLnZhbHVlO1xuXG4gICAgICAgICAgICAgICAgaWYgKGFkZHJlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgc2hpcHBpbmdBZGRyZXNzLnZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHNoaXBwaW5nQWRkcmVzcy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnY2hhbmdlJykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoc2hpcHBpbmdBZGRBZGRyZXNzQnV0dG9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHNoaXBwaW5nQWRkQWRkcmVzc0J1dHRvbi5jbGFzc0xpc3QuYWRkKCdkLW5vbmUnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNoaXBwaW5nRmllbGQuc3R5bGUuZGlzcGxheSA9ICcnO1xuICAgICAgICAgICAgICAgIGlmIChzaGlwcGluZ0FkZEFkZHJlc3NCdXR0b24pIHtcbiAgICAgICAgICAgICAgICAgICAgc2hpcHBpbmdBZGRBZGRyZXNzQnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoJ2Qtbm9uZScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGludm9pY2VBZGRyZXNzLnF1ZXJ5U2VsZWN0b3IoJ29wdGlvbjpjaGVja2VkJykpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkID0gaW52b2ljZUFkZHJlc3MucXVlcnlTZWxlY3Rvcignb3B0aW9uOmNoZWNrZWQnKTtcbiAgICAgICAgICAgIGNvbnN0IGFkZHJlc3NEZWNvZGUgPSBKU09OLnBhcnNlKHNlbGVjdGVkLmRhdGFzZXQuYWRkcmVzcyk7XG4gICAgICAgICAgICBjb25zdCBhZGRyZXNzID0gYWRkcmVzc0RlY29kZS5odG1sO1xuXG4gICAgICAgICAgICBjb25zdCBhZGRyZXNzVHlwZSA9IGludm9pY2VBZGRyZXNzLnF1ZXJ5U2VsZWN0b3IoJ29wdGlvbjpjaGVja2VkJykuZGF0YXNldC5hZGRyZXNzVHlwZTtcblxuICAgICAgICAgICAgaWYgKHVzZUlhc1MpIHtcbiAgICAgICAgICAgICAgICBpZiAoYWRkcmVzc1R5cGUgPT09ICdpbnZvaWNlJykge1xuICAgICAgICAgICAgICAgICAgICB1c2VJYXNTLmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdXNlSWFzUy5jaGVja2VkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHVzZUlhc1MuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2NoYW5nZScpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB1c2VJYXNTLmRpc2FibGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoYWRkcmVzcykge1xuICAgICAgICAgICAgICAgIGludm9pY2VQYW5lbC5pbm5lckhUTUwgPSBhZGRyZXNzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNoaXBwaW5nQWRkcmVzcy5xdWVyeVNlbGVjdG9yKCdvcHRpb246Y2hlY2tlZCcpKSB7XG4gICAgICAgICAgICBjb25zdCBzZWxlY3RlZCA9IHNoaXBwaW5nQWRkcmVzcy5xdWVyeVNlbGVjdG9yKCdvcHRpb246Y2hlY2tlZCcpO1xuICAgICAgICAgICAgY29uc3QgYWRkcmVzc0RlY29kZSA9IEpTT04ucGFyc2Uoc2VsZWN0ZWQuZGF0YXNldC5hZGRyZXNzKTtcbiAgICAgICAgICAgIGNvbnN0IGFkZHJlc3MgPSBhZGRyZXNzRGVjb2RlLmh0bWw7XG4gICAgICAgICAgICBpZiAoYWRkcmVzcykge1xuICAgICAgICAgICAgICAgIHNoaXBwaW5nUGFuZWwuaW5uZXJIVE1MID0gYWRkcmVzcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbn0od2luZG93LnNob3AgPSB3aW5kb3cuc2hvcCB8fCB7fSkpO1xuIiwiKGZ1bmN0aW9uICh2YXJpYW50KSB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgd2luZG93LnZhcmlhbnRSZWFkeSA9IGZhbHNlO1xuXG4gICAgICAgIHZhcmlhbnQuaW5pdCgpO1xuXG4gICAgICAgIHdpbmRvdy52YXJpYW50UmVhZHkgPSB0cnVlO1xuICAgIH0pO1xuXG4gICAgdmFyaWFudC5pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zdCB2YXJpYW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wcm9kdWN0LWluZm9fX2F0dHJpYnV0ZXMnKTtcbiAgICAgICAgaWYgKCF2YXJpYW50cykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29yZXNob3BWYXJpYW50U2VsZWN0b3IodmFyaWFudHMpOyAvLyBFbnN1cmUgdGhpcyBmdW5jdGlvbiBpcyBkZWZpbmVkIGluIHlvdXIgZ2xvYmFsIHNjb3BlXG5cbiAgICAgICAgdmFyaWFudHMuYWRkRXZlbnRMaXN0ZW5lcigndmFyaWFudF9zZWxlY3Rvci5zZWxlY3QnLCAoZSkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgb3B0aW9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wcm9kdWN0LWluZm8gLnByb2R1Y3QtZGV0YWlscyAub3B0aW9ucycpO1xuXG4gICAgICAgICAgICBpZiAob3B0aW9ucykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN1Ym1pdHMgPSBvcHRpb25zLnF1ZXJ5U2VsZWN0b3JBbGwoJ1t0eXBlPVwic3VibWl0XCJdJyk7XG5cbiAgICAgICAgICAgICAgICBvcHRpb25zLmNsYXNzTGlzdC5hZGQoJ2Rpc2FibGVkJyk7XG5cbiAgICAgICAgICAgICAgICBzdWJtaXRzLmZvckVhY2goKHN1Ym1pdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBzdWJtaXQuZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xufSh3aW5kb3cudmFyaWFudCA9IHdpbmRvdy52YXJpYW50IHx8IHt9KSk7XG4iLCIvKiBTVFlMRVMgICovXG5pbXBvcnQgJy4uL3Njc3MvYXBwLnNjc3MnO1xuaW1wb3J0ICdzd2lwZXIvY3NzL2J1bmRsZSc7XG4vKiBKUyAqL1xuaW1wb3J0ICdib290c3RyYXAnO1xuaW1wb3J0ICcuL3NjcmlwdHMvaGFuZGxlLXByb3RvdHlwZXMuanMnO1xuaW1wb3J0ICcuL3BsdWdpbi9jb3Jlc2hvcC5wbHVnaW4ucXVhbnRpdHkuanMnO1xuaW1wb3J0ICcuL3BsdWdpbi9jb3Jlc2hvcC5wbHVnaW4udmFyaWFudC5qcyc7XG5pbXBvcnQgJy4vc2NyaXB0cy9zaG9wLmpzJztcbmltcG9ydCAnLi9zY3JpcHRzL3ZhcmlhbnQuanMnO1xuaW1wb3J0ICcuL3NjcmlwdHMvbWFwLmpzJztcbmltcG9ydCB7IENhcm91c2VsIH0gZnJvbSAnLi9zY3JpcHRzL2Nhcm91c2VsJztcbmltcG9ydCB7IENhcnRJbmZvIH0gZnJvbSAnLi9zY3JpcHRzL2NhcnRJbmZvJztcbnZhciBBcHAgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQXBwKCkge1xuICAgICAgICBuZXcgQ2FydEluZm8oJy9jb3Jlc2hvcF9nZXRfY2FydF9pdGVtcycsICcuanMtY2FydC13aWRnZXQnKTtcbiAgICAgICAgbmV3IENhcm91c2VsKCk7XG4gICAgfVxuICAgIHJldHVybiBBcHA7XG59KCkpO1xubmV3IEFwcCgpO1xuIiwiaW1wb3J0IFN3aXBlciBmcm9tICdzd2lwZXInO1xuaW1wb3J0IHsgVGh1bWJzIH0gZnJvbSBcInN3aXBlci9tb2R1bGVzXCI7XG52YXIgQ2Fyb3VzZWwgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQ2Fyb3VzZWwoKSB7XG4gICAgICAgIHRoaXMuX2luaXRDYXJvdXNlbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8qIEluaXQgc3dpcGVyIHdpdGggdGh1bWJzICovXG4gICAgICAgICAgICB2YXIgc2xpZGVyVGh1bWJuYWlsID0gbmV3IFN3aXBlcignLmpzLXNsaWRlci10aHVtYm5haWwnLCB7XG4gICAgICAgICAgICAgICAgc2xpZGVzUGVyVmlldzogMyxcbiAgICAgICAgICAgICAgICBmcmVlTW9kZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzcGFjZUJldHdlZW46ICc4cHgnLFxuICAgICAgICAgICAgICAgIHdhdGNoU2xpZGVzUHJvZ3Jlc3M6IHRydWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciBzbGlkZXIgPSBuZXcgU3dpcGVyKCcuanMtc2xpZGVyJywge1xuICAgICAgICAgICAgICAgIG1vZHVsZXM6IFtUaHVtYnNdLFxuICAgICAgICAgICAgICAgIG5hdmlnYXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgbmV4dEVsOiAnLnN3aXBlci1idXR0b24tbmV4dCcsXG4gICAgICAgICAgICAgICAgICAgIHByZXZFbDogJy5zd2lwZXItYnV0dG9uLXByZXYnLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGh1bWJzOiB7XG4gICAgICAgICAgICAgICAgICAgIHN3aXBlcjogc2xpZGVyVGh1bWJuYWlsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuX2luaXRDYXJvdXNlbCgpO1xuICAgIH1cbiAgICByZXR1cm4gQ2Fyb3VzZWw7XG59KCkpO1xuZXhwb3J0IHsgQ2Fyb3VzZWwgfTtcbiIsInZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xudmFyIF9fZ2VuZXJhdG9yID0gKHRoaXMgJiYgdGhpcy5fX2dlbmVyYXRvcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIGJvZHkpIHtcbiAgICB2YXIgXyA9IHsgbGFiZWw6IDAsIHNlbnQ6IGZ1bmN0aW9uKCkgeyBpZiAodFswXSAmIDEpIHRocm93IHRbMV07IHJldHVybiB0WzFdOyB9LCB0cnlzOiBbXSwgb3BzOiBbXSB9LCBmLCB5LCB0LCBnID0gT2JqZWN0LmNyZWF0ZSgodHlwZW9mIEl0ZXJhdG9yID09PSBcImZ1bmN0aW9uXCIgPyBJdGVyYXRvciA6IE9iamVjdCkucHJvdG90eXBlKTtcbiAgICByZXR1cm4gZy5uZXh0ID0gdmVyYigwKSwgZ1tcInRocm93XCJdID0gdmVyYigxKSwgZ1tcInJldHVyblwiXSA9IHZlcmIoMiksIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiAoZ1tTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzOyB9KSwgZztcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgcmV0dXJuIGZ1bmN0aW9uICh2KSB7IHJldHVybiBzdGVwKFtuLCB2XSk7IH07IH1cbiAgICBmdW5jdGlvbiBzdGVwKG9wKSB7XG4gICAgICAgIGlmIChmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgZXhlY3V0aW5nLlwiKTtcbiAgICAgICAgd2hpbGUgKGcgJiYgKGcgPSAwLCBvcFswXSAmJiAoXyA9IDApKSwgXykgdHJ5IHtcbiAgICAgICAgICAgIGlmIChmID0gMSwgeSAmJiAodCA9IG9wWzBdICYgMiA/IHlbXCJyZXR1cm5cIl0gOiBvcFswXSA/IHlbXCJ0aHJvd1wiXSB8fCAoKHQgPSB5W1wicmV0dXJuXCJdKSAmJiB0LmNhbGwoeSksIDApIDogeS5uZXh0KSAmJiAhKHQgPSB0LmNhbGwoeSwgb3BbMV0pKS5kb25lKSByZXR1cm4gdDtcbiAgICAgICAgICAgIGlmICh5ID0gMCwgdCkgb3AgPSBbb3BbMF0gJiAyLCB0LnZhbHVlXTtcbiAgICAgICAgICAgIHN3aXRjaCAob3BbMF0pIHtcbiAgICAgICAgICAgICAgICBjYXNlIDA6IGNhc2UgMTogdCA9IG9wOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDQ6IF8ubGFiZWwrKzsgcmV0dXJuIHsgdmFsdWU6IG9wWzFdLCBkb25lOiBmYWxzZSB9O1xuICAgICAgICAgICAgICAgIGNhc2UgNTogXy5sYWJlbCsrOyB5ID0gb3BbMV07IG9wID0gWzBdOyBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBjYXNlIDc6IG9wID0gXy5vcHMucG9wKCk7IF8udHJ5cy5wb3AoKTsgY29udGludWU7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEodCA9IF8udHJ5cywgdCA9IHQubGVuZ3RoID4gMCAmJiB0W3QubGVuZ3RoIC0gMV0pICYmIChvcFswXSA9PT0gNiB8fCBvcFswXSA9PT0gMikpIHsgXyA9IDA7IGNvbnRpbnVlOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gMyAmJiAoIXQgfHwgKG9wWzFdID4gdFswXSAmJiBvcFsxXSA8IHRbM10pKSkgeyBfLmxhYmVsID0gb3BbMV07IGJyZWFrOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gNiAmJiBfLmxhYmVsIDwgdFsxXSkgeyBfLmxhYmVsID0gdFsxXTsgdCA9IG9wOyBicmVhazsgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodCAmJiBfLmxhYmVsIDwgdFsyXSkgeyBfLmxhYmVsID0gdFsyXTsgXy5vcHMucHVzaChvcCk7IGJyZWFrOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0WzJdKSBfLm9wcy5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9wID0gYm9keS5jYWxsKHRoaXNBcmcsIF8pO1xuICAgICAgICB9IGNhdGNoIChlKSB7IG9wID0gWzYsIGVdOyB5ID0gMDsgfSBmaW5hbGx5IHsgZiA9IHQgPSAwOyB9XG4gICAgICAgIGlmIChvcFswXSAmIDUpIHRocm93IG9wWzFdOyByZXR1cm4geyB2YWx1ZTogb3BbMF0gPyBvcFsxXSA6IHZvaWQgMCwgZG9uZTogdHJ1ZSB9O1xuICAgIH1cbn07XG52YXIgQ2FydEluZm8gPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQ2FydEluZm8oYXBpVXJsLCBlbGVtZW50U2VsZWN0b3IpIHtcbiAgICAgICAgdGhpcy5hcGlVcmwgPSBhcGlVcmw7XG4gICAgICAgIHRoaXMuZWxlbWVudFNlbGVjdG9yID0gZWxlbWVudFNlbGVjdG9yO1xuICAgICAgICB0aGlzLl9pbml0Q2FydFdpZGdldCgpO1xuICAgIH1cbiAgICBDYXJ0SW5mby5wcm90b3R5cGUuZmV0Y2hDYXJ0SXRlbXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciByZXNwb25zZSwgaHRtbCwgZXJyb3JfMTtcbiAgICAgICAgICAgIHJldHVybiBfX2dlbmVyYXRvcih0aGlzLCBmdW5jdGlvbiAoX2EpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKF9hLmxhYmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICAgICAgICAgIF9hLnRyeXMucHVzaChbMCwgMywgLCA0XSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzQgLyp5aWVsZCovLCBmZXRjaCh0aGlzLmFwaVVybCldO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNwb25zZSA9IF9hLnNlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdUaGVyZSBoYXMgYmVlbiBhIHByb2JsZW0gd2l0aCB5b3VyIGZldGNoIG9wZXJhdGlvbjonLCByZXNwb25zZS5zdGF0dXNUZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbNCAvKnlpZWxkKi8sIHJlc3BvbnNlLnRleHQoKV07XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGh0bWwgPSBfYS5zZW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc3BsYXlDYXJ0SXRlbXMoaHRtbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzMgLypicmVhayovLCA0XTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JfMSA9IF9hLnNlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1RoZXJlIGhhcyBiZWVuIGEgcHJvYmxlbSB3aXRoIHlvdXIgZmV0Y2ggb3BlcmF0aW9uOicsIGVycm9yXzEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFszIC8qYnJlYWsqLywgNF07XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgNDogcmV0dXJuIFsyIC8qcmV0dXJuKi9dO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIENhcnRJbmZvLnByb3RvdHlwZS5faW5pdENhcnRXaWRnZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuZmV0Y2hDYXJ0SXRlbXMoKTtcbiAgICB9O1xuICAgIENhcnRJbmZvLnByb3RvdHlwZS5kaXNwbGF5Q2FydEl0ZW1zID0gZnVuY3Rpb24gKGh0bWwpIHtcbiAgICAgICAgdmFyIGNhcnRGbGFnID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLmVsZW1lbnRTZWxlY3Rvcik7XG4gICAgICAgIGlmIChjYXJ0RmxhZykge1xuICAgICAgICAgICAgdmFyIGxvYWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYXJ0LWxvYWRlcicpO1xuICAgICAgICAgICAgaWYgKGxvYWRlcikge1xuICAgICAgICAgICAgICAgIGxvYWRlci5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhcnRGbGFnLmlubmVySFRNTCArPSBodG1sO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gQ2FydEluZm87XG59KCkpO1xuZXhwb3J0IHsgQ2FydEluZm8gfTtcbiIsIi8vIGV4dHJhY3RlZCBieSBtaW5pLWNzcy1leHRyYWN0LXBsdWdpblxuZXhwb3J0IHt9OyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4vLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuX193ZWJwYWNrX3JlcXVpcmVfXy5tID0gX193ZWJwYWNrX21vZHVsZXNfXztcblxuIiwidmFyIGRlZmVycmVkID0gW107XG5fX3dlYnBhY2tfcmVxdWlyZV9fLk8gPSAocmVzdWx0LCBjaHVua0lkcywgZm4sIHByaW9yaXR5KSA9PiB7XG5cdGlmKGNodW5rSWRzKSB7XG5cdFx0cHJpb3JpdHkgPSBwcmlvcml0eSB8fCAwO1xuXHRcdGZvcih2YXIgaSA9IGRlZmVycmVkLmxlbmd0aDsgaSA+IDAgJiYgZGVmZXJyZWRbaSAtIDFdWzJdID4gcHJpb3JpdHk7IGktLSkgZGVmZXJyZWRbaV0gPSBkZWZlcnJlZFtpIC0gMV07XG5cdFx0ZGVmZXJyZWRbaV0gPSBbY2h1bmtJZHMsIGZuLCBwcmlvcml0eV07XG5cdFx0cmV0dXJuO1xuXHR9XG5cdHZhciBub3RGdWxmaWxsZWQgPSBJbmZpbml0eTtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBkZWZlcnJlZC5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBjaHVua0lkcyA9IGRlZmVycmVkW2ldWzBdO1xuXHRcdHZhciBmbiA9IGRlZmVycmVkW2ldWzFdO1xuXHRcdHZhciBwcmlvcml0eSA9IGRlZmVycmVkW2ldWzJdO1xuXHRcdHZhciBmdWxmaWxsZWQgPSB0cnVlO1xuXHRcdGZvciAodmFyIGogPSAwOyBqIDwgY2h1bmtJZHMubGVuZ3RoOyBqKyspIHtcblx0XHRcdGlmICgocHJpb3JpdHkgJiAxID09PSAwIHx8IG5vdEZ1bGZpbGxlZCA+PSBwcmlvcml0eSkgJiYgT2JqZWN0LmtleXMoX193ZWJwYWNrX3JlcXVpcmVfXy5PKS5ldmVyeSgoa2V5KSA9PiAoX193ZWJwYWNrX3JlcXVpcmVfXy5PW2tleV0oY2h1bmtJZHNbal0pKSkpIHtcblx0XHRcdFx0Y2h1bmtJZHMuc3BsaWNlKGotLSwgMSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRmdWxmaWxsZWQgPSBmYWxzZTtcblx0XHRcdFx0aWYocHJpb3JpdHkgPCBub3RGdWxmaWxsZWQpIG5vdEZ1bGZpbGxlZCA9IHByaW9yaXR5O1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZihmdWxmaWxsZWQpIHtcblx0XHRcdGRlZmVycmVkLnNwbGljZShpLS0sIDEpXG5cdFx0XHR2YXIgciA9IGZuKCk7XG5cdFx0XHRpZiAociAhPT0gdW5kZWZpbmVkKSByZXN1bHQgPSByO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gcmVzdWx0O1xufTsiLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gKG1vZHVsZSkgPT4ge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHQoKSA9PiAobW9kdWxlWydkZWZhdWx0J10pIDpcblx0XHQoKSA9PiAobW9kdWxlKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgeyBhOiBnZXR0ZXIgfSk7XG5cdHJldHVybiBnZXR0ZXI7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18uZyA9IChmdW5jdGlvbigpIHtcblx0aWYgKHR5cGVvZiBnbG9iYWxUaGlzID09PSAnb2JqZWN0JykgcmV0dXJuIGdsb2JhbFRoaXM7XG5cdHRyeSB7XG5cdFx0cmV0dXJuIHRoaXMgfHwgbmV3IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpIHJldHVybiB3aW5kb3c7XG5cdH1cbn0pKCk7IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIi8vIG5vIGJhc2VVUklcblxuLy8gb2JqZWN0IHRvIHN0b3JlIGxvYWRlZCBhbmQgbG9hZGluZyBjaHVua3Ncbi8vIHVuZGVmaW5lZCA9IGNodW5rIG5vdCBsb2FkZWQsIG51bGwgPSBjaHVuayBwcmVsb2FkZWQvcHJlZmV0Y2hlZFxuLy8gW3Jlc29sdmUsIHJlamVjdCwgUHJvbWlzZV0gPSBjaHVuayBsb2FkaW5nLCAwID0gY2h1bmsgbG9hZGVkXG52YXIgaW5zdGFsbGVkQ2h1bmtzID0ge1xuXHRcImFwcFwiOiAwXG59O1xuXG4vLyBubyBjaHVuayBvbiBkZW1hbmQgbG9hZGluZ1xuXG4vLyBubyBwcmVmZXRjaGluZ1xuXG4vLyBubyBwcmVsb2FkZWRcblxuLy8gbm8gSE1SXG5cbi8vIG5vIEhNUiBtYW5pZmVzdFxuXG5fX3dlYnBhY2tfcmVxdWlyZV9fLk8uaiA9IChjaHVua0lkKSA9PiAoaW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdID09PSAwKTtcblxuLy8gaW5zdGFsbCBhIEpTT05QIGNhbGxiYWNrIGZvciBjaHVuayBsb2FkaW5nXG52YXIgd2VicGFja0pzb25wQ2FsbGJhY2sgPSAocGFyZW50Q2h1bmtMb2FkaW5nRnVuY3Rpb24sIGRhdGEpID0+IHtcblx0dmFyIGNodW5rSWRzID0gZGF0YVswXTtcblx0dmFyIG1vcmVNb2R1bGVzID0gZGF0YVsxXTtcblx0dmFyIHJ1bnRpbWUgPSBkYXRhWzJdO1xuXHQvLyBhZGQgXCJtb3JlTW9kdWxlc1wiIHRvIHRoZSBtb2R1bGVzIG9iamVjdCxcblx0Ly8gdGhlbiBmbGFnIGFsbCBcImNodW5rSWRzXCIgYXMgbG9hZGVkIGFuZCBmaXJlIGNhbGxiYWNrXG5cdHZhciBtb2R1bGVJZCwgY2h1bmtJZCwgaSA9IDA7XG5cdGlmKGNodW5rSWRzLnNvbWUoKGlkKSA9PiAoaW5zdGFsbGVkQ2h1bmtzW2lkXSAhPT0gMCkpKSB7XG5cdFx0Zm9yKG1vZHVsZUlkIGluIG1vcmVNb2R1bGVzKSB7XG5cdFx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8obW9yZU1vZHVsZXMsIG1vZHVsZUlkKSkge1xuXHRcdFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLm1bbW9kdWxlSWRdID0gbW9yZU1vZHVsZXNbbW9kdWxlSWRdO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZihydW50aW1lKSB2YXIgcmVzdWx0ID0gcnVudGltZShfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblx0fVxuXHRpZihwYXJlbnRDaHVua0xvYWRpbmdGdW5jdGlvbikgcGFyZW50Q2h1bmtMb2FkaW5nRnVuY3Rpb24oZGF0YSk7XG5cdGZvcig7aSA8IGNodW5rSWRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0Y2h1bmtJZCA9IGNodW5rSWRzW2ldO1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhpbnN0YWxsZWRDaHVua3MsIGNodW5rSWQpICYmIGluc3RhbGxlZENodW5rc1tjaHVua0lkXSkge1xuXHRcdFx0aW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdWzBdKCk7XG5cdFx0fVxuXHRcdGluc3RhbGxlZENodW5rc1tjaHVua0lkXSA9IDA7XG5cdH1cblx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18uTyhyZXN1bHQpO1xufVxuXG52YXIgY2h1bmtMb2FkaW5nR2xvYmFsID0gc2VsZltcIndlYnBhY2tDaHVua1wiXSA9IHNlbGZbXCJ3ZWJwYWNrQ2h1bmtcIl0gfHwgW107XG5jaHVua0xvYWRpbmdHbG9iYWwuZm9yRWFjaCh3ZWJwYWNrSnNvbnBDYWxsYmFjay5iaW5kKG51bGwsIDApKTtcbmNodW5rTG9hZGluZ0dsb2JhbC5wdXNoID0gd2VicGFja0pzb25wQ2FsbGJhY2suYmluZChudWxsLCBjaHVua0xvYWRpbmdHbG9iYWwucHVzaC5iaW5kKGNodW5rTG9hZGluZ0dsb2JhbCkpOyIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgZGVwZW5kcyBvbiBvdGhlciBsb2FkZWQgY2h1bmtzIGFuZCBleGVjdXRpb24gbmVlZCB0byBiZSBkZWxheWVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18uTyh1bmRlZmluZWQsIFtcInZlbmRvcnMtbm9kZV9tb2R1bGVzX2Jvb3RzdHJhcF9kaXN0X2pzX2Jvb3RzdHJhcF9lc21fanMtbm9kZV9tb2R1bGVzX3N3aXBlcl9zd2lwZXItYnVuZGxlX2Nzcy0wY2RlZGJcIl0sICgpID0+IChfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9qcy9hcHAudHNcIikpKVxuX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18uTyhfX3dlYnBhY2tfZXhwb3J0c19fKTtcbiIsIiJdLCJuYW1lcyI6WyJjb3Jlc2hvcFF1YW50aXR5U2VsZWN0b3IiLCJvcHRpb25zIiwiaW5pdFF1YW50aXR5RmllbGRzIiwiZmllbGRzIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yQWxsIiwicHJlY2lzaW9uUHJlc2V0U2VsZWN0b3IiLCJxdWVyeVNlbGVjdG9yIiwiYWRkRXZlbnRMaXN0ZW5lciIsImRhdGFzZXQiLCJjc1VuaXRJZGVudGlmaWVyIiwic2VsZWN0ZWRPcHRpb24iLCJzZWxlY3RlZEluZGV4IiwicXVhbnRpdHlJZGVudGlmaWVyIiwicXVhbnRpdHlJbnB1dCIsImNvbmNhdCIsInN0ZXAiLCJjc1VuaXRQcmVjaXNpb24iLCJ1cGRhdGVUb3VjaFNwaW5TZXR0aW5ncyIsInRvU3RyaW5nIiwiZm9yRWFjaCIsImZpZWxkIiwiaW5pdGlhbGl6ZVRvdWNoU3BpbiIsImlucHV0IiwicHJlY2lzaW9uIiwiY29udGFpbmVyIiwiY3JlYXRlRWxlbWVudCIsImNsYXNzTGlzdCIsImFkZCIsImRlY3JlbWVudEJ1dHRvbiIsInR5cGUiLCJ0ZXh0Q29udGVudCIsImluY3JlbWVudEJ1dHRvbiIsInBhcmVudE5vZGUiLCJpbnNlcnRCZWZvcmUiLCJhcHBlbmRDaGlsZCIsInZhbHVlIiwicGFyc2VJbnQiLCJpc05hTiIsIm1pbiIsIm1heCIsIndpbmRvdyIsImNvcmVzaG9wVmFyaWFudFNlbGVjdG9yIiwiYXR0cmlidXRlQ29udGFpbmVyIiwiX2F0dHJpYnV0ZUNvbnRhaW5lciIsInVuZGVmaW5lZCIsIl9jb25maWciLCJfYXR0cmlidXRlR3JvdXBzIiwiX2NsZWFyR3JvdXAiLCJncm91cCIsInNlbGVjdGVkIiwiZWxlbWVudHMiLCJlbGVtZW50IiwiZGlzYWJsZWQiLCJjaGVja2VkIiwidGFnTmFtZSIsInRvTG93ZXJDYXNlIiwib3B0aW9uIiwicmVtb3ZlQ2hpbGQiLCJfY2xlYXJHcm91cHMiLCJuZXh0R3JvdXAiLCJfZmlsdGVyQXR0cmlidXRlcyIsImF0dHJpYnV0ZXMiLCJmaWx0ZXJBdHRyaWJ1dGVzIiwicHJldkdyb3VwIiwicHVzaCIsImlkIiwiZmlsdGVyZWQiLCJhdHRyaWJ1dGUiLCJwcm9kdWN0cyIsInByb2R1Y3QiLCJldmVyeSIsIngiLCJpbmRleCIsImhhc093blByb3BlcnR5IiwiaW5jbHVkZXMiLCJsZW5ndGgiLCJfY29uZmlndXJlR3JvdXAiLCJzbGljZSIsIk9wdGlvbiIsIm5hbWUiLCJfc2V0dXBBdHRyaWJ1dGVHcm91cFNldHRpbmdzIiwiX3NldHVwQ2hhbmdlRXZlbnRzIiwib25jaGFuZ2UiLCJlIiwiX2NvbmZpZ3VyZUVsZW1lbnQiLCJfaW5pdCIsIkpTT04iLCJwYXJzZSIsImNvbmZpZyIsIl9yZWRpcmVjdFRvVmFyaWFudCIsImdyb3VwcyIsImZpbHRlciIsImciLCJPYmplY3QiLCJmcm9tRW50cmllcyIsIm1hcCIsInZhbHVlcyIsInAiLCJzdHJpbmdpZnkiLCJsb2NhdGlvbiIsImhyZWYiLCJfY3JlYXRlRXZlbnQiLCJkYXRhIiwiYXJndW1lbnRzIiwiQ3VzdG9tRXZlbnQiLCJidWJibGVzIiwiY2FuY2VsYWJsZSIsImRldGFpbCIsInZhcmlhbnRSZWFkeSIsImRpc3BhdGNoRXZlbnQiLCJtZXRob2RzIiwiaW5pdCIsInNldHRpbmdzIiwiYXNzaWduIiwic2VsZWN0b3IiLCJzaG93IiwicmVwbGFjZSIsInNlbGVjdGVkVmFsdWUiLCJwcm90b3R5cGVQcmVmaXgiLCJzZWxlY3RvckF0dHIiLCJBcnJheSIsImZyb20iLCJmaW5kIiwiZ2V0QXR0cmlidXRlIiwicHJvdG90eXBlRWxlbWVudCIsImdldEVsZW1lbnRCeUlkIiwiY29udGFpbmVyU2VsZWN0b3IiLCJkYXRhQ29udGFpbmVySWQiLCJpbm5lckhUTUwiLCJ0cmltIiwicHJvdG90eXBlIiwiTm9kZUxpc3QiLCJoYW5kbGVQcm90b3R5cGVzIiwibWV0aG9kIiwiYXBwbHkiLCJjYWxsIiwiRXJyb3IiLCJIVE1MRWxlbWVudCIsIm1hcEJsb2NrIiwic3R5bGUiLCJoZWlnaHQiLCJjbGllbnRIZWlnaHQiLCJpbml0aWFsaXplIiwibWFwT3B0aW9ucyIsInpvb20iLCJjZW50ZXIiLCJnb29nbGUiLCJtYXBzIiwiTGF0TG5nIiwiZGlzYWJsZURlZmF1bHRVSSIsIk1hcCIsInNob3AiLCJpbml0Q2hhbmdlQWRkcmVzcyIsImluaXRDYXJ0U2hpcG1lbnRDYWxjdWxhdG9yIiwiaW5pdFF1YW50aXR5VmFsaWRhdG9yIiwiaW5pdENhdGVnb3J5U2VsZWN0IiwiYnV0dG9uIiwidGFyZ2V0SWQiLCJ0YXJnZXQiLCJjb3B5VGV4dCIsInNlbGVjdCIsInNldFNlbGVjdGlvblJhbmdlIiwibmF2aWdhdG9yIiwiY2xpcGJvYXJkIiwid3JpdGVUZXh0IiwidGhlbiIsImNvbnNvbGUiLCJsb2ciLCJjb3BpZWRUZXh0IiwidXBkYXRlUXVlcnlTdHJpbmdQYXJhbWV0ZXIiLCJ1cmkiLCJrZXkiLCJyZSIsIlJlZ0V4cCIsInNlcGFyYXRvciIsImluZGV4T2YiLCJtYXRjaCIsImJ1dHRvbmRvd25fY2xhc3MiLCJidXR0b251cF9jbGFzcyIsImV2IiwiZm9ybSIsImNsb3Nlc3QiLCJwcmV2ZW50RGVmYXVsdCIsInNldEF0dHJpYnV0ZSIsIm9wYWNpdHkiLCJmZXRjaCIsImFjdGlvbiIsImJvZHkiLCJVUkxTZWFyY2hQYXJhbXMiLCJGb3JtRGF0YSIsInJlc3BvbnNlIiwidGV4dCIsInJlcyIsInJlbW92ZSIsIm91dGVySFRNTCIsImNhdGNoIiwiZXJyb3IiLCJyZW1vdmVBdHRyaWJ1dGUiLCJhZGRyZXNzU3RlcCIsImludm9pY2VBZGRyZXNzIiwiaW52b2ljZVBhbmVsIiwiaW52b2ljZUZpZWxkIiwic2hpcHBpbmdBZGRyZXNzIiwic2hpcHBpbmdQYW5lbCIsInNoaXBwaW5nRmllbGQiLCJzaGlwcGluZ0FkZEFkZHJlc3NCdXR0b24iLCJwYXJlbnRFbGVtZW50IiwidXNlSWFzUyIsImFkZHJlc3NEZWNvZGUiLCJhZGRyZXNzIiwiaHRtbCIsImFkZHJlc3NUeXBlIiwiRXZlbnQiLCJkaXNwbGF5IiwidmFyaWFudCIsInZhcmlhbnRzIiwic3VibWl0cyIsInN1Ym1pdCIsIkNhcm91c2VsIiwiQ2FydEluZm8iLCJBcHAiLCJTd2lwZXIiLCJUaHVtYnMiLCJfaW5pdENhcm91c2VsIiwic2xpZGVyVGh1bWJuYWlsIiwic2xpZGVzUGVyVmlldyIsImZyZWVNb2RlIiwic3BhY2VCZXR3ZWVuIiwid2F0Y2hTbGlkZXNQcm9ncmVzcyIsInNsaWRlciIsIm1vZHVsZXMiLCJuYXZpZ2F0aW9uIiwibmV4dEVsIiwicHJldkVsIiwidGh1bWJzIiwic3dpcGVyIiwiX19hd2FpdGVyIiwidGhpc0FyZyIsIl9hcmd1bWVudHMiLCJQIiwiZ2VuZXJhdG9yIiwiYWRvcHQiLCJyZXNvbHZlIiwiUHJvbWlzZSIsInJlamVjdCIsImZ1bGZpbGxlZCIsIm5leHQiLCJyZWplY3RlZCIsInJlc3VsdCIsImRvbmUiLCJfX2dlbmVyYXRvciIsIl8iLCJsYWJlbCIsInNlbnQiLCJ0IiwidHJ5cyIsIm9wcyIsImYiLCJ5IiwiY3JlYXRlIiwiSXRlcmF0b3IiLCJ2ZXJiIiwiU3ltYm9sIiwiaXRlcmF0b3IiLCJuIiwidiIsIm9wIiwiVHlwZUVycm9yIiwicG9wIiwiYXBpVXJsIiwiZWxlbWVudFNlbGVjdG9yIiwiX2luaXRDYXJ0V2lkZ2V0IiwiZmV0Y2hDYXJ0SXRlbXMiLCJlcnJvcl8xIiwiX2EiLCJvayIsInN0YXR1c1RleHQiLCJkaXNwbGF5Q2FydEl0ZW1zIiwiY2FydEZsYWciLCJsb2FkZXIiXSwic291cmNlUm9vdCI6IiJ9