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

namespace CoreShop\Component\Customer\Context;

use CoreShop\Component\Customer\Model\CustomerInterface;
use CoreShop\Component\Pimcore\PriorityQueue;

final class CompositeCustomerContext implements CustomerContextInterface
{
    /**
     * @var PriorityQueue|CustomerContextInterface[]
     *
     * @psalm-var PriorityQueue<CustomerContextInterface>
     */
    private PriorityQueue $customerContexts;

    public function __construct(
        ) {
        $this->customerContexts = new PriorityQueue();
    }

    public function addContext(CustomerContextInterface $customerContext, int $priority = 0): void
    {
        $this->customerContexts->insert($customerContext, $priority);
    }

    public function getCustomer(): CustomerInterface
    {
        foreach ($this->customerContexts as $customerContext) {
            try {
                return $customerContext->getCustomer();
            } catch (CustomerNotFoundException) {
                continue;
            }
        }

        throw new CustomerNotFoundException();
    }
}
