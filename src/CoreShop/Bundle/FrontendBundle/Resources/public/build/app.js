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
      _config.attributes.forEach(group => {
        group.elements = _attributeContainer.querySelectorAll("[data-group=\"".concat(group.group.id, "\"]"));
        _attributeGroups.push(group);
      });
      _setupAttributeGroupSettings();
      _setupChangeEvents();
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
          element.onchange = () => _handleElementChange(group, element);
        });
      });
    };
    const _handleElementChange = function (group, element) {
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

    // Function to clear group elements
    const _clearGroupElements = function (element) {
      element.disabled = true;
      element.checked = false;
      if (element.tagName.toLowerCase() === 'select') {
        const options = element.querySelectorAll('option:not([value=""])');
        options.forEach(option => element.removeChild(option));
      }
    };

    // Function to clear a group
    const _clearGroup = function (group) {
      delete group.selected;
      group.elements.forEach(_clearGroupElements);
    };

    // Function to clear groups
    const _clearGroups = function (group) {
      while (group) {
        _clearGroup(group);
        group = group.nextGroup;
      }
    };

    // Function to filter attributes
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

    // Function to add option to select element
    const _addOptionToSelect = function (element, attribute, group) {
      const option = new Option(attribute.attribute.name, attribute.attribute.id);
      option.id = 'attribute-' + attribute.attribute.id;
      if (group.selected === attribute.attribute.id) {
        option.selected = true;
      }
      element.add(option);
      element.disabled = false;
    };

    // Function to enable element for attribute
    const _enableElementForAttribute = function (element, attribute, group) {
      if (parseInt(element.dataset.group) === group.group.id && parseInt(element.value) === attribute.attribute.id) {
        element.disabled = false;
        if (group.selected === attribute.attribute.id) {
          element.checked = true;
        }
      }
    };

    // Function to configure group elements
    const _configureGroupElements = function (group, attributes) {
      group.elements.forEach(element => {
        if (element.tagName.toLowerCase() === 'select') {
          attributes.forEach(attribute => _addOptionToSelect(element, attribute, group));
        } else {
          attributes.forEach(attribute => _enableElementForAttribute(element, attribute, group));
        }
      });
    };

    // Function to configure a group
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsTUFBTSxxQkFBcUI7V0FDM0I7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTs7V0FFQTtXQUNBO1dBQ0E7Ozs7O1VFbERBO1VBQ0E7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9qcy9wbHVnaW4vY29yZXNob3AucGx1Z2luLnF1YW50aXR5LmpzIiwid2VicGFjazovLy8uL2pzL3BsdWdpbi9jb3Jlc2hvcC5wbHVnaW4udmFyaWFudC5qcyIsIndlYnBhY2s6Ly8vLi9qcy9zY3JpcHRzL2hhbmRsZS1wcm90b3R5cGVzLmpzIiwid2VicGFjazovLy8uL2pzL3NjcmlwdHMvbWFwLmpzIiwid2VicGFjazovLy8uL2pzL3NjcmlwdHMvc2hvcC5qcyIsIndlYnBhY2s6Ly8vLi9qcy9zY3JpcHRzL3ZhcmlhbnQuanMiLCJ3ZWJwYWNrOi8vLy4vanMvYXBwLnRzIiwid2VicGFjazovLy8uL2pzL3NjcmlwdHMvY2Fyb3VzZWwudHMiLCJ3ZWJwYWNrOi8vLy4vanMvc2NyaXB0cy9jYXJ0SW5mby50cyIsIndlYnBhY2s6Ly8vLi9zY3NzL2FwcC5zY3NzIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2NodW5rIGxvYWRlZCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2dsb2JhbCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2pzb25wIGNodW5rIGxvYWRpbmciLCJ3ZWJwYWNrOi8vL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly8vd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gY29yZXNob3BRdWFudGl0eVNlbGVjdG9yKG9wdGlvbnMpIHtcbiAgICAgICAgaW5pdFF1YW50aXR5RmllbGRzKG9wdGlvbnMpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluaXRRdWFudGl0eUZpZWxkcyhvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IGZpZWxkcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2lucHV0LmNzLXVuaXQtaW5wdXQnKTtcbiAgICAgICAgY29uc3QgcHJlY2lzaW9uUHJlc2V0U2VsZWN0b3IgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdzZWxlY3QuY3MtdW5pdC1zZWxlY3RvcicpO1xuXG4gICAgICAgIGlmKHByZWNpc2lvblByZXNldFNlbGVjdG9yKSB7XG4gICAgICAgICAgICAvLyBMaXN0ZW4gdG8gdW5pdCBkZWZpbml0aW9uIHNlbGVjdG9yXG4gICAgICAgICAgICBwcmVjaXNpb25QcmVzZXRTZWxlY3Rvci5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmRhdGFzZXQuY3NVbml0SWRlbnRpZmllcikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IHF1YW50aXR5SWRlbnRpZmllciA9IHRoaXMuZGF0YXNldC5jc1VuaXRJZGVudGlmaWVyO1xuICAgICAgICAgICAgICAgIGNvbnN0IHF1YW50aXR5SW5wdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBpbnB1dFtkYXRhLWNzLXVuaXQtaWRlbnRpZmllcj1cIiR7cXVhbnRpdHlJZGVudGlmaWVyfVwiXWApO1xuXG4gICAgICAgICAgICAgICAgLy8gU2V0IHN0ZXAgdG8gMSBvciB3aGF0ZXZlciBpbnRlZ2VyIHZhbHVlIHlvdSB3YW50XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RlcCA9IDE7IC8vIENoYW5nZSB0aGlzIGlmIHlvdSB3YW50IGEgZGlmZmVyZW50IGluY3JlbWVudFxuXG4gICAgICAgICAgICAgICAgaWYgKCFxdWFudGl0eUlucHV0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBVc2UgaW50ZWdlciBzdGVwIGRpcmVjdGx5XG4gICAgICAgICAgICAgICAgcXVhbnRpdHlJbnB1dC5zdGVwID0gc3RlcDsgLy8gU2V0IHN0ZXAgYXMgYW4gaW50ZWdlclxuICAgICAgICAgICAgICAgIHF1YW50aXR5SW5wdXQuZGF0YXNldC5jc1VuaXRQcmVjaXNpb24gPSAwOyAvLyBPcHRpb25hbCwgc2luY2UgcHJlY2lzaW9uIGlzIG5vIGxvbmdlciByZWxldmFudFxuXG4gICAgICAgICAgICAgICAgLy8gVXBkYXRlIGlucHV0IHNldHRpbmdzXG4gICAgICAgICAgICAgICAgdXBkYXRlVG91Y2hTcGluU2V0dGluZ3MocXVhbnRpdHlJbnB1dCwgMCwgc3RlcC50b1N0cmluZygpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoZmllbGRzKSB7XG4gICAgICAgICAgICAvLyBJbml0aWFsaXplIHF1YW50aXR5IGZpZWxkcyB3aXRoIGludGVnZXIgc3RlcFxuICAgICAgICAgICAgZmllbGRzLmZvckVhY2goZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICAgICAgICAgICAgLy8gWW91IG1pZ2h0IG5vdCBuZWVkIHByZWNpc2lvbiBhbnltb3JlXG4gICAgICAgICAgICAgICAgaW5pdGlhbGl6ZVRvdWNoU3BpbihmaWVsZCwgMCwgJzEnLCBvcHRpb25zKTsgLy8gQ2hhbmdlICcxJyB0byB5b3VyIGRlc2lyZWQgaW50ZWdlciBpbmNyZW1lbnRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5pdGlhbGl6ZVRvdWNoU3BpbihpbnB1dCwgcHJlY2lzaW9uLCBzdGVwLCBvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBjb250YWluZXIuY2xhc3NMaXN0LmFkZCgndG91Y2hzcGluLWNvbnRhaW5lcicpO1xuXG4gICAgICAgIGNvbnN0IGRlY3JlbWVudEJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICBkZWNyZW1lbnRCdXR0b24udHlwZSA9ICdidXR0b24nO1xuICAgICAgICBkZWNyZW1lbnRCdXR0b24udGV4dENvbnRlbnQgPSAnLSc7XG4gICAgICAgIGRlY3JlbWVudEJ1dHRvbi5jbGFzc0xpc3QuYWRkKCd0b3VjaHNwaW4tZGVjcmVtZW50Jyk7XG5cbiAgICAgICAgY29uc3QgaW5jcmVtZW50QnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgIGluY3JlbWVudEJ1dHRvbi50eXBlID0gJ2J1dHRvbic7XG4gICAgICAgIGluY3JlbWVudEJ1dHRvbi50ZXh0Q29udGVudCA9ICcrJztcbiAgICAgICAgaW5jcmVtZW50QnV0dG9uLmNsYXNzTGlzdC5hZGQoJ3RvdWNoc3Bpbi1pbmNyZW1lbnQnKTtcblxuICAgICAgICBpbnB1dC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShjb250YWluZXIsIGlucHV0KTtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGRlY3JlbWVudEJ1dHRvbik7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChpbnB1dCk7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChpbmNyZW1lbnRCdXR0b24pO1xuXG4gICAgICAgIC8vIFNldCB1cCBldmVudCBsaXN0ZW5lcnMgZm9yIGluY3JlbWVudCBhbmQgZGVjcmVtZW50XG4gICAgICAgIGRlY3JlbWVudEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IHBhcnNlSW50KGlucHV0LnZhbHVlKSB8fCAwOyAvLyBFbnN1cmUgdmFsdWUgaXMgYW4gaW50ZWdlclxuICAgICAgICAgICAgdmFsdWUgLT0gcGFyc2VJbnQoc3RlcCk7IC8vIERlY3JlbWVudCBieSBpbnRlZ2VyIHN0ZXBcbiAgICAgICAgICAgIGlmICh2YWx1ZSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgaW5wdXQudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaW5jcmVtZW50QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgbGV0IHZhbHVlID0gcGFyc2VJbnQoaW5wdXQudmFsdWUpIHx8IDA7IC8vIEVuc3VyZSB2YWx1ZSBpcyBhbiBpbnRlZ2VyXG4gICAgICAgICAgICB2YWx1ZSArPSBwYXJzZUludChzdGVwKTsgLy8gSW5jcmVtZW50IGJ5IGludGVnZXIgc3RlcFxuICAgICAgICAgICAgaW5wdXQudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQWRkIGlucHV0IHZhbGlkYXRpb24gYmFzZWQgb24gaW50ZWdlciB2YWx1ZVxuICAgICAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IHBhcnNlSW50KGlucHV0LnZhbHVlKTtcbiAgICAgICAgICAgIGlmIChpc05hTih2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICBpbnB1dC52YWx1ZSA9IDA7IC8vIERlZmF1bHQgdG8gemVybyBpZiBpbnZhbGlkIGlucHV0XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlucHV0LnZhbHVlID0gdmFsdWU7IC8vIEtlZXAgaXQgYXMgYW4gaW50ZWdlclxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1cGRhdGVUb3VjaFNwaW5TZXR0aW5ncyhpbnB1dCwgcHJlY2lzaW9uLCBzdGVwKSB7XG4gICAgICAgIGlucHV0Lm1pbiA9IDA7XG4gICAgICAgIGlucHV0Lm1heCA9IDEwMDAwMDAwMDA7XG4gICAgICAgIGlucHV0LnN0ZXAgPSBzdGVwO1xuICAgICAgICBpbnB1dC5kYXRhc2V0LmNzVW5pdFByZWNpc2lvbiA9IHByZWNpc2lvbjtcbiAgICB9XG5cbiAgICAvLyBFeHBvcnQgdGhlIGZ1bmN0aW9uIHRvIHRoZSBnbG9iYWwgc2NvcGVcbiAgICB3aW5kb3cuY29yZXNob3BRdWFudGl0eVNlbGVjdG9yID0gY29yZXNob3BRdWFudGl0eVNlbGVjdG9yO1xufSkoKTtcbiIsIihmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgY29yZXNob3BWYXJpYW50U2VsZWN0b3IgPSBmdW5jdGlvbiAoYXR0cmlidXRlQ29udGFpbmVyKSB7XG4gICAgICAgIGxldCBfYXR0cmlidXRlQ29udGFpbmVyID0gbnVsbDtcbiAgICAgICAgbGV0IF9jb25maWcgPSB7fTtcbiAgICAgICAgbGV0IF9hdHRyaWJ1dGVHcm91cHMgPSBbXTtcblxuICAgICAgICBjb25zdCBfaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICghYXR0cmlidXRlQ29udGFpbmVyKSByZXR1cm47XG5cbiAgICAgICAgICAgIF9hdHRyaWJ1dGVDb250YWluZXIgPSBhdHRyaWJ1dGVDb250YWluZXI7XG4gICAgICAgICAgICBfY29uZmlnID0gSlNPTi5wYXJzZShfYXR0cmlidXRlQ29udGFpbmVyLmRhdGFzZXQuY29uZmlnKTtcbiAgICAgICAgICAgIF9jb25maWcuYXR0cmlidXRlcy5mb3JFYWNoKChncm91cCkgPT4ge1xuICAgICAgICAgICAgICAgIGdyb3VwLmVsZW1lbnRzID0gX2F0dHJpYnV0ZUNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKGBbZGF0YS1ncm91cD1cIiR7Z3JvdXAuZ3JvdXAuaWR9XCJdYCk7XG4gICAgICAgICAgICAgICAgX2F0dHJpYnV0ZUdyb3Vwcy5wdXNoKGdyb3VwKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBfc2V0dXBBdHRyaWJ1dGVHcm91cFNldHRpbmdzKCk7XG4gICAgICAgICAgICBfc2V0dXBDaGFuZ2VFdmVudHMoKTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfc2V0dXBBdHRyaWJ1dGVHcm91cFNldHRpbmdzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX2F0dHJpYnV0ZUdyb3Vwcy5mb3JFYWNoKChncm91cCwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgICBncm91cC5wcmV2R3JvdXAgPSBfYXR0cmlidXRlR3JvdXBzW2luZGV4IC0gMV0gfHwgbnVsbDtcbiAgICAgICAgICAgICAgICBncm91cC5uZXh0R3JvdXAgPSBfYXR0cmlidXRlR3JvdXBzW2luZGV4ICsgMV0gfHwgbnVsbDtcblxuICAgICAgICAgICAgICAgIGlmICghaW5kZXggfHwgZ3JvdXAuc2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgX2NvbmZpZ3VyZUdyb3VwKGdyb3VwKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBfY2xlYXJHcm91cChncm91cCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgX3NldHVwQ2hhbmdlRXZlbnRzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX2F0dHJpYnV0ZUdyb3Vwcy5mb3JFYWNoKChncm91cCkgPT4ge1xuICAgICAgICAgICAgICAgIGdyb3VwLmVsZW1lbnRzLmZvckVhY2goKGVsZW1lbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5vbmNoYW5nZSA9ICgpID0+IF9oYW5kbGVFbGVtZW50Q2hhbmdlKGdyb3VwLCBlbGVtZW50KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9oYW5kbGVFbGVtZW50Q2hhbmdlID0gZnVuY3Rpb24gKGdyb3VwLCBlbGVtZW50KSB7XG4gICAgICAgICAgICB3aW5kb3cudmFyaWFudFJlYWR5ID0gZmFsc2U7XG4gICAgICAgICAgICBfYXR0cmlidXRlQ29udGFpbmVyLmRpc3BhdGNoRXZlbnQoX2NyZWF0ZUV2ZW50KCdjaGFuZ2UnLCB7IGVsZW1lbnQgfSkpO1xuXG4gICAgICAgICAgICBpZiAoZWxlbWVudC52YWx1ZSkge1xuICAgICAgICAgICAgICAgIGdyb3VwLnNlbGVjdGVkID0gcGFyc2VJbnQoZWxlbWVudC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgX2F0dHJpYnV0ZUNvbnRhaW5lci5kaXNwYXRjaEV2ZW50KF9jcmVhdGVFdmVudCgnc2VsZWN0JywgeyBlbGVtZW50IH0pKTtcblxuICAgICAgICAgICAgICAgIGlmIChncm91cC5uZXh0R3JvdXApIHtcbiAgICAgICAgICAgICAgICAgICAgX2NsZWFyR3JvdXBzKGdyb3VwLm5leHRHcm91cCk7XG4gICAgICAgICAgICAgICAgICAgIF9jb25maWd1cmVHcm91cChncm91cC5uZXh0R3JvdXApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIF9hdHRyaWJ1dGVDb250YWluZXIuZGlzcGF0Y2hFdmVudChfY3JlYXRlRXZlbnQoJ3JlZGlyZWN0JywgeyBlbGVtZW50IH0pKTtcbiAgICAgICAgICAgICAgICAgICAgX3JlZGlyZWN0VG9WYXJpYW50KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgZ3JvdXAuc2VsZWN0ZWQ7XG4gICAgICAgICAgICAgICAgaWYgKGdyb3VwLm5leHRHcm91cCkge1xuICAgICAgICAgICAgICAgICAgICBfY2xlYXJHcm91cHMoZ3JvdXAubmV4dEdyb3VwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHdpbmRvdy52YXJpYW50UmVhZHkgPSB0cnVlO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9yZWRpcmVjdFRvVmFyaWFudCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkQXR0cmlidXRlcyA9IE9iamVjdC5mcm9tRW50cmllcyhcbiAgICAgICAgICAgICAgICBfYXR0cmlidXRlR3JvdXBzLmZpbHRlcigoZykgPT4gZy5zZWxlY3RlZCkubWFwKChnKSA9PiBbZy5ncm91cC5pZCwgZy5zZWxlY3RlZF0pXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBjb25zdCBtYXRjaGluZ1Byb2R1Y3QgPSBPYmplY3QudmFsdWVzKF9jb25maWcuaW5kZXgpLmZpbmQoKHApID0+XG4gICAgICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkocC5hdHRyaWJ1dGVzKSA9PT0gSlNPTi5zdHJpbmdpZnkoc2VsZWN0ZWRBdHRyaWJ1dGVzKVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgaWYgKG1hdGNoaW5nUHJvZHVjdD8udXJsKSB7XG4gICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBtYXRjaGluZ1Byb2R1Y3QudXJsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9jcmVhdGVFdmVudCA9IGZ1bmN0aW9uIChuYW1lLCBkYXRhID0ge30pIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgQ3VzdG9tRXZlbnQoJ3ZhcmlhbnRfc2VsZWN0b3IuJyArIG5hbWUsIHtcbiAgICAgICAgICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNhbmNlbGFibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGRldGFpbDogZGF0YSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEZ1bmN0aW9uIHRvIGNsZWFyIGdyb3VwIGVsZW1lbnRzXG4gICAgICAgIGNvbnN0IF9jbGVhckdyb3VwRWxlbWVudHMgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgZWxlbWVudC5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgICBlbGVtZW50LmNoZWNrZWQgPSBmYWxzZTtcblxuICAgICAgICAgICAgaWYgKGVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnc2VsZWN0Jykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG9wdGlvbnMgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ29wdGlvbjpub3QoW3ZhbHVlPVwiXCJdKScpO1xuICAgICAgICAgICAgICAgIG9wdGlvbnMuZm9yRWFjaCgob3B0aW9uKSA9PiBlbGVtZW50LnJlbW92ZUNoaWxkKG9wdGlvbikpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEZ1bmN0aW9uIHRvIGNsZWFyIGEgZ3JvdXBcbiAgICAgICAgY29uc3QgX2NsZWFyR3JvdXAgPSBmdW5jdGlvbiAoZ3JvdXApIHtcbiAgICAgICAgICAgIGRlbGV0ZSBncm91cC5zZWxlY3RlZDtcbiAgICAgICAgICAgIGdyb3VwLmVsZW1lbnRzLmZvckVhY2goX2NsZWFyR3JvdXBFbGVtZW50cyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gRnVuY3Rpb24gdG8gY2xlYXIgZ3JvdXBzXG4gICAgICAgIGNvbnN0IF9jbGVhckdyb3VwcyA9IGZ1bmN0aW9uIChncm91cCkge1xuICAgICAgICAgICAgd2hpbGUgKGdyb3VwKSB7XG4gICAgICAgICAgICAgICAgX2NsZWFyR3JvdXAoZ3JvdXApO1xuICAgICAgICAgICAgICAgIGdyb3VwID0gZ3JvdXAubmV4dEdyb3VwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEZ1bmN0aW9uIHRvIGZpbHRlciBhdHRyaWJ1dGVzXG4gICAgICAgIGNvbnN0IF9maWx0ZXJBdHRyaWJ1dGVzID0gZnVuY3Rpb24gKGF0dHJpYnV0ZXMsIGdyb3VwKSB7XG4gICAgICAgICAgICBjb25zdCBmaWx0ZXJBdHRyaWJ1dGVzID0gW107XG4gICAgICAgICAgICBsZXQgY3VycmVudEdyb3VwID0gZ3JvdXAucHJldkdyb3VwO1xuXG4gICAgICAgICAgICB3aGlsZSAoY3VycmVudEdyb3VwKSB7XG4gICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRHcm91cC5zZWxlY3RlZCAmJiBjdXJyZW50R3JvdXAubmV4dEdyb3VwKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbHRlckF0dHJpYnV0ZXMucHVzaCh7IGdyb3VwOiBjdXJyZW50R3JvdXAuZ3JvdXAuaWQsIHNlbGVjdGVkOiBjdXJyZW50R3JvdXAuc2VsZWN0ZWQgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGN1cnJlbnRHcm91cCA9IGN1cnJlbnRHcm91cC5wcmV2R3JvdXA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBhdHRyaWJ1dGVzLmZpbHRlcigoYXR0cmlidXRlKSA9PlxuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZS5wcm9kdWN0cy5zb21lKChwcm9kdWN0KSA9PlxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJBdHRyaWJ1dGVzLmV2ZXJ5KChmaWx0ZXIpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICBfY29uZmlnLmluZGV4W3Byb2R1Y3QuaWRdLmF0dHJpYnV0ZXM/LltmaWx0ZXIuZ3JvdXBdID09PSBmaWx0ZXIuc2VsZWN0ZWRcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gRnVuY3Rpb24gdG8gYWRkIG9wdGlvbiB0byBzZWxlY3QgZWxlbWVudFxuICAgICAgICBjb25zdCBfYWRkT3B0aW9uVG9TZWxlY3QgPSBmdW5jdGlvbiAoZWxlbWVudCwgYXR0cmlidXRlLCBncm91cCkge1xuICAgICAgICAgICAgY29uc3Qgb3B0aW9uID0gbmV3IE9wdGlvbihhdHRyaWJ1dGUuYXR0cmlidXRlLm5hbWUsIGF0dHJpYnV0ZS5hdHRyaWJ1dGUuaWQpO1xuICAgICAgICAgICAgb3B0aW9uLmlkID0gJ2F0dHJpYnV0ZS0nICsgYXR0cmlidXRlLmF0dHJpYnV0ZS5pZDtcbiAgICAgICAgICAgIGlmIChncm91cC5zZWxlY3RlZCA9PT0gYXR0cmlidXRlLmF0dHJpYnV0ZS5pZCkge1xuICAgICAgICAgICAgICAgIG9wdGlvbi5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbGVtZW50LmFkZChvcHRpb24pO1xuICAgICAgICAgICAgZWxlbWVudC5kaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIEZ1bmN0aW9uIHRvIGVuYWJsZSBlbGVtZW50IGZvciBhdHRyaWJ1dGVcbiAgICAgICAgY29uc3QgX2VuYWJsZUVsZW1lbnRGb3JBdHRyaWJ1dGUgPSBmdW5jdGlvbiAoZWxlbWVudCwgYXR0cmlidXRlLCBncm91cCkge1xuICAgICAgICAgICAgaWYgKHBhcnNlSW50KGVsZW1lbnQuZGF0YXNldC5ncm91cCkgPT09IGdyb3VwLmdyb3VwLmlkICYmIHBhcnNlSW50KGVsZW1lbnQudmFsdWUpID09PSBhdHRyaWJ1dGUuYXR0cmlidXRlLmlkKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5kaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmIChncm91cC5zZWxlY3RlZCA9PT0gYXR0cmlidXRlLmF0dHJpYnV0ZS5pZCkge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmNoZWNrZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvLyBGdW5jdGlvbiB0byBjb25maWd1cmUgZ3JvdXAgZWxlbWVudHNcbiAgICAgICAgY29uc3QgX2NvbmZpZ3VyZUdyb3VwRWxlbWVudHMgPSBmdW5jdGlvbiAoZ3JvdXAsIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgICAgIGdyb3VwLmVsZW1lbnRzLmZvckVhY2goKGVsZW1lbnQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdzZWxlY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMuZm9yRWFjaCgoYXR0cmlidXRlKSA9PiBfYWRkT3B0aW9uVG9TZWxlY3QoZWxlbWVudCwgYXR0cmlidXRlLCBncm91cCkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMuZm9yRWFjaCgoYXR0cmlidXRlKSA9PiBfZW5hYmxlRWxlbWVudEZvckF0dHJpYnV0ZShlbGVtZW50LCBhdHRyaWJ1dGUsIGdyb3VwKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gRnVuY3Rpb24gdG8gY29uZmlndXJlIGEgZ3JvdXBcbiAgICAgICAgY29uc3QgX2NvbmZpZ3VyZUdyb3VwID0gZnVuY3Rpb24gKGdyb3VwKSB7XG4gICAgICAgICAgICBjb25zdCBmaWx0ZXJlZEF0dHJpYnV0ZXMgPSBfZmlsdGVyQXR0cmlidXRlcyhncm91cC5hdHRyaWJ1dGVzLnNsaWNlKCksIGdyb3VwKSB8fCBncm91cC5hdHRyaWJ1dGVzO1xuICAgICAgICAgICAgX2NvbmZpZ3VyZUdyb3VwRWxlbWVudHMoZ3JvdXAsIGZpbHRlcmVkQXR0cmlidXRlcyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgX2luaXQoKTtcbiAgICB9O1xuXG4gICAgd2luZG93LmNvcmVzaG9wVmFyaWFudFNlbGVjdG9yID0gY29yZXNob3BWYXJpYW50U2VsZWN0b3I7XG59KSgpO1xuIiwiKGZ1bmN0aW9uICgpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICBjb25zdCBtZXRob2RzID0ge1xuICAgICAgICBpbml0OiBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgICAgICAgY29uc3Qgc2V0dGluZ3MgPSB7XG4gICAgICAgICAgICAgICAgcHJvdG90eXBlUHJlZml4OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBjb250YWluZXJTZWxlY3RvcjogZmFsc2UsXG4gICAgICAgICAgICAgICAgc2VsZWN0b3JBdHRyOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zIC8vIFVzaW5nIG9iamVjdCBzcHJlYWQgaGVyZVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY29uc3QgZWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuc2VsZWN0b3IpO1xuICAgICAgICAgICAgZWxlbWVudHMuZm9yRWFjaChlbGVtZW50ID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3coZWxlbWVudCwgc2V0dGluZ3MsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaG93KGVsZW1lbnQsIHNldHRpbmdzLCB0cnVlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNob3c6IGZ1bmN0aW9uIChlbGVtZW50LCBzZXR0aW5ncywgcmVwbGFjZSkge1xuICAgICAgICAgICAgbGV0IHNlbGVjdGVkVmFsdWUgPSBlbGVtZW50LnZhbHVlO1xuICAgICAgICAgICAgbGV0IHByb3RvdHlwZVByZWZpeCA9IGVsZW1lbnQuaWQ7XG5cbiAgICAgICAgICAgIGlmIChzZXR0aW5ncy5zZWxlY3RvckF0dHIpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzZWxlY3RlZE9wdGlvbiA9IEFycmF5LmZyb20oZWxlbWVudC5vcHRpb25zKS5maW5kKG9wdGlvbiA9PiBvcHRpb24udmFsdWUgPT09IHNlbGVjdGVkVmFsdWUpO1xuICAgICAgICAgICAgICAgIGlmIChzZWxlY3RlZE9wdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZFZhbHVlID0gc2VsZWN0ZWRPcHRpb24uZ2V0QXR0cmlidXRlKHNldHRpbmdzLnNlbGVjdG9yQXR0cik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoc2V0dGluZ3MucHJvdG90eXBlUHJlZml4KSB7XG4gICAgICAgICAgICAgICAgcHJvdG90eXBlUHJlZml4ID0gc2V0dGluZ3MucHJvdG90eXBlUHJlZml4O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBwcm90b3R5cGVFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYCR7cHJvdG90eXBlUHJlZml4fV8ke3NlbGVjdGVkVmFsdWV9YCk7XG4gICAgICAgICAgICBsZXQgY29udGFpbmVyID0gdGhpcy5nZXRDb250YWluZXIoc2V0dGluZ3MsIHByb3RvdHlwZUVsZW1lbnQpO1xuXG4gICAgICAgICAgICBpZiAoIWNvbnRhaW5lcikge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFwcm90b3R5cGVFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyLmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHJlcGxhY2UgfHwgIWNvbnRhaW5lci5pbm5lckhUTUwudHJpbSgpKSB7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyLmlubmVySFRNTCA9IHByb3RvdHlwZUVsZW1lbnQuZGF0YXNldC5wcm90b3R5cGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Q29udGFpbmVyOiBmdW5jdGlvbiAoc2V0dGluZ3MsIHByb3RvdHlwZUVsZW1lbnQpIHtcbiAgICAgICAgICAgIGlmIChzZXR0aW5ncy5jb250YWluZXJTZWxlY3Rvcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNldHRpbmdzLmNvbnRhaW5lclNlbGVjdG9yKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZGF0YUNvbnRhaW5lcklkID0gcHJvdG90eXBlRWxlbWVudCA/IHByb3RvdHlwZUVsZW1lbnQuZGF0YXNldC5jb250YWluZXIgOiBudWxsO1xuICAgICAgICAgICAgICAgIHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChkYXRhQ29udGFpbmVySWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIEV4dGVuZGluZyB0aGUgcHJvdG90eXBlIG9mIE5vZGVMaXN0XG4gICAgTm9kZUxpc3QucHJvdG90eXBlLmhhbmRsZVByb3RvdHlwZXMgPSBmdW5jdGlvbiAobWV0aG9kKSB7XG4gICAgICAgIGlmIChtZXRob2RzW21ldGhvZF0pIHtcbiAgICAgICAgICAgIHJldHVybiBtZXRob2RzW21ldGhvZF0uYXBwbHkodGhpcywgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIG1ldGhvZCA9PT0gJ29iamVjdCcgfHwgIW1ldGhvZCkge1xuICAgICAgICAgICAgcmV0dXJuIG1ldGhvZHMuaW5pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNZXRob2QgJyArIG1ldGhvZCArICcgZG9lcyBub3QgZXhpc3Qgb24gaGFuZGxlUHJvdG90eXBlcycpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIFRvIGFsbG93IGNhbGxpbmcgaGFuZGxlUHJvdG90eXBlcyBkaXJlY3RseSBvbiBhbnkgZWxlbWVudFxuICAgIEhUTUxFbGVtZW50LnByb3RvdHlwZS5oYW5kbGVQcm90b3R5cGVzID0gZnVuY3Rpb24gKG1ldGhvZCkge1xuICAgICAgICByZXR1cm4gbWV0aG9kcy5oYW5kbGVQcm90b3R5cGVzLmNhbGwoW3RoaXNdLCBtZXRob2QpO1xuICAgIH07XG5cbn0oKSk7XG4iLCJkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IG1hcEJsb2NrID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hcC1ibG9jaycpO1xuXG4gICAgaWYgKG1hcEJsb2NrKSB7XG4gICAgICAgIG1hcEJsb2NrLnN0eWxlLmhlaWdodCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYXAtd3JhcHBlcicpLmNsaWVudEhlaWdodCArICdweCc7XG5cbiAgICAgICAgZnVuY3Rpb24gaW5pdGlhbGl6ZSgpIHtcbiAgICAgICAgICAgIGNvbnN0IG1hcE9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgem9vbTogMTgsXG4gICAgICAgICAgICAgICAgY2VudGVyOiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKDQ4LjE1OTI1MTMsIDE0LjAyMzAyNTEwMDAwMDA0KSxcbiAgICAgICAgICAgICAgICBkaXNhYmxlRGVmYXVsdFVJOiB0cnVlXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3QgbWFwTmV3ID0gbmV3IGdvb2dsZS5tYXBzLk1hcChtYXBCbG9jaywgbWFwT3B0aW9ucyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhtYXBOZXcpO1xuICAgICAgICB9XG5cbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBpbml0aWFsaXplKTtcbiAgICB9XG59KTtcbiIsImNvbnN0IHNob3AgPSB3aW5kb3cuc2hvcCB8fCB7fTtcblxuKGZ1bmN0aW9uIChzaG9wKSB7XG4gICAgc2hvcC5pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBzaG9wLmluaXRDaGFuZ2VBZGRyZXNzKCk7XG4gICAgICAgIHNob3AuaW5pdENhcnRTaGlwbWVudENhbGN1bGF0b3IoKTtcbiAgICAgICAgc2hvcC5pbml0UXVhbnRpdHlWYWxpZGF0b3IoKTtcbiAgICAgICAgc2hvcC5pbml0Q2F0ZWdvcnlTZWxlY3QoKTtcblxuICAgICAgICBoYW5kbGVQcm90b3R5cGVzKHtcbiAgICAgICAgICAgICdwcm90b3R5cGVQcmVmaXgnOiAncGF5bWVudFByb3ZpZGVyJyxcbiAgICAgICAgICAgICdjb250YWluZXJTZWxlY3Rvcic6ICcucGF5bWVudFNldHRpbmdzJyxcbiAgICAgICAgICAgICdzZWxlY3RvckF0dHInOiAnZGF0YS1mYWN0b3J5J1xuICAgICAgICB9KTtcblxuICAgICAgICBzZXR1cENvcHlUb0NsaXBib2FyZCgpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVQcm90b3R5cGVzKG9wdGlvbnMpIHtcbiAgICAgICAgY29uc3Qgc2V0dGluZ3MgPSB7XG4gICAgICAgICAgICBwcm90b3R5cGVQcmVmaXg6IG9wdGlvbnMucHJvdG90eXBlUHJlZml4IHx8IGZhbHNlLFxuICAgICAgICAgICAgY29udGFpbmVyU2VsZWN0b3I6IG9wdGlvbnMuY29udGFpbmVyU2VsZWN0b3IgfHwgZmFsc2UsXG4gICAgICAgICAgICBzZWxlY3RvckF0dHI6IG9wdGlvbnMuc2VsZWN0b3JBdHRyIHx8IGZhbHNlXG4gICAgICAgIH07XG5cbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChgW2RhdGEtJHtzZXR0aW5ncy5wcm90b3R5cGVQcmVmaXh9XWApLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHNob3dFbGVtZW50KGVsZW1lbnQsIGZhbHNlKTtcbiAgICAgICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNob3dFbGVtZW50KGVsZW1lbnQsIHRydWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZ1bmN0aW9uIHNob3dFbGVtZW50KGVsZW1lbnQsIHJlcGxhY2UpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkVmFsdWUgPSBnZXRTZWxlY3RlZFZhbHVlKGVsZW1lbnQpO1xuICAgICAgICAgICAgY29uc3QgcHJvdG90eXBlUHJlZml4ID0gc2V0dGluZ3MucHJvdG90eXBlUHJlZml4IHx8IGVsZW1lbnQuaWQ7XG4gICAgICAgICAgICBjb25zdCBwcm90b3R5cGVFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYCR7cHJvdG90eXBlUHJlZml4fV8ke3NlbGVjdGVkVmFsdWV9YCk7XG4gICAgICAgICAgICBjb25zdCBjb250YWluZXIgPSBnZXRDb250YWluZXIocHJvdG90eXBlRWxlbWVudCk7XG5cbiAgICAgICAgICAgIGlmIChjb250YWluZXIgJiYgKHJlcGxhY2UgfHwgIWNvbnRhaW5lci5pbm5lckhUTUwudHJpbSgpKSkge1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSBwcm90b3R5cGVFbGVtZW50ID8gcHJvdG90eXBlRWxlbWVudC5kYXRhc2V0LnByb3RvdHlwZSA6ICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZ2V0U2VsZWN0ZWRWYWx1ZShlbGVtZW50KSB7XG4gICAgICAgICAgICBpZiAoc2V0dGluZ3Muc2VsZWN0b3JBdHRyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQucXVlcnlTZWxlY3RvcihgW3ZhbHVlPVwiJHtlbGVtZW50LnZhbHVlfVwiXWApLmdldEF0dHJpYnV0ZShzZXR0aW5ncy5zZWxlY3RvckF0dHIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQudmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBnZXRDb250YWluZXIocHJvdG90eXBlRWxlbWVudCkge1xuICAgICAgICAgICAgaWYgKHNldHRpbmdzLmNvbnRhaW5lclNlbGVjdG9yKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2V0dGluZ3MuY29udGFpbmVyU2VsZWN0b3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb3RvdHlwZUVsZW1lbnQgPyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHByb3RvdHlwZUVsZW1lbnQuZGF0YXNldC5jb250YWluZXIpIDogbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNldHVwQ29weVRvQ2xpcGJvYXJkKCkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY29weS10by1jbGlwYm9hcmQnKS5mb3JFYWNoKGZ1bmN0aW9uIChidXR0b24pIHtcbiAgICAgICAgICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGNvcHlUZXh0VG9DbGlwYm9hcmQodGhpcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29weVRleHRUb0NsaXBib2FyZChidXR0b24pIHtcbiAgICAgICAgY29uc3QgdGFyZ2V0SWQgPSBidXR0b24uZGF0YXNldC50YXJnZXQ7XG4gICAgICAgIGNvbnN0IGNvcHlUZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGFyZ2V0SWQpO1xuXG4gICAgICAgIGlmIChjb3B5VGV4dCkge1xuICAgICAgICAgICAgY29weVRleHQuc2VsZWN0KCk7XG4gICAgICAgICAgICBjb3B5VGV4dC5zZXRTZWxlY3Rpb25SYW5nZSgwLCA5OTk5OSk7IC8vIEZvciBtb2JpbGUgZGV2aWNlc1xuXG4gICAgICAgICAgICBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChjb3B5VGV4dC52YWx1ZSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYnV0dG9uLmRhdGFzZXQuY29waWVkVGV4dCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNob3AuaW5pdENhdGVnb3J5U2VsZWN0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnNpdGUtcmVsb2FkXCIpLmZvckVhY2goZnVuY3Rpb24gKHNlbGVjdCkge1xuICAgICAgICAgICAgc2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSB1cGRhdGVRdWVyeVN0cmluZ1BhcmFtZXRlcih3aW5kb3cubG9jYXRpb24uaHJlZiwgdGhpcy5uYW1lLCB0aGlzLnZhbHVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gdXBkYXRlUXVlcnlTdHJpbmdQYXJhbWV0ZXIodXJpLCBrZXksIHZhbHVlKSB7XG4gICAgICAgIGNvbnN0IHJlID0gbmV3IFJlZ0V4cChcIihbPyZdKVwiICsga2V5ICsgXCI9Lio/KCZ8JClcIiwgXCJpXCIpO1xuICAgICAgICBjb25zdCBzZXBhcmF0b3IgPSB1cmkuaW5kZXhPZignPycpICE9PSAtMSA/IFwiJlwiIDogXCI/XCI7XG4gICAgICAgIHJldHVybiB1cmkubWF0Y2gocmUpID8gdXJpLnJlcGxhY2UocmUsICckMScgKyBrZXkgKyBcIj1cIiArIHZhbHVlICsgJyQyJykgOiB1cmkgKyBzZXBhcmF0b3IgKyBrZXkgKyBcIj1cIiArIHZhbHVlO1xuICAgIH1cblxuICAgIHNob3AuaW5pdFF1YW50aXR5VmFsaWRhdG9yID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBjb3Jlc2hvcFF1YW50aXR5U2VsZWN0b3Ioe1xuICAgICAgICAgICAgYnV0dG9uZG93bl9jbGFzczogJ2J0biBidG4tc2Vjb25kYXJ5JyxcbiAgICAgICAgICAgIGJ1dHRvbnVwX2NsYXNzOiAnYnRuIGJ0bi1zZWNvbmRhcnknLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgc2hvcC5pbml0Q2FydFNoaXBtZW50Q2FsY3VsYXRvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICBjb25zdCBmb3JtID0gZXYudGFyZ2V0LmNsb3Nlc3QoJ2Zvcm1bbmFtZT1cImNvcmVzaG9wX3NoaXBwaW5nX2NhbGN1bGF0b3JcIl0nKTtcbiAgICAgICAgICAgIGlmIChmb3JtKSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlU2hpcG1lbnRDYWxjdWxhdGlvbihmb3JtKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGhhbmRsZVNoaXBtZW50Q2FsY3VsYXRpb24oZm9ybSkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBmb3JtLmNsYXNzTGlzdC5hZGQoJ2xvYWRpbmcnKTtcbiAgICAgICAgZm9ybS5xdWVyeVNlbGVjdG9yKCdidXR0b25bdHlwZT1cInN1Ym1pdFwiXScpLnNldEF0dHJpYnV0ZSgnZGlzYWJsZWQnLCAnZGlzYWJsZWQnKTtcbiAgICAgICAgZm9ybS5jbG9zZXN0KCcuY2FydC1zaGlwbWVudC1jYWxjdWxhdGlvbi1ib3gnKS5xdWVyeVNlbGVjdG9yKCcuY2FydC1zaGlwbWVudC1hdmFpbGFibGUtY2FycmllcnMnKS5zdHlsZS5vcGFjaXR5ID0gMC4yO1xuXG4gICAgICAgIGZldGNoKGZvcm0uYWN0aW9uLCB7XG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIGJvZHk6IG5ldyBVUkxTZWFyY2hQYXJhbXMobmV3IEZvcm1EYXRhKGZvcm0pKVxuICAgICAgICB9KVxuICAgICAgICAudGhlbihyZXNwb25zZSA9PiByZXNwb25zZS50ZXh0KCkpXG4gICAgICAgIC50aGVuKHJlcyA9PiB1cGRhdGVTaGlwbWVudENhbGN1bGF0aW9uKGZvcm0sIHJlcykpXG4gICAgICAgIC5jYXRjaChlcnJvciA9PiBoYW5kbGVTaGlwbWVudEVycm9yKGZvcm0sIGVycm9yKSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlU2hpcG1lbnRDYWxjdWxhdGlvbihmb3JtLCByZXNwb25zZVRleHQpIHtcbiAgICAgICAgZm9ybS5jbGFzc0xpc3QucmVtb3ZlKCdsb2FkaW5nJyk7XG4gICAgICAgIGZvcm0uY2xvc2VzdCgnLmNhcnQtc2hpcG1lbnQtY2FsY3VsYXRpb24tYm94Jykub3V0ZXJIVE1MID0gcmVzcG9uc2VUZXh0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhhbmRsZVNoaXBtZW50RXJyb3IoZm9ybSwgZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3I6JywgZXJyb3IpO1xuICAgICAgICBmb3JtLmNsYXNzTGlzdC5yZW1vdmUoJ2xvYWRpbmcnKTtcbiAgICAgICAgZm9ybS5xdWVyeVNlbGVjdG9yKCdidXR0b25bdHlwZT1cInN1Ym1pdFwiXScpLnJlbW92ZUF0dHJpYnV0ZSgnZGlzYWJsZWQnKTtcbiAgICB9XG5cbiAgICBzaG9wLmluaXRDaGFuZ2VBZGRyZXNzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zdCBhZGRyZXNzU3RlcCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jaGVja291dC1zdGVwLnN0ZXAtYWRkcmVzcycpO1xuICAgICAgICBpZiAoIWFkZHJlc3NTdGVwKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgaW52b2ljZUFkZHJlc3MgPSBhZGRyZXNzU3RlcC5xdWVyeVNlbGVjdG9yKCdzZWxlY3RbbmFtZT1cImNvcmVzaG9wW2ludm9pY2VBZGRyZXNzXVwiXScpO1xuICAgICAgICBjb25zdCBzaGlwcGluZ0FkZHJlc3MgPSBhZGRyZXNzU3RlcC5xdWVyeVNlbGVjdG9yKCdzZWxlY3RbbmFtZT1cImNvcmVzaG9wW3NoaXBwaW5nQWRkcmVzc11cIl0nKTtcbiAgICAgICAgY29uc3QgdXNlSWFzUyA9IGFkZHJlc3NTdGVwLnF1ZXJ5U2VsZWN0b3IoJ1tuYW1lPVwiY29yZXNob3BbdXNlSW52b2ljZUFzU2hpcHBpbmddXCJdJyk7XG5cbiAgICAgICAgc2V0dXBBZGRyZXNzQ2hhbmdlRXZlbnRzKGludm9pY2VBZGRyZXNzLCBzaGlwcGluZ0FkZHJlc3MsIHVzZUlhc1MpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBzZXR1cEFkZHJlc3NDaGFuZ2VFdmVudHMoaW52b2ljZUFkZHJlc3MsIHNoaXBwaW5nQWRkcmVzcywgdXNlSWFzUykge1xuICAgICAgICBpbnZvaWNlQWRkcmVzcy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB1cGRhdGVBZGRyZXNzKGludm9pY2VBZGRyZXNzLCB1c2VJYXNTKSk7XG4gICAgICAgIHNoaXBwaW5nQWRkcmVzcy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiB1cGRhdGVTaGlwcGluZ0FkZHJlc3Moc2hpcHBpbmdBZGRyZXNzKSk7XG4gICAgICAgIGlmICh1c2VJYXNTKSB1c2VJYXNTLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsICgpID0+IHRvZ2dsZVNoaXBwaW5nQWRkcmVzcyh1c2VJYXNTLCBpbnZvaWNlQWRkcmVzcywgc2hpcHBpbmdBZGRyZXNzKSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlQWRkcmVzcyhpbnZvaWNlQWRkcmVzcywgdXNlSWFzUykge1xuICAgICAgICBjb25zdCBzZWxlY3RlZCA9IGludm9pY2VBZGRyZXNzLm9wdGlvbnNbaW52b2ljZUFkZHJlc3Muc2VsZWN0ZWRJbmRleF07XG4gICAgICAgIGNvbnN0IGFkZHJlc3MgPSBKU09OLnBhcnNlKHNlbGVjdGVkLmRhdGFzZXQuYWRkcmVzcykuaHRtbDtcbiAgICAgICAgY29uc3QgaW52b2ljZVBhbmVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnBhbmVsLWludm9pY2UtYWRkcmVzcycpO1xuICAgICAgICBpbnZvaWNlUGFuZWwuaW5uZXJIVE1MID0gYWRkcmVzcyB8fCAnJztcblxuICAgICAgICB0b2dnbGVVc2VBc1NoaXBwaW5nKHVzZUlhc1MsIHNlbGVjdGVkLmRhdGFzZXQuYWRkcmVzc1R5cGUgPT09ICdpbnZvaWNlJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdG9nZ2xlVXNlQXNTaGlwcGluZyh1c2VJYXNTLCBpc0ludm9pY2VUeXBlKSB7XG4gICAgICAgIGlmICh1c2VJYXNTKSB7XG4gICAgICAgICAgICB1c2VJYXNTLmRpc2FibGVkID0gaXNJbnZvaWNlVHlwZTtcbiAgICAgICAgICAgIGlmIChpc0ludm9pY2VUeXBlKSB7XG4gICAgICAgICAgICAgICAgdXNlSWFzUy5jaGVja2VkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdXNlSWFzUy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnY2hhbmdlJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlU2hpcHBpbmdBZGRyZXNzKHNoaXBwaW5nQWRkcmVzcykge1xuICAgICAgICBjb25zdCBzZWxlY3RlZCA9IHNoaXBwaW5nQWRkcmVzcy5vcHRpb25zW3NoaXBwaW5nQWRkcmVzcy5zZWxlY3RlZEluZGV4XTtcbiAgICAgICAgY29uc3QgYWRkcmVzcyA9IEpTT04ucGFyc2Uoc2VsZWN0ZWQuZGF0YXNldC5hZGRyZXNzKS5odG1sO1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucGFuZWwtc2hpcHBpbmctYWRkcmVzcycpLmlubmVySFRNTCA9IGFkZHJlc3MgfHwgJyc7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdG9nZ2xlU2hpcHBpbmdBZGRyZXNzKHVzZUlhc1MsIGludm9pY2VBZGRyZXNzLCBzaGlwcGluZ0FkZHJlc3MpIHtcbiAgICAgICAgY29uc3Qgc2hpcHBpbmdGaWVsZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zaGlwcGluZy1hZGRyZXNzLXNlbGVjdG9yJyk7XG4gICAgICAgIGNvbnN0IHNoaXBwaW5nQWRkQWRkcmVzc0J1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jYXJkLWZvb3RlcicpO1xuXG4gICAgICAgIGlmICh1c2VJYXNTLmNoZWNrZWQpIHtcbiAgICAgICAgICAgIHNoaXBwaW5nRmllbGQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgIHNoaXBwaW5nQWRkcmVzcy52YWx1ZSA9IGludm9pY2VBZGRyZXNzLnZhbHVlO1xuICAgICAgICAgICAgc2hpcHBpbmdBZGRyZXNzLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdjaGFuZ2UnKSk7XG4gICAgICAgICAgICBpZiAoc2hpcHBpbmdBZGRBZGRyZXNzQnV0dG9uKSBzaGlwcGluZ0FkZEFkZHJlc3NCdXR0b24uY2xhc3NMaXN0LmFkZCgnZC1ub25lJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzaGlwcGluZ0ZpZWxkLnN0eWxlLmRpc3BsYXkgPSAnJztcbiAgICAgICAgICAgIGlmIChzaGlwcGluZ0FkZEFkZHJlc3NCdXR0b24pIHNoaXBwaW5nQWRkQWRkcmVzc0J1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKCdkLW5vbmUnKTtcbiAgICAgICAgfVxuICAgIH1cblxufShzaG9wKSk7XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgc2hvcC5pbml0KCk7XG59KTtcbiIsIihmdW5jdGlvbiAodmFyaWFudCkge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHdpbmRvdy52YXJpYW50UmVhZHkgPSBmYWxzZTtcblxuICAgICAgICB2YXJpYW50LmluaXQoKTtcblxuICAgICAgICB3aW5kb3cudmFyaWFudFJlYWR5ID0gdHJ1ZTtcbiAgICB9KTtcblxuICAgIHZhcmlhbnQuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29uc3QgdmFyaWFudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucHJvZHVjdC1pbmZvX19hdHRyaWJ1dGVzJyk7XG4gICAgICAgIGlmICghdmFyaWFudHMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvcmVzaG9wVmFyaWFudFNlbGVjdG9yKHZhcmlhbnRzKTsgLy8gRW5zdXJlIHRoaXMgZnVuY3Rpb24gaXMgZGVmaW5lZCBpbiB5b3VyIGdsb2JhbCBzY29wZVxuXG4gICAgICAgIHZhcmlhbnRzLmFkZEV2ZW50TGlzdGVuZXIoJ3ZhcmlhbnRfc2VsZWN0b3Iuc2VsZWN0JywgKGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG9wdGlvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucHJvZHVjdC1pbmZvIC5wcm9kdWN0LWRldGFpbHMgLm9wdGlvbnMnKTtcblxuICAgICAgICAgICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzdWJtaXRzID0gb3B0aW9ucy5xdWVyeVNlbGVjdG9yQWxsKCdbdHlwZT1cInN1Ym1pdFwiXScpO1xuXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5jbGFzc0xpc3QuYWRkKCdkaXNhYmxlZCcpO1xuXG4gICAgICAgICAgICAgICAgc3VibWl0cy5mb3JFYWNoKChzdWJtaXQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgc3VibWl0LmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcbn0od2luZG93LnZhcmlhbnQgfHwgKHdpbmRvdy52YXJpYW50ID0ge30pKSk7IC8vIEV4dHJhY3RlZCBhc3NpZ25tZW50XG4iLCIvKiBTVFlMRVMgICovXG5pbXBvcnQgJy4uL3Njc3MvYXBwLnNjc3MnO1xuaW1wb3J0ICdzd2lwZXIvY3NzL2J1bmRsZSc7XG4vKiBKUyAqL1xuaW1wb3J0ICdib290c3RyYXAnO1xuaW1wb3J0ICcuL3NjcmlwdHMvaGFuZGxlLXByb3RvdHlwZXMuanMnO1xuaW1wb3J0ICcuL3BsdWdpbi9jb3Jlc2hvcC5wbHVnaW4ucXVhbnRpdHkuanMnO1xuaW1wb3J0ICcuL3BsdWdpbi9jb3Jlc2hvcC5wbHVnaW4udmFyaWFudC5qcyc7XG5pbXBvcnQgJy4vc2NyaXB0cy9zaG9wLmpzJztcbmltcG9ydCAnLi9zY3JpcHRzL3ZhcmlhbnQuanMnO1xuaW1wb3J0ICcuL3NjcmlwdHMvbWFwLmpzJztcbmltcG9ydCB7IENhcm91c2VsIH0gZnJvbSAnLi9zY3JpcHRzL2Nhcm91c2VsJztcbmltcG9ydCB7IENhcnRJbmZvIH0gZnJvbSAnLi9zY3JpcHRzL2NhcnRJbmZvJztcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgbmV3IENhcnRJbmZvKCcvY29yZXNob3BfZ2V0X2NhcnRfaXRlbXMnLCAnLmpzLWNhcnQtd2lkZ2V0Jyk7XG4gICAgbmV3IENhcm91c2VsKCk7XG59KTtcbiIsImltcG9ydCBTd2lwZXIgZnJvbSAnc3dpcGVyJztcbmltcG9ydCB7IFRodW1icyB9IGZyb20gXCJzd2lwZXIvbW9kdWxlc1wiO1xudmFyIENhcm91c2VsID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIENhcm91c2VsKCkge1xuICAgICAgICB0aGlzLl9pbml0Q2Fyb3VzZWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvKiBJbml0IHN3aXBlciB3aXRoIHRodW1icyAqL1xuICAgICAgICAgICAgdmFyIHNsaWRlclRodW1ibmFpbCA9IG5ldyBTd2lwZXIoJy5qcy1zbGlkZXItdGh1bWJuYWlsJywge1xuICAgICAgICAgICAgICAgIHNsaWRlc1BlclZpZXc6IDMsXG4gICAgICAgICAgICAgICAgZnJlZU1vZGU6IHRydWUsXG4gICAgICAgICAgICAgICAgc3BhY2VCZXR3ZWVuOiAnOHB4JyxcbiAgICAgICAgICAgICAgICB3YXRjaFNsaWRlc1Byb2dyZXNzOiB0cnVlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgbWFpblNsaWRlciA9IG5ldyBTd2lwZXIoJy5qcy1zbGlkZXInLCB7XG4gICAgICAgICAgICAgICAgbW9kdWxlczogW1RodW1ic10sIC8vIEluY2x1ZGUgdGhlIFRodW1icyBtb2R1bGVcbiAgICAgICAgICAgICAgICBuYXZpZ2F0aW9uOiB7XG4gICAgICAgICAgICAgICAgICAgIG5leHRFbDogJy5zd2lwZXItYnV0dG9uLW5leHQnLFxuICAgICAgICAgICAgICAgICAgICBwcmV2RWw6ICcuc3dpcGVyLWJ1dHRvbi1wcmV2JyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHRodW1iczoge1xuICAgICAgICAgICAgICAgICAgICBzd2lwZXI6IHNsaWRlclRodW1ibmFpbCAvLyBMaW5rIHRodW1ibmFpbCBzd2lwZXJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKG1haW5TbGlkZXIpO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLl9pbml0Q2Fyb3VzZWwoKTtcbiAgICB9XG4gICAgcmV0dXJuIENhcm91c2VsO1xufSgpKTtcbmV4cG9ydCB7IENhcm91c2VsIH07XG4iLCJ2YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xuICAgIH0pO1xufTtcbnZhciBfX2dlbmVyYXRvciA9ICh0aGlzICYmIHRoaXMuX19nZW5lcmF0b3IpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBib2R5KSB7XG4gICAgdmFyIF8gPSB7IGxhYmVsOiAwLCBzZW50OiBmdW5jdGlvbigpIHsgaWYgKHRbMF0gJiAxKSB0aHJvdyB0WzFdOyByZXR1cm4gdFsxXTsgfSwgdHJ5czogW10sIG9wczogW10gfSwgZiwgeSwgdCwgZyA9IE9iamVjdC5jcmVhdGUoKHR5cGVvZiBJdGVyYXRvciA9PT0gXCJmdW5jdGlvblwiID8gSXRlcmF0b3IgOiBPYmplY3QpLnByb3RvdHlwZSk7XG4gICAgcmV0dXJuIGcubmV4dCA9IHZlcmIoMCksIGdbXCJ0aHJvd1wiXSA9IHZlcmIoMSksIGdbXCJyZXR1cm5cIl0gPSB2ZXJiKDIpLCB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgKGdbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpczsgfSksIGc7XG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IHJldHVybiBmdW5jdGlvbiAodikgeyByZXR1cm4gc3RlcChbbiwgdl0pOyB9OyB9XG4gICAgZnVuY3Rpb24gc3RlcChvcCkge1xuICAgICAgICBpZiAoZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IGV4ZWN1dGluZy5cIik7XG4gICAgICAgIHdoaWxlIChnICYmIChnID0gMCwgb3BbMF0gJiYgKF8gPSAwKSksIF8pIHRyeSB7XG4gICAgICAgICAgICBpZiAoZiA9IDEsIHkgJiYgKHQgPSBvcFswXSAmIDIgPyB5W1wicmV0dXJuXCJdIDogb3BbMF0gPyB5W1widGhyb3dcIl0gfHwgKCh0ID0geVtcInJldHVyblwiXSkgJiYgdC5jYWxsKHkpLCAwKSA6IHkubmV4dCkgJiYgISh0ID0gdC5jYWxsKHksIG9wWzFdKSkuZG9uZSkgcmV0dXJuIHQ7XG4gICAgICAgICAgICBpZiAoeSA9IDAsIHQpIG9wID0gW29wWzBdICYgMiwgdC52YWx1ZV07XG4gICAgICAgICAgICBzd2l0Y2ggKG9wWzBdKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAwOiBjYXNlIDE6IHQgPSBvcDsgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSA0OiBfLmxhYmVsKys7IHJldHVybiB7IHZhbHVlOiBvcFsxXSwgZG9uZTogZmFsc2UgfTtcbiAgICAgICAgICAgICAgICBjYXNlIDU6IF8ubGFiZWwrKzsgeSA9IG9wWzFdOyBvcCA9IFswXTsgY29udGludWU7XG4gICAgICAgICAgICAgICAgY2FzZSA3OiBvcCA9IF8ub3BzLnBvcCgpOyBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGlmICghKHQgPSBfLnRyeXMsIHQgPSB0Lmxlbmd0aCA+IDAgJiYgdFt0Lmxlbmd0aCAtIDFdKSAmJiAob3BbMF0gPT09IDYgfHwgb3BbMF0gPT09IDIpKSB7IF8gPSAwOyBjb250aW51ZTsgfVxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDMgJiYgKCF0IHx8IChvcFsxXSA+IHRbMF0gJiYgb3BbMV0gPCB0WzNdKSkpIHsgXy5sYWJlbCA9IG9wWzFdOyBicmVhazsgfVxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDYgJiYgXy5sYWJlbCA8IHRbMV0pIHsgXy5sYWJlbCA9IHRbMV07IHQgPSBvcDsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHQgJiYgXy5sYWJlbCA8IHRbMl0pIHsgXy5sYWJlbCA9IHRbMl07IF8ub3BzLnB1c2gob3ApOyBicmVhazsgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodFsyXSkgXy5vcHMucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgIF8udHJ5cy5wb3AoKTsgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvcCA9IGJvZHkuY2FsbCh0aGlzQXJnLCBfKTtcbiAgICAgICAgfSBjYXRjaCAoZSkgeyBvcCA9IFs2LCBlXTsgeSA9IDA7IH0gZmluYWxseSB7IGYgPSB0ID0gMDsgfVxuICAgICAgICBpZiAob3BbMF0gJiA1KSB0aHJvdyBvcFsxXTsgcmV0dXJuIHsgdmFsdWU6IG9wWzBdID8gb3BbMV0gOiB2b2lkIDAsIGRvbmU6IHRydWUgfTtcbiAgICB9XG59O1xudmFyIENhcnRJbmZvID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIENhcnRJbmZvKGFwaVVybCwgZWxlbWVudFNlbGVjdG9yKSB7XG4gICAgICAgIHRoaXMuYXBpVXJsID0gYXBpVXJsO1xuICAgICAgICB0aGlzLmVsZW1lbnRTZWxlY3RvciA9IGVsZW1lbnRTZWxlY3RvcjtcbiAgICAgICAgdGhpcy5faW5pdENhcnRXaWRnZXQoKTtcbiAgICB9XG4gICAgQ2FydEluZm8ucHJvdG90eXBlLmZldGNoQ2FydEl0ZW1zID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgcmVzcG9uc2UsIGh0bWwsIGVycm9yXzE7XG4gICAgICAgICAgICByZXR1cm4gX19nZW5lcmF0b3IodGhpcywgZnVuY3Rpb24gKF9hKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChfYS5sYWJlbCkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgICAgICAgICBfYS50cnlzLnB1c2goWzAsIDMsICwgNF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFs0IC8qeWllbGQqLywgZmV0Y2godGhpcy5hcGlVcmwpXTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UgPSBfYS5zZW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignVGhlcmUgaGFzIGJlZW4gYSBwcm9ibGVtIHdpdGggeW91ciBmZXRjaCBvcGVyYXRpb246JywgcmVzcG9uc2Uuc3RhdHVzVGV4dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFsyIC8qcmV0dXJuKi9dOyAvLyBBZGRlZCByZXR1cm4gdG8gcHJldmVudCBmdXJ0aGVyIGV4ZWN1dGlvbiBpZiB0aGVyZSdzIGFuIGVycm9yXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzQgLyp5aWVsZCovLCByZXNwb25zZS50ZXh0KCldO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgICAgICAgICBodG1sID0gX2Euc2VudCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXNwbGF5Q2FydEl0ZW1zKGh0bWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFszIC8qYnJlYWsqLywgNF07XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yXzEgPSBfYS5zZW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdUaGVyZSBoYXMgYmVlbiBhIHByb2JsZW0gd2l0aCB5b3VyIGZldGNoIG9wZXJhdGlvbjonLCBlcnJvcl8xKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbMyAvKmJyZWFrKi8sIDRdO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDQ6IHJldHVybiBbMiAvKnJldHVybiovXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBDYXJ0SW5mby5wcm90b3R5cGUuX2luaXRDYXJ0V2lkZ2V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmZldGNoQ2FydEl0ZW1zKCk7XG4gICAgfTtcbiAgICBDYXJ0SW5mby5wcm90b3R5cGUuZGlzcGxheUNhcnRJdGVtcyA9IGZ1bmN0aW9uIChodG1sKSB7XG4gICAgICAgIHZhciBjYXJ0RmxhZyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5lbGVtZW50U2VsZWN0b3IpO1xuICAgICAgICBpZiAoY2FydEZsYWcpIHtcbiAgICAgICAgICAgIHZhciBsb2FkZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtY2FydC1sb2FkZXInKTtcbiAgICAgICAgICAgIGlmIChsb2FkZXIpIHtcbiAgICAgICAgICAgICAgICBsb2FkZXIucmVtb3ZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXJ0RmxhZy5pbm5lckhUTUwgKz0gaHRtbDtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIENhcnRJbmZvO1xufSgpKTtcbmV4cG9ydCB7IENhcnRJbmZvIH07XG4iLCIvLyBleHRyYWN0ZWQgYnkgbWluaS1jc3MtZXh0cmFjdC1wbHVnaW5cbmV4cG9ydCB7fTsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuLy8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbl9fd2VicGFja19yZXF1aXJlX18ubSA9IF9fd2VicGFja19tb2R1bGVzX187XG5cbiIsInZhciBkZWZlcnJlZCA9IFtdO1xuX193ZWJwYWNrX3JlcXVpcmVfXy5PID0gKHJlc3VsdCwgY2h1bmtJZHMsIGZuLCBwcmlvcml0eSkgPT4ge1xuXHRpZihjaHVua0lkcykge1xuXHRcdHByaW9yaXR5ID0gcHJpb3JpdHkgfHwgMDtcblx0XHRmb3IodmFyIGkgPSBkZWZlcnJlZC5sZW5ndGg7IGkgPiAwICYmIGRlZmVycmVkW2kgLSAxXVsyXSA+IHByaW9yaXR5OyBpLS0pIGRlZmVycmVkW2ldID0gZGVmZXJyZWRbaSAtIDFdO1xuXHRcdGRlZmVycmVkW2ldID0gW2NodW5rSWRzLCBmbiwgcHJpb3JpdHldO1xuXHRcdHJldHVybjtcblx0fVxuXHR2YXIgbm90RnVsZmlsbGVkID0gSW5maW5pdHk7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgZGVmZXJyZWQubGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgY2h1bmtJZHMgPSBkZWZlcnJlZFtpXVswXTtcblx0XHR2YXIgZm4gPSBkZWZlcnJlZFtpXVsxXTtcblx0XHR2YXIgcHJpb3JpdHkgPSBkZWZlcnJlZFtpXVsyXTtcblx0XHR2YXIgZnVsZmlsbGVkID0gdHJ1ZTtcblx0XHRmb3IgKHZhciBqID0gMDsgaiA8IGNodW5rSWRzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRpZiAoKHByaW9yaXR5ICYgMSA9PT0gMCB8fCBub3RGdWxmaWxsZWQgPj0gcHJpb3JpdHkpICYmIE9iamVjdC5rZXlzKF9fd2VicGFja19yZXF1aXJlX18uTykuZXZlcnkoKGtleSkgPT4gKF9fd2VicGFja19yZXF1aXJlX18uT1trZXldKGNodW5rSWRzW2pdKSkpKSB7XG5cdFx0XHRcdGNodW5rSWRzLnNwbGljZShqLS0sIDEpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZnVsZmlsbGVkID0gZmFsc2U7XG5cdFx0XHRcdGlmKHByaW9yaXR5IDwgbm90RnVsZmlsbGVkKSBub3RGdWxmaWxsZWQgPSBwcmlvcml0eTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYoZnVsZmlsbGVkKSB7XG5cdFx0XHRkZWZlcnJlZC5zcGxpY2UoaS0tLCAxKVxuXHRcdFx0dmFyIHIgPSBmbigpO1xuXHRcdFx0aWYgKHIgIT09IHVuZGVmaW5lZCkgcmVzdWx0ID0gcjtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHJlc3VsdDtcbn07IiwiLy8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbl9fd2VicGFja19yZXF1aXJlX18ubiA9IChtb2R1bGUpID0+IHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0KCkgPT4gKG1vZHVsZVsnZGVmYXVsdCddKSA6XG5cdFx0KCkgPT4gKG1vZHVsZSk7XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLmcgPSAoZnVuY3Rpb24oKSB7XG5cdGlmICh0eXBlb2YgZ2xvYmFsVGhpcyA9PT0gJ29iamVjdCcpIHJldHVybiBnbG9iYWxUaGlzO1xuXHR0cnkge1xuXHRcdHJldHVybiB0aGlzIHx8IG5ldyBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuXHR9IGNhdGNoIChlKSB7XG5cdFx0aWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnKSByZXR1cm4gd2luZG93O1xuXHR9XG59KSgpOyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCIvLyBubyBiYXNlVVJJXG5cbi8vIG9iamVjdCB0byBzdG9yZSBsb2FkZWQgYW5kIGxvYWRpbmcgY2h1bmtzXG4vLyB1bmRlZmluZWQgPSBjaHVuayBub3QgbG9hZGVkLCBudWxsID0gY2h1bmsgcHJlbG9hZGVkL3ByZWZldGNoZWRcbi8vIFtyZXNvbHZlLCByZWplY3QsIFByb21pc2VdID0gY2h1bmsgbG9hZGluZywgMCA9IGNodW5rIGxvYWRlZFxudmFyIGluc3RhbGxlZENodW5rcyA9IHtcblx0XCJhcHBcIjogMFxufTtcblxuLy8gbm8gY2h1bmsgb24gZGVtYW5kIGxvYWRpbmdcblxuLy8gbm8gcHJlZmV0Y2hpbmdcblxuLy8gbm8gcHJlbG9hZGVkXG5cbi8vIG5vIEhNUlxuXG4vLyBubyBITVIgbWFuaWZlc3RcblxuX193ZWJwYWNrX3JlcXVpcmVfXy5PLmogPSAoY2h1bmtJZCkgPT4gKGluc3RhbGxlZENodW5rc1tjaHVua0lkXSA9PT0gMCk7XG5cbi8vIGluc3RhbGwgYSBKU09OUCBjYWxsYmFjayBmb3IgY2h1bmsgbG9hZGluZ1xudmFyIHdlYnBhY2tKc29ucENhbGxiYWNrID0gKHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uLCBkYXRhKSA9PiB7XG5cdHZhciBjaHVua0lkcyA9IGRhdGFbMF07XG5cdHZhciBtb3JlTW9kdWxlcyA9IGRhdGFbMV07XG5cdHZhciBydW50aW1lID0gZGF0YVsyXTtcblx0Ly8gYWRkIFwibW9yZU1vZHVsZXNcIiB0byB0aGUgbW9kdWxlcyBvYmplY3QsXG5cdC8vIHRoZW4gZmxhZyBhbGwgXCJjaHVua0lkc1wiIGFzIGxvYWRlZCBhbmQgZmlyZSBjYWxsYmFja1xuXHR2YXIgbW9kdWxlSWQsIGNodW5rSWQsIGkgPSAwO1xuXHRpZihjaHVua0lkcy5zb21lKChpZCkgPT4gKGluc3RhbGxlZENodW5rc1tpZF0gIT09IDApKSkge1xuXHRcdGZvcihtb2R1bGVJZCBpbiBtb3JlTW9kdWxlcykge1xuXHRcdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKG1vcmVNb2R1bGVzLCBtb2R1bGVJZCkpIHtcblx0XHRcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tW21vZHVsZUlkXSA9IG1vcmVNb2R1bGVzW21vZHVsZUlkXTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYocnVudGltZSkgdmFyIHJlc3VsdCA9IHJ1bnRpbWUoX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cdH1cblx0aWYocGFyZW50Q2h1bmtMb2FkaW5nRnVuY3Rpb24pIHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uKGRhdGEpO1xuXHRmb3IoO2kgPCBjaHVua0lkcy5sZW5ndGg7IGkrKykge1xuXHRcdGNodW5rSWQgPSBjaHVua0lkc1tpXTtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oaW5zdGFsbGVkQ2h1bmtzLCBjaHVua0lkKSAmJiBpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF0pIHtcblx0XHRcdGluc3RhbGxlZENodW5rc1tjaHVua0lkXVswXSgpO1xuXHRcdH1cblx0XHRpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF0gPSAwO1xuXHR9XG5cdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fLk8ocmVzdWx0KTtcbn1cblxudmFyIGNodW5rTG9hZGluZ0dsb2JhbCA9IHNlbGZbXCJ3ZWJwYWNrQ2h1bmtcIl0gPSBzZWxmW1wid2VicGFja0NodW5rXCJdIHx8IFtdO1xuY2h1bmtMb2FkaW5nR2xvYmFsLmZvckVhY2god2VicGFja0pzb25wQ2FsbGJhY2suYmluZChudWxsLCAwKSk7XG5jaHVua0xvYWRpbmdHbG9iYWwucHVzaCA9IHdlYnBhY2tKc29ucENhbGxiYWNrLmJpbmQobnVsbCwgY2h1bmtMb2FkaW5nR2xvYmFsLnB1c2guYmluZChjaHVua0xvYWRpbmdHbG9iYWwpKTsiLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGRlcGVuZHMgb24gb3RoZXIgbG9hZGVkIGNodW5rcyBhbmQgZXhlY3V0aW9uIG5lZWQgdG8gYmUgZGVsYXllZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fLk8odW5kZWZpbmVkLCBbXCJ2ZW5kb3JzLW5vZGVfbW9kdWxlc19ib290c3RyYXBfZGlzdF9qc19ib290c3RyYXBfZXNtX2pzLW5vZGVfbW9kdWxlc19zd2lwZXJfc3dpcGVyLWJ1bmRsZV9jc3MtMGNkZWRiXCJdLCAoKSA9PiAoX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vanMvYXBwLnRzXCIpKSlcbl9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fLk8oX193ZWJwYWNrX2V4cG9ydHNfXyk7XG4iLCIiXSwibmFtZXMiOlsiY29yZXNob3BRdWFudGl0eVNlbGVjdG9yIiwib3B0aW9ucyIsImluaXRRdWFudGl0eUZpZWxkcyIsImZpZWxkcyIsImRvY3VtZW50IiwicXVlcnlTZWxlY3RvckFsbCIsInByZWNpc2lvblByZXNldFNlbGVjdG9yIiwicXVlcnlTZWxlY3RvciIsImFkZEV2ZW50TGlzdGVuZXIiLCJkYXRhc2V0IiwiY3NVbml0SWRlbnRpZmllciIsInF1YW50aXR5SWRlbnRpZmllciIsInF1YW50aXR5SW5wdXQiLCJjb25jYXQiLCJzdGVwIiwiY3NVbml0UHJlY2lzaW9uIiwidXBkYXRlVG91Y2hTcGluU2V0dGluZ3MiLCJ0b1N0cmluZyIsImZvckVhY2giLCJmaWVsZCIsImluaXRpYWxpemVUb3VjaFNwaW4iLCJpbnB1dCIsInByZWNpc2lvbiIsImNvbnRhaW5lciIsImNyZWF0ZUVsZW1lbnQiLCJjbGFzc0xpc3QiLCJhZGQiLCJkZWNyZW1lbnRCdXR0b24iLCJ0eXBlIiwidGV4dENvbnRlbnQiLCJpbmNyZW1lbnRCdXR0b24iLCJwYXJlbnROb2RlIiwiaW5zZXJ0QmVmb3JlIiwiYXBwZW5kQ2hpbGQiLCJ2YWx1ZSIsInBhcnNlSW50IiwiaXNOYU4iLCJtaW4iLCJtYXgiLCJ3aW5kb3ciLCJjb3Jlc2hvcFZhcmlhbnRTZWxlY3RvciIsImF0dHJpYnV0ZUNvbnRhaW5lciIsIl9hdHRyaWJ1dGVDb250YWluZXIiLCJfY29uZmlnIiwiX2F0dHJpYnV0ZUdyb3VwcyIsIl9pbml0IiwiSlNPTiIsInBhcnNlIiwiY29uZmlnIiwiYXR0cmlidXRlcyIsImdyb3VwIiwiZWxlbWVudHMiLCJpZCIsInB1c2giLCJfc2V0dXBBdHRyaWJ1dGVHcm91cFNldHRpbmdzIiwiX3NldHVwQ2hhbmdlRXZlbnRzIiwiaW5kZXgiLCJwcmV2R3JvdXAiLCJuZXh0R3JvdXAiLCJzZWxlY3RlZCIsIl9jb25maWd1cmVHcm91cCIsIl9jbGVhckdyb3VwIiwiZWxlbWVudCIsIm9uY2hhbmdlIiwiX2hhbmRsZUVsZW1lbnRDaGFuZ2UiLCJ2YXJpYW50UmVhZHkiLCJkaXNwYXRjaEV2ZW50IiwiX2NyZWF0ZUV2ZW50IiwiX2NsZWFyR3JvdXBzIiwiX3JlZGlyZWN0VG9WYXJpYW50Iiwic2VsZWN0ZWRBdHRyaWJ1dGVzIiwiT2JqZWN0IiwiZnJvbUVudHJpZXMiLCJmaWx0ZXIiLCJnIiwibWFwIiwibWF0Y2hpbmdQcm9kdWN0IiwidmFsdWVzIiwiZmluZCIsInAiLCJzdHJpbmdpZnkiLCJ1cmwiLCJsb2NhdGlvbiIsImhyZWYiLCJuYW1lIiwiZGF0YSIsImFyZ3VtZW50cyIsImxlbmd0aCIsInVuZGVmaW5lZCIsIkN1c3RvbUV2ZW50IiwiYnViYmxlcyIsImNhbmNlbGFibGUiLCJkZXRhaWwiLCJfY2xlYXJHcm91cEVsZW1lbnRzIiwiZGlzYWJsZWQiLCJjaGVja2VkIiwidGFnTmFtZSIsInRvTG93ZXJDYXNlIiwib3B0aW9uIiwicmVtb3ZlQ2hpbGQiLCJfZmlsdGVyQXR0cmlidXRlcyIsImZpbHRlckF0dHJpYnV0ZXMiLCJjdXJyZW50R3JvdXAiLCJhdHRyaWJ1dGUiLCJwcm9kdWN0cyIsInNvbWUiLCJwcm9kdWN0IiwiZXZlcnkiLCJfY29uZmlnJGluZGV4JHByb2R1Y3QiLCJfYWRkT3B0aW9uVG9TZWxlY3QiLCJPcHRpb24iLCJfZW5hYmxlRWxlbWVudEZvckF0dHJpYnV0ZSIsIl9jb25maWd1cmVHcm91cEVsZW1lbnRzIiwiZmlsdGVyZWRBdHRyaWJ1dGVzIiwic2xpY2UiLCJtZXRob2RzIiwiaW5pdCIsInNldHRpbmdzIiwicHJvdG90eXBlUHJlZml4IiwiY29udGFpbmVyU2VsZWN0b3IiLCJzZWxlY3RvckF0dHIiLCJzZWxlY3RvciIsInNob3ciLCJyZXBsYWNlIiwic2VsZWN0ZWRWYWx1ZSIsInNlbGVjdGVkT3B0aW9uIiwiQXJyYXkiLCJmcm9tIiwiZ2V0QXR0cmlidXRlIiwicHJvdG90eXBlRWxlbWVudCIsImdldEVsZW1lbnRCeUlkIiwiZ2V0Q29udGFpbmVyIiwiaW5uZXJIVE1MIiwidHJpbSIsInByb3RvdHlwZSIsImRhdGFDb250YWluZXJJZCIsIk5vZGVMaXN0IiwiaGFuZGxlUHJvdG90eXBlcyIsIm1ldGhvZCIsImFwcGx5IiwiY2FsbCIsIkVycm9yIiwiSFRNTEVsZW1lbnQiLCJtYXBCbG9jayIsInN0eWxlIiwiaGVpZ2h0IiwiY2xpZW50SGVpZ2h0IiwiaW5pdGlhbGl6ZSIsIm1hcE9wdGlvbnMiLCJ6b29tIiwiY2VudGVyIiwiZ29vZ2xlIiwibWFwcyIsIkxhdExuZyIsImRpc2FibGVEZWZhdWx0VUkiLCJtYXBOZXciLCJNYXAiLCJjb25zb2xlIiwibG9nIiwic2hvcCIsImluaXRDaGFuZ2VBZGRyZXNzIiwiaW5pdENhcnRTaGlwbWVudENhbGN1bGF0b3IiLCJpbml0UXVhbnRpdHlWYWxpZGF0b3IiLCJpbml0Q2F0ZWdvcnlTZWxlY3QiLCJzZXR1cENvcHlUb0NsaXBib2FyZCIsInNob3dFbGVtZW50IiwiZ2V0U2VsZWN0ZWRWYWx1ZSIsImJ1dHRvbiIsImNvcHlUZXh0VG9DbGlwYm9hcmQiLCJ0YXJnZXRJZCIsInRhcmdldCIsImNvcHlUZXh0Iiwic2VsZWN0Iiwic2V0U2VsZWN0aW9uUmFuZ2UiLCJuYXZpZ2F0b3IiLCJjbGlwYm9hcmQiLCJ3cml0ZVRleHQiLCJ0aGVuIiwiY29waWVkVGV4dCIsInVwZGF0ZVF1ZXJ5U3RyaW5nUGFyYW1ldGVyIiwidXJpIiwia2V5IiwicmUiLCJSZWdFeHAiLCJzZXBhcmF0b3IiLCJpbmRleE9mIiwibWF0Y2giLCJidXR0b25kb3duX2NsYXNzIiwiYnV0dG9udXBfY2xhc3MiLCJldiIsImZvcm0iLCJjbG9zZXN0IiwiaGFuZGxlU2hpcG1lbnRDYWxjdWxhdGlvbiIsImV2ZW50IiwicHJldmVudERlZmF1bHQiLCJzZXRBdHRyaWJ1dGUiLCJvcGFjaXR5IiwiZmV0Y2giLCJhY3Rpb24iLCJib2R5IiwiVVJMU2VhcmNoUGFyYW1zIiwiRm9ybURhdGEiLCJyZXNwb25zZSIsInRleHQiLCJyZXMiLCJ1cGRhdGVTaGlwbWVudENhbGN1bGF0aW9uIiwiY2F0Y2giLCJlcnJvciIsImhhbmRsZVNoaXBtZW50RXJyb3IiLCJyZXNwb25zZVRleHQiLCJyZW1vdmUiLCJvdXRlckhUTUwiLCJyZW1vdmVBdHRyaWJ1dGUiLCJhZGRyZXNzU3RlcCIsImludm9pY2VBZGRyZXNzIiwic2hpcHBpbmdBZGRyZXNzIiwidXNlSWFzUyIsInNldHVwQWRkcmVzc0NoYW5nZUV2ZW50cyIsInVwZGF0ZUFkZHJlc3MiLCJ1cGRhdGVTaGlwcGluZ0FkZHJlc3MiLCJ0b2dnbGVTaGlwcGluZ0FkZHJlc3MiLCJzZWxlY3RlZEluZGV4IiwiYWRkcmVzcyIsImh0bWwiLCJpbnZvaWNlUGFuZWwiLCJ0b2dnbGVVc2VBc1NoaXBwaW5nIiwiYWRkcmVzc1R5cGUiLCJpc0ludm9pY2VUeXBlIiwiRXZlbnQiLCJzaGlwcGluZ0ZpZWxkIiwic2hpcHBpbmdBZGRBZGRyZXNzQnV0dG9uIiwiZGlzcGxheSIsInZhcmlhbnQiLCJ2YXJpYW50cyIsImUiLCJzdWJtaXRzIiwic3VibWl0IiwiQ2Fyb3VzZWwiLCJDYXJ0SW5mbyIsIlN3aXBlciIsIlRodW1icyIsIl9pbml0Q2Fyb3VzZWwiLCJzbGlkZXJUaHVtYm5haWwiLCJzbGlkZXNQZXJWaWV3IiwiZnJlZU1vZGUiLCJzcGFjZUJldHdlZW4iLCJ3YXRjaFNsaWRlc1Byb2dyZXNzIiwibWFpblNsaWRlciIsIm1vZHVsZXMiLCJuYXZpZ2F0aW9uIiwibmV4dEVsIiwicHJldkVsIiwidGh1bWJzIiwic3dpcGVyIiwiX19hd2FpdGVyIiwidGhpc0FyZyIsIl9hcmd1bWVudHMiLCJQIiwiZ2VuZXJhdG9yIiwiYWRvcHQiLCJyZXNvbHZlIiwiUHJvbWlzZSIsInJlamVjdCIsImZ1bGZpbGxlZCIsIm5leHQiLCJyZWplY3RlZCIsInJlc3VsdCIsImRvbmUiLCJfX2dlbmVyYXRvciIsIl8iLCJsYWJlbCIsInNlbnQiLCJ0IiwidHJ5cyIsIm9wcyIsImYiLCJ5IiwiY3JlYXRlIiwiSXRlcmF0b3IiLCJ2ZXJiIiwiU3ltYm9sIiwiaXRlcmF0b3IiLCJuIiwidiIsIm9wIiwiVHlwZUVycm9yIiwicG9wIiwiYXBpVXJsIiwiZWxlbWVudFNlbGVjdG9yIiwiX2luaXRDYXJ0V2lkZ2V0IiwiZmV0Y2hDYXJ0SXRlbXMiLCJlcnJvcl8xIiwiX2EiLCJvayIsInN0YXR1c1RleHQiLCJkaXNwbGF5Q2FydEl0ZW1zIiwiY2FydEZsYWciLCJsb2FkZXIiXSwic291cmNlUm9vdCI6IiJ9