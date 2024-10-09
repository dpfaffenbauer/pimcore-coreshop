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
use CoreShop\Component\Product\Model\ManufacturerInterface;
use CoreShop\Component\Resource\Repository\RepositoryInterface;
use Webmozart\Assert\Assert;

final class ManufacturerContext implements Context
{
    public function __construct(
        private SharedStorageInterface $sharedStorage,
        private RepositoryInterface $manufacturerRepository,
    ) {
    }

    /**
     * @Transform /^manufacturer "([^"]+)"$/
     */
    public function getManufacturerByName($name): ManufacturerInterface
    {
        /**
         * @var ManufacturerInterface[] $manufacturers
         */
        $manufacturers = $this->manufacturerRepository->findBy(['name' => $name]);

        Assert::eq(
            count($manufacturers),
            1,
            sprintf('%d Manufacturers has been found with name "%s".', count($manufacturers), $name),
        );

        return reset($manufacturers);
    }

    /**
     * @Transform /^manufacturer/
     */
    public function manufacturer()
    {
        return $this->sharedStorage->get('manufacturer');
    }
}
