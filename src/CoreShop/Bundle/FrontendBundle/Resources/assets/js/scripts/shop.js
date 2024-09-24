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

        $('.copy-to-clipboard').click(function() {
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
            }
            else {
                return uri + separator + key + "=" + value;
            }
        }
        $(".site-reload").change(function() {
            location.href= updateQueryStringParameter( window.location.href, this.name, this.value );
        });
    };

    shop.initQuantityValidator = function () {
        $.coreshopQuantitySelector({
            buttondown_class: 'btn btn-secondary',
            buttonup_class: 'btn btn-secondary',
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

}(window.shop = window.shop || {}, jQuery));

