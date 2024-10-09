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
use CoreShop\Component\Core\Model\CountryInterface;
use CoreShop\Component\Core\Repository\CountryRepositoryInterface;
use Webmozart\Assert\Assert;

final class CountryContext implements Context
{
    public function __construct(
        private SharedStorageInterface $sharedStorage,
        private CountryRepositoryInterface $countryRepository,
    ) {
    }

    /**
     * @Transform /^country "([^"]+)"$/
     * @Transform /^countries "([^"]+)"$/
     */
    public function getCountryByName($name): CountryInterface
    {
        /**
         * @var CountryInterface[] $countries
         */
        $countries = $this->countryRepository->findByName($name, 'en');

        Assert::eq(
            count($countries),
            1,
            sprintf('%d country has been found with name "%s".', count($countries), $name),
        );

        return reset($countries);
    }

    /**
     * @Transform /^country$/
     * @Transform /^countries$/
     */
    public function country(): CountryInterface
    {
        return $this->sharedStorage->get('country');
    }
}
