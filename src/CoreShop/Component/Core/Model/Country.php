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

use CoreShop\Component\Address\Model\Country as BaseCountry;
use CoreShop\Component\Store\Model\StoresAwareTrait;

/**
 * @psalm-suppress MissingConstructor
 */
class Country extends BaseCountry implements CountryInterface
{
    use StoresAwareTrait {
        __construct as storesAwareConstructor;
    }

    /**
     * @var CurrencyInterface
     */
    protected $currency;

    public function __construct(
        ) {
        parent::__construct();

        $this->storesAwareConstructor();
    }

    public function getCurrency()
    {
        return $this->currency;
    }

    public function setCurrency(?CurrencyInterface $currency = null)
    {
        $this->currency = $currency;

        if (null !== $currency) {
            $currency->addCountry($this);
        }

        return $this;
    }

    /**
     * @return string
     */
    public function __toString()
    {
        return sprintf('%s', $this->getIsoCode());
    }
}
