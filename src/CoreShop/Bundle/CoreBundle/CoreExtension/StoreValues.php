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

namespace CoreShop\Bundle\CoreBundle\CoreExtension;

use CoreShop\Bundle\CoreBundle\Form\Type\Product\ProductStoreValuesType;
use CoreShop\Bundle\ResourceBundle\CoreExtension\TempEntityManagerTrait;
use CoreShop\Bundle\ResourceBundle\Doctrine\ORM\EntityMerger;
use CoreShop\Bundle\ResourceBundle\Pimcore\CacheMarshallerInterface;
use CoreShop\Component\Core\Model\ProductInterface;
use CoreShop\Component\Core\Model\ProductStoreValuesInterface;
use CoreShop\Component\Core\Model\StoreInterface;
use CoreShop\Component\Core\Repository\ProductStoreValuesRepositoryInterface;
use CoreShop\Component\Product\Model\ProductUnitDefinitionsInterface;
use CoreShop\Component\Resource\Factory\FactoryInterface;
use CoreShop\Component\Resource\Factory\RepositoryFactoryInterface;
use CoreShop\Component\Store\Repository\StoreRepositoryInterface;
use Doctrine\Common\Collections\ArrayCollection;
use JMS\Serializer\DeserializationContext;
use JMS\Serializer\SerializationContext;
use Pimcore\Model;
use Pimcore\Model\DataObject\Concrete;
use Pimcore\Model\DataObject\Localizedfield;
use Pimcore\Model\DataObject\Objectbrick\Data\AbstractData;
use Webmozart\Assert\Assert;

/**
 * @psalm-suppress InvalidReturnType, InvalidReturnStatement
 */
class StoreValues extends Model\DataObject\ClassDefinition\Data implements
    Model\DataObject\ClassDefinition\Data\CustomResourcePersistingInterface,
    Model\DataObject\ClassDefinition\Data\CustomVersionMarshalInterface,
    Model\DataObject\ClassDefinition\Data\CustomRecyclingMarshalInterface,
    Model\DataObject\ClassDefinition\Data\CustomDataCopyInterface,
    Model\DataObject\ClassDefinition\Data\PreGetDataInterface,
    Model\DataObject\ClassDefinition\Data\PreSetDataInterface,
    CacheMarshallerInterface
{
    use TempEntityManagerTrait;

    public string $fieldtype = 'coreShopStoreValues';

    /**
     * @var int
     */
    public $width;

    /**
     * @var string
     */
    public $phpdocType = 'array';

    /**
     * @var float
     */
    public $minValue;

    /**
     * @var float
     */
    public $maxValue;

    public function getFieldType(): string
    {
        return $this->fieldtype;
    }

    /**
     * @return int
     */
    public function getWidth()
    {
        return $this->width;
    }

    /**
     * @param int $width
     *
     * @return $this
     */
    public function setWidth($width)
    {
        $this->width = $this->getAsIntegerCast($width);

        return $this;
    }

    /**
     * @param float $maxValue
     */
    public function setMaxValue($maxValue)
    {
        $this->maxValue = $maxValue;
    }

    /**
     * @return float
     */
    public function getMaxValue()
    {
        return $this->maxValue;
    }

    /**
     * @param float $minValue
     */
    public function setMinValue($minValue)
    {
        $this->minValue = $minValue;
    }

    /**
     * @return float
     */
    public function getMinValue()
    {
        return $this->minValue;
    }

    public function getQueryColumnType()
    {
        return false;
    }

    public function getColumnType()
    {
        return false;
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

    public function getGetterCode($class): string
    {
        $key = $this->getName();
        $code = '/**' . "\n";
        $code .= '* Get ' . str_replace(['/**', '*/', '//'], '', $this->getName()) . ' - ' . str_replace(
            ['/**', '*/', '//'],
            '',
            $this->getTitle(),
        ) . "\n";
        $code .= '*' . "\n";
        $code .= '* @param \CoreShop\Component\Store\Model\StoreInterface $store' . "\n";
        $code .= '*' . "\n";
        $code .= '* @return null|\CoreShop\Component\Core\Model\ProductStoreValuesInterface' . "\n";
        $code .= '*/' . "\n";
        $code .= 'public function get' . ucfirst($key) . 'ForStore (\CoreShop\Component\Store\Model\StoreInterface $store): ?\CoreShop\Component\Core\Model\ProductStoreValuesInterface {' . "\n";
        $code .= "\t" . '$this->' . $key . ' = $this->getClass()->getFieldDefinition("' . $key . '")->preGetData($this);' . "\n";
        $code .= "\t" . '$data = $this->' . $key . ";\n\n";
        $code .= "\t" . 'if (\Pimcore\Model\DataObject::doGetInheritedValues() && $this->getClass()->getFieldDefinition("' . $key . '")->isEmpty($data)) {' . "\n";
        $code .= "\t\t" . 'try {' . "\n";
        $code .= "\t\t\t" . 'return $this->getValueFromParent("' . $key . 'ForStore", $store);' . "\n";
        $code .= "\t\t" . '} catch (InheritanceParentNotFoundException $e) {' . "\n";
        $code .= "\t\t\t" . '// no data from parent available, continue ... ' . "\n";
        $code .= "\t\t" . '}' . "\n";
        $code .= "\t" . '}' . "\n\n";
        $code .= "\t" . 'if (is_array($data)) {' . "\n";
        $code .= "\t\t" . '/** @var \CoreShop\Component\Core\Model\ProductStoreValuesInterface $storeValuesBlock */' . "\n";
        $code .= "\t\t" . 'foreach ($data as $storeValuesBlock) {' . "\n";
        $code .= "\t\t\t" . 'if ($storeValuesBlock->getStore()->getId() === $store->getId()) {' . "\n";
        $code .= "\t\t\t\t" . 'return $storeValuesBlock;' . "\n";
        $code .= "\t\t\t" . '}' . "\n";
        $code .= "\t\t" . '}' . "\n";
        $code .= "\t" . '}' . "\n";
        $code .= "\treturn null;" . "\n";
        $code .= "}\n\n";

        $code .= '/**' . "\n";
        $code .= '* Get All ' . str_replace(['/**', '*/', '//'], '', $this->getName()) . ' - ' . str_replace(
            ['/**', '*/', '//'],
            '',
            $this->getTitle(),
        ) . "\n";
        $code .= '* @return \CoreShop\Component\Core\Model\ProductStoreValuesInterface[]' . "\n";
        $code .= '*/' . "\n";
        $code .= 'public function get' . ucfirst($key) . ' (): array  {' . "\n";
        $code .= "\t" . '$this->' . $key . ' = $this->getClass()->getFieldDefinition("' . $key . '")->preGetData($this);' . "\n";
        $code .= "\t" . $this->getPreGetValueHookCode($key);
        $code .= "\t" . '$data = $this->getClass()->getFieldDefinition("' . $key . '")->preGetData($this);' . "\n\n";
        $code .= "\treturn " . '$data' . ";\n";
        $code .= "}\n\n";

        $code .= '/**' . "\n";
        $code .= '* Get ' . str_replace(['/**', '*/', '//'], '', $this->getName()) . ' - ' . str_replace(
            ['/**', '*/', '//'],
            '',
            $this->getTitle(),
        ) . "\n";
        $code .= '*' . "\n";
        $code .= '* @param string $type' . "\n";
        $code .= '* @param \CoreShop\Component\Store\Model\StoreInterface $store' . "\n";
        $code .= '*' . "\n";
        $code .= '* @return mixed' . "\n";
        $code .= '*/' . "\n";
        $code .= 'public function get' . ucfirst($key) . 'OfType (string $type, \CoreShop\Component\Store\Model\StoreInterface $store) {' . "\n";
        $code .= "\t" . '$storeValue = $this->get' . ucfirst($key) . 'ForStore($store);' . "\n";
        $code .= "\t" . 'if ($storeValue instanceof \CoreShop\Component\Core\Model\ProductStoreValuesInterface) {' . "\n";
        $code .= "\t\t" . '$getter = sprintf(\'get%s\', ucfirst($type));' . "\n";
        $code .= "\t\t" . 'if (method_exists($storeValue, $getter)) {' . "\n";
        $code .= "\t\t\t" . 'return $storeValue->$getter();' . "\n";
        $code .= "\t\t" . '}' . "\n";
        $code .= "\t" . '}' . "\n";
        $code .= "\t" . "\n";
        $code .= "\t" . 'return null;' . "\n";
        $code .= "}\n\n";

        return $code;
    }

    public function getSetterCode($class): string
    {
        $key = $this->getName();
        $code = '/**' . "\n";
        $code .= '* Set ' . str_replace(['/**', '*/', '//'], '', $key) . ' - ' . str_replace(
            ['/**', '*/', '//'],
            '',
            $this->getTitle(),
        ) . "\n";
        $code .= '*' . "\n";
        $code .= '* @param \CoreShop\Component\Core\Model\ProductStoreValuesInterface $' . $key . "\n";
        $code .= '* @param \CoreShop\Component\Store\Model\StoreInterface $store' . "\n";
        $code .= '*' . "\n";
        $code .= '* @return static' . "\n";
        $code .= '*/' . "\n";
        $code .= 'public function set' . ucfirst($key) . 'ForStore(\CoreShop\Component\Core\Model\ProductStoreValuesInterface $' . $key . ', \CoreShop\Component\Store\Model\StoreInterface $store): self {' . "\n";
        $code .= "\t" . '$this->' . $key . '[$store->getId()] = $' . $key . ';' . "\n";
        $code .= "\t" . '$this->' . $key . ' = ' . '$this->getClass()->getFieldDefinition("' . $key . '")->preSetData($this, $this->' . $key . ');' . "\n";
        $code .= "\t" . 'return $this;' . "\n";
        $code .= "}\n\n";

        $code .= '/**' . "\n";
        $code .= '* Set All ' . str_replace(['/**', '*/', '//'], '', $key) . ' - ' . str_replace(
            ['/**', '*/', '//'],
            '',
            $this->getTitle(),
        ) . "\n";
        $code .= '*' . "\n";
        $code .= '* @param \CoreShop\Component\Core\Model\ProductStoreValuesInterface[] $' . $key . "\n";
        $code .= '*' . "\n";
        $code .= '* @return static' . "\n";
        $code .= '*/' . "\n";
        $code .= 'public function set' . ucfirst($key) . ' (array $' . $key . '): self {' . "\n";
        $code .= "\t" . '$this->' . $key . ' = $' . $key . ';' . "\n";
        $code .= "\t" . '$this->' . $key . ' = ' . '$this->getClass()->getFieldDefinition("' . $key . '")->preSetData($this, $this->' . $key . ');' . "\n";
        $code .= "\t" . 'return $this;' . "\n";
        $code .= "}\n\n";

        $code .= '/**' . "\n";
        $code .= '* Set ' . str_replace(['/**', '*/', '//'], '', $key) . ' - ' . str_replace(
            ['/**', '*/', '//'],
            '',
            $this->getTitle(),
        ) . "\n";
        $code .= '*' . "\n";
        $code .= '* @param string $type' . "\n";
        $code .= '* @param mixed $value' . "\n";
        $code .= '* @param \CoreShop\Component\Store\Model\StoreInterface $store' . "\n";
        $code .= '*' . "\n";
        $code .= '* @return static' . "\n";
        $code .= '*/' . "\n";
        $code .= 'public function set' . ucfirst($key) . 'OfType (string $type, $value, \CoreShop\Component\Store\Model\StoreInterface $store): self {' . "\n";
        $code .= "\t" . '$storeValue = \CoreShop\Component\Pimcore\DataObject\InheritanceHelper::useInheritedValues(function() use ($store) {' . "\n";
        $code .= "\t\t" . 'return $this->getStoreValuesForStore($store);' . "\n";
        $code .= "\t" . '}, false);' . "\n";
        $code .= "\t" . "\n";
        $code .= "\t" . 'if (!$storeValue instanceof \CoreShop\Component\Core\Model\ProductStoreValuesInterface) {' . "\n";
        $code .= "\t\t" . '$storeValue = ' . '$this->getClass()->getFieldDefinition("' . $key . '")->createNew($this, $store);' . "\n";
        $code .= "\t" . '}' . "\n";
        $code .= "\t" . "\n";
        $code .= "\t" . '$setter = sprintf(\'set%s\', ucfirst($type));' . "\n";
        $code .= "\t" . "\n";
        $code .= "\t" . 'if (method_exists($storeValue, $setter)) {' . "\n";
        $code .= "\t\t" . '$storeValue->$setter($value);' . "\n";
        $code .= "\t" . '}' . "\n";
        $code .= "\t" . "\n";
        $code .= "\t" . '$this->set' . ucfirst($key) . 'ForStore($storeValue, $store);' . "\n";
        $code .= "\t" . "\n";
        $code .= "\t" . 'return $this;' . "\n";
        $code .= "}\n\n";

        return $code;
    }

    public function getDataFromResource(mixed $data, ?Concrete $object = null, array $params = []): mixed
    {
        return [];
    }

    public function preGetData(mixed $container, array $params = []): mixed
    {
        if (!$container instanceof Model\DataObject\Concrete) {
            return null;
        }

        $data = $container->getObjectVar($this->getName());
        $returnData = [];

        if (!$container->isLazyKeyLoaded($this->getName())) {
            $data = $this->load($container, ['force' => true]);

            $setter = 'set' . ucfirst($this->getName());
            if (method_exists($container, $setter)) {
                $container->$setter($data);
            }
        }

        if (!is_array($data)) {
            $data = [];
        }

        foreach ($data as $storeValue) {
            if (!$storeValue) {
                continue;
            }

            $returnData[$storeValue->getStore()->getId()] = $storeValue;
        }

        return $returnData;
    }

    public function preSetData(mixed $container, mixed $data, array $params = []): mixed
    {
        if ($container instanceof Model\DataObject\LazyLoadedFieldsInterface) {
            $container->markLazyKeyAsLoaded($this->getName());
        }

        return $data;
    }

    public function createDataCopy(Concrete $object, mixed $data): mixed
    {
        if (!is_array($data)) {
            return [];
        }

        if (!$object instanceof ProductInterface) {
            return [];
        }

        $newStoreValues = [];

        foreach ($data as $storeValue) {
            if (!$storeValue instanceof ProductStoreValuesInterface) {
                continue;
            }

            $newStoreValue = clone $storeValue;

            $reflectionClass = new \ReflectionClass($newStoreValue);
            $property = $reflectionClass->getProperty('id');
            $property->setAccessible(true);
            $property->setValue($newStoreValue, null);

            $property = $reflectionClass->getProperty('product');
            $property->setAccessible(true);
            $property->setValue($newStoreValue, null);

            $property = $reflectionClass->getProperty('productUnitDefinitionPrices');
            $property->setAccessible(true);
            $property->setValue($newStoreValue, new ArrayCollection());

            $newStoreValues[] = $newStoreValue;
        }

        return $newStoreValues;
    }

    public function load(Localizedfield|\Pimcore\Model\DataObject\Fieldcollection\Data\AbstractData|AbstractData|Concrete $object, array $params = []): mixed
    {
        if (isset($params['force']) && $params['force']) {
            return $this->getProductStoreValuesRepository()->findForObject($object, $this->getName());
        }

        return null;
    }

    public function save(Localizedfield|\Pimcore\Model\DataObject\Fieldcollection\Data\AbstractData|AbstractData|Concrete $object, array $params = []): void
    {
        if (!$object instanceof ProductInterface) {
            return;
        }

        if (!$object instanceof Model\DataObject\Concrete) {
            return;
        }

        $productStoreValues = $object->getObjectVar($this->getName());

        if (!is_array($productStoreValues)) {
            return;
        }

        $validStoreValues = [];
        $allStoreValues = [];
        $availableStoreValues = $this->load($object, ['force' => true]);

        /**
         * @var ProductStoreValuesInterface $productStoreValue
         */
        foreach ($productStoreValues as $productStoreValue) {
            if (!$productStoreValue->getStore()) {
                continue;
            }

            $entityMerger = new EntityMerger($this->getEntityManager());
            $entityMerger->merge($productStoreValue);

            if ($productStoreValue->getProduct() && $productStoreValue->getProduct()->getId() !== $object->getId()) {
                if ($productStoreValue->getId()) {
                    $this->getEntityManager()->getUnitOfWork()->computeChangeSet(
                        $this->getEntityManager()->getClassMetadata($this->getProductStoreValuesRepository()->getClassName()),
                        $productStoreValue,
                    );
                    $changeSet = $this->getEntityManager()->getUnitOfWork()->getEntityChangeSet($productStoreValue);

                    //This means that we inherited store values and also changed something, thus we break the inheritance and
                    //give the product its own record
                    if (count($changeSet) > 0) {
                        $productStoreValue = clone $productStoreValue;
                        $productStoreValue->setProduct($object);
                        $productStoreValue->setFieldName($this->getName());
                    }
                } else {
                    $productStoreValue->setProduct($object);
                    $productStoreValue->setFieldName($this->getName());
                }
            }

            if (null === $productStoreValue->getProduct()) {
                $productStoreValue->setProduct($object);
                $productStoreValue->setFieldName($this->getName());
            }

            $this->getEntityManager()->persist($productStoreValue);

            if ($productStoreValue->getId()) {
                $validStoreValues[] = $productStoreValue->getId();
            }

            $allStoreValues[] = $productStoreValue;
        }

        foreach ($availableStoreValues as $availableStoreValuesEntity) {
            if (!in_array($availableStoreValuesEntity->getId(), $validStoreValues, true)) {
                $this->getEntityManager()->remove($availableStoreValuesEntity);
            }
        }

        foreach ($allStoreValues as $storeEntity) {
            $this->getEntityManager()->persist($storeEntity);
        }

        $this->getEntityManager()->flush();

        //We have to set that here, values could change during persist due to copy or variant inheritance break
        $object->setObjectVar($this->getName(), $allStoreValues);
    }

    public function marshalVersion(Concrete $object, mixed $data): mixed
    {
        if (!is_array($data)) {
            return [];
        }

        $storeData = [];

        /** @var ProductStoreValuesInterface $storeValuesEntity */
        foreach ($data as $storeValuesEntity) {
            $context = SerializationContext::create();
            $context->setSerializeNull(false);
            $context->setGroups(['Version']);

            $serialized = $this->getSerializer()->toArray($storeValuesEntity, $context);

            $storeData[] = $this->clearRemovedUnitDefinitions($storeValuesEntity, $object, $serialized);
        }

        return $storeData;
    }

    public function unmarshalVersion(Concrete $object, mixed $data): mixed
    {
        if (!is_array($data)) {
            return null;
        }

        if (!$object instanceof ProductInterface) {
            return null;
        }

        $entities = [];

        $tempEntityManager = $this->createTempEntityManager($this->getEntityManager());

        foreach ($data as $storeData) {
            if (!is_array($storeData)) {
                continue;
            }

            $context = DeserializationContext::create();
            $context->setGroups(['Version']);
            $context->setAttribute('em', $tempEntityManager);

            $data = $this->getSerializer()->fromArray($storeData, $this->getProductStoreValuesRepository()->getClassName(), $context);

            if ($data instanceof ProductStoreValuesInterface) {
                foreach ($data->getProductUnitDefinitionPrices() as $price) {
                    $price->setProductStoreValues($data);
                }
            }

            $entities[] = $data;
        }

        return $entities;
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

    public function delete(Localizedfield|\Pimcore\Model\DataObject\Fieldcollection\Data\AbstractData|AbstractData|Concrete $object, array $params = []): void
    {
        if (!$object instanceof ProductInterface) {
            return;
        }

        $availableStoreValues = $this->load($object, ['force' => true]);
        foreach ($availableStoreValues as $availableStoreValuesEntity) {
            $this->getEntityManager()->remove($availableStoreValuesEntity);
        }

        $this->getEntityManager()->flush();
    }

    public function getDataForEditmode(mixed $data, ?Concrete $object = null, array $params = []): mixed
    {
        $storeData = [];
        $stores = $this->getStoreRepository()->findAll();

        if (!is_array($data)) {
            return $storeData;
        }

        if (!$object instanceof ProductInterface) {
            return $storeData;
        }

        $class = Model\DataObject\ClassDefinition::getById($object->getClassId());

        if (!$class instanceof Model\DataObject\ClassDefinition) {
            return $storeData;
        }

        $inheritable = $class->getAllowInherit() && $object->getParent() instanceof $object;

        foreach ($data as $storeValuesEntity) {
            $context = SerializationContext::create();
            $context->setSerializeNull(true);
            $context->setGroups($params['groups'] ?? ['Default', 'Detailed']);
            $values = $this->getSerializer()->toArray($storeValuesEntity, $context);

            $store = $storeValuesEntity->getStore();
            $currency = $store->getCurrency();

            $storeData[$storeValuesEntity->getStore()->getId()] = [
                'name' => $store->getName(),
                'currencySymbol' => $currency?->getSymbol(),
                'values' => $values,
                'inherited' => false,
                'inheritable' => $inheritable,
            ];
        }

        /**
         * @var StoreInterface $store
         */
        foreach ($stores as $store) {
            if (array_key_exists($store->getId(), $storeData)) {
                continue;
            }

            $currency = $store->getCurrency();

            //Fill missing stores with empty values
            $storeData[$store->getId()] = [
                'name' => $store->getName(),
                'currencySymbol' => $currency?->getSymbol() ?? '',
                'values' => ['price' => 0],
                'inheritable' => $inheritable,
            ];
        }

        return $storeData;
    }

    public function getDataFromEditmode($data, $object = null, $params = []): mixed
    {
        $errors = [];
        $storeValues = [];

        //We should never miss with the entity here, otherwise we have problems with versions
        $tempEntityManager = $this->createTempEntityManager($this->getEntityManager());
        $productStoreValuesRepository = $this->getProductStoreValuesRepositoryFactory()->createNewRepository($tempEntityManager);

        /**
         * @var ProductStoreValuesRepositoryInterface $productStoreValuesRepository
         */
        Assert::isInstanceOf($productStoreValuesRepository, ProductStoreValuesRepositoryInterface::class);

        foreach ($data as $storeId => $storeData) {
            if ($storeId === 0) {
                continue;
            }

            $storeValuesEntity = null;
            $storeValuesId = isset($storeData['id']) && is_numeric($storeData['id']) ? $storeData['id'] : null;

            if ($storeValuesId !== null) {
                $storeValuesEntity = $productStoreValuesRepository->find($storeValuesId);
            }

            if ($storeValuesEntity instanceof ProductStoreValuesInterface && $storeValuesEntity->getProduct() && $storeValuesEntity->getProduct()->getId() !== $object->getId()) {
                $storeValuesEntity = clone $storeValuesEntity;
                $storeValuesEntity->setProduct($object);
                $storeValuesEntity->setFieldName($this->getName());
            }

            $form = $this->getFormFactory()->createNamed('', ProductStoreValuesType::class, $storeValuesEntity);

            $parsedData = $this->expandDotNotationKeys($storeData);
            $parsedData['store'] = $storeId;

            $form->submit($parsedData);

            if ($form->isValid()) {
                $storeValues[] = $form->getData();
            } else {
                foreach ($form->getErrors(true, true) as $e) {
                    $errorMessageTemplate = $e->getMessageTemplate();
                    foreach ($e->getMessageParameters() as $key => $value) {
                        $errorMessageTemplate = str_replace($key, $value, $errorMessageTemplate);
                    }

                    $errors[] = sprintf('%s: %s', $e->getOrigin()->getConfig()->getName(), $errorMessageTemplate);
                }

                throw new \Exception(implode(\PHP_EOL, $errors));
            }
        }

        return $storeValues;
    }

    public function getVersionPreview($data, $object = null, $params = []): string
    {
        if (!is_array($data)) {
            return $data;
        }

        $preview = [];
        foreach ($data as $element) {
            $preview[] = (string) $element;
        }

        return implode(', ', $preview);
    }

    public function getForCsvExport($object, $params = []): string
    {
        $data = $this->getDataFromObjectParam($object, $params);

        if (!is_array($data) || empty($data)) {
            return '{}';
        }

        return json_encode($data);
    }

    /**
     * @param ProductInterface $object
     *
     * @return ProductStoreValuesInterface
     */
    public function createNew($object, StoreInterface $store)
    {
        /**
         * @var ProductStoreValuesInterface $newObject
         */
        $newObject = $this->getFactory()->createNew();
        $newObject->setStore($store);
        $newObject->setProduct($object);
        $newObject->setFieldName($this->getName());

        return $newObject;
    }

    public function isDiffChangeAllowed($object, $params = []): bool
    {
        return false;
    }

    public function getDiffDataForEditMode($data, $object = null, $params = []): ?array
    {
        return [];
    }

    public function isEmpty(mixed $data): bool
    {
        return null === $data || (is_array($data) && count($data) === 0);
    }

    /**
     * Removes already deleted ProductUnitDefinitions from the serialized StoreValues for Versions. Otherwise, these
     * Additional Unit Definitions would get restored on unmarshall
     *
     * @return array
     */
    protected function clearRemovedUnitDefinitions(
        ProductStoreValuesInterface $storeValuesEntity,
        Model\DataObject\Concrete $object,
        array $serialized,
    ) {
        $unitDefinitions = $object->getObjectVar('unitDefinitions');

        if (!$object instanceof ProductInterface || !$unitDefinitions) {
            return $serialized;
        }

        $isUnitDefinitionsSerialized = !$unitDefinitions instanceof ProductUnitDefinitionsInterface;

        $toRemove = [];

        foreach ($storeValuesEntity->getProductUnitDefinitionPrices() as $unitDefinitionPrice) {
            if (null === $unitDefinitionPrice->getUnitDefinition()) {
                continue;
            }

            if ($isUnitDefinitionsSerialized) {
                $found = false;

                if (!isset($unitDefinitions['unitDefinitions']) || !is_iterable($unitDefinitions['unitDefinitions'])) {
                    continue;
                }

                foreach ($unitDefinitions['unitDefinitions'] as $unitDefinition) {
                    if ($unitDefinition['id'] === $unitDefinitionPrice->getUnitDefinition()->getId()) {
                        $found = true;

                        break;
                    }
                }

                if (!$found) {
                    $toRemove[] = $unitDefinitionPrice->getUnitDefinition()->getId();
                }
            } else {
                if (!$object->getUnitDefinitions()->hasUnitDefinition($unitDefinitionPrice->getUnitDefinition())) {
                    $toRemove[] = $unitDefinitionPrice->getUnitDefinition()->getId();
                }
            }
        }

        foreach ($toRemove as $unitDefinition) {
            foreach ($serialized['productUnitDefinitionPrices'] as $index => $unitDefinitionPrice) {
                if (!isset($unitDefinitionPrice['unitDefinition'])) {
                    continue;
                }

                if ($unitDefinitionPrice['unitDefinition']['id'] === $unitDefinition) {
                    unset($serialized['productUnitDefinitionPrices'][$index]);
                }
            }
        }

        return $serialized;
    }

    /**
     * @param mixed $value
     */
    protected function toNumeric($value): float|int
    {
        if (!str_contains((string) $value, '.')) {
            return (int) $value;
        }

        return (float) $value;
    }

    /**
     * @return array
     */
    protected function expandDotNotationKeys(array $array)
    {
        $result = [];

        while (count($array)) {
            $value = reset($array);
            $key = (string) key($array);
            unset($array[$key]);

            if (str_contains($key, '.')) {
                [$base, $ext] = explode('.', $key, 2);
                if (!array_key_exists($base, $array)) {
                    $array[$base] = [];
                }
                $array[$base][$ext] = $value;
            } elseif (is_array($value)) {
                $result[$key] = $this->expandDotNotationKeys($value);
            } else {
                $result[$key] = $value;
            }
        }

        return $result;
    }

    /**
     * @return \Doctrine\ORM\EntityManager
     */
    protected function getEntityManager()
    {
        return \Pimcore::getContainer()->get('doctrine.orm.entity_manager');
    }

    /**
     * @return \Symfony\Component\Form\FormFactoryInterface
     */
    protected function getFormFactory()
    {
        return \Pimcore::getContainer()->get('coreshop.form.factory');
    }

    /**
     * @return StoreRepositoryInterface
     */
    protected function getStoreRepository()
    {
        return \Pimcore::getContainer()->get('coreshop.repository.store');
    }

    /**
     * @return FactoryInterface
     */
    protected function getFactory()
    {
        return \Pimcore::getContainer()->get('coreshop.factory.product_store_values');
    }

    /**
     * @return ProductStoreValuesRepositoryInterface
     */
    protected function getProductStoreValuesRepository()
    {
        return \Pimcore::getContainer()->get('coreshop.repository.product_store_values');
    }

    /**
     * @return RepositoryFactoryInterface
     */
    protected function getProductStoreValuesRepositoryFactory()
    {
        return \Pimcore::getContainer()->get('coreshop.repository.factory.product_store_values');
    }

    /**
     * @return \JMS\Serializer\Serializer
     */
    protected function getSerializer()
    {
        return \Pimcore::getContainer()->get('jms_serializer');
    }
}
