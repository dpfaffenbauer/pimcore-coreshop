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

namespace CoreShop\Bundle\FrontendBundle\Controller\Extend;

use CoreShop\Bundle\FrontendBundle\Controller\FrontendController;
use CoreShop\Component\Core\Context\ShopperContextInterface;
use Psr\Container\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;

class CartWidgetController extends FrontendController
{
    private ShopperContextInterface $shopperContext;

    public function __construct(
        ShopperContextInterface $shopperContext,
        ContainerInterface $container,
    ) {
        parent::__construct($container);
        $this->shopperContext = $shopperContext;
    }

    public function cartNumberAction(): JsonResponse
    {
        $items = $this->shopperContext->getCart()->getItems();

        return new JsonResponse(count($items));
    }
}
