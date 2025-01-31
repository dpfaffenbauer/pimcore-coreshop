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

namespace CoreShop\Component\Core\Payment\Rule\Condition;

use CoreShop\Component\Payment\Model\PayableInterface;
use CoreShop\Component\Payment\Model\PaymentProviderInterface;
use CoreShop\Component\Payment\Rule\Condition\AbstractConditionChecker;
use CoreShop\Component\Shipping\Model\CarrierAwareInterface;

final class CarrierConditionChecker extends AbstractConditionChecker
{
    public function isPaymentProviderRuleValid(
        PaymentProviderInterface $paymentProvider,
        PayableInterface $payable,
        array $configuration,
    ): bool {
        if (!$payable instanceof CarrierAwareInterface) {
            return false;
        }

        return in_array($payable->getCarrier()?->getId(), $configuration['carriers']);
    }
}
