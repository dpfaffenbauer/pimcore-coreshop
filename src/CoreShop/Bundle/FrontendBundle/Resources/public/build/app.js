/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./js/plugin/coreshop.plugin.quantity.js":
/*!***********************************************!*\
  !*** ./js/plugin/coreshop.plugin.quantity.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

/* provided dependency */ var jQuery = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js");
__webpack_require__(/*! core-js/modules/es.string.replace.js */ "../../../../../../../../node_modules/core-js/modules/es.string.replace.js");
;
(function ($) {
  $.coreshopQuantitySelector = function (options) {
    initQuantityFields(options);
  };
  function initQuantityFields(options) {
    var $fields = $('input.cs-unit-input'),
      $precisionPresetSelector = $('select.cs-unit-selector'),
      touchSpinOptions = $.extend(options, {});

    // listen to unit definition selector
    $precisionPresetSelector.on('change', function () {
      if (!$(this).data('cs-unit-identifier')) {
        return;
      }
      var $selectedOption = $(this).find(':selected'),
        quantityIdentifier = $(this).data('cs-unit-identifier'),
        $quantityInput = $('input[data-cs-unit-identifier="' + quantityIdentifier + '"]'),
        precision = $selectedOption.data('cs-unit-precision') ? $selectedOption.data('cs-unit-precision') : 0,
        strPrecision = '0.' + Array(precision).join('0') + '1';
      if ($quantityInput.length === 0) {
        return;
      }
      $quantityInput.attr('step', precision === 0 ? 1 : strPrecision);
      $quantityInput.attr('data-cs-unit-precision', precision);
      $quantityInput.trigger('touchspin.updatesettings', {
        min: 0,
        max: 1000000000,
        decimals: precision,
        step: precision === 0 ? 1 : strPrecision
      });
    });

    // add quantity validation based on precision
    $fields.each(function () {
      var $el = $(this),
        precision = isNaN($el.attr('data-cs-unit-precision')) ? 0 : parseInt($el.attr('data-cs-unit-precision')),
        strPrecision = '0.' + Array(precision).join('0') + '1';
      $el.TouchSpin($.extend({
        verticalbuttons: true,
        callback_before_calculation: function (v) {
          return v.replace(/,/g, '.');
        },
        callback_after_calculation: function (v) {
          return v.replace(/,/g, '.');
        },
        min: 0,
        max: 1000000000,
        decimals: precision,
        step: precision === 0 ? 1 : strPrecision
      }, touchSpinOptions));
    });
  }
})(jQuery);

/***/ }),

/***/ "./js/plugin/coreshop.plugin.variant.js":
/*!**********************************************!*\
  !*** ./js/plugin/coreshop.plugin.variant.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

/* provided dependency */ var jQuery = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js");
__webpack_require__(/*! core-js/modules/es.object.from-entries.js */ "../../../../../../../../node_modules/core-js/modules/es.object.from-entries.js");
;
(function ($) {
  $.coreshopVariantSelector = function (attributeContainer) {
    let _attributeContainer = undefined;
    let _config = {};
    let _attributeGroups = [];
    let _clearGroup = function (group) {
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
    let _clearGroups = function (group) {
      do {
        _clearGroup(group);
        group = group.nextGroup;
      } while (group);
    };
    let _filterAttributes = function (attributes, group) {
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
    let _configureGroup = function (group) {
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
    let _setupAttributeGroupSettings = function () {
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
    let _setupChangeEvents = function () {
      _attributeGroups.forEach(group => {
        group.elements.forEach(element => {
          element.onchange = e => {
            _configureElement(group, element);
          };
        });
      });
    };
    let _init = function (attributeContainer) {
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
    let _redirectToVariant = function () {
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
    let _createEvent = function (name) {
      let data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return new CustomEvent('variant_selector.' + name, {
        bubbles: true,
        cancelable: false,
        data: data
      });
    };
    let _configureElement = function (group, element) {
      $.variantReady = false;
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
      $.variantReady = true;
    };
    _init(attributeContainer);
  };
})(jQuery);

/***/ }),

/***/ "./js/scripts/custom.js":
/*!******************************!*\
  !*** ./js/scripts/custom.js ***!
  \******************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

/* provided dependency */ var jQuery = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js");
(function ($) {
  'use strict';

  $("#owl-detail").owlCarousel({
    items: 1,
    thumbs: true,
    thumbsPrerendered: true
  });
})(jQuery);

/***/ }),

/***/ "./js/scripts/handle-prototypes.js":
/*!*****************************************!*\
  !*** ./js/scripts/handle-prototypes.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

/* provided dependency */ var jQuery = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js");
__webpack_require__(/*! core-js/modules/es.string.trim.js */ "../../../../../../../../node_modules/core-js/modules/es.string.trim.js");
(function ($) {
  'use strict';

  var methods = {
    init: function (options) {
      var settings = $.extend({
        'prototypePrefix': false,
        'containerSelector': false,
        'selectorAttr': false
      }, options);
      return this.each(function () {
        show($(this), false);
        $(this).change(function () {
          show($(this), true);
        });
        function show(element, replace) {
          var selectedValue = element.val();
          var prototypePrefix = element.attr('id');
          if (false != settings.selectorAttr) {
            selectedValue = element.find('[value="' + element.val() + '"]').attr(settings.selectorAttr);
          }
          if (false != settings.prototypePrefix) {
            prototypePrefix = settings.prototypePrefix;
          }
          var prototypeElement = $('#' + prototypePrefix + '_' + selectedValue);
          var container;
          if (settings.containerSelector) {
            container = $(settings.containerSelector);
          } else {
            container = $(prototypeElement.data('container'));
          }
          if (!container.length) {
            return;
          }
          if (!prototypeElement.length) {
            container.empty();
            return;
          }
          if (replace || !container.html().trim()) {
            container.html(prototypeElement.data('prototype'));
          }
        }
      });
    }
  };
  $.fn.handlePrototypes = function (method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' + method + ' does not exist on jQuery.handlePrototypes');
    }
  };
})(jQuery);

/***/ }),

/***/ "./js/scripts/map.js":
/*!***************************!*\
  !*** ./js/scripts/map.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

/* provided dependency */ var $ = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js");
$(function () {
  if ($('#map-block').length > 0) {
    $("#map-block").height($("#map-wrapper").height());
    function initialize($) {
      var mapOptions = {
        zoom: 18,
        center: new google.maps.LatLng(48.1592513, 14.02302510000004),
        disableDefaultUI: true
      };
      var map = new google.maps.Map(document.getElementById('map-block'), mapOptions);
    }
    google.maps.event.addDomListener(window, 'load', initialize);
  }
});

/***/ }),

/***/ "./js/scripts/shop.js":
/*!****************************!*\
  !*** ./js/scripts/shop.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

/* provided dependency */ var $ = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js");
/* provided dependency */ var jQuery = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js");
__webpack_require__(/*! core-js/modules/es.string.replace.js */ "../../../../../../../../node_modules/core-js/modules/es.string.replace.js");
$(document).ready(function () {
  shop.init();
});
(function (shop, $) {
  shop.init = function () {
    shop.initChangeAddress();
    shop.initCartShipmentCalculator();
    shop.initQuantityValidator();
    shop.initCategorySelect();
    $('#paymentProvider').handlePrototypes({
      'prototypePrefix': 'paymentProvider',
      'containerSelector': '.paymentSettings',
      'selectorAttr': 'data-factory'
    });
    $('.copy-to-clipboard').click(function () {
      var copyText = document.getElementById($(this).data('target'));
      copyText.select();
      copyText.setSelectionRange(0, 99999);
      navigator.clipboard.writeText(copyText.value);
      $(copyText).tooltip({
        title: $(this).data('copied-text')
      });
    });
  };
  shop.initCategorySelect = function () {
    function updateQueryStringParameter(uri, key, value) {
      var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
      var separator = uri.indexOf('?') !== -1 ? "&" : "?";
      if (uri.match(re)) {
        return uri.replace(re, '$1' + key + "=" + value + '$2');
      } else {
        return uri + separator + key + "=" + value;
      }
    }
    $(".site-reload").change(function () {
      location.href = updateQueryStringParameter(window.location.href, this.name, this.value);
    });
  };
  shop.initQuantityValidator = function () {
    $.coreshopQuantitySelector({
      buttondown_class: 'btn btn-secondary',
      buttonup_class: 'btn btn-secondary'
    });
  };
  shop.initCartShipmentCalculator = function () {
    $(document).on('submit', 'form[name="coreshop_shipping_calculator"]', function (ev) {
      ev.preventDefault();
      var $form = $(this);
      $form.addClass('loading');
      $form.find('button[type="submit"]').attr('disabled', 'disabled');
      $form.closest('.cart-shipment-calculation-box').find('.cart-shipment-available-carriers').css('opacity', .2);
      $.ajax({
        url: $form.attr('action'),
        method: 'POST',
        data: $form.serialize(),
        success: function (res) {
          $form.removeClass('loading');
          $form.closest('.cart-shipment-calculation-box').replaceWith($(res));
        }
      });
    });
  };
  shop.initChangeAddress = function () {
    var $addressStep = $('.checkout-step.step-address');
    if ($addressStep.length === 0) {
      return;
    }
    var $invoiceAddress = $addressStep.find('select[name="coreshop[invoiceAddress]"]'),
      $invoicePanel = $addressStep.find('.panel-invoice-address'),
      $invoiceField = $addressStep.find('.invoice-address-selector'),
      $shippingAddress = $addressStep.find('select[name="coreshop[shippingAddress]"]'),
      $shippingPanel = $addressStep.find('.panel-shipping-address'),
      $shippingField = $addressStep.find('.shipping-address-selector'),
      $shippingAddAddressButton = $shippingPanel.parent().find('.card-footer'),
      $useIasS = $addressStep.find('[name="coreshop[useInvoiceAsShipping]"]');
    $invoiceAddress.on('change', function () {
      var selected = $(this).find('option:selected');
      var address = selected.data('address');
      var addressType = selected.data('address-type');
      if ($useIasS) {
        if (addressType === 'invoice') {
          $useIasS.prop("disabled", true);
          $useIasS.prop("checked", false);
          $useIasS.change();
        } else {
          $useIasS.prop("disabled", false);
        }
      }
      if (address) {
        address = address.html;
        $invoicePanel.html(address);
        if ($useIasS.is(':checked')) {
          $shippingAddress.val($(this).val()).trigger('change');
        }
      } else {
        $invoicePanel.html('');
        if ($useIasS.is(':checked')) {
          $shippingPanel.html('');
          $shippingAddress.val(null).trigger('change');
        }
      }
    });
    $shippingAddress.on('change', function () {
      var address = $(this).find('option:selected').data('address');
      if (address) {
        address = address.html;
        $shippingPanel.html(address);
      } else {
        $shippingPanel.html('');
      }
    });
    if ($useIasS.is(':not(:checked)') && $shippingAddAddressButton) {
      $shippingAddAddressButton.removeClass('d-none');
    }
    $useIasS.on('change', function () {
      if ($(this).is(':checked')) {
        $shippingField.slideUp();
        var address = $('option:selected', $invoiceAddress).data('address');
        var value = $(':selected', $invoiceAddress).val();
        if (address) {
          $shippingAddress.val(value).trigger('change');
        }
        if ($shippingAddAddressButton) {
          $shippingAddAddressButton.addClass('d-none');
        }
      } else {
        $shippingField.slideDown();
        if ($shippingAddAddressButton) {
          $shippingAddAddressButton.removeClass('d-none');
        }
      }
    });
    if ($invoiceAddress.find('option:selected').length) {
      var address = $invoiceAddress.find('option:selected').data('address');
      var addressType = $invoiceAddress.find('option:selected').data('address-type');
      if ($useIasS) {
        if (addressType === 'invoice') {
          $useIasS.prop("disabled", true);
          $useIasS.prop("checked", false);
          $useIasS.change();
        } else {
          $useIasS.prop("disabled", false);
        }
      }
      if (address) {
        $invoicePanel.html(address.html);
      }
    }
    if ($shippingAddress.find('option:selected').length) {
      var address = $shippingAddress.find('option:selected').data('address');
      if (address) {
        $shippingPanel.html(address.html);
      }
    }
  };
})(window.shop = window.shop || {}, jQuery);

/***/ }),

/***/ "./js/scripts/variant.js":
/*!*******************************!*\
  !*** ./js/scripts/variant.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

/* provided dependency */ var jQuery = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js");
(function (variant, $) {
  $(document).ready(function () {
    $.variantReady = false;
    variant.init();
    $.variantReady = true;
  });
  variant.init = function () {
    const variants = document.querySelector('.product-info__attributes');
    if (!variants) {
      return;
    }
    $.coreshopVariantSelector(variants);
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
})(window.variant = window.variant || {}, jQuery);

/***/ }),

/***/ "./js/app.ts":
/*!*******************!*\
  !*** ./js/app.ts ***!
  \*******************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _scss_app_scss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../scss/app.scss */ "./scss/app.scss");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js");
/* harmony import */ var jquery__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(jquery__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var bootstrap__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! bootstrap */ "./node_modules/bootstrap/dist/js/bootstrap.esm.js");
/* harmony import */ var bootstrap_touchspin__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! bootstrap-touchspin */ "./node_modules/bootstrap-touchspin/dist/jquery.bootstrap-touchspin.js");
/* harmony import */ var bootstrap_touchspin__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(bootstrap_touchspin__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var owl_carousel__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! owl.carousel */ "./node_modules/owl.carousel/dist/owl.carousel.js");
/* harmony import */ var owl_carousel__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(owl_carousel__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var owl_carousel2_thumbs__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! owl.carousel2.thumbs */ "./node_modules/owl.carousel2.thumbs/dist/owl.carousel2.thumbs.min.js");
/* harmony import */ var owl_carousel2_thumbs__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(owl_carousel2_thumbs__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _scripts_handle_prototypes_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./scripts/handle-prototypes.js */ "./js/scripts/handle-prototypes.js");
/* harmony import */ var _scripts_handle_prototypes_js__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_scripts_handle_prototypes_js__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _plugin_coreshop_plugin_quantity_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./plugin/coreshop.plugin.quantity.js */ "./js/plugin/coreshop.plugin.quantity.js");
/* harmony import */ var _plugin_coreshop_plugin_quantity_js__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(_plugin_coreshop_plugin_quantity_js__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var _plugin_coreshop_plugin_variant_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./plugin/coreshop.plugin.variant.js */ "./js/plugin/coreshop.plugin.variant.js");
/* harmony import */ var _plugin_coreshop_plugin_variant_js__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(_plugin_coreshop_plugin_variant_js__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var _scripts_custom_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./scripts/custom.js */ "./js/scripts/custom.js");
/* harmony import */ var _scripts_custom_js__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(_scripts_custom_js__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var _scripts_shop_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./scripts/shop.js */ "./js/scripts/shop.js");
/* harmony import */ var _scripts_shop_js__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(_scripts_shop_js__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var _scripts_variant_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./scripts/variant.js */ "./js/scripts/variant.js");
/* harmony import */ var _scripts_variant_js__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(_scripts_variant_js__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var _scripts_map_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./scripts/map.js */ "./js/scripts/map.js");
/* harmony import */ var _scripts_map_js__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(_scripts_map_js__WEBPACK_IMPORTED_MODULE_12__);
/* STYLES  */

/* JS */













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
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["vendors-node_modules_bootstrap-touchspin_dist_jquery_bootstrap-touchspin_js-node_modules_boot-d89be2"], () => (__webpack_require__("./js/app.ts")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0E7V0FDQTtXQUNBOzs7OztXQzdCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsaUNBQWlDLFdBQVc7V0FDNUM7V0FDQTs7Ozs7V0NQQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsR0FBRztXQUNIO1dBQ0E7V0FDQSxDQUFDOzs7OztXQ1BEOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7V0NOQTs7V0FFQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7O1dBRUE7O1dBRUE7O1dBRUE7O1dBRUE7O1dBRUE7O1dBRUE7O1dBRUE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLE1BQU0scUJBQXFCO1dBQzNCO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7O1dBRUE7V0FDQTtXQUNBOzs7OztVRWxEQTtVQUNBO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vLy4vanMvcGx1Z2luL2NvcmVzaG9wLnBsdWdpbi5xdWFudGl0eS5qcyIsIndlYnBhY2s6Ly8vLi9qcy9wbHVnaW4vY29yZXNob3AucGx1Z2luLnZhcmlhbnQuanMiLCJ3ZWJwYWNrOi8vLy4vanMvc2NyaXB0cy9jdXN0b20uanMiLCJ3ZWJwYWNrOi8vLy4vanMvc2NyaXB0cy9oYW5kbGUtcHJvdG90eXBlcy5qcyIsIndlYnBhY2s6Ly8vLi9qcy9zY3JpcHRzL21hcC5qcyIsIndlYnBhY2s6Ly8vLi9qcy9zY3JpcHRzL3Nob3AuanMiLCJ3ZWJwYWNrOi8vLy4vanMvc2NyaXB0cy92YXJpYW50LmpzIiwid2VicGFjazovLy8uL2pzL2FwcC50cyIsIndlYnBhY2s6Ly8vLi9zY3NzL2FwcC5zY3NzPzFiOTYiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvY2h1bmsgbG9hZGVkIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvY29tcGF0IGdldCBkZWZhdWx0IGV4cG9ydCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvZ2xvYmFsIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvanNvbnAgY2h1bmsgbG9hZGluZyIsIndlYnBhY2s6Ly8vd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly8vd2VicGFjay9zdGFydHVwIiwid2VicGFjazovLy93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiOyhmdW5jdGlvbiAoJCkge1xuICAgICQuY29yZXNob3BRdWFudGl0eVNlbGVjdG9yID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgICAgaW5pdFF1YW50aXR5RmllbGRzKG9wdGlvbnMpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBpbml0UXVhbnRpdHlGaWVsZHMob3B0aW9ucykge1xuXG4gICAgICAgIHZhciAkZmllbGRzID0gJCgnaW5wdXQuY3MtdW5pdC1pbnB1dCcpLFxuICAgICAgICAgICAgJHByZWNpc2lvblByZXNldFNlbGVjdG9yID0gJCgnc2VsZWN0LmNzLXVuaXQtc2VsZWN0b3InKSxcbiAgICAgICAgICAgIHRvdWNoU3Bpbk9wdGlvbnMgPSAkLmV4dGVuZChvcHRpb25zLCB7fSk7XG5cbiAgICAgICAgLy8gbGlzdGVuIHRvIHVuaXQgZGVmaW5pdGlvbiBzZWxlY3RvclxuICAgICAgICAkcHJlY2lzaW9uUHJlc2V0U2VsZWN0b3Iub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgaWYgKCEkKHRoaXMpLmRhdGEoJ2NzLXVuaXQtaWRlbnRpZmllcicpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgJHNlbGVjdGVkT3B0aW9uID0gJCh0aGlzKS5maW5kKCc6c2VsZWN0ZWQnKSxcbiAgICAgICAgICAgICAgICBxdWFudGl0eUlkZW50aWZpZXIgPSAkKHRoaXMpLmRhdGEoJ2NzLXVuaXQtaWRlbnRpZmllcicpLFxuICAgICAgICAgICAgICAgICRxdWFudGl0eUlucHV0ID0gJCgnaW5wdXRbZGF0YS1jcy11bml0LWlkZW50aWZpZXI9XCInICsgcXVhbnRpdHlJZGVudGlmaWVyICsgJ1wiXScpLFxuICAgICAgICAgICAgICAgIHByZWNpc2lvbiA9ICRzZWxlY3RlZE9wdGlvbi5kYXRhKCdjcy11bml0LXByZWNpc2lvbicpID8gJHNlbGVjdGVkT3B0aW9uLmRhdGEoJ2NzLXVuaXQtcHJlY2lzaW9uJykgOiAwLFxuICAgICAgICAgICAgICAgIHN0clByZWNpc2lvbiA9ICcwLicgKyAoQXJyYXkocHJlY2lzaW9uKS5qb2luKCcwJykpICsgJzEnO1xuXG4gICAgICAgICAgICBpZiAoJHF1YW50aXR5SW5wdXQubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkcXVhbnRpdHlJbnB1dC5hdHRyKCdzdGVwJywgIHByZWNpc2lvbiA9PT0gMCA/IDEgOiBzdHJQcmVjaXNpb24pO1xuICAgICAgICAgICAgJHF1YW50aXR5SW5wdXQuYXR0cignZGF0YS1jcy11bml0LXByZWNpc2lvbicsIHByZWNpc2lvbik7XG4gICAgICAgICAgICAkcXVhbnRpdHlJbnB1dC50cmlnZ2VyKCd0b3VjaHNwaW4udXBkYXRlc2V0dGluZ3MnLCB7XG4gICAgICAgICAgICAgICAgbWluOiAwLFxuICAgICAgICAgICAgICAgIG1heDogMTAwMDAwMDAwMCxcbiAgICAgICAgICAgICAgICBkZWNpbWFsczogcHJlY2lzaW9uLFxuICAgICAgICAgICAgICAgIHN0ZXA6IHByZWNpc2lvbiA9PT0gMCA/IDEgOiBzdHJQcmVjaXNpb25cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIGFkZCBxdWFudGl0eSB2YWxpZGF0aW9uIGJhc2VkIG9uIHByZWNpc2lvblxuICAgICAgICAkZmllbGRzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyICRlbCA9ICQodGhpcyksXG4gICAgICAgICAgICAgICAgcHJlY2lzaW9uID0gaXNOYU4oJGVsLmF0dHIoJ2RhdGEtY3MtdW5pdC1wcmVjaXNpb24nKSkgPyAwIDogcGFyc2VJbnQoJGVsLmF0dHIoJ2RhdGEtY3MtdW5pdC1wcmVjaXNpb24nKSksXG4gICAgICAgICAgICAgICAgc3RyUHJlY2lzaW9uID0gJzAuJyArIChBcnJheShwcmVjaXNpb24pLmpvaW4oJzAnKSkgKyAnMSc7XG5cbiAgICAgICAgICAgICRlbC5Ub3VjaFNwaW4oJC5leHRlbmQoe1xuICAgICAgICAgICAgICAgIHZlcnRpY2FsYnV0dG9uczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjYWxsYmFja19iZWZvcmVfY2FsY3VsYXRpb246IGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2LnJlcGxhY2UoLywvZywgJy4nKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNhbGxiYWNrX2FmdGVyX2NhbGN1bGF0aW9uOiBmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdi5yZXBsYWNlKC8sL2csICcuJyk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBtaW46IDAsXG4gICAgICAgICAgICAgICAgbWF4OiAxMDAwMDAwMDAwLFxuICAgICAgICAgICAgICAgIGRlY2ltYWxzOiBwcmVjaXNpb24sXG4gICAgICAgICAgICAgICAgc3RlcDogcHJlY2lzaW9uID09PSAwID8gMSA6IHN0clByZWNpc2lvbixcbiAgICAgICAgICAgIH0sIHRvdWNoU3Bpbk9wdGlvbnMpKTtcbiAgICAgICAgfSk7XG4gICAgfVxufSkoalF1ZXJ5KTsiLCI7KGZ1bmN0aW9uICgkKSB7XG4gICAgJC5jb3Jlc2hvcFZhcmlhbnRTZWxlY3RvciA9IGZ1bmN0aW9uIChhdHRyaWJ1dGVDb250YWluZXIpIHtcbiAgICAgICAgbGV0IF9hdHRyaWJ1dGVDb250YWluZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgIGxldCBfY29uZmlnID0ge307XG4gICAgICAgIGxldCBfYXR0cmlidXRlR3JvdXBzID0gW107XG5cbiAgICAgICAgbGV0IF9jbGVhckdyb3VwID0gZnVuY3Rpb24gKGdyb3VwKSB7XG4gICAgICAgICAgICBkZWxldGUgZ3JvdXAuc2VsZWN0ZWQ7XG4gICAgICAgICAgICBncm91cC5lbGVtZW50cy5mb3JFYWNoKChlbGVtZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5jaGVja2VkID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAvLyByZW1vdmUgb3B0aW9ucyBvbiBzZWxlY3RcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdzZWxlY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG9wdGlvbnMgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ29wdGlvbjpub3QoW3ZhbHVlPVwiXCJdKScpO1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLmZvckVhY2goKG9wdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVDaGlsZChvcHRpb24pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBfY2xlYXJHcm91cHMgPSBmdW5jdGlvbiAoZ3JvdXApIHtcbiAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICBfY2xlYXJHcm91cChncm91cCk7XG4gICAgICAgICAgICAgICAgZ3JvdXAgPSBncm91cC5uZXh0R3JvdXA7XG4gICAgICAgICAgICB9IHdoaWxlIChncm91cCk7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgX2ZpbHRlckF0dHJpYnV0ZXMgPSBmdW5jdGlvbiAoYXR0cmlidXRlcywgZ3JvdXApIHtcbiAgICAgICAgICAgIGxldCBmaWx0ZXJBdHRyaWJ1dGVzID0gW107XG5cbiAgICAgICAgICAgIGdyb3VwID0gZ3JvdXAucHJldkdyb3VwO1xuICAgICAgICAgICAgd2hpbGUgKGdyb3VwKSB7XG4gICAgICAgICAgICAgICAgaWYgKGdyb3VwLnNlbGVjdGVkICYmIGdyb3VwLm5leHRHcm91cCkge1xuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJBdHRyaWJ1dGVzLnB1c2goe2dyb3VwOiBncm91cC5ncm91cC5pZCwgc2VsZWN0ZWQ6IGdyb3VwLnNlbGVjdGVkfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGdyb3VwID0gZ3JvdXAucHJldkdyb3VwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgZmlsdGVyZWQgPSBbXTtcbiAgICAgICAgICAgIGF0dHJpYnV0ZXMuZm9yRWFjaCgoYXR0cmlidXRlKSA9PiB7XG4gICAgICAgICAgICAgICAgYXR0cmlidXRlLnByb2R1Y3RzLmZvckVhY2goKHByb2R1Y3QpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbHRlckF0dHJpYnV0ZXMuZXZlcnkoKHgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfY29uZmlnLmluZGV4W3Byb2R1Y3QuaWRdWydhdHRyaWJ1dGVzJ10uaGFzT3duUHJvcGVydHkoeC5ncm91cCkgJiYgX2NvbmZpZy5pbmRleFtwcm9kdWN0LmlkXVsnYXR0cmlidXRlcyddW3guZ3JvdXBdID09PSB4LnNlbGVjdGVkO1xuICAgICAgICAgICAgICAgICAgICB9KSAmJiAhZmlsdGVyZWQuaW5jbHVkZXMoYXR0cmlidXRlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyZWQucHVzaChhdHRyaWJ1dGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIGZpbHRlcmVkLmxlbmd0aCA/IGZpbHRlcmVkIDogYXR0cmlidXRlcztcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBfY29uZmlndXJlR3JvdXAgPSBmdW5jdGlvbiAoZ3JvdXApIHtcbiAgICAgICAgICAgIGxldCBhdHRyaWJ1dGVzID0gZ3JvdXAuYXR0cmlidXRlcy5zbGljZSgpO1xuICAgICAgICAgICAgYXR0cmlidXRlcyA9IF9maWx0ZXJBdHRyaWJ1dGVzKGF0dHJpYnV0ZXMsIGdyb3VwKTtcblxuICAgICAgICAgICAgaWYgKGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgICAgICAgICBncm91cC5lbGVtZW50cy5mb3JFYWNoKChlbGVtZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMuZm9yRWFjaCgoYXR0cmlidXRlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzZXQgb3B0aW9ucyBvbiBzZWxlY3QsIG90aGVyd2lzZSBvbmx5IGVuYWJsZSBpbnB1dHNcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ3NlbGVjdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBvcHRpb24gPSBuZXcgT3B0aW9uKGF0dHJpYnV0ZS5hdHRyaWJ1dGUubmFtZSwgYXR0cmlidXRlLmF0dHJpYnV0ZS5pZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uLmlkID0gJ2F0dHJpYnV0ZS0nICsgYXR0cmlidXRlLmF0dHJpYnV0ZS5pZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZ3JvdXAuc2VsZWN0ZWQgPT09IGF0dHJpYnV0ZS5hdHRyaWJ1dGUuaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9uLnNlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5hZGQob3B0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmRpc2FibGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYXJzZUludChlbGVtZW50LmRhdGFzZXQuZ3JvdXApID09PSBncm91cC5ncm91cC5pZCAmJiBwYXJzZUludChlbGVtZW50LnZhbHVlKSA9PT0gYXR0cmlidXRlLmF0dHJpYnV0ZS5pZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmRpc2FibGVkID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGdyb3VwLnNlbGVjdGVkID09PSBhdHRyaWJ1dGUuYXR0cmlidXRlLmlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmNoZWNrZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBfc2V0dXBBdHRyaWJ1dGVHcm91cFNldHRpbmdzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgbGV0IGluZGV4ID0gX2F0dHJpYnV0ZUdyb3Vwcy5sZW5ndGg7XG5cbiAgICAgICAgICAgIHdoaWxlIChpbmRleC0tKSB7XG4gICAgICAgICAgICAgICAgX2F0dHJpYnV0ZUdyb3Vwc1tpbmRleF0ucHJldkdyb3VwID0gX2F0dHJpYnV0ZUdyb3Vwc1tpbmRleCAtIDFdO1xuICAgICAgICAgICAgICAgIF9hdHRyaWJ1dGVHcm91cHNbaW5kZXhdLm5leHRHcm91cCA9IF9hdHRyaWJ1dGVHcm91cHNbaW5kZXggKyAxXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaW5kZXggPSBfYXR0cmlidXRlR3JvdXBzLmxlbmd0aDtcbiAgICAgICAgICAgIHdoaWxlIChpbmRleC0tKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFpbmRleCB8fCBfYXR0cmlidXRlR3JvdXBzW2luZGV4XS5zZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICBfY29uZmlndXJlR3JvdXAoX2F0dHJpYnV0ZUdyb3Vwc1tpbmRleF0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIF9jbGVhckdyb3VwKF9hdHRyaWJ1dGVHcm91cHNbaW5kZXhdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgX3NldHVwQ2hhbmdlRXZlbnRzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX2F0dHJpYnV0ZUdyb3Vwcy5mb3JFYWNoKChncm91cCkgPT4ge1xuICAgICAgICAgICAgICAgIGdyb3VwLmVsZW1lbnRzLmZvckVhY2goKGVsZW1lbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5vbmNoYW5nZSA9IChlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfY29uZmlndXJlRWxlbWVudChncm91cCwgZWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBfaW5pdCA9IGZ1bmN0aW9uIChhdHRyaWJ1dGVDb250YWluZXIpIHtcbiAgICAgICAgICAgIGlmICghYXR0cmlidXRlQ29udGFpbmVyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBfYXR0cmlidXRlQ29udGFpbmVyID0gYXR0cmlidXRlQ29udGFpbmVyO1xuICAgICAgICAgICAgX2NvbmZpZyA9IEpTT04ucGFyc2UoX2F0dHJpYnV0ZUNvbnRhaW5lci5kYXRhc2V0LmNvbmZpZyk7XG4gICAgICAgICAgICBfY29uZmlnLmF0dHJpYnV0ZXMuZm9yRWFjaCgoZ3JvdXApID0+IHtcbiAgICAgICAgICAgICAgICBncm91cC5lbGVtZW50cyA9IF9hdHRyaWJ1dGVDb250YWluZXIucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZ3JvdXA9XCInICsgZ3JvdXAuZ3JvdXAuaWQgKyAnXCJdJyk7XG4gICAgICAgICAgICAgICAgX2F0dHJpYnV0ZUdyb3Vwcy5wdXNoKGdyb3VwKVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIF9zZXR1cEF0dHJpYnV0ZUdyb3VwU2V0dGluZ3MoKTtcbiAgICAgICAgICAgIF9zZXR1cENoYW5nZUV2ZW50cygpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IF9yZWRpcmVjdFRvVmFyaWFudCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNvbnN0IGdyb3VwcyA9IF9hdHRyaWJ1dGVHcm91cHMuZmlsdGVyKChnKSA9PiBnLnNlbGVjdGVkKTtcblxuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWQgPSBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgICAgICAgICAgICAgZ3JvdXBzLm1hcCgoZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gW2cuZ3JvdXAuaWQsIGcuc2VsZWN0ZWRdO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBjb25zdCBmaWx0ZXJlZCA9IE9iamVjdC52YWx1ZXMoX2NvbmZpZy5pbmRleCkuZmlsdGVyKChwKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHAuYXR0cmlidXRlcykgPT09IEpTT04uc3RyaW5naWZ5KHNlbGVjdGVkKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBsZW5ndGggc2hvdWxkIGFsd2F5cyBiZSAxLCBidXQgbGV0J3MgY2hlY2sgaXRcbiAgICAgICAgICAgIGlmIChmaWx0ZXJlZC5sZW5ndGggPT09IDEgJiYgZmlsdGVyZWRbMF1bJ3VybCddKSB7XG4gICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBmaWx0ZXJlZFswXVsndXJsJ107XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgX2NyZWF0ZUV2ZW50ID0gZnVuY3Rpb24gKG5hbWUsIGRhdGEgPSB7fSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBDdXN0b21FdmVudCgndmFyaWFudF9zZWxlY3Rvci4nICsgbmFtZSwge1xuICAgICAgICAgICAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICAgICAgICAgICAgY2FuY2VsYWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgZGF0YTogZGF0YVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBfY29uZmlndXJlRWxlbWVudCA9IGZ1bmN0aW9uIChncm91cCwgZWxlbWVudCkge1xuICAgICAgICAgICAgJC52YXJpYW50UmVhZHkgPSBmYWxzZTtcbiAgICAgICAgICAgIF9hdHRyaWJ1dGVDb250YWluZXIuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgICAgICAgICBfY3JlYXRlRXZlbnQoJ2NoYW5nZScsIHtlbGVtZW50OiBlbGVtZW50fSlcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGlmIChlbGVtZW50LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgZ3JvdXAuc2VsZWN0ZWQgPSBwYXJzZUludChlbGVtZW50LnZhbHVlKTtcbiAgICAgICAgICAgICAgICBpZiAoZ3JvdXAubmV4dEdyb3VwKSB7XG4gICAgICAgICAgICAgICAgICAgIF9hdHRyaWJ1dGVDb250YWluZXIuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgICAgICAgICAgICAgICAgIF9jcmVhdGVFdmVudCgnc2VsZWN0Jywge2VsZW1lbnQ6IGVsZW1lbnR9KVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgIF9jbGVhckdyb3Vwcyhncm91cC5uZXh0R3JvdXApO1xuICAgICAgICAgICAgICAgICAgICBfY29uZmlndXJlR3JvdXAoZ3JvdXAubmV4dEdyb3VwKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBfYXR0cmlidXRlQ29udGFpbmVyLmRpc3BhdGNoRXZlbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICBfY3JlYXRlRXZlbnQoJ3JlZGlyZWN0Jywge2VsZW1lbnQ6IGVsZW1lbnR9KVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICBfcmVkaXJlY3RUb1ZhcmlhbnQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBncm91cC5zZWxlY3RlZDtcbiAgICAgICAgICAgICAgICBpZiAoZ3JvdXAubmV4dEdyb3VwKSB7XG4gICAgICAgICAgICAgICAgICAgIF9jbGVhckdyb3Vwcyhncm91cC5uZXh0R3JvdXApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICQudmFyaWFudFJlYWR5ID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIF9pbml0KGF0dHJpYnV0ZUNvbnRhaW5lcik7XG4gICAgfTtcbn0pKGpRdWVyeSk7IiwiKGZ1bmN0aW9uICgkKSB7XHJcblxyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgICQoXCIjb3dsLWRldGFpbFwiKS5vd2xDYXJvdXNlbCh7XHJcbiAgICAgICAgaXRlbXM6IDEsXHJcbiAgICAgICAgdGh1bWJzOiB0cnVlLFxyXG4gICAgICAgIHRodW1ic1ByZXJlbmRlcmVkOiB0cnVlXHJcbiAgICB9KTtcclxuXHJcblxyXG59KShqUXVlcnkpOyIsIihmdW5jdGlvbiAoJCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBtZXRob2RzID0ge1xuICAgICAgICBpbml0OiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgc2V0dGluZ3MgPSAkLmV4dGVuZCh7XG4gICAgICAgICAgICAgICdwcm90b3R5cGVQcmVmaXgnOiBmYWxzZSxcbiAgICAgICAgICAgICAgJ2NvbnRhaW5lclNlbGVjdG9yJzogZmFsc2UsXG4gICAgICAgICAgICAgICdzZWxlY3RvckF0dHInOiBmYWxzZVxuICAgICAgICAgICAgfSwgb3B0aW9ucyk7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc2hvdygkKHRoaXMpLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgJCh0aGlzKS5jaGFuZ2UoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHNob3coJCh0aGlzKSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBmdW5jdGlvbiBzaG93KGVsZW1lbnQsIHJlcGxhY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNlbGVjdGVkVmFsdWUgPSBlbGVtZW50LnZhbCgpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgcHJvdG90eXBlUHJlZml4ID0gZWxlbWVudC5hdHRyKCdpZCcpO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChmYWxzZSAhPSBzZXR0aW5ncy5zZWxlY3RvckF0dHIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkVmFsdWUgPSBlbGVtZW50LmZpbmQoJ1t2YWx1ZT1cIicrZWxlbWVudC52YWwoKSsnXCJdJykuYXR0cihzZXR0aW5ncy5zZWxlY3RvckF0dHIpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGZhbHNlICE9IHNldHRpbmdzLnByb3RvdHlwZVByZWZpeCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvdG90eXBlUHJlZml4ID0gc2V0dGluZ3MucHJvdG90eXBlUHJlZml4O1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHByb3RvdHlwZUVsZW1lbnQgPSAkKCcjJyArIHByb3RvdHlwZVByZWZpeCArICdfJyArIHNlbGVjdGVkVmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgY29udGFpbmVyO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChzZXR0aW5ncy5jb250YWluZXJTZWxlY3Rvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyID0gJChzZXR0aW5ncy5jb250YWluZXJTZWxlY3Rvcik7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXIgPSAkKHByb3RvdHlwZUVsZW1lbnQuZGF0YSgnY29udGFpbmVyJykpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjb250YWluZXIubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoIXByb3RvdHlwZUVsZW1lbnQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXIuZW1wdHkoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXBsYWNlIHx8ICFjb250YWluZXIuaHRtbCgpLnRyaW0oKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyLmh0bWwocHJvdG90eXBlRWxlbWVudC5kYXRhKCdwcm90b3R5cGUnKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAkLmZuLmhhbmRsZVByb3RvdHlwZXMgPSBmdW5jdGlvbihtZXRob2QpIHtcbiAgICAgICAgaWYgKG1ldGhvZHNbbWV0aG9kXSkge1xuICAgICAgICAgICAgcmV0dXJuIG1ldGhvZHNbbWV0aG9kXS5hcHBseSh0aGlzLCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgbWV0aG9kID09PSAnb2JqZWN0JyB8fCAhbWV0aG9kKSB7XG4gICAgICAgICAgICByZXR1cm4gbWV0aG9kcy5pbml0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkLmVycm9yKCAnTWV0aG9kICcgKyAgbWV0aG9kICsgJyBkb2VzIG5vdCBleGlzdCBvbiBqUXVlcnkuaGFuZGxlUHJvdG90eXBlcycgKTtcbiAgICAgICAgfVxuICAgIH07XG59KShqUXVlcnkpO1xuIiwiJChmdW5jdGlvbigpIHtcbiAgICBpZigkKCcjbWFwLWJsb2NrJykubGVuZ3RoID4gMCkge1xuICAgICAgICAkKFwiI21hcC1ibG9ja1wiKS5oZWlnaHQoJChcIiNtYXAtd3JhcHBlclwiKS5oZWlnaHQoKSk7XG4gICAgICAgIGZ1bmN0aW9uIGluaXRpYWxpemUoJCkge1xuICAgICAgICAgICAgdmFyIG1hcE9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgem9vbTogMTgsXG4gICAgICAgICAgICAgICAgY2VudGVyOiBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKDQ4LjE1OTI1MTMsIDE0LjAyMzAyNTEwMDAwMDA0KSxcbiAgICAgICAgICAgICAgICBkaXNhYmxlRGVmYXVsdFVJOiB0cnVlXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmFyIG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hcC1ibG9jaycpLCBtYXBPcHRpb25zKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGdvb2dsZS5tYXBzLmV2ZW50LmFkZERvbUxpc3RlbmVyKHdpbmRvdywgJ2xvYWQnLCBpbml0aWFsaXplKTtcbiAgICB9XG59KTsiLCIkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XG4gICAgc2hvcC5pbml0KCk7XG59KTtcblxuKGZ1bmN0aW9uIChzaG9wLCAkKSB7XG5cbiAgICBzaG9wLmluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNob3AuaW5pdENoYW5nZUFkZHJlc3MoKTtcbiAgICAgICAgc2hvcC5pbml0Q2FydFNoaXBtZW50Q2FsY3VsYXRvcigpO1xuICAgICAgICBzaG9wLmluaXRRdWFudGl0eVZhbGlkYXRvcigpO1xuICAgICAgICBzaG9wLmluaXRDYXRlZ29yeVNlbGVjdCgpO1xuXG4gICAgICAgICQoJyNwYXltZW50UHJvdmlkZXInKS5oYW5kbGVQcm90b3R5cGVzKHtcbiAgICAgICAgICAgICdwcm90b3R5cGVQcmVmaXgnOiAncGF5bWVudFByb3ZpZGVyJyxcbiAgICAgICAgICAgICdjb250YWluZXJTZWxlY3Rvcic6ICcucGF5bWVudFNldHRpbmdzJyxcbiAgICAgICAgICAgICdzZWxlY3RvckF0dHInOiAnZGF0YS1mYWN0b3J5J1xuICAgICAgICB9KTtcblxuICAgICAgICAkKCcuY29weS10by1jbGlwYm9hcmQnKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBjb3B5VGV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCQodGhpcykuZGF0YSgndGFyZ2V0JykpO1xuICAgICAgICAgICAgY29weVRleHQuc2VsZWN0KCk7XG4gICAgICAgICAgICBjb3B5VGV4dC5zZXRTZWxlY3Rpb25SYW5nZSgwLCA5OTk5OSk7XG4gICAgICAgICAgICBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChjb3B5VGV4dC52YWx1ZSk7XG5cbiAgICAgICAgICAgICQoY29weVRleHQpLnRvb2x0aXAoe1xuICAgICAgICAgICAgICAgIHRpdGxlOiAkKHRoaXMpLmRhdGEoJ2NvcGllZC10ZXh0JylcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgc2hvcC5pbml0Q2F0ZWdvcnlTZWxlY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZ1bmN0aW9uIHVwZGF0ZVF1ZXJ5U3RyaW5nUGFyYW1ldGVyKHVyaSwga2V5LCB2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIHJlID0gbmV3IFJlZ0V4cChcIihbPyZdKVwiICsga2V5ICsgXCI9Lio/KCZ8JClcIiwgXCJpXCIpO1xuICAgICAgICAgICAgdmFyIHNlcGFyYXRvciA9IHVyaS5pbmRleE9mKCc/JykgIT09IC0xID8gXCImXCIgOiBcIj9cIjtcbiAgICAgICAgICAgIGlmICh1cmkubWF0Y2gocmUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVyaS5yZXBsYWNlKHJlLCAnJDEnICsga2V5ICsgXCI9XCIgKyB2YWx1ZSArICckMicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVyaSArIHNlcGFyYXRvciArIGtleSArIFwiPVwiICsgdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgJChcIi5zaXRlLXJlbG9hZFwiKS5jaGFuZ2UoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBsb2NhdGlvbi5ocmVmPSB1cGRhdGVRdWVyeVN0cmluZ1BhcmFtZXRlciggd2luZG93LmxvY2F0aW9uLmhyZWYsIHRoaXMubmFtZSwgdGhpcy52YWx1ZSApO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgc2hvcC5pbml0UXVhbnRpdHlWYWxpZGF0b3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICQuY29yZXNob3BRdWFudGl0eVNlbGVjdG9yKHtcbiAgICAgICAgICAgIGJ1dHRvbmRvd25fY2xhc3M6ICdidG4gYnRuLXNlY29uZGFyeScsXG4gICAgICAgICAgICBidXR0b251cF9jbGFzczogJ2J0biBidG4tc2Vjb25kYXJ5JyxcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHNob3AuaW5pdENhcnRTaGlwbWVudENhbGN1bGF0b3IgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgJChkb2N1bWVudCkub24oJ3N1Ym1pdCcsICdmb3JtW25hbWU9XCJjb3Jlc2hvcF9zaGlwcGluZ19jYWxjdWxhdG9yXCJdJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgdmFyICRmb3JtID0gJCh0aGlzKTtcbiAgICAgICAgICAgICRmb3JtLmFkZENsYXNzKCdsb2FkaW5nJyk7XG4gICAgICAgICAgICAkZm9ybS5maW5kKCdidXR0b25bdHlwZT1cInN1Ym1pdFwiXScpLmF0dHIoJ2Rpc2FibGVkJywgJ2Rpc2FibGVkJyk7XG4gICAgICAgICAgICAkZm9ybS5jbG9zZXN0KCcuY2FydC1zaGlwbWVudC1jYWxjdWxhdGlvbi1ib3gnKS5maW5kKCcuY2FydC1zaGlwbWVudC1hdmFpbGFibGUtY2FycmllcnMnKS5jc3MoJ29wYWNpdHknLCAuMik7XG4gICAgICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgICAgIHVybDogJGZvcm0uYXR0cignYWN0aW9uJyksXG4gICAgICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICAgICAgZGF0YTogJGZvcm0uc2VyaWFsaXplKCksXG4gICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgICAgICAgICAkZm9ybS5yZW1vdmVDbGFzcygnbG9hZGluZycpO1xuICAgICAgICAgICAgICAgICAgICAkZm9ybS5jbG9zZXN0KCcuY2FydC1zaGlwbWVudC1jYWxjdWxhdGlvbi1ib3gnKS5yZXBsYWNlV2l0aCgkKHJlcykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgIH07XG5cbiAgICBzaG9wLmluaXRDaGFuZ2VBZGRyZXNzID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIHZhciAkYWRkcmVzc1N0ZXAgPSAkKCcuY2hlY2tvdXQtc3RlcC5zdGVwLWFkZHJlc3MnKTtcblxuICAgICAgICBpZiAoJGFkZHJlc3NTdGVwLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyICRpbnZvaWNlQWRkcmVzcyA9ICRhZGRyZXNzU3RlcC5maW5kKCdzZWxlY3RbbmFtZT1cImNvcmVzaG9wW2ludm9pY2VBZGRyZXNzXVwiXScpLFxuICAgICAgICAgICAgJGludm9pY2VQYW5lbCA9ICRhZGRyZXNzU3RlcC5maW5kKCcucGFuZWwtaW52b2ljZS1hZGRyZXNzJyksXG4gICAgICAgICAgICAkaW52b2ljZUZpZWxkID0gJGFkZHJlc3NTdGVwLmZpbmQoJy5pbnZvaWNlLWFkZHJlc3Mtc2VsZWN0b3InKSxcbiAgICAgICAgICAgICRzaGlwcGluZ0FkZHJlc3MgPSAkYWRkcmVzc1N0ZXAuZmluZCgnc2VsZWN0W25hbWU9XCJjb3Jlc2hvcFtzaGlwcGluZ0FkZHJlc3NdXCJdJyksXG4gICAgICAgICAgICAkc2hpcHBpbmdQYW5lbCA9ICRhZGRyZXNzU3RlcC5maW5kKCcucGFuZWwtc2hpcHBpbmctYWRkcmVzcycpLFxuICAgICAgICAgICAgJHNoaXBwaW5nRmllbGQgPSAkYWRkcmVzc1N0ZXAuZmluZCgnLnNoaXBwaW5nLWFkZHJlc3Mtc2VsZWN0b3InKSxcbiAgICAgICAgICAgICRzaGlwcGluZ0FkZEFkZHJlc3NCdXR0b24gPSAkc2hpcHBpbmdQYW5lbC5wYXJlbnQoKS5maW5kKCcuY2FyZC1mb290ZXInKSxcbiAgICAgICAgICAgICR1c2VJYXNTID0gJGFkZHJlc3NTdGVwLmZpbmQoJ1tuYW1lPVwiY29yZXNob3BbdXNlSW52b2ljZUFzU2hpcHBpbmddXCJdJyk7XG5cbiAgICAgICAgJGludm9pY2VBZGRyZXNzLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgc2VsZWN0ZWQgPSAkKHRoaXMpLmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpO1xuICAgICAgICAgICAgdmFyIGFkZHJlc3MgPSBzZWxlY3RlZC5kYXRhKCdhZGRyZXNzJyk7XG4gICAgICAgICAgICB2YXIgYWRkcmVzc1R5cGUgPSBzZWxlY3RlZC5kYXRhKCdhZGRyZXNzLXR5cGUnKTtcblxuICAgICAgICAgICAgaWYgKCR1c2VJYXNTKSB7XG4gICAgICAgICAgICAgICAgaWYgKGFkZHJlc3NUeXBlID09PSAnaW52b2ljZScpIHtcbiAgICAgICAgICAgICAgICAgICAgJHVzZUlhc1MucHJvcChcImRpc2FibGVkXCIsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAkdXNlSWFzUy5wcm9wKFwiY2hlY2tlZFwiLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICR1c2VJYXNTLmNoYW5nZSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICR1c2VJYXNTLnByb3AoXCJkaXNhYmxlZFwiLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoYWRkcmVzcykge1xuICAgICAgICAgICAgICAgIGFkZHJlc3MgPSBhZGRyZXNzLmh0bWw7XG4gICAgICAgICAgICAgICAgJGludm9pY2VQYW5lbC5odG1sKGFkZHJlc3MpO1xuICAgICAgICAgICAgICAgIGlmICgkdXNlSWFzUy5pcygnOmNoZWNrZWQnKSkge1xuICAgICAgICAgICAgICAgICAgICAkc2hpcHBpbmdBZGRyZXNzLnZhbCgkKHRoaXMpLnZhbCgpKS50cmlnZ2VyKCdjaGFuZ2UnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICRpbnZvaWNlUGFuZWwuaHRtbCgnJyk7XG4gICAgICAgICAgICAgICAgaWYgKCR1c2VJYXNTLmlzKCc6Y2hlY2tlZCcpKSB7XG4gICAgICAgICAgICAgICAgICAgICRzaGlwcGluZ1BhbmVsLmh0bWwoJycpO1xuICAgICAgICAgICAgICAgICAgICAkc2hpcHBpbmdBZGRyZXNzLnZhbChudWxsKS50cmlnZ2VyKCdjaGFuZ2UnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgICRzaGlwcGluZ0FkZHJlc3Mub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBhZGRyZXNzID0gJCh0aGlzKS5maW5kKCdvcHRpb246c2VsZWN0ZWQnKS5kYXRhKCdhZGRyZXNzJyk7XG5cbiAgICAgICAgICAgIGlmIChhZGRyZXNzKSB7XG4gICAgICAgICAgICAgICAgYWRkcmVzcyA9IGFkZHJlc3MuaHRtbDtcbiAgICAgICAgICAgICAgICAkc2hpcHBpbmdQYW5lbC5odG1sKGFkZHJlc3MpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkc2hpcHBpbmdQYW5lbC5odG1sKCcnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKCR1c2VJYXNTLmlzKCc6bm90KDpjaGVja2VkKScpICYmICRzaGlwcGluZ0FkZEFkZHJlc3NCdXR0b24pIHtcbiAgICAgICAgICAgICRzaGlwcGluZ0FkZEFkZHJlc3NCdXR0b24ucmVtb3ZlQ2xhc3MoJ2Qtbm9uZScpO1xuICAgICAgICB9XG5cbiAgICAgICAgJHVzZUlhc1Mub24oJ2NoYW5nZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICgkKHRoaXMpLmlzKCc6Y2hlY2tlZCcpKSB7XG4gICAgICAgICAgICAgICAgJHNoaXBwaW5nRmllbGQuc2xpZGVVcCgpO1xuICAgICAgICAgICAgICAgIHZhciBhZGRyZXNzID0gJCgnb3B0aW9uOnNlbGVjdGVkJywgJGludm9pY2VBZGRyZXNzKS5kYXRhKCdhZGRyZXNzJyk7XG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gJCgnOnNlbGVjdGVkJywgJGludm9pY2VBZGRyZXNzKS52YWwoKTtcblxuICAgICAgICAgICAgICAgIGlmIChhZGRyZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICRzaGlwcGluZ0FkZHJlc3MudmFsKHZhbHVlKS50cmlnZ2VyKCdjaGFuZ2UnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCRzaGlwcGluZ0FkZEFkZHJlc3NCdXR0b24pIHtcbiAgICAgICAgICAgICAgICAgICAgJHNoaXBwaW5nQWRkQWRkcmVzc0J1dHRvbi5hZGRDbGFzcygnZC1ub25lJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkc2hpcHBpbmdGaWVsZC5zbGlkZURvd24oKTtcbiAgICAgICAgICAgICAgICBpZiAoJHNoaXBwaW5nQWRkQWRkcmVzc0J1dHRvbikge1xuICAgICAgICAgICAgICAgICAgICAkc2hpcHBpbmdBZGRBZGRyZXNzQnV0dG9uLnJlbW92ZUNsYXNzKCdkLW5vbmUnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICgkaW52b2ljZUFkZHJlc3MuZmluZCgnb3B0aW9uOnNlbGVjdGVkJykubGVuZ3RoKSB7XG4gICAgICAgICAgICB2YXIgYWRkcmVzcyA9ICRpbnZvaWNlQWRkcmVzcy5maW5kKCdvcHRpb246c2VsZWN0ZWQnKS5kYXRhKCdhZGRyZXNzJyk7XG4gICAgICAgICAgICB2YXIgYWRkcmVzc1R5cGUgPSAkaW52b2ljZUFkZHJlc3MuZmluZCgnb3B0aW9uOnNlbGVjdGVkJykuZGF0YSgnYWRkcmVzcy10eXBlJyk7XG5cbiAgICAgICAgICAgIGlmICgkdXNlSWFzUykge1xuICAgICAgICAgICAgICAgIGlmIChhZGRyZXNzVHlwZSA9PT0gJ2ludm9pY2UnKSB7XG4gICAgICAgICAgICAgICAgICAgICR1c2VJYXNTLnByb3AoXCJkaXNhYmxlZFwiLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgJHVzZUlhc1MucHJvcChcImNoZWNrZWRcIiwgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAkdXNlSWFzUy5jaGFuZ2UoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAkdXNlSWFzUy5wcm9wKFwiZGlzYWJsZWRcIiwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGFkZHJlc3MpIHtcbiAgICAgICAgICAgICAgICAkaW52b2ljZVBhbmVsLmh0bWwoYWRkcmVzcy5odG1sKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICgkc2hpcHBpbmdBZGRyZXNzLmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpLmxlbmd0aCkge1xuICAgICAgICAgICAgdmFyIGFkZHJlc3MgPSAkc2hpcHBpbmdBZGRyZXNzLmZpbmQoJ29wdGlvbjpzZWxlY3RlZCcpLmRhdGEoJ2FkZHJlc3MnKTtcbiAgICAgICAgICAgIGlmIChhZGRyZXNzKSB7XG4gICAgICAgICAgICAgICAgJHNoaXBwaW5nUGFuZWwuaHRtbChhZGRyZXNzLmh0bWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxufSh3aW5kb3cuc2hvcCA9IHdpbmRvdy5zaG9wIHx8IHt9LCBqUXVlcnkpKTtcblxuIiwiKGZ1bmN0aW9uICh2YXJpYW50LCAkKSB7XG4gICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAkLnZhcmlhbnRSZWFkeSA9IGZhbHNlO1xuXG4gICAgICAgIHZhcmlhbnQuaW5pdCgpO1xuXG4gICAgICAgICQudmFyaWFudFJlYWR5ID0gdHJ1ZTtcbiAgICB9KTtcblxuICAgIHZhcmlhbnQuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25zdCB2YXJpYW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wcm9kdWN0LWluZm9fX2F0dHJpYnV0ZXMnKTtcbiAgICAgICAgaWYoIXZhcmlhbnRzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAkLmNvcmVzaG9wVmFyaWFudFNlbGVjdG9yKHZhcmlhbnRzKTtcblxuICAgICAgICB2YXJpYW50cy5hZGRFdmVudExpc3RlbmVyKCd2YXJpYW50X3NlbGVjdG9yLnNlbGVjdCcsIChlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBvcHRpb25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnByb2R1Y3QtaW5mbyAucHJvZHVjdC1kZXRhaWxzIC5vcHRpb25zJyk7XG5cbiAgICAgICAgICAgIGlmIChvcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3VibWl0cyA9IG9wdGlvbnMucXVlcnlTZWxlY3RvckFsbCgnW3R5cGU9XCJzdWJtaXRcIl0nKTtcblxuICAgICAgICAgICAgICAgIG9wdGlvbnMuY2xhc3NMaXN0LmFkZCgnZGlzYWJsZWQnKTtcblxuICAgICAgICAgICAgICAgIHN1Ym1pdHMuZm9yRWFjaCgoc3VibWl0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHN1Ym1pdC5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG59KHdpbmRvdy52YXJpYW50ID0gd2luZG93LnZhcmlhbnQgfHwge30sIGpRdWVyeSkpOyIsIi8qIFNUWUxFUyAgKi9cbmltcG9ydCAnLi4vc2Nzcy9hcHAuc2Nzcyc7XG4vKiBKUyAqL1xuaW1wb3J0ICdqcXVlcnknO1xuaW1wb3J0ICdib290c3RyYXAnO1xuaW1wb3J0ICdib290c3RyYXAtdG91Y2hzcGluJztcbmltcG9ydCAnb3dsLmNhcm91c2VsJztcbmltcG9ydCAnb3dsLmNhcm91c2VsMi50aHVtYnMnO1xuaW1wb3J0ICcuL3NjcmlwdHMvaGFuZGxlLXByb3RvdHlwZXMuanMnO1xuaW1wb3J0ICcuL3BsdWdpbi9jb3Jlc2hvcC5wbHVnaW4ucXVhbnRpdHkuanMnO1xuaW1wb3J0ICcuL3BsdWdpbi9jb3Jlc2hvcC5wbHVnaW4udmFyaWFudC5qcyc7XG5pbXBvcnQgJy4vc2NyaXB0cy9jdXN0b20uanMnO1xuaW1wb3J0ICcuL3NjcmlwdHMvc2hvcC5qcyc7XG5pbXBvcnQgJy4vc2NyaXB0cy92YXJpYW50LmpzJztcbmltcG9ydCAnLi9zY3JpcHRzL21hcC5qcyc7XG4iLCIvLyBleHRyYWN0ZWQgYnkgbWluaS1jc3MtZXh0cmFjdC1wbHVnaW5cbmV4cG9ydCB7fTsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuLy8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbl9fd2VicGFja19yZXF1aXJlX18ubSA9IF9fd2VicGFja19tb2R1bGVzX187XG5cbiIsInZhciBkZWZlcnJlZCA9IFtdO1xuX193ZWJwYWNrX3JlcXVpcmVfXy5PID0gKHJlc3VsdCwgY2h1bmtJZHMsIGZuLCBwcmlvcml0eSkgPT4ge1xuXHRpZihjaHVua0lkcykge1xuXHRcdHByaW9yaXR5ID0gcHJpb3JpdHkgfHwgMDtcblx0XHRmb3IodmFyIGkgPSBkZWZlcnJlZC5sZW5ndGg7IGkgPiAwICYmIGRlZmVycmVkW2kgLSAxXVsyXSA+IHByaW9yaXR5OyBpLS0pIGRlZmVycmVkW2ldID0gZGVmZXJyZWRbaSAtIDFdO1xuXHRcdGRlZmVycmVkW2ldID0gW2NodW5rSWRzLCBmbiwgcHJpb3JpdHldO1xuXHRcdHJldHVybjtcblx0fVxuXHR2YXIgbm90RnVsZmlsbGVkID0gSW5maW5pdHk7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgZGVmZXJyZWQubGVuZ3RoOyBpKyspIHtcblx0XHR2YXIgY2h1bmtJZHMgPSBkZWZlcnJlZFtpXVswXTtcblx0XHR2YXIgZm4gPSBkZWZlcnJlZFtpXVsxXTtcblx0XHR2YXIgcHJpb3JpdHkgPSBkZWZlcnJlZFtpXVsyXTtcblx0XHR2YXIgZnVsZmlsbGVkID0gdHJ1ZTtcblx0XHRmb3IgKHZhciBqID0gMDsgaiA8IGNodW5rSWRzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRpZiAoKHByaW9yaXR5ICYgMSA9PT0gMCB8fCBub3RGdWxmaWxsZWQgPj0gcHJpb3JpdHkpICYmIE9iamVjdC5rZXlzKF9fd2VicGFja19yZXF1aXJlX18uTykuZXZlcnkoKGtleSkgPT4gKF9fd2VicGFja19yZXF1aXJlX18uT1trZXldKGNodW5rSWRzW2pdKSkpKSB7XG5cdFx0XHRcdGNodW5rSWRzLnNwbGljZShqLS0sIDEpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZnVsZmlsbGVkID0gZmFsc2U7XG5cdFx0XHRcdGlmKHByaW9yaXR5IDwgbm90RnVsZmlsbGVkKSBub3RGdWxmaWxsZWQgPSBwcmlvcml0eTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYoZnVsZmlsbGVkKSB7XG5cdFx0XHRkZWZlcnJlZC5zcGxpY2UoaS0tLCAxKVxuXHRcdFx0dmFyIHIgPSBmbigpO1xuXHRcdFx0aWYgKHIgIT09IHVuZGVmaW5lZCkgcmVzdWx0ID0gcjtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHJlc3VsdDtcbn07IiwiLy8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbl9fd2VicGFja19yZXF1aXJlX18ubiA9IChtb2R1bGUpID0+IHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0KCkgPT4gKG1vZHVsZVsnZGVmYXVsdCddKSA6XG5cdFx0KCkgPT4gKG1vZHVsZSk7XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLmcgPSAoZnVuY3Rpb24oKSB7XG5cdGlmICh0eXBlb2YgZ2xvYmFsVGhpcyA9PT0gJ29iamVjdCcpIHJldHVybiBnbG9iYWxUaGlzO1xuXHR0cnkge1xuXHRcdHJldHVybiB0aGlzIHx8IG5ldyBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuXHR9IGNhdGNoIChlKSB7XG5cdFx0aWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnKSByZXR1cm4gd2luZG93O1xuXHR9XG59KSgpOyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCIvLyBubyBiYXNlVVJJXG5cbi8vIG9iamVjdCB0byBzdG9yZSBsb2FkZWQgYW5kIGxvYWRpbmcgY2h1bmtzXG4vLyB1bmRlZmluZWQgPSBjaHVuayBub3QgbG9hZGVkLCBudWxsID0gY2h1bmsgcHJlbG9hZGVkL3ByZWZldGNoZWRcbi8vIFtyZXNvbHZlLCByZWplY3QsIFByb21pc2VdID0gY2h1bmsgbG9hZGluZywgMCA9IGNodW5rIGxvYWRlZFxudmFyIGluc3RhbGxlZENodW5rcyA9IHtcblx0XCJhcHBcIjogMFxufTtcblxuLy8gbm8gY2h1bmsgb24gZGVtYW5kIGxvYWRpbmdcblxuLy8gbm8gcHJlZmV0Y2hpbmdcblxuLy8gbm8gcHJlbG9hZGVkXG5cbi8vIG5vIEhNUlxuXG4vLyBubyBITVIgbWFuaWZlc3RcblxuX193ZWJwYWNrX3JlcXVpcmVfXy5PLmogPSAoY2h1bmtJZCkgPT4gKGluc3RhbGxlZENodW5rc1tjaHVua0lkXSA9PT0gMCk7XG5cbi8vIGluc3RhbGwgYSBKU09OUCBjYWxsYmFjayBmb3IgY2h1bmsgbG9hZGluZ1xudmFyIHdlYnBhY2tKc29ucENhbGxiYWNrID0gKHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uLCBkYXRhKSA9PiB7XG5cdHZhciBjaHVua0lkcyA9IGRhdGFbMF07XG5cdHZhciBtb3JlTW9kdWxlcyA9IGRhdGFbMV07XG5cdHZhciBydW50aW1lID0gZGF0YVsyXTtcblx0Ly8gYWRkIFwibW9yZU1vZHVsZXNcIiB0byB0aGUgbW9kdWxlcyBvYmplY3QsXG5cdC8vIHRoZW4gZmxhZyBhbGwgXCJjaHVua0lkc1wiIGFzIGxvYWRlZCBhbmQgZmlyZSBjYWxsYmFja1xuXHR2YXIgbW9kdWxlSWQsIGNodW5rSWQsIGkgPSAwO1xuXHRpZihjaHVua0lkcy5zb21lKChpZCkgPT4gKGluc3RhbGxlZENodW5rc1tpZF0gIT09IDApKSkge1xuXHRcdGZvcihtb2R1bGVJZCBpbiBtb3JlTW9kdWxlcykge1xuXHRcdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKG1vcmVNb2R1bGVzLCBtb2R1bGVJZCkpIHtcblx0XHRcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tW21vZHVsZUlkXSA9IG1vcmVNb2R1bGVzW21vZHVsZUlkXTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYocnVudGltZSkgdmFyIHJlc3VsdCA9IHJ1bnRpbWUoX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cdH1cblx0aWYocGFyZW50Q2h1bmtMb2FkaW5nRnVuY3Rpb24pIHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uKGRhdGEpO1xuXHRmb3IoO2kgPCBjaHVua0lkcy5sZW5ndGg7IGkrKykge1xuXHRcdGNodW5rSWQgPSBjaHVua0lkc1tpXTtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oaW5zdGFsbGVkQ2h1bmtzLCBjaHVua0lkKSAmJiBpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF0pIHtcblx0XHRcdGluc3RhbGxlZENodW5rc1tjaHVua0lkXVswXSgpO1xuXHRcdH1cblx0XHRpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF0gPSAwO1xuXHR9XG5cdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fLk8ocmVzdWx0KTtcbn1cblxudmFyIGNodW5rTG9hZGluZ0dsb2JhbCA9IHNlbGZbXCJ3ZWJwYWNrQ2h1bmtcIl0gPSBzZWxmW1wid2VicGFja0NodW5rXCJdIHx8IFtdO1xuY2h1bmtMb2FkaW5nR2xvYmFsLmZvckVhY2god2VicGFja0pzb25wQ2FsbGJhY2suYmluZChudWxsLCAwKSk7XG5jaHVua0xvYWRpbmdHbG9iYWwucHVzaCA9IHdlYnBhY2tKc29ucENhbGxiYWNrLmJpbmQobnVsbCwgY2h1bmtMb2FkaW5nR2xvYmFsLnB1c2guYmluZChjaHVua0xvYWRpbmdHbG9iYWwpKTsiLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGRlcGVuZHMgb24gb3RoZXIgbG9hZGVkIGNodW5rcyBhbmQgZXhlY3V0aW9uIG5lZWQgdG8gYmUgZGVsYXllZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fLk8odW5kZWZpbmVkLCBbXCJ2ZW5kb3JzLW5vZGVfbW9kdWxlc19ib290c3RyYXAtdG91Y2hzcGluX2Rpc3RfanF1ZXJ5X2Jvb3RzdHJhcC10b3VjaHNwaW5fanMtbm9kZV9tb2R1bGVzX2Jvb3QtZDg5YmUyXCJdLCAoKSA9PiAoX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vanMvYXBwLnRzXCIpKSlcbl9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fLk8oX193ZWJwYWNrX2V4cG9ydHNfXyk7XG4iLCIiXSwibmFtZXMiOlsiJCIsImNvcmVzaG9wUXVhbnRpdHlTZWxlY3RvciIsIm9wdGlvbnMiLCJpbml0UXVhbnRpdHlGaWVsZHMiLCIkZmllbGRzIiwiJHByZWNpc2lvblByZXNldFNlbGVjdG9yIiwidG91Y2hTcGluT3B0aW9ucyIsImV4dGVuZCIsIm9uIiwiZGF0YSIsIiRzZWxlY3RlZE9wdGlvbiIsImZpbmQiLCJxdWFudGl0eUlkZW50aWZpZXIiLCIkcXVhbnRpdHlJbnB1dCIsInByZWNpc2lvbiIsInN0clByZWNpc2lvbiIsIkFycmF5Iiwiam9pbiIsImxlbmd0aCIsImF0dHIiLCJ0cmlnZ2VyIiwibWluIiwibWF4IiwiZGVjaW1hbHMiLCJzdGVwIiwiZWFjaCIsIiRlbCIsImlzTmFOIiwicGFyc2VJbnQiLCJUb3VjaFNwaW4iLCJ2ZXJ0aWNhbGJ1dHRvbnMiLCJjYWxsYmFja19iZWZvcmVfY2FsY3VsYXRpb24iLCJ2IiwicmVwbGFjZSIsImNhbGxiYWNrX2FmdGVyX2NhbGN1bGF0aW9uIiwialF1ZXJ5IiwiY29yZXNob3BWYXJpYW50U2VsZWN0b3IiLCJhdHRyaWJ1dGVDb250YWluZXIiLCJfYXR0cmlidXRlQ29udGFpbmVyIiwidW5kZWZpbmVkIiwiX2NvbmZpZyIsIl9hdHRyaWJ1dGVHcm91cHMiLCJfY2xlYXJHcm91cCIsImdyb3VwIiwic2VsZWN0ZWQiLCJlbGVtZW50cyIsImZvckVhY2giLCJlbGVtZW50IiwiZGlzYWJsZWQiLCJjaGVja2VkIiwidGFnTmFtZSIsInRvTG93ZXJDYXNlIiwicXVlcnlTZWxlY3RvckFsbCIsIm9wdGlvbiIsInJlbW92ZUNoaWxkIiwiX2NsZWFyR3JvdXBzIiwibmV4dEdyb3VwIiwiX2ZpbHRlckF0dHJpYnV0ZXMiLCJhdHRyaWJ1dGVzIiwiZmlsdGVyQXR0cmlidXRlcyIsInByZXZHcm91cCIsInB1c2giLCJpZCIsImZpbHRlcmVkIiwiYXR0cmlidXRlIiwicHJvZHVjdHMiLCJwcm9kdWN0IiwiZXZlcnkiLCJ4IiwiaW5kZXgiLCJoYXNPd25Qcm9wZXJ0eSIsImluY2x1ZGVzIiwiX2NvbmZpZ3VyZUdyb3VwIiwic2xpY2UiLCJPcHRpb24iLCJuYW1lIiwiYWRkIiwiZGF0YXNldCIsInZhbHVlIiwiX3NldHVwQXR0cmlidXRlR3JvdXBTZXR0aW5ncyIsIl9zZXR1cENoYW5nZUV2ZW50cyIsIm9uY2hhbmdlIiwiZSIsIl9jb25maWd1cmVFbGVtZW50IiwiX2luaXQiLCJKU09OIiwicGFyc2UiLCJjb25maWciLCJfcmVkaXJlY3RUb1ZhcmlhbnQiLCJncm91cHMiLCJmaWx0ZXIiLCJnIiwiT2JqZWN0IiwiZnJvbUVudHJpZXMiLCJtYXAiLCJ2YWx1ZXMiLCJwIiwic3RyaW5naWZ5Iiwid2luZG93IiwibG9jYXRpb24iLCJocmVmIiwiX2NyZWF0ZUV2ZW50IiwiYXJndW1lbnRzIiwiQ3VzdG9tRXZlbnQiLCJidWJibGVzIiwiY2FuY2VsYWJsZSIsInZhcmlhbnRSZWFkeSIsImRpc3BhdGNoRXZlbnQiLCJvd2xDYXJvdXNlbCIsIml0ZW1zIiwidGh1bWJzIiwidGh1bWJzUHJlcmVuZGVyZWQiLCJtZXRob2RzIiwiaW5pdCIsInNldHRpbmdzIiwic2hvdyIsImNoYW5nZSIsInNlbGVjdGVkVmFsdWUiLCJ2YWwiLCJwcm90b3R5cGVQcmVmaXgiLCJzZWxlY3RvckF0dHIiLCJwcm90b3R5cGVFbGVtZW50IiwiY29udGFpbmVyIiwiY29udGFpbmVyU2VsZWN0b3IiLCJlbXB0eSIsImh0bWwiLCJ0cmltIiwiZm4iLCJoYW5kbGVQcm90b3R5cGVzIiwibWV0aG9kIiwiYXBwbHkiLCJwcm90b3R5cGUiLCJjYWxsIiwiZXJyb3IiLCJoZWlnaHQiLCJpbml0aWFsaXplIiwibWFwT3B0aW9ucyIsInpvb20iLCJjZW50ZXIiLCJnb29nbGUiLCJtYXBzIiwiTGF0TG5nIiwiZGlzYWJsZURlZmF1bHRVSSIsIk1hcCIsImRvY3VtZW50IiwiZ2V0RWxlbWVudEJ5SWQiLCJldmVudCIsImFkZERvbUxpc3RlbmVyIiwicmVhZHkiLCJzaG9wIiwiaW5pdENoYW5nZUFkZHJlc3MiLCJpbml0Q2FydFNoaXBtZW50Q2FsY3VsYXRvciIsImluaXRRdWFudGl0eVZhbGlkYXRvciIsImluaXRDYXRlZ29yeVNlbGVjdCIsImNsaWNrIiwiY29weVRleHQiLCJzZWxlY3QiLCJzZXRTZWxlY3Rpb25SYW5nZSIsIm5hdmlnYXRvciIsImNsaXBib2FyZCIsIndyaXRlVGV4dCIsInRvb2x0aXAiLCJ0aXRsZSIsInVwZGF0ZVF1ZXJ5U3RyaW5nUGFyYW1ldGVyIiwidXJpIiwia2V5IiwicmUiLCJSZWdFeHAiLCJzZXBhcmF0b3IiLCJpbmRleE9mIiwibWF0Y2giLCJidXR0b25kb3duX2NsYXNzIiwiYnV0dG9udXBfY2xhc3MiLCJldiIsInByZXZlbnREZWZhdWx0IiwiJGZvcm0iLCJhZGRDbGFzcyIsImNsb3Nlc3QiLCJjc3MiLCJhamF4IiwidXJsIiwic2VyaWFsaXplIiwic3VjY2VzcyIsInJlcyIsInJlbW92ZUNsYXNzIiwicmVwbGFjZVdpdGgiLCIkYWRkcmVzc1N0ZXAiLCIkaW52b2ljZUFkZHJlc3MiLCIkaW52b2ljZVBhbmVsIiwiJGludm9pY2VGaWVsZCIsIiRzaGlwcGluZ0FkZHJlc3MiLCIkc2hpcHBpbmdQYW5lbCIsIiRzaGlwcGluZ0ZpZWxkIiwiJHNoaXBwaW5nQWRkQWRkcmVzc0J1dHRvbiIsInBhcmVudCIsIiR1c2VJYXNTIiwiYWRkcmVzcyIsImFkZHJlc3NUeXBlIiwicHJvcCIsImlzIiwic2xpZGVVcCIsInNsaWRlRG93biIsInZhcmlhbnQiLCJ2YXJpYW50cyIsInF1ZXJ5U2VsZWN0b3IiLCJhZGRFdmVudExpc3RlbmVyIiwic3VibWl0cyIsImNsYXNzTGlzdCIsInN1Ym1pdCJdLCJzb3VyY2VSb290IjoiIn0=