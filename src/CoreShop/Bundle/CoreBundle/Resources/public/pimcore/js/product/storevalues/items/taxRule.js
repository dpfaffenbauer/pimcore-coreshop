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

pimcore.registerNS('coreshop.product.storeValues.items.tax_rule');
coreshop.product.storeValues.items.tax_rule = Class.create(coreshop.product.storeValues.items.abstract, {

    getForm: function () {

        var taxRule = this.getDataValue('taxRule'),
            taxRuleField = new CoreShop.taxation.TaxRuleGroup({
                fieldLabel: t('coreshop_store_values_store_tax_rule'),
                name: 'taxRule',
                componentCls: 'object_field',
                labelWidth: 250,
            });

        // do not fire dirty flag on initial data setup
        taxRuleField.suspendEvents();

        if (taxRule !== null) {
            taxRuleField.setValue(taxRule);
        }

        if (this.builder.fieldConfig.width) {
            taxRuleField.setWidth(this.builder.fieldConfig.width + taxRuleField.labelWidth);
        } else {
            taxRuleField.setWidth(350 + taxRuleField.labelWidth);
        }

        taxRuleField.resumeEvents(true);

        return taxRuleField;
    }
});
