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

namespace CoreShop\Bundle\CoreBundle\Doctrine\ORM;

use CoreShop\Bundle\TaxationBundle\Doctrine\ORM\TaxRuleRepository as BaseTaxRuleRepository;
use CoreShop\Component\Address\Model\CountryInterface;
use CoreShop\Component\Address\Model\StateInterface;
use CoreShop\Component\Core\Repository\TaxRuleRepositoryInterface;
use CoreShop\Component\Taxation\Model\TaxRuleGroupInterface;

class TaxRuleRepository extends BaseTaxRuleRepository implements TaxRuleRepositoryInterface
{
    public function findForCountryAndState(
        TaxRuleGroupInterface $taxRuleGroup,
        ?CountryInterface $country = null,
        ?StateInterface $state = null,
    ): array {
        return $this->createQueryBuilder('o')
            ->andWhere('o.taxRuleGroup = :taxRuleGroup')
            ->andWhere('(o.country = :country OR o.country IS NULL)')
            ->andWhere('(o.state  = :state OR o.state IS NULL)')
            ->setParameter('taxRuleGroup', $taxRuleGroup->getId())
            ->setParameter('country', $country ? $country->getId() : 0)
            ->setParameter('state', $state ? $state->getId() : 0)
            ->getQuery()
            ->getResult()
        ;
    }
}
