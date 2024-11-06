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
    const _assignOnChangeEvent = function (element, group) {
      element.onchange = () => _handleElementChange(group, element);
    };
    const _attachChangeEvent = function (group) {
      group.elements.forEach(element => _assignOnChangeEvent(element, group));
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
    const _isProductMatchingFilters = function (product, filterAttributes) {
      return filterAttributes.every(filter => {
        var _config$index$product;
        return ((_config$index$product = _config.index[product.id].attributes) === null || _config$index$product === void 0 ? void 0 : _config$index$product[filter.group]) === filter.selected;
      });
    };
    const _isAttributeRelevant = function (attribute, filterAttributes) {
      return attribute.products.some(product => _isProductMatchingFilters(product, filterAttributes));
    };
    const _filterAttributes = function (attributes, group) {
      const filterAttributes = _getFilterAttributes(group);
      return attributes.filter(attribute => _isAttributeRelevant(attribute, filterAttributes));
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
        var _config$index$product2;
        return ((_config$index$product2 = _config.index[product.id].attributes) === null || _config$index$product2 === void 0 ? void 0 : _config$index$product2[filter.group]) === filter.selected;
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
  var CartWidget = new _scripts_cartInfo__WEBPACK_IMPORTED_MODULE_10__.CartInfo('/coreshop_get_cart_items', '.js-cart-widget');
  var CarouselProducts = new _scripts_carousel__WEBPACK_IMPORTED_MODULE_9__.Carousel();
  console.log(CartWidget);
  console.log(CarouselProducts);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNBOztVQUVBO1VBQ0E7Ozs7O1dDekJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsK0JBQStCLHdDQUF3QztXQUN2RTtXQUNBO1dBQ0E7V0FDQTtXQUNBLGlCQUFpQixxQkFBcUI7V0FDdEM7V0FDQTtXQUNBO1dBQ0E7V0FDQSxrQkFBa0IscUJBQXFCO1dBQ3ZDO1dBQ0E7V0FDQSxLQUFLO1dBQ0w7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBOzs7OztXQzdCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsaUNBQWlDLFdBQVc7V0FDNUM7V0FDQTs7Ozs7V0NQQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsR0FBRztXQUNIO1dBQ0E7V0FDQSxDQUFDOzs7OztXQ1BEOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7V0NOQTs7V0FFQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7O1dBRUE7O1dBRUE7O1dBRUE7O1dBRUE7O1dBRUE7O1dBRUE7O1dBRUE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLE1BQU0scUJBQXFCO1dBQzNCO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7O1dBRUE7V0FDQTtXQUNBOzs7OztVRWxEQTtVQUNBO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vLy4vanMvcGx1Z2luL2NvcmVzaG9wLnBsdWdpbi5xdWFudGl0eS5qcyIsIndlYnBhY2s6Ly8vLi9qcy9wbHVnaW4vY29yZXNob3AucGx1Z2luLnZhcmlhbnQuanMiLCJ3ZWJwYWNrOi8vLy4vanMvc2NyaXB0cy9oYW5kbGUtcHJvdG90eXBlcy5qcyIsIndlYnBhY2s6Ly8vLi9qcy9zY3JpcHRzL21hcC5qcyIsIndlYnBhY2s6Ly8vLi9qcy9zY3JpcHRzL3Nob3AuanMiLCJ3ZWJwYWNrOi8vLy4vanMvc2NyaXB0cy92YXJpYW50LmpzIiwid2VicGFjazovLy8uL2pzL2FwcC50cyIsIndlYnBhY2s6Ly8vLi9qcy9zY3JpcHRzL2Nhcm91c2VsLnRzIiwid2VicGFjazovLy8uL2pzL3NjcmlwdHMvY2FydEluZm8udHMiLCJ3ZWJwYWNrOi8vLy4vc2Nzcy9hcHAuc2NzcyIsIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9jaHVuayBsb2FkZWQiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9nbG9iYWwiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9qc29ucCBjaHVuayBsb2FkaW5nIiwid2VicGFjazovLy93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovLy93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIGNvcmVzaG9wUXVhbnRpdHlTZWxlY3RvcihvcHRpb25zKSB7XG4gICAgICAgIGluaXRRdWFudGl0eUZpZWxkcyhvcHRpb25zKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbml0UXVhbnRpdHlGaWVsZHMob3B0aW9ucykge1xuICAgICAgICBjb25zdCBmaWVsZHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dC5jcy11bml0LWlucHV0Jyk7XG4gICAgICAgIGNvbnN0IHByZWNpc2lvblByZXNldFNlbGVjdG9yID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcignc2VsZWN0LmNzLXVuaXQtc2VsZWN0b3InKTtcblxuICAgICAgICBpZihwcmVjaXNpb25QcmVzZXRTZWxlY3Rvcikge1xuICAgICAgICAgICAgLy8gTGlzdGVuIHRvIHVuaXQgZGVmaW5pdGlvbiBzZWxlY3RvclxuICAgICAgICAgICAgcHJlY2lzaW9uUHJlc2V0U2VsZWN0b3IuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5kYXRhc2V0LmNzVW5pdElkZW50aWZpZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBxdWFudGl0eUlkZW50aWZpZXIgPSB0aGlzLmRhdGFzZXQuY3NVbml0SWRlbnRpZmllcjtcbiAgICAgICAgICAgICAgICBjb25zdCBxdWFudGl0eUlucHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgaW5wdXRbZGF0YS1jcy11bml0LWlkZW50aWZpZXI9XCIke3F1YW50aXR5SWRlbnRpZmllcn1cIl1gKTtcblxuICAgICAgICAgICAgICAgIC8vIFNldCBzdGVwIHRvIDEgb3Igd2hhdGV2ZXIgaW50ZWdlciB2YWx1ZSB5b3Ugd2FudFxuICAgICAgICAgICAgICAgIGNvbnN0IHN0ZXAgPSAxOyAvLyBDaGFuZ2UgdGhpcyBpZiB5b3Ugd2FudCBhIGRpZmZlcmVudCBpbmNyZW1lbnRcblxuICAgICAgICAgICAgICAgIGlmICghcXVhbnRpdHlJbnB1dCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gVXNlIGludGVnZXIgc3RlcCBkaXJlY3RseVxuICAgICAgICAgICAgICAgIHF1YW50aXR5SW5wdXQuc3RlcCA9IHN0ZXA7IC8vIFNldCBzdGVwIGFzIGFuIGludGVnZXJcbiAgICAgICAgICAgICAgICBxdWFudGl0eUlucHV0LmRhdGFzZXQuY3NVbml0UHJlY2lzaW9uID0gMDsgLy8gT3B0aW9uYWwsIHNpbmNlIHByZWNpc2lvbiBpcyBubyBsb25nZXIgcmVsZXZhbnRcblxuICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSBpbnB1dCBzZXR0aW5nc1xuICAgICAgICAgICAgICAgIHVwZGF0ZVRvdWNoU3BpblNldHRpbmdzKHF1YW50aXR5SW5wdXQsIDAsIHN0ZXAudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGZpZWxkcykge1xuICAgICAgICAgICAgLy8gSW5pdGlhbGl6ZSBxdWFudGl0eSBmaWVsZHMgd2l0aCBpbnRlZ2VyIHN0ZXBcbiAgICAgICAgICAgIGZpZWxkcy5mb3JFYWNoKGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAgICAgICAgICAgIC8vIFlvdSBtaWdodCBub3QgbmVlZCBwcmVjaXNpb24gYW55bW9yZVxuICAgICAgICAgICAgICAgIGluaXRpYWxpemVUb3VjaFNwaW4oZmllbGQsIDAsICcxJywgb3B0aW9ucyk7IC8vIENoYW5nZSAnMScgdG8geW91ciBkZXNpcmVkIGludGVnZXIgaW5jcmVtZW50XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluaXRpYWxpemVUb3VjaFNwaW4oaW5wdXQsIHByZWNpc2lvbiwgc3RlcCwgb3B0aW9ucykge1xuICAgICAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ3RvdWNoc3Bpbi1jb250YWluZXInKTtcblxuICAgICAgICBjb25zdCBkZWNyZW1lbnRCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgZGVjcmVtZW50QnV0dG9uLnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgZGVjcmVtZW50QnV0dG9uLnRleHRDb250ZW50ID0gJy0nO1xuICAgICAgICBkZWNyZW1lbnRCdXR0b24uY2xhc3NMaXN0LmFkZCgndG91Y2hzcGluLWRlY3JlbWVudCcpO1xuXG4gICAgICAgIGNvbnN0IGluY3JlbWVudEJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICBpbmNyZW1lbnRCdXR0b24udHlwZSA9ICdidXR0b24nO1xuICAgICAgICBpbmNyZW1lbnRCdXR0b24udGV4dENvbnRlbnQgPSAnKyc7XG4gICAgICAgIGluY3JlbWVudEJ1dHRvbi5jbGFzc0xpc3QuYWRkKCd0b3VjaHNwaW4taW5jcmVtZW50Jyk7XG5cbiAgICAgICAgaW5wdXQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoY29udGFpbmVyLCBpbnB1dCk7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChkZWNyZW1lbnRCdXR0b24pO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoaW5wdXQpO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoaW5jcmVtZW50QnV0dG9uKTtcblxuICAgICAgICAvLyBTZXQgdXAgZXZlbnQgbGlzdGVuZXJzIGZvciBpbmNyZW1lbnQgYW5kIGRlY3JlbWVudFxuICAgICAgICBkZWNyZW1lbnRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBsZXQgdmFsdWUgPSBwYXJzZUludChpbnB1dC52YWx1ZSkgfHwgMDsgLy8gRW5zdXJlIHZhbHVlIGlzIGFuIGludGVnZXJcbiAgICAgICAgICAgIHZhbHVlIC09IHBhcnNlSW50KHN0ZXApOyAvLyBEZWNyZW1lbnQgYnkgaW50ZWdlciBzdGVwXG4gICAgICAgICAgICBpZiAodmFsdWUgPj0gMCkge1xuICAgICAgICAgICAgICAgIGlucHV0LnZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGluY3JlbWVudEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IHBhcnNlSW50KGlucHV0LnZhbHVlKSB8fCAwOyAvLyBFbnN1cmUgdmFsdWUgaXMgYW4gaW50ZWdlclxuICAgICAgICAgICAgdmFsdWUgKz0gcGFyc2VJbnQoc3RlcCk7IC8vIEluY3JlbWVudCBieSBpbnRlZ2VyIHN0ZXBcbiAgICAgICAgICAgIGlucHV0LnZhbHVlID0gdmFsdWU7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEFkZCBpbnB1dCB2YWxpZGF0aW9uIGJhc2VkIG9uIGludGVnZXIgdmFsdWVcbiAgICAgICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBsZXQgdmFsdWUgPSBwYXJzZUludChpbnB1dC52YWx1ZSk7XG4gICAgICAgICAgICBpZiAoaXNOYU4odmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgaW5wdXQudmFsdWUgPSAwOyAvLyBEZWZhdWx0IHRvIHplcm8gaWYgaW52YWxpZCBpbnB1dFxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpbnB1dC52YWx1ZSA9IHZhbHVlOyAvLyBLZWVwIGl0IGFzIGFuIGludGVnZXJcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlVG91Y2hTcGluU2V0dGluZ3MoaW5wdXQsIHByZWNpc2lvbiwgc3RlcCkge1xuICAgICAgICBpbnB1dC5taW4gPSAwO1xuICAgICAgICBpbnB1dC5tYXggPSAxMDAwMDAwMDAwO1xuICAgICAgICBpbnB1dC5zdGVwID0gc3RlcDtcbiAgICAgICAgaW5wdXQuZGF0YXNldC5jc1VuaXRQcmVjaXNpb24gPSBwcmVjaXNpb247XG4gICAgfVxuXG4gICAgLy8gRXhwb3J0IHRoZSBmdW5jdGlvbiB0byB0aGUgZ2xvYmFsIHNjb3BlXG4gICAgd2luZG93LmNvcmVzaG9wUXVhbnRpdHlTZWxlY3RvciA9IGNvcmVzaG9wUXVhbnRpdHlTZWxlY3Rvcjtcbn0pKCk7XG4iLCIoZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IGNvcmVzaG9wVmFyaWFudFNlbGVjdG9yID0gZnVuY3Rpb24gKGF0dHJpYnV0ZUNvbnRhaW5lcikge1xuICAgICAgICBsZXQgX2F0dHJpYnV0ZUNvbnRhaW5lciA9IG51bGw7XG4gICAgICAgIGxldCBfY29uZmlnID0ge307XG4gICAgICAgIGxldCBfYXR0cmlidXRlR3JvdXBzID0gW107XG5cbiAgICAgICAgY29uc3QgX2luaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoIWF0dHJpYnV0ZUNvbnRhaW5lcikgcmV0dXJuO1xuXG4gICAgICAgICAgICBfYXR0cmlidXRlQ29udGFpbmVyID0gYXR0cmlidXRlQ29udGFpbmVyO1xuICAgICAgICAgICAgX2NvbmZpZyA9IEpTT04ucGFyc2UoX2F0dHJpYnV0ZUNvbnRhaW5lci5kYXRhc2V0LmNvbmZpZyk7XG4gICAgICAgICAgICBfaW5pdGlhbGl6ZUF0dHJpYnV0ZUdyb3VwcygpO1xuICAgICAgICAgICAgX3NldHVwQXR0cmlidXRlR3JvdXBTZXR0aW5ncygpO1xuICAgICAgICAgICAgX3NldHVwQ2hhbmdlRXZlbnRzKCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgX2luaXRpYWxpemVBdHRyaWJ1dGVHcm91cHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfY29uZmlnLmF0dHJpYnV0ZXMuZm9yRWFjaCgoZ3JvdXApID0+IHtcbiAgICAgICAgICAgICAgICBncm91cC5lbGVtZW50cyA9IF9hdHRyaWJ1dGVDb250YWluZXIucXVlcnlTZWxlY3RvckFsbChgW2RhdGEtZ3JvdXA9XCIke2dyb3VwLmdyb3VwLmlkfVwiXWApO1xuICAgICAgICAgICAgICAgIF9hdHRyaWJ1dGVHcm91cHMucHVzaChncm91cCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfc2V0dXBBdHRyaWJ1dGVHcm91cFNldHRpbmdzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX2F0dHJpYnV0ZUdyb3Vwcy5mb3JFYWNoKChncm91cCwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgICBncm91cC5wcmV2R3JvdXAgPSBfYXR0cmlidXRlR3JvdXBzW2luZGV4IC0gMV0gfHwgbnVsbDtcbiAgICAgICAgICAgICAgICBncm91cC5uZXh0R3JvdXAgPSBfYXR0cmlidXRlR3JvdXBzW2luZGV4ICsgMV0gfHwgbnVsbDtcbiAgICAgICAgICAgICAgICBncm91cC5zZWxlY3RlZCA/IF9jb25maWd1cmVHcm91cChncm91cCkgOiBfY2xlYXJHcm91cChncm91cCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfc2V0dXBDaGFuZ2VFdmVudHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfYXR0cmlidXRlR3JvdXBzLmZvckVhY2goKGdyb3VwKSA9PiBfYXR0YWNoQ2hhbmdlRXZlbnQoZ3JvdXApKTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfYXNzaWduT25DaGFuZ2VFdmVudCA9IGZ1bmN0aW9uIChlbGVtZW50LCBncm91cCkge1xuICAgICAgICAgICAgZWxlbWVudC5vbmNoYW5nZSA9ICgpID0+IF9oYW5kbGVFbGVtZW50Q2hhbmdlKGdyb3VwLCBlbGVtZW50KTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfYXR0YWNoQ2hhbmdlRXZlbnQgPSBmdW5jdGlvbiAoZ3JvdXApIHtcbiAgICAgICAgICAgIGdyb3VwLmVsZW1lbnRzLmZvckVhY2goKGVsZW1lbnQpID0+IF9hc3NpZ25PbkNoYW5nZUV2ZW50KGVsZW1lbnQsIGdyb3VwKSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgX2hhbmRsZUVsZW1lbnRDaGFuZ2UgPSBmdW5jdGlvbiAoZ3JvdXAsIGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHdpbmRvdy52YXJpYW50UmVhZHkgPSBmYWxzZTtcbiAgICAgICAgICAgIF9hdHRyaWJ1dGVDb250YWluZXIuZGlzcGF0Y2hFdmVudChfY3JlYXRlRXZlbnQoJ2NoYW5nZScsIHsgZWxlbWVudCB9KSk7XG5cbiAgICAgICAgICAgIGlmIChlbGVtZW50LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgX3NlbGVjdEdyb3VwRWxlbWVudChncm91cCwgZWxlbWVudCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIF9kZXNlbGVjdEdyb3VwRWxlbWVudChncm91cCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHdpbmRvdy52YXJpYW50UmVhZHkgPSB0cnVlO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9zZWxlY3RHcm91cEVsZW1lbnQgPSBmdW5jdGlvbiAoZ3JvdXAsIGVsZW1lbnQpIHtcbiAgICAgICAgICAgIGdyb3VwLnNlbGVjdGVkID0gcGFyc2VJbnQoZWxlbWVudC52YWx1ZSk7XG4gICAgICAgICAgICBfYXR0cmlidXRlQ29udGFpbmVyLmRpc3BhdGNoRXZlbnQoX2NyZWF0ZUV2ZW50KCdzZWxlY3QnLCB7IGVsZW1lbnQgfSkpO1xuXG4gICAgICAgICAgICBpZiAoZ3JvdXAubmV4dEdyb3VwKSB7XG4gICAgICAgICAgICAgICAgX2NsZWFyR3JvdXBzKGdyb3VwLm5leHRHcm91cCk7XG4gICAgICAgICAgICAgICAgX2NvbmZpZ3VyZUdyb3VwKGdyb3VwLm5leHRHcm91cCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIF9hdHRyaWJ1dGVDb250YWluZXIuZGlzcGF0Y2hFdmVudChfY3JlYXRlRXZlbnQoJ3JlZGlyZWN0JywgeyBlbGVtZW50IH0pKTtcbiAgICAgICAgICAgICAgICBfcmVkaXJlY3RUb1ZhcmlhbnQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfZGVzZWxlY3RHcm91cEVsZW1lbnQgPSBmdW5jdGlvbiAoZ3JvdXApIHtcbiAgICAgICAgICAgIGRlbGV0ZSBncm91cC5zZWxlY3RlZDtcbiAgICAgICAgICAgIGlmIChncm91cC5uZXh0R3JvdXApIF9jbGVhckdyb3Vwcyhncm91cC5uZXh0R3JvdXApO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9yZWRpcmVjdFRvVmFyaWFudCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkQXR0cmlidXRlcyA9IF9nZXRTZWxlY3RlZEF0dHJpYnV0ZXMoKTtcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoaW5nUHJvZHVjdCA9IF9maW5kTWF0Y2hpbmdQcm9kdWN0KHNlbGVjdGVkQXR0cmlidXRlcyk7XG5cbiAgICAgICAgICAgIGlmIChtYXRjaGluZ1Byb2R1Y3Q/LnVybCkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gbWF0Y2hpbmdQcm9kdWN0LnVybDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfZ2V0U2VsZWN0ZWRBdHRyaWJ1dGVzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5mcm9tRW50cmllcyhcbiAgICAgICAgICAgICAgICBfYXR0cmlidXRlR3JvdXBzLmZpbHRlcigoZykgPT4gZy5zZWxlY3RlZCkubWFwKChnKSA9PiBbZy5ncm91cC5pZCwgZy5zZWxlY3RlZF0pXG4gICAgICAgICAgICApO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9maW5kTWF0Y2hpbmdQcm9kdWN0ID0gZnVuY3Rpb24gKHNlbGVjdGVkQXR0cmlidXRlcykge1xuICAgICAgICAgICAgcmV0dXJuIE9iamVjdC52YWx1ZXMoX2NvbmZpZy5pbmRleCkuZmluZCgocCkgPT5cbiAgICAgICAgICAgICAgICBKU09OLnN0cmluZ2lmeShwLmF0dHJpYnV0ZXMpID09PSBKU09OLnN0cmluZ2lmeShzZWxlY3RlZEF0dHJpYnV0ZXMpXG4gICAgICAgICAgICApO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9jcmVhdGVFdmVudCA9IGZ1bmN0aW9uIChuYW1lLCBkYXRhID0ge30pIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgQ3VzdG9tRXZlbnQoJ3ZhcmlhbnRfc2VsZWN0b3IuJyArIG5hbWUsIHtcbiAgICAgICAgICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNhbmNlbGFibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGRldGFpbDogZGF0YSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9jbGVhckdyb3VwRWxlbWVudHMgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgZWxlbWVudC5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgICBlbGVtZW50LmNoZWNrZWQgPSBmYWxzZTtcblxuICAgICAgICAgICAgaWYgKGVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnc2VsZWN0JykgX2NsZWFyU2VsZWN0T3B0aW9ucyhlbGVtZW50KTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfY2xlYXJTZWxlY3RPcHRpb25zID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IG9wdGlvbnMgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ29wdGlvbjpub3QoW3ZhbHVlPVwiXCJdKScpO1xuICAgICAgICAgICAgb3B0aW9ucy5mb3JFYWNoKChvcHRpb24pID0+IGVsZW1lbnQucmVtb3ZlQ2hpbGQob3B0aW9uKSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgX2NsZWFyR3JvdXAgPSBmdW5jdGlvbiAoZ3JvdXApIHtcbiAgICAgICAgICAgIGRlbGV0ZSBncm91cC5zZWxlY3RlZDtcbiAgICAgICAgICAgIGdyb3VwLmVsZW1lbnRzLmZvckVhY2goX2NsZWFyR3JvdXBFbGVtZW50cyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgX2NsZWFyR3JvdXBzID0gZnVuY3Rpb24gKGdyb3VwKSB7XG4gICAgICAgICAgICB3aGlsZSAoZ3JvdXApIHtcbiAgICAgICAgICAgICAgICBfY2xlYXJHcm91cChncm91cCk7XG4gICAgICAgICAgICAgICAgZ3JvdXAgPSBncm91cC5uZXh0R3JvdXA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgX2lzUHJvZHVjdE1hdGNoaW5nRmlsdGVycyA9IGZ1bmN0aW9uIChwcm9kdWN0LCBmaWx0ZXJBdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICByZXR1cm4gZmlsdGVyQXR0cmlidXRlcy5ldmVyeSgoZmlsdGVyKSA9PiBfY29uZmlnLmluZGV4W3Byb2R1Y3QuaWRdLmF0dHJpYnV0ZXM/LltmaWx0ZXIuZ3JvdXBdID09PSBmaWx0ZXIuc2VsZWN0ZWQpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9pc0F0dHJpYnV0ZVJlbGV2YW50ID0gZnVuY3Rpb24gKGF0dHJpYnV0ZSwgZmlsdGVyQXR0cmlidXRlcykge1xuICAgICAgICAgICAgcmV0dXJuIGF0dHJpYnV0ZS5wcm9kdWN0cy5zb21lKChwcm9kdWN0KSA9PiBfaXNQcm9kdWN0TWF0Y2hpbmdGaWx0ZXJzKHByb2R1Y3QsIGZpbHRlckF0dHJpYnV0ZXMpKTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfZmlsdGVyQXR0cmlidXRlcyA9IGZ1bmN0aW9uIChhdHRyaWJ1dGVzLCBncm91cCkge1xuICAgICAgICAgICAgY29uc3QgZmlsdGVyQXR0cmlidXRlcyA9IF9nZXRGaWx0ZXJBdHRyaWJ1dGVzKGdyb3VwKTtcbiAgICAgICAgICAgIHJldHVybiBhdHRyaWJ1dGVzLmZpbHRlcigoYXR0cmlidXRlKSA9PiBfaXNBdHRyaWJ1dGVSZWxldmFudChhdHRyaWJ1dGUsIGZpbHRlckF0dHJpYnV0ZXMpKTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfZ2V0RmlsdGVyQXR0cmlidXRlcyA9IGZ1bmN0aW9uIChncm91cCkge1xuICAgICAgICAgICAgY29uc3QgZmlsdGVyQXR0cmlidXRlcyA9IFtdO1xuICAgICAgICAgICAgbGV0IGN1cnJlbnRHcm91cCA9IGdyb3VwLnByZXZHcm91cDtcblxuICAgICAgICAgICAgd2hpbGUgKGN1cnJlbnRHcm91cCkge1xuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50R3JvdXAuc2VsZWN0ZWQgJiYgY3VycmVudEdyb3VwLm5leHRHcm91cCkge1xuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJBdHRyaWJ1dGVzLnB1c2goeyBncm91cDogY3VycmVudEdyb3VwLmdyb3VwLmlkLCBzZWxlY3RlZDogY3VycmVudEdyb3VwLnNlbGVjdGVkIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjdXJyZW50R3JvdXAgPSBjdXJyZW50R3JvdXAucHJldkdyb3VwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZmlsdGVyQXR0cmlidXRlcztcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfbWF0Y2hlc0FsbEZpbHRlcnMgPSBmdW5jdGlvbiAocHJvZHVjdCwgZmlsdGVyQXR0cmlidXRlcykge1xuICAgICAgICAgICAgcmV0dXJuIGZpbHRlckF0dHJpYnV0ZXMuZXZlcnkoKGZpbHRlcikgPT5cbiAgICAgICAgICAgICAgICBfY29uZmlnLmluZGV4W3Byb2R1Y3QuaWRdLmF0dHJpYnV0ZXM/LltmaWx0ZXIuZ3JvdXBdID09PSBmaWx0ZXIuc2VsZWN0ZWRcbiAgICAgICAgICAgICk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgX2FkZE9wdGlvblRvU2VsZWN0ID0gZnVuY3Rpb24gKGVsZW1lbnQsIGF0dHJpYnV0ZSwgZ3JvdXApIHtcbiAgICAgICAgICAgIGNvbnN0IG9wdGlvbiA9IG5ldyBPcHRpb24oYXR0cmlidXRlLmF0dHJpYnV0ZS5uYW1lLCBhdHRyaWJ1dGUuYXR0cmlidXRlLmlkKTtcbiAgICAgICAgICAgIG9wdGlvbi5pZCA9ICdhdHRyaWJ1dGUtJyArIGF0dHJpYnV0ZS5hdHRyaWJ1dGUuaWQ7XG4gICAgICAgICAgICBpZiAoZ3JvdXAuc2VsZWN0ZWQgPT09IGF0dHJpYnV0ZS5hdHRyaWJ1dGUuaWQpIG9wdGlvbi5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICBlbGVtZW50LmFkZChvcHRpb24pO1xuICAgICAgICAgICAgZWxlbWVudC5kaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9lbmFibGVFbGVtZW50Rm9yQXR0cmlidXRlID0gZnVuY3Rpb24gKGVsZW1lbnQsIGF0dHJpYnV0ZSwgZ3JvdXApIHtcbiAgICAgICAgICAgIGlmIChwYXJzZUludChlbGVtZW50LmRhdGFzZXQuZ3JvdXApID09PSBncm91cC5ncm91cC5pZCAmJiBwYXJzZUludChlbGVtZW50LnZhbHVlKSA9PT0gYXR0cmlidXRlLmF0dHJpYnV0ZS5pZCkge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAoZ3JvdXAuc2VsZWN0ZWQgPT09IGF0dHJpYnV0ZS5hdHRyaWJ1dGUuaWQpIGVsZW1lbnQuY2hlY2tlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgX2NvbmZpZ3VyZUdyb3VwRWxlbWVudHMgPSBmdW5jdGlvbiAoZ3JvdXAsIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgICAgIGdyb3VwLmVsZW1lbnRzLmZvckVhY2goKGVsZW1lbnQpID0+XG4gICAgICAgICAgICAgICAgX2NvbmZpZ3VyZUVsZW1lbnQoZWxlbWVudCwgYXR0cmlidXRlcywgZ3JvdXApXG4gICAgICAgICAgICApO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9jb25maWd1cmVFbGVtZW50ID0gZnVuY3Rpb24gKGVsZW1lbnQsIGF0dHJpYnV0ZXMsIGdyb3VwKSB7XG4gICAgICAgICAgICBpZiAoZWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdzZWxlY3QnKSB7XG4gICAgICAgICAgICAgICAgYXR0cmlidXRlcy5mb3JFYWNoKChhdHRyaWJ1dGUpID0+IF9hZGRPcHRpb25Ub1NlbGVjdChlbGVtZW50LCBhdHRyaWJ1dGUsIGdyb3VwKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMuZm9yRWFjaCgoYXR0cmlidXRlKSA9PiBfZW5hYmxlRWxlbWVudEZvckF0dHJpYnV0ZShlbGVtZW50LCBhdHRyaWJ1dGUsIGdyb3VwKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgX2NvbmZpZ3VyZUdyb3VwID0gZnVuY3Rpb24gKGdyb3VwKSB7XG4gICAgICAgICAgICBjb25zdCBmaWx0ZXJlZEF0dHJpYnV0ZXMgPSBfZmlsdGVyQXR0cmlidXRlcyhncm91cC5hdHRyaWJ1dGVzLnNsaWNlKCksIGdyb3VwKSB8fCBncm91cC5hdHRyaWJ1dGVzO1xuICAgICAgICAgICAgX2NvbmZpZ3VyZUdyb3VwRWxlbWVudHMoZ3JvdXAsIGZpbHRlcmVkQXR0cmlidXRlcyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgX2luaXQoKTtcbiAgICB9O1xuXG4gICAgd2luZG93LmNvcmVzaG9wVmFyaWFudFNlbGVjdG9yID0gY29yZXNob3BWYXJpYW50U2VsZWN0b3I7XG59KSgpO1xuIiwiKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBjb25zdCBtZXRob2RzID0ge1xuICAgICAgICBpbml0OiBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgICAgICAgY29uc3Qgc2V0dGluZ3MgPSB7XG4gICAgICAgICAgICAgICAgcHJvdG90eXBlUHJlZml4OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjb250YWluZXJTZWxlY3RvcjogZmFsc2UsXG4gICAgICAgICAgICAgICAgc2VsZWN0b3JBdHRyOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zIC8vIFVzaW5nIG9iamVjdCBzcHJlYWQgaGVyZVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgZWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuc2VsZWN0b3IpO1xuICAgICAgICAgICAgZWxlbWVudHMuZm9yRWFjaChlbGVtZW50ID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3coZWxlbWVudCwgc2V0dGluZ3MsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaG93KGVsZW1lbnQsIHNldHRpbmdzLCB0cnVlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNob3c6IGZ1bmN0aW9uIChlbGVtZW50LCBzZXR0aW5ncywgcmVwbGFjZSkge1xuICAgICAgICAgICAgbGV0IHNlbGVjdGVkVmFsdWUgPSBlbGVtZW50LnZhbHVlO1xuICAgICAgICAgICAgbGV0IHByb3RvdHlwZVByZWZpeCA9IGVsZW1lbnQuaWQ7XG5cbiAgICAgICAgICAgIGlmIChzZXR0aW5ncy5zZWxlY3RvckF0dHIpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzZWxlY3RlZE9wdGlvbiA9IEFycmF5LmZyb20oZWxlbWVudC5vcHRpb25zKS5maW5kKG9wdGlvbiA9PiBvcHRpb24udmFsdWUgPT09IHNlbGVjdGVkVmFsdWUpO1xuICAgICAgICAgICAgICAgIGlmIChzZWxlY3RlZE9wdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZFZhbHVlID0gc2VsZWN0ZWRPcHRpb24uZ2V0QXR0cmlidXRlKHNldHRpbmdzLnNlbGVjdG9yQXR0cik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoc2V0dGluZ3MucHJvdG90eXBlUHJlZml4KSB7XG4gICAgICAgICAgICAgICAgcHJvdG90eXBlUHJlZml4ID0gc2V0dGluZ3MucHJvdG90eXBlUHJlZml4O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBwcm90b3R5cGVFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYCR7cHJvdG90eXBlUHJlZml4fV8ke3NlbGVjdGVkVmFsdWV9YCk7XG4gICAgICAgICAgICBsZXQgY29udGFpbmVyID0gdGhpcy5nZXRDb250YWluZXIoc2V0dGluZ3MsIHByb3RvdHlwZUVsZW1lbnQpO1xuXG4gICAgICAgICAgICBpZiAoIWNvbnRhaW5lcikge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFwcm90b3R5cGVFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyLmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHJlcGxhY2UgfHwgIWNvbnRhaW5lci5pbm5lckhUTUwudHJpbSgpKSB7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyLmlubmVySFRNTCA9IHByb3RvdHlwZUVsZW1lbnQuZGF0YXNldC5wcm90b3R5cGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Q29udGFpbmVyOiBmdW5jdGlvbiAoc2V0dGluZ3MsIHByb3RvdHlwZUVsZW1lbnQpIHtcbiAgICAgICAgICAgIGlmIChzZXR0aW5ncy5jb250YWluZXJTZWxlY3Rvcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNldHRpbmdzLmNvbnRhaW5lclNlbGVjdG9yKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZGF0YUNvbnRhaW5lcklkID0gcHJvdG90eXBlRWxlbWVudCA/IHByb3RvdHlwZUVsZW1lbnQuZGF0YXNldC5jb250YWluZXIgOiBudWxsO1xuICAgICAgICAgICAgICAgIHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChkYXRhQ29udGFpbmVySWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIEV4dGVuZGluZyB0aGUgcHJvdG90eXBlIG9mIE5vZGVMaXN0XG4gICAgTm9kZUxpc3QucHJvdG90eXBlLmhhbmRsZVByb3RvdHlwZXMgPSBmdW5jdGlvbiAobWV0aG9kKSB7XG4gICAgICAgIGlmIChtZXRob2RzW21ldGhvZF0pIHtcbiAgICAgICAgICAgIHJldHVybiBtZXRob2RzW21ldGhvZF0uYXBwbHkodGhpcywgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG1ldGhvZCA9PT0gJ29iamVjdCcgfHwgIW1ldGhvZCkge1xuICAgICAgICAgICAgcmV0dXJuIG1ldGhvZHMuaW5pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNZXRob2QgJyArIG1ldGhvZCArICcgZG9lcyBub3QgZXhpc3Qgb24gaGFuZGxlUHJvdG90eXBlcycpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIFRvIGFsbG93IGNhbGxpbmcgaGFuZGxlUHJvdG90eXBlcyBkaXJlY3RseSBvbiBhbnkgZWxlbWVudFxuICAgIEhUTUxFbGVtZW50LnByb3RvdHlwZS5oYW5kbGVQcm90b3R5cGVzID0gZnVuY3Rpb24gKG1ldGhvZCkge1xuICAgICAgICByZXR1cm4gbWV0aG9kcy5oYW5kbGVQcm90b3R5cGVzLmNhbGwoW3RoaXNdLCBtZXRob2QpO1xuICAgIH07XG5cbn0oKSk7XG4iLCJkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IG1hcEJsb2NrID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hcC1ibG9jaycpO1xuXG4gICAgaWYgKG1hcEJsb2NrKSB7XG4gICAgICAgIG1hcEJsb2NrLnN0eWxlLmhlaWdodCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYXAtd3JhcHBlcicpLmNsaWVudEhlaWdodCArICdweCc7XG5cbiAgICAgICAgZnVuY3Rpb24gaW5pdGlhbGl6ZSgpIHtcbiAgICAgICAgICAgIGNvbnN0IG1hcE9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgem9vbTogMTgsXG4gICAgICAgICAgICAgICAgY2VudGVyOiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKDQ4LjE1OTI1MTMsIDE0LjAyMzAyNTEwMDAwMDA0KSxcbiAgICAgICAgICAgICAgICBkaXNhYmxlRGVmYXVsdFVJOiB0cnVlXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3QgbWFwTmV3ID0gbmV3IGdvb2dsZS5tYXBzLk1hcChtYXBCbG9jaywgbWFwT3B0aW9ucyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhtYXBOZXcpO1xuICAgICAgICB9XG5cbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBpbml0aWFsaXplKTtcbiAgICB9XG59KTtcbiIsImNvbnN0IHNob3AgPSB3aW5kb3cuc2hvcCB8fCB7fTtcblxuKGZ1bmN0aW9uIChzaG9wKSB7XG4gICAgc2hvcC5pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBzaG9wLmluaXRDaGFuZ2VBZGRyZXNzKCk7XG4gICAgICAgIHNob3AuaW5pdENhcnRTaGlwbWVudENhbGN1bGF0b3IoKTtcbiAgICAgICAgc2hvcC5pbml0UXVhbnRpdHlWYWxpZGF0b3IoKTtcbiAgICAgICAgc2hvcC5pbml0Q2F0ZWdvcnlTZWxlY3QoKTtcblxuICAgICAgICBoYW5kbGVQcm90b3R5cGVzKHtcbiAgICAgICAgICAgICdwcm90b3R5cGVQcmVmaXgnOiAncGF5bWVudFByb3ZpZGVyJyxcbiAgICAgICAgICAgICdjb250YWluZXJTZWxlY3Rvcic6ICcucGF5bWVudFNldHRpbmdzJyxcbiAgICAgICAgICAgICdzZWxlY3RvckF0dHInOiAnZGF0YS1mYWN0b3J5J1xuICAgICAgICB9KTtcblxuICAgICAgICBzZXR1cENvcHlUb0NsaXBib2FyZCgpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVQcm90b3R5cGVzKG9wdGlvbnMpIHtcbiAgICAgICAgY29uc3Qgc2V0dGluZ3MgPSB7XG4gICAgICAgICAgICBwcm90b3R5cGVQcmVmaXg6IG9wdGlvbnMucHJvdG90eXBlUHJlZml4IHx8IGZhbHNlLFxuICAgICAgICAgICAgY29udGFpbmVyU2VsZWN0b3I6IG9wdGlvbnMuY29udGFpbmVyU2VsZWN0b3IgfHwgZmFsc2UsXG4gICAgICAgICAgICBzZWxlY3RvckF0dHI6IG9wdGlvbnMuc2VsZWN0b3JBdHRyIHx8IGZhbHNlXG4gICAgICAgIH07XG5cbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChgW2RhdGEtJHtzZXR0aW5ncy5wcm90b3R5cGVQcmVmaXh9XWApLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHNob3dFbGVtZW50KGVsZW1lbnQsIGZhbHNlKTtcbiAgICAgICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNob3dFbGVtZW50KGVsZW1lbnQsIHRydWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZ1bmN0aW9uIHNob3dFbGVtZW50KGVsZW1lbnQsIHJlcGxhY2UpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkVmFsdWUgPSBnZXRTZWxlY3RlZFZhbHVlKGVsZW1lbnQpO1xuICAgICAgICAgICAgY29uc3QgcHJvdG90eXBlUHJlZml4ID0gc2V0dGluZ3MucHJvdG90eXBlUHJlZml4IHx8IGVsZW1lbnQuaWQ7XG4gICAgICAgICAgICBjb25zdCBwcm90b3R5cGVFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYCR7cHJvdG90eXBlUHJlZml4fV8ke3NlbGVjdGVkVmFsdWV9YCk7XG4gICAgICAgICAgICBjb25zdCBjb250YWluZXIgPSBnZXRDb250YWluZXIocHJvdG90eXBlRWxlbWVudCk7XG5cbiAgICAgICAgICAgIGlmIChjb250YWluZXIgJiYgKHJlcGxhY2UgfHwgIWNvbnRhaW5lci5pbm5lckhUTUwudHJpbSgpKSkge1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSBwcm90b3R5cGVFbGVtZW50ID8gcHJvdG90eXBlRWxlbWVudC5kYXRhc2V0LnByb3RvdHlwZSA6ICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZ2V0U2VsZWN0ZWRWYWx1ZShlbGVtZW50KSB7XG4gICAgICAgICAgICBpZiAoc2V0dGluZ3Muc2VsZWN0b3JBdHRyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQucXVlcnlTZWxlY3RvcihgW3ZhbHVlPVwiJHtlbGVtZW50LnZhbHVlfVwiXWApLmdldEF0dHJpYnV0ZShzZXR0aW5ncy5zZWxlY3RvckF0dHIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQudmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBnZXRDb250YWluZXIocHJvdG90eXBlRWxlbWVudCkge1xuICAgICAgICAgICAgaWYgKHNldHRpbmdzLmNvbnRhaW5lclNlbGVjdG9yKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2V0dGluZ3MuY29udGFpbmVyU2VsZWN0b3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb3RvdHlwZUVsZW1lbnQgPyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHByb3RvdHlwZUVsZW1lbnQuZGF0YXNldC5jb250YWluZXIpIDogbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNldHVwQ29weVRvQ2xpcGJvYXJkKCkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY29weS10by1jbGlwYm9hcmQnKS5mb3JFYWNoKGZ1bmN0aW9uIChidXR0b24pIHtcbiAgICAgICAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGNvcHlUZXh0VG9DbGlwYm9hcmQodGhpcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29weVRleHRUb0NsaXBib2FyZChidXR0b24pIHtcbiAgICAgICAgY29uc3QgdGFyZ2V0SWQgPSBidXR0b24uZGF0YXNldC50YXJnZXQ7XG4gICAgICAgIGNvbnN0IGNvcHlUZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGFyZ2V0SWQpO1xuXG4gICAgICAgIGlmIChjb3B5VGV4dCkge1xuICAgICAgICAgICAgY29weVRleHQuc2VsZWN0KCk7XG4gICAgICAgICAgICBjb3B5VGV4dC5zZXRTZWxlY3Rpb25SYW5nZSgwLCA5OTk5OSk7IC8vIEZvciBtb2JpbGUgZGV2aWNlc1xuXG4gICAgICAgICAgICBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChjb3B5VGV4dC52YWx1ZSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYnV0dG9uLmRhdGFzZXQuY29waWVkVGV4dCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNob3AuaW5pdENhdGVnb3J5U2VsZWN0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnNpdGUtcmVsb2FkXCIpLmZvckVhY2goZnVuY3Rpb24gKHNlbGVjdCkge1xuICAgICAgICAgICAgc2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSB1cGRhdGVRdWVyeVN0cmluZ1BhcmFtZXRlcih3aW5kb3cubG9jYXRpb24uaHJlZiwgdGhpcy5uYW1lLCB0aGlzLnZhbHVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gdXBkYXRlUXVlcnlTdHJpbmdQYXJhbWV0ZXIodXJpLCBrZXksIHZhbHVlKSB7XG4gICAgICAgIGNvbnN0IHJlID0gbmV3IFJlZ0V4cChcIihbPyZdKVwiICsga2V5ICsgXCI9Lio/KCZ8JClcIiwgXCJpXCIpO1xuICAgICAgICBjb25zdCBzZXBhcmF0b3IgPSB1cmkuaW5kZXhPZignPycpICE9PSAtMSA/IFwiJlwiIDogXCI/XCI7XG4gICAgICAgIHJldHVybiB1cmkubWF0Y2gocmUpID8gdXJpLnJlcGxhY2UocmUsICckMScgKyBrZXkgKyBcIj1cIiArIHZhbHVlICsgJyQyJykgOiB1cmkgKyBzZXBhcmF0b3IgKyBrZXkgKyBcIj1cIiArIHZhbHVlO1xuICAgIH1cblxuICAgIHNob3AuaW5pdFF1YW50aXR5VmFsaWRhdG9yID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBjb3Jlc2hvcFF1YW50aXR5U2VsZWN0b3Ioe1xuICAgICAgICAgICAgYnV0dG9uZG93bl9jbGFzczogJ2J0biBidG4tc2Vjb25kYXJ5JyxcbiAgICAgICAgICAgIGJ1dHRvbnVwX2NsYXNzOiAnYnRuIGJ0bi1zZWNvbmRhcnknLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgc2hvcC5pbml0Q2FydFNoaXBtZW50Q2FsY3VsYXRvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICBjb25zdCBmb3JtID0gZXYudGFyZ2V0LmNsb3Nlc3QoJ2Zvcm1bbmFtZT1cImNvcmVzaG9wX3NoaXBwaW5nX2NhbGN1bGF0b3JcIl0nKTtcbiAgICAgICAgICAgIGlmIChmb3JtKSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlU2hpcG1lbnRDYWxjdWxhdGlvbihmb3JtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGhhbmRsZVNoaXBtZW50Q2FsY3VsYXRpb24oZm9ybSkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBmb3JtLmNsYXNzTGlzdC5hZGQoJ2xvYWRpbmcnKTtcbiAgICAgICAgZm9ybS5xdWVyeVNlbGVjdG9yKCdidXR0b25bdHlwZT1cInN1Ym1pdFwiXScpLnNldEF0dHJpYnV0ZSgnZGlzYWJsZWQnLCAnZGlzYWJsZWQnKTtcbiAgICAgICAgZm9ybS5jbG9zZXN0KCcuY2FydC1zaGlwbWVudC1jYWxjdWxhdGlvbi1ib3gnKS5xdWVyeVNlbGVjdG9yKCcuY2FydC1zaGlwbWVudC1hdmFpbGFibGUtY2FycmllcnMnKS5zdHlsZS5vcGFjaXR5ID0gMC4yO1xuXG4gICAgICAgIGZldGNoKGZvcm0uYWN0aW9uLCB7XG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIGJvZHk6IG5ldyBVUkxTZWFyY2hQYXJhbXMobmV3IEZvcm1EYXRhKGZvcm0pKVxuICAgICAgICB9KVxuICAgICAgICAudGhlbihyZXNwb25zZSA9PiByZXNwb25zZS50ZXh0KCkpXG4gICAgICAgIC50aGVuKHJlcyA9PiB1cGRhdGVTaGlwbWVudENhbGN1bGF0aW9uKGZvcm0sIHJlcykpXG4gICAgICAgIC5jYXRjaChlcnJvciA9PiBoYW5kbGVTaGlwbWVudEVycm9yKGZvcm0sIGVycm9yKSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlU2hpcG1lbnRDYWxjdWxhdGlvbihmb3JtLCByZXNwb25zZVRleHQpIHtcbiAgICAgICAgZm9ybS5jbGFzc0xpc3QucmVtb3ZlKCdsb2FkaW5nJyk7XG4gICAgICAgIGZvcm0uY2xvc2VzdCgnLmNhcnQtc2hpcG1lbnQtY2FsY3VsYXRpb24tYm94Jykub3V0ZXJIVE1MID0gcmVzcG9uc2VUZXh0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhhbmRsZVNoaXBtZW50RXJyb3IoZm9ybSwgZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3I6JywgZXJyb3IpO1xuICAgICAgICBmb3JtLmNsYXNzTGlzdC5yZW1vdmUoJ2xvYWRpbmcnKTtcbiAgICAgICAgZm9ybS5xdWVyeVNlbGVjdG9yKCdidXR0b25bdHlwZT1cInN1Ym1pdFwiXScpLnJlbW92ZUF0dHJpYnV0ZSgnZGlzYWJsZWQnKTtcbiAgICB9XG5cbiAgICBzaG9wLmluaXRDaGFuZ2VBZGRyZXNzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zdCBhZGRyZXNzU3RlcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jaGVja291dC1zdGVwLnN0ZXAtYWRkcmVzcycpO1xuICAgICAgICBpZiAoIWFkZHJlc3NTdGVwKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgaW52b2ljZUFkZHJlc3MgPSBhZGRyZXNzU3RlcC5xdWVyeVNlbGVjdG9yKCdzZWxlY3RbbmFtZT1cImNvcmVzaG9wW2ludm9pY2VBZGRyZXNzXVwiXScpO1xuICAgICAgICBjb25zdCBzaGlwcGluZ0FkZHJlc3MgPSBhZGRyZXNzU3RlcC5xdWVyeVNlbGVjdG9yKCdzZWxlY3RbbmFtZT1cImNvcmVzaG9wW3NoaXBwaW5nQWRkcmVzc11cIl0nKTtcbiAgICAgICAgY29uc3QgdXNlSWFzUyA9IGFkZHJlc3NTdGVwLnF1ZXJ5U2VsZWN0b3IoJ1tuYW1lPVwiY29yZXNob3BbdXNlSW52b2ljZUFzU2hpcHBpbmddXCJdJyk7XG5cbiAgICAgICAgc2V0dXBBZGRyZXNzQ2hhbmdlRXZlbnRzKGludm9pY2VBZGRyZXNzLCBzaGlwcGluZ0FkZHJlc3MsIHVzZUlhc1MpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBzZXR1cEFkZHJlc3NDaGFuZ2VFdmVudHMoaW52b2ljZUFkZHJlc3MsIHNoaXBwaW5nQWRkcmVzcywgdXNlSWFzUykge1xuICAgICAgICBpbnZvaWNlQWRkcmVzcy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB1cGRhdGVBZGRyZXNzKGludm9pY2VBZGRyZXNzLCB1c2VJYXNTKSk7XG4gICAgICAgIHNoaXBwaW5nQWRkcmVzcy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB1cGRhdGVTaGlwcGluZ0FkZHJlc3Moc2hpcHBpbmdBZGRyZXNzKSk7XG4gICAgICAgIGlmICh1c2VJYXNTKSB1c2VJYXNTLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHRvZ2dsZVNoaXBwaW5nQWRkcmVzcyh1c2VJYXNTLCBpbnZvaWNlQWRkcmVzcywgc2hpcHBpbmdBZGRyZXNzKSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlQWRkcmVzcyhpbnZvaWNlQWRkcmVzcywgdXNlSWFzUykge1xuICAgICAgICBjb25zdCBzZWxlY3RlZCA9IGludm9pY2VBZGRyZXNzLm9wdGlvbnNbaW52b2ljZUFkZHJlc3Muc2VsZWN0ZWRJbmRleF07XG4gICAgICAgIGNvbnN0IGFkZHJlc3MgPSBKU09OLnBhcnNlKHNlbGVjdGVkLmRhdGFzZXQuYWRkcmVzcykuaHRtbDtcbiAgICAgICAgY29uc3QgaW52b2ljZVBhbmVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnBhbmVsLWludm9pY2UtYWRkcmVzcycpO1xuICAgICAgICBpbnZvaWNlUGFuZWwuaW5uZXJIVE1MID0gYWRkcmVzcyB8fCAnJztcblxuICAgICAgICB0b2dnbGVVc2VBc1NoaXBwaW5nKHVzZUlhc1MsIHNlbGVjdGVkLmRhdGFzZXQuYWRkcmVzc1R5cGUgPT09ICdpbnZvaWNlJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdG9nZ2xlVXNlQXNTaGlwcGluZyh1c2VJYXNTLCBpc0ludm9pY2VUeXBlKSB7XG4gICAgICAgIGlmICh1c2VJYXNTKSB7XG4gICAgICAgICAgICB1c2VJYXNTLmRpc2FibGVkID0gaXNJbnZvaWNlVHlwZTtcbiAgICAgICAgICAgIGlmIChpc0ludm9pY2VUeXBlKSB7XG4gICAgICAgICAgICAgICAgdXNlSWFzUy5jaGVja2VkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdXNlSWFzUy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnY2hhbmdlJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlU2hpcHBpbmdBZGRyZXNzKHNoaXBwaW5nQWRkcmVzcykge1xuICAgICAgICBjb25zdCBzZWxlY3RlZCA9IHNoaXBwaW5nQWRkcmVzcy5vcHRpb25zW3NoaXBwaW5nQWRkcmVzcy5zZWxlY3RlZEluZGV4XTtcbiAgICAgICAgY29uc3QgYWRkcmVzcyA9IEpTT04ucGFyc2Uoc2VsZWN0ZWQuZGF0YXNldC5hZGRyZXNzKS5odG1sO1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucGFuZWwtc2hpcHBpbmctYWRkcmVzcycpLmlubmVySFRNTCA9IGFkZHJlc3MgfHwgJyc7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdG9nZ2xlU2hpcHBpbmdBZGRyZXNzKHVzZUlhc1MsIGludm9pY2VBZGRyZXNzLCBzaGlwcGluZ0FkZHJlc3MpIHtcbiAgICAgICAgY29uc3Qgc2hpcHBpbmdGaWVsZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zaGlwcGluZy1hZGRyZXNzLXNlbGVjdG9yJyk7XG4gICAgICAgIGNvbnN0IHNoaXBwaW5nQWRkQWRkcmVzc0J1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jYXJkLWZvb3RlcicpO1xuXG4gICAgICAgIGlmICh1c2VJYXNTLmNoZWNrZWQpIHtcbiAgICAgICAgICAgIHNoaXBwaW5nRmllbGQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgIHNoaXBwaW5nQWRkcmVzcy52YWx1ZSA9IGludm9pY2VBZGRyZXNzLnZhbHVlO1xuICAgICAgICAgICAgc2hpcHBpbmdBZGRyZXNzLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdjaGFuZ2UnKSk7XG4gICAgICAgICAgICBpZiAoc2hpcHBpbmdBZGRBZGRyZXNzQnV0dG9uKSBzaGlwcGluZ0FkZEFkZHJlc3NCdXR0b24uY2xhc3NMaXN0LmFkZCgnZC1ub25lJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzaGlwcGluZ0ZpZWxkLnN0eWxlLmRpc3BsYXkgPSAnJztcbiAgICAgICAgICAgIGlmIChzaGlwcGluZ0FkZEFkZHJlc3NCdXR0b24pIHNoaXBwaW5nQWRkQWRkcmVzc0J1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKCdkLW5vbmUnKTtcbiAgICAgICAgfVxuICAgIH1cblxufShzaG9wKSk7XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgc2hvcC5pbml0KCk7XG59KTtcbiIsIihmdW5jdGlvbiAodmFyaWFudCkge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHdpbmRvdy52YXJpYW50UmVhZHkgPSBmYWxzZTtcblxuICAgICAgICB2YXJpYW50LmluaXQoKTtcblxuICAgICAgICB3aW5kb3cudmFyaWFudFJlYWR5ID0gdHJ1ZTtcbiAgICB9KTtcblxuICAgIHZhcmlhbnQuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29uc3QgdmFyaWFudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucHJvZHVjdC1pbmZvX19hdHRyaWJ1dGVzJyk7XG4gICAgICAgIGlmICghdmFyaWFudHMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvcmVzaG9wVmFyaWFudFNlbGVjdG9yKHZhcmlhbnRzKTsgLy8gRW5zdXJlIHRoaXMgZnVuY3Rpb24gaXMgZGVmaW5lZCBpbiB5b3VyIGdsb2JhbCBzY29wZVxuXG4gICAgICAgIHZhcmlhbnRzLmFkZEV2ZW50TGlzdGVuZXIoJ3ZhcmlhbnRfc2VsZWN0b3Iuc2VsZWN0JywgKGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG9wdGlvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucHJvZHVjdC1pbmZvIC5wcm9kdWN0LWRldGFpbHMgLm9wdGlvbnMnKTtcblxuICAgICAgICAgICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzdWJtaXRzID0gb3B0aW9ucy5xdWVyeVNlbGVjdG9yQWxsKCdbdHlwZT1cInN1Ym1pdFwiXScpO1xuXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5jbGFzc0xpc3QuYWRkKCdkaXNhYmxlZCcpO1xuXG4gICAgICAgICAgICAgICAgc3VibWl0cy5mb3JFYWNoKChzdWJtaXQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgc3VibWl0LmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcbn0od2luZG93LnZhcmlhbnQgfHwgKHdpbmRvdy52YXJpYW50ID0ge30pKSk7IC8vIEV4dHJhY3RlZCBhc3NpZ25tZW50XG4iLCIvKiBTVFlMRVMgICovXG5pbXBvcnQgJy4uL3Njc3MvYXBwLnNjc3MnO1xuaW1wb3J0ICdzd2lwZXIvY3NzL2J1bmRsZSc7XG4vKiBKUyAqL1xuaW1wb3J0ICdib290c3RyYXAnO1xuaW1wb3J0ICcuL3NjcmlwdHMvaGFuZGxlLXByb3RvdHlwZXMuanMnO1xuaW1wb3J0ICcuL3BsdWdpbi9jb3Jlc2hvcC5wbHVnaW4ucXVhbnRpdHkuanMnO1xuaW1wb3J0ICcuL3BsdWdpbi9jb3Jlc2hvcC5wbHVnaW4udmFyaWFudC5qcyc7XG5pbXBvcnQgJy4vc2NyaXB0cy9zaG9wLmpzJztcbmltcG9ydCAnLi9zY3JpcHRzL3ZhcmlhbnQuanMnO1xuaW1wb3J0ICcuL3NjcmlwdHMvbWFwLmpzJztcbmltcG9ydCB7IENhcm91c2VsIH0gZnJvbSAnLi9zY3JpcHRzL2Nhcm91c2VsJztcbmltcG9ydCB7IENhcnRJbmZvIH0gZnJvbSAnLi9zY3JpcHRzL2NhcnRJbmZvJztcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIENhcnRXaWRnZXQgPSBuZXcgQ2FydEluZm8oJy9jb3Jlc2hvcF9nZXRfY2FydF9pdGVtcycsICcuanMtY2FydC13aWRnZXQnKTtcbiAgICB2YXIgQ2Fyb3VzZWxQcm9kdWN0cyA9IG5ldyBDYXJvdXNlbCgpO1xuICAgIGNvbnNvbGUubG9nKENhcnRXaWRnZXQpO1xuICAgIGNvbnNvbGUubG9nKENhcm91c2VsUHJvZHVjdHMpO1xufSk7XG4iLCJpbXBvcnQgU3dpcGVyIGZyb20gJ3N3aXBlcic7XG5pbXBvcnQgeyBUaHVtYnMgfSBmcm9tIFwic3dpcGVyL21vZHVsZXNcIjtcbnZhciBDYXJvdXNlbCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBDYXJvdXNlbCgpIHtcbiAgICAgICAgdGhpcy5faW5pdENhcm91c2VsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLyogSW5pdCBzd2lwZXIgd2l0aCB0aHVtYnMgKi9cbiAgICAgICAgICAgIHZhciBzbGlkZXJUaHVtYm5haWwgPSBuZXcgU3dpcGVyKCcuanMtc2xpZGVyLXRodW1ibmFpbCcsIHtcbiAgICAgICAgICAgICAgICBzbGlkZXNQZXJWaWV3OiAzLFxuICAgICAgICAgICAgICAgIGZyZWVNb2RlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNwYWNlQmV0d2VlbjogJzhweCcsXG4gICAgICAgICAgICAgICAgd2F0Y2hTbGlkZXNQcm9ncmVzczogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIG1haW5TbGlkZXIgPSBuZXcgU3dpcGVyKCcuanMtc2xpZGVyJywge1xuICAgICAgICAgICAgICAgIG1vZHVsZXM6IFtUaHVtYnNdLCAvLyBJbmNsdWRlIHRoZSBUaHVtYnMgbW9kdWxlXG4gICAgICAgICAgICAgICAgbmF2aWdhdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICBuZXh0RWw6ICcuc3dpcGVyLWJ1dHRvbi1uZXh0JyxcbiAgICAgICAgICAgICAgICAgICAgcHJldkVsOiAnLnN3aXBlci1idXR0b24tcHJldicsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aHVtYnM6IHtcbiAgICAgICAgICAgICAgICAgICAgc3dpcGVyOiBzbGlkZXJUaHVtYm5haWwgLy8gTGluayB0aHVtYm5haWwgc3dpcGVyXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhtYWluU2xpZGVyKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5faW5pdENhcm91c2VsKCk7XG4gICAgfVxuICAgIHJldHVybiBDYXJvdXNlbDtcbn0oKSk7XG5leHBvcnQgeyBDYXJvdXNlbCB9O1xuIiwidmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG52YXIgX19nZW5lcmF0b3IgPSAodGhpcyAmJiB0aGlzLl9fZ2VuZXJhdG9yKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgYm9keSkge1xuICAgIHZhciBfID0geyBsYWJlbDogMCwgc2VudDogZnVuY3Rpb24oKSB7IGlmICh0WzBdICYgMSkgdGhyb3cgdFsxXTsgcmV0dXJuIHRbMV07IH0sIHRyeXM6IFtdLCBvcHM6IFtdIH0sIGYsIHksIHQsIGcgPSBPYmplY3QuY3JlYXRlKCh0eXBlb2YgSXRlcmF0b3IgPT09IFwiZnVuY3Rpb25cIiA/IEl0ZXJhdG9yIDogT2JqZWN0KS5wcm90b3R5cGUpO1xuICAgIHJldHVybiBnLm5leHQgPSB2ZXJiKDApLCBnW1widGhyb3dcIl0gPSB2ZXJiKDEpLCBnW1wicmV0dXJuXCJdID0gdmVyYigyKSwgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIChnW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXM7IH0pLCBnO1xuICAgIGZ1bmN0aW9uIHZlcmIobikgeyByZXR1cm4gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIHN0ZXAoW24sIHZdKTsgfTsgfVxuICAgIGZ1bmN0aW9uIHN0ZXAob3ApIHtcbiAgICAgICAgaWYgKGYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJHZW5lcmF0b3IgaXMgYWxyZWFkeSBleGVjdXRpbmcuXCIpO1xuICAgICAgICB3aGlsZSAoZyAmJiAoZyA9IDAsIG9wWzBdICYmIChfID0gMCkpLCBfKSB0cnkge1xuICAgICAgICAgICAgaWYgKGYgPSAxLCB5ICYmICh0ID0gb3BbMF0gJiAyID8geVtcInJldHVyblwiXSA6IG9wWzBdID8geVtcInRocm93XCJdIHx8ICgodCA9IHlbXCJyZXR1cm5cIl0pICYmIHQuY2FsbCh5KSwgMCkgOiB5Lm5leHQpICYmICEodCA9IHQuY2FsbCh5LCBvcFsxXSkpLmRvbmUpIHJldHVybiB0O1xuICAgICAgICAgICAgaWYgKHkgPSAwLCB0KSBvcCA9IFtvcFswXSAmIDIsIHQudmFsdWVdO1xuICAgICAgICAgICAgc3dpdGNoIChvcFswXSkge1xuICAgICAgICAgICAgICAgIGNhc2UgMDogY2FzZSAxOiB0ID0gb3A7IGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgNDogXy5sYWJlbCsrOyByZXR1cm4geyB2YWx1ZTogb3BbMV0sIGRvbmU6IGZhbHNlIH07XG4gICAgICAgICAgICAgICAgY2FzZSA1OiBfLmxhYmVsKys7IHkgPSBvcFsxXTsgb3AgPSBbMF07IGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGNhc2UgNzogb3AgPSBfLm9wcy5wb3AoKTsgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBpZiAoISh0ID0gXy50cnlzLCB0ID0gdC5sZW5ndGggPiAwICYmIHRbdC5sZW5ndGggLSAxXSkgJiYgKG9wWzBdID09PSA2IHx8IG9wWzBdID09PSAyKSkgeyBfID0gMDsgY29udGludWU7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSAzICYmICghdCB8fCAob3BbMV0gPiB0WzBdICYmIG9wWzFdIDwgdFszXSkpKSB7IF8ubGFiZWwgPSBvcFsxXTsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSA2ICYmIF8ubGFiZWwgPCB0WzFdKSB7IF8ubGFiZWwgPSB0WzFdOyB0ID0gb3A7IGJyZWFrOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0ICYmIF8ubGFiZWwgPCB0WzJdKSB7IF8ubGFiZWwgPSB0WzJdOyBfLm9wcy5wdXNoKG9wKTsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRbMl0pIF8ub3BzLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb3AgPSBib2R5LmNhbGwodGhpc0FyZywgXyk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHsgb3AgPSBbNiwgZV07IHkgPSAwOyB9IGZpbmFsbHkgeyBmID0gdCA9IDA7IH1cbiAgICAgICAgaWYgKG9wWzBdICYgNSkgdGhyb3cgb3BbMV07IHJldHVybiB7IHZhbHVlOiBvcFswXSA/IG9wWzFdIDogdm9pZCAwLCBkb25lOiB0cnVlIH07XG4gICAgfVxufTtcbnZhciBDYXJ0SW5mbyA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBDYXJ0SW5mbyhhcGlVcmwsIGVsZW1lbnRTZWxlY3Rvcikge1xuICAgICAgICB0aGlzLmFwaVVybCA9IGFwaVVybDtcbiAgICAgICAgdGhpcy5lbGVtZW50U2VsZWN0b3IgPSBlbGVtZW50U2VsZWN0b3I7XG4gICAgICAgIHRoaXMuX2luaXRDYXJ0V2lkZ2V0KCk7XG4gICAgfVxuICAgIENhcnRJbmZvLnByb3RvdHlwZS5mZXRjaENhcnRJdGVtcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHJlc3BvbnNlLCBodG1sLCBlcnJvcl8xO1xuICAgICAgICAgICAgcmV0dXJuIF9fZ2VuZXJhdG9yKHRoaXMsIGZ1bmN0aW9uIChfYSkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoX2EubGFiZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgICAgICAgICAgX2EudHJ5cy5wdXNoKFswLCAzLCAsIDRdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbNCAvKnlpZWxkKi8sIGZldGNoKHRoaXMuYXBpVXJsKV07XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gX2Euc2VudCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1RoZXJlIGhhcyBiZWVuIGEgcHJvYmxlbSB3aXRoIHlvdXIgZmV0Y2ggb3BlcmF0aW9uOicsIHJlc3BvbnNlLnN0YXR1c1RleHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbMiAvKnJldHVybiovXTsgLy8gQWRkZWQgcmV0dXJuIHRvIHByZXZlbnQgZnVydGhlciBleGVjdXRpb24gaWYgdGhlcmUncyBhbiBlcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFs0IC8qeWllbGQqLywgcmVzcG9uc2UudGV4dCgpXTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgICAgICAgICAgaHRtbCA9IF9hLnNlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGlzcGxheUNhcnRJdGVtcyhodG1sKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbMyAvKmJyZWFrKi8sIDRdO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcl8xID0gX2Euc2VudCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignVGhlcmUgaGFzIGJlZW4gYSBwcm9ibGVtIHdpdGggeW91ciBmZXRjaCBvcGVyYXRpb246JywgZXJyb3JfMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzMgLypicmVhayovLCA0XTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSA0OiByZXR1cm4gWzIgLypyZXR1cm4qL107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgQ2FydEluZm8ucHJvdG90eXBlLl9pbml0Q2FydFdpZGdldCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5mZXRjaENhcnRJdGVtcygpO1xuICAgIH07XG4gICAgQ2FydEluZm8ucHJvdG90eXBlLmRpc3BsYXlDYXJ0SXRlbXMgPSBmdW5jdGlvbiAoaHRtbCkge1xuICAgICAgICB2YXIgY2FydEZsYWcgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuZWxlbWVudFNlbGVjdG9yKTtcbiAgICAgICAgaWYgKGNhcnRGbGFnKSB7XG4gICAgICAgICAgICB2YXIgbG9hZGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhcnQtbG9hZGVyJyk7XG4gICAgICAgICAgICBpZiAobG9hZGVyKSB7XG4gICAgICAgICAgICAgICAgbG9hZGVyLnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FydEZsYWcuaW5uZXJIVE1MICs9IGh0bWw7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBDYXJ0SW5mbztcbn0oKSk7XG5leHBvcnQgeyBDYXJ0SW5mbyB9O1xuIiwiLy8gZXh0cmFjdGVkIGJ5IG1pbmktY3NzLWV4dHJhY3QtcGx1Z2luXG5leHBvcnQge307IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbi8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBfX3dlYnBhY2tfbW9kdWxlc19fO1xuXG4iLCJ2YXIgZGVmZXJyZWQgPSBbXTtcbl9fd2VicGFja19yZXF1aXJlX18uTyA9IChyZXN1bHQsIGNodW5rSWRzLCBmbiwgcHJpb3JpdHkpID0+IHtcblx0aWYoY2h1bmtJZHMpIHtcblx0XHRwcmlvcml0eSA9IHByaW9yaXR5IHx8IDA7XG5cdFx0Zm9yKHZhciBpID0gZGVmZXJyZWQubGVuZ3RoOyBpID4gMCAmJiBkZWZlcnJlZFtpIC0gMV1bMl0gPiBwcmlvcml0eTsgaS0tKSBkZWZlcnJlZFtpXSA9IGRlZmVycmVkW2kgLSAxXTtcblx0XHRkZWZlcnJlZFtpXSA9IFtjaHVua0lkcywgZm4sIHByaW9yaXR5XTtcblx0XHRyZXR1cm47XG5cdH1cblx0dmFyIG5vdEZ1bGZpbGxlZCA9IEluZmluaXR5O1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IGRlZmVycmVkLmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIGNodW5rSWRzID0gZGVmZXJyZWRbaV1bMF07XG5cdFx0dmFyIGZuID0gZGVmZXJyZWRbaV1bMV07XG5cdFx0dmFyIHByaW9yaXR5ID0gZGVmZXJyZWRbaV1bMl07XG5cdFx0dmFyIGZ1bGZpbGxlZCA9IHRydWU7XG5cdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBjaHVua0lkcy5sZW5ndGg7IGorKykge1xuXHRcdFx0aWYgKChwcmlvcml0eSAmIDEgPT09IDAgfHwgbm90RnVsZmlsbGVkID49IHByaW9yaXR5KSAmJiBPYmplY3Qua2V5cyhfX3dlYnBhY2tfcmVxdWlyZV9fLk8pLmV2ZXJ5KChrZXkpID0+IChfX3dlYnBhY2tfcmVxdWlyZV9fLk9ba2V5XShjaHVua0lkc1tqXSkpKSkge1xuXHRcdFx0XHRjaHVua0lkcy5zcGxpY2Uoai0tLCAxKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGZ1bGZpbGxlZCA9IGZhbHNlO1xuXHRcdFx0XHRpZihwcmlvcml0eSA8IG5vdEZ1bGZpbGxlZCkgbm90RnVsZmlsbGVkID0gcHJpb3JpdHk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmKGZ1bGZpbGxlZCkge1xuXHRcdFx0ZGVmZXJyZWQuc3BsaWNlKGktLSwgMSlcblx0XHRcdHZhciByID0gZm4oKTtcblx0XHRcdGlmIChyICE9PSB1bmRlZmluZWQpIHJlc3VsdCA9IHI7XG5cdFx0fVxuXHR9XG5cdHJldHVybiByZXN1bHQ7XG59OyIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSAobW9kdWxlKSA9PiB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdCgpID0+IChtb2R1bGVbJ2RlZmF1bHQnXSkgOlxuXHRcdCgpID0+IChtb2R1bGUpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5nID0gKGZ1bmN0aW9uKCkge1xuXHRpZiAodHlwZW9mIGdsb2JhbFRoaXMgPT09ICdvYmplY3QnKSByZXR1cm4gZ2xvYmFsVGhpcztcblx0dHJ5IHtcblx0XHRyZXR1cm4gdGhpcyB8fCBuZXcgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblx0fSBjYXRjaCAoZSkge1xuXHRcdGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JykgcmV0dXJuIHdpbmRvdztcblx0fVxufSkoKTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiLy8gbm8gYmFzZVVSSVxuXG4vLyBvYmplY3QgdG8gc3RvcmUgbG9hZGVkIGFuZCBsb2FkaW5nIGNodW5rc1xuLy8gdW5kZWZpbmVkID0gY2h1bmsgbm90IGxvYWRlZCwgbnVsbCA9IGNodW5rIHByZWxvYWRlZC9wcmVmZXRjaGVkXG4vLyBbcmVzb2x2ZSwgcmVqZWN0LCBQcm9taXNlXSA9IGNodW5rIGxvYWRpbmcsIDAgPSBjaHVuayBsb2FkZWRcbnZhciBpbnN0YWxsZWRDaHVua3MgPSB7XG5cdFwiYXBwXCI6IDBcbn07XG5cbi8vIG5vIGNodW5rIG9uIGRlbWFuZCBsb2FkaW5nXG5cbi8vIG5vIHByZWZldGNoaW5nXG5cbi8vIG5vIHByZWxvYWRlZFxuXG4vLyBubyBITVJcblxuLy8gbm8gSE1SIG1hbmlmZXN0XG5cbl9fd2VicGFja19yZXF1aXJlX18uTy5qID0gKGNodW5rSWQpID0+IChpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF0gPT09IDApO1xuXG4vLyBpbnN0YWxsIGEgSlNPTlAgY2FsbGJhY2sgZm9yIGNodW5rIGxvYWRpbmdcbnZhciB3ZWJwYWNrSnNvbnBDYWxsYmFjayA9IChwYXJlbnRDaHVua0xvYWRpbmdGdW5jdGlvbiwgZGF0YSkgPT4ge1xuXHR2YXIgY2h1bmtJZHMgPSBkYXRhWzBdO1xuXHR2YXIgbW9yZU1vZHVsZXMgPSBkYXRhWzFdO1xuXHR2YXIgcnVudGltZSA9IGRhdGFbMl07XG5cdC8vIGFkZCBcIm1vcmVNb2R1bGVzXCIgdG8gdGhlIG1vZHVsZXMgb2JqZWN0LFxuXHQvLyB0aGVuIGZsYWcgYWxsIFwiY2h1bmtJZHNcIiBhcyBsb2FkZWQgYW5kIGZpcmUgY2FsbGJhY2tcblx0dmFyIG1vZHVsZUlkLCBjaHVua0lkLCBpID0gMDtcblx0aWYoY2h1bmtJZHMuc29tZSgoaWQpID0+IChpbnN0YWxsZWRDaHVua3NbaWRdICE9PSAwKSkpIHtcblx0XHRmb3IobW9kdWxlSWQgaW4gbW9yZU1vZHVsZXMpIHtcblx0XHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhtb3JlTW9kdWxlcywgbW9kdWxlSWQpKSB7XG5cdFx0XHRcdF9fd2VicGFja19yZXF1aXJlX18ubVttb2R1bGVJZF0gPSBtb3JlTW9kdWxlc1ttb2R1bGVJZF07XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmKHJ1bnRpbWUpIHZhciByZXN1bHQgPSBydW50aW1lKF9fd2VicGFja19yZXF1aXJlX18pO1xuXHR9XG5cdGlmKHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uKSBwYXJlbnRDaHVua0xvYWRpbmdGdW5jdGlvbihkYXRhKTtcblx0Zm9yKDtpIDwgY2h1bmtJZHMubGVuZ3RoOyBpKyspIHtcblx0XHRjaHVua0lkID0gY2h1bmtJZHNbaV07XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGluc3RhbGxlZENodW5rcywgY2h1bmtJZCkgJiYgaW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdKSB7XG5cdFx0XHRpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF1bMF0oKTtcblx0XHR9XG5cdFx0aW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdID0gMDtcblx0fVxuXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXy5PKHJlc3VsdCk7XG59XG5cbnZhciBjaHVua0xvYWRpbmdHbG9iYWwgPSBzZWxmW1wid2VicGFja0NodW5rXCJdID0gc2VsZltcIndlYnBhY2tDaHVua1wiXSB8fCBbXTtcbmNodW5rTG9hZGluZ0dsb2JhbC5mb3JFYWNoKHdlYnBhY2tKc29ucENhbGxiYWNrLmJpbmQobnVsbCwgMCkpO1xuY2h1bmtMb2FkaW5nR2xvYmFsLnB1c2ggPSB3ZWJwYWNrSnNvbnBDYWxsYmFjay5iaW5kKG51bGwsIGNodW5rTG9hZGluZ0dsb2JhbC5wdXNoLmJpbmQoY2h1bmtMb2FkaW5nR2xvYmFsKSk7IiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBkZXBlbmRzIG9uIG90aGVyIGxvYWRlZCBjaHVua3MgYW5kIGV4ZWN1dGlvbiBuZWVkIHRvIGJlIGRlbGF5ZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXy5PKHVuZGVmaW5lZCwgW1widmVuZG9ycy1ub2RlX21vZHVsZXNfYm9vdHN0cmFwX2Rpc3RfanNfYm9vdHN0cmFwX2VzbV9qcy1ub2RlX21vZHVsZXNfc3dpcGVyX3N3aXBlci1idW5kbGVfY3NzLTBjZGVkYlwiXSwgKCkgPT4gKF9fd2VicGFja19yZXF1aXJlX18oXCIuL2pzL2FwcC50c1wiKSkpXG5fX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXy5PKF9fd2VicGFja19leHBvcnRzX18pO1xuIiwiIl0sIm5hbWVzIjpbImNvcmVzaG9wUXVhbnRpdHlTZWxlY3RvciIsIm9wdGlvbnMiLCJpbml0UXVhbnRpdHlGaWVsZHMiLCJmaWVsZHMiLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJwcmVjaXNpb25QcmVzZXRTZWxlY3RvciIsInF1ZXJ5U2VsZWN0b3IiLCJhZGRFdmVudExpc3RlbmVyIiwiZGF0YXNldCIsImNzVW5pdElkZW50aWZpZXIiLCJxdWFudGl0eUlkZW50aWZpZXIiLCJxdWFudGl0eUlucHV0IiwiY29uY2F0Iiwic3RlcCIsImNzVW5pdFByZWNpc2lvbiIsInVwZGF0ZVRvdWNoU3BpblNldHRpbmdzIiwidG9TdHJpbmciLCJmb3JFYWNoIiwiZmllbGQiLCJpbml0aWFsaXplVG91Y2hTcGluIiwiaW5wdXQiLCJwcmVjaXNpb24iLCJjb250YWluZXIiLCJjcmVhdGVFbGVtZW50IiwiY2xhc3NMaXN0IiwiYWRkIiwiZGVjcmVtZW50QnV0dG9uIiwidHlwZSIsInRleHRDb250ZW50IiwiaW5jcmVtZW50QnV0dG9uIiwicGFyZW50Tm9kZSIsImluc2VydEJlZm9yZSIsImFwcGVuZENoaWxkIiwidmFsdWUiLCJwYXJzZUludCIsImlzTmFOIiwibWluIiwibWF4Iiwid2luZG93IiwiY29yZXNob3BWYXJpYW50U2VsZWN0b3IiLCJhdHRyaWJ1dGVDb250YWluZXIiLCJfYXR0cmlidXRlQ29udGFpbmVyIiwiX2NvbmZpZyIsIl9hdHRyaWJ1dGVHcm91cHMiLCJfaW5pdCIsIkpTT04iLCJwYXJzZSIsImNvbmZpZyIsIl9pbml0aWFsaXplQXR0cmlidXRlR3JvdXBzIiwiX3NldHVwQXR0cmlidXRlR3JvdXBTZXR0aW5ncyIsIl9zZXR1cENoYW5nZUV2ZW50cyIsImF0dHJpYnV0ZXMiLCJncm91cCIsImVsZW1lbnRzIiwiaWQiLCJwdXNoIiwiaW5kZXgiLCJwcmV2R3JvdXAiLCJuZXh0R3JvdXAiLCJzZWxlY3RlZCIsIl9jb25maWd1cmVHcm91cCIsIl9jbGVhckdyb3VwIiwiX2F0dGFjaENoYW5nZUV2ZW50IiwiX2Fzc2lnbk9uQ2hhbmdlRXZlbnQiLCJlbGVtZW50Iiwib25jaGFuZ2UiLCJfaGFuZGxlRWxlbWVudENoYW5nZSIsInZhcmlhbnRSZWFkeSIsImRpc3BhdGNoRXZlbnQiLCJfY3JlYXRlRXZlbnQiLCJfc2VsZWN0R3JvdXBFbGVtZW50IiwiX2Rlc2VsZWN0R3JvdXBFbGVtZW50IiwiX2NsZWFyR3JvdXBzIiwiX3JlZGlyZWN0VG9WYXJpYW50Iiwic2VsZWN0ZWRBdHRyaWJ1dGVzIiwiX2dldFNlbGVjdGVkQXR0cmlidXRlcyIsIm1hdGNoaW5nUHJvZHVjdCIsIl9maW5kTWF0Y2hpbmdQcm9kdWN0IiwidXJsIiwibG9jYXRpb24iLCJocmVmIiwiT2JqZWN0IiwiZnJvbUVudHJpZXMiLCJmaWx0ZXIiLCJnIiwibWFwIiwidmFsdWVzIiwiZmluZCIsInAiLCJzdHJpbmdpZnkiLCJuYW1lIiwiZGF0YSIsImFyZ3VtZW50cyIsImxlbmd0aCIsInVuZGVmaW5lZCIsIkN1c3RvbUV2ZW50IiwiYnViYmxlcyIsImNhbmNlbGFibGUiLCJkZXRhaWwiLCJfY2xlYXJHcm91cEVsZW1lbnRzIiwiZGlzYWJsZWQiLCJjaGVja2VkIiwidGFnTmFtZSIsInRvTG93ZXJDYXNlIiwiX2NsZWFyU2VsZWN0T3B0aW9ucyIsIm9wdGlvbiIsInJlbW92ZUNoaWxkIiwiX2lzUHJvZHVjdE1hdGNoaW5nRmlsdGVycyIsInByb2R1Y3QiLCJmaWx0ZXJBdHRyaWJ1dGVzIiwiZXZlcnkiLCJfY29uZmlnJGluZGV4JHByb2R1Y3QiLCJfaXNBdHRyaWJ1dGVSZWxldmFudCIsImF0dHJpYnV0ZSIsInByb2R1Y3RzIiwic29tZSIsIl9maWx0ZXJBdHRyaWJ1dGVzIiwiX2dldEZpbHRlckF0dHJpYnV0ZXMiLCJjdXJyZW50R3JvdXAiLCJfbWF0Y2hlc0FsbEZpbHRlcnMiLCJfY29uZmlnJGluZGV4JHByb2R1Y3QyIiwiX2FkZE9wdGlvblRvU2VsZWN0IiwiT3B0aW9uIiwiX2VuYWJsZUVsZW1lbnRGb3JBdHRyaWJ1dGUiLCJfY29uZmlndXJlR3JvdXBFbGVtZW50cyIsIl9jb25maWd1cmVFbGVtZW50IiwiZmlsdGVyZWRBdHRyaWJ1dGVzIiwic2xpY2UiLCJtZXRob2RzIiwiaW5pdCIsInNldHRpbmdzIiwicHJvdG90eXBlUHJlZml4IiwiY29udGFpbmVyU2VsZWN0b3IiLCJzZWxlY3RvckF0dHIiLCJzZWxlY3RvciIsInNob3ciLCJyZXBsYWNlIiwic2VsZWN0ZWRWYWx1ZSIsInNlbGVjdGVkT3B0aW9uIiwiQXJyYXkiLCJmcm9tIiwiZ2V0QXR0cmlidXRlIiwicHJvdG90eXBlRWxlbWVudCIsImdldEVsZW1lbnRCeUlkIiwiZ2V0Q29udGFpbmVyIiwiaW5uZXJIVE1MIiwidHJpbSIsInByb3RvdHlwZSIsImRhdGFDb250YWluZXJJZCIsIk5vZGVMaXN0IiwiaGFuZGxlUHJvdG90eXBlcyIsIm1ldGhvZCIsImFwcGx5IiwiY2FsbCIsIkVycm9yIiwiSFRNTEVsZW1lbnQiLCJtYXBCbG9jayIsInN0eWxlIiwiaGVpZ2h0IiwiY2xpZW50SGVpZ2h0IiwiaW5pdGlhbGl6ZSIsIm1hcE9wdGlvbnMiLCJ6b29tIiwiY2VudGVyIiwiZ29vZ2xlIiwibWFwcyIsIkxhdExuZyIsImRpc2FibGVEZWZhdWx0VUkiLCJtYXBOZXciLCJNYXAiLCJjb25zb2xlIiwibG9nIiwic2hvcCIsImluaXRDaGFuZ2VBZGRyZXNzIiwiaW5pdENhcnRTaGlwbWVudENhbGN1bGF0b3IiLCJpbml0UXVhbnRpdHlWYWxpZGF0b3IiLCJpbml0Q2F0ZWdvcnlTZWxlY3QiLCJzZXR1cENvcHlUb0NsaXBib2FyZCIsInNob3dFbGVtZW50IiwiZ2V0U2VsZWN0ZWRWYWx1ZSIsImJ1dHRvbiIsImNvcHlUZXh0VG9DbGlwYm9hcmQiLCJ0YXJnZXRJZCIsInRhcmdldCIsImNvcHlUZXh0Iiwic2VsZWN0Iiwic2V0U2VsZWN0aW9uUmFuZ2UiLCJuYXZpZ2F0b3IiLCJjbGlwYm9hcmQiLCJ3cml0ZVRleHQiLCJ0aGVuIiwiY29waWVkVGV4dCIsInVwZGF0ZVF1ZXJ5U3RyaW5nUGFyYW1ldGVyIiwidXJpIiwia2V5IiwicmUiLCJSZWdFeHAiLCJzZXBhcmF0b3IiLCJpbmRleE9mIiwibWF0Y2giLCJidXR0b25kb3duX2NsYXNzIiwiYnV0dG9udXBfY2xhc3MiLCJldiIsImZvcm0iLCJjbG9zZXN0IiwiaGFuZGxlU2hpcG1lbnRDYWxjdWxhdGlvbiIsImV2ZW50IiwicHJldmVudERlZmF1bHQiLCJzZXRBdHRyaWJ1dGUiLCJvcGFjaXR5IiwiZmV0Y2giLCJhY3Rpb24iLCJib2R5IiwiVVJMU2VhcmNoUGFyYW1zIiwiRm9ybURhdGEiLCJyZXNwb25zZSIsInRleHQiLCJyZXMiLCJ1cGRhdGVTaGlwbWVudENhbGN1bGF0aW9uIiwiY2F0Y2giLCJlcnJvciIsImhhbmRsZVNoaXBtZW50RXJyb3IiLCJyZXNwb25zZVRleHQiLCJyZW1vdmUiLCJvdXRlckhUTUwiLCJyZW1vdmVBdHRyaWJ1dGUiLCJhZGRyZXNzU3RlcCIsImludm9pY2VBZGRyZXNzIiwic2hpcHBpbmdBZGRyZXNzIiwidXNlSWFzUyIsInNldHVwQWRkcmVzc0NoYW5nZUV2ZW50cyIsInVwZGF0ZUFkZHJlc3MiLCJ1cGRhdGVTaGlwcGluZ0FkZHJlc3MiLCJ0b2dnbGVTaGlwcGluZ0FkZHJlc3MiLCJzZWxlY3RlZEluZGV4IiwiYWRkcmVzcyIsImh0bWwiLCJpbnZvaWNlUGFuZWwiLCJ0b2dnbGVVc2VBc1NoaXBwaW5nIiwiYWRkcmVzc1R5cGUiLCJpc0ludm9pY2VUeXBlIiwiRXZlbnQiLCJzaGlwcGluZ0ZpZWxkIiwic2hpcHBpbmdBZGRBZGRyZXNzQnV0dG9uIiwiZGlzcGxheSIsInZhcmlhbnQiLCJ2YXJpYW50cyIsImUiLCJzdWJtaXRzIiwic3VibWl0IiwiQ2Fyb3VzZWwiLCJDYXJ0SW5mbyIsIkNhcnRXaWRnZXQiLCJDYXJvdXNlbFByb2R1Y3RzIiwiU3dpcGVyIiwiVGh1bWJzIiwiX2luaXRDYXJvdXNlbCIsInNsaWRlclRodW1ibmFpbCIsInNsaWRlc1BlclZpZXciLCJmcmVlTW9kZSIsInNwYWNlQmV0d2VlbiIsIndhdGNoU2xpZGVzUHJvZ3Jlc3MiLCJtYWluU2xpZGVyIiwibW9kdWxlcyIsIm5hdmlnYXRpb24iLCJuZXh0RWwiLCJwcmV2RWwiLCJ0aHVtYnMiLCJzd2lwZXIiLCJfX2F3YWl0ZXIiLCJ0aGlzQXJnIiwiX2FyZ3VtZW50cyIsIlAiLCJnZW5lcmF0b3IiLCJhZG9wdCIsInJlc29sdmUiLCJQcm9taXNlIiwicmVqZWN0IiwiZnVsZmlsbGVkIiwibmV4dCIsInJlamVjdGVkIiwicmVzdWx0IiwiZG9uZSIsIl9fZ2VuZXJhdG9yIiwiXyIsImxhYmVsIiwic2VudCIsInQiLCJ0cnlzIiwib3BzIiwiZiIsInkiLCJjcmVhdGUiLCJJdGVyYXRvciIsInZlcmIiLCJTeW1ib2wiLCJpdGVyYXRvciIsIm4iLCJ2Iiwib3AiLCJUeXBlRXJyb3IiLCJwb3AiLCJhcGlVcmwiLCJlbGVtZW50U2VsZWN0b3IiLCJfaW5pdENhcnRXaWRnZXQiLCJmZXRjaENhcnRJdGVtcyIsImVycm9yXzEiLCJfYSIsIm9rIiwic3RhdHVzVGV4dCIsImRpc3BsYXlDYXJ0SXRlbXMiLCJjYXJ0RmxhZyIsImxvYWRlciJdLCJzb3VyY2VSb290IjoiIn0=