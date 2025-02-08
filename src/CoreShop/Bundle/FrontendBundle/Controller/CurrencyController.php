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

namespace CoreShop\Bundle\FrontendBundle\Controller;

use CoreShop\Component\Core\Context\ShopperContextInterface;
use CoreShop\Component\Core\Currency\CurrencyStorageInterface;
use CoreShop\Component\Core\Model\CurrencyInterface;
use CoreShop\Component\Core\Repository\CurrencyRepositoryInterface;
use CoreShop\Component\Order\Context\CartContextInterface;
use CoreShop\Component\Order\Manager\CartManagerInterface;
use CoreShop\Component\Store\Context\StoreContextInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class CurrencyController extends FrontendController
{
    public function widgetAction(Request $request): Response
    {
        $currencies = $this->get('coreshop.repository.currency')->findActiveForStore($this->get(ShopperContextInterface::class)->getStore());

        return $this->render($this->templateConfigurator->findTemplate('Currency/_widget.html'), [
            'currencies' => $currencies,
        ]);
    }

    public function switchAction(Request $request): Response
    {
        $this->denyAccessUnlessGranted('CORESHOP_CURRENCY_SWITCH');

        $currencyCode = $this->getParameterFromRequest($request, 'currencyCode');
        $currency = $this->getCurrencyRepository()->getByCode($currencyCode);

        if (!$currency instanceof CurrencyInterface) {
            throw $this->createNotFoundException();
        }

        $cartManager = $this->get(CartManagerInterface::class);
        $cartContext = $this->get(CartContextInterface::class);
        $cart = $cartContext->getCart();

        $store = $this->get(StoreContextInterface::class)->getStore();
        $this->get(CurrencyStorageInterface::class)->set($store, $currency);

        $cart->setCurrency($currency);

        if ($cart->hasItems()) {
            $cartManager->persistCart($cart);
        }

        return new RedirectResponse($request->headers->get('referer', $request->getSchemeAndHttpHost()));
    }

    protected function getCurrencyRepository(): CurrencyRepositoryInterface
    {
        return $this->get('coreshop.repository.currency');
    }
}
