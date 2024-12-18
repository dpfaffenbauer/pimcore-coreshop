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

namespace CoreShop\Bundle\ResourceBundle\DeepCopy;

use DeepCopy\Filter\Filter;
use DeepCopy\Reflection\ReflectionHelper;
use Pimcore\Model\DataObject\Concrete;
use Pimcore\Model\DataObject\Fieldcollection;

class PimcoreFieldCollectionDefinitionReplaceFilter implements Filter
{
    public function __construct(protected \Closure $callback)
    {
    }

    public function apply($object, $property, $objectCopier)
    {
        if (!$object instanceof Fieldcollection\Data\AbstractData) {
            return;
        }

        $fieldDefinition = $object->getDefinition()->getFieldDefinition($property);

        if (!$fieldDefinition) {
            return;
        }

        $reflectionProperty = ReflectionHelper::getProperty($object, $property);
        $reflectionProperty->setAccessible(true);

        $value = ($this->callback)($object, $fieldDefinition, $property, $reflectionProperty->getValue($object));

        $reflectionProperty->setValue($object, $value);
    }
}
