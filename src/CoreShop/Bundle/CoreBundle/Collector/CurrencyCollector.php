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

namespace CoreShop\Bundle\CoreBundle\Collector;

use CoreShop\Component\Core\Repository\CurrencyRepositoryInterface;
use CoreShop\Component\Currency\Context\CurrencyContextInterface;
use CoreShop\Component\Currency\Model\CurrencyInterface;
use CoreShop\Component\Store\Context\StoreContextInterface;
use Pimcore\Http\Request\Resolver\PimcoreContextResolver;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\DataCollector\DataCollector;

final class CurrencyCollector extends DataCollector
{
    public function __construct(
        CurrencyRepositoryInterface $currencyRepository,
        private CurrencyContextInterface $currencyContext,
        StoreContextInterface $storeContext,
        private PimcoreContextResolver $pimcoreContext,
        $currencyChangeSupport = false,
    ) {
        try {
            $this->data = [
                'currency' => null,
                'currencies' => $currencyRepository->findActiveForStore($storeContext->getStore()),
                'currency_change_support' => $currencyChangeSupport,
            ];
        } catch (\Exception) {
            //If some goes wrong, we just ignore it
        }
    }

    public function getCurrency(): ?CurrencyInterface
    {
        return $this->data['currency'] ?? null;
    }

    public function getCurrencies(): array
    {
        return $this->data['currencies'];
    }

    public function isCurrencyChangeSupported(): bool
    {
        return $this->data['currency_change_support'];
    }

    public function collect(Request $request, Response $response, ?\Throwable $exception = null): void
    {
        if ($this->pimcoreContext->matchesPimcoreContext($request, PimcoreContextResolver::CONTEXT_ADMIN)) {
            $this->data['admin'] = true;

            return;
        }

        try {
            $this->data['currency'] = $this->currencyContext->getCurrency();
        } catch (\Exception) {
            //If some goes wrong, we just ignore it
        }
    }

    public function reset(): void
    {
        $this->data = [];
    }

    public function getName(): string
    {
        return 'coreshop.currency_collector';
    }
}
