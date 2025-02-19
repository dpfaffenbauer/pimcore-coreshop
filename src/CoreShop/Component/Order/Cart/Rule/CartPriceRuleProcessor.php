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

class CartPriceRuleProcessor implements CartPriceRuleProcessorInterface
{
    public function __construct(
        private CartPriceRuleValidationProcessorInterface $cartPriceRuleValidator,
        private ProposalCartPriceRuleCalculatorInterface $proposalCartPriceRuleCalculator,
    ) {
    }

    public function process(OrderInterface $cart, CartPriceRuleInterface $cartPriceRule, ?CartPriceRuleVoucherCodeInterface $voucherCode = null): bool
    {
        if ($this->cartPriceRuleValidator->isValidCartRule($cart, $cartPriceRule, $voucherCode)) {
            $this->proposalCartPriceRuleCalculator->calculatePriceRule($cart, $cartPriceRule, $voucherCode);

            return true;
        }

        return false;
    }
}
