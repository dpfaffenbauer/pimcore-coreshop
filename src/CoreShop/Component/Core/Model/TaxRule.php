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

namespace CoreShop\Component\Core\Model;

use CoreShop\Component\Address\Model\StateInterface;
use CoreShop\Component\Taxation\Model\TaxRateInterface;
use CoreShop\Component\Taxation\Model\TaxRule as BaseTaxRule;

/**
 * @psalm-suppress MissingConstructor
 */
class TaxRule extends BaseTaxRule implements TaxRuleInterface, \Stringable
{
    /**
     * @var CountryInterface
     */
    protected $country;

    /**
     * @var StateInterface
     */
    protected $state;

    public function __toString(): string
    {
        $country = $this->getCountry() instanceof CountryInterface ? $this->getCountry()->getName() : 'none';
        $state = $this->getState() instanceof StateInterface ? $this->getState()->getName() : 'none';
        $tax = $this->getTaxRate() instanceof TaxRateInterface ? $this->getTaxRate()->getName() : 'none';

        return sprintf('%s (%s) (%s) (%s)', $tax, $country, $state, $this->getId());
    }

    /**
     * @return CountryInterface
     */
    public function getCountry()
    {
        return $this->country;
    }

    public function setCountry(?CountryInterface $country = null)
    {
        $this->country = $country;

        return $this;
    }

    public function getState()
    {
        return $this->state;
    }

    public function setState(?StateInterface $state = null)
    {
        $this->state = $state;

        return $this;
    }
}
