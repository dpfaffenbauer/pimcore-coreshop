;(function ($) {
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
                strPrecision = '0.' + (Array(precision).join('0')) + '1';

            if ($quantityInput.length === 0) {
                return;
            }

            $quantityInput.attr('step',  precision === 0 ? 1 : strPrecision);
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
                strPrecision = '0.' + (Array(precision).join('0')) + '1';

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
                step: precision === 0 ? 1 : strPrecision,
            }, touchSpinOptions));
        });
    }
})(jQuery);