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

namespace CoreShop\Component\Address\Context;

use CoreShop\Component\Address\Model\CountryInterface;
use Laminas\Stdlib\PriorityQueue;

final class CompositeCountryContext implements CountryContextInterface
{
    /**
     * @var PriorityQueue|CountryContextInterface[]
     *
     * @psalm-var PriorityQueue<CountryContextInterface>
     */
    private PriorityQueue $countryContexts;

    public function __construct()
    {
        $this->countryContexts = new PriorityQueue();
    }

    public function addContext(CountryContextInterface $countryContexts, $priority = 0): void
    {
        $this->countryContexts->insert($countryContexts, $priority);
    }

    public function getCountry(): CountryInterface
    {
        foreach ($this->countryContexts as $countryContexts) {
            try {
                return $countryContexts->getCountry();
            } catch (CountryNotFoundException) {
                continue;
            }
        }

        throw new CountryNotFoundException();
    }
}
