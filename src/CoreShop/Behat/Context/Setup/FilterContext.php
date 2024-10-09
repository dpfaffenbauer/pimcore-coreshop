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

namespace CoreShop\Behat\Context\Setup;

use Behat\Behat\Context\Context;
use Behat\Gherkin\Node\TableNode;
use CoreShop\Bundle\TestBundle\Service\SharedStorageInterface;
use CoreShop\Component\Core\Model\CategoryInterface  as CoreCategoryInterface;
use CoreShop\Component\Index\Model\FilterConditionInterface;
use CoreShop\Component\Index\Model\FilterInterface;
use CoreShop\Component\Index\Model\IndexInterface;
use CoreShop\Component\Product\Model\CategoryInterface;
use CoreShop\Component\Resource\Factory\FactoryInterface;
use Doctrine\Persistence\ObjectManager;

final class FilterContext implements Context
{
    public function __construct(
        private SharedStorageInterface $sharedStorage,
        private ObjectManager $objectManager,
        private FactoryInterface $filterFactory,
        private FactoryInterface $filterConditionFactory,
    ) {
    }

    /**
     * @Given /^the site has a filter "([^"]+)" for (index "[^"]+")$/
     */
    public function theSiteHasAFilterForIndex($name, IndexInterface $index): void
    {
        $this->createFilter($name, $index);
    }

    /**
     * @Given /the (filter) has following conditions:/
     */
    public function theFilterHasFollowingConditions(FilterInterface $filter, TableNode $table): void
    {
        $hash = $table->getHash();

        foreach ($hash as $row) {
            /**
             * @var FilterConditionInterface $condition
             */
            $condition = $this->filterConditionFactory->createNew();
            $condition->setType($row['type']);
            $condition->setConfiguration([
                'field' => $row['field'],
            ]);
            $condition->setLabel($row['label']);

            $filter->addCondition($condition);

            $this->objectManager->persist($condition);
        }

        $this->saveFilter($filter);
    }

    /**
     * @Given /the (filter) has a category condition without category$/
     * @Given /the (filter) has a category condition with (category "[^"]+")$/
     * @Given /the (filter) has a category condition with (category "[^"]+") and it (includes all subcategories)$/
     */
    public function theFilterHasACategoryConditionWithCategory(FilterInterface $filter, CategoryInterface $category = null, $includeAllChilds = ''): void
    {
        $condition = $this->filterConditionFactory->createNew();
        $condition->setType('category_select');
        $condition->setConfiguration([
            'preSelect' => $category ? $category->getId() : null,
            'includeSubCategories' => $includeAllChilds === 'includes all subcategories',
        ]);
        $condition->setLabel('Category');

        $filter->addCondition($condition);

        $this->objectManager->persist($condition);

        $this->saveFilter($filter);
    }

    /**
     * @Given /the (filter) has a condition with label "([^"]+)" and type "([^"]+)"$/
     * @Given /the (filter) has a condition with label "([^"]+)" and type "([^"]+)" and a preselect for "([^"]+)"$/
     * @Given /the (filter) has a condition with label "([^"]+)" and type "([^"]+)" on field "([^"]+)"$/
     */
    public function theFilterHasNameSelect(FilterInterface $filter, string $label, string $type, string $preselect = null, $field = null)
    {
        /**
         * @var FilterInterface $filter
         */
        $condition = $this->filterConditionFactory->createNew();
        $condition->setType($type);
        $condition->setLabel($label);

        $filter->setOrderDirection('asc');
        $filter->setOrderKey('o_id');

        $condition->setConfiguration([
            'field' => 'internalName',
            'preSelect' => $preselect,
            'type' => 'string',
            'fields' => ['internalName'],
            'name' => 'dummy',
            'searchTerm' => '',
            'pattern' => 'both',
            'concatenator' => 'OR',
        ]);

        $filter->addCondition($condition);

        $this->objectManager->persist($condition);

        $this->saveFilter($filter);
    }

    /**
     * @Given /the (filter) gets added to (category "[^"]+")$/
     */
    public function theFilterAddedToCategory(FilterInterface $filter, CoreCategoryInterface $category = null, $includeAllChilds = ''): void
    {
        /**
         * @var CoreCategoryInterface $category
         */
        $category->setFilter($filter);
        $category->save();
    }

    /**
     * @param string $name
     */
    private function createFilter($name, IndexInterface $index): void
    {
        /**
         * @var FilterInterface $filter
         * @var IndexInterface $index
         */
        $filter = $this->filterFactory->createNew();
        $filter->setName($name);
        $filter->setIndex($index);
        $this->saveFilter($filter);
    }

    private function saveFilter(FilterInterface $filter): void
    {
        /**
         * @var FilterInterface $filter
         */
        $this->objectManager->persist($filter);
        $this->objectManager->flush();

        $this->sharedStorage->set('filter', $filter);
    }
}
