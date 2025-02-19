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

use CoreShop\Component\Order\Cart\Rule\Action\CartPriceRuleActionProcessorInterface;
use CoreShop\Component\Order\Model\CartPriceRuleInterface;
use CoreShop\Component\Order\Model\CartPriceRuleVoucherCodeInterface;
use CoreShop\Component\Order\Model\OrderInterface;
use CoreShop\Component\Order\Model\PriceRuleItemInterface;
use CoreShop\Component\Registry\ServiceRegistryInterface;
use CoreShop\Component\Rule\Model\ActionInterface;
use Webmozart\Assert\Assert;

class CartPriceRuleUnProcessor implements CartPriceRuleUnProcessorInterface
{
    public function __construct(
        private ServiceRegistryInterface $actionServiceRegistry,
    ) {
    }

    public function unProcess(OrderInterface $cart, CartPriceRuleInterface $cartPriceRule, ?CartPriceRuleVoucherCodeInterface $voucherCode = null): bool
    {
        $priceRuleItem = $cart->getPriceRuleByCartPriceRule($cartPriceRule, $voucherCode);

        if ($priceRuleItem instanceof PriceRuleItemInterface) {
            foreach ($cartPriceRule->getActions() as $action) {
                if ($action instanceof ActionInterface) {
                    $actionCommand = $this->actionServiceRegistry->get($action->getType());

                    Assert::isInstanceOf($actionCommand, CartPriceRuleActionProcessorInterface::class);

                    $config = $action->getConfiguration();
                    $config['action'] = $action;

                    $actionCommand->unApplyRule($cart, $config, $priceRuleItem);
                }
            }

            foreach ($cart->getItems() as $item) {
                $itemPriceRuleItem = $item->getPriceRuleByCartPriceRule($cartPriceRule, $voucherCode);

                if ($itemPriceRuleItem) {
                    $item->removePriceRule($itemPriceRuleItem);
                }
            }

            $cart->removePriceRule($priceRuleItem);

            return true;
        }

        return false;
    }
}
