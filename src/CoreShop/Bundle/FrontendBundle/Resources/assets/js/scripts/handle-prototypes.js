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

            const prototypeElement = document.getElementById(`${prototypePrefix}_${selectedValue}`);
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

}());
