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

namespace CoreShop\Component\Shipping\Model;

use CoreShop\Component\Resource\Model\SetValuesTrait;
use CoreShop\Component\Resource\Model\TimestampableTrait;

/**
 * @psalm-suppress MissingConstructor
 */
class ShippingRuleGroup implements ShippingRuleGroupInterface
{
    use TimestampableTrait;
    use SetValuesTrait;

    /**
     * @var int
     */
    private $id;

    /**
     * @var CarrierInterface
     */
    private $carrier;

    /**
     * @var int
     */
    private $priority;

    /**
     * @var bool
     */
    private $stopPropagation = false;

    /**
     * @var ShippingRuleInterface
     */
    private $shippingRule;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCarrier()
    {
        return $this->carrier;
    }

    public function setCarrier(?CarrierInterface $carrier = null)
    {
        $this->carrier = $carrier;
    }

    public function getPriority()
    {
        return $this->priority;
    }

    public function setPriority($priority)
    {
        $this->priority = $priority;
    }

    public function getStopPropagation()
    {
        return $this->stopPropagation;
    }

    public function setStopPropagation($stopPropagation)
    {
        $this->stopPropagation = $stopPropagation;
    }

    public function getShippingRule()
    {
        return $this->shippingRule;
    }

    public function setShippingRule(ShippingRuleInterface $shippingRule)
    {
        $this->shippingRule = $shippingRule;
    }
}
