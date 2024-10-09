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
use CoreShop\Component\Product\Model\ManufacturerInterface;
use CoreShop\Component\Resource\Factory\FactoryInterface;
use Pimcore\File;
use Pimcore\Model\DataObject\Service;

final class ManufacturerContext implements Context
{
    public function __construct(
        private SharedStorageInterface $sharedStorage,
        private FactoryInterface $manufacturerFactory,
    ) {
    }

    /**
     * @Given /^the site has a manufacturer "([^"]+)"$/
     */
    public function thereIsAManufacturer($name): void
    {
        /**
         * @var ManufacturerInterface $manufacturer
         */
        $manufacturer = $this->manufacturerFactory->createNew();

        $manufacturer->setName($name);
        $manufacturer->setParent(Service::createFolderByPath('/manufacturer'));
        $manufacturer->setKey(File::getValidFilename($name));
        $manufacturer->save();

        $this->sharedStorage->set('manufacturer', $manufacturer);
    }
}
