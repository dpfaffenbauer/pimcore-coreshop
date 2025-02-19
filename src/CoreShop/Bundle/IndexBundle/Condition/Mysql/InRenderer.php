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

namespace CoreShop\Bundle\IndexBundle\Condition\Mysql;

use CoreShop\Bundle\IndexBundle\Worker\MysqlWorker;
use CoreShop\Component\Index\Condition\ConditionInterface;
use CoreShop\Component\Index\Condition\InCondition;
use CoreShop\Component\Index\Condition\NotInCondition;
use CoreShop\Component\Index\Worker\WorkerInterface;
use Webmozart\Assert\Assert;

class InRenderer extends AbstractMysqlDynamicRenderer
{
    public function render(WorkerInterface $worker, ConditionInterface $condition, ?string $prefix = null)
    {
        /**
         * @var InCondition $condition
         */
        Assert::isInstanceOf($condition, InCondition::class);

        $inValues = [];

        foreach ($condition->getValues() as $value) {
            $inValues[] = $this->quote((string) $value);
        }

        if (count($inValues) > 0) {
            $operator = 'IN';

            if ($condition instanceof NotInCondition) {
                $operator = 'NOT IN';
            }

            return sprintf(
                '%s %s (%s)',
                $this->quoteFieldName($condition->getFieldName(), $prefix),
                $operator,
                implode(',', $inValues),
            );
        }

        return '';
    }

    public function supports(WorkerInterface $worker, ConditionInterface $condition): bool
    {
        return $worker instanceof MysqlWorker && $condition instanceof InCondition;
    }
}
