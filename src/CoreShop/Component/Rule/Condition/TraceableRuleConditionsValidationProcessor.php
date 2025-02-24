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

namespace CoreShop\Component\Rule\Condition;

use CoreShop\Component\Resource\Model\ResourceInterface;
use CoreShop\Component\Rule\Model\ConditionInterface;
use CoreShop\Component\Rule\Model\RuleInterface;

class TraceableRuleConditionsValidationProcessor implements TraceableRuleConditionsValidationProcessorInterface
{
    private array $processed = [];

    public function __construct(
        private RuleConditionsValidationProcessorInterface $ruleConditionsValidationProcessor,
    ) {
    }

    public function getType(): string
    {
        return $this->ruleConditionsValidationProcessor->getType();
    }

    public function isValid(ResourceInterface $subject, RuleInterface $rule, $conditions, array $params = []): bool
    {
        if (!$rule->getActive()) {
            return false;
        }

        if (!count($conditions)) {
            $this->addProcessedRule($subject, $rule, true);

            return true;
        }
        $ruleResult = true;

        foreach ($conditions as $condition) {
            $conditionResult = $this->isConditionValid($subject, $rule, $condition, $params);

            if (!$conditionResult) {
                $ruleResult = false;
            }

            $this->addProcessedRule($subject, $rule, $ruleResult, $condition, $conditionResult);
        }

        return $ruleResult;
    }

    public function isConditionValid(ResourceInterface $subject, RuleInterface $rule, ConditionInterface $condition, array $params = []): bool
    {
        $isValid = $this->ruleConditionsValidationProcessor->isConditionValid($subject, $rule, $condition, $params);

        $this->addProcessedRule($subject, $rule, $isValid, $condition);

        return $isValid;
    }

    protected function addProcessedRule(
        ResourceInterface $subject,
        RuleInterface $rule,
        $ruleResult = false,
        ?ConditionInterface $condition = null,
        $conditionResult = false,
    ): void {
        if (!isset($this->processed[$subject->getId()])) {
            $this->processed[$subject->getId()] = [
                'subject' => $subject,
                'type' => $subject::class,
                'rules' => [],
            ];
        }

        if (!isset($this->processed[$subject->getId()]['rules'][$rule->getId()])) {
            $actions = [];

            foreach ($rule->getActions() as $action) {
                $actions[$action->getId()] = [
                    'action' => $action,
                    'configuration' => $action->getConfiguration(),
                    'type' => $action->getType(),
                ];
            }

            $this->processed[$subject->getId()]['rules'][$rule->getId()] = [
                'rule' => $rule,
                'result' => $ruleResult,
                'conditions' => [],
                'actions' => $actions,
            ];
        }

        if (null !== $condition) {
            $this->processed[$subject->getId()]['rules'][$rule->getId()]['result'] = $ruleResult;
            $this->processed[$subject->getId()]['rules'][$rule->getId()]['conditions'][$condition->getId()] = [
                'condition' => $condition,
                'configuration' => $condition->getConfiguration(),
                'type' => $condition->getType(),
                'result' => $conditionResult,
            ];
        }
    }

    public function getValidatedConditions(): array
    {
        return $this->processed;
    }
}
