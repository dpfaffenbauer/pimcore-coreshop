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
    const _init = function () {
      if (!attributeContainer) return;
      _attributeContainer = attributeContainer;
      _config = JSON.parse(_attributeContainer.dataset.config);
      _initializeAttributeGroups();
      _setupAttributeGroupSettings();
      _setupChangeEvents();
    };
    const _initializeAttributeGroups = function () {
      _config.attributes.forEach(group => {
        group.elements = _attributeContainer.querySelectorAll("[data-group=\"".concat(group.group.id, "\"]"));
        _attributeGroups.push(group);
      });
    };
    const _setupAttributeGroupSettings = function () {
      _attributeGroups.forEach((group, index) => {
        group.prevGroup = _attributeGroups[index - 1] || null;
        group.nextGroup = _attributeGroups[index + 1] || null;
        group.selected ? _configureGroup(group) : _clearGroup(group);
      });
    };
    const _setupChangeEvents = function () {
      _attributeGroups.forEach(group => _attachChangeEvent(group));
    };
    const _attachChangeEvent = function (group) {
      group.elements.forEach(element => {
        element.onchange = () => _handleElementChange(group, element);
      });
    };
    const _handleElementChange = function (group, element) {
      window.variantReady = false;
      _attributeContainer.dispatchEvent(_createEvent('change', {
        element
      }));
      if (element.value) {
        _selectGroupElement(group, element);
      } else {
        _deselectGroupElement(group);
      }
      window.variantReady = true;
    };
    const _selectGroupElement = function (group, element) {
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
    };
    const _deselectGroupElement = function (group) {
      delete group.selected;
      if (group.nextGroup) _clearGroups(group.nextGroup);
    };
    const _redirectToVariant = function () {
      const selectedAttributes = _getSelectedAttributes();
      const matchingProduct = _findMatchingProduct(selectedAttributes);
      if (matchingProduct !== null && matchingProduct !== void 0 && matchingProduct.url) {
        window.location.href = matchingProduct.url;
      }
    };
    const _getSelectedAttributes = function () {
      return Object.fromEntries(_attributeGroups.filter(g => g.selected).map(g => [g.group.id, g.selected]));
    };
    const _findMatchingProduct = function (selectedAttributes) {
      return Object.values(_config.index).find(p => JSON.stringify(p.attributes) === JSON.stringify(selectedAttributes));
    };
    const _createEvent = function (name) {
      let data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return new CustomEvent('variant_selector.' + name, {
        bubbles: true,
        cancelable: false,
        detail: data
      });
    };
    const _clearGroupElements = function (element) {
      element.disabled = true;
      element.checked = false;
      if (element.tagName.toLowerCase() === 'select') _clearSelectOptions(element);
    };
    const _clearSelectOptions = function (element) {
      const options = element.querySelectorAll('option:not([value=""])');
      options.forEach(option => element.removeChild(option));
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
      const filterAttributes = _getFilterAttributes(group);
      return attributes.filter(attribute => attribute.products.some(product => _matchesAllFilters(product, filterAttributes)));
    };
    const _getFilterAttributes = function (group) {
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
      return filterAttributes;
    };
    const _matchesAllFilters = function (product, filterAttributes) {
      return filterAttributes.every(filter => {
        var _config$index$product;
        return ((_config$index$product = _config.index[product.id].attributes) === null || _config$index$product === void 0 ? void 0 : _config$index$product[filter.group]) === filter.selected;
      });
    };
    const _addOptionToSelect = function (element, attribute, group) {
      const option = new Option(attribute.attribute.name, attribute.attribute.id);
      option.id = 'attribute-' + attribute.attribute.id;
      if (group.selected === attribute.attribute.id) option.selected = true;
      element.add(option);
      element.disabled = false;
    };
    const _enableElementForAttribute = function (element, attribute, group) {
      if (parseInt(element.dataset.group) === group.group.id && parseInt(element.value) === attribute.attribute.id) {
        element.disabled = false;
        if (group.selected === attribute.attribute.id) element.checked = true;
      }
    };
    const _configureGroupElements = function (group, attributes) {
      group.elements.forEach(element => _configureElement(element, attributes, group));
    };
    const _configureElement = function (element, attributes, group) {
      if (element.tagName.toLowerCase() === 'select') {
        attributes.forEach(attribute => _addOptionToSelect(element, attribute, group));
      } else {
        attributes.forEach(attribute => _enableElementForAttribute(element, attribute, group));
      }
    };
    const _configureGroup = function (group) {
      const filteredAttributes = _filterAttributes(group.attributes.slice(), group) || group.attributes;
      _configureGroupElements(group, filteredAttributes);
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
      const mapNew = new google.maps.Map(mapBlock, mapOptions);
      console.log(mapNew);
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
const shop = window.shop || {};
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
})(shop);
document.addEventListener('DOMContentLoaded', function () {
  shop.init();
});

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









document.addEventListener('DOMContentLoaded', function () {
  new _scripts_cartInfo__WEBPACK_IMPORTED_MODULE_10__.CartInfo('/coreshop_get_cart_items', '.js-cart-widget');
  new _scripts_carousel__WEBPACK_IMPORTED_MODULE_9__.Carousel();
  console.log(_scripts_cartInfo__WEBPACK_IMPORTED_MODULE_10__.CartInfo);
  console.log(_scripts_carousel__WEBPACK_IMPORTED_MODULE_9__.Carousel);
});

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
      var mainSlider = new swiper__WEBPACK_IMPORTED_MODULE_0__["default"]('.js-slider', {
        modules: [swiper_modules__WEBPACK_IMPORTED_MODULE_1__.Thumbs],
        // Include the Thumbs module
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev'
        },
        thumbs: {
          swiper: sliderThumbnail // Link thumbnail swiper
        }
      });
      console.log(mainSlider);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLE1BQU0scUJBQXFCO1dBQzNCO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7O1dBRUE7V0FDQTtXQUNBOzs7OztVRWxEQTtVQUNBO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vLy4vanMvcGx1Z2luL2NvcmVzaG9wLnBsdWdpbi5xdWFudGl0eS5qcyIsIndlYnBhY2s6Ly8vLi9qcy9wbHVnaW4vY29yZXNob3AucGx1Z2luLnZhcmlhbnQuanMiLCJ3ZWJwYWNrOi8vLy4vanMvc2NyaXB0cy9oYW5kbGUtcHJvdG90eXBlcy5qcyIsIndlYnBhY2s6Ly8vLi9qcy9zY3JpcHRzL21hcC5qcyIsIndlYnBhY2s6Ly8vLi9qcy9zY3JpcHRzL3Nob3AuanMiLCJ3ZWJwYWNrOi8vLy4vanMvc2NyaXB0cy92YXJpYW50LmpzIiwid2VicGFjazovLy8uL2pzL2FwcC50cyIsIndlYnBhY2s6Ly8vLi9qcy9zY3JpcHRzL2Nhcm91c2VsLnRzIiwid2VicGFjazovLy8uL2pzL3NjcmlwdHMvY2FydEluZm8udHMiLCJ3ZWJwYWNrOi8vLy4vc2Nzcy9hcHAuc2NzcyIsIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9jaHVuayBsb2FkZWQiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9nbG9iYWwiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9qc29ucCBjaHVuayBsb2FkaW5nIiwid2VicGFjazovLy93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovLy93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIGNvcmVzaG9wUXVhbnRpdHlTZWxlY3RvcihvcHRpb25zKSB7XG4gICAgICAgIGluaXRRdWFudGl0eUZpZWxkcyhvcHRpb25zKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbml0UXVhbnRpdHlGaWVsZHMob3B0aW9ucykge1xuICAgICAgICBjb25zdCBmaWVsZHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dC5jcy11bml0LWlucHV0Jyk7XG4gICAgICAgIGNvbnN0IHByZWNpc2lvblByZXNldFNlbGVjdG9yID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcignc2VsZWN0LmNzLXVuaXQtc2VsZWN0b3InKTtcblxuICAgICAgICBpZihwcmVjaXNpb25QcmVzZXRTZWxlY3Rvcikge1xuICAgICAgICAgICAgLy8gTGlzdGVuIHRvIHVuaXQgZGVmaW5pdGlvbiBzZWxlY3RvclxuICAgICAgICAgICAgcHJlY2lzaW9uUHJlc2V0U2VsZWN0b3IuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5kYXRhc2V0LmNzVW5pdElkZW50aWZpZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBxdWFudGl0eUlkZW50aWZpZXIgPSB0aGlzLmRhdGFzZXQuY3NVbml0SWRlbnRpZmllcjtcbiAgICAgICAgICAgICAgICBjb25zdCBxdWFudGl0eUlucHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgaW5wdXRbZGF0YS1jcy11bml0LWlkZW50aWZpZXI9XCIke3F1YW50aXR5SWRlbnRpZmllcn1cIl1gKTtcblxuICAgICAgICAgICAgICAgIC8vIFNldCBzdGVwIHRvIDEgb3Igd2hhdGV2ZXIgaW50ZWdlciB2YWx1ZSB5b3Ugd2FudFxuICAgICAgICAgICAgICAgIGNvbnN0IHN0ZXAgPSAxOyAvLyBDaGFuZ2UgdGhpcyBpZiB5b3Ugd2FudCBhIGRpZmZlcmVudCBpbmNyZW1lbnRcblxuICAgICAgICAgICAgICAgIGlmICghcXVhbnRpdHlJbnB1dCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gVXNlIGludGVnZXIgc3RlcCBkaXJlY3RseVxuICAgICAgICAgICAgICAgIHF1YW50aXR5SW5wdXQuc3RlcCA9IHN0ZXA7IC8vIFNldCBzdGVwIGFzIGFuIGludGVnZXJcbiAgICAgICAgICAgICAgICBxdWFudGl0eUlucHV0LmRhdGFzZXQuY3NVbml0UHJlY2lzaW9uID0gMDsgLy8gT3B0aW9uYWwsIHNpbmNlIHByZWNpc2lvbiBpcyBubyBsb25nZXIgcmVsZXZhbnRcblxuICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSBpbnB1dCBzZXR0aW5nc1xuICAgICAgICAgICAgICAgIHVwZGF0ZVRvdWNoU3BpblNldHRpbmdzKHF1YW50aXR5SW5wdXQsIDAsIHN0ZXAudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGZpZWxkcykge1xuICAgICAgICAgICAgLy8gSW5pdGlhbGl6ZSBxdWFudGl0eSBmaWVsZHMgd2l0aCBpbnRlZ2VyIHN0ZXBcbiAgICAgICAgICAgIGZpZWxkcy5mb3JFYWNoKGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAgICAgICAgICAgIC8vIFlvdSBtaWdodCBub3QgbmVlZCBwcmVjaXNpb24gYW55bW9yZVxuICAgICAgICAgICAgICAgIGluaXRpYWxpemVUb3VjaFNwaW4oZmllbGQsIDAsICcxJywgb3B0aW9ucyk7IC8vIENoYW5nZSAnMScgdG8geW91ciBkZXNpcmVkIGludGVnZXIgaW5jcmVtZW50XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluaXRpYWxpemVUb3VjaFNwaW4oaW5wdXQsIHByZWNpc2lvbiwgc3RlcCwgb3B0aW9ucykge1xuICAgICAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ3RvdWNoc3Bpbi1jb250YWluZXInKTtcblxuICAgICAgICBjb25zdCBkZWNyZW1lbnRCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgZGVjcmVtZW50QnV0dG9uLnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgZGVjcmVtZW50QnV0dG9uLnRleHRDb250ZW50ID0gJy0nO1xuICAgICAgICBkZWNyZW1lbnRCdXR0b24uY2xhc3NMaXN0LmFkZCgndG91Y2hzcGluLWRlY3JlbWVudCcpO1xuXG4gICAgICAgIGNvbnN0IGluY3JlbWVudEJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICBpbmNyZW1lbnRCdXR0b24udHlwZSA9ICdidXR0b24nO1xuICAgICAgICBpbmNyZW1lbnRCdXR0b24udGV4dENvbnRlbnQgPSAnKyc7XG4gICAgICAgIGluY3JlbWVudEJ1dHRvbi5jbGFzc0xpc3QuYWRkKCd0b3VjaHNwaW4taW5jcmVtZW50Jyk7XG5cbiAgICAgICAgaW5wdXQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoY29udGFpbmVyLCBpbnB1dCk7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChkZWNyZW1lbnRCdXR0b24pO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoaW5wdXQpO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoaW5jcmVtZW50QnV0dG9uKTtcblxuICAgICAgICAvLyBTZXQgdXAgZXZlbnQgbGlzdGVuZXJzIGZvciBpbmNyZW1lbnQgYW5kIGRlY3JlbWVudFxuICAgICAgICBkZWNyZW1lbnRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBsZXQgdmFsdWUgPSBwYXJzZUludChpbnB1dC52YWx1ZSkgfHwgMDsgLy8gRW5zdXJlIHZhbHVlIGlzIGFuIGludGVnZXJcbiAgICAgICAgICAgIHZhbHVlIC09IHBhcnNlSW50KHN0ZXApOyAvLyBEZWNyZW1lbnQgYnkgaW50ZWdlciBzdGVwXG4gICAgICAgICAgICBpZiAodmFsdWUgPj0gMCkge1xuICAgICAgICAgICAgICAgIGlucHV0LnZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGluY3JlbWVudEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IHBhcnNlSW50KGlucHV0LnZhbHVlKSB8fCAwOyAvLyBFbnN1cmUgdmFsdWUgaXMgYW4gaW50ZWdlclxuICAgICAgICAgICAgdmFsdWUgKz0gcGFyc2VJbnQoc3RlcCk7IC8vIEluY3JlbWVudCBieSBpbnRlZ2VyIHN0ZXBcbiAgICAgICAgICAgIGlucHV0LnZhbHVlID0gdmFsdWU7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEFkZCBpbnB1dCB2YWxpZGF0aW9uIGJhc2VkIG9uIGludGVnZXIgdmFsdWVcbiAgICAgICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBsZXQgdmFsdWUgPSBwYXJzZUludChpbnB1dC52YWx1ZSk7XG4gICAgICAgICAgICBpZiAoaXNOYU4odmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgaW5wdXQudmFsdWUgPSAwOyAvLyBEZWZhdWx0IHRvIHplcm8gaWYgaW52YWxpZCBpbnB1dFxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpbnB1dC52YWx1ZSA9IHZhbHVlOyAvLyBLZWVwIGl0IGFzIGFuIGludGVnZXJcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlVG91Y2hTcGluU2V0dGluZ3MoaW5wdXQsIHByZWNpc2lvbiwgc3RlcCkge1xuICAgICAgICBpbnB1dC5taW4gPSAwO1xuICAgICAgICBpbnB1dC5tYXggPSAxMDAwMDAwMDAwO1xuICAgICAgICBpbnB1dC5zdGVwID0gc3RlcDtcbiAgICAgICAgaW5wdXQuZGF0YXNldC5jc1VuaXRQcmVjaXNpb24gPSBwcmVjaXNpb247XG4gICAgfVxuXG4gICAgLy8gRXhwb3J0IHRoZSBmdW5jdGlvbiB0byB0aGUgZ2xvYmFsIHNjb3BlXG4gICAgd2luZG93LmNvcmVzaG9wUXVhbnRpdHlTZWxlY3RvciA9IGNvcmVzaG9wUXVhbnRpdHlTZWxlY3Rvcjtcbn0pKCk7XG4iLCIoZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IGNvcmVzaG9wVmFyaWFudFNlbGVjdG9yID0gZnVuY3Rpb24gKGF0dHJpYnV0ZUNvbnRhaW5lcikge1xuICAgICAgICBsZXQgX2F0dHJpYnV0ZUNvbnRhaW5lciA9IG51bGw7XG4gICAgICAgIGxldCBfY29uZmlnID0ge307XG4gICAgICAgIGxldCBfYXR0cmlidXRlR3JvdXBzID0gW107XG5cbiAgICAgICAgY29uc3QgX2luaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoIWF0dHJpYnV0ZUNvbnRhaW5lcikgcmV0dXJuO1xuXG4gICAgICAgICAgICBfYXR0cmlidXRlQ29udGFpbmVyID0gYXR0cmlidXRlQ29udGFpbmVyO1xuICAgICAgICAgICAgX2NvbmZpZyA9IEpTT04ucGFyc2UoX2F0dHJpYnV0ZUNvbnRhaW5lci5kYXRhc2V0LmNvbmZpZyk7XG4gICAgICAgICAgICBfaW5pdGlhbGl6ZUF0dHJpYnV0ZUdyb3VwcygpO1xuICAgICAgICAgICAgX3NldHVwQXR0cmlidXRlR3JvdXBTZXR0aW5ncygpO1xuICAgICAgICAgICAgX3NldHVwQ2hhbmdlRXZlbnRzKCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgX2luaXRpYWxpemVBdHRyaWJ1dGVHcm91cHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfY29uZmlnLmF0dHJpYnV0ZXMuZm9yRWFjaCgoZ3JvdXApID0+IHtcbiAgICAgICAgICAgICAgICBncm91cC5lbGVtZW50cyA9IF9hdHRyaWJ1dGVDb250YWluZXIucXVlcnlTZWxlY3RvckFsbChgW2RhdGEtZ3JvdXA9XCIke2dyb3VwLmdyb3VwLmlkfVwiXWApO1xuICAgICAgICAgICAgICAgIF9hdHRyaWJ1dGVHcm91cHMucHVzaChncm91cCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfc2V0dXBBdHRyaWJ1dGVHcm91cFNldHRpbmdzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX2F0dHJpYnV0ZUdyb3Vwcy5mb3JFYWNoKChncm91cCwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgICBncm91cC5wcmV2R3JvdXAgPSBfYXR0cmlidXRlR3JvdXBzW2luZGV4IC0gMV0gfHwgbnVsbDtcbiAgICAgICAgICAgICAgICBncm91cC5uZXh0R3JvdXAgPSBfYXR0cmlidXRlR3JvdXBzW2luZGV4ICsgMV0gfHwgbnVsbDtcbiAgICAgICAgICAgICAgICBncm91cC5zZWxlY3RlZCA/IF9jb25maWd1cmVHcm91cChncm91cCkgOiBfY2xlYXJHcm91cChncm91cCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfc2V0dXBDaGFuZ2VFdmVudHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfYXR0cmlidXRlR3JvdXBzLmZvckVhY2goKGdyb3VwKSA9PiBfYXR0YWNoQ2hhbmdlRXZlbnQoZ3JvdXApKTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfYXR0YWNoQ2hhbmdlRXZlbnQgPSBmdW5jdGlvbiAoZ3JvdXApIHtcbiAgICAgICAgICAgIGdyb3VwLmVsZW1lbnRzLmZvckVhY2goKGVsZW1lbnQpID0+IHtcbiAgICAgICAgICAgICAgICBlbGVtZW50Lm9uY2hhbmdlID0gKCkgPT4gX2hhbmRsZUVsZW1lbnRDaGFuZ2UoZ3JvdXAsIGVsZW1lbnQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgX2hhbmRsZUVsZW1lbnRDaGFuZ2UgPSBmdW5jdGlvbiAoZ3JvdXAsIGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHdpbmRvdy52YXJpYW50UmVhZHkgPSBmYWxzZTtcbiAgICAgICAgICAgIF9hdHRyaWJ1dGVDb250YWluZXIuZGlzcGF0Y2hFdmVudChfY3JlYXRlRXZlbnQoJ2NoYW5nZScsIHsgZWxlbWVudCB9KSk7XG5cbiAgICAgICAgICAgIGlmIChlbGVtZW50LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgX3NlbGVjdEdyb3VwRWxlbWVudChncm91cCwgZWxlbWVudCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIF9kZXNlbGVjdEdyb3VwRWxlbWVudChncm91cCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHdpbmRvdy52YXJpYW50UmVhZHkgPSB0cnVlO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9zZWxlY3RHcm91cEVsZW1lbnQgPSBmdW5jdGlvbiAoZ3JvdXAsIGVsZW1lbnQpIHtcbiAgICAgICAgICAgIGdyb3VwLnNlbGVjdGVkID0gcGFyc2VJbnQoZWxlbWVudC52YWx1ZSk7XG4gICAgICAgICAgICBfYXR0cmlidXRlQ29udGFpbmVyLmRpc3BhdGNoRXZlbnQoX2NyZWF0ZUV2ZW50KCdzZWxlY3QnLCB7IGVsZW1lbnQgfSkpO1xuXG4gICAgICAgICAgICBpZiAoZ3JvdXAubmV4dEdyb3VwKSB7XG4gICAgICAgICAgICAgICAgX2NsZWFyR3JvdXBzKGdyb3VwLm5leHRHcm91cCk7XG4gICAgICAgICAgICAgICAgX2NvbmZpZ3VyZUdyb3VwKGdyb3VwLm5leHRHcm91cCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIF9hdHRyaWJ1dGVDb250YWluZXIuZGlzcGF0Y2hFdmVudChfY3JlYXRlRXZlbnQoJ3JlZGlyZWN0JywgeyBlbGVtZW50IH0pKTtcbiAgICAgICAgICAgICAgICBfcmVkaXJlY3RUb1ZhcmlhbnQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfZGVzZWxlY3RHcm91cEVsZW1lbnQgPSBmdW5jdGlvbiAoZ3JvdXApIHtcbiAgICAgICAgICAgIGRlbGV0ZSBncm91cC5zZWxlY3RlZDtcbiAgICAgICAgICAgIGlmIChncm91cC5uZXh0R3JvdXApIF9jbGVhckdyb3Vwcyhncm91cC5uZXh0R3JvdXApO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9yZWRpcmVjdFRvVmFyaWFudCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkQXR0cmlidXRlcyA9IF9nZXRTZWxlY3RlZEF0dHJpYnV0ZXMoKTtcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoaW5nUHJvZHVjdCA9IF9maW5kTWF0Y2hpbmdQcm9kdWN0KHNlbGVjdGVkQXR0cmlidXRlcyk7XG5cbiAgICAgICAgICAgIGlmIChtYXRjaGluZ1Byb2R1Y3Q/LnVybCkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gbWF0Y2hpbmdQcm9kdWN0LnVybDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfZ2V0U2VsZWN0ZWRBdHRyaWJ1dGVzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5mcm9tRW50cmllcyhcbiAgICAgICAgICAgICAgICBfYXR0cmlidXRlR3JvdXBzLmZpbHRlcigoZykgPT4gZy5zZWxlY3RlZCkubWFwKChnKSA9PiBbZy5ncm91cC5pZCwgZy5zZWxlY3RlZF0pXG4gICAgICAgICAgICApO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9maW5kTWF0Y2hpbmdQcm9kdWN0ID0gZnVuY3Rpb24gKHNlbGVjdGVkQXR0cmlidXRlcykge1xuICAgICAgICAgICAgcmV0dXJuIE9iamVjdC52YWx1ZXMoX2NvbmZpZy5pbmRleCkuZmluZCgocCkgPT5cbiAgICAgICAgICAgICAgICBKU09OLnN0cmluZ2lmeShwLmF0dHJpYnV0ZXMpID09PSBKU09OLnN0cmluZ2lmeShzZWxlY3RlZEF0dHJpYnV0ZXMpXG4gICAgICAgICAgICApO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9jcmVhdGVFdmVudCA9IGZ1bmN0aW9uIChuYW1lLCBkYXRhID0ge30pIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgQ3VzdG9tRXZlbnQoJ3ZhcmlhbnRfc2VsZWN0b3IuJyArIG5hbWUsIHtcbiAgICAgICAgICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNhbmNlbGFibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGRldGFpbDogZGF0YSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9jbGVhckdyb3VwRWxlbWVudHMgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgZWxlbWVudC5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgICBlbGVtZW50LmNoZWNrZWQgPSBmYWxzZTtcblxuICAgICAgICAgICAgaWYgKGVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnc2VsZWN0JykgX2NsZWFyU2VsZWN0T3B0aW9ucyhlbGVtZW50KTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfY2xlYXJTZWxlY3RPcHRpb25zID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IG9wdGlvbnMgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ29wdGlvbjpub3QoW3ZhbHVlPVwiXCJdKScpO1xuICAgICAgICAgICAgb3B0aW9ucy5mb3JFYWNoKChvcHRpb24pID0+IGVsZW1lbnQucmVtb3ZlQ2hpbGQob3B0aW9uKSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgX2NsZWFyR3JvdXAgPSBmdW5jdGlvbiAoZ3JvdXApIHtcbiAgICAgICAgICAgIGRlbGV0ZSBncm91cC5zZWxlY3RlZDtcbiAgICAgICAgICAgIGdyb3VwLmVsZW1lbnRzLmZvckVhY2goX2NsZWFyR3JvdXBFbGVtZW50cyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgX2NsZWFyR3JvdXBzID0gZnVuY3Rpb24gKGdyb3VwKSB7XG4gICAgICAgICAgICB3aGlsZSAoZ3JvdXApIHtcbiAgICAgICAgICAgICAgICBfY2xlYXJHcm91cChncm91cCk7XG4gICAgICAgICAgICAgICAgZ3JvdXAgPSBncm91cC5uZXh0R3JvdXA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgX2ZpbHRlckF0dHJpYnV0ZXMgPSBmdW5jdGlvbiAoYXR0cmlidXRlcywgZ3JvdXApIHtcbiAgICAgICAgICAgIGNvbnN0IGZpbHRlckF0dHJpYnV0ZXMgPSBfZ2V0RmlsdGVyQXR0cmlidXRlcyhncm91cCk7XG4gICAgICAgICAgICByZXR1cm4gYXR0cmlidXRlcy5maWx0ZXIoKGF0dHJpYnV0ZSkgPT5cbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGUucHJvZHVjdHMuc29tZSgocHJvZHVjdCkgPT4gX21hdGNoZXNBbGxGaWx0ZXJzKHByb2R1Y3QsIGZpbHRlckF0dHJpYnV0ZXMpKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfZ2V0RmlsdGVyQXR0cmlidXRlcyA9IGZ1bmN0aW9uIChncm91cCkge1xuICAgICAgICAgICAgY29uc3QgZmlsdGVyQXR0cmlidXRlcyA9IFtdO1xuICAgICAgICAgICAgbGV0IGN1cnJlbnRHcm91cCA9IGdyb3VwLnByZXZHcm91cDtcblxuICAgICAgICAgICAgd2hpbGUgKGN1cnJlbnRHcm91cCkge1xuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50R3JvdXAuc2VsZWN0ZWQgJiYgY3VycmVudEdyb3VwLm5leHRHcm91cCkge1xuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJBdHRyaWJ1dGVzLnB1c2goeyBncm91cDogY3VycmVudEdyb3VwLmdyb3VwLmlkLCBzZWxlY3RlZDogY3VycmVudEdyb3VwLnNlbGVjdGVkIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjdXJyZW50R3JvdXAgPSBjdXJyZW50R3JvdXAucHJldkdyb3VwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZmlsdGVyQXR0cmlidXRlcztcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfbWF0Y2hlc0FsbEZpbHRlcnMgPSBmdW5jdGlvbiAocHJvZHVjdCwgZmlsdGVyQXR0cmlidXRlcykge1xuICAgICAgICAgICAgcmV0dXJuIGZpbHRlckF0dHJpYnV0ZXMuZXZlcnkoKGZpbHRlcikgPT5cbiAgICAgICAgICAgICAgICBfY29uZmlnLmluZGV4W3Byb2R1Y3QuaWRdLmF0dHJpYnV0ZXM/LltmaWx0ZXIuZ3JvdXBdID09PSBmaWx0ZXIuc2VsZWN0ZWRcbiAgICAgICAgICAgICk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgX2FkZE9wdGlvblRvU2VsZWN0ID0gZnVuY3Rpb24gKGVsZW1lbnQsIGF0dHJpYnV0ZSwgZ3JvdXApIHtcbiAgICAgICAgICAgIGNvbnN0IG9wdGlvbiA9IG5ldyBPcHRpb24oYXR0cmlidXRlLmF0dHJpYnV0ZS5uYW1lLCBhdHRyaWJ1dGUuYXR0cmlidXRlLmlkKTtcbiAgICAgICAgICAgIG9wdGlvbi5pZCA9ICdhdHRyaWJ1dGUtJyArIGF0dHJpYnV0ZS5hdHRyaWJ1dGUuaWQ7XG4gICAgICAgICAgICBpZiAoZ3JvdXAuc2VsZWN0ZWQgPT09IGF0dHJpYnV0ZS5hdHRyaWJ1dGUuaWQpIG9wdGlvbi5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICBlbGVtZW50LmFkZChvcHRpb24pO1xuICAgICAgICAgICAgZWxlbWVudC5kaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9lbmFibGVFbGVtZW50Rm9yQXR0cmlidXRlID0gZnVuY3Rpb24gKGVsZW1lbnQsIGF0dHJpYnV0ZSwgZ3JvdXApIHtcbiAgICAgICAgICAgIGlmIChwYXJzZUludChlbGVtZW50LmRhdGFzZXQuZ3JvdXApID09PSBncm91cC5ncm91cC5pZCAmJiBwYXJzZUludChlbGVtZW50LnZhbHVlKSA9PT0gYXR0cmlidXRlLmF0dHJpYnV0ZS5pZCkge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAoZ3JvdXAuc2VsZWN0ZWQgPT09IGF0dHJpYnV0ZS5hdHRyaWJ1dGUuaWQpIGVsZW1lbnQuY2hlY2tlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgX2NvbmZpZ3VyZUdyb3VwRWxlbWVudHMgPSBmdW5jdGlvbiAoZ3JvdXAsIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgICAgIGdyb3VwLmVsZW1lbnRzLmZvckVhY2goKGVsZW1lbnQpID0+XG4gICAgICAgICAgICAgICAgX2NvbmZpZ3VyZUVsZW1lbnQoZWxlbWVudCwgYXR0cmlidXRlcywgZ3JvdXApXG4gICAgICAgICAgICApO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9jb25maWd1cmVFbGVtZW50ID0gZnVuY3Rpb24gKGVsZW1lbnQsIGF0dHJpYnV0ZXMsIGdyb3VwKSB7XG4gICAgICAgICAgICBpZiAoZWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdzZWxlY3QnKSB7XG4gICAgICAgICAgICAgICAgYXR0cmlidXRlcy5mb3JFYWNoKChhdHRyaWJ1dGUpID0+IF9hZGRPcHRpb25Ub1NlbGVjdChlbGVtZW50LCBhdHRyaWJ1dGUsIGdyb3VwKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMuZm9yRWFjaCgoYXR0cmlidXRlKSA9PiBfZW5hYmxlRWxlbWVudEZvckF0dHJpYnV0ZShlbGVtZW50LCBhdHRyaWJ1dGUsIGdyb3VwKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgX2NvbmZpZ3VyZUdyb3VwID0gZnVuY3Rpb24gKGdyb3VwKSB7XG4gICAgICAgICAgICBjb25zdCBmaWx0ZXJlZEF0dHJpYnV0ZXMgPSBfZmlsdGVyQXR0cmlidXRlcyhncm91cC5hdHRyaWJ1dGVzLnNsaWNlKCksIGdyb3VwKSB8fCBncm91cC5hdHRyaWJ1dGVzO1xuICAgICAgICAgICAgX2NvbmZpZ3VyZUdyb3VwRWxlbWVudHMoZ3JvdXAsIGZpbHRlcmVkQXR0cmlidXRlcyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgX2luaXQoKTtcbiAgICB9O1xuXG4gICAgd2luZG93LmNvcmVzaG9wVmFyaWFudFNlbGVjdG9yID0gY29yZXNob3BWYXJpYW50U2VsZWN0b3I7XG59KSgpO1xuIiwiKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBjb25zdCBtZXRob2RzID0ge1xuICAgICAgICBpbml0OiBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgICAgICAgY29uc3Qgc2V0dGluZ3MgPSB7XG4gICAgICAgICAgICAgICAgcHJvdG90eXBlUHJlZml4OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjb250YWluZXJTZWxlY3RvcjogZmFsc2UsXG4gICAgICAgICAgICAgICAgc2VsZWN0b3JBdHRyOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zIC8vIFVzaW5nIG9iamVjdCBzcHJlYWQgaGVyZVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgZWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuc2VsZWN0b3IpO1xuICAgICAgICAgICAgZWxlbWVudHMuZm9yRWFjaChlbGVtZW50ID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3coZWxlbWVudCwgc2V0dGluZ3MsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaG93KGVsZW1lbnQsIHNldHRpbmdzLCB0cnVlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNob3c6IGZ1bmN0aW9uIChlbGVtZW50LCBzZXR0aW5ncywgcmVwbGFjZSkge1xuICAgICAgICAgICAgbGV0IHNlbGVjdGVkVmFsdWUgPSBlbGVtZW50LnZhbHVlO1xuICAgICAgICAgICAgbGV0IHByb3RvdHlwZVByZWZpeCA9IGVsZW1lbnQuaWQ7XG5cbiAgICAgICAgICAgIGlmIChzZXR0aW5ncy5zZWxlY3RvckF0dHIpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzZWxlY3RlZE9wdGlvbiA9IEFycmF5LmZyb20oZWxlbWVudC5vcHRpb25zKS5maW5kKG9wdGlvbiA9PiBvcHRpb24udmFsdWUgPT09IHNlbGVjdGVkVmFsdWUpO1xuICAgICAgICAgICAgICAgIGlmIChzZWxlY3RlZE9wdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZFZhbHVlID0gc2VsZWN0ZWRPcHRpb24uZ2V0QXR0cmlidXRlKHNldHRpbmdzLnNlbGVjdG9yQXR0cik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoc2V0dGluZ3MucHJvdG90eXBlUHJlZml4KSB7XG4gICAgICAgICAgICAgICAgcHJvdG90eXBlUHJlZml4ID0gc2V0dGluZ3MucHJvdG90eXBlUHJlZml4O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBwcm90b3R5cGVFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYCR7cHJvdG90eXBlUHJlZml4fV8ke3NlbGVjdGVkVmFsdWV9YCk7XG4gICAgICAgICAgICBsZXQgY29udGFpbmVyID0gdGhpcy5nZXRDb250YWluZXIoc2V0dGluZ3MsIHByb3RvdHlwZUVsZW1lbnQpO1xuXG4gICAgICAgICAgICBpZiAoIWNvbnRhaW5lcikge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFwcm90b3R5cGVFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyLmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHJlcGxhY2UgfHwgIWNvbnRhaW5lci5pbm5lckhUTUwudHJpbSgpKSB7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyLmlubmVySFRNTCA9IHByb3RvdHlwZUVsZW1lbnQuZGF0YXNldC5wcm90b3R5cGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Q29udGFpbmVyOiBmdW5jdGlvbiAoc2V0dGluZ3MsIHByb3RvdHlwZUVsZW1lbnQpIHtcbiAgICAgICAgICAgIGlmIChzZXR0aW5ncy5jb250YWluZXJTZWxlY3Rvcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNldHRpbmdzLmNvbnRhaW5lclNlbGVjdG9yKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZGF0YUNvbnRhaW5lcklkID0gcHJvdG90eXBlRWxlbWVudCA/IHByb3RvdHlwZUVsZW1lbnQuZGF0YXNldC5jb250YWluZXIgOiBudWxsO1xuICAgICAgICAgICAgICAgIHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChkYXRhQ29udGFpbmVySWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIEV4dGVuZGluZyB0aGUgcHJvdG90eXBlIG9mIE5vZGVMaXN0XG4gICAgTm9kZUxpc3QucHJvdG90eXBlLmhhbmRsZVByb3RvdHlwZXMgPSBmdW5jdGlvbiAobWV0aG9kKSB7XG4gICAgICAgIGlmIChtZXRob2RzW21ldGhvZF0pIHtcbiAgICAgICAgICAgIHJldHVybiBtZXRob2RzW21ldGhvZF0uYXBwbHkodGhpcywgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG1ldGhvZCA9PT0gJ29iamVjdCcgfHwgIW1ldGhvZCkge1xuICAgICAgICAgICAgcmV0dXJuIG1ldGhvZHMuaW5pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNZXRob2QgJyArIG1ldGhvZCArICcgZG9lcyBub3QgZXhpc3Qgb24gaGFuZGxlUHJvdG90eXBlcycpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIFRvIGFsbG93IGNhbGxpbmcgaGFuZGxlUHJvdG90eXBlcyBkaXJlY3RseSBvbiBhbnkgZWxlbWVudFxuICAgIEhUTUxFbGVtZW50LnByb3RvdHlwZS5oYW5kbGVQcm90b3R5cGVzID0gZnVuY3Rpb24gKG1ldGhvZCkge1xuICAgICAgICByZXR1cm4gbWV0aG9kcy5oYW5kbGVQcm90b3R5cGVzLmNhbGwoW3RoaXNdLCBtZXRob2QpO1xuICAgIH07XG5cbn0oKSk7XG4iLCJkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IG1hcEJsb2NrID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hcC1ibG9jaycpO1xuXG4gICAgaWYgKG1hcEJsb2NrKSB7XG4gICAgICAgIG1hcEJsb2NrLnN0eWxlLmhlaWdodCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYXAtd3JhcHBlcicpLmNsaWVudEhlaWdodCArICdweCc7XG5cbiAgICAgICAgZnVuY3Rpb24gaW5pdGlhbGl6ZSgpIHtcbiAgICAgICAgICAgIGNvbnN0IG1hcE9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgem9vbTogMTgsXG4gICAgICAgICAgICAgICAgY2VudGVyOiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKDQ4LjE1OTI1MTMsIDE0LjAyMzAyNTEwMDAwMDA0KSxcbiAgICAgICAgICAgICAgICBkaXNhYmxlRGVmYXVsdFVJOiB0cnVlXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3QgbWFwTmV3ID0gbmV3IGdvb2dsZS5tYXBzLk1hcChtYXBCbG9jaywgbWFwT3B0aW9ucyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhtYXBOZXcpO1xuICAgICAgICB9XG5cbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBpbml0aWFsaXplKTtcbiAgICB9XG59KTtcbiIsImNvbnN0IHNob3AgPSB3aW5kb3cuc2hvcCB8fCB7fTtcblxuKGZ1bmN0aW9uIChzaG9wKSB7XG4gICAgc2hvcC5pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBzaG9wLmluaXRDaGFuZ2VBZGRyZXNzKCk7XG4gICAgICAgIHNob3AuaW5pdENhcnRTaGlwbWVudENhbGN1bGF0b3IoKTtcbiAgICAgICAgc2hvcC5pbml0UXVhbnRpdHlWYWxpZGF0b3IoKTtcbiAgICAgICAgc2hvcC5pbml0Q2F0ZWdvcnlTZWxlY3QoKTtcblxuICAgICAgICBoYW5kbGVQcm90b3R5cGVzKHtcbiAgICAgICAgICAgICdwcm90b3R5cGVQcmVmaXgnOiAncGF5bWVudFByb3ZpZGVyJyxcbiAgICAgICAgICAgICdjb250YWluZXJTZWxlY3Rvcic6ICcucGF5bWVudFNldHRpbmdzJyxcbiAgICAgICAgICAgICdzZWxlY3RvckF0dHInOiAnZGF0YS1mYWN0b3J5J1xuICAgICAgICB9KTtcblxuICAgICAgICBzZXR1cENvcHlUb0NsaXBib2FyZCgpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVQcm90b3R5cGVzKG9wdGlvbnMpIHtcbiAgICAgICAgY29uc3Qgc2V0dGluZ3MgPSB7XG4gICAgICAgICAgICBwcm90b3R5cGVQcmVmaXg6IG9wdGlvbnMucHJvdG90eXBlUHJlZml4IHx8IGZhbHNlLFxuICAgICAgICAgICAgY29udGFpbmVyU2VsZWN0b3I6IG9wdGlvbnMuY29udGFpbmVyU2VsZWN0b3IgfHwgZmFsc2UsXG4gICAgICAgICAgICBzZWxlY3RvckF0dHI6IG9wdGlvbnMuc2VsZWN0b3JBdHRyIHx8IGZhbHNlXG4gICAgICAgIH07XG5cbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChgW2RhdGEtJHtzZXR0aW5ncy5wcm90b3R5cGVQcmVmaXh9XWApLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHNob3dFbGVtZW50KGVsZW1lbnQsIGZhbHNlKTtcbiAgICAgICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNob3dFbGVtZW50KGVsZW1lbnQsIHRydWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZ1bmN0aW9uIHNob3dFbGVtZW50KGVsZW1lbnQsIHJlcGxhY2UpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkVmFsdWUgPSBnZXRTZWxlY3RlZFZhbHVlKGVsZW1lbnQpO1xuICAgICAgICAgICAgY29uc3QgcHJvdG90eXBlUHJlZml4ID0gc2V0dGluZ3MucHJvdG90eXBlUHJlZml4IHx8IGVsZW1lbnQuaWQ7XG4gICAgICAgICAgICBjb25zdCBwcm90b3R5cGVFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYCR7cHJvdG90eXBlUHJlZml4fV8ke3NlbGVjdGVkVmFsdWV9YCk7XG4gICAgICAgICAgICBjb25zdCBjb250YWluZXIgPSBnZXRDb250YWluZXIocHJvdG90eXBlRWxlbWVudCk7XG5cbiAgICAgICAgICAgIGlmIChjb250YWluZXIgJiYgKHJlcGxhY2UgfHwgIWNvbnRhaW5lci5pbm5lckhUTUwudHJpbSgpKSkge1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSBwcm90b3R5cGVFbGVtZW50ID8gcHJvdG90eXBlRWxlbWVudC5kYXRhc2V0LnByb3RvdHlwZSA6ICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZ2V0U2VsZWN0ZWRWYWx1ZShlbGVtZW50KSB7XG4gICAgICAgICAgICBpZiAoc2V0dGluZ3Muc2VsZWN0b3JBdHRyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQucXVlcnlTZWxlY3RvcihgW3ZhbHVlPVwiJHtlbGVtZW50LnZhbHVlfVwiXWApLmdldEF0dHJpYnV0ZShzZXR0aW5ncy5zZWxlY3RvckF0dHIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQudmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBnZXRDb250YWluZXIocHJvdG90eXBlRWxlbWVudCkge1xuICAgICAgICAgICAgaWYgKHNldHRpbmdzLmNvbnRhaW5lclNlbGVjdG9yKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2V0dGluZ3MuY29udGFpbmVyU2VsZWN0b3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb3RvdHlwZUVsZW1lbnQgPyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHByb3RvdHlwZUVsZW1lbnQuZGF0YXNldC5jb250YWluZXIpIDogbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNldHVwQ29weVRvQ2xpcGJvYXJkKCkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY29weS10by1jbGlwYm9hcmQnKS5mb3JFYWNoKGZ1bmN0aW9uIChidXR0b24pIHtcbiAgICAgICAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGNvcHlUZXh0VG9DbGlwYm9hcmQodGhpcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29weVRleHRUb0NsaXBib2FyZChidXR0b24pIHtcbiAgICAgICAgY29uc3QgdGFyZ2V0SWQgPSBidXR0b24uZGF0YXNldC50YXJnZXQ7XG4gICAgICAgIGNvbnN0IGNvcHlUZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGFyZ2V0SWQpO1xuXG4gICAgICAgIGlmIChjb3B5VGV4dCkge1xuICAgICAgICAgICAgY29weVRleHQuc2VsZWN0KCk7XG4gICAgICAgICAgICBjb3B5VGV4dC5zZXRTZWxlY3Rpb25SYW5nZSgwLCA5OTk5OSk7IC8vIEZvciBtb2JpbGUgZGV2aWNlc1xuXG4gICAgICAgICAgICBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChjb3B5VGV4dC52YWx1ZSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYnV0dG9uLmRhdGFzZXQuY29waWVkVGV4dCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNob3AuaW5pdENhdGVnb3J5U2VsZWN0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnNpdGUtcmVsb2FkXCIpLmZvckVhY2goZnVuY3Rpb24gKHNlbGVjdCkge1xuICAgICAgICAgICAgc2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSB1cGRhdGVRdWVyeVN0cmluZ1BhcmFtZXRlcih3aW5kb3cubG9jYXRpb24uaHJlZiwgdGhpcy5uYW1lLCB0aGlzLnZhbHVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gdXBkYXRlUXVlcnlTdHJpbmdQYXJhbWV0ZXIodXJpLCBrZXksIHZhbHVlKSB7XG4gICAgICAgIGNvbnN0IHJlID0gbmV3IFJlZ0V4cChcIihbPyZdKVwiICsga2V5ICsgXCI9Lio/KCZ8JClcIiwgXCJpXCIpO1xuICAgICAgICBjb25zdCBzZXBhcmF0b3IgPSB1cmkuaW5kZXhPZignPycpICE9PSAtMSA/IFwiJlwiIDogXCI/XCI7XG4gICAgICAgIHJldHVybiB1cmkubWF0Y2gocmUpID8gdXJpLnJlcGxhY2UocmUsICckMScgKyBrZXkgKyBcIj1cIiArIHZhbHVlICsgJyQyJykgOiB1cmkgKyBzZXBhcmF0b3IgKyBrZXkgKyBcIj1cIiArIHZhbHVlO1xuICAgIH1cblxuICAgIHNob3AuaW5pdFF1YW50aXR5VmFsaWRhdG9yID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBjb3Jlc2hvcFF1YW50aXR5U2VsZWN0b3Ioe1xuICAgICAgICAgICAgYnV0dG9uZG93bl9jbGFzczogJ2J0biBidG4tc2Vjb25kYXJ5JyxcbiAgICAgICAgICAgIGJ1dHRvbnVwX2NsYXNzOiAnYnRuIGJ0bi1zZWNvbmRhcnknLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgc2hvcC5pbml0Q2FydFNoaXBtZW50Q2FsY3VsYXRvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICBjb25zdCBmb3JtID0gZXYudGFyZ2V0LmNsb3Nlc3QoJ2Zvcm1bbmFtZT1cImNvcmVzaG9wX3NoaXBwaW5nX2NhbGN1bGF0b3JcIl0nKTtcbiAgICAgICAgICAgIGlmIChmb3JtKSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlU2hpcG1lbnRDYWxjdWxhdGlvbihmb3JtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGhhbmRsZVNoaXBtZW50Q2FsY3VsYXRpb24oZm9ybSkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBmb3JtLmNsYXNzTGlzdC5hZGQoJ2xvYWRpbmcnKTtcbiAgICAgICAgZm9ybS5xdWVyeVNlbGVjdG9yKCdidXR0b25bdHlwZT1cInN1Ym1pdFwiXScpLnNldEF0dHJpYnV0ZSgnZGlzYWJsZWQnLCAnZGlzYWJsZWQnKTtcbiAgICAgICAgZm9ybS5jbG9zZXN0KCcuY2FydC1zaGlwbWVudC1jYWxjdWxhdGlvbi1ib3gnKS5xdWVyeVNlbGVjdG9yKCcuY2FydC1zaGlwbWVudC1hdmFpbGFibGUtY2FycmllcnMnKS5zdHlsZS5vcGFjaXR5ID0gMC4yO1xuXG4gICAgICAgIGZldGNoKGZvcm0uYWN0aW9uLCB7XG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIGJvZHk6IG5ldyBVUkxTZWFyY2hQYXJhbXMobmV3IEZvcm1EYXRhKGZvcm0pKVxuICAgICAgICB9KVxuICAgICAgICAudGhlbihyZXNwb25zZSA9PiByZXNwb25zZS50ZXh0KCkpXG4gICAgICAgIC50aGVuKHJlcyA9PiB1cGRhdGVTaGlwbWVudENhbGN1bGF0aW9uKGZvcm0sIHJlcykpXG4gICAgICAgIC5jYXRjaChlcnJvciA9PiBoYW5kbGVTaGlwbWVudEVycm9yKGZvcm0sIGVycm9yKSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlU2hpcG1lbnRDYWxjdWxhdGlvbihmb3JtLCByZXNwb25zZVRleHQpIHtcbiAgICAgICAgZm9ybS5jbGFzc0xpc3QucmVtb3ZlKCdsb2FkaW5nJyk7XG4gICAgICAgIGZvcm0uY2xvc2VzdCgnLmNhcnQtc2hpcG1lbnQtY2FsY3VsYXRpb24tYm94Jykub3V0ZXJIVE1MID0gcmVzcG9uc2VUZXh0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhhbmRsZVNoaXBtZW50RXJyb3IoZm9ybSwgZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3I6JywgZXJyb3IpO1xuICAgICAgICBmb3JtLmNsYXNzTGlzdC5yZW1vdmUoJ2xvYWRpbmcnKTtcbiAgICAgICAgZm9ybS5xdWVyeVNlbGVjdG9yKCdidXR0b25bdHlwZT1cInN1Ym1pdFwiXScpLnJlbW92ZUF0dHJpYnV0ZSgnZGlzYWJsZWQnKTtcbiAgICB9XG5cbiAgICBzaG9wLmluaXRDaGFuZ2VBZGRyZXNzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zdCBhZGRyZXNzU3RlcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jaGVja291dC1zdGVwLnN0ZXAtYWRkcmVzcycpO1xuICAgICAgICBpZiAoIWFkZHJlc3NTdGVwKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgaW52b2ljZUFkZHJlc3MgPSBhZGRyZXNzU3RlcC5xdWVyeVNlbGVjdG9yKCdzZWxlY3RbbmFtZT1cImNvcmVzaG9wW2ludm9pY2VBZGRyZXNzXVwiXScpO1xuICAgICAgICBjb25zdCBzaGlwcGluZ0FkZHJlc3MgPSBhZGRyZXNzU3RlcC5xdWVyeVNlbGVjdG9yKCdzZWxlY3RbbmFtZT1cImNvcmVzaG9wW3NoaXBwaW5nQWRkcmVzc11cIl0nKTtcbiAgICAgICAgY29uc3QgdXNlSWFzUyA9IGFkZHJlc3NTdGVwLnF1ZXJ5U2VsZWN0b3IoJ1tuYW1lPVwiY29yZXNob3BbdXNlSW52b2ljZUFzU2hpcHBpbmddXCJdJyk7XG5cbiAgICAgICAgc2V0dXBBZGRyZXNzQ2hhbmdlRXZlbnRzKGludm9pY2VBZGRyZXNzLCBzaGlwcGluZ0FkZHJlc3MsIHVzZUlhc1MpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBzZXR1cEFkZHJlc3NDaGFuZ2VFdmVudHMoaW52b2ljZUFkZHJlc3MsIHNoaXBwaW5nQWRkcmVzcywgdXNlSWFzUykge1xuICAgICAgICBpbnZvaWNlQWRkcmVzcy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB1cGRhdGVBZGRyZXNzKGludm9pY2VBZGRyZXNzLCB1c2VJYXNTKSk7XG4gICAgICAgIHNoaXBwaW5nQWRkcmVzcy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB1cGRhdGVTaGlwcGluZ0FkZHJlc3Moc2hpcHBpbmdBZGRyZXNzKSk7XG4gICAgICAgIGlmICh1c2VJYXNTKSB1c2VJYXNTLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHRvZ2dsZVNoaXBwaW5nQWRkcmVzcyh1c2VJYXNTLCBpbnZvaWNlQWRkcmVzcywgc2hpcHBpbmdBZGRyZXNzKSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlQWRkcmVzcyhpbnZvaWNlQWRkcmVzcywgdXNlSWFzUykge1xuICAgICAgICBjb25zdCBzZWxlY3RlZCA9IGludm9pY2VBZGRyZXNzLm9wdGlvbnNbaW52b2ljZUFkZHJlc3Muc2VsZWN0ZWRJbmRleF07XG4gICAgICAgIGNvbnN0IGFkZHJlc3MgPSBKU09OLnBhcnNlKHNlbGVjdGVkLmRhdGFzZXQuYWRkcmVzcykuaHRtbDtcbiAgICAgICAgY29uc3QgaW52b2ljZVBhbmVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnBhbmVsLWludm9pY2UtYWRkcmVzcycpO1xuICAgICAgICBpbnZvaWNlUGFuZWwuaW5uZXJIVE1MID0gYWRkcmVzcyB8fCAnJztcblxuICAgICAgICB0b2dnbGVVc2VBc1NoaXBwaW5nKHVzZUlhc1MsIHNlbGVjdGVkLmRhdGFzZXQuYWRkcmVzc1R5cGUgPT09ICdpbnZvaWNlJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdG9nZ2xlVXNlQXNTaGlwcGluZyh1c2VJYXNTLCBpc0ludm9pY2VUeXBlKSB7XG4gICAgICAgIGlmICh1c2VJYXNTKSB7XG4gICAgICAgICAgICB1c2VJYXNTLmRpc2FibGVkID0gaXNJbnZvaWNlVHlwZTtcbiAgICAgICAgICAgIGlmIChpc0ludm9pY2VUeXBlKSB7XG4gICAgICAgICAgICAgICAgdXNlSWFzUy5jaGVja2VkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdXNlSWFzUy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnY2hhbmdlJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlU2hpcHBpbmdBZGRyZXNzKHNoaXBwaW5nQWRkcmVzcykge1xuICAgICAgICBjb25zdCBzZWxlY3RlZCA9IHNoaXBwaW5nQWRkcmVzcy5vcHRpb25zW3NoaXBwaW5nQWRkcmVzcy5zZWxlY3RlZEluZGV4XTtcbiAgICAgICAgY29uc3QgYWRkcmVzcyA9IEpTT04ucGFyc2Uoc2VsZWN0ZWQuZGF0YXNldC5hZGRyZXNzKS5odG1sO1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucGFuZWwtc2hpcHBpbmctYWRkcmVzcycpLmlubmVySFRNTCA9IGFkZHJlc3MgfHwgJyc7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdG9nZ2xlU2hpcHBpbmdBZGRyZXNzKHVzZUlhc1MsIGludm9pY2VBZGRyZXNzLCBzaGlwcGluZ0FkZHJlc3MpIHtcbiAgICAgICAgY29uc3Qgc2hpcHBpbmdGaWVsZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zaGlwcGluZy1hZGRyZXNzLXNlbGVjdG9yJyk7XG4gICAgICAgIGNvbnN0IHNoaXBwaW5nQWRkQWRkcmVzc0J1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jYXJkLWZvb3RlcicpO1xuXG4gICAgICAgIGlmICh1c2VJYXNTLmNoZWNrZWQpIHtcbiAgICAgICAgICAgIHNoaXBwaW5nRmllbGQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgIHNoaXBwaW5nQWRkcmVzcy52YWx1ZSA9IGludm9pY2VBZGRyZXNzLnZhbHVlO1xuICAgICAgICAgICAgc2hpcHBpbmdBZGRyZXNzLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdjaGFuZ2UnKSk7XG4gICAgICAgICAgICBpZiAoc2hpcHBpbmdBZGRBZGRyZXNzQnV0dG9uKSBzaGlwcGluZ0FkZEFkZHJlc3NCdXR0b24uY2xhc3NMaXN0LmFkZCgnZC1ub25lJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzaGlwcGluZ0ZpZWxkLnN0eWxlLmRpc3BsYXkgPSAnJztcbiAgICAgICAgICAgIGlmIChzaGlwcGluZ0FkZEFkZHJlc3NCdXR0b24pIHNoaXBwaW5nQWRkQWRkcmVzc0J1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKCdkLW5vbmUnKTtcbiAgICAgICAgfVxuICAgIH1cblxufShzaG9wKSk7XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgc2hvcC5pbml0KCk7XG59KTtcbiIsIihmdW5jdGlvbiAodmFyaWFudCkge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHdpbmRvdy52YXJpYW50UmVhZHkgPSBmYWxzZTtcblxuICAgICAgICB2YXJpYW50LmluaXQoKTtcblxuICAgICAgICB3aW5kb3cudmFyaWFudFJlYWR5ID0gdHJ1ZTtcbiAgICB9KTtcblxuICAgIHZhcmlhbnQuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29uc3QgdmFyaWFudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucHJvZHVjdC1pbmZvX19hdHRyaWJ1dGVzJyk7XG4gICAgICAgIGlmICghdmFyaWFudHMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvcmVzaG9wVmFyaWFudFNlbGVjdG9yKHZhcmlhbnRzKTsgLy8gRW5zdXJlIHRoaXMgZnVuY3Rpb24gaXMgZGVmaW5lZCBpbiB5b3VyIGdsb2JhbCBzY29wZVxuXG4gICAgICAgIHZhcmlhbnRzLmFkZEV2ZW50TGlzdGVuZXIoJ3ZhcmlhbnRfc2VsZWN0b3Iuc2VsZWN0JywgKGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG9wdGlvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucHJvZHVjdC1pbmZvIC5wcm9kdWN0LWRldGFpbHMgLm9wdGlvbnMnKTtcblxuICAgICAgICAgICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzdWJtaXRzID0gb3B0aW9ucy5xdWVyeVNlbGVjdG9yQWxsKCdbdHlwZT1cInN1Ym1pdFwiXScpO1xuXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5jbGFzc0xpc3QuYWRkKCdkaXNhYmxlZCcpO1xuXG4gICAgICAgICAgICAgICAgc3VibWl0cy5mb3JFYWNoKChzdWJtaXQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgc3VibWl0LmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcbn0od2luZG93LnZhcmlhbnQgfHwgKHdpbmRvdy52YXJpYW50ID0ge30pKSk7IC8vIEV4dHJhY3RlZCBhc3NpZ25tZW50XG4iLCIvKiBTVFlMRVMgICovXG5pbXBvcnQgJy4uL3Njc3MvYXBwLnNjc3MnO1xuaW1wb3J0ICdzd2lwZXIvY3NzL2J1bmRsZSc7XG4vKiBKUyAqL1xuaW1wb3J0ICdib290c3RyYXAnO1xuaW1wb3J0ICcuL3NjcmlwdHMvaGFuZGxlLXByb3RvdHlwZXMuanMnO1xuaW1wb3J0ICcuL3BsdWdpbi9jb3Jlc2hvcC5wbHVnaW4ucXVhbnRpdHkuanMnO1xuaW1wb3J0ICcuL3BsdWdpbi9jb3Jlc2hvcC5wbHVnaW4udmFyaWFudC5qcyc7XG5pbXBvcnQgJy4vc2NyaXB0cy9zaG9wLmpzJztcbmltcG9ydCAnLi9zY3JpcHRzL3ZhcmlhbnQuanMnO1xuaW1wb3J0ICcuL3NjcmlwdHMvbWFwLmpzJztcbmltcG9ydCB7IENhcm91c2VsIH0gZnJvbSAnLi9zY3JpcHRzL2Nhcm91c2VsJztcbmltcG9ydCB7IENhcnRJbmZvIH0gZnJvbSAnLi9zY3JpcHRzL2NhcnRJbmZvJztcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgbmV3IENhcnRJbmZvKCcvY29yZXNob3BfZ2V0X2NhcnRfaXRlbXMnLCAnLmpzLWNhcnQtd2lkZ2V0Jyk7XG4gICAgbmV3IENhcm91c2VsKCk7XG4gICAgY29uc29sZS5sb2coQ2FydEluZm8pO1xuICAgIGNvbnNvbGUubG9nKENhcm91c2VsKTtcbn0pO1xuIiwiaW1wb3J0IFN3aXBlciBmcm9tICdzd2lwZXInO1xuaW1wb3J0IHsgVGh1bWJzIH0gZnJvbSBcInN3aXBlci9tb2R1bGVzXCI7XG52YXIgQ2Fyb3VzZWwgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQ2Fyb3VzZWwoKSB7XG4gICAgICAgIHRoaXMuX2luaXRDYXJvdXNlbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8qIEluaXQgc3dpcGVyIHdpdGggdGh1bWJzICovXG4gICAgICAgICAgICB2YXIgc2xpZGVyVGh1bWJuYWlsID0gbmV3IFN3aXBlcignLmpzLXNsaWRlci10aHVtYm5haWwnLCB7XG4gICAgICAgICAgICAgICAgc2xpZGVzUGVyVmlldzogMyxcbiAgICAgICAgICAgICAgICBmcmVlTW9kZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzcGFjZUJldHdlZW46ICc4cHgnLFxuICAgICAgICAgICAgICAgIHdhdGNoU2xpZGVzUHJvZ3Jlc3M6IHRydWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciBtYWluU2xpZGVyID0gbmV3IFN3aXBlcignLmpzLXNsaWRlcicsIHtcbiAgICAgICAgICAgICAgICBtb2R1bGVzOiBbVGh1bWJzXSwgLy8gSW5jbHVkZSB0aGUgVGh1bWJzIG1vZHVsZVxuICAgICAgICAgICAgICAgIG5hdmlnYXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgbmV4dEVsOiAnLnN3aXBlci1idXR0b24tbmV4dCcsXG4gICAgICAgICAgICAgICAgICAgIHByZXZFbDogJy5zd2lwZXItYnV0dG9uLXByZXYnLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGh1bWJzOiB7XG4gICAgICAgICAgICAgICAgICAgIHN3aXBlcjogc2xpZGVyVGh1bWJuYWlsIC8vIExpbmsgdGh1bWJuYWlsIHN3aXBlclxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc29sZS5sb2cobWFpblNsaWRlcik7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuX2luaXRDYXJvdXNlbCgpO1xuICAgIH1cbiAgICByZXR1cm4gQ2Fyb3VzZWw7XG59KCkpO1xuZXhwb3J0IHsgQ2Fyb3VzZWwgfTtcbiIsInZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xudmFyIF9fZ2VuZXJhdG9yID0gKHRoaXMgJiYgdGhpcy5fX2dlbmVyYXRvcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIGJvZHkpIHtcbiAgICB2YXIgXyA9IHsgbGFiZWw6IDAsIHNlbnQ6IGZ1bmN0aW9uKCkgeyBpZiAodFswXSAmIDEpIHRocm93IHRbMV07IHJldHVybiB0WzFdOyB9LCB0cnlzOiBbXSwgb3BzOiBbXSB9LCBmLCB5LCB0LCBnID0gT2JqZWN0LmNyZWF0ZSgodHlwZW9mIEl0ZXJhdG9yID09PSBcImZ1bmN0aW9uXCIgPyBJdGVyYXRvciA6IE9iamVjdCkucHJvdG90eXBlKTtcbiAgICByZXR1cm4gZy5uZXh0ID0gdmVyYigwKSwgZ1tcInRocm93XCJdID0gdmVyYigxKSwgZ1tcInJldHVyblwiXSA9IHZlcmIoMiksIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiAoZ1tTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzOyB9KSwgZztcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgcmV0dXJuIGZ1bmN0aW9uICh2KSB7IHJldHVybiBzdGVwKFtuLCB2XSk7IH07IH1cbiAgICBmdW5jdGlvbiBzdGVwKG9wKSB7XG4gICAgICAgIGlmIChmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgZXhlY3V0aW5nLlwiKTtcbiAgICAgICAgd2hpbGUgKGcgJiYgKGcgPSAwLCBvcFswXSAmJiAoXyA9IDApKSwgXykgdHJ5IHtcbiAgICAgICAgICAgIGlmIChmID0gMSwgeSAmJiAodCA9IG9wWzBdICYgMiA/IHlbXCJyZXR1cm5cIl0gOiBvcFswXSA/IHlbXCJ0aHJvd1wiXSB8fCAoKHQgPSB5W1wicmV0dXJuXCJdKSAmJiB0LmNhbGwoeSksIDApIDogeS5uZXh0KSAmJiAhKHQgPSB0LmNhbGwoeSwgb3BbMV0pKS5kb25lKSByZXR1cm4gdDtcbiAgICAgICAgICAgIGlmICh5ID0gMCwgdCkgb3AgPSBbb3BbMF0gJiAyLCB0LnZhbHVlXTtcbiAgICAgICAgICAgIHN3aXRjaCAob3BbMF0pIHtcbiAgICAgICAgICAgICAgICBjYXNlIDA6IGNhc2UgMTogdCA9IG9wOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDQ6IF8ubGFiZWwrKzsgcmV0dXJuIHsgdmFsdWU6IG9wWzFdLCBkb25lOiBmYWxzZSB9O1xuICAgICAgICAgICAgICAgIGNhc2UgNTogXy5sYWJlbCsrOyB5ID0gb3BbMV07IG9wID0gWzBdOyBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBjYXNlIDc6IG9wID0gXy5vcHMucG9wKCk7IF8udHJ5cy5wb3AoKTsgY29udGludWU7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEodCA9IF8udHJ5cywgdCA9IHQubGVuZ3RoID4gMCAmJiB0W3QubGVuZ3RoIC0gMV0pICYmIChvcFswXSA9PT0gNiB8fCBvcFswXSA9PT0gMikpIHsgXyA9IDA7IGNvbnRpbnVlOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gMyAmJiAoIXQgfHwgKG9wWzFdID4gdFswXSAmJiBvcFsxXSA8IHRbM10pKSkgeyBfLmxhYmVsID0gb3BbMV07IGJyZWFrOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gNiAmJiBfLmxhYmVsIDwgdFsxXSkgeyBfLmxhYmVsID0gdFsxXTsgdCA9IG9wOyBicmVhazsgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodCAmJiBfLmxhYmVsIDwgdFsyXSkgeyBfLmxhYmVsID0gdFsyXTsgXy5vcHMucHVzaChvcCk7IGJyZWFrOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0WzJdKSBfLm9wcy5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9wID0gYm9keS5jYWxsKHRoaXNBcmcsIF8pO1xuICAgICAgICB9IGNhdGNoIChlKSB7IG9wID0gWzYsIGVdOyB5ID0gMDsgfSBmaW5hbGx5IHsgZiA9IHQgPSAwOyB9XG4gICAgICAgIGlmIChvcFswXSAmIDUpIHRocm93IG9wWzFdOyByZXR1cm4geyB2YWx1ZTogb3BbMF0gPyBvcFsxXSA6IHZvaWQgMCwgZG9uZTogdHJ1ZSB9O1xuICAgIH1cbn07XG52YXIgQ2FydEluZm8gPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQ2FydEluZm8oYXBpVXJsLCBlbGVtZW50U2VsZWN0b3IpIHtcbiAgICAgICAgdGhpcy5hcGlVcmwgPSBhcGlVcmw7XG4gICAgICAgIHRoaXMuZWxlbWVudFNlbGVjdG9yID0gZWxlbWVudFNlbGVjdG9yO1xuICAgICAgICB0aGlzLl9pbml0Q2FydFdpZGdldCgpO1xuICAgIH1cbiAgICBDYXJ0SW5mby5wcm90b3R5cGUuZmV0Y2hDYXJ0SXRlbXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciByZXNwb25zZSwgaHRtbCwgZXJyb3JfMTtcbiAgICAgICAgICAgIHJldHVybiBfX2dlbmVyYXRvcih0aGlzLCBmdW5jdGlvbiAoX2EpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKF9hLmxhYmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICAgICAgICAgIF9hLnRyeXMucHVzaChbMCwgMywgLCA0XSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzQgLyp5aWVsZCovLCBmZXRjaCh0aGlzLmFwaVVybCldO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNwb25zZSA9IF9hLnNlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdUaGVyZSBoYXMgYmVlbiBhIHByb2JsZW0gd2l0aCB5b3VyIGZldGNoIG9wZXJhdGlvbjonLCByZXNwb25zZS5zdGF0dXNUZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzIgLypyZXR1cm4qL107IC8vIEFkZGVkIHJldHVybiB0byBwcmV2ZW50IGZ1cnRoZXIgZXhlY3V0aW9uIGlmIHRoZXJlJ3MgYW4gZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbNCAvKnlpZWxkKi8sIHJlc3BvbnNlLnRleHQoKV07XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGh0bWwgPSBfYS5zZW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc3BsYXlDYXJ0SXRlbXMoaHRtbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzMgLypicmVhayovLCA0XTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JfMSA9IF9hLnNlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1RoZXJlIGhhcyBiZWVuIGEgcHJvYmxlbSB3aXRoIHlvdXIgZmV0Y2ggb3BlcmF0aW9uOicsIGVycm9yXzEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFszIC8qYnJlYWsqLywgNF07XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgNDogcmV0dXJuIFsyIC8qcmV0dXJuKi9dO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIENhcnRJbmZvLnByb3RvdHlwZS5faW5pdENhcnRXaWRnZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuZmV0Y2hDYXJ0SXRlbXMoKTtcbiAgICB9O1xuICAgIENhcnRJbmZvLnByb3RvdHlwZS5kaXNwbGF5Q2FydEl0ZW1zID0gZnVuY3Rpb24gKGh0bWwpIHtcbiAgICAgICAgdmFyIGNhcnRGbGFnID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLmVsZW1lbnRTZWxlY3Rvcik7XG4gICAgICAgIGlmIChjYXJ0RmxhZykge1xuICAgICAgICAgICAgdmFyIGxvYWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYXJ0LWxvYWRlcicpO1xuICAgICAgICAgICAgaWYgKGxvYWRlcikge1xuICAgICAgICAgICAgICAgIGxvYWRlci5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhcnRGbGFnLmlubmVySFRNTCArPSBodG1sO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gQ2FydEluZm87XG59KCkpO1xuZXhwb3J0IHsgQ2FydEluZm8gfTtcbiIsIi8vIGV4dHJhY3RlZCBieSBtaW5pLWNzcy1leHRyYWN0LXBsdWdpblxuZXhwb3J0IHt9OyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4vLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuX193ZWJwYWNrX3JlcXVpcmVfXy5tID0gX193ZWJwYWNrX21vZHVsZXNfXztcblxuIiwidmFyIGRlZmVycmVkID0gW107XG5fX3dlYnBhY2tfcmVxdWlyZV9fLk8gPSAocmVzdWx0LCBjaHVua0lkcywgZm4sIHByaW9yaXR5KSA9PiB7XG5cdGlmKGNodW5rSWRzKSB7XG5cdFx0cHJpb3JpdHkgPSBwcmlvcml0eSB8fCAwO1xuXHRcdGZvcih2YXIgaSA9IGRlZmVycmVkLmxlbmd0aDsgaSA+IDAgJiYgZGVmZXJyZWRbaSAtIDFdWzJdID4gcHJpb3JpdHk7IGktLSkgZGVmZXJyZWRbaV0gPSBkZWZlcnJlZFtpIC0gMV07XG5cdFx0ZGVmZXJyZWRbaV0gPSBbY2h1bmtJZHMsIGZuLCBwcmlvcml0eV07XG5cdFx0cmV0dXJuO1xuXHR9XG5cdHZhciBub3RGdWxmaWxsZWQgPSBJbmZpbml0eTtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBkZWZlcnJlZC5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBjaHVua0lkcyA9IGRlZmVycmVkW2ldWzBdO1xuXHRcdHZhciBmbiA9IGRlZmVycmVkW2ldWzFdO1xuXHRcdHZhciBwcmlvcml0eSA9IGRlZmVycmVkW2ldWzJdO1xuXHRcdHZhciBmdWxmaWxsZWQgPSB0cnVlO1xuXHRcdGZvciAodmFyIGogPSAwOyBqIDwgY2h1bmtJZHMubGVuZ3RoOyBqKyspIHtcblx0XHRcdGlmICgocHJpb3JpdHkgJiAxID09PSAwIHx8IG5vdEZ1bGZpbGxlZCA+PSBwcmlvcml0eSkgJiYgT2JqZWN0LmtleXMoX193ZWJwYWNrX3JlcXVpcmVfXy5PKS5ldmVyeSgoa2V5KSA9PiAoX193ZWJwYWNrX3JlcXVpcmVfXy5PW2tleV0oY2h1bmtJZHNbal0pKSkpIHtcblx0XHRcdFx0Y2h1bmtJZHMuc3BsaWNlKGotLSwgMSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRmdWxmaWxsZWQgPSBmYWxzZTtcblx0XHRcdFx0aWYocHJpb3JpdHkgPCBub3RGdWxmaWxsZWQpIG5vdEZ1bGZpbGxlZCA9IHByaW9yaXR5O1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZihmdWxmaWxsZWQpIHtcblx0XHRcdGRlZmVycmVkLnNwbGljZShpLS0sIDEpXG5cdFx0XHR2YXIgciA9IGZuKCk7XG5cdFx0XHRpZiAociAhPT0gdW5kZWZpbmVkKSByZXN1bHQgPSByO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gcmVzdWx0O1xufTsiLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gKG1vZHVsZSkgPT4ge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHQoKSA9PiAobW9kdWxlWydkZWZhdWx0J10pIDpcblx0XHQoKSA9PiAobW9kdWxlKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgeyBhOiBnZXR0ZXIgfSk7XG5cdHJldHVybiBnZXR0ZXI7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18uZyA9IChmdW5jdGlvbigpIHtcblx0aWYgKHR5cGVvZiBnbG9iYWxUaGlzID09PSAnb2JqZWN0JykgcmV0dXJuIGdsb2JhbFRoaXM7XG5cdHRyeSB7XG5cdFx0cmV0dXJuIHRoaXMgfHwgbmV3IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpIHJldHVybiB3aW5kb3c7XG5cdH1cbn0pKCk7IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIi8vIG5vIGJhc2VVUklcblxuLy8gb2JqZWN0IHRvIHN0b3JlIGxvYWRlZCBhbmQgbG9hZGluZyBjaHVua3Ncbi8vIHVuZGVmaW5lZCA9IGNodW5rIG5vdCBsb2FkZWQsIG51bGwgPSBjaHVuayBwcmVsb2FkZWQvcHJlZmV0Y2hlZFxuLy8gW3Jlc29sdmUsIHJlamVjdCwgUHJvbWlzZV0gPSBjaHVuayBsb2FkaW5nLCAwID0gY2h1bmsgbG9hZGVkXG52YXIgaW5zdGFsbGVkQ2h1bmtzID0ge1xuXHRcImFwcFwiOiAwXG59O1xuXG4vLyBubyBjaHVuayBvbiBkZW1hbmQgbG9hZGluZ1xuXG4vLyBubyBwcmVmZXRjaGluZ1xuXG4vLyBubyBwcmVsb2FkZWRcblxuLy8gbm8gSE1SXG5cbi8vIG5vIEhNUiBtYW5pZmVzdFxuXG5fX3dlYnBhY2tfcmVxdWlyZV9fLk8uaiA9IChjaHVua0lkKSA9PiAoaW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdID09PSAwKTtcblxuLy8gaW5zdGFsbCBhIEpTT05QIGNhbGxiYWNrIGZvciBjaHVuayBsb2FkaW5nXG52YXIgd2VicGFja0pzb25wQ2FsbGJhY2sgPSAocGFyZW50Q2h1bmtMb2FkaW5nRnVuY3Rpb24sIGRhdGEpID0+IHtcblx0dmFyIGNodW5rSWRzID0gZGF0YVswXTtcblx0dmFyIG1vcmVNb2R1bGVzID0gZGF0YVsxXTtcblx0dmFyIHJ1bnRpbWUgPSBkYXRhWzJdO1xuXHQvLyBhZGQgXCJtb3JlTW9kdWxlc1wiIHRvIHRoZSBtb2R1bGVzIG9iamVjdCxcblx0Ly8gdGhlbiBmbGFnIGFsbCBcImNodW5rSWRzXCIgYXMgbG9hZGVkIGFuZCBmaXJlIGNhbGxiYWNrXG5cdHZhciBtb2R1bGVJZCwgY2h1bmtJZCwgaSA9IDA7XG5cdGlmKGNodW5rSWRzLnNvbWUoKGlkKSA9PiAoaW5zdGFsbGVkQ2h1bmtzW2lkXSAhPT0gMCkpKSB7XG5cdFx0Zm9yKG1vZHVsZUlkIGluIG1vcmVNb2R1bGVzKSB7XG5cdFx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8obW9yZU1vZHVsZXMsIG1vZHVsZUlkKSkge1xuXHRcdFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLm1bbW9kdWxlSWRdID0gbW9yZU1vZHVsZXNbbW9kdWxlSWRdO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZihydW50aW1lKSB2YXIgcmVzdWx0ID0gcnVudGltZShfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblx0fVxuXHRpZihwYXJlbnRDaHVua0xvYWRpbmdGdW5jdGlvbikgcGFyZW50Q2h1bmtMb2FkaW5nRnVuY3Rpb24oZGF0YSk7XG5cdGZvcig7aSA8IGNodW5rSWRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0Y2h1bmtJZCA9IGNodW5rSWRzW2ldO1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhpbnN0YWxsZWRDaHVua3MsIGNodW5rSWQpICYmIGluc3RhbGxlZENodW5rc1tjaHVua0lkXSkge1xuXHRcdFx0aW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdWzBdKCk7XG5cdFx0fVxuXHRcdGluc3RhbGxlZENodW5rc1tjaHVua0lkXSA9IDA7XG5cdH1cblx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18uTyhyZXN1bHQpO1xufVxuXG52YXIgY2h1bmtMb2FkaW5nR2xvYmFsID0gc2VsZltcIndlYnBhY2tDaHVua1wiXSA9IHNlbGZbXCJ3ZWJwYWNrQ2h1bmtcIl0gfHwgW107XG5jaHVua0xvYWRpbmdHbG9iYWwuZm9yRWFjaCh3ZWJwYWNrSnNvbnBDYWxsYmFjay5iaW5kKG51bGwsIDApKTtcbmNodW5rTG9hZGluZ0dsb2JhbC5wdXNoID0gd2VicGFja0pzb25wQ2FsbGJhY2suYmluZChudWxsLCBjaHVua0xvYWRpbmdHbG9iYWwucHVzaC5iaW5kKGNodW5rTG9hZGluZ0dsb2JhbCkpOyIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgZGVwZW5kcyBvbiBvdGhlciBsb2FkZWQgY2h1bmtzIGFuZCBleGVjdXRpb24gbmVlZCB0byBiZSBkZWxheWVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18uTyh1bmRlZmluZWQsIFtcInZlbmRvcnMtbm9kZV9tb2R1bGVzX2Jvb3RzdHJhcF9kaXN0X2pzX2Jvb3RzdHJhcF9lc21fanMtbm9kZV9tb2R1bGVzX3N3aXBlcl9zd2lwZXItYnVuZGxlX2Nzcy0wY2RlZGJcIl0sICgpID0+IChfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9qcy9hcHAudHNcIikpKVxuX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18uTyhfX3dlYnBhY2tfZXhwb3J0c19fKTtcbiIsIiJdLCJuYW1lcyI6WyJjb3Jlc2hvcFF1YW50aXR5U2VsZWN0b3IiLCJvcHRpb25zIiwiaW5pdFF1YW50aXR5RmllbGRzIiwiZmllbGRzIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yQWxsIiwicHJlY2lzaW9uUHJlc2V0U2VsZWN0b3IiLCJxdWVyeVNlbGVjdG9yIiwiYWRkRXZlbnRMaXN0ZW5lciIsImRhdGFzZXQiLCJjc1VuaXRJZGVudGlmaWVyIiwicXVhbnRpdHlJZGVudGlmaWVyIiwicXVhbnRpdHlJbnB1dCIsImNvbmNhdCIsInN0ZXAiLCJjc1VuaXRQcmVjaXNpb24iLCJ1cGRhdGVUb3VjaFNwaW5TZXR0aW5ncyIsInRvU3RyaW5nIiwiZm9yRWFjaCIsImZpZWxkIiwiaW5pdGlhbGl6ZVRvdWNoU3BpbiIsImlucHV0IiwicHJlY2lzaW9uIiwiY29udGFpbmVyIiwiY3JlYXRlRWxlbWVudCIsImNsYXNzTGlzdCIsImFkZCIsImRlY3JlbWVudEJ1dHRvbiIsInR5cGUiLCJ0ZXh0Q29udGVudCIsImluY3JlbWVudEJ1dHRvbiIsInBhcmVudE5vZGUiLCJpbnNlcnRCZWZvcmUiLCJhcHBlbmRDaGlsZCIsInZhbHVlIiwicGFyc2VJbnQiLCJpc05hTiIsIm1pbiIsIm1heCIsIndpbmRvdyIsImNvcmVzaG9wVmFyaWFudFNlbGVjdG9yIiwiYXR0cmlidXRlQ29udGFpbmVyIiwiX2F0dHJpYnV0ZUNvbnRhaW5lciIsIl9jb25maWciLCJfYXR0cmlidXRlR3JvdXBzIiwiX2luaXQiLCJKU09OIiwicGFyc2UiLCJjb25maWciLCJfaW5pdGlhbGl6ZUF0dHJpYnV0ZUdyb3VwcyIsIl9zZXR1cEF0dHJpYnV0ZUdyb3VwU2V0dGluZ3MiLCJfc2V0dXBDaGFuZ2VFdmVudHMiLCJhdHRyaWJ1dGVzIiwiZ3JvdXAiLCJlbGVtZW50cyIsImlkIiwicHVzaCIsImluZGV4IiwicHJldkdyb3VwIiwibmV4dEdyb3VwIiwic2VsZWN0ZWQiLCJfY29uZmlndXJlR3JvdXAiLCJfY2xlYXJHcm91cCIsIl9hdHRhY2hDaGFuZ2VFdmVudCIsImVsZW1lbnQiLCJvbmNoYW5nZSIsIl9oYW5kbGVFbGVtZW50Q2hhbmdlIiwidmFyaWFudFJlYWR5IiwiZGlzcGF0Y2hFdmVudCIsIl9jcmVhdGVFdmVudCIsIl9zZWxlY3RHcm91cEVsZW1lbnQiLCJfZGVzZWxlY3RHcm91cEVsZW1lbnQiLCJfY2xlYXJHcm91cHMiLCJfcmVkaXJlY3RUb1ZhcmlhbnQiLCJzZWxlY3RlZEF0dHJpYnV0ZXMiLCJfZ2V0U2VsZWN0ZWRBdHRyaWJ1dGVzIiwibWF0Y2hpbmdQcm9kdWN0IiwiX2ZpbmRNYXRjaGluZ1Byb2R1Y3QiLCJ1cmwiLCJsb2NhdGlvbiIsImhyZWYiLCJPYmplY3QiLCJmcm9tRW50cmllcyIsImZpbHRlciIsImciLCJtYXAiLCJ2YWx1ZXMiLCJmaW5kIiwicCIsInN0cmluZ2lmeSIsIm5hbWUiLCJkYXRhIiwiYXJndW1lbnRzIiwibGVuZ3RoIiwidW5kZWZpbmVkIiwiQ3VzdG9tRXZlbnQiLCJidWJibGVzIiwiY2FuY2VsYWJsZSIsImRldGFpbCIsIl9jbGVhckdyb3VwRWxlbWVudHMiLCJkaXNhYmxlZCIsImNoZWNrZWQiLCJ0YWdOYW1lIiwidG9Mb3dlckNhc2UiLCJfY2xlYXJTZWxlY3RPcHRpb25zIiwib3B0aW9uIiwicmVtb3ZlQ2hpbGQiLCJfZmlsdGVyQXR0cmlidXRlcyIsImZpbHRlckF0dHJpYnV0ZXMiLCJfZ2V0RmlsdGVyQXR0cmlidXRlcyIsImF0dHJpYnV0ZSIsInByb2R1Y3RzIiwic29tZSIsInByb2R1Y3QiLCJfbWF0Y2hlc0FsbEZpbHRlcnMiLCJjdXJyZW50R3JvdXAiLCJldmVyeSIsIl9jb25maWckaW5kZXgkcHJvZHVjdCIsIl9hZGRPcHRpb25Ub1NlbGVjdCIsIk9wdGlvbiIsIl9lbmFibGVFbGVtZW50Rm9yQXR0cmlidXRlIiwiX2NvbmZpZ3VyZUdyb3VwRWxlbWVudHMiLCJfY29uZmlndXJlRWxlbWVudCIsImZpbHRlcmVkQXR0cmlidXRlcyIsInNsaWNlIiwibWV0aG9kcyIsImluaXQiLCJzZXR0aW5ncyIsInByb3RvdHlwZVByZWZpeCIsImNvbnRhaW5lclNlbGVjdG9yIiwic2VsZWN0b3JBdHRyIiwic2VsZWN0b3IiLCJzaG93IiwicmVwbGFjZSIsInNlbGVjdGVkVmFsdWUiLCJzZWxlY3RlZE9wdGlvbiIsIkFycmF5IiwiZnJvbSIsImdldEF0dHJpYnV0ZSIsInByb3RvdHlwZUVsZW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsImdldENvbnRhaW5lciIsImlubmVySFRNTCIsInRyaW0iLCJwcm90b3R5cGUiLCJkYXRhQ29udGFpbmVySWQiLCJOb2RlTGlzdCIsImhhbmRsZVByb3RvdHlwZXMiLCJtZXRob2QiLCJhcHBseSIsImNhbGwiLCJFcnJvciIsIkhUTUxFbGVtZW50IiwibWFwQmxvY2siLCJzdHlsZSIsImhlaWdodCIsImNsaWVudEhlaWdodCIsImluaXRpYWxpemUiLCJtYXBPcHRpb25zIiwiem9vbSIsImNlbnRlciIsImdvb2dsZSIsIm1hcHMiLCJMYXRMbmciLCJkaXNhYmxlRGVmYXVsdFVJIiwibWFwTmV3IiwiTWFwIiwiY29uc29sZSIsImxvZyIsInNob3AiLCJpbml0Q2hhbmdlQWRkcmVzcyIsImluaXRDYXJ0U2hpcG1lbnRDYWxjdWxhdG9yIiwiaW5pdFF1YW50aXR5VmFsaWRhdG9yIiwiaW5pdENhdGVnb3J5U2VsZWN0Iiwic2V0dXBDb3B5VG9DbGlwYm9hcmQiLCJzaG93RWxlbWVudCIsImdldFNlbGVjdGVkVmFsdWUiLCJidXR0b24iLCJjb3B5VGV4dFRvQ2xpcGJvYXJkIiwidGFyZ2V0SWQiLCJ0YXJnZXQiLCJjb3B5VGV4dCIsInNlbGVjdCIsInNldFNlbGVjdGlvblJhbmdlIiwibmF2aWdhdG9yIiwiY2xpcGJvYXJkIiwid3JpdGVUZXh0IiwidGhlbiIsImNvcGllZFRleHQiLCJ1cGRhdGVRdWVyeVN0cmluZ1BhcmFtZXRlciIsInVyaSIsImtleSIsInJlIiwiUmVnRXhwIiwic2VwYXJhdG9yIiwiaW5kZXhPZiIsIm1hdGNoIiwiYnV0dG9uZG93bl9jbGFzcyIsImJ1dHRvbnVwX2NsYXNzIiwiZXYiLCJmb3JtIiwiY2xvc2VzdCIsImhhbmRsZVNoaXBtZW50Q2FsY3VsYXRpb24iLCJldmVudCIsInByZXZlbnREZWZhdWx0Iiwic2V0QXR0cmlidXRlIiwib3BhY2l0eSIsImZldGNoIiwiYWN0aW9uIiwiYm9keSIsIlVSTFNlYXJjaFBhcmFtcyIsIkZvcm1EYXRhIiwicmVzcG9uc2UiLCJ0ZXh0IiwicmVzIiwidXBkYXRlU2hpcG1lbnRDYWxjdWxhdGlvbiIsImNhdGNoIiwiZXJyb3IiLCJoYW5kbGVTaGlwbWVudEVycm9yIiwicmVzcG9uc2VUZXh0IiwicmVtb3ZlIiwib3V0ZXJIVE1MIiwicmVtb3ZlQXR0cmlidXRlIiwiYWRkcmVzc1N0ZXAiLCJpbnZvaWNlQWRkcmVzcyIsInNoaXBwaW5nQWRkcmVzcyIsInVzZUlhc1MiLCJzZXR1cEFkZHJlc3NDaGFuZ2VFdmVudHMiLCJ1cGRhdGVBZGRyZXNzIiwidXBkYXRlU2hpcHBpbmdBZGRyZXNzIiwidG9nZ2xlU2hpcHBpbmdBZGRyZXNzIiwic2VsZWN0ZWRJbmRleCIsImFkZHJlc3MiLCJodG1sIiwiaW52b2ljZVBhbmVsIiwidG9nZ2xlVXNlQXNTaGlwcGluZyIsImFkZHJlc3NUeXBlIiwiaXNJbnZvaWNlVHlwZSIsIkV2ZW50Iiwic2hpcHBpbmdGaWVsZCIsInNoaXBwaW5nQWRkQWRkcmVzc0J1dHRvbiIsImRpc3BsYXkiLCJ2YXJpYW50IiwidmFyaWFudHMiLCJlIiwic3VibWl0cyIsInN1Ym1pdCIsIkNhcm91c2VsIiwiQ2FydEluZm8iLCJTd2lwZXIiLCJUaHVtYnMiLCJfaW5pdENhcm91c2VsIiwic2xpZGVyVGh1bWJuYWlsIiwic2xpZGVzUGVyVmlldyIsImZyZWVNb2RlIiwic3BhY2VCZXR3ZWVuIiwid2F0Y2hTbGlkZXNQcm9ncmVzcyIsIm1haW5TbGlkZXIiLCJtb2R1bGVzIiwibmF2aWdhdGlvbiIsIm5leHRFbCIsInByZXZFbCIsInRodW1icyIsInN3aXBlciIsIl9fYXdhaXRlciIsInRoaXNBcmciLCJfYXJndW1lbnRzIiwiUCIsImdlbmVyYXRvciIsImFkb3B0IiwicmVzb2x2ZSIsIlByb21pc2UiLCJyZWplY3QiLCJmdWxmaWxsZWQiLCJuZXh0IiwicmVqZWN0ZWQiLCJyZXN1bHQiLCJkb25lIiwiX19nZW5lcmF0b3IiLCJfIiwibGFiZWwiLCJzZW50IiwidCIsInRyeXMiLCJvcHMiLCJmIiwieSIsImNyZWF0ZSIsIkl0ZXJhdG9yIiwidmVyYiIsIlN5bWJvbCIsIml0ZXJhdG9yIiwibiIsInYiLCJvcCIsIlR5cGVFcnJvciIsInBvcCIsImFwaVVybCIsImVsZW1lbnRTZWxlY3RvciIsIl9pbml0Q2FydFdpZGdldCIsImZldGNoQ2FydEl0ZW1zIiwiZXJyb3JfMSIsIl9hIiwib2siLCJzdGF0dXNUZXh0IiwiZGlzcGxheUNhcnRJdGVtcyIsImNhcnRGbGFnIiwibG9hZGVyIl0sInNvdXJjZVJvb3QiOiIifQ==