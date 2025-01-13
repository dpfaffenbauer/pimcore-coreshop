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

namespace CoreShop\Component\Product\Calculator;

use CoreShop\Component\Product\Model\ProductInterface;
use Symfony\Component\HttpFoundation\RequestStack;

final class MemoryCachedProductPriceCalculator implements ProductPriceCalculatorInterface
{
    private array $cachedPrice = [];

    private array $cachedRetailPrice = [];

    private array $cachedDiscountPrice = [];

    private array $cachedDiscount = [];

    private array $cachedIsDiscountable = [];

    public function __construct(
        private ProductPriceCalculatorInterface $inner,
        private RequestStack $requestStack,
    ) {
    }

    public function getPrice(ProductInterface $product, array $context, bool $withDiscount = false): int
    {
        if (!$this->requestStack->getCurrentRequest()) {
            return $this->inner->getPrice($product, $context, $withDiscount);
        }

        $identifier = sprintf('%s%s', $product->getId(), (string) $withDiscount);

        if (!isset($this->cachedPrice[$identifier])) {
            $this->cachedPrice[$identifier] = $this->inner->getPrice($product, $context, $withDiscount);
        }

        return $this->cachedPrice[$identifier];
    }

    public function getRetailPrice(ProductInterface $product, array $context): int
    {
        if (!$this->requestStack->getCurrentRequest()) {
            return $this->inner->getRetailPrice($product, $context);
        }

        if (!isset($this->cachedRetailPrice[$product->getId()])) {
            $this->cachedRetailPrice[$product->getId()] = $this->inner->getRetailPrice($product, $context);
        }

        return $this->cachedRetailPrice[$product->getId()];
    }

    public function getDiscountPrice(ProductInterface $product, array $context): int
    {
        if (!$this->requestStack->getCurrentRequest()) {
            return $this->inner->getDiscountPrice($product, $context);
        }

        if (!isset($this->cachedDiscountPrice[$product->getId()])) {
            $this->cachedDiscountPrice[$product->getId()] = $this->inner->getDiscountPrice($product, $context);
        }

        return $this->cachedDiscountPrice[$product->getId()];
    }

    public function getDiscount(ProductInterface $product, array $context, int $price): int
    {
        if (!$this->requestStack->getCurrentRequest()) {
            return $this->inner->getDiscount($product, $context, $price);
        }

        if (!isset($this->cachedDiscount[$product->getId()])) {
            $this->cachedDiscount[$product->getId()] = $this->inner->getDiscount($product, $context, $price);
        }

        return $this->cachedDiscount[$product->getId()];
    }

    public function getCustomAttributes(ProductInterface $product, array $context): array
    {
        if (!$this->requestStack->getCurrentRequest()) {
            return $this->inner->getCustomAttributes($product, $context);
        }

        if (!isset($this->cachedDiscount[$product->getId()])) {
            $this->cachedIsDiscountable[$product->getId()] = $this->inner->getCustomAttributes($product, $context);
        }

        return $this->cachedIsDiscountable[$product->getId()];
    }
}
