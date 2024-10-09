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

namespace CoreShop\Component\Order\Model;

use CoreShop\Component\Resource\Exception\ImplementedByPimcoreException;
use CoreShop\Component\Resource\Pimcore\Model\AbstractPimcoreFieldcollection;

abstract class OrderItemAttribute extends AbstractPimcoreFieldcollection implements OrderItemAttributeInterface
{
    public function getId(): ?int
    {
        return null;
    }

    public function getAttributeKey(): ?string
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setAttributeKey(?string $attributeKey)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function getAttributeValue()
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setAttributeValue($attributeValue)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }
}