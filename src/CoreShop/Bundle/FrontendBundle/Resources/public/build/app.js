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
/* STYLES  */


/* JS */








document.addEventListener('DOMContentLoaded', function () {
  // const CartWidget = new CartInfo('/coreshop_get_cart_items', '.js-cart-widget');
  var CarouselProducts = new _scripts_carousel__WEBPACK_IMPORTED_MODULE_9__.Carousel();
  //console.log(CartWidget);
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
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["vendors-node_modules_bootstrap_dist_js_bootstrap_esm_js-node_modules_swiper_swiper-bundle_css-d35cf9"], () => (__webpack_require__("./js/app.ts")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLENBQUMsWUFBWTtFQUNULFNBQVNBLHdCQUF3QkEsQ0FBQ0MsT0FBTyxFQUFFO0lBQ3ZDQyxrQkFBa0IsQ0FBQ0QsT0FBTyxDQUFDO0VBQy9CO0VBRUEsU0FBU0Msa0JBQWtCQSxDQUFDRCxPQUFPLEVBQUU7SUFDakMsTUFBTUUsTUFBTSxHQUFHQyxRQUFRLENBQUNDLGdCQUFnQixDQUFDLHFCQUFxQixDQUFDO0lBQy9ELE1BQU1DLHVCQUF1QixHQUFHRixRQUFRLENBQUNHLGFBQWEsQ0FBQyx5QkFBeUIsQ0FBQztJQUVqRixJQUFHRCx1QkFBdUIsRUFBRTtNQUN4QjtNQUNBQSx1QkFBdUIsQ0FBQ0UsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLFlBQVk7UUFDM0QsSUFBSSxDQUFDLElBQUksQ0FBQ0MsT0FBTyxDQUFDQyxnQkFBZ0IsRUFBRTtVQUNoQztRQUNKO1FBQ0EsTUFBTUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDRixPQUFPLENBQUNDLGdCQUFnQjtRQUN4RCxNQUFNRSxhQUFhLEdBQUdSLFFBQVEsQ0FBQ0csYUFBYSxvQ0FBQU0sTUFBQSxDQUFtQ0Ysa0JBQWtCLFFBQUksQ0FBQzs7UUFFdEc7UUFDQSxNQUFNRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUM7O1FBRWhCLElBQUksQ0FBQ0YsYUFBYSxFQUFFO1VBQ2hCO1FBQ0o7O1FBRUE7UUFDQUEsYUFBYSxDQUFDRSxJQUFJLEdBQUdBLElBQUksQ0FBQyxDQUFDO1FBQzNCRixhQUFhLENBQUNILE9BQU8sQ0FBQ00sZUFBZSxHQUFHLENBQUMsQ0FBQyxDQUFDOztRQUUzQztRQUNBQyx1QkFBdUIsQ0FBQ0osYUFBYSxFQUFFLENBQUMsRUFBRUUsSUFBSSxDQUFDRyxRQUFRLENBQUMsQ0FBQyxDQUFDO01BQzlELENBQUMsQ0FBQztJQUNOO0lBRUEsSUFBR2QsTUFBTSxFQUFFO01BQ1A7TUFDQUEsTUFBTSxDQUFDZSxPQUFPLENBQUMsVUFBVUMsS0FBSyxFQUFFO1FBQzVCO1FBQ0FDLG1CQUFtQixDQUFDRCxLQUFLLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRWxCLE9BQU8sQ0FBQyxDQUFDLENBQUM7TUFDakQsQ0FBQyxDQUFDO0lBQ047RUFDSjtFQUVBLFNBQVNtQixtQkFBbUJBLENBQUNDLEtBQUssRUFBRUMsU0FBUyxFQUFFUixJQUFJLEVBQUViLE9BQU8sRUFBRTtJQUMxRCxNQUFNc0IsU0FBUyxHQUFHbkIsUUFBUSxDQUFDb0IsYUFBYSxDQUFDLEtBQUssQ0FBQztJQUMvQ0QsU0FBUyxDQUFDRSxTQUFTLENBQUNDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQztJQUU5QyxNQUFNQyxlQUFlLEdBQUd2QixRQUFRLENBQUNvQixhQUFhLENBQUMsUUFBUSxDQUFDO0lBQ3hERyxlQUFlLENBQUNDLElBQUksR0FBRyxRQUFRO0lBQy9CRCxlQUFlLENBQUNFLFdBQVcsR0FBRyxHQUFHO0lBQ2pDRixlQUFlLENBQUNGLFNBQVMsQ0FBQ0MsR0FBRyxDQUFDLHFCQUFxQixDQUFDO0lBRXBELE1BQU1JLGVBQWUsR0FBRzFCLFFBQVEsQ0FBQ29CLGFBQWEsQ0FBQyxRQUFRLENBQUM7SUFDeERNLGVBQWUsQ0FBQ0YsSUFBSSxHQUFHLFFBQVE7SUFDL0JFLGVBQWUsQ0FBQ0QsV0FBVyxHQUFHLEdBQUc7SUFDakNDLGVBQWUsQ0FBQ0wsU0FBUyxDQUFDQyxHQUFHLENBQUMscUJBQXFCLENBQUM7SUFFcERMLEtBQUssQ0FBQ1UsVUFBVSxDQUFDQyxZQUFZLENBQUNULFNBQVMsRUFBRUYsS0FBSyxDQUFDO0lBQy9DRSxTQUFTLENBQUNVLFdBQVcsQ0FBQ04sZUFBZSxDQUFDO0lBQ3RDSixTQUFTLENBQUNVLFdBQVcsQ0FBQ1osS0FBSyxDQUFDO0lBQzVCRSxTQUFTLENBQUNVLFdBQVcsQ0FBQ0gsZUFBZSxDQUFDOztJQUV0QztJQUNBSCxlQUFlLENBQUNuQixnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsWUFBWTtNQUNsRCxJQUFJMEIsS0FBSyxHQUFHQyxRQUFRLENBQUNkLEtBQUssQ0FBQ2EsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7TUFDeENBLEtBQUssSUFBSUMsUUFBUSxDQUFDckIsSUFBSSxDQUFDLENBQUMsQ0FBQztNQUN6QixJQUFJb0IsS0FBSyxJQUFJLENBQUMsRUFBRTtRQUNaYixLQUFLLENBQUNhLEtBQUssR0FBR0EsS0FBSztNQUN2QjtJQUNKLENBQUMsQ0FBQztJQUVGSixlQUFlLENBQUN0QixnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsWUFBWTtNQUNsRCxJQUFJMEIsS0FBSyxHQUFHQyxRQUFRLENBQUNkLEtBQUssQ0FBQ2EsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7TUFDeENBLEtBQUssSUFBSUMsUUFBUSxDQUFDckIsSUFBSSxDQUFDLENBQUMsQ0FBQztNQUN6Qk8sS0FBSyxDQUFDYSxLQUFLLEdBQUdBLEtBQUs7SUFDdkIsQ0FBQyxDQUFDOztJQUVGO0lBQ0FiLEtBQUssQ0FBQ2IsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLFlBQVk7TUFDeEMsSUFBSTBCLEtBQUssR0FBR0MsUUFBUSxDQUFDZCxLQUFLLENBQUNhLEtBQUssQ0FBQztNQUNqQyxJQUFJRSxLQUFLLENBQUNGLEtBQUssQ0FBQyxFQUFFO1FBQ2RiLEtBQUssQ0FBQ2EsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO01BQ3JCLENBQUMsTUFBTTtRQUNIYixLQUFLLENBQUNhLEtBQUssR0FBR0EsS0FBSyxDQUFDLENBQUM7TUFDekI7SUFDSixDQUFDLENBQUM7RUFDTjtFQUVBLFNBQVNsQix1QkFBdUJBLENBQUNLLEtBQUssRUFBRUMsU0FBUyxFQUFFUixJQUFJLEVBQUU7SUFDckRPLEtBQUssQ0FBQ2dCLEdBQUcsR0FBRyxDQUFDO0lBQ2JoQixLQUFLLENBQUNpQixHQUFHLEdBQUcsVUFBVTtJQUN0QmpCLEtBQUssQ0FBQ1AsSUFBSSxHQUFHQSxJQUFJO0lBQ2pCTyxLQUFLLENBQUNaLE9BQU8sQ0FBQ00sZUFBZSxHQUFHTyxTQUFTO0VBQzdDOztFQUVBO0VBQ0FpQixNQUFNLENBQUN2Qyx3QkFBd0IsR0FBR0Esd0JBQXdCO0FBQzlELENBQUMsRUFBRSxDQUFDOzs7Ozs7Ozs7OztBQ2pHSixDQUFDLFlBQVk7RUFDVCxNQUFNd0MsdUJBQXVCLEdBQUcsU0FBQUEsQ0FBVUMsa0JBQWtCLEVBQUU7SUFDMUQsSUFBSUMsbUJBQW1CLEdBQUcsSUFBSTtJQUM5QixJQUFJQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO0lBQ2hCLElBQUlDLGdCQUFnQixHQUFHLEVBQUU7SUFFekIsTUFBTUMsS0FBSyxHQUFHLFNBQUFBLENBQUEsRUFBWTtNQUN0QixJQUFJLENBQUNKLGtCQUFrQixFQUFFO01BRXpCQyxtQkFBbUIsR0FBR0Qsa0JBQWtCO01BQ3hDRSxPQUFPLEdBQUdHLElBQUksQ0FBQ0MsS0FBSyxDQUFDTCxtQkFBbUIsQ0FBQ2pDLE9BQU8sQ0FBQ3VDLE1BQU0sQ0FBQztNQUN4REMsMEJBQTBCLENBQUMsQ0FBQztNQUM1QkMsNEJBQTRCLENBQUMsQ0FBQztNQUM5QkMsa0JBQWtCLENBQUMsQ0FBQztJQUN4QixDQUFDO0lBRUQsTUFBTUYsMEJBQTBCLEdBQUcsU0FBQUEsQ0FBQSxFQUFZO01BQzNDTixPQUFPLENBQUNTLFVBQVUsQ0FBQ2xDLE9BQU8sQ0FBRW1DLEtBQUssSUFBSztRQUNsQ0EsS0FBSyxDQUFDQyxRQUFRLEdBQUdaLG1CQUFtQixDQUFDckMsZ0JBQWdCLGtCQUFBUSxNQUFBLENBQWlCd0MsS0FBSyxDQUFDQSxLQUFLLENBQUNFLEVBQUUsUUFBSSxDQUFDO1FBQ3pGWCxnQkFBZ0IsQ0FBQ1ksSUFBSSxDQUFDSCxLQUFLLENBQUM7TUFDaEMsQ0FBQyxDQUFDO0lBQ04sQ0FBQztJQUVELE1BQU1ILDRCQUE0QixHQUFHLFNBQUFBLENBQUEsRUFBWTtNQUM3Q04sZ0JBQWdCLENBQUMxQixPQUFPLENBQUMsQ0FBQ21DLEtBQUssRUFBRUksS0FBSyxLQUFLO1FBQ3ZDSixLQUFLLENBQUNLLFNBQVMsR0FBR2QsZ0JBQWdCLENBQUNhLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJO1FBQ3JESixLQUFLLENBQUNNLFNBQVMsR0FBR2YsZ0JBQWdCLENBQUNhLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJO1FBQ3JESixLQUFLLENBQUNPLFFBQVEsR0FBR0MsZUFBZSxDQUFDUixLQUFLLENBQUMsR0FBR1MsV0FBVyxDQUFDVCxLQUFLLENBQUM7TUFDaEUsQ0FBQyxDQUFDO0lBQ04sQ0FBQztJQUVELE1BQU1GLGtCQUFrQixHQUFHLFNBQUFBLENBQUEsRUFBWTtNQUNuQ1AsZ0JBQWdCLENBQUMxQixPQUFPLENBQUVtQyxLQUFLLElBQUtVLGtCQUFrQixDQUFDVixLQUFLLENBQUMsQ0FBQztJQUNsRSxDQUFDO0lBRUQsTUFBTVcsb0JBQW9CLEdBQUcsU0FBQUEsQ0FBVUMsT0FBTyxFQUFFWixLQUFLLEVBQUU7TUFDbkRZLE9BQU8sQ0FBQ0MsUUFBUSxHQUFHLE1BQU1DLG9CQUFvQixDQUFDZCxLQUFLLEVBQUVZLE9BQU8sQ0FBQztJQUNqRSxDQUFDO0lBRUQsTUFBTUYsa0JBQWtCLEdBQUcsU0FBQUEsQ0FBVVYsS0FBSyxFQUFFO01BQ3hDQSxLQUFLLENBQUNDLFFBQVEsQ0FBQ3BDLE9BQU8sQ0FBRStDLE9BQU8sSUFBS0Qsb0JBQW9CLENBQUNDLE9BQU8sRUFBRVosS0FBSyxDQUFDLENBQUM7SUFDN0UsQ0FBQztJQUVELE1BQU1jLG9CQUFvQixHQUFHLFNBQUFBLENBQVVkLEtBQUssRUFBRVksT0FBTyxFQUFFO01BQ25EMUIsTUFBTSxDQUFDNkIsWUFBWSxHQUFHLEtBQUs7TUFDM0IxQixtQkFBbUIsQ0FBQzJCLGFBQWEsQ0FBQ0MsWUFBWSxDQUFDLFFBQVEsRUFBRTtRQUFFTDtNQUFRLENBQUMsQ0FBQyxDQUFDO01BRXRFLElBQUlBLE9BQU8sQ0FBQy9CLEtBQUssRUFBRTtRQUNmcUMsbUJBQW1CLENBQUNsQixLQUFLLEVBQUVZLE9BQU8sQ0FBQztNQUN2QyxDQUFDLE1BQU07UUFDSE8scUJBQXFCLENBQUNuQixLQUFLLENBQUM7TUFDaEM7TUFFQWQsTUFBTSxDQUFDNkIsWUFBWSxHQUFHLElBQUk7SUFDOUIsQ0FBQztJQUVELE1BQU1HLG1CQUFtQixHQUFHLFNBQUFBLENBQVVsQixLQUFLLEVBQUVZLE9BQU8sRUFBRTtNQUNsRFosS0FBSyxDQUFDTyxRQUFRLEdBQUd6QixRQUFRLENBQUM4QixPQUFPLENBQUMvQixLQUFLLENBQUM7TUFDeENRLG1CQUFtQixDQUFDMkIsYUFBYSxDQUFDQyxZQUFZLENBQUMsUUFBUSxFQUFFO1FBQUVMO01BQVEsQ0FBQyxDQUFDLENBQUM7TUFFdEUsSUFBSVosS0FBSyxDQUFDTSxTQUFTLEVBQUU7UUFDakJjLFlBQVksQ0FBQ3BCLEtBQUssQ0FBQ00sU0FBUyxDQUFDO1FBQzdCRSxlQUFlLENBQUNSLEtBQUssQ0FBQ00sU0FBUyxDQUFDO01BQ3BDLENBQUMsTUFBTTtRQUNIakIsbUJBQW1CLENBQUMyQixhQUFhLENBQUNDLFlBQVksQ0FBQyxVQUFVLEVBQUU7VUFBRUw7UUFBUSxDQUFDLENBQUMsQ0FBQztRQUN4RVMsa0JBQWtCLENBQUMsQ0FBQztNQUN4QjtJQUNKLENBQUM7SUFFRCxNQUFNRixxQkFBcUIsR0FBRyxTQUFBQSxDQUFVbkIsS0FBSyxFQUFFO01BQzNDLE9BQU9BLEtBQUssQ0FBQ08sUUFBUTtNQUNyQixJQUFJUCxLQUFLLENBQUNNLFNBQVMsRUFBRWMsWUFBWSxDQUFDcEIsS0FBSyxDQUFDTSxTQUFTLENBQUM7SUFDdEQsQ0FBQztJQUVELE1BQU1lLGtCQUFrQixHQUFHLFNBQUFBLENBQUEsRUFBWTtNQUNuQyxNQUFNQyxrQkFBa0IsR0FBR0Msc0JBQXNCLENBQUMsQ0FBQztNQUNuRCxNQUFNQyxlQUFlLEdBQUdDLG9CQUFvQixDQUFDSCxrQkFBa0IsQ0FBQztNQUVoRSxJQUFJRSxlQUFlLGFBQWZBLGVBQWUsZUFBZkEsZUFBZSxDQUFFRSxHQUFHLEVBQUU7UUFDdEJ4QyxNQUFNLENBQUN5QyxRQUFRLENBQUNDLElBQUksR0FBR0osZUFBZSxDQUFDRSxHQUFHO01BQzlDO0lBQ0osQ0FBQztJQUVELE1BQU1ILHNCQUFzQixHQUFHLFNBQUFBLENBQUEsRUFBWTtNQUN2QyxPQUFPTSxNQUFNLENBQUNDLFdBQVcsQ0FDckJ2QyxnQkFBZ0IsQ0FBQ3dDLE1BQU0sQ0FBRUMsQ0FBQyxJQUFLQSxDQUFDLENBQUN6QixRQUFRLENBQUMsQ0FBQzBCLEdBQUcsQ0FBRUQsQ0FBQyxJQUFLLENBQUNBLENBQUMsQ0FBQ2hDLEtBQUssQ0FBQ0UsRUFBRSxFQUFFOEIsQ0FBQyxDQUFDekIsUUFBUSxDQUFDLENBQ2xGLENBQUM7SUFDTCxDQUFDO0lBRUQsTUFBTWtCLG9CQUFvQixHQUFHLFNBQUFBLENBQVVILGtCQUFrQixFQUFFO01BQ3ZELE9BQU9PLE1BQU0sQ0FBQ0ssTUFBTSxDQUFDNUMsT0FBTyxDQUFDYyxLQUFLLENBQUMsQ0FBQytCLElBQUksQ0FBRUMsQ0FBQyxJQUN2QzNDLElBQUksQ0FBQzRDLFNBQVMsQ0FBQ0QsQ0FBQyxDQUFDckMsVUFBVSxDQUFDLEtBQUtOLElBQUksQ0FBQzRDLFNBQVMsQ0FBQ2Ysa0JBQWtCLENBQ3RFLENBQUM7SUFDTCxDQUFDO0lBRUQsTUFBTUwsWUFBWSxHQUFHLFNBQUFBLENBQVVxQixJQUFJLEVBQWE7TUFBQSxJQUFYQyxJQUFJLEdBQUFDLFNBQUEsQ0FBQUMsTUFBQSxRQUFBRCxTQUFBLFFBQUFFLFNBQUEsR0FBQUYsU0FBQSxNQUFHLENBQUMsQ0FBQztNQUMxQyxPQUFPLElBQUlHLFdBQVcsQ0FBQyxtQkFBbUIsR0FBR0wsSUFBSSxFQUFFO1FBQy9DTSxPQUFPLEVBQUUsSUFBSTtRQUNiQyxVQUFVLEVBQUUsS0FBSztRQUNqQkMsTUFBTSxFQUFFUDtNQUNaLENBQUMsQ0FBQztJQUNOLENBQUM7SUFFRCxNQUFNUSxtQkFBbUIsR0FBRyxTQUFBQSxDQUFVbkMsT0FBTyxFQUFFO01BQzNDQSxPQUFPLENBQUNvQyxRQUFRLEdBQUcsSUFBSTtNQUN2QnBDLE9BQU8sQ0FBQ3FDLE9BQU8sR0FBRyxLQUFLO01BRXZCLElBQUlyQyxPQUFPLENBQUNzQyxPQUFPLENBQUNDLFdBQVcsQ0FBQyxDQUFDLEtBQUssUUFBUSxFQUFFQyxtQkFBbUIsQ0FBQ3hDLE9BQU8sQ0FBQztJQUNoRixDQUFDO0lBRUQsTUFBTXdDLG1CQUFtQixHQUFHLFNBQUFBLENBQVV4QyxPQUFPLEVBQUU7TUFDM0MsTUFBTWhFLE9BQU8sR0FBR2dFLE9BQU8sQ0FBQzVELGdCQUFnQixDQUFDLHdCQUF3QixDQUFDO01BQ2xFSixPQUFPLENBQUNpQixPQUFPLENBQUV3RixNQUFNLElBQUt6QyxPQUFPLENBQUMwQyxXQUFXLENBQUNELE1BQU0sQ0FBQyxDQUFDO0lBQzVELENBQUM7SUFFRCxNQUFNNUMsV0FBVyxHQUFHLFNBQUFBLENBQVVULEtBQUssRUFBRTtNQUNqQyxPQUFPQSxLQUFLLENBQUNPLFFBQVE7TUFDckJQLEtBQUssQ0FBQ0MsUUFBUSxDQUFDcEMsT0FBTyxDQUFDa0YsbUJBQW1CLENBQUM7SUFDL0MsQ0FBQztJQUVELE1BQU0zQixZQUFZLEdBQUcsU0FBQUEsQ0FBVXBCLEtBQUssRUFBRTtNQUNsQyxPQUFPQSxLQUFLLEVBQUU7UUFDVlMsV0FBVyxDQUFDVCxLQUFLLENBQUM7UUFDbEJBLEtBQUssR0FBR0EsS0FBSyxDQUFDTSxTQUFTO01BQzNCO0lBQ0osQ0FBQztJQUVELE1BQU1pRCx5QkFBeUIsR0FBRyxTQUFBQSxDQUFVQyxPQUFPLEVBQUVDLGdCQUFnQixFQUFFO01BQ25FLE9BQU9BLGdCQUFnQixDQUFDQyxLQUFLLENBQUUzQixNQUFNO1FBQUEsSUFBQTRCLHFCQUFBO1FBQUEsT0FBSyxFQUFBQSxxQkFBQSxHQUFBckUsT0FBTyxDQUFDYyxLQUFLLENBQUNvRCxPQUFPLENBQUN0RCxFQUFFLENBQUMsQ0FBQ0gsVUFBVSxjQUFBNEQscUJBQUEsdUJBQXBDQSxxQkFBQSxDQUF1QzVCLE1BQU0sQ0FBQy9CLEtBQUssQ0FBQyxNQUFLK0IsTUFBTSxDQUFDeEIsUUFBUTtNQUFBLEVBQUM7SUFDdkgsQ0FBQztJQUVELE1BQU1xRCxvQkFBb0IsR0FBRyxTQUFBQSxDQUFVQyxTQUFTLEVBQUVKLGdCQUFnQixFQUFFO01BQ2hFLE9BQU9JLFNBQVMsQ0FBQ0MsUUFBUSxDQUFDQyxJQUFJLENBQUVQLE9BQU8sSUFBS0QseUJBQXlCLENBQUNDLE9BQU8sRUFBRUMsZ0JBQWdCLENBQUMsQ0FBQztJQUNyRyxDQUFDO0lBRUQsTUFBTU8saUJBQWlCLEdBQUcsU0FBQUEsQ0FBVWpFLFVBQVUsRUFBRUMsS0FBSyxFQUFFO01BQ25ELE1BQU15RCxnQkFBZ0IsR0FBR1Esb0JBQW9CLENBQUNqRSxLQUFLLENBQUM7TUFDcEQsT0FBT0QsVUFBVSxDQUFDZ0MsTUFBTSxDQUFFOEIsU0FBUyxJQUFLRCxvQkFBb0IsQ0FBQ0MsU0FBUyxFQUFFSixnQkFBZ0IsQ0FBQyxDQUFDO0lBQzlGLENBQUM7SUFFRCxNQUFNUSxvQkFBb0IsR0FBRyxTQUFBQSxDQUFVakUsS0FBSyxFQUFFO01BQzFDLE1BQU15RCxnQkFBZ0IsR0FBRyxFQUFFO01BQzNCLElBQUlTLFlBQVksR0FBR2xFLEtBQUssQ0FBQ0ssU0FBUztNQUVsQyxPQUFPNkQsWUFBWSxFQUFFO1FBQ2pCLElBQUlBLFlBQVksQ0FBQzNELFFBQVEsSUFBSTJELFlBQVksQ0FBQzVELFNBQVMsRUFBRTtVQUNqRG1ELGdCQUFnQixDQUFDdEQsSUFBSSxDQUFDO1lBQUVILEtBQUssRUFBRWtFLFlBQVksQ0FBQ2xFLEtBQUssQ0FBQ0UsRUFBRTtZQUFFSyxRQUFRLEVBQUUyRCxZQUFZLENBQUMzRDtVQUFTLENBQUMsQ0FBQztRQUM1RjtRQUNBMkQsWUFBWSxHQUFHQSxZQUFZLENBQUM3RCxTQUFTO01BQ3pDO01BRUEsT0FBT29ELGdCQUFnQjtJQUMzQixDQUFDO0lBRUQsTUFBTVUsa0JBQWtCLEdBQUcsU0FBQUEsQ0FBVXZELE9BQU8sRUFBRWlELFNBQVMsRUFBRTdELEtBQUssRUFBRTtNQUM1RCxNQUFNcUQsTUFBTSxHQUFHLElBQUllLE1BQU0sQ0FBQ1AsU0FBUyxDQUFDQSxTQUFTLENBQUN2QixJQUFJLEVBQUV1QixTQUFTLENBQUNBLFNBQVMsQ0FBQzNELEVBQUUsQ0FBQztNQUMzRW1ELE1BQU0sQ0FBQ25ELEVBQUUsR0FBRyxZQUFZLEdBQUcyRCxTQUFTLENBQUNBLFNBQVMsQ0FBQzNELEVBQUU7TUFDakQsSUFBSUYsS0FBSyxDQUFDTyxRQUFRLEtBQUtzRCxTQUFTLENBQUNBLFNBQVMsQ0FBQzNELEVBQUUsRUFBRW1ELE1BQU0sQ0FBQzlDLFFBQVEsR0FBRyxJQUFJO01BQ3JFSyxPQUFPLENBQUN2QyxHQUFHLENBQUNnRixNQUFNLENBQUM7TUFDbkJ6QyxPQUFPLENBQUNvQyxRQUFRLEdBQUcsS0FBSztJQUM1QixDQUFDO0lBRUQsTUFBTXFCLDBCQUEwQixHQUFHLFNBQUFBLENBQVV6RCxPQUFPLEVBQUVpRCxTQUFTLEVBQUU3RCxLQUFLLEVBQUU7TUFDcEUsSUFBSWxCLFFBQVEsQ0FBQzhCLE9BQU8sQ0FBQ3hELE9BQU8sQ0FBQzRDLEtBQUssQ0FBQyxLQUFLQSxLQUFLLENBQUNBLEtBQUssQ0FBQ0UsRUFBRSxJQUFJcEIsUUFBUSxDQUFDOEIsT0FBTyxDQUFDL0IsS0FBSyxDQUFDLEtBQUtnRixTQUFTLENBQUNBLFNBQVMsQ0FBQzNELEVBQUUsRUFBRTtRQUMxR1UsT0FBTyxDQUFDb0MsUUFBUSxHQUFHLEtBQUs7UUFDeEIsSUFBSWhELEtBQUssQ0FBQ08sUUFBUSxLQUFLc0QsU0FBUyxDQUFDQSxTQUFTLENBQUMzRCxFQUFFLEVBQUVVLE9BQU8sQ0FBQ3FDLE9BQU8sR0FBRyxJQUFJO01BQ3pFO0lBQ0osQ0FBQztJQUVELE1BQU1xQix1QkFBdUIsR0FBRyxTQUFBQSxDQUFVdEUsS0FBSyxFQUFFRCxVQUFVLEVBQUU7TUFDekRDLEtBQUssQ0FBQ0MsUUFBUSxDQUFDcEMsT0FBTyxDQUFFK0MsT0FBTyxJQUMzQjJELGlCQUFpQixDQUFDM0QsT0FBTyxFQUFFYixVQUFVLEVBQUVDLEtBQUssQ0FDaEQsQ0FBQztJQUNMLENBQUM7SUFFRCxNQUFNdUUsaUJBQWlCLEdBQUcsU0FBQUEsQ0FBVTNELE9BQU8sRUFBRWIsVUFBVSxFQUFFQyxLQUFLLEVBQUU7TUFDNUQsSUFBSVksT0FBTyxDQUFDc0MsT0FBTyxDQUFDQyxXQUFXLENBQUMsQ0FBQyxLQUFLLFFBQVEsRUFBRTtRQUM1Q3BELFVBQVUsQ0FBQ2xDLE9BQU8sQ0FBRWdHLFNBQVMsSUFBS00sa0JBQWtCLENBQUN2RCxPQUFPLEVBQUVpRCxTQUFTLEVBQUU3RCxLQUFLLENBQUMsQ0FBQztNQUNwRixDQUFDLE1BQU07UUFDSEQsVUFBVSxDQUFDbEMsT0FBTyxDQUFFZ0csU0FBUyxJQUFLUSwwQkFBMEIsQ0FBQ3pELE9BQU8sRUFBRWlELFNBQVMsRUFBRTdELEtBQUssQ0FBQyxDQUFDO01BQzVGO0lBQ0osQ0FBQztJQUVELE1BQU1RLGVBQWUsR0FBRyxTQUFBQSxDQUFVUixLQUFLLEVBQUU7TUFDckMsTUFBTXdFLGtCQUFrQixHQUFHUixpQkFBaUIsQ0FBQ2hFLEtBQUssQ0FBQ0QsVUFBVSxDQUFDMEUsS0FBSyxDQUFDLENBQUMsRUFBRXpFLEtBQUssQ0FBQyxJQUFJQSxLQUFLLENBQUNELFVBQVU7TUFDakd1RSx1QkFBdUIsQ0FBQ3RFLEtBQUssRUFBRXdFLGtCQUFrQixDQUFDO0lBQ3RELENBQUM7SUFFRGhGLEtBQUssQ0FBQyxDQUFDO0VBQ1gsQ0FBQztFQUVETixNQUFNLENBQUNDLHVCQUF1QixHQUFHQSx1QkFBdUI7QUFDNUQsQ0FBQyxFQUFFLENBQUM7Ozs7Ozs7Ozs7O0FDaE1ILGFBQVk7RUFDVCxZQUFZOztFQUVaLE1BQU11RixPQUFPLEdBQUc7SUFDWkMsSUFBSSxFQUFFLFNBQUFBLENBQVUvSCxPQUFPLEVBQUU7TUFDckIsTUFBTWdJLFFBQVEsR0FBRztRQUNiQyxlQUFlLEVBQUUsS0FBSztRQUN0QkMsaUJBQWlCLEVBQUUsS0FBSztRQUN4QkMsWUFBWSxFQUFFLEtBQUs7UUFDbkIsR0FBR25JLE9BQU8sQ0FBQztNQUNmLENBQUM7TUFFRCxNQUFNcUQsUUFBUSxHQUFHbEQsUUFBUSxDQUFDQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUNnSSxRQUFRLENBQUM7TUFDekQvRSxRQUFRLENBQUNwQyxPQUFPLENBQUMrQyxPQUFPLElBQUk7UUFDeEIsSUFBSSxDQUFDcUUsSUFBSSxDQUFDckUsT0FBTyxFQUFFZ0UsUUFBUSxFQUFFLEtBQUssQ0FBQztRQUNuQ2hFLE9BQU8sQ0FBQ3pELGdCQUFnQixDQUFDLFFBQVEsRUFBRSxNQUFNO1VBQ3JDLElBQUksQ0FBQzhILElBQUksQ0FBQ3JFLE9BQU8sRUFBRWdFLFFBQVEsRUFBRSxJQUFJLENBQUM7UUFDdEMsQ0FBQyxDQUFDO01BQ04sQ0FBQyxDQUFDO0lBQ04sQ0FBQztJQUVESyxJQUFJLEVBQUUsU0FBQUEsQ0FBVXJFLE9BQU8sRUFBRWdFLFFBQVEsRUFBRU0sT0FBTyxFQUFFO01BQ3hDLElBQUlDLGFBQWEsR0FBR3ZFLE9BQU8sQ0FBQy9CLEtBQUs7TUFDakMsSUFBSWdHLGVBQWUsR0FBR2pFLE9BQU8sQ0FBQ1YsRUFBRTtNQUVoQyxJQUFJMEUsUUFBUSxDQUFDRyxZQUFZLEVBQUU7UUFDdkIsTUFBTUssY0FBYyxHQUFHQyxLQUFLLENBQUNDLElBQUksQ0FBQzFFLE9BQU8sQ0FBQ2hFLE9BQU8sQ0FBQyxDQUFDdUYsSUFBSSxDQUFDa0IsTUFBTSxJQUFJQSxNQUFNLENBQUN4RSxLQUFLLEtBQUtzRyxhQUFhLENBQUM7UUFDakcsSUFBSUMsY0FBYyxFQUFFO1VBQ2hCRCxhQUFhLEdBQUdDLGNBQWMsQ0FBQ0csWUFBWSxDQUFDWCxRQUFRLENBQUNHLFlBQVksQ0FBQztRQUN0RTtNQUNKO01BRUEsSUFBSUgsUUFBUSxDQUFDQyxlQUFlLEVBQUU7UUFDMUJBLGVBQWUsR0FBR0QsUUFBUSxDQUFDQyxlQUFlO01BQzlDO01BRUEsTUFBTVcsZ0JBQWdCLEdBQUd6SSxRQUFRLENBQUMwSSxjQUFjLElBQUFqSSxNQUFBLENBQUlxSCxlQUFlLE9BQUFySCxNQUFBLENBQUkySCxhQUFhLENBQUUsQ0FBQztNQUN2RixJQUFJakgsU0FBUyxHQUFHLElBQUksQ0FBQ3dILFlBQVksQ0FBQ2QsUUFBUSxFQUFFWSxnQkFBZ0IsQ0FBQztNQUU3RCxJQUFJLENBQUN0SCxTQUFTLEVBQUU7UUFDWjtNQUNKO01BRUEsSUFBSSxDQUFDc0gsZ0JBQWdCLEVBQUU7UUFDbkJ0SCxTQUFTLENBQUN5SCxTQUFTLEdBQUcsRUFBRTtRQUN4QjtNQUNKO01BRUEsSUFBSVQsT0FBTyxJQUFJLENBQUNoSCxTQUFTLENBQUN5SCxTQUFTLENBQUNDLElBQUksQ0FBQyxDQUFDLEVBQUU7UUFDeEMxSCxTQUFTLENBQUN5SCxTQUFTLEdBQUdILGdCQUFnQixDQUFDcEksT0FBTyxDQUFDeUksU0FBUztNQUM1RDtJQUNKLENBQUM7SUFFREgsWUFBWSxFQUFFLFNBQUFBLENBQVVkLFFBQVEsRUFBRVksZ0JBQWdCLEVBQUU7TUFDaEQsSUFBSVosUUFBUSxDQUFDRSxpQkFBaUIsRUFBRTtRQUM1QixPQUFPL0gsUUFBUSxDQUFDRyxhQUFhLENBQUMwSCxRQUFRLENBQUNFLGlCQUFpQixDQUFDO01BQzdELENBQUMsTUFBTTtRQUNILE1BQU1nQixlQUFlLEdBQUdOLGdCQUFnQixHQUFHQSxnQkFBZ0IsQ0FBQ3BJLE9BQU8sQ0FBQ2MsU0FBUyxHQUFHLElBQUk7UUFDcEYsT0FBT25CLFFBQVEsQ0FBQzBJLGNBQWMsQ0FBQ0ssZUFBZSxDQUFDO01BQ25EO0lBQ0o7RUFDSixDQUFDOztFQUVEO0VBQ0FDLFFBQVEsQ0FBQ0YsU0FBUyxDQUFDRyxnQkFBZ0IsR0FBRyxVQUFVQyxNQUFNLEVBQUU7SUFDcEQsSUFBSXZCLE9BQU8sQ0FBQ3VCLE1BQU0sQ0FBQyxFQUFFO01BQ2pCLE9BQU92QixPQUFPLENBQUN1QixNQUFNLENBQUMsQ0FBQ0MsS0FBSyxDQUFDLElBQUksRUFBRWIsS0FBSyxDQUFDUSxTQUFTLENBQUNwQixLQUFLLENBQUMwQixJQUFJLENBQUMzRCxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDaEYsQ0FBQyxNQUFNLElBQUksT0FBT3lELE1BQU0sS0FBSyxRQUFRLElBQUksQ0FBQ0EsTUFBTSxFQUFFO01BQzlDLE9BQU92QixPQUFPLENBQUNDLElBQUksQ0FBQ3VCLEtBQUssQ0FBQyxJQUFJLEVBQUUxRCxTQUFTLENBQUM7SUFDOUMsQ0FBQyxNQUFNO01BQ0gsTUFBTSxJQUFJNEQsS0FBSyxDQUFDLFNBQVMsR0FBR0gsTUFBTSxHQUFHLHFDQUFxQyxDQUFDO0lBQy9FO0VBQ0osQ0FBQzs7RUFFRDtFQUNBSSxXQUFXLENBQUNSLFNBQVMsQ0FBQ0csZ0JBQWdCLEdBQUcsVUFBVUMsTUFBTSxFQUFFO0lBQ3ZELE9BQU92QixPQUFPLENBQUNzQixnQkFBZ0IsQ0FBQ0csSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUVGLE1BQU0sQ0FBQztFQUN4RCxDQUFDO0FBRUwsQ0FBQyxFQUFDLENBQUM7Ozs7Ozs7Ozs7QUMvRUhsSixRQUFRLENBQUNJLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLFlBQVk7RUFDdEQsTUFBTW1KLFFBQVEsR0FBR3ZKLFFBQVEsQ0FBQzBJLGNBQWMsQ0FBQyxXQUFXLENBQUM7RUFFckQsSUFBSWEsUUFBUSxFQUFFO0lBQ1ZBLFFBQVEsQ0FBQ0MsS0FBSyxDQUFDQyxNQUFNLEdBQUd6SixRQUFRLENBQUMwSSxjQUFjLENBQUMsYUFBYSxDQUFDLENBQUNnQixZQUFZLEdBQUcsSUFBSTtJQUVsRixTQUFTQyxVQUFVQSxDQUFBLEVBQUc7TUFDbEIsTUFBTUMsVUFBVSxHQUFHO1FBQ2ZDLElBQUksRUFBRSxFQUFFO1FBQ1JDLE1BQU0sRUFBRSxJQUFJQyxNQUFNLENBQUNDLElBQUksQ0FBQ0MsTUFBTSxDQUFDLFVBQVUsRUFBRSxpQkFBaUIsQ0FBQztRQUM3REMsZ0JBQWdCLEVBQUU7TUFDdEIsQ0FBQztNQUNELE1BQU1DLE1BQU0sR0FBRyxJQUFJSixNQUFNLENBQUNDLElBQUksQ0FBQ0ksR0FBRyxDQUFDYixRQUFRLEVBQUVLLFVBQVUsQ0FBQztNQUN4RFMsT0FBTyxDQUFDQyxHQUFHLENBQUNILE1BQU0sQ0FBQztJQUN2QjtJQUVBaEksTUFBTSxDQUFDL0IsZ0JBQWdCLENBQUMsTUFBTSxFQUFFdUosVUFBVSxDQUFDO0VBQy9DO0FBQ0osQ0FBQyxDQUFDOzs7Ozs7Ozs7Ozs7OztBQ2xCRixNQUFNWSxJQUFJLEdBQUdwSSxNQUFNLENBQUNvSSxJQUFJLElBQUksQ0FBQyxDQUFDO0FBRTdCLFdBQVVBLElBQUksRUFBRTtFQUNiQSxJQUFJLENBQUMzQyxJQUFJLEdBQUcsWUFBWTtJQUNwQjJDLElBQUksQ0FBQ0MsaUJBQWlCLENBQUMsQ0FBQztJQUN4QkQsSUFBSSxDQUFDRSwwQkFBMEIsQ0FBQyxDQUFDO0lBQ2pDRixJQUFJLENBQUNHLHFCQUFxQixDQUFDLENBQUM7SUFDNUJILElBQUksQ0FBQ0ksa0JBQWtCLENBQUMsQ0FBQztJQUV6QjFCLGdCQUFnQixDQUFDO01BQ2IsaUJBQWlCLEVBQUUsaUJBQWlCO01BQ3BDLG1CQUFtQixFQUFFLGtCQUFrQjtNQUN2QyxjQUFjLEVBQUU7SUFDcEIsQ0FBQyxDQUFDO0lBRUYyQixvQkFBb0IsQ0FBQyxDQUFDO0VBQzFCLENBQUM7RUFFRCxTQUFTM0IsZ0JBQWdCQSxDQUFDcEosT0FBTyxFQUFFO0lBQy9CLE1BQU1nSSxRQUFRLEdBQUc7TUFDYkMsZUFBZSxFQUFFakksT0FBTyxDQUFDaUksZUFBZSxJQUFJLEtBQUs7TUFDakRDLGlCQUFpQixFQUFFbEksT0FBTyxDQUFDa0ksaUJBQWlCLElBQUksS0FBSztNQUNyREMsWUFBWSxFQUFFbkksT0FBTyxDQUFDbUksWUFBWSxJQUFJO0lBQzFDLENBQUM7SUFFRGhJLFFBQVEsQ0FBQ0MsZ0JBQWdCLFVBQUFRLE1BQUEsQ0FBVW9ILFFBQVEsQ0FBQ0MsZUFBZSxNQUFHLENBQUMsQ0FBQ2hILE9BQU8sQ0FBQyxVQUFVK0MsT0FBTyxFQUFFO01BQ3ZGZ0gsV0FBVyxDQUFDaEgsT0FBTyxFQUFFLEtBQUssQ0FBQztNQUMzQkEsT0FBTyxDQUFDekQsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLFlBQVk7UUFDM0N5SyxXQUFXLENBQUNoSCxPQUFPLEVBQUUsSUFBSSxDQUFDO01BQzlCLENBQUMsQ0FBQztJQUNOLENBQUMsQ0FBQztJQUVGLFNBQVNnSCxXQUFXQSxDQUFDaEgsT0FBTyxFQUFFc0UsT0FBTyxFQUFFO01BQ25DLE1BQU1DLGFBQWEsR0FBRzBDLGdCQUFnQixDQUFDakgsT0FBTyxDQUFDO01BQy9DLE1BQU1pRSxlQUFlLEdBQUdELFFBQVEsQ0FBQ0MsZUFBZSxJQUFJakUsT0FBTyxDQUFDVixFQUFFO01BQzlELE1BQU1zRixnQkFBZ0IsR0FBR3pJLFFBQVEsQ0FBQzBJLGNBQWMsSUFBQWpJLE1BQUEsQ0FBSXFILGVBQWUsT0FBQXJILE1BQUEsQ0FBSTJILGFBQWEsQ0FBRSxDQUFDO01BQ3ZGLE1BQU1qSCxTQUFTLEdBQUd3SCxZQUFZLENBQUNGLGdCQUFnQixDQUFDO01BRWhELElBQUl0SCxTQUFTLEtBQUtnSCxPQUFPLElBQUksQ0FBQ2hILFNBQVMsQ0FBQ3lILFNBQVMsQ0FBQ0MsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFO1FBQ3ZEMUgsU0FBUyxDQUFDeUgsU0FBUyxHQUFHSCxnQkFBZ0IsR0FBR0EsZ0JBQWdCLENBQUNwSSxPQUFPLENBQUN5SSxTQUFTLEdBQUcsRUFBRTtNQUNwRjtJQUNKO0lBRUEsU0FBU2dDLGdCQUFnQkEsQ0FBQ2pILE9BQU8sRUFBRTtNQUMvQixJQUFJZ0UsUUFBUSxDQUFDRyxZQUFZLEVBQUU7UUFDdkIsT0FBT25FLE9BQU8sQ0FBQzFELGFBQWEsYUFBQU0sTUFBQSxDQUFZb0QsT0FBTyxDQUFDL0IsS0FBSyxRQUFJLENBQUMsQ0FBQzBHLFlBQVksQ0FBQ1gsUUFBUSxDQUFDRyxZQUFZLENBQUM7TUFDbEc7TUFDQSxPQUFPbkUsT0FBTyxDQUFDL0IsS0FBSztJQUN4QjtJQUVBLFNBQVM2RyxZQUFZQSxDQUFDRixnQkFBZ0IsRUFBRTtNQUNwQyxJQUFJWixRQUFRLENBQUNFLGlCQUFpQixFQUFFO1FBQzVCLE9BQU8vSCxRQUFRLENBQUNHLGFBQWEsQ0FBQzBILFFBQVEsQ0FBQ0UsaUJBQWlCLENBQUM7TUFDN0Q7TUFDQSxPQUFPVSxnQkFBZ0IsR0FBR3pJLFFBQVEsQ0FBQ0csYUFBYSxDQUFDc0ksZ0JBQWdCLENBQUNwSSxPQUFPLENBQUNjLFNBQVMsQ0FBQyxHQUFHLElBQUk7SUFDL0Y7RUFDSjtFQUVBLFNBQVN5SixvQkFBb0JBLENBQUEsRUFBRztJQUM1QjVLLFFBQVEsQ0FBQ0MsZ0JBQWdCLENBQUMsb0JBQW9CLENBQUMsQ0FBQ2EsT0FBTyxDQUFDLFVBQVVpSyxNQUFNLEVBQUU7TUFDdEVBLE1BQU0sQ0FBQzNLLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxZQUFXO1FBQ3hDNEssbUJBQW1CLENBQUMsSUFBSSxDQUFDO01BQzdCLENBQUMsQ0FBQztJQUNOLENBQUMsQ0FBQztFQUNOO0VBRUEsU0FBU0EsbUJBQW1CQSxDQUFDRCxNQUFNLEVBQUU7SUFDakMsTUFBTUUsUUFBUSxHQUFHRixNQUFNLENBQUMxSyxPQUFPLENBQUM2SyxNQUFNO0lBQ3RDLE1BQU1DLFFBQVEsR0FBR25MLFFBQVEsQ0FBQzBJLGNBQWMsQ0FBQ3VDLFFBQVEsQ0FBQztJQUVsRCxJQUFJRSxRQUFRLEVBQUU7TUFDVkEsUUFBUSxDQUFDQyxNQUFNLENBQUMsQ0FBQztNQUNqQkQsUUFBUSxDQUFDRSxpQkFBaUIsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQzs7TUFFdENDLFNBQVMsQ0FBQ0MsU0FBUyxDQUFDQyxTQUFTLENBQUNMLFFBQVEsQ0FBQ3JKLEtBQUssQ0FBQyxDQUFDMkosSUFBSSxDQUFDLE1BQU07UUFDckRwQixPQUFPLENBQUNDLEdBQUcsQ0FBQ1MsTUFBTSxDQUFDMUssT0FBTyxDQUFDcUwsVUFBVSxDQUFDO01BQzFDLENBQUMsQ0FBQztJQUNOO0VBQ0o7RUFFQW5CLElBQUksQ0FBQ0ksa0JBQWtCLEdBQUcsWUFBWTtJQUNsQzNLLFFBQVEsQ0FBQ0MsZ0JBQWdCLENBQUMsY0FBYyxDQUFDLENBQUNhLE9BQU8sQ0FBQyxVQUFVc0ssTUFBTSxFQUFFO01BQ2hFQSxNQUFNLENBQUNoTCxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsWUFBVztRQUN6Q3dFLFFBQVEsQ0FBQ0MsSUFBSSxHQUFHOEcsMEJBQTBCLENBQUN4SixNQUFNLENBQUN5QyxRQUFRLENBQUNDLElBQUksRUFBRSxJQUFJLENBQUNVLElBQUksRUFBRSxJQUFJLENBQUN6RCxLQUFLLENBQUM7TUFDM0YsQ0FBQyxDQUFDO0lBQ04sQ0FBQyxDQUFDO0VBQ04sQ0FBQztFQUVELFNBQVM2SiwwQkFBMEJBLENBQUNDLEdBQUcsRUFBRUMsR0FBRyxFQUFFL0osS0FBSyxFQUFFO0lBQ2pELE1BQU1nSyxFQUFFLEdBQUcsSUFBSUMsTUFBTSxDQUFDLFFBQVEsR0FBR0YsR0FBRyxHQUFHLFdBQVcsRUFBRSxHQUFHLENBQUM7SUFDeEQsTUFBTUcsU0FBUyxHQUFHSixHQUFHLENBQUNLLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRztJQUNyRCxPQUFPTCxHQUFHLENBQUNNLEtBQUssQ0FBQ0osRUFBRSxDQUFDLEdBQUdGLEdBQUcsQ0FBQ3pELE9BQU8sQ0FBQzJELEVBQUUsRUFBRSxJQUFJLEdBQUdELEdBQUcsR0FBRyxHQUFHLEdBQUcvSixLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUc4SixHQUFHLEdBQUdJLFNBQVMsR0FBR0gsR0FBRyxHQUFHLEdBQUcsR0FBRy9KLEtBQUs7RUFDakg7RUFFQXlJLElBQUksQ0FBQ0cscUJBQXFCLEdBQUcsWUFBWTtJQUNyQzlLLHdCQUF3QixDQUFDO01BQ3JCdU0sZ0JBQWdCLEVBQUUsbUJBQW1CO01BQ3JDQyxjQUFjLEVBQUU7SUFDcEIsQ0FBQyxDQUFDO0VBQ04sQ0FBQztFQUVEN0IsSUFBSSxDQUFDRSwwQkFBMEIsR0FBRyxZQUFZO0lBQzFDekssUUFBUSxDQUFDSSxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsVUFBVWlNLEVBQUUsRUFBRTtNQUM5QyxNQUFNQyxJQUFJLEdBQUdELEVBQUUsQ0FBQ25CLE1BQU0sQ0FBQ3FCLE9BQU8sQ0FBQywyQ0FBMkMsQ0FBQztNQUMzRSxJQUFJRCxJQUFJLEVBQUU7UUFDTkUseUJBQXlCLENBQUNGLElBQUksQ0FBQztNQUNuQztJQUNKLENBQUMsQ0FBQztFQUNOLENBQUM7RUFFRCxTQUFTRSx5QkFBeUJBLENBQUNGLElBQUksRUFBRTtJQUNyQ0csS0FBSyxDQUFDQyxjQUFjLENBQUMsQ0FBQztJQUN0QkosSUFBSSxDQUFDakwsU0FBUyxDQUFDQyxHQUFHLENBQUMsU0FBUyxDQUFDO0lBQzdCZ0wsSUFBSSxDQUFDbk0sYUFBYSxDQUFDLHVCQUF1QixDQUFDLENBQUN3TSxZQUFZLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQztJQUNoRkwsSUFBSSxDQUFDQyxPQUFPLENBQUMsZ0NBQWdDLENBQUMsQ0FBQ3BNLGFBQWEsQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDcUosS0FBSyxDQUFDb0QsT0FBTyxHQUFHLEdBQUc7SUFFckhDLEtBQUssQ0FBQ1AsSUFBSSxDQUFDUSxNQUFNLEVBQUU7TUFDZjVELE1BQU0sRUFBRSxNQUFNO01BQ2Q2RCxJQUFJLEVBQUUsSUFBSUMsZUFBZSxDQUFDLElBQUlDLFFBQVEsQ0FBQ1gsSUFBSSxDQUFDO0lBQ2hELENBQUMsQ0FBQyxDQUNEYixJQUFJLENBQUN5QixRQUFRLElBQUlBLFFBQVEsQ0FBQ0MsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUNqQzFCLElBQUksQ0FBQzJCLEdBQUcsSUFBSUMseUJBQXlCLENBQUNmLElBQUksRUFBRWMsR0FBRyxDQUFDLENBQUMsQ0FDakRFLEtBQUssQ0FBQ0MsS0FBSyxJQUFJQyxtQkFBbUIsQ0FBQ2xCLElBQUksRUFBRWlCLEtBQUssQ0FBQyxDQUFDO0VBQ3JEO0VBRUEsU0FBU0YseUJBQXlCQSxDQUFDZixJQUFJLEVBQUVtQixZQUFZLEVBQUU7SUFDbkRuQixJQUFJLENBQUNqTCxTQUFTLENBQUNxTSxNQUFNLENBQUMsU0FBUyxDQUFDO0lBQ2hDcEIsSUFBSSxDQUFDQyxPQUFPLENBQUMsZ0NBQWdDLENBQUMsQ0FBQ29CLFNBQVMsR0FBR0YsWUFBWTtFQUMzRTtFQUVBLFNBQVNELG1CQUFtQkEsQ0FBQ2xCLElBQUksRUFBRWlCLEtBQUssRUFBRTtJQUN0Q2xELE9BQU8sQ0FBQ2tELEtBQUssQ0FBQyxRQUFRLEVBQUVBLEtBQUssQ0FBQztJQUM5QmpCLElBQUksQ0FBQ2pMLFNBQVMsQ0FBQ3FNLE1BQU0sQ0FBQyxTQUFTLENBQUM7SUFDaENwQixJQUFJLENBQUNuTSxhQUFhLENBQUMsdUJBQXVCLENBQUMsQ0FBQ3lOLGVBQWUsQ0FBQyxVQUFVLENBQUM7RUFDM0U7RUFFQXJELElBQUksQ0FBQ0MsaUJBQWlCLEdBQUcsWUFBWTtJQUNqQyxNQUFNcUQsV0FBVyxHQUFHN04sUUFBUSxDQUFDRyxhQUFhLENBQUMsNkJBQTZCLENBQUM7SUFDekUsSUFBSSxDQUFDME4sV0FBVyxFQUFFO0lBRWxCLE1BQU1DLGNBQWMsR0FBR0QsV0FBVyxDQUFDMU4sYUFBYSxDQUFDLHlDQUF5QyxDQUFDO0lBQzNGLE1BQU00TixlQUFlLEdBQUdGLFdBQVcsQ0FBQzFOLGFBQWEsQ0FBQywwQ0FBMEMsQ0FBQztJQUM3RixNQUFNNk4sT0FBTyxHQUFHSCxXQUFXLENBQUMxTixhQUFhLENBQUMseUNBQXlDLENBQUM7SUFFcEY4Tix3QkFBd0IsQ0FBQ0gsY0FBYyxFQUFFQyxlQUFlLEVBQUVDLE9BQU8sQ0FBQztFQUN0RSxDQUFDO0VBRUQsU0FBU0Msd0JBQXdCQSxDQUFDSCxjQUFjLEVBQUVDLGVBQWUsRUFBRUMsT0FBTyxFQUFFO0lBQ3hFRixjQUFjLENBQUMxTixnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsTUFBTThOLGFBQWEsQ0FBQ0osY0FBYyxFQUFFRSxPQUFPLENBQUMsQ0FBQztJQUN2RkQsZUFBZSxDQUFDM04sZ0JBQWdCLENBQUMsUUFBUSxFQUFFLE1BQU0rTixxQkFBcUIsQ0FBQ0osZUFBZSxDQUFDLENBQUM7SUFDeEYsSUFBSUMsT0FBTyxFQUFFQSxPQUFPLENBQUM1TixnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsTUFBTWdPLHFCQUFxQixDQUFDSixPQUFPLEVBQUVGLGNBQWMsRUFBRUMsZUFBZSxDQUFDLENBQUM7RUFDMUg7RUFFQSxTQUFTRyxhQUFhQSxDQUFDSixjQUFjLEVBQUVFLE9BQU8sRUFBRTtJQUM1QyxNQUFNeEssUUFBUSxHQUFHc0ssY0FBYyxDQUFDak8sT0FBTyxDQUFDaU8sY0FBYyxDQUFDTyxhQUFhLENBQUM7SUFDckUsTUFBTUMsT0FBTyxHQUFHNUwsSUFBSSxDQUFDQyxLQUFLLENBQUNhLFFBQVEsQ0FBQ25ELE9BQU8sQ0FBQ2lPLE9BQU8sQ0FBQyxDQUFDQyxJQUFJO0lBQ3pELE1BQU1DLFlBQVksR0FBR3hPLFFBQVEsQ0FBQ0csYUFBYSxDQUFDLHdCQUF3QixDQUFDO0lBQ3JFcU8sWUFBWSxDQUFDNUYsU0FBUyxHQUFHMEYsT0FBTyxJQUFJLEVBQUU7SUFFdENHLG1CQUFtQixDQUFDVCxPQUFPLEVBQUV4SyxRQUFRLENBQUNuRCxPQUFPLENBQUNxTyxXQUFXLEtBQUssU0FBUyxDQUFDO0VBQzVFO0VBRUEsU0FBU0QsbUJBQW1CQSxDQUFDVCxPQUFPLEVBQUVXLGFBQWEsRUFBRTtJQUNqRCxJQUFJWCxPQUFPLEVBQUU7TUFDVEEsT0FBTyxDQUFDL0gsUUFBUSxHQUFHMEksYUFBYTtNQUNoQyxJQUFJQSxhQUFhLEVBQUU7UUFDZlgsT0FBTyxDQUFDOUgsT0FBTyxHQUFHLEtBQUs7UUFDdkI4SCxPQUFPLENBQUMvSixhQUFhLENBQUMsSUFBSTJLLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztNQUM5QztJQUNKO0VBQ0o7RUFFQSxTQUFTVCxxQkFBcUJBLENBQUNKLGVBQWUsRUFBRTtJQUM1QyxNQUFNdkssUUFBUSxHQUFHdUssZUFBZSxDQUFDbE8sT0FBTyxDQUFDa08sZUFBZSxDQUFDTSxhQUFhLENBQUM7SUFDdkUsTUFBTUMsT0FBTyxHQUFHNUwsSUFBSSxDQUFDQyxLQUFLLENBQUNhLFFBQVEsQ0FBQ25ELE9BQU8sQ0FBQ2lPLE9BQU8sQ0FBQyxDQUFDQyxJQUFJO0lBQ3pEdk8sUUFBUSxDQUFDRyxhQUFhLENBQUMseUJBQXlCLENBQUMsQ0FBQ3lJLFNBQVMsR0FBRzBGLE9BQU8sSUFBSSxFQUFFO0VBQy9FO0VBRUEsU0FBU0YscUJBQXFCQSxDQUFDSixPQUFPLEVBQUVGLGNBQWMsRUFBRUMsZUFBZSxFQUFFO0lBQ3JFLE1BQU1jLGFBQWEsR0FBRzdPLFFBQVEsQ0FBQ0csYUFBYSxDQUFDLDRCQUE0QixDQUFDO0lBQzFFLE1BQU0yTyx3QkFBd0IsR0FBRzlPLFFBQVEsQ0FBQ0csYUFBYSxDQUFDLGNBQWMsQ0FBQztJQUV2RSxJQUFJNk4sT0FBTyxDQUFDOUgsT0FBTyxFQUFFO01BQ2pCMkksYUFBYSxDQUFDckYsS0FBSyxDQUFDdUYsT0FBTyxHQUFHLE1BQU07TUFDcENoQixlQUFlLENBQUNqTSxLQUFLLEdBQUdnTSxjQUFjLENBQUNoTSxLQUFLO01BQzVDaU0sZUFBZSxDQUFDOUosYUFBYSxDQUFDLElBQUkySyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7TUFDbEQsSUFBSUUsd0JBQXdCLEVBQUVBLHdCQUF3QixDQUFDek4sU0FBUyxDQUFDQyxHQUFHLENBQUMsUUFBUSxDQUFDO0lBQ2xGLENBQUMsTUFBTTtNQUNIdU4sYUFBYSxDQUFDckYsS0FBSyxDQUFDdUYsT0FBTyxHQUFHLEVBQUU7TUFDaEMsSUFBSUQsd0JBQXdCLEVBQUVBLHdCQUF3QixDQUFDek4sU0FBUyxDQUFDcU0sTUFBTSxDQUFDLFFBQVEsQ0FBQztJQUNyRjtFQUNKO0FBRUosQ0FBQyxFQUFDbkQsSUFBSSxDQUFDO0FBRVB2SyxRQUFRLENBQUNJLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLFlBQVk7RUFDdERtSyxJQUFJLENBQUMzQyxJQUFJLENBQUMsQ0FBQztBQUNmLENBQUMsQ0FBQzs7Ozs7Ozs7OztBQ3JNRCxXQUFVb0gsT0FBTyxFQUFFO0VBQ2hCaFAsUUFBUSxDQUFDSSxnQkFBZ0IsQ0FBQyxrQkFBa0IsRUFBRSxZQUFZO0lBQ3REK0IsTUFBTSxDQUFDNkIsWUFBWSxHQUFHLEtBQUs7SUFFM0JnTCxPQUFPLENBQUNwSCxJQUFJLENBQUMsQ0FBQztJQUVkekYsTUFBTSxDQUFDNkIsWUFBWSxHQUFHLElBQUk7RUFDOUIsQ0FBQyxDQUFDO0VBRUZnTCxPQUFPLENBQUNwSCxJQUFJLEdBQUcsWUFBWTtJQUN2QixNQUFNcUgsUUFBUSxHQUFHalAsUUFBUSxDQUFDRyxhQUFhLENBQUMsMkJBQTJCLENBQUM7SUFDcEUsSUFBSSxDQUFDOE8sUUFBUSxFQUFFO01BQ1g7SUFDSjtJQUVBN00sdUJBQXVCLENBQUM2TSxRQUFRLENBQUMsQ0FBQyxDQUFDOztJQUVuQ0EsUUFBUSxDQUFDN08sZ0JBQWdCLENBQUMseUJBQXlCLEVBQUc4TyxDQUFDLElBQUs7TUFDeEQsTUFBTXJQLE9BQU8sR0FBR0csUUFBUSxDQUFDRyxhQUFhLENBQUMseUNBQXlDLENBQUM7TUFFakYsSUFBSU4sT0FBTyxFQUFFO1FBQ1QsTUFBTXNQLE9BQU8sR0FBR3RQLE9BQU8sQ0FBQ0ksZ0JBQWdCLENBQUMsaUJBQWlCLENBQUM7UUFFM0RKLE9BQU8sQ0FBQ3dCLFNBQVMsQ0FBQ0MsR0FBRyxDQUFDLFVBQVUsQ0FBQztRQUVqQzZOLE9BQU8sQ0FBQ3JPLE9BQU8sQ0FBRXNPLE1BQU0sSUFBSztVQUN4QkEsTUFBTSxDQUFDbkosUUFBUSxHQUFHLElBQUk7UUFDMUIsQ0FBQyxDQUFDO01BQ047SUFDSixDQUFDLENBQUM7RUFDTixDQUFDO0FBQ0wsQ0FBQyxFQUFDOUQsTUFBTSxDQUFDNk0sT0FBTyxLQUFLN00sTUFBTSxDQUFDNk0sT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBRSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDL0I3QztBQUMwQjtBQUNDO0FBQzNCO0FBQ21CO0FBQ3FCO0FBQ007QUFDRDtBQUNsQjtBQUNHO0FBQ0o7QUFDb0I7QUFDOUNoUCxRQUFRLENBQUNJLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLFlBQVk7RUFDdEQ7RUFDQSxJQUFJa1AsZ0JBQWdCLEdBQUcsSUFBSUQsdURBQVEsQ0FBQyxDQUFDO0VBQ3JDO0VBQ0FoRixPQUFPLENBQUNDLEdBQUcsQ0FBQ2dGLGdCQUFnQixDQUFDO0FBQ2pDLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNqQjBCO0FBQ1k7QUFDeEMsSUFBSUQsUUFBUSxHQUFHLGFBQWUsWUFBWTtFQUN0QyxTQUFTQSxRQUFRQSxDQUFBLEVBQUc7SUFDaEIsSUFBSSxDQUFDSSxhQUFhLEdBQUcsWUFBWTtNQUM3QjtNQUNBLElBQUlDLGVBQWUsR0FBRyxJQUFJSCw4Q0FBTSxDQUFDLHNCQUFzQixFQUFFO1FBQ3JESSxhQUFhLEVBQUUsQ0FBQztRQUNoQkMsUUFBUSxFQUFFLElBQUk7UUFDZEMsWUFBWSxFQUFFLEtBQUs7UUFDbkJDLG1CQUFtQixFQUFFO01BQ3pCLENBQUMsQ0FBQztNQUNGLElBQUlDLFVBQVUsR0FBRyxJQUFJUiw4Q0FBTSxDQUFDLFlBQVksRUFBRTtRQUN0Q1MsT0FBTyxFQUFFLENBQUNSLGtEQUFNLENBQUM7UUFBRTtRQUNuQlMsVUFBVSxFQUFFO1VBQ1JDLE1BQU0sRUFBRSxxQkFBcUI7VUFDN0JDLE1BQU0sRUFBRTtRQUNaLENBQUM7UUFDREMsTUFBTSxFQUFFO1VBQ0pDLE1BQU0sRUFBRVgsZUFBZSxDQUFDO1FBQzVCO01BQ0osQ0FBQyxDQUFDO01BQ0ZyRixPQUFPLENBQUNDLEdBQUcsQ0FBQ3lGLFVBQVUsQ0FBQztJQUMzQixDQUFDO0lBQ0QsSUFBSSxDQUFDTixhQUFhLENBQUMsQ0FBQztFQUN4QjtFQUNBLE9BQU9KLFFBQVE7QUFDbkIsQ0FBQyxDQUFDLENBQUU7Ozs7Ozs7Ozs7Ozs7QUMzQko7Ozs7Ozs7VUNBQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOztVQUVBO1VBQ0E7Ozs7O1dDekJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsK0JBQStCLHdDQUF3QztXQUN2RTtXQUNBO1dBQ0E7V0FDQTtXQUNBLGlCQUFpQixxQkFBcUI7V0FDdEM7V0FDQTtXQUNBO1dBQ0E7V0FDQSxrQkFBa0IscUJBQXFCO1dBQ3ZDO1dBQ0E7V0FDQSxLQUFLO1dBQ0w7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBOzs7OztXQzdCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsaUNBQWlDLFdBQVc7V0FDNUM7V0FDQTs7Ozs7V0NQQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsR0FBRztXQUNIO1dBQ0E7V0FDQSxDQUFDOzs7OztXQ1BEOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7V0NOQTs7V0FFQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7O1dBRUE7O1dBRUE7O1dBRUE7O1dBRUE7O1dBRUE7O1dBRUE7O1dBRUE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLE1BQU0scUJBQXFCO1dBQzNCO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7O1dBRUE7V0FDQTtXQUNBOzs7OztVRWxEQTtVQUNBO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vLy4vanMvcGx1Z2luL2NvcmVzaG9wLnBsdWdpbi5xdWFudGl0eS5qcyIsIndlYnBhY2s6Ly8vLi9qcy9wbHVnaW4vY29yZXNob3AucGx1Z2luLnZhcmlhbnQuanMiLCJ3ZWJwYWNrOi8vLy4vanMvc2NyaXB0cy9oYW5kbGUtcHJvdG90eXBlcy5qcyIsIndlYnBhY2s6Ly8vLi9qcy9zY3JpcHRzL21hcC5qcyIsIndlYnBhY2s6Ly8vLi9qcy9zY3JpcHRzL3Nob3AuanMiLCJ3ZWJwYWNrOi8vLy4vanMvc2NyaXB0cy92YXJpYW50LmpzIiwid2VicGFjazovLy8uL2pzL2FwcC50cyIsIndlYnBhY2s6Ly8vLi9qcy9zY3JpcHRzL2Nhcm91c2VsLnRzIiwid2VicGFjazovLy8uL3Njc3MvYXBwLnNjc3M/MWI5NiIsIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9jaHVuayBsb2FkZWQiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9nbG9iYWwiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9qc29ucCBjaHVuayBsb2FkaW5nIiwid2VicGFjazovLy93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovLy93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIGNvcmVzaG9wUXVhbnRpdHlTZWxlY3RvcihvcHRpb25zKSB7XG4gICAgICAgIGluaXRRdWFudGl0eUZpZWxkcyhvcHRpb25zKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbml0UXVhbnRpdHlGaWVsZHMob3B0aW9ucykge1xuICAgICAgICBjb25zdCBmaWVsZHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dC5jcy11bml0LWlucHV0Jyk7XG4gICAgICAgIGNvbnN0IHByZWNpc2lvblByZXNldFNlbGVjdG9yID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcignc2VsZWN0LmNzLXVuaXQtc2VsZWN0b3InKTtcblxuICAgICAgICBpZihwcmVjaXNpb25QcmVzZXRTZWxlY3Rvcikge1xuICAgICAgICAgICAgLy8gTGlzdGVuIHRvIHVuaXQgZGVmaW5pdGlvbiBzZWxlY3RvclxuICAgICAgICAgICAgcHJlY2lzaW9uUHJlc2V0U2VsZWN0b3IuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5kYXRhc2V0LmNzVW5pdElkZW50aWZpZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBxdWFudGl0eUlkZW50aWZpZXIgPSB0aGlzLmRhdGFzZXQuY3NVbml0SWRlbnRpZmllcjtcbiAgICAgICAgICAgICAgICBjb25zdCBxdWFudGl0eUlucHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgaW5wdXRbZGF0YS1jcy11bml0LWlkZW50aWZpZXI9XCIke3F1YW50aXR5SWRlbnRpZmllcn1cIl1gKTtcblxuICAgICAgICAgICAgICAgIC8vIFNldCBzdGVwIHRvIDEgb3Igd2hhdGV2ZXIgaW50ZWdlciB2YWx1ZSB5b3Ugd2FudFxuICAgICAgICAgICAgICAgIGNvbnN0IHN0ZXAgPSAxOyAvLyBDaGFuZ2UgdGhpcyBpZiB5b3Ugd2FudCBhIGRpZmZlcmVudCBpbmNyZW1lbnRcblxuICAgICAgICAgICAgICAgIGlmICghcXVhbnRpdHlJbnB1dCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gVXNlIGludGVnZXIgc3RlcCBkaXJlY3RseVxuICAgICAgICAgICAgICAgIHF1YW50aXR5SW5wdXQuc3RlcCA9IHN0ZXA7IC8vIFNldCBzdGVwIGFzIGFuIGludGVnZXJcbiAgICAgICAgICAgICAgICBxdWFudGl0eUlucHV0LmRhdGFzZXQuY3NVbml0UHJlY2lzaW9uID0gMDsgLy8gT3B0aW9uYWwsIHNpbmNlIHByZWNpc2lvbiBpcyBubyBsb25nZXIgcmVsZXZhbnRcblxuICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSBpbnB1dCBzZXR0aW5nc1xuICAgICAgICAgICAgICAgIHVwZGF0ZVRvdWNoU3BpblNldHRpbmdzKHF1YW50aXR5SW5wdXQsIDAsIHN0ZXAudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKGZpZWxkcykge1xuICAgICAgICAgICAgLy8gSW5pdGlhbGl6ZSBxdWFudGl0eSBmaWVsZHMgd2l0aCBpbnRlZ2VyIHN0ZXBcbiAgICAgICAgICAgIGZpZWxkcy5mb3JFYWNoKGZ1bmN0aW9uIChmaWVsZCkge1xuICAgICAgICAgICAgICAgIC8vIFlvdSBtaWdodCBub3QgbmVlZCBwcmVjaXNpb24gYW55bW9yZVxuICAgICAgICAgICAgICAgIGluaXRpYWxpemVUb3VjaFNwaW4oZmllbGQsIDAsICcxJywgb3B0aW9ucyk7IC8vIENoYW5nZSAnMScgdG8geW91ciBkZXNpcmVkIGludGVnZXIgaW5jcmVtZW50XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluaXRpYWxpemVUb3VjaFNwaW4oaW5wdXQsIHByZWNpc2lvbiwgc3RlcCwgb3B0aW9ucykge1xuICAgICAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoJ3RvdWNoc3Bpbi1jb250YWluZXInKTtcblxuICAgICAgICBjb25zdCBkZWNyZW1lbnRCdXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICAgICAgZGVjcmVtZW50QnV0dG9uLnR5cGUgPSAnYnV0dG9uJztcbiAgICAgICAgZGVjcmVtZW50QnV0dG9uLnRleHRDb250ZW50ID0gJy0nO1xuICAgICAgICBkZWNyZW1lbnRCdXR0b24uY2xhc3NMaXN0LmFkZCgndG91Y2hzcGluLWRlY3JlbWVudCcpO1xuXG4gICAgICAgIGNvbnN0IGluY3JlbWVudEJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICBpbmNyZW1lbnRCdXR0b24udHlwZSA9ICdidXR0b24nO1xuICAgICAgICBpbmNyZW1lbnRCdXR0b24udGV4dENvbnRlbnQgPSAnKyc7XG4gICAgICAgIGluY3JlbWVudEJ1dHRvbi5jbGFzc0xpc3QuYWRkKCd0b3VjaHNwaW4taW5jcmVtZW50Jyk7XG5cbiAgICAgICAgaW5wdXQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoY29udGFpbmVyLCBpbnB1dCk7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChkZWNyZW1lbnRCdXR0b24pO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoaW5wdXQpO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoaW5jcmVtZW50QnV0dG9uKTtcblxuICAgICAgICAvLyBTZXQgdXAgZXZlbnQgbGlzdGVuZXJzIGZvciBpbmNyZW1lbnQgYW5kIGRlY3JlbWVudFxuICAgICAgICBkZWNyZW1lbnRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBsZXQgdmFsdWUgPSBwYXJzZUludChpbnB1dC52YWx1ZSkgfHwgMDsgLy8gRW5zdXJlIHZhbHVlIGlzIGFuIGludGVnZXJcbiAgICAgICAgICAgIHZhbHVlIC09IHBhcnNlSW50KHN0ZXApOyAvLyBEZWNyZW1lbnQgYnkgaW50ZWdlciBzdGVwXG4gICAgICAgICAgICBpZiAodmFsdWUgPj0gMCkge1xuICAgICAgICAgICAgICAgIGlucHV0LnZhbHVlID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGluY3JlbWVudEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IHBhcnNlSW50KGlucHV0LnZhbHVlKSB8fCAwOyAvLyBFbnN1cmUgdmFsdWUgaXMgYW4gaW50ZWdlclxuICAgICAgICAgICAgdmFsdWUgKz0gcGFyc2VJbnQoc3RlcCk7IC8vIEluY3JlbWVudCBieSBpbnRlZ2VyIHN0ZXBcbiAgICAgICAgICAgIGlucHV0LnZhbHVlID0gdmFsdWU7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEFkZCBpbnB1dCB2YWxpZGF0aW9uIGJhc2VkIG9uIGludGVnZXIgdmFsdWVcbiAgICAgICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBsZXQgdmFsdWUgPSBwYXJzZUludChpbnB1dC52YWx1ZSk7XG4gICAgICAgICAgICBpZiAoaXNOYU4odmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgaW5wdXQudmFsdWUgPSAwOyAvLyBEZWZhdWx0IHRvIHplcm8gaWYgaW52YWxpZCBpbnB1dFxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpbnB1dC52YWx1ZSA9IHZhbHVlOyAvLyBLZWVwIGl0IGFzIGFuIGludGVnZXJcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlVG91Y2hTcGluU2V0dGluZ3MoaW5wdXQsIHByZWNpc2lvbiwgc3RlcCkge1xuICAgICAgICBpbnB1dC5taW4gPSAwO1xuICAgICAgICBpbnB1dC5tYXggPSAxMDAwMDAwMDAwO1xuICAgICAgICBpbnB1dC5zdGVwID0gc3RlcDtcbiAgICAgICAgaW5wdXQuZGF0YXNldC5jc1VuaXRQcmVjaXNpb24gPSBwcmVjaXNpb247XG4gICAgfVxuXG4gICAgLy8gRXhwb3J0IHRoZSBmdW5jdGlvbiB0byB0aGUgZ2xvYmFsIHNjb3BlXG4gICAgd2luZG93LmNvcmVzaG9wUXVhbnRpdHlTZWxlY3RvciA9IGNvcmVzaG9wUXVhbnRpdHlTZWxlY3Rvcjtcbn0pKCk7XG4iLCIoZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IGNvcmVzaG9wVmFyaWFudFNlbGVjdG9yID0gZnVuY3Rpb24gKGF0dHJpYnV0ZUNvbnRhaW5lcikge1xuICAgICAgICBsZXQgX2F0dHJpYnV0ZUNvbnRhaW5lciA9IG51bGw7XG4gICAgICAgIGxldCBfY29uZmlnID0ge307XG4gICAgICAgIGxldCBfYXR0cmlidXRlR3JvdXBzID0gW107XG5cbiAgICAgICAgY29uc3QgX2luaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoIWF0dHJpYnV0ZUNvbnRhaW5lcikgcmV0dXJuO1xuXG4gICAgICAgICAgICBfYXR0cmlidXRlQ29udGFpbmVyID0gYXR0cmlidXRlQ29udGFpbmVyO1xuICAgICAgICAgICAgX2NvbmZpZyA9IEpTT04ucGFyc2UoX2F0dHJpYnV0ZUNvbnRhaW5lci5kYXRhc2V0LmNvbmZpZyk7XG4gICAgICAgICAgICBfaW5pdGlhbGl6ZUF0dHJpYnV0ZUdyb3VwcygpO1xuICAgICAgICAgICAgX3NldHVwQXR0cmlidXRlR3JvdXBTZXR0aW5ncygpO1xuICAgICAgICAgICAgX3NldHVwQ2hhbmdlRXZlbnRzKCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgX2luaXRpYWxpemVBdHRyaWJ1dGVHcm91cHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfY29uZmlnLmF0dHJpYnV0ZXMuZm9yRWFjaCgoZ3JvdXApID0+IHtcbiAgICAgICAgICAgICAgICBncm91cC5lbGVtZW50cyA9IF9hdHRyaWJ1dGVDb250YWluZXIucXVlcnlTZWxlY3RvckFsbChgW2RhdGEtZ3JvdXA9XCIke2dyb3VwLmdyb3VwLmlkfVwiXWApO1xuICAgICAgICAgICAgICAgIF9hdHRyaWJ1dGVHcm91cHMucHVzaChncm91cCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfc2V0dXBBdHRyaWJ1dGVHcm91cFNldHRpbmdzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX2F0dHJpYnV0ZUdyb3Vwcy5mb3JFYWNoKChncm91cCwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgICBncm91cC5wcmV2R3JvdXAgPSBfYXR0cmlidXRlR3JvdXBzW2luZGV4IC0gMV0gfHwgbnVsbDtcbiAgICAgICAgICAgICAgICBncm91cC5uZXh0R3JvdXAgPSBfYXR0cmlidXRlR3JvdXBzW2luZGV4ICsgMV0gfHwgbnVsbDtcbiAgICAgICAgICAgICAgICBncm91cC5zZWxlY3RlZCA/IF9jb25maWd1cmVHcm91cChncm91cCkgOiBfY2xlYXJHcm91cChncm91cCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfc2V0dXBDaGFuZ2VFdmVudHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfYXR0cmlidXRlR3JvdXBzLmZvckVhY2goKGdyb3VwKSA9PiBfYXR0YWNoQ2hhbmdlRXZlbnQoZ3JvdXApKTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfYXNzaWduT25DaGFuZ2VFdmVudCA9IGZ1bmN0aW9uIChlbGVtZW50LCBncm91cCkge1xuICAgICAgICAgICAgZWxlbWVudC5vbmNoYW5nZSA9ICgpID0+IF9oYW5kbGVFbGVtZW50Q2hhbmdlKGdyb3VwLCBlbGVtZW50KTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfYXR0YWNoQ2hhbmdlRXZlbnQgPSBmdW5jdGlvbiAoZ3JvdXApIHtcbiAgICAgICAgICAgIGdyb3VwLmVsZW1lbnRzLmZvckVhY2goKGVsZW1lbnQpID0+IF9hc3NpZ25PbkNoYW5nZUV2ZW50KGVsZW1lbnQsIGdyb3VwKSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgX2hhbmRsZUVsZW1lbnRDaGFuZ2UgPSBmdW5jdGlvbiAoZ3JvdXAsIGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHdpbmRvdy52YXJpYW50UmVhZHkgPSBmYWxzZTtcbiAgICAgICAgICAgIF9hdHRyaWJ1dGVDb250YWluZXIuZGlzcGF0Y2hFdmVudChfY3JlYXRlRXZlbnQoJ2NoYW5nZScsIHsgZWxlbWVudCB9KSk7XG5cbiAgICAgICAgICAgIGlmIChlbGVtZW50LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgX3NlbGVjdEdyb3VwRWxlbWVudChncm91cCwgZWxlbWVudCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIF9kZXNlbGVjdEdyb3VwRWxlbWVudChncm91cCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHdpbmRvdy52YXJpYW50UmVhZHkgPSB0cnVlO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9zZWxlY3RHcm91cEVsZW1lbnQgPSBmdW5jdGlvbiAoZ3JvdXAsIGVsZW1lbnQpIHtcbiAgICAgICAgICAgIGdyb3VwLnNlbGVjdGVkID0gcGFyc2VJbnQoZWxlbWVudC52YWx1ZSk7XG4gICAgICAgICAgICBfYXR0cmlidXRlQ29udGFpbmVyLmRpc3BhdGNoRXZlbnQoX2NyZWF0ZUV2ZW50KCdzZWxlY3QnLCB7IGVsZW1lbnQgfSkpO1xuXG4gICAgICAgICAgICBpZiAoZ3JvdXAubmV4dEdyb3VwKSB7XG4gICAgICAgICAgICAgICAgX2NsZWFyR3JvdXBzKGdyb3VwLm5leHRHcm91cCk7XG4gICAgICAgICAgICAgICAgX2NvbmZpZ3VyZUdyb3VwKGdyb3VwLm5leHRHcm91cCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIF9hdHRyaWJ1dGVDb250YWluZXIuZGlzcGF0Y2hFdmVudChfY3JlYXRlRXZlbnQoJ3JlZGlyZWN0JywgeyBlbGVtZW50IH0pKTtcbiAgICAgICAgICAgICAgICBfcmVkaXJlY3RUb1ZhcmlhbnQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfZGVzZWxlY3RHcm91cEVsZW1lbnQgPSBmdW5jdGlvbiAoZ3JvdXApIHtcbiAgICAgICAgICAgIGRlbGV0ZSBncm91cC5zZWxlY3RlZDtcbiAgICAgICAgICAgIGlmIChncm91cC5uZXh0R3JvdXApIF9jbGVhckdyb3Vwcyhncm91cC5uZXh0R3JvdXApO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9yZWRpcmVjdFRvVmFyaWFudCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkQXR0cmlidXRlcyA9IF9nZXRTZWxlY3RlZEF0dHJpYnV0ZXMoKTtcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoaW5nUHJvZHVjdCA9IF9maW5kTWF0Y2hpbmdQcm9kdWN0KHNlbGVjdGVkQXR0cmlidXRlcyk7XG5cbiAgICAgICAgICAgIGlmIChtYXRjaGluZ1Byb2R1Y3Q/LnVybCkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gbWF0Y2hpbmdQcm9kdWN0LnVybDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfZ2V0U2VsZWN0ZWRBdHRyaWJ1dGVzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5mcm9tRW50cmllcyhcbiAgICAgICAgICAgICAgICBfYXR0cmlidXRlR3JvdXBzLmZpbHRlcigoZykgPT4gZy5zZWxlY3RlZCkubWFwKChnKSA9PiBbZy5ncm91cC5pZCwgZy5zZWxlY3RlZF0pXG4gICAgICAgICAgICApO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9maW5kTWF0Y2hpbmdQcm9kdWN0ID0gZnVuY3Rpb24gKHNlbGVjdGVkQXR0cmlidXRlcykge1xuICAgICAgICAgICAgcmV0dXJuIE9iamVjdC52YWx1ZXMoX2NvbmZpZy5pbmRleCkuZmluZCgocCkgPT5cbiAgICAgICAgICAgICAgICBKU09OLnN0cmluZ2lmeShwLmF0dHJpYnV0ZXMpID09PSBKU09OLnN0cmluZ2lmeShzZWxlY3RlZEF0dHJpYnV0ZXMpXG4gICAgICAgICAgICApO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9jcmVhdGVFdmVudCA9IGZ1bmN0aW9uIChuYW1lLCBkYXRhID0ge30pIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgQ3VzdG9tRXZlbnQoJ3ZhcmlhbnRfc2VsZWN0b3IuJyArIG5hbWUsIHtcbiAgICAgICAgICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNhbmNlbGFibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGRldGFpbDogZGF0YSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9jbGVhckdyb3VwRWxlbWVudHMgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgZWxlbWVudC5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgICBlbGVtZW50LmNoZWNrZWQgPSBmYWxzZTtcblxuICAgICAgICAgICAgaWYgKGVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnc2VsZWN0JykgX2NsZWFyU2VsZWN0T3B0aW9ucyhlbGVtZW50KTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfY2xlYXJTZWxlY3RPcHRpb25zID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IG9wdGlvbnMgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ29wdGlvbjpub3QoW3ZhbHVlPVwiXCJdKScpO1xuICAgICAgICAgICAgb3B0aW9ucy5mb3JFYWNoKChvcHRpb24pID0+IGVsZW1lbnQucmVtb3ZlQ2hpbGQob3B0aW9uKSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgX2NsZWFyR3JvdXAgPSBmdW5jdGlvbiAoZ3JvdXApIHtcbiAgICAgICAgICAgIGRlbGV0ZSBncm91cC5zZWxlY3RlZDtcbiAgICAgICAgICAgIGdyb3VwLmVsZW1lbnRzLmZvckVhY2goX2NsZWFyR3JvdXBFbGVtZW50cyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgX2NsZWFyR3JvdXBzID0gZnVuY3Rpb24gKGdyb3VwKSB7XG4gICAgICAgICAgICB3aGlsZSAoZ3JvdXApIHtcbiAgICAgICAgICAgICAgICBfY2xlYXJHcm91cChncm91cCk7XG4gICAgICAgICAgICAgICAgZ3JvdXAgPSBncm91cC5uZXh0R3JvdXA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgX2lzUHJvZHVjdE1hdGNoaW5nRmlsdGVycyA9IGZ1bmN0aW9uIChwcm9kdWN0LCBmaWx0ZXJBdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICByZXR1cm4gZmlsdGVyQXR0cmlidXRlcy5ldmVyeSgoZmlsdGVyKSA9PiBfY29uZmlnLmluZGV4W3Byb2R1Y3QuaWRdLmF0dHJpYnV0ZXM/LltmaWx0ZXIuZ3JvdXBdID09PSBmaWx0ZXIuc2VsZWN0ZWQpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9pc0F0dHJpYnV0ZVJlbGV2YW50ID0gZnVuY3Rpb24gKGF0dHJpYnV0ZSwgZmlsdGVyQXR0cmlidXRlcykge1xuICAgICAgICAgICAgcmV0dXJuIGF0dHJpYnV0ZS5wcm9kdWN0cy5zb21lKChwcm9kdWN0KSA9PiBfaXNQcm9kdWN0TWF0Y2hpbmdGaWx0ZXJzKHByb2R1Y3QsIGZpbHRlckF0dHJpYnV0ZXMpKTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfZmlsdGVyQXR0cmlidXRlcyA9IGZ1bmN0aW9uIChhdHRyaWJ1dGVzLCBncm91cCkge1xuICAgICAgICAgICAgY29uc3QgZmlsdGVyQXR0cmlidXRlcyA9IF9nZXRGaWx0ZXJBdHRyaWJ1dGVzKGdyb3VwKTtcbiAgICAgICAgICAgIHJldHVybiBhdHRyaWJ1dGVzLmZpbHRlcigoYXR0cmlidXRlKSA9PiBfaXNBdHRyaWJ1dGVSZWxldmFudChhdHRyaWJ1dGUsIGZpbHRlckF0dHJpYnV0ZXMpKTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfZ2V0RmlsdGVyQXR0cmlidXRlcyA9IGZ1bmN0aW9uIChncm91cCkge1xuICAgICAgICAgICAgY29uc3QgZmlsdGVyQXR0cmlidXRlcyA9IFtdO1xuICAgICAgICAgICAgbGV0IGN1cnJlbnRHcm91cCA9IGdyb3VwLnByZXZHcm91cDtcblxuICAgICAgICAgICAgd2hpbGUgKGN1cnJlbnRHcm91cCkge1xuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50R3JvdXAuc2VsZWN0ZWQgJiYgY3VycmVudEdyb3VwLm5leHRHcm91cCkge1xuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJBdHRyaWJ1dGVzLnB1c2goeyBncm91cDogY3VycmVudEdyb3VwLmdyb3VwLmlkLCBzZWxlY3RlZDogY3VycmVudEdyb3VwLnNlbGVjdGVkIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjdXJyZW50R3JvdXAgPSBjdXJyZW50R3JvdXAucHJldkdyb3VwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZmlsdGVyQXR0cmlidXRlcztcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfYWRkT3B0aW9uVG9TZWxlY3QgPSBmdW5jdGlvbiAoZWxlbWVudCwgYXR0cmlidXRlLCBncm91cCkge1xuICAgICAgICAgICAgY29uc3Qgb3B0aW9uID0gbmV3IE9wdGlvbihhdHRyaWJ1dGUuYXR0cmlidXRlLm5hbWUsIGF0dHJpYnV0ZS5hdHRyaWJ1dGUuaWQpO1xuICAgICAgICAgICAgb3B0aW9uLmlkID0gJ2F0dHJpYnV0ZS0nICsgYXR0cmlidXRlLmF0dHJpYnV0ZS5pZDtcbiAgICAgICAgICAgIGlmIChncm91cC5zZWxlY3RlZCA9PT0gYXR0cmlidXRlLmF0dHJpYnV0ZS5pZCkgb3B0aW9uLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGVsZW1lbnQuYWRkKG9wdGlvbik7XG4gICAgICAgICAgICBlbGVtZW50LmRpc2FibGVkID0gZmFsc2U7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgX2VuYWJsZUVsZW1lbnRGb3JBdHRyaWJ1dGUgPSBmdW5jdGlvbiAoZWxlbWVudCwgYXR0cmlidXRlLCBncm91cCkge1xuICAgICAgICAgICAgaWYgKHBhcnNlSW50KGVsZW1lbnQuZGF0YXNldC5ncm91cCkgPT09IGdyb3VwLmdyb3VwLmlkICYmIHBhcnNlSW50KGVsZW1lbnQudmFsdWUpID09PSBhdHRyaWJ1dGUuYXR0cmlidXRlLmlkKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5kaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmIChncm91cC5zZWxlY3RlZCA9PT0gYXR0cmlidXRlLmF0dHJpYnV0ZS5pZCkgZWxlbWVudC5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfY29uZmlndXJlR3JvdXBFbGVtZW50cyA9IGZ1bmN0aW9uIChncm91cCwgYXR0cmlidXRlcykge1xuICAgICAgICAgICAgZ3JvdXAuZWxlbWVudHMuZm9yRWFjaCgoZWxlbWVudCkgPT5cbiAgICAgICAgICAgICAgICBfY29uZmlndXJlRWxlbWVudChlbGVtZW50LCBhdHRyaWJ1dGVzLCBncm91cClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgX2NvbmZpZ3VyZUVsZW1lbnQgPSBmdW5jdGlvbiAoZWxlbWVudCwgYXR0cmlidXRlcywgZ3JvdXApIHtcbiAgICAgICAgICAgIGlmIChlbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ3NlbGVjdCcpIHtcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLmZvckVhY2goKGF0dHJpYnV0ZSkgPT4gX2FkZE9wdGlvblRvU2VsZWN0KGVsZW1lbnQsIGF0dHJpYnV0ZSwgZ3JvdXApKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYXR0cmlidXRlcy5mb3JFYWNoKChhdHRyaWJ1dGUpID0+IF9lbmFibGVFbGVtZW50Rm9yQXR0cmlidXRlKGVsZW1lbnQsIGF0dHJpYnV0ZSwgZ3JvdXApKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfY29uZmlndXJlR3JvdXAgPSBmdW5jdGlvbiAoZ3JvdXApIHtcbiAgICAgICAgICAgIGNvbnN0IGZpbHRlcmVkQXR0cmlidXRlcyA9IF9maWx0ZXJBdHRyaWJ1dGVzKGdyb3VwLmF0dHJpYnV0ZXMuc2xpY2UoKSwgZ3JvdXApIHx8IGdyb3VwLmF0dHJpYnV0ZXM7XG4gICAgICAgICAgICBfY29uZmlndXJlR3JvdXBFbGVtZW50cyhncm91cCwgZmlsdGVyZWRBdHRyaWJ1dGVzKTtcbiAgICAgICAgfTtcblxuICAgICAgICBfaW5pdCgpO1xuICAgIH07XG5cbiAgICB3aW5kb3cuY29yZXNob3BWYXJpYW50U2VsZWN0b3IgPSBjb3Jlc2hvcFZhcmlhbnRTZWxlY3Rvcjtcbn0pKCk7XG4iLCIoZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIGNvbnN0IG1ldGhvZHMgPSB7XG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICAgICAgICBjb25zdCBzZXR0aW5ncyA9IHtcbiAgICAgICAgICAgICAgICBwcm90b3R5cGVQcmVmaXg6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNvbnRhaW5lclNlbGVjdG9yOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBzZWxlY3RvckF0dHI6IGZhbHNlLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnMgLy8gVXNpbmcgb2JqZWN0IHNwcmVhZCBoZXJlXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjb25zdCBlbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5zZWxlY3Rvcik7XG4gICAgICAgICAgICBlbGVtZW50cy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvdyhlbGVtZW50LCBzZXR0aW5ncywgZmFsc2UpO1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3coZWxlbWVudCwgc2V0dGluZ3MsIHRydWUpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2hvdzogZnVuY3Rpb24gKGVsZW1lbnQsIHNldHRpbmdzLCByZXBsYWNlKSB7XG4gICAgICAgICAgICBsZXQgc2VsZWN0ZWRWYWx1ZSA9IGVsZW1lbnQudmFsdWU7XG4gICAgICAgICAgICBsZXQgcHJvdG90eXBlUHJlZml4ID0gZWxlbWVudC5pZDtcblxuICAgICAgICAgICAgaWYgKHNldHRpbmdzLnNlbGVjdG9yQXR0cikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkT3B0aW9uID0gQXJyYXkuZnJvbShlbGVtZW50Lm9wdGlvbnMpLmZpbmQob3B0aW9uID0+IG9wdGlvbi52YWx1ZSA9PT0gc2VsZWN0ZWRWYWx1ZSk7XG4gICAgICAgICAgICAgICAgaWYgKHNlbGVjdGVkT3B0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkVmFsdWUgPSBzZWxlY3RlZE9wdGlvbi5nZXRBdHRyaWJ1dGUoc2V0dGluZ3Muc2VsZWN0b3JBdHRyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChzZXR0aW5ncy5wcm90b3R5cGVQcmVmaXgpIHtcbiAgICAgICAgICAgICAgICBwcm90b3R5cGVQcmVmaXggPSBzZXR0aW5ncy5wcm90b3R5cGVQcmVmaXg7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHByb3RvdHlwZUVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgJHtwcm90b3R5cGVQcmVmaXh9XyR7c2VsZWN0ZWRWYWx1ZX1gKTtcbiAgICAgICAgICAgIGxldCBjb250YWluZXIgPSB0aGlzLmdldENvbnRhaW5lcihzZXR0aW5ncywgcHJvdG90eXBlRWxlbWVudCk7XG5cbiAgICAgICAgICAgIGlmICghY29udGFpbmVyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIXByb3RvdHlwZUVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBjb250YWluZXIuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocmVwbGFjZSB8fCAhY29udGFpbmVyLmlubmVySFRNTC50cmltKCkpIHtcbiAgICAgICAgICAgICAgICBjb250YWluZXIuaW5uZXJIVE1MID0gcHJvdG90eXBlRWxlbWVudC5kYXRhc2V0LnByb3RvdHlwZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBnZXRDb250YWluZXI6IGZ1bmN0aW9uIChzZXR0aW5ncywgcHJvdG90eXBlRWxlbWVudCkge1xuICAgICAgICAgICAgaWYgKHNldHRpbmdzLmNvbnRhaW5lclNlbGVjdG9yKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2V0dGluZ3MuY29udGFpbmVyU2VsZWN0b3IpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBkYXRhQ29udGFpbmVySWQgPSBwcm90b3R5cGVFbGVtZW50ID8gcHJvdG90eXBlRWxlbWVudC5kYXRhc2V0LmNvbnRhaW5lciA6IG51bGw7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGRhdGFDb250YWluZXJJZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gRXh0ZW5kaW5nIHRoZSBwcm90b3R5cGUgb2YgTm9kZUxpc3RcbiAgICBOb2RlTGlzdC5wcm90b3R5cGUuaGFuZGxlUHJvdG90eXBlcyA9IGZ1bmN0aW9uIChtZXRob2QpIHtcbiAgICAgICAgaWYgKG1ldGhvZHNbbWV0aG9kXSkge1xuICAgICAgICAgICAgcmV0dXJuIG1ldGhvZHNbbWV0aG9kXS5hcHBseSh0aGlzLCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgbWV0aG9kID09PSAnb2JqZWN0JyB8fCAhbWV0aG9kKSB7XG4gICAgICAgICAgICByZXR1cm4gbWV0aG9kcy5pbml0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ01ldGhvZCAnICsgbWV0aG9kICsgJyBkb2VzIG5vdCBleGlzdCBvbiBoYW5kbGVQcm90b3R5cGVzJyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gVG8gYWxsb3cgY2FsbGluZyBoYW5kbGVQcm90b3R5cGVzIGRpcmVjdGx5IG9uIGFueSBlbGVtZW50XG4gICAgSFRNTEVsZW1lbnQucHJvdG90eXBlLmhhbmRsZVByb3RvdHlwZXMgPSBmdW5jdGlvbiAobWV0aG9kKSB7XG4gICAgICAgIHJldHVybiBtZXRob2RzLmhhbmRsZVByb3RvdHlwZXMuY2FsbChbdGhpc10sIG1ldGhvZCk7XG4gICAgfTtcblxufSgpKTtcbiIsImRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgbWFwQmxvY2sgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFwLWJsb2NrJyk7XG5cbiAgICBpZiAobWFwQmxvY2spIHtcbiAgICAgICAgbWFwQmxvY2suc3R5bGUuaGVpZ2h0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hcC13cmFwcGVyJykuY2xpZW50SGVpZ2h0ICsgJ3B4JztcblxuICAgICAgICBmdW5jdGlvbiBpbml0aWFsaXplKCkge1xuICAgICAgICAgICAgY29uc3QgbWFwT3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICB6b29tOiAxOCxcbiAgICAgICAgICAgICAgICBjZW50ZXI6IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoNDguMTU5MjUxMywgMTQuMDIzMDI1MTAwMDAwMDQpLFxuICAgICAgICAgICAgICAgIGRpc2FibGVEZWZhdWx0VUk6IHRydWVcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zdCBtYXBOZXcgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKG1hcEJsb2NrLCBtYXBPcHRpb25zKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKG1hcE5ldyk7XG4gICAgICAgIH1cblxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGluaXRpYWxpemUpO1xuICAgIH1cbn0pO1xuIiwiY29uc3Qgc2hvcCA9IHdpbmRvdy5zaG9wIHx8IHt9O1xuXG4oZnVuY3Rpb24gKHNob3ApIHtcbiAgICBzaG9wLmluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNob3AuaW5pdENoYW5nZUFkZHJlc3MoKTtcbiAgICAgICAgc2hvcC5pbml0Q2FydFNoaXBtZW50Q2FsY3VsYXRvcigpO1xuICAgICAgICBzaG9wLmluaXRRdWFudGl0eVZhbGlkYXRvcigpO1xuICAgICAgICBzaG9wLmluaXRDYXRlZ29yeVNlbGVjdCgpO1xuXG4gICAgICAgIGhhbmRsZVByb3RvdHlwZXMoe1xuICAgICAgICAgICAgJ3Byb3RvdHlwZVByZWZpeCc6ICdwYXltZW50UHJvdmlkZXInLFxuICAgICAgICAgICAgJ2NvbnRhaW5lclNlbGVjdG9yJzogJy5wYXltZW50U2V0dGluZ3MnLFxuICAgICAgICAgICAgJ3NlbGVjdG9yQXR0cic6ICdkYXRhLWZhY3RvcnknXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHNldHVwQ29weVRvQ2xpcGJvYXJkKCk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGhhbmRsZVByb3RvdHlwZXMob3B0aW9ucykge1xuICAgICAgICBjb25zdCBzZXR0aW5ncyA9IHtcbiAgICAgICAgICAgIHByb3RvdHlwZVByZWZpeDogb3B0aW9ucy5wcm90b3R5cGVQcmVmaXggfHwgZmFsc2UsXG4gICAgICAgICAgICBjb250YWluZXJTZWxlY3Rvcjogb3B0aW9ucy5jb250YWluZXJTZWxlY3RvciB8fCBmYWxzZSxcbiAgICAgICAgICAgIHNlbGVjdG9yQXR0cjogb3B0aW9ucy5zZWxlY3RvckF0dHIgfHwgZmFsc2VcbiAgICAgICAgfTtcblxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGBbZGF0YS0ke3NldHRpbmdzLnByb3RvdHlwZVByZWZpeH1dYCkuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgc2hvd0VsZW1lbnQoZWxlbWVudCwgZmFsc2UpO1xuICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgc2hvd0VsZW1lbnQoZWxlbWVudCwgdHJ1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZnVuY3Rpb24gc2hvd0VsZW1lbnQoZWxlbWVudCwgcmVwbGFjZSkge1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRWYWx1ZSA9IGdldFNlbGVjdGVkVmFsdWUoZWxlbWVudCk7XG4gICAgICAgICAgICBjb25zdCBwcm90b3R5cGVQcmVmaXggPSBzZXR0aW5ncy5wcm90b3R5cGVQcmVmaXggfHwgZWxlbWVudC5pZDtcbiAgICAgICAgICAgIGNvbnN0IHByb3RvdHlwZUVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgJHtwcm90b3R5cGVQcmVmaXh9XyR7c2VsZWN0ZWRWYWx1ZX1gKTtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRhaW5lciA9IGdldENvbnRhaW5lcihwcm90b3R5cGVFbGVtZW50KTtcblxuICAgICAgICAgICAgaWYgKGNvbnRhaW5lciAmJiAocmVwbGFjZSB8fCAhY29udGFpbmVyLmlubmVySFRNTC50cmltKCkpKSB7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyLmlubmVySFRNTCA9IHByb3RvdHlwZUVsZW1lbnQgPyBwcm90b3R5cGVFbGVtZW50LmRhdGFzZXQucHJvdG90eXBlIDogJyc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBnZXRTZWxlY3RlZFZhbHVlKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIGlmIChzZXR0aW5ncy5zZWxlY3RvckF0dHIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZWxlbWVudC5xdWVyeVNlbGVjdG9yKGBbdmFsdWU9XCIke2VsZW1lbnQudmFsdWV9XCJdYCkuZ2V0QXR0cmlidXRlKHNldHRpbmdzLnNlbGVjdG9yQXR0cik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudC52YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGdldENvbnRhaW5lcihwcm90b3R5cGVFbGVtZW50KSB7XG4gICAgICAgICAgICBpZiAoc2V0dGluZ3MuY29udGFpbmVyU2VsZWN0b3IpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZXR0aW5ncy5jb250YWluZXJTZWxlY3Rvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvdG90eXBlRWxlbWVudCA/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IocHJvdG90eXBlRWxlbWVudC5kYXRhc2V0LmNvbnRhaW5lcikgOiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2V0dXBDb3B5VG9DbGlwYm9hcmQoKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jb3B5LXRvLWNsaXBib2FyZCcpLmZvckVhY2goZnVuY3Rpb24gKGJ1dHRvbikge1xuICAgICAgICAgICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgY29weVRleHRUb0NsaXBib2FyZCh0aGlzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjb3B5VGV4dFRvQ2xpcGJvYXJkKGJ1dHRvbikge1xuICAgICAgICBjb25zdCB0YXJnZXRJZCA9IGJ1dHRvbi5kYXRhc2V0LnRhcmdldDtcbiAgICAgICAgY29uc3QgY29weVRleHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0YXJnZXRJZCk7XG5cbiAgICAgICAgaWYgKGNvcHlUZXh0KSB7XG4gICAgICAgICAgICBjb3B5VGV4dC5zZWxlY3QoKTtcbiAgICAgICAgICAgIGNvcHlUZXh0LnNldFNlbGVjdGlvblJhbmdlKDAsIDk5OTk5KTsgLy8gRm9yIG1vYmlsZSBkZXZpY2VzXG5cbiAgICAgICAgICAgIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KGNvcHlUZXh0LnZhbHVlKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhidXR0b24uZGF0YXNldC5jb3BpZWRUZXh0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2hvcC5pbml0Q2F0ZWdvcnlTZWxlY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuc2l0ZS1yZWxvYWRcIikuZm9yRWFjaChmdW5jdGlvbiAoc2VsZWN0KSB7XG4gICAgICAgICAgICBzZWxlY3QuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgbG9jYXRpb24uaHJlZiA9IHVwZGF0ZVF1ZXJ5U3RyaW5nUGFyYW1ldGVyKHdpbmRvdy5sb2NhdGlvbi5ocmVmLCB0aGlzLm5hbWUsIHRoaXMudmFsdWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiB1cGRhdGVRdWVyeVN0cmluZ1BhcmFtZXRlcih1cmksIGtleSwgdmFsdWUpIHtcbiAgICAgICAgY29uc3QgcmUgPSBuZXcgUmVnRXhwKFwiKFs/Jl0pXCIgKyBrZXkgKyBcIj0uKj8oJnwkKVwiLCBcImlcIik7XG4gICAgICAgIGNvbnN0IHNlcGFyYXRvciA9IHVyaS5pbmRleE9mKCc/JykgIT09IC0xID8gXCImXCIgOiBcIj9cIjtcbiAgICAgICAgcmV0dXJuIHVyaS5tYXRjaChyZSkgPyB1cmkucmVwbGFjZShyZSwgJyQxJyArIGtleSArIFwiPVwiICsgdmFsdWUgKyAnJDInKSA6IHVyaSArIHNlcGFyYXRvciArIGtleSArIFwiPVwiICsgdmFsdWU7XG4gICAgfVxuXG4gICAgc2hvcC5pbml0UXVhbnRpdHlWYWxpZGF0b3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNvcmVzaG9wUXVhbnRpdHlTZWxlY3Rvcih7XG4gICAgICAgICAgICBidXR0b25kb3duX2NsYXNzOiAnYnRuIGJ0bi1zZWNvbmRhcnknLFxuICAgICAgICAgICAgYnV0dG9udXBfY2xhc3M6ICdidG4gYnRuLXNlY29uZGFyeScsXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBzaG9wLmluaXRDYXJ0U2hpcG1lbnRDYWxjdWxhdG9yID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIGNvbnN0IGZvcm0gPSBldi50YXJnZXQuY2xvc2VzdCgnZm9ybVtuYW1lPVwiY29yZXNob3Bfc2hpcHBpbmdfY2FsY3VsYXRvclwiXScpO1xuICAgICAgICAgICAgaWYgKGZvcm0pIHtcbiAgICAgICAgICAgICAgICBoYW5kbGVTaGlwbWVudENhbGN1bGF0aW9uKGZvcm0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gaGFuZGxlU2hpcG1lbnRDYWxjdWxhdGlvbihmb3JtKSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGZvcm0uY2xhc3NMaXN0LmFkZCgnbG9hZGluZycpO1xuICAgICAgICBmb3JtLnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvblt0eXBlPVwic3VibWl0XCJdJykuc2V0QXR0cmlidXRlKCdkaXNhYmxlZCcsICdkaXNhYmxlZCcpO1xuICAgICAgICBmb3JtLmNsb3Nlc3QoJy5jYXJ0LXNoaXBtZW50LWNhbGN1bGF0aW9uLWJveCcpLnF1ZXJ5U2VsZWN0b3IoJy5jYXJ0LXNoaXBtZW50LWF2YWlsYWJsZS1jYXJyaWVycycpLnN0eWxlLm9wYWNpdHkgPSAwLjI7XG5cbiAgICAgICAgZmV0Y2goZm9ybS5hY3Rpb24sIHtcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgYm9keTogbmV3IFVSTFNlYXJjaFBhcmFtcyhuZXcgRm9ybURhdGEoZm9ybSkpXG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlLnRleHQoKSlcbiAgICAgICAgLnRoZW4ocmVzID0+IHVwZGF0ZVNoaXBtZW50Q2FsY3VsYXRpb24oZm9ybSwgcmVzKSlcbiAgICAgICAgLmNhdGNoKGVycm9yID0+IGhhbmRsZVNoaXBtZW50RXJyb3IoZm9ybSwgZXJyb3IpKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1cGRhdGVTaGlwbWVudENhbGN1bGF0aW9uKGZvcm0sIHJlc3BvbnNlVGV4dCkge1xuICAgICAgICBmb3JtLmNsYXNzTGlzdC5yZW1vdmUoJ2xvYWRpbmcnKTtcbiAgICAgICAgZm9ybS5jbG9zZXN0KCcuY2FydC1zaGlwbWVudC1jYWxjdWxhdGlvbi1ib3gnKS5vdXRlckhUTUwgPSByZXNwb25zZVRleHQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaGFuZGxlU2hpcG1lbnRFcnJvcihmb3JtLCBlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvcjonLCBlcnJvcik7XG4gICAgICAgIGZvcm0uY2xhc3NMaXN0LnJlbW92ZSgnbG9hZGluZycpO1xuICAgICAgICBmb3JtLnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvblt0eXBlPVwic3VibWl0XCJdJykucmVtb3ZlQXR0cmlidXRlKCdkaXNhYmxlZCcpO1xuICAgIH1cblxuICAgIHNob3AuaW5pdENoYW5nZUFkZHJlc3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNvbnN0IGFkZHJlc3NTdGVwID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNoZWNrb3V0LXN0ZXAuc3RlcC1hZGRyZXNzJyk7XG4gICAgICAgIGlmICghYWRkcmVzc1N0ZXApIHJldHVybjtcblxuICAgICAgICBjb25zdCBpbnZvaWNlQWRkcmVzcyA9IGFkZHJlc3NTdGVwLnF1ZXJ5U2VsZWN0b3IoJ3NlbGVjdFtuYW1lPVwiY29yZXNob3BbaW52b2ljZUFkZHJlc3NdXCJdJyk7XG4gICAgICAgIGNvbnN0IHNoaXBwaW5nQWRkcmVzcyA9IGFkZHJlc3NTdGVwLnF1ZXJ5U2VsZWN0b3IoJ3NlbGVjdFtuYW1lPVwiY29yZXNob3Bbc2hpcHBpbmdBZGRyZXNzXVwiXScpO1xuICAgICAgICBjb25zdCB1c2VJYXNTID0gYWRkcmVzc1N0ZXAucXVlcnlTZWxlY3RvcignW25hbWU9XCJjb3Jlc2hvcFt1c2VJbnZvaWNlQXNTaGlwcGluZ11cIl0nKTtcblxuICAgICAgICBzZXR1cEFkZHJlc3NDaGFuZ2VFdmVudHMoaW52b2ljZUFkZHJlc3MsIHNoaXBwaW5nQWRkcmVzcywgdXNlSWFzUyk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIHNldHVwQWRkcmVzc0NoYW5nZUV2ZW50cyhpbnZvaWNlQWRkcmVzcywgc2hpcHBpbmdBZGRyZXNzLCB1c2VJYXNTKSB7XG4gICAgICAgIGludm9pY2VBZGRyZXNzLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHVwZGF0ZUFkZHJlc3MoaW52b2ljZUFkZHJlc3MsIHVzZUlhc1MpKTtcbiAgICAgICAgc2hpcHBpbmdBZGRyZXNzLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHVwZGF0ZVNoaXBwaW5nQWRkcmVzcyhzaGlwcGluZ0FkZHJlc3MpKTtcbiAgICAgICAgaWYgKHVzZUlhc1MpIHVzZUlhc1MuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4gdG9nZ2xlU2hpcHBpbmdBZGRyZXNzKHVzZUlhc1MsIGludm9pY2VBZGRyZXNzLCBzaGlwcGluZ0FkZHJlc3MpKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1cGRhdGVBZGRyZXNzKGludm9pY2VBZGRyZXNzLCB1c2VJYXNTKSB7XG4gICAgICAgIGNvbnN0IHNlbGVjdGVkID0gaW52b2ljZUFkZHJlc3Mub3B0aW9uc1tpbnZvaWNlQWRkcmVzcy5zZWxlY3RlZEluZGV4XTtcbiAgICAgICAgY29uc3QgYWRkcmVzcyA9IEpTT04ucGFyc2Uoc2VsZWN0ZWQuZGF0YXNldC5hZGRyZXNzKS5odG1sO1xuICAgICAgICBjb25zdCBpbnZvaWNlUGFuZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucGFuZWwtaW52b2ljZS1hZGRyZXNzJyk7XG4gICAgICAgIGludm9pY2VQYW5lbC5pbm5lckhUTUwgPSBhZGRyZXNzIHx8ICcnO1xuXG4gICAgICAgIHRvZ2dsZVVzZUFzU2hpcHBpbmcodXNlSWFzUywgc2VsZWN0ZWQuZGF0YXNldC5hZGRyZXNzVHlwZSA9PT0gJ2ludm9pY2UnKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0b2dnbGVVc2VBc1NoaXBwaW5nKHVzZUlhc1MsIGlzSW52b2ljZVR5cGUpIHtcbiAgICAgICAgaWYgKHVzZUlhc1MpIHtcbiAgICAgICAgICAgIHVzZUlhc1MuZGlzYWJsZWQgPSBpc0ludm9pY2VUeXBlO1xuICAgICAgICAgICAgaWYgKGlzSW52b2ljZVR5cGUpIHtcbiAgICAgICAgICAgICAgICB1c2VJYXNTLmNoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB1c2VJYXNTLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdjaGFuZ2UnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1cGRhdGVTaGlwcGluZ0FkZHJlc3Moc2hpcHBpbmdBZGRyZXNzKSB7XG4gICAgICAgIGNvbnN0IHNlbGVjdGVkID0gc2hpcHBpbmdBZGRyZXNzLm9wdGlvbnNbc2hpcHBpbmdBZGRyZXNzLnNlbGVjdGVkSW5kZXhdO1xuICAgICAgICBjb25zdCBhZGRyZXNzID0gSlNPTi5wYXJzZShzZWxlY3RlZC5kYXRhc2V0LmFkZHJlc3MpLmh0bWw7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wYW5lbC1zaGlwcGluZy1hZGRyZXNzJykuaW5uZXJIVE1MID0gYWRkcmVzcyB8fCAnJztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0b2dnbGVTaGlwcGluZ0FkZHJlc3ModXNlSWFzUywgaW52b2ljZUFkZHJlc3MsIHNoaXBwaW5nQWRkcmVzcykge1xuICAgICAgICBjb25zdCBzaGlwcGluZ0ZpZWxkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNoaXBwaW5nLWFkZHJlc3Mtc2VsZWN0b3InKTtcbiAgICAgICAgY29uc3Qgc2hpcHBpbmdBZGRBZGRyZXNzQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNhcmQtZm9vdGVyJyk7XG5cbiAgICAgICAgaWYgKHVzZUlhc1MuY2hlY2tlZCkge1xuICAgICAgICAgICAgc2hpcHBpbmdGaWVsZC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgc2hpcHBpbmdBZGRyZXNzLnZhbHVlID0gaW52b2ljZUFkZHJlc3MudmFsdWU7XG4gICAgICAgICAgICBzaGlwcGluZ0FkZHJlc3MuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2NoYW5nZScpKTtcbiAgICAgICAgICAgIGlmIChzaGlwcGluZ0FkZEFkZHJlc3NCdXR0b24pIHNoaXBwaW5nQWRkQWRkcmVzc0J1dHRvbi5jbGFzc0xpc3QuYWRkKCdkLW5vbmUnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNoaXBwaW5nRmllbGQuc3R5bGUuZGlzcGxheSA9ICcnO1xuICAgICAgICAgICAgaWYgKHNoaXBwaW5nQWRkQWRkcmVzc0J1dHRvbikgc2hpcHBpbmdBZGRBZGRyZXNzQnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoJ2Qtbm9uZScpO1xuICAgICAgICB9XG4gICAgfVxuXG59KHNob3ApKTtcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uICgpIHtcbiAgICBzaG9wLmluaXQoKTtcbn0pO1xuIiwiKGZ1bmN0aW9uICh2YXJpYW50KSB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgd2luZG93LnZhcmlhbnRSZWFkeSA9IGZhbHNlO1xuXG4gICAgICAgIHZhcmlhbnQuaW5pdCgpO1xuXG4gICAgICAgIHdpbmRvdy52YXJpYW50UmVhZHkgPSB0cnVlO1xuICAgIH0pO1xuXG4gICAgdmFyaWFudC5pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zdCB2YXJpYW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wcm9kdWN0LWluZm9fX2F0dHJpYnV0ZXMnKTtcbiAgICAgICAgaWYgKCF2YXJpYW50cykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29yZXNob3BWYXJpYW50U2VsZWN0b3IodmFyaWFudHMpOyAvLyBFbnN1cmUgdGhpcyBmdW5jdGlvbiBpcyBkZWZpbmVkIGluIHlvdXIgZ2xvYmFsIHNjb3BlXG5cbiAgICAgICAgdmFyaWFudHMuYWRkRXZlbnRMaXN0ZW5lcigndmFyaWFudF9zZWxlY3Rvci5zZWxlY3QnLCAoZSkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgb3B0aW9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wcm9kdWN0LWluZm8gLnByb2R1Y3QtZGV0YWlscyAub3B0aW9ucycpO1xuXG4gICAgICAgICAgICBpZiAob3B0aW9ucykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN1Ym1pdHMgPSBvcHRpb25zLnF1ZXJ5U2VsZWN0b3JBbGwoJ1t0eXBlPVwic3VibWl0XCJdJyk7XG5cbiAgICAgICAgICAgICAgICBvcHRpb25zLmNsYXNzTGlzdC5hZGQoJ2Rpc2FibGVkJyk7XG5cbiAgICAgICAgICAgICAgICBzdWJtaXRzLmZvckVhY2goKHN1Ym1pdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBzdWJtaXQuZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xufSh3aW5kb3cudmFyaWFudCB8fCAod2luZG93LnZhcmlhbnQgPSB7fSkpKTsgLy8gRXh0cmFjdGVkIGFzc2lnbm1lbnRcbiIsIi8qIFNUWUxFUyAgKi9cbmltcG9ydCAnLi4vc2Nzcy9hcHAuc2Nzcyc7XG5pbXBvcnQgJ3N3aXBlci9jc3MvYnVuZGxlJztcbi8qIEpTICovXG5pbXBvcnQgJ2Jvb3RzdHJhcCc7XG5pbXBvcnQgJy4vc2NyaXB0cy9oYW5kbGUtcHJvdG90eXBlcy5qcyc7XG5pbXBvcnQgJy4vcGx1Z2luL2NvcmVzaG9wLnBsdWdpbi5xdWFudGl0eS5qcyc7XG5pbXBvcnQgJy4vcGx1Z2luL2NvcmVzaG9wLnBsdWdpbi52YXJpYW50LmpzJztcbmltcG9ydCAnLi9zY3JpcHRzL3Nob3AuanMnO1xuaW1wb3J0ICcuL3NjcmlwdHMvdmFyaWFudC5qcyc7XG5pbXBvcnQgJy4vc2NyaXB0cy9tYXAuanMnO1xuaW1wb3J0IHsgQ2Fyb3VzZWwgfSBmcm9tICcuL3NjcmlwdHMvY2Fyb3VzZWwnO1xuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAvLyBjb25zdCBDYXJ0V2lkZ2V0ID0gbmV3IENhcnRJbmZvKCcvY29yZXNob3BfZ2V0X2NhcnRfaXRlbXMnLCAnLmpzLWNhcnQtd2lkZ2V0Jyk7XG4gICAgdmFyIENhcm91c2VsUHJvZHVjdHMgPSBuZXcgQ2Fyb3VzZWwoKTtcbiAgICAvL2NvbnNvbGUubG9nKENhcnRXaWRnZXQpO1xuICAgIGNvbnNvbGUubG9nKENhcm91c2VsUHJvZHVjdHMpO1xufSk7XG4iLCJpbXBvcnQgU3dpcGVyIGZyb20gJ3N3aXBlcic7XG5pbXBvcnQgeyBUaHVtYnMgfSBmcm9tIFwic3dpcGVyL21vZHVsZXNcIjtcbnZhciBDYXJvdXNlbCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBDYXJvdXNlbCgpIHtcbiAgICAgICAgdGhpcy5faW5pdENhcm91c2VsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLyogSW5pdCBzd2lwZXIgd2l0aCB0aHVtYnMgKi9cbiAgICAgICAgICAgIHZhciBzbGlkZXJUaHVtYm5haWwgPSBuZXcgU3dpcGVyKCcuanMtc2xpZGVyLXRodW1ibmFpbCcsIHtcbiAgICAgICAgICAgICAgICBzbGlkZXNQZXJWaWV3OiAzLFxuICAgICAgICAgICAgICAgIGZyZWVNb2RlOiB0cnVlLFxuICAgICAgICAgICAgICAgIHNwYWNlQmV0d2VlbjogJzhweCcsXG4gICAgICAgICAgICAgICAgd2F0Y2hTbGlkZXNQcm9ncmVzczogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIG1haW5TbGlkZXIgPSBuZXcgU3dpcGVyKCcuanMtc2xpZGVyJywge1xuICAgICAgICAgICAgICAgIG1vZHVsZXM6IFtUaHVtYnNdLCAvLyBJbmNsdWRlIHRoZSBUaHVtYnMgbW9kdWxlXG4gICAgICAgICAgICAgICAgbmF2aWdhdGlvbjoge1xuICAgICAgICAgICAgICAgICAgICBuZXh0RWw6ICcuc3dpcGVyLWJ1dHRvbi1uZXh0JyxcbiAgICAgICAgICAgICAgICAgICAgcHJldkVsOiAnLnN3aXBlci1idXR0b24tcHJldicsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0aHVtYnM6IHtcbiAgICAgICAgICAgICAgICAgICAgc3dpcGVyOiBzbGlkZXJUaHVtYm5haWwgLy8gTGluayB0aHVtYm5haWwgc3dpcGVyXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhtYWluU2xpZGVyKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5faW5pdENhcm91c2VsKCk7XG4gICAgfVxuICAgIHJldHVybiBDYXJvdXNlbDtcbn0oKSk7XG5leHBvcnQgeyBDYXJvdXNlbCB9O1xuIiwiLy8gZXh0cmFjdGVkIGJ5IG1pbmktY3NzLWV4dHJhY3QtcGx1Z2luXG5leHBvcnQge307IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbi8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBfX3dlYnBhY2tfbW9kdWxlc19fO1xuXG4iLCJ2YXIgZGVmZXJyZWQgPSBbXTtcbl9fd2VicGFja19yZXF1aXJlX18uTyA9IChyZXN1bHQsIGNodW5rSWRzLCBmbiwgcHJpb3JpdHkpID0+IHtcblx0aWYoY2h1bmtJZHMpIHtcblx0XHRwcmlvcml0eSA9IHByaW9yaXR5IHx8IDA7XG5cdFx0Zm9yKHZhciBpID0gZGVmZXJyZWQubGVuZ3RoOyBpID4gMCAmJiBkZWZlcnJlZFtpIC0gMV1bMl0gPiBwcmlvcml0eTsgaS0tKSBkZWZlcnJlZFtpXSA9IGRlZmVycmVkW2kgLSAxXTtcblx0XHRkZWZlcnJlZFtpXSA9IFtjaHVua0lkcywgZm4sIHByaW9yaXR5XTtcblx0XHRyZXR1cm47XG5cdH1cblx0dmFyIG5vdEZ1bGZpbGxlZCA9IEluZmluaXR5O1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IGRlZmVycmVkLmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIGNodW5rSWRzID0gZGVmZXJyZWRbaV1bMF07XG5cdFx0dmFyIGZuID0gZGVmZXJyZWRbaV1bMV07XG5cdFx0dmFyIHByaW9yaXR5ID0gZGVmZXJyZWRbaV1bMl07XG5cdFx0dmFyIGZ1bGZpbGxlZCA9IHRydWU7XG5cdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBjaHVua0lkcy5sZW5ndGg7IGorKykge1xuXHRcdFx0aWYgKChwcmlvcml0eSAmIDEgPT09IDAgfHwgbm90RnVsZmlsbGVkID49IHByaW9yaXR5KSAmJiBPYmplY3Qua2V5cyhfX3dlYnBhY2tfcmVxdWlyZV9fLk8pLmV2ZXJ5KChrZXkpID0+IChfX3dlYnBhY2tfcmVxdWlyZV9fLk9ba2V5XShjaHVua0lkc1tqXSkpKSkge1xuXHRcdFx0XHRjaHVua0lkcy5zcGxpY2Uoai0tLCAxKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGZ1bGZpbGxlZCA9IGZhbHNlO1xuXHRcdFx0XHRpZihwcmlvcml0eSA8IG5vdEZ1bGZpbGxlZCkgbm90RnVsZmlsbGVkID0gcHJpb3JpdHk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmKGZ1bGZpbGxlZCkge1xuXHRcdFx0ZGVmZXJyZWQuc3BsaWNlKGktLSwgMSlcblx0XHRcdHZhciByID0gZm4oKTtcblx0XHRcdGlmIChyICE9PSB1bmRlZmluZWQpIHJlc3VsdCA9IHI7XG5cdFx0fVxuXHR9XG5cdHJldHVybiByZXN1bHQ7XG59OyIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSAobW9kdWxlKSA9PiB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdCgpID0+IChtb2R1bGVbJ2RlZmF1bHQnXSkgOlxuXHRcdCgpID0+IChtb2R1bGUpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5nID0gKGZ1bmN0aW9uKCkge1xuXHRpZiAodHlwZW9mIGdsb2JhbFRoaXMgPT09ICdvYmplY3QnKSByZXR1cm4gZ2xvYmFsVGhpcztcblx0dHJ5IHtcblx0XHRyZXR1cm4gdGhpcyB8fCBuZXcgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblx0fSBjYXRjaCAoZSkge1xuXHRcdGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JykgcmV0dXJuIHdpbmRvdztcblx0fVxufSkoKTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiLy8gbm8gYmFzZVVSSVxuXG4vLyBvYmplY3QgdG8gc3RvcmUgbG9hZGVkIGFuZCBsb2FkaW5nIGNodW5rc1xuLy8gdW5kZWZpbmVkID0gY2h1bmsgbm90IGxvYWRlZCwgbnVsbCA9IGNodW5rIHByZWxvYWRlZC9wcmVmZXRjaGVkXG4vLyBbcmVzb2x2ZSwgcmVqZWN0LCBQcm9taXNlXSA9IGNodW5rIGxvYWRpbmcsIDAgPSBjaHVuayBsb2FkZWRcbnZhciBpbnN0YWxsZWRDaHVua3MgPSB7XG5cdFwiYXBwXCI6IDBcbn07XG5cbi8vIG5vIGNodW5rIG9uIGRlbWFuZCBsb2FkaW5nXG5cbi8vIG5vIHByZWZldGNoaW5nXG5cbi8vIG5vIHByZWxvYWRlZFxuXG4vLyBubyBITVJcblxuLy8gbm8gSE1SIG1hbmlmZXN0XG5cbl9fd2VicGFja19yZXF1aXJlX18uTy5qID0gKGNodW5rSWQpID0+IChpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF0gPT09IDApO1xuXG4vLyBpbnN0YWxsIGEgSlNPTlAgY2FsbGJhY2sgZm9yIGNodW5rIGxvYWRpbmdcbnZhciB3ZWJwYWNrSnNvbnBDYWxsYmFjayA9IChwYXJlbnRDaHVua0xvYWRpbmdGdW5jdGlvbiwgZGF0YSkgPT4ge1xuXHR2YXIgY2h1bmtJZHMgPSBkYXRhWzBdO1xuXHR2YXIgbW9yZU1vZHVsZXMgPSBkYXRhWzFdO1xuXHR2YXIgcnVudGltZSA9IGRhdGFbMl07XG5cdC8vIGFkZCBcIm1vcmVNb2R1bGVzXCIgdG8gdGhlIG1vZHVsZXMgb2JqZWN0LFxuXHQvLyB0aGVuIGZsYWcgYWxsIFwiY2h1bmtJZHNcIiBhcyBsb2FkZWQgYW5kIGZpcmUgY2FsbGJhY2tcblx0dmFyIG1vZHVsZUlkLCBjaHVua0lkLCBpID0gMDtcblx0aWYoY2h1bmtJZHMuc29tZSgoaWQpID0+IChpbnN0YWxsZWRDaHVua3NbaWRdICE9PSAwKSkpIHtcblx0XHRmb3IobW9kdWxlSWQgaW4gbW9yZU1vZHVsZXMpIHtcblx0XHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhtb3JlTW9kdWxlcywgbW9kdWxlSWQpKSB7XG5cdFx0XHRcdF9fd2VicGFja19yZXF1aXJlX18ubVttb2R1bGVJZF0gPSBtb3JlTW9kdWxlc1ttb2R1bGVJZF07XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmKHJ1bnRpbWUpIHZhciByZXN1bHQgPSBydW50aW1lKF9fd2VicGFja19yZXF1aXJlX18pO1xuXHR9XG5cdGlmKHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uKSBwYXJlbnRDaHVua0xvYWRpbmdGdW5jdGlvbihkYXRhKTtcblx0Zm9yKDtpIDwgY2h1bmtJZHMubGVuZ3RoOyBpKyspIHtcblx0XHRjaHVua0lkID0gY2h1bmtJZHNbaV07XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGluc3RhbGxlZENodW5rcywgY2h1bmtJZCkgJiYgaW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdKSB7XG5cdFx0XHRpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF1bMF0oKTtcblx0XHR9XG5cdFx0aW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdID0gMDtcblx0fVxuXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXy5PKHJlc3VsdCk7XG59XG5cbnZhciBjaHVua0xvYWRpbmdHbG9iYWwgPSBzZWxmW1wid2VicGFja0NodW5rXCJdID0gc2VsZltcIndlYnBhY2tDaHVua1wiXSB8fCBbXTtcbmNodW5rTG9hZGluZ0dsb2JhbC5mb3JFYWNoKHdlYnBhY2tKc29ucENhbGxiYWNrLmJpbmQobnVsbCwgMCkpO1xuY2h1bmtMb2FkaW5nR2xvYmFsLnB1c2ggPSB3ZWJwYWNrSnNvbnBDYWxsYmFjay5iaW5kKG51bGwsIGNodW5rTG9hZGluZ0dsb2JhbC5wdXNoLmJpbmQoY2h1bmtMb2FkaW5nR2xvYmFsKSk7IiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBkZXBlbmRzIG9uIG90aGVyIGxvYWRlZCBjaHVua3MgYW5kIGV4ZWN1dGlvbiBuZWVkIHRvIGJlIGRlbGF5ZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXy5PKHVuZGVmaW5lZCwgW1widmVuZG9ycy1ub2RlX21vZHVsZXNfYm9vdHN0cmFwX2Rpc3RfanNfYm9vdHN0cmFwX2VzbV9qcy1ub2RlX21vZHVsZXNfc3dpcGVyX3N3aXBlci1idW5kbGVfY3NzLWQzNWNmOVwiXSwgKCkgPT4gKF9fd2VicGFja19yZXF1aXJlX18oXCIuL2pzL2FwcC50c1wiKSkpXG5fX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXy5PKF9fd2VicGFja19leHBvcnRzX18pO1xuIiwiIl0sIm5hbWVzIjpbImNvcmVzaG9wUXVhbnRpdHlTZWxlY3RvciIsIm9wdGlvbnMiLCJpbml0UXVhbnRpdHlGaWVsZHMiLCJmaWVsZHMiLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJwcmVjaXNpb25QcmVzZXRTZWxlY3RvciIsInF1ZXJ5U2VsZWN0b3IiLCJhZGRFdmVudExpc3RlbmVyIiwiZGF0YXNldCIsImNzVW5pdElkZW50aWZpZXIiLCJxdWFudGl0eUlkZW50aWZpZXIiLCJxdWFudGl0eUlucHV0IiwiY29uY2F0Iiwic3RlcCIsImNzVW5pdFByZWNpc2lvbiIsInVwZGF0ZVRvdWNoU3BpblNldHRpbmdzIiwidG9TdHJpbmciLCJmb3JFYWNoIiwiZmllbGQiLCJpbml0aWFsaXplVG91Y2hTcGluIiwiaW5wdXQiLCJwcmVjaXNpb24iLCJjb250YWluZXIiLCJjcmVhdGVFbGVtZW50IiwiY2xhc3NMaXN0IiwiYWRkIiwiZGVjcmVtZW50QnV0dG9uIiwidHlwZSIsInRleHRDb250ZW50IiwiaW5jcmVtZW50QnV0dG9uIiwicGFyZW50Tm9kZSIsImluc2VydEJlZm9yZSIsImFwcGVuZENoaWxkIiwidmFsdWUiLCJwYXJzZUludCIsImlzTmFOIiwibWluIiwibWF4Iiwid2luZG93IiwiY29yZXNob3BWYXJpYW50U2VsZWN0b3IiLCJhdHRyaWJ1dGVDb250YWluZXIiLCJfYXR0cmlidXRlQ29udGFpbmVyIiwiX2NvbmZpZyIsIl9hdHRyaWJ1dGVHcm91cHMiLCJfaW5pdCIsIkpTT04iLCJwYXJzZSIsImNvbmZpZyIsIl9pbml0aWFsaXplQXR0cmlidXRlR3JvdXBzIiwiX3NldHVwQXR0cmlidXRlR3JvdXBTZXR0aW5ncyIsIl9zZXR1cENoYW5nZUV2ZW50cyIsImF0dHJpYnV0ZXMiLCJncm91cCIsImVsZW1lbnRzIiwiaWQiLCJwdXNoIiwiaW5kZXgiLCJwcmV2R3JvdXAiLCJuZXh0R3JvdXAiLCJzZWxlY3RlZCIsIl9jb25maWd1cmVHcm91cCIsIl9jbGVhckdyb3VwIiwiX2F0dGFjaENoYW5nZUV2ZW50IiwiX2Fzc2lnbk9uQ2hhbmdlRXZlbnQiLCJlbGVtZW50Iiwib25jaGFuZ2UiLCJfaGFuZGxlRWxlbWVudENoYW5nZSIsInZhcmlhbnRSZWFkeSIsImRpc3BhdGNoRXZlbnQiLCJfY3JlYXRlRXZlbnQiLCJfc2VsZWN0R3JvdXBFbGVtZW50IiwiX2Rlc2VsZWN0R3JvdXBFbGVtZW50IiwiX2NsZWFyR3JvdXBzIiwiX3JlZGlyZWN0VG9WYXJpYW50Iiwic2VsZWN0ZWRBdHRyaWJ1dGVzIiwiX2dldFNlbGVjdGVkQXR0cmlidXRlcyIsIm1hdGNoaW5nUHJvZHVjdCIsIl9maW5kTWF0Y2hpbmdQcm9kdWN0IiwidXJsIiwibG9jYXRpb24iLCJocmVmIiwiT2JqZWN0IiwiZnJvbUVudHJpZXMiLCJmaWx0ZXIiLCJnIiwibWFwIiwidmFsdWVzIiwiZmluZCIsInAiLCJzdHJpbmdpZnkiLCJuYW1lIiwiZGF0YSIsImFyZ3VtZW50cyIsImxlbmd0aCIsInVuZGVmaW5lZCIsIkN1c3RvbUV2ZW50IiwiYnViYmxlcyIsImNhbmNlbGFibGUiLCJkZXRhaWwiLCJfY2xlYXJHcm91cEVsZW1lbnRzIiwiZGlzYWJsZWQiLCJjaGVja2VkIiwidGFnTmFtZSIsInRvTG93ZXJDYXNlIiwiX2NsZWFyU2VsZWN0T3B0aW9ucyIsIm9wdGlvbiIsInJlbW92ZUNoaWxkIiwiX2lzUHJvZHVjdE1hdGNoaW5nRmlsdGVycyIsInByb2R1Y3QiLCJmaWx0ZXJBdHRyaWJ1dGVzIiwiZXZlcnkiLCJfY29uZmlnJGluZGV4JHByb2R1Y3QiLCJfaXNBdHRyaWJ1dGVSZWxldmFudCIsImF0dHJpYnV0ZSIsInByb2R1Y3RzIiwic29tZSIsIl9maWx0ZXJBdHRyaWJ1dGVzIiwiX2dldEZpbHRlckF0dHJpYnV0ZXMiLCJjdXJyZW50R3JvdXAiLCJfYWRkT3B0aW9uVG9TZWxlY3QiLCJPcHRpb24iLCJfZW5hYmxlRWxlbWVudEZvckF0dHJpYnV0ZSIsIl9jb25maWd1cmVHcm91cEVsZW1lbnRzIiwiX2NvbmZpZ3VyZUVsZW1lbnQiLCJmaWx0ZXJlZEF0dHJpYnV0ZXMiLCJzbGljZSIsIm1ldGhvZHMiLCJpbml0Iiwic2V0dGluZ3MiLCJwcm90b3R5cGVQcmVmaXgiLCJjb250YWluZXJTZWxlY3RvciIsInNlbGVjdG9yQXR0ciIsInNlbGVjdG9yIiwic2hvdyIsInJlcGxhY2UiLCJzZWxlY3RlZFZhbHVlIiwic2VsZWN0ZWRPcHRpb24iLCJBcnJheSIsImZyb20iLCJnZXRBdHRyaWJ1dGUiLCJwcm90b3R5cGVFbGVtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJnZXRDb250YWluZXIiLCJpbm5lckhUTUwiLCJ0cmltIiwicHJvdG90eXBlIiwiZGF0YUNvbnRhaW5lcklkIiwiTm9kZUxpc3QiLCJoYW5kbGVQcm90b3R5cGVzIiwibWV0aG9kIiwiYXBwbHkiLCJjYWxsIiwiRXJyb3IiLCJIVE1MRWxlbWVudCIsIm1hcEJsb2NrIiwic3R5bGUiLCJoZWlnaHQiLCJjbGllbnRIZWlnaHQiLCJpbml0aWFsaXplIiwibWFwT3B0aW9ucyIsInpvb20iLCJjZW50ZXIiLCJnb29nbGUiLCJtYXBzIiwiTGF0TG5nIiwiZGlzYWJsZURlZmF1bHRVSSIsIm1hcE5ldyIsIk1hcCIsImNvbnNvbGUiLCJsb2ciLCJzaG9wIiwiaW5pdENoYW5nZUFkZHJlc3MiLCJpbml0Q2FydFNoaXBtZW50Q2FsY3VsYXRvciIsImluaXRRdWFudGl0eVZhbGlkYXRvciIsImluaXRDYXRlZ29yeVNlbGVjdCIsInNldHVwQ29weVRvQ2xpcGJvYXJkIiwic2hvd0VsZW1lbnQiLCJnZXRTZWxlY3RlZFZhbHVlIiwiYnV0dG9uIiwiY29weVRleHRUb0NsaXBib2FyZCIsInRhcmdldElkIiwidGFyZ2V0IiwiY29weVRleHQiLCJzZWxlY3QiLCJzZXRTZWxlY3Rpb25SYW5nZSIsIm5hdmlnYXRvciIsImNsaXBib2FyZCIsIndyaXRlVGV4dCIsInRoZW4iLCJjb3BpZWRUZXh0IiwidXBkYXRlUXVlcnlTdHJpbmdQYXJhbWV0ZXIiLCJ1cmkiLCJrZXkiLCJyZSIsIlJlZ0V4cCIsInNlcGFyYXRvciIsImluZGV4T2YiLCJtYXRjaCIsImJ1dHRvbmRvd25fY2xhc3MiLCJidXR0b251cF9jbGFzcyIsImV2IiwiZm9ybSIsImNsb3Nlc3QiLCJoYW5kbGVTaGlwbWVudENhbGN1bGF0aW9uIiwiZXZlbnQiLCJwcmV2ZW50RGVmYXVsdCIsInNldEF0dHJpYnV0ZSIsIm9wYWNpdHkiLCJmZXRjaCIsImFjdGlvbiIsImJvZHkiLCJVUkxTZWFyY2hQYXJhbXMiLCJGb3JtRGF0YSIsInJlc3BvbnNlIiwidGV4dCIsInJlcyIsInVwZGF0ZVNoaXBtZW50Q2FsY3VsYXRpb24iLCJjYXRjaCIsImVycm9yIiwiaGFuZGxlU2hpcG1lbnRFcnJvciIsInJlc3BvbnNlVGV4dCIsInJlbW92ZSIsIm91dGVySFRNTCIsInJlbW92ZUF0dHJpYnV0ZSIsImFkZHJlc3NTdGVwIiwiaW52b2ljZUFkZHJlc3MiLCJzaGlwcGluZ0FkZHJlc3MiLCJ1c2VJYXNTIiwic2V0dXBBZGRyZXNzQ2hhbmdlRXZlbnRzIiwidXBkYXRlQWRkcmVzcyIsInVwZGF0ZVNoaXBwaW5nQWRkcmVzcyIsInRvZ2dsZVNoaXBwaW5nQWRkcmVzcyIsInNlbGVjdGVkSW5kZXgiLCJhZGRyZXNzIiwiaHRtbCIsImludm9pY2VQYW5lbCIsInRvZ2dsZVVzZUFzU2hpcHBpbmciLCJhZGRyZXNzVHlwZSIsImlzSW52b2ljZVR5cGUiLCJFdmVudCIsInNoaXBwaW5nRmllbGQiLCJzaGlwcGluZ0FkZEFkZHJlc3NCdXR0b24iLCJkaXNwbGF5IiwidmFyaWFudCIsInZhcmlhbnRzIiwiZSIsInN1Ym1pdHMiLCJzdWJtaXQiLCJDYXJvdXNlbCIsIkNhcm91c2VsUHJvZHVjdHMiLCJTd2lwZXIiLCJUaHVtYnMiLCJfaW5pdENhcm91c2VsIiwic2xpZGVyVGh1bWJuYWlsIiwic2xpZGVzUGVyVmlldyIsImZyZWVNb2RlIiwic3BhY2VCZXR3ZWVuIiwid2F0Y2hTbGlkZXNQcm9ncmVzcyIsIm1haW5TbGlkZXIiLCJtb2R1bGVzIiwibmF2aWdhdGlvbiIsIm5leHRFbCIsInByZXZFbCIsInRodW1icyIsInN3aXBlciJdLCJzb3VyY2VSb290IjoiIn0=