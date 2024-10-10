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
      const address = selected.dataset.address;
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
      const address = this.options[this.selectedIndex].dataset.address;
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
      const address = invoiceAddress.querySelector('option:checked').dataset.address;
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
      const address = shippingAddress.querySelector('option:checked').dataset.address;
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
/* harmony import */ var swiper__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! swiper */ "./node_modules/swiper/swiper.mjs");
/* harmony import */ var _scripts_handle_prototypes_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./scripts/handle-prototypes.js */ "./js/scripts/handle-prototypes.js");
/* harmony import */ var _scripts_handle_prototypes_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_scripts_handle_prototypes_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _plugin_coreshop_plugin_quantity_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./plugin/coreshop.plugin.quantity.js */ "./js/plugin/coreshop.plugin.quantity.js");
/* harmony import */ var _plugin_coreshop_plugin_quantity_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_plugin_coreshop_plugin_quantity_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _plugin_coreshop_plugin_variant_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./plugin/coreshop.plugin.variant.js */ "./js/plugin/coreshop.plugin.variant.js");
/* harmony import */ var _plugin_coreshop_plugin_variant_js__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_plugin_coreshop_plugin_variant_js__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _scripts_shop_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./scripts/shop.js */ "./js/scripts/shop.js");
/* harmony import */ var _scripts_shop_js__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(_scripts_shop_js__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var _scripts_variant_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./scripts/variant.js */ "./js/scripts/variant.js");
/* harmony import */ var _scripts_variant_js__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(_scripts_variant_js__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var _scripts_map_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./scripts/map.js */ "./js/scripts/map.js");
/* harmony import */ var _scripts_map_js__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(_scripts_map_js__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var swiper_modules__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! swiper/modules */ "./node_modules/swiper/modules/index.mjs");
/* STYLES  */


/* JS */









/* Init swiper with thumbs */
var sliderThumbnail = new swiper__WEBPACK_IMPORTED_MODULE_3__["default"]('.js-slider-thumbnail', {
  slidesPerView: 3,
  freeMode: true,
  spaceBetween: '8px',
  watchSlidesProgress: true
});
var slider = new swiper__WEBPACK_IMPORTED_MODULE_3__["default"]('.js-slider', {
  modules: [swiper_modules__WEBPACK_IMPORTED_MODULE_10__.Thumbs],
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev'
  },
  thumbs: {
    swiper: sliderThumbnail
  }
});

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0E7V0FDQTtXQUNBLGtCQUFrQixxQkFBcUI7V0FDdkM7V0FDQTtXQUNBLEtBQUs7V0FDTDtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7Ozs7O1dDN0JBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxpQ0FBaUMsV0FBVztXQUM1QztXQUNBOzs7OztXQ1BBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7V0FDQTtXQUNBO1dBQ0E7V0FDQSxHQUFHO1dBQ0g7V0FDQTtXQUNBLENBQUM7Ozs7O1dDUEQ7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7OztXQ05BOztXQUVBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTs7V0FFQTs7V0FFQTs7V0FFQTs7V0FFQTs7V0FFQTs7V0FFQTs7V0FFQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsTUFBTSxxQkFBcUI7V0FDM0I7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTs7V0FFQTtXQUNBO1dBQ0E7Ozs7O1VFbERBO1VBQ0E7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9qcy9wbHVnaW4vY29yZXNob3AucGx1Z2luLnF1YW50aXR5LmpzIiwid2VicGFjazovLy8uL2pzL3BsdWdpbi9jb3Jlc2hvcC5wbHVnaW4udmFyaWFudC5qcyIsIndlYnBhY2s6Ly8vLi9qcy9zY3JpcHRzL2hhbmRsZS1wcm90b3R5cGVzLmpzIiwid2VicGFjazovLy8uL2pzL3NjcmlwdHMvbWFwLmpzIiwid2VicGFjazovLy8uL2pzL3NjcmlwdHMvc2hvcC5qcyIsIndlYnBhY2s6Ly8vLi9qcy9zY3JpcHRzL3ZhcmlhbnQuanMiLCJ3ZWJwYWNrOi8vLy4vanMvYXBwLnRzIiwid2VicGFjazovLy8uL3Njc3MvYXBwLnNjc3MiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvY2h1bmsgbG9hZGVkIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvY29tcGF0IGdldCBkZWZhdWx0IGV4cG9ydCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvZ2xvYmFsIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvanNvbnAgY2h1bmsgbG9hZGluZyIsIndlYnBhY2s6Ly8vd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly8vd2VicGFjay9zdGFydHVwIiwid2VicGFjazovLy93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBjb3Jlc2hvcFF1YW50aXR5U2VsZWN0b3Iob3B0aW9ucykge1xuICAgICAgICBpbml0UXVhbnRpdHlGaWVsZHMob3B0aW9ucyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5pdFF1YW50aXR5RmllbGRzKG9wdGlvbnMpIHtcbiAgICAgICAgY29uc3QgZmllbGRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnaW5wdXQuY3MtdW5pdC1pbnB1dCcpO1xuICAgICAgICBjb25zdCBwcmVjaXNpb25QcmVzZXRTZWxlY3RvciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ3NlbGVjdC5jcy11bml0LXNlbGVjdG9yJyk7XG5cbiAgICAgICAgaWYocHJlY2lzaW9uUHJlc2V0U2VsZWN0b3IpIHtcbiAgICAgICAgICAgIC8vIExpc3RlbiB0byB1bml0IGRlZmluaXRpb24gc2VsZWN0b3JcbiAgICAgICAgICAgIHByZWNpc2lvblByZXNldFNlbGVjdG9yLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuZGF0YXNldC5jc1VuaXRJZGVudGlmaWVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb25zdCBzZWxlY3RlZE9wdGlvbiA9IHRoaXMub3B0aW9uc1t0aGlzLnNlbGVjdGVkSW5kZXhdO1xuICAgICAgICAgICAgICAgIGNvbnN0IHF1YW50aXR5SWRlbnRpZmllciA9IHRoaXMuZGF0YXNldC5jc1VuaXRJZGVudGlmaWVyO1xuICAgICAgICAgICAgICAgIGNvbnN0IHF1YW50aXR5SW5wdXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBpbnB1dFtkYXRhLWNzLXVuaXQtaWRlbnRpZmllcj1cIiR7cXVhbnRpdHlJZGVudGlmaWVyfVwiXWApO1xuXG4gICAgICAgICAgICAgICAgLy8gU2V0IHN0ZXAgdG8gMSBvciB3aGF0ZXZlciBpbnRlZ2VyIHZhbHVlIHlvdSB3YW50XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RlcCA9IDE7IC8vIENoYW5nZSB0aGlzIGlmIHlvdSB3YW50IGEgZGlmZmVyZW50IGluY3JlbWVudFxuXG4gICAgICAgICAgICAgICAgaWYgKCFxdWFudGl0eUlucHV0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBVc2UgaW50ZWdlciBzdGVwIGRpcmVjdGx5XG4gICAgICAgICAgICAgICAgcXVhbnRpdHlJbnB1dC5zdGVwID0gc3RlcDsgLy8gU2V0IHN0ZXAgYXMgYW4gaW50ZWdlclxuICAgICAgICAgICAgICAgIHF1YW50aXR5SW5wdXQuZGF0YXNldC5jc1VuaXRQcmVjaXNpb24gPSAwOyAvLyBPcHRpb25hbCwgc2luY2UgcHJlY2lzaW9uIGlzIG5vIGxvbmdlciByZWxldmFudFxuXG4gICAgICAgICAgICAgICAgLy8gVXBkYXRlIGlucHV0IHNldHRpbmdzXG4gICAgICAgICAgICAgICAgdXBkYXRlVG91Y2hTcGluU2V0dGluZ3MocXVhbnRpdHlJbnB1dCwgMCwgc3RlcC50b1N0cmluZygpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoZmllbGRzKSB7XG4gICAgICAgICAgICAvLyBJbml0aWFsaXplIHF1YW50aXR5IGZpZWxkcyB3aXRoIGludGVnZXIgc3RlcFxuICAgICAgICAgICAgZmllbGRzLmZvckVhY2goZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICAgICAgICAgICAgLy8gWW91IG1pZ2h0IG5vdCBuZWVkIHByZWNpc2lvbiBhbnltb3JlXG4gICAgICAgICAgICAgICAgaW5pdGlhbGl6ZVRvdWNoU3BpbihmaWVsZCwgMCwgJzEnLCBvcHRpb25zKTsgLy8gQ2hhbmdlICcxJyB0byB5b3VyIGRlc2lyZWQgaW50ZWdlciBpbmNyZW1lbnRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5pdGlhbGl6ZVRvdWNoU3BpbihpbnB1dCwgcHJlY2lzaW9uLCBzdGVwLCBvcHRpb25zKSB7XG4gICAgICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBjb250YWluZXIuY2xhc3NMaXN0LmFkZCgndG91Y2hzcGluLWNvbnRhaW5lcicpO1xuXG4gICAgICAgIGNvbnN0IGRlY3JlbWVudEJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgICAgICBkZWNyZW1lbnRCdXR0b24udHlwZSA9ICdidXR0b24nO1xuICAgICAgICBkZWNyZW1lbnRCdXR0b24udGV4dENvbnRlbnQgPSAnLSc7XG4gICAgICAgIGRlY3JlbWVudEJ1dHRvbi5jbGFzc0xpc3QuYWRkKCd0b3VjaHNwaW4tZGVjcmVtZW50Jyk7XG5cbiAgICAgICAgY29uc3QgaW5jcmVtZW50QnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgIGluY3JlbWVudEJ1dHRvbi50eXBlID0gJ2J1dHRvbic7XG4gICAgICAgIGluY3JlbWVudEJ1dHRvbi50ZXh0Q29udGVudCA9ICcrJztcbiAgICAgICAgaW5jcmVtZW50QnV0dG9uLmNsYXNzTGlzdC5hZGQoJ3RvdWNoc3Bpbi1pbmNyZW1lbnQnKTtcblxuICAgICAgICBpbnB1dC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShjb250YWluZXIsIGlucHV0KTtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGRlY3JlbWVudEJ1dHRvbik7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChpbnB1dCk7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChpbmNyZW1lbnRCdXR0b24pO1xuXG4gICAgICAgIC8vIFNldCB1cCBldmVudCBsaXN0ZW5lcnMgZm9yIGluY3JlbWVudCBhbmQgZGVjcmVtZW50XG4gICAgICAgIGRlY3JlbWVudEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IHBhcnNlSW50KGlucHV0LnZhbHVlKSB8fCAwOyAvLyBFbnN1cmUgdmFsdWUgaXMgYW4gaW50ZWdlclxuICAgICAgICAgICAgdmFsdWUgLT0gcGFyc2VJbnQoc3RlcCk7IC8vIERlY3JlbWVudCBieSBpbnRlZ2VyIHN0ZXBcbiAgICAgICAgICAgIGlmICh2YWx1ZSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgaW5wdXQudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaW5jcmVtZW50QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgbGV0IHZhbHVlID0gcGFyc2VJbnQoaW5wdXQudmFsdWUpIHx8IDA7IC8vIEVuc3VyZSB2YWx1ZSBpcyBhbiBpbnRlZ2VyXG4gICAgICAgICAgICB2YWx1ZSArPSBwYXJzZUludChzdGVwKTsgLy8gSW5jcmVtZW50IGJ5IGludGVnZXIgc3RlcFxuICAgICAgICAgICAgaW5wdXQudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQWRkIGlucHV0IHZhbGlkYXRpb24gYmFzZWQgb24gaW50ZWdlciB2YWx1ZVxuICAgICAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdpbnB1dCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IHBhcnNlSW50KGlucHV0LnZhbHVlKTtcbiAgICAgICAgICAgIGlmIChpc05hTih2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICBpbnB1dC52YWx1ZSA9IDA7IC8vIERlZmF1bHQgdG8gemVybyBpZiBpbnZhbGlkIGlucHV0XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlucHV0LnZhbHVlID0gdmFsdWU7IC8vIEtlZXAgaXQgYXMgYW4gaW50ZWdlclxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1cGRhdGVUb3VjaFNwaW5TZXR0aW5ncyhpbnB1dCwgcHJlY2lzaW9uLCBzdGVwKSB7XG4gICAgICAgIGlucHV0Lm1pbiA9IDA7XG4gICAgICAgIGlucHV0Lm1heCA9IDEwMDAwMDAwMDA7XG4gICAgICAgIGlucHV0LnN0ZXAgPSBzdGVwO1xuICAgICAgICBpbnB1dC5kYXRhc2V0LmNzVW5pdFByZWNpc2lvbiA9IHByZWNpc2lvbjtcbiAgICB9XG5cbiAgICAvLyBFeHBvcnQgdGhlIGZ1bmN0aW9uIHRvIHRoZSBnbG9iYWwgc2NvcGVcbiAgICB3aW5kb3cuY29yZXNob3BRdWFudGl0eVNlbGVjdG9yID0gY29yZXNob3BRdWFudGl0eVNlbGVjdG9yO1xufSkoKTtcbiIsIihmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgY29yZXNob3BWYXJpYW50U2VsZWN0b3IgPSBmdW5jdGlvbiAoYXR0cmlidXRlQ29udGFpbmVyKSB7XG4gICAgICAgIGxldCBfYXR0cmlidXRlQ29udGFpbmVyID0gdW5kZWZpbmVkO1xuICAgICAgICBsZXQgX2NvbmZpZyA9IHt9O1xuICAgICAgICBsZXQgX2F0dHJpYnV0ZUdyb3VwcyA9IFtdO1xuXG4gICAgICAgIGNvbnN0IF9jbGVhckdyb3VwID0gZnVuY3Rpb24gKGdyb3VwKSB7XG4gICAgICAgICAgICBkZWxldGUgZ3JvdXAuc2VsZWN0ZWQ7XG4gICAgICAgICAgICBncm91cC5lbGVtZW50cy5mb3JFYWNoKChlbGVtZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5jaGVja2VkID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAvLyByZW1vdmUgb3B0aW9ucyBvbiBzZWxlY3RcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdzZWxlY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG9wdGlvbnMgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ29wdGlvbjpub3QoW3ZhbHVlPVwiXCJdKScpO1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLmZvckVhY2goKG9wdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVDaGlsZChvcHRpb24pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfY2xlYXJHcm91cHMgPSBmdW5jdGlvbiAoZ3JvdXApIHtcbiAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICBfY2xlYXJHcm91cChncm91cCk7XG4gICAgICAgICAgICAgICAgZ3JvdXAgPSBncm91cC5uZXh0R3JvdXA7XG4gICAgICAgICAgICB9IHdoaWxlIChncm91cCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgX2ZpbHRlckF0dHJpYnV0ZXMgPSBmdW5jdGlvbiAoYXR0cmlidXRlcywgZ3JvdXApIHtcbiAgICAgICAgICAgIGxldCBmaWx0ZXJBdHRyaWJ1dGVzID0gW107XG5cbiAgICAgICAgICAgIGdyb3VwID0gZ3JvdXAucHJldkdyb3VwO1xuICAgICAgICAgICAgd2hpbGUgKGdyb3VwKSB7XG4gICAgICAgICAgICAgICAgaWYgKGdyb3VwLnNlbGVjdGVkICYmIGdyb3VwLm5leHRHcm91cCkge1xuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJBdHRyaWJ1dGVzLnB1c2goeyBncm91cDogZ3JvdXAuZ3JvdXAuaWQsIHNlbGVjdGVkOiBncm91cC5zZWxlY3RlZCB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZ3JvdXAgPSBncm91cC5wcmV2R3JvdXA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBmaWx0ZXJlZCA9IFtdO1xuICAgICAgICAgICAgYXR0cmlidXRlcy5mb3JFYWNoKChhdHRyaWJ1dGUpID0+IHtcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGUucHJvZHVjdHMuZm9yRWFjaCgocHJvZHVjdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZmlsdGVyQXR0cmlidXRlcy5ldmVyeSgoeCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9jb25maWcuaW5kZXhbcHJvZHVjdC5pZF1bJ2F0dHJpYnV0ZXMnXS5oYXNPd25Qcm9wZXJ0eSh4Lmdyb3VwKSAmJiBfY29uZmlnLmluZGV4W3Byb2R1Y3QuaWRdWydhdHRyaWJ1dGVzJ11beC5ncm91cF0gPT09IHguc2VsZWN0ZWQ7XG4gICAgICAgICAgICAgICAgICAgIH0pICYmICFmaWx0ZXJlZC5pbmNsdWRlcyhhdHRyaWJ1dGUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJlZC5wdXNoKGF0dHJpYnV0ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gZmlsdGVyZWQubGVuZ3RoID8gZmlsdGVyZWQgOiBhdHRyaWJ1dGVzO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9jb25maWd1cmVHcm91cCA9IGZ1bmN0aW9uIChncm91cCkge1xuICAgICAgICAgICAgbGV0IGF0dHJpYnV0ZXMgPSBncm91cC5hdHRyaWJ1dGVzLnNsaWNlKCk7XG4gICAgICAgICAgICBhdHRyaWJ1dGVzID0gX2ZpbHRlckF0dHJpYnV0ZXMoYXR0cmlidXRlcywgZ3JvdXApO1xuXG4gICAgICAgICAgICBpZiAoYXR0cmlidXRlcykge1xuICAgICAgICAgICAgICAgIGdyb3VwLmVsZW1lbnRzLmZvckVhY2goKGVsZW1lbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlcy5mb3JFYWNoKChhdHRyaWJ1dGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNldCBvcHRpb25zIG9uIHNlbGVjdCwgb3RoZXJ3aXNlIG9ubHkgZW5hYmxlIGlucHV0c1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnc2VsZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG9wdGlvbiA9IG5ldyBPcHRpb24oYXR0cmlidXRlLmF0dHJpYnV0ZS5uYW1lLCBhdHRyaWJ1dGUuYXR0cmlidXRlLmlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb24uaWQgPSAnYXR0cmlidXRlLScgKyBhdHRyaWJ1dGUuYXR0cmlidXRlLmlkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChncm91cC5zZWxlY3RlZCA9PT0gYXR0cmlidXRlLmF0dHJpYnV0ZS5pZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb24uc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmFkZChvcHRpb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnNlSW50KGVsZW1lbnQuZGF0YXNldC5ncm91cCkgPT09IGdyb3VwLmdyb3VwLmlkICYmIHBhcnNlSW50KGVsZW1lbnQudmFsdWUpID09PSBhdHRyaWJ1dGUuYXR0cmlidXRlLmlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuZGlzYWJsZWQgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZ3JvdXAuc2VsZWN0ZWQgPT09IGF0dHJpYnV0ZS5hdHRyaWJ1dGUuaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuY2hlY2tlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9zZXR1cEF0dHJpYnV0ZUdyb3VwU2V0dGluZ3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBsZXQgaW5kZXggPSBfYXR0cmlidXRlR3JvdXBzLmxlbmd0aDtcblxuICAgICAgICAgICAgd2hpbGUgKGluZGV4LS0pIHtcbiAgICAgICAgICAgICAgICBfYXR0cmlidXRlR3JvdXBzW2luZGV4XS5wcmV2R3JvdXAgPSBfYXR0cmlidXRlR3JvdXBzW2luZGV4IC0gMV07XG4gICAgICAgICAgICAgICAgX2F0dHJpYnV0ZUdyb3Vwc1tpbmRleF0ubmV4dEdyb3VwID0gX2F0dHJpYnV0ZUdyb3Vwc1tpbmRleCArIDFdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpbmRleCA9IF9hdHRyaWJ1dGVHcm91cHMubGVuZ3RoO1xuICAgICAgICAgICAgd2hpbGUgKGluZGV4LS0pIHtcbiAgICAgICAgICAgICAgICBpZiAoIWluZGV4IHx8IF9hdHRyaWJ1dGVHcm91cHNbaW5kZXhdLnNlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIF9jb25maWd1cmVHcm91cChfYXR0cmlidXRlR3JvdXBzW2luZGV4XSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgX2NsZWFyR3JvdXAoX2F0dHJpYnV0ZUdyb3Vwc1tpbmRleF0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfc2V0dXBDaGFuZ2VFdmVudHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfYXR0cmlidXRlR3JvdXBzLmZvckVhY2goKGdyb3VwKSA9PiB7XG4gICAgICAgICAgICAgICAgZ3JvdXAuZWxlbWVudHMuZm9yRWFjaCgoZWxlbWVudCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50Lm9uY2hhbmdlID0gKGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9jb25maWd1cmVFbGVtZW50KGdyb3VwLCBlbGVtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9pbml0ID0gZnVuY3Rpb24gKGF0dHJpYnV0ZUNvbnRhaW5lcikge1xuICAgICAgICAgICAgaWYgKCFhdHRyaWJ1dGVDb250YWluZXIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIF9hdHRyaWJ1dGVDb250YWluZXIgPSBhdHRyaWJ1dGVDb250YWluZXI7XG4gICAgICAgICAgICBfY29uZmlnID0gSlNPTi5wYXJzZShfYXR0cmlidXRlQ29udGFpbmVyLmRhdGFzZXQuY29uZmlnKTtcbiAgICAgICAgICAgIF9jb25maWcuYXR0cmlidXRlcy5mb3JFYWNoKChncm91cCkgPT4ge1xuICAgICAgICAgICAgICAgIGdyb3VwLmVsZW1lbnRzID0gX2F0dHJpYnV0ZUNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1ncm91cD1cIicgKyBncm91cC5ncm91cC5pZCArICdcIl0nKTtcbiAgICAgICAgICAgICAgICBfYXR0cmlidXRlR3JvdXBzLnB1c2goZ3JvdXApO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIF9zZXR1cEF0dHJpYnV0ZUdyb3VwU2V0dGluZ3MoKTtcbiAgICAgICAgICAgIF9zZXR1cENoYW5nZUV2ZW50cygpO1xuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IF9yZWRpcmVjdFRvVmFyaWFudCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNvbnN0IGdyb3VwcyA9IF9hdHRyaWJ1dGVHcm91cHMuZmlsdGVyKChnKSA9PiBnLnNlbGVjdGVkKTtcblxuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWQgPSBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgICAgICAgICAgICAgZ3JvdXBzLm1hcCgoZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gW2cuZ3JvdXAuaWQsIGcuc2VsZWN0ZWRdO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBjb25zdCBmaWx0ZXJlZCA9IE9iamVjdC52YWx1ZXMoX2NvbmZpZy5pbmRleCkuZmlsdGVyKChwKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHAuYXR0cmlidXRlcykgPT09IEpTT04uc3RyaW5naWZ5KHNlbGVjdGVkKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBsZW5ndGggc2hvdWxkIGFsd2F5cyBiZSAxLCBidXQgbGV0J3MgY2hlY2sgaXRcbiAgICAgICAgICAgIGlmIChmaWx0ZXJlZC5sZW5ndGggPT09IDEgJiYgZmlsdGVyZWRbMF1bJ3VybCddKSB7XG4gICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBmaWx0ZXJlZFswXVsndXJsJ107XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc3QgX2NyZWF0ZUV2ZW50ID0gZnVuY3Rpb24gKG5hbWUsIGRhdGEgPSB7fSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBDdXN0b21FdmVudCgndmFyaWFudF9zZWxlY3Rvci4nICsgbmFtZSwge1xuICAgICAgICAgICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgICAgICAgICAgY2FuY2VsYWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgZGV0YWlsOiBkYXRhXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zdCBfY29uZmlndXJlRWxlbWVudCA9IGZ1bmN0aW9uIChncm91cCwgZWxlbWVudCkge1xuICAgICAgICAgICAgd2luZG93LnZhcmlhbnRSZWFkeSA9IGZhbHNlO1xuICAgICAgICAgICAgX2F0dHJpYnV0ZUNvbnRhaW5lci5kaXNwYXRjaEV2ZW50KFxuICAgICAgICAgICAgICAgIF9jcmVhdGVFdmVudCgnY2hhbmdlJywgeyBlbGVtZW50OiBlbGVtZW50IH0pXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBpZiAoZWxlbWVudC52YWx1ZSkge1xuICAgICAgICAgICAgICAgIGdyb3VwLnNlbGVjdGVkID0gcGFyc2VJbnQoZWxlbWVudC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgaWYgKGdyb3VwLm5leHRHcm91cCkge1xuICAgICAgICAgICAgICAgICAgICBfYXR0cmlidXRlQ29udGFpbmVyLmRpc3BhdGNoRXZlbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICBfY3JlYXRlRXZlbnQoJ3NlbGVjdCcsIHsgZWxlbWVudDogZWxlbWVudCB9KVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICBfY2xlYXJHcm91cHMoZ3JvdXAubmV4dEdyb3VwKTtcbiAgICAgICAgICAgICAgICAgICAgX2NvbmZpZ3VyZUdyb3VwKGdyb3VwLm5leHRHcm91cCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgX2F0dHJpYnV0ZUNvbnRhaW5lci5kaXNwYXRjaEV2ZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgX2NyZWF0ZUV2ZW50KCdyZWRpcmVjdCcsIHsgZWxlbWVudDogZWxlbWVudCB9KVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICBfcmVkaXJlY3RUb1ZhcmlhbnQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBncm91cC5zZWxlY3RlZDtcbiAgICAgICAgICAgICAgICBpZiAoZ3JvdXAubmV4dEdyb3VwKSB7XG4gICAgICAgICAgICAgICAgICAgIF9jbGVhckdyb3Vwcyhncm91cC5uZXh0R3JvdXApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHdpbmRvdy52YXJpYW50UmVhZHkgPSB0cnVlO1xuICAgICAgICB9O1xuXG4gICAgICAgIF9pbml0KGF0dHJpYnV0ZUNvbnRhaW5lcik7XG4gICAgfTtcblxuICAgIHdpbmRvdy5jb3Jlc2hvcFZhcmlhbnRTZWxlY3RvciA9IGNvcmVzaG9wVmFyaWFudFNlbGVjdG9yO1xufSkoKTtcbiIsIihmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgY29uc3QgbWV0aG9kcyA9IHtcbiAgICAgICAgaW5pdDogZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGNvbnN0IHNldHRpbmdzID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICAgICAgJ3Byb3RvdHlwZVByZWZpeCc6IGZhbHNlLFxuICAgICAgICAgICAgICAgICdjb250YWluZXJTZWxlY3Rvcic6IGZhbHNlLFxuICAgICAgICAgICAgICAgICdzZWxlY3RvckF0dHInOiBmYWxzZVxuICAgICAgICAgICAgfSwgb3B0aW9ucyk7XG5cbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0aGlzLnNlbGVjdG9yKTtcbiAgICAgICAgICAgIGVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBzaG93KGVsZW1lbnQsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgc2hvdyhlbGVtZW50LCB0cnVlKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHNob3coZWxlbWVudCwgcmVwbGFjZSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgc2VsZWN0ZWRWYWx1ZSA9IGVsZW1lbnQudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGxldCBwcm90b3R5cGVQcmVmaXggPSBlbGVtZW50LmlkO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChzZXR0aW5ncy5zZWxlY3RvckF0dHIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkT3B0aW9uID0gQXJyYXkuZnJvbShlbGVtZW50Lm9wdGlvbnMpLmZpbmQob3B0aW9uID0+IG9wdGlvbi52YWx1ZSA9PT0gc2VsZWN0ZWRWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWRPcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZFZhbHVlID0gc2VsZWN0ZWRPcHRpb24uZ2V0QXR0cmlidXRlKHNldHRpbmdzLnNlbGVjdG9yQXR0cik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoc2V0dGluZ3MucHJvdG90eXBlUHJlZml4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm90b3R5cGVQcmVmaXggPSBzZXR0aW5ncy5wcm90b3R5cGVQcmVmaXg7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwcm90b3R5cGVFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQocHJvdG90eXBlUHJlZml4ICsgJ18nICsgc2VsZWN0ZWRWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjb250YWluZXI7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHNldHRpbmdzLmNvbnRhaW5lclNlbGVjdG9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNldHRpbmdzLmNvbnRhaW5lclNlbGVjdG9yKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRhdGFDb250YWluZXJJZCA9IHByb3RvdHlwZUVsZW1lbnQgPyBwcm90b3R5cGVFbGVtZW50LmRhdGFzZXQuY29udGFpbmVyIDogbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGRhdGFDb250YWluZXJJZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoIWNvbnRhaW5lcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFwcm90b3R5cGVFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXIuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAocmVwbGFjZSB8fCAhY29udGFpbmVyLmlubmVySFRNTC50cmltKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSBwcm90b3R5cGVFbGVtZW50LmRhdGFzZXQucHJvdG90eXBlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gRXh0ZW5kaW5nIHRoZSBwcm90b3R5cGUgb2YgTm9kZUxpc3RcbiAgICBOb2RlTGlzdC5wcm90b3R5cGUuaGFuZGxlUHJvdG90eXBlcyA9IGZ1bmN0aW9uIChtZXRob2QpIHtcbiAgICAgICAgaWYgKG1ldGhvZHNbbWV0aG9kXSkge1xuICAgICAgICAgICAgcmV0dXJuIG1ldGhvZHNbbWV0aG9kXS5hcHBseSh0aGlzLCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgbWV0aG9kID09PSAnb2JqZWN0JyB8fCAhbWV0aG9kKSB7XG4gICAgICAgICAgICByZXR1cm4gbWV0aG9kcy5pbml0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ01ldGhvZCAnICsgbWV0aG9kICsgJyBkb2VzIG5vdCBleGlzdCBvbiBoYW5kbGVQcm90b3R5cGVzJyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gVG8gYWxsb3cgY2FsbGluZyBoYW5kbGVQcm90b3R5cGVzIGRpcmVjdGx5IG9uIGFueSBlbGVtZW50XG4gICAgSFRNTEVsZW1lbnQucHJvdG90eXBlLmhhbmRsZVByb3RvdHlwZXMgPSBmdW5jdGlvbiAobWV0aG9kKSB7XG4gICAgICAgIHJldHVybiBtZXRob2RzLmhhbmRsZVByb3RvdHlwZXMuY2FsbChbdGhpc10sIG1ldGhvZCk7XG4gICAgfTtcblxufSgpKTtcbiIsImRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgbWFwQmxvY2sgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWFwLWJsb2NrJyk7XG5cbiAgICBpZiAobWFwQmxvY2spIHtcbiAgICAgICAgbWFwQmxvY2suc3R5bGUuaGVpZ2h0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hcC13cmFwcGVyJykuY2xpZW50SGVpZ2h0ICsgJ3B4JztcblxuICAgICAgICBmdW5jdGlvbiBpbml0aWFsaXplKCkge1xuICAgICAgICAgICAgY29uc3QgbWFwT3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICB6b29tOiAxOCxcbiAgICAgICAgICAgICAgICBjZW50ZXI6IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoNDguMTU5MjUxMywgMTQuMDIzMDI1MTAwMDAwMDQpLFxuICAgICAgICAgICAgICAgIGRpc2FibGVEZWZhdWx0VUk6IHRydWVcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zdCBtYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKG1hcEJsb2NrLCBtYXBPcHRpb25zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgaW5pdGlhbGl6ZSk7XG4gICAgfVxufSk7XG4iLCJkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24gKCkge1xuICAgIHNob3AuaW5pdCgpO1xufSk7XG5cbmZ1bmN0aW9uIGhhbmRsZVByb3RvdHlwZXMob3B0aW9ucykge1xuICAgIGNvbnN0IHNldHRpbmdzID0ge1xuICAgICAgICBwcm90b3R5cGVQcmVmaXg6IG9wdGlvbnMucHJvdG90eXBlUHJlZml4IHx8IGZhbHNlLFxuICAgICAgICBjb250YWluZXJTZWxlY3Rvcjogb3B0aW9ucy5jb250YWluZXJTZWxlY3RvciB8fCBmYWxzZSxcbiAgICAgICAgc2VsZWN0b3JBdHRyOiBvcHRpb25zLnNlbGVjdG9yQXR0ciB8fCBmYWxzZVxuICAgIH07XG5cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGBbZGF0YS0ke3NldHRpbmdzLnByb3RvdHlwZVByZWZpeH1dYCkuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICBzaG93KGVsZW1lbnQsIGZhbHNlKTtcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzaG93KGVsZW1lbnQsIHRydWUpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIHNob3coZWxlbWVudCwgcmVwbGFjZSkge1xuICAgICAgICBsZXQgc2VsZWN0ZWRWYWx1ZSA9IGVsZW1lbnQudmFsdWU7XG4gICAgICAgIGxldCBwcm90b3R5cGVQcmVmaXggPSBlbGVtZW50LmlkO1xuXG4gICAgICAgIGlmIChzZXR0aW5ncy5zZWxlY3RvckF0dHIpIHtcbiAgICAgICAgICAgIHNlbGVjdGVkVmFsdWUgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3IoYFt2YWx1ZT1cIiR7ZWxlbWVudC52YWx1ZX1cIl1gKS5nZXRBdHRyaWJ1dGUoc2V0dGluZ3Muc2VsZWN0b3JBdHRyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZXR0aW5ncy5wcm90b3R5cGVQcmVmaXgpIHtcbiAgICAgICAgICAgIHByb3RvdHlwZVByZWZpeCA9IHNldHRpbmdzLnByb3RvdHlwZVByZWZpeDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHByb3RvdHlwZUVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgJHtwcm90b3R5cGVQcmVmaXh9XyR7c2VsZWN0ZWRWYWx1ZX1gKTtcbiAgICAgICAgbGV0IGNvbnRhaW5lcjtcblxuICAgICAgICBpZiAoc2V0dGluZ3MuY29udGFpbmVyU2VsZWN0b3IpIHtcbiAgICAgICAgICAgIGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2V0dGluZ3MuY29udGFpbmVyU2VsZWN0b3IpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29udGFpbmVyID0gcHJvdG90eXBlRWxlbWVudCA/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IocHJvdG90eXBlRWxlbWVudC5kYXRhc2V0LmNvbnRhaW5lcikgOiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFjb250YWluZXIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghcHJvdG90eXBlRWxlbWVudCkge1xuICAgICAgICAgICAgY29udGFpbmVyLmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJlcGxhY2UgfHwgIWNvbnRhaW5lci5pbm5lckhUTUwudHJpbSgpKSB7XG4gICAgICAgICAgICBjb250YWluZXIuaW5uZXJIVE1MID0gcHJvdG90eXBlRWxlbWVudC5kYXRhc2V0LnByb3RvdHlwZTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuXG4oZnVuY3Rpb24gKHNob3ApIHtcbiAgICBzaG9wLmluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNob3AuaW5pdENoYW5nZUFkZHJlc3MoKTtcbiAgICAgICAgc2hvcC5pbml0Q2FydFNoaXBtZW50Q2FsY3VsYXRvcigpO1xuICAgICAgICBzaG9wLmluaXRRdWFudGl0eVZhbGlkYXRvcigpO1xuICAgICAgICBzaG9wLmluaXRDYXRlZ29yeVNlbGVjdCgpO1xuXG4gICAgICAgIGhhbmRsZVByb3RvdHlwZXMoe1xuICAgICAgICAgICAgJ3Byb3RvdHlwZVByZWZpeCc6ICdwYXltZW50UHJvdmlkZXInLFxuICAgICAgICAgICAgJ2NvbnRhaW5lclNlbGVjdG9yJzogJy5wYXltZW50U2V0dGluZ3MnLFxuICAgICAgICAgICAgJ3NlbGVjdG9yQXR0cic6ICdkYXRhLWZhY3RvcnknXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jb3B5LXRvLWNsaXBib2FyZCcpLmZvckVhY2goZnVuY3Rpb24gKGJ1dHRvbikge1xuICAgICAgICAgICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGFyZ2V0SWQgPSB0aGlzLmRhdGFzZXQudGFyZ2V0O1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvcHlUZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGFyZ2V0SWQpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGNvcHlUZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvcHlUZXh0LnNlbGVjdCgpO1xuICAgICAgICAgICAgICAgICAgICBjb3B5VGV4dC5zZXRTZWxlY3Rpb25SYW5nZSgwLCA5OTk5OSk7IC8vIEZvciBtb2JpbGUgZGV2aWNlc1xuXG4gICAgICAgICAgICAgICAgICAgIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KGNvcHlUZXh0LnZhbHVlKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE9wdGlvbmFsbHkgc2hvdyBhIHRvb2x0aXAgb3IgY29uZmlybWF0aW9uIGhlcmVcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEV4YW1wbGU6IHVzaW5nIGEgdG9vbHRpcCBsaWJyYXJ5IG9yIGN1c3RvbSBpbXBsZW1lbnRhdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2hvdyB0b29sdGlwIGxvZ2ljIGdvZXMgaGVyZVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5kYXRhc2V0LmNvcGllZFRleHQpOyAvLyBZb3UgY2FuIHJlcGxhY2UgdGhpcyB3aXRoIHlvdXIgdG9vbHRpcCBsb2dpY1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHNob3AuaW5pdENhdGVnb3J5U2VsZWN0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBmdW5jdGlvbiB1cGRhdGVRdWVyeVN0cmluZ1BhcmFtZXRlcih1cmksIGtleSwgdmFsdWUpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlID0gbmV3IFJlZ0V4cChcIihbPyZdKVwiICsga2V5ICsgXCI9Lio/KCZ8JClcIiwgXCJpXCIpO1xuICAgICAgICAgICAgY29uc3Qgc2VwYXJhdG9yID0gdXJpLmluZGV4T2YoJz8nKSAhPT0gLTEgPyBcIiZcIiA6IFwiP1wiO1xuICAgICAgICAgICAgaWYgKHVyaS5tYXRjaChyZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdXJpLnJlcGxhY2UocmUsICckMScgKyBrZXkgKyBcIj1cIiArIHZhbHVlICsgJyQyJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB1cmkgKyBzZXBhcmF0b3IgKyBrZXkgKyBcIj1cIiArIHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5zaXRlLXJlbG9hZFwiKS5mb3JFYWNoKGZ1bmN0aW9uIChzZWxlY3QpIHtcbiAgICAgICAgICAgIHNlbGVjdC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBsb2NhdGlvbi5ocmVmID0gdXBkYXRlUXVlcnlTdHJpbmdQYXJhbWV0ZXIod2luZG93LmxvY2F0aW9uLmhyZWYsIHRoaXMubmFtZSwgdGhpcy52YWx1ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHNob3AuaW5pdFF1YW50aXR5VmFsaWRhdG9yID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBjb3Jlc2hvcFF1YW50aXR5U2VsZWN0b3Ioe1xuICAgICAgICAgICAgYnV0dG9uZG93bl9jbGFzczogJ2J0biBidG4tc2Vjb25kYXJ5JyxcbiAgICAgICAgICAgIGJ1dHRvbnVwX2NsYXNzOiAnYnRuIGJ0bi1zZWNvbmRhcnknLFxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgc2hvcC5pbml0Q2FydFNoaXBtZW50Q2FsY3VsYXRvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICBjb25zdCBmb3JtID0gZXYudGFyZ2V0LmNsb3Nlc3QoJ2Zvcm1bbmFtZT1cImNvcmVzaG9wX3NoaXBwaW5nX2NhbGN1bGF0b3JcIl0nKTtcbiAgICAgICAgICAgIGlmIChmb3JtKSB7XG4gICAgICAgICAgICAgICAgZXYucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICBmb3JtLmNsYXNzTGlzdC5hZGQoJ2xvYWRpbmcnKTtcbiAgICAgICAgICAgICAgICBmb3JtLnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvblt0eXBlPVwic3VibWl0XCJdJykuc2V0QXR0cmlidXRlKCdkaXNhYmxlZCcsICdkaXNhYmxlZCcpO1xuICAgICAgICAgICAgICAgIGZvcm0uY2xvc2VzdCgnLmNhcnQtc2hpcG1lbnQtY2FsY3VsYXRpb24tYm94JykucXVlcnlTZWxlY3RvcignLmNhcnQtc2hpcG1lbnQtYXZhaWxhYmxlLWNhcnJpZXJzJykuc3R5bGUub3BhY2l0eSA9IDAuMjtcblxuICAgICAgICAgICAgICAgIGZldGNoKGZvcm0uYWN0aW9uLCB7XG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgICAgICAgICBib2R5OiBuZXcgVVJMU2VhcmNoUGFyYW1zKG5ldyBGb3JtRGF0YShmb3JtKSkgLy8gU2VyaWFsaXplIGZvcm0gZGF0YVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLnRoZW4ocmVzcG9uc2UgPT4gcmVzcG9uc2UudGV4dCgpKVxuICAgICAgICAgICAgICAgIC50aGVuKHJlcyA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGZvcm0uY2xhc3NMaXN0LnJlbW92ZSgnbG9hZGluZycpO1xuICAgICAgICAgICAgICAgICAgICBmb3JtLmNsb3Nlc3QoJy5jYXJ0LXNoaXBtZW50LWNhbGN1bGF0aW9uLWJveCcpLm91dGVySFRNTCA9IHJlczsgLy8gUmVwbGFjZSB0aGUgZW50aXJlIGNvbnRhaW5lclxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3I6JywgZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICBmb3JtLmNsYXNzTGlzdC5yZW1vdmUoJ2xvYWRpbmcnKTtcbiAgICAgICAgICAgICAgICAgICAgZm9ybS5xdWVyeVNlbGVjdG9yKCdidXR0b25bdHlwZT1cInN1Ym1pdFwiXScpLnJlbW92ZUF0dHJpYnV0ZSgnZGlzYWJsZWQnKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHNob3AuaW5pdENoYW5nZUFkZHJlc3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNvbnN0IGFkZHJlc3NTdGVwID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNoZWNrb3V0LXN0ZXAuc3RlcC1hZGRyZXNzJyk7XG5cbiAgICAgICAgaWYgKCFhZGRyZXNzU3RlcCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaW52b2ljZUFkZHJlc3MgPSBhZGRyZXNzU3RlcC5xdWVyeVNlbGVjdG9yKCdzZWxlY3RbbmFtZT1cImNvcmVzaG9wW2ludm9pY2VBZGRyZXNzXVwiXScpO1xuICAgICAgICBjb25zdCBpbnZvaWNlUGFuZWwgPSBhZGRyZXNzU3RlcC5xdWVyeVNlbGVjdG9yKCcucGFuZWwtaW52b2ljZS1hZGRyZXNzJyk7XG4gICAgICAgIGNvbnN0IGludm9pY2VGaWVsZCA9IGFkZHJlc3NTdGVwLnF1ZXJ5U2VsZWN0b3IoJy5pbnZvaWNlLWFkZHJlc3Mtc2VsZWN0b3InKTtcbiAgICAgICAgY29uc3Qgc2hpcHBpbmdBZGRyZXNzID0gYWRkcmVzc1N0ZXAucXVlcnlTZWxlY3Rvcignc2VsZWN0W25hbWU9XCJjb3Jlc2hvcFtzaGlwcGluZ0FkZHJlc3NdXCJdJyk7XG4gICAgICAgIGNvbnN0IHNoaXBwaW5nUGFuZWwgPSBhZGRyZXNzU3RlcC5xdWVyeVNlbGVjdG9yKCcucGFuZWwtc2hpcHBpbmctYWRkcmVzcycpO1xuICAgICAgICBjb25zdCBzaGlwcGluZ0ZpZWxkID0gYWRkcmVzc1N0ZXAucXVlcnlTZWxlY3RvcignLnNoaXBwaW5nLWFkZHJlc3Mtc2VsZWN0b3InKTtcbiAgICAgICAgY29uc3Qgc2hpcHBpbmdBZGRBZGRyZXNzQnV0dG9uID0gc2hpcHBpbmdQYW5lbC5wYXJlbnRFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jYXJkLWZvb3RlcicpO1xuICAgICAgICBjb25zdCB1c2VJYXNTID0gYWRkcmVzc1N0ZXAucXVlcnlTZWxlY3RvcignW25hbWU9XCJjb3Jlc2hvcFt1c2VJbnZvaWNlQXNTaGlwcGluZ11cIl0nKTtcblxuICAgICAgICBpbnZvaWNlQWRkcmVzcy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjb25zdCBzZWxlY3RlZCA9IHRoaXMub3B0aW9uc1t0aGlzLnNlbGVjdGVkSW5kZXhdO1xuICAgICAgICAgICAgY29uc3QgYWRkcmVzcyA9IHNlbGVjdGVkLmRhdGFzZXQuYWRkcmVzcztcbiAgICAgICAgICAgIGNvbnN0IGFkZHJlc3NUeXBlID0gc2VsZWN0ZWQuZGF0YXNldC5hZGRyZXNzVHlwZTtcblxuICAgICAgICAgICAgaWYgKHVzZUlhc1MpIHtcbiAgICAgICAgICAgICAgICBpZiAoYWRkcmVzc1R5cGUgPT09ICdpbnZvaWNlJykge1xuICAgICAgICAgICAgICAgICAgICB1c2VJYXNTLmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdXNlSWFzUy5jaGVja2VkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHVzZUlhc1MuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2NoYW5nZScpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB1c2VJYXNTLmRpc2FibGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoYWRkcmVzcykge1xuICAgICAgICAgICAgICAgIGludm9pY2VQYW5lbC5pbm5lckhUTUwgPSBhZGRyZXNzO1xuICAgICAgICAgICAgICAgIGlmICh1c2VJYXNTLmNoZWNrZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgc2hpcHBpbmdBZGRyZXNzLnZhbHVlID0gdGhpcy52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgc2hpcHBpbmdBZGRyZXNzLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdjaGFuZ2UnKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpbnZvaWNlUGFuZWwuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgICAgICAgICAgaWYgKHVzZUlhc1MuY2hlY2tlZCkge1xuICAgICAgICAgICAgICAgICAgICBzaGlwcGluZ1BhbmVsLmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICBzaGlwcGluZ0FkZHJlc3MudmFsdWUgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgc2hpcHBpbmdBZGRyZXNzLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdjaGFuZ2UnKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBzaGlwcGluZ0FkZHJlc3MuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY29uc3QgYWRkcmVzcyA9IHRoaXMub3B0aW9uc1t0aGlzLnNlbGVjdGVkSW5kZXhdLmRhdGFzZXQuYWRkcmVzcztcbiAgICAgICAgICAgIHNoaXBwaW5nUGFuZWwuaW5uZXJIVE1MID0gYWRkcmVzcyA/IGFkZHJlc3MgOiAnJztcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKCF1c2VJYXNTLmNoZWNrZWQgJiYgc2hpcHBpbmdBZGRBZGRyZXNzQnV0dG9uKSB7XG4gICAgICAgICAgICBzaGlwcGluZ0FkZEFkZHJlc3NCdXR0b24uY2xhc3NMaXN0LnJlbW92ZSgnZC1ub25lJyk7XG4gICAgICAgIH1cblxuICAgICAgICB1c2VJYXNTLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmNoZWNrZWQpIHtcbiAgICAgICAgICAgICAgICBzaGlwcGluZ0ZpZWxkLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICAgICAgY29uc3QgYWRkcmVzcyA9IGludm9pY2VBZGRyZXNzLm9wdGlvbnNbaW52b2ljZUFkZHJlc3Muc2VsZWN0ZWRJbmRleF0uZGF0YXNldC5hZGRyZXNzO1xuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gaW52b2ljZUFkZHJlc3MudmFsdWU7XG5cbiAgICAgICAgICAgICAgICBpZiAoYWRkcmVzcykge1xuICAgICAgICAgICAgICAgICAgICBzaGlwcGluZ0FkZHJlc3MudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgc2hpcHBpbmdBZGRyZXNzLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdjaGFuZ2UnKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChzaGlwcGluZ0FkZEFkZHJlc3NCdXR0b24pIHtcbiAgICAgICAgICAgICAgICAgICAgc2hpcHBpbmdBZGRBZGRyZXNzQnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2Qtbm9uZScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2hpcHBpbmdGaWVsZC5zdHlsZS5kaXNwbGF5ID0gJyc7XG4gICAgICAgICAgICAgICAgaWYgKHNoaXBwaW5nQWRkQWRkcmVzc0J1dHRvbikge1xuICAgICAgICAgICAgICAgICAgICBzaGlwcGluZ0FkZEFkZHJlc3NCdXR0b24uY2xhc3NMaXN0LnJlbW92ZSgnZC1ub25lJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoaW52b2ljZUFkZHJlc3MucXVlcnlTZWxlY3Rvcignb3B0aW9uOmNoZWNrZWQnKSkge1xuICAgICAgICAgICAgY29uc3QgYWRkcmVzcyA9IGludm9pY2VBZGRyZXNzLnF1ZXJ5U2VsZWN0b3IoJ29wdGlvbjpjaGVja2VkJykuZGF0YXNldC5hZGRyZXNzO1xuICAgICAgICAgICAgY29uc3QgYWRkcmVzc1R5cGUgPSBpbnZvaWNlQWRkcmVzcy5xdWVyeVNlbGVjdG9yKCdvcHRpb246Y2hlY2tlZCcpLmRhdGFzZXQuYWRkcmVzc1R5cGU7XG5cbiAgICAgICAgICAgIGlmICh1c2VJYXNTKSB7XG4gICAgICAgICAgICAgICAgaWYgKGFkZHJlc3NUeXBlID09PSAnaW52b2ljZScpIHtcbiAgICAgICAgICAgICAgICAgICAgdXNlSWFzUy5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHVzZUlhc1MuY2hlY2tlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB1c2VJYXNTLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdjaGFuZ2UnKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdXNlSWFzUy5kaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGFkZHJlc3MpIHtcbiAgICAgICAgICAgICAgICBpbnZvaWNlUGFuZWwuaW5uZXJIVE1MID0gYWRkcmVzcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzaGlwcGluZ0FkZHJlc3MucXVlcnlTZWxlY3Rvcignb3B0aW9uOmNoZWNrZWQnKSkge1xuICAgICAgICAgICAgY29uc3QgYWRkcmVzcyA9IHNoaXBwaW5nQWRkcmVzcy5xdWVyeVNlbGVjdG9yKCdvcHRpb246Y2hlY2tlZCcpLmRhdGFzZXQuYWRkcmVzcztcbiAgICAgICAgICAgIGlmIChhZGRyZXNzKSB7XG4gICAgICAgICAgICAgICAgc2hpcHBpbmdQYW5lbC5pbm5lckhUTUwgPSBhZGRyZXNzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxufSh3aW5kb3cuc2hvcCA9IHdpbmRvdy5zaG9wIHx8IHt9KSk7XG4iLCIoZnVuY3Rpb24gKHZhcmlhbnQpIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24gKCkge1xuICAgICAgICB3aW5kb3cudmFyaWFudFJlYWR5ID0gZmFsc2U7XG5cbiAgICAgICAgdmFyaWFudC5pbml0KCk7XG5cbiAgICAgICAgd2luZG93LnZhcmlhbnRSZWFkeSA9IHRydWU7XG4gICAgfSk7XG5cbiAgICB2YXJpYW50LmluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNvbnN0IHZhcmlhbnRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnByb2R1Y3QtaW5mb19fYXR0cmlidXRlcycpO1xuICAgICAgICBpZiAoIXZhcmlhbnRzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb3Jlc2hvcFZhcmlhbnRTZWxlY3Rvcih2YXJpYW50cyk7IC8vIEVuc3VyZSB0aGlzIGZ1bmN0aW9uIGlzIGRlZmluZWQgaW4geW91ciBnbG9iYWwgc2NvcGVcblxuICAgICAgICB2YXJpYW50cy5hZGRFdmVudExpc3RlbmVyKCd2YXJpYW50X3NlbGVjdG9yLnNlbGVjdCcsIChlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBvcHRpb25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnByb2R1Y3QtaW5mbyAucHJvZHVjdC1kZXRhaWxzIC5vcHRpb25zJyk7XG5cbiAgICAgICAgICAgIGlmIChvcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3VibWl0cyA9IG9wdGlvbnMucXVlcnlTZWxlY3RvckFsbCgnW3R5cGU9XCJzdWJtaXRcIl0nKTtcblxuICAgICAgICAgICAgICAgIG9wdGlvbnMuY2xhc3NMaXN0LmFkZCgnZGlzYWJsZWQnKTtcblxuICAgICAgICAgICAgICAgIHN1Ym1pdHMuZm9yRWFjaCgoc3VibWl0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHN1Ym1pdC5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG59KHdpbmRvdy52YXJpYW50ID0gd2luZG93LnZhcmlhbnQgfHwge30pKTtcbiIsIi8qIFNUWUxFUyAgKi9cbmltcG9ydCAnLi4vc2Nzcy9hcHAuc2Nzcyc7XG5pbXBvcnQgJ3N3aXBlci9jc3MvYnVuZGxlJztcbi8qIEpTICovXG5pbXBvcnQgJ2Jvb3RzdHJhcCc7XG5pbXBvcnQgU3dpcGVyIGZyb20gJ3N3aXBlcic7XG5pbXBvcnQgJy4vc2NyaXB0cy9oYW5kbGUtcHJvdG90eXBlcy5qcyc7XG5pbXBvcnQgJy4vcGx1Z2luL2NvcmVzaG9wLnBsdWdpbi5xdWFudGl0eS5qcyc7XG5pbXBvcnQgJy4vcGx1Z2luL2NvcmVzaG9wLnBsdWdpbi52YXJpYW50LmpzJztcbmltcG9ydCAnLi9zY3JpcHRzL3Nob3AuanMnO1xuaW1wb3J0ICcuL3NjcmlwdHMvdmFyaWFudC5qcyc7XG5pbXBvcnQgJy4vc2NyaXB0cy9tYXAuanMnO1xuaW1wb3J0IHsgVGh1bWJzIH0gZnJvbSBcInN3aXBlci9tb2R1bGVzXCI7XG4vKiBJbml0IHN3aXBlciB3aXRoIHRodW1icyAqL1xudmFyIHNsaWRlclRodW1ibmFpbCA9IG5ldyBTd2lwZXIoJy5qcy1zbGlkZXItdGh1bWJuYWlsJywge1xuICAgIHNsaWRlc1BlclZpZXc6IDMsXG4gICAgZnJlZU1vZGU6IHRydWUsXG4gICAgc3BhY2VCZXR3ZWVuOiAnOHB4JyxcbiAgICB3YXRjaFNsaWRlc1Byb2dyZXNzOiB0cnVlLFxufSk7XG52YXIgc2xpZGVyID0gbmV3IFN3aXBlcignLmpzLXNsaWRlcicsIHtcbiAgICBtb2R1bGVzOiBbVGh1bWJzXSxcbiAgICBuYXZpZ2F0aW9uOiB7XG4gICAgICAgIG5leHRFbDogJy5zd2lwZXItYnV0dG9uLW5leHQnLFxuICAgICAgICBwcmV2RWw6ICcuc3dpcGVyLWJ1dHRvbi1wcmV2JyxcbiAgICB9LFxuICAgIHRodW1iczoge1xuICAgICAgICBzd2lwZXI6IHNsaWRlclRodW1ibmFpbFxuICAgIH1cbn0pO1xuIiwiLy8gZXh0cmFjdGVkIGJ5IG1pbmktY3NzLWV4dHJhY3QtcGx1Z2luXG5leHBvcnQge307IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbi8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBfX3dlYnBhY2tfbW9kdWxlc19fO1xuXG4iLCJ2YXIgZGVmZXJyZWQgPSBbXTtcbl9fd2VicGFja19yZXF1aXJlX18uTyA9IChyZXN1bHQsIGNodW5rSWRzLCBmbiwgcHJpb3JpdHkpID0+IHtcblx0aWYoY2h1bmtJZHMpIHtcblx0XHRwcmlvcml0eSA9IHByaW9yaXR5IHx8IDA7XG5cdFx0Zm9yKHZhciBpID0gZGVmZXJyZWQubGVuZ3RoOyBpID4gMCAmJiBkZWZlcnJlZFtpIC0gMV1bMl0gPiBwcmlvcml0eTsgaS0tKSBkZWZlcnJlZFtpXSA9IGRlZmVycmVkW2kgLSAxXTtcblx0XHRkZWZlcnJlZFtpXSA9IFtjaHVua0lkcywgZm4sIHByaW9yaXR5XTtcblx0XHRyZXR1cm47XG5cdH1cblx0dmFyIG5vdEZ1bGZpbGxlZCA9IEluZmluaXR5O1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IGRlZmVycmVkLmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIGNodW5rSWRzID0gZGVmZXJyZWRbaV1bMF07XG5cdFx0dmFyIGZuID0gZGVmZXJyZWRbaV1bMV07XG5cdFx0dmFyIHByaW9yaXR5ID0gZGVmZXJyZWRbaV1bMl07XG5cdFx0dmFyIGZ1bGZpbGxlZCA9IHRydWU7XG5cdFx0Zm9yICh2YXIgaiA9IDA7IGogPCBjaHVua0lkcy5sZW5ndGg7IGorKykge1xuXHRcdFx0aWYgKChwcmlvcml0eSAmIDEgPT09IDAgfHwgbm90RnVsZmlsbGVkID49IHByaW9yaXR5KSAmJiBPYmplY3Qua2V5cyhfX3dlYnBhY2tfcmVxdWlyZV9fLk8pLmV2ZXJ5KChrZXkpID0+IChfX3dlYnBhY2tfcmVxdWlyZV9fLk9ba2V5XShjaHVua0lkc1tqXSkpKSkge1xuXHRcdFx0XHRjaHVua0lkcy5zcGxpY2Uoai0tLCAxKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGZ1bGZpbGxlZCA9IGZhbHNlO1xuXHRcdFx0XHRpZihwcmlvcml0eSA8IG5vdEZ1bGZpbGxlZCkgbm90RnVsZmlsbGVkID0gcHJpb3JpdHk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmKGZ1bGZpbGxlZCkge1xuXHRcdFx0ZGVmZXJyZWQuc3BsaWNlKGktLSwgMSlcblx0XHRcdHZhciByID0gZm4oKTtcblx0XHRcdGlmIChyICE9PSB1bmRlZmluZWQpIHJlc3VsdCA9IHI7XG5cdFx0fVxuXHR9XG5cdHJldHVybiByZXN1bHQ7XG59OyIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSAobW9kdWxlKSA9PiB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdCgpID0+IChtb2R1bGVbJ2RlZmF1bHQnXSkgOlxuXHRcdCgpID0+IChtb2R1bGUpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5nID0gKGZ1bmN0aW9uKCkge1xuXHRpZiAodHlwZW9mIGdsb2JhbFRoaXMgPT09ICdvYmplY3QnKSByZXR1cm4gZ2xvYmFsVGhpcztcblx0dHJ5IHtcblx0XHRyZXR1cm4gdGhpcyB8fCBuZXcgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblx0fSBjYXRjaCAoZSkge1xuXHRcdGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JykgcmV0dXJuIHdpbmRvdztcblx0fVxufSkoKTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiLy8gbm8gYmFzZVVSSVxuXG4vLyBvYmplY3QgdG8gc3RvcmUgbG9hZGVkIGFuZCBsb2FkaW5nIGNodW5rc1xuLy8gdW5kZWZpbmVkID0gY2h1bmsgbm90IGxvYWRlZCwgbnVsbCA9IGNodW5rIHByZWxvYWRlZC9wcmVmZXRjaGVkXG4vLyBbcmVzb2x2ZSwgcmVqZWN0LCBQcm9taXNlXSA9IGNodW5rIGxvYWRpbmcsIDAgPSBjaHVuayBsb2FkZWRcbnZhciBpbnN0YWxsZWRDaHVua3MgPSB7XG5cdFwiYXBwXCI6IDBcbn07XG5cbi8vIG5vIGNodW5rIG9uIGRlbWFuZCBsb2FkaW5nXG5cbi8vIG5vIHByZWZldGNoaW5nXG5cbi8vIG5vIHByZWxvYWRlZFxuXG4vLyBubyBITVJcblxuLy8gbm8gSE1SIG1hbmlmZXN0XG5cbl9fd2VicGFja19yZXF1aXJlX18uTy5qID0gKGNodW5rSWQpID0+IChpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF0gPT09IDApO1xuXG4vLyBpbnN0YWxsIGEgSlNPTlAgY2FsbGJhY2sgZm9yIGNodW5rIGxvYWRpbmdcbnZhciB3ZWJwYWNrSnNvbnBDYWxsYmFjayA9IChwYXJlbnRDaHVua0xvYWRpbmdGdW5jdGlvbiwgZGF0YSkgPT4ge1xuXHR2YXIgY2h1bmtJZHMgPSBkYXRhWzBdO1xuXHR2YXIgbW9yZU1vZHVsZXMgPSBkYXRhWzFdO1xuXHR2YXIgcnVudGltZSA9IGRhdGFbMl07XG5cdC8vIGFkZCBcIm1vcmVNb2R1bGVzXCIgdG8gdGhlIG1vZHVsZXMgb2JqZWN0LFxuXHQvLyB0aGVuIGZsYWcgYWxsIFwiY2h1bmtJZHNcIiBhcyBsb2FkZWQgYW5kIGZpcmUgY2FsbGJhY2tcblx0dmFyIG1vZHVsZUlkLCBjaHVua0lkLCBpID0gMDtcblx0aWYoY2h1bmtJZHMuc29tZSgoaWQpID0+IChpbnN0YWxsZWRDaHVua3NbaWRdICE9PSAwKSkpIHtcblx0XHRmb3IobW9kdWxlSWQgaW4gbW9yZU1vZHVsZXMpIHtcblx0XHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhtb3JlTW9kdWxlcywgbW9kdWxlSWQpKSB7XG5cdFx0XHRcdF9fd2VicGFja19yZXF1aXJlX18ubVttb2R1bGVJZF0gPSBtb3JlTW9kdWxlc1ttb2R1bGVJZF07XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmKHJ1bnRpbWUpIHZhciByZXN1bHQgPSBydW50aW1lKF9fd2VicGFja19yZXF1aXJlX18pO1xuXHR9XG5cdGlmKHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uKSBwYXJlbnRDaHVua0xvYWRpbmdGdW5jdGlvbihkYXRhKTtcblx0Zm9yKDtpIDwgY2h1bmtJZHMubGVuZ3RoOyBpKyspIHtcblx0XHRjaHVua0lkID0gY2h1bmtJZHNbaV07XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGluc3RhbGxlZENodW5rcywgY2h1bmtJZCkgJiYgaW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdKSB7XG5cdFx0XHRpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF1bMF0oKTtcblx0XHR9XG5cdFx0aW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdID0gMDtcblx0fVxuXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXy5PKHJlc3VsdCk7XG59XG5cbnZhciBjaHVua0xvYWRpbmdHbG9iYWwgPSBzZWxmW1wid2VicGFja0NodW5rXCJdID0gc2VsZltcIndlYnBhY2tDaHVua1wiXSB8fCBbXTtcbmNodW5rTG9hZGluZ0dsb2JhbC5mb3JFYWNoKHdlYnBhY2tKc29ucENhbGxiYWNrLmJpbmQobnVsbCwgMCkpO1xuY2h1bmtMb2FkaW5nR2xvYmFsLnB1c2ggPSB3ZWJwYWNrSnNvbnBDYWxsYmFjay5iaW5kKG51bGwsIGNodW5rTG9hZGluZ0dsb2JhbC5wdXNoLmJpbmQoY2h1bmtMb2FkaW5nR2xvYmFsKSk7IiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBkZXBlbmRzIG9uIG90aGVyIGxvYWRlZCBjaHVua3MgYW5kIGV4ZWN1dGlvbiBuZWVkIHRvIGJlIGRlbGF5ZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXy5PKHVuZGVmaW5lZCwgW1widmVuZG9ycy1ub2RlX21vZHVsZXNfYm9vdHN0cmFwX2Rpc3RfanNfYm9vdHN0cmFwX2VzbV9qcy1ub2RlX21vZHVsZXNfc3dpcGVyX3N3aXBlci1idW5kbGVfY3NzLWQzNWNmOVwiXSwgKCkgPT4gKF9fd2VicGFja19yZXF1aXJlX18oXCIuL2pzL2FwcC50c1wiKSkpXG5fX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXy5PKF9fd2VicGFja19leHBvcnRzX18pO1xuIiwiIl0sIm5hbWVzIjpbImNvcmVzaG9wUXVhbnRpdHlTZWxlY3RvciIsIm9wdGlvbnMiLCJpbml0UXVhbnRpdHlGaWVsZHMiLCJmaWVsZHMiLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJwcmVjaXNpb25QcmVzZXRTZWxlY3RvciIsInF1ZXJ5U2VsZWN0b3IiLCJhZGRFdmVudExpc3RlbmVyIiwiZGF0YXNldCIsImNzVW5pdElkZW50aWZpZXIiLCJzZWxlY3RlZE9wdGlvbiIsInNlbGVjdGVkSW5kZXgiLCJxdWFudGl0eUlkZW50aWZpZXIiLCJxdWFudGl0eUlucHV0IiwiY29uY2F0Iiwic3RlcCIsImNzVW5pdFByZWNpc2lvbiIsInVwZGF0ZVRvdWNoU3BpblNldHRpbmdzIiwidG9TdHJpbmciLCJmb3JFYWNoIiwiZmllbGQiLCJpbml0aWFsaXplVG91Y2hTcGluIiwiaW5wdXQiLCJwcmVjaXNpb24iLCJjb250YWluZXIiLCJjcmVhdGVFbGVtZW50IiwiY2xhc3NMaXN0IiwiYWRkIiwiZGVjcmVtZW50QnV0dG9uIiwidHlwZSIsInRleHRDb250ZW50IiwiaW5jcmVtZW50QnV0dG9uIiwicGFyZW50Tm9kZSIsImluc2VydEJlZm9yZSIsImFwcGVuZENoaWxkIiwidmFsdWUiLCJwYXJzZUludCIsImlzTmFOIiwibWluIiwibWF4Iiwid2luZG93IiwiY29yZXNob3BWYXJpYW50U2VsZWN0b3IiLCJhdHRyaWJ1dGVDb250YWluZXIiLCJfYXR0cmlidXRlQ29udGFpbmVyIiwidW5kZWZpbmVkIiwiX2NvbmZpZyIsIl9hdHRyaWJ1dGVHcm91cHMiLCJfY2xlYXJHcm91cCIsImdyb3VwIiwic2VsZWN0ZWQiLCJlbGVtZW50cyIsImVsZW1lbnQiLCJkaXNhYmxlZCIsImNoZWNrZWQiLCJ0YWdOYW1lIiwidG9Mb3dlckNhc2UiLCJvcHRpb24iLCJyZW1vdmVDaGlsZCIsIl9jbGVhckdyb3VwcyIsIm5leHRHcm91cCIsIl9maWx0ZXJBdHRyaWJ1dGVzIiwiYXR0cmlidXRlcyIsImZpbHRlckF0dHJpYnV0ZXMiLCJwcmV2R3JvdXAiLCJwdXNoIiwiaWQiLCJmaWx0ZXJlZCIsImF0dHJpYnV0ZSIsInByb2R1Y3RzIiwicHJvZHVjdCIsImV2ZXJ5IiwieCIsImluZGV4IiwiaGFzT3duUHJvcGVydHkiLCJpbmNsdWRlcyIsImxlbmd0aCIsIl9jb25maWd1cmVHcm91cCIsInNsaWNlIiwiT3B0aW9uIiwibmFtZSIsIl9zZXR1cEF0dHJpYnV0ZUdyb3VwU2V0dGluZ3MiLCJfc2V0dXBDaGFuZ2VFdmVudHMiLCJvbmNoYW5nZSIsImUiLCJfY29uZmlndXJlRWxlbWVudCIsIl9pbml0IiwiSlNPTiIsInBhcnNlIiwiY29uZmlnIiwiX3JlZGlyZWN0VG9WYXJpYW50IiwiZ3JvdXBzIiwiZmlsdGVyIiwiZyIsIk9iamVjdCIsImZyb21FbnRyaWVzIiwibWFwIiwidmFsdWVzIiwicCIsInN0cmluZ2lmeSIsImxvY2F0aW9uIiwiaHJlZiIsIl9jcmVhdGVFdmVudCIsImRhdGEiLCJhcmd1bWVudHMiLCJDdXN0b21FdmVudCIsImJ1YmJsZXMiLCJjYW5jZWxhYmxlIiwiZGV0YWlsIiwidmFyaWFudFJlYWR5IiwiZGlzcGF0Y2hFdmVudCIsIm1ldGhvZHMiLCJpbml0Iiwic2V0dGluZ3MiLCJhc3NpZ24iLCJzZWxlY3RvciIsInNob3ciLCJyZXBsYWNlIiwic2VsZWN0ZWRWYWx1ZSIsInByb3RvdHlwZVByZWZpeCIsInNlbGVjdG9yQXR0ciIsIkFycmF5IiwiZnJvbSIsImZpbmQiLCJnZXRBdHRyaWJ1dGUiLCJwcm90b3R5cGVFbGVtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJjb250YWluZXJTZWxlY3RvciIsImRhdGFDb250YWluZXJJZCIsImlubmVySFRNTCIsInRyaW0iLCJwcm90b3R5cGUiLCJOb2RlTGlzdCIsImhhbmRsZVByb3RvdHlwZXMiLCJtZXRob2QiLCJhcHBseSIsImNhbGwiLCJFcnJvciIsIkhUTUxFbGVtZW50IiwibWFwQmxvY2siLCJzdHlsZSIsImhlaWdodCIsImNsaWVudEhlaWdodCIsImluaXRpYWxpemUiLCJtYXBPcHRpb25zIiwiem9vbSIsImNlbnRlciIsImdvb2dsZSIsIm1hcHMiLCJMYXRMbmciLCJkaXNhYmxlRGVmYXVsdFVJIiwiTWFwIiwic2hvcCIsImluaXRDaGFuZ2VBZGRyZXNzIiwiaW5pdENhcnRTaGlwbWVudENhbGN1bGF0b3IiLCJpbml0UXVhbnRpdHlWYWxpZGF0b3IiLCJpbml0Q2F0ZWdvcnlTZWxlY3QiLCJidXR0b24iLCJ0YXJnZXRJZCIsInRhcmdldCIsImNvcHlUZXh0Iiwic2VsZWN0Iiwic2V0U2VsZWN0aW9uUmFuZ2UiLCJuYXZpZ2F0b3IiLCJjbGlwYm9hcmQiLCJ3cml0ZVRleHQiLCJ0aGVuIiwiY29uc29sZSIsImxvZyIsImNvcGllZFRleHQiLCJ1cGRhdGVRdWVyeVN0cmluZ1BhcmFtZXRlciIsInVyaSIsImtleSIsInJlIiwiUmVnRXhwIiwic2VwYXJhdG9yIiwiaW5kZXhPZiIsIm1hdGNoIiwiYnV0dG9uZG93bl9jbGFzcyIsImJ1dHRvbnVwX2NsYXNzIiwiZXYiLCJmb3JtIiwiY2xvc2VzdCIsInByZXZlbnREZWZhdWx0Iiwic2V0QXR0cmlidXRlIiwib3BhY2l0eSIsImZldGNoIiwiYWN0aW9uIiwiYm9keSIsIlVSTFNlYXJjaFBhcmFtcyIsIkZvcm1EYXRhIiwicmVzcG9uc2UiLCJ0ZXh0IiwicmVzIiwicmVtb3ZlIiwib3V0ZXJIVE1MIiwiY2F0Y2giLCJlcnJvciIsInJlbW92ZUF0dHJpYnV0ZSIsImFkZHJlc3NTdGVwIiwiaW52b2ljZUFkZHJlc3MiLCJpbnZvaWNlUGFuZWwiLCJpbnZvaWNlRmllbGQiLCJzaGlwcGluZ0FkZHJlc3MiLCJzaGlwcGluZ1BhbmVsIiwic2hpcHBpbmdGaWVsZCIsInNoaXBwaW5nQWRkQWRkcmVzc0J1dHRvbiIsInBhcmVudEVsZW1lbnQiLCJ1c2VJYXNTIiwiYWRkcmVzcyIsImFkZHJlc3NUeXBlIiwiRXZlbnQiLCJkaXNwbGF5IiwidmFyaWFudCIsInZhcmlhbnRzIiwic3VibWl0cyIsInN1Ym1pdCIsIlN3aXBlciIsIlRodW1icyIsInNsaWRlclRodW1ibmFpbCIsInNsaWRlc1BlclZpZXciLCJmcmVlTW9kZSIsInNwYWNlQmV0d2VlbiIsIndhdGNoU2xpZGVzUHJvZ3Jlc3MiLCJzbGlkZXIiLCJtb2R1bGVzIiwibmF2aWdhdGlvbiIsIm5leHRFbCIsInByZXZFbCIsInRodW1icyIsInN3aXBlciJdLCJzb3VyY2VSb290IjoiIn0=