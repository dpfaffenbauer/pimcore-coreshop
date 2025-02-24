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

use Pimcore\Model;

/**
 * @psalm-suppress InvalidReturnType, InvalidReturnStatement
 */
class SerializedData extends Model\DataObject\ClassDefinition\Data implements Model\DataObject\ClassDefinition\Data\ResourcePersistenceAwareInterface
{
    public string $fieldtype = 'coreShopSerializedData';

    public string $phpdocType = '';

    public function getFieldType(): string
    {
        return $this->fieldtype;
    }

    public function getParameterTypeDeclaration(): ?string
    {
        return null;
    }

    public function getReturnTypeDeclaration(): ?string
    {
        return null;
    }

    public function getPhpdocInputType(): ?string
    {
        return null;
    }

    public function getPhpdocReturnType(): ?string
    {
        return null;
    }

    public function isDiffChangeAllowed(Model\DataObject\Concrete $object, array $params = []): bool
    {
        return false;
    }

    public function getDiffDataForEditMode(mixed $data, ?Model\DataObject\Concrete $object = null, array $params = []): ?array
    {
        return [];
    }

    public function getDataForResource(mixed $data, ?Model\DataObject\Concrete $object = null, array $params = []): mixed
    {
        return serialize($data);
    }

    public function getDataFromResource(mixed $data, ?Model\DataObject\Concrete $object = null, array $params = []): mixed
    {
        return (is_string($data) ? unserialize($data) : $data) ?: null;
    }

    public function getDataForEditmode(mixed $data, ?Model\DataObject\Concrete $object = null, array $params = []): mixed
    {
        return $data;
    }

    public function getDataFromEditmode(mixed $data, ?Model\DataObject\Concrete $object = null, array $params = []): mixed
    {
        return $this->getDataFromResource($data, $object, $params);
    }

    public function getDataFromGridEditor($data, $object = null, $params = [])
    {
        return $data;
    }

    public function getQueryColumnType()
    {
        return null;
    }

    public function getColumnType(): string
    {
        return 'LONGBLOB';
    }

    public function checkValidity(mixed $data, bool $omitMandatoryCheck = false, array $params = []): void
    {
    }

    public function isEmpty(mixed $data): bool
    {
        return null === $data;
    }

    public function getDataForGrid(mixed $data, ?Model\DataObject\Concrete $object = null, array $params = [])
    {
        return $this->getDataFromResource($data, $object, $params);
    }

    public function getVersionPreview(mixed $data, ?Model\DataObject\Concrete $object = null, array $params = []): string
    {
        $data = $this->getDataFromResource($data, $object, $params);

        return is_array($data) ? serialize($data) : '--';
    }

    public function getForCsvExport(Model\DataObject\Concrete|Model\DataObject\Objectbrick\Data\AbstractData|Model\DataObject\Fieldcollection\Data\AbstractData|Model\DataObject\Localizedfield $object, array $params = []): string
    {
        return '';
    }

    public function getFilterCondition(mixed $value, string $operator, array $params = []): string
    {
        return '';
    }
}
