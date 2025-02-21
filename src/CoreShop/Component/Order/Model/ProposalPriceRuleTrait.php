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

namespace CoreShop\Component\Order\Model;

use CoreShop\Component\Resource\Exception\ImplementedByPimcoreException;
use Pimcore\Model\DataObject\Fieldcollection;

trait ProposalPriceRuleTrait
{
    /**
     * @return Fieldcollection|null
     */
    public function getPriceRuleItems()
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setPriceRuleItems(?Fieldcollection $priceRuleItems)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function hasPriceRules(): bool
    {
        return $this->getPriceRuleItems() instanceof Fieldcollection && $this->getPriceRuleItems()->getCount() > 0;
    }

    /**
     * @return PriceRuleItemInterface[]
     */
    public function getPriceRules(): array
    {
        $rules = [];

        if ($this->getPriceRuleItems() instanceof Fieldcollection) {
            foreach ($this->getPriceRuleItems() as $ruleItem) {
                if ($ruleItem instanceof PriceRuleItemInterface) {
                    $rules[] = $ruleItem->getCartPriceRule();
                }
            }
        }

        /**
         * @var PriceRuleItemInterface[] $rules
         */
        return $rules;
    }

    public function setPriceRules($priceRules): void
    {
        if ($priceRules instanceof Fieldcollection) {
            $this->setPriceRuleItems($priceRules);
        }
    }

    public function addPriceRule(PriceRuleItemInterface $priceRule): void
    {
        if (!$this->hasPriceRule($priceRule)) {
            $items = $this->getPriceRuleItems();

            if (!$items instanceof Fieldcollection) {
                $items = new Fieldcollection();
            }

            if ($priceRule instanceof Fieldcollection\Data\AbstractData) {
                /**
                 * @psalm-suppress InvalidArgument
                 */
                $items->add($priceRule);
            }

            $this->setPriceRules($items);
        }
    }

    public function removePriceRule(PriceRuleItemInterface $priceRule): void
    {
        $items = $this->getPriceRuleItems();

        if ($items instanceof Fieldcollection) {
            for ($i = 0, $c = $items->getCount(); $i < $c; ++$i) {
                $item = $items->get($i);

                if (!$item instanceof PriceRuleItemInterface) {
                    continue;
                }

                if (!$item->getCartPriceRule() instanceof CartPriceRuleInterface) {
                    continue;
                }

                if (!$priceRule->getCartPriceRule() instanceof CartPriceRuleInterface) {
                    continue;
                }

                if ($item->getCartPriceRule()->getId() === $priceRule->getCartPriceRule()->getId() &&
                    $item->getVoucherCode() === $priceRule->getVoucherCode()) {
                    $items->remove($i);

                    break;
                }
            }

            $this->setPriceRules($items);
        }
    }

    public function hasPriceRule(PriceRuleItemInterface $priceRule): bool
    {
        $items = $this->getPriceRuleItems();

        if ($items instanceof Fieldcollection) {
            foreach ($items as $item) {
                if (!$item instanceof PriceRuleItemInterface) {
                    continue;
                }

                if (!$item->getCartPriceRule() instanceof CartPriceRuleInterface) {
                    continue;
                }

                if (!$priceRule->getCartPriceRule() instanceof CartPriceRuleInterface) {
                    continue;
                }

                if ($item->getCartPriceRule()->getId() === $priceRule->getCartPriceRule()->getId() &&
                    $item->getVoucherCode() === $priceRule->getVoucherCode()) {
                    return true;
                }
            }
        }

        return false;
    }

    public function hasCartPriceRule(
        CartPriceRuleInterface $cartPriceRule,
        ?CartPriceRuleVoucherCodeInterface $voucherCode = null,
    ): bool {
        return null !== $this->getPriceRuleByCartPriceRule($cartPriceRule, $voucherCode);
    }

    public function getPriceRuleByCartPriceRule(
        CartPriceRuleInterface $cartPriceRule,
        ?CartPriceRuleVoucherCodeInterface $voucherCode = null,
    ): ?PriceRuleItemInterface {
        $items = $this->getPriceRuleItems();

        if ($items instanceof Fieldcollection) {
            foreach ($items as $item) {
                if (!$item instanceof PriceRuleItemInterface) {
                    continue;
                }

                if (!$item->getCartPriceRule() instanceof CartPriceRuleInterface) {
                    continue;
                }

                if ($item->getCartPriceRule()->getId() === $cartPriceRule->getId()) {
                    if (null === $voucherCode || $voucherCode->getCode() === $item->getVoucherCode()) {
                        return $item;
                    }
                }
            }
        }

        return null;
    }
}
