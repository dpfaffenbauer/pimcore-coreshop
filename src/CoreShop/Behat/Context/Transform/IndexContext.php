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
use CoreShop\Component\Index\Model\IndexInterface;
use CoreShop\Component\Resource\Repository\RepositoryInterface;
use Webmozart\Assert\Assert;

final class IndexContext implements Context
{
    public function __construct(
        private SharedStorageInterface $sharedStorage,
        private RepositoryInterface $indexRepository,
    ) {
    }

    /**
     * @Transform /^index "([^"]+)"$/
     */
    public function getIndexByName($name): IndexInterface
    {
        /**
         * @var IndexInterface[] $indexes
         */
        $indexes = $this->indexRepository->findBy(['name' => $name]);

        Assert::eq(
            count($indexes),
            1,
            sprintf('%d indices have been found with name "%s".', count($indexes), $name),
        );

        return reset($indexes);
    }

    /**
     * @Transform /^index$/
     */
    public function index(): IndexInterface
    {
        return $this->sharedStorage->get('index');
    }
}
