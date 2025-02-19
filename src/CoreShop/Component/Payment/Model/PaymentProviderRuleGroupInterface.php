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

use CoreShop\Component\Resource\Model\ResourceInterface;
use CoreShop\Component\Resource\Model\TimestampableInterface;

interface PaymentProviderRuleGroupInterface extends ResourceInterface, TimestampableInterface
{
    public function getId(): ?int;

    /**
     * @return PaymentProviderInterface
     */
    public function getPaymentProvider();

    public function setPaymentProvider(?PaymentProviderInterface $paymentProvider = null);

    /**
     * @return int
     */
    public function getPriority();

    /**
     * @param int $priority
     */
    public function setPriority($priority);

    /**
     * @return bool
     */
    public function getStopPropagation();

    /**
     * @param bool $stopPropagation
     */
    public function setStopPropagation($stopPropagation);

    /**
     * @return PaymentProviderRuleInterface
     */
    public function getPaymentProviderRule();

    public function setPaymentProviderRule(PaymentProviderRuleInterface $paymentProviderRule);
}
