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

class ShippingPage extends AbstractFrontendPage implements ShippingPageInterface
{
    public function getRouteName(): string
    {
        return 'coreshop_checkout';
    }

    public function submitStep(): void
    {
        $this->getElement('submit_shipping_step')->click();
    }

    public function getCarriers(): array
    {
        $inputs = $this->getSession()->getPage()->findAll('css', '[data-test-carrier-label]');

        $carriers = [];

        foreach ($inputs as $input) {
            $carriers[] = trim($input->getText());
        }

        return $carriers;
    }

    protected function getAdditionalParameters(): array
    {
        return [
            'stepIdentifier' => 'shipping',
        ];
    }

    protected function getDefinedElements(): array
    {
        return array_merge(parent::getDefinedElements(), [
            'submit_shipping_step' => '[data-test-submit-shipping-step]',
        ]);
    }
}
