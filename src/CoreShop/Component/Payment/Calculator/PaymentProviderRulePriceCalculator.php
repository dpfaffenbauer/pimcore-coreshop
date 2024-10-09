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

namespace CoreShop\Component\Payment\Calculator;

use CoreShop\Component\Payment\Checker\PaymentProviderRuleCheckerInterface;
use CoreShop\Component\Payment\Model\PayableInterface;
use CoreShop\Component\Payment\Model\PaymentProviderInterface;
use CoreShop\Component\Payment\Model\PaymentProviderRuleInterface;
use CoreShop\Component\Payment\Rule\Processor\PaymentProviderRuleActionProcessorInterface;

class PaymentProviderRulePriceCalculator implements PaymentProviderRulePriceCalculatorInterface
{
    public function __construct(
        protected PaymentProviderRuleCheckerInterface $paymentProviderRuleChecker,
        protected PaymentProviderRuleActionProcessorInterface $paymentProviderRuleProcessor,
    ) {
    }

    public function getPrice(PaymentProviderInterface $paymentProvider, PayableInterface $payable, array $context): int
    {
        /**
         * First valid price rule wins. so, we loop through all PaymentProviderRuleGroups
         * get the first valid one, and process it for the price.
         */
        $paymentProviderRule = $this->paymentProviderRuleChecker->findValidPaymentProviderRule($paymentProvider, $payable);

        if ($paymentProviderRule instanceof PaymentProviderRuleInterface) {
            $price = $this->paymentProviderRuleProcessor->getPrice(
                $paymentProviderRule,
                $paymentProvider,
                $payable,
                $context,
            );

            $modifications = $this->paymentProviderRuleProcessor->getModification(
                $paymentProviderRule,
                $paymentProvider,
                $payable,
                $payable->getPaymentTotal() ?: 0,
                $context,
            );

            return $price + $modifications;
        }

        return 0;
    }
}
