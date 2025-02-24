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

use Symfony\Component\Workflow\WorkflowInterface;

interface StateMachineManagerInterface
{
    public function get(object $subject, ?string $workflowName = null): WorkflowInterface;

    public function getTransitionFromState(WorkflowInterface $workflow, object $subject, string $fromState): ?string;

    public function getTransitionToState(WorkflowInterface $workflow, object $subject, string $toState): ?string;
}
