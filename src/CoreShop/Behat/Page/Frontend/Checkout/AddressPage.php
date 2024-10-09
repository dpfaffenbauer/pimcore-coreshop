<?php

declare(strict_types=1);

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

namespace CoreShop\Behat\Page\Frontend\Checkout;

use CoreShop\Bundle\TestBundle\Page\Frontend\AbstractFrontendPage;
use CoreShop\Component\Address\Model\AddressInterface;

class AddressPage extends AbstractFrontendPage implements AddressPageInterface
{
    public function getRouteName(): string
    {
        return 'coreshop_checkout';
    }

    public function chooseDifferentShippingAddress(): void
    {
        $this->getElement('use_invoice_as_shipping')->click();
    }

    public function useShippingAddress(AddressInterface $shippingAddress): void
    {
        $this->getElement('shipping_address')->selectOption((string) $shippingAddress->getId());
    }

    public function useInvoiceAddress(AddressInterface $invoiceAddress): void
    {
        $this->getElement('invoice_address')->selectOption((string) $invoiceAddress->getId());
    }

    public function shippingAddressVisible(): bool
    {
        return null !== $this->getElement('shipping_address');
    }

    public function submitStep(): void
    {
        $this->getElement('submit_address_step')->click();
    }

    protected function getAdditionalParameters(): array
    {
        return [
            'stepIdentifier' => 'address',
        ];
    }

    protected function getDefinedElements(): array
    {
        return array_merge(parent::getDefinedElements(), [
            'submit_address_step' => '[data-test-submit-address-step]',
            'use_invoice_as_shipping' => '[data-test-use-invoice-as-shipping]',
            'invoice_address' => '[data-test-invoice-address]',
            'shipping_address' => '[data-test-shipping-address]',
        ]);
    }
}
