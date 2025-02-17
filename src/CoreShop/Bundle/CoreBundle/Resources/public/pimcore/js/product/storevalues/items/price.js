/*
 * CoreShop
 *
 * This source file is available under two different licenses:
 *  - GNU General Public License version 3 (GPLv3)
 *  - CoreShop Commercial License (CCL)
 * Full copyright and license information is available in
 * LICENSE.md which is distributed with this source code.
 *
 * @copyright  Copyright (c) CoreShop GmbH (https://www.coreshop.org)
 * @license    https://www.coreshop.org/license     GPLv3 and CCL
 *
 */

pimcore.registerNS('coreshop.product.storeValues.items.price');
coreshop.product.storeValues.items.price = Class.create(coreshop.product.storeValues.items.abstract, {

    getForm: function () {

        var price = this.getDataValue('price'),
            priceField = new Ext.form.NumberField({
                fieldLabel: t('coreshop_store_values_store_price'),
                name: 'price',
                componentCls: 'object_field',
                labelWidth: 250,
                minValue: 0,
                value: 0,
                decimalPrecision: pimcore.globalmanager.get('coreshop.currency.decimal_precision')
            });

        // do not fire dirty flag on initial data setup
        priceField.suspendEvents();

        if (price !== null) {
            priceField.setValue(price / pimcore.globalmanager.get('coreshop.currency.decimal_factor'));
            priceField.resetOriginalValue();
            priceField.setFieldLabel(priceField.fieldLabel + ' (' + this.builder.data.currencySymbol + ')');
        }

        if (this.builder.fieldConfig.width) {
            priceField.setWidth(this.builder.fieldConfig.width + priceField.labelWidth);
        } else {
            priceField.setWidth(350 + priceField.labelWidth);
        }

        if (is_numeric(this.builder.fieldConfig['minValue'])) {
            priceField.setMinValue(this.builder.fieldConfig.minValue);
        }

        if (is_numeric(this.builder.fieldConfig['maxValue'])) {
            priceField.setMaxValue(this.builder.fieldConfig.maxValue);
        }

        priceField.on('blur', function (field) {
            var value = field.getValue();
            if (value === null || value === '') {
                field.setValue(0);
            }
        });

        priceField.resumeEvents(true);

        return priceField;
    }
});
