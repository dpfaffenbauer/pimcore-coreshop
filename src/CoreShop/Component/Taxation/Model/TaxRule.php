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

use CoreShop\Component\Resource\Model\AbstractResource;
use CoreShop\Component\Resource\Model\TimestampableTrait;

/**
 * @psalm-suppress MissingConstructor
 */
class TaxRule extends AbstractResource implements TaxRuleInterface, \Stringable
{
    use TimestampableTrait;

    /**
     * @var int
     */
    protected $id;

    /**
     * @var TaxRuleGroupInterface
     */
    protected $taxRuleGroup;

    /**
     * @var TaxRateInterface
     */
    protected $taxRate;

    /**
     * @var int
     */
    protected $behavior;

    public function __toString(): string
    {
        $tax = $this->getTaxRate() instanceof TaxRateInterface ? $this->getTaxRate()->getName() : 'none';

        return sprintf('%s (%s)', $tax, $this->getId());
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getBehavior()
    {
        return $this->behavior;
    }

    public function setBehavior($behavior)
    {
        $this->behavior = $behavior;

        return $this;
    }

    public function getTaxRuleGroup()
    {
        return $this->taxRuleGroup;
    }

    public function setTaxRuleGroup(?TaxRuleGroupInterface $taxRuleGroup = null)
    {
        $this->taxRuleGroup = $taxRuleGroup;

        return $this;
    }

    public function getTaxRate()
    {
        return $this->taxRate;
    }

    public function setTaxRate(TaxRateInterface $taxRate)
    {
        $this->taxRate = $taxRate;

        return $this;
    }
}
