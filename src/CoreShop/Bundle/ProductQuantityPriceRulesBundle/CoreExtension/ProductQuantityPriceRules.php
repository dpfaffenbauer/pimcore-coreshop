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

namespace CoreShop\Bundle\ProductQuantityPriceRulesBundle\CoreExtension;

use CoreShop\Bundle\ProductQuantityPriceRulesBundle\Event\ProductQuantityPriceRuleValidationEvent;
use CoreShop\Bundle\ProductQuantityPriceRulesBundle\Form\Type\ProductQuantityPriceRuleType;
use CoreShop\Bundle\ResourceBundle\CoreExtension\TempEntityManagerTrait;
use CoreShop\Bundle\ResourceBundle\Doctrine\ORM\EntityMerger;
use CoreShop\Bundle\ResourceBundle\Pimcore\CacheMarshallerInterface;
use CoreShop\Component\ProductQuantityPriceRules\Events;
use CoreShop\Component\ProductQuantityPriceRules\Model\ProductQuantityPriceRuleInterface;
use CoreShop\Component\ProductQuantityPriceRules\Model\QuantityRangeInterface;
use CoreShop\Component\ProductQuantityPriceRules\Model\QuantityRangePriceAwareInterface;
use CoreShop\Component\ProductQuantityPriceRules\Repository\ProductQuantityPriceRuleRepositoryInterface;
use CoreShop\Component\Resource\Factory\RepositoryFactoryInterface;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\EntityManager;
use JMS\Serializer\DeserializationContext;
use JMS\Serializer\SerializationContext;
use Pimcore\Model\DataObject\ClassDefinition\Data;
use Pimcore\Model\DataObject\Concrete;
use Symfony\Contracts\EventDispatcher\EventDispatcherInterface;
use Webmozart\Assert\Assert;

/**
 * @psalm-suppress InvalidReturnType, InvalidReturnStatement
 */
class ProductQuantityPriceRules extends Data implements
    Data\CustomResourcePersistingInterface,
    Data\CustomVersionMarshalInterface,
    Data\CustomRecyclingMarshalInterface,
    Data\CustomDataCopyInterface,
    CacheMarshallerInterface,
    Data\PreGetDataInterface,
    Data\PreSetDataInterface
{
    use TempEntityManagerTrait;

    public string $fieldtype = 'coreShopProductQuantityPriceRules';

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
     * @return ProductQuantityPriceRuleInterface[]
     */
    public function preGetData(mixed $object, array $params = []): mixed
    {
        Assert::isInstanceOf($object, QuantityRangePriceAwareInterface::class);

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

        return $data;
    }

    public function preSetData(mixed $object, mixed $data, array $params = []): mixed
    {
        $this->markAsLoaded($object);

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

    public function getDataFromResource(mixed $data, ?Concrete $object = null, array $params = []): mixed
    {
        return [];
    }

    public function createDataCopy(Concrete $object, mixed $data): mixed
    {
        if (!is_array($data)) {
            return [];
        }

        if (!$object instanceof QuantityRangePriceAwareInterface) {
            return [];
        }

        $newPriceRules = [];

        foreach ($data as $priceRule) {
            if (!$priceRule instanceof ProductQuantityPriceRuleInterface) {
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

            $property = $reflectionClass->getProperty('ranges');
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

            foreach ($priceRule->getRanges() as $range) {
                $newRange = clone $range;

                $reflectionClass = new \ReflectionClass($newRange);
                $property = $reflectionClass->getProperty('id');
                $property->setAccessible(true);
                $property->setValue($newRange, null);

                if ($reflectionClass->hasProperty('unitDefinition')) {
                    $property = $reflectionClass->getProperty('unitDefinition');
                    $property->setAccessible(true);
                    $property->setValue($newRange, null);
                }

                $newPriceRule->addRange($newRange);
            }

            $newPriceRules[] = $newPriceRule;
        }

        return $newPriceRules;
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

            $data = $this->getSerializer()->fromArray($storeData, $this->getProductQuantityPriceRuleRepository()->getClassName(), $context);

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

    public function getDataForEditmode(mixed $data, ?Concrete $object = null, array $params = []): mixed
    {
        $calculationBehaviourTypes = [];
        $pricingBehaviourTypes = [];

        /**
         * @var array $calculators
         */
        $calculators = $this->getContainer()->getParameter('coreshop.product_quantity_price_rules.calculators');

        /**
         * @var array $actions
         */
        $actions = $this->getContainer()->getParameter('coreshop.product_quantity_price_rules.actions');

        foreach ($calculators as $type) {
            $calculationBehaviourTypes[] = [$type, 'coreshop_product_quantity_price_rules_calculator_' . strtolower($type)];
        }

        foreach ($actions as $type) {
            $pricingBehaviourTypes[] = [$type, 'coreshop_product_quantity_price_rules_behaviour_' . strtolower($type)];
        }

        $serializedData = [
            'conditions' => array_keys($this->getConfigConditions()),
            'actions' => array_keys($this->getConfigActions()),
            'rules' => [],
            'stores' => [
                'calculationBehaviourTypes' => $calculationBehaviourTypes,
                'pricingBehaviourTypes' => $pricingBehaviourTypes,
            ],
        ];

        if ($object instanceof QuantityRangePriceAwareInterface) {
            $context = SerializationContext::create();
            $context->setSerializeNull(true);
            $context->setGroups(['Default', 'Detailed']);

            $serializedData['rules'] = $this->getSerializer()->toArray($data, $context);
        }

        return $serializedData;
    }

    public function getDataFromEditmode(mixed $data, ?Concrete $object = null, array $params = []): mixed
    {
        $prices = [];
        $errors = [];

        if (!is_array($data) || !$object instanceof Concrete) {
            return $prices;
        }

        $tempEntityManager = $this->createTempEntityManager($this->getEntityManager());
        $specificPriceRuleRepository = $this->getProductQuantityPriceRuleRepositoryFactory()->createNewRepository($tempEntityManager);

        $event = new ProductQuantityPriceRuleValidationEvent($object, $data);
        $this->getEventDispatcher()->dispatch($event, Events::RULES_DATA_FROM_EDITMODE_VALIDATION);

        foreach ($event->getData() as $rule) {
            $storedRule = null;
            $ruleData = null;

            $ruleId = isset($rule['id']) && is_numeric($rule['id']) ? $rule['id'] : null;

            if ($ruleId !== null) {
                $storedRule = $specificPriceRuleRepository->find($ruleId);
            }

            if ($storedRule instanceof ProductQuantityPriceRuleInterface) {
                $ruleData = $this->checkForRangeOrphans($tempEntityManager, $storedRule, $rule);
            }

            $form = $this->getFormFactory()->createNamed('', ProductQuantityPriceRuleType::class, $ruleData);

            $form->submit($rule);

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

        return $prices;
    }

    public function save(Concrete|\Pimcore\Model\DataObject\Objectbrick\Data\AbstractData|\Pimcore\Model\DataObject\Fieldcollection\Data\AbstractData|\Pimcore\Model\DataObject\Localizedfield $object, array $params = []): void
    {
        if (!$object instanceof QuantityRangePriceAwareInterface) {
            return;
        }

        if (!$object instanceof Concrete) {
            return;
        }

        $entityMerger = new EntityMerger($this->getEntityManager());
        $existingQuantityPriceRules = $object->getObjectVar($this->getName());
        $all = $this->load($object, ['force' => true]);
        $founds = [];

        if (is_array($existingQuantityPriceRules)) {
            foreach ($existingQuantityPriceRules as $quantityPriceRule) {
                if ($quantityPriceRule instanceof ProductQuantityPriceRuleInterface) {
                    $quantityPriceRule->setProduct($object->getId());

                    $entityMerger->merge($quantityPriceRule);
                    $this->getEntityManager()->persist($quantityPriceRule);

                    $founds[] = $quantityPriceRule->getId();
                }
            }
        }

        foreach ($all as $quantityPriceRule) {
            if (!in_array($quantityPriceRule->getId(), $founds)) {
                $this->getEntityManager()->remove($quantityPriceRule);
            }
        }

        $this->getEntityManager()->flush();
    }

    public function load(Concrete|\Pimcore\Model\DataObject\Objectbrick\Data\AbstractData|\Pimcore\Model\DataObject\Fieldcollection\Data\AbstractData|\Pimcore\Model\DataObject\Localizedfield $object, array $params = []): mixed
    {
        if (isset($params['force']) && $params['force']) {
            return $this->getProductQuantityPriceRuleRepository()->findForProduct($object);
        }

        return null;
    }

    public function delete(Concrete|\Pimcore\Model\DataObject\Objectbrick\Data\AbstractData|\Pimcore\Model\DataObject\Fieldcollection\Data\AbstractData|\Pimcore\Model\DataObject\Localizedfield $object, array $params = []): void
    {
        if ($object instanceof QuantityRangePriceAwareInterface) {
            $all = $this->load($object, ['force' => true]);

            foreach ($all as $quantityPriceRule) {
                $this->getEntityManager()->remove($quantityPriceRule);
            }

            $this->getEntityManager()->flush();
        }
    }

    /**
     * @param Concrete $object
     */
    protected function markAsLoaded($object)
    {
        if (!$object instanceof Concrete) {
            return;
        }

        $object->markLazyKeyAsLoaded($this->getName());
    }

    /**
     * @return ProductQuantityPriceRuleInterface
     *
     * @throws \Doctrine\ORM\ORMException
     */
    protected function checkForRangeOrphans(EntityManager $entityManager, ProductQuantityPriceRuleInterface $storedRule, array $currentRule)
    {
        if ($storedRule->getRanges()->isEmpty()) {
            return $storedRule;
        }

        $currentRanges = isset($currentRule['ranges']) && is_array($currentRule['ranges']) ? $currentRule['ranges'] : [];

        $keepIds = [];
        foreach ($currentRanges as $currentRange) {
            if (isset($currentRange['id']) && $currentRange['id'] !== null) {
                $keepIds[] = (int) $currentRange['id'];
            }
        }

        $invalidatedRanges = $storedRule->getRanges()->filter(function (QuantityRangeInterface $priceRange) use ($keepIds) {
            return !in_array($priceRange->getId(), $keepIds);
        });

        if ($invalidatedRanges->isEmpty()) {
            return $storedRule;
        }

        foreach ($invalidatedRanges as $invalidatedRange) {
            $entityManager->remove($invalidatedRange);
            $storedRule->removeRange($invalidatedRange);
        }

        $entityManager->flush();
        $entityManager->refresh($storedRule);

        return $storedRule;
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
     * @return EventDispatcherInterface
     */
    private function getEventDispatcher()
    {
        return \Pimcore::getContainer()->get('event_dispatcher');
    }

    /**
     * @return ProductQuantityPriceRuleRepositoryInterface
     */
    private function getProductQuantityPriceRuleRepository()
    {
        return $this->getContainer()->get('coreshop.repository.product_quantity_price_rule');
    }

    /**
     * @return RepositoryFactoryInterface
     */
    private function getProductQuantityPriceRuleRepositoryFactory()
    {
        return $this->getContainer()->get('coreshop.repository.factory.product_quantity_price_rule');
    }

    /**
     * @return \Symfony\Component\Form\FormFactoryInterface
     */
    private function getFormFactory()
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
    private function getConfigConditions()
    {
        return $this->getContainer()->getParameter('coreshop.product_quantity_price_rules.conditions');
    }

    /**
     * @return array
     */
    private function getConfigActions()
    {
        return $this->getContainer()->getParameter('coreshop.product_quantity_price_rules.actions');
    }
}
