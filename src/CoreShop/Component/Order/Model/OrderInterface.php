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
use CoreShop\Component\Address\Model\AddressInterface;
use CoreShop\Component\Currency\Model\CurrencyAwareInterface;
use CoreShop\Component\Currency\Model\CurrencyInterface;
use CoreShop\Component\Customer\Model\CustomerAwareInterface;
use CoreShop\Component\Locale\Model\LocaleAwareInterface;
use CoreShop\Component\Payment\Model\PayableInterface;
use CoreShop\Component\Payment\Model\PaymentProviderInterface;
use CoreShop\Component\Resource\Model\ImmutableInterface;
use CoreShop\Component\Resource\Pimcore\Model\PimcoreModelInterface;
use CoreShop\Component\StorageList\Model\NameableStorageListInterface;
use CoreShop\Component\StorageList\Model\StorageListInterface;
use CoreShop\Component\Store\Model\StoreAwareInterface;
use Pimcore\Model\DataObject\Fieldcollection;
use Pimcore\Model\DataObject\Objectbrick;

interface OrderInterface extends
    PimcoreModelInterface,
    CurrencyAwareInterface,
    StoreAwareInterface,
    LocaleAwareInterface,
    AdjustableInterface,
    ConvertedAdjustableInterface,
    CustomerAwareInterface,
    PayableInterface,
    StorageListInterface,
    ImmutableInterface,
    NameableStorageListInterface
{
    public function getId(): ?int;

    public function getToken(): ?string;

    public function setToken(?string $token);

    public function getBackendCreated(): ?bool;

    public function setBackendCreated(?bool $backendCreated);

    public function getSaleState(): ?string;

    public function setSaleState(?string $saleState);

    public function getOrderState(): ?string;

    public function setOrderState(?string $orderState);

    public function getQuoteState(): ?string;

    public function setQuoteState(?string $quoteState);

    public function getShippingState(): ?string;

    public function setShippingState(?string $shippingState);

    public function getInvoiceState(): ?string;

    public function setInvoiceState(?string $invoiceState);

    public function getPaymentState(): ?string;

    public function setPaymentState(?string $paymentState);

    public function getOrderDate(): ?Carbon;

    public function setOrderDate(?Carbon $orderDate);

    public function getOrderNumber(): ?string;

    public function setOrderNumber(?string $orderNumber);

    public function getQuoteNumber(): ?string;

    public function setQuoteNumber(?string $quoteNumber);

    public function getBaseCurrency(): ?CurrencyInterface;

    public function setBaseCurrency(?CurrencyInterface $currency);

    public function getPaymentTotal(): ?int;

    public function setPaymentTotal(int $paymentTotal);

    public function getTotal(bool $withTax = true): int;

    public function setTotal(int $total, bool $withTax = true);

    public function getTotalTax(): int;

    public function getSubtotal(bool $withTax = true): int;

    public function setSubtotal(int $subtotal, bool $withTax = true);

    public function getSubtotalTax(): int;

    public function getDiscount(bool $withTax = true): int;

    /**
     * @return OrderItemInterface[]|null
     */
    public function getItems(): ?array;

    /**
     * @param OrderItemInterface[] $items
     */
    public function setItems(?array $items);

    public function hasItems(): bool;

    /**
     * @param OrderItemInterface $item
     */
    public function addItem($item): void;

    /**
     * @param OrderItemInterface $item
     */
    public function removeItem($item): void;

    /**
     * @param OrderItemInterface $item
     */
    public function hasItem($item): bool;

    public function setConvertedTotal(int $total, bool $withTax = true);

    public function getConvertedTotal(bool $withTax = true): int;

    public function getConvertedPaymentTotal(): ?int;

    public function setConvertedPaymentTotal(?int $convertedPaymentTotal);

    public function getConvertedTotalTax(): int;

    public function getConvertedSubtotal(bool $withTax = true): int;

    public function setConvertedSubtotal(int $subtotal, bool $withTax = true);

    public function getConvertedSubtotalTax(): int;

    public function getConvertedDiscount(bool $withTax = true): int;

    /**
     * @return Fieldcollection
     */
    public function getConvertedTaxes();

    public function setConvertedTaxes(?Fieldcollection $taxes);

    public function getConvertedShipping(bool $withTax = true): int;

    public function getConvertedShippingTax(): int;

    public function getShippingAddress(): ?AddressInterface;

    public function setShippingAddress(?AddressInterface $shippingAddress);

    public function getInvoiceAddress(): ?AddressInterface;

    public function setInvoiceAddress(?AddressInterface $invoiceAddress);

    public function getConvertedPaymentProviderFee(): int;

    /**
     * @return Fieldcollection
     */
    public function getTaxes();

    public function setTaxes(?Fieldcollection $taxes);

    public function getComment(): ?string;

    public function setComment(?string $comment);

    public function getAdditionalData(): ?Objectbrick;

    public function setAdditionalData(?Objectbrick $additionalData);

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

    public function getPaymentProvider(): ?PaymentProviderInterface;

    public function setPaymentProvider(?PaymentProviderInterface $paymentProvider);

    public function recalculateSubtotal(): void;
}
