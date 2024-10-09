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

namespace CoreShop\Behat\Context\Transform;

use Behat\Behat\Context\Context;
use CoreShop\Bundle\TestBundle\Service\SharedStorageInterface;
use CoreShop\Component\Order\Context\CartContextInterface;
use CoreShop\Component\Order\Model\OrderInterface;
use CoreShop\Component\Order\Repository\OrderRepositoryInterface;
use Symfony\Component\Form\FormInterface;

final class CartContext implements Context
{
    public function __construct(
        private SharedStorageInterface $sharedStorage,
        private OrderRepositoryInterface $cartRepository,
        private CartContextInterface $cartContext,
    ) {
    }

    /**
     * @Transform /^my cart/
     * @Transform /^cart(?:s)/
     */
    public function cart(): OrderInterface
    {
        return $this->cartContext->getCart();
    }

    /**
     * @Transform /^my add-to-cart-form/
     * @Transform /^add-to-cart-form(?:|s)/
     */
    public function addToCartForm(): FormInterface
    {
        return $this->sharedStorage->get('add_to_cart_form');
    }

    /**
     * @Transform /^loaded cart(?:|s)/
     */
    public function loadedCart(): OrderInterface
    {
        return $this->cartRepository->forceFind($this->cartContext->getCart()->getId());
    }
}
