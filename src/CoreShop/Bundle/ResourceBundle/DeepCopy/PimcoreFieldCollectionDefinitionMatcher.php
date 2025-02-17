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

use DeepCopy\Matcher\Matcher;
use Pimcore\Model\DataObject\Fieldcollection;

class PimcoreFieldCollectionDefinitionMatcher implements Matcher
{
    public function __construct(
        private string $matchType,
    ) {
    }

    public function matches(mixed $object, mixed $property): bool
    {
        if ($object instanceof Fieldcollection\Data\AbstractData) {
            $collectionDef = Fieldcollection\Definition::getByKey($object->getType());

            if ($collectionDef instanceof Fieldcollection\Definition) {
                return $collectionDef->getFieldDefinition($property) instanceof $this->matchType;
            }
        }

        return false;
    }
}
