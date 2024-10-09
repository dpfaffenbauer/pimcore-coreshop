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

namespace CoreShop\Behat\Context\Setup;

use Behat\Behat\Context\Context;
use CoreShop\Bundle\TestBundle\Service\SharedStorageInterface;
use CoreShop\Component\Order\Generator\CodeGeneratorCheckerInterface;
use CoreShop\Component\Order\Model\CartPriceRuleInterface;
use CoreShop\Component\Order\Model\CartPriceRuleVoucherGenerator;

final class CartPriceRuleVoucherCodeContext implements Context
{
    public function __construct(
        private SharedStorageInterface $sharedStorage,
        private CodeGeneratorCheckerInterface $cartPriceRuleGeneratorChecker,
    ) {
    }

    /**
     * @Given /^I want to generate ([^"]+) codes with a length of ([^"]+) in ([^"]+) characters for (cart rule "[^"]+") with prefix "([^"]+)" and suffix "([^"]+)"$/
     * @Given /^I want to generate ([^"]+) codes with a length of ([^"]+) in ([^"]+) characters for the (cart rule) with prefix "([^"]+)" and suffix "([^"]+)"$/
     * @Given /^I want to generate ([^"]+) codes with a length of ([^"]+) in ([^"]+) characters for (cart rule "[^"]+")$/
     * @Given /^I want to generate ([^"]+) codes with a length of ([^"]+) in ([^"]+) characters for the (cart rule)$/
     */
    public function iWantToGenerateCodes(int $numberOfCodes, int $lenghtPerCode, string $chars, CartPriceRuleInterface $cartPriceRule, ?string $prefix = null, ?string $suffix = null): void
    {
        $generator = new CartPriceRuleVoucherGenerator();
        $generator->setAmount($numberOfCodes);
        $generator->setLength($lenghtPerCode);
        $generator->setFormat($chars);
        $generator->setPrefix($prefix);
        $generator->setPrefix($suffix);
        $generator->setCartPriceRule($cartPriceRule);

        $possible = $this->cartPriceRuleGeneratorChecker->isGenerationPossible($generator);
        $amountPossible = $this->cartPriceRuleGeneratorChecker->getPossibleGenerationAmount($generator);

        $this->sharedStorage->set('code-generation-possible', $possible);
        $this->sharedStorage->set('code-generation-amount-possible', $amountPossible);
    }
}
