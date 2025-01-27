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

namespace CoreShop\Bundle\OrderBundle\Factory;

use CoreShop\Bundle\OrderBundle\DTO\AddToCartInterface;
use CoreShop\Component\Order\Model\OrderInterface;
use CoreShop\Component\Order\Model\OrderItemInterface;

class AddToCartFactory implements AddToCartFactoryInterface
{
    /**
     * @psalm-param class-string $addToCartClass
     */
    public function __construct(
        protected string $addToCartClass,
    ) {
    }

    public function createWithCartAndCartItem(OrderInterface $cart, OrderItemInterface $cartItem): AddToCartInterface
    {
        $class = new $this->addToCartClass($cart, $cartItem);
        $implements = class_implements($class) ?: [];

        if (!in_array(AddToCartInterface::class, $implements, true)) {
            throw new \InvalidArgumentException(
                sprintf('%s needs to implement "%s".', $class::class, AddToCartInterface::class),
            );
        }

        return $class;
    }
}
