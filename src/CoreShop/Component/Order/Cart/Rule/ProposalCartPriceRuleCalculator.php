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
use CoreShop\Component\Resource\Factory\FactoryInterface;
use CoreShop\Component\Rule\Model\ActionInterface;
use Webmozart\Assert\Assert;

class ProposalCartPriceRuleCalculator implements ProposalCartPriceRuleCalculatorInterface
{
    public function __construct(
        private FactoryInterface $cartPriceRuleItemFactory,
        private ServiceRegistryInterface $actionServiceRegistry,
    ) {
    }

    public function calculatePriceRule(OrderInterface $cart, CartPriceRuleInterface $cartPriceRule, ?CartPriceRuleVoucherCodeInterface $voucherCode = null): ?PriceRuleItemInterface
    {
        $priceRuleItem = $cart->getPriceRuleByCartPriceRule($cartPriceRule, $voucherCode);
        $existingPriceRule = null !== $priceRuleItem;
        $result = false;

        if ($priceRuleItem === null) {
            /**
             * @var PriceRuleItemInterface $priceRuleItem
             */
            $priceRuleItem = $this->cartPriceRuleItemFactory->createNew();
        }

        $priceRuleItem->setCartPriceRule($cartPriceRule);

        if ($voucherCode) {
            $priceRuleItem->setVoucherCode($voucherCode->getCode());
        }
        $priceRuleItem->setDiscount(0, true);
        $priceRuleItem->setDiscount(0, false);

        foreach ($cartPriceRule->getActions() as $action) {
            if ($action instanceof ActionInterface) {
                $actionCommand = $this->actionServiceRegistry->get($action->getType());

                /**
                 * @var CartPriceRuleActionProcessorInterface $actionCommand
                 */
                Assert::isInstanceOf($actionCommand, CartPriceRuleActionProcessorInterface::class);

                $config = $action->getConfiguration();
                $config['action'] = $action;

                $actionResult = $actionCommand->applyRule($cart, $config, $priceRuleItem);
                $result = $result || $actionResult;
            }
        }

        if (!$result) {
            $cart->removePriceRule($priceRuleItem);

            return null;
        }

        if (!$existingPriceRule) {
            $cart->addPriceRule($priceRuleItem);
        }

        return $priceRuleItem;
    }
}
