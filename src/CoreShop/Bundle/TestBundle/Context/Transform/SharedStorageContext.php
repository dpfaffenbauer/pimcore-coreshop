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

namespace CoreShop\Bundle\TestBundle\Context\Transform;

use Behat\Behat\Context\Context;
use CoreShop\Bundle\TestBundle\Service\SharedStorageInterface;
use Pimcore\Model\DataObject\Concrete;

final class SharedStorageContext implements Context
{
    public function __construct(
        private SharedStorageInterface $sharedStorage,
    ) {
    }

    /**
     * @Transform /^(it|its|theirs|them|he)$/
     */
    public function getLatestResource(): mixed
    {
        return $this->sharedStorage->getLatestResource();
    }

    /**
     * @Transform /^(?:this|that|the) ([^"]+)$/
     */
    public function getResource(string $resource): mixed
    {
        return $this->sharedStorage->get(str_replace([' ', '-', '\''], '_', $resource));
    }

    /**
     * @Transform /^(object)$/
     */
    public function getLatestObject(): ?object
    {
        return $this->getLatestResource() instanceof Concrete ? $this->getLatestResource() : null;
    }

    /**
     * @Transform /^(copied-object)$/
     */
    public function getCopiedObject(): ?object
    {
        return $this->sharedStorage->get('copied-object');
    }
}
