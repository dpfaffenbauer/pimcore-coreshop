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
use CoreShop\Component\Address\Context\CompositeCountryContext;
use CoreShop\Component\Address\Context\CountryContextInterface;
use CoreShop\Component\Address\Formatter\AddressFormatterInterface;
use CoreShop\Component\Address\Model\AddressInterface;
use CoreShop\Component\Core\Model\CountryInterface;
use CoreShop\Component\Core\Model\CurrencyInterface;
use CoreShop\Component\Core\Repository\CountryRepositoryInterface;
use Webmozart\Assert\Assert;

final class CountryContext implements Context
{
    public function __construct(
        private CountryRepositoryInterface $countryRepository,
        private CountryContextInterface $countryContext,
        private AddressFormatterInterface $addressFormatter,
        private CompositeCountryContext $compositeCountryContext,
    ) {
    }

    /**
     * @Then /^there should be a country "([^"]+)"$/
     */
    public function thereShouldBeACountryCalled($name): void
    {
        $countries = $this->countryRepository->findByName($name, 'en');

        Assert::eq(
            count($countries),
            1,
            sprintf('%d countries has been found with name "%s".', count($countries), $name),
        );
    }

    /**
     * @Then /^the (country "[^"]+") should use (currency "[^"]+")$/
     */
    public function theCountryShouldUseCurrency(CountryInterface $country, CurrencyInterface $currency): void
    {
        Assert::eq(
            $country->getCurrency()->getId(),
            $currency->getId(),
            sprintf(
                '%s country should use currency %s but uses %s instead.',
                $country->getName(),
                $currency->getIsoCode(),
                $country->getCurrency()->getIsoCode(),
            ),
        );
    }

    /**
     * @Then /^I (?:|still )should be in (country "[^"]+")$/
     */
    public function iShouldBeInCountry(CountryInterface $country): void
    {
        $actualCountry = $this->countryContext->getCountry();

        Assert::eq(
            $country->getId(),
            $actualCountry->getId(),
            sprintf(
                'I should be in country %s (%d), but I am in country %s (%d) instead.',
                $country->getName(),
                $country->getId(),
                $actualCountry->getName(),
                $actualCountry->getId(),
            ),
        );
    }

    /**
     * @Then /^the (address) should format to "([^"]+)"$/
     */
    public function theAddressShouldFormatTo(AddressInterface $address, $formattedAddress): void
    {
        $actualFormattedAddress = $this->addressFormatter->formatAddress($address);

        Assert::eq(
            $actualFormattedAddress,
            $formattedAddress,
            sprintf(
                'expected the address to be formatted like "%s" but got "%s" instead.',
                $formattedAddress,
                $actualFormattedAddress,
            ),
        );
    }

    /**
     * @Then /^there should be a sample country context with priority 1 loaded by attribute as country context$/
     */
    public function thereShouldBeASampleCountryContextLoadedByAttributeAsCountryContext(): void
    {
        $reflection = new \ReflectionClass($this->compositeCountryContext);
        $reflection->getProperty('countryContexts')->setAccessible(true);
        /**
         * @var \CoreShop\Component\Pimcore\PriorityQueue $priorityQueue
         */
        $priorityQueue = $reflection->getProperty('countryContexts')->getValue($this->compositeCountryContext);

        foreach ($priorityQueue as $item) {
            if ($item instanceof \CoreShop\Behat\Service\SampleCountryContext) {
                return;
            }

            throw new \RuntimeException('SampleCountryContext was not found in the CompositeCountryContext.');
        }

        throw new \RuntimeException('SampleCountryContext was not found in the CompositeCountryContext.');
    }
}
