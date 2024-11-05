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
    let _attributeContainer = null;
    let _config = {};
    let _attributeGroups = [];
    const _clearGroupElements = function (element) {
      element.disabled = true;
      element.checked = false;

      // Remove options on select
      if (element.tagName.toLowerCase() === 'select') {
        const options = element.querySelectorAll('option:not([value=""])');
        options.forEach(option => element.removeChild(option));
      }
    };
    const _clearGroup = function (group) {
      delete group.selected;
      group.elements.forEach(_clearGroupElements);
    };
    const _clearGroups = function (group) {
      while (group) {
        _clearGroup(group);
        group = group.nextGroup;
      }
    };
    const _filterAttributes = function (attributes, group) {
      const filterAttributes = [];
      let currentGroup = group.prevGroup;
      while (currentGroup) {
        if (currentGroup.selected && currentGroup.nextGroup) {
          filterAttributes.push({
            group: currentGroup.group.id,
            selected: currentGroup.selected
          });
        }
        currentGroup = currentGroup.prevGroup;
      }
      return attributes.filter(attribute => attribute.products.some(product => filterAttributes.every(filter => {
        var _config$index$product;
        return ((_config$index$product = _config.index[product.id].attributes) === null || _config$index$product === void 0 ? void 0 : _config$index$product[filter.group]) === filter.selected;
      })));
    };
    const _addOptionToSelect = function (element, attribute, group) {
      const option = new Option(attribute.attribute.name, attribute.attribute.id);
      option.id = 'attribute-' + attribute.attribute.id;
      if (group.selected === attribute.attribute.id) {
        option.selected = true;
      }
      element.add(option);
      element.disabled = false;
    };
    const _enableElementForAttribute = function (element, attribute, group) {
      if (parseInt(element.dataset.group) === group.group.id && parseInt(element.value) === attribute.attribute.id) {
        element.disabled = false;
        if (group.selected === attribute.attribute.id) {
          element.checked = true;
        }
      }
    };
    const _configureGroupElements = function (group, attributes) {
      group.elements.forEach(element => {
        if (element.tagName.toLowerCase() === 'select') {
          attributes.forEach(attribute => _addOptionToSelect(element, attribute, group));
        } else {
          attributes.forEach(attribute => _enableElementForAttribute(element, attribute, group));
        }
      });
    };
    const _configureGroup = function (group) {
      const filteredAttributes = _filterAttributes(group.attributes.slice(), group) || group.attributes;
      _configureGroupElements(group, filteredAttributes);
    };
    const _setupAttributeGroupSettings = function () {
      _attributeGroups.forEach((group, index) => {
        group.prevGroup = _attributeGroups[index - 1] || null;
        group.nextGroup = _attributeGroups[index + 1] || null;
        if (!index || group.selected) {
          _configureGroup(group);
        } else {
          _clearGroup(group);
        }
      });
    };
    const _setupChangeEvents = function () {
      _attributeGroups.forEach(group => {
        group.elements.forEach(element => {
          element.onchange = () => _configureElement(group, element);
        });
      });
    };
    const _redirectToVariant = function () {
      const selectedAttributes = Object.fromEntries(_attributeGroups.filter(g => g.selected).map(g => [g.group.id, g.selected]));
      const matchingProduct = Object.values(_config.index).find(p => JSON.stringify(p.attributes) === JSON.stringify(selectedAttributes));
      if (matchingProduct !== null && matchingProduct !== void 0 && matchingProduct.url) {
        window.location.href = matchingProduct.url;
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
        element
      }));
      if (element.value) {
        group.selected = parseInt(element.value);
        _attributeContainer.dispatchEvent(_createEvent('select', {
          element
        }));
        if (group.nextGroup) {
          _clearGroups(group.nextGroup);
          _configureGroup(group.nextGroup);
        } else {
          _attributeContainer.dispatchEvent(_createEvent('redirect', {
            element
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
    const _init = function () {
      if (!attributeContainer) return;
      _attributeContainer = attributeContainer;
      _config = JSON.parse(_attributeContainer.dataset.config);
      _config.attributes.forEach(group => {
        group.elements = _attributeContainer.querySelectorAll("[data-group=\"".concat(group.group.id, "\"]"));
        _attributeGroups.push(group);
      });
      _setupAttributeGroupSettings();
      _setupChangeEvents();
    };
    _init();
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
      const settings = {
        prototypePrefix: false,
        containerSelector: false,
        selectorAttr: false,
        ...options // Using object spread here
      };
      const elements = document.querySelectorAll(this.selector);
      elements.forEach(element => {
        this.show(element, settings, false);
        element.addEventListener('change', () => {
          this.show(element, settings, true);
        });
      });
    },
    show: function (element, settings, replace) {
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
      const prototypeElement = document.getElementById("".concat(prototypePrefix, "_").concat(selectedValue));
      let container = this.getContainer(settings, prototypeElement);
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
    },
    getContainer: function (settings, prototypeElement) {
      if (settings.containerSelector) {
        return document.querySelector(settings.containerSelector);
      } else {
        const dataContainerId = prototypeElement ? prototypeElement.dataset.container : null;
        return document.getElementById(dataContainerId);
      }
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
      new google.maps.Map(mapBlock, mapOptions); // Removed the unused 'map' variable
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
    showElement(element, false);
    element.addEventListener('change', function () {
      showElement(element, true);
    });
  });
  function showElement(element, replace) {
    const selectedValue = getSelectedValue(element);
    const prototypePrefix = settings.prototypePrefix || element.id;
    const prototypeElement = document.getElementById("".concat(prototypePrefix, "_").concat(selectedValue));
    const container = getContainer(prototypeElement);
    if (container && (replace || !container.innerHTML.trim())) {
      container.innerHTML = prototypeElement ? prototypeElement.dataset.prototype : '';
    }
  }
  function getSelectedValue(element) {
    if (settings.selectorAttr) {
      return element.querySelector("[value=\"".concat(element.value, "\"]")).getAttribute(settings.selectorAttr);
    }
    return element.value;
  }
  function getContainer(prototypeElement) {
    if (settings.containerSelector) {
      return document.querySelector(settings.containerSelector);
    }
    return prototypeElement ? document.querySelector(prototypeElement.dataset.container) : null;
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
    setupCopyToClipboard();
  };
  function setupCopyToClipboard() {
    document.querySelectorAll('.copy-to-clipboard').forEach(function (button) {
      button.addEventListener('click', function () {
        copyTextToClipboard(this);
      });
    });
  }
  function copyTextToClipboard(button) {
    const targetId = button.dataset.target;
    const copyText = document.getElementById(targetId);
    if (copyText) {
      copyText.select();
      copyText.setSelectionRange(0, 99999); // For mobile devices

      navigator.clipboard.writeText(copyText.value).then(() => {
        console.log(button.dataset.copiedText);
      });
    }
  }
  shop.initCategorySelect = function () {
    document.querySelectorAll(".site-reload").forEach(function (select) {
      select.addEventListener('change', function () {
        location.href = updateQueryStringParameter(window.location.href, this.name, this.value);
      });
    });
  };
  function updateQueryStringParameter(uri, key, value) {
    const re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
    const separator = uri.indexOf('?') !== -1 ? "&" : "?";
    return uri.match(re) ? uri.replace(re, '$1' + key + "=" + value + '$2') : uri + separator + key + "=" + value;
  }
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
        handleShipmentCalculation(form);
      }
    });
  };
  function handleShipmentCalculation(form) {
    event.preventDefault();
    form.classList.add('loading');
    form.querySelector('button[type="submit"]').setAttribute('disabled', 'disabled');
    form.closest('.cart-shipment-calculation-box').querySelector('.cart-shipment-available-carriers').style.opacity = 0.2;
    fetch(form.action, {
      method: 'POST',
      body: new URLSearchParams(new FormData(form))
    }).then(response => response.text()).then(res => updateShipmentCalculation(form, res)).catch(error => handleShipmentError(form, error));
  }
  function updateShipmentCalculation(form, responseText) {
    form.classList.remove('loading');
    form.closest('.cart-shipment-calculation-box').outerHTML = responseText;
  }
  function handleShipmentError(form, error) {
    console.error('Error:', error);
    form.classList.remove('loading');
    form.querySelector('button[type="submit"]').removeAttribute('disabled');
  }
  shop.initChangeAddress = function () {
    const addressStep = document.querySelector('.checkout-step.step-address');
    if (!addressStep) return;
    const invoiceAddress = addressStep.querySelector('select[name="coreshop[invoiceAddress]"]');
    const shippingAddress = addressStep.querySelector('select[name="coreshop[shippingAddress]"]');
    const useIasS = addressStep.querySelector('[name="coreshop[useInvoiceAsShipping]"]');
    setupAddressChangeEvents(invoiceAddress, shippingAddress, useIasS);
  };
  function setupAddressChangeEvents(invoiceAddress, shippingAddress, useIasS) {
    invoiceAddress.addEventListener('change', () => updateAddress(invoiceAddress, useIasS));
    shippingAddress.addEventListener('change', () => updateShippingAddress(shippingAddress));
    if (useIasS) useIasS.addEventListener('change', () => toggleShippingAddress(useIasS, invoiceAddress, shippingAddress));
  }
  function updateAddress(invoiceAddress, useIasS) {
    const selected = invoiceAddress.options[invoiceAddress.selectedIndex];
    const address = JSON.parse(selected.dataset.address).html;
    const invoicePanel = document.querySelector('.panel-invoice-address');
    invoicePanel.innerHTML = address || '';
    toggleUseAsShipping(useIasS, selected.dataset.addressType === 'invoice');
  }
  function toggleUseAsShipping(useIasS, isInvoiceType) {
    if (useIasS) {
      useIasS.disabled = isInvoiceType;
      if (isInvoiceType) {
        useIasS.checked = false;
        useIasS.dispatchEvent(new Event('change'));
      }
    }
  }
  function updateShippingAddress(shippingAddress) {
    const selected = shippingAddress.options[shippingAddress.selectedIndex];
    const address = JSON.parse(selected.dataset.address).html;
    document.querySelector('.panel-shipping-address').innerHTML = address || '';
  }
  function toggleShippingAddress(useIasS, invoiceAddress, shippingAddress) {
    const shippingField = document.querySelector('.shipping-address-selector');
    const shippingAddAddressButton = document.querySelector('.card-footer');
    if (useIasS.checked) {
      shippingField.style.display = 'none';
      shippingAddress.value = invoiceAddress.value;
      shippingAddress.dispatchEvent(new Event('change'));
      if (shippingAddAddressButton) shippingAddAddressButton.classList.add('d-none');
    } else {
      shippingField.style.display = '';
      if (shippingAddAddressButton) shippingAddAddressButton.classList.remove('d-none');
    }
  }
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
})(window.variant || (window.variant = {})); // Extracted assignment

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









new _scripts_cartInfo__WEBPACK_IMPORTED_MODULE_10__.CartInfo('/coreshop_get_cart_items', '.js-cart-widget');
new _scripts_carousel__WEBPACK_IMPORTED_MODULE_9__.Carousel();

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
      new swiper__WEBPACK_IMPORTED_MODULE_0__["default"]('.js-slider', {
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
              return [2 /*return*/]; // Added return to prevent further execution if there's an error
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOzs7OztXQ3pCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLCtCQUErQix3Q0FBd0M7V0FDdkU7V0FDQTtXQUNBO1dBQ0E7V0FDQSxpQkFBaUIscUJBQXFCO1dBQ3RDO1dBQ0E7V0FDQTtXQUNBO1dBQ0Esa0JBQWtCLHFCQUFxQjtXQUN2QztXQUNBO1dBQ0EsS0FBSztXQUNMO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTs7Ozs7V0M3QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLGlDQUFpQyxXQUFXO1dBQzVDO1dBQ0E7Ozs7O1dDUEE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLEdBQUc7V0FDSDtXQUNBO1dBQ0EsQ0FBQzs7Ozs7V0NQRDs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7O1dDTkE7O1dBRUE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBOztXQUVBOztXQUVBOztXQUVBOztXQUVBOztXQUVBOztXQUVBOztXQUVBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxNQUFNLHFCQUFxQjtXQUMzQjtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBOztXQUVBO1dBQ0E7V0FDQTs7Ozs7VUVsREE7VUFDQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovLy8uL2pzL3BsdWdpbi9jb3Jlc2hvcC5wbHVnaW4ucXVhbnRpdHkuanMiLCJ3ZWJwYWNrOi8vLy4vanMvcGx1Z2luL2NvcmVzaG9wLnBsdWdpbi52YXJpYW50LmpzIiwid2VicGFjazovLy8uL2pzL3NjcmlwdHMvaGFuZGxlLXByb3RvdHlwZXMuanMiLCJ3ZWJwYWNrOi8vLy4vanMvc2NyaXB0cy9tYXAuanMiLCJ3ZWJwYWNrOi8vLy4vanMvc2NyaXB0cy9zaG9wLmpzIiwid2VicGFjazovLy8uL2pzL3NjcmlwdHMvdmFyaWFudC5qcyIsIndlYnBhY2s6Ly8vLi9qcy9hcHAudHMiLCJ3ZWJwYWNrOi8vLy4vanMvc2NyaXB0cy9jYXJvdXNlbC50cyIsIndlYnBhY2s6Ly8vLi9qcy9zY3JpcHRzL2NhcnRJbmZvLnRzIiwid2VicGFjazovLy8uL3Njc3MvYXBwLnNjc3M/MWI5NiIsIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9jaHVuayBsb2FkZWQiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9nbG9iYWwiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9qc29ucCBjaHVuayBsb2FkaW5nIiwid2VicGFjazovLy93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovLy93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIGNvcmVzaG9wUXVhbnRpdHlTZWxlY3RvcihvcHRpb25zKSB7XG4gICAgICAgIGluaXRRdWFudGl0eUZpZWxkcyhvcHRpb25zKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbml0UXVhbnRpdHlGaWVsZHMob3B0aW9ucykge1xuICAgICAgICBjb25zdCBmaWVsZHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dC5jcy11bml0LWlucHV0Jyk7XG4gICAgICAgIGNvbnN0IHByZWNpc2lvblByZXNldFNlbGVjdG9yID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcignc2VsZWN0LmNzLXVuaXQtc2VsZWN0b3InKTtcblxuICAgICAgICBpZihwcmVjaXNpb25QcmVzZXRTZWxlY3Rvcikge1xuICAgICAgICAgICAgLy8gTGlzdGVuIHRvIHVuaXQgZGVmaW5pdGlvbiBzZWxlY3RvclxuICAgICAgICAgICAgcHJlY2lzaW9uUHJlc2V0U2VsZWN0b3IuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5kYXRhc2V0LmNzVW5pdElkZW50aWZpZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBxdWFudGl0eUlkZW50aWZpZXIgPSB0aGlzLmRhdGFzZXQuY3NVbml0SWRlbnRpZmllcjtcbiAgICAgICAgICAgICAgICBjb25zdCBxdWFudGl0eUlucHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgaW5wdXRbZGF0YS1jcy11bml0LWlkZW50aWZpZXI9XCIke3F1YW50aXR5SWRlbnRpZmllcn1cIl1gKTtcblxuICAgICAgICAgICAgICAgIC8vIFNldCBzdGVwIHRvIDEgb3Igd2hhdGV2ZXIgaW50ZWdlciB2YWx1ZSB5b3Ugd2FudFxuICAgICAgICAgICAgICAgIGNvbnN0IHN0ZXAgPSAxOyAvLyBDaGFuZ2UgdGhpcyBpZiB5b3Ugd2FudCBhIGRpZmZlcmVudCBpbmNyZW1lbnRcblxuICAgICAgICAgICAgICAgIGlmICghcXVhbnRpdHlJbnB1dCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gVXNlIGludGVnZXIgc3RlcCBkaXJlY3RseVxuICAgICAgICAgICAgICAgIHF1YW50aXR5SW5wdXQuc3RlcCA9IHN0ZXA7IC8vIFNldCBzdGVwIGFzIGFuIGludGVnZXJcbiAgICAgICAgICAgICAgICBxdWFudGl0eUlucHV0LmRhdGFzZXQuY3NVbml0UHJlY2lzaW9uID0gMDsgLy8gT3B0aW9uYWwsIHNpbmNlIHByZWNpc2lvbiBpcyBubyBsb25nZXIgcmVsZXZhbnRcblxuICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSBpbnB1dCBzZXR0aW5nc1xuICAgICAgICAgICAgICAgIHVwZGF0ZVRvdWNoU3BpblNldHRpbmdzKHF1YW50aXR5SW5wdXQsIDAsIHN0ZXAudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGZpZWxkcykge1xuICAgICAgICAgICAgLy8gSW5pdGlhbGl6ZSBxdWFudGl0eSBmaWVsZHMgd2l0aCBpbnRlZ2VyIHN0ZXBcbiAgICAgICAgICAgIGZpZWxkcy5mb3JFYWNoKGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAgICAgICAgICAgIC8vIFlvdSBtaWdodCBub3QgbmVlZCBwcmVjaXNpb24gYW55bW9yZVxuICAgICAgICAgICAgICAgIGluaXRpYWxpemVUb3VjaFNwaW4oZmllbGQsIDAsICcxJywgb3B0aW9ucyk7IC8vIENoYW5nZSAnMScgdG8geW91ciBkZXNpcmVkIGludGVnZXIgaW5jcmVtZW50XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluaXRpYWxpemVUb3VjaFNwaW4oaW5wdXQsIHByZWNpc2lvbiwgc3RlcCwgb3B0aW9ucykge1xuICAgICAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ3RvdWNoc3Bpbi1jb250YWluZXInKTtcblxuICAgICAgICBjb25zdCBkZWNyZW1lbnRCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgZGVjcmVtZW50QnV0dG9uLnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgZGVjcmVtZW50QnV0dG9uLnRleHRDb250ZW50ID0gJy0nO1xuICAgICAgICBkZWNyZW1lbnRCdXR0b24uY2xhc3NMaXN0LmFkZCgndG91Y2hzcGluLWRlY3JlbWVudCcpO1xuXG4gICAgICAgIGNvbnN0IGluY3JlbWVudEJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICBpbmNyZW1lbnRCdXR0b24udHlwZSA9ICdidXR0b24nO1xuICAgICAgICBpbmNyZW1lbnRCdXR0b24udGV4dENvbnRlbnQgPSAnKyc7XG4gICAgICAgIGluY3JlbWVudEJ1dHRvbi5jbGFzc0xpc3QuYWRkKCd0b3VjaHNwaW4taW5jcmVtZW50Jyk7XG5cbiAgICAgICAgaW5wdXQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoY29udGFpbmVyLCBpbnB1dCk7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChkZWNyZW1lbnRCdXR0b24pO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoaW5wdXQpO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoaW5jcmVtZW50QnV0dG9uKTtcblxuICAgICAgICAvLyBTZXQgdXAgZXZlbnQgbGlzdGVuZXJzIGZvciBpbmNyZW1lbnQgYW5kIGRlY3JlbWVudFxuICAgICAgICBkZWNyZW1lbnRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBsZXQgdmFsdWUgPSBwYXJzZUludChpbnB1dC52YWx1ZSkgfHwgMDsgLy8gRW5zdXJlIHZhbHVlIGlzIGFuIGludGVnZXJcbiAgICAgICAgICAgIHZhbHVlIC09IHBhcnNlSW50KHN0ZXApOyAvLyBEZWNyZW1lbnQgYnkgaW50ZWdlciBzdGVwXG4gICAgICAgICAgICBpZiAodmFsdWUgPj0gMCkge1xuICAgICAgICAgICAgICAgIGlucHV0LnZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGluY3JlbWVudEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IHBhcnNlSW50KGlucHV0LnZhbHVlKSB8fCAwOyAvLyBFbnN1cmUgdmFsdWUgaXMgYW4gaW50ZWdlclxuICAgICAgICAgICAgdmFsdWUgKz0gcGFyc2VJbnQoc3RlcCk7IC8vIEluY3JlbWVudCBieSBpbnRlZ2VyIHN0ZXBcbiAgICAgICAgICAgIGlucHV0LnZhbHVlID0gdmFsdWU7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEFkZCBpbnB1dCB2YWxpZGF0aW9uIGJhc2VkIG9uIGludGVnZXIgdmFsdWVcbiAgICAgICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBsZXQgdmFsdWUgPSBwYXJzZUludChpbnB1dC52YWx1ZSk7XG4gICAgICAgICAgICBpZiAoaXNOYU4odmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgaW5wdXQudmFsdWUgPSAwOyAvLyBEZWZhdWx0IHRvIHplcm8gaWYgaW52YWxpZCBpbnB1dFxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpbnB1dC52YWx1ZSA9IHZhbHVlOyAvLyBLZWVwIGl0IGFzIGFuIGludGVnZXJcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlVG91Y2hTcGluU2V0dGluZ3MoaW5wdXQsIHByZWNpc2lvbiwgc3RlcCkge1xuICAgICAgICBpbnB1dC5taW4gPSAwO1xuICAgICAgICBpbnB1dC5tYXggPSAxMDAwMDAwMDAwO1xuICAgICAgICBpbnB1dC5zdGVwID0gc3RlcDtcbiAgICAgICAgaW5wdXQuZGF0YXNldC5jc1VuaXRQcmVjaXNpb24gPSBwcmVjaXNpb247XG4gICAgfVxuXG4gICAgLy8gRXhwb3J0IHRoZSBmdW5jdGlvbiB0byB0aGUgZ2xvYmFsIHNjb3BlXG4gICAgd2luZG93LmNvcmVzaG9wUXVhbnRpdHlTZWxlY3RvciA9IGNvcmVzaG9wUXVhbnRpdHlTZWxlY3Rvcjtcbn0pKCk7XG4iLCIoZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IGNvcmVzaG9wVmFyaWFudFNlbGVjdG9yID0gZnVuY3Rpb24gKGF0dHJpYnV0ZUNvbnRhaW5lcikge1xuICAgICAgICBsZXQgX2F0dHJpYnV0ZUNvbnRhaW5lciA9IG51bGw7XG4gICAgICAgIGxldCBfY29uZmlnID0ge307XG4gICAgICAgIGxldCBfYXR0cmlidXRlR3JvdXBzID0gW107XG5cbiAgICAgICAgY29uc3QgX2NsZWFyR3JvdXBFbGVtZW50cyA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICBlbGVtZW50LmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGVsZW1lbnQuY2hlY2tlZCA9IGZhbHNlO1xuXG4gICAgICAgICAgICAvLyBSZW1vdmUgb3B0aW9ucyBvbiBzZWxlY3RcbiAgICAgICAgICAgIGlmIChlbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ3NlbGVjdCcpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBvcHRpb25zID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCdvcHRpb246bm90KFt2YWx1ZT1cIlwiXSknKTtcbiAgICAgICAgICAgICAgICBvcHRpb25zLmZvckVhY2goKG9wdGlvbikgPT4gZWxlbWVudC5yZW1vdmVDaGlsZChvcHRpb24pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfY2xlYXJHcm91cCA9IGZ1bmN0aW9uIChncm91cCkge1xuICAgICAgICAgICAgZGVsZXRlIGdyb3VwLnNlbGVjdGVkO1xuICAgICAgICAgICAgZ3JvdXAuZWxlbWVudHMuZm9yRWFjaChfY2xlYXJHcm91cEVsZW1lbnRzKTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfY2xlYXJHcm91cHMgPSBmdW5jdGlvbiAoZ3JvdXApIHtcbiAgICAgICAgICAgIHdoaWxlIChncm91cCkge1xuICAgICAgICAgICAgICAgIF9jbGVhckdyb3VwKGdyb3VwKTtcbiAgICAgICAgICAgICAgICBncm91cCA9IGdyb3VwLm5leHRHcm91cDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfZmlsdGVyQXR0cmlidXRlcyA9IGZ1bmN0aW9uIChhdHRyaWJ1dGVzLCBncm91cCkge1xuICAgICAgICAgICAgY29uc3QgZmlsdGVyQXR0cmlidXRlcyA9IFtdO1xuICAgICAgICAgICAgbGV0IGN1cnJlbnRHcm91cCA9IGdyb3VwLnByZXZHcm91cDtcblxuICAgICAgICAgICAgd2hpbGUgKGN1cnJlbnRHcm91cCkge1xuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50R3JvdXAuc2VsZWN0ZWQgJiYgY3VycmVudEdyb3VwLm5leHRHcm91cCkge1xuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJBdHRyaWJ1dGVzLnB1c2goeyBncm91cDogY3VycmVudEdyb3VwLmdyb3VwLmlkLCBzZWxlY3RlZDogY3VycmVudEdyb3VwLnNlbGVjdGVkIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjdXJyZW50R3JvdXAgPSBjdXJyZW50R3JvdXAucHJldkdyb3VwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gYXR0cmlidXRlcy5maWx0ZXIoKGF0dHJpYnV0ZSkgPT5cbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGUucHJvZHVjdHMuc29tZSgocHJvZHVjdCkgPT5cbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyQXR0cmlidXRlcy5ldmVyeSgoZmlsdGVyKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgX2NvbmZpZy5pbmRleFtwcm9kdWN0LmlkXS5hdHRyaWJ1dGVzPy5bZmlsdGVyLmdyb3VwXSA9PT0gZmlsdGVyLnNlbGVjdGVkXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9hZGRPcHRpb25Ub1NlbGVjdCA9IGZ1bmN0aW9uIChlbGVtZW50LCBhdHRyaWJ1dGUsIGdyb3VwKSB7XG4gICAgICAgICAgICBjb25zdCBvcHRpb24gPSBuZXcgT3B0aW9uKGF0dHJpYnV0ZS5hdHRyaWJ1dGUubmFtZSwgYXR0cmlidXRlLmF0dHJpYnV0ZS5pZCk7XG4gICAgICAgICAgICBvcHRpb24uaWQgPSAnYXR0cmlidXRlLScgKyBhdHRyaWJ1dGUuYXR0cmlidXRlLmlkO1xuICAgICAgICAgICAgaWYgKGdyb3VwLnNlbGVjdGVkID09PSBhdHRyaWJ1dGUuYXR0cmlidXRlLmlkKSB7XG4gICAgICAgICAgICAgICAgb3B0aW9uLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsZW1lbnQuYWRkKG9wdGlvbik7XG4gICAgICAgICAgICBlbGVtZW50LmRpc2FibGVkID0gZmFsc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgX2VuYWJsZUVsZW1lbnRGb3JBdHRyaWJ1dGUgPSBmdW5jdGlvbiAoZWxlbWVudCwgYXR0cmlidXRlLCBncm91cCkge1xuICAgICAgICAgICAgaWYgKHBhcnNlSW50KGVsZW1lbnQuZGF0YXNldC5ncm91cCkgPT09IGdyb3VwLmdyb3VwLmlkICYmIHBhcnNlSW50KGVsZW1lbnQudmFsdWUpID09PSBhdHRyaWJ1dGUuYXR0cmlidXRlLmlkKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5kaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmIChncm91cC5zZWxlY3RlZCA9PT0gYXR0cmlidXRlLmF0dHJpYnV0ZS5pZCkge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmNoZWNrZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfY29uZmlndXJlR3JvdXBFbGVtZW50cyA9IGZ1bmN0aW9uIChncm91cCwgYXR0cmlidXRlcykge1xuICAgICAgICAgICAgZ3JvdXAuZWxlbWVudHMuZm9yRWFjaCgoZWxlbWVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ3NlbGVjdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlcy5mb3JFYWNoKChhdHRyaWJ1dGUpID0+IF9hZGRPcHRpb25Ub1NlbGVjdChlbGVtZW50LCBhdHRyaWJ1dGUsIGdyb3VwKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlcy5mb3JFYWNoKChhdHRyaWJ1dGUpID0+IF9lbmFibGVFbGVtZW50Rm9yQXR0cmlidXRlKGVsZW1lbnQsIGF0dHJpYnV0ZSwgZ3JvdXApKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfY29uZmlndXJlR3JvdXAgPSBmdW5jdGlvbiAoZ3JvdXApIHtcbiAgICAgICAgICAgIGNvbnN0IGZpbHRlcmVkQXR0cmlidXRlcyA9IF9maWx0ZXJBdHRyaWJ1dGVzKGdyb3VwLmF0dHJpYnV0ZXMuc2xpY2UoKSwgZ3JvdXApIHx8IGdyb3VwLmF0dHJpYnV0ZXM7XG4gICAgICAgICAgICBfY29uZmlndXJlR3JvdXBFbGVtZW50cyhncm91cCwgZmlsdGVyZWRBdHRyaWJ1dGVzKTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfc2V0dXBBdHRyaWJ1dGVHcm91cFNldHRpbmdzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX2F0dHJpYnV0ZUdyb3Vwcy5mb3JFYWNoKChncm91cCwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgICBncm91cC5wcmV2R3JvdXAgPSBfYXR0cmlidXRlR3JvdXBzW2luZGV4IC0gMV0gfHwgbnVsbDtcbiAgICAgICAgICAgICAgICBncm91cC5uZXh0R3JvdXAgPSBfYXR0cmlidXRlR3JvdXBzW2luZGV4ICsgMV0gfHwgbnVsbDtcblxuICAgICAgICAgICAgICAgIGlmICghaW5kZXggfHwgZ3JvdXAuc2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgX2NvbmZpZ3VyZUdyb3VwKGdyb3VwKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBfY2xlYXJHcm91cChncm91cCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgX3NldHVwQ2hhbmdlRXZlbnRzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX2F0dHJpYnV0ZUdyb3Vwcy5mb3JFYWNoKChncm91cCkgPT4ge1xuICAgICAgICAgICAgICAgIGdyb3VwLmVsZW1lbnRzLmZvckVhY2goKGVsZW1lbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5vbmNoYW5nZSA9ICgpID0+IF9jb25maWd1cmVFbGVtZW50KGdyb3VwLCBlbGVtZW50KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9yZWRpcmVjdFRvVmFyaWFudCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkQXR0cmlidXRlcyA9IE9iamVjdC5mcm9tRW50cmllcyhcbiAgICAgICAgICAgICAgICBfYXR0cmlidXRlR3JvdXBzLmZpbHRlcigoZykgPT4gZy5zZWxlY3RlZCkubWFwKChnKSA9PiBbZy5ncm91cC5pZCwgZy5zZWxlY3RlZF0pXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBjb25zdCBtYXRjaGluZ1Byb2R1Y3QgPSBPYmplY3QudmFsdWVzKF9jb25maWcuaW5kZXgpLmZpbmQoKHApID0+XG4gICAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkocC5hdHRyaWJ1dGVzKSA9PT0gSlNPTi5zdHJpbmdpZnkoc2VsZWN0ZWRBdHRyaWJ1dGVzKVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgaWYgKG1hdGNoaW5nUHJvZHVjdD8udXJsKSB7XG4gICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBtYXRjaGluZ1Byb2R1Y3QudXJsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9jcmVhdGVFdmVudCA9IGZ1bmN0aW9uIChuYW1lLCBkYXRhID0ge30pIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgQ3VzdG9tRXZlbnQoJ3ZhcmlhbnRfc2VsZWN0b3IuJyArIG5hbWUsIHtcbiAgICAgICAgICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNhbmNlbGFibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGRldGFpbDogZGF0YSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9jb25maWd1cmVFbGVtZW50ID0gZnVuY3Rpb24gKGdyb3VwLCBlbGVtZW50KSB7XG4gICAgICAgICAgICB3aW5kb3cudmFyaWFudFJlYWR5ID0gZmFsc2U7XG4gICAgICAgICAgICBfYXR0cmlidXRlQ29udGFpbmVyLmRpc3BhdGNoRXZlbnQoX2NyZWF0ZUV2ZW50KCdjaGFuZ2UnLCB7IGVsZW1lbnQgfSkpO1xuXG4gICAgICAgICAgICBpZiAoZWxlbWVudC52YWx1ZSkge1xuICAgICAgICAgICAgICAgIGdyb3VwLnNlbGVjdGVkID0gcGFyc2VJbnQoZWxlbWVudC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgX2F0dHJpYnV0ZUNvbnRhaW5lci5kaXNwYXRjaEV2ZW50KF9jcmVhdGVFdmVudCgnc2VsZWN0JywgeyBlbGVtZW50IH0pKTtcblxuICAgICAgICAgICAgICAgIGlmIChncm91cC5uZXh0R3JvdXApIHtcbiAgICAgICAgICAgICAgICAgICAgX2NsZWFyR3JvdXBzKGdyb3VwLm5leHRHcm91cCk7XG4gICAgICAgICAgICAgICAgICAgIF9jb25maWd1cmVHcm91cChncm91cC5uZXh0R3JvdXApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIF9hdHRyaWJ1dGVDb250YWluZXIuZGlzcGF0Y2hFdmVudChfY3JlYXRlRXZlbnQoJ3JlZGlyZWN0JywgeyBlbGVtZW50IH0pKTtcbiAgICAgICAgICAgICAgICAgICAgX3JlZGlyZWN0VG9WYXJpYW50KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgZ3JvdXAuc2VsZWN0ZWQ7XG4gICAgICAgICAgICAgICAgaWYgKGdyb3VwLm5leHRHcm91cCkge1xuICAgICAgICAgICAgICAgICAgICBfY2xlYXJHcm91cHMoZ3JvdXAubmV4dEdyb3VwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHdpbmRvdy52YXJpYW50UmVhZHkgPSB0cnVlO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKCFhdHRyaWJ1dGVDb250YWluZXIpIHJldHVybjtcblxuICAgICAgICAgICAgX2F0dHJpYnV0ZUNvbnRhaW5lciA9IGF0dHJpYnV0ZUNvbnRhaW5lcjtcbiAgICAgICAgICAgIF9jb25maWcgPSBKU09OLnBhcnNlKF9hdHRyaWJ1dGVDb250YWluZXIuZGF0YXNldC5jb25maWcpO1xuICAgICAgICAgICAgX2NvbmZpZy5hdHRyaWJ1dGVzLmZvckVhY2goKGdyb3VwKSA9PiB7XG4gICAgICAgICAgICAgICAgZ3JvdXAuZWxlbWVudHMgPSBfYXR0cmlidXRlQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoYFtkYXRhLWdyb3VwPVwiJHtncm91cC5ncm91cC5pZH1cIl1gKTtcbiAgICAgICAgICAgICAgICBfYXR0cmlidXRlR3JvdXBzLnB1c2goZ3JvdXApO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIF9zZXR1cEF0dHJpYnV0ZUdyb3VwU2V0dGluZ3MoKTtcbiAgICAgICAgICAgIF9zZXR1cENoYW5nZUV2ZW50cygpO1xuICAgICAgICB9O1xuXG4gICAgICAgIF9pbml0KCk7XG4gICAgfTtcblxuICAgIHdpbmRvdy5jb3Jlc2hvcFZhcmlhbnRTZWxlY3RvciA9IGNvcmVzaG9wVmFyaWFudFNlbGVjdG9yO1xufSkoKTtcbiIsIihmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgY29uc3QgbWV0aG9kcyA9IHtcbiAgICAgICAgaW5pdDogZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGNvbnN0IHNldHRpbmdzID0ge1xuICAgICAgICAgICAgICAgIHByb3RvdHlwZVByZWZpeDogZmFsc2UsXG4gICAgICAgICAgICAgICAgY29udGFpbmVyU2VsZWN0b3I6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHNlbGVjdG9yQXR0cjogZmFsc2UsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucyAvLyBVc2luZyBvYmplY3Qgc3ByZWFkIGhlcmVcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0aGlzLnNlbGVjdG9yKTtcbiAgICAgICAgICAgIGVsZW1lbnRzLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93KGVsZW1lbnQsIHNldHRpbmdzLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hvdyhlbGVtZW50LCBzZXR0aW5ncywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBzaG93OiBmdW5jdGlvbiAoZWxlbWVudCwgc2V0dGluZ3MsIHJlcGxhY2UpIHtcbiAgICAgICAgICAgIGxldCBzZWxlY3RlZFZhbHVlID0gZWxlbWVudC52YWx1ZTtcbiAgICAgICAgICAgIGxldCBwcm90b3R5cGVQcmVmaXggPSBlbGVtZW50LmlkO1xuXG4gICAgICAgICAgICBpZiAoc2V0dGluZ3Muc2VsZWN0b3JBdHRyKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRPcHRpb24gPSBBcnJheS5mcm9tKGVsZW1lbnQub3B0aW9ucykuZmluZChvcHRpb24gPT4gb3B0aW9uLnZhbHVlID09PSBzZWxlY3RlZFZhbHVlKTtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWRPcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRWYWx1ZSA9IHNlbGVjdGVkT3B0aW9uLmdldEF0dHJpYnV0ZShzZXR0aW5ncy5zZWxlY3RvckF0dHIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHNldHRpbmdzLnByb3RvdHlwZVByZWZpeCkge1xuICAgICAgICAgICAgICAgIHByb3RvdHlwZVByZWZpeCA9IHNldHRpbmdzLnByb3RvdHlwZVByZWZpeDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgcHJvdG90eXBlRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGAke3Byb3RvdHlwZVByZWZpeH1fJHtzZWxlY3RlZFZhbHVlfWApO1xuICAgICAgICAgICAgbGV0IGNvbnRhaW5lciA9IHRoaXMuZ2V0Q29udGFpbmVyKHNldHRpbmdzLCBwcm90b3R5cGVFbGVtZW50KTtcblxuICAgICAgICAgICAgaWYgKCFjb250YWluZXIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghcHJvdG90eXBlRWxlbWVudCkge1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChyZXBsYWNlIHx8ICFjb250YWluZXIuaW5uZXJIVE1MLnRyaW0oKSkge1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSBwcm90b3R5cGVFbGVtZW50LmRhdGFzZXQucHJvdG90eXBlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGdldENvbnRhaW5lcjogZnVuY3Rpb24gKHNldHRpbmdzLCBwcm90b3R5cGVFbGVtZW50KSB7XG4gICAgICAgICAgICBpZiAoc2V0dGluZ3MuY29udGFpbmVyU2VsZWN0b3IpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZXR0aW5ncy5jb250YWluZXJTZWxlY3Rvcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGFDb250YWluZXJJZCA9IHByb3RvdHlwZUVsZW1lbnQgPyBwcm90b3R5cGVFbGVtZW50LmRhdGFzZXQuY29udGFpbmVyIDogbnVsbDtcbiAgICAgICAgICAgICAgICByZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZGF0YUNvbnRhaW5lcklkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBFeHRlbmRpbmcgdGhlIHByb3RvdHlwZSBvZiBOb2RlTGlzdFxuICAgIE5vZGVMaXN0LnByb3RvdHlwZS5oYW5kbGVQcm90b3R5cGVzID0gZnVuY3Rpb24gKG1ldGhvZCkge1xuICAgICAgICBpZiAobWV0aG9kc1ttZXRob2RdKSB7XG4gICAgICAgICAgICByZXR1cm4gbWV0aG9kc1ttZXRob2RdLmFwcGx5KHRoaXMsIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBtZXRob2QgPT09ICdvYmplY3QnIHx8ICFtZXRob2QpIHtcbiAgICAgICAgICAgIHJldHVybiBtZXRob2RzLmluaXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTWV0aG9kICcgKyBtZXRob2QgKyAnIGRvZXMgbm90IGV4aXN0IG9uIGhhbmRsZVByb3RvdHlwZXMnKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBUbyBhbGxvdyBjYWxsaW5nIGhhbmRsZVByb3RvdHlwZXMgZGlyZWN0bHkgb24gYW55IGVsZW1lbnRcbiAgICBIVE1MRWxlbWVudC5wcm90b3R5cGUuaGFuZGxlUHJvdG90eXBlcyA9IGZ1bmN0aW9uIChtZXRob2QpIHtcbiAgICAgICAgcmV0dXJuIG1ldGhvZHMuaGFuZGxlUHJvdG90eXBlcy5jYWxsKFt0aGlzXSwgbWV0aG9kKTtcbiAgICB9O1xuXG59KCkpO1xuIiwiZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uICgpIHtcbiAgICBjb25zdCBtYXBCbG9jayA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYXAtYmxvY2snKTtcblxuICAgIGlmIChtYXBCbG9jaykge1xuICAgICAgICBtYXBCbG9jay5zdHlsZS5oZWlnaHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFwLXdyYXBwZXInKS5jbGllbnRIZWlnaHQgKyAncHgnO1xuXG4gICAgICAgIGZ1bmN0aW9uIGluaXRpYWxpemUoKSB7XG4gICAgICAgICAgICBjb25zdCBtYXBPcHRpb25zID0ge1xuICAgICAgICAgICAgICAgIHpvb206IDE4LFxuICAgICAgICAgICAgICAgIGNlbnRlcjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZyg0OC4xNTkyNTEzLCAxNC4wMjMwMjUxMDAwMDAwNCksXG4gICAgICAgICAgICAgICAgZGlzYWJsZURlZmF1bHRVSTogdHJ1ZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIG5ldyBnb29nbGUubWFwcy5NYXAobWFwQmxvY2ssIG1hcE9wdGlvbnMpOyAvLyBSZW1vdmVkIHRoZSB1bnVzZWQgJ21hcCcgdmFyaWFibGVcbiAgICAgICAgfVxuXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgaW5pdGlhbGl6ZSk7XG4gICAgfVxufSk7XG4iLCJkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24gKCkge1xuICAgIHNob3AuaW5pdCgpO1xufSk7XG5cbmZ1bmN0aW9uIGhhbmRsZVByb3RvdHlwZXMob3B0aW9ucykge1xuICAgIGNvbnN0IHNldHRpbmdzID0ge1xuICAgICAgICBwcm90b3R5cGVQcmVmaXg6IG9wdGlvbnMucHJvdG90eXBlUHJlZml4IHx8IGZhbHNlLFxuICAgICAgICBjb250YWluZXJTZWxlY3Rvcjogb3B0aW9ucy5jb250YWluZXJTZWxlY3RvciB8fCBmYWxzZSxcbiAgICAgICAgc2VsZWN0b3JBdHRyOiBvcHRpb25zLnNlbGVjdG9yQXR0ciB8fCBmYWxzZVxuICAgIH07XG5cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGBbZGF0YS0ke3NldHRpbmdzLnByb3RvdHlwZVByZWZpeH1dYCkuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICBzaG93RWxlbWVudChlbGVtZW50LCBmYWxzZSk7XG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2hvd0VsZW1lbnQoZWxlbWVudCwgdHJ1ZSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gc2hvd0VsZW1lbnQoZWxlbWVudCwgcmVwbGFjZSkge1xuICAgICAgICBjb25zdCBzZWxlY3RlZFZhbHVlID0gZ2V0U2VsZWN0ZWRWYWx1ZShlbGVtZW50KTtcbiAgICAgICAgY29uc3QgcHJvdG90eXBlUHJlZml4ID0gc2V0dGluZ3MucHJvdG90eXBlUHJlZml4IHx8IGVsZW1lbnQuaWQ7XG4gICAgICAgIGNvbnN0IHByb3RvdHlwZUVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgJHtwcm90b3R5cGVQcmVmaXh9XyR7c2VsZWN0ZWRWYWx1ZX1gKTtcbiAgICAgICAgY29uc3QgY29udGFpbmVyID0gZ2V0Q29udGFpbmVyKHByb3RvdHlwZUVsZW1lbnQpO1xuXG4gICAgICAgIGlmIChjb250YWluZXIgJiYgKHJlcGxhY2UgfHwgIWNvbnRhaW5lci5pbm5lckhUTUwudHJpbSgpKSkge1xuICAgICAgICAgICAgY29udGFpbmVyLmlubmVySFRNTCA9IHByb3RvdHlwZUVsZW1lbnQgPyBwcm90b3R5cGVFbGVtZW50LmRhdGFzZXQucHJvdG90eXBlIDogJyc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRTZWxlY3RlZFZhbHVlKGVsZW1lbnQpIHtcbiAgICAgICAgaWYgKHNldHRpbmdzLnNlbGVjdG9yQXR0cikge1xuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQucXVlcnlTZWxlY3RvcihgW3ZhbHVlPVwiJHtlbGVtZW50LnZhbHVlfVwiXWApLmdldEF0dHJpYnV0ZShzZXR0aW5ncy5zZWxlY3RvckF0dHIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbGVtZW50LnZhbHVlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldENvbnRhaW5lcihwcm90b3R5cGVFbGVtZW50KSB7XG4gICAgICAgIGlmIChzZXR0aW5ncy5jb250YWluZXJTZWxlY3Rvcikge1xuICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2V0dGluZ3MuY29udGFpbmVyU2VsZWN0b3IpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm90b3R5cGVFbGVtZW50ID8gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihwcm90b3R5cGVFbGVtZW50LmRhdGFzZXQuY29udGFpbmVyKSA6IG51bGw7XG4gICAgfVxufVxuXG4oZnVuY3Rpb24gKHNob3ApIHtcbiAgICBzaG9wLmluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNob3AuaW5pdENoYW5nZUFkZHJlc3MoKTtcbiAgICAgICAgc2hvcC5pbml0Q2FydFNoaXBtZW50Q2FsY3VsYXRvcigpO1xuICAgICAgICBzaG9wLmluaXRRdWFudGl0eVZhbGlkYXRvcigpO1xuICAgICAgICBzaG9wLmluaXRDYXRlZ29yeVNlbGVjdCgpO1xuXG4gICAgICAgIGhhbmRsZVByb3RvdHlwZXMoe1xuICAgICAgICAgICAgJ3Byb3RvdHlwZVByZWZpeCc6ICdwYXltZW50UHJvdmlkZXInLFxuICAgICAgICAgICAgJ2NvbnRhaW5lclNlbGVjdG9yJzogJy5wYXltZW50U2V0dGluZ3MnLFxuICAgICAgICAgICAgJ3NlbGVjdG9yQXR0cic6ICdkYXRhLWZhY3RvcnknXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHNldHVwQ29weVRvQ2xpcGJvYXJkKCk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIHNldHVwQ29weVRvQ2xpcGJvYXJkKCkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY29weS10by1jbGlwYm9hcmQnKS5mb3JFYWNoKGZ1bmN0aW9uIChidXR0b24pIHtcbiAgICAgICAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGNvcHlUZXh0VG9DbGlwYm9hcmQodGhpcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29weVRleHRUb0NsaXBib2FyZChidXR0b24pIHtcbiAgICAgICAgY29uc3QgdGFyZ2V0SWQgPSBidXR0b24uZGF0YXNldC50YXJnZXQ7XG4gICAgICAgIGNvbnN0IGNvcHlUZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGFyZ2V0SWQpO1xuXG4gICAgICAgIGlmIChjb3B5VGV4dCkge1xuICAgICAgICAgICAgY29weVRleHQuc2VsZWN0KCk7XG4gICAgICAgICAgICBjb3B5VGV4dC5zZXRTZWxlY3Rpb25SYW5nZSgwLCA5OTk5OSk7IC8vIEZvciBtb2JpbGUgZGV2aWNlc1xuXG4gICAgICAgICAgICBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChjb3B5VGV4dC52YWx1ZSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYnV0dG9uLmRhdGFzZXQuY29waWVkVGV4dCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNob3AuaW5pdENhdGVnb3J5U2VsZWN0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnNpdGUtcmVsb2FkXCIpLmZvckVhY2goZnVuY3Rpb24gKHNlbGVjdCkge1xuICAgICAgICAgICAgc2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSB1cGRhdGVRdWVyeVN0cmluZ1BhcmFtZXRlcih3aW5kb3cubG9jYXRpb24uaHJlZiwgdGhpcy5uYW1lLCB0aGlzLnZhbHVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gdXBkYXRlUXVlcnlTdHJpbmdQYXJhbWV0ZXIodXJpLCBrZXksIHZhbHVlKSB7XG4gICAgICAgIGNvbnN0IHJlID0gbmV3IFJlZ0V4cChcIihbPyZdKVwiICsga2V5ICsgXCI9Lio/KCZ8JClcIiwgXCJpXCIpO1xuICAgICAgICBjb25zdCBzZXBhcmF0b3IgPSB1cmkuaW5kZXhPZignPycpICE9PSAtMSA/IFwiJlwiIDogXCI/XCI7XG4gICAgICAgIHJldHVybiB1cmkubWF0Y2gocmUpID8gdXJpLnJlcGxhY2UocmUsICckMScgKyBrZXkgKyBcIj1cIiArIHZhbHVlICsgJyQyJykgOiB1cmkgKyBzZXBhcmF0b3IgKyBrZXkgKyBcIj1cIiArIHZhbHVlO1xuICAgIH1cblxuICAgIHNob3AuaW5pdFF1YW50aXR5VmFsaWRhdG9yID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBjb3Jlc2hvcFF1YW50aXR5U2VsZWN0b3Ioe1xuICAgICAgICAgICAgYnV0dG9uZG93bl9jbGFzczogJ2J0biBidG4tc2Vjb25kYXJ5JyxcbiAgICAgICAgICAgIGJ1dHRvbnVwX2NsYXNzOiAnYnRuIGJ0bi1zZWNvbmRhcnknLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgc2hvcC5pbml0Q2FydFNoaXBtZW50Q2FsY3VsYXRvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICBjb25zdCBmb3JtID0gZXYudGFyZ2V0LmNsb3Nlc3QoJ2Zvcm1bbmFtZT1cImNvcmVzaG9wX3NoaXBwaW5nX2NhbGN1bGF0b3JcIl0nKTtcbiAgICAgICAgICAgIGlmIChmb3JtKSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlU2hpcG1lbnRDYWxjdWxhdGlvbihmb3JtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGhhbmRsZVNoaXBtZW50Q2FsY3VsYXRpb24oZm9ybSkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBmb3JtLmNsYXNzTGlzdC5hZGQoJ2xvYWRpbmcnKTtcbiAgICAgICAgZm9ybS5xdWVyeVNlbGVjdG9yKCdidXR0b25bdHlwZT1cInN1Ym1pdFwiXScpLnNldEF0dHJpYnV0ZSgnZGlzYWJsZWQnLCAnZGlzYWJsZWQnKTtcbiAgICAgICAgZm9ybS5jbG9zZXN0KCcuY2FydC1zaGlwbWVudC1jYWxjdWxhdGlvbi1ib3gnKS5xdWVyeVNlbGVjdG9yKCcuY2FydC1zaGlwbWVudC1hdmFpbGFibGUtY2FycmllcnMnKS5zdHlsZS5vcGFjaXR5ID0gMC4yO1xuXG4gICAgICAgIGZldGNoKGZvcm0uYWN0aW9uLCB7XG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIGJvZHk6IG5ldyBVUkxTZWFyY2hQYXJhbXMobmV3IEZvcm1EYXRhKGZvcm0pKVxuICAgICAgICB9KVxuICAgICAgICAudGhlbihyZXNwb25zZSA9PiByZXNwb25zZS50ZXh0KCkpXG4gICAgICAgIC50aGVuKHJlcyA9PiB1cGRhdGVTaGlwbWVudENhbGN1bGF0aW9uKGZvcm0sIHJlcykpXG4gICAgICAgIC5jYXRjaChlcnJvciA9PiBoYW5kbGVTaGlwbWVudEVycm9yKGZvcm0sIGVycm9yKSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlU2hpcG1lbnRDYWxjdWxhdGlvbihmb3JtLCByZXNwb25zZVRleHQpIHtcbiAgICAgICAgZm9ybS5jbGFzc0xpc3QucmVtb3ZlKCdsb2FkaW5nJyk7XG4gICAgICAgIGZvcm0uY2xvc2VzdCgnLmNhcnQtc2hpcG1lbnQtY2FsY3VsYXRpb24tYm94Jykub3V0ZXJIVE1MID0gcmVzcG9uc2VUZXh0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhhbmRsZVNoaXBtZW50RXJyb3IoZm9ybSwgZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3I6JywgZXJyb3IpO1xuICAgICAgICBmb3JtLmNsYXNzTGlzdC5yZW1vdmUoJ2xvYWRpbmcnKTtcbiAgICAgICAgZm9ybS5xdWVyeVNlbGVjdG9yKCdidXR0b25bdHlwZT1cInN1Ym1pdFwiXScpLnJlbW92ZUF0dHJpYnV0ZSgnZGlzYWJsZWQnKTtcbiAgICB9XG5cbiAgICBzaG9wLmluaXRDaGFuZ2VBZGRyZXNzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zdCBhZGRyZXNzU3RlcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jaGVja291dC1zdGVwLnN0ZXAtYWRkcmVzcycpO1xuICAgICAgICBpZiAoIWFkZHJlc3NTdGVwKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgaW52b2ljZUFkZHJlc3MgPSBhZGRyZXNzU3RlcC5xdWVyeVNlbGVjdG9yKCdzZWxlY3RbbmFtZT1cImNvcmVzaG9wW2ludm9pY2VBZGRyZXNzXVwiXScpO1xuICAgICAgICBjb25zdCBzaGlwcGluZ0FkZHJlc3MgPSBhZGRyZXNzU3RlcC5xdWVyeVNlbGVjdG9yKCdzZWxlY3RbbmFtZT1cImNvcmVzaG9wW3NoaXBwaW5nQWRkcmVzc11cIl0nKTtcbiAgICAgICAgY29uc3QgdXNlSWFzUyA9IGFkZHJlc3NTdGVwLnF1ZXJ5U2VsZWN0b3IoJ1tuYW1lPVwiY29yZXNob3BbdXNlSW52b2ljZUFzU2hpcHBpbmddXCJdJyk7XG5cbiAgICAgICAgc2V0dXBBZGRyZXNzQ2hhbmdlRXZlbnRzKGludm9pY2VBZGRyZXNzLCBzaGlwcGluZ0FkZHJlc3MsIHVzZUlhc1MpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBzZXR1cEFkZHJlc3NDaGFuZ2VFdmVudHMoaW52b2ljZUFkZHJlc3MsIHNoaXBwaW5nQWRkcmVzcywgdXNlSWFzUykge1xuICAgICAgICBpbnZvaWNlQWRkcmVzcy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB1cGRhdGVBZGRyZXNzKGludm9pY2VBZGRyZXNzLCB1c2VJYXNTKSk7XG4gICAgICAgIHNoaXBwaW5nQWRkcmVzcy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB1cGRhdGVTaGlwcGluZ0FkZHJlc3Moc2hpcHBpbmdBZGRyZXNzKSk7XG4gICAgICAgIGlmICh1c2VJYXNTKSB1c2VJYXNTLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHRvZ2dsZVNoaXBwaW5nQWRkcmVzcyh1c2VJYXNTLCBpbnZvaWNlQWRkcmVzcywgc2hpcHBpbmdBZGRyZXNzKSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlQWRkcmVzcyhpbnZvaWNlQWRkcmVzcywgdXNlSWFzUykge1xuICAgICAgICBjb25zdCBzZWxlY3RlZCA9IGludm9pY2VBZGRyZXNzLm9wdGlvbnNbaW52b2ljZUFkZHJlc3Muc2VsZWN0ZWRJbmRleF07XG4gICAgICAgIGNvbnN0IGFkZHJlc3MgPSBKU09OLnBhcnNlKHNlbGVjdGVkLmRhdGFzZXQuYWRkcmVzcykuaHRtbDtcbiAgICAgICAgY29uc3QgaW52b2ljZVBhbmVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnBhbmVsLWludm9pY2UtYWRkcmVzcycpO1xuICAgICAgICBpbnZvaWNlUGFuZWwuaW5uZXJIVE1MID0gYWRkcmVzcyB8fCAnJztcblxuICAgICAgICB0b2dnbGVVc2VBc1NoaXBwaW5nKHVzZUlhc1MsIHNlbGVjdGVkLmRhdGFzZXQuYWRkcmVzc1R5cGUgPT09ICdpbnZvaWNlJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdG9nZ2xlVXNlQXNTaGlwcGluZyh1c2VJYXNTLCBpc0ludm9pY2VUeXBlKSB7XG4gICAgICAgIGlmICh1c2VJYXNTKSB7XG4gICAgICAgICAgICB1c2VJYXNTLmRpc2FibGVkID0gaXNJbnZvaWNlVHlwZTtcbiAgICAgICAgICAgIGlmIChpc0ludm9pY2VUeXBlKSB7XG4gICAgICAgICAgICAgICAgdXNlSWFzUy5jaGVja2VkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdXNlSWFzUy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnY2hhbmdlJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlU2hpcHBpbmdBZGRyZXNzKHNoaXBwaW5nQWRkcmVzcykge1xuICAgICAgICBjb25zdCBzZWxlY3RlZCA9IHNoaXBwaW5nQWRkcmVzcy5vcHRpb25zW3NoaXBwaW5nQWRkcmVzcy5zZWxlY3RlZEluZGV4XTtcbiAgICAgICAgY29uc3QgYWRkcmVzcyA9IEpTT04ucGFyc2Uoc2VsZWN0ZWQuZGF0YXNldC5hZGRyZXNzKS5odG1sO1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucGFuZWwtc2hpcHBpbmctYWRkcmVzcycpLmlubmVySFRNTCA9IGFkZHJlc3MgfHwgJyc7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdG9nZ2xlU2hpcHBpbmdBZGRyZXNzKHVzZUlhc1MsIGludm9pY2VBZGRyZXNzLCBzaGlwcGluZ0FkZHJlc3MpIHtcbiAgICAgICAgY29uc3Qgc2hpcHBpbmdGaWVsZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zaGlwcGluZy1hZGRyZXNzLXNlbGVjdG9yJyk7XG4gICAgICAgIGNvbnN0IHNoaXBwaW5nQWRkQWRkcmVzc0J1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jYXJkLWZvb3RlcicpO1xuXG4gICAgICAgIGlmICh1c2VJYXNTLmNoZWNrZWQpIHtcbiAgICAgICAgICAgIHNoaXBwaW5nRmllbGQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgIHNoaXBwaW5nQWRkcmVzcy52YWx1ZSA9IGludm9pY2VBZGRyZXNzLnZhbHVlO1xuICAgICAgICAgICAgc2hpcHBpbmdBZGRyZXNzLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdjaGFuZ2UnKSk7XG4gICAgICAgICAgICBpZiAoc2hpcHBpbmdBZGRBZGRyZXNzQnV0dG9uKSBzaGlwcGluZ0FkZEFkZHJlc3NCdXR0b24uY2xhc3NMaXN0LmFkZCgnZC1ub25lJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzaGlwcGluZ0ZpZWxkLnN0eWxlLmRpc3BsYXkgPSAnJztcbiAgICAgICAgICAgIGlmIChzaGlwcGluZ0FkZEFkZHJlc3NCdXR0b24pIHNoaXBwaW5nQWRkQWRkcmVzc0J1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKCdkLW5vbmUnKTtcbiAgICAgICAgfVxuICAgIH1cbn0od2luZG93LnNob3AgPSB3aW5kb3cuc2hvcCB8fCB7fSkpO1xuIiwiKGZ1bmN0aW9uICh2YXJpYW50KSB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgd2luZG93LnZhcmlhbnRSZWFkeSA9IGZhbHNlO1xuXG4gICAgICAgIHZhcmlhbnQuaW5pdCgpO1xuXG4gICAgICAgIHdpbmRvdy52YXJpYW50UmVhZHkgPSB0cnVlO1xuICAgIH0pO1xuXG4gICAgdmFyaWFudC5pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zdCB2YXJpYW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wcm9kdWN0LWluZm9fX2F0dHJpYnV0ZXMnKTtcbiAgICAgICAgaWYgKCF2YXJpYW50cykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29yZXNob3BWYXJpYW50U2VsZWN0b3IodmFyaWFudHMpOyAvLyBFbnN1cmUgdGhpcyBmdW5jdGlvbiBpcyBkZWZpbmVkIGluIHlvdXIgZ2xvYmFsIHNjb3BlXG5cbiAgICAgICAgdmFyaWFudHMuYWRkRXZlbnRMaXN0ZW5lcigndmFyaWFudF9zZWxlY3Rvci5zZWxlY3QnLCAoZSkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgb3B0aW9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wcm9kdWN0LWluZm8gLnByb2R1Y3QtZGV0YWlscyAub3B0aW9ucycpO1xuXG4gICAgICAgICAgICBpZiAob3B0aW9ucykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN1Ym1pdHMgPSBvcHRpb25zLnF1ZXJ5U2VsZWN0b3JBbGwoJ1t0eXBlPVwic3VibWl0XCJdJyk7XG5cbiAgICAgICAgICAgICAgICBvcHRpb25zLmNsYXNzTGlzdC5hZGQoJ2Rpc2FibGVkJyk7XG5cbiAgICAgICAgICAgICAgICBzdWJtaXRzLmZvckVhY2goKHN1Ym1pdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBzdWJtaXQuZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xufSh3aW5kb3cudmFyaWFudCB8fCAod2luZG93LnZhcmlhbnQgPSB7fSkpKTsgLy8gRXh0cmFjdGVkIGFzc2lnbm1lbnRcbiIsIi8qIFNUWUxFUyAgKi9cbmltcG9ydCAnLi4vc2Nzcy9hcHAuc2Nzcyc7XG5pbXBvcnQgJ3N3aXBlci9jc3MvYnVuZGxlJztcbi8qIEpTICovXG5pbXBvcnQgJ2Jvb3RzdHJhcCc7XG5pbXBvcnQgJy4vc2NyaXB0cy9oYW5kbGUtcHJvdG90eXBlcy5qcyc7XG5pbXBvcnQgJy4vcGx1Z2luL2NvcmVzaG9wLnBsdWdpbi5xdWFudGl0eS5qcyc7XG5pbXBvcnQgJy4vcGx1Z2luL2NvcmVzaG9wLnBsdWdpbi52YXJpYW50LmpzJztcbmltcG9ydCAnLi9zY3JpcHRzL3Nob3AuanMnO1xuaW1wb3J0ICcuL3NjcmlwdHMvdmFyaWFudC5qcyc7XG5pbXBvcnQgJy4vc2NyaXB0cy9tYXAuanMnO1xuaW1wb3J0IHsgQ2Fyb3VzZWwgfSBmcm9tICcuL3NjcmlwdHMvY2Fyb3VzZWwnO1xuaW1wb3J0IHsgQ2FydEluZm8gfSBmcm9tICcuL3NjcmlwdHMvY2FydEluZm8nO1xubmV3IENhcnRJbmZvKCcvY29yZXNob3BfZ2V0X2NhcnRfaXRlbXMnLCAnLmpzLWNhcnQtd2lkZ2V0Jyk7XG5uZXcgQ2Fyb3VzZWwoKTtcbiIsImltcG9ydCBTd2lwZXIgZnJvbSAnc3dpcGVyJztcbmltcG9ydCB7IFRodW1icyB9IGZyb20gXCJzd2lwZXIvbW9kdWxlc1wiO1xudmFyIENhcm91c2VsID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIENhcm91c2VsKCkge1xuICAgICAgICB0aGlzLl9pbml0Q2Fyb3VzZWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvKiBJbml0IHN3aXBlciB3aXRoIHRodW1icyAqL1xuICAgICAgICAgICAgdmFyIHNsaWRlclRodW1ibmFpbCA9IG5ldyBTd2lwZXIoJy5qcy1zbGlkZXItdGh1bWJuYWlsJywge1xuICAgICAgICAgICAgICAgIHNsaWRlc1BlclZpZXc6IDMsXG4gICAgICAgICAgICAgICAgZnJlZU1vZGU6IHRydWUsXG4gICAgICAgICAgICAgICAgc3BhY2VCZXR3ZWVuOiAnOHB4JyxcbiAgICAgICAgICAgICAgICB3YXRjaFNsaWRlc1Byb2dyZXNzOiB0cnVlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBuZXcgU3dpcGVyKCcuanMtc2xpZGVyJywge1xuICAgICAgICAgICAgICAgIG1vZHVsZXM6IFtUaHVtYnNdLFxuICAgICAgICAgICAgICAgIG5hdmlnYXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgbmV4dEVsOiAnLnN3aXBlci1idXR0b24tbmV4dCcsXG4gICAgICAgICAgICAgICAgICAgIHByZXZFbDogJy5zd2lwZXItYnV0dG9uLXByZXYnLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGh1bWJzOiB7XG4gICAgICAgICAgICAgICAgICAgIHN3aXBlcjogc2xpZGVyVGh1bWJuYWlsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuX2luaXRDYXJvdXNlbCgpO1xuICAgIH1cbiAgICByZXR1cm4gQ2Fyb3VzZWw7XG59KCkpO1xuZXhwb3J0IHsgQ2Fyb3VzZWwgfTtcbiIsInZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xudmFyIF9fZ2VuZXJhdG9yID0gKHRoaXMgJiYgdGhpcy5fX2dlbmVyYXRvcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIGJvZHkpIHtcbiAgICB2YXIgXyA9IHsgbGFiZWw6IDAsIHNlbnQ6IGZ1bmN0aW9uKCkgeyBpZiAodFswXSAmIDEpIHRocm93IHRbMV07IHJldHVybiB0WzFdOyB9LCB0cnlzOiBbXSwgb3BzOiBbXSB9LCBmLCB5LCB0LCBnID0gT2JqZWN0LmNyZWF0ZSgodHlwZW9mIEl0ZXJhdG9yID09PSBcImZ1bmN0aW9uXCIgPyBJdGVyYXRvciA6IE9iamVjdCkucHJvdG90eXBlKTtcbiAgICByZXR1cm4gZy5uZXh0ID0gdmVyYigwKSwgZ1tcInRocm93XCJdID0gdmVyYigxKSwgZ1tcInJldHVyblwiXSA9IHZlcmIoMiksIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiAoZ1tTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzOyB9KSwgZztcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgcmV0dXJuIGZ1bmN0aW9uICh2KSB7IHJldHVybiBzdGVwKFtuLCB2XSk7IH07IH1cbiAgICBmdW5jdGlvbiBzdGVwKG9wKSB7XG4gICAgICAgIGlmIChmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgZXhlY3V0aW5nLlwiKTtcbiAgICAgICAgd2hpbGUgKGcgJiYgKGcgPSAwLCBvcFswXSAmJiAoXyA9IDApKSwgXykgdHJ5IHtcbiAgICAgICAgICAgIGlmIChmID0gMSwgeSAmJiAodCA9IG9wWzBdICYgMiA/IHlbXCJyZXR1cm5cIl0gOiBvcFswXSA/IHlbXCJ0aHJvd1wiXSB8fCAoKHQgPSB5W1wicmV0dXJuXCJdKSAmJiB0LmNhbGwoeSksIDApIDogeS5uZXh0KSAmJiAhKHQgPSB0LmNhbGwoeSwgb3BbMV0pKS5kb25lKSByZXR1cm4gdDtcbiAgICAgICAgICAgIGlmICh5ID0gMCwgdCkgb3AgPSBbb3BbMF0gJiAyLCB0LnZhbHVlXTtcbiAgICAgICAgICAgIHN3aXRjaCAob3BbMF0pIHtcbiAgICAgICAgICAgICAgICBjYXNlIDA6IGNhc2UgMTogdCA9IG9wOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDQ6IF8ubGFiZWwrKzsgcmV0dXJuIHsgdmFsdWU6IG9wWzFdLCBkb25lOiBmYWxzZSB9O1xuICAgICAgICAgICAgICAgIGNhc2UgNTogXy5sYWJlbCsrOyB5ID0gb3BbMV07IG9wID0gWzBdOyBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBjYXNlIDc6IG9wID0gXy5vcHMucG9wKCk7IF8udHJ5cy5wb3AoKTsgY29udGludWU7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEodCA9IF8udHJ5cywgdCA9IHQubGVuZ3RoID4gMCAmJiB0W3QubGVuZ3RoIC0gMV0pICYmIChvcFswXSA9PT0gNiB8fCBvcFswXSA9PT0gMikpIHsgXyA9IDA7IGNvbnRpbnVlOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gMyAmJiAoIXQgfHwgKG9wWzFdID4gdFswXSAmJiBvcFsxXSA8IHRbM10pKSkgeyBfLmxhYmVsID0gb3BbMV07IGJyZWFrOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gNiAmJiBfLmxhYmVsIDwgdFsxXSkgeyBfLmxhYmVsID0gdFsxXTsgdCA9IG9wOyBicmVhazsgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodCAmJiBfLmxhYmVsIDwgdFsyXSkgeyBfLmxhYmVsID0gdFsyXTsgXy5vcHMucHVzaChvcCk7IGJyZWFrOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0WzJdKSBfLm9wcy5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9wID0gYm9keS5jYWxsKHRoaXNBcmcsIF8pO1xuICAgICAgICB9IGNhdGNoIChlKSB7IG9wID0gWzYsIGVdOyB5ID0gMDsgfSBmaW5hbGx5IHsgZiA9IHQgPSAwOyB9XG4gICAgICAgIGlmIChvcFswXSAmIDUpIHRocm93IG9wWzFdOyByZXR1cm4geyB2YWx1ZTogb3BbMF0gPyBvcFsxXSA6IHZvaWQgMCwgZG9uZTogdHJ1ZSB9O1xuICAgIH1cbn07XG52YXIgQ2FydEluZm8gPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQ2FydEluZm8oYXBpVXJsLCBlbGVtZW50U2VsZWN0b3IpIHtcbiAgICAgICAgdGhpcy5hcGlVcmwgPSBhcGlVcmw7XG4gICAgICAgIHRoaXMuZWxlbWVudFNlbGVjdG9yID0gZWxlbWVudFNlbGVjdG9yO1xuICAgICAgICB0aGlzLl9pbml0Q2FydFdpZGdldCgpO1xuICAgIH1cbiAgICBDYXJ0SW5mby5wcm90b3R5cGUuZmV0Y2hDYXJ0SXRlbXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciByZXNwb25zZSwgaHRtbCwgZXJyb3JfMTtcbiAgICAgICAgICAgIHJldHVybiBfX2dlbmVyYXRvcih0aGlzLCBmdW5jdGlvbiAoX2EpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKF9hLmxhYmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICAgICAgICAgIF9hLnRyeXMucHVzaChbMCwgMywgLCA0XSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzQgLyp5aWVsZCovLCBmZXRjaCh0aGlzLmFwaVVybCldO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNwb25zZSA9IF9hLnNlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdUaGVyZSBoYXMgYmVlbiBhIHByb2JsZW0gd2l0aCB5b3VyIGZldGNoIG9wZXJhdGlvbjonLCByZXNwb25zZS5zdGF0dXNUZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzIgLypyZXR1cm4qL107IC8vIEFkZGVkIHJldHVybiB0byBwcmV2ZW50IGZ1cnRoZXIgZXhlY3V0aW9uIGlmIHRoZXJlJ3MgYW4gZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbNCAvKnlpZWxkKi8sIHJlc3BvbnNlLnRleHQoKV07XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGh0bWwgPSBfYS5zZW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc3BsYXlDYXJ0SXRlbXMoaHRtbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzMgLypicmVhayovLCA0XTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JfMSA9IF9hLnNlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1RoZXJlIGhhcyBiZWVuIGEgcHJvYmxlbSB3aXRoIHlvdXIgZmV0Y2ggb3BlcmF0aW9uOicsIGVycm9yXzEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFszIC8qYnJlYWsqLywgNF07XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgNDogcmV0dXJuIFsyIC8qcmV0dXJuKi9dO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIENhcnRJbmZvLnByb3RvdHlwZS5faW5pdENhcnRXaWRnZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuZmV0Y2hDYXJ0SXRlbXMoKTtcbiAgICB9O1xuICAgIENhcnRJbmZvLnByb3RvdHlwZS5kaXNwbGF5Q2FydEl0ZW1zID0gZnVuY3Rpb24gKGh0bWwpIHtcbiAgICAgICAgdmFyIGNhcnRGbGFnID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLmVsZW1lbnRTZWxlY3Rvcik7XG4gICAgICAgIGlmIChjYXJ0RmxhZykge1xuICAgICAgICAgICAgdmFyIGxvYWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYXJ0LWxvYWRlcicpO1xuICAgICAgICAgICAgaWYgKGxvYWRlcikge1xuICAgICAgICAgICAgICAgIGxvYWRlci5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhcnRGbGFnLmlubmVySFRNTCArPSBodG1sO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gQ2FydEluZm87XG59KCkpO1xuZXhwb3J0IHsgQ2FydEluZm8gfTtcbiIsIi8vIGV4dHJhY3RlZCBieSBtaW5pLWNzcy1leHRyYWN0LXBsdWdpblxuZXhwb3J0IHt9OyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4vLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuX193ZWJwYWNrX3JlcXVpcmVfXy5tID0gX193ZWJwYWNrX21vZHVsZXNfXztcblxuIiwidmFyIGRlZmVycmVkID0gW107XG5fX3dlYnBhY2tfcmVxdWlyZV9fLk8gPSAocmVzdWx0LCBjaHVua0lkcywgZm4sIHByaW9yaXR5KSA9PiB7XG5cdGlmKGNodW5rSWRzKSB7XG5cdFx0cHJpb3JpdHkgPSBwcmlvcml0eSB8fCAwO1xuXHRcdGZvcih2YXIgaSA9IGRlZmVycmVkLmxlbmd0aDsgaSA+IDAgJiYgZGVmZXJyZWRbaSAtIDFdWzJdID4gcHJpb3JpdHk7IGktLSkgZGVmZXJyZWRbaV0gPSBkZWZlcnJlZFtpIC0gMV07XG5cdFx0ZGVmZXJyZWRbaV0gPSBbY2h1bmtJZHMsIGZuLCBwcmlvcml0eV07XG5cdFx0cmV0dXJuO1xuXHR9XG5cdHZhciBub3RGdWxmaWxsZWQgPSBJbmZpbml0eTtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBkZWZlcnJlZC5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBjaHVua0lkcyA9IGRlZmVycmVkW2ldWzBdO1xuXHRcdHZhciBmbiA9IGRlZmVycmVkW2ldWzFdO1xuXHRcdHZhciBwcmlvcml0eSA9IGRlZmVycmVkW2ldWzJdO1xuXHRcdHZhciBmdWxmaWxsZWQgPSB0cnVlO1xuXHRcdGZvciAodmFyIGogPSAwOyBqIDwgY2h1bmtJZHMubGVuZ3RoOyBqKyspIHtcblx0XHRcdGlmICgocHJpb3JpdHkgJiAxID09PSAwIHx8IG5vdEZ1bGZpbGxlZCA+PSBwcmlvcml0eSkgJiYgT2JqZWN0LmtleXMoX193ZWJwYWNrX3JlcXVpcmVfXy5PKS5ldmVyeSgoa2V5KSA9PiAoX193ZWJwYWNrX3JlcXVpcmVfXy5PW2tleV0oY2h1bmtJZHNbal0pKSkpIHtcblx0XHRcdFx0Y2h1bmtJZHMuc3BsaWNlKGotLSwgMSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRmdWxmaWxsZWQgPSBmYWxzZTtcblx0XHRcdFx0aWYocHJpb3JpdHkgPCBub3RGdWxmaWxsZWQpIG5vdEZ1bGZpbGxlZCA9IHByaW9yaXR5O1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZihmdWxmaWxsZWQpIHtcblx0XHRcdGRlZmVycmVkLnNwbGljZShpLS0sIDEpXG5cdFx0XHR2YXIgciA9IGZuKCk7XG5cdFx0XHRpZiAociAhPT0gdW5kZWZpbmVkKSByZXN1bHQgPSByO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gcmVzdWx0O1xufTsiLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gKG1vZHVsZSkgPT4ge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHQoKSA9PiAobW9kdWxlWydkZWZhdWx0J10pIDpcblx0XHQoKSA9PiAobW9kdWxlKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgeyBhOiBnZXR0ZXIgfSk7XG5cdHJldHVybiBnZXR0ZXI7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18uZyA9IChmdW5jdGlvbigpIHtcblx0aWYgKHR5cGVvZiBnbG9iYWxUaGlzID09PSAnb2JqZWN0JykgcmV0dXJuIGdsb2JhbFRoaXM7XG5cdHRyeSB7XG5cdFx0cmV0dXJuIHRoaXMgfHwgbmV3IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpIHJldHVybiB3aW5kb3c7XG5cdH1cbn0pKCk7IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIi8vIG5vIGJhc2VVUklcblxuLy8gb2JqZWN0IHRvIHN0b3JlIGxvYWRlZCBhbmQgbG9hZGluZyBjaHVua3Ncbi8vIHVuZGVmaW5lZCA9IGNodW5rIG5vdCBsb2FkZWQsIG51bGwgPSBjaHVuayBwcmVsb2FkZWQvcHJlZmV0Y2hlZFxuLy8gW3Jlc29sdmUsIHJlamVjdCwgUHJvbWlzZV0gPSBjaHVuayBsb2FkaW5nLCAwID0gY2h1bmsgbG9hZGVkXG52YXIgaW5zdGFsbGVkQ2h1bmtzID0ge1xuXHRcImFwcFwiOiAwXG59O1xuXG4vLyBubyBjaHVuayBvbiBkZW1hbmQgbG9hZGluZ1xuXG4vLyBubyBwcmVmZXRjaGluZ1xuXG4vLyBubyBwcmVsb2FkZWRcblxuLy8gbm8gSE1SXG5cbi8vIG5vIEhNUiBtYW5pZmVzdFxuXG5fX3dlYnBhY2tfcmVxdWlyZV9fLk8uaiA9IChjaHVua0lkKSA9PiAoaW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdID09PSAwKTtcblxuLy8gaW5zdGFsbCBhIEpTT05QIGNhbGxiYWNrIGZvciBjaHVuayBsb2FkaW5nXG52YXIgd2VicGFja0pzb25wQ2FsbGJhY2sgPSAocGFyZW50Q2h1bmtMb2FkaW5nRnVuY3Rpb24sIGRhdGEpID0+IHtcblx0dmFyIGNodW5rSWRzID0gZGF0YVswXTtcblx0dmFyIG1vcmVNb2R1bGVzID0gZGF0YVsxXTtcblx0dmFyIHJ1bnRpbWUgPSBkYXRhWzJdO1xuXHQvLyBhZGQgXCJtb3JlTW9kdWxlc1wiIHRvIHRoZSBtb2R1bGVzIG9iamVjdCxcblx0Ly8gdGhlbiBmbGFnIGFsbCBcImNodW5rSWRzXCIgYXMgbG9hZGVkIGFuZCBmaXJlIGNhbGxiYWNrXG5cdHZhciBtb2R1bGVJZCwgY2h1bmtJZCwgaSA9IDA7XG5cdGlmKGNodW5rSWRzLnNvbWUoKGlkKSA9PiAoaW5zdGFsbGVkQ2h1bmtzW2lkXSAhPT0gMCkpKSB7XG5cdFx0Zm9yKG1vZHVsZUlkIGluIG1vcmVNb2R1bGVzKSB7XG5cdFx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8obW9yZU1vZHVsZXMsIG1vZHVsZUlkKSkge1xuXHRcdFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLm1bbW9kdWxlSWRdID0gbW9yZU1vZHVsZXNbbW9kdWxlSWRdO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZihydW50aW1lKSB2YXIgcmVzdWx0ID0gcnVudGltZShfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblx0fVxuXHRpZihwYXJlbnRDaHVua0xvYWRpbmdGdW5jdGlvbikgcGFyZW50Q2h1bmtMb2FkaW5nRnVuY3Rpb24oZGF0YSk7XG5cdGZvcig7aSA8IGNodW5rSWRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0Y2h1bmtJZCA9IGNodW5rSWRzW2ldO1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhpbnN0YWxsZWRDaHVua3MsIGNodW5rSWQpICYmIGluc3RhbGxlZENodW5rc1tjaHVua0lkXSkge1xuXHRcdFx0aW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdWzBdKCk7XG5cdFx0fVxuXHRcdGluc3RhbGxlZENodW5rc1tjaHVua0lkXSA9IDA7XG5cdH1cblx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18uTyhyZXN1bHQpO1xufVxuXG52YXIgY2h1bmtMb2FkaW5nR2xvYmFsID0gc2VsZltcIndlYnBhY2tDaHVua1wiXSA9IHNlbGZbXCJ3ZWJwYWNrQ2h1bmtcIl0gfHwgW107XG5jaHVua0xvYWRpbmdHbG9iYWwuZm9yRWFjaCh3ZWJwYWNrSnNvbnBDYWxsYmFjay5iaW5kKG51bGwsIDApKTtcbmNodW5rTG9hZGluZ0dsb2JhbC5wdXNoID0gd2VicGFja0pzb25wQ2FsbGJhY2suYmluZChudWxsLCBjaHVua0xvYWRpbmdHbG9iYWwucHVzaC5iaW5kKGNodW5rTG9hZGluZ0dsb2JhbCkpOyIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgZGVwZW5kcyBvbiBvdGhlciBsb2FkZWQgY2h1bmtzIGFuZCBleGVjdXRpb24gbmVlZCB0byBiZSBkZWxheWVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18uTyh1bmRlZmluZWQsIFtcInZlbmRvcnMtbm9kZV9tb2R1bGVzX2Jvb3RzdHJhcF9kaXN0X2pzX2Jvb3RzdHJhcF9lc21fanMtbm9kZV9tb2R1bGVzX3N3aXBlcl9zd2lwZXItYnVuZGxlX2Nzcy0wY2RlZGJcIl0sICgpID0+IChfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9qcy9hcHAudHNcIikpKVxuX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18uTyhfX3dlYnBhY2tfZXhwb3J0c19fKTtcbiIsIiJdLCJuYW1lcyI6WyJjb3Jlc2hvcFF1YW50aXR5U2VsZWN0b3IiLCJvcHRpb25zIiwiaW5pdFF1YW50aXR5RmllbGRzIiwiZmllbGRzIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yQWxsIiwicHJlY2lzaW9uUHJlc2V0U2VsZWN0b3IiLCJxdWVyeVNlbGVjdG9yIiwiYWRkRXZlbnRMaXN0ZW5lciIsImRhdGFzZXQiLCJjc1VuaXRJZGVudGlmaWVyIiwicXVhbnRpdHlJZGVudGlmaWVyIiwicXVhbnRpdHlJbnB1dCIsImNvbmNhdCIsInN0ZXAiLCJjc1VuaXRQcmVjaXNpb24iLCJ1cGRhdGVUb3VjaFNwaW5TZXR0aW5ncyIsInRvU3RyaW5nIiwiZm9yRWFjaCIsImZpZWxkIiwiaW5pdGlhbGl6ZVRvdWNoU3BpbiIsImlucHV0IiwicHJlY2lzaW9uIiwiY29udGFpbmVyIiwiY3JlYXRlRWxlbWVudCIsImNsYXNzTGlzdCIsImFkZCIsImRlY3JlbWVudEJ1dHRvbiIsInR5cGUiLCJ0ZXh0Q29udGVudCIsImluY3JlbWVudEJ1dHRvbiIsInBhcmVudE5vZGUiLCJpbnNlcnRCZWZvcmUiLCJhcHBlbmRDaGlsZCIsInZhbHVlIiwicGFyc2VJbnQiLCJpc05hTiIsIm1pbiIsIm1heCIsIndpbmRvdyIsImNvcmVzaG9wVmFyaWFudFNlbGVjdG9yIiwiYXR0cmlidXRlQ29udGFpbmVyIiwiX2F0dHJpYnV0ZUNvbnRhaW5lciIsIl9jb25maWciLCJfYXR0cmlidXRlR3JvdXBzIiwiX2NsZWFyR3JvdXBFbGVtZW50cyIsImVsZW1lbnQiLCJkaXNhYmxlZCIsImNoZWNrZWQiLCJ0YWdOYW1lIiwidG9Mb3dlckNhc2UiLCJvcHRpb24iLCJyZW1vdmVDaGlsZCIsIl9jbGVhckdyb3VwIiwiZ3JvdXAiLCJzZWxlY3RlZCIsImVsZW1lbnRzIiwiX2NsZWFyR3JvdXBzIiwibmV4dEdyb3VwIiwiX2ZpbHRlckF0dHJpYnV0ZXMiLCJhdHRyaWJ1dGVzIiwiZmlsdGVyQXR0cmlidXRlcyIsImN1cnJlbnRHcm91cCIsInByZXZHcm91cCIsInB1c2giLCJpZCIsImZpbHRlciIsImF0dHJpYnV0ZSIsInByb2R1Y3RzIiwic29tZSIsInByb2R1Y3QiLCJldmVyeSIsIl9jb25maWckaW5kZXgkcHJvZHVjdCIsImluZGV4IiwiX2FkZE9wdGlvblRvU2VsZWN0IiwiT3B0aW9uIiwibmFtZSIsIl9lbmFibGVFbGVtZW50Rm9yQXR0cmlidXRlIiwiX2NvbmZpZ3VyZUdyb3VwRWxlbWVudHMiLCJfY29uZmlndXJlR3JvdXAiLCJmaWx0ZXJlZEF0dHJpYnV0ZXMiLCJzbGljZSIsIl9zZXR1cEF0dHJpYnV0ZUdyb3VwU2V0dGluZ3MiLCJfc2V0dXBDaGFuZ2VFdmVudHMiLCJvbmNoYW5nZSIsIl9jb25maWd1cmVFbGVtZW50IiwiX3JlZGlyZWN0VG9WYXJpYW50Iiwic2VsZWN0ZWRBdHRyaWJ1dGVzIiwiT2JqZWN0IiwiZnJvbUVudHJpZXMiLCJnIiwibWFwIiwibWF0Y2hpbmdQcm9kdWN0IiwidmFsdWVzIiwiZmluZCIsInAiLCJKU09OIiwic3RyaW5naWZ5IiwidXJsIiwibG9jYXRpb24iLCJocmVmIiwiX2NyZWF0ZUV2ZW50IiwiZGF0YSIsImFyZ3VtZW50cyIsImxlbmd0aCIsInVuZGVmaW5lZCIsIkN1c3RvbUV2ZW50IiwiYnViYmxlcyIsImNhbmNlbGFibGUiLCJkZXRhaWwiLCJ2YXJpYW50UmVhZHkiLCJkaXNwYXRjaEV2ZW50IiwiX2luaXQiLCJwYXJzZSIsImNvbmZpZyIsIm1ldGhvZHMiLCJpbml0Iiwic2V0dGluZ3MiLCJwcm90b3R5cGVQcmVmaXgiLCJjb250YWluZXJTZWxlY3RvciIsInNlbGVjdG9yQXR0ciIsInNlbGVjdG9yIiwic2hvdyIsInJlcGxhY2UiLCJzZWxlY3RlZFZhbHVlIiwic2VsZWN0ZWRPcHRpb24iLCJBcnJheSIsImZyb20iLCJnZXRBdHRyaWJ1dGUiLCJwcm90b3R5cGVFbGVtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJnZXRDb250YWluZXIiLCJpbm5lckhUTUwiLCJ0cmltIiwicHJvdG90eXBlIiwiZGF0YUNvbnRhaW5lcklkIiwiTm9kZUxpc3QiLCJoYW5kbGVQcm90b3R5cGVzIiwibWV0aG9kIiwiYXBwbHkiLCJjYWxsIiwiRXJyb3IiLCJIVE1MRWxlbWVudCIsIm1hcEJsb2NrIiwic3R5bGUiLCJoZWlnaHQiLCJjbGllbnRIZWlnaHQiLCJpbml0aWFsaXplIiwibWFwT3B0aW9ucyIsInpvb20iLCJjZW50ZXIiLCJnb29nbGUiLCJtYXBzIiwiTGF0TG5nIiwiZGlzYWJsZURlZmF1bHRVSSIsIk1hcCIsInNob3AiLCJzaG93RWxlbWVudCIsImdldFNlbGVjdGVkVmFsdWUiLCJpbml0Q2hhbmdlQWRkcmVzcyIsImluaXRDYXJ0U2hpcG1lbnRDYWxjdWxhdG9yIiwiaW5pdFF1YW50aXR5VmFsaWRhdG9yIiwiaW5pdENhdGVnb3J5U2VsZWN0Iiwic2V0dXBDb3B5VG9DbGlwYm9hcmQiLCJidXR0b24iLCJjb3B5VGV4dFRvQ2xpcGJvYXJkIiwidGFyZ2V0SWQiLCJ0YXJnZXQiLCJjb3B5VGV4dCIsInNlbGVjdCIsInNldFNlbGVjdGlvblJhbmdlIiwibmF2aWdhdG9yIiwiY2xpcGJvYXJkIiwid3JpdGVUZXh0IiwidGhlbiIsImNvbnNvbGUiLCJsb2ciLCJjb3BpZWRUZXh0IiwidXBkYXRlUXVlcnlTdHJpbmdQYXJhbWV0ZXIiLCJ1cmkiLCJrZXkiLCJyZSIsIlJlZ0V4cCIsInNlcGFyYXRvciIsImluZGV4T2YiLCJtYXRjaCIsImJ1dHRvbmRvd25fY2xhc3MiLCJidXR0b251cF9jbGFzcyIsImV2IiwiZm9ybSIsImNsb3Nlc3QiLCJoYW5kbGVTaGlwbWVudENhbGN1bGF0aW9uIiwiZXZlbnQiLCJwcmV2ZW50RGVmYXVsdCIsInNldEF0dHJpYnV0ZSIsIm9wYWNpdHkiLCJmZXRjaCIsImFjdGlvbiIsImJvZHkiLCJVUkxTZWFyY2hQYXJhbXMiLCJGb3JtRGF0YSIsInJlc3BvbnNlIiwidGV4dCIsInJlcyIsInVwZGF0ZVNoaXBtZW50Q2FsY3VsYXRpb24iLCJjYXRjaCIsImVycm9yIiwiaGFuZGxlU2hpcG1lbnRFcnJvciIsInJlc3BvbnNlVGV4dCIsInJlbW92ZSIsIm91dGVySFRNTCIsInJlbW92ZUF0dHJpYnV0ZSIsImFkZHJlc3NTdGVwIiwiaW52b2ljZUFkZHJlc3MiLCJzaGlwcGluZ0FkZHJlc3MiLCJ1c2VJYXNTIiwic2V0dXBBZGRyZXNzQ2hhbmdlRXZlbnRzIiwidXBkYXRlQWRkcmVzcyIsInVwZGF0ZVNoaXBwaW5nQWRkcmVzcyIsInRvZ2dsZVNoaXBwaW5nQWRkcmVzcyIsInNlbGVjdGVkSW5kZXgiLCJhZGRyZXNzIiwiaHRtbCIsImludm9pY2VQYW5lbCIsInRvZ2dsZVVzZUFzU2hpcHBpbmciLCJhZGRyZXNzVHlwZSIsImlzSW52b2ljZVR5cGUiLCJFdmVudCIsInNoaXBwaW5nRmllbGQiLCJzaGlwcGluZ0FkZEFkZHJlc3NCdXR0b24iLCJkaXNwbGF5IiwidmFyaWFudCIsInZhcmlhbnRzIiwiZSIsInN1Ym1pdHMiLCJzdWJtaXQiLCJDYXJvdXNlbCIsIkNhcnRJbmZvIiwiU3dpcGVyIiwiVGh1bWJzIiwiX2luaXRDYXJvdXNlbCIsInNsaWRlclRodW1ibmFpbCIsInNsaWRlc1BlclZpZXciLCJmcmVlTW9kZSIsInNwYWNlQmV0d2VlbiIsIndhdGNoU2xpZGVzUHJvZ3Jlc3MiLCJtb2R1bGVzIiwibmF2aWdhdGlvbiIsIm5leHRFbCIsInByZXZFbCIsInRodW1icyIsInN3aXBlciIsIl9fYXdhaXRlciIsInRoaXNBcmciLCJfYXJndW1lbnRzIiwiUCIsImdlbmVyYXRvciIsImFkb3B0IiwicmVzb2x2ZSIsIlByb21pc2UiLCJyZWplY3QiLCJmdWxmaWxsZWQiLCJuZXh0IiwicmVqZWN0ZWQiLCJyZXN1bHQiLCJkb25lIiwiX19nZW5lcmF0b3IiLCJfIiwibGFiZWwiLCJzZW50IiwidCIsInRyeXMiLCJvcHMiLCJmIiwieSIsImNyZWF0ZSIsIkl0ZXJhdG9yIiwidmVyYiIsIlN5bWJvbCIsIml0ZXJhdG9yIiwibiIsInYiLCJvcCIsIlR5cGVFcnJvciIsInBvcCIsImFwaVVybCIsImVsZW1lbnRTZWxlY3RvciIsIl9pbml0Q2FydFdpZGdldCIsImZldGNoQ2FydEl0ZW1zIiwiZXJyb3JfMSIsIl9hIiwib2siLCJzdGF0dXNUZXh0IiwiZGlzcGxheUNhcnRJdGVtcyIsImNhcnRGbGFnIiwibG9hZGVyIl0sInNvdXJjZVJvb3QiOiIifQ==