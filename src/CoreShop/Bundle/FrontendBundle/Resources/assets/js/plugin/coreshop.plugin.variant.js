(function () {
    const coreshopVariantSelector = function (attributeContainer) {
        let _attributeContainer = null;
        let _config = {};
        let _attributeGroups = [];

        const _clearGroupElements = function (element) {
            element.disabled = true;
            element.checked = false;

            // Remove options on select
            if (element.tagName.toLowerCase() === 'select') {
                const options = element.querySelectorAll('option:not([value=""])');
                options.forEach((option) => element.removeChild(option));
            }
        };

        const _clearGroup = function (group) {
            delete group.selected;
            group.elements.forEach(_clearGroupElements);
        };

        const _clearGroups = function (group) {
            while (group) {
                _clearGroup(group);
                group = group.nextGroup;
            }
        };

        const _filterAttributes = function (attributes, group) {
            const filterAttributes = [];
            let currentGroup = group.prevGroup;

            while (currentGroup) {
                if (currentGroup.selected && currentGroup.nextGroup) {
                    filterAttributes.push({ group: currentGroup.group.id, selected: currentGroup.selected });
                }
                currentGroup = currentGroup.prevGroup;
            }

            return attributes.filter((attribute) =>
                attribute.products.some((product) =>
                    filterAttributes.every((filter) =>
                        _config.index[product.id].attributes?.[filter.group] === filter.selected
                    )
                )
            );
        };

        const _addOptionToSelect = function (element, attribute, group) {
            const option = new Option(attribute.attribute.name, attribute.attribute.id);
            option.id = 'attribute-' + attribute.attribute.id;
            if (group.selected === attribute.attribute.id) {
                option.selected = true;
            }
            element.add(option);
            element.disabled = false;
        };

        const _enableElementForAttribute = function (element, attribute, group) {
            if (parseInt(element.dataset.group) === group.group.id && parseInt(element.value) === attribute.attribute.id) {
                element.disabled = false;
                if (group.selected === attribute.attribute.id) {
                    element.checked = true;
                }
            }
        };

        const _configureGroupElements = function (group, attributes) {
            group.elements.forEach((element) => {
                if (element.tagName.toLowerCase() === 'select') {
                    attributes.forEach((attribute) => _addOptionToSelect(element, attribute, group));
                } else {
                    attributes.forEach((attribute) => _enableElementForAttribute(element, attribute, group));
                }
            });
        };

        const _configureGroup = function (group) {
            const filteredAttributes = _filterAttributes(group.attributes.slice(), group) || group.attributes;
            _configureGroupElements(group, filteredAttributes);
        };

        const _setupAttributeGroupSettings = function () {
            _attributeGroups.forEach((group, index) => {
                group.prevGroup = _attributeGroups[index - 1] || null;
                group.nextGroup = _attributeGroups[index + 1] || null;

                if (!index || group.selected) {
                    _configureGroup(group);
                } else {
                    _clearGroup(group);
                }
            });
        };

        const _setupChangeEvents = function () {
            _attributeGroups.forEach((group) => {
                group.elements.forEach((element) => {
                    element.onchange = () => _configureElement(group, element);
                });
            });
        };

        const _redirectToVariant = function () {
            const selectedAttributes = Object.fromEntries(
                _attributeGroups.filter((g) => g.selected).map((g) => [g.group.id, g.selected])
            );

            const matchingProduct = Object.values(_config.index).find((p) =>
                JSON.stringify(p.attributes) === JSON.stringify(selectedAttributes)
            );

            if (matchingProduct?.url) {
                window.location.href = matchingProduct.url;
            }
        };

        const _createEvent = function (name, data = {}) {
            return new CustomEvent('variant_selector.' + name, {
                bubbles: true,
                cancelable: false,
                detail: data,
            });
        };

        const _configureElement = function (group, element) {
            window.variantReady = false;
            _attributeContainer.dispatchEvent(_createEvent('change', { element }));

            if (element.value) {
                group.selected = parseInt(element.value);
                _attributeContainer.dispatchEvent(_createEvent('select', { element }));

                if (group.nextGroup) {
                    _clearGroups(group.nextGroup);
                    _configureGroup(group.nextGroup);
                } else {
                    _attributeContainer.dispatchEvent(_createEvent('redirect', { element }));
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

        const _init = function () {
            if (!attributeContainer) return;

            _attributeContainer = attributeContainer;
            _config = JSON.parse(_attributeContainer.dataset.config);
            _config.attributes.forEach((group) => {
                group.elements = _attributeContainer.querySelectorAll(`[data-group="${group.group.id}"]`);
                _attributeGroups.push(group);
            });

            _setupAttributeGroupSettings();
            _setupChangeEvents();
        };

        _init();
    };

    window.coreshopVariantSelector = coreshopVariantSelector;
})();
