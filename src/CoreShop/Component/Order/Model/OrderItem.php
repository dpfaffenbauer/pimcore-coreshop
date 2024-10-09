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

use CoreShop\Component\Resource\Exception\ImplementedByPimcoreException;
use CoreShop\Component\Resource\Model\ImmutableTrait;
use CoreShop\Component\Resource\Pimcore\Model\AbstractPimcoreModel;
use CoreShop\Component\StorageList\Model\StorageListInterface;
use CoreShop\Component\StorageList\Model\StorageListItemInterface;
use CoreShop\Component\Taxation\Model\TaxItemInterface;
use Pimcore\Model\DataObject\Fieldcollection;
use Webmozart\Assert\Assert;

abstract class OrderItem extends AbstractPimcoreModel implements OrderItemInterface
{
    use AdjustableTrait;
    use ConvertedAdjustableTrait;
    use ProposalPriceRuleTrait;
    use ImmutableTrait;
    use AttributesAwareTrait;

    public function equals(StorageListItemInterface $storageListItem): bool
    {
        if ($this->getIsGiftItem()) {
            return false;
        }

        return $storageListItem->getProduct() instanceof PurchasableInterface &&
            $this->getProduct() instanceof PurchasableInterface &&
            $storageListItem->getProduct()->getId() === $this->getProduct()->getId();
    }

    public function getTotal(bool $withTax = true): int
    {
        return $withTax ? $this->getTotalGross() : $this->getTotalNet();
    }

    public function setTotal(int $total, bool $withTax = true)
    {
        $withTax ? $this->setTotalGross($total) : $this->setTotalNet($total);
    }

    public function getSubtotal(bool $withTax = true): int
    {
        return $withTax ? $this->getSubtotalGross() : $this->getSubtotalNet();
    }

    public function setSubtotal(int $subtotal, bool $withTax = true)
    {
        $withTax ? $this->setSubtotalGross($subtotal) : $this->setSubtotalNet($subtotal);
    }

    public function getItemPrice(bool $withTax = true): int
    {
        return $withTax ? $this->getItemPriceGross() : $this->getItemPriceNet();
    }

    public function setItemPrice(int $itemPrice, bool $withTax = true)
    {
        $withTax ? $this->setItemPriceGross($itemPrice) : $this->setItemPriceNet($itemPrice);
    }

    public function getItemRetailPrice(bool $withTax = true): int
    {
        return $withTax ? $this->getItemRetailPriceGross() : $this->getItemRetailPriceNet();
    }

    public function setItemRetailPrice(int $itemRetailPrice, bool $withTax = true)
    {
        $withTax ? $this->setItemRetailPriceGross($itemRetailPrice) : $this->setItemRetailPriceNet($itemRetailPrice);
    }

    public function getItemDiscountPrice(bool $withTax = true): int
    {
        return $withTax ? $this->getItemDiscountPriceGross() : $this->getItemDiscountPriceNet();
    }

    public function setItemDiscountPrice(int $itemDiscountPrice, bool $withTax = true)
    {
        $withTax ? $this->setItemDiscountPriceGross($itemDiscountPrice) : $this->setItemDiscountPriceNet($itemDiscountPrice);
    }

    public function getItemDiscount(bool $withTax = true): int
    {
        return $withTax ? $this->getItemDiscountGross() : $this->getItemDiscountNet();
    }

    public function setItemDiscount(int $itemDiscount, bool $withTax = true)
    {
        $withTax ? $this->setItemDiscountGross($itemDiscount) : $this->setItemDiscountNet($itemDiscount);
    }

    public function getConvertedItemPrice(bool $withTax = true): int
    {
        return $withTax ? $this->getConvertedItemPriceGross() : $this->getConvertedItemPriceNet();
    }

    public function setConvertedItemPrice(int $itemPrice, bool $withTax = true)
    {
        $withTax ? $this->setConvertedItemPriceGross($itemPrice) : $this->setConvertedItemPriceNet($itemPrice);
    }

    public function getConvertedItemRetailPrice(bool $withTax = true): int
    {
        return $withTax ? $this->getConvertedItemRetailPriceGross() : $this->getConvertedItemRetailPriceNet();
    }

    public function setConvertedItemRetailPrice(int $itemRetailPrice, bool $withTax = true)
    {
        $withTax ? $this->setConvertedItemRetailPriceGross($itemRetailPrice) : $this->setConvertedItemRetailPriceNet(
            $itemRetailPrice,
        );
    }

    public function getConvertedSubtotal(bool $withTax = true): int
    {
        return $withTax ? $this->getConvertedSubtotalGross() : $this->getConvertedSubtotalNet();
    }

    public function setConvertedSubtotal(int $subtotal, bool $withTax = true)
    {
        $withTax ? $this->setConvertedSubtotalGross($subtotal) : $this->setConvertedSubtotalNet($subtotal);
    }

    public function getConvertedTotal(bool $withTax = true): int
    {
        return $withTax ? $this->getConvertedTotalGross() : $this->getConvertedTotalNet();
    }

    public function setConvertedTotal(int $total, bool $withTax = true)
    {
        $withTax ? $this->setConvertedTotalGross($total) : $this->setConvertedTotalNet($total);
    }

    public function getConvertedItemDiscount(bool $withTax = true): int
    {
        return $withTax ? $this->getConvertedItemDiscountGross() : $this->getConvertedItemDiscountNet();
    }

    public function setConvertedItemDiscount(int $convertedItemDiscount, bool $withTax = true)
    {
        $withTax ? $this->setConvertedItemDiscountGross($convertedItemDiscount) : $this->setConvertedItemDiscountNet($convertedItemDiscount);
    }

    public function getConvertedItemDiscountPrice(bool $withTax = true): int
    {
        return $withTax ? $this->getConvertedItemDiscountPriceGross() : $this->getConvertedItemDiscountPriceNet();
    }

    public function setConvertedItemDiscountPrice(int $convertedItemDiscountPrice, bool $withTax = true)
    {
        $withTax ? $this->setConvertedItemDiscountPriceGross($convertedItemDiscountPrice) : $this->setConvertedItemDiscountPriceNet($convertedItemDiscountPrice);
    }

    public function getTotalTax(): int
    {
        if (!$this->getTaxes() instanceof Fieldcollection) {
            return 0;
        }

        $totalTax = 0;

        foreach ($this->getTaxes()->getItems() as $taxItem) {
            if (!$taxItem instanceof TaxItemInterface) {
                continue;
            }

            $totalTax += $taxItem->getAmount();
        }

        return $totalTax;
    }

    public function getConvertedTotalTax(): int
    {
        if (!$this->getConvertedTaxes() instanceof Fieldcollection) {
            return 0;
        }

        $totalTax = 0;

        foreach ($this->getConvertedTaxes()->getItems() as $taxItem) {
            if (!$taxItem instanceof TaxItemInterface) {
                continue;
            }

            $totalTax += $taxItem->getAmount();
        }

        return $totalTax;
    }

    public function getStorageList(): ?StorageListInterface
    {
        return $this->getOrder();
    }

    public function setStorageList(StorageListInterface $storageList)
    {
        /**
         * @var OrderInterface $storageList
         */
        Assert::isInstanceOf($storageList, OrderInterface::class);

        $this->setOrder($storageList);
    }

    public function getOrder(): ?OrderInterface
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setOrder(OrderInterface $order)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function getDiscount(bool $withTax = true): int
    {
        return $this->getAdjustmentsTotal(AdjustmentInterface::CART_PRICE_RULE, $withTax);
    }

    public function getSubtotalNet(): int
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setSubtotalNet(int $totalNet)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function getSubtotalGross(): int
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setSubtotalGross(int $totalGross)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function getTotalNet(): int
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setTotalNet(int $totalNet)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function getTotalGross(): int
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setTotalGross(int $totalGross)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function getCustomItemPrice(): int
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setCustomItemPrice(int $customItemPrice)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function getCustomItemDiscount(): ?float
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setCustomItemDiscount(?float $customItemPrice)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function getItemPriceNet(): int
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setItemPriceNet(int $itemPriceNet)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function getItemPriceGross(): int
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setItemPriceGross(int $itemPriceGross)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function getItemRetailPriceNet(): int
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setItemRetailPriceNet(int $itemRetailPriceNet)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function getItemRetailPriceGross(): int
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setItemRetailPriceGross(int $itemRetailPriceGross)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function getItemDiscountPriceNet(): int
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setItemDiscountPriceNet(int $itemDiscountPriceNet)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function getItemDiscountPriceGross(): int
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setItemDiscountPriceGross(int $itemDiscountPriceGross)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function getItemDiscountNet(): int
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setItemDiscountNet(int $itemDiscountNet)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function getItemDiscountGross(): int
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setItemDiscountGross(int $itemDiscountGross)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function getItemWholesalePrice(): int
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setItemWholesalePrice(int $itemWholesalePrice)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function getItemTax(): int
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setItemTax(int $itemTax)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function getProduct(): ?PurchasableInterface
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setProduct(?PurchasableInterface $product)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function getQuantity(): ?float
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setQuantity(?float $quantity)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function getIsGiftItem(): ?bool
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setIsGiftItem(?bool $isGiftItem)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function getTaxes()
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setTaxes(?Fieldcollection $taxes)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function getConvertedCustomItemPrice(): int
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setConvertedCustomItemPrice(int $convertedCustomItemPrice)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function getConvertedItemPriceNet(): int
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setConvertedItemPriceNet(int $itemPriceNet)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function getConvertedItemPriceGross(): int
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setConvertedItemPriceGross(int $itemPriceGross)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function getConvertedItemRetailPriceNet(): int
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setConvertedItemRetailPriceNet(int $itemPriceNet)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function getConvertedItemRetailPriceGross(): int
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setConvertedItemRetailPriceGross(int $itemPriceGross)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function getConvertedItemWholesalePrice(): int
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setConvertedItemWholesalePrice(int $convertedItemWholesalePrice)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function getConvertedItemTax(): int
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setConvertedItemTax(int $itemTax)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function getConvertedTaxes()
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setConvertedTaxes(?Fieldcollection $taxes)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function getConvertedSubtotalNet(): int
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setConvertedSubtotalNet(int $subtotal)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function getConvertedSubtotalGross(): int
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setConvertedSubtotalGross(int $subtotal)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function getConvertedTotalNet(): int
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setConvertedTotalNet(int $total)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function getConvertedTotalGross(): int
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setConvertedTotalGross(int $total)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function getConvertedItemDiscountNet(): int
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setConvertedItemDiscountNet(int $convertedItemDiscountNet)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function getConvertedItemDiscountGross(): int
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setConvertedItemDiscountGross(int $convertedItemDiscountGross)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function getConvertedItemDiscountPriceNet(): int
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setConvertedItemDiscountPriceNet(int $convertedItemDiscountPriceNet)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function getConvertedItemDiscountPriceGross(): int
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setConvertedItemDiscountPriceGross(int $convertedItemDiscountPriceGross)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    protected function recalculateAfterAdjustmentChange(): void
    {
        $this->setTotal($this->getSubtotal(true) + $this->getAdjustmentsTotal(null, true), true);
        $this->setTotal($this->getSubtotal(false) + $this->getAdjustmentsTotal(null, false), false);
    }

    protected function recalculateConvertedAfterAdjustmentChange(): void
    {
        $this->setConvertedTotal($this->getConvertedSubtotal(true) + $this->getConvertedAdjustmentsTotal(null, true), true);
        $this->setConvertedTotal($this->getConvertedSubtotal(false) + $this->getConvertedAdjustmentsTotal(null, false), false);
    }
}
