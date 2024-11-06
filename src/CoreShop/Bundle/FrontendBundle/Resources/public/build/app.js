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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7V0FDQTtXQUNBO1dBQ0E7V0FDQSxHQUFHO1dBQ0g7V0FDQTtXQUNBLENBQUM7Ozs7O1dDUEQ7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7OztXQ05BOztXQUVBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTs7V0FFQTs7V0FFQTs7V0FFQTs7V0FFQTs7V0FFQTs7V0FFQTs7V0FFQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsTUFBTSxxQkFBcUI7V0FDM0I7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTs7V0FFQTtXQUNBO1dBQ0E7Ozs7O1VFbERBO1VBQ0E7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9qcy9wbHVnaW4vY29yZXNob3AucGx1Z2luLnF1YW50aXR5LmpzIiwid2VicGFjazovLy8uL2pzL3BsdWdpbi9jb3Jlc2hvcC5wbHVnaW4udmFyaWFudC5qcyIsIndlYnBhY2s6Ly8vLi9qcy9zY3JpcHRzL2hhbmRsZS1wcm90b3R5cGVzLmpzIiwid2VicGFjazovLy8uL2pzL3NjcmlwdHMvbWFwLmpzIiwid2VicGFjazovLy8uL2pzL3NjcmlwdHMvc2hvcC5qcyIsIndlYnBhY2s6Ly8vLi9qcy9zY3JpcHRzL3ZhcmlhbnQuanMiLCJ3ZWJwYWNrOi8vLy4vanMvYXBwLnRzIiwid2VicGFjazovLy8uL2pzL3NjcmlwdHMvY2Fyb3VzZWwudHMiLCJ3ZWJwYWNrOi8vLy4vanMvc2NyaXB0cy9jYXJ0SW5mby50cyIsIndlYnBhY2s6Ly8vLi9zY3NzL2FwcC5zY3NzIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2NodW5rIGxvYWRlZCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2dsb2JhbCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2pzb25wIGNodW5rIGxvYWRpbmciLCJ3ZWJwYWNrOi8vL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly8vd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gY29yZXNob3BRdWFudGl0eVNlbGVjdG9yKG9wdGlvbnMpIHtcbiAgICAgICAgaW5pdFF1YW50aXR5RmllbGRzKG9wdGlvbnMpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluaXRRdWFudGl0eUZpZWxkcyhvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IGZpZWxkcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2lucHV0LmNzLXVuaXQtaW5wdXQnKTtcbiAgICAgICAgY29uc3QgcHJlY2lzaW9uUHJlc2V0U2VsZWN0b3IgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdzZWxlY3QuY3MtdW5pdC1zZWxlY3RvcicpO1xuXG4gICAgICAgIGlmKHByZWNpc2lvblByZXNldFNlbGVjdG9yKSB7XG4gICAgICAgICAgICAvLyBMaXN0ZW4gdG8gdW5pdCBkZWZpbml0aW9uIHNlbGVjdG9yXG4gICAgICAgICAgICBwcmVjaXNpb25QcmVzZXRTZWxlY3Rvci5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmRhdGFzZXQuY3NVbml0SWRlbnRpZmllcikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IHF1YW50aXR5SWRlbnRpZmllciA9IHRoaXMuZGF0YXNldC5jc1VuaXRJZGVudGlmaWVyO1xuICAgICAgICAgICAgICAgIGNvbnN0IHF1YW50aXR5SW5wdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBpbnB1dFtkYXRhLWNzLXVuaXQtaWRlbnRpZmllcj1cIiR7cXVhbnRpdHlJZGVudGlmaWVyfVwiXWApO1xuXG4gICAgICAgICAgICAgICAgLy8gU2V0IHN0ZXAgdG8gMSBvciB3aGF0ZXZlciBpbnRlZ2VyIHZhbHVlIHlvdSB3YW50XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RlcCA9IDE7IC8vIENoYW5nZSB0aGlzIGlmIHlvdSB3YW50IGEgZGlmZmVyZW50IGluY3JlbWVudFxuXG4gICAgICAgICAgICAgICAgaWYgKCFxdWFudGl0eUlucHV0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBVc2UgaW50ZWdlciBzdGVwIGRpcmVjdGx5XG4gICAgICAgICAgICAgICAgcXVhbnRpdHlJbnB1dC5zdGVwID0gc3RlcDsgLy8gU2V0IHN0ZXAgYXMgYW4gaW50ZWdlclxuICAgICAgICAgICAgICAgIHF1YW50aXR5SW5wdXQuZGF0YXNldC5jc1VuaXRQcmVjaXNpb24gPSAwOyAvLyBPcHRpb25hbCwgc2luY2UgcHJlY2lzaW9uIGlzIG5vIGxvbmdlciByZWxldmFudFxuXG4gICAgICAgICAgICAgICAgLy8gVXBkYXRlIGlucHV0IHNldHRpbmdzXG4gICAgICAgICAgICAgICAgdXBkYXRlVG91Y2hTcGluU2V0dGluZ3MocXVhbnRpdHlJbnB1dCwgMCwgc3RlcC50b1N0cmluZygpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoZmllbGRzKSB7XG4gICAgICAgICAgICAvLyBJbml0aWFsaXplIHF1YW50aXR5IGZpZWxkcyB3aXRoIGludGVnZXIgc3RlcFxuICAgICAgICAgICAgZmllbGRzLmZvckVhY2goZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICAgICAgICAgICAgLy8gWW91IG1pZ2h0IG5vdCBuZWVkIHByZWNpc2lvbiBhbnltb3JlXG4gICAgICAgICAgICAgICAgaW5pdGlhbGl6ZVRvdWNoU3BpbihmaWVsZCwgMCwgJzEnLCBvcHRpb25zKTsgLy8gQ2hhbmdlICcxJyB0byB5b3VyIGRlc2lyZWQgaW50ZWdlciBpbmNyZW1lbnRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5pdGlhbGl6ZVRvdWNoU3BpbihpbnB1dCwgcHJlY2lzaW9uLCBzdGVwLCBvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBjb250YWluZXIuY2xhc3NMaXN0LmFkZCgndG91Y2hzcGluLWNvbnRhaW5lcicpO1xuXG4gICAgICAgIGNvbnN0IGRlY3JlbWVudEJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICBkZWNyZW1lbnRCdXR0b24udHlwZSA9ICdidXR0b24nO1xuICAgICAgICBkZWNyZW1lbnRCdXR0b24udGV4dENvbnRlbnQgPSAnLSc7XG4gICAgICAgIGRlY3JlbWVudEJ1dHRvbi5jbGFzc0xpc3QuYWRkKCd0b3VjaHNwaW4tZGVjcmVtZW50Jyk7XG5cbiAgICAgICAgY29uc3QgaW5jcmVtZW50QnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgIGluY3JlbWVudEJ1dHRvbi50eXBlID0gJ2J1dHRvbic7XG4gICAgICAgIGluY3JlbWVudEJ1dHRvbi50ZXh0Q29udGVudCA9ICcrJztcbiAgICAgICAgaW5jcmVtZW50QnV0dG9uLmNsYXNzTGlzdC5hZGQoJ3RvdWNoc3Bpbi1pbmNyZW1lbnQnKTtcblxuICAgICAgICBpbnB1dC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShjb250YWluZXIsIGlucHV0KTtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGRlY3JlbWVudEJ1dHRvbik7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChpbnB1dCk7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChpbmNyZW1lbnRCdXR0b24pO1xuXG4gICAgICAgIC8vIFNldCB1cCBldmVudCBsaXN0ZW5lcnMgZm9yIGluY3JlbWVudCBhbmQgZGVjcmVtZW50XG4gICAgICAgIGRlY3JlbWVudEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IHBhcnNlSW50KGlucHV0LnZhbHVlKSB8fCAwOyAvLyBFbnN1cmUgdmFsdWUgaXMgYW4gaW50ZWdlclxuICAgICAgICAgICAgdmFsdWUgLT0gcGFyc2VJbnQoc3RlcCk7IC8vIERlY3JlbWVudCBieSBpbnRlZ2VyIHN0ZXBcbiAgICAgICAgICAgIGlmICh2YWx1ZSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgaW5wdXQudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaW5jcmVtZW50QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgbGV0IHZhbHVlID0gcGFyc2VJbnQoaW5wdXQudmFsdWUpIHx8IDA7IC8vIEVuc3VyZSB2YWx1ZSBpcyBhbiBpbnRlZ2VyXG4gICAgICAgICAgICB2YWx1ZSArPSBwYXJzZUludChzdGVwKTsgLy8gSW5jcmVtZW50IGJ5IGludGVnZXIgc3RlcFxuICAgICAgICAgICAgaW5wdXQudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQWRkIGlucHV0IHZhbGlkYXRpb24gYmFzZWQgb24gaW50ZWdlciB2YWx1ZVxuICAgICAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IHBhcnNlSW50KGlucHV0LnZhbHVlKTtcbiAgICAgICAgICAgIGlmIChpc05hTih2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICBpbnB1dC52YWx1ZSA9IDA7IC8vIERlZmF1bHQgdG8gemVybyBpZiBpbnZhbGlkIGlucHV0XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlucHV0LnZhbHVlID0gdmFsdWU7IC8vIEtlZXAgaXQgYXMgYW4gaW50ZWdlclxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1cGRhdGVUb3VjaFNwaW5TZXR0aW5ncyhpbnB1dCwgcHJlY2lzaW9uLCBzdGVwKSB7XG4gICAgICAgIGlucHV0Lm1pbiA9IDA7XG4gICAgICAgIGlucHV0Lm1heCA9IDEwMDAwMDAwMDA7XG4gICAgICAgIGlucHV0LnN0ZXAgPSBzdGVwO1xuICAgICAgICBpbnB1dC5kYXRhc2V0LmNzVW5pdFByZWNpc2lvbiA9IHByZWNpc2lvbjtcbiAgICB9XG5cbiAgICAvLyBFeHBvcnQgdGhlIGZ1bmN0aW9uIHRvIHRoZSBnbG9iYWwgc2NvcGVcbiAgICB3aW5kb3cuY29yZXNob3BRdWFudGl0eVNlbGVjdG9yID0gY29yZXNob3BRdWFudGl0eVNlbGVjdG9yO1xufSkoKTtcbiIsIihmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgY29yZXNob3BWYXJpYW50U2VsZWN0b3IgPSBmdW5jdGlvbiAoYXR0cmlidXRlQ29udGFpbmVyKSB7XG4gICAgICAgIGxldCBfYXR0cmlidXRlQ29udGFpbmVyID0gbnVsbDtcbiAgICAgICAgbGV0IF9jb25maWcgPSB7fTtcbiAgICAgICAgbGV0IF9hdHRyaWJ1dGVHcm91cHMgPSBbXTtcblxuICAgICAgICBjb25zdCBfaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICghYXR0cmlidXRlQ29udGFpbmVyKSByZXR1cm47XG5cbiAgICAgICAgICAgIF9hdHRyaWJ1dGVDb250YWluZXIgPSBhdHRyaWJ1dGVDb250YWluZXI7XG4gICAgICAgICAgICBfY29uZmlnID0gSlNPTi5wYXJzZShfYXR0cmlidXRlQ29udGFpbmVyLmRhdGFzZXQuY29uZmlnKTtcbiAgICAgICAgICAgIF9pbml0aWFsaXplQXR0cmlidXRlR3JvdXBzKCk7XG4gICAgICAgICAgICBfc2V0dXBBdHRyaWJ1dGVHcm91cFNldHRpbmdzKCk7XG4gICAgICAgICAgICBfc2V0dXBDaGFuZ2VFdmVudHMoKTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfaW5pdGlhbGl6ZUF0dHJpYnV0ZUdyb3VwcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIF9jb25maWcuYXR0cmlidXRlcy5mb3JFYWNoKChncm91cCkgPT4ge1xuICAgICAgICAgICAgICAgIGdyb3VwLmVsZW1lbnRzID0gX2F0dHJpYnV0ZUNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKGBbZGF0YS1ncm91cD1cIiR7Z3JvdXAuZ3JvdXAuaWR9XCJdYCk7XG4gICAgICAgICAgICAgICAgX2F0dHJpYnV0ZUdyb3Vwcy5wdXNoKGdyb3VwKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9zZXR1cEF0dHJpYnV0ZUdyb3VwU2V0dGluZ3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfYXR0cmlidXRlR3JvdXBzLmZvckVhY2goKGdyb3VwLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgIGdyb3VwLnByZXZHcm91cCA9IF9hdHRyaWJ1dGVHcm91cHNbaW5kZXggLSAxXSB8fCBudWxsO1xuICAgICAgICAgICAgICAgIGdyb3VwLm5leHRHcm91cCA9IF9hdHRyaWJ1dGVHcm91cHNbaW5kZXggKyAxXSB8fCBudWxsO1xuICAgICAgICAgICAgICAgIGdyb3VwLnNlbGVjdGVkID8gX2NvbmZpZ3VyZUdyb3VwKGdyb3VwKSA6IF9jbGVhckdyb3VwKGdyb3VwKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9zZXR1cENoYW5nZUV2ZW50cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIF9hdHRyaWJ1dGVHcm91cHMuZm9yRWFjaCgoZ3JvdXApID0+IF9hdHRhY2hDaGFuZ2VFdmVudChncm91cCkpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9hc3NpZ25PbkNoYW5nZUV2ZW50ID0gZnVuY3Rpb24gKGVsZW1lbnQsIGdyb3VwKSB7XG4gICAgICAgICAgICBlbGVtZW50Lm9uY2hhbmdlID0gKCkgPT4gX2hhbmRsZUVsZW1lbnRDaGFuZ2UoZ3JvdXAsIGVsZW1lbnQpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9hdHRhY2hDaGFuZ2VFdmVudCA9IGZ1bmN0aW9uIChncm91cCkge1xuICAgICAgICAgICAgZ3JvdXAuZWxlbWVudHMuZm9yRWFjaCgoZWxlbWVudCkgPT4gX2Fzc2lnbk9uQ2hhbmdlRXZlbnQoZWxlbWVudCwgZ3JvdXApKTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfaGFuZGxlRWxlbWVudENoYW5nZSA9IGZ1bmN0aW9uIChncm91cCwgZWxlbWVudCkge1xuICAgICAgICAgICAgd2luZG93LnZhcmlhbnRSZWFkeSA9IGZhbHNlO1xuICAgICAgICAgICAgX2F0dHJpYnV0ZUNvbnRhaW5lci5kaXNwYXRjaEV2ZW50KF9jcmVhdGVFdmVudCgnY2hhbmdlJywgeyBlbGVtZW50IH0pKTtcblxuICAgICAgICAgICAgaWYgKGVsZW1lbnQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICBfc2VsZWN0R3JvdXBFbGVtZW50KGdyb3VwLCBlbGVtZW50KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgX2Rlc2VsZWN0R3JvdXBFbGVtZW50KGdyb3VwKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgd2luZG93LnZhcmlhbnRSZWFkeSA9IHRydWU7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgX3NlbGVjdEdyb3VwRWxlbWVudCA9IGZ1bmN0aW9uIChncm91cCwgZWxlbWVudCkge1xuICAgICAgICAgICAgZ3JvdXAuc2VsZWN0ZWQgPSBwYXJzZUludChlbGVtZW50LnZhbHVlKTtcbiAgICAgICAgICAgIF9hdHRyaWJ1dGVDb250YWluZXIuZGlzcGF0Y2hFdmVudChfY3JlYXRlRXZlbnQoJ3NlbGVjdCcsIHsgZWxlbWVudCB9KSk7XG5cbiAgICAgICAgICAgIGlmIChncm91cC5uZXh0R3JvdXApIHtcbiAgICAgICAgICAgICAgICBfY2xlYXJHcm91cHMoZ3JvdXAubmV4dEdyb3VwKTtcbiAgICAgICAgICAgICAgICBfY29uZmlndXJlR3JvdXAoZ3JvdXAubmV4dEdyb3VwKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgX2F0dHJpYnV0ZUNvbnRhaW5lci5kaXNwYXRjaEV2ZW50KF9jcmVhdGVFdmVudCgncmVkaXJlY3QnLCB7IGVsZW1lbnQgfSkpO1xuICAgICAgICAgICAgICAgIF9yZWRpcmVjdFRvVmFyaWFudCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9kZXNlbGVjdEdyb3VwRWxlbWVudCA9IGZ1bmN0aW9uIChncm91cCkge1xuICAgICAgICAgICAgZGVsZXRlIGdyb3VwLnNlbGVjdGVkO1xuICAgICAgICAgICAgaWYgKGdyb3VwLm5leHRHcm91cCkgX2NsZWFyR3JvdXBzKGdyb3VwLm5leHRHcm91cCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgX3JlZGlyZWN0VG9WYXJpYW50ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRBdHRyaWJ1dGVzID0gX2dldFNlbGVjdGVkQXR0cmlidXRlcygpO1xuICAgICAgICAgICAgY29uc3QgbWF0Y2hpbmdQcm9kdWN0ID0gX2ZpbmRNYXRjaGluZ1Byb2R1Y3Qoc2VsZWN0ZWRBdHRyaWJ1dGVzKTtcblxuICAgICAgICAgICAgaWYgKG1hdGNoaW5nUHJvZHVjdD8udXJsKSB7XG4gICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBtYXRjaGluZ1Byb2R1Y3QudXJsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9nZXRTZWxlY3RlZEF0dHJpYnV0ZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgICAgICAgICAgICAgIF9hdHRyaWJ1dGVHcm91cHMuZmlsdGVyKChnKSA9PiBnLnNlbGVjdGVkKS5tYXAoKGcpID0+IFtnLmdyb3VwLmlkLCBnLnNlbGVjdGVkXSlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgX2ZpbmRNYXRjaGluZ1Byb2R1Y3QgPSBmdW5jdGlvbiAoc2VsZWN0ZWRBdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LnZhbHVlcyhfY29uZmlnLmluZGV4KS5maW5kKChwKSA9PlxuICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHAuYXR0cmlidXRlcykgPT09IEpTT04uc3RyaW5naWZ5KHNlbGVjdGVkQXR0cmlidXRlcylcbiAgICAgICAgICAgICk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgX2NyZWF0ZUV2ZW50ID0gZnVuY3Rpb24gKG5hbWUsIGRhdGEgPSB7fSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBDdXN0b21FdmVudCgndmFyaWFudF9zZWxlY3Rvci4nICsgbmFtZSwge1xuICAgICAgICAgICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgICAgICAgICAgY2FuY2VsYWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgZGV0YWlsOiBkYXRhLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgX2NsZWFyR3JvdXBFbGVtZW50cyA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICBlbGVtZW50LmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGVsZW1lbnQuY2hlY2tlZCA9IGZhbHNlO1xuXG4gICAgICAgICAgICBpZiAoZWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdzZWxlY3QnKSBfY2xlYXJTZWxlY3RPcHRpb25zKGVsZW1lbnQpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9jbGVhclNlbGVjdE9wdGlvbnMgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgY29uc3Qgb3B0aW9ucyA9IGVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnb3B0aW9uOm5vdChbdmFsdWU9XCJcIl0pJyk7XG4gICAgICAgICAgICBvcHRpb25zLmZvckVhY2goKG9wdGlvbikgPT4gZWxlbWVudC5yZW1vdmVDaGlsZChvcHRpb24pKTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfY2xlYXJHcm91cCA9IGZ1bmN0aW9uIChncm91cCkge1xuICAgICAgICAgICAgZGVsZXRlIGdyb3VwLnNlbGVjdGVkO1xuICAgICAgICAgICAgZ3JvdXAuZWxlbWVudHMuZm9yRWFjaChfY2xlYXJHcm91cEVsZW1lbnRzKTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfY2xlYXJHcm91cHMgPSBmdW5jdGlvbiAoZ3JvdXApIHtcbiAgICAgICAgICAgIHdoaWxlIChncm91cCkge1xuICAgICAgICAgICAgICAgIF9jbGVhckdyb3VwKGdyb3VwKTtcbiAgICAgICAgICAgICAgICBncm91cCA9IGdyb3VwLm5leHRHcm91cDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfaXNQcm9kdWN0TWF0Y2hpbmdGaWx0ZXJzID0gZnVuY3Rpb24gKHByb2R1Y3QsIGZpbHRlckF0dHJpYnV0ZXMpIHtcbiAgICAgICAgICAgIHJldHVybiBmaWx0ZXJBdHRyaWJ1dGVzLmV2ZXJ5KChmaWx0ZXIpID0+IF9jb25maWcuaW5kZXhbcHJvZHVjdC5pZF0uYXR0cmlidXRlcz8uW2ZpbHRlci5ncm91cF0gPT09IGZpbHRlci5zZWxlY3RlZCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgX2lzQXR0cmlidXRlUmVsZXZhbnQgPSBmdW5jdGlvbiAoYXR0cmlidXRlLCBmaWx0ZXJBdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICByZXR1cm4gYXR0cmlidXRlLnByb2R1Y3RzLnNvbWUoKHByb2R1Y3QpID0+IF9pc1Byb2R1Y3RNYXRjaGluZ0ZpbHRlcnMocHJvZHVjdCwgZmlsdGVyQXR0cmlidXRlcykpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9maWx0ZXJBdHRyaWJ1dGVzID0gZnVuY3Rpb24gKGF0dHJpYnV0ZXMsIGdyb3VwKSB7XG4gICAgICAgICAgICBjb25zdCBmaWx0ZXJBdHRyaWJ1dGVzID0gX2dldEZpbHRlckF0dHJpYnV0ZXMoZ3JvdXApO1xuICAgICAgICAgICAgcmV0dXJuIGF0dHJpYnV0ZXMuZmlsdGVyKChhdHRyaWJ1dGUpID0+IF9pc0F0dHJpYnV0ZVJlbGV2YW50KGF0dHJpYnV0ZSwgZmlsdGVyQXR0cmlidXRlcykpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9nZXRGaWx0ZXJBdHRyaWJ1dGVzID0gZnVuY3Rpb24gKGdyb3VwKSB7XG4gICAgICAgICAgICBjb25zdCBmaWx0ZXJBdHRyaWJ1dGVzID0gW107XG4gICAgICAgICAgICBsZXQgY3VycmVudEdyb3VwID0gZ3JvdXAucHJldkdyb3VwO1xuXG4gICAgICAgICAgICB3aGlsZSAoY3VycmVudEdyb3VwKSB7XG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRHcm91cC5zZWxlY3RlZCAmJiBjdXJyZW50R3JvdXAubmV4dEdyb3VwKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbHRlckF0dHJpYnV0ZXMucHVzaCh7IGdyb3VwOiBjdXJyZW50R3JvdXAuZ3JvdXAuaWQsIHNlbGVjdGVkOiBjdXJyZW50R3JvdXAuc2VsZWN0ZWQgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGN1cnJlbnRHcm91cCA9IGN1cnJlbnRHcm91cC5wcmV2R3JvdXA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBmaWx0ZXJBdHRyaWJ1dGVzO1xuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgY29uc3QgX2FkZE9wdGlvblRvU2VsZWN0ID0gZnVuY3Rpb24gKGVsZW1lbnQsIGF0dHJpYnV0ZSwgZ3JvdXApIHtcbiAgICAgICAgICAgIGNvbnN0IG9wdGlvbiA9IG5ldyBPcHRpb24oYXR0cmlidXRlLmF0dHJpYnV0ZS5uYW1lLCBhdHRyaWJ1dGUuYXR0cmlidXRlLmlkKTtcbiAgICAgICAgICAgIG9wdGlvbi5pZCA9ICdhdHRyaWJ1dGUtJyArIGF0dHJpYnV0ZS5hdHRyaWJ1dGUuaWQ7XG4gICAgICAgICAgICBpZiAoZ3JvdXAuc2VsZWN0ZWQgPT09IGF0dHJpYnV0ZS5hdHRyaWJ1dGUuaWQpIG9wdGlvbi5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICBlbGVtZW50LmFkZChvcHRpb24pO1xuICAgICAgICAgICAgZWxlbWVudC5kaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9lbmFibGVFbGVtZW50Rm9yQXR0cmlidXRlID0gZnVuY3Rpb24gKGVsZW1lbnQsIGF0dHJpYnV0ZSwgZ3JvdXApIHtcbiAgICAgICAgICAgIGlmIChwYXJzZUludChlbGVtZW50LmRhdGFzZXQuZ3JvdXApID09PSBncm91cC5ncm91cC5pZCAmJiBwYXJzZUludChlbGVtZW50LnZhbHVlKSA9PT0gYXR0cmlidXRlLmF0dHJpYnV0ZS5pZCkge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAoZ3JvdXAuc2VsZWN0ZWQgPT09IGF0dHJpYnV0ZS5hdHRyaWJ1dGUuaWQpIGVsZW1lbnQuY2hlY2tlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgX2NvbmZpZ3VyZUdyb3VwRWxlbWVudHMgPSBmdW5jdGlvbiAoZ3JvdXAsIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgICAgIGdyb3VwLmVsZW1lbnRzLmZvckVhY2goKGVsZW1lbnQpID0+XG4gICAgICAgICAgICAgICAgX2NvbmZpZ3VyZUVsZW1lbnQoZWxlbWVudCwgYXR0cmlidXRlcywgZ3JvdXApXG4gICAgICAgICAgICApO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9jb25maWd1cmVFbGVtZW50ID0gZnVuY3Rpb24gKGVsZW1lbnQsIGF0dHJpYnV0ZXMsIGdyb3VwKSB7XG4gICAgICAgICAgICBpZiAoZWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdzZWxlY3QnKSB7XG4gICAgICAgICAgICAgICAgYXR0cmlidXRlcy5mb3JFYWNoKChhdHRyaWJ1dGUpID0+IF9hZGRPcHRpb25Ub1NlbGVjdChlbGVtZW50LCBhdHRyaWJ1dGUsIGdyb3VwKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMuZm9yRWFjaCgoYXR0cmlidXRlKSA9PiBfZW5hYmxlRWxlbWVudEZvckF0dHJpYnV0ZShlbGVtZW50LCBhdHRyaWJ1dGUsIGdyb3VwKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgX2NvbmZpZ3VyZUdyb3VwID0gZnVuY3Rpb24gKGdyb3VwKSB7XG4gICAgICAgICAgICBjb25zdCBmaWx0ZXJlZEF0dHJpYnV0ZXMgPSBfZmlsdGVyQXR0cmlidXRlcyhncm91cC5hdHRyaWJ1dGVzLnNsaWNlKCksIGdyb3VwKSB8fCBncm91cC5hdHRyaWJ1dGVzO1xuICAgICAgICAgICAgX2NvbmZpZ3VyZUdyb3VwRWxlbWVudHMoZ3JvdXAsIGZpbHRlcmVkQXR0cmlidXRlcyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgX2luaXQoKTtcbiAgICB9O1xuXG4gICAgd2luZG93LmNvcmVzaG9wVmFyaWFudFNlbGVjdG9yID0gY29yZXNob3BWYXJpYW50U2VsZWN0b3I7XG59KSgpO1xuIiwiKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBjb25zdCBtZXRob2RzID0ge1xuICAgICAgICBpbml0OiBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgICAgICAgY29uc3Qgc2V0dGluZ3MgPSB7XG4gICAgICAgICAgICAgICAgcHJvdG90eXBlUHJlZml4OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjb250YWluZXJTZWxlY3RvcjogZmFsc2UsXG4gICAgICAgICAgICAgICAgc2VsZWN0b3JBdHRyOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zIC8vIFVzaW5nIG9iamVjdCBzcHJlYWQgaGVyZVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgZWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuc2VsZWN0b3IpO1xuICAgICAgICAgICAgZWxlbWVudHMuZm9yRWFjaChlbGVtZW50ID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3coZWxlbWVudCwgc2V0dGluZ3MsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaG93KGVsZW1lbnQsIHNldHRpbmdzLCB0cnVlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNob3c6IGZ1bmN0aW9uIChlbGVtZW50LCBzZXR0aW5ncywgcmVwbGFjZSkge1xuICAgICAgICAgICAgbGV0IHNlbGVjdGVkVmFsdWUgPSBlbGVtZW50LnZhbHVlO1xuICAgICAgICAgICAgbGV0IHByb3RvdHlwZVByZWZpeCA9IGVsZW1lbnQuaWQ7XG5cbiAgICAgICAgICAgIGlmIChzZXR0aW5ncy5zZWxlY3RvckF0dHIpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzZWxlY3RlZE9wdGlvbiA9IEFycmF5LmZyb20oZWxlbWVudC5vcHRpb25zKS5maW5kKG9wdGlvbiA9PiBvcHRpb24udmFsdWUgPT09IHNlbGVjdGVkVmFsdWUpO1xuICAgICAgICAgICAgICAgIGlmIChzZWxlY3RlZE9wdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZFZhbHVlID0gc2VsZWN0ZWRPcHRpb24uZ2V0QXR0cmlidXRlKHNldHRpbmdzLnNlbGVjdG9yQXR0cik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoc2V0dGluZ3MucHJvdG90eXBlUHJlZml4KSB7XG4gICAgICAgICAgICAgICAgcHJvdG90eXBlUHJlZml4ID0gc2V0dGluZ3MucHJvdG90eXBlUHJlZml4O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBwcm90b3R5cGVFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYCR7cHJvdG90eXBlUHJlZml4fV8ke3NlbGVjdGVkVmFsdWV9YCk7XG4gICAgICAgICAgICBsZXQgY29udGFpbmVyID0gdGhpcy5nZXRDb250YWluZXIoc2V0dGluZ3MsIHByb3RvdHlwZUVsZW1lbnQpO1xuXG4gICAgICAgICAgICBpZiAoIWNvbnRhaW5lcikge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFwcm90b3R5cGVFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyLmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHJlcGxhY2UgfHwgIWNvbnRhaW5lci5pbm5lckhUTUwudHJpbSgpKSB7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyLmlubmVySFRNTCA9IHByb3RvdHlwZUVsZW1lbnQuZGF0YXNldC5wcm90b3R5cGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Q29udGFpbmVyOiBmdW5jdGlvbiAoc2V0dGluZ3MsIHByb3RvdHlwZUVsZW1lbnQpIHtcbiAgICAgICAgICAgIGlmIChzZXR0aW5ncy5jb250YWluZXJTZWxlY3Rvcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNldHRpbmdzLmNvbnRhaW5lclNlbGVjdG9yKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZGF0YUNvbnRhaW5lcklkID0gcHJvdG90eXBlRWxlbWVudCA/IHByb3RvdHlwZUVsZW1lbnQuZGF0YXNldC5jb250YWluZXIgOiBudWxsO1xuICAgICAgICAgICAgICAgIHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChkYXRhQ29udGFpbmVySWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIEV4dGVuZGluZyB0aGUgcHJvdG90eXBlIG9mIE5vZGVMaXN0XG4gICAgTm9kZUxpc3QucHJvdG90eXBlLmhhbmRsZVByb3RvdHlwZXMgPSBmdW5jdGlvbiAobWV0aG9kKSB7XG4gICAgICAgIGlmIChtZXRob2RzW21ldGhvZF0pIHtcbiAgICAgICAgICAgIHJldHVybiBtZXRob2RzW21ldGhvZF0uYXBwbHkodGhpcywgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG1ldGhvZCA9PT0gJ29iamVjdCcgfHwgIW1ldGhvZCkge1xuICAgICAgICAgICAgcmV0dXJuIG1ldGhvZHMuaW5pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNZXRob2QgJyArIG1ldGhvZCArICcgZG9lcyBub3QgZXhpc3Qgb24gaGFuZGxlUHJvdG90eXBlcycpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIFRvIGFsbG93IGNhbGxpbmcgaGFuZGxlUHJvdG90eXBlcyBkaXJlY3RseSBvbiBhbnkgZWxlbWVudFxuICAgIEhUTUxFbGVtZW50LnByb3RvdHlwZS5oYW5kbGVQcm90b3R5cGVzID0gZnVuY3Rpb24gKG1ldGhvZCkge1xuICAgICAgICByZXR1cm4gbWV0aG9kcy5oYW5kbGVQcm90b3R5cGVzLmNhbGwoW3RoaXNdLCBtZXRob2QpO1xuICAgIH07XG5cbn0oKSk7XG4iLCJkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IG1hcEJsb2NrID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hcC1ibG9jaycpO1xuXG4gICAgaWYgKG1hcEJsb2NrKSB7XG4gICAgICAgIG1hcEJsb2NrLnN0eWxlLmhlaWdodCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYXAtd3JhcHBlcicpLmNsaWVudEhlaWdodCArICdweCc7XG5cbiAgICAgICAgZnVuY3Rpb24gaW5pdGlhbGl6ZSgpIHtcbiAgICAgICAgICAgIGNvbnN0IG1hcE9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgem9vbTogMTgsXG4gICAgICAgICAgICAgICAgY2VudGVyOiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKDQ4LjE1OTI1MTMsIDE0LjAyMzAyNTEwMDAwMDA0KSxcbiAgICAgICAgICAgICAgICBkaXNhYmxlRGVmYXVsdFVJOiB0cnVlXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3QgbWFwTmV3ID0gbmV3IGdvb2dsZS5tYXBzLk1hcChtYXBCbG9jaywgbWFwT3B0aW9ucyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhtYXBOZXcpO1xuICAgICAgICB9XG5cbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBpbml0aWFsaXplKTtcbiAgICB9XG59KTtcbiIsImNvbnN0IHNob3AgPSB3aW5kb3cuc2hvcCB8fCB7fTtcblxuKGZ1bmN0aW9uIChzaG9wKSB7XG4gICAgc2hvcC5pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBzaG9wLmluaXRDaGFuZ2VBZGRyZXNzKCk7XG4gICAgICAgIHNob3AuaW5pdENhcnRTaGlwbWVudENhbGN1bGF0b3IoKTtcbiAgICAgICAgc2hvcC5pbml0UXVhbnRpdHlWYWxpZGF0b3IoKTtcbiAgICAgICAgc2hvcC5pbml0Q2F0ZWdvcnlTZWxlY3QoKTtcblxuICAgICAgICBoYW5kbGVQcm90b3R5cGVzKHtcbiAgICAgICAgICAgICdwcm90b3R5cGVQcmVmaXgnOiAncGF5bWVudFByb3ZpZGVyJyxcbiAgICAgICAgICAgICdjb250YWluZXJTZWxlY3Rvcic6ICcucGF5bWVudFNldHRpbmdzJyxcbiAgICAgICAgICAgICdzZWxlY3RvckF0dHInOiAnZGF0YS1mYWN0b3J5J1xuICAgICAgICB9KTtcblxuICAgICAgICBzZXR1cENvcHlUb0NsaXBib2FyZCgpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVQcm90b3R5cGVzKG9wdGlvbnMpIHtcbiAgICAgICAgY29uc3Qgc2V0dGluZ3MgPSB7XG4gICAgICAgICAgICBwcm90b3R5cGVQcmVmaXg6IG9wdGlvbnMucHJvdG90eXBlUHJlZml4IHx8IGZhbHNlLFxuICAgICAgICAgICAgY29udGFpbmVyU2VsZWN0b3I6IG9wdGlvbnMuY29udGFpbmVyU2VsZWN0b3IgfHwgZmFsc2UsXG4gICAgICAgICAgICBzZWxlY3RvckF0dHI6IG9wdGlvbnMuc2VsZWN0b3JBdHRyIHx8IGZhbHNlXG4gICAgICAgIH07XG5cbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChgW2RhdGEtJHtzZXR0aW5ncy5wcm90b3R5cGVQcmVmaXh9XWApLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHNob3dFbGVtZW50KGVsZW1lbnQsIGZhbHNlKTtcbiAgICAgICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNob3dFbGVtZW50KGVsZW1lbnQsIHRydWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZ1bmN0aW9uIHNob3dFbGVtZW50KGVsZW1lbnQsIHJlcGxhY2UpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkVmFsdWUgPSBnZXRTZWxlY3RlZFZhbHVlKGVsZW1lbnQpO1xuICAgICAgICAgICAgY29uc3QgcHJvdG90eXBlUHJlZml4ID0gc2V0dGluZ3MucHJvdG90eXBlUHJlZml4IHx8IGVsZW1lbnQuaWQ7XG4gICAgICAgICAgICBjb25zdCBwcm90b3R5cGVFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYCR7cHJvdG90eXBlUHJlZml4fV8ke3NlbGVjdGVkVmFsdWV9YCk7XG4gICAgICAgICAgICBjb25zdCBjb250YWluZXIgPSBnZXRDb250YWluZXIocHJvdG90eXBlRWxlbWVudCk7XG5cbiAgICAgICAgICAgIGlmIChjb250YWluZXIgJiYgKHJlcGxhY2UgfHwgIWNvbnRhaW5lci5pbm5lckhUTUwudHJpbSgpKSkge1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSBwcm90b3R5cGVFbGVtZW50ID8gcHJvdG90eXBlRWxlbWVudC5kYXRhc2V0LnByb3RvdHlwZSA6ICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZ2V0U2VsZWN0ZWRWYWx1ZShlbGVtZW50KSB7XG4gICAgICAgICAgICBpZiAoc2V0dGluZ3Muc2VsZWN0b3JBdHRyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQucXVlcnlTZWxlY3RvcihgW3ZhbHVlPVwiJHtlbGVtZW50LnZhbHVlfVwiXWApLmdldEF0dHJpYnV0ZShzZXR0aW5ncy5zZWxlY3RvckF0dHIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQudmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBnZXRDb250YWluZXIocHJvdG90eXBlRWxlbWVudCkge1xuICAgICAgICAgICAgaWYgKHNldHRpbmdzLmNvbnRhaW5lclNlbGVjdG9yKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2V0dGluZ3MuY29udGFpbmVyU2VsZWN0b3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb3RvdHlwZUVsZW1lbnQgPyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHByb3RvdHlwZUVsZW1lbnQuZGF0YXNldC5jb250YWluZXIpIDogbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNldHVwQ29weVRvQ2xpcGJvYXJkKCkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY29weS10by1jbGlwYm9hcmQnKS5mb3JFYWNoKGZ1bmN0aW9uIChidXR0b24pIHtcbiAgICAgICAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGNvcHlUZXh0VG9DbGlwYm9hcmQodGhpcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29weVRleHRUb0NsaXBib2FyZChidXR0b24pIHtcbiAgICAgICAgY29uc3QgdGFyZ2V0SWQgPSBidXR0b24uZGF0YXNldC50YXJnZXQ7XG4gICAgICAgIGNvbnN0IGNvcHlUZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGFyZ2V0SWQpO1xuXG4gICAgICAgIGlmIChjb3B5VGV4dCkge1xuICAgICAgICAgICAgY29weVRleHQuc2VsZWN0KCk7XG4gICAgICAgICAgICBjb3B5VGV4dC5zZXRTZWxlY3Rpb25SYW5nZSgwLCA5OTk5OSk7IC8vIEZvciBtb2JpbGUgZGV2aWNlc1xuXG4gICAgICAgICAgICBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChjb3B5VGV4dC52YWx1ZSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYnV0dG9uLmRhdGFzZXQuY29waWVkVGV4dCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNob3AuaW5pdENhdGVnb3J5U2VsZWN0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnNpdGUtcmVsb2FkXCIpLmZvckVhY2goZnVuY3Rpb24gKHNlbGVjdCkge1xuICAgICAgICAgICAgc2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSB1cGRhdGVRdWVyeVN0cmluZ1BhcmFtZXRlcih3aW5kb3cubG9jYXRpb24uaHJlZiwgdGhpcy5uYW1lLCB0aGlzLnZhbHVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gdXBkYXRlUXVlcnlTdHJpbmdQYXJhbWV0ZXIodXJpLCBrZXksIHZhbHVlKSB7XG4gICAgICAgIGNvbnN0IHJlID0gbmV3IFJlZ0V4cChcIihbPyZdKVwiICsga2V5ICsgXCI9Lio/KCZ8JClcIiwgXCJpXCIpO1xuICAgICAgICBjb25zdCBzZXBhcmF0b3IgPSB1cmkuaW5kZXhPZignPycpICE9PSAtMSA/IFwiJlwiIDogXCI/XCI7XG4gICAgICAgIHJldHVybiB1cmkubWF0Y2gocmUpID8gdXJpLnJlcGxhY2UocmUsICckMScgKyBrZXkgKyBcIj1cIiArIHZhbHVlICsgJyQyJykgOiB1cmkgKyBzZXBhcmF0b3IgKyBrZXkgKyBcIj1cIiArIHZhbHVlO1xuICAgIH1cblxuICAgIHNob3AuaW5pdFF1YW50aXR5VmFsaWRhdG9yID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBjb3Jlc2hvcFF1YW50aXR5U2VsZWN0b3Ioe1xuICAgICAgICAgICAgYnV0dG9uZG93bl9jbGFzczogJ2J0biBidG4tc2Vjb25kYXJ5JyxcbiAgICAgICAgICAgIGJ1dHRvbnVwX2NsYXNzOiAnYnRuIGJ0bi1zZWNvbmRhcnknLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgc2hvcC5pbml0Q2FydFNoaXBtZW50Q2FsY3VsYXRvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICBjb25zdCBmb3JtID0gZXYudGFyZ2V0LmNsb3Nlc3QoJ2Zvcm1bbmFtZT1cImNvcmVzaG9wX3NoaXBwaW5nX2NhbGN1bGF0b3JcIl0nKTtcbiAgICAgICAgICAgIGlmIChmb3JtKSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlU2hpcG1lbnRDYWxjdWxhdGlvbihmb3JtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGhhbmRsZVNoaXBtZW50Q2FsY3VsYXRpb24oZm9ybSkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBmb3JtLmNsYXNzTGlzdC5hZGQoJ2xvYWRpbmcnKTtcbiAgICAgICAgZm9ybS5xdWVyeVNlbGVjdG9yKCdidXR0b25bdHlwZT1cInN1Ym1pdFwiXScpLnNldEF0dHJpYnV0ZSgnZGlzYWJsZWQnLCAnZGlzYWJsZWQnKTtcbiAgICAgICAgZm9ybS5jbG9zZXN0KCcuY2FydC1zaGlwbWVudC1jYWxjdWxhdGlvbi1ib3gnKS5xdWVyeVNlbGVjdG9yKCcuY2FydC1zaGlwbWVudC1hdmFpbGFibGUtY2FycmllcnMnKS5zdHlsZS5vcGFjaXR5ID0gMC4yO1xuXG4gICAgICAgIGZldGNoKGZvcm0uYWN0aW9uLCB7XG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIGJvZHk6IG5ldyBVUkxTZWFyY2hQYXJhbXMobmV3IEZvcm1EYXRhKGZvcm0pKVxuICAgICAgICB9KVxuICAgICAgICAudGhlbihyZXNwb25zZSA9PiByZXNwb25zZS50ZXh0KCkpXG4gICAgICAgIC50aGVuKHJlcyA9PiB1cGRhdGVTaGlwbWVudENhbGN1bGF0aW9uKGZvcm0sIHJlcykpXG4gICAgICAgIC5jYXRjaChlcnJvciA9PiBoYW5kbGVTaGlwbWVudEVycm9yKGZvcm0sIGVycm9yKSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlU2hpcG1lbnRDYWxjdWxhdGlvbihmb3JtLCByZXNwb25zZVRleHQpIHtcbiAgICAgICAgZm9ybS5jbGFzc0xpc3QucmVtb3ZlKCdsb2FkaW5nJyk7XG4gICAgICAgIGZvcm0uY2xvc2VzdCgnLmNhcnQtc2hpcG1lbnQtY2FsY3VsYXRpb24tYm94Jykub3V0ZXJIVE1MID0gcmVzcG9uc2VUZXh0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhhbmRsZVNoaXBtZW50RXJyb3IoZm9ybSwgZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3I6JywgZXJyb3IpO1xuICAgICAgICBmb3JtLmNsYXNzTGlzdC5yZW1vdmUoJ2xvYWRpbmcnKTtcbiAgICAgICAgZm9ybS5xdWVyeVNlbGVjdG9yKCdidXR0b25bdHlwZT1cInN1Ym1pdFwiXScpLnJlbW92ZUF0dHJpYnV0ZSgnZGlzYWJsZWQnKTtcbiAgICB9XG5cbiAgICBzaG9wLmluaXRDaGFuZ2VBZGRyZXNzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zdCBhZGRyZXNzU3RlcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jaGVja291dC1zdGVwLnN0ZXAtYWRkcmVzcycpO1xuICAgICAgICBpZiAoIWFkZHJlc3NTdGVwKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgaW52b2ljZUFkZHJlc3MgPSBhZGRyZXNzU3RlcC5xdWVyeVNlbGVjdG9yKCdzZWxlY3RbbmFtZT1cImNvcmVzaG9wW2ludm9pY2VBZGRyZXNzXVwiXScpO1xuICAgICAgICBjb25zdCBzaGlwcGluZ0FkZHJlc3MgPSBhZGRyZXNzU3RlcC5xdWVyeVNlbGVjdG9yKCdzZWxlY3RbbmFtZT1cImNvcmVzaG9wW3NoaXBwaW5nQWRkcmVzc11cIl0nKTtcbiAgICAgICAgY29uc3QgdXNlSWFzUyA9IGFkZHJlc3NTdGVwLnF1ZXJ5U2VsZWN0b3IoJ1tuYW1lPVwiY29yZXNob3BbdXNlSW52b2ljZUFzU2hpcHBpbmddXCJdJyk7XG5cbiAgICAgICAgc2V0dXBBZGRyZXNzQ2hhbmdlRXZlbnRzKGludm9pY2VBZGRyZXNzLCBzaGlwcGluZ0FkZHJlc3MsIHVzZUlhc1MpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBzZXR1cEFkZHJlc3NDaGFuZ2VFdmVudHMoaW52b2ljZUFkZHJlc3MsIHNoaXBwaW5nQWRkcmVzcywgdXNlSWFzUykge1xuICAgICAgICBpbnZvaWNlQWRkcmVzcy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB1cGRhdGVBZGRyZXNzKGludm9pY2VBZGRyZXNzLCB1c2VJYXNTKSk7XG4gICAgICAgIHNoaXBwaW5nQWRkcmVzcy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB1cGRhdGVTaGlwcGluZ0FkZHJlc3Moc2hpcHBpbmdBZGRyZXNzKSk7XG4gICAgICAgIGlmICh1c2VJYXNTKSB1c2VJYXNTLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHRvZ2dsZVNoaXBwaW5nQWRkcmVzcyh1c2VJYXNTLCBpbnZvaWNlQWRkcmVzcywgc2hpcHBpbmdBZGRyZXNzKSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlQWRkcmVzcyhpbnZvaWNlQWRkcmVzcywgdXNlSWFzUykge1xuICAgICAgICBjb25zdCBzZWxlY3RlZCA9IGludm9pY2VBZGRyZXNzLm9wdGlvbnNbaW52b2ljZUFkZHJlc3Muc2VsZWN0ZWRJbmRleF07XG4gICAgICAgIGNvbnN0IGFkZHJlc3MgPSBKU09OLnBhcnNlKHNlbGVjdGVkLmRhdGFzZXQuYWRkcmVzcykuaHRtbDtcbiAgICAgICAgY29uc3QgaW52b2ljZVBhbmVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnBhbmVsLWludm9pY2UtYWRkcmVzcycpO1xuICAgICAgICBpbnZvaWNlUGFuZWwuaW5uZXJIVE1MID0gYWRkcmVzcyB8fCAnJztcblxuICAgICAgICB0b2dnbGVVc2VBc1NoaXBwaW5nKHVzZUlhc1MsIHNlbGVjdGVkLmRhdGFzZXQuYWRkcmVzc1R5cGUgPT09ICdpbnZvaWNlJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdG9nZ2xlVXNlQXNTaGlwcGluZyh1c2VJYXNTLCBpc0ludm9pY2VUeXBlKSB7XG4gICAgICAgIGlmICh1c2VJYXNTKSB7XG4gICAgICAgICAgICB1c2VJYXNTLmRpc2FibGVkID0gaXNJbnZvaWNlVHlwZTtcbiAgICAgICAgICAgIGlmIChpc0ludm9pY2VUeXBlKSB7XG4gICAgICAgICAgICAgICAgdXNlSWFzUy5jaGVja2VkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdXNlSWFzUy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnY2hhbmdlJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlU2hpcHBpbmdBZGRyZXNzKHNoaXBwaW5nQWRkcmVzcykge1xuICAgICAgICBjb25zdCBzZWxlY3RlZCA9IHNoaXBwaW5nQWRkcmVzcy5vcHRpb25zW3NoaXBwaW5nQWRkcmVzcy5zZWxlY3RlZEluZGV4XTtcbiAgICAgICAgY29uc3QgYWRkcmVzcyA9IEpTT04ucGFyc2Uoc2VsZWN0ZWQuZGF0YXNldC5hZGRyZXNzKS5odG1sO1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucGFuZWwtc2hpcHBpbmctYWRkcmVzcycpLmlubmVySFRNTCA9IGFkZHJlc3MgfHwgJyc7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdG9nZ2xlU2hpcHBpbmdBZGRyZXNzKHVzZUlhc1MsIGludm9pY2VBZGRyZXNzLCBzaGlwcGluZ0FkZHJlc3MpIHtcbiAgICAgICAgY29uc3Qgc2hpcHBpbmdGaWVsZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zaGlwcGluZy1hZGRyZXNzLXNlbGVjdG9yJyk7XG4gICAgICAgIGNvbnN0IHNoaXBwaW5nQWRkQWRkcmVzc0J1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jYXJkLWZvb3RlcicpO1xuXG4gICAgICAgIGlmICh1c2VJYXNTLmNoZWNrZWQpIHtcbiAgICAgICAgICAgIHNoaXBwaW5nRmllbGQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgIHNoaXBwaW5nQWRkcmVzcy52YWx1ZSA9IGludm9pY2VBZGRyZXNzLnZhbHVlO1xuICAgICAgICAgICAgc2hpcHBpbmdBZGRyZXNzLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdjaGFuZ2UnKSk7XG4gICAgICAgICAgICBpZiAoc2hpcHBpbmdBZGRBZGRyZXNzQnV0dG9uKSBzaGlwcGluZ0FkZEFkZHJlc3NCdXR0b24uY2xhc3NMaXN0LmFkZCgnZC1ub25lJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzaGlwcGluZ0ZpZWxkLnN0eWxlLmRpc3BsYXkgPSAnJztcbiAgICAgICAgICAgIGlmIChzaGlwcGluZ0FkZEFkZHJlc3NCdXR0b24pIHNoaXBwaW5nQWRkQWRkcmVzc0J1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKCdkLW5vbmUnKTtcbiAgICAgICAgfVxuICAgIH1cblxufShzaG9wKSk7XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgc2hvcC5pbml0KCk7XG59KTtcbiIsIihmdW5jdGlvbiAodmFyaWFudCkge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHdpbmRvdy52YXJpYW50UmVhZHkgPSBmYWxzZTtcblxuICAgICAgICB2YXJpYW50LmluaXQoKTtcblxuICAgICAgICB3aW5kb3cudmFyaWFudFJlYWR5ID0gdHJ1ZTtcbiAgICB9KTtcblxuICAgIHZhcmlhbnQuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29uc3QgdmFyaWFudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucHJvZHVjdC1pbmZvX19hdHRyaWJ1dGVzJyk7XG4gICAgICAgIGlmICghdmFyaWFudHMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvcmVzaG9wVmFyaWFudFNlbGVjdG9yKHZhcmlhbnRzKTsgLy8gRW5zdXJlIHRoaXMgZnVuY3Rpb24gaXMgZGVmaW5lZCBpbiB5b3VyIGdsb2JhbCBzY29wZVxuXG4gICAgICAgIHZhcmlhbnRzLmFkZEV2ZW50TGlzdGVuZXIoJ3ZhcmlhbnRfc2VsZWN0b3Iuc2VsZWN0JywgKGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG9wdGlvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucHJvZHVjdC1pbmZvIC5wcm9kdWN0LWRldGFpbHMgLm9wdGlvbnMnKTtcblxuICAgICAgICAgICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzdWJtaXRzID0gb3B0aW9ucy5xdWVyeVNlbGVjdG9yQWxsKCdbdHlwZT1cInN1Ym1pdFwiXScpO1xuXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5jbGFzc0xpc3QuYWRkKCdkaXNhYmxlZCcpO1xuXG4gICAgICAgICAgICAgICAgc3VibWl0cy5mb3JFYWNoKChzdWJtaXQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgc3VibWl0LmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcbn0od2luZG93LnZhcmlhbnQgfHwgKHdpbmRvdy52YXJpYW50ID0ge30pKSk7IC8vIEV4dHJhY3RlZCBhc3NpZ25tZW50XG4iLCIvKiBTVFlMRVMgICovXG5pbXBvcnQgJy4uL3Njc3MvYXBwLnNjc3MnO1xuaW1wb3J0ICdzd2lwZXIvY3NzL2J1bmRsZSc7XG4vKiBKUyAqL1xuaW1wb3J0ICdib290c3RyYXAnO1xuaW1wb3J0ICcuL3NjcmlwdHMvaGFuZGxlLXByb3RvdHlwZXMuanMnO1xuaW1wb3J0ICcuL3BsdWdpbi9jb3Jlc2hvcC5wbHVnaW4ucXVhbnRpdHkuanMnO1xuaW1wb3J0ICcuL3BsdWdpbi9jb3Jlc2hvcC5wbHVnaW4udmFyaWFudC5qcyc7XG5pbXBvcnQgJy4vc2NyaXB0cy9zaG9wLmpzJztcbmltcG9ydCAnLi9zY3JpcHRzL3ZhcmlhbnQuanMnO1xuaW1wb3J0ICcuL3NjcmlwdHMvbWFwLmpzJztcbmltcG9ydCB7IENhcm91c2VsIH0gZnJvbSAnLi9zY3JpcHRzL2Nhcm91c2VsJztcbmltcG9ydCB7IENhcnRJbmZvIH0gZnJvbSAnLi9zY3JpcHRzL2NhcnRJbmZvJztcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIENhcnRXaWRnZXQgPSBuZXcgQ2FydEluZm8oJy9jb3Jlc2hvcF9nZXRfY2FydF9pdGVtcycsICcuanMtY2FydC13aWRnZXQnKTtcbiAgICB2YXIgQ2Fyb3VzZWxQcm9kdWN0cyA9IG5ldyBDYXJvdXNlbCgpO1xuICAgIGNvbnNvbGUubG9nKENhcnRXaWRnZXQpO1xuICAgIGNvbnNvbGUubG9nKENhcm91c2VsUHJvZHVjdHMpO1xufSk7XG4iLCJpbXBvcnQgU3dpcGVyIGZyb20gJ3N3aXBlcic7XG5pbXBvcnQgeyBUaHVtYnMgfSBmcm9tIFwic3dpcGVyL21vZHVsZXNcIjtcbnZhciBDYXJvdXNlbCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBDYXJvdXNlbCgpIHtcbiAgICAgICAgdGhpcy5faW5pdENhcm91c2VsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLyogSW5pdCBzd2lwZXIgd2l0aCB0aHVtYnMgKi9cbiAgICAgICAgICAgIHZhciBzbGlkZXJUaHVtYm5haWwgPSBuZXcgU3dpcGVyKCcuanMtc2xpZGVyLXRodW1ibmFpbCcsIHtcbiAgICAgICAgICAgICAgICBzbGlkZXNQZXJWaWV3OiAzLFxuICAgICAgICAgICAgICAgIGZyZWVNb2RlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNwYWNlQmV0d2VlbjogJzhweCcsXG4gICAgICAgICAgICAgICAgd2F0Y2hTbGlkZXNQcm9ncmVzczogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIG1haW5TbGlkZXIgPSBuZXcgU3dpcGVyKCcuanMtc2xpZGVyJywge1xuICAgICAgICAgICAgICAgIG1vZHVsZXM6IFtUaHVtYnNdLCAvLyBJbmNsdWRlIHRoZSBUaHVtYnMgbW9kdWxlXG4gICAgICAgICAgICAgICAgbmF2aWdhdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICBuZXh0RWw6ICcuc3dpcGVyLWJ1dHRvbi1uZXh0JyxcbiAgICAgICAgICAgICAgICAgICAgcHJldkVsOiAnLnN3aXBlci1idXR0b24tcHJldicsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aHVtYnM6IHtcbiAgICAgICAgICAgICAgICAgICAgc3dpcGVyOiBzbGlkZXJUaHVtYm5haWwgLy8gTGluayB0aHVtYm5haWwgc3dpcGVyXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhtYWluU2xpZGVyKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5faW5pdENhcm91c2VsKCk7XG4gICAgfVxuICAgIHJldHVybiBDYXJvdXNlbDtcbn0oKSk7XG5leHBvcnQgeyBDYXJvdXNlbCB9O1xuIiwidmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG52YXIgX19nZW5lcmF0b3IgPSAodGhpcyAmJiB0aGlzLl9fZ2VuZXJhdG9yKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgYm9keSkge1xuICAgIHZhciBfID0geyBsYWJlbDogMCwgc2VudDogZnVuY3Rpb24oKSB7IGlmICh0WzBdICYgMSkgdGhyb3cgdFsxXTsgcmV0dXJuIHRbMV07IH0sIHRyeXM6IFtdLCBvcHM6IFtdIH0sIGYsIHksIHQsIGcgPSBPYmplY3QuY3JlYXRlKCh0eXBlb2YgSXRlcmF0b3IgPT09IFwiZnVuY3Rpb25cIiA/IEl0ZXJhdG9yIDogT2JqZWN0KS5wcm90b3R5cGUpO1xuICAgIHJldHVybiBnLm5leHQgPSB2ZXJiKDApLCBnW1widGhyb3dcIl0gPSB2ZXJiKDEpLCBnW1wicmV0dXJuXCJdID0gdmVyYigyKSwgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIChnW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXM7IH0pLCBnO1xuICAgIGZ1bmN0aW9uIHZlcmIobikgeyByZXR1cm4gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIHN0ZXAoW24sIHZdKTsgfTsgfVxuICAgIGZ1bmN0aW9uIHN0ZXAob3ApIHtcbiAgICAgICAgaWYgKGYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJHZW5lcmF0b3IgaXMgYWxyZWFkeSBleGVjdXRpbmcuXCIpO1xuICAgICAgICB3aGlsZSAoZyAmJiAoZyA9IDAsIG9wWzBdICYmIChfID0gMCkpLCBfKSB0cnkge1xuICAgICAgICAgICAgaWYgKGYgPSAxLCB5ICYmICh0ID0gb3BbMF0gJiAyID8geVtcInJldHVyblwiXSA6IG9wWzBdID8geVtcInRocm93XCJdIHx8ICgodCA9IHlbXCJyZXR1cm5cIl0pICYmIHQuY2FsbCh5KSwgMCkgOiB5Lm5leHQpICYmICEodCA9IHQuY2FsbCh5LCBvcFsxXSkpLmRvbmUpIHJldHVybiB0O1xuICAgICAgICAgICAgaWYgKHkgPSAwLCB0KSBvcCA9IFtvcFswXSAmIDIsIHQudmFsdWVdO1xuICAgICAgICAgICAgc3dpdGNoIChvcFswXSkge1xuICAgICAgICAgICAgICAgIGNhc2UgMDogY2FzZSAxOiB0ID0gb3A7IGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgNDogXy5sYWJlbCsrOyByZXR1cm4geyB2YWx1ZTogb3BbMV0sIGRvbmU6IGZhbHNlIH07XG4gICAgICAgICAgICAgICAgY2FzZSA1OiBfLmxhYmVsKys7IHkgPSBvcFsxXTsgb3AgPSBbMF07IGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGNhc2UgNzogb3AgPSBfLm9wcy5wb3AoKTsgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBpZiAoISh0ID0gXy50cnlzLCB0ID0gdC5sZW5ndGggPiAwICYmIHRbdC5sZW5ndGggLSAxXSkgJiYgKG9wWzBdID09PSA2IHx8IG9wWzBdID09PSAyKSkgeyBfID0gMDsgY29udGludWU7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSAzICYmICghdCB8fCAob3BbMV0gPiB0WzBdICYmIG9wWzFdIDwgdFszXSkpKSB7IF8ubGFiZWwgPSBvcFsxXTsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSA2ICYmIF8ubGFiZWwgPCB0WzFdKSB7IF8ubGFiZWwgPSB0WzFdOyB0ID0gb3A7IGJyZWFrOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0ICYmIF8ubGFiZWwgPCB0WzJdKSB7IF8ubGFiZWwgPSB0WzJdOyBfLm9wcy5wdXNoKG9wKTsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRbMl0pIF8ub3BzLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb3AgPSBib2R5LmNhbGwodGhpc0FyZywgXyk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHsgb3AgPSBbNiwgZV07IHkgPSAwOyB9IGZpbmFsbHkgeyBmID0gdCA9IDA7IH1cbiAgICAgICAgaWYgKG9wWzBdICYgNSkgdGhyb3cgb3BbMV07IHJldHVybiB7IHZhbHVlOiBvcFswXSA/IG9wWzFdIDogdm9pZCAwLCBkb25lOiB0cnVlIH07XG4gICAgfVxufTtcbnZhciBDYXJ0SW5mbyA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBDYXJ0SW5mbyhhcGlVcmwsIGVsZW1lbnRTZWxlY3Rvcikge1xuICAgICAgICB0aGlzLmFwaVVybCA9IGFwaVVybDtcbiAgICAgICAgdGhpcy5lbGVtZW50U2VsZWN0b3IgPSBlbGVtZW50U2VsZWN0b3I7XG4gICAgICAgIHRoaXMuX2luaXRDYXJ0V2lkZ2V0KCk7XG4gICAgfVxuICAgIENhcnRJbmZvLnByb3RvdHlwZS5mZXRjaENhcnRJdGVtcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHJlc3BvbnNlLCBodG1sLCBlcnJvcl8xO1xuICAgICAgICAgICAgcmV0dXJuIF9fZ2VuZXJhdG9yKHRoaXMsIGZ1bmN0aW9uIChfYSkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoX2EubGFiZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgICAgICAgICAgX2EudHJ5cy5wdXNoKFswLCAzLCAsIDRdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbNCAvKnlpZWxkKi8sIGZldGNoKHRoaXMuYXBpVXJsKV07XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gX2Euc2VudCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1RoZXJlIGhhcyBiZWVuIGEgcHJvYmxlbSB3aXRoIHlvdXIgZmV0Y2ggb3BlcmF0aW9uOicsIHJlc3BvbnNlLnN0YXR1c1RleHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbMiAvKnJldHVybiovXTsgLy8gQWRkZWQgcmV0dXJuIHRvIHByZXZlbnQgZnVydGhlciBleGVjdXRpb24gaWYgdGhlcmUncyBhbiBlcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFs0IC8qeWllbGQqLywgcmVzcG9uc2UudGV4dCgpXTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgICAgICAgICAgaHRtbCA9IF9hLnNlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGlzcGxheUNhcnRJdGVtcyhodG1sKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbMyAvKmJyZWFrKi8sIDRdO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcl8xID0gX2Euc2VudCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignVGhlcmUgaGFzIGJlZW4gYSBwcm9ibGVtIHdpdGggeW91ciBmZXRjaCBvcGVyYXRpb246JywgZXJyb3JfMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzMgLypicmVhayovLCA0XTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSA0OiByZXR1cm4gWzIgLypyZXR1cm4qL107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgQ2FydEluZm8ucHJvdG90eXBlLl9pbml0Q2FydFdpZGdldCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5mZXRjaENhcnRJdGVtcygpO1xuICAgIH07XG4gICAgQ2FydEluZm8ucHJvdG90eXBlLmRpc3BsYXlDYXJ0SXRlbXMgPSBmdW5jdGlvbiAoaHRtbCkge1xuICAgICAgICB2YXIgY2FydEZsYWcgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuZWxlbWVudFNlbGVjdG9yKTtcbiAgICAgICAgaWYgKGNhcnRGbGFnKSB7XG4gICAgICAgICAgICB2YXIgbG9hZGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmpzLWNhcnQtbG9hZGVyJyk7XG4gICAgICAgICAgICBpZiAobG9hZGVyKSB7XG4gICAgICAgICAgICAgICAgbG9hZGVyLnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FydEZsYWcuaW5uZXJIVE1MICs9IGh0bWw7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBDYXJ0SW5mbztcbn0oKSk7XG5leHBvcnQgeyBDYXJ0SW5mbyB9O1xuIiwiLy8gZXh0cmFjdGVkIGJ5IG1pbmktY3NzLWV4dHJhY3QtcGx1Z2luXG5leHBvcnQge307IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbi8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBfX3dlYnBhY2tfbW9kdWxlc19fO1xuXG4iLCJ2YXIgZGVmZXJyZWQgPSBbXTtcbl9fd2VicGFja19yZXF1aXJlX18uTyA9IChyZXN1bHQsIGNodW5rSWRzLCBmbiwgcHJpb3JpdHkpID0+IHtcblx0aWYoY2h1bmtJZHMpIHtcblx0XHRwcmlvcml0eSA9IHByaW9yaXR5IHx8IDA7XG5cdFx0Zm9yKHZhciBpID0gZGVmZXJyZWQubGVuZ3RoOyBpID4gMCAmJiBkZWZlcnJlZFtpIC0gMV1bMl0gPiBwcmlvcml0eTsgaS0tKSBkZWZlcnJlZFtpXSA9IGRlZmVycmVkW2kgLSAxXTtcblx0XHRkZWZlcnJlZFtpXSA9IFtjaHVua0lkcywgZm4sIHByaW9yaXR5XTtcblx0XHRyZXR1cm47XG5cdH1cblx0dmFyIG5vdEZ1bGZpbGxlZCA9IEluZmluaXR5O1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IGRlZmVycmVkLmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIGNodW5rSWRzID0gZGVmZXJyZWRbaV1bMF07XG5cdFx0dmFyIGZuID0gZGVmZXJyZWRbaV1bMV07XG5cdFx0dmFyIHByaW9yaXR5ID0gZGVmZXJyZWRbaV1bMl07XG5cdFx0dmFyIGZ1bGZpbGxlZCA9IHRydWU7XG5cdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBjaHVua0lkcy5sZW5ndGg7IGorKykge1xuXHRcdFx0aWYgKChwcmlvcml0eSAmIDEgPT09IDAgfHwgbm90RnVsZmlsbGVkID49IHByaW9yaXR5KSAmJiBPYmplY3Qua2V5cyhfX3dlYnBhY2tfcmVxdWlyZV9fLk8pLmV2ZXJ5KChrZXkpID0+IChfX3dlYnBhY2tfcmVxdWlyZV9fLk9ba2V5XShjaHVua0lkc1tqXSkpKSkge1xuXHRcdFx0XHRjaHVua0lkcy5zcGxpY2Uoai0tLCAxKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGZ1bGZpbGxlZCA9IGZhbHNlO1xuXHRcdFx0XHRpZihwcmlvcml0eSA8IG5vdEZ1bGZpbGxlZCkgbm90RnVsZmlsbGVkID0gcHJpb3JpdHk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmKGZ1bGZpbGxlZCkge1xuXHRcdFx0ZGVmZXJyZWQuc3BsaWNlKGktLSwgMSlcblx0XHRcdHZhciByID0gZm4oKTtcblx0XHRcdGlmIChyICE9PSB1bmRlZmluZWQpIHJlc3VsdCA9IHI7XG5cdFx0fVxuXHR9XG5cdHJldHVybiByZXN1bHQ7XG59OyIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSAobW9kdWxlKSA9PiB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdCgpID0+IChtb2R1bGVbJ2RlZmF1bHQnXSkgOlxuXHRcdCgpID0+IChtb2R1bGUpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5nID0gKGZ1bmN0aW9uKCkge1xuXHRpZiAodHlwZW9mIGdsb2JhbFRoaXMgPT09ICdvYmplY3QnKSByZXR1cm4gZ2xvYmFsVGhpcztcblx0dHJ5IHtcblx0XHRyZXR1cm4gdGhpcyB8fCBuZXcgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblx0fSBjYXRjaCAoZSkge1xuXHRcdGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JykgcmV0dXJuIHdpbmRvdztcblx0fVxufSkoKTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiLy8gbm8gYmFzZVVSSVxuXG4vLyBvYmplY3QgdG8gc3RvcmUgbG9hZGVkIGFuZCBsb2FkaW5nIGNodW5rc1xuLy8gdW5kZWZpbmVkID0gY2h1bmsgbm90IGxvYWRlZCwgbnVsbCA9IGNodW5rIHByZWxvYWRlZC9wcmVmZXRjaGVkXG4vLyBbcmVzb2x2ZSwgcmVqZWN0LCBQcm9taXNlXSA9IGNodW5rIGxvYWRpbmcsIDAgPSBjaHVuayBsb2FkZWRcbnZhciBpbnN0YWxsZWRDaHVua3MgPSB7XG5cdFwiYXBwXCI6IDBcbn07XG5cbi8vIG5vIGNodW5rIG9uIGRlbWFuZCBsb2FkaW5nXG5cbi8vIG5vIHByZWZldGNoaW5nXG5cbi8vIG5vIHByZWxvYWRlZFxuXG4vLyBubyBITVJcblxuLy8gbm8gSE1SIG1hbmlmZXN0XG5cbl9fd2VicGFja19yZXF1aXJlX18uTy5qID0gKGNodW5rSWQpID0+IChpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF0gPT09IDApO1xuXG4vLyBpbnN0YWxsIGEgSlNPTlAgY2FsbGJhY2sgZm9yIGNodW5rIGxvYWRpbmdcbnZhciB3ZWJwYWNrSnNvbnBDYWxsYmFjayA9IChwYXJlbnRDaHVua0xvYWRpbmdGdW5jdGlvbiwgZGF0YSkgPT4ge1xuXHR2YXIgY2h1bmtJZHMgPSBkYXRhWzBdO1xuXHR2YXIgbW9yZU1vZHVsZXMgPSBkYXRhWzFdO1xuXHR2YXIgcnVudGltZSA9IGRhdGFbMl07XG5cdC8vIGFkZCBcIm1vcmVNb2R1bGVzXCIgdG8gdGhlIG1vZHVsZXMgb2JqZWN0LFxuXHQvLyB0aGVuIGZsYWcgYWxsIFwiY2h1bmtJZHNcIiBhcyBsb2FkZWQgYW5kIGZpcmUgY2FsbGJhY2tcblx0dmFyIG1vZHVsZUlkLCBjaHVua0lkLCBpID0gMDtcblx0aWYoY2h1bmtJZHMuc29tZSgoaWQpID0+IChpbnN0YWxsZWRDaHVua3NbaWRdICE9PSAwKSkpIHtcblx0XHRmb3IobW9kdWxlSWQgaW4gbW9yZU1vZHVsZXMpIHtcblx0XHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhtb3JlTW9kdWxlcywgbW9kdWxlSWQpKSB7XG5cdFx0XHRcdF9fd2VicGFja19yZXF1aXJlX18ubVttb2R1bGVJZF0gPSBtb3JlTW9kdWxlc1ttb2R1bGVJZF07XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmKHJ1bnRpbWUpIHZhciByZXN1bHQgPSBydW50aW1lKF9fd2VicGFja19yZXF1aXJlX18pO1xuXHR9XG5cdGlmKHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uKSBwYXJlbnRDaHVua0xvYWRpbmdGdW5jdGlvbihkYXRhKTtcblx0Zm9yKDtpIDwgY2h1bmtJZHMubGVuZ3RoOyBpKyspIHtcblx0XHRjaHVua0lkID0gY2h1bmtJZHNbaV07XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGluc3RhbGxlZENodW5rcywgY2h1bmtJZCkgJiYgaW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdKSB7XG5cdFx0XHRpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF1bMF0oKTtcblx0XHR9XG5cdFx0aW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdID0gMDtcblx0fVxuXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXy5PKHJlc3VsdCk7XG59XG5cbnZhciBjaHVua0xvYWRpbmdHbG9iYWwgPSBzZWxmW1wid2VicGFja0NodW5rXCJdID0gc2VsZltcIndlYnBhY2tDaHVua1wiXSB8fCBbXTtcbmNodW5rTG9hZGluZ0dsb2JhbC5mb3JFYWNoKHdlYnBhY2tKc29ucENhbGxiYWNrLmJpbmQobnVsbCwgMCkpO1xuY2h1bmtMb2FkaW5nR2xvYmFsLnB1c2ggPSB3ZWJwYWNrSnNvbnBDYWxsYmFjay5iaW5kKG51bGwsIGNodW5rTG9hZGluZ0dsb2JhbC5wdXNoLmJpbmQoY2h1bmtMb2FkaW5nR2xvYmFsKSk7IiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBkZXBlbmRzIG9uIG90aGVyIGxvYWRlZCBjaHVua3MgYW5kIGV4ZWN1dGlvbiBuZWVkIHRvIGJlIGRlbGF5ZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXy5PKHVuZGVmaW5lZCwgW1widmVuZG9ycy1ub2RlX21vZHVsZXNfYm9vdHN0cmFwX2Rpc3RfanNfYm9vdHN0cmFwX2VzbV9qcy1ub2RlX21vZHVsZXNfc3dpcGVyX3N3aXBlci1idW5kbGVfY3NzLTBjZGVkYlwiXSwgKCkgPT4gKF9fd2VicGFja19yZXF1aXJlX18oXCIuL2pzL2FwcC50c1wiKSkpXG5fX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXy5PKF9fd2VicGFja19leHBvcnRzX18pO1xuIiwiIl0sIm5hbWVzIjpbImNvcmVzaG9wUXVhbnRpdHlTZWxlY3RvciIsIm9wdGlvbnMiLCJpbml0UXVhbnRpdHlGaWVsZHMiLCJmaWVsZHMiLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJwcmVjaXNpb25QcmVzZXRTZWxlY3RvciIsInF1ZXJ5U2VsZWN0b3IiLCJhZGRFdmVudExpc3RlbmVyIiwiZGF0YXNldCIsImNzVW5pdElkZW50aWZpZXIiLCJxdWFudGl0eUlkZW50aWZpZXIiLCJxdWFudGl0eUlucHV0IiwiY29uY2F0Iiwic3RlcCIsImNzVW5pdFByZWNpc2lvbiIsInVwZGF0ZVRvdWNoU3BpblNldHRpbmdzIiwidG9TdHJpbmciLCJmb3JFYWNoIiwiZmllbGQiLCJpbml0aWFsaXplVG91Y2hTcGluIiwiaW5wdXQiLCJwcmVjaXNpb24iLCJjb250YWluZXIiLCJjcmVhdGVFbGVtZW50IiwiY2xhc3NMaXN0IiwiYWRkIiwiZGVjcmVtZW50QnV0dG9uIiwidHlwZSIsInRleHRDb250ZW50IiwiaW5jcmVtZW50QnV0dG9uIiwicGFyZW50Tm9kZSIsImluc2VydEJlZm9yZSIsImFwcGVuZENoaWxkIiwidmFsdWUiLCJwYXJzZUludCIsImlzTmFOIiwibWluIiwibWF4Iiwid2luZG93IiwiY29yZXNob3BWYXJpYW50U2VsZWN0b3IiLCJhdHRyaWJ1dGVDb250YWluZXIiLCJfYXR0cmlidXRlQ29udGFpbmVyIiwiX2NvbmZpZyIsIl9hdHRyaWJ1dGVHcm91cHMiLCJfaW5pdCIsIkpTT04iLCJwYXJzZSIsImNvbmZpZyIsIl9pbml0aWFsaXplQXR0cmlidXRlR3JvdXBzIiwiX3NldHVwQXR0cmlidXRlR3JvdXBTZXR0aW5ncyIsIl9zZXR1cENoYW5nZUV2ZW50cyIsImF0dHJpYnV0ZXMiLCJncm91cCIsImVsZW1lbnRzIiwiaWQiLCJwdXNoIiwiaW5kZXgiLCJwcmV2R3JvdXAiLCJuZXh0R3JvdXAiLCJzZWxlY3RlZCIsIl9jb25maWd1cmVHcm91cCIsIl9jbGVhckdyb3VwIiwiX2F0dGFjaENoYW5nZUV2ZW50IiwiX2Fzc2lnbk9uQ2hhbmdlRXZlbnQiLCJlbGVtZW50Iiwib25jaGFuZ2UiLCJfaGFuZGxlRWxlbWVudENoYW5nZSIsInZhcmlhbnRSZWFkeSIsImRpc3BhdGNoRXZlbnQiLCJfY3JlYXRlRXZlbnQiLCJfc2VsZWN0R3JvdXBFbGVtZW50IiwiX2Rlc2VsZWN0R3JvdXBFbGVtZW50IiwiX2NsZWFyR3JvdXBzIiwiX3JlZGlyZWN0VG9WYXJpYW50Iiwic2VsZWN0ZWRBdHRyaWJ1dGVzIiwiX2dldFNlbGVjdGVkQXR0cmlidXRlcyIsIm1hdGNoaW5nUHJvZHVjdCIsIl9maW5kTWF0Y2hpbmdQcm9kdWN0IiwidXJsIiwibG9jYXRpb24iLCJocmVmIiwiT2JqZWN0IiwiZnJvbUVudHJpZXMiLCJmaWx0ZXIiLCJnIiwibWFwIiwidmFsdWVzIiwiZmluZCIsInAiLCJzdHJpbmdpZnkiLCJuYW1lIiwiZGF0YSIsImFyZ3VtZW50cyIsImxlbmd0aCIsInVuZGVmaW5lZCIsIkN1c3RvbUV2ZW50IiwiYnViYmxlcyIsImNhbmNlbGFibGUiLCJkZXRhaWwiLCJfY2xlYXJHcm91cEVsZW1lbnRzIiwiZGlzYWJsZWQiLCJjaGVja2VkIiwidGFnTmFtZSIsInRvTG93ZXJDYXNlIiwiX2NsZWFyU2VsZWN0T3B0aW9ucyIsIm9wdGlvbiIsInJlbW92ZUNoaWxkIiwiX2lzUHJvZHVjdE1hdGNoaW5nRmlsdGVycyIsInByb2R1Y3QiLCJmaWx0ZXJBdHRyaWJ1dGVzIiwiZXZlcnkiLCJfY29uZmlnJGluZGV4JHByb2R1Y3QiLCJfaXNBdHRyaWJ1dGVSZWxldmFudCIsImF0dHJpYnV0ZSIsInByb2R1Y3RzIiwic29tZSIsIl9maWx0ZXJBdHRyaWJ1dGVzIiwiX2dldEZpbHRlckF0dHJpYnV0ZXMiLCJjdXJyZW50R3JvdXAiLCJfYWRkT3B0aW9uVG9TZWxlY3QiLCJPcHRpb24iLCJfZW5hYmxlRWxlbWVudEZvckF0dHJpYnV0ZSIsIl9jb25maWd1cmVHcm91cEVsZW1lbnRzIiwiX2NvbmZpZ3VyZUVsZW1lbnQiLCJmaWx0ZXJlZEF0dHJpYnV0ZXMiLCJzbGljZSIsIm1ldGhvZHMiLCJpbml0Iiwic2V0dGluZ3MiLCJwcm90b3R5cGVQcmVmaXgiLCJjb250YWluZXJTZWxlY3RvciIsInNlbGVjdG9yQXR0ciIsInNlbGVjdG9yIiwic2hvdyIsInJlcGxhY2UiLCJzZWxlY3RlZFZhbHVlIiwic2VsZWN0ZWRPcHRpb24iLCJBcnJheSIsImZyb20iLCJnZXRBdHRyaWJ1dGUiLCJwcm90b3R5cGVFbGVtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJnZXRDb250YWluZXIiLCJpbm5lckhUTUwiLCJ0cmltIiwicHJvdG90eXBlIiwiZGF0YUNvbnRhaW5lcklkIiwiTm9kZUxpc3QiLCJoYW5kbGVQcm90b3R5cGVzIiwibWV0aG9kIiwiYXBwbHkiLCJjYWxsIiwiRXJyb3IiLCJIVE1MRWxlbWVudCIsIm1hcEJsb2NrIiwic3R5bGUiLCJoZWlnaHQiLCJjbGllbnRIZWlnaHQiLCJpbml0aWFsaXplIiwibWFwT3B0aW9ucyIsInpvb20iLCJjZW50ZXIiLCJnb29nbGUiLCJtYXBzIiwiTGF0TG5nIiwiZGlzYWJsZURlZmF1bHRVSSIsIm1hcE5ldyIsIk1hcCIsImNvbnNvbGUiLCJsb2ciLCJzaG9wIiwiaW5pdENoYW5nZUFkZHJlc3MiLCJpbml0Q2FydFNoaXBtZW50Q2FsY3VsYXRvciIsImluaXRRdWFudGl0eVZhbGlkYXRvciIsImluaXRDYXRlZ29yeVNlbGVjdCIsInNldHVwQ29weVRvQ2xpcGJvYXJkIiwic2hvd0VsZW1lbnQiLCJnZXRTZWxlY3RlZFZhbHVlIiwiYnV0dG9uIiwiY29weVRleHRUb0NsaXBib2FyZCIsInRhcmdldElkIiwidGFyZ2V0IiwiY29weVRleHQiLCJzZWxlY3QiLCJzZXRTZWxlY3Rpb25SYW5nZSIsIm5hdmlnYXRvciIsImNsaXBib2FyZCIsIndyaXRlVGV4dCIsInRoZW4iLCJjb3BpZWRUZXh0IiwidXBkYXRlUXVlcnlTdHJpbmdQYXJhbWV0ZXIiLCJ1cmkiLCJrZXkiLCJyZSIsIlJlZ0V4cCIsInNlcGFyYXRvciIsImluZGV4T2YiLCJtYXRjaCIsImJ1dHRvbmRvd25fY2xhc3MiLCJidXR0b251cF9jbGFzcyIsImV2IiwiZm9ybSIsImNsb3Nlc3QiLCJoYW5kbGVTaGlwbWVudENhbGN1bGF0aW9uIiwiZXZlbnQiLCJwcmV2ZW50RGVmYXVsdCIsInNldEF0dHJpYnV0ZSIsIm9wYWNpdHkiLCJmZXRjaCIsImFjdGlvbiIsImJvZHkiLCJVUkxTZWFyY2hQYXJhbXMiLCJGb3JtRGF0YSIsInJlc3BvbnNlIiwidGV4dCIsInJlcyIsInVwZGF0ZVNoaXBtZW50Q2FsY3VsYXRpb24iLCJjYXRjaCIsImVycm9yIiwiaGFuZGxlU2hpcG1lbnRFcnJvciIsInJlc3BvbnNlVGV4dCIsInJlbW92ZSIsIm91dGVySFRNTCIsInJlbW92ZUF0dHJpYnV0ZSIsImFkZHJlc3NTdGVwIiwiaW52b2ljZUFkZHJlc3MiLCJzaGlwcGluZ0FkZHJlc3MiLCJ1c2VJYXNTIiwic2V0dXBBZGRyZXNzQ2hhbmdlRXZlbnRzIiwidXBkYXRlQWRkcmVzcyIsInVwZGF0ZVNoaXBwaW5nQWRkcmVzcyIsInRvZ2dsZVNoaXBwaW5nQWRkcmVzcyIsInNlbGVjdGVkSW5kZXgiLCJhZGRyZXNzIiwiaHRtbCIsImludm9pY2VQYW5lbCIsInRvZ2dsZVVzZUFzU2hpcHBpbmciLCJhZGRyZXNzVHlwZSIsImlzSW52b2ljZVR5cGUiLCJFdmVudCIsInNoaXBwaW5nRmllbGQiLCJzaGlwcGluZ0FkZEFkZHJlc3NCdXR0b24iLCJkaXNwbGF5IiwidmFyaWFudCIsInZhcmlhbnRzIiwiZSIsInN1Ym1pdHMiLCJzdWJtaXQiLCJDYXJvdXNlbCIsIkNhcnRJbmZvIiwiQ2FydFdpZGdldCIsIkNhcm91c2VsUHJvZHVjdHMiLCJTd2lwZXIiLCJUaHVtYnMiLCJfaW5pdENhcm91c2VsIiwic2xpZGVyVGh1bWJuYWlsIiwic2xpZGVzUGVyVmlldyIsImZyZWVNb2RlIiwic3BhY2VCZXR3ZWVuIiwid2F0Y2hTbGlkZXNQcm9ncmVzcyIsIm1haW5TbGlkZXIiLCJtb2R1bGVzIiwibmF2aWdhdGlvbiIsIm5leHRFbCIsInByZXZFbCIsInRodW1icyIsInN3aXBlciIsIl9fYXdhaXRlciIsInRoaXNBcmciLCJfYXJndW1lbnRzIiwiUCIsImdlbmVyYXRvciIsImFkb3B0IiwicmVzb2x2ZSIsIlByb21pc2UiLCJyZWplY3QiLCJmdWxmaWxsZWQiLCJuZXh0IiwicmVqZWN0ZWQiLCJyZXN1bHQiLCJkb25lIiwiX19nZW5lcmF0b3IiLCJfIiwibGFiZWwiLCJzZW50IiwidCIsInRyeXMiLCJvcHMiLCJmIiwieSIsImNyZWF0ZSIsIkl0ZXJhdG9yIiwidmVyYiIsIlN5bWJvbCIsIml0ZXJhdG9yIiwibiIsInYiLCJvcCIsIlR5cGVFcnJvciIsInBvcCIsImFwaVVybCIsImVsZW1lbnRTZWxlY3RvciIsIl9pbml0Q2FydFdpZGdldCIsImZldGNoQ2FydEl0ZW1zIiwiZXJyb3JfMSIsIl9hIiwib2siLCJzdGF0dXNUZXh0IiwiZGlzcGxheUNhcnRJdGVtcyIsImNhcnRGbGFnIiwibG9hZGVyIl0sInNvdXJjZVJvb3QiOiIifQ==