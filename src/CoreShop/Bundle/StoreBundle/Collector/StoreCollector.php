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

namespace CoreShop\Bundle\StoreBundle\Collector;

use CoreShop\Component\Store\Context\StoreContextInterface;
use CoreShop\Component\Store\Model\StoreInterface;
use CoreShop\Component\Store\Repository\StoreRepositoryInterface;
use Pimcore\Http\Request\Resolver\PimcoreContextResolver;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\DataCollector\DataCollector;

final class StoreCollector extends DataCollector
{
    public function __construct(
        private StoreRepositoryInterface $storeRepository,
        private StoreContextInterface $storeContext,
        private PimcoreContextResolver $pimcoreContext,
        private $storeChangeSupport = false,
    ) {
        $this->data = [
            'store' => null,
        ];
    }

    public function getStore(): ?StoreInterface
    {
        return $this->data['store'];
    }

    /**
     * @return StoreInterface[]
     */
    public function getStores(): array
    {
        return $this->data['stores'];
    }

    public function isStoreChangeSupported(): bool
    {
        return $this->data['store_change_support'];
    }

    public function collect(Request $request, Response $response, ?\Throwable $exception = null): void
    {
        if ($this->pimcoreContext->matchesPimcoreContext($request, PimcoreContextResolver::CONTEXT_ADMIN)) {
            $this->data['admin'] = true;

            return;
        }

        try {
            $this->data = [
                'store' => $this->storeContext->getStore(),
                'stores' => $this->storeRepository->findAll(),
                'store_change_support' => $this->storeChangeSupport,
            ];
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
        return 'coreshop.store_collector';
    }
}
