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

namespace CoreShop\Bundle\ResourceBundle\Pimcore;

use CoreShop\Component\Resource\Metadata\MetadataInterface;
use CoreShop\Component\Resource\Model\ResourceInterface;
use CoreShop\Component\Resource\Repository\PimcoreDaoRepositoryInterface;
use Doctrine\DBAL\Connection;

class PimcoreDaoRepository implements PimcoreDaoRepositoryInterface
{
    public function __construct(
        protected MetadataInterface $metadata,
        protected Connection $connection,
    ) {
    }

    public function add(ResourceInterface $resource): void
    {
        throw new \Exception(sprintf('%s:%s not supported', __CLASS__, __METHOD__));
    }

    public function remove(ResourceInterface $resource): void
    {
        throw new \Exception(sprintf('%s:%s not supported', __CLASS__, __METHOD__));
    }

    public function getClassName()
    {
        return $this->metadata->getClass('model');
    }

    /**
     * @return mixed
     */
    public function getList()
    {
        $className = $this->metadata->getClass('model');

        if (method_exists($className, 'getList')) {
            return $className::getList();
        }

        /** @psalm-var class-string $listClass */
        $listClass = $className . '\\Listing';

        if (class_exists($className)) {
            return new $listClass();
        }

        throw new \InvalidArgumentException(sprintf(
            'Class %s has no getList or a Listing Class function and thus is not supported here',
            $className,
        ));
    }

    public function findAll()
    {
        return $this->getList()->getObjects();
    }

    public function find($id)
    {
        return $this->forceFind($id, false);
    }

    public function forceFind($id, bool $force = true)
    {
        $class = $this->metadata->getClass('model');

        if (!method_exists($class, 'getById')) {
            throw new \InvalidArgumentException(
                sprintf(
                    'Class %s has no getById function and is therefore not considered as a valid Pimcore DAO Object',
                    $class,
                ),
            );
        }

        return $class::getById((int) $id, ['force' => $force]);
    }

    public function findBy(array $criteria, ?array $orderBy = null, $limit = null, $offset = null)
    {
        $list = $this->getList();

        if (isset($criteria['pimcore_unpublished'])) {
            $list->setUnpublished($criteria['pimcore_unpublished']);

            unset($criteria['pimcore_unpublished']);
        }

        $criteria = $this->normalizeCriteria($criteria);

        if (is_array($criteria) && count($criteria) > 0) {
            foreach ($criteria as $criterion) {
                $list->addConditionParam(
                    $criterion['condition'],
                    $criterion['variable'] ?? null,
                );
            }
        }

        if (null !== $orderBy && count($orderBy) > 0) {
            $orderKeys = [];
            $orders = [];

            foreach ($orderBy as $key => $direction) {
                $orderKeys[] = $key;
                $orders[] = $direction;
            }

            $list->setOrderKey($orderKeys);
            $list->setOrder($orders);
        }

        if (null !== $offset) {
            $list->setOffset($offset);
        }

        if (null !== $limit) {
            $list->setLimit($limit);
        }

        return $list->load();
    }

    public function findOneBy(array $criteria)
    {
        $objects = $this->findBy($criteria);

        if (count($objects) > 0) {
            return $objects[0];
        }

        return null;
    }

    /**
     * Normalize critera input.
     *
     * Input could be
     *
     * [
     *     "condition" => "id=?",
     *     "conditionVariables" => [1]
     * ]
     *
     * OR
     *
     * [
     *     "condition" => [
     *          "id" => 1
     *     ]
     * ]
     *
     * @param array $criteria
     *
     * @return array
     */
    private function normalizeCriteria($criteria)
    {
        $normalized = [
        ];

        if (is_array($criteria)) {
            foreach ($criteria as $key => $criterion) {
                $normalizedCriterion = [];

                if (is_array($criterion)) {
                    if (array_key_exists('condition', $criterion)) {
                        if (is_string($criterion['condition'])) {
                            $normalizedCriterion['condition'] = $criterion['condition'];

                            if (array_key_exists('variable', $criterion)) {
                                $normalizedCriterion['variable'] = $criterion['variable'];
                            }
                        }
                    } else {
                        $normalizedCriterion['condition'] = $criterion;
                    }
                } else {
                    $normalizedCriterion['condition'] = $key . ' = ?';
                    $normalizedCriterion['variable'] = [$criterion];
                }

                if (count($normalizedCriterion) > 0) {
                    $normalized[] = $normalizedCriterion;
                }
            }
        }

        return $normalized;
    }
}
