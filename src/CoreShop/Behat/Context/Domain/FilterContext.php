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

namespace CoreShop\Behat\Context\Domain;

use Behat\Behat\Context\Context;
use Behat\Gherkin\Node\TableNode;
use CoreShop\Component\Index\Factory\FilteredListingFactoryInterface;
use CoreShop\Component\Index\Filter\FilterProcessorInterface;
use CoreShop\Component\Index\Listing\ListingInterface;
use CoreShop\Component\Index\Listing\OrderAwareListingInterface;
use CoreShop\Component\Index\Listing\RawResultListingInterface;
use CoreShop\Component\Index\Model\FilterConditionInterface;
use CoreShop\Component\Index\Model\FilterInterface;
use CoreShop\Component\Index\Model\IndexableInterface;
use CoreShop\Component\Index\Order\SimpleOrder;
use CoreShop\Component\Resource\Model\ResourceInterface;
use CoreShop\Component\Resource\Repository\RepositoryInterface;
use Symfony\Component\HttpFoundation\ParameterBag;
use Webmozart\Assert\Assert;

final class FilterContext implements Context
{
    public function __construct(
        private RepositoryInterface $filterRepository,
        private FilteredListingFactoryInterface $filterListFactory,
        private FilterProcessorInterface $filterProcessor,
    ) {
    }

    /**
     * @Then /^there should be a filter with name "([^"]+)"$/
     */
    public function thereShouldBeAFilter($name): void
    {
        $filters = $this->filterRepository->findBy(['name' => $name]);

        Assert::eq(
            count($filters),
            1,
            sprintf('%d Filters have been found with name "%s".', count($filters), $name),
        );
    }

    /**
     * @Then /^the (filter) should have (\d+) conditions$/
     */
    public function theFilterShouldHaveXConditions(FilterInterface $filter, $count): void
    {
        Assert::eq(
            count($filter->getConditions()),
            $count,
            sprintf('%d Filters have been found with name "%s".', count($filter->getConditions()), $filter->getName()),
        );
    }

    /**
     * @Then /the (filter) should have the values for (select) condition "([^"]+)":/
     * @Then /the (filter) should have the values for (multiselect) condition "([^"]+)":/
     */
    public function theFilterShouldHaveFollowingValuesForSelect(
        FilterInterface $filter,
        $conditionType,
        $field,
        TableNode $values,
    ): void {
        $conditions = $this->prepareFilter($filter);
        $shouldHaveConditions = [];

        foreach ($values as $value) {
            $shouldHaveConditions[] = $value['value'];
        }

        $filtered = array_filter(
            $filter->getConditions()->toArray(),
            static function (FilterConditionInterface $condition) use ($field) {
                return $condition->getConfiguration()['field'] === $field;
            },
        );

        $field = reset($filtered);

        Assert::isInstanceOf($field, FilterConditionInterface::class);
        Assert::eq($field->getType(), $conditionType);

        Assert::eq(count($conditions[$field->getId()]['values']), count($shouldHaveConditions));

        $values = array_map(
            function ($value) {
                return $value['value'];
            },
            $conditions[$field->getId()]['values'],
        );

        $diff = array_diff($shouldHaveConditions, $values);

        Assert::count($diff, 0);
    }

    /**
     * @Then /the (filter) should have (\d+) values with count (\d+) for (relational_select) condition "([^"]+)"/
     * @Then /the (filter) should have (\d+) values with count (\d+) for (relational_multiselect) condition "([^"]+)"/
     */
    public function theFilterShouldHaveXValuesWithCountXForTypeAndField(
        FilterInterface $filter,
        $countOfValues,
        $countPerValue,
        $conditionType,
        $field,
    ): void {
        $conditions = $this->prepareFilter($filter);

        $filtered = array_filter(
            $filter->getConditions()->toArray(),
            static function (FilterConditionInterface $condition) use ($field) {
                return $condition->getConfiguration()['field'] === $field;
            },
        );

        $field = reset($filtered);

        Assert::isInstanceOf($field, FilterConditionInterface::class);
        Assert::eq($field->getType(), $conditionType);

        Assert::eq(count($conditions[$field->getId()]['values']), $countOfValues);

        $values = array_map(
            function ($value) {
                return $value['count'];
            },
            $conditions[$field->getId()]['values'],
        );

        Assert::eq($values[0], $countPerValue);
    }

    /**
     * @Then /the (filter) should have (\d+) item(?:|s)$/
     */
    public function theFilterShouldHaveXItemsForCategoryCondition(FilterInterface $filter, $countOfValues): void
    {
        $listing = $this->getFilterListing($filter);

        Assert::eq($listing->count(), $countOfValues);
    }

    /**
     * @Then /the (filter) should have (\d+) item(?:|s) with params:$/
     */
    public function theFilterShouldHaveXItemsForCategoryConditionWithParams(FilterInterface $filter, $countOfValues, TableNode $node): void
    {
        $params = [];

        foreach ($node as $row) {
            $params[$row['key']] = $row['value'];
        }

        $listing = $this->getFilterListing($filter, $params);

        Assert::eq($listing->count(), $countOfValues);
    }

    /**
     * @Then /the (filter) should have (\d+) item(?:|s) for (manufacturer "[^"]+") in field "([^"]+)"$/
     * @Then /the (filter) should have (\d+) item(?:|s) for value "([^"]+)" in field "([^"]+)"$/
     */
    public function theFilterShouldHaveXItemsForCategoryWithObjectCondition(FilterInterface $filter, $countOfValues, $value, string $field): void
    {
        if ($value instanceof ResourceInterface) {
            $value = $value->getId();
        }

        if (str_contains($field, '[]')) {
            $field = str_replace('[]', '', $field);

            if (is_string($value) && str_contains($value, ',')) {
                $value = explode(',', $value);
            } else {
                $value = [$value];
            }
        }

        $params = [
            $field => $value,
        ];

        $listing = $this->getFilterListing($filter, $params);

        Assert::eq($listing->count(), $countOfValues);
    }

    /**
     * @Then /^if I query the (filter) with a simple order for field "([^"]+)" and direction "([^"]+)" I should get two products "([^"]+)" and "([^"]+)"$/
     */
    public function ifIQueryWithASimpleOrder(FilterInterface $filter, $orderKey, $orderDir, $firstResult, $secondResult): void
    {
        $filteredList = $this->filterListFactory->createList($filter, new ParameterBag());
        $filteredList->setLocale('en');

        if ($filteredList instanceof OrderAwareListingInterface) {
            $filteredList->addOrder(new SimpleOrder($orderKey, $orderDir));
        }

        $filteredList->load();
        $result = [];

        foreach ($filteredList->getObjects() as $object) {
            if (!$object instanceof IndexableInterface) {
                continue;
            }

            $result[] = $object->getIndexableName($filter->getIndex(), 'en');
        }

        Assert::eq([$firstResult, $secondResult], $result);
    }

    /**
     * @Then /^the raw result for the (filter) should look like:$/
     */
    public function theRawResultForTheFilterShouldLookLike(FilterInterface $filter, TableNode $table): void
    {
        $parameterBag = new ParameterBag();

        $filteredList = $this->filterListFactory->createList($filter, $parameterBag);
        $filteredList->setLocale('en');
        $filteredList->setVariantMode(ListingInterface::VARIANT_MODE_HIDE);

        if (!$filteredList instanceof RawResultListingInterface) {
            throw new \RuntimeException('FilteredList is not an instance of RawResultListingInterface');
        }

        $tableRaw = array_values($table->getTable());
        $header = null;
        $data = [];

        foreach ($tableRaw as $index => $value) {
            if ($index === 0) {
                $header = $value;

                continue;
            }

            $data[] = array_combine($header, $value);
        }

        $rawResult = $filteredList->loadRawResult();

        foreach ($data as $rowIndex => $entry) {
            foreach ($entry as $key => $value) {
                Assert::keyExists($rawResult[$rowIndex], $key);
                Assert::eq($rawResult[$rowIndex][$key], $value);
            }
        }
    }

    private function prepareFilter(FilterInterface $filter, array $filterParams = []): array
    {
        $parameterBag = new ParameterBag($filterParams);

        $filteredList = $this->filterListFactory->createList($filter, $parameterBag);
        $filteredList->setLocale('en');
        $filteredList->setVariantMode(ListingInterface::VARIANT_MODE_HIDE);

        $currentFilter = $this->filterProcessor->processConditions($filter, $filteredList, $parameterBag);

        return $this->filterProcessor->prepareConditionsForRendering($filter, $filteredList, $currentFilter);
    }

    private function getFilterListing(FilterInterface $filter, array $filterParams = []): ListingInterface
    {
        $parameterBag = new ParameterBag($filterParams);

        $filteredList = $this->filterListFactory->createList($filter, $parameterBag);
        $filteredList->setLocale('en');
        $filteredList->setVariantMode(ListingInterface::VARIANT_MODE_HIDE);

        $this->filterProcessor->processConditions($filter, $filteredList, $parameterBag);

        return $filteredList;
    }
}
