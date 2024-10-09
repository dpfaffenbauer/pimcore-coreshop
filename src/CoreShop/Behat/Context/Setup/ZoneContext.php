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
use CoreShop\Component\Address\Model\ZoneInterface;
use CoreShop\Component\Resource\Factory\FactoryInterface;
use CoreShop\Component\Resource\Repository\RepositoryInterface;
use Doctrine\Persistence\ObjectManager;

final class ZoneContext implements Context
{
    public function __construct(
        private SharedStorageInterface $sharedStorage,
        private ObjectManager $objectManager,
        private FactoryInterface $zoneFactory,
        private RepositoryInterface $zoneRepository,
    ) {
    }

    /**
     * @Given /^the site has a zone "([^"]+)"$/
     */
    public function theSiteHasAZone($name): void
    {
        $this->createZone($name);
    }

    /**
     * @param string $name
     */
    private function createZone($name): void
    {
        $zone = $this->zoneRepository->findBy(['name' => $name]);

        if (!$zone) {
            /**
             * @var ZoneInterface $zone
             */
            $zone = $this->zoneFactory->createNew();
            $zone->setName($name);

            $this->saveZone($zone);
        }
    }

    private function saveZone(ZoneInterface $zone): void
    {
        $this->objectManager->persist($zone);
        $this->objectManager->flush();

        $this->sharedStorage->set('zone', $zone);
    }
}
