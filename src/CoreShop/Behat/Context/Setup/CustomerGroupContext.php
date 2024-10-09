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
use CoreShop\Component\Customer\Model\CustomerGroupInterface;
use CoreShop\Component\Resource\Factory\FactoryInterface;
use Pimcore\File;
use Pimcore\Model\DataObject\Folder;

final class CustomerGroupContext implements Context
{
    public function __construct(
        private SharedStorageInterface $sharedStorage,
        private FactoryInterface $customerGroupFactory,
    ) {
    }

    /**
     * @Given /^the site has a customer-group "([^"]+)"$/
     */
    public function theSiteHasACustomerGroup(string $name): void
    {
        $group = $this->createCustomerGroup($name);

        $this->saveCustomerGroup($group);
    }

    private function createCustomerGroup(string $name): CustomerGroupInterface
    {
        /** @var CustomerGroupInterface $group */
        $group = $this->customerGroupFactory->createNew();
        $group->setKey(File::getValidFilename($name));
        $group->setParent(Folder::getByPath('/'));
        $group->setName($name);

        return $group;
    }

    private function saveCustomerGroup(CustomerGroupInterface $group): void
    {
        $group->save();

        $this->sharedStorage->set('customer_group', $group);
    }
}
