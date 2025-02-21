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

use CoreShop\Bundle\ResourceBundle\Pimcore\CacheMarshallerInterface;
use CoreShop\Component\Product\Model\ProductInterface;
use CoreShop\Component\Product\Model\ProductUnitDefinitionInterface;
use CoreShop\Component\Product\Model\ProductUnitDefinitionsInterface;
use CoreShop\Component\Resource\Model\ResourceInterface;
use CoreShop\Component\Resource\Repository\RepositoryInterface;
use Pimcore\Model\DataObject\ClassDefinition\Data;
use Pimcore\Model\DataObject\Concrete;

/**
 * @psalm-suppress InvalidReturnType, InvalidReturnStatement
 */
class ProductUnitDefinition extends Data implements
    Data\ResourcePersistenceAwareInterface,
    Data\QueryResourcePersistenceAwareInterface,
    Data\CustomVersionMarshalInterface,
    CacheMarshallerInterface,
    Data\PreGetDataInterface,
    Data\PreSetDataInterface
{
    public string $fieldtype = 'coreShopProductUnitDefinition';

    public string $phpdocType = '\\' . ProductUnitDefinitionInterface::class;

    public bool $allowEmpty = false;

    public function getFieldType(): string
    {
        return $this->fieldtype;
    }

    public function getParameterTypeDeclaration(): ?string
    {
        return '?\\' . ProductUnitDefinitionInterface::class;
    }

    public function getReturnTypeDeclaration(): ?string
    {
        return '?\\' . ProductUnitDefinitionInterface::class;
    }

    public function getPhpdocInputType(): ?string
    {
        return '\\' . ProductUnitDefinitionInterface::class;
    }

    public function getPhpdocReturnType(): ?string
    {
        return '\\' . ProductUnitDefinitionInterface::class;
    }

    public function getQueryColumnType(): string|array
    {
        return 'int(11)';
    }

    public function getColumnType(): string|array
    {
        return 'int(11)';
    }

    public function isDiffChangeAllowed(Concrete $object, array $params = []): bool
    {
        return false;
    }

    public function getDiffDataForEditMode(mixed $data, ?Concrete $object = null, array $params = []): ?array
    {
        return [];
    }

    public function preSetData(mixed $container, mixed $data, array $params = []): mixed
    {
        if (is_int($data) || is_string($data)) {
            if ((int) $data) {
                return $this->getDataFromResource($data, $container, $params);
            }
        }

        return $data;
    }

    public function preGetData(mixed $container, array $params = []): mixed
    {
        if (!$container instanceof Concrete) {
            return null;
        }

        $data = $container->getObjectVar($this->getName());

        if ($data instanceof ResourceInterface && $data->getId()) {
            //Reload from Database, but only if available
            $tmpData = $this->getRepository()->find($data->getId());

            if ($tmpData instanceof ResourceInterface) {
                //Dirty Fix, Pimcore sometimes calls properties without getter
                //This could cause Problems with translations, therefore, we need to set
                //the value here
                $container->setValue($this->getName(), $tmpData);

                return $tmpData;
            }
        }

        return $data;
    }

    public function getDataForResource(mixed $data, ?Concrete $object = null, array $params = []): mixed
    {
        if ($data instanceof ProductUnitDefinitionInterface) {
            return $data->getId();
        }

        return null;
    }

    public function getDataFromResource(mixed $data, ?Concrete $object = null, array $params = []): mixed
    {
        if ((int) $data > 0) {
            return $this->getRepository()->find($data);
        }

        return null;
    }

    public function getDataForQueryResource(mixed $data, ?Concrete $object = null, array $params = []): mixed
    {
        if ($data instanceof ProductUnitDefinitionInterface) {
            return $data->getId();
        }

        return null;
    }

    public function createDataCopy(Concrete $object, mixed $data)
    {
        if (!$data instanceof ProductUnitDefinitionsInterface) {
            return null;
        }

        if (!$object instanceof ProductInterface) {
            return null;
        }

        $data->setProduct($object);

        $reflectionClass = new \ReflectionClass($data);
        $property = $reflectionClass->getProperty('id');
        $property->setAccessible(true);
        $property->setValue($data, null);

        foreach ($data->getUnitDefinitions() as $unitDefinition) {
            $reflectionClass = new \ReflectionClass($unitDefinition);
            $property = $reflectionClass->getProperty('id');
            $property->setAccessible(true);
            $property->setValue($unitDefinition, null);
        }

        return $data;
    }

    public function marshalVersion(Concrete $object, mixed $data): mixed
    {
        return $this->getDataForEditmode($data, $object);
    }

    public function unmarshalVersion(Concrete $object, mixed $data): mixed
    {
        if (is_array($data) && isset($data['id'])) {
            return $this->getRepository()->find($data['id']);
        }

        return null;
    }

    public function marshalRecycleData(Concrete $object, mixed $data): mixed
    {
        return $this->marshalVersion($object, $data);
    }

    public function unmarshalRecycleData(Concrete $object, mixed $data): mixed
    {
        return $this->unmarshalVersion($object, $data);
    }

    public function marshalForCache(Concrete $concrete, mixed $data): mixed
    {
        return $this->marshalVersion($concrete, $data);
    }

    public function unmarshalForCache(Concrete $concrete, mixed $data): mixed
    {
        return $this->unmarshalVersion($concrete, $data);
    }

    public function getDataFromEditmode(mixed $data, ?Concrete $object = null, array $params = []): mixed
    {
        return $this->getDataFromResource($data, $object, $params);
    }

    public function getDataForEditmode(mixed $data, ?Concrete $object = null, array $params = []): mixed
    {
        $parsedData = [
            'id' => null,
            'conversationRate' => null,
            'precision' => null,
            'unitName' => null,
        ];

        if ($data instanceof ProductUnitDefinitionInterface) {
            $parsedData = [
                'id' => $data->getId(),
                'conversationRate' => $data->getConversionRate(),
                'precision' => $data->getPrecision(),
                'unitName' => $data->getUnit()->getName(),
                'fullLabel' => $data->getUnit()->getFullLabel(),
                'fullPluralLabel' => $data->getUnit()->getFullPluralLabel(),
                'shortLabel' => $data->getUnit()->getShortLabel(),
                'shortPluralLabel' => $data->getUnit()->getShortPluralLabel(),
            ];
        }

        return $parsedData;
    }

    public function isEmpty(mixed $data): bool
    {
        return !$data instanceof ProductUnitDefinitionInterface;
    }

    public function getVersionPreview(mixed $data, ?Concrete $object = null, array $params = []): string
    {
        return (string) $data;
    }

    public function getForCsvExport(Concrete|\Pimcore\Model\DataObject\Objectbrick\Data\AbstractData|\Pimcore\Model\DataObject\Fieldcollection\Data\AbstractData|\Pimcore\Model\DataObject\Localizedfield $object, array $params = []): string
    {
        return '';
    }

    /**
     * @return RepositoryInterface
     */
    protected function getRepository()
    {
        return \Pimcore::getContainer()->get('coreshop.repository.product_unit_definition');
    }
}
