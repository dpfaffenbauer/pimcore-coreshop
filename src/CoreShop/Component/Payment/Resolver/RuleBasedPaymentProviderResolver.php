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

namespace CoreShop\Component\Payment\Resolver;

use CoreShop\Component\Payment\Model\PayableInterface;
use CoreShop\Component\Payment\Model\PaymentProviderInterface;
use CoreShop\Component\Payment\Validator\PaymentProviderRuleValidatorInterface;
use CoreShop\Component\Resource\Model\ResourceInterface;

class RuleBasedPaymentProviderResolver implements PaymentProviderResolverInterface
{
    public function __construct(
        private PaymentProviderResolverInterface $inner,
        private PaymentProviderRuleValidatorInterface $paymentProviderRuleValidator,
    ) {
    }

    public function resolvePaymentProviders(?ResourceInterface $subject = null): array
    {
        /**
         * @var PaymentProviderInterface[] $paymentProviders
         */
        $paymentProviders = $this->inner->resolvePaymentProviders($subject);

        if (!$subject instanceof PayableInterface) {
            return $paymentProviders;
        }

        $validProviders = [];

        foreach ($paymentProviders as $provider) {
            if ($this->paymentProviderRuleValidator->isPaymentProviderRuleValid($provider, $subject)) {
                $validProviders[] = $provider;
            }
        }

        return $validProviders;
    }
}
