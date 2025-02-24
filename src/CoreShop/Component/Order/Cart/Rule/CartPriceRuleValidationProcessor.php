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

namespace CoreShop\Component\Order\Cart\Rule;

use CoreShop\Component\Order\Model\CartPriceRuleInterface;
use CoreShop\Component\Order\Model\CartPriceRuleVoucherCodeInterface;
use CoreShop\Component\Order\Model\OrderInterface;
use CoreShop\Component\Resource\Model\ResourceInterface;
use CoreShop\Component\Rule\Condition\RuleConditionsValidationProcessorInterface;
use CoreShop\Component\Rule\Model\RuleInterface;

class CartPriceRuleValidationProcessor implements CartPriceRuleValidationProcessorInterface
{
    public function __construct(
        private RuleConditionsValidationProcessorInterface $ruleConditionsValidationProcessor,
    ) {
    }

    public function isValidCartRule(OrderInterface $cart, CartPriceRuleInterface $cartPriceRule, ?CartPriceRuleVoucherCodeInterface $voucherCode = null): bool
    {
        if (null === $voucherCode && $cartPriceRule->getIsVoucherRule()) {
            return false;
        }

        return $this->isValid($cart, $cartPriceRule, [
            'cartPriceRule' => $cartPriceRule,
            'voucher' => $voucherCode,
        ]);
    }

    public function isValid(ResourceInterface $subject, RuleInterface $rule, array $params = []): bool
    {
        return $this->ruleConditionsValidationProcessor->isValid(
            $subject,
            $rule,
            $rule->getConditions(),
            $params,
        );
    }
}
