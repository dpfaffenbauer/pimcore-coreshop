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

class SummaryPage extends AbstractFrontendPage implements SummaryPageInterface
{
    public function getRouteName(): string
    {
        return 'coreshop_checkout';
    }

    public function submitOrder(): void
    {
        $this->getElement('submit_order')->click();
    }

    public function acceptTermsOfService(): void
    {
        $this->getElement('terms_of_service')->click();
    }

    public function declineTermsOfService(): void
    {
        $this->getElement('terms_of_service')->click();
    }

    public function submitQuote(): void
    {
        $this->getElement('submit_quote')->click();
    }

    protected function getAdditionalParameters(): array
    {
        return [
            'stepIdentifier' => 'summary',
        ];
    }

    protected function getDefinedElements(): array
    {
        return array_merge(parent::getDefinedElements(), [
            'submit_order' => '[data-test-submit-order]',
            'submit_quote' => '[data-test-submit-quote]',
            'terms_of_service' => '[data-test-accept-terms]',
        ]);
    }
}
