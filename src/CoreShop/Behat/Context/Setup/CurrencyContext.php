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

namespace CoreShop\Behat\Context\Setup;

use Behat\Behat\Context\Context;
use CoreShop\Bundle\TestBundle\Service\SharedStorageInterface;
use CoreShop\Component\Core\Model\CurrencyInterface;
use CoreShop\Component\Core\Model\StoreInterface;
use CoreShop\Component\Core\Repository\CurrencyRepositoryInterface;
use CoreShop\Component\Currency\Context\FixedCurrencyContext;
use CoreShop\Component\Resource\Factory\FactoryInterface;
use Doctrine\Persistence\ObjectManager;

final class CurrencyContext implements Context
{
    public function __construct(
        private SharedStorageInterface $sharedStorage,
        private ObjectManager $objectManager,
        private FactoryInterface $currencyFactory,
        private CurrencyRepositoryInterface $currencyRepository,
        private FixedCurrencyContext $fixedCurrencyContext,
    ) {
    }

    /**
     * @Given /^the site has a currency "([^"]+)" with iso "([^"]+)"$/
     */
    public function theSiteHasACurrency($name, $iso): void
    {
        $this->createCurrency($name, $iso);
    }

    /**
     * @Given /^I am using (currency "[^"]+")$/
     */
    public function iAmUsingCurrency(CurrencyInterface $currency): void
    {
        $this->fixedCurrencyContext->setCurrency($currency);
    }

    /**
     * @Given /^the (currency "[^"]+") is valid for (store "[^"]+")$/
     * @Given /^the (currency) is valid for (store "[^"]+")$/
     */
    public function currencyIsValidForStore(CurrencyInterface $currency, StoreInterface $store): void
    {
        foreach ($currency->getCountries() as $country) {
            $store->addCountry($country);
        }

        $this->objectManager->persist($store);
        $this->objectManager->flush();
    }

    /**
     * @param string $name
     * @param string $iso
     */
    private function createCurrency($name, $iso): void
    {
        $currency = $this->currencyRepository->findOneBy(['isoCode' => $iso]);

        if (!$currency) {
            /**
             * @var CurrencyInterface $currency
             */
            $currency = $this->currencyFactory->createNew();
            $currency->setName($name);
            $currency->setIsoCode($iso);

            $this->saveCurrency($currency);
        }
    }

    private function saveCurrency(CurrencyInterface $currency): void
    {
        $this->objectManager->persist($currency);
        $this->objectManager->flush();

        $this->sharedStorage->set('currency', $currency);
    }
}
