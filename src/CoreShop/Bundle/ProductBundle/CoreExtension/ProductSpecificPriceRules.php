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

use CoreShop\Bundle\ProductBundle\Form\Type\ProductSpecificPriceRuleType;
use CoreShop\Bundle\ResourceBundle\CoreExtension\TempEntityManagerTrait;
use CoreShop\Bundle\ResourceBundle\Doctrine\ORM\EntityMerger;
use CoreShop\Bundle\ResourceBundle\Pimcore\CacheMarshallerInterface;
use CoreShop\Component\Product\Model\ProductInterface;
use CoreShop\Component\Product\Model\ProductSpecificPriceRuleInterface;
use CoreShop\Component\Product\Repository\ProductSpecificPriceRuleRepositoryInterface;
use CoreShop\Component\Resource\Factory\RepositoryFactoryInterface;
use Doctrine\Common\Collections\ArrayCollection;
use JMS\Serializer\DeserializationContext;
use JMS\Serializer\SerializationContext;
use Pimcore\Model\DataObject\ClassDefinition\Data;
use Pimcore\Model\DataObject\Concrete;
use Pimcore\Model\DataObject\LazyLoadedFieldsInterface;
use Pimcore\Model\DataObject\Traits\SimpleComparisonTrait;
use Symfony\Component\Form\FormFactoryInterface;
use Webmozart\Assert\Assert;

/**
 * @psalm-suppress InvalidReturnType, InvalidReturnStatement
 */
class ProductSpecificPriceRules extends Data implements
    Data\CustomResourcePersistingInterface,
    Data\CustomVersionMarshalInterface,
    Data\CustomRecyclingMarshalInterface,
    Data\CustomDataCopyInterface,
    CacheMarshallerInterface,
    Data\EqualComparisonInterface,
    Data\PreGetDataInterface,
    Data\PreSetDataInterface
{
    use TempEntityManagerTrait;
    use SimpleComparisonTrait;

    public string $fieldtype = 'coreShopProductSpecificPriceRules';

    //private $formFactory;
    /**
     * @var int
     */
    public $height;

    public function getFieldType(): string
    {
        return $this->fieldtype;
    }

    public function getParameterTypeDeclaration(): ?string
    {
        return 'array';
    }

    public function getReturnTypeDeclaration(): ?string
    {
        return 'array';
    }

    public function getPhpdocInputType(): ?string
    {
        return 'array';
    }

    public function getPhpdocReturnType(): ?string
    {
        return 'array';
    }

    /**
     * @return ProductSpecificPriceRuleInterface[]
     */
    public function preGetData(mixed $object, array $params = []): mixed
    {
        Assert::isInstanceOf($object, ProductInterface::class);

        if (!$object instanceof Concrete) {
            return [];
        }

        $data = $object->getObjectVar($this->getName());

        if (!$object->isLazyKeyLoaded($this->getName())) {
            $data = $this->load($object, ['force' => true]);

            $setter = 'set' . ucfirst($this->getName());
            if (method_exists($object, $setter)) {
                $object->$setter($data);
            }
        }

        return $data ?? [];
    }

    public function createDataCopy(Concrete $object, mixed $data): mixed
    {
        if (!is_array($data)) {
            return [];
        }

        if (!$object instanceof ProductInterface) {
            return [];
        }

        $newPriceRules = [];

        foreach ($data as $priceRule) {
            if (!$priceRule instanceof ProductSpecificPriceRuleInterface) {
                continue;
            }

            $newPriceRule = clone $priceRule;

            $reflectionClass = new \ReflectionClass($newPriceRule);
            $property = $reflectionClass->getProperty('id');
            $property->setAccessible(true);
            $property->setValue($newPriceRule, null);

            $property = $reflectionClass->getProperty('product');
            $property->setAccessible(true);
            $property->setValue($newPriceRule, null);

            $property = $reflectionClass->getProperty('conditions');
            $property->setAccessible(true);
            $property->setValue($newPriceRule, new ArrayCollection());

            $property = $reflectionClass->getProperty('actions');
            $property->setAccessible(true);
            $property->setValue($newPriceRule, new ArrayCollection());

            foreach ($priceRule->getConditions() as $condition) {
                $newCondition = clone $condition;

                $reflectionClass = new \ReflectionClass($newCondition);
                $property = $reflectionClass->getProperty('id');
                $property->setAccessible(true);
                $property->setValue($newCondition, null);

                $newPriceRule->addCondition($newCondition);
            }

            foreach ($priceRule->getActions() as $action) {
                $newAction = clone $action;

                $reflectionClass = new \ReflectionClass($newAction);
                $property = $reflectionClass->getProperty('id');
                $property->setAccessible(true);
                $property->setValue($newAction, null);

                $newPriceRule->addAction($newAction);
            }

            $newPriceRules[] = $newPriceRule;
        }

        return $newPriceRules;
    }

    public function preSetData(mixed $container, mixed $data, array $params = []): mixed
    {
        if ($container instanceof LazyLoadedFieldsInterface) {
            $container->markLazyKeyAsLoaded($this->getName());
        }

        return $data;
    }

    public function isDiffChangeAllowed(Concrete $object, array $params = []): bool
    {
        return false;
    }

    public function getDiffDataForEditMode(mixed $data, ?Concrete $object = null, array $params = []): ?array
    {
        return [];
    }

    public function getDataFromResource(mixed $data, ?Concrete $object = null, array $params = [])
    {
        return [];
    }

    public function marshalVersion(Concrete $object, mixed $data): mixed
    {
        if (!is_array($data)) {
            return null;
        }

        $serialized = [];

        foreach ($data as $datum) {
            $context = SerializationContext::create();
            $context->setSerializeNull(true);
            $context->setGroups(['Version']);

            $serialized[] = $this->getSerializer()->toArray($datum, $context);
        }

        return $serialized;
    }

    public function unmarshalVersion(Concrete $object, mixed $data): mixed
    {
        if (!is_array($data)) {
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

            $data = $this->getSerializer()->fromArray($storeData, $this->getProductSpecificPriceRuleRepository()->getClassName(), $context);

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

    public function getVersionPreview(mixed $data, ?Concrete $object = null, array $params = []): string
    {
        if (!is_array($data)) {
            return 'empty';
        }

        return sprintf('Rules: %s', count($data));
    }

    public function getDataForEditmode(mixed $data, ?Concrete $object = null, array $params = []): array
    {
        $result = [
            'actions' => array_keys($this->getConfigActions()),
            'conditions' => array_keys($this->getConfigConditions()),
            'rules' => [],
        ];

        if ($object instanceof ProductInterface) {
            $prices = $this->load($object, ['force' => true]);

            $context = SerializationContext::create();
            $context->setSerializeNull(true);
            $context->setGroups(['Default', 'Detailed']);

            $serializedData = $this->getSerializer()->toArray($prices, $context);

            $result['rules'] = $serializedData;
        }

        return $result;
    }

    public function getDataFromEditmode(mixed $data, ?Concrete $object = null, array $params = []): array
    {
        $prices = [];
        $errors = [];

        $tempEntityManager = $this->createTempEntityManager($this->getEntityManager());
        $specificPriceRuleRepository = $this->getProductSpecificPriceRuleRepositoryFactory()->createNewRepository($tempEntityManager);

        if ($data && $object instanceof Concrete) {
            foreach ($data as $dataRow) {
                $ruleId = isset($dataRow['id']) && is_numeric($dataRow['id']) ? $dataRow['id'] : null;

                $storedRule = null;

                if ($ruleId !== null) {
                    $storedRule = $specificPriceRuleRepository->find($ruleId);
                }

                $form = $this->getFormFactory()->createNamed('', ProductSpecificPriceRuleType::class, $storedRule);

                $form->submit($dataRow);

                if ($form->isValid()) {
                    $formData = $form->getData();
                    $formData->setProduct($object->getId());

                    $prices[] = $formData;
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
        }

        return $prices;
    }

    public function save(Concrete|\Pimcore\Model\DataObject\Objectbrick\Data\AbstractData|\Pimcore\Model\DataObject\Fieldcollection\Data\AbstractData|\Pimcore\Model\DataObject\Localizedfield $object, array $params = []): void
    {
        if ($object instanceof ProductInterface) {
            $existingPriceRules = $object->getObjectVar($this->getName());

            $entityMerger = new EntityMerger($this->getEntityManager());

            $all = $this->load($object, ['force' => true]);
            $founds = [];

            if (is_array($existingPriceRules)) {
                foreach ($existingPriceRules as $price) {
                    if ($price instanceof ProductSpecificPriceRuleInterface) {
                        $entityMerger->merge($price);

                        $price->setProduct($object->getId());

                        $this->getEntityManager()->persist($price);

                        $founds[] = $price->getId();
                    }
                }
            }

            foreach ($all as $price) {
                if (!in_array($price->getId(), $founds)) {
                    $this->getEntityManager()->remove($price);
                }
            }

            $this->getEntityManager()->flush();
        }
    }

    public function load(Concrete|\Pimcore\Model\DataObject\Objectbrick\Data\AbstractData|\Pimcore\Model\DataObject\Fieldcollection\Data\AbstractData|\Pimcore\Model\DataObject\Localizedfield $object, array $params = []): mixed
    {
        if (isset($params['force']) && $params['force']) {
            return $this->getProductSpecificPriceRuleRepository()->findForProduct($object);
        }

        return null;
    }

    public function delete(Concrete|\Pimcore\Model\DataObject\Objectbrick\Data\AbstractData|\Pimcore\Model\DataObject\Fieldcollection\Data\AbstractData|\Pimcore\Model\DataObject\Localizedfield $object, array $params = []): void
    {
        if ($object instanceof ProductInterface) {
            $all = $this->load($object, ['force' => true]);

            foreach ($all as $price) {
                $this->getEntityManager()->remove($price);
            }

            $this->getEntityManager()->flush();
        }
    }

    public function getForCsvExport(Concrete|\Pimcore\Model\DataObject\Objectbrick\Data\AbstractData|\Pimcore\Model\DataObject\Fieldcollection\Data\AbstractData|\Pimcore\Model\DataObject\Localizedfield $object, array $params = []): string
    {
        return '';
    }

    /**
     * @return \Symfony\Component\DependencyInjection\ContainerInterface
     */
    private function getContainer()
    {
        return \Pimcore::getContainer();
    }

    /**
     * @return ProductSpecificPriceRuleRepositoryInterface
     */
    private function getProductSpecificPriceRuleRepository()
    {
        return $this->getContainer()->get('coreshop.repository.product_specific_price_rule');
    }

    /**
     * @return RepositoryFactoryInterface
     */
    private function getProductSpecificPriceRuleRepositoryFactory()
    {
        return $this->getContainer()->get('coreshop.repository.factory.product_specific_price_rule');
    }

    private function getFormFactory(): FormFactoryInterface
    {
        return $this->getContainer()->get('coreshop.form.factory');
    }

    /**
     * @return \Doctrine\ORM\EntityManager
     */
    private function getEntityManager()
    {
        return $this->getContainer()->get('doctrine.orm.entity_manager');
    }

    /**
     * @return \JMS\Serializer\Serializer
     */
    private function getSerializer()
    {
        return $this->getContainer()->get('jms_serializer');
    }

    /**
     * @return array
     */
    private function getConfigActions()
    {
        return $this->getContainer()->getParameter('coreshop.product_specific_price_rule.actions');
    }

    /**
     * @return array
     */
    private function getConfigConditions()
    {
        return $this->getContainer()->getParameter('coreshop.product_specific_price_rule.conditions');
    }
}
