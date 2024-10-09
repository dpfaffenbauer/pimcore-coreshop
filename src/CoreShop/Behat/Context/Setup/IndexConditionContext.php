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
use CoreShop\Bundle\TestBundle\Service\SharedStorageInterface;
use CoreShop\Component\Index\Condition\CompareCondition;
use CoreShop\Component\Index\Condition\ConcatCondition;
use CoreShop\Component\Index\Condition\ConditionInterface;
use CoreShop\Component\Index\Condition\GreaterThanCondition;
use CoreShop\Component\Index\Condition\GreaterThanEqualCondition;
use CoreShop\Component\Index\Condition\InCondition;
use CoreShop\Component\Index\Condition\IsNotNullCondition;
use CoreShop\Component\Index\Condition\IsNullCondition;
use CoreShop\Component\Index\Condition\LikeCondition;
use CoreShop\Component\Index\Condition\LowerThanCondition;
use CoreShop\Component\Index\Condition\LowerThanEqualCondition;
use CoreShop\Component\Index\Condition\MatchCondition;
use CoreShop\Component\Index\Condition\NotInCondition;
use CoreShop\Component\Index\Condition\NotLikeCondition;
use CoreShop\Component\Index\Condition\NotMatchCondition;
use CoreShop\Component\Index\Condition\RangeCondition;

final class IndexConditionContext implements Context
{
    public function __construct(
        private SharedStorageInterface $sharedStorage,
    ) {
    }

    /**
     * @Given /^there is a compare condition with field-name "([^"]+)" operator "([^"]+)" and value "([^"]+)"$/
     * @Given /^there is a compare condition with field-name "([^"]+)" operator "([^"]+)" and value "([^"]+)" with identifier "([^"]+)"$/
     */
    public function thereIsACompareCondition(string $fieldName, string $operator, string $value, string $identifier = null): void
    {
        $this->addCondition(new CompareCondition($fieldName, $operator, $value), $identifier);
    }

    /**
     * @Given /^there is a match condition with field-name "([^"]+)" and value "([^"]+)"$/
     * @Given /^there is a match condition with field-name "([^"]+)" and value "([^"]+)" with identifier "([^"]+)"$/
     */
    public function thereIsAMatchCondition(string $fieldName, string $value, string $identifier = null): void
    {
        $this->addCondition(new MatchCondition($fieldName, $value), $identifier);
    }

    /**
     * @Given /^there is a not-match condition with field-name "([^"]+)" and value "([^"]+)"$/
     * @Given /^there is a not-match condition with field-name "([^"]+)" and value "([^"]+)" with identifier "([^"]+)"$/
     */
    public function thereIsANotMatchCondition(string $fieldName, string $value, string $identifier = null): void
    {
        $this->addCondition(new NotMatchCondition($fieldName, $value), $identifier);
    }

    /**
     * @Given /^there is a greater-than condition with field-name "([^"]+)" and value "([^"]+)"$/
     * @Given /^there is a greater-than condition with field-name "([^"]+)" and value "([^"]+)" with identifier "([^"]+)"$/
     */
    public function thereIsAGreaterThanCondition(string $fieldName, string $value, string $identifier = null): void
    {
        $this->addCondition(new GreaterThanCondition($fieldName, $value), $identifier);
    }

    /**
     * @Given /^there is a greater-than-equal condition with field-name "([^"]+)" and value "([^"]+)"$/
     * @Given /^there is a greater-than-equal condition with field-name "([^"]+)" and value "([^"]+)" with identifier "([^"]+)"$/
     */
    public function thereIsAGreaterThanEqualCondition(string $fieldName, string $value, string $identifier = null): void
    {
        $this->addCondition(new GreaterThanEqualCondition($fieldName, $value), $identifier);
    }

    /**
     * @Given /^there is a lower-than condition with field-name "([^"]+)" and value "([^"]+)"$/
     * @Given /^there is a lower-than condition with field-name "([^"]+)" and value "([^"]+)" with identifier "([^"]+)"$/
     */
    public function thereIsALowerThanCondition(string $fieldName, string $value, string $identifier = null): void
    {
        $this->addCondition(new LowerThanCondition($fieldName, $value), $identifier);
    }

    /**
     * @Given /^there is a lower-than-equal condition with field-name "([^"]+)" and value "([^"]+)"$/
     * @Given /^there is a lower-than-equal condition with field-name "([^"]+)" and value "([^"]+)" with identifier "([^"]+)"$/
     */
    public function thereIsALowerThanEqualCondition(string $fieldName, string $value, string $identifier = null): void
    {
        $this->addCondition(new LowerThanEqualCondition($fieldName, $value), $identifier);
    }

    /**
     * @Given /^there is a concat condition with field-name "([^"]+)" operator "([^"]+)" and (conditions "[^"]+")$/
     * @Given /^there is a concat condition with field-name "([^"]+)" operator "([^"]+)" and (conditions "[^"]+") with identifier "([^"]+)"$/
     */
    public function thereIsAConcatCondition(string $fieldName, string $operator, array $conditions, string $identifier = null): void
    {
        $this->addCondition(new ConcatCondition($fieldName, $operator, $conditions), $identifier);
    }

    /**
     * @Given /^there is a in condition with field-name "([^"]+)" and values "([^"]+)"$/
     * @Given /^there is a in condition with field-name "([^"]+)" and values "([^"]+)" with identifier "([^"]+)"$/
     */
    public function thereIsAInCondition(string $fieldName, string $values, string $identifier = null): void
    {
        $this->addCondition(new InCondition($fieldName, explode(',', $values)), $identifier);
    }

    /**
     * @Given /^there is a not-in condition with field-name "([^"]+)" and values "([^"]+)"$/
     * @Given /^there is a not-in condition with field-name "([^"]+)" and values "([^"]+)" with identifier "([^"]+)"$/
     */
    public function thereIsANotInCondition(string $fieldName, string $values, string $identifier = null): void
    {
        $this->addCondition(new NotInCondition($fieldName, explode(',', $values)), $identifier);
    }

    /**
     * @Given /^there is a is-null condition with field-name "([^"]+)"$/
     * @Given /^there is a is-null condition with field-name "([^"]+)" with identifier "([^"]+)"$/
     */
    public function thereIsAIsNullCondition(string $fieldName, string $identifier = null): void
    {
        $this->addCondition(new IsNullCondition($fieldName), $identifier);
    }

    /**
     * @Given /^there is a is-not-null condition with field-name "([^"]+)"$/
     * @Given /^there is a is-not-null condition with field-name "([^"]+)" with identifier "([^"]+)"$/
     */
    public function thereIsAIsNotNullCondition(string $fieldName, string $identifier = null): void
    {
        $this->addCondition(new IsNotNullCondition($fieldName), $identifier);
    }

    /**
     * @Given /^there is a range condition with field-name "([^"]+)" from "([^"]+)" to "([^"]+)"$/
     * @Given /^there is a range condition with field-name "([^"]+)" from "([^"]+)" to "([^"]+)" with identifier "([^"]+)"$/
     */
    public function thereIsARangeCondition(string $fieldName, float $from, float $to, string $identifier = null): void
    {
        $this->addCondition(new RangeCondition($fieldName, $from, $to), $identifier);
    }

    /**
     * @Given /^there is a like condition with field-name "([^"]+)" and pattern "([^"]+)" and value "([^"]+)"$/
     * @Given /^there is a like condition with field-name "([^"]+)" and pattern "([^"]+)" and value "([^"]+)" with identifier "([^"]+)"$/
     */
    public function thereIsALikeCondition(string $fieldName, string $pattern, string $value, string $identifier = null): void
    {
        $this->addCondition(new LikeCondition($fieldName, $pattern, $value), $identifier);
    }

    /**
     * @Given /^there is a not-like condition with field-name "([^"]+)" and pattern "([^"]+)" and value "([^"]+)"$/
     * @Given /^there is a not-like condition with field-name "([^"]+)" and pattern "([^"]+)" and value "([^"]+)" with identifier "([^"]+)"$/
     */
    public function thereIsANotLikeCondition(string $fieldName, string $pattern, string $value, string $identifier = null): void
    {
        $this->addCondition(new NotLikeCondition($fieldName, $pattern, $value), $identifier);
    }

    private function addCondition(ConditionInterface $condition, ?string $identifier = null): void
    {
        $this->sharedStorage->set('index_condition', $condition);

        if ($identifier) {
            $this->sharedStorage->set('index_condition_' . $identifier, $condition);
        }
    }
}
