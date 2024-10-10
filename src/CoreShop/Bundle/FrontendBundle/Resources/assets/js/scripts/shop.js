document.addEventListener('DOMContentLoaded', function () {
    shop.init();
});

function handlePrototypes(options) {
    const settings = {
        prototypePrefix: options.prototypePrefix || false,
        containerSelector: options.containerSelector || false,
        selectorAttr: options.selectorAttr || false
    };

    document.querySelectorAll(`[data-${settings.prototypePrefix}]`).forEach(function (element) {
        show(element, false);
        element.addEventListener('change', function () {
            show(element, true);
        });
    });

    function show(element, replace) {
        let selectedValue = element.value;
        let prototypePrefix = element.id;

        if (settings.selectorAttr) {
            selectedValue = element.querySelector(`[value="${element.value}"]`).getAttribute(settings.selectorAttr);
        }

        if (settings.prototypePrefix) {
            prototypePrefix = settings.prototypePrefix;
        }

        const prototypeElement = document.getElementById(`${prototypePrefix}_${selectedValue}`);
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
            button.addEventListener('click', function() {
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
            select.addEventListener('change', function() {
                location.href = updateQueryStringParameter(window.location.href, this.name, this.value);
            });
        });
    };

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
                ev.preventDefault();
                form.classList.add('loading');
                form.querySelector('button[type="submit"]').setAttribute('disabled', 'disabled');
                form.closest('.cart-shipment-calculation-box').querySelector('.cart-shipment-available-carriers').style.opacity = 0.2;

                fetch(form.action, {
                    method: 'POST',
                    body: new URLSearchParams(new FormData(form)) // Serialize form data
                })
                .then(response => response.text())
                .then(res => {
                    form.classList.remove('loading');
                    form.closest('.cart-shipment-calculation-box').outerHTML = res; // Replace the entire container
                })
                .catch(error => {
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
            const addressDecode = JSON.parse(selected.dataset.address);
            const address = addressDecode.html;
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
            const selected = this.options[this.selectedIndex];
            const addressDecode = JSON.parse(selected.dataset.address);
            const address = addressDecode.html;
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
            const selected = invoiceAddress.querySelector('option:checked');
            const addressDecode = JSON.parse(selected.dataset.address);
            const address = addressDecode.html;

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
            const selected = shippingAddress.querySelector('option:checked');
            const addressDecode = JSON.parse(selected.dataset.address);
            const address = addressDecode.html;
            if (address) {
                shippingPanel.innerHTML = address;
            }
        }
    };

}(window.shop = window.shop || {}));
