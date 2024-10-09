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

namespace CoreShop\Component\Core\Model;

use CoreShop\Component\Order\Model\AdjustmentInterface;
use CoreShop\Component\Order\Model\Order as BaseOrder;
use CoreShop\Component\Resource\Exception\ImplementedByPimcoreException;
use CoreShop\Component\Shipping\Model\CarrierAwareTrait;

abstract class Order extends BaseOrder implements OrderInterface
{
    use CarrierAwareTrait;

    public function getName(): ?string
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function setName(?string $name)
    {
        throw new ImplementedByPimcoreException(__CLASS__, __METHOD__);
    }

    public function getShipping(bool $withTax = true): int
    {
        return $withTax ? $this->getAdjustmentsTotal(AdjustmentInterface::SHIPPING, true) : $this->getAdjustmentsTotal(AdjustmentInterface::SHIPPING, false);
    }

    public function getPaymentProviderFee(): int
    {
        return $this->getAdjustmentsTotal(AdjustmentInterface::PAYMENT, true);
    }

    public function getShippingTax(): int
    {
        return $this->getShipping(true) - $this->getShipping(false);
    }

    public function hasShippableItems(): ?bool
    {
        $shippable = false;
        /** @var OrderItemInterface $item */
        foreach ($this->getItems() as $item) {
            if ($item->getDigitalProduct() !== true) {
                $shippable = true;

                break;
            }
        }

        return $shippable;
    }
}
