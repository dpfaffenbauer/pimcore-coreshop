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

use Carbon\Carbon;
use CoreShop\Component\Resource\Exception\ImplementedByPimcoreException;
use CoreShop\Component\Resource\Pimcore\Model\AbstractPimcoreModel;

abstract class OrderInvoice extends AbstractPimcoreModel implements OrderInvoiceInterface
{
    use AdjustableTrait;
    use ConvertedAdjustableTrait;

    public static function getDocumentType(): string
    {
        return 'invoice';
    }

    public function getPrintBodyController(array $params = []): string
    {
        return 'CoreShop\Bundle\OrderBundle\Controller\OrderDocumentPrintController::invoiceAction';
    }

    public function getPrintHeaderController(array $params = []): string
    {
        return 'CoreShop\Bundle\OrderBundle\Controller\OrderDocumentPrintController::headerAction';
    }

    public function getPrintFooterController(array $params = []): string
    {
        return 'CoreShop\Bundle\OrderBundle\Controller\OrderDocumentPrintController::footerAction';
    }

    public function getTotalTax(): int
    {
        return $this->getTotal(true) - $this->getTotal(false);
    }

    public function getConvertedTotalTax(): int
    {
        return $this->getConvertedTotal(true) - $this->getConvertedTotal(false);
    }

    public function getDiscountTax(): int
    {
        return $this->getDiscount(true) - $this->getDiscount(false);
    }

    public function getShippingTax(): int
    {
        return $this->getShipping(true) - $this->getShipping(false);
    }

    public function getSubtotalTax(): int
    {
        return $this->getSubtotal(true) - $this->getSubtotal(false);
    }

    public function getConvertedDiscountTax(): int
    {
        return $this->getConvertedDiscount(true) - $this->getConvertedDiscount(false);
    }

    public function getConvertedShippingTax(): int
    {
        return $this->getConvertedShipping(true) - $this->getConvertedShipping(false);
    }

    public function getConvertedSubtotalTax(): int
    {
        return $this->getConvertedSubtotal(true) - $this->getConvertedSubtotal(false);
    }

    public function getRenderedAsset()
    {
        return $this->getProperty('rendered_asset');
    }

    public function setRenderedAsset($renderedAsset)
    {
        $this->setProperty('rendered_asset', 'asset', $renderedAsset);
    }

    public function getDocumentDate(): ?Carbon
    {
        return $this->getInvoiceDate();
    }

    public function setDocumentDate(?Carbon $documentDate)
    {
        return $this->setInvoiceDate($documentDate);
    }

    public function getDocumentNumber(): ?string
    {
        return $this->getInvoiceNumber();
    }

    public function setDocumentNumber(?string $documentNumber)
    {
        return $this->setInvoiceNumber($documentNumber);
    }

    public function getDiscount(bool $withTax = true): int
    {
        return $this->getAdjustmentsTotal(AdjustmentInterface::CART_PRICE_RULE, $withTax);
    }

    public function getSubtotal(bool $withTax = true): int
    {
        return $withTax ? $this->getSubtotalGross() : $this->getSubtotalNet();
    }

    public function setSubtotal(int $subtotal, bool $withTax = true)
    {
        $withTax ? $this->setSubtotalGross($subtotal) : $this->setSubtotalNet($subtotal);
    }

    public function getTotal(bool $withTax = true): int
    {
        return $withTax ? $this->getTotalGross() : $this->getTotalNet();
    }

    public function setTotal(int $total, bool $withTax = true)
    {
        $withTax ? $this->setTotalGross($total) : $this->setTotalNet($total);
    }

    public function getShipping(bool $withTax = true): int
    {
        return $this->getAdjustmentsTotal(AdjustmentInterface::SHIPPING, $withTax);
    }

    public function getConvertedDiscount(bool $withTax = true): int
    {
        return $this->getConvertedAdjustmentsTotal(AdjustmentInterface::CART_PRICE_RULE, $withTax);
    }

    public function getConvertedSubtotal(bool $withTax = true): int
    {
        return $withTax ? $this->getConvertedSubtotalGross() : $this->getConvertedSubtotalNet();
    }

    public function setConvertedSubtotal(int $convertedSubtotal, bool $withTax = true)
    {
        $withTax ? $this->setConvertedSubtotalGross($convertedSubtotal) : $this->setConvertedSubtotalNet($convertedSubtotal);
    }

    public function getConvertedTotal(bool $withTax = true): int
    {
        return $withTax ? $this->getConvertedTotalGross() : $this->getConvertedTotalNet();
    }

    public function setConvertedTotal(int $convertedTotal, bool $withTax = true)
    {
        $withTax ? $this->setConvertedTotalGross($convertedTotal) : $this->setConvertedTotalNet($convertedTotal);
    }

    public function getConvertedShipping(bool $withTax = true): int
    {
        return $this->getConvertedAdjustmentsTotal(AdjustmentInterface::SHIPPING, $withTax);
    }

    public function getTotalNet(): int
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setTotalNet(int $total)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function getTotalGross(): int
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setTotalGross(int $total)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function getSubtotalNet(): int
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setSubtotalNet(int $subTotalNet)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function getSubtotalGross(): int
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setSubtotalGross(int $subTotalGross)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function getShippingNet(): int
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

    public function setConvertedTotalGross(int $convertedTotal)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function getConvertedSubtotalNet(): int
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setConvertedSubtotalNet(int $convertedSubTotalNet)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function getConvertedSubtotalGross(): int
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setConvertedSubtotalGross(int $convertedSubTotalGross)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    protected function recalculateAfterAdjustmentChange(): void
    {
    }

    protected function recalculateConvertedAfterAdjustmentChange(): void
    {
    }
}
