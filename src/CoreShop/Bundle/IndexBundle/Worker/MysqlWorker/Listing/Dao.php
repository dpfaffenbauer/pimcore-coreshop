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

namespace CoreShop\Bundle\IndexBundle\Worker\MysqlWorker\Listing;

use CoreShop\Bundle\IndexBundle\Worker\MysqlWorker;
use CoreShop\Component\Index\Listing\ListingInterface;
use Doctrine\DBAL\Connection;
use Doctrine\DBAL\Query\QueryBuilder;

class Dao
{
    private int $lastRecordCount = 0;

    public function __construct(
        private MysqlWorker\Listing $model,
        private Connection $database,
    ) {
    }

    /**
     * @return QueryBuilder
     */
    public function createQueryBuilder()
    {
        return new QueryBuilder($this->database);
    }

    /**
     * Load objects.
     *
     *
     * @return array
     */
    public function load(QueryBuilder $queryBuilder, bool $rawSelect = false)
    {
        $queryBuilder->from($this->model->getQueryTableName(), 'q');

        if ($rawSelect) {
            $queryBuilder->select('*');
            $queryBuilder->distinct();
        }
        else {
            if ($this->model->getVariantMode() == ListingInterface::VARIANT_MODE_INCLUDE_PARENT_OBJECT) {
                if (null !== $queryBuilder->getQueryPart('orderBy')) {
                    $queryBuilder->select('DISTINCT q.o_virtualObjectId as o_id');
                    $queryBuilder->addGroupBy('q.o_virtualObjectId');
                } else {
                    $queryBuilder->select('DISTINCT q.o_virtualObjectId as o_id');
                }
            } else {
                $queryBuilder->select('DISTINCT q.o_id');
            }
        }
        
        $resultSet = $this->database->fetchAllAssociative($queryBuilder->getSQL());

        $this->lastRecordCount = count($resultSet);

        return $resultSet;
    }

    /**
     * Load Group by values.
     *
     * @param string       $fieldName
     * @param bool         $countValues
     *
     * @return array
     */
    public function loadGroupByValues(QueryBuilder $queryBuilder, $fieldName, $countValues = false)
    {
        $queryBuilder->from($this->model->getQueryTableName(), 'q');
        $queryBuilder->groupBy('q.' . $this->quoteIdentifier($fieldName));
        $queryBuilder->orderBy('q.' . $this->quoteIdentifier($fieldName));

        if ($countValues) {
            if ($this->model->getVariantMode() == ListingInterface::VARIANT_MODE_INCLUDE_PARENT_OBJECT) {
                $queryBuilder->select($this->quoteIdentifier($fieldName) . ' AS value, count(DISTINCT o_virtualObjectId) AS count');
            } else {
                $queryBuilder->select($this->quoteIdentifier($fieldName) . ' AS value, count(*) AS count');
            }

            return $this->database->fetchAllAssociative($queryBuilder->getSQL());
        }

        $queryBuilder->select($this->quoteIdentifier($fieldName));
        $queryResult = $this->database->fetchAllAssociative($queryBuilder->getSQL());

        $result = [];

        foreach ($queryResult as $row) {
            if ($row[$fieldName]) {
                $result[] = $row[$fieldName];
            }
        }

        return $result;
    }

    /**
     * Load Grouo by Relation values.
     *
     * @param string       $fieldName
     * @param bool         $countValues
     *
     * @return array
     */
    public function loadGroupByRelationValues(QueryBuilder $queryBuilder, $fieldName, $countValues = false)
    {
        return $this->loadGroupByRelationValuesAndType($queryBuilder, $fieldName, null, $countValues);
    }

    /**
     * Load Grouo by Relation values and type.
     */
    public function loadGroupByRelationValuesAndType(QueryBuilder $queryBuilder, string $fieldName, ?string $type = null, bool $countValues = false): array
    {
        $queryBuilder->from($this->model->getRelationTablename(), 'q');

        if ($countValues) {
            $subQueryBuilder = new QueryBuilder($this->database);
            $subQueryBuilder->select($this->quoteIdentifier('o_id'));
            $subQueryBuilder->from($this->model->getQueryTableName(), 'q');
            $subQueryBuilder->where($queryBuilder->getQueryPart('where'));

            if ($this->model->getVariantMode() === ListingInterface::VARIANT_MODE_INCLUDE_PARENT_OBJECT) {
                $queryBuilder->select($this->quoteIdentifier('dest') . ' AS ' . $this->quoteIdentifier('value') . ', count(DISTINCT src_virtualObjectId) AS ' . $this->quoteIdentifier('count'));
                $queryBuilder->where('fieldname = ' . $this->quote($fieldName));

                if (null !== $type) {
                    $queryBuilder->where('type = ' . $this->quote($type));
                }
            } else {
                $queryBuilder->select($this->quoteIdentifier('dest') . ' AS ' . $this->quoteIdentifier('value') . ', count(*) AS ' . $this->quoteIdentifier('count'));
                $queryBuilder->where('fieldname = ' . $this->quote($fieldName));

                if (null !== $type) {
                    $queryBuilder->where('type = ' . $this->quote($type));
                }
            }

            $queryBuilder->andWhere('src IN (' . $subQueryBuilder->getSQL() . ')');
            $queryBuilder->groupBy('dest');

            return $this->database->fetchAllAssociative($queryBuilder->getSQL());
        }

        $queryBuilder->select($this->quoteIdentifier('dest'));
        $queryBuilder->where('fieldname = ' . $this->quote($fieldName));

        if (null !== $type) {
            $queryBuilder->where('type = ' . $this->quote($type));
        }

        $subQueryBuilder = new QueryBuilder($this->database);
        $subQueryBuilder->select('o_id');
        $subQueryBuilder->from($this->model->getQueryTableName(), 'q');
        $subQueryBuilder->where($queryBuilder->getQueryPart('where'));
        $queryBuilder->andWhere('src IN (' . $subQueryBuilder->getSQL() . ')');
        $queryBuilder->groupBy('dest');

        $queryResult = $this->database->fetchAllAssociative($queryBuilder->getSQL());

        $result = [];

        foreach ($queryResult as $row) {
            if ($row['dest']) {
                $result[] = $row['dest'];
            }
        }

        return $result;
    }

    /**
     * Get Count.
     *
     *
     * @return int
     */
    public function getCount(QueryBuilder $queryBuilder)
    {
        $queryBuilder->from($this->model->getQueryTableName(), 'q');
        if ($this->model->getVariantMode() == ListingInterface::VARIANT_MODE_INCLUDE_PARENT_OBJECT) {
            $queryBuilder->select('count(DISTINCT o_virtualObjectId)');
        } else {
            $queryBuilder->select('count(*)');
        }
        $stmt = $this->database->executeQuery($queryBuilder->getSQL());

        return (int) $stmt->fetchOne();
    }

    /**
     * quote value.
     *
     * @param mixed $value
     *
     * @return mixed
     */
    public function quote($value)
    {
        return $this->database->quote($value);
    }

    /**
     * quote identifier.
     *
     * @param string $value
     *
     * @return string
     */
    public function quoteIdentifier($value)
    {
        return $this->database->quoteIdentifier($value);
    }

    /**
     * returns order by statement for similarity calculations based on given fields and object ids.
     */
    public function buildSimilarityOrderBy(array $fields, int $objectId): string
    {
        //TODO: similarity
        /*
        try {
            $fieldString = '';
            $maxFieldString = '';

            foreach ($fields as $field) {
                if ($field instanceof AbstractSimilarity) {
                    if (!empty($fieldString)) {
                        $fieldString .= ',';
                        $maxFieldString .= ',';
                    }


                    $fieldString .= $this->db->quoteIdentifier($field->getField());
                    $maxFieldString .= 'MAX('.$this->db->quoteIdentifier($field->getField()).') as '.$this->db->quoteIdentifier($field->getField());
                }
            }

            $query = 'SELECT '.$fieldString.' FROM '.$this->model->getQueryTableName().' a WHERE a.o_id = ?;';
            $objectValues = $this->db->fetchRow($query, $objectId);

            $query = 'SELECT '.$maxFieldString.' FROM '.$this->model->getQueryTableName().' a';
            $maxObjectValues = $this->db->fetchRow($query);

            if (!empty($objectValues)) {
                $subStatement = [];

                foreach ($fields as $field) {
                    if ($field instanceof AbstractSimilarity) {
                        if ($objectValues[$field->getField()]) {
                            $subStatement[] =
                                '(' .
                                $this->db->quoteIdentifier($field->getField()) . '/' . $maxObjectValues[$field->getField()] .
                                ' - ' .
                                $objectValues[$field->getField()] / $maxObjectValues[$field->getField()] .
                                ') * ' . $field->getWeight();
                        }
                    }
                }

                if (count($subStatement) > 0) {
                    $statement = 'ABS('.implode(' + ', $subStatement).')';

                    return $statement;
                }
            } else {
                throw new \Exception('Field array for given object id is empty');
            }
        } catch (\Exception $e) {
        }*/

        return '';
    }

    /**
     * returns where statement for fulltext search index.
     *
     * @param array  $fields
     * @param string $searchString
     *
     * @return string
     */
    public function buildFulltextSearchWhere($fields, $searchString)
    {
        $columnNames = [];

        foreach ($fields as $c) {
            $columnNames[] = $this->quoteIdentifier($c);
        }

        return 'MATCH (' . implode(',', $columnNames) . ') AGAINST (' . $this->quote($searchString) . ' IN BOOLEAN MODE)';
    }

    /**
     * get the record count for the last select query.
     */
    public function getLastRecordCount(): int
    {
        return $this->lastRecordCount;
    }
}
