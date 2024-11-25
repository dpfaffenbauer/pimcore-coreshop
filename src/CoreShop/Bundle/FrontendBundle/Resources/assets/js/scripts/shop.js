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

        document.querySelectorAll(`[data-${settings.prototypePrefix}]`).forEach(function (element) {
            showElement(element, false);
            element.addEventListener('change', function () {
                showElement(element, true);
            });
        });

        function showElement(element, replace) {
            const selectedValue = getSelectedValue(element);
            const prototypePrefix = settings.prototypePrefix || element.id;
            const prototypeElement = document.getElementById(`${prototypePrefix}_${selectedValue}`);
            const container = getContainer(prototypeElement);

            if (container && (replace || !container.innerHTML.trim())) {
                container.innerHTML = prototypeElement ? prototypeElement.dataset.prototype : '';
            }
        }

        function getSelectedValue(element) {
            if (settings.selectorAttr) {
                return element.querySelector(`[value="${element.value}"]`).getAttribute(settings.selectorAttr);
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
            button.addEventListener('click', function() {
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
            select.addEventListener('change', function() {
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
            buttonup_class: 'btn btn-secondary',
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
        })
        .then(response => response.text())
        .then(res => updateShipmentCalculation(form, res))
        .catch(error => handleShipmentError(form, error));
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

        if (invoiceAddress) {
            updateAddress(invoiceAddress, useIasS);
        }

        if (shippingAddress) {
            updateShippingAddress(shippingAddress)
        }

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

}(shop));

document.addEventListener('DOMContentLoaded', function () {
    shop.init();
});
