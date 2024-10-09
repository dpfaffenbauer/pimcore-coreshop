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
use CoreShop\Component\Core\Model\CustomerInterface;
use CoreShop\Component\Customer\Repository\CustomerRepositoryInterface;
use Webmozart\Assert\Assert;

final class CustomerContext implements Context
{
    public function __construct(
        private SharedStorageInterface $sharedStorage,
        private CustomerRepositoryInterface $customerRepository,
    ) {
    }

    /**
     * @Transform /^customer "([^"]+)"$/
     * @Transform /^email "([^"]+)"$/
     */
    public function getCustomerByEmail($email): CustomerInterface
    {
        $customer = $this->customerRepository->findCustomerByEmail($email);

        Assert::isInstanceOf($customer, CustomerInterface::class);

        return $customer;
    }

    /**
     * @Transform /^guest "([^"]+)"$/
     */
    public function getGuestByEmail($email): CustomerInterface
    {
        $customer = $this->customerRepository->findGuestByEmail($email);

        Assert::isInstanceOf($customer, CustomerInterface::class);

        return $customer;
    }

    /**
     * @Transform /^customer$/
     */
    public function customer(): CustomerInterface
    {
        $customer = $this->sharedStorage->get('customer');

        Assert::isInstanceOf($customer, CustomerInterface::class);

        return $customer;
    }
}
