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
use Pimcore\Model\DataObject\Fieldcollection;

trait AttributesAwareTrait
{
    public function getAttributes(): ?Fieldcollection
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setAttributes(?Fieldcollection $attributes): static
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function hasAttributes(OrderItemAttributeInterface $attribute)
    {
        $items = $this->getAttributes();

        if ($items instanceof Fieldcollection) {
            foreach ($items as $item) {
                if ($item instanceof OrderItemAttributeInterface) {
                    // This is on purpose, we only want one key per item
                    if ($item->getAttributeKey() === $attribute->getAttributeKey()) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    public function addAttribute(OrderItemAttributeInterface $attribute)
    {
        if (!$this->hasAttributes($attribute)) {
            $items = $this->getAttributes();

            if (!$items instanceof Fieldcollection) {
                $items = new Fieldcollection();
            }

            if ($attribute instanceof Fieldcollection\Data\AbstractData) {
                /**
                 * @psalm-suppress InvalidArgument
                 */
                $items->add($attribute);
            }

            $this->setAttributes($items);
        } else {
            $existingAttribute = $this->findAttribute($attribute->getAttributeKey());
            $existingAttribute?->setAttributeValue($attribute->getAttributeValue());
        }
    }

    public function removeAttribute(OrderItemAttributeInterface $attribute)
    {
        $items = $this->getAttributes();

        if ($items instanceof Fieldcollection) {
            for ($i = 0, $c = $items->getCount(); $i < $c; ++$i) {
                $arrayItem = $items->get($i);

                if ($arrayItem === $attribute) {
                    $items->remove($i);

                    break;
                }
            }

            $this->setAttributes($items);
        }
    }

    public function findAttribute(string $key): ?OrderItemAttributeInterface
    {
        $items = $this->getAttributes();

        if ($items instanceof Fieldcollection) {
            foreach ($items as $item) {
                if ($item instanceof OrderItemAttributeInterface) {
                    if ($item->getAttributeKey() === $key) {
                        return $item;
                    }
                }
            }
        }

        return null;
    }
}
