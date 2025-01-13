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

namespace CoreShop\Bundle\OrderBundle\EventListener;

use CoreShop\Component\Order\Context\CartContextInterface;
use CoreShop\Component\Order\Context\CartNotFoundException;
use Pimcore\Http\Request\Resolver\PimcoreContextResolver;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;

final class SessionCartSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private PimcoreContextResolver $pimcoreContext,
        private CartContextInterface $cartContext,
        private string $sessionKeyName,
    ) {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::RESPONSE => ['onKernelResponse'],
        ];
    }

    public function onKernelResponse(ResponseEvent $event): void
    {
        if ($this->pimcoreContext->matchesPimcoreContext($event->getRequest(), PimcoreContextResolver::CONTEXT_ADMIN)) {
            return;
        }

        if (!$event->isMainRequest()) {
            return;
        }

        if ($event->getRequest()->attributes->get('_route') === '_wdt') {
            return;
        }

        /** @var Request $request */
        $request = $event->getRequest();

        if (!$request->hasSession()) {
            return;
        }

        try {
            $cart = $this->cartContext->getCart();
        } catch (CartNotFoundException) {
            return;
        }

        if (0 !== $cart->getId() && null !== $cart->getId() && null !== $cart->getStore()) {
            $session = $request->getSession();

            $session->set(
                sprintf('%s.%s', $this->sessionKeyName, $cart->getStore()->getId()),
                $cart->getId(),
            );
        }
    }
}
