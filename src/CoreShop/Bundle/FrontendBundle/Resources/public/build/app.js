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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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LHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7V0FDQTtXQUNBO1dBQ0E7V0FDQSxHQUFHO1dBQ0g7V0FDQTtXQUNBLENBQUM7Ozs7O1dDUEQ7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7OztXQ05BOztXQUVBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTs7V0FFQTs7V0FFQTs7V0FFQTs7V0FFQTs7V0FFQTs7V0FFQTs7V0FFQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsTUFBTSxxQkFBcUI7V0FDM0I7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTs7V0FFQTtXQUNBO1dBQ0E7Ozs7O1VFbERBO1VBQ0E7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9qcy9wbHVnaW4vY29yZXNob3AucGx1Z2luLnF1YW50aXR5LmpzIiwid2VicGFjazovLy8uL2pzL3BsdWdpbi9jb3Jlc2hvcC5wbHVnaW4udmFyaWFudC5qcyIsIndlYnBhY2s6Ly8vLi9qcy9zY3JpcHRzL2hhbmRsZS1wcm90b3R5cGVzLmpzIiwid2VicGFjazovLy8uL2pzL3NjcmlwdHMvbWFwLmpzIiwid2VicGFjazovLy8uL2pzL3NjcmlwdHMvc2hvcC5qcyIsIndlYnBhY2s6Ly8vLi9qcy9zY3JpcHRzL3ZhcmlhbnQuanMiLCJ3ZWJwYWNrOi8vLy4vanMvYXBwLnRzIiwid2VicGFjazovLy8uL2pzL3NjcmlwdHMvY2Fyb3VzZWwudHMiLCJ3ZWJwYWNrOi8vLy4vanMvc2NyaXB0cy9jYXJ0SW5mby50cyIsIndlYnBhY2s6Ly8vLi9zY3NzL2FwcC5zY3NzIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2NodW5rIGxvYWRlZCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2dsb2JhbCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2pzb25wIGNodW5rIGxvYWRpbmciLCJ3ZWJwYWNrOi8vL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly8vd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gY29yZXNob3BRdWFudGl0eVNlbGVjdG9yKG9wdGlvbnMpIHtcbiAgICAgICAgaW5pdFF1YW50aXR5RmllbGRzKG9wdGlvbnMpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluaXRRdWFudGl0eUZpZWxkcyhvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IGZpZWxkcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2lucHV0LmNzLXVuaXQtaW5wdXQnKTtcbiAgICAgICAgY29uc3QgcHJlY2lzaW9uUHJlc2V0U2VsZWN0b3IgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdzZWxlY3QuY3MtdW5pdC1zZWxlY3RvcicpO1xuXG4gICAgICAgIGlmKHByZWNpc2lvblByZXNldFNlbGVjdG9yKSB7XG4gICAgICAgICAgICAvLyBMaXN0ZW4gdG8gdW5pdCBkZWZpbml0aW9uIHNlbGVjdG9yXG4gICAgICAgICAgICBwcmVjaXNpb25QcmVzZXRTZWxlY3Rvci5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmRhdGFzZXQuY3NVbml0SWRlbnRpZmllcikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IHF1YW50aXR5SWRlbnRpZmllciA9IHRoaXMuZGF0YXNldC5jc1VuaXRJZGVudGlmaWVyO1xuICAgICAgICAgICAgICAgIGNvbnN0IHF1YW50aXR5SW5wdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBpbnB1dFtkYXRhLWNzLXVuaXQtaWRlbnRpZmllcj1cIiR7cXVhbnRpdHlJZGVudGlmaWVyfVwiXWApO1xuXG4gICAgICAgICAgICAgICAgLy8gU2V0IHN0ZXAgdG8gMSBvciB3aGF0ZXZlciBpbnRlZ2VyIHZhbHVlIHlvdSB3YW50XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RlcCA9IDE7IC8vIENoYW5nZSB0aGlzIGlmIHlvdSB3YW50IGEgZGlmZmVyZW50IGluY3JlbWVudFxuXG4gICAgICAgICAgICAgICAgaWYgKCFxdWFudGl0eUlucHV0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBVc2UgaW50ZWdlciBzdGVwIGRpcmVjdGx5XG4gICAgICAgICAgICAgICAgcXVhbnRpdHlJbnB1dC5zdGVwID0gc3RlcDsgLy8gU2V0IHN0ZXAgYXMgYW4gaW50ZWdlclxuICAgICAgICAgICAgICAgIHF1YW50aXR5SW5wdXQuZGF0YXNldC5jc1VuaXRQcmVjaXNpb24gPSAwOyAvLyBPcHRpb25hbCwgc2luY2UgcHJlY2lzaW9uIGlzIG5vIGxvbmdlciByZWxldmFudFxuXG4gICAgICAgICAgICAgICAgLy8gVXBkYXRlIGlucHV0IHNldHRpbmdzXG4gICAgICAgICAgICAgICAgdXBkYXRlVG91Y2hTcGluU2V0dGluZ3MocXVhbnRpdHlJbnB1dCwgMCwgc3RlcC50b1N0cmluZygpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoZmllbGRzKSB7XG4gICAgICAgICAgICAvLyBJbml0aWFsaXplIHF1YW50aXR5IGZpZWxkcyB3aXRoIGludGVnZXIgc3RlcFxuICAgICAgICAgICAgZmllbGRzLmZvckVhY2goZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICAgICAgICAgICAgLy8gWW91IG1pZ2h0IG5vdCBuZWVkIHByZWNpc2lvbiBhbnltb3JlXG4gICAgICAgICAgICAgICAgaW5pdGlhbGl6ZVRvdWNoU3BpbihmaWVsZCwgMCwgJzEnLCBvcHRpb25zKTsgLy8gQ2hhbmdlICcxJyB0byB5b3VyIGRlc2lyZWQgaW50ZWdlciBpbmNyZW1lbnRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5pdGlhbGl6ZVRvdWNoU3BpbihpbnB1dCwgcHJlY2lzaW9uLCBzdGVwLCBvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBjb250YWluZXIuY2xhc3NMaXN0LmFkZCgndG91Y2hzcGluLWNvbnRhaW5lcicpO1xuXG4gICAgICAgIGNvbnN0IGRlY3JlbWVudEJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICBkZWNyZW1lbnRCdXR0b24udHlwZSA9ICdidXR0b24nO1xuICAgICAgICBkZWNyZW1lbnRCdXR0b24udGV4dENvbnRlbnQgPSAnLSc7XG4gICAgICAgIGRlY3JlbWVudEJ1dHRvbi5jbGFzc0xpc3QuYWRkKCd0b3VjaHNwaW4tZGVjcmVtZW50Jyk7XG5cbiAgICAgICAgY29uc3QgaW5jcmVtZW50QnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgIGluY3JlbWVudEJ1dHRvbi50eXBlID0gJ2J1dHRvbic7XG4gICAgICAgIGluY3JlbWVudEJ1dHRvbi50ZXh0Q29udGVudCA9ICcrJztcbiAgICAgICAgaW5jcmVtZW50QnV0dG9uLmNsYXNzTGlzdC5hZGQoJ3RvdWNoc3Bpbi1pbmNyZW1lbnQnKTtcblxuICAgICAgICBpbnB1dC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShjb250YWluZXIsIGlucHV0KTtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGRlY3JlbWVudEJ1dHRvbik7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChpbnB1dCk7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChpbmNyZW1lbnRCdXR0b24pO1xuXG4gICAgICAgIC8vIFNldCB1cCBldmVudCBsaXN0ZW5lcnMgZm9yIGluY3JlbWVudCBhbmQgZGVjcmVtZW50XG4gICAgICAgIGRlY3JlbWVudEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IHBhcnNlSW50KGlucHV0LnZhbHVlKSB8fCAwOyAvLyBFbnN1cmUgdmFsdWUgaXMgYW4gaW50ZWdlclxuICAgICAgICAgICAgdmFsdWUgLT0gcGFyc2VJbnQoc3RlcCk7IC8vIERlY3JlbWVudCBieSBpbnRlZ2VyIHN0ZXBcbiAgICAgICAgICAgIGlmICh2YWx1ZSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgaW5wdXQudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaW5jcmVtZW50QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgbGV0IHZhbHVlID0gcGFyc2VJbnQoaW5wdXQudmFsdWUpIHx8IDA7IC8vIEVuc3VyZSB2YWx1ZSBpcyBhbiBpbnRlZ2VyXG4gICAgICAgICAgICB2YWx1ZSArPSBwYXJzZUludChzdGVwKTsgLy8gSW5jcmVtZW50IGJ5IGludGVnZXIgc3RlcFxuICAgICAgICAgICAgaW5wdXQudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQWRkIGlucHV0IHZhbGlkYXRpb24gYmFzZWQgb24gaW50ZWdlciB2YWx1ZVxuICAgICAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IHBhcnNlSW50KGlucHV0LnZhbHVlKTtcbiAgICAgICAgICAgIGlmIChpc05hTih2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICBpbnB1dC52YWx1ZSA9IDA7IC8vIERlZmF1bHQgdG8gemVybyBpZiBpbnZhbGlkIGlucHV0XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlucHV0LnZhbHVlID0gdmFsdWU7IC8vIEtlZXAgaXQgYXMgYW4gaW50ZWdlclxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1cGRhdGVUb3VjaFNwaW5TZXR0aW5ncyhpbnB1dCwgcHJlY2lzaW9uLCBzdGVwKSB7XG4gICAgICAgIGlucHV0Lm1pbiA9IDA7XG4gICAgICAgIGlucHV0Lm1heCA9IDEwMDAwMDAwMDA7XG4gICAgICAgIGlucHV0LnN0ZXAgPSBzdGVwO1xuICAgICAgICBpbnB1dC5kYXRhc2V0LmNzVW5pdFByZWNpc2lvbiA9IHByZWNpc2lvbjtcbiAgICB9XG5cbiAgICAvLyBFeHBvcnQgdGhlIGZ1bmN0aW9uIHRvIHRoZSBnbG9iYWwgc2NvcGVcbiAgICB3aW5kb3cuY29yZXNob3BRdWFudGl0eVNlbGVjdG9yID0gY29yZXNob3BRdWFudGl0eVNlbGVjdG9yO1xufSkoKTtcbiIsIihmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgY29yZXNob3BWYXJpYW50U2VsZWN0b3IgPSBmdW5jdGlvbiAoYXR0cmlidXRlQ29udGFpbmVyKSB7XG4gICAgICAgIGxldCBfYXR0cmlidXRlQ29udGFpbmVyID0gbnVsbDtcbiAgICAgICAgbGV0IF9jb25maWcgPSB7fTtcbiAgICAgICAgbGV0IF9hdHRyaWJ1dGVHcm91cHMgPSBbXTtcblxuICAgICAgICBjb25zdCBfaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICghYXR0cmlidXRlQ29udGFpbmVyKSByZXR1cm47XG5cbiAgICAgICAgICAgIF9hdHRyaWJ1dGVDb250YWluZXIgPSBhdHRyaWJ1dGVDb250YWluZXI7XG4gICAgICAgICAgICBfY29uZmlnID0gSlNPTi5wYXJzZShfYXR0cmlidXRlQ29udGFpbmVyLmRhdGFzZXQuY29uZmlnKTtcbiAgICAgICAgICAgIF9pbml0aWFsaXplQXR0cmlidXRlR3JvdXBzKCk7XG4gICAgICAgICAgICBfc2V0dXBBdHRyaWJ1dGVHcm91cFNldHRpbmdzKCk7XG4gICAgICAgICAgICBfc2V0dXBDaGFuZ2VFdmVudHMoKTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfaW5pdGlhbGl6ZUF0dHJpYnV0ZUdyb3VwcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIF9jb25maWcuYXR0cmlidXRlcy5mb3JFYWNoKChncm91cCkgPT4ge1xuICAgICAgICAgICAgICAgIGdyb3VwLmVsZW1lbnRzID0gX2F0dHJpYnV0ZUNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKGBbZGF0YS1ncm91cD1cIiR7Z3JvdXAuZ3JvdXAuaWR9XCJdYCk7XG4gICAgICAgICAgICAgICAgX2F0dHJpYnV0ZUdyb3Vwcy5wdXNoKGdyb3VwKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9zZXR1cEF0dHJpYnV0ZUdyb3VwU2V0dGluZ3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfYXR0cmlidXRlR3JvdXBzLmZvckVhY2goKGdyb3VwLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgIGdyb3VwLnByZXZHcm91cCA9IF9hdHRyaWJ1dGVHcm91cHNbaW5kZXggLSAxXSB8fCBudWxsO1xuICAgICAgICAgICAgICAgIGdyb3VwLm5leHRHcm91cCA9IF9hdHRyaWJ1dGVHcm91cHNbaW5kZXggKyAxXSB8fCBudWxsO1xuICAgICAgICAgICAgICAgIGdyb3VwLnNlbGVjdGVkID8gX2NvbmZpZ3VyZUdyb3VwKGdyb3VwKSA6IF9jbGVhckdyb3VwKGdyb3VwKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9zZXR1cENoYW5nZUV2ZW50cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIF9hdHRyaWJ1dGVHcm91cHMuZm9yRWFjaCgoZ3JvdXApID0+IF9hdHRhY2hDaGFuZ2VFdmVudChncm91cCkpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9hc3NpZ25PbkNoYW5nZUV2ZW50ID0gZnVuY3Rpb24gKGVsZW1lbnQsIGdyb3VwKSB7XG4gICAgICAgICAgICBlbGVtZW50Lm9uY2hhbmdlID0gKCkgPT4gX2hhbmRsZUVsZW1lbnRDaGFuZ2UoZ3JvdXAsIGVsZW1lbnQpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9hdHRhY2hDaGFuZ2VFdmVudCA9IGZ1bmN0aW9uIChncm91cCkge1xuICAgICAgICAgICAgZ3JvdXAuZWxlbWVudHMuZm9yRWFjaCgoZWxlbWVudCkgPT4gX2Fzc2lnbk9uQ2hhbmdlRXZlbnQoZWxlbWVudCwgZ3JvdXApKTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfaGFuZGxlRWxlbWVudENoYW5nZSA9IGZ1bmN0aW9uIChncm91cCwgZWxlbWVudCkge1xuICAgICAgICAgICAgd2luZG93LnZhcmlhbnRSZWFkeSA9IGZhbHNlO1xuICAgICAgICAgICAgX2F0dHJpYnV0ZUNvbnRhaW5lci5kaXNwYXRjaEV2ZW50KF9jcmVhdGVFdmVudCgnY2hhbmdlJywgeyBlbGVtZW50IH0pKTtcblxuICAgICAgICAgICAgaWYgKGVsZW1lbnQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICBfc2VsZWN0R3JvdXBFbGVtZW50KGdyb3VwLCBlbGVtZW50KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgX2Rlc2VsZWN0R3JvdXBFbGVtZW50KGdyb3VwKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgd2luZG93LnZhcmlhbnRSZWFkeSA9IHRydWU7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgX3NlbGVjdEdyb3VwRWxlbWVudCA9IGZ1bmN0aW9uIChncm91cCwgZWxlbWVudCkge1xuICAgICAgICAgICAgZ3JvdXAuc2VsZWN0ZWQgPSBwYXJzZUludChlbGVtZW50LnZhbHVlKTtcbiAgICAgICAgICAgIF9hdHRyaWJ1dGVDb250YWluZXIuZGlzcGF0Y2hFdmVudChfY3JlYXRlRXZlbnQoJ3NlbGVjdCcsIHsgZWxlbWVudCB9KSk7XG5cbiAgICAgICAgICAgIGlmIChncm91cC5uZXh0R3JvdXApIHtcbiAgICAgICAgICAgICAgICBfY2xlYXJHcm91cHMoZ3JvdXAubmV4dEdyb3VwKTtcbiAgICAgICAgICAgICAgICBfY29uZmlndXJlR3JvdXAoZ3JvdXAubmV4dEdyb3VwKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgX2F0dHJpYnV0ZUNvbnRhaW5lci5kaXNwYXRjaEV2ZW50KF9jcmVhdGVFdmVudCgncmVkaXJlY3QnLCB7IGVsZW1lbnQgfSkpO1xuICAgICAgICAgICAgICAgIF9yZWRpcmVjdFRvVmFyaWFudCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9kZXNlbGVjdEdyb3VwRWxlbWVudCA9IGZ1bmN0aW9uIChncm91cCkge1xuICAgICAgICAgICAgZGVsZXRlIGdyb3VwLnNlbGVjdGVkO1xuICAgICAgICAgICAgaWYgKGdyb3VwLm5leHRHcm91cCkgX2NsZWFyR3JvdXBzKGdyb3VwLm5leHRHcm91cCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgX3JlZGlyZWN0VG9WYXJpYW50ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRBdHRyaWJ1dGVzID0gX2dldFNlbGVjdGVkQXR0cmlidXRlcygpO1xuICAgICAgICAgICAgY29uc3QgbWF0Y2hpbmdQcm9kdWN0ID0gX2ZpbmRNYXRjaGluZ1Byb2R1Y3Qoc2VsZWN0ZWRBdHRyaWJ1dGVzKTtcblxuICAgICAgICAgICAgaWYgKG1hdGNoaW5nUHJvZHVjdD8udXJsKSB7XG4gICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBtYXRjaGluZ1Byb2R1Y3QudXJsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9nZXRTZWxlY3RlZEF0dHJpYnV0ZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgICAgICAgICAgICAgIF9hdHRyaWJ1dGVHcm91cHMuZmlsdGVyKChnKSA9PiBnLnNlbGVjdGVkKS5tYXAoKGcpID0+IFtnLmdyb3VwLmlkLCBnLnNlbGVjdGVkXSlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgX2ZpbmRNYXRjaGluZ1Byb2R1Y3QgPSBmdW5jdGlvbiAoc2VsZWN0ZWRBdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LnZhbHVlcyhfY29uZmlnLmluZGV4KS5maW5kKChwKSA9PlxuICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHAuYXR0cmlidXRlcykgPT09IEpTT04uc3RyaW5naWZ5KHNlbGVjdGVkQXR0cmlidXRlcylcbiAgICAgICAgICAgICk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgX2NyZWF0ZUV2ZW50ID0gZnVuY3Rpb24gKG5hbWUsIGRhdGEgPSB7fSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBDdXN0b21FdmVudCgndmFyaWFudF9zZWxlY3Rvci4nICsgbmFtZSwge1xuICAgICAgICAgICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgICAgICAgICAgY2FuY2VsYWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgZGV0YWlsOiBkYXRhLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgX2NsZWFyR3JvdXBFbGVtZW50cyA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICBlbGVtZW50LmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGVsZW1lbnQuY2hlY2tlZCA9IGZhbHNlO1xuXG4gICAgICAgICAgICBpZiAoZWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdzZWxlY3QnKSBfY2xlYXJTZWxlY3RPcHRpb25zKGVsZW1lbnQpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9jbGVhclNlbGVjdE9wdGlvbnMgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgY29uc3Qgb3B0aW9ucyA9IGVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnb3B0aW9uOm5vdChbdmFsdWU9XCJcIl0pJyk7XG4gICAgICAgICAgICBvcHRpb25zLmZvckVhY2goKG9wdGlvbikgPT4gZWxlbWVudC5yZW1vdmVDaGlsZChvcHRpb24pKTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfY2xlYXJHcm91cCA9IGZ1bmN0aW9uIChncm91cCkge1xuICAgICAgICAgICAgZGVsZXRlIGdyb3VwLnNlbGVjdGVkO1xuICAgICAgICAgICAgZ3JvdXAuZWxlbWVudHMuZm9yRWFjaChfY2xlYXJHcm91cEVsZW1lbnRzKTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfY2xlYXJHcm91cHMgPSBmdW5jdGlvbiAoZ3JvdXApIHtcbiAgICAgICAgICAgIHdoaWxlIChncm91cCkge1xuICAgICAgICAgICAgICAgIF9jbGVhckdyb3VwKGdyb3VwKTtcbiAgICAgICAgICAgICAgICBncm91cCA9IGdyb3VwLm5leHRHcm91cDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfaXNQcm9kdWN0TWF0Y2hpbmdGaWx0ZXJzID0gZnVuY3Rpb24gKHByb2R1Y3QsIGZpbHRlckF0dHJpYnV0ZXMpIHtcbiAgICAgICAgICAgIHJldHVybiBmaWx0ZXJBdHRyaWJ1dGVzLmV2ZXJ5KChmaWx0ZXIpID0+IF9jb25maWcuaW5kZXhbcHJvZHVjdC5pZF0uYXR0cmlidXRlcz8uW2ZpbHRlci5ncm91cF0gPT09IGZpbHRlci5zZWxlY3RlZCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgX2lzQXR0cmlidXRlUmVsZXZhbnQgPSBmdW5jdGlvbiAoYXR0cmlidXRlLCBmaWx0ZXJBdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICByZXR1cm4gYXR0cmlidXRlLnByb2R1Y3RzLnNvbWUoKHByb2R1Y3QpID0+IF9pc1Byb2R1Y3RNYXRjaGluZ0ZpbHRlcnMocHJvZHVjdCwgZmlsdGVyQXR0cmlidXRlcykpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9maWx0ZXJBdHRyaWJ1dGVzID0gZnVuY3Rpb24gKGF0dHJpYnV0ZXMsIGdyb3VwKSB7XG4gICAgICAgICAgICBjb25zdCBmaWx0ZXJBdHRyaWJ1dGVzID0gX2dldEZpbHRlckF0dHJpYnV0ZXMoZ3JvdXApO1xuICAgICAgICAgICAgcmV0dXJuIGF0dHJpYnV0ZXMuZmlsdGVyKChhdHRyaWJ1dGUpID0+IF9pc0F0dHJpYnV0ZVJlbGV2YW50KGF0dHJpYnV0ZSwgZmlsdGVyQXR0cmlidXRlcykpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9nZXRGaWx0ZXJBdHRyaWJ1dGVzID0gZnVuY3Rpb24gKGdyb3VwKSB7XG4gICAgICAgICAgICBjb25zdCBmaWx0ZXJBdHRyaWJ1dGVzID0gW107XG4gICAgICAgICAgICBsZXQgY3VycmVudEdyb3VwID0gZ3JvdXAucHJldkdyb3VwO1xuXG4gICAgICAgICAgICB3aGlsZSAoY3VycmVudEdyb3VwKSB7XG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRHcm91cC5zZWxlY3RlZCAmJiBjdXJyZW50R3JvdXAubmV4dEdyb3VwKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbHRlckF0dHJpYnV0ZXMucHVzaCh7IGdyb3VwOiBjdXJyZW50R3JvdXAuZ3JvdXAuaWQsIHNlbGVjdGVkOiBjdXJyZW50R3JvdXAuc2VsZWN0ZWQgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGN1cnJlbnRHcm91cCA9IGN1cnJlbnRHcm91cC5wcmV2R3JvdXA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBmaWx0ZXJBdHRyaWJ1dGVzO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9hZGRPcHRpb25Ub1NlbGVjdCA9IGZ1bmN0aW9uIChlbGVtZW50LCBhdHRyaWJ1dGUsIGdyb3VwKSB7XG4gICAgICAgICAgICBjb25zdCBvcHRpb24gPSBuZXcgT3B0aW9uKGF0dHJpYnV0ZS5hdHRyaWJ1dGUubmFtZSwgYXR0cmlidXRlLmF0dHJpYnV0ZS5pZCk7XG4gICAgICAgICAgICBvcHRpb24uaWQgPSAnYXR0cmlidXRlLScgKyBhdHRyaWJ1dGUuYXR0cmlidXRlLmlkO1xuICAgICAgICAgICAgaWYgKGdyb3VwLnNlbGVjdGVkID09PSBhdHRyaWJ1dGUuYXR0cmlidXRlLmlkKSBvcHRpb24uc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgZWxlbWVudC5hZGQob3B0aW9uKTtcbiAgICAgICAgICAgIGVsZW1lbnQuZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfZW5hYmxlRWxlbWVudEZvckF0dHJpYnV0ZSA9IGZ1bmN0aW9uIChlbGVtZW50LCBhdHRyaWJ1dGUsIGdyb3VwKSB7XG4gICAgICAgICAgICBpZiAocGFyc2VJbnQoZWxlbWVudC5kYXRhc2V0Lmdyb3VwKSA9PT0gZ3JvdXAuZ3JvdXAuaWQgJiYgcGFyc2VJbnQoZWxlbWVudC52YWx1ZSkgPT09IGF0dHJpYnV0ZS5hdHRyaWJ1dGUuaWQpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LmRpc2FibGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKGdyb3VwLnNlbGVjdGVkID09PSBhdHRyaWJ1dGUuYXR0cmlidXRlLmlkKSBlbGVtZW50LmNoZWNrZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9jb25maWd1cmVHcm91cEVsZW1lbnRzID0gZnVuY3Rpb24gKGdyb3VwLCBhdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICBncm91cC5lbGVtZW50cy5mb3JFYWNoKChlbGVtZW50KSA9PlxuICAgICAgICAgICAgICAgIF9jb25maWd1cmVFbGVtZW50KGVsZW1lbnQsIGF0dHJpYnV0ZXMsIGdyb3VwKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfY29uZmlndXJlRWxlbWVudCA9IGZ1bmN0aW9uIChlbGVtZW50LCBhdHRyaWJ1dGVzLCBncm91cCkge1xuICAgICAgICAgICAgaWYgKGVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnc2VsZWN0Jykge1xuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMuZm9yRWFjaCgoYXR0cmlidXRlKSA9PiBfYWRkT3B0aW9uVG9TZWxlY3QoZWxlbWVudCwgYXR0cmlidXRlLCBncm91cCkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLmZvckVhY2goKGF0dHJpYnV0ZSkgPT4gX2VuYWJsZUVsZW1lbnRGb3JBdHRyaWJ1dGUoZWxlbWVudCwgYXR0cmlidXRlLCBncm91cCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9jb25maWd1cmVHcm91cCA9IGZ1bmN0aW9uIChncm91cCkge1xuICAgICAgICAgICAgY29uc3QgZmlsdGVyZWRBdHRyaWJ1dGVzID0gX2ZpbHRlckF0dHJpYnV0ZXMoZ3JvdXAuYXR0cmlidXRlcy5zbGljZSgpLCBncm91cCkgfHwgZ3JvdXAuYXR0cmlidXRlcztcbiAgICAgICAgICAgIF9jb25maWd1cmVHcm91cEVsZW1lbnRzKGdyb3VwLCBmaWx0ZXJlZEF0dHJpYnV0ZXMpO1xuICAgICAgICB9O1xuXG4gICAgICAgIF9pbml0KCk7XG4gICAgfTtcblxuICAgIHdpbmRvdy5jb3Jlc2hvcFZhcmlhbnRTZWxlY3RvciA9IGNvcmVzaG9wVmFyaWFudFNlbGVjdG9yO1xufSkoKTtcbiIsIihmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgY29uc3QgbWV0aG9kcyA9IHtcbiAgICAgICAgaW5pdDogZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGNvbnN0IHNldHRpbmdzID0ge1xuICAgICAgICAgICAgICAgIHByb3RvdHlwZVByZWZpeDogZmFsc2UsXG4gICAgICAgICAgICAgICAgY29udGFpbmVyU2VsZWN0b3I6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHNlbGVjdG9yQXR0cjogZmFsc2UsXG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucyAvLyBVc2luZyBvYmplY3Qgc3ByZWFkIGhlcmVcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0aGlzLnNlbGVjdG9yKTtcbiAgICAgICAgICAgIGVsZW1lbnRzLmZvckVhY2goZWxlbWVudCA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93KGVsZW1lbnQsIHNldHRpbmdzLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hvdyhlbGVtZW50LCBzZXR0aW5ncywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBzaG93OiBmdW5jdGlvbiAoZWxlbWVudCwgc2V0dGluZ3MsIHJlcGxhY2UpIHtcbiAgICAgICAgICAgIGxldCBzZWxlY3RlZFZhbHVlID0gZWxlbWVudC52YWx1ZTtcbiAgICAgICAgICAgIGxldCBwcm90b3R5cGVQcmVmaXggPSBlbGVtZW50LmlkO1xuXG4gICAgICAgICAgICBpZiAoc2V0dGluZ3Muc2VsZWN0b3JBdHRyKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRPcHRpb24gPSBBcnJheS5mcm9tKGVsZW1lbnQub3B0aW9ucykuZmluZChvcHRpb24gPT4gb3B0aW9uLnZhbHVlID09PSBzZWxlY3RlZFZhbHVlKTtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWRPcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRWYWx1ZSA9IHNlbGVjdGVkT3B0aW9uLmdldEF0dHJpYnV0ZShzZXR0aW5ncy5zZWxlY3RvckF0dHIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHNldHRpbmdzLnByb3RvdHlwZVByZWZpeCkge1xuICAgICAgICAgICAgICAgIHByb3RvdHlwZVByZWZpeCA9IHNldHRpbmdzLnByb3RvdHlwZVByZWZpeDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgcHJvdG90eXBlRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGAke3Byb3RvdHlwZVByZWZpeH1fJHtzZWxlY3RlZFZhbHVlfWApO1xuICAgICAgICAgICAgbGV0IGNvbnRhaW5lciA9IHRoaXMuZ2V0Q29udGFpbmVyKHNldHRpbmdzLCBwcm90b3R5cGVFbGVtZW50KTtcblxuICAgICAgICAgICAgaWYgKCFjb250YWluZXIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghcHJvdG90eXBlRWxlbWVudCkge1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChyZXBsYWNlIHx8ICFjb250YWluZXIuaW5uZXJIVE1MLnRyaW0oKSkge1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSBwcm90b3R5cGVFbGVtZW50LmRhdGFzZXQucHJvdG90eXBlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGdldENvbnRhaW5lcjogZnVuY3Rpb24gKHNldHRpbmdzLCBwcm90b3R5cGVFbGVtZW50KSB7XG4gICAgICAgICAgICBpZiAoc2V0dGluZ3MuY29udGFpbmVyU2VsZWN0b3IpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZXR0aW5ncy5jb250YWluZXJTZWxlY3Rvcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRhdGFDb250YWluZXJJZCA9IHByb3RvdHlwZUVsZW1lbnQgPyBwcm90b3R5cGVFbGVtZW50LmRhdGFzZXQuY29udGFpbmVyIDogbnVsbDtcbiAgICAgICAgICAgICAgICByZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoZGF0YUNvbnRhaW5lcklkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBFeHRlbmRpbmcgdGhlIHByb3RvdHlwZSBvZiBOb2RlTGlzdFxuICAgIE5vZGVMaXN0LnByb3RvdHlwZS5oYW5kbGVQcm90b3R5cGVzID0gZnVuY3Rpb24gKG1ldGhvZCkge1xuICAgICAgICBpZiAobWV0aG9kc1ttZXRob2RdKSB7XG4gICAgICAgICAgICByZXR1cm4gbWV0aG9kc1ttZXRob2RdLmFwcGx5KHRoaXMsIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBtZXRob2QgPT09ICdvYmplY3QnIHx8ICFtZXRob2QpIHtcbiAgICAgICAgICAgIHJldHVybiBtZXRob2RzLmluaXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTWV0aG9kICcgKyBtZXRob2QgKyAnIGRvZXMgbm90IGV4aXN0IG9uIGhhbmRsZVByb3RvdHlwZXMnKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBUbyBhbGxvdyBjYWxsaW5nIGhhbmRsZVByb3RvdHlwZXMgZGlyZWN0bHkgb24gYW55IGVsZW1lbnRcbiAgICBIVE1MRWxlbWVudC5wcm90b3R5cGUuaGFuZGxlUHJvdG90eXBlcyA9IGZ1bmN0aW9uIChtZXRob2QpIHtcbiAgICAgICAgcmV0dXJuIG1ldGhvZHMuaGFuZGxlUHJvdG90eXBlcy5jYWxsKFt0aGlzXSwgbWV0aG9kKTtcbiAgICB9O1xuXG59KCkpO1xuIiwiZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uICgpIHtcbiAgICBjb25zdCBtYXBCbG9jayA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYXAtYmxvY2snKTtcblxuICAgIGlmIChtYXBCbG9jaykge1xuICAgICAgICBtYXBCbG9jay5zdHlsZS5oZWlnaHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFwLXdyYXBwZXInKS5jbGllbnRIZWlnaHQgKyAncHgnO1xuXG4gICAgICAgIGZ1bmN0aW9uIGluaXRpYWxpemUoKSB7XG4gICAgICAgICAgICBjb25zdCBtYXBPcHRpb25zID0ge1xuICAgICAgICAgICAgICAgIHpvb206IDE4LFxuICAgICAgICAgICAgICAgIGNlbnRlcjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZyg0OC4xNTkyNTEzLCAxNC4wMjMwMjUxMDAwMDAwNCksXG4gICAgICAgICAgICAgICAgZGlzYWJsZURlZmF1bHRVSTogdHJ1ZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnN0IG1hcE5ldyA9IG5ldyBnb29nbGUubWFwcy5NYXAobWFwQmxvY2ssIG1hcE9wdGlvbnMpO1xuICAgICAgICAgICAgY29uc29sZS5sb2cobWFwTmV3KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgaW5pdGlhbGl6ZSk7XG4gICAgfVxufSk7XG4iLCJjb25zdCBzaG9wID0gd2luZG93LnNob3AgfHwge307XG5cbihmdW5jdGlvbiAoc2hvcCkge1xuICAgIHNob3AuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2hvcC5pbml0Q2hhbmdlQWRkcmVzcygpO1xuICAgICAgICBzaG9wLmluaXRDYXJ0U2hpcG1lbnRDYWxjdWxhdG9yKCk7XG4gICAgICAgIHNob3AuaW5pdFF1YW50aXR5VmFsaWRhdG9yKCk7XG4gICAgICAgIHNob3AuaW5pdENhdGVnb3J5U2VsZWN0KCk7XG5cbiAgICAgICAgaGFuZGxlUHJvdG90eXBlcyh7XG4gICAgICAgICAgICAncHJvdG90eXBlUHJlZml4JzogJ3BheW1lbnRQcm92aWRlcicsXG4gICAgICAgICAgICAnY29udGFpbmVyU2VsZWN0b3InOiAnLnBheW1lbnRTZXR0aW5ncycsXG4gICAgICAgICAgICAnc2VsZWN0b3JBdHRyJzogJ2RhdGEtZmFjdG9yeSdcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc2V0dXBDb3B5VG9DbGlwYm9hcmQoKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gaGFuZGxlUHJvdG90eXBlcyhvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IHNldHRpbmdzID0ge1xuICAgICAgICAgICAgcHJvdG90eXBlUHJlZml4OiBvcHRpb25zLnByb3RvdHlwZVByZWZpeCB8fCBmYWxzZSxcbiAgICAgICAgICAgIGNvbnRhaW5lclNlbGVjdG9yOiBvcHRpb25zLmNvbnRhaW5lclNlbGVjdG9yIHx8IGZhbHNlLFxuICAgICAgICAgICAgc2VsZWN0b3JBdHRyOiBvcHRpb25zLnNlbGVjdG9yQXR0ciB8fCBmYWxzZVxuICAgICAgICB9O1xuXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoYFtkYXRhLSR7c2V0dGluZ3MucHJvdG90eXBlUHJlZml4fV1gKS5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgICAgICBzaG93RWxlbWVudChlbGVtZW50LCBmYWxzZSk7XG4gICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBzaG93RWxlbWVudChlbGVtZW50LCB0cnVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBmdW5jdGlvbiBzaG93RWxlbWVudChlbGVtZW50LCByZXBsYWNlKSB7XG4gICAgICAgICAgICBjb25zdCBzZWxlY3RlZFZhbHVlID0gZ2V0U2VsZWN0ZWRWYWx1ZShlbGVtZW50KTtcbiAgICAgICAgICAgIGNvbnN0IHByb3RvdHlwZVByZWZpeCA9IHNldHRpbmdzLnByb3RvdHlwZVByZWZpeCB8fCBlbGVtZW50LmlkO1xuICAgICAgICAgICAgY29uc3QgcHJvdG90eXBlRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGAke3Byb3RvdHlwZVByZWZpeH1fJHtzZWxlY3RlZFZhbHVlfWApO1xuICAgICAgICAgICAgY29uc3QgY29udGFpbmVyID0gZ2V0Q29udGFpbmVyKHByb3RvdHlwZUVsZW1lbnQpO1xuXG4gICAgICAgICAgICBpZiAoY29udGFpbmVyICYmIChyZXBsYWNlIHx8ICFjb250YWluZXIuaW5uZXJIVE1MLnRyaW0oKSkpIHtcbiAgICAgICAgICAgICAgICBjb250YWluZXIuaW5uZXJIVE1MID0gcHJvdG90eXBlRWxlbWVudCA/IHByb3RvdHlwZUVsZW1lbnQuZGF0YXNldC5wcm90b3R5cGUgOiAnJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGdldFNlbGVjdGVkVmFsdWUoZWxlbWVudCkge1xuICAgICAgICAgICAgaWYgKHNldHRpbmdzLnNlbGVjdG9yQXR0cikge1xuICAgICAgICAgICAgICAgIHJldHVybiBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoYFt2YWx1ZT1cIiR7ZWxlbWVudC52YWx1ZX1cIl1gKS5nZXRBdHRyaWJ1dGUoc2V0dGluZ3Muc2VsZWN0b3JBdHRyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50LnZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZ2V0Q29udGFpbmVyKHByb3RvdHlwZUVsZW1lbnQpIHtcbiAgICAgICAgICAgIGlmIChzZXR0aW5ncy5jb250YWluZXJTZWxlY3Rvcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNldHRpbmdzLmNvbnRhaW5lclNlbGVjdG9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm90b3R5cGVFbGVtZW50ID8gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihwcm90b3R5cGVFbGVtZW50LmRhdGFzZXQuY29udGFpbmVyKSA6IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZXR1cENvcHlUb0NsaXBib2FyZCgpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmNvcHktdG8tY2xpcGJvYXJkJykuZm9yRWFjaChmdW5jdGlvbiAoYnV0dG9uKSB7XG4gICAgICAgICAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBjb3B5VGV4dFRvQ2xpcGJvYXJkKHRoaXMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNvcHlUZXh0VG9DbGlwYm9hcmQoYnV0dG9uKSB7XG4gICAgICAgIGNvbnN0IHRhcmdldElkID0gYnV0dG9uLmRhdGFzZXQudGFyZ2V0O1xuICAgICAgICBjb25zdCBjb3B5VGV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRhcmdldElkKTtcblxuICAgICAgICBpZiAoY29weVRleHQpIHtcbiAgICAgICAgICAgIGNvcHlUZXh0LnNlbGVjdCgpO1xuICAgICAgICAgICAgY29weVRleHQuc2V0U2VsZWN0aW9uUmFuZ2UoMCwgOTk5OTkpOyAvLyBGb3IgbW9iaWxlIGRldmljZXNcblxuICAgICAgICAgICAgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQoY29weVRleHQudmFsdWUpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGJ1dHRvbi5kYXRhc2V0LmNvcGllZFRleHQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzaG9wLmluaXRDYXRlZ29yeVNlbGVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5zaXRlLXJlbG9hZFwiKS5mb3JFYWNoKGZ1bmN0aW9uIChzZWxlY3QpIHtcbiAgICAgICAgICAgIHNlbGVjdC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBsb2NhdGlvbi5ocmVmID0gdXBkYXRlUXVlcnlTdHJpbmdQYXJhbWV0ZXIod2luZG93LmxvY2F0aW9uLmhyZWYsIHRoaXMubmFtZSwgdGhpcy52YWx1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIHVwZGF0ZVF1ZXJ5U3RyaW5nUGFyYW1ldGVyKHVyaSwga2V5LCB2YWx1ZSkge1xuICAgICAgICBjb25zdCByZSA9IG5ldyBSZWdFeHAoXCIoWz8mXSlcIiArIGtleSArIFwiPS4qPygmfCQpXCIsIFwiaVwiKTtcbiAgICAgICAgY29uc3Qgc2VwYXJhdG9yID0gdXJpLmluZGV4T2YoJz8nKSAhPT0gLTEgPyBcIiZcIiA6IFwiP1wiO1xuICAgICAgICByZXR1cm4gdXJpLm1hdGNoKHJlKSA/IHVyaS5yZXBsYWNlKHJlLCAnJDEnICsga2V5ICsgXCI9XCIgKyB2YWx1ZSArICckMicpIDogdXJpICsgc2VwYXJhdG9yICsga2V5ICsgXCI9XCIgKyB2YWx1ZTtcbiAgICB9XG5cbiAgICBzaG9wLmluaXRRdWFudGl0eVZhbGlkYXRvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29yZXNob3BRdWFudGl0eVNlbGVjdG9yKHtcbiAgICAgICAgICAgIGJ1dHRvbmRvd25fY2xhc3M6ICdidG4gYnRuLXNlY29uZGFyeScsXG4gICAgICAgICAgICBidXR0b251cF9jbGFzczogJ2J0biBidG4tc2Vjb25kYXJ5JyxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHNob3AuaW5pdENhcnRTaGlwbWVudENhbGN1bGF0b3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgY29uc3QgZm9ybSA9IGV2LnRhcmdldC5jbG9zZXN0KCdmb3JtW25hbWU9XCJjb3Jlc2hvcF9zaGlwcGluZ19jYWxjdWxhdG9yXCJdJyk7XG4gICAgICAgICAgICBpZiAoZm9ybSkge1xuICAgICAgICAgICAgICAgIGhhbmRsZVNoaXBtZW50Q2FsY3VsYXRpb24oZm9ybSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVTaGlwbWVudENhbGN1bGF0aW9uKGZvcm0pIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZm9ybS5jbGFzc0xpc3QuYWRkKCdsb2FkaW5nJyk7XG4gICAgICAgIGZvcm0ucXVlcnlTZWxlY3RvcignYnV0dG9uW3R5cGU9XCJzdWJtaXRcIl0nKS5zZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJywgJ2Rpc2FibGVkJyk7XG4gICAgICAgIGZvcm0uY2xvc2VzdCgnLmNhcnQtc2hpcG1lbnQtY2FsY3VsYXRpb24tYm94JykucXVlcnlTZWxlY3RvcignLmNhcnQtc2hpcG1lbnQtYXZhaWxhYmxlLWNhcnJpZXJzJykuc3R5bGUub3BhY2l0eSA9IDAuMjtcblxuICAgICAgICBmZXRjaChmb3JtLmFjdGlvbiwge1xuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICBib2R5OiBuZXcgVVJMU2VhcmNoUGFyYW1zKG5ldyBGb3JtRGF0YShmb3JtKSlcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4gcmVzcG9uc2UudGV4dCgpKVxuICAgICAgICAudGhlbihyZXMgPT4gdXBkYXRlU2hpcG1lbnRDYWxjdWxhdGlvbihmb3JtLCByZXMpKVxuICAgICAgICAuY2F0Y2goZXJyb3IgPT4gaGFuZGxlU2hpcG1lbnRFcnJvcihmb3JtLCBlcnJvcikpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwZGF0ZVNoaXBtZW50Q2FsY3VsYXRpb24oZm9ybSwgcmVzcG9uc2VUZXh0KSB7XG4gICAgICAgIGZvcm0uY2xhc3NMaXN0LnJlbW92ZSgnbG9hZGluZycpO1xuICAgICAgICBmb3JtLmNsb3Nlc3QoJy5jYXJ0LXNoaXBtZW50LWNhbGN1bGF0aW9uLWJveCcpLm91dGVySFRNTCA9IHJlc3BvbnNlVGV4dDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVTaGlwbWVudEVycm9yKGZvcm0sIGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yOicsIGVycm9yKTtcbiAgICAgICAgZm9ybS5jbGFzc0xpc3QucmVtb3ZlKCdsb2FkaW5nJyk7XG4gICAgICAgIGZvcm0ucXVlcnlTZWxlY3RvcignYnV0dG9uW3R5cGU9XCJzdWJtaXRcIl0nKS5yZW1vdmVBdHRyaWJ1dGUoJ2Rpc2FibGVkJyk7XG4gICAgfVxuXG4gICAgc2hvcC5pbml0Q2hhbmdlQWRkcmVzcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29uc3QgYWRkcmVzc1N0ZXAgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY2hlY2tvdXQtc3RlcC5zdGVwLWFkZHJlc3MnKTtcbiAgICAgICAgaWYgKCFhZGRyZXNzU3RlcCkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IGludm9pY2VBZGRyZXNzID0gYWRkcmVzc1N0ZXAucXVlcnlTZWxlY3Rvcignc2VsZWN0W25hbWU9XCJjb3Jlc2hvcFtpbnZvaWNlQWRkcmVzc11cIl0nKTtcbiAgICAgICAgY29uc3Qgc2hpcHBpbmdBZGRyZXNzID0gYWRkcmVzc1N0ZXAucXVlcnlTZWxlY3Rvcignc2VsZWN0W25hbWU9XCJjb3Jlc2hvcFtzaGlwcGluZ0FkZHJlc3NdXCJdJyk7XG4gICAgICAgIGNvbnN0IHVzZUlhc1MgPSBhZGRyZXNzU3RlcC5xdWVyeVNlbGVjdG9yKCdbbmFtZT1cImNvcmVzaG9wW3VzZUludm9pY2VBc1NoaXBwaW5nXVwiXScpO1xuXG4gICAgICAgIHNldHVwQWRkcmVzc0NoYW5nZUV2ZW50cyhpbnZvaWNlQWRkcmVzcywgc2hpcHBpbmdBZGRyZXNzLCB1c2VJYXNTKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gc2V0dXBBZGRyZXNzQ2hhbmdlRXZlbnRzKGludm9pY2VBZGRyZXNzLCBzaGlwcGluZ0FkZHJlc3MsIHVzZUlhc1MpIHtcbiAgICAgICAgaW52b2ljZUFkZHJlc3MuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4gdXBkYXRlQWRkcmVzcyhpbnZvaWNlQWRkcmVzcywgdXNlSWFzUykpO1xuICAgICAgICBzaGlwcGluZ0FkZHJlc3MuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4gdXBkYXRlU2hpcHBpbmdBZGRyZXNzKHNoaXBwaW5nQWRkcmVzcykpO1xuICAgICAgICBpZiAodXNlSWFzUykgdXNlSWFzUy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB0b2dnbGVTaGlwcGluZ0FkZHJlc3ModXNlSWFzUywgaW52b2ljZUFkZHJlc3MsIHNoaXBwaW5nQWRkcmVzcykpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwZGF0ZUFkZHJlc3MoaW52b2ljZUFkZHJlc3MsIHVzZUlhc1MpIHtcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWQgPSBpbnZvaWNlQWRkcmVzcy5vcHRpb25zW2ludm9pY2VBZGRyZXNzLnNlbGVjdGVkSW5kZXhdO1xuICAgICAgICBjb25zdCBhZGRyZXNzID0gSlNPTi5wYXJzZShzZWxlY3RlZC5kYXRhc2V0LmFkZHJlc3MpLmh0bWw7XG4gICAgICAgIGNvbnN0IGludm9pY2VQYW5lbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wYW5lbC1pbnZvaWNlLWFkZHJlc3MnKTtcbiAgICAgICAgaW52b2ljZVBhbmVsLmlubmVySFRNTCA9IGFkZHJlc3MgfHwgJyc7XG5cbiAgICAgICAgdG9nZ2xlVXNlQXNTaGlwcGluZyh1c2VJYXNTLCBzZWxlY3RlZC5kYXRhc2V0LmFkZHJlc3NUeXBlID09PSAnaW52b2ljZScpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRvZ2dsZVVzZUFzU2hpcHBpbmcodXNlSWFzUywgaXNJbnZvaWNlVHlwZSkge1xuICAgICAgICBpZiAodXNlSWFzUykge1xuICAgICAgICAgICAgdXNlSWFzUy5kaXNhYmxlZCA9IGlzSW52b2ljZVR5cGU7XG4gICAgICAgICAgICBpZiAoaXNJbnZvaWNlVHlwZSkge1xuICAgICAgICAgICAgICAgIHVzZUlhc1MuY2hlY2tlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHVzZUlhc1MuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2NoYW5nZScpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwZGF0ZVNoaXBwaW5nQWRkcmVzcyhzaGlwcGluZ0FkZHJlc3MpIHtcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWQgPSBzaGlwcGluZ0FkZHJlc3Mub3B0aW9uc1tzaGlwcGluZ0FkZHJlc3Muc2VsZWN0ZWRJbmRleF07XG4gICAgICAgIGNvbnN0IGFkZHJlc3MgPSBKU09OLnBhcnNlKHNlbGVjdGVkLmRhdGFzZXQuYWRkcmVzcykuaHRtbDtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnBhbmVsLXNoaXBwaW5nLWFkZHJlc3MnKS5pbm5lckhUTUwgPSBhZGRyZXNzIHx8ICcnO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRvZ2dsZVNoaXBwaW5nQWRkcmVzcyh1c2VJYXNTLCBpbnZvaWNlQWRkcmVzcywgc2hpcHBpbmdBZGRyZXNzKSB7XG4gICAgICAgIGNvbnN0IHNoaXBwaW5nRmllbGQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2hpcHBpbmctYWRkcmVzcy1zZWxlY3RvcicpO1xuICAgICAgICBjb25zdCBzaGlwcGluZ0FkZEFkZHJlc3NCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY2FyZC1mb290ZXInKTtcblxuICAgICAgICBpZiAodXNlSWFzUy5jaGVja2VkKSB7XG4gICAgICAgICAgICBzaGlwcGluZ0ZpZWxkLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICBzaGlwcGluZ0FkZHJlc3MudmFsdWUgPSBpbnZvaWNlQWRkcmVzcy52YWx1ZTtcbiAgICAgICAgICAgIHNoaXBwaW5nQWRkcmVzcy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnY2hhbmdlJykpO1xuICAgICAgICAgICAgaWYgKHNoaXBwaW5nQWRkQWRkcmVzc0J1dHRvbikgc2hpcHBpbmdBZGRBZGRyZXNzQnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2Qtbm9uZScpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2hpcHBpbmdGaWVsZC5zdHlsZS5kaXNwbGF5ID0gJyc7XG4gICAgICAgICAgICBpZiAoc2hpcHBpbmdBZGRBZGRyZXNzQnV0dG9uKSBzaGlwcGluZ0FkZEFkZHJlc3NCdXR0b24uY2xhc3NMaXN0LnJlbW92ZSgnZC1ub25lJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbn0oc2hvcCkpO1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24gKCkge1xuICAgIHNob3AuaW5pdCgpO1xufSk7XG4iLCIoZnVuY3Rpb24gKHZhcmlhbnQpIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24gKCkge1xuICAgICAgICB3aW5kb3cudmFyaWFudFJlYWR5ID0gZmFsc2U7XG5cbiAgICAgICAgdmFyaWFudC5pbml0KCk7XG5cbiAgICAgICAgd2luZG93LnZhcmlhbnRSZWFkeSA9IHRydWU7XG4gICAgfSk7XG5cbiAgICB2YXJpYW50LmluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNvbnN0IHZhcmlhbnRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnByb2R1Y3QtaW5mb19fYXR0cmlidXRlcycpO1xuICAgICAgICBpZiAoIXZhcmlhbnRzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb3Jlc2hvcFZhcmlhbnRTZWxlY3Rvcih2YXJpYW50cyk7IC8vIEVuc3VyZSB0aGlzIGZ1bmN0aW9uIGlzIGRlZmluZWQgaW4geW91ciBnbG9iYWwgc2NvcGVcblxuICAgICAgICB2YXJpYW50cy5hZGRFdmVudExpc3RlbmVyKCd2YXJpYW50X3NlbGVjdG9yLnNlbGVjdCcsIChlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBvcHRpb25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnByb2R1Y3QtaW5mbyAucHJvZHVjdC1kZXRhaWxzIC5vcHRpb25zJyk7XG5cbiAgICAgICAgICAgIGlmIChvcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3VibWl0cyA9IG9wdGlvbnMucXVlcnlTZWxlY3RvckFsbCgnW3R5cGU9XCJzdWJtaXRcIl0nKTtcblxuICAgICAgICAgICAgICAgIG9wdGlvbnMuY2xhc3NMaXN0LmFkZCgnZGlzYWJsZWQnKTtcblxuICAgICAgICAgICAgICAgIHN1Ym1pdHMuZm9yRWFjaCgoc3VibWl0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHN1Ym1pdC5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG59KHdpbmRvdy52YXJpYW50IHx8ICh3aW5kb3cudmFyaWFudCA9IHt9KSkpOyAvLyBFeHRyYWN0ZWQgYXNzaWdubWVudFxuIiwiLyogU1RZTEVTICAqL1xuaW1wb3J0ICcuLi9zY3NzL2FwcC5zY3NzJztcbmltcG9ydCAnc3dpcGVyL2Nzcy9idW5kbGUnO1xuLyogSlMgKi9cbmltcG9ydCAnYm9vdHN0cmFwJztcbmltcG9ydCAnLi9zY3JpcHRzL2hhbmRsZS1wcm90b3R5cGVzLmpzJztcbmltcG9ydCAnLi9wbHVnaW4vY29yZXNob3AucGx1Z2luLnF1YW50aXR5LmpzJztcbmltcG9ydCAnLi9wbHVnaW4vY29yZXNob3AucGx1Z2luLnZhcmlhbnQuanMnO1xuaW1wb3J0ICcuL3NjcmlwdHMvc2hvcC5qcyc7XG5pbXBvcnQgJy4vc2NyaXB0cy92YXJpYW50LmpzJztcbmltcG9ydCAnLi9zY3JpcHRzL21hcC5qcyc7XG5pbXBvcnQgeyBDYXJvdXNlbCB9IGZyb20gJy4vc2NyaXB0cy9jYXJvdXNlbCc7XG5pbXBvcnQgeyBDYXJ0SW5mbyB9IGZyb20gJy4vc2NyaXB0cy9jYXJ0SW5mbyc7XG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24gKCkge1xuICAgIHZhciBDYXJ0V2lkZ2V0ID0gbmV3IENhcnRJbmZvKCcvY29yZXNob3BfZ2V0X2NhcnRfaXRlbXMnLCAnLmpzLWNhcnQtd2lkZ2V0Jyk7XG4gICAgdmFyIENhcm91c2VsUHJvZHVjdHMgPSBuZXcgQ2Fyb3VzZWwoKTtcbiAgICBjb25zb2xlLmxvZyhDYXJ0V2lkZ2V0KTtcbiAgICBjb25zb2xlLmxvZyhDYXJvdXNlbFByb2R1Y3RzKTtcbn0pO1xuIiwiaW1wb3J0IFN3aXBlciBmcm9tICdzd2lwZXInO1xuaW1wb3J0IHsgVGh1bWJzIH0gZnJvbSBcInN3aXBlci9tb2R1bGVzXCI7XG52YXIgQ2Fyb3VzZWwgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQ2Fyb3VzZWwoKSB7XG4gICAgICAgIHRoaXMuX2luaXRDYXJvdXNlbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8qIEluaXQgc3dpcGVyIHdpdGggdGh1bWJzICovXG4gICAgICAgICAgICB2YXIgc2xpZGVyVGh1bWJuYWlsID0gbmV3IFN3aXBlcignLmpzLXNsaWRlci10aHVtYm5haWwnLCB7XG4gICAgICAgICAgICAgICAgc2xpZGVzUGVyVmlldzogMyxcbiAgICAgICAgICAgICAgICBmcmVlTW9kZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBzcGFjZUJldHdlZW46ICc4cHgnLFxuICAgICAgICAgICAgICAgIHdhdGNoU2xpZGVzUHJvZ3Jlc3M6IHRydWUsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciBtYWluU2xpZGVyID0gbmV3IFN3aXBlcignLmpzLXNsaWRlcicsIHtcbiAgICAgICAgICAgICAgICBtb2R1bGVzOiBbVGh1bWJzXSwgLy8gSW5jbHVkZSB0aGUgVGh1bWJzIG1vZHVsZVxuICAgICAgICAgICAgICAgIG5hdmlnYXRpb246IHtcbiAgICAgICAgICAgICAgICAgICAgbmV4dEVsOiAnLnN3aXBlci1idXR0b24tbmV4dCcsXG4gICAgICAgICAgICAgICAgICAgIHByZXZFbDogJy5zd2lwZXItYnV0dG9uLXByZXYnLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgdGh1bWJzOiB7XG4gICAgICAgICAgICAgICAgICAgIHN3aXBlcjogc2xpZGVyVGh1bWJuYWlsIC8vIExpbmsgdGh1bWJuYWlsIHN3aXBlclxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc29sZS5sb2cobWFpblNsaWRlcik7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuX2luaXRDYXJvdXNlbCgpO1xuICAgIH1cbiAgICByZXR1cm4gQ2Fyb3VzZWw7XG59KCkpO1xuZXhwb3J0IHsgQ2Fyb3VzZWwgfTtcbiIsInZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xudmFyIF9fZ2VuZXJhdG9yID0gKHRoaXMgJiYgdGhpcy5fX2dlbmVyYXRvcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIGJvZHkpIHtcbiAgICB2YXIgXyA9IHsgbGFiZWw6IDAsIHNlbnQ6IGZ1bmN0aW9uKCkgeyBpZiAodFswXSAmIDEpIHRocm93IHRbMV07IHJldHVybiB0WzFdOyB9LCB0cnlzOiBbXSwgb3BzOiBbXSB9LCBmLCB5LCB0LCBnID0gT2JqZWN0LmNyZWF0ZSgodHlwZW9mIEl0ZXJhdG9yID09PSBcImZ1bmN0aW9uXCIgPyBJdGVyYXRvciA6IE9iamVjdCkucHJvdG90eXBlKTtcbiAgICByZXR1cm4gZy5uZXh0ID0gdmVyYigwKSwgZ1tcInRocm93XCJdID0gdmVyYigxKSwgZ1tcInJldHVyblwiXSA9IHZlcmIoMiksIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiAoZ1tTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzOyB9KSwgZztcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgcmV0dXJuIGZ1bmN0aW9uICh2KSB7IHJldHVybiBzdGVwKFtuLCB2XSk7IH07IH1cbiAgICBmdW5jdGlvbiBzdGVwKG9wKSB7XG4gICAgICAgIGlmIChmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgZXhlY3V0aW5nLlwiKTtcbiAgICAgICAgd2hpbGUgKGcgJiYgKGcgPSAwLCBvcFswXSAmJiAoXyA9IDApKSwgXykgdHJ5IHtcbiAgICAgICAgICAgIGlmIChmID0gMSwgeSAmJiAodCA9IG9wWzBdICYgMiA/IHlbXCJyZXR1cm5cIl0gOiBvcFswXSA/IHlbXCJ0aHJvd1wiXSB8fCAoKHQgPSB5W1wicmV0dXJuXCJdKSAmJiB0LmNhbGwoeSksIDApIDogeS5uZXh0KSAmJiAhKHQgPSB0LmNhbGwoeSwgb3BbMV0pKS5kb25lKSByZXR1cm4gdDtcbiAgICAgICAgICAgIGlmICh5ID0gMCwgdCkgb3AgPSBbb3BbMF0gJiAyLCB0LnZhbHVlXTtcbiAgICAgICAgICAgIHN3aXRjaCAob3BbMF0pIHtcbiAgICAgICAgICAgICAgICBjYXNlIDA6IGNhc2UgMTogdCA9IG9wOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDQ6IF8ubGFiZWwrKzsgcmV0dXJuIHsgdmFsdWU6IG9wWzFdLCBkb25lOiBmYWxzZSB9O1xuICAgICAgICAgICAgICAgIGNhc2UgNTogXy5sYWJlbCsrOyB5ID0gb3BbMV07IG9wID0gWzBdOyBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBjYXNlIDc6IG9wID0gXy5vcHMucG9wKCk7IF8udHJ5cy5wb3AoKTsgY29udGludWU7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEodCA9IF8udHJ5cywgdCA9IHQubGVuZ3RoID4gMCAmJiB0W3QubGVuZ3RoIC0gMV0pICYmIChvcFswXSA9PT0gNiB8fCBvcFswXSA9PT0gMikpIHsgXyA9IDA7IGNvbnRpbnVlOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gMyAmJiAoIXQgfHwgKG9wWzFdID4gdFswXSAmJiBvcFsxXSA8IHRbM10pKSkgeyBfLmxhYmVsID0gb3BbMV07IGJyZWFrOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gNiAmJiBfLmxhYmVsIDwgdFsxXSkgeyBfLmxhYmVsID0gdFsxXTsgdCA9IG9wOyBicmVhazsgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodCAmJiBfLmxhYmVsIDwgdFsyXSkgeyBfLmxhYmVsID0gdFsyXTsgXy5vcHMucHVzaChvcCk7IGJyZWFrOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0WzJdKSBfLm9wcy5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9wID0gYm9keS5jYWxsKHRoaXNBcmcsIF8pO1xuICAgICAgICB9IGNhdGNoIChlKSB7IG9wID0gWzYsIGVdOyB5ID0gMDsgfSBmaW5hbGx5IHsgZiA9IHQgPSAwOyB9XG4gICAgICAgIGlmIChvcFswXSAmIDUpIHRocm93IG9wWzFdOyByZXR1cm4geyB2YWx1ZTogb3BbMF0gPyBvcFsxXSA6IHZvaWQgMCwgZG9uZTogdHJ1ZSB9O1xuICAgIH1cbn07XG52YXIgQ2FydEluZm8gPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQ2FydEluZm8oYXBpVXJsLCBlbGVtZW50U2VsZWN0b3IpIHtcbiAgICAgICAgdGhpcy5hcGlVcmwgPSBhcGlVcmw7XG4gICAgICAgIHRoaXMuZWxlbWVudFNlbGVjdG9yID0gZWxlbWVudFNlbGVjdG9yO1xuICAgICAgICB0aGlzLl9pbml0Q2FydFdpZGdldCgpO1xuICAgIH1cbiAgICBDYXJ0SW5mby5wcm90b3R5cGUuZmV0Y2hDYXJ0SXRlbXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciByZXNwb25zZSwgaHRtbCwgZXJyb3JfMTtcbiAgICAgICAgICAgIHJldHVybiBfX2dlbmVyYXRvcih0aGlzLCBmdW5jdGlvbiAoX2EpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKF9hLmxhYmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICAgICAgICAgIF9hLnRyeXMucHVzaChbMCwgMywgLCA0XSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzQgLyp5aWVsZCovLCBmZXRjaCh0aGlzLmFwaVVybCldO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNwb25zZSA9IF9hLnNlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdUaGVyZSBoYXMgYmVlbiBhIHByb2JsZW0gd2l0aCB5b3VyIGZldGNoIG9wZXJhdGlvbjonLCByZXNwb25zZS5zdGF0dXNUZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzIgLypyZXR1cm4qL107IC8vIEFkZGVkIHJldHVybiB0byBwcmV2ZW50IGZ1cnRoZXIgZXhlY3V0aW9uIGlmIHRoZXJlJ3MgYW4gZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbNCAvKnlpZWxkKi8sIHJlc3BvbnNlLnRleHQoKV07XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGh0bWwgPSBfYS5zZW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc3BsYXlDYXJ0SXRlbXMoaHRtbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzMgLypicmVhayovLCA0XTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JfMSA9IF9hLnNlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1RoZXJlIGhhcyBiZWVuIGEgcHJvYmxlbSB3aXRoIHlvdXIgZmV0Y2ggb3BlcmF0aW9uOicsIGVycm9yXzEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFszIC8qYnJlYWsqLywgNF07XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgNDogcmV0dXJuIFsyIC8qcmV0dXJuKi9dO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIENhcnRJbmZvLnByb3RvdHlwZS5faW5pdENhcnRXaWRnZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuZmV0Y2hDYXJ0SXRlbXMoKTtcbiAgICB9O1xuICAgIENhcnRJbmZvLnByb3RvdHlwZS5kaXNwbGF5Q2FydEl0ZW1zID0gZnVuY3Rpb24gKGh0bWwpIHtcbiAgICAgICAgdmFyIGNhcnRGbGFnID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLmVsZW1lbnRTZWxlY3Rvcik7XG4gICAgICAgIGlmIChjYXJ0RmxhZykge1xuICAgICAgICAgICAgdmFyIGxvYWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jYXJ0LWxvYWRlcicpO1xuICAgICAgICAgICAgaWYgKGxvYWRlcikge1xuICAgICAgICAgICAgICAgIGxvYWRlci5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhcnRGbGFnLmlubmVySFRNTCArPSBodG1sO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gQ2FydEluZm87XG59KCkpO1xuZXhwb3J0IHsgQ2FydEluZm8gfTtcbiIsIi8vIGV4dHJhY3RlZCBieSBtaW5pLWNzcy1leHRyYWN0LXBsdWdpblxuZXhwb3J0IHt9OyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4vLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuX193ZWJwYWNrX3JlcXVpcmVfXy5tID0gX193ZWJwYWNrX21vZHVsZXNfXztcblxuIiwidmFyIGRlZmVycmVkID0gW107XG5fX3dlYnBhY2tfcmVxdWlyZV9fLk8gPSAocmVzdWx0LCBjaHVua0lkcywgZm4sIHByaW9yaXR5KSA9PiB7XG5cdGlmKGNodW5rSWRzKSB7XG5cdFx0cHJpb3JpdHkgPSBwcmlvcml0eSB8fCAwO1xuXHRcdGZvcih2YXIgaSA9IGRlZmVycmVkLmxlbmd0aDsgaSA+IDAgJiYgZGVmZXJyZWRbaSAtIDFdWzJdID4gcHJpb3JpdHk7IGktLSkgZGVmZXJyZWRbaV0gPSBkZWZlcnJlZFtpIC0gMV07XG5cdFx0ZGVmZXJyZWRbaV0gPSBbY2h1bmtJZHMsIGZuLCBwcmlvcml0eV07XG5cdFx0cmV0dXJuO1xuXHR9XG5cdHZhciBub3RGdWxmaWxsZWQgPSBJbmZpbml0eTtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBkZWZlcnJlZC5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBjaHVua0lkcyA9IGRlZmVycmVkW2ldWzBdO1xuXHRcdHZhciBmbiA9IGRlZmVycmVkW2ldWzFdO1xuXHRcdHZhciBwcmlvcml0eSA9IGRlZmVycmVkW2ldWzJdO1xuXHRcdHZhciBmdWxmaWxsZWQgPSB0cnVlO1xuXHRcdGZvciAodmFyIGogPSAwOyBqIDwgY2h1bmtJZHMubGVuZ3RoOyBqKyspIHtcblx0XHRcdGlmICgocHJpb3JpdHkgJiAxID09PSAwIHx8IG5vdEZ1bGZpbGxlZCA+PSBwcmlvcml0eSkgJiYgT2JqZWN0LmtleXMoX193ZWJwYWNrX3JlcXVpcmVfXy5PKS5ldmVyeSgoa2V5KSA9PiAoX193ZWJwYWNrX3JlcXVpcmVfXy5PW2tleV0oY2h1bmtJZHNbal0pKSkpIHtcblx0XHRcdFx0Y2h1bmtJZHMuc3BsaWNlKGotLSwgMSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRmdWxmaWxsZWQgPSBmYWxzZTtcblx0XHRcdFx0aWYocHJpb3JpdHkgPCBub3RGdWxmaWxsZWQpIG5vdEZ1bGZpbGxlZCA9IHByaW9yaXR5O1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZihmdWxmaWxsZWQpIHtcblx0XHRcdGRlZmVycmVkLnNwbGljZShpLS0sIDEpXG5cdFx0XHR2YXIgciA9IGZuKCk7XG5cdFx0XHRpZiAociAhPT0gdW5kZWZpbmVkKSByZXN1bHQgPSByO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gcmVzdWx0O1xufTsiLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gKG1vZHVsZSkgPT4ge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHQoKSA9PiAobW9kdWxlWydkZWZhdWx0J10pIDpcblx0XHQoKSA9PiAobW9kdWxlKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgeyBhOiBnZXR0ZXIgfSk7XG5cdHJldHVybiBnZXR0ZXI7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18uZyA9IChmdW5jdGlvbigpIHtcblx0aWYgKHR5cGVvZiBnbG9iYWxUaGlzID09PSAnb2JqZWN0JykgcmV0dXJuIGdsb2JhbFRoaXM7XG5cdHRyeSB7XG5cdFx0cmV0dXJuIHRoaXMgfHwgbmV3IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHRpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpIHJldHVybiB3aW5kb3c7XG5cdH1cbn0pKCk7IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIi8vIG5vIGJhc2VVUklcblxuLy8gb2JqZWN0IHRvIHN0b3JlIGxvYWRlZCBhbmQgbG9hZGluZyBjaHVua3Ncbi8vIHVuZGVmaW5lZCA9IGNodW5rIG5vdCBsb2FkZWQsIG51bGwgPSBjaHVuayBwcmVsb2FkZWQvcHJlZmV0Y2hlZFxuLy8gW3Jlc29sdmUsIHJlamVjdCwgUHJvbWlzZV0gPSBjaHVuayBsb2FkaW5nLCAwID0gY2h1bmsgbG9hZGVkXG52YXIgaW5zdGFsbGVkQ2h1bmtzID0ge1xuXHRcImFwcFwiOiAwXG59O1xuXG4vLyBubyBjaHVuayBvbiBkZW1hbmQgbG9hZGluZ1xuXG4vLyBubyBwcmVmZXRjaGluZ1xuXG4vLyBubyBwcmVsb2FkZWRcblxuLy8gbm8gSE1SXG5cbi8vIG5vIEhNUiBtYW5pZmVzdFxuXG5fX3dlYnBhY2tfcmVxdWlyZV9fLk8uaiA9IChjaHVua0lkKSA9PiAoaW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdID09PSAwKTtcblxuLy8gaW5zdGFsbCBhIEpTT05QIGNhbGxiYWNrIGZvciBjaHVuayBsb2FkaW5nXG52YXIgd2VicGFja0pzb25wQ2FsbGJhY2sgPSAocGFyZW50Q2h1bmtMb2FkaW5nRnVuY3Rpb24sIGRhdGEpID0+IHtcblx0dmFyIGNodW5rSWRzID0gZGF0YVswXTtcblx0dmFyIG1vcmVNb2R1bGVzID0gZGF0YVsxXTtcblx0dmFyIHJ1bnRpbWUgPSBkYXRhWzJdO1xuXHQvLyBhZGQgXCJtb3JlTW9kdWxlc1wiIHRvIHRoZSBtb2R1bGVzIG9iamVjdCxcblx0Ly8gdGhlbiBmbGFnIGFsbCBcImNodW5rSWRzXCIgYXMgbG9hZGVkIGFuZCBmaXJlIGNhbGxiYWNrXG5cdHZhciBtb2R1bGVJZCwgY2h1bmtJZCwgaSA9IDA7XG5cdGlmKGNodW5rSWRzLnNvbWUoKGlkKSA9PiAoaW5zdGFsbGVkQ2h1bmtzW2lkXSAhPT0gMCkpKSB7XG5cdFx0Zm9yKG1vZHVsZUlkIGluIG1vcmVNb2R1bGVzKSB7XG5cdFx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8obW9yZU1vZHVsZXMsIG1vZHVsZUlkKSkge1xuXHRcdFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLm1bbW9kdWxlSWRdID0gbW9yZU1vZHVsZXNbbW9kdWxlSWRdO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZihydW50aW1lKSB2YXIgcmVzdWx0ID0gcnVudGltZShfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblx0fVxuXHRpZihwYXJlbnRDaHVua0xvYWRpbmdGdW5jdGlvbikgcGFyZW50Q2h1bmtMb2FkaW5nRnVuY3Rpb24oZGF0YSk7XG5cdGZvcig7aSA8IGNodW5rSWRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0Y2h1bmtJZCA9IGNodW5rSWRzW2ldO1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhpbnN0YWxsZWRDaHVua3MsIGNodW5rSWQpICYmIGluc3RhbGxlZENodW5rc1tjaHVua0lkXSkge1xuXHRcdFx0aW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdWzBdKCk7XG5cdFx0fVxuXHRcdGluc3RhbGxlZENodW5rc1tjaHVua0lkXSA9IDA7XG5cdH1cblx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18uTyhyZXN1bHQpO1xufVxuXG52YXIgY2h1bmtMb2FkaW5nR2xvYmFsID0gc2VsZltcIndlYnBhY2tDaHVua1wiXSA9IHNlbGZbXCJ3ZWJwYWNrQ2h1bmtcIl0gfHwgW107XG5jaHVua0xvYWRpbmdHbG9iYWwuZm9yRWFjaCh3ZWJwYWNrSnNvbnBDYWxsYmFjay5iaW5kKG51bGwsIDApKTtcbmNodW5rTG9hZGluZ0dsb2JhbC5wdXNoID0gd2VicGFja0pzb25wQ2FsbGJhY2suYmluZChudWxsLCBjaHVua0xvYWRpbmdHbG9iYWwucHVzaC5iaW5kKGNodW5rTG9hZGluZ0dsb2JhbCkpOyIsIiIsIi8vIHN0YXJ0dXBcbi8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLy8gVGhpcyBlbnRyeSBtb2R1bGUgZGVwZW5kcyBvbiBvdGhlciBsb2FkZWQgY2h1bmtzIGFuZCBleGVjdXRpb24gbmVlZCB0byBiZSBkZWxheWVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18uTyh1bmRlZmluZWQsIFtcInZlbmRvcnMtbm9kZV9tb2R1bGVzX2Jvb3RzdHJhcF9kaXN0X2pzX2Jvb3RzdHJhcF9lc21fanMtbm9kZV9tb2R1bGVzX3N3aXBlcl9zd2lwZXItYnVuZGxlX2Nzcy0wY2RlZGJcIl0sICgpID0+IChfX3dlYnBhY2tfcmVxdWlyZV9fKFwiLi9qcy9hcHAudHNcIikpKVxuX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18uTyhfX3dlYnBhY2tfZXhwb3J0c19fKTtcbiIsIiJdLCJuYW1lcyI6WyJjb3Jlc2hvcFF1YW50aXR5U2VsZWN0b3IiLCJvcHRpb25zIiwiaW5pdFF1YW50aXR5RmllbGRzIiwiZmllbGRzIiwiZG9jdW1lbnQiLCJxdWVyeVNlbGVjdG9yQWxsIiwicHJlY2lzaW9uUHJlc2V0U2VsZWN0b3IiLCJxdWVyeVNlbGVjdG9yIiwiYWRkRXZlbnRMaXN0ZW5lciIsImRhdGFzZXQiLCJjc1VuaXRJZGVudGlmaWVyIiwicXVhbnRpdHlJZGVudGlmaWVyIiwicXVhbnRpdHlJbnB1dCIsImNvbmNhdCIsInN0ZXAiLCJjc1VuaXRQcmVjaXNpb24iLCJ1cGRhdGVUb3VjaFNwaW5TZXR0aW5ncyIsInRvU3RyaW5nIiwiZm9yRWFjaCIsImZpZWxkIiwiaW5pdGlhbGl6ZVRvdWNoU3BpbiIsImlucHV0IiwicHJlY2lzaW9uIiwiY29udGFpbmVyIiwiY3JlYXRlRWxlbWVudCIsImNsYXNzTGlzdCIsImFkZCIsImRlY3JlbWVudEJ1dHRvbiIsInR5cGUiLCJ0ZXh0Q29udGVudCIsImluY3JlbWVudEJ1dHRvbiIsInBhcmVudE5vZGUiLCJpbnNlcnRCZWZvcmUiLCJhcHBlbmRDaGlsZCIsInZhbHVlIiwicGFyc2VJbnQiLCJpc05hTiIsIm1pbiIsIm1heCIsIndpbmRvdyIsImNvcmVzaG9wVmFyaWFudFNlbGVjdG9yIiwiYXR0cmlidXRlQ29udGFpbmVyIiwiX2F0dHJpYnV0ZUNvbnRhaW5lciIsIl9jb25maWciLCJfYXR0cmlidXRlR3JvdXBzIiwiX2luaXQiLCJKU09OIiwicGFyc2UiLCJjb25maWciLCJfaW5pdGlhbGl6ZUF0dHJpYnV0ZUdyb3VwcyIsIl9zZXR1cEF0dHJpYnV0ZUdyb3VwU2V0dGluZ3MiLCJfc2V0dXBDaGFuZ2VFdmVudHMiLCJhdHRyaWJ1dGVzIiwiZ3JvdXAiLCJlbGVtZW50cyIsImlkIiwicHVzaCIsImluZGV4IiwicHJldkdyb3VwIiwibmV4dEdyb3VwIiwic2VsZWN0ZWQiLCJfY29uZmlndXJlR3JvdXAiLCJfY2xlYXJHcm91cCIsIl9hdHRhY2hDaGFuZ2VFdmVudCIsIl9hc3NpZ25PbkNoYW5nZUV2ZW50IiwiZWxlbWVudCIsIm9uY2hhbmdlIiwiX2hhbmRsZUVsZW1lbnRDaGFuZ2UiLCJ2YXJpYW50UmVhZHkiLCJkaXNwYXRjaEV2ZW50IiwiX2NyZWF0ZUV2ZW50IiwiX3NlbGVjdEdyb3VwRWxlbWVudCIsIl9kZXNlbGVjdEdyb3VwRWxlbWVudCIsIl9jbGVhckdyb3VwcyIsIl9yZWRpcmVjdFRvVmFyaWFudCIsInNlbGVjdGVkQXR0cmlidXRlcyIsIl9nZXRTZWxlY3RlZEF0dHJpYnV0ZXMiLCJtYXRjaGluZ1Byb2R1Y3QiLCJfZmluZE1hdGNoaW5nUHJvZHVjdCIsInVybCIsImxvY2F0aW9uIiwiaHJlZiIsIk9iamVjdCIsImZyb21FbnRyaWVzIiwiZmlsdGVyIiwiZyIsIm1hcCIsInZhbHVlcyIsImZpbmQiLCJwIiwic3RyaW5naWZ5IiwibmFtZSIsImRhdGEiLCJhcmd1bWVudHMiLCJsZW5ndGgiLCJ1bmRlZmluZWQiLCJDdXN0b21FdmVudCIsImJ1YmJsZXMiLCJjYW5jZWxhYmxlIiwiZGV0YWlsIiwiX2NsZWFyR3JvdXBFbGVtZW50cyIsImRpc2FibGVkIiwiY2hlY2tlZCIsInRhZ05hbWUiLCJ0b0xvd2VyQ2FzZSIsIl9jbGVhclNlbGVjdE9wdGlvbnMiLCJvcHRpb24iLCJyZW1vdmVDaGlsZCIsIl9pc1Byb2R1Y3RNYXRjaGluZ0ZpbHRlcnMiLCJwcm9kdWN0IiwiZmlsdGVyQXR0cmlidXRlcyIsImV2ZXJ5IiwiX2NvbmZpZyRpbmRleCRwcm9kdWN0IiwiX2lzQXR0cmlidXRlUmVsZXZhbnQiLCJhdHRyaWJ1dGUiLCJwcm9kdWN0cyIsInNvbWUiLCJfZmlsdGVyQXR0cmlidXRlcyIsIl9nZXRGaWx0ZXJBdHRyaWJ1dGVzIiwiY3VycmVudEdyb3VwIiwiX2FkZE9wdGlvblRvU2VsZWN0IiwiT3B0aW9uIiwiX2VuYWJsZUVsZW1lbnRGb3JBdHRyaWJ1dGUiLCJfY29uZmlndXJlR3JvdXBFbGVtZW50cyIsIl9jb25maWd1cmVFbGVtZW50IiwiZmlsdGVyZWRBdHRyaWJ1dGVzIiwic2xpY2UiLCJtZXRob2RzIiwiaW5pdCIsInNldHRpbmdzIiwicHJvdG90eXBlUHJlZml4IiwiY29udGFpbmVyU2VsZWN0b3IiLCJzZWxlY3RvckF0dHIiLCJzZWxlY3RvciIsInNob3ciLCJyZXBsYWNlIiwic2VsZWN0ZWRWYWx1ZSIsInNlbGVjdGVkT3B0aW9uIiwiQXJyYXkiLCJmcm9tIiwiZ2V0QXR0cmlidXRlIiwicHJvdG90eXBlRWxlbWVudCIsImdldEVsZW1lbnRCeUlkIiwiZ2V0Q29udGFpbmVyIiwiaW5uZXJIVE1MIiwidHJpbSIsInByb3RvdHlwZSIsImRhdGFDb250YWluZXJJZCIsIk5vZGVMaXN0IiwiaGFuZGxlUHJvdG90eXBlcyIsIm1ldGhvZCIsImFwcGx5IiwiY2FsbCIsIkVycm9yIiwiSFRNTEVsZW1lbnQiLCJtYXBCbG9jayIsInN0eWxlIiwiaGVpZ2h0IiwiY2xpZW50SGVpZ2h0IiwiaW5pdGlhbGl6ZSIsIm1hcE9wdGlvbnMiLCJ6b29tIiwiY2VudGVyIiwiZ29vZ2xlIiwibWFwcyIsIkxhdExuZyIsImRpc2FibGVEZWZhdWx0VUkiLCJtYXBOZXciLCJNYXAiLCJjb25zb2xlIiwibG9nIiwic2hvcCIsImluaXRDaGFuZ2VBZGRyZXNzIiwiaW5pdENhcnRTaGlwbWVudENhbGN1bGF0b3IiLCJpbml0UXVhbnRpdHlWYWxpZGF0b3IiLCJpbml0Q2F0ZWdvcnlTZWxlY3QiLCJzZXR1cENvcHlUb0NsaXBib2FyZCIsInNob3dFbGVtZW50IiwiZ2V0U2VsZWN0ZWRWYWx1ZSIsImJ1dHRvbiIsImNvcHlUZXh0VG9DbGlwYm9hcmQiLCJ0YXJnZXRJZCIsInRhcmdldCIsImNvcHlUZXh0Iiwic2VsZWN0Iiwic2V0U2VsZWN0aW9uUmFuZ2UiLCJuYXZpZ2F0b3IiLCJjbGlwYm9hcmQiLCJ3cml0ZVRleHQiLCJ0aGVuIiwiY29waWVkVGV4dCIsInVwZGF0ZVF1ZXJ5U3RyaW5nUGFyYW1ldGVyIiwidXJpIiwia2V5IiwicmUiLCJSZWdFeHAiLCJzZXBhcmF0b3IiLCJpbmRleE9mIiwibWF0Y2giLCJidXR0b25kb3duX2NsYXNzIiwiYnV0dG9udXBfY2xhc3MiLCJldiIsImZvcm0iLCJjbG9zZXN0IiwiaGFuZGxlU2hpcG1lbnRDYWxjdWxhdGlvbiIsImV2ZW50IiwicHJldmVudERlZmF1bHQiLCJzZXRBdHRyaWJ1dGUiLCJvcGFjaXR5IiwiZmV0Y2giLCJhY3Rpb24iLCJib2R5IiwiVVJMU2VhcmNoUGFyYW1zIiwiRm9ybURhdGEiLCJyZXNwb25zZSIsInRleHQiLCJyZXMiLCJ1cGRhdGVTaGlwbWVudENhbGN1bGF0aW9uIiwiY2F0Y2giLCJlcnJvciIsImhhbmRsZVNoaXBtZW50RXJyb3IiLCJyZXNwb25zZVRleHQiLCJyZW1vdmUiLCJvdXRlckhUTUwiLCJyZW1vdmVBdHRyaWJ1dGUiLCJhZGRyZXNzU3RlcCIsImludm9pY2VBZGRyZXNzIiwic2hpcHBpbmdBZGRyZXNzIiwidXNlSWFzUyIsInNldHVwQWRkcmVzc0NoYW5nZUV2ZW50cyIsInVwZGF0ZUFkZHJlc3MiLCJ1cGRhdGVTaGlwcGluZ0FkZHJlc3MiLCJ0b2dnbGVTaGlwcGluZ0FkZHJlc3MiLCJzZWxlY3RlZEluZGV4IiwiYWRkcmVzcyIsImh0bWwiLCJpbnZvaWNlUGFuZWwiLCJ0b2dnbGVVc2VBc1NoaXBwaW5nIiwiYWRkcmVzc1R5cGUiLCJpc0ludm9pY2VUeXBlIiwiRXZlbnQiLCJzaGlwcGluZ0ZpZWxkIiwic2hpcHBpbmdBZGRBZGRyZXNzQnV0dG9uIiwiZGlzcGxheSIsInZhcmlhbnQiLCJ2YXJpYW50cyIsImUiLCJzdWJtaXRzIiwic3VibWl0IiwiQ2Fyb3VzZWwiLCJDYXJ0SW5mbyIsIkNhcnRXaWRnZXQiLCJDYXJvdXNlbFByb2R1Y3RzIiwiU3dpcGVyIiwiVGh1bWJzIiwiX2luaXRDYXJvdXNlbCIsInNsaWRlclRodW1ibmFpbCIsInNsaWRlc1BlclZpZXciLCJmcmVlTW9kZSIsInNwYWNlQmV0d2VlbiIsIndhdGNoU2xpZGVzUHJvZ3Jlc3MiLCJtYWluU2xpZGVyIiwibW9kdWxlcyIsIm5hdmlnYXRpb24iLCJuZXh0RWwiLCJwcmV2RWwiLCJ0aHVtYnMiLCJzd2lwZXIiLCJfX2F3YWl0ZXIiLCJ0aGlzQXJnIiwiX2FyZ3VtZW50cyIsIlAiLCJnZW5lcmF0b3IiLCJhZG9wdCIsInJlc29sdmUiLCJQcm9taXNlIiwicmVqZWN0IiwiZnVsZmlsbGVkIiwibmV4dCIsInJlamVjdGVkIiwicmVzdWx0IiwiZG9uZSIsIl9fZ2VuZXJhdG9yIiwiXyIsImxhYmVsIiwic2VudCIsInQiLCJ0cnlzIiwib3BzIiwiZiIsInkiLCJjcmVhdGUiLCJJdGVyYXRvciIsInZlcmIiLCJTeW1ib2wiLCJpdGVyYXRvciIsIm4iLCJ2Iiwib3AiLCJUeXBlRXJyb3IiLCJwb3AiLCJhcGlVcmwiLCJlbGVtZW50U2VsZWN0b3IiLCJfaW5pdENhcnRXaWRnZXQiLCJmZXRjaENhcnRJdGVtcyIsImVycm9yXzEiLCJfYSIsIm9rIiwic3RhdHVzVGV4dCIsImRpc3BsYXlDYXJ0SXRlbXMiLCJjYXJ0RmxhZyIsImxvYWRlciJdLCJzb3VyY2VSb290IjoiIn0=