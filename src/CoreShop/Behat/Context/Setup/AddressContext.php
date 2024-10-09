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
use CoreShop\Component\Address\Model\AddressInterface;
use CoreShop\Component\Core\Model\CountryInterface;
use CoreShop\Component\Resource\Factory\FactoryInterface;
use Pimcore\Model\DataObject\Folder;

final class AddressContext implements Context
{
    public function __construct(
        private SharedStorageInterface $sharedStorage,
        private FactoryInterface $addressFactory,
    ) {
    }

    /**
     * @Given /^there is an address with (country "[^"]+"), "([^"]+)", "([^"]+)", "([^"]+)", "([^"]+)"$/
     */
    public function thereIsAnAddress(CountryInterface $country, $postcode, $city, $street, $nr): void
    {
        $this->createAddress($country, $postcode, $city, $street, $nr);
    }

    private function createAddress(CountryInterface $country, string $postcode, string $city, string $street, string $nr): AddressInterface
    {
        /**
         * @var AddressInterface $address
         */
        $address = $this->addressFactory->createNew();

        $address->setCountry($country);
        $address->setPostcode($postcode);
        $address->setCity($city);
        $address->setStreet($street);
        $address->setNumber($nr);
        $address->setKey(uniqid());
        $address->setPublished(true);
        $address->setParent(Folder::getByPath('/'));

        $this->saveAddress($address);

        return $address;
    }

    private function saveAddress(AddressInterface $address): void
    {
        $address->save();

        $this->sharedStorage->set('address', $address);
    }
}
