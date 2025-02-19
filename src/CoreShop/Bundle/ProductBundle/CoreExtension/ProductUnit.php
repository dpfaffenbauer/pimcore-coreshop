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

namespace CoreShop\Bundle\ProductBundle\CoreExtension;

use CoreShop\Bundle\ResourceBundle\CoreExtension\Select;
use CoreShop\Component\Product\Model\ProductUnitInterface;
use Pimcore\Model\DataObject\Concrete;

/**
 * @psalm-suppress InvalidReturnType, InvalidReturnStatement
 */
class ProductUnit extends Select
{
    public string $fieldtype = 'coreShopProductUnit';

    public function getFieldType(): string
    {
        return $this->fieldtype;
    }

    public function isDiffChangeAllowed(Concrete $object, array $params = []): bool
    {
        return false;
    }

    public function getDiffDataForEditMode(mixed $data, ?Concrete $object = null, array $params = []): ?array
    {
        return [];
    }

    protected function getRepository()
    {
        return \Pimcore::getContainer()->get('coreshop.repository.product_unit');
    }

    protected function getModel(): string
    {
        return \Pimcore::getContainer()->getParameter('coreshop.model.product_unit.class');
    }

    protected function getInterface(): string
    {
        return '\\' . ProductUnitInterface::class;
    }

    protected function getNullable(): bool
    {
        return true;
    }
}
