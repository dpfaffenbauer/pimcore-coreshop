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
use Pimcore\Model\Element;

/**
 * @psalm-suppress InvalidReturnType, InvalidReturnStatement, InvalidArgument, MissingConstructor
 */
class DynamicDropdown extends DataObject\ClassDefinition\Data\ManyToOneRelation
{
    use DynamicDropdownTrait;

    public string $fieldtype = 'coreShopDynamicDropdown';

    public function getFieldType(): string
    {
        return $this->fieldtype;
    }

    public function getDataFromEditmode(mixed $data, ?DataObject\Concrete $object = null, array $params = []): null|\Pimcore\Model\Asset|DataObject\AbstractObject|\Pimcore\Model\Document
    {
        return Element\Service::getElementById('object', $data);
    }
}
