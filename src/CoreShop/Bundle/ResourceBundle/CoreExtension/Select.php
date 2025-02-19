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

namespace CoreShop\Bundle\ResourceBundle\CoreExtension;

use CoreShop\Bundle\ResourceBundle\Pimcore\CacheMarshallerInterface;
use CoreShop\Component\Resource\Model\ResourceInterface;
use CoreShop\Component\Resource\Repository\RepositoryInterface;
use Pimcore\Model;
use Pimcore\Model\DataObject\ClassDefinition\Data;
use Pimcore\Model\DataObject\Concrete;

/**
 * @psalm-suppress InvalidReturnType, InvalidReturnStatement
 */
abstract class Select extends Data implements
    Data\ResourcePersistenceAwareInterface,
    Data\QueryResourcePersistenceAwareInterface,
    Data\CustomRecyclingMarshalInterface,
    Data\CustomVersionMarshalInterface,
    CacheMarshallerInterface,
    Data\PreGetDataInterface,
    Data\PreSetDataInterface
{
    use Model\DataObject\Traits\SimpleComparisonTrait;

    /**
     * @var bool
     */
    public $allowEmpty = false;

    /**
     * @return RepositoryInterface
     */
    abstract protected function getRepository();

    abstract protected function getModel(): string;

    abstract protected function getInterface(): string;

    abstract protected function getNullable(): bool;

    public function getParameterTypeDeclaration(): ?string
    {
        return ($this->getNullable() ? '?' : '') . $this->getInterface();
    }

    public function getReturnTypeDeclaration(): ?string
    {
        return ($this->getNullable() ? '?' : '') . $this->getInterface();
    }

    public function getPhpdocInputType(): ?string
    {
        return ($this->getNullable() ? 'null|' : '') . $this->getInterface();
    }

    public function getPhpdocReturnType(): ?string
    {
        return ($this->getNullable() ? 'null|' : '') . $this->getInterface();
    }

    public function marshalVersion(Concrete $object, mixed $data): mixed
    {
        if ($data instanceof ResourceInterface) {
            return $data->getId();
        }

        return $data;
    }

    public function unmarshalVersion(Concrete $object, mixed $data): mixed
    {
        if (null === $data) {
            return null;
        }

        return $this->getRepository()->find($data);
    }

    public function marshalRecycleData(Concrete $object, mixed $data): mixed
    {
        return $this->marshalVersion($object, $data);
    }

    public function unmarshalRecycleData(Concrete $object, mixed $data): mixed
    {
        return $this->unmarshalVersion($object, $data);
    }

    public function isDiffChangeAllowed(Concrete $object, array $params = []): bool
    {
        return false;
    }

    public function getDiffDataForEditMode(mixed $data, ?Concrete $object = null, array $params = []): ?array
    {
        return [];
    }

    public function getQueryColumnType(): array|string
    {
        return 'int(11)';
    }

    public function getColumnType(): array|string
    {
        return 'int(11)';
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
        if (!$container instanceof Model\AbstractModel) {
            return null;
        }

        $data = $container->getObjectVar($this->getName());

        if ($data instanceof ResourceInterface) {
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

    /**
     * @param string $data
     * @param null   $object
     * @param array  $params
     *
     * @return int|string|null
     */
    public function getDataForResource(mixed $data, ?Concrete $object = null, array $params = []): mixed
    {
        if ($data !== null && method_exists($data, 'getId') && is_a($data, $this->getModel())) {
            return $data->getId();
        }

        return null;
    }

    /**
     * @param string $data
     * @param null   $object
     * @param array  $params
     *
     * @return ResourceInterface|object|null
     */
    public function getDataFromResource(mixed $data, ?Concrete $object = null, array $params = []): mixed
    {
        if ((int) $data > 0) {
            return $this->getRepository()->find($data);
        }

        return null;
    }

    /**
     * @param string $data
     * @param null   $object
     * @param array  $params
     *
     * @return int|null
     */
    public function getDataForQueryResource($data, $object = null, $params = []): mixed
    {
        if ($data !== null && method_exists($data, 'getId') && is_a($data, $this->getModel())) {
            return $data->getId();
        }

        return null;
    }

    public function getDataForEditmode($data, $object = null, $params = []): mixed
    {
        return $this->getDataForResource($data, $object, $params);
    }

    public function getDataFromEditmode($data, $object = null, $params = []): mixed
    {
        return $this->getDataFromResource($data, $object, $params);
    }

    public function isEmpty($data): bool
    {
        return !$data;
    }

    public function getDataForSearchIndex($object, $params = []): string
    {
        if ($object instanceof ResourceInterface) {
            return (string) $object->getId();
        }

        return parent::getDataForSearchIndex($object, $params);
    }

    public function isAllowEmpty()
    {
        return $this->allowEmpty;
    }

    public function setAllowEmpty($allowEmpty)
    {
        $this->allowEmpty = $allowEmpty;
    }

    public function marshalForCache(Concrete $concrete, mixed $data): mixed
    {
        return $this->marshalVersion($concrete, $data);
    }

    public function unmarshalForCache(Concrete $concrete, mixed $data): mixed
    {
        return $this->unmarshalVersion($concrete, $data);
    }
}
