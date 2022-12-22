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

interface PaymentInterface extends \Payum\Core\Model\PaymentInterface, ResourceInterface, TimestampableInterface
{
    public const STATE_NEW = 'new';
    public const STATE_AUTHORIZED = 'authorized';
    public const STATE_PROCESSING = 'processing';
    public const STATE_COMPLETED = 'completed';
    public const STATE_FAILED = 'failed';
    public const STATE_CANCELLED = 'cancelled';
    public const STATE_REFUNDED = 'refunded';
    public const STATE_UNKNOWN = 'unknown';

    /**
     * @return PaymentProviderInterface
     */
    public function getPaymentProvider();

    public function setPaymentProvider(PaymentProviderInterface $paymentProvider);

    /**
     * @return \DateTime
     */
    public function getDatePayment();

    /**
     * @param \DateTime $datePayment
     */
    public function setDatePayment($datePayment);

    /**
     * @return string
     */
    public function getState();

    /**
     * @param string $state
     */
    public function setState($state);

    /**
     * @param int $amount
     */
    public function setTotalAmount($amount);

    /**
     * @param string $number
     */
    public function setNumber($number);

    /**
     * @param string $description
     */
    public function setDescription($description);

    /**
     * @param string $currencyCode
     */
    public function setCurrencyCode($currencyCode);
}
