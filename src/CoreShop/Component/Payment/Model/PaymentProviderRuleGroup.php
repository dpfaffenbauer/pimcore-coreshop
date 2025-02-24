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

namespace CoreShop\Component\Payment\Model;

use CoreShop\Component\Resource\Model\SetValuesTrait;
use CoreShop\Component\Resource\Model\TimestampableTrait;

/**
 * @psalm-suppress MissingConstructor
 */
class PaymentProviderRuleGroup implements PaymentProviderRuleGroupInterface
{
    use TimestampableTrait;
    use SetValuesTrait;

    /**
     * @var int
     */
    private $id;

    /**
     * @var PaymentProviderInterface
     */
    private $paymentProvider;

    /**
     * @var int
     */
    private $priority;

    /**
     * @var bool
     */
    private $stopPropagation = false;

    /**
     * @var PaymentProviderRuleInterface
     */
    private $paymentProviderRule;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getPaymentProvider()
    {
        return $this->paymentProvider;
    }

    public function setPaymentProvider(?PaymentProviderInterface $paymentProvider = null)
    {
        $this->paymentProvider = $paymentProvider;
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

    public function getPaymentProviderRule()
    {
        return $this->paymentProviderRule;
    }

    public function setPaymentProviderRule(PaymentProviderRuleInterface $paymentProviderRule)
    {
        $this->paymentProviderRule = $paymentProviderRule;
    }
}
