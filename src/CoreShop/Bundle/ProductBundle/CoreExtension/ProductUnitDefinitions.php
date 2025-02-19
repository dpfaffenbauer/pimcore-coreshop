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

use CoreShop\Bundle\ProductBundle\Form\Type\Unit\ProductUnitDefinitionsType;
use CoreShop\Bundle\ResourceBundle\CoreExtension\TempEntityManagerTrait;
use CoreShop\Bundle\ResourceBundle\Doctrine\ORM\EntityMerger;
use CoreShop\Bundle\ResourceBundle\Pimcore\CacheMarshallerInterface;
use CoreShop\Component\Product\Model\ProductInterface;
use CoreShop\Component\Product\Model\ProductUnitDefinitionInterface;
use CoreShop\Component\Product\Model\ProductUnitDefinitionsInterface;
use CoreShop\Component\Product\Model\ProductUnitInterface;
use CoreShop\Component\Product\Repository\ProductUnitDefinitionsRepositoryInterface;
use CoreShop\Component\Resource\Factory\RepositoryFactoryInterface;
use Doctrine\Common\Collections\ArrayCollection;
use JMS\Serializer\DeserializationContext;
use JMS\Serializer\SerializationContext;
use Pimcore\Model;
use Pimcore\Model\DataObject\ClassDefinition\Data;
use Pimcore\Model\DataObject\Concrete;
use Pimcore\Model\DataObject\LazyLoadedFieldsInterface;
use Webmozart\Assert\Assert;

/**
 * @psalm-suppress InvalidReturnType, InvalidReturnStatement
 */
class ProductUnitDefinitions extends Data implements
    Data\CustomResourcePersistingInterface,
    Data\CustomVersionMarshalInterface,
    Data\CustomRecyclingMarshalInterface,
    Data\CustomDataCopyInterface,
    CacheMarshallerInterface,
    Data\PreGetDataInterface,
    Data\PreSetDataInterface
{
    use TempEntityManagerTrait;

    public string $fieldtype = 'coreShopProductUnitDefinitions';

    /**
     * @var int
     */
    public $width;

    /**
     * @var int
     */
    public $defaultValue;

    public string $phpdocType = 'array';

    public function getFieldType(): string
    {
        return $this->fieldtype;
    }

    public function getParameterTypeDeclaration(): ?string
    {
        return '?\\' . ProductUnitDefinitionsInterface::class;
    }

    public function getReturnTypeDeclaration(): ?string
    {
        return '?\\' . ProductUnitDefinitionsInterface::class;
    }

    public function getPhpdocInputType(): ?string
    {
        return '?\\' . ProductUnitDefinitionsInterface::class;
    }

    public function getPhpdocReturnType(): ?string
    {
        return '?\\' . ProductUnitDefinitionsInterface::class;
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
     * @return int
     */
    public function getDefaultValue()
    {
        if ($this->defaultValue !== null) {
            return $this->toNumeric($this->defaultValue);
        }

        return 0;
    }

    /**
     * @param int $defaultValue
     *
     * @return $this
     */
    public function setDefaultValue($defaultValue)
    {
        if (strlen((string) $defaultValue) > 0) {
            $this->defaultValue = $defaultValue;
        }

        return $this;
    }

    public function getQueryColumnType()
    {
        return false;
    }

    public function getColumnType()
    {
        return false;
    }

//    /**
//     * {@inheritdoc}
//     */
//    public function getGetterCode($class)
//    {
//        $key = $this->getName();
//        $code = '/**'."\n";
//        $code .= '* Get '.str_replace(['/**', '*/', '//'], '', $this->getName()).' - '.str_replace(['/**', '*/', '//'],
//                '', $this->getTitle())."\n";
//        $code .= '*'."\n";
//        $code .= '* @return null|'.$this->getPhpdocReturnType().'|\CoreShop\Component\Product\Model\ProductUnitDefinitionsInterface'."\n";
//        $code .= '*/'."\n";
//        $code .= 'public function get'.ucfirst($key).' () {'."\n";
//        $code .= "\t".'$this->'.$key.' = $this->getClass()->getFieldDefinition("'.$key.'")->preGetData($this);'."\n";
//        $code .= "\t".'$data = $this->'.$key.";\n";
//        $code .= "\t".'if(\Pimcore\Model\DataObject::doGetInheritedValues() && $this->getClass()->getFieldDefinition("'.$key.'")->isEmpty($data)) {'."\n";
//        $code .= "\t\t".'try {'."\n";
//        $code .= "\t\t\t".'return $this->getValueFromParent("'.$key.'");'."\n";
//        $code .= "\t\t".'} catch (InheritanceParentNotFoundException $e) {'."\n";
//        $code .= "\t\t\t".'// no data from parent available, continue ... '."\n";
//        $code .= "\t\t".'}'."\n";
//        $code .= "\t".'}'."\n";
//        $code .= "\t".'return $data;'."\n";
//        $code .= "}\n\n";
//
//        return $code;
//    }
//
//    public function getSetterCode($class)
//    {
//        $key = $this->getName();
//        $code = '/**'."\n";
//        $code .= '* Set '.str_replace(['/**', '*/', '//'], '', $key).' - '.str_replace(['/**', '*/', '//'], '',
//                $this->getTitle())."\n";
//        $code .= '*'."\n";
//        $code .= '* @param null|\CoreShop\Component\Product\Model\ProductUnitDefinitionsInterface $unitDefinitions'."\n";
//        $code .= '*'."\n";
//        $code .= '* @return static'."\n";
//        $code .= '*/'."\n";
//        $code .= 'public function set'.ucfirst($key).' (\CoreShop\Component\Product\Model\ProductUnitDefinitionsInterface $unitDefinitions = null) {'."\n";
//        $code .= "\t".'$this->'.$key.' = $unitDefinitions;'."\n";
//        $code .= "\t".'$this->'.$key.' = '.'$this->getClass()->getFieldDefinition("'.$key.'")->preSetData($this, $this->'.$key.');'."\n";
//        $code .= "\t".'return $this;'."\n";
//        $code .= "}\n\n";
//
//        return $code;
//    }

    public function createDataCopy(Concrete $object, mixed $data): mixed
    {
        if (!$data instanceof ProductUnitDefinitionsInterface) {
            return null;
        }

        $newData = clone $data;

        $reflectionClass = new \ReflectionClass($newData);

        $property = $reflectionClass->getProperty('unitDefinitions');
        $property->setAccessible(true);
        $property->setValue($newData, new ArrayCollection());

        $property = $reflectionClass->getProperty('id');
        $property->setAccessible(true);
        $property->setValue($newData, null);

        $property = $reflectionClass->getProperty('product');
        $property->setAccessible(true);
        $property->setValue($newData, null);

        $property = $reflectionClass->getProperty('defaultUnitDefinition');
        $property->setAccessible(true);
        $property->setValue($newData, null);

        $newDefaultDefinition = clone $data->getDefaultUnitDefinition();
        $reflectionClass = new \ReflectionClass($newDefaultDefinition);
        $property = $reflectionClass->getProperty('id');
        $property->setAccessible(true);
        $property->setValue($newDefaultDefinition, null);

        $newData->setDefaultUnitDefinition($newDefaultDefinition);

        foreach ($data->getAdditionalUnitDefinitions() as $unitDefinition) {
            $newUnitDefinition = clone $unitDefinition;

            $reflectionClass = new \ReflectionClass($newUnitDefinition);
            $property = $reflectionClass->getProperty('id');
            $property->setAccessible(true);
            $property->setValue($newUnitDefinition, null);

            $newUnitDefinition->setProductUnitDefinitions($newData);
            $newData->addAdditionalUnitDefinition($newUnitDefinition);
        }

        return $newData;
    }

    public function marshalVersion(Concrete $object, mixed $data): mixed
    {
        if (!$data instanceof ProductUnitDefinitionsInterface) {
            return null;
        }

        $context = SerializationContext::create();
        $context->setSerializeNull(false);
        $context->setGroups(['Version']);

        return $this->getSerializer()->toArray($data, $context);
    }

    public function unmarshalVersion(Concrete $object, mixed $data): mixed
    {
        if (!is_array($data)) {
            return null;
        }

        $tempEntityManager = $this->createTempEntityManager($this->getEntityManager());

        $context = DeserializationContext::create();
        $context->setGroups(['Version']);
        $context->setAttribute('em', $tempEntityManager);

        /**
         * @var ProductUnitDefinitionsInterface $entityData
         */
        $entityData = $this->getSerializer()->fromArray($data, $this->getProductUnitDefinitionsRepository()->getClassName(), $context);

        foreach ($entityData->getUnitDefinitions() as $unitDefinition) {
            $unitDefinition->setProductUnitDefinitions($entityData);
        }

        return $entityData;
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

    public function getDataFromResource(mixed $data, ?Concrete $object = null, array $params = []): mixed
    {
        return [];
    }

    public function preGetData(mixed $container, array $params = []): mixed
    {
        if (!$container instanceof Concrete) {
            return null;
        }

        $data = $container->getObjectVar($this->getName());

        if (!$container->isLazyKeyLoaded($this->getName())) {
            $data = $this->load($container, ['force' => true]);

            $setter = 'set' . ucfirst($this->getName());
            if (method_exists($container, $setter)) {
                $container->$setter($data);
            }
        }

        if ($data instanceof ProductUnitDefinitionsInterface && $container instanceof ProductInterface) {
            $data->setProduct($container);
        }

        return $data;
    }

    public function preSetData(mixed $container, mixed $data, array $params = []): mixed
    {
        if ($container instanceof LazyLoadedFieldsInterface) {
            $container->markLazyKeyAsLoaded($this->getName());
        }

        return $data;
    }

    public function load(Concrete|Model\DataObject\Objectbrick\Data\AbstractData|Model\DataObject\Fieldcollection\Data\AbstractData|Model\DataObject\Localizedfield $object, array $params = []): mixed
    {
        if (isset($params['force']) && $params['force']) {
            return $this->getProductUnitDefinitionsRepository()->findOneForProduct($object);
        }

        return null;
    }

    public function save(Concrete|Model\DataObject\Objectbrick\Data\AbstractData|Model\DataObject\Fieldcollection\Data\AbstractData|Model\DataObject\Localizedfield $object, array $params = []): void
    {
        if (!$object instanceof ProductInterface) {
            return;
        }

        if (!$object instanceof Model\DataObject\Concrete) {
            return;
        }

        $productUnitDefinitions = $object->getObjectVar($this->getName());

        if ($productUnitDefinitions instanceof ProductUnitDefinitionsInterface) {
            $entityMerger = new EntityMerger($this->getEntityManager());
            $entityMerger->merge($productUnitDefinitions);

            $productUnitDefinitions->setProduct($object);

            $this->getEntityManager()->persist($productUnitDefinitions);
            $this->getEntityManager()->flush();
        }
    }

    public function delete(Concrete|Model\DataObject\Objectbrick\Data\AbstractData|Model\DataObject\Fieldcollection\Data\AbstractData|Model\DataObject\Localizedfield $object, array $params = []): void
    {
        if (!$object instanceof ProductInterface) {
            return;
        }

        $productUnitDefinitions = $this->load($object, ['force' => true]);
        if ($productUnitDefinitions === null) {
            return;
        }

        $this->getEntityManager()->remove($productUnitDefinitions);
        $this->getEntityManager()->flush();
    }

    public function getDataForEditmode(mixed $data, ?Concrete $object = null, array $params = []): mixed
    {
        if (!$object instanceof ProductInterface) {
            return [];
        }

        if (!$data instanceof ProductUnitDefinitionsInterface) {
            return [];
        }

        $context = SerializationContext::create();
        $context->setSerializeNull(true);
        $context->setGroups(['Default', 'Detailed']);

        return $this->getSerializer()->toArray($data, $context);
    }

    public function getDataFromEditmode(mixed $data, ?Concrete $object = null, array $params = []): mixed
    {
        if (!is_array($data)) {
            return null;
        }

        $errors = [];
        $productUnitDefinitionsValues = null;

        $unitDefinitionsEntity = null;
        $unitDefinitionsId = isset($data['id']) && is_numeric($data['id']) ? $data['id'] : null;

        $tempEntityManager = $this->createTempEntityManager($this->getEntityManager());
        $tempStoreValuesRepository = $this->getProductUnitDefinitionsRepositoryFactory()->createNewRepository($tempEntityManager);

        Assert::isInstanceOf($tempStoreValuesRepository, ProductUnitDefinitionsRepositoryInterface::class);

        if ($unitDefinitionsId !== null) {
            $unitDefinitionsEntity = $tempStoreValuesRepository->findOneForProduct($object);
        }

        $form = $this->getFormFactory()->createNamed('', ProductUnitDefinitionsType::class, $unitDefinitionsEntity);

        $parsedData = $this->expandDotNotationKeys($data);
        $parsedData['product'] = $object->getId();

        $form->submit($parsedData);

        if ($form->isValid()) {
            $productUnitDefinitionsValues = $form->getData();
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

        return $productUnitDefinitionsValues;
    }

    public function getVersionPreview(mixed $data, ?Concrete $object = null, array $params = []): string
    {
        if (!$data instanceof \CoreShop\Component\Product\Model\ProductUnitDefinitionsInterface) {
            return '';
        }

        $defaultUnit = $data->getDefaultUnitDefinition() instanceof ProductUnitDefinitionInterface && $data->getDefaultUnitDefinition()->getUnit() instanceof ProductUnitInterface ? $data->getDefaultUnitDefinition()->getUnit()->getName() : '--';

        return sprintf(
            'Default Unit: %s, additional units: %d (%s)',
            $defaultUnit,
            $data->getAdditionalUnitDefinitions()->count(),
            implode(', ', array_map(static function (ProductUnitDefinitionInterface $unitDefinition) {
                return sprintf('%s: %s %s', $unitDefinition->getId(), $unitDefinition->getConversionRate(), $unitDefinition->getUnitName());
            }, $data->getUnitDefinitions()->toArray())),
        );
    }

    public function getForCsvExport(Concrete|Model\DataObject\Objectbrick\Data\AbstractData|Model\DataObject\Fieldcollection\Data\AbstractData|Model\DataObject\Localizedfield $object, array $params = []): string
    {
        $data = $this->getDataFromObjectParam($object, $params);

        if (!is_array($data) || empty($data)) {
            return '{}';
        }

        return json_encode($data);
    }

    public function isDiffChangeAllowed(Concrete $object, array $params = []): bool
    {
        return false;
    }

    public function getDiffDataForEditMode(mixed $data, ?Concrete $object = null, array $params = []): ?array
    {
        return [];
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
    private function getEntityManager()
    {
        return \Pimcore::getContainer()->get('doctrine.orm.entity_manager');
    }

    /**
     * @return \Symfony\Component\Form\FormFactoryInterface
     */
    private function getFormFactory()
    {
        return \Pimcore::getContainer()->get('coreshop.form.factory');
    }

    /**
     * @return ProductUnitDefinitionsRepositoryInterface
     */
    protected function getProductUnitDefinitionsRepository()
    {
        return \Pimcore::getContainer()->get('coreshop.repository.product_unit_definitions');
    }

    /**
     * @return RepositoryFactoryInterface
     */
    protected function getProductUnitDefinitionsRepositoryFactory()
    {
        return \Pimcore::getContainer()->get('coreshop.repository.factory.product_unit_definitions');
    }

    /**
     * @return \JMS\Serializer\Serializer
     */
    private function getSerializer()
    {
        return \Pimcore::getContainer()->get('jms_serializer');
    }
}
