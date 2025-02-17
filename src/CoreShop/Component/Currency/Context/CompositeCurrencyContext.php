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

namespace CoreShop\Component\Currency\Context;

use CoreShop\Component\Currency\Model\CurrencyInterface;
use CoreShop\Component\Pimcore\PriorityQueue;

final class CompositeCurrencyContext implements CurrencyContextInterface
{
    /**
     * @var PriorityQueue|CurrencyContextInterface[]
     *
     * @psalm-var PriorityQueue<CurrencyContextInterface>
     */
    private PriorityQueue $currencyContexts;

    public function __construct(
        ) {
        $this->currencyContexts = new PriorityQueue();
    }

    public function addContext(CurrencyContextInterface $currencyContext, int $priority = 0): void
    {
        $this->currencyContexts->insert($currencyContext, $priority);
    }

    public function getCurrency(): CurrencyInterface
    {
        $lastException = null;

        foreach ($this->currencyContexts as $currencyContext) {
            try {
                return $currencyContext->getCurrency();
            } catch (CurrencyNotFoundException $exception) {
                $lastException = $exception;

                continue;
            }
        }

        throw new CurrencyNotFoundException(null, $lastException);
    }
}
