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
use Pimcore\Model\Element\ElementInterface;

final class ElementContext implements Context
{
    public function __construct(
        protected SharedStorageInterface $sharedStorage,
    ) {
    }

    /**
     * @Transform /^element$/
     */
    public function element(): ElementInterface
    {
        if ($this->sharedStorage->has('document')) {
            return $this->sharedStorage->get('document');
        }

        if ($this->sharedStorage->has('object')) {
            return $this->sharedStorage->get('object');
        }

        if ($this->sharedStorage->has('asset')) {
            return $this->sharedStorage->get('asset');
        }

        throw new \Exception('No element found in shared storage');
    }
}
