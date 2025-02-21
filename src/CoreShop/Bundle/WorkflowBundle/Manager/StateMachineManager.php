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

namespace CoreShop\Bundle\WorkflowBundle\Manager;

use Symfony\Component\Workflow\Registry;
use Symfony\Component\Workflow\Transition;
use Symfony\Component\Workflow\WorkflowInterface;

final class StateMachineManager implements StateMachineManagerInterface
{
    public function __construct(
        private Registry $registry,
    ) {
    }

    public function get(object $subject, ?string $workflowName = null): WorkflowInterface
    {
        return $this->registry->get($subject, $workflowName);
    }

    public function getTransitionFromState(WorkflowInterface $workflow, object $subject, string $fromState): ?string
    {
        /** @var Transition $transition */
        foreach ($workflow->getEnabledTransitions($subject) as $transition) {
            if (in_array($fromState, $transition->getFroms(), true)) {
                return $transition->getName();
            }
        }

        return null;
    }

    public function getTransitionToState(WorkflowInterface $workflow, object $subject, string $toState): ?string
    {
        /** @var Transition $transition */
        foreach ($workflow->getEnabledTransitions($subject) as $transition) {
            if (in_array($toState, $transition->getTos(), true)) {
                return $transition->getName();
            }
        }

        return null;
    }
}
