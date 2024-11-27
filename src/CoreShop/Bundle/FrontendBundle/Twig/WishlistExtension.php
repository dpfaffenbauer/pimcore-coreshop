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

namespace CoreShop\Bundle\FrontendBundle\Twig;

use CoreShop\Component\Order\Model\PurchasableInterface;
use CoreShop\Component\StorageList\Context\StorageListContextInterface;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

final class WishlistExtension extends AbstractExtension
{
    public function __construct(
        private StorageListContextInterface $wishlistContext
    ) {
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction('coreshop_wishlist_product_in', [$this, 'isProductInWishlist']),
            new TwigFunction('coreshop_wishlist_product_id', [$this, 'wishlistProductId']),
        ];
    }

    public function isProductInWishlist(PurchasableInterface $purchasable): bool
    {
        $list = $this->wishlistContext->getStorageList();

        foreach ($list->getItems() as $item) {
            if ($item->getProduct()?->getId() === $purchasable->getId()) {
                return true;
            }
        }

        return false;
    }

    public function wishlistProductId(PurchasableInterface $purchasable): ?int
    {
        $list = $this->wishlistContext->getStorageList();

        foreach ($list->getItems() as $item) {
            if ($item->getProduct()?->getId() === $purchasable->getId()) {
                return $item->getId();
            }
        }

        return null;
    }
}
