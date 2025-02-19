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

namespace CoreShop\Component\Core\Payment\Resolver;

use CoreShop\Component\Core\Repository\PaymentProviderRepositoryInterface;
use CoreShop\Component\Payment\Resolver\PaymentProviderResolverInterface;
use CoreShop\Component\Resource\Model\ResourceInterface;
use CoreShop\Component\Store\Context\StoreContextInterface;

class StoreBasedPaymentProviderResolver implements PaymentProviderResolverInterface
{
    public function __construct(
        private PaymentProviderRepositoryInterface $paymentProviderRepository,
        private StoreContextInterface $storeContext,
    ) {
    }

    public function resolvePaymentProviders(?ResourceInterface $subject = null): array
    {
        return $this->paymentProviderRepository->findActiveForStore($this->storeContext->getStore());
    }
}
