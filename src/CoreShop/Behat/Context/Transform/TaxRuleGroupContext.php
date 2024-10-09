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

namespace CoreShop\Behat\Context\Transform;

use Behat\Behat\Context\Context;
use CoreShop\Bundle\TestBundle\Service\SharedStorageInterface;
use CoreShop\Component\Resource\Repository\RepositoryInterface;
use CoreShop\Component\Taxation\Model\TaxRuleGroupInterface;
use Webmozart\Assert\Assert;

final class TaxRuleGroupContext implements Context
{
    public function __construct(
        private SharedStorageInterface $sharedStorage,
        private RepositoryInterface $taxRuleGroupRepository,
    ) {
    }

    /**
     * @Transform /^tax rule group "([^"]+)"$/
     */
    public function getTaxRuleGroupByName($name): TaxRuleGroupInterface
    {
        /**
         * @var TaxRuleGroupInterface[] $groups
         */
        $groups = $this->taxRuleGroupRepository->findBy(['name' => $name]);

        Assert::eq(
            count($groups),
            1,
            sprintf('%d tax rule groups has been found with name "%s".', count($groups), $name),
        );

        return reset($groups);
    }

    /**
     * @Transform /^tax rule group$/
     */
    public function theTaxRuleGroup(): TaxRuleGroupInterface
    {
        return $this->sharedStorage->get('taxRuleGroup');
    }
}
