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
use CoreShop\Component\Index\Model\IndexableInterface;
use CoreShop\Component\Index\Model\IndexInterface;
use CoreShop\Component\Resource\Repository\RepositoryInterface;
use Doctrine\ORM\EntityManagerInterface;
use Pimcore\Model\DataObject\Concrete;
use Webmozart\Assert\Assert;

final class IndexContext implements Context
{
    public function __construct(
        private RepositoryInterface $indexRepository,
        private EntityManagerInterface $entityManager,
    ) {
    }

    /**
     * @Then /^there should be a index "([^"]+)"$/
     */
    public function thereShouldBeAIndex($name): void
    {
        $rates = $this->indexRepository->findBy(['name' => $name]);

        Assert::eq(
            count($rates),
            1,
            sprintf('%d indices has been found with name "%s".', count($rates), $name),
        );
    }

    /**
     * @Then /^the (index) should have columns "([^"]+)"$/
     */
    public function theIndexShouldHaveColumns(IndexInterface $index, $columns): void
    {
        $columns = explode(', ', $columns);
        $tableName = sprintf('coreshop_index_mysql_%s', $index->getName());

        $this->indexShouldHaveColumnsInTable($tableName, $columns);
    }

    /**
     * @Then /^the (index) should have relational columns "([^"]+)"$/
     */
    public function theIndexShouldHaveRelationalColumns(IndexInterface $index, $columns): void
    {
        $columns = explode(', ', $columns);
        $tableName = sprintf('coreshop_index_mysql_relations_%s', $index->getName());

        $this->indexShouldHaveColumnsInTable($tableName, $columns);
    }

    /**
     * @Then /^the (index) should have localized columns "([^"]+)"$/
     */
    public function theIndexShouldHaveLocalizedColumns(IndexInterface $index, $columns): void
    {
        $columns = explode(', ', $columns);
        $tableName = sprintf('coreshop_index_mysql_localized_%s', $index->getName());

        $this->indexShouldHaveColumnsInTable($tableName, $columns);
    }

    /**
     * @Then /^the (index) should have a column "([^"]+)" of type "([^"]+)"$/
     */
    public function theIndexShouldHaveAColumnOfType(IndexInterface $index, $column, $type): void
    {
        $tableName = sprintf('coreshop_index_mysql_%s', $index->getName());

        $this->indexShouldHaveColumnOfType($tableName, $column, $type);
    }

    /**
     * @Then /^the (index) should have indexed the (product "[^"]+")$/
     * @Then /^the (index) should have indexed the (object)$/
     */
    public function theIndexShouldHaveIndexedProduct(IndexInterface $index, IndexableInterface $object): void
    {
        $productEntry = $this->fetchAllFromIndex($index, $object);

        Assert::isArray($productEntry, sprintf('Could not find index entry for object %s', $object->getId()));

        Assert::same(
            (int) $productEntry['o_id'],
            $object->getId(),
            sprintf(
                'Expected to find id %s in index but found %s instead',
                (int) $productEntry['o_id'],
                $object->getId(),
            ),
        );
    }

    /**
     * @Then /^the (index) should not have indexed the (object)$/
     * @Then /^the (index) should not have indexed the (product "[^"]+")$/
     */
    public function theIndexShouldNotHaveIndexedTheObject(IndexInterface $index, IndexableInterface $object): void
    {
        $productEntry = $this->fetchAllFromIndex($index, $object);

        Assert::false($productEntry, sprintf('Could find index entry for object %s', $object->getId()));
    }

    /**
     * @Then /^the (index) column "([^"]+)" for (product "[^"]+") should have value "([^"]+)"$/
     * @Then /^the (index) column "([^"]+)" for (object-instance) should have value "([^"]+)"$/
     * @Then /^the (index) column "([^"]+)" for (object-instance "[^"]+") should have value "([^"]+)"$/
     */
    public function theIndexColumnForProductShouldHaveValue(IndexInterface $index, $column, IndexableInterface $object, $value): void
    {
        $this->indexEntryShouldHaveValue($index, $object, $column, $value);
    }

    /**
     * @Then /^the (index) column "([^"]+)" for (product "[^"]+") should have integer value "(\d+)"$/
     * @Then /^the (index) column "([^"]+)" for (object-instance) should have integer value "(\d+)"$/
     * @Then /^the (index) column "([^"]+)" for (object-instance "[^"]+") should have integer value "(\d+)"$/
     */
    public function theIndexColumnForProductShouldHaveIntegerValue(IndexInterface $index, $column, IndexableInterface $object, int $value): void
    {
        $this->indexEntryShouldHaveValue($index, $object, $column, $value);
    }

    /**
     * @Then /^the (index) localized column "([^"]+)" for (product "[^"]+") should have value "([^"]+)"$/
     * @Then /^the (index) localized column "([^"]+)" for (object-instance) should have value "([^"]+)"$/
     * @Then /^the (index) localized column "([^"]+)" for (object-instance "[^"]+") should have value "([^"]+)"$/
     */
    public function theIndexLocalizedColumnForProductShouldHaveValue(IndexInterface $index, $column, IndexableInterface $object, $value): void
    {
        $this->indexEntryShouldHaveValue($index, $object, $column, $value, true);
    }

    /**
     * @Then /^the (index) relational column "([^"]+)" for (product "[^"]+") should have value "([^"]+)"$/
     * @Then /^the (index) relational column "([^"]+)" for (object-instance) should have value "([^"]+)"$/
     * @Then /^the (index) relational column "([^"]+)" for (object-instance "[^"]+") should have value "([^"]+)"$/
     */
    public function theIndexRelatioanlColumnForProductShouldHaveValue(IndexInterface $index, $column, IndexableInterface $object, $value): void
    {
        $this->indexEntryShouldHaveValue($index, $object, $column, $value, false, true);
    }

    /**
     * @Then /^the (index) should have an index for "([^"]+)"$/
     */
    public function theIndexShouldHaveAnIndexFor(IndexInterface $index, $columns): void
    {
        $columns = explode(', ', $columns);
        $tableName = sprintf('coreshop_index_mysql_%s', $index->getName());

        $this->indexShouldHaveIndexInTable($tableName, $columns);
    }

    /**
     * @Then /^the (index) should have an localized index for "([^"]+)"$/
     */
    public function theIndexShouldHaveAnLocalizedIndexFor(IndexInterface $index, $columns): void
    {
        $columns = explode(', ', $columns);
        $tableName = sprintf('coreshop_index_mysql_localized_%s', $index->getName());

        $this->indexShouldHaveIndexInTable($tableName, $columns);
    }

    private function indexEntryShouldHaveValue(IndexInterface $index, IndexableInterface $object, string $column, mixed $value, bool $localized = false, bool $relational = false): void
    {
        $productEntry = $this->fetchAllFromIndex($index, $object, $localized, $relational);

        Assert::isArray($productEntry, sprintf('Could not find index entry for product %s', $object->getId()));
        Assert::keyExists($productEntry, $column, sprintf('Could not find column %s in index', $column));

        $dbValue = $productEntry[$column];

        \settype($dbValue, gettype($value));

        Assert::same(
            $dbValue,
            $value,
            sprintf(
                'Expected column value %s (type: %s) for column %s to be %s (type: %s)',
                $productEntry[$column],
                get_debug_type($productEntry[$column]),
                $column,
                $value,
                get_debug_type($value),
            ),
        );
    }

    private function fetchAllFromIndex(IndexInterface $index, ?IndexableInterface $object = null, bool $localized = false, bool $relational = false): array|bool
    {
        if ($localized) {
            $tableName = sprintf('coreshop_index_mysql_localized_%s', $index->getName());
        } elseif ($relational) {
            $tableName = sprintf('coreshop_index_mysql_relations_%s', $index->getName());
        } else {
            $tableName = sprintf('coreshop_index_mysql_%s', $index->getName());
        }

        if ($object instanceof Concrete) {
            if ($localized) {
                return $this->entityManager->getConnection()->fetchAssociative(sprintf('SELECT * FROM %s WHERE oo_id = %s', $tableName, $object->getId()));
            }

            if ($relational) {
                return $this->entityManager->getConnection()->fetchAssociative(sprintf('SELECT * FROM %s WHERE src = %s', $tableName, $object->getId()));
            }

            return $this->entityManager->getConnection()->fetchAssociative(sprintf('SELECT * FROM %s WHERE o_id = %s', $tableName, $object->getId()));
        }

        return $this->entityManager->getConnection()->fetchAllAssociative(sprintf('SELECT * FROM %s', $tableName));
    }

    private function indexShouldHaveColumnsInTable(string $tableName, array $columns): void
    {
        $schemaManager = $this->entityManager->getConnection()->getSchemaManager();

        Assert::true($schemaManager->tablesExist([$tableName]), sprintf('Table with name %s should exist but was not found', $tableName));

        $tableColumns = $schemaManager->listTableColumns($tableName);

        foreach ($columns as $col) {
            $found = false;

            foreach ($tableColumns as $tableCol) {
                if ($tableCol->getName() === $col) {
                    $found = true;

                    break;
                }
            }

            Assert::true($found, sprintf('Table column %s not found, found columns %s', $col, implode(', ', $columns)));
        }
    }

    private function indexShouldHaveColumnOfType(string $tableName, string $column, string $type): void
    {
        $schemaManager = $this->entityManager->getConnection()->getSchemaManager();

        Assert::true($schemaManager->tablesExist([$tableName]), sprintf('Table with name %s should exist but was not found', $tableName));

        $doctrineCol = $schemaManager->listTableDetails($tableName)->getColumn($column);
        $actualType = $schemaManager->getDatabasePlatform()->getColumnDeclarationSQL($column, $doctrineCol->toArray());

        Assert::eq($type, $actualType);
    }

    private function indexShouldHaveIndexInTable(string $tableName, array $columns): void
    {
        $schemaManager = $this->entityManager->getConnection()->getSchemaManager();

        Assert::true($schemaManager->tablesExist([$tableName]), sprintf('Table with name %s should exist but was not found', $tableName));

        $table = $schemaManager->listTableDetails($tableName);
        $found = false;

        foreach ($table->getIndexes() as $index) {
            $found = true;

            foreach ($columns as $column) {
                if (!in_array($column, $index->getColumns())) {
                    $found = false;

                    break;
                }
            }

            if ($found) {
                break;
            }
        }

        Assert::true($found, sprintf('Index for columns %s not found', implode(', ', $columns)));
    }
}
