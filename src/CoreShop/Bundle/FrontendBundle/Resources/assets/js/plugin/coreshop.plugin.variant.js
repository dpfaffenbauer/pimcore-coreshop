(function () {
    const coreshopVariantSelector = function (attributeContainer) {
        let _attributeContainer = undefined;
        let _config = {};
        let _attributeGroups = [];

        const _clearGroup = function (group) {
            delete group.selected;
            group.elements.forEach((element) => {
                element.disabled = true;
                element.checked = false;

                // remove options on select
                if (element.tagName.toLowerCase() === 'select') {
                    const options = element.querySelectorAll('option:not([value=""])');
                    options.forEach((option) => {
                        element.removeChild(option);
                    });
                }
            });
        };

        const _clearGroups = function (group) {
            do {
                _clearGroup(group);
                group = group.nextGroup;
            } while (group);
        };

        const _filterAttributes = function (attributes, group) {
            let filterAttributes = [];

            group = group.prevGroup;
            while (group) {
                if (group.selected && group.nextGroup) {
                    filterAttributes.push({ group: group.group.id, selected: group.selected });
                }
                group = group.prevGroup;
            }

            let filtered = [];
            attributes.forEach((attribute) => {
                attribute.products.forEach((product) => {
                    if (filterAttributes.every((x) => {
                        return _config.index[product.id]['attributes'].hasOwnProperty(x.group) && _config.index[product.id]['attributes'][x.group] === x.selected;
                    }) && !filtered.includes(attribute)) {
                        filtered.push(attribute);
                    }
                });
            });

            return filtered.length ? filtered : attributes;
        };

        const _configureGroup = function (group) {
            let attributes = group.attributes.slice();
            attributes = _filterAttributes(attributes, group);

            if (attributes) {
                group.elements.forEach((element) => {
                    attributes.forEach((attribute) => {
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

        const _setupAttributeGroupSettings = function () {
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

        const _setupChangeEvents = function () {
            _attributeGroups.forEach((group) => {
                group.elements.forEach((element) => {
                    element.onchange = (e) => {
                        _configureElement(group, element);
                    };
                });
            });
        };

        const _init = function (attributeContainer) {
            if (!attributeContainer) {
                return;
            }

            _attributeContainer = attributeContainer;
            _config = JSON.parse(_attributeContainer.dataset.config);
            _config.attributes.forEach((group) => {
                group.elements = _attributeContainer.querySelectorAll('[data-group="' + group.group.id + '"]');
                _attributeGroups.push(group);
            });

            _setupAttributeGroupSettings();
            _setupChangeEvents();
        };

        const _redirectToVariant = function () {
            const groups = _attributeGroups.filter((g) => g.selected);

            const selected = Object.fromEntries(
                groups.map((g) => {
                    return [g.group.id, g.selected];
                })
            );

            const filtered = Object.values(_config.index).filter((p) => {
                return JSON.stringify(p.attributes) === JSON.stringify(selected);
            });

            // length should always be 1, but let's check it
            if (filtered.length === 1 && filtered[0]['url']) {
                window.location.href = filtered[0]['url'];
            }
        };

        const _createEvent = function (name, data = {}) {
            return new CustomEvent('variant_selector.' + name, {
                bubbles: true,
                cancelable: false,
                detail: data
            });
        };

        const _configureElement = function (group, element) {
            window.variantReady = false;
            _attributeContainer.dispatchEvent(
                _createEvent('change', { element: element })
            );

            if (element.value) {
                group.selected = parseInt(element.value);
                if (group.nextGroup) {
                    _attributeContainer.dispatchEvent(
                        _createEvent('select', { element: element })
                    );
                    _clearGroups(group.nextGroup);
                    _configureGroup(group.nextGroup);
                } else {
                    _attributeContainer.dispatchEvent(
                        _createEvent('redirect', { element: element })
                    );
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

        _init(attributeContainer);
    };

    window.coreshopVariantSelector = coreshopVariantSelector;
})();
