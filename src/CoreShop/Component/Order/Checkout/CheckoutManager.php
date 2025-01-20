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

namespace CoreShop\Component\Order\Checkout;

use CoreShop\Component\Order\Model\OrderInterface;
use CoreShop\Component\Registry\PrioritizedServiceRegistryInterface;
use Symfony\Component\HttpFoundation\Request;

class CheckoutManager implements CheckoutManagerInterface
{
    public function __construct(
        private PrioritizedServiceRegistryInterface $serviceRegistry,
    ) {
    }

    public function addCheckoutStep(CheckoutStepInterface $step, int $priority): void
    {
        $this->serviceRegistry->register($step->getIdentifier(), $priority, $step);
    }

    public function getSteps(): array
    {
        return array_map(function (CheckoutStepInterface $step) {
            return $step->getIdentifier();
        }, $this->serviceRegistry->all());
    }

    public function getStep(string $identifier): CheckoutStepInterface
    {
        /**
         * @var CheckoutStepInterface $step
         */
        $step = $this->serviceRegistry->get($identifier);

        return $step;
    }

    public function getNextStep(string $identifier): ?CheckoutStepInterface
    {
        return $this->serviceRegistry->getNextTo($identifier);
    }

    public function hasNextStep(string $identifier): bool
    {
        return $this->serviceRegistry->hasNextTo($identifier);
    }

    public function getPreviousStep(string $identifier): CheckoutStepInterface
    {
        return $this->serviceRegistry->getPreviousTo($identifier);
    }

    public function hasPreviousStep(string $identifier): bool
    {
        return $this->serviceRegistry->hasPreviousTo($identifier);
    }

    public function getPreviousSteps(string $identifier): array
    {
        return $this->serviceRegistry->getAllPreviousTo($identifier);
    }

    public function validateStep(CheckoutStepInterface $step, OrderInterface $cart): bool
    {
        if ($step instanceof ValidationCheckoutStepInterface) {
            return $step->validate($cart);
        }

        return true;
    }

    public function prepareStep(CheckoutStepInterface $step, OrderInterface $cart, Request $request): array
    {
        return $step->prepareStep($cart, $request);
    }

    public function getCurrentStepIndex(string $identifier): int
    {
        return $this->serviceRegistry->getIndex($identifier);
    }

    public function commitStep(CheckoutStepInterface $step, OrderInterface $cart, Request $request): bool
    {
        return $step->commitStep($cart, $request);
    }
}
