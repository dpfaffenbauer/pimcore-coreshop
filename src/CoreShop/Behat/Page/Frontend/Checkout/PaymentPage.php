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
use CoreShop\Component\Core\Model\PaymentProviderInterface;

class PaymentPage extends AbstractFrontendPage implements PaymentPageInterface
{
    public function getRouteName(): string
    {
        return 'coreshop_checkout';
    }

    public function selectPaymentProvider(PaymentProviderInterface $paymentProvider): void
    {
        $this->getElement('payment_provider')->selectOption((string) $paymentProvider->getId());
    }

    public function submitStep(): void
    {
        $this->getElement('submit_payment_step')->click();
    }

    protected function getAdditionalParameters(): array
    {
        return [
            'stepIdentifier' => 'payment',
        ];
    }

    protected function getDefinedElements(): array
    {
        return array_merge(parent::getDefinedElements(), [
            'submit_payment_step' => '[data-test-submit-payment-step]',
            'payment_provider' => '[data-test-select-payment-provider]',
        ]);
    }
}
