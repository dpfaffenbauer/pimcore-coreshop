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

namespace CoreShop\Behat\Context\Domain;

use Behat\Behat\Context\Context;
use CoreShop\Bundle\TestBundle\Service\SharedStorageInterface;
use Webmozart\Assert\Assert;

final class CartPriceRuleVoucherCodeContext implements Context
{
    public function __construct(
        private SharedStorageInterface $sharedStorage,
    ) {
    }

    /**
     * @Then /^the generation of the codes failed$/
     */
    public function theGenerationOfTheCodesFailed(): void
    {
        Assert::false($this->sharedStorage->get('code-generation-possible'));
    }

    /**
     * @Then /^the generation of the codes succeeded/
     */
    public function theGenerationOfTheCodesSucceeded(): void
    {
        Assert::true($this->sharedStorage->get('code-generation-possible'));
    }
}
