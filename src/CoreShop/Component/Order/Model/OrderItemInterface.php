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

namespace CoreShop\Component\Order\Model;

use CoreShop\Component\Resource\Model\ImmutableInterface;
use CoreShop\Component\Resource\Pimcore\Model\PimcoreModelInterface;
use CoreShop\Component\StorageList\Model\StorageListItemInterface;
use Pimcore\Model\DataObject\Fieldcollection;

interface OrderItemInterface extends
    PimcoreModelInterface,
    AdjustableInterface,
    ConvertedAdjustableInterface,
    StorageListItemInterface,
    ImmutableInterface,
    AttributesAwareInterface
{
    public function getId(): ?int;

    public function getOrder(): ?OrderInterface;

    public function setOrder(OrderInterface $order);

    public function getProduct(): ?PurchasableInterface;

    public function setProduct(?PurchasableInterface $product);

    public function getName(): ?string;

    public function setName(?string $name, ?string $language = null);

    public function getSubtotal(bool $withTax = true): int;

    public function setSubtotal(int $subtotal, bool $withTax = true);

    public function getTotal(bool $withTax = true): int;

    public function setTotal(int $total, bool $withTax = true);

    public function getIsGiftItem(): ?bool;

    public function setIsGiftItem(?bool $isGiftItem);

    public function getQuantity(): ?float;

    public function setQuantity(?float $quantity);

    public function getCustomItemPrice(): int;

    public function setCustomItemPrice(int $customItemPrice);

    public function getCustomItemDiscount(): ?float;

    public function setCustomItemDiscount(?float $customItemPrice);

    public function getItemPrice(bool $withTax = true): int;

    public function setItemPrice(int $itemPrice, bool $withTax = true);

    public function getItemRetailPrice(bool $withTax = true): int;

    public function setItemRetailPrice(int $itemRetailPrice, bool $withTax = true);

    public function getItemDiscountPrice(bool $withTax = true): int;

    public function setItemDiscountPrice(int $itemDiscountPrice, bool $withTax = true);

    public function getItemDiscount(bool $withTax = true): int;

    public function setItemDiscount(int $itemDiscount, bool $withTax = true);

    public function getItemWholesalePrice(): int;

    public function setItemWholesalePrice(int $itemWholesalePrice);

    public function getItemTax(): int;

    public function setItemTax(int $itemTax);

    public function getTotalTax(): int;

    public function getDiscount(bool $withTax = true): int;

    /**
     * @return Fieldcollection|null
     */
    public function getTaxes();

    /**
     * @param ?Fieldcollection $taxes
     */
    public function setTaxes(?Fieldcollection $taxes);

    public function setConvertedItemWholesalePrice(int $convertedItemWholesalePrice);

    public function getConvertedCustomItemPrice(): int;

    public function setConvertedCustomItemPrice(int $convertedCustomItemPrice);

    public function getConvertedItemPrice(bool $withTax = true): int;

    public function setConvertedItemPrice(int $itemPrice, bool $withTax = true);

    public function getConvertedItemRetailPrice(bool $withTax = true): int;

    public function setConvertedItemRetailPrice(int $itemRetailPrice, bool $withTax = true);

    public function getConvertedItemTax(): int;

    public function setConvertedItemTax(int $itemTax);

    /**
     * @return ?Fieldcollection
     */
    public function getConvertedTaxes();

    /**
     * @param ?Fieldcollection $taxes
     */
    public function setConvertedTaxes(?Fieldcollection $taxes);

    public function getConvertedTotal(bool $withTax = true): int;

    public function getConvertedSubtotal(bool $withTax = true): int;

    public function getConvertedTotalTax(): int;

    public function setConvertedTotal(int $total, bool $withTax = true);

    public function setConvertedSubtotal(int $subtotal, bool $withTax = true);

    public function getConvertedItemDiscountPrice(bool $withTax = true): int;

    public function setConvertedItemDiscountPrice(int $convertedItemDiscountPrice, bool $withTax = true);

    public function getConvertedItemDiscount(bool $withTax = true): int;

    public function setConvertedItemDiscount(int $convertedItemDiscount, bool $withTax = true);

    /**
     * @return Fieldcollection|null
     */
    public function getPriceRuleItems();

    public function setPriceRuleItems(Fieldcollection $priceRuleItems);

    /**
     * @return PriceRuleItemInterface[]
     */
    public function getPriceRules(): array;

    public function hasPriceRules(): bool;

    public function addPriceRule(PriceRuleItemInterface $priceRule): void;

    public function removePriceRule(PriceRuleItemInterface $priceRule): void;

    public function hasPriceRule(PriceRuleItemInterface $priceRule): bool;

    public function hasCartPriceRule(
        CartPriceRuleInterface $cartPriceRule,
        ?CartPriceRuleVoucherCodeInterface $voucherCode = null,
    ): bool;

    public function getPriceRuleByCartPriceRule(
        CartPriceRuleInterface $cartPriceRule,
        ?CartPriceRuleVoucherCodeInterface $voucherCode = null,
    ): ?PriceRuleItemInterface;
}
