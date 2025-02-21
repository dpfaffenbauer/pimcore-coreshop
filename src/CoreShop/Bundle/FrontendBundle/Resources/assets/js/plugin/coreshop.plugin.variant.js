(function () {
    const coreshopVariantSelector = function (attributeContainer) {
        let _attributeContainer = null;
        let _config = {};
        let _attributeGroups = [];

        const _init = function () {
            if (!attributeContainer) return;

            _attributeContainer = attributeContainer;
            _config = JSON.parse(_attributeContainer.dataset.config);
            _initializeAttributeGroups();
            _setupAttributeGroupSettings();
            _setupChangeEvents();
        };

        const _initializeAttributeGroups = function () {
            _config.attributes.forEach((group) => {
                group.elements = _attributeContainer.querySelectorAll(`[data-group="${group.group.id}"]`);
                _attributeGroups.push(group);
            });
        };

        const _setupAttributeGroupSettings = function () {
            _attributeGroups.forEach((group, index) => {
                group.prevGroup = _attributeGroups[index - 1] || null;
                group.nextGroup = _attributeGroups[index + 1] || null;
                group.selected ? _configureGroup(group) : _clearGroup(group);
            });
        };

        const _setupChangeEvents = function () {
            _attributeGroups.forEach((group) => _attachChangeEvent(group));
        };

        const _assignOnChangeEvent = function (element, group) {
            element.onchange = () => _handleElementChange(group, element);
        };

        const _attachChangeEvent = function (group) {
            group.elements.forEach((element) => _assignOnChangeEvent(element, group));
        };

        const _handleElementChange = function (group, element) {
            window.variantReady = false;
            _attributeContainer.dispatchEvent(_createEvent('change', { element }));

            if (element.value) {
                _selectGroupElement(group, element);
            } else {
                _deselectGroupElement(group);
            }

            window.variantReady = true;
        };

        const _selectGroupElement = function (group, element) {
            group.selected = parseInt(element.value);
            _attributeContainer.dispatchEvent(_createEvent('select', { element }));

            if (group.nextGroup) {
                _clearGroups(group.nextGroup);
                _configureGroup(group.nextGroup);
            } else {
                _attributeContainer.dispatchEvent(_createEvent('redirect', { element }));
                _redirectToVariant();
            }
        };

        const _deselectGroupElement = function (group) {
            delete group.selected;
            if (group.nextGroup) _clearGroups(group.nextGroup);
        };

        const _redirectToVariant = function () {
            const selectedAttributes = _getSelectedAttributes();
            const matchingProduct = _findMatchingProduct(selectedAttributes);

            if (matchingProduct?.url) {
                window.location.href = matchingProduct.url;
            }
        };

        const _getSelectedAttributes = function () {
            return Object.fromEntries(
                _attributeGroups.filter((g) => g.selected).map((g) => [g.group.id, g.selected])
            );
        };

        const _findMatchingProduct = function (selectedAttributes) {
            return Object.values(_config.index).find((p) =>
                JSON.stringify(p.attributes) === JSON.stringify(selectedAttributes)
            );
        };

        const _createEvent = function (name, data = {}) {
            return new CustomEvent('variant_selector.' + name, {
                bubbles: true,
                cancelable: false,
                detail: data,
            });
        };

        const _clearGroupElements = function (element) {
            element.disabled = true;
            element.checked = false;

            if (element.tagName.toLowerCase() === 'select') _clearSelectOptions(element);
        };

        const _clearSelectOptions = function (element) {
            const options = element.querySelectorAll('option:not([value=""])');
            options.forEach((option) => element.removeChild(option));
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

        const _isProductMatchingFilters = function (product, filterAttributes) {
            return filterAttributes.every((filter) => _config.index[product.id].attributes?.[filter.group] === filter.selected);
        };

        const _isAttributeRelevant = function (attribute, filterAttributes) {
            return attribute.products.some((product) => _isProductMatchingFilters(product, filterAttributes));
        };

        const _filterAttributes = function (attributes, group) {
            const filterAttributes = _getFilterAttributes(group);
            return attributes.filter((attribute) => _isAttributeRelevant(attribute, filterAttributes));
        };

        const _getFilterAttributes = function (group) {
            const filterAttributes = [];
            let currentGroup = group.prevGroup;

            while (currentGroup) {
                if (currentGroup.selected && currentGroup.nextGroup) {
                    filterAttributes.push({ group: currentGroup.group.id, selected: currentGroup.selected });
                }
                currentGroup = currentGroup.prevGroup;
            }

            return filterAttributes;
        };

        const _addOptionToSelect = function (element, attribute, group) {
            const option = new Option(attribute.attribute.name, attribute.attribute.id);
            option.id = 'attribute-' + attribute.attribute.id;
            if (group.selected === attribute.attribute.id) option.selected = true;
            element.add(option);
            element.disabled = false;
        };

        const _enableElementForAttribute = function (element, attribute, group) {
            if (parseInt(element.dataset.group) === group.group.id && parseInt(element.value) === attribute.attribute.id) {
                element.disabled = false;
                if (group.selected === attribute.attribute.id) element.checked = true;
            }
        };

        const _configureGroupElements = function (group, attributes) {
            group.elements.forEach((element) =>
                _configureElement(element, attributes, group)
            );
        };

        const _configureElement = function (element, attributes, group) {
            if (element.tagName.toLowerCase() === 'select') {
                attributes.forEach((attribute) => _addOptionToSelect(element, attribute, group));
            } else {
                attributes.forEach((attribute) => _enableElementForAttribute(element, attribute, group));
            }
        };

        const _configureGroup = function (group) {
            const filteredAttributes = _filterAttributes(group.attributes.slice(), group) || group.attributes;
            _configureGroupElements(group, filteredAttributes);
        };

        _init();
    };

    window.coreshopVariantSelector = coreshopVariantSelector;
})();
