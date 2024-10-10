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

}());
