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

namespace CoreShop\Component\Shipping\Validator;

use CoreShop\Component\Address\Model\AddressInterface;
use CoreShop\Component\Pimcore\PriorityQueue;
use CoreShop\Component\Shipping\Model\CarrierInterface;
use CoreShop\Component\Shipping\Model\ShippableInterface;

class CompositeShippableCarrierValidator implements ShippableCarrierValidatorInterface
{
    private PriorityQueue $shippableCarrierValidator;

    public function __construct(
        ) {
        $this->shippableCarrierValidator = new PriorityQueue();
    }

    public function addValidator(ShippableCarrierValidatorInterface $shippableCarrierValidator, int $priority = 0): void
    {
        $this->shippableCarrierValidator->insert($shippableCarrierValidator, $priority);
    }

    public function isCarrierValid(CarrierInterface $carrier, ShippableInterface $shippable, AddressInterface $address): bool
    {
        foreach ($this->shippableCarrierValidator as $shippableCarrierValidator) {
            $isValid = $shippableCarrierValidator->isCarrierValid($carrier, $shippable, $address);

            if (false === $isValid) {
                return false;
            }
        }

        return true;
    }
}
