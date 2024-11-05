(function () {
    function coreshopQuantitySelector(options) {
        initQuantityFields(options);
    }

    function initQuantityFields(options) {
        const fields = document.querySelectorAll('input.cs-unit-input');
        const precisionPresetSelector = document.querySelector('select.cs-unit-selector');

        if(precisionPresetSelector) {
            // Listen to unit definition selector
            precisionPresetSelector.addEventListener('change', function () {
                if (!this.dataset.csUnitIdentifier) {
                    return;
                }
                const quantityIdentifier = this.dataset.csUnitIdentifier;
                const quantityInput = document.querySelector(`input[data-cs-unit-identifier="${quantityIdentifier}"]`);

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

        if(fields) {
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
