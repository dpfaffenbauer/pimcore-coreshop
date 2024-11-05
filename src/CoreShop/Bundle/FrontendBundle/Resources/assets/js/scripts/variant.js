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

        variants.addEventListener('variant_selector.select', (e) => {
            const options = document.querySelector('.product-info .product-details .options');

            if (options) {
                const submits = options.querySelectorAll('[type="submit"]');

                options.classList.add('disabled');

                submits.forEach((submit) => {
                    submit.disabled = true;
                });
            }
        });
    };
}(window.variant || (window.variant = {}))); // Extracted assignment
