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

namespace CoreShop\Component\Taxation\Model;

use CoreShop\Component\Resource\Model\ResourceInterface;
use CoreShop\Component\Resource\Model\TimestampableInterface;

interface TaxRuleInterface extends ResourceInterface, TimestampableInterface
{
    public function getId(): ?int;

    /**
     * @return int
     */
    public function getBehavior();

    /**
     * @param int $behavior
     */
    public function setBehavior($behavior);

    /**
     * @return TaxRuleGroupInterface
     */
    public function getTaxRuleGroup();

    public function setTaxRuleGroup(?TaxRuleGroupInterface $taxRuleGroup = null);

    /**
     * @return TaxRateInterface
     */
    public function getTaxRate();

    public function setTaxRate(TaxRateInterface $taxRate);
}
