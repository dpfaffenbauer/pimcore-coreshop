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

namespace CoreShop\Bundle\CoreBundle\Controller;

use CoreShop\Bundle\OrderBundle\Controller\OrderController as BaseOrderController;
use CoreShop\Component\Core\Model\CarrierInterface;
use CoreShop\Component\Core\Model\OrderInterface as CoreOrderInterface;
use CoreShop\Component\Core\Model\OrderItemInterface as CoreOrderItemInterface;
use CoreShop\Component\Order\Model\OrderInterface;
use CoreShop\Component\Order\Model\OrderItemInterface;

class OrderController extends BaseOrderController
{
    protected function getDetails(OrderInterface $order, ?string $locale = null): array
    {
        $serialized = parent::getDetails($order, $locale);

        if ($order instanceof CoreOrderInterface) {
            $serialized['shippingPayment'] = [
                'carrier' => $order->getCarrier() instanceof CarrierInterface ? $order->getCarrier()->getIdentifier() : null,
                'weight' => $order->getWeight(),
                'cost' => $order->getShipping(),
            ];

            if ($order->getCarrier()) {
                $serialized['carrierInfo'] = [
                    'name' => $order->getCarrier()->getTitle(),
                ];
            }
        }

        return $serialized;
    }

    protected function getSummary(OrderInterface $order): array
    {
        $serialized = parent::getSummary($order);

        if ($order instanceof CoreOrderInterface && $order->getShipping() > 0) {
            $serialized[] = [
                'key' => 'shipping',
                'value' => $order->getShipping(),
                'convertedValue' => $order->getConvertedShipping(),
            ];

            $serialized[] = [
                'key' => 'shipping_tax',
                'value' => $order->getShippingTax(),
                'convertedValue' => $order->getConvertedShippingTax(),
            ];
        }

        if ($order instanceof CoreOrderInterface && $order->getPaymentProviderFee() > 0) {
            $serialized[] = [
                'key' => 'payment_provider_fee',
                'value' => $order->getPaymentProviderFee(),
                'convertedValue' => $order->getConvertedPaymentProviderFee(),
            ];
        }

        return $serialized;
    }

    protected function prepareSaleItem(OrderItemInterface $item): array
    {
        $serialized = parent::prepareSaleItem($item);

        if (!$item instanceof CoreOrderItemInterface) {
            return $serialized;
        }

        if (!is_string($item->getUnitIdentifier())) {
            return $serialized;
        }

        $serialized['unit'] = $item->hasUnitDefinition() ? $item->getUnitDefinition()->getUnit()->getFullLabel() : $item->getUnitIdentifier();

        return $serialized;
    }
}
