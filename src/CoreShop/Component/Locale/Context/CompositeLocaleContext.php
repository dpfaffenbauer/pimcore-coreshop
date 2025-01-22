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

namespace CoreShop\Component\Locale\Context;

use CoreShop\Component\Pimcore\PriorityQueue;

final class CompositeLocaleContext implements LocaleContextInterface
{
    /**
     * @var PriorityQueue|LocaleContextInterface[]
     *
     * @psalm-var PriorityQueue<LocaleContextInterface>
     */
    private PriorityQueue $localeContexts;

    public function __construct(
        ) {
        $this->localeContexts = new PriorityQueue();
    }

    public function addContext(LocaleContextInterface $localeContext, int $priority = 0): void
    {
        $this->localeContexts->insert($localeContext, $priority);
    }

    public function getLocaleCode(): string
    {
        $lastException = null;

        foreach ($this->localeContexts as $localeContext) {
            try {
                return $localeContext->getLocaleCode();
            } catch (LocaleNotFoundException $exception) {
                $lastException = $exception;

                continue;
            }
        }

        throw new LocaleNotFoundException(null, $lastException);
    }
}
