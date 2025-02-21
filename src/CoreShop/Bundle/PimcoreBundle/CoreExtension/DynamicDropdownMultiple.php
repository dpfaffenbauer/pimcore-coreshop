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

namespace CoreShop\Bundle\PimcoreBundle\CoreExtension;

use Pimcore\Model\DataObject;
use Pimcore\Model\DataObject\ClassDefinition\Data\ManyToManyObjectRelation;

/**
 * @psalm-suppress InvalidReturnType, InvalidReturnStatement, MissingConstructor
 */
class DynamicDropdownMultiple extends ManyToManyObjectRelation
{
    use DynamicDropdownTrait;

    public string $fieldtype = 'coreShopDynamicDropdownMultiple';

    public function getFieldType(): string
    {
        return $this->fieldtype;
    }

    public function getDataFromEditmode(mixed $data, ?DataObject\Concrete $object = null, array $params = []): ?array
    {
        //if not set, return null
        if ($data === null || $data === false) {
            return null;
        }

        $objects = [];
        if (is_array($data) && count($data) > 0) {
            foreach ($data as $id) {
                $o = DataObject::getById($id);
                if ($o) {
                    $objects[] = $o;
                }
            }
        }
        //must return array if data shall be set
        return $objects;
    }
}
