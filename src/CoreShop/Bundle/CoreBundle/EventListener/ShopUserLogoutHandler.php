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

namespace CoreShop\Bundle\CoreBundle\EventListener;

use CoreShop\Component\Core\Model\StoreInterface;
use CoreShop\Component\Store\Context\StoreContextInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Http\Event\LogoutEvent;

final class ShopUserLogoutHandler
{
    public function __construct(
        private RouterInterface $router,
        private string $routeName,
        private StoreContextInterface $storeContext,
    ) {
    }

    public function onLogoutSuccess(LogoutEvent $event): Response
    {
        $request = $event->getRequest();
        $store = $this->storeContext->getStore();

        if ($store instanceof StoreInterface) {
            $request->getSession()->remove(sprintf('coreshop.cart.%s',  $store->getId()));
        }

        return new RedirectResponse($this->router->generate($this->routeName, ['_locale' => $request->getLocale()]));
    }
}
