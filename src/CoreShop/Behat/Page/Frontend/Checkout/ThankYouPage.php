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

class ThankYouPage extends AbstractFrontendPage implements ThankYouPageInterface
{
    public function getRouteName(): string
    {
        return 'coreshop_checkout_thank_you';
    }

    public function getToken(): string
    {
        return $this->getElement('order_token')->getAttribute('data-test-order-token');
    }

    public function recapturePaymentForThisOrder(): void
    {
        $this->getSession()->visit($this->makePathAbsolute("en/shop/pay/{$this->getToken()}"));
    }

    public function getOrderTotal(): string
    {
        $orderTotalText = $this->getElement('order_total')->getText();

        if (str_contains($orderTotalText, ',')) {
            return strstr($orderTotalText, ',', true);
        }

        return trim($orderTotalText);
    }

    protected function getDefinedElements(): array
    {
        return array_merge(parent::getDefinedElements(), [
            'order_token' => '[data-test-order-token]',
            'order_total' => '[data-test-order-total]',
        ]);
    }
}
