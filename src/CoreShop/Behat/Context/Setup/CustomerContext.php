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
use CoreShop\Component\Core\Model\CustomerInterface;
use CoreShop\Component\Core\Model\UserInterface;
use CoreShop\Component\Customer\Context\FixedCustomerContext;
use CoreShop\Component\Customer\Model\CustomerGroupInterface;
use CoreShop\Component\Resource\Factory\FactoryInterface;
use Pimcore\File;
use Pimcore\Model\DataObject\Folder;

final class CustomerContext implements Context
{
    public function __construct(
        private SharedStorageInterface $sharedStorage,
        private FactoryInterface $customerFactory,
        private FactoryInterface $userFactory,
        private FixedCustomerContext $fixedCustomerContext,
        private FactoryInterface $addressFactory,
    ) {
    }

    /**
     * @Given /^the site has a customer "([^"]+)"$/
     */
    public function theSiteHasACustomer(string $email, bool $isGuest = false): void
    {
        $customer = $this->createCustomer($email, $isGuest);

        $this->saveCustomer($customer);
    }

    /**
     * @Given /^the site has a guest "([^"]+)"$/
     */
    public function theSiteHasAGuest(string $email): void
    {
        $customer = $this->createCustomer($email, true);

        $this->saveCustomer($customer);
    }

    /**
     * @Given /^the site has a customer "([^"]+)" with password "([^"]+)"$/
     * @Given /^the site has a customer "([^"]+)" with password "([^"]+)" and name "([^"]+)" "([^"]+)"$/
     */
    public function theSiteHasACustomerWithPassword(string $email, string $password, ?string $firstname = null, ?string $lastname = null): void
    {
        $customer = $this->createCustomer($email);

        $customer->getUser()->setPassword($password);

        if ($firstname) {
            $customer->setFirstname($firstname);
        }

        if ($lastname) {
            $customer->setLastname($lastname);
        }

        $this->saveCustomer($customer);
    }

    /**
     * @Then /^the (customer "[^"]+") was deleted$/
     */
    public function accountWasDeleted(CustomerInterface $customer): void
    {
        $customer->delete();
    }

    /**
     * @Then /^the (customer "[^"]+") is in (customer-group "[^"]+")$/
     * @Then /^([^"]+) is in (customer-group "[^"]+")$/
     */
    public function theCustomerIsInGroup(CustomerInterface $customer, CustomerGroupInterface $group): void
    {
        $customer->setCustomerGroups([$group]);

        $this->saveCustomer($customer);
    }

    /**
     * @Given /^I am (customer "[^"]+")$/
     */
    public function iAmCustomer(CustomerInterface $customer): void
    {
        $this->fixedCustomerContext->setCustomer($customer);
    }

    /**
     * @Given /^I am (guest "[^"]+")$/
     */
    public function iAmGuest(CustomerInterface $customer): void
    {
        $this->fixedCustomerContext->setCustomer($customer);
    }

    /**
     * @Given /^the (customer "[^"]+") has an address with (country "[^"]+"), "([^"]+)", "([^"]+)", "([^"]+)", "([^"]+)"$/
     * @Given /^the (customer) has an address with (country "[^"]+"), "([^"]+)", "([^"]+)", "([^"]+)", "([^"]+)"$/
     */
    public function theCustomerHasAnAddress(
        CustomerInterface $customer,
        CountryInterface $country,
        $postcode,
        $city,
        $street,
        $nr,
    ): void {
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
        $address->setParent($customer);
        $address->save();

        $customer->addAddress($address);
        $customer->save();

        $this->sharedStorage->set('address', $address);
    }

    /**
     * @Then /^the (customer "[^"]+") address is (country "[^"]+"), "([^"]+)", "([^"]+)", "([^"]+)", "([^"]+)"$/
     * @Then /^the (customer) address is (country "[^"]+"), "([^"]+)", "([^"]+)", "([^"]+)", "([^"]+)"$/
     */
    public function theCustomersAddress(
        CustomerInterface $customer,
        CountryInterface $country,
        $postcode,
        $city,
        $street,
        $nr,
    ): bool {
        $found = false;
        $addresses = $customer->getAddresses();

        foreach ($addresses as $address) {
            if ($address->getStreet() != $street) {
                continue;
            }
            if ($address->getPostcode() != $postcode) {
                continue;
            }
            if ($address->getCity() != $city) {
                continue;
            }
            if ($address->getNumber() === $nr) {
                $found = true;
            }
            if ($address->getCountry() == $country) {
                $found = true;
            }
        }

        return $found;
    }

    private function createCustomer(string $email, bool $isGuest = false): CustomerInterface
    {
        /** @var CustomerInterface $customer */
        $customer = $this->customerFactory->createNew();

        [$firstname, $lastname] = explode('@', $email);

        $customer->setPublished(true);
        $customer->setKey(File::getValidFilename($email));
        $customer->setParent(Folder::getByPath('/'));
        $customer->setEmail($email);
        $customer->setFirstname($firstname);
        $customer->setLastname($lastname);

        if (!$isGuest) {
            /**
             * @var UserInterface $user
             */
            $user = $this->userFactory->createNew();
            $user->setKey(File::getValidFilename($email));
            $user->setParent($customer);
            $user->setPublished(true);
            $user->setLoginIdentifier($email);
            $user->setCustomer($customer);

            $customer->setUser($user);
        }

        return $customer;
    }

    private function saveCustomer(CustomerInterface $customer, $isGuest = false): void
    {
        $user = $customer->getUser();
        $customer->setUser(null);
        $customer->save();

        if ($user) {
            $user->setParent($customer);
            $user->save();

            $customer->setUser($user);
            $customer->save();

            $this->sharedStorage->set('user', $user);
        }

        $this->sharedStorage->set('customer', $customer);
    }
}
